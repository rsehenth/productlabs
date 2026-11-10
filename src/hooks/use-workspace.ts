import { createContext, useContext } from 'react'
import type {
  DecisionRecord,
  MetricObservation,
  ProductMetric,
  UserFeedback,
} from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import type { WorkspaceLoadStatus, WorkspaceSaveResult } from '@/lib/storage/workspace-storage'
import type {
  OperationResult,
  MetricInput,
  ObservationInput,
  FeedbackInput,
  DecisionInput,
  MetricDeletion,
} from '@/lib/domain/operations'

export interface WorkspaceContextValue {
  workspace: WorkspaceState
  status: WorkspaceLoadStatus
  savedAt: string | null
  saveError: string | null
  /** Outra aba alterou os dados: gravações são recusadas até atualizar. */
  stale: boolean
  refreshWorkspace: () => void
  clearSaveError: () => void
  readRaw: () => string | null
  discardStoredData: () => Promise<WorkspaceSaveResult>
  replaceWorkspace: (workspace: WorkspaceState) => Promise<WorkspaceSaveResult>
  createMetric: (input: MetricInput) => Promise<OperationResult<ProductMetric>>
  updateMetric: (id: string, input: MetricInput) => Promise<OperationResult<ProductMetric>>
  deleteMetric: (id: string) => Promise<OperationResult<MetricDeletion>>
  createObservation: (input: ObservationInput) => Promise<OperationResult<MetricObservation>>
  updateObservation: (
    id: string,
    input: ObservationInput,
  ) => Promise<OperationResult<MetricObservation>>
  deleteObservation: (id: string) => Promise<OperationResult<MetricObservation>>
  createFeedback: (input: FeedbackInput) => Promise<OperationResult<UserFeedback>>
  updateFeedback: (id: string, input: FeedbackInput) => Promise<OperationResult<UserFeedback>>
  deleteFeedback: (id: string) => Promise<OperationResult<UserFeedback>>
  createDecision: (input: DecisionInput) => Promise<OperationResult<DecisionRecord>>
  updateDecision: (id: string, input: DecisionInput) => Promise<OperationResult<DecisionRecord>>
  deleteDecision: (id: string) => Promise<OperationResult<DecisionRecord>>
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace precisa estar dentro de WorkspaceProvider.')
  }
  return context
}
