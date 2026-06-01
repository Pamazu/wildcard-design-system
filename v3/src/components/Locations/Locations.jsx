import React, { Fragment, useRef, useEffect } from 'react';

import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Locations.css';

/* Locations — three city cards (layout from
   wildcard-design-system/preview/components-location-card.html).
   PATTERN-PROOF (#36 rollout 4/6): section chrome + card DESIGN converted from
   semantic CSS (.locations- / .loc- / .card- selectors in pages-home.css) to Tailwind
   UTILITY classes so the edit-mode picker reads/applies them natively (Scope B).
   Parity MEASURED vs LIVE v1 (:8080/preview/pages-home.html .locations).
   CONTAINER-QUERY card: container-type:inline-size + cqw clamps scale with CARD
   width (not viewport) — clamps copy VERBATIM into arbitrary utilities and need
   NO viewport variants (the container query self-scales). NO Tailwind preflight.
   RESIDUAL (kept in pages-home.css, NOT converted):
     · .locations .card vars (--pad-x/--inset/--rule-gap/--gold/--gold-bright) +
       container-type — the container-query + decoration infrastructure.
     · the decorative .frame / .rule×6 / .ornament×4 (var-positioned, like the
       Games checker).
     · global .deco colors (LOCATIONS letters), shared with Hero.
   PRESERVED + FLAGGED (v3>v1, caller #2 completed): the ≤860 swipe CAROUSEL
   (.loc-grid flex/scroll-snap/peek + .loc-progress JS indicator). v1 has NO
   carousel (pure 3/2/1 grid); the carousel is the intentional v3 divergence —
   do NOT revert to v1's grid. The base .loc-grid (3-up desktop) is the utility
   `grid grid-cols-3 gap-6`; the ≤860 carousel residual overrides it. Tablet
   861-1180 col-count (v1 2-col vs v3 3-col) = design-qa's adjudication. */

function LocOrnamentClub() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <path d="M12 2.4a3.6 3.6 0 0 0-3.15 5.36A3.6 3.6 0 1 0 10.2 14.3L8.8 19.6h6.4L13.8 14.3a3.6 3.6 0 1 0 1.35-6.54A3.6 3.6 0 0 0 12 2.4z" fill="currentColor"/>
    </svg>
  );
}
function LocOrnamentStar() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <path d="M12 1 L13.6 10.4 L23 12 L13.6 13.6 L12 23 L10.4 13.6 L1 12 L10.4 10.4 Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
    </svg>
  );
}

function LocSocialsRow({ handle }) {
  return (
    <Fragment>
      <div className="socials flex gap-[18px] items-center">
        <a href="#" aria-label="Instagram" className="inline-flex w-[clamp(22px,4cqw,26px)] h-[clamp(22px,4cqw,26px)] text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full fill-current"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.78.3-1.45.71-2.12 1.39C1.34 2.69.93 3.36.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.78.71 1.45 1.39 2.12.67.67 1.34 1.08 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.78-.3 1.45-.71 2.12-1.39.67-.67 1.08-1.34 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.78-.71-1.45-1.39-2.12-.67-.67-1.34-1.08-2.12-1.39-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.41a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"/></svg></a>
        <a href="#" aria-label="Facebook" className="inline-flex w-[clamp(22px,4cqw,26px)] h-[clamp(22px,4cqw,26px)] text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full fill-current"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg></a>
        <a href="#" aria-label="TikTok" className="inline-flex w-[clamp(22px,4cqw,26px)] h-[clamp(22px,4cqw,26px)] text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full fill-current"><path d="M19.32 5.56a5.39 5.39 0 0 1-3.36-1.16 5.39 5.39 0 0 1-1.93-3.4h-3.4v14.04a3.06 3.06 0 0 1-3.07 3.07 3.06 3.06 0 0 1-3.07-3.07 3.06 3.06 0 0 1 3.07-3.07c.34 0 .66.06.97.16v-3.45a6.51 6.51 0 0 0-6.5 6.5 6.51 6.51 0 0 0 6.5 6.5 6.51 6.51 0 0 0 6.5-6.5V8.79a8.85 8.85 0 0 0 5.16 1.65V7c-.3 0-.59-.03-.87-.08v-1.36z"/></svg></a>
      </div>
      <div className="handle font-semibold text-[clamp(13px,2.4cqw,15px)] text-white tracking-[0.01em] mt-[-4px]">{handle}</div>
    </Fragment>
  );
}

