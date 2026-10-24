import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryEntry } from '@/types'

interface HistoryState {
  entries: HistoryEntry[]
  add: (entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { timestamp?: number }) => void
  clear: () => void
}

const MAX_ENTRIES = 100

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((state) => {
          const next: HistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: entry.timestamp ?? Date.now(),
          }
          return { entries: [next, ...state.entries].slice(0, MAX_ENTRIES) }
        }),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'ilovesql-history-v1',
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
