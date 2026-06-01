import React from 'react';

import Btn from '../../primitives/Btn/Btn.jsx';
import './FoodDrink.css';

/* FoodDrink — Re-synced to HTML canonical `pages-home.html` structure.
   Renders as `<section class="hero-fd">` so the page-level CSS in
   `pages-home.css` (margin-top: -514px, width: 100vw) properly overlaps
   it with the Hero section above. Architecture matches HTML byte-for-byte
   so pixel-diff vs HTML pages-home converges (per task #55).

   Structure:
     - `.hero-fd` outer section (was `.fd-stage`)
     - `.photos` strip of 6 photos (was `.fd-photos`)
     - `.card` floating scallop with inline SVG shape (was `.fd-card`)
     - `.fd-title-row` with two `.badge` X-shape SVGs flanking the
       `Food & Drink` h2 (inline path — NOT the `#i-star` sprite)
     - body p, red `[Location] Menu` CTA */
export default function FoodDrink() {
  // 8 photos: sequential hero-1..hero-6, then hero-1 + hero-2 repeated.
  // The duplicated tail makes the photo strip overflow the viewport
  // gracefully — last 2 tiles spill past the right edge so the eye
  // perceives a continuous edge-to-edge band (matches HTML canonical
  // image #68; same array as `pages-home.html .hero-fd .photos`).
  const photos = [
    '../assets/photography/hero-1.jpg',
    '../assets/photography/hero-2.jpg',
    '../assets/photography/hero-3.jpg',
    '../assets/photography/hero-4.jpg',
    '../assets/photography/hero-5.jpg',
    '../assets/photography/hero-6.jpg',
    '../assets/photography/hero-1.jpg',
    '../assets/photography/hero-2.jpg',
  ];

  // Inline X-shape badge SVG, used on both sides of the title.
  const xBadge = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2h2v6.6l4.7-4.7 1.4 1.4-4.7 4.7H21v2h-6.6l4.7 4.7-1.4 1.4-4.7-4.7V21h-2v-6.6l-4.7 4.7-1.4-1.4 4.7-4.7H3v-2h6.6L4.9 6.7l1.4-1.4L11 10z"/>
    </svg>
  );

  return (
    <section className="hero-fd" aria-labelledby="fd-title">
      <div className="photos" aria-hidden="true">
        {photos.map((src, i) => (
          <div key={i} className="photo" style={{backgroundImage: `url('${src}')`}} />
        ))}
      </div>

      <div className="card">
        <svg className="scallop" viewBox="-12 -42 724 544" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path fill="#fdf3f1"
                d="M 0 0
                   a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0
                   a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0
                   a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0  a 39 39 0 0 1 78 0
                   L 700 460
                   a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0
                   a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0
                   a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0  a 39 39 0 0 1 -78 0
                   Z"/>
        </svg>

        <div className="inner">
          <div className="fd-title-row">
            <span className="badge" aria-hidden="true">{xBadge}</span>
            <h2 id="fd-title">Food &amp; Drink</h2>
            <span className="badge" aria-hidden="true">{xBadge}</span>
          </div>
          <p>From espresso to espresso martinis, our menu is designed for passing plates, sharing bites, settling in, and turning one round into dinner.</p>
          <Btn text="[Location] Menu" variant="red" />
        </div>
      </div>
    </section>
  );
}
