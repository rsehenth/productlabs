import type {
  DecisionRecord,
  DecisionStatus,
  FeedbackCategory,
  FeedbackSource,
  MetricDirection,
  MetricObservation,
  MetricUnit,
  ProductMetric,
  UserFeedback,
} from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import { createId } from '@/lib/ids'
import { decisionStatusErrors } from './decision-rules'
import { isValidIsoMonth, nowIso } from '@/lib/dates'
import { metricValueError } from '@/lib/number'
import { truncate } from '@/lib/text'
import {
  DECISION_STATUSES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_SOURCES,
  METRIC_DIRECTIONS,
  METRIC_UNITS,
} from '@/lib/storage/validation'

export const FIELD_LIMITS = {
  metricName: 120,
  metricDescription: 500,
  feedbackContent: 2000,
  decisionTitle: 160,
  decisionText: 2000,
  listItem: 300,
  maxListItems: 20,
  maxEvidence: 50,
} as const

export type FieldErrors = Record<string, string>

export interface OperationFailure {
  ok: false
  error: string
  fieldErrors?: FieldErrors
  details?: string[]
}

export type OperationResult<T> =
  | { ok: true; workspace: WorkspaceState; value: T }
  | OperationFailure

export interface OperationOptions {
  id?: string
  now?: string
}

function failure(fieldErrors: FieldErrors, details?: string[]): OperationFailure {
  const error = Object.values(fieldErrors)[0] ?? 'Não foi possível concluir a operação.'
  return { ok: false, error, fieldErrors, ...(details ? { details } : {}) }
}

function success<T>(workspace: WorkspaceState, value: T): OperationResult<T> {
  return { ok: true, workspace, value }
}

function isOneOf<T extends string>(value: string, options: readonly T[]): value is T {
  return (options as readonly string[]).includes(value)
}

function requiredText(
  value: string,
  field: string,
  label: string,
  max: number,
  errors: FieldErrors,
): string {
  const trimmed = value.trim()
  if (!trimmed) errors[field] = `${label} é obrigatório.`
  else if (trimmed.length > max) {
    errors[field] = `${label} deve ter no máximo ${max} caracteres.`
  }
  return trimmed
}

function optionalText(
  value: string,
  field: string,
  label: string,
  max: number,
  errors: FieldErrors,
): string {
  const trimmed = value.trim()
  if (trimmed.length > max) errors[field] = `${label} deve ter no máximo ${max} caracteres.`
  return trimmed
}

function normalizeList(
  values: string[],
  field: string,
  label: string,
  errors: FieldErrors,
): string[] {
  const normalized = values.map((value) => value.trim()).filter(Boolean)
  if (normalized.length > FIELD_LIMITS.maxListItems) {
    errors[field] = `${label} deve ter no máximo ${FIELD_LIMITS.maxListItems} itens.`
  }
  normalized.forEach((value, index) => {
    if (value.length > FIELD_LIMITS.listItem) {
      errors[field] = `O item ${index + 1} de ${label.toLowerCase()} é muito longo.`
    }
  })
  return normalized
}

function validateIds(
  ids: string[],
  field: string,
  label: string,
  available: Set<string>,
  errors: FieldErrors,
): string[] {
  if (new Set(ids).size !== ids.length) {
    errors[field] = `${label} não podem se repetir.`
    return ids
  }
  if (ids.length > FIELD_LIMITS.maxEvidence) {
    errors[field] = `Selecione no máximo ${FIELD_LIMITS.maxEvidence} ${label.toLowerCase()}.`
    return ids
  }
  if (ids.some((id) => !available.has(id))) {
    errors[field] = `Um dos registros selecionados em ${label.toLowerCase()} não existe mais.`
  }
  return ids
}

function isoDateTimeError(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return 'Informe uma data válida.'
  }
  if (Number.isNaN(Date.parse(value))) return 'Informe uma data válida.'
  return undefined
}

// ---------------------------------------------------------------------------
// Métricas
// ---------------------------------------------------------------------------

export interface MetricInput {
  name: string
  description: string
  unit: MetricUnit
  desiredDirection: MetricDirection
}

interface NormalizedMetric {
  name: string
  description: string
  unit: MetricUnit
  desiredDirection: MetricDirection
}

function normalizeMetricInput(input: MetricInput): {
  errors: FieldErrors
  value: NormalizedMetric
} {
  const errors: FieldErrors = {}
  const name = requiredText(
    input.name,
    'name',
    'Nome do indicador',
    FIELD_LIMITS.metricName,
    errors,
  )
  const description = optionalText(
    input.description,
    'description',
    'Descrição',
    FIELD_LIMITS.metricDescription,
    errors,
  )
  if (!isOneOf(input.unit, METRIC_UNITS)) errors.unit = 'Selecione uma unidade válida.'
  if (!isOneOf(input.desiredDirection, METRIC_DIRECTIONS)) {
    errors.desiredDirection = 'Selecione a direção desejada.'
  }
  return {
    errors,
    value: {
      name,
      description,
      unit: input.unit,
      desiredDirection: input.desiredDirection,
    },
  }
}

