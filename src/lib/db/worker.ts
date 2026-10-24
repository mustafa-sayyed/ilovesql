import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'

function isIgnorableIdbSyncError(reason: unknown): boolean {
  if (typeof reason !== 'object' || reason === null) return false
  const error = reason as { name?: unknown; errno?: unknown }
  return error.name === 'ErrnoError' && error.errno === 44
}

self.addEventListener('unhandledrejection', (event) => {
  if (isIgnorableIdbSyncError(event.reason)) {
    event.preventDefault()
  }
})

worker({
  async init(options) {
    return new PGlite(options.dataDir ?? 'idb://ilovesql', {
      relaxedDurability: true,
    })
  },
})
