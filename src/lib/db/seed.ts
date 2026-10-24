import seedSql from './seed.sql?raw'
import { getDb } from './client'

let seeding: Promise<void> | null = null

async function runSeed(): Promise<void> {
  const db = await getDb()

  const meta = await db.query<{ exists: boolean }>(
    "select to_regclass('public._ilovesql_meta') is not null as exists",
  )

  if (meta.rows[0]?.exists) {
    const seeded = await db
      .query<{ seeded: boolean }>(
        "select exists(select 1 from _ilovesql_meta where key = 'seeded') as seeded",
      )
      .catch(() => null)

    if (seeded?.rows[0]?.seeded) {
      return
    }
  }

  try {
    await db.exec(seedSql)
    await db.exec('ANALYZE;')
  } catch (error) {
    await db.exec('ROLLBACK;').catch(() => undefined)
    seeding = null
    throw error
  }
}

export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = runSeed()
  }

  return seeding
}

export async function resetDatabase(): Promise<void> {
  const db = await getDb()

  await db.exec(`
    ROLLBACK;
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
  `)

  seeding = null
  await ensureSeeded()
}
