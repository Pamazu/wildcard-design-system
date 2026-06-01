# Wildcard Design System

> A modern social house: great drinks, crave-worthy food, an atmosphere that adds edge to the daylight and comes alive after dark. Designed for chic daytime gatherings and unapologetic nights out — games are part of the culture, not a requirement.

## Source materials

This system was built from materials provided by the Wildcard team:

| Source | Path | Notes |
| --- | --- | --- |
| Figma file | `WildCard for Claude Design.fig` | Mounted as a virtual filesystem (5 pages: Designs, Style-Guide, UI-Elements, Components, Modules; 25 top-level frames). |
| Brand guidelines | `uploads/Wildcard Brand Guidelines v1.pdf` | 27-page PDF, Jan 2026. Source of truth for color hex values, voice principles, decorative type rules, photography/illustration direction. |
| Logo lockups | `uploads/Logo SVG.zip` → `assets/logos/` | Primary, Secondary, Vertical, Badge, Icon — each in Light + Dark. |
| Icons | `uploads/05_Iconography.zip` → `assets/icons/` | 13 blocky SVG glyphs (martini, beer, wine, flute, cd, chess, meeple, suits, star, lines, heart). |
| City badges | `uploads/City Badge.zip` → `assets/badges/` | Chicago, Tempe, Tucson — circular sticker-style location marks. |
| Reference render | `uploads/Homepage – 1440px v4.png` → `assets/reference/homepage-1440.png` | Full-page screenshot used to corroborate the Figma frame. |

## Index — what's in this folder

```
README.md                    ← you are here
SKILL.md                     ← Agent SKills front-matter for cross-tool use
colors_and_type.css          ← all design tokens (CSS vars) + semantic classes
fonts/                       ← drop Roc Grotesk WOFF2s here when licensed
assets/
  logos/                     ← Wildcard logo suite (light + dark variants)
  icons/                     ← brand SVG icon set
  badges/                    ← city badges (Chicago / Tempe / Tucson)
  reference/                 ← full-page reference renders
preview/                     ← cards rendered in the Design System tab
ui_kits/
  marketing-site/            ← homepage / location / forms recreations
slides/                      ← (not present — no deck template was provided)
```

---

## Brand at a glance

**Wildcard** is positioned as elevated, social, intentional. Daytime → nighttime is a core motif: the system shifts naturally between bright, energetic moments and darker, atmospheric ones. Black and cream are the two foundations; **yellow** is the primary accent, with **blue, red, purple, green** as supporting accents always used in that canonical order.

Locations referenced: **Chicago, Tempe, Tucson**.

---

## CONTENT FUNDAMENTALS

### Voice — four pillars

The brand guidelines define voice as four overlapping qualities:

1. **Confident & intentional** — clear, self-assured, grounded. Knows who it is, doesn't over-explain.
2. **Welcoming, never cheesy** — inclusive and warm without leaning on clichés or forced friendliness.
3. **Playful with edge** — clever, sharp, occasionally bold. Fun with restraint and purpose.
4. **Sophisticated & social** — polished and modern, with an energy that feels effortless and inviting.

> "We sound like great hosts. Warm, sharp, and self-aware."

### Tone do's and don'ts

| Do | Don't |
| --- | --- |
| Talk like a host who already knows the night will be good | Beg or hype ("Don't miss out!", "FOMO alert") |
| Use short, declarative sentences with rhythm | Use cute portmanteaus, puns about wildness, gambling clichés |
| Lean on atmosphere and experience verbs | Describe products literally or list features |
| Trust the reader's intelligence | Explain the joke or the vibe |
| Land hits in 2–6 words | Use exclamation points, ALL-CAPS shouting outside display type |

### Casing

- **Display headlines and section labels** → `UPPERCASE`. This is the dominant casing on the site (e.g. `DRINK BOLDLY · PLAY WILD`, `OUR LOCATIONS`, `FOOD & DRINK`, `EVENTS & BIG GROUP RESERVATIONS`).
- **Eyebrows / utility labels** → `UPPERCASE` with letter-spacing.
- **Body copy** → sentence case. Restrained, well-punctuated.
- **Button labels** → can go either way; prefer Title Case for short CTAs ("Book Now", "Reserve a Table"), UPPERCASE only inside marquee/strip elements.

### Person

- "**You**" addressed directly when speaking to guests ("Your table is waiting", "Join the inner circle").
- "**We**" for the venue's voice ("We're closed Mondays", "We host private events").
- Avoid "they" / passive corporate distance.

### Examples (lifted or extrapolated from the Figma + guidelines)

