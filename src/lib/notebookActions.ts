import { toast } from 'sonner'
import { focusEditor } from './editorRegistry'
import { useNotebookStore } from '@/store/notebook'
import type { CellType } from '@/types'

export async function runAllCells(): Promise<void> {
  const summary = await useNotebookStore.getState().runAll()

  if (summary.total === 0) {
    toast.info('No SQL cells to run')
    return
  }

  if (summary.failed > 0) {
    toast.warning(
      `${summary.succeeded} of ${summary.total} cells ran · ${summary.failed} failed`,
    )
    return
  }

  toast.success(`Ran ${summary.total} ${summary.total === 1 ? 'cell' : 'cells'}`)
}

export function addCellAndFocus(
  type: CellType,
  afterId?: string | null,
  source = '',
  focusDelay = 70,
): string {
  const state = useNotebookStore.getState()
  const id = state.addCell(afterId ?? state.activeCellId, type, source)

  if (type === 'sql') {
    window.setTimeout(() => focusEditor(id), focusDelay)
  }

  window.setTimeout(() => {
    document.getElementById(`cell-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, 30)

  return id
}
