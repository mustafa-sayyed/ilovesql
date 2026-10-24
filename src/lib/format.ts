const NUMERIC_TYPE_IDS = new Set([20, 21, 23, 700, 701, 790, 1700])
const JSON_TYPE_IDS = new Set([114, 3802])
const DATE_TYPE_IDS = new Set([1082, 1114, 1184, 1186, 1266, 1182])

export type ValueKind = 'null' | 'number' | 'boolean' | 'json' | 'date' | 'text'

export function isNumericType(dataTypeID?: number): boolean {
  return dataTypeID !== undefined && NUMERIC_TYPE_IDS.has(dataTypeID)
}

export function isJsonType(dataTypeID?: number): boolean {
  return dataTypeID !== undefined && JSON_TYPE_IDS.has(dataTypeID)
}

export function isDateType(dataTypeID?: number): boolean {
  return dataTypeID !== undefined && DATE_TYPE_IDS.has(dataTypeID)
}

export function valueKind(value: unknown, dataTypeID?: number): ValueKind {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean' || dataTypeID === 16) return 'boolean'
  if (typeof value === 'number' || typeof value === 'bigint' || isNumericType(dataTypeID)) {
    return 'number'
  }
  if (isJsonType(dataTypeID) || (typeof value === 'object' && !(value instanceof Date))) {
    return 'json'
  }
  if (value instanceof Date || isDateType(dataTypeID)) return 'date'
  return 'text'
}

function formatDateValue(value: Date, dataTypeID?: number): string {
  if (dataTypeID === 1082) return value.toISOString().slice(0, 10)

  if (dataTypeID === 1114) {
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(
      value.getHours(),
    )}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }

  const iso = value.toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`
}

export function formatValue(value: unknown, dataTypeID?: number): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return formatDateValue(value, dataTypeID)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) {
    if (isJsonType(dataTypeID)) return JSON.stringify(value)
    return `{${value.map((item) => formatValue(item)).join(',')}}`
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const amount = bytes / 1024 ** exponent
  return `${amount.toFixed(amount >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

export function formatDuration(ms?: number): string {
  if (ms === undefined) return ''
  if (ms < 1) return '<1 ms'
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function relativeTime(timestamp: number): string {
  const diff = timestamp - Date.now()
  const absolute = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absolute < 60_000) return 'just now'
  if (absolute < 3_600_000) return formatter.format(Math.round(diff / 60_000), 'minute')
  if (absolute < 86_400_000) return formatter.format(Math.round(diff / 3_600_000), 'hour')
  if (absolute < 2_592_000_000) return formatter.format(Math.round(diff / 86_400_000), 'day')
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function estimateColumnWidth(name: string, values: unknown[]): number {
  const samples = values.slice(0, 40).map((value) => formatValue(value))
  const longest = samples.reduce((longestValue, value) => Math.max(longestValue, value.length), 0)
  const characterWidth = 7.4
  const width = Math.max(name.length, Math.min(longest, 70)) * characterWidth + 40
  return Math.round(Math.min(420, Math.max(104, width)))
}

export function quoteIdentifier(name: string): string {
  if (/^[a-z_][a-z0-9_]*$/.test(name)) return name
  return `"${name.replaceAll('"', '""')}"`
}

export function qualifiedTableName(schema: string, name: string): string {
  const quotedName = quoteIdentifier(name)
  return schema === 'public' ? quotedName : `${quoteIdentifier(schema)}.${quotedName}`
}

export function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
