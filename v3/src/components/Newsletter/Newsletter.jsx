import React from 'react';

import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Newsletter.css';

/* Newsletter — "Join the Inner Circle" section.
   PATTERN-PROOF (#36): rebuilt from semantic CSS (.newsletter* / .nl-* / .wc-form)
   to Tailwind UTILITY classes on the elements, so the v3 edit-mode picker reads
   AND applies real utilities natively — no cascade fight. The project ships no
   unlayered base element rules (reset.css is box-sizing + `button{font:inherit}`
   only), so once the semantic classes are gone nothing competes with the
   @layer utilities and finite utilities win without !important. Arbitrary
   values (px / hex / clamp) are JIT-generated from this markup at build time.
   NO Tailwind preflight in this project → `border` sets width only, so the
   border STYLE is explicit (card `border-dotted`, photo `border-solid`).
   Parity MEASURED vs LIVE v1 (:8080/preview/components-form.html, computed):
   copy col 696px, inputs/button 642px (=v1 644 inner − 2px input border),
   card border = 2px dotted #f5ac53 (amber) @18px radius, #f5e5e0 blush pill
   inputs, #f5ac53 amber pill submit, photo 6px solid #ed5a35; clean 1-col
   collapse + hidden photo ≤860, narrower padding ≤480.
   BREAKPOINT NOTE: Tailwind v4 `max-[Npx]:` = `@media (width < Npx)` (EXCLUSIVE),
   so v1's inclusive `@media (max-width:860px)` ≡ Tailwind `max-[861px]`. Hence
   the +1 tokens (861/481/1181) — they make the collapse fire AT 860/480/1180,
   matching v1. (Picker tier tokens are 860/480/1180 = 1px-exclusive; aligning
   them to the +1 inclusive form is a separate systemic call — see team-lead.) */
export default function Newsletter() {
  const inputCls =
    'w-full box-border [font-family:var(--font-body)] text-[16px] font-semibold leading-[1.2] ' +
    'text-[#1b1a17] bg-[#f5e5e0] border-0 outline-0 rounded-full py-4 px-[22px] appearance-none ' +
    'transition-shadow placeholder:text-[rgba(27,26,23,0.55)] placeholder:font-semibold ' +
    'focus:shadow-[0_0_0_2px_#1b1a17]';
  const labelCls = '[font-family:var(--font-body)] text-[14px] font-bold leading-[1.2] text-[#1b1a17]';

  return (
    <section
      className="bg-transparent py-[100px] px-[80px] max-[861px]:py-[80px] max-[861px]:px-[32px] max-[481px]:py-[64px] max-[481px]:px-[20px]"
      aria-label="Newsletter"
    >
      <div className="mx-auto max-w-[1280px] grid grid-cols-[696fr_444fr] gap-[140px] items-center max-[1181px]:gap-[40px] max-[861px]:grid-cols-1 max-[861px]:gap-[32px]">
        <div>
          <h2 className="m-0 mb-5 [font-family:var(--font-display)] [font-stretch:125%] font-medium uppercase leading-[1.05] text-[clamp(42px,5vw,64px)] max-[481px]:text-[clamp(32px,9vw,48px)]">
            <span className="text-[#1b1a17]">Join The</span><br/>
            <Deco text="INNER" /> <Deco text="CIRCLE" />
          </h2>
          <p className="m-0 mb-8 max-w-none text-[16px] leading-[1.6] text-[rgba(27,26,23,0.72)]">
            Get the inside track on new menu drops, exclusive events, game night specials, and more. One email, all the good stuff.
          </p>

          <form
            className="grid grid-cols-1 gap-[18px] w-full max-w-[696px] py-7 px-[26px] rounded-[18px] border-2 border-dotted border-[#f5ac53]"
            onSubmit={function(e){ e.preventDefault(); }}
            noValidate
          >
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="nl-name" className={labelCls}>Full Name</label>
              <input id="nl-name" className={inputCls} type="text" placeholder="Enter your name" autoComplete="name" required />
            </div>

            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="nl-email" className={labelCls}>Email Address</label>
              <input id="nl-email" className={inputCls} type="email" placeholder="you@example.com" autoComplete="email" required />
            </div>

            <label className="flex items-start gap-[10px] cursor-pointer text-[13px] leading-[1.45] text-[rgba(27,26,23,0.72)]">
              <input type="checkbox" className="mt-0.5 accent-[#f5ac53]" />
              I agree to receive marketing emails from Wildcard. Unsubscribe anytime.
            </label>

            <Btn text="Sign Up for the Newsletter" variant="yellow" type="submit" className="w-full justify-center" />
          </form>
        </div>

        <div
          className="aspect-[3/4] w-full max-w-[460px] justify-self-center rounded-none border-[6px] border-solid border-[#ed5a35] bg-[#bb95ba] bg-cover bg-center max-[861px]:hidden"
          style={{backgroundImage:"url('../assets/photography/hero-2.jpg')"}}
          aria-hidden="true"
        ></div>
      </div>
    </section>
  );
}
