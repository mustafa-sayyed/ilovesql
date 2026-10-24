import Papa from 'papaparse'
import type { QueryResultSet } from '@/types'
import { formatValue } from './format'

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Uint8Array) return Array.from(value)
  return value
}

export function resultToCsv(result: QueryResultSet): string {
  const columns = result.fields.map((field) => field.name)
  const data = result.rows.map((row) =>
    result.fields.map((field) => {
      const value = row[field.name]
      return value === null || value === undefined ? '' : formatValue(value, field.dataTypeID)
    }),
  )

  const csv = Papa.unparse({ fields: columns, data })
  return `\ufeff${csv}`
}

export function resultToJson(result: QueryResultSet): string {
  return JSON.stringify(result.rows, jsonReplacer, 2)
}

export function resultToTsv(result: QueryResultSet): string {
  const columns = result.fields.map((field) => field.name)
  const rows = result.rows.map((row) =>
    result.fields
      .map((field) => {
        const value = row[field.name]
        return value === null || value === undefined
          ? ''
          : formatValue(value, field.dataTypeID).replaceAll('\t', ' ').replaceAll('\n', ' ')
      })
      .join('\t'),
  )

  return [columns.join('\t'), ...rows].join('\n')
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function exportTimestamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}
