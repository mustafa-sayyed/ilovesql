import { create } from 'zustand'
import { getDb } from '@/lib/db/client'
import { introspectSchema } from '@/lib/db/schema'
import { ensureSeeded, resetDatabase } from '@/lib/db/seed'
import type { SchemaSnapshot } from '@/types'

export type DbStatus = 'idle' | 'booting' | 'ready' | 'error'

interface DbState {
  status: DbStatus
  error: string | null
  schema: SchemaSnapshot | null
  schemaLoading: boolean
  resetting: boolean
  isLeader: boolean
  init: () => Promise<void>
  refreshSchema: () => Promise<void>
  reset: () => Promise<void>
}

let bootPromise: Promise<void> | null = null

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const useDbStore = create<DbState>()((set, get) => ({
  status: 'idle',
  error: null,
  schema: null,
  schemaLoading: false,
  resetting: false,
  isLeader: false,

  init: async () => {
    if (bootPromise) return bootPromise
    if (get().status === 'ready') return

    set({ status: 'booting', error: null })

    bootPromise = (async () => {
      try {
        const db = await getDb()
        await ensureSeeded()
        const schema = await introspectSchema()
        set({ status: 'ready', schema, isLeader: db.isLeader, error: null })

        db.onLeaderChange(() => {
          void getDb()
            .then((nextDb) => set({ isLeader: nextDb.isLeader }))
            .catch(() => undefined)
        })
      } catch (error) {
        bootPromise = null
        set({ status: 'error', error: toMessage(error) })
      }
    })()

    return bootPromise
  },

  refreshSchema: async () => {
    if (get().status !== 'ready' || get().schemaLoading) return
    set({ schemaLoading: true })
    try {
      const schema = await introspectSchema()
      set({ schema, schemaLoading: false })
    } catch {
      set({ schemaLoading: false })
    }
  },

  reset: async () => {
    if (get().resetting) return
    set({ resetting: true, error: null })
    try {
      await resetDatabase()
      const schema = await introspectSchema()
      set({ schema, resetting: false, status: 'ready' })
    } catch (error) {
      set({ resetting: false, error: toMessage(error) })
      throw error
    }
  },
}))
