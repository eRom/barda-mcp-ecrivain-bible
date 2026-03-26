import { useSyncExternalStore, useCallback } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bible-theme'

let currentTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
})()

const listeners = new Set<() => void>()

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply on load
if (typeof window !== 'undefined') {
  applyTheme(currentTheme)
}

function setTheme(theme: Theme) {
  currentTheme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Theme {
  return currentTheme
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot)

  const toggle = useCallback(() => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggle, isDark: theme === 'dark' }
}