function LocationCard({ city, description, btnText, badge, handle }) {
  return (
    <article className="card wc-grain relative rounded-[clamp(20px,3cqw,28px)] bg-[#0c0b09] text-white overflow-hidden isolate shadow-[0_18px_48px_rgba(0,0,0,0.20)] flex flex-col text-center">
      <div className="frame">
        <div className="rule h t"></div>
        <div className="rule h b"></div>
        <div className="rule v l"></div>
        <div className="rule v r"></div>
        <div className="ornament tl"><LocOrnamentClub /></div>
        <div className="ornament tr"><LocOrnamentStar /></div>
        <div className="ornament bl"><LocOrnamentStar /></div>
        <div className="ornament br"><LocOrnamentClub /></div>
      </div>
      <div className="body relative z-[3] flex-1 [padding:clamp(54px,9cqw,78px)_var(--pad-x)_clamp(36px,6cqw,54px)] flex flex-col items-center text-center gap-[clamp(12px,2.4cqw,18px)]">
        <h2 className="city [font-family:var(--font-display)] font-bold [font-stretch:125%] text-[clamp(30px,8cqw,50px)] tracking-[0.02em] uppercase leading-none m-0 text-[#c79f55]">{city}</h2>
        <div className="badge w-[clamp(160px,50cqw,240px)] aspect-square">
          <img src={badge} alt={`${city} city badge`} className="w-full h-full block object-contain [filter:drop-shadow(0_4px_14px_rgba(0,0,0,0.45))]" />
        </div>
        <p className="copy text-[clamp(13px,2.6cqw,16px)] font-normal leading-[1.55] max-w-[30ch] text-[rgba(255,255,255,0.94)] m-0 [text-wrap:pretty]">{description}</p>
        <LocSocialsRow handle={handle} />
        <Btn text={btnText} variant="yellow" size="btn-sm" className="mt-auto" />
      </div>
    </article>
  );
}

export default function Locations() {
  const locations = [
    {
      city: 'Chicago',
      description: 'Big-city energy, great food, strong drinks, and games that bring people together. Perfect for date nights, celebrations, and unforgettable nights out.',
      btnText: 'Reserve in Chicago',
      badge: 'assets/badges/chicago.png',
      handle: '@visitwildcardchicago',
    },
    {
      city: 'Tempe',
      description: 'Desert sunsets, easy walks, and a college-town buzz. Drop in for happy hour, stay for the shuffleboard and late-night snacks.',
      btnText: 'Reserve in Tempe',
      badge: 'assets/badges/tempe.png',
      handle: '@visitwildcardtempe',
    },
    {
      city: 'Tucson',
      description: "Old Pueblo charm meets neon nights. Mezcal, mariachi-inspired playlists, and the kind of evenings you tell stories about for years.",
      btnText: 'Reserve in Tucson',
      badge: 'assets/badges/tucson.png',
      handle: '@visitwildcardtucson',
    },
  ];

  const trackRef = useRef(null);
  const progressRef = useRef(null);

  // Carousel progress indicator (active only when .loc-grid is a horizontal
  // scroll-snap track — the responsive carousel at <=860px). A passive scroll
  // listener on the TRACK writes the fill position into a CSS custom property;
  // no per-frame React re-render. Outside the carousel breakpoint the track does
  // not scroll horizontally, so the handler is a no-op (maxScroll === 0).
  useEffect(() => {
    const track = trackRef.current;
    const prog = progressRef.current;
    if (!track || !prog) return;
    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const ratio = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
      prog.style.setProperty('--loc-progress', String(ratio));
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section className="locations bg-transparent text-center py-[120px] px-20 max-[861px]:py-20 max-[861px]:px-8 max-[481px]:py-16 max-[481px]:px-5" aria-label="Our Locations">
      <div className="locations-inner max-w-[1280px] mx-auto">
        <h2 className="[font-family:var(--font-display)] [font-stretch:125%] font-medium text-[clamp(48px,6vw,80px)] uppercase m-0 mb-3 leading-none">
          Our <Deco text="LOCATIONS" />
        </h2>
        <p className="locations-sub [font-family:var(--font-body)] font-medium text-[18px] text-[rgba(27,26,23,0.72)] m-0 mb-14">Choose your city and make your move.</p>

        <div className="loc-grid grid grid-cols-3 gap-6 max-[1181px]:grid-cols-2" ref={trackRef}>
          {locations.map((loc) => (
            <LocationCard key={loc.city} {...loc} />
          ))}
        </div>

        {/* Carousel progress indicator — orange fill on a grey track. Only visible
            at the ≤860 carousel breakpoint (residual in pages-home.css), driven by
            --loc-progress. */}
        <div className="loc-progress" ref={progressRef} aria-hidden="true">
          <span className="loc-progress__fill" />
        </div>
      </div>
    </section>
  );
}
