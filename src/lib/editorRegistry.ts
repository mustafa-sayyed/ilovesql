interface EditorHandle {
  focus: () => void
  insert: (text: string) => void
}

const editors = new Map<string, EditorHandle>()

export function registerEditor(cellId: string, handle: EditorHandle): () => void {
  editors.set(cellId, handle)
  return () => {
    if (editors.get(cellId) === handle) {
      editors.delete(cellId)
    }
  }
}

export function focusEditor(cellId: string): boolean {
  const handle = editors.get(cellId)
  if (!handle) return false
  handle.focus()
  return true
}

export function insertIntoEditor(cellId: string, text: string): boolean {
  const handle = editors.get(cellId)
  if (!handle) return false
  handle.insert(text)
  return true
}
