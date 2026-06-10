# Hero icons — ambient physics (standalone, vanilla)

The hero icon-tiles animation from the Wildcard homepage, extracted as a
self-contained drop-in. **Vanilla JS + HTML + CSS — no React, no libraries,
no build step.** Open `index.html` directly in a browser to see it run.

## Files

| File | What it is |
|---|---|
| `index.html` | Runnable demo: markup contract + inlined Wildcard SVG icons. The demo chrome (headings, spacer) is throwaway. |
| `icons-physics.css` | The tiles' rest layout (the staggered lattice) + the one performance rule. ~50 lines. |
| `icons-physics.js` | The whole animation: ambient drift, elastic collisions, cursor/scroll/tilt nudges, reduced-motion guard. Self-initializes. |

## Integrating into a page

1. **Markup** — a `.hero-cluster` container with 8 absolutely-positioned square
   `.tile` children (see `index.html`). Position the cluster wherever the
   design needs it; the sim reads the live layout.
2. **CSS** — include `icons-physics.css`. Tile size, gaps and stagger all
   derive from the single `--tile` variable.
3. **JS** — include `icons-physics.js` before `</body>`. Nothing to call.

The cursor input listens on the nearest `.hero` section (falls back to the
cluster's parent), so the cluster itself keeps `pointer-events: none` and
never blocks clicks.

## Behavior summary

- Tiles always drift gently; they bounce off each other and off a padded
  invisible play area around their rest lattice. They never overlap.
- A very soft "home pull" keeps the cluster cohesive (set `HOME_PULL = 0`
  in the JS for free-floating pieces).
- Inputs nudge, never fling: cursor pushes nearby tiles aside (desktop),
  scroll speed adds vertical inertia, device tilt adds gentle gravity
  (iOS asks permission on first tap; no-op if denied).
- `prefers-reduced-motion: reduce` → the animation never starts and the
  lattice renders fully static. Reacts live to OS-setting changes.
- Window resize rebuilds the sim, so responsive tile sizes are safe.

## Tuning

All knobs sit at the top of `initIconPhysics()` in `icons-physics.js`,
commented inline: drift speed band (`MIN_SPEED`/`MAX_SPEED`), play-area
padding (`MARGIN`), cursor radius/strength, scroll and tilt strength.

## Performance notes

- One `requestAnimationFrame` loop; per-frame work is 8 bodies + 28 pair
  checks — negligible.
- Tiles get `will-change: transform` (own compositor layer) and are moved
  with `translate3d`, so the motion stays off the main paint path.
- Deliberately **no CSS transition** on the tiles — the JS sets transforms
  every frame; a transition would lag it.
