import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotebookStore } from '@/store/notebook'
import type { NotebookCell } from '@/types'

export function MarkdownCell({ cell }: { cell: NotebookCell }) {
  const updateCell = useNotebookStore((state) => state.updateCell)
  const setActiveCell = useNotebookStore((state) => state.setActiveCell)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [editing, setEditing] = useState(() => cell.source.trim().length === 0)

  useLayoutEffect(() => {
    if (!editing) return
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [cell.source, editing])

  useEffect(() => {
    if (!editing) return
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }, [editing])

  if (!editing) {
    return (
      <div
        className="notebook-markdown cursor-text rounded-md px-1 py-0.5 transition-colors hover:bg-muted/20"
        onClick={() => {
          setActiveCell(cell.id)
          setEditing(true)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setEditing(true)
          }
        }}
        title="Click to edit markdown"
      >
        {cell.source.trim() ? (
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => <a {...props} target="_blank" rel="noreferrer noopener" />,
            }}
          >
            {cell.source}
          </Markdown>
        ) : (
          <p className="text-[12px] text-muted-foreground/70 italic">
            Empty markdown cell — click to write.
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={cell.source}
        spellCheck={false}
        placeholder="Write markdown…  # heading  **bold**  - list  `code`"
        onChange={(event) => updateCell(cell.id, { source: event.target.value })}
        onBlur={() => {
          if (cell.source.trim().length > 0) setEditing(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setEditing(false)
          }
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey || event.shiftKey)) {
            event.preventDefault()
            setEditing(false)
          }
          if (event.key === 'Tab') {
            event.preventDefault()
            const target = event.currentTarget
            const start = target.selectionStart
            const end = target.selectionEnd
            updateCell(cell.id, {
              source: `${cell.source.slice(0, start)}  ${cell.source.slice(end)}`,
            })
            requestAnimationFrame(() => {
              target.selectionStart = start + 2
              target.selectionEnd = start + 2
            })
          }
        }}
        rows={2}
        className="min-h-[64px] w-full resize-none overflow-hidden rounded-md border border-border/50 bg-background/40 px-2.5 py-2 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/40"
        aria-label="Markdown source"
      />
      <div className="mt-1 flex items-center gap-2 px-0.5 text-[9.5px] text-muted-foreground/60">
        <span>Markdown</span>
        <span className="text-muted-foreground/30">·</span>
        <span>Shift + Enter to render</span>
      </div>
    </div>
  )
}
