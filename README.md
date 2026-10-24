# ilovesql

A local-first SQL notebook that runs PostgreSQL entirely in the browser. Queries execute through PGlite (Postgres compiled to WebAssembly) and the database persists in IndexedDB. No server, no account, no data leaves the tab.

## Features

- PostgreSQL notebook with SQL and optional markdown cells
- Run cells, run all, format SQL, and inspect results in a virtualized grid
- Create new notebooks while keeping previous ones in a browsable list
- URL routes for notebooks, the notebook list, and settings with browser history support
- Settings page with a persisted markdown-cell toggle (off by default)
- Searchable schema explorer with table/column autocomplete
- Collapsible desktop schema sidebar with a compact rail
- Sortable and resizable result columns; hide columns
- Export results as CSV or JSON, or copy as TSV
- Query history stored locally
- Light and dark themes
- Command palette (`Ctrl/Cmd + K`)
- Seed storefront database with a reset action
- Works as a static build

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The landing page opens at `/`; choose **Open workspace** to enter the notebook. The first load downloads the Postgres engine and seeds the demo database; later loads reuse the cached engine and IndexedDB state.

## Scripts

```bash
npm run dev      # start the Vite dev server
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
npm run lint     # run Oxlint
```

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + Enter` | Run the current cell |
| `Shift + Enter` | Run the current cell and move to the next |
| `Alt + Enter` | Run the current cell and insert a new one |
| `Ctrl/Cmd + K` | Open the command palette |
| `Ctrl/Cmd + Shift + Enter` | Run all cells |
| `Escape` | Leave the editor or close a dialog |

## Storage

- Notebook cells, previous notebooks, query history, and settings use `localStorage`.
- The database uses `idb://ilovesql`.
- Resetting the demo database drops and recreates the seeded schema but keeps notebook queries.
- Data is scoped to the browser profile and origin.

## Stack

- React 19, React Router, TypeScript, Vite
- Tailwind CSS v4 and shadcn/ui
- CodeMirror 6
- PGlite with a web worker
- Zustand
- TanStack Virtual
