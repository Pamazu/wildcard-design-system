import React from 'react';

import BrandIcon from '../../primitives/BrandIcon.jsx';
import './Connected.css';

/* Connected — "Stay Connected" section.
   LIGHT section sitting on the page's cream paper-grain bg — no
   wc-bgline wrapper. Per the canonical HTML pages-home.html:840-915
   the section is transparent with dark ink text. Heading carries a
   single `.connected-stars` row above; below: sub-text, social row,
   RED `@VISITWILDCARD` pill, and a YELLOW photo strip
   (`.photo-strip.photo-strip--yellow` variant per
   photo-frames.html:361-371) with 6 square 1:1 photos. */
export default function Connected() {
  // #102 — duplicate the 6 canonical photos to 12 total so the strip
  // overflows the viewport on BOTH sides (with the .connected > .photo-strip
  // bleed pattern in pages-home.css). Caller: "stay connected photo strips,
  // they are not going beyond the edge at either side. That's what they
  // should do." Mirrors HTML pages-home.html #61 (12 photos in the strip).
  const stripBase = [
    '../assets/photography/hero-1.jpg',
    '../assets/photography/hero-2.jpg',
    '../assets/photography/hero-3.jpg',
    '../assets/photography/hero-4.jpg',
    '../assets/photography/hero-5.jpg',
    '../assets/photography/hero-6.jpg',
  ];
  const stripPhotos = [...stripBase, ...stripBase];
  return (
    <section className="connected" aria-label="Stay Connected">
      <div className="connected-inner">
        <div className="connected-head">
          <span className="connected-star" aria-hidden="true"><BrandIcon id="star" /></span>
          <h2>Stay Connected</h2>
          <span className="connected-star" aria-hidden="true"><BrandIcon id="star" /></span>
        </div>
        <p className="connected-sub">Menus, moments, and memories. Catch the latest from our locations. If it's happening, it's here.</p>

        <div className="social-row">
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.17a8.16 8.16 0 0 0 4.77 1.52V7.24a4.85 4.85 0 0 1-1.01-.55z"/>
            </svg>
          </a>
        </div>

      </div>

      {/* Canonical Photo Frame Treatment — YELLOW variant. Same
          component as the Hero's Food & Drink band, just with the
          yellow modifier per photo-frames.html:371. */}
      <section className="photo-strip photo-strip--yellow" aria-hidden="true">
        {stripPhotos.map((src, i) => (
          <div key={i} className="photo" style={{backgroundImage: `url('${src}')`}} />
        ))}
      </section>

      {/* @VISITWILDCARD pill sits BELOW the photo strip on cream, per the
          reference order: heading -> sub -> social -> strip -> pill. */}
      <div className="connected-tag-row">
        <a className="social-tag" href="#" aria-label="Follow @visitwildcard">@VISITWILDCARD</a>
      </div>
    </section>
  );
}
