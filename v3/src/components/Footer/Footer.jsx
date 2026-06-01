import React from 'react';

import BglineWave from '../../primitives/BglineWave/BglineWave.jsx';
import BrandIcon from '../../primitives/BrandIcon.jsx';
import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Footer.css';

/* Footer — site footer with bgline wave (flipped).
   Re-synced 1:1 from the canonical `preview/components-footer.html`
   (lines 2645-2783). All copy, link lists, image paths and class
   names match the canonical exactly so future dashboard edits land
   in both rendered surfaces. */
export default function Footer() {
  const iconStrip = ['heart','martini','flute','diamond','wine','meeple','beer','star','spade','martini','diamond','heart','flute','wine','meeple','spade','star','beer','martini','heart'];

  return (
    <footer className="footer wc-bgline wc-bgline--flip" aria-label="Footer">
      <div className="wc-bgline__ink wc-grain" aria-hidden="true"></div>
      <BglineWave />

      {/* Footer hero — YOUR TABLE IS / WAITING headline + strap +
          body p + red Reserve CTA. */}
      <div className="footer-hero">
        <h2>
          <span className="line">YOUR TABLE IS</span>
          <span className="line"><Deco text="WAITING" /></span>
        </h2>
        <p className="strap">Bold Drinks, Good Food, and Just Enough Chaos to Make It Memorable.</p>
        <p>Some nights call for staying in. This is not one of them. Reserve your table and settle in for drinks, dinner, and a little friendly competition.</p>
        <Btn text="Reserve in [Location]" variant="red" />
      </div>

      <div className="footer-icons" aria-hidden="true">
        {iconStrip.map((id, i) => (
          <span key={i} className="tile"><BrandIcon id={id} /></span>
        ))}
      </div>

      <div className="footer-foot">
        <div className="footer-brand">
          <img src="../assets/logos/wc-primary-tagline-light.svg" alt="Wildcard — dine drink play" />
          <p className="strap2">Good food. Strong drinks. Wild nights.</p>
          <Btn text="Reserve in [Location]" variant="red" />
          <div className="meta">
            <span>Copyright &copy;2026 WILDCARD. Not for use without permission.</span>
            <span>Built and Managed by VisualFizz</span>
          </div>
        </div>

        <nav className="footer-links-group" aria-label="Site links">
          <div className="footer-links" aria-label="Discover">
            <h4>Discover</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Game Library</a></li>
              <li><a href="#">Gift Cards</a></li>
              <li><a href="#">Shop</a></li>
            </ul>
          </div>
          <div className="footer-links" aria-label="Locations">
            <h4>Locations</h4>
            <ul>
              <li><a href="#">Wildcard Chicago</a></li>
              <li><a href="#">Wildcard Tempe</a></li>
              <li><a href="#">Wildcard Tucson</a></li>
            </ul>
          </div>
        </nav>

        <div className="footer-margarita" aria-hidden="true">
          <img src="../assets/photography/margarita-illustration.jpg" alt="" loading="lazy" />
        </div>
      </div>
    </footer>
  );
}
