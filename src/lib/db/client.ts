import { PGliteWorker, type PGliteWorkerOptions } from '@electric-sql/pglite/worker'
import PGliteWorkerCtor from './worker?worker'

let dbPromise: Promise<PGliteWorker> | null = null

export function getDb(): Promise<PGliteWorker> {
  if (!dbPromise) {
    const worker = new PGliteWorkerCtor({
      name: 'ilovesql-pglite',
    })

    dbPromise = PGliteWorker.create(worker, {
      dataDir: 'idb://ilovesql',
      id: 'ilovesql',
    } satisfies PGliteWorkerOptions)
  }

  return dbPromise
}
