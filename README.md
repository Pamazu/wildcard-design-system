# Wildcard Design System

The Wildcard brand design system, in three variations:

| | Folder | Stack | Live |
|---|---|---|---|
| **v1** | [`v1/`](./v1) | Static HTML + CSS + vanilla JS — frozen reference | https://wildcard-v1.web.app |
| **v1.5** | [`v1.5/`](./v1.5) | v1 evolved for dev handoff: vanilla-only, per-animation standalone extractions under `v1.5/handoff/` | — |
| **v3** | [`v3/`](./v3) | React + Vite + Tailwind | https://wildcard-v3.web.app |

Both ship a **dashboard** (component browser): a sidebar of every token, primitive, component, and page, each rendered live in a preview pane.

---

## v1 — static HTML dashboard

Vanilla HTML/CSS/JS. The dashboard embeds each component's preview in an iframe, so it must be served over HTTP (opening `index.html` from `file://` won't load the previews).

```bash
cd v1
python3 -m http.server 8080
# open http://localhost:8080
```

Contents: `index.html` (dashboard), `preview/` (per-component preview pages), `assets/` (logos, icons, photography, badges, textures, reference shots), `fonts/`, and the token stylesheets (`colors_and_type.css`, `btn.css`, `bg-line.css`). `CANONICAL.md` documents the canonical token values.

## v3 — React / Vite / Tailwind

The same design system rebuilt as React components with Tailwind.

```bash
cd v3
npm install
npm run dev     # dev server on http://localhost:5175
npm run build   # production build → dist/
```

**Routing** (`src/App.jsx`):

| URL | Renders |
|---|---|
| `/` (deployed) | Dashboard (component browser) |
| `/` (dev) | Full homepage |
| `?dashboard=1` | Dashboard |
| `?component=<Name>` | A single component, standalone |
| `?home=1` | Full homepage (works in any environment) |

Key files: `src/Dashboard.jsx` (the browser UI), `src/HomePage.jsx` (the assembled marketing page), `src/components/` + `src/primitives/` (the system), `src/styles/` (tokens + global CSS).

---

*Three variations of one system — v1 is the original static build (frozen reference); v1.5 evolves it for developer handoff; v3 is the React rebuild and the primary deployed target.*
