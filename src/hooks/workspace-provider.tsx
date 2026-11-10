import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { WorkspaceContext, type WorkspaceContextValue } from '@/hooks/use-workspace'
import { STORAGE_KEY } from '@/lib/storage/schema'
import { readRawWorkspace } from '@/lib/storage/workspace-storage'
import { createWorkspaceSession } from '@/lib/storage/workspace-session'
import * as operations from '@/lib/domain/operations'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => createWorkspaceSession())
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot)
  const { run } = session

  useEffect(() => {
    // Aviso antecipado; a garantia real é a checagem sob lock em workspace-session.
    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === STORAGE_KEY) {
        session.notifyExternalChange(event.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [session])

  const value: WorkspaceContextValue = {
    ...snapshot,
    clearSaveError: session.clearSaveError,
    readRaw: () => readRawWorkspace(),
    refreshWorkspace: session.refresh,
    discardStoredData: session.discard,
    replaceWorkspace: session.replace,
    createMetric: (input) => run((state) => operations.createMetric(state, input)),
    updateMetric: (id, input) => run((state) => operations.updateMetric(state, id, input)),
    deleteMetric: (id) => run((state) => operations.deleteMetric(state, id)),
    createObservation: (input) => run((state) => operations.createObservation(state, input)),
    updateObservation: (id, input) =>
      run((state) => operations.updateObservation(state, id, input)),
    deleteObservation: (id) => run((state) => operations.deleteObservation(state, id)),
    createFeedback: (input) => run((state) => operations.createFeedback(state, input)),
    updateFeedback: (id, input) =>
      run((state) => operations.updateFeedback(state, id, input)),
    deleteFeedback: (id) => run((state) => operations.deleteFeedback(state, id)),
    createDecision: (input) => run((state) => operations.createDecision(state, input)),
    updateDecision: (id, input) =>
      run((state) => operations.updateDecision(state, id, input)),
    deleteDecision: (id) => run((state) => operations.deleteDecision(state, id)),
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
