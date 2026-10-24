import { sql, PostgreSQL, type SQLNamespace } from '@codemirror/lang-sql'
import { EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useEffect, useMemo, useRef } from 'react'
import { registerEditor } from '@/lib/editorRegistry'
import type { SchemaTable } from '@/types'
import { notebookEditorTheme } from './editorTheme'

interface SqlEditorProps {
  cellId: string
  value: string
  tables: SchemaTable[]
  onChange: (value: string) => void
  onRun: () => void
  onRunAndNext: () => void
  onRunAndInsert: () => void
  onFocus?: () => void
  placeholder?: string
}

function buildSchema(tables: SchemaTable[]): SQLNamespace {
  const schema: Record<string, SQLNamespace> = {}

  for (const table of tables) {
    const columns = table.columns.map((column) => column.name)

    if (table.schema === 'public') {
      schema[table.name] = columns
      continue
    }

    const current = schema[table.schema]
    const namespace =
      current && !Array.isArray(current) && !('self' in current)
        ? (current as Record<string, SQLNamespace>)
        : {}

    namespace[table.name] = columns
    schema[table.schema] = namespace
  }

  return schema
}

export function SqlEditor({
  cellId,
  value,
  tables,
  onChange,
  onRun,
  onRunAndNext,
  onRunAndInsert,
  onFocus,
  placeholder = 'SELECT * FROM customers LIMIT 10;',
}: SqlEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const schema = useMemo(() => buildSchema(tables), [tables])

  const runKeymap = useMemo(
    () =>
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRun()
              return true
            },
          },
          {
            key: 'Shift-Enter',
            run: () => {
              onRunAndNext()
              return true
            },
          },
          {
            key: 'Alt-Enter',
            run: () => {
              onRunAndInsert()
              return true
            },
          },
          {
            key: 'Escape',
            run: (view) => {
              view.contentDOM.blur()
              return true
            },
          },
          indentWithTab,
        ]),
      ),
    [onRun, onRunAndNext, onRunAndInsert],
  )

  const extensions = useMemo(
    () => [
      sql({
        dialect: PostgreSQL,
        schema,
        defaultSchema: 'public',
        upperCaseKeywords: true,
      }),
      EditorState.tabSize.of(2),
      EditorView.lineWrapping,
      runKeymap,
    ],
    [schema, runKeymap],
  )

  useEffect(
    () =>
      registerEditor(cellId, {
        focus: () => editorRef.current?.view?.focus(),
        insert: (text) => {
          const view = editorRef.current?.view
          if (!view) return
          const { from, to } = view.state.selection.main
          view.dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + text.length },
            scrollIntoView: true,
          })
          view.focus()
        },
      }),
    [cellId],
  )

  return (
    <div onFocusCapture={onFocus} className="w-full">
      <div className="overflow-hidden rounded-lg bg-muted/20 ring-1 ring-border/40">
        <CodeMirror
          ref={editorRef}
          value={value}
          onChange={onChange}
          theme={notebookEditorTheme}
          extensions={extensions}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLineGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: true,
          }}
          className="p-4"
          aria-label="SQL editor"
        />
      </div>
    </div>
  )
}
