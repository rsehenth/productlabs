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

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

export const METRIC_UNITS: readonly MetricUnit[] = [
  'percent',
  'count',
  'currency',
  'hours',
  'score',
]

export const METRIC_DIRECTIONS: readonly MetricDirection[] = ['increase', 'decrease']

export const FEEDBACK_CATEGORIES: readonly FeedbackCategory[] = [
  'bug',
  'usability',
  'performance',
  'feature-request',
  'pricing',
  'other',
]

export const FEEDBACK_SOURCES: readonly FeedbackSource[] = [
  'interview',
  'support-ticket',
  'survey',
  'app-review',
  'community',
  'other',
]

export const DECISION_STATUSES: readonly DecisionStatus[] = [
  'draft',
  'investigating',
  'decided',
  'validated',
  'abandoned',
]

export interface ValidationIssue {
  path: string
  message: string
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] }

const MAX_ISSUES = 20

function addIssue(issues: ValidationIssue[], path: string, message: string) {
  if (issues.length < MAX_ISSUES) issues.push({ path, message })
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isIsoDateTime(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_DATE_TIME.test(value) &&
    !Number.isNaN(Date.parse(value))
  )
}

function isIsoMonth(value: unknown): value is string {
  return typeof value === 'string' && ISO_MONTH.test(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean'
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

function checkRequired(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
  isValid: (value: unknown) => boolean,
  message = 'campo obrigatório ausente ou inválido',
) {
  if (!isValid(record[key])) addIssue(issues, `${path}.${key}`, message)
}

function checkCommonFields(
  record: Record<string, unknown>,
  path: string,
  issues: ValidationIssue[],
  idValid: (value: unknown) => boolean,
) {
  checkRequired(record, 'id', path, issues, idValid, 'identificador deve ser uma string não vazia')
  if (!isOptionalBoolean(record.simulated)) {
    addIssue(issues, `${path}.simulated`, 'deve ser booleano quando presente')
  }
}

function checkMetric(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): value is ProductMetric {
  const issueCount = issues.length
  if (!isPlainObject(value)) {
    addIssue(issues, path, 'deve ser um objeto')
    return false
  }
  checkCommonFields(value, path, issues, isNonEmptyString)
  checkRequired(value, 'name', path, issues, isNonEmptyString)
  checkRequired(value, 'description', path, issues, isString, 'deve ser um texto')
  checkRequired(value, 'createdAt', path, issues, isIsoDateTime, 'data ISO 8601 inválida')
  if (!isOneOf(value.unit, METRIC_UNITS)) {
    addIssue(issues, `${path}.unit`, `deve ser um de: ${METRIC_UNITS.join(', ')}`)
  }
  if (!isOneOf(value.desiredDirection, METRIC_DIRECTIONS)) {
    addIssue(issues, `${path}.desiredDirection`, 'deve ser "increase" ou "decrease"')
  }
  return issues.length === issueCount
}

function checkObservation(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): value is MetricObservation {
  const issueCount = issues.length
  if (!isPlainObject(value)) {
    addIssue(issues, path, 'deve ser um objeto')
    return false
  }
  checkCommonFields(value, path, issues, isNonEmptyString)
  checkRequired(value, 'metricId', path, issues, isNonEmptyString)
  checkRequired(value, 'period', path, issues, isIsoMonth, 'período deve usar o formato YYYY-MM')
  checkRequired(value, 'value', path, issues, isFiniteNumber, 'valor deve ser um número finito')
  checkRequired(value, 'createdAt', path, issues, isIsoDateTime, 'data ISO 8601 inválida')
  return issues.length === issueCount
}

function checkFeedback(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): value is UserFeedback {
  const issueCount = issues.length
  if (!isPlainObject(value)) {
    addIssue(issues, path, 'deve ser um objeto')
    return false
  }
  checkCommonFields(value, path, issues, isNonEmptyString)
  checkRequired(value, 'content', path, issues, isNonEmptyString)
  checkRequired(value, 'receivedAt', path, issues, isIsoDateTime, 'data ISO 8601 inválida')
  checkRequired(value, 'metricIds', path, issues, isStringArray, 'deve ser uma lista de ids')
  if (!isOneOf(value.category, FEEDBACK_CATEGORIES)) {
    addIssue(issues, `${path}.category`, `deve ser um de: ${FEEDBACK_CATEGORIES.join(', ')}`)
  }
  if (!isOneOf(value.source, FEEDBACK_SOURCES)) {
    addIssue(issues, `${path}.source`, `deve ser um de: ${FEEDBACK_SOURCES.join(', ')}`)
  }
  return issues.length === issueCount
}

function checkDecision(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): value is DecisionRecord {
  const issueCount = issues.length
  if (!isPlainObject(value)) {
    addIssue(issues, path, 'deve ser um objeto')
    return false
  }
  checkCommonFields(value, path, issues, isNonEmptyString)
  checkRequired(value, 'title', path, issues, isNonEmptyString)
  checkRequired(value, 'problem', path, issues, isNonEmptyString)
  checkRequired(value, 'hypothesis', path, issues, isString, 'deve ser um texto')
  checkRequired(value, 'decision', path, issues, isString, 'deve ser um texto')
  checkRequired(value, 'metricIds', path, issues, isStringArray, 'deve ser uma lista de ids')
  checkRequired(value, 'feedbackIds', path, issues, isStringArray, 'deve ser uma lista de ids')
  checkRequired(value, 'alternatives', path, issues, isStringArray, 'deve ser uma lista de textos')
  checkRequired(value, 'successCriteria', path, issues, isStringArray, 'deve ser uma lista de textos')
  checkRequired(value, 'nextSteps', path, issues, isStringArray, 'deve ser uma lista de textos')
  checkRequired(value, 'createdAt', path, issues, isIsoDateTime, 'data ISO 8601 inválida')
  checkRequired(value, 'updatedAt', path, issues, isIsoDateTime, 'data ISO 8601 inválida')
  if (!isOneOf(value.status, DECISION_STATUSES)) {
    addIssue(issues, `${path}.status`, `deve ser um de: ${DECISION_STATUSES.join(', ')}`)
  }
  return issues.length === issueCount
}

export function isProductMetric(value: unknown): value is ProductMetric {
  return checkMetric(value, 'metric', [])
}

export function isMetricObservation(value: unknown): value is MetricObservation {
  return checkObservation(value, 'observation', [])
}

export function isUserFeedback(value: unknown): value is UserFeedback {
  return checkFeedback(value, 'feedback', [])
}

export function isDecisionRecord(value: unknown): value is DecisionRecord {
  return checkDecision(value, 'decision', [])
}

export function isWorkspaceState(value: unknown): value is WorkspaceState {
  return validateWorkspace(value).ok
}

function checkCollection<T>(
  value: unknown,
  key: keyof WorkspaceState,
  issues: ValidationIssue[],
  check: (item: unknown, path: string, issues: ValidationIssue[]) => item is T,
): T[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, key, 'deve ser uma lista')
    return null
  }
  const items: T[] = []
  value.forEach((item, index) => {
    const path = `${key}[${index}]`
    if (check(item, path, issues)) items.push(item)
  })
  return items.length === value.length ? items : null
}

export function validateWorkspace(input: unknown): ValidationResult<WorkspaceState> {
  if (!isPlainObject(input)) {
    return { ok: false, issues: [{ path: 'workspace', message: 'deve ser um objeto' }] }
  }

  const issues: ValidationIssue[] = []
  const metrics = checkCollection<ProductMetric>(input.metrics, 'metrics', issues, checkMetric)
  const observations = checkCollection<MetricObservation>(
    input.observations,
    'observations',
    issues,
    checkObservation,
  )
  const feedbacks = checkCollection<UserFeedback>(
    input.feedbacks,
    'feedbacks',
    issues,
    checkFeedback,
  )
  const decisions = checkCollection<DecisionRecord>(
    input.decisions,
    'decisions',
    issues,
    checkDecision,
  )

  if (issues.length > 0 || !metrics || !observations || !feedbacks || !decisions) {
    return { ok: false, issues }
  }

  return { ok: true, value: { metrics, observations, feedbacks, decisions } }
}
