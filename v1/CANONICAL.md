# Canonical Component Contract

## The Rule

**The canonical version of a component is the file named after it. Not what is currently rendering. Not what was shipped first. Not what most pages use.**

For every component visible in the dashboard sidebar, the matching file at `preview/components-<kebab-name>.html` is the single source of truth (SoT). All other surfaces — page-level CSS, React components, in-page overrides — inherit from / mirror that file. Never the other way around.

## Sidebar ↔ File Mapping

| Dashboard sidebar entry | Canonical file |
|---|---|
| `Top Navigation`         | `preview/components-nav.html` |
| `Hero`                   | `preview/components-hero.html` |
| `Food & Drink`           | `preview/components-food-drink.html` |
| `Module A` (Games)       | `preview/components-module-a.html` |
| `Location Card`          | `preview/components-location-card.html` |
| `Fun Experience`         | `preview/components-fun-experience.html` |
| `Form`                   | `preview/components-form.html` |
| `Footer`                 | `preview/components-footer.html` |
| `Buttons`                | `preview/components-buttons.html` |
| `Paper Grain Texture`    | `preview/components-paper-grain.html` |

Add new components by creating `preview/components-<new-name>.html`. The file name IS the canonical declaration.

## Drift Direction

Drift always flows **from canonical → consumers**, never the reverse.

```
preview/components-<name>.html   (THE canonical)
        │
        ├─→ preview/colors_and_type.css  (token + utility mirror)
        ├─→ preview/pages-home.html      (composition)
        ├─→ <react-app>/src/components/  (React consumers)
        └─→ any other consumer
```

When canonical changes, consumers update. When a consumer is observed to render correctly, that does NOT promote its CSS to canonical — it just means the consumer happens to match (or it has a local override that masks divergence).

## Audit Pattern

Periodically check that all consumers still match canonical, and that no canonical-on-canonical drift has crept in.

### 1. Find canonical drift (across `components-*.html`)

Identify divergent treatments between sibling canonicals. Example for grain:

```bash
grep -l "multiply\|feTurbulence\|fractalNoise" preview/components-*.html
```

Any hit outside `components-paper-grain.html` = canonical-on-canonical drift. Surface it.

### 2. Find consumer drift (page CSS / React vs canonical)

For a given property in a canonical, search all consumers for divergent values.

```bash
# Example: grain treatment
grep -rn "mix-blend-mode.*multiply\|opacity.*0\.[123]" preview/ src/
```

Cross-reference against the canonical's values. Divergence = consumer needs sync, not canonical.

### 3. Computed-style parity verify (browser-side)

For any component rendered in multiple places, use Playwright `getComputedStyle` on identical selectors and check property identity:

```js
const canonical = await pCanonical.evaluate(() => {
  const el = document.querySelector('.<component>');
  const cs = getComputedStyle(el, '::after');
  return { opacity: cs.opacity, mixBlendMode: cs.mixBlendMode, /* ... */ };
});
const consumer  = await pConsumer.evaluate(/* same selector + props */);
const identical = Object.keys(canonical).every(k => canonical[k] === consumer[k]);
```

`identical === true` = parity. False = consumer needs sync.

## Scope-Grant Pattern

`html-designer` is normally read-only on `components-*.html` (canonicals are off-limits to prevent accidental design changes during page-level work). When canonical-on-canonical drift is discovered:

1. Surface to main-agent / team-lead with diagnosis (what file, what property, what should it be).
2. Wait for explicit per-fix scope grant.
3. Apply the convergence edit (canonical-to-canonical alignment only — not new design).
4. Verify computed-style + standalone screenshot.
5. Commit with clear "scope grant" rationale in the message, and update CANONICAL.md if the fix surfaces a new pattern worth documenting (self-evolving doc).

Same pattern applies to `bg-line.css`, `btn.css`, and other shared CSS surfaces under the design-system root: read-only by default, edit only under explicit per-fix scope grant for convergence work.

## Case Study (referenced for the pattern, not the dates)

Initial complaint surfaced via page-level review: paper grain texture inconsistent across three dark-bg sections (Hero, Games, Footer above-heading band looked plain black).

1. **Audit (page-level)** — three sections used three different grain treatments. Identified divergence vs `components-paper-grain.html` canonical.
2. **Page-level convergence** — `colors_and_type.css` `.wc-grain` rules rewritten to mirror canonical (lighten 0.32, `grain-paper.jpg`, variants `--light` / `--cream` / `--strong` / `--subtle`). All three page sections updated to inherit. Footer "above heading" no-grain fixed via `.wc-bgline--flip .ink-fill { fill: transparent }` so the masked grain shows through.
3. **Canonical-on-canonical drift discovered** — `components-module-a.html` had its own divergent grain (multiply 0.3 SVG noise) that didn't match `components-paper-grain.html`. Surfaced to team-lead.
4. **Scope grant → canonical fix** — team-lead granted per-fix scope to edit `components-module-a.html`. Grain rule rewritten to match `components-paper-grain.html` canonical. Now downstream React consumers inherit the correct treatment automatically when synced.
5. **Verify** — Playwright computed-style parity confirmed all four targets (page Hero, page Games, page Footer, canonical Module A) show identical properties. Single SoT achieved.

This pattern (audit → page convergence → canonical fix under scope grant → parity verify) repeats for any property class: grain, typography, color sequence, spacing tokens, etc.
