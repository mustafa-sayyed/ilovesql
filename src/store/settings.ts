import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  markdownEnabled: boolean
  setMarkdownEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      markdownEnabled: false,
      setMarkdownEnabled: (markdownEnabled) => set({ markdownEnabled }),
    }),
    {
      name: 'ilovesql-settings-v1',
      version: 1,
      partialize: (state) => ({ markdownEnabled: state.markdownEnabled }),
    },
  ),
)
