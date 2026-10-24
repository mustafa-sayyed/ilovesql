import type { SchemaColumn, SchemaSnapshot, SchemaTable } from '@/types'
import { getDb } from './client'

interface TableRow {
  schema: string
  name: string
  kind: 'table' | 'view'
  row_count: number | string | bigint | null
}

interface ColumnRow {
  schema: string
  name: string
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
}

interface PrimaryKeyRow {
  schema: string
  name: string
  column_name: string
}

const HIDDEN_TABLES = new Set(['_ilovesql_meta'])

export async function introspectSchema(): Promise<SchemaSnapshot> {
  const db = await getDb()

  const tables = await db.query<TableRow>(`
    select
      n.nspname as schema,
      c.relname as name,
      case when c.relkind in ('v', 'm') then 'view' else 'table' end as kind,
      case
        when c.relkind in ('r', 'p') then greatest(c.reltuples, 0)::bigint
        else null
      end as row_count
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname not in ('pg_catalog', 'information_schema')
      and n.nspname not like 'pg_toast%'
      and c.relkind in ('r', 'p', 'v', 'm')
    order by n.nspname, c.relname
  `)

  const columns = await db.query<ColumnRow>(`
    select
      table_schema as schema,
      table_name as name,
      column_name,
      data_type,
      is_nullable,
      column_default
    from information_schema.columns
    where table_schema not in ('pg_catalog', 'information_schema')
    order by table_schema, table_name, ordinal_position
  `)

  const primaryKeys = await db.query<PrimaryKeyRow>(`
    select
      tc.table_schema as schema,
      tc.table_name as name,
      kcu.column_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = tc.constraint_name
      and kcu.table_schema = tc.table_schema
      and kcu.table_name = tc.table_name
    where tc.constraint_type = 'PRIMARY KEY'
      and tc.table_schema not in ('pg_catalog', 'information_schema')
  `)

  const size = await db.query<{ size: number | string | bigint }>(
    'select pg_database_size(current_database())::bigint as size',
  )

  const primaryKeySet = new Set(
    primaryKeys.rows.map((row) => `${row.schema}.${row.name}.${row.column_name}`),
  )

  const columnMap = new Map<string, SchemaColumn[]>()
  for (const row of columns.rows) {
    const key = `${row.schema}.${row.name}`
    const list = columnMap.get(key) ?? []
    list.push({
      name: row.column_name,
      dataType: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
      isPrimaryKey: primaryKeySet.has(`${row.schema}.${row.name}.${row.column_name}`),
    })
    columnMap.set(key, list)
  }

  const schemaTables: SchemaTable[] = tables.rows
    .filter((row) => !HIDDEN_TABLES.has(row.name))
    .map((row) => ({
      schema: row.schema,
      name: row.name,
      kind: row.kind,
      rowCount: row.row_count === null ? null : Number(row.row_count),
      columns: columnMap.get(`${row.schema}.${row.name}`) ?? [],
    }))

  return {
    tables: schemaTables,
    databaseSize: Number(size.rows[0]?.size ?? 0),
    fetchedAt: Date.now(),
  }
}