```
DRINK BOLDLY · PLAY WILD
Your table is waiting.
Join the inner circle.
Drink boldly, play wild, and leave knowing you had a genuinely good time.
Games are part of our culture, not a requirement.
Date nights, group hangs, celebrations, or spontaneous plans all belong here.
```

### Emoji & ornamentation

- **No emoji** in user-facing copy. The brand has its own SVG icon set (martini, meeple, star, suits) which fills the role emoji would otherwise play.
- **Stars** (`★ ✦ ✶`) and **suit glyphs** (`♠ ♥ ♦ ♣`) — implemented as the brand SVG icon set, not Unicode — appear as decorative dividers between phrases on the homepage.
- ALL-CAPS shouting and over-punctuation (`!!!`) are off-limits.

---

## VISUAL FOUNDATIONS

### Day vs night

The single biggest organizing idea. Day = `--wc-white` (cream `#f9f0ed`) ground with black ink and yellow accents. Night = `--wc-black` (`#1b1a17`) ground with cream ink and richer color play. A page can shift between the two within sections — the homepage uses cream for hero/locations and black for events/reservations/footer.

### Color

- **Foundation:** off-black `#1b1a17`, off-cream `#f9f0ed`. Never pure `#000` or `#fff`.
- **Primary accent:** yellow `#f5ac53` (a warm amber, not a neon).
- **Supporting:** blue `#4e8abe`, red `#ed5a35`, purple `#bb95ba`, green `#199562`.
- **Canonical order** (matters for sequences like the logo, polka dots, marquee strips): **yellow → blue → red → purple → green**.
- Avoid bluish-purple gradients. Avoid muddy mid-grays. Color is applied in **flat blocks**, not gradients.

### Type

- **Roc Grotesk Wide (Bold + Medium)** — display, titles, sub-heads, buttons. A wide, geometric, slightly squared sans, by Pangram Pangram. The OTF files ship with the project under `fonts/` and load via `@font-face`. Saira is kept as a last-resort fallback.at `font-stretch: 125%` weight 600. Drop a licensed Roc Grotesk WOFF2 into `fonts/` to override.h: expanded`. **Flagged for replacement** when WOFF2s are available.
- **Montserrat (Bold / Medium / Regular)** — utility, body, longer copy.
- Display type is almost always `UPPERCASE`. Body is sentence case.
- **Decorative type** (see PDF p.18) — alternating letters shift slightly above/below baseline, with accent colors on every other letter. ≥ 1/3 of a phrase must stay plain (black or white). Implemented as `.wc-decorative` in `colors_and_type.css`. **Never** use it for legal copy, hours, prices, addresses, or button labels.

### Backgrounds

- **Solid cream or solid black**, predominantly. Hero is full-bleed cream; "after dark" sections are full-bleed black.
- **No** lush gradients. **No** photographic backgrounds spanning whole sections.
- **Full-bleed photo strips** are used as horizontal accents (a single row of framed photos, not a wallpaper).
- **Patterns** (per PDF p.23): bold curved lines, large multi-color blocks, **checker print**, **polka dots**. Always in brand colors. Reference board games without being literal.
- **Grain texture** — photographed paper-speckle (`assets/textures/grain-paper.jpg`) applied via `.wc-grain` (default: dark surfaces, `lighten` blend, `0.32` opacity, 600px tile). Variants: `--light` (normal blend on white surfaces), `--cream` (exclusion blend for the cream/White B field), `--strong` (`0.55` opacity), `--subtle` (`0.18`). Canonical = `preview/components-paper-grain.html`; engineering contract = `CANONICAL.md`.

### Imagery

- Candid, atmospheric, low-light, often flash-lit. People > products. Movement > posed.
- Always **framed** — film-strip strips, polaroids, or simple color blocks. Never untreated, never full-bleed, never stock-style.
- A subtle color-overlay (one of the brand accents) tints each photo, plus the grain on top.
- **Don't** show close-ups of food/drinks/games without people. **Don't** use studio lighting.

### Animation

- Restrained. Fades and short slides (200–320ms) using ease-out.
- No bounces, no springs, no stagger-confetti. The brand is "polished and modern, effortless."
- Marquee-style infinite scrolling text strips appear as a recurring motif (the looping `WILDCARD ✦ DRINK BOLDLY ✦ PLAY WILD` strip).
- Hover on imagery: subtle scale to 1.02 + 200ms.

### States

- **Hover (light surfaces)**: shift from `--wc-yellow` → `--wc-yellow-deep` (`#e89a3c`); 1px outline-style buttons fill solid.
- **Hover (dark surfaces)**: cream button → tinted cream; ghost button → 8% cream fill.
- **Pressed**: ~96% scale + slight color darken. No deep-press bounces.
- **Focus-visible**: 2px yellow ring with 2px offset, on either ground.
- **Disabled**: 40% opacity, cursor disabled.

