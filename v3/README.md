# Wildcard Design System v2 — Vite + React + Storybook

Modern React rebuild of the Wildcard Design System. Replaces the Babel-in-browser prototype at `/wildcard-design-system-react/`.

## Setup

```bash
npm install
```

## Scripts

```bash
npm run dev         # Vite dev server  → http://localhost:5173
npm run build       # Production build → dist/
npm run preview     # Preview prod build
npm run storybook   # Storybook → http://localhost:6006
npm run build-storybook
```

## Structure

```
src/
├── main.jsx              # Entry — ReactDOM.createRoot + <App />
├── App.jsx               # <HomePage />
├── HomePage.jsx          # Composes all 10 sections
├── styles/
│   ├── reset.css         # Minimal base reset
│   ├── tokens.css        # Design tokens (colors, type, spacing)
│   ├── btn.css           # Shared button chrome
│   ├── bg-line.css       # Background-line wave utility
│   ├── global.css        # body bg, .deco, .section-inner
│   └── pages-home.css    # Section-layout rules (.hero-*, .games-*, etc.)
├── primitives/           # Shared atoms — used across components
│   ├── Btn/Btn.jsx
│   ├── BrandIcon.jsx     # Renders icon by id via <use href="#i-...">
│   ├── Deco/Deco.jsx
│   ├── BglineWave/BglineWave.jsx
│   └── SvgSprite/SvgSprite.jsx
└── components/           # Section components — one folder each
    ├── Nav/, Hero/, FoodDrink/, Games/, Locations/, Events/,
    └── Testimonials/, Connected/, Newsletter/, Footer/
        ├── <Name>.jsx
        ├── <Name>.css        # Plain CSS, side-effect imported
        └── <Name>.stories.jsx
```

## CSS architecture note

Spec called for `.module.css` per component. Vite's CSS-modules pipeline
drops `:global { ... }` block wrappers entirely (verified by direct
experiment — bundle CSS shrank from 622 KB → 10 KB when the wrapper was
present). Since v1 className strings hardcode un-mangled class names
(`.hero-stage`, `.fd-card`, etc.) and rewriting every component to use
`styles.foo` was out of scope, the architecture pivoted to:

- Plain `.css` files per component (NOT `.module.css`)
- Side-effect import: `import './Hero.css';`
- Same one-CSS-file-per-component organizational benefit
- No class-name mangling required

The architectural win — "every component owns its CSS in a single file
co-located with its JSX" — is preserved.

## Assets

`public/` symlinks to the old project's `assets/` and `fonts/` so they
serve from `/assets/...` and `/fonts/...` at runtime.
