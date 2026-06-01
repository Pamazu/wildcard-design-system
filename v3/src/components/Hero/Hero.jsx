import React from 'react';

import BglineWave from '../../primitives/BglineWave/BglineWave.jsx';
import BrandIcon from '../../primitives/BrandIcon.jsx';
import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Hero.css';

/* Hero — two-column hero on the wc-bgline background.
   #36 ARCHITECTURAL ROLLOUT (component 2/6): editable design surface now uses
   Tailwind utility classes (section padding/min-h/color, inner grid, copy width,
   h1 display type, line/plain, lede type, info-list type, bullet size) so the v3
   picker reads + applies real utilities natively.

   SOURCE OF TRUTH = v1 directly (:8080/preview/pages-home.html, MEASURED render).
   BOTH React CSS files diverge from v1 and cannot be trusted as the source:
   Hero.css was a stale dead dup (110/96/920, bp880); pages-home.css itself had
   tablet-tier PORT BUGS vs v1 (h1 clamp 48/72 not 44/64, copy 65% not 100%,
   min-height collapsing 856→600→auto not constant). v1 rendered truth: base pad
   194/80/296, min-height 808 CONSTANT (v1 base 780 + heroFDGap 28, JS-pinned all
   widths), h1 92, content-box; @860 h1 clamp(44,11vw,64), copy 100%, lede 17,
   gap 14; @480 h1 clamp(36,12vw,52), lede 15, li 13, bullet 18. padding-top
   stays 194 constant (v1 JS-pin; v3 replicates via the dashboard-edits saved
   edit). pages-home.css fixed to match in the same commit (it drives the
   homepage render the gate measures).

   Responsive uses +1 inclusive tier tokens: 1180→max-[1181px], 860→max-[861px],
   480→max-[481px] (≡ v1 max-width:1180/860/480 inclusive). Only padding-left/
   right + padding-bottom + type ramp are responsive; padding-top + min-height are
   constant (matching v1's JS-pinned render).

   box-sizing:content-box (#58 layout-critical) stays residual in pages-home — a
   @layer utility (box-content) loses to reset.css's unlayered `*{border-box}`, so
   it must remain a class rule. KEPT residual (intricate/decorative/structural, not
   picker-per-element): box-sizing, `.deco` letter-coloring, `.hero-cluster`/
   `.tile`/`.cN-*` calc() geometry, `wc-bgline` background.

   SCOPE NOTE: pages-home.css's matching .hero rules still WIN in base render →
   markup utilities are value-matched for honest picker reflection + parity (= Nav
   precedent). Per-property pages-home trim (utilities win natively in base render)
   = team-lead ruling pending (scope A vs B). */
export default function Hero() {
  return (
    <section
      className="hero wc-bgline pt-[194px] px-20 pb-[296px] min-h-[808px] text-[#f9f0ed] max-[1181px]:px-14 max-[1181px]:pb-24 max-[861px]:px-8 max-[861px]:pb-20 max-[481px]:px-5 max-[481px]:pb-16"
      aria-label="Hero"
    >
      <div className="wc-bgline__ink wc-grain" aria-hidden="true"></div>

      <div className="hero-inner relative z-[2] max-w-[1280px] mx-auto">
        <div className="hero-copy max-w-[720px] relative z-[2] max-[1181px]:max-w-[60%] max-[861px]:max-w-full">
          <h1 className="m-0 mb-6 [font-family:var(--font-display)] [font-stretch:var(--display-stretch)] font-medium text-[92px] leading-[1.04] tracking-[-0.005em] uppercase text-[#f9f0ed] max-[861px]:text-[clamp(44px,11vw,64px)] max-[481px]:text-[clamp(36px,12vw,52px)]">
            <span className="line flex items-baseline gap-5 whitespace-nowrap max-[861px]:gap-[14px] max-[481px]:gap-2.5">
              <Deco text="DRINK" />
              <span className="plain text-[#f9f0ed]">BOLDLY</span>
            </span>
            <span className="line flex items-baseline gap-5 whitespace-nowrap max-[861px]:gap-[14px] max-[481px]:gap-2.5">
              <Deco text="PLAY" />
              <span className="plain text-[#f9f0ed]">WILD</span>
            </span>
          </h1>

          <p className="lede mb-7 max-w-[520px] [font-family:var(--font-body)] font-medium text-[19px] leading-[1.45] text-[rgba(249,240,237,0.92)] max-[861px]:text-[17px] max-[481px]:text-[15px]">A social bar and restaurant built for drinks, dinners, dates, and nights that don't end early.</p>

          <div className="hero-ctas flex flex-wrap gap-3.5 mb-8 max-[481px]:flex-col">
            <Btn text="Reserve in [Location]" variant="yellow" />
            <Btn text="Plan an Event" variant="red" />
          </div>

          <ul className="hero-info flex flex-col gap-2 list-none m-0 p-0">
            <li className="flex items-center gap-3 text-[#f9f0ed] [font-family:var(--font-body)] font-medium text-[15px] leading-[1.4] max-[481px]:text-[13px]">
              <BrandIcon id="star" className="bullet w-[22px] h-[22px] flex-none block max-[481px]:w-[18px] max-[481px]:h-[18px]" />
              <span>Formerly Snakes &amp; Lattes</span>
            </li>
            <li className="flex items-center gap-3 text-[#f9f0ed] [font-family:var(--font-body)] font-medium text-[15px] leading-[1.4] max-[481px]:text-[13px]">
              <BrandIcon id="star" className="bullet w-[22px] h-[22px] flex-none block max-[481px]:w-[18px] max-[481px]:h-[18px]" />
              <span>Walk-ins welcome. Reservations recommended after 6 pm.</span>
            </li>
          </ul>
        </div>

        <div className="hero-cluster" aria-hidden="true">
          <span className="tile c1-top"><BrandIcon id="flute" /></span>
          <span className="tile c1-bottom"><BrandIcon id="heart" /></span>
          <span className="tile c2-top"><BrandIcon id="martini" /></span>
          <span className="tile c2-bottom"><BrandIcon id="meeple" /></span>
          <span className="tile c3-top"><BrandIcon id="star" /></span>
          <span className="tile c3-bottom"><BrandIcon id="wine" /></span>
          <span className="tile c4-top"><BrandIcon id="star" /></span>
          <span className="tile c4-bottom"><BrandIcon id="spade" /></span>
        </div>
      </div>

      <BglineWave />
    </section>
  );
}