export function createMetric(
  state: WorkspaceState,
  input: MetricInput,
  options: OperationOptions = {},
): OperationResult<ProductMetric> {
  const { errors, value } = normalizeMetricInput(input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const id = options.id ?? createId('metric')
  if (state.metrics.some((metric) => metric.id === id)) {
    return failure({ id: 'Já existe um indicador com este identificador.' })
  }

  const metric: ProductMetric = {
    id,
    ...value,
    createdAt: options.now ?? nowIso(),
  }
  return success({ ...state, metrics: [...state.metrics, metric] }, metric)
}

export function updateMetric(
  state: WorkspaceState,
  id: string,
  input: MetricInput,
): OperationResult<ProductMetric> {
  const existing = state.metrics.find((metric) => metric.id === id)
  if (!existing) return failure({ id: 'Indicador não encontrado.' })

  const { errors, value } = normalizeMetricInput(input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const updated: ProductMetric = { ...existing, ...value }
  return success(
    {
      ...state,
      metrics: state.metrics.map((metric) => (metric.id === id ? updated : metric)),
    },
    updated,
  )
}

export interface MetricDeletion {
  observationsRemoved: number
}

export function deleteMetric(state: WorkspaceState, id: string): OperationResult<MetricDeletion> {
  const metric = state.metrics.find((item) => item.id === id)
  if (!metric) return failure({ id: 'Indicador não encontrado.' })

  const decisions = state.decisions.filter((decision) => decision.metricIds.includes(id))
  const feedbacks = state.feedbacks.filter((feedback) => feedback.metricIds.includes(id))

  if (decisions.length > 0 || feedbacks.length > 0) {
    const details = [
      ...decisions.map((decision) => `Decisão: ${decision.title}`),
      ...feedbacks.map((feedback) => `Feedback: ${truncate(feedback.content, 90)}`),
    ]
    return failure(
      {
        id: `Este indicador está vinculado a ${decisions.length} decisão(ões) e ${feedbacks.length} feedback(s). Remova os vínculos antes de excluir.`,
      },
      details,
    )
  }

  const observationsRemoved = state.observations.filter(
    (observation) => observation.metricId === id,
  ).length

  return success(
    {
      ...state,
      metrics: state.metrics.filter((item) => item.id !== id),
      observations: state.observations.filter((observation) => observation.metricId !== id),
    },
    { observationsRemoved },
  )
}

// ---------------------------------------------------------------------------
// Observações
// ---------------------------------------------------------------------------

export interface ObservationInput {
  metricId: string
  period: string
  value: number
}

function duplicatePeriodError(
  state: WorkspaceState,
  metricId: string,
  period: string,
  ignoreId?: string,
): string | undefined {
  const duplicate = state.observations.some(
    (observation) =>
      observation.metricId === metricId &&
      observation.period === period &&
      observation.id !== ignoreId,
  )
  return duplicate ? 'Já existe uma observação para este indicador neste período.' : undefined
}

function validateObservation(
  state: WorkspaceState,
  input: ObservationInput,
  ignoreId?: string,
): { errors: FieldErrors; period: string } {
  const errors: FieldErrors = {}
  const metric = state.metrics.find((item) => item.id === input.metricId)
  if (!metric) errors.metricId = 'Indicador não encontrado.'

  const period = input.period.trim()
  if (!isValidIsoMonth(period)) errors.period = 'Use o formato AAAA-MM.'
  else {
    const duplicate = duplicatePeriodError(state, input.metricId, period, ignoreId)
    if (duplicate) errors.period = duplicate
  }

  if (!Number.isFinite(input.value)) {
    errors.value = 'Informe um número válido.'
  } else if (metric) {
    const valueError = metricValueError(input.value, metric.unit)
    if (valueError) errors.value = valueError
  }

  return { errors, period }
}

export function createObservation(
  state: WorkspaceState,
  input: ObservationInput,
  options: OperationOptions = {},
): OperationResult<MetricObservation> {
  const { errors, period } = validateObservation(state, input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const id = options.id ?? createId('observation')
  if (state.observations.some((observation) => observation.id === id)) {
    return failure({ id: 'Já existe uma observação com este identificador.' })
  }

  const observation: MetricObservation = {
    id,
    metricId: input.metricId,
    period,
    value: input.value,
    createdAt: options.now ?? nowIso(),
  }
  return success(
    { ...state, observations: [...state.observations, observation] },
    observation,
  )
}

export function updateObservation(
  state: WorkspaceState,
  id: string,
  input: ObservationInput,
  options: Pick<OperationOptions, 'now'> = {},
): OperationResult<MetricObservation> {
  const existing = state.observations.find((observation) => observation.id === id)
  if (!existing) return failure({ id: 'Observação não encontrada.' })

  const { errors, period } = validateObservation(state, input, id)
  if (Object.keys(errors).length > 0) return failure(errors)

  const updated: MetricObservation = {
    ...existing,
    metricId: input.metricId,
    period,
    value: input.value,
    ...(options.now ? { createdAt: existing.createdAt } : {}),
  }
  return success(
    {
      ...state,
      observations: state.observations.map((observation) =>
        observation.id === id ? updated : observation,
      ),
    },
    updated,
  )
}

export function deleteObservation(
  state: WorkspaceState,
  id: string,
): OperationResult<MetricObservation> {
  const observation = state.observations.find((item) => item.id === id)
  if (!observation) return failure({ id: 'Observação não encontrada.' })
  return success(
    {
      ...state,
      observations: state.observations.filter((item) => item.id !== id),
    },
    observation,
  )
}

// ---------------------------------------------------------------------------
// Feedbacks
// ---------------------------------------------------------------------------

export interface FeedbackInput {
  content: string
  category: FeedbackCategory
  source: FeedbackSource
  receivedAt: string
  metricIds: string[]
}

interface NormalizedFeedback {
  content: string
  category: FeedbackCategory
  source: FeedbackSource
  receivedAt: string
  metricIds: string[]
}

function normalizeFeedbackInput(
  state: WorkspaceState,
  input: FeedbackInput,
): { errors: FieldErrors; value: NormalizedFeedback } {
  const errors: FieldErrors = {}
  const content = requiredText(
    input.content,
    'content',
    'Conteúdo do feedback',
    FIELD_LIMITS.feedbackContent,
    errors,
  )
  if (!isOneOf(input.category, FEEDBACK_CATEGORIES)) {
    errors.category = 'Selecione uma categoria válida.'
  }
  if (!isOneOf(input.source, FEEDBACK_SOURCES)) {
    errors.source = 'Selecione uma fonte válida.'
  }
  const dateError = isoDateTimeError(input.receivedAt)
  if (dateError) errors.receivedAt = dateError

  const metricIds = validateIds(
    input.metricIds,
    'metricIds',
    'Indicadores',
    new Set(state.metrics.map((metric) => metric.id)),
    errors,
  )

  return {
    errors,
    value: {
      content,
      category: input.category,
      source: input.source,
      receivedAt: input.receivedAt,
      metricIds,
    },
  }
}

export function createFeedback(
  state: WorkspaceState,
  input: FeedbackInput,
  options: OperationOptions = {},
): OperationResult<UserFeedback> {
  const { errors, value } = normalizeFeedbackInput(state, input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const id = options.id ?? createId('feedback')
  if (state.feedbacks.some((feedback) => feedback.id === id)) {
    return failure({ id: 'Já existe um feedback com este identificador.' })
  }
  const feedback: UserFeedback = { id, ...value }
  return success({ ...state, feedbacks: [...state.feedbacks, feedback] }, feedback)
}

export function updateFeedback(
  state: WorkspaceState,
  id: string,
  input: FeedbackInput,
): OperationResult<UserFeedback> {
  const existing = state.feedbacks.find((feedback) => feedback.id === id)
  if (!existing) return failure({ id: 'Feedback não encontrado.' })

  const { errors, value } = normalizeFeedbackInput(state, input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const updated: UserFeedback = { ...existing, ...value }
  return success(
    {
      ...state,
      feedbacks: state.feedbacks.map((feedback) => (feedback.id === id ? updated : feedback)),
    },
    updated,
  )
}

export function deleteFeedback(
  state: WorkspaceState,
  id: string,
): OperationResult<UserFeedback> {
  const feedback = state.feedbacks.find((item) => item.id === id)
  if (!feedback) return failure({ id: 'Feedback não encontrado.' })

  const decisions = state.decisions.filter((decision) => decision.feedbackIds.includes(id))
  if (decisions.length > 0) {
    return failure(
      {
        id: `Este feedback é evidência de ${decisions.length} decisão(ões). Remova o vínculo antes de excluir.`,
      },
      decisions.map((decision) => `Decisão: ${decision.title}`),
    )
  }

  return success(
    { ...state, feedbacks: state.feedbacks.filter((item) => item.id !== id) },
    feedback,
  )
}

// ---------------------------------------------------------------------------
// Decisões
// ---------------------------------------------------------------------------

export interface DecisionInput {
  title: string
  problem: string
  hypothesis: string
  metricIds: string[]
  feedbackIds: string[]
  alternatives: string[]
  decision: string
  successCriteria: string[]
  nextSteps: string[]
  status: DecisionStatus
}

interface NormalizedDecision {
  title: string
  problem: string
  hypothesis: string
  metricIds: string[]
  feedbackIds: string[]
  alternatives: string[]
  decision: string
  successCriteria: string[]
  nextSteps: string[]
  status: DecisionStatus
}

export const DECISION_STATUS_RULES: Record<DecisionStatus, string> = {
  draft: 'Rascunho exige título e problema.',
  investigating: 'Em investigação exige título, problema e hipótese.',
  decided: 'Decidida exige título, problema, hipótese e decisão registrada.',
  validated:
    'Validada exige título, problema, hipótese, decisão e ao menos um critério de sucesso.',
  abandoned: 'Abandonada exige título e problema.',
}

function normalizeDecisionInput(
  state: WorkspaceState,
  input: DecisionInput,
): { errors: FieldErrors; value: NormalizedDecision } {
  const errors: FieldErrors = {}
  const title = requiredText(
    input.title,
    'title',
    'Título da decisão',
    FIELD_LIMITS.decisionTitle,
    errors,
  )
  const problem = requiredText(
    input.problem,
    'problem',
    'Problema investigado',
    FIELD_LIMITS.decisionText,
    errors,
  )
  const hypothesis = optionalText(
    input.hypothesis,
    'hypothesis',
    'Hipótese',
    FIELD_LIMITS.decisionText,
    errors,
  )
  const decision = optionalText(
    input.decision,
    'decision',
    'Decisão registrada',
    FIELD_LIMITS.decisionText,
    errors,
  )
  const alternatives = normalizeList(
    input.alternatives,
    'alternatives',
    'Alternativas',
    errors,
  )
  const successCriteria = normalizeList(
    input.successCriteria,
    'successCriteria',
    'Critérios de sucesso',
    errors,
  )
  const nextSteps = normalizeList(input.nextSteps, 'nextSteps', 'Próximos passos', errors)

  if (!isOneOf(input.status, DECISION_STATUSES)) {
    errors.status = 'Selecione um status válido.'
  }

  Object.assign(
    errors,
    decisionStatusErrors({ status: input.status, hypothesis, decision, successCriteria }),
  )

  const metricIds = validateIds(
    input.metricIds,
    'metricIds',
    'Indicadores',
    new Set(state.metrics.map((metric) => metric.id)),
    errors,
  )
  const feedbackIds = validateIds(
    input.feedbackIds,
    'feedbackIds',
    'Feedbacks',
    new Set(state.feedbacks.map((feedback) => feedback.id)),
    errors,
  )

  return {
    errors,
    value: {
      title,
      problem,
      hypothesis,
      metricIds,
      feedbackIds,
      alternatives,
      decision,
      successCriteria,
      nextSteps,
      status: input.status,
    },
  }
}

export function createDecision(
  state: WorkspaceState,
  input: DecisionInput,
  options: OperationOptions = {},
): OperationResult<DecisionRecord> {
  const { errors, value } = normalizeDecisionInput(state, input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const id = options.id ?? createId('decision')
  if (state.decisions.some((decision) => decision.id === id)) {
    return failure({ id: 'Já existe uma decisão com este identificador.' })
  }
  const timestamp = options.now ?? nowIso()
  const record: DecisionRecord = {
    id,
    ...value,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return success({ ...state, decisions: [...state.decisions, record] }, record)
}

export function updateDecision(
  state: WorkspaceState,
  id: string,
  input: DecisionInput,
  options: Pick<OperationOptions, 'now'> = {},
): OperationResult<DecisionRecord> {
  const existing = state.decisions.find((decision) => decision.id === id)
  if (!existing) return failure({ id: 'Decisão não encontrada.' })

  const { errors, value } = normalizeDecisionInput(state, input)
  if (Object.keys(errors).length > 0) return failure(errors)

  const updated: DecisionRecord = {
    ...existing,
    ...value,
    updatedAt: options.now ?? nowIso(),
  }
  return success(
    {
      ...state,
      decisions: state.decisions.map((decision) => (decision.id === id ? updated : decision)),
    },
    updated,
  )
}

export function deleteDecision(
  state: WorkspaceState,
  id: string,
): OperationResult<DecisionRecord> {
  const decision = state.decisions.find((item) => item.id === id)
  if (!decision) return failure({ id: 'Decisão não encontrada.' })
  return success(
    { ...state, decisions: state.decisions.filter((item) => item.id !== id) },
    decision,
  )
}
