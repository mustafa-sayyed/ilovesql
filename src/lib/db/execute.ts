import type { QueryErrorInfo, QueryResultSet } from '@/types'
import { getDb } from './client'

export interface ExecutionResult {
  results: QueryResultSet[]
  durationMs: number
}

export async function executeSql(sql: string): Promise<ExecutionResult> {
  const db = await getDb()
  const started = performance.now()
  const raw = await db.exec(sql, { rowMode: 'object' })
  const durationMs = Math.round(performance.now() - started)

  return {
    durationMs,
    results: raw.map((result) => ({
      rows: (result.rows ?? []) as Record<string, unknown>[],
      fields: (result.fields ?? []) as QueryResultSet['fields'],
      command: result.command,
      affectedRows: result.affectedRows,
      rowCount: result.rowCount,
    })),
  }
}

export function toQueryError(error: unknown): QueryErrorInfo {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    const asString = (value: unknown) =>
      typeof value === 'string' && value.trim().length > 0 ? value : undefined

    return {
      message: asString(record.message) ?? String(error),
      code: asString(record.code),
      detail: asString(record.detail),
      hint: asString(record.hint),
      position:
        record.position === undefined || record.position === null
          ? undefined
          : String(record.position),
    }
  }

  return { message: String(error) }
}

const SCHEMA_COMMANDS = new Set([
  'CREATE',
  'CREATE TABLE',
  'CREATE VIEW',
  'CREATE INDEX',
  'ALTER',
  'DROP',
  'TRUNCATE',
  'COMMENT',
  'GRANT',
  'REVOKE',
])

const DATA_COMMANDS = new Set(['INSERT', 'UPDATE', 'DELETE', 'COPY', 'MERGE'])

export function shouldRefreshSchema(results: QueryResultSet[]): boolean {
  return results.some((result) => {
    const command = (result.command ?? '').toUpperCase()
    return (
      SCHEMA_COMMANDS.has(command) ||
      DATA_COMMANDS.has(command) ||
      command.startsWith('CREATE') ||
      command.startsWith('ALTER') ||
      command.startsWith('DROP')
    )
  })
}
