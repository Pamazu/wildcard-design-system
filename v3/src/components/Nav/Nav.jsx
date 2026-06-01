import React, { useState, useEffect, useRef, Fragment } from 'react';
import './Nav.css';

/* Nav — sticky top navigation.
   #36 ARCHITECTURAL ROLLOUT (component 1/6): rebuilt to use Tailwind UTILITY
   classes for the editable design surface (logo-pill / nav-pill / nav-item /
   dropdown / reserve / hamburger), so the v3 picker reads + applies real
   utilities natively. Semantic class hooks are KEPT (no styling) for behavior:
     - `.nav-item`     → dashed-underline `::after` + bg transition + `.chev` rotate
     - `.wc-dropdown`  → absolute position + open/close transition + shadow + state
     - `.wc-reserve`   → box-shadow + hover transition
     - `.wc-nav` / `.wc-nav-backdrop` → sticky shell + blur backdrop overlay
   Static props that became utilities are stripped from Nav.css so utilities win
   natively (project CSS is unlayered → would otherwise beat @layer utilities).
   Responsive uses +1 inclusive tokens (`max-[861px]:` ≡ v1 `max-width:860`,
   Tailwind v4 `max-[Npx]:` = `width < Npx`). Parity source: v1 components-nav.html.

   Behavior (unchanged): Locations dropdown opens on hover (small delay), closes on
   mouseleave; Esc + click-outside close; toggles body.nav-menu-open for the blur. */

// Shared nav-item styling (button + links). `.nav-item` hook drives ::after + transition + chev.
const navItemCls =
  'nav-item relative inline-flex items-center gap-1.5 px-[18px] py-2.5 h-11 rounded-full ' +
  '[font-family:var(--font-display)] [font-stretch:var(--display-stretch)] font-medium text-[14px] ' +
  'tracking-[0.06em] uppercase text-[#1b1a17] no-underline bg-transparent border-0 cursor-pointer';
const dropItemCls =
  'block py-3.5 px-[22px] text-center text-[#f9f0ed] no-underline [font-family:var(--font-display)] ' +
  '[font-stretch:var(--display-stretch)] font-medium text-[14px] tracking-[0.06em] uppercase rounded-[14px]';

export default function Nav() {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    if (!trigger || !dropdown) return;

    let openTimer = null;
    let closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      setIsOpen(true);
      document.body.classList.add('nav-menu-open');
    };
    const close = () => {
      setIsOpen(false);
      document.body.classList.remove('nav-menu-open');
    };

    const onTriggerEnter = () => {
      clearTimeout(closeTimer);
      openTimer = setTimeout(open, 60);
    };
    const onTriggerLeave = () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(close, 140);
    };
    const onDropEnter = () => clearTimeout(closeTimer);
    const onDropLeave = () => { closeTimer = setTimeout(close, 140); };

    const onClick = (e) => {
      e.preventDefault();
      if (dropdown.classList.contains('is-open')) close(); else open();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onDocClick = (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) close();
    };

    trigger.addEventListener('mouseenter', onTriggerEnter);
    trigger.addEventListener('mouseleave', onTriggerLeave);
    dropdown.addEventListener('mouseenter', onDropEnter);
    dropdown.addEventListener('mouseleave', onDropLeave);
    trigger.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      trigger.removeEventListener('mouseenter', onTriggerEnter);
      trigger.removeEventListener('mouseleave', onTriggerLeave);
      dropdown.removeEventListener('mouseenter', onDropEnter);
      dropdown.removeEventListener('mouseleave', onDropLeave);
      trigger.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
      document.body.classList.remove('nav-menu-open');
    };
  }, []);

  return (
    <Fragment>
      <div className="wc-nav-backdrop" aria-hidden="true"></div>
      <nav className="wc-nav" aria-label="Primary">
        <div className="wc-nav-inner flex items-center gap-3.5 px-4 w-full max-w-[1400px] justify-between">
          <a
            className="wc-logo-pill inline-flex items-center gap-3.5 bg-[#1b1a17] text-[#f9f0ed] rounded-full px-7 py-3 h-14 no-underline"
            href="#"
            aria-label="Wildcard home"
          >
            <img className="wc-logo-svg wc-logo-full h-[22px] w-auto block" src="../assets/logos/wc-primary-light.svg" alt="Wildcard" />
            <img className="wc-logo-svg wc-logo-tag h-[22px] w-auto block" src="../assets/logos/wc-primary-tagline-light.svg" alt="Wildcard" />
          </a>
          <div className="wc-nav-pill relative inline-flex items-center gap-1.5 bg-[#f5e5e0] rounded-full px-2.5 py-1.5 h-14 max-[861px]:hidden" role="menubar">
            <button
              ref={triggerRef}
              className={`${navItemCls}${isOpen ? ' is-open' : ''}`}
              data-has-menu="locations"
              type="button"
              aria-haspopup="true"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              Locations
              <svg className="chev" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1.5 L6 6.5 L11 1.5"/></svg>
              <div
                ref={dropdownRef}
                id="loc-dropdown"
                className={`wc-dropdown flex-col min-w-[220px] bg-[#1b1a17] text-[#f9f0ed] rounded-[22px] py-[18px] px-3.5 gap-1${isOpen ? ' is-open' : ''}`}
                role="menu"
              >
                <a href="#" role="menuitem" className={dropItemCls}>Chicago</a>
                <a href="#" role="menuitem" className={dropItemCls}>Tempe</a>
                <a href="#" role="menuitem" className={dropItemCls}>Tucson</a>
              </div>
            </button>
            <a className={navItemCls} href="#">Menu</a>
            <a className={navItemCls} href="#">About</a>
            <a className={navItemCls} href="#">Events</a>
            <a className={navItemCls} href="#">Contact</a>
          </div>
          <button className="wc-reserve inline-flex items-center gap-2 px-6 py-4 h-14 rounded-[60px] border-0 bg-[#f5ac53] text-[#1b1a17] [font-family:var(--font-body)] font-bold text-[18px] leading-6 tracking-normal uppercase cursor-pointer max-[861px]:hidden" type="button">Reserve for Chicago</button>
          <button
            className="wc-hamburger hidden max-[861px]:inline-flex flex-col justify-center items-center gap-1.5 w-14 h-14 rounded-full bg-[#f5e5e0] border-0 cursor-pointer transition-colors hover:bg-[rgba(27,26,23,0.10)]"
            aria-label="Open menu"
            type="button"
          >
            <span className="block w-[26px] h-[2.5px] bg-[#1b1a17] rounded-[2px]"></span>
            <span className="block w-[26px] h-[2.5px] bg-[#1b1a17] rounded-[2px]"></span>
            <span className="block w-[26px] h-[2.5px] bg-[#1b1a17] rounded-[2px]"></span>
          </button>
        </div>
      </nav>
    </Fragment>
  );
}