### Borders, corners, cards

- **Two corner radii dominate**: very rounded panel corners (`--radius-xl: 50px`) used on hero containers, big rounded cards, location cards. Pill (`--radius-pill`) for buttons. Mid radius (`--radius-md: 16px`) on tighter cards.
- **Borders**: 1px hairline at `rgba(27,26,23,0.12)` for low-emphasis structure; 2px solid ink for poker-card style frames.
- **Cards** lean flat — they get their depth from frame + grain, not shadows. Shadow tokens exist (`--shadow-1/2/3`) but should be used sparingly.

### Layout

- 1440px reference artboard with generous side gutters (≈149px on desktop, 28px on mobile).
- 12-col grid implied; in practice modules center-align large headlines and split content 50/50 (Image / Text) or 1/3·2/3.
- Sticky elements: top nav (black, transparent on hero, solid as you scroll).
- Generous vertical rhythm between sections (~120–160px).

### Use of transparency & blur

- Used minimally. The nav can go transparent over hero before solidifying.
- No glass-morphism. No backdrop-blurred modals. The brand is opaque and confident.

---

## ICONOGRAPHY

### The brand icon set

A **custom blocky SVG icon set** lives in `assets/icons/`. Each icon is a 125×125 square with a colored rounded-square background fill (one of the five brand accents) and a black silhouette glyph on top — designed to read at large scale as decorative space-filling elements **and** at small scale as wayfinding marks.

| File | Subject |
| --- | --- |
| `martini.svg` | Martini glass — yellow tile |
| `wine.svg` | Wine glass |
| `flute.svg` | Champagne flute |
| `beer.svg` | Pint |
| `cd.svg` | Compact disc — music/nightlife |
| `chess.svg` | Chess piece — games |
| `meeple.svg` | Board-game meeple |
| `clubs.svg`, `diamond.svg`, `heart.svg`, `spade.svg` | Playing-card suits |
| `star.svg` | Wildcard star — used as a divider/ornament |
| `lines.svg` | Decorative lines accent |

These are the **only** iconography the brand uses for product/category iconography. **No emoji**. **No Unicode-as-icon** (`★` etc) in user-facing copy. **No second icon font.**

### Functional UI icons (chevrons, social, arrows)

The Figma file references `heroicons-mini`, `heroicons-solid`, and `Bootstrap Icons` for utility glyphs (chevron-right, chevron-down, chat-bubble, document-check, social media marks, etc.) — these are functional UI parts, not brand expression.

**Substitution:** for portability we link **Heroicons** (Apache 2.0, free, exact match for Figma's `heroicons-mini` references) via CDN and **Bootstrap Icons** (MIT) for the rest. Both ship as inline SVG.

```html
<!-- Heroicons -->
<script src="https://unpkg.com/heroicons-helper@latest"></script>
<!-- or use individual SVG paths from heroicons.com -->
```

The custom blocky icons live alongside these — **brand icons own product categories; Heroicons/Bootstrap Icons own UI affordances.** Don't mix the two within a single decorative composition.

### Logo suite

`assets/logos/` contains 16 SVG variants (8 Light, 8 Dark, mirrored):

- **Primary** — clearest, default everywhere.
- **Primary Tagline** — Primary + tagline lockup.
- **Secondary** — more decorative; menus, signage, accent moments.
- **Vertical** — when space is constrained vertically.
- **Primary Badge** / **Secondary Badge** — graphic stamp form. Merch, coasters, decorative.
- **Primary Icon** / **Secondary Icon** — symbol only. Use only where the brand is already established (avatars, favicons, small ornament).

Clear-space rule (PDF p.12): minimum margin = the height of the "W" in *Wildcard*. Always over-deliver on space when possible.

---

## Caveats

1. **Roc Grotesk Wide** is shipped as OTF (Bold + Medium) under `fonts/`. The CSS loads them via `@font-face` and falls back to **Saira** (Google Fonts, wdth axis) only if the OTFs fail to load..woff2` and `RocGrotesk-WideBold.woff2` into `fonts/` and the `@font-face` block will pick them up via `local()` + `url()`.f2` and `RocGrotesk-WideBold.woff2` in `fonts/` — the `@font-face` declarations will pick them up automatically.
2. **Photography assets** were not provided as standalone files. The Figma references several JPEGs (`7954ac772c08.jpg`, `26305dae3c29.jpg`, etc.) embedded in frames; we use placeholder image cards in the UI kit. To finalize, drop production photos into `assets/photography/`.
3. The Figma file's `Designs/Playground` and `Modules/Playground` pages were not exhaustively replicated — they appear to be in-progress sandboxes rather than canonical designs.
