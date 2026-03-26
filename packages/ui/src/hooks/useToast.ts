import { useSyncExternalStore, useCallback } from 'react'

export interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

let nextId = 0
let toasts: Toast[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function addToast(type: Toast['type'], message: string) {
  const id = ++nextId
  toasts = [...toasts, { id, type, message }]
  // Keep max 3 visible
  if (toasts.length > 3) {
    toasts = toasts.slice(-3)
  }
  emit()
  setTimeout(() => {
    removeToast(id)
  }, 3000)
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

function getSnapshot() {
  return toasts
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useToast() {
  const current = useSyncExternalStore(subscribe, getSnapshot)

  const success = useCallback((message: string) => addToast('success', message), [])
  const error = useCallback((message: string) => addToast('error', message), [])

  return {
    toasts: current,
    success,
    error,
    dismiss: removeToast,
  }
}
