import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const baseTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      color: 'var(--foreground)',
      fontSize: '13px',
    },
    '.cm-content': {
      fontFamily: 'var(--font-mono)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--primary)',
    },
    '.cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'color-mix(in oklch, var(--primary) 26%, transparent)',
    },
    '.cm-activeLine': {
      backgroundColor: 'color-mix(in oklch, var(--foreground) 3.5%, transparent)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'var(--muted-foreground)',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px 0 4px',
      fontSize: '11px',
      opacity: 0.55,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'var(--muted)',
      border: '1px solid var(--border)',
      color: 'var(--muted-foreground)',
      borderRadius: '4px',
      padding: '0 4px',
    },
    '.cm-matchingBracket': {
      backgroundColor: 'color-mix(in oklch, var(--primary) 20%, transparent)',
      outline: '1px solid color-mix(in oklch, var(--primary) 40%, transparent)',
    },
    '.cm-placeholder': {
      color: 'var(--muted-foreground)',
      opacity: 0.65,
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
  },
  { dark: true },
)

const highlightStyle = HighlightStyle.define([
  {
    tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.modifier],
    color: 'var(--syntax-keyword)',
    fontWeight: '600',
  },
  {
    tag: [t.string, t.special(t.string), t.regexp, t.character],
    color: 'var(--syntax-string)',
  },
  {
    tag: [t.number, t.bool, t.null, t.atom],
    color: 'var(--syntax-number)',
  },
  {
    tag: [t.lineComment, t.blockComment, t.docComment, t.comment],
    color: 'var(--syntax-comment)',
    fontStyle: 'italic',
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: 'var(--syntax-function)',
  },
  {
    tag: [t.typeName, t.className, t.namespace, t.standard(t.typeName)],
    color: 'var(--syntax-type)',
  },
  {
    tag: [t.operator, t.punctuation, t.bracket, t.separator],
    color: 'var(--syntax-operator)',
  },
  {
    tag: [t.variableName, t.propertyName, t.attributeName, t.labelName],
    color: 'var(--syntax-variable)',
  },
  {
    tag: [t.tagName, t.angleBracket],
    color: 'var(--syntax-keyword)',
  },
  {
    tag: t.invalid,
    color: 'var(--destructive)',
    textDecoration: 'underline wavy',
  },
])

export const notebookEditorTheme = [baseTheme, syntaxHighlighting(highlightStyle)]
