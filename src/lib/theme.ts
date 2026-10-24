import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ilovesql-theme'
const listeners = new Set<() => void>()

function readTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

let currentTheme: Theme = readTheme()

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function getTheme(): Theme {
  return currentTheme
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    return
  }
}

export function setTheme(theme: Theme): void {
  currentTheme = theme
  persistTheme(theme)
  applyTheme(theme)
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme)

  return {
    theme,
    resolvedTheme: theme,
    setTheme,
  }
}

applyTheme(currentTheme)
