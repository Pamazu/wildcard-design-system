import React from 'react';

import BrandIcon from '../../primitives/BrandIcon.jsx';
import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Games.css';

/* Games — Module A treatment.
   PATTERN-PROOF (#36 rollout 3/6): converted from semantic CSS (.games-* in
   pages-home.css) to Tailwind UTILITY classes on the elements, so the v3
   edit-mode picker reads AND applies real utilities natively (Scope B — the
   utilities DRIVE the render; pages-home.css holds residual only). Parity
   MEASURED vs LIVE v1 (:8080/preview/pages-home.html .module-a*, computed
   across the ramp 360-1440).
   BREAKPOINT: single v1 collapse @900. Tailwind v4 `max-[Npx]:` = `@media
   (width < Npx)` (EXCLUSIVE), so v1's inclusive `@media (max-width:900px)` ≡
   `max-[901px]:`. Eyebrow (24px + 32px svg), desc (17px), border (18px) and
   min-h (380px) are CONSTANT across widths in v1 — NO mobile shrink (v3's
   prior 16/14, 14, 14/10 shrinks were undocumented drift, removed).
   NO Tailwind preflight in this project → `border` sets width only, so the
   border STYLE is explicit (`border-solid`).
   RESIDUAL (kept in pages-home.css, NOT converted):
     · .games-checker conic-gradient L/R columns (::before/::after — pseudo-
       elements can't take utilities) + --ma-side/--ma-tile vars. The vars
       drive BOTH the checker width/tile AND this component's .games-inner
       horizontal margin (`[margin:0_var(--ma-side)]`), and both shrink @900
       (136/68 → 64/32) via the .games base @900 block.
     · .games::after paper-grain overlay (#99: photo-bg dropped, grain only).
     · global .deco per-letter colors + bounce (shared with Hero — GAMES =
       G yellow / A blue / M red / E purple / S green, the standard cycle).
     · .games .games-title .deco letter-gap (primitive-internal).
   HELD (NOT applied — composition, see team-lead): v1's module
   `margin-top:-128px` homepage straddle pull. Coupled to #48 (hero→games gap)
   + the explicitly-held #61 (F&D -180). v3 keeps its current 0. */
export default function Games() {
  return (
    <div className="games-wrap bg-transparent relative z-[1] flex justify-center pt-[520px] px-20 pb-4 max-[901px]:pt-20 max-[901px]:px-6">
      <section
        className="games relative w-full max-w-[1080px] box-border border-[18px] border-solid border-[#f5ac53] bg-[#1b1a17] overflow-hidden isolate text-[#f9f0ed]"
        aria-label="Games"
      >
        <div className="games-bg" aria-hidden="true"></div>
        <div className="games-checker" aria-hidden="true"></div>

        <div className="games-inner relative z-[3] [margin:0_var(--ma-side)] pt-[66px] px-16 pb-[50px] max-[901px]:px-7 flex flex-col items-center text-center gap-[22px] max-[901px]:gap-[18px] min-h-[380px]">
          <p className="games-eyebrow inline-flex items-center gap-[14px] [font-family:var(--font-display)] [font-stretch:125%] font-medium text-[24px] leading-none tracking-[0.04em] text-[#f9f0ed] uppercase m-0">
            <BrandIcon id="star" className="w-8 h-8 flex-none" />
            <span>Find your next favorite</span>
            <BrandIcon id="star" className="w-8 h-8 flex-none" />
          </p>
          <h2 className="games-title [font-family:var(--font-display)] [font-stretch:125%] font-medium text-[clamp(72px,9vw,124px)] max-[901px]:text-[clamp(54px,12vw,88px)] uppercase m-0 leading-[0.95] tracking-[0.04em]">
            <Deco text="GAMES" />
          </h2>
          <p className="games-desc [font-family:var(--font-body)] font-medium text-[17px] leading-[1.55] text-[rgba(249,240,237,0.85)] max-w-[580px] mt-[-14px]">
            A curated game library for every kind of night out. From easy crowd-pleasers
            to conversation starters and unexpected favorites, there's always something
            fun to discover and worth gathering around.
          </p>
          <Btn text="Help Me Find a Game" variant="red" size="" className="mt-2.5" />
        </div>
      </section>
    </div>
  );
}
