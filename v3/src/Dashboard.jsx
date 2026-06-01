import { useState, useEffect, useMemo, useRef } from 'react';
import './Dashboard.css';
import { TwDeviceTabs, TwSections, buildStableSelector, TW_DEVICES, injectArbStylesheet, isTwUtil } from './twPicker.jsx';

/* Dashboard — v2 component browser. Feature-parity with HTML dashboard
 * at localhost:8080. Sidebar TREE structure mirrors HTML dashboard's TREE
 * (Foundations / UI Elements / Components / Modules / Pages / Brand).
 *
 * Routing:
 *   - v2-mapped entries (Hero, Footer, etc.) → iframe loads localhost:5173/?component=<Name>
 *   - HTML-only entries (color tokens, type, etc.) → iframe loads localhost:8080/preview/<file>.html
 *
 * Activated via `?dashboard=1` URL param (routed by App.jsx).
 *
 * Persists: status (new/looks-good/needs-work) + comment per item, active selection.
 */

const HTML_SERVER = 'http://localhost:8080';
const V2_HOST     = '';  // same-origin

// TREE — mirrors /Users/j/j-workspace/wildcard-design-system/index.html TREE
// `v2`: component name to mount via ?component=<v2>. Null = HTML-only entry.
const TREE = [
  { cat: 'Foundations', children: [
    { sub: 'Type', items: [
      { label: 'Body Type',                  htmlSrc: '/preview/type-body.html',       id: 'type-body',                v2: null },
      { label: 'Decorative Type Treatment',  htmlSrc: '/preview/type-decorative.html', id: 'type-decorative',          v2: null },
      { label: 'Display Type',               htmlSrc: '/preview/type-display.html',    id: 'type-display',             v2: null },
    ]},
    { sub: 'Colors', items: [
      { label: 'Brand Accents',              htmlSrc: '/preview/colors-accents.html',           id: 'colors-accents',          v2: null },
      { label: 'Canonical Color Sequence',   htmlSrc: '/preview/colors-canonical-order.html',   id: 'colors-canonical-order',  v2: null },
      { label: 'Color Foundations',          htmlSrc: '/preview/colors-foundations.html',       id: 'colors-foundations',      v2: null },
      { label: 'Semantic Color Tokens',      htmlSrc: '/preview/colors-semantic.html',          id: 'colors-semantic',         v2: null },
    ]},
    { sub: 'Spacing', items: [
      { label: 'Corner Radii',  htmlSrc: '/preview/radii.html',    id: 'radii',    v2: null },
      { label: 'Shadow Tokens', htmlSrc: '/preview/shadows.html',  id: 'shadows',  v2: null },
      { label: 'Spacing Scale', htmlSrc: '/preview/spacing.html',  id: 'spacing',  v2: null },
    ]},
  ]},
  { cat: 'UI Elements', children: [
    { label: 'Buttons',     htmlSrc: '/preview/components-buttons.html', id: 'buttons',     v2: 'Btn' },
    { label: 'Form Inputs', htmlSrc: '/preview/components-form.html',    id: 'form-inputs', v2: 'Newsletter' /* form lives inside Newsletter section in v2 */ },
  ]},
  { cat: 'Components', children: [
    { label: 'Location Card',          htmlSrc: '/preview/components-location-card.html', id: 'location-card',  v2: 'Locations' },
    { label: 'Food & Drink Card',      htmlSrc: '/preview/components-food-drink.html',    id: 'food-drink-card', v2: 'FoodDrink' },
    { label: 'Top Navigation',         htmlSrc: '/preview/components-nav.html',           id: 'top-nav',        v2: 'Nav' },
    { label: 'Photo Frame Treatments', htmlSrc: '/preview/photo-frames.html',             id: 'photo-frames',   v2: null },
    { label: 'Paper Grain Texture',    htmlSrc: '/preview/components-paper-grain.html',   id: 'paper-grain',    v2: null },
  ]},
  { cat: 'Modules', children: [
    { label: 'Hero',                          htmlSrc: '/preview/components-hero.html',           id: 'hero',           v2: 'Hero' },
    { label: 'Footer',                        htmlSrc: '/preview/components-footer.html',         id: 'footer',         v2: 'Footer' },
    { label: 'Fun Experience Testimonials',   htmlSrc: '/preview/components-fun-experience.html', id: 'fun-experience', v2: 'Testimonials' },
    { label: 'Module A — Games',              htmlSrc: '/preview/components-module-a.html',       id: 'module-a',       v2: 'Games' },
    { label: 'Hero / Footer Background',      htmlSrc: '/Hero-Footer Background.html',            id: 'hero-footer-bg', v2: 'BglineWave' },
  ]},
  { cat: 'Pages', children: [
    { label: 'Home', htmlSrc: '/preview/pages-home.html', id: 'page-home', v2: '__HOMEPAGE__' /* sentinel: load full v2 HomePage */ },
  ]},
  { cat: 'Brand', children: [
    { label: 'Brand Icon Set',             htmlSrc: '/preview/icons-brand.html',              id: 'icons-brand',              v2: null },
    { label: 'Brand Patterns',             htmlSrc: '/preview/patterns.html',                 id: 'patterns',                 v2: null },
    { label: 'City Badges',                htmlSrc: '/preview/badges-city.html',              id: 'city-badges',              v2: null },
    { label: 'Logo · Badges & Marks',      htmlSrc: '/preview/logos-marks.html',              id: 'logos-marks',              v2: null },
    { label: 'Logo · Primary & Secondary', htmlSrc: '/preview/logos-primary-secondary.html',  id: 'logos-primary-secondary',  v2: null },
  ]},
];

/* Flatten TREE to a list of items with their parent context for counting. */
function flattenItems(tree) {
  const out = [];
  for (const cat of tree) {
    for (const child of cat.children) {
      if (child.items) {
        for (const item of child.items) out.push({ ...item, cat: cat.cat, sub: child.sub });
      } else {
        out.push({ ...child, cat: cat.cat });
      }
    }
  }
  return out;
}

const ALL_ITEMS = flattenItems(TREE);
const TOTAL_COUNT = ALL_ITEMS.length;  // 28

/* Resolve an item's iframe URL.
 * Prefer v2 mount when item has a v2 mapping; otherwise the HTML preview. */
function resolveSrc(item, mode) {
  if (mode === 'html' || !item.v2) {
    return HTML_SERVER + item.htmlSrc;
  }
  // ?home=1 (not bare '/') so the homepage preview hits App's HomePage hatch
  // instead of the PROD Dashboard default — prevents dashboard-in-dashboard recursion (#82).
  if (item.v2 === '__HOMEPAGE__') return V2_HOST + '/?home=1';
  return V2_HOST + '/?component=' + item.v2;
}

const STATUS_OPTIONS = ['new', 'looks-good', 'needs-work'];

/* ─────────────────────────────────────────────────────────────────────────
 * Edit-Tool persistence helpers (#80)
 *
 * `buildIframeSelector(el)` — given a DOM node inside the preview iframe,
 * walk ancestors and emit the shortest selector that uniquely identifies
 * that node within the iframe document. Used as the key into
 * `dashboard-edits.css` so the same element keeps the same rule across
 * sessions.
 *
 * `schedulePersist(selector, prop, value)` — debounce + POST the change
 * to the Vite dev plugin at `/__edit-save`. The plugin merges the rule
 * into `src/styles/dashboard-edits.css`; Vite HMR then re-imports that
 * file in every open client so homepage + standalone previews both
 * receive the change live. Debounce window keeps slider-drags from
 * spamming the dev server.
 * ───────────────────────────────────────────────────────────────────────── */
function buildIframeSelector(el) {
  if (!el || el.nodeType !== 1) return null;
  const doc = el.ownerDocument;
  if (!doc) return null;
  // Climb until we hit the document root, building selector parts.
  const parts = [];
  let cur = el;
  let depth = 0;
  while (cur && cur.nodeType === 1 && cur !== doc.body && cur !== doc.documentElement && depth < 6) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) {
      part = '#' + cur.id;
      parts.unshift(part);
      break; // id is unique enough
    }
    // Prefer classes over raw tag — they're more semantic + stable.
    const cls = (cur.className && typeof cur.className === 'string'
      ? cur.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wc-dash-') && !c.startsWith('__'))
      : []);
    if (cls.length) part = '.' + cls.join('.');
    parts.unshift(part);
    // Test uniqueness within the document so far.
    try {
      const probe = parts.join(' ');
      const matches = doc.querySelectorAll(probe);
      if (matches.length === 1) return probe;
    } catch (_) { /* invalid intermediate selector — keep climbing */ }
    cur = cur.parentElement;
    depth++;
  }
  return parts.length ? parts.join(' ') : null;
}

/* Per-(selector, property) debouncer. Multiple rapid changes to the same
 * pair coalesce into a single POST after `EDIT_PERSIST_DEBOUNCE_MS`. */
const EDIT_PERSIST_DEBOUNCE_MS = 400;
const _persistTimers = new Map();      // key: `${selector}::${prop}` → timeoutId
function schedulePersist(selector, prop, value) {
  const key = `${selector}::${prop}`;
  const prior = _persistTimers.get(key);
  if (prior) clearTimeout(prior);
  const t = setTimeout(() => {
    _persistTimers.delete(key);
    persistEdit(selector, prop, value);
  }, EDIT_PERSIST_DEBOUNCE_MS);
  _persistTimers.set(key, t);
}

async function persistEdit(selector, prop, value) {
  try {
    const r = await fetch(V2_HOST + '/__edit-save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ selector, property: prop, value }),
    });
    if (!r.ok) console.warn('[edit-persist] failed', r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.warn('[edit-persist] network error', e);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * TWEAKS — per-component metadata. Each component declares its tweakable
 * properties. The Tweaks panel renders controls for the active component.
 *
 * Tweak schema:
 *   { key, label, type: 'slider'|'toggle'|'select', target, prop,
 *     min?, max?, step?, unit?, default?, options? }
 *
 * `target` = CSS selector applied inside the iframe document.
 * `prop`   = CSS property to set.
 * The panel injects a <style id="wc-tweaks-style"> tag into the iframe with
 * one rule per tweak: `{target} { {prop}: {value}{unit}; }`.
 *
 * Per #62: section-gap, two-col-gap, two-col-fill-direction are universal
 * helpers that auto-apply on any section that has a `.X-inner` 2-column
 * grid/flex layout.
 * ───────────────────────────────────────────────────────────────────────── */
const TWEAK_SCHEMA = {
  // Sections — all get a section-bottom-gap tweak (controls padding-bottom)
  // and the 2-col tweaks where applicable.
  Hero: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.hero',       prop: 'padding-bottom',   min: 0, max: 600, step: 8, unit: 'px', default: 296 },
    { key: 'heroPadTop',   label: 'Hero padding-top',       type: 'slider', target: '.hero',       prop: 'padding-top',      min: 0, max: 400, step: 8, unit: 'px', default: 170 },
  ],
  FoodDrink: [
    { key: 'fdOverlap',    label: 'F&D overlap into Hero',  type: 'slider', target: '.hero-fd',    prop: 'margin-top',       min: -800, max: 0, step: 8, unit: 'px', default: -514 },
    { key: 'fdCardWidth',  label: 'Card width',             type: 'slider', target: '.hero-fd .card', prop: 'width',         min: 320, max: 800, step: 8, unit: 'px', default: 508 },
  ],
  Games: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.games-wrap', prop: 'padding-bottom',   min: 0, max: 200, step: 4, unit: 'px', default: 80 },
    { key: 'sectionGapTop',label: 'Section top gap',        type: 'slider', target: '.games-wrap', prop: 'padding-top',      min: 0, max: 200, step: 4, unit: 'px', default: 120 },
  ],
  Locations: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.locations',  prop: 'padding-bottom',   min: 0, max: 200, step: 4, unit: 'px', default: 96 },
    { key: 'gridGap',      label: 'Card grid gap',          type: 'slider', target: '.loc-grid',   prop: 'gap',              min: 0, max: 60,  step: 2, unit: 'px', default: 22 },
  ],
  Events: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.events',         prop: 'padding-bottom', min: 0, max: 200, step: 4, unit: 'px', default: 96 },
    { key: 'colGap',       label: 'Two-column gap',         type: 'slider', target: '.events-inner',   prop: 'gap',            min: 0, max: 120, step: 4, unit: 'px', default: 60 },
    /* Fill-direction: use 2fr/1fr ratios instead of 1fr/auto.
       `auto` tracks collapse to ~4px when their child is a background-image
       div (no intrinsic content width to size from) — visually one column
       disappears. 2fr/1fr keeps both columns visible while still absorbing
       the freed/added space asymmetrically per caller's intent. */
    { key: 'colFill',      label: 'Fill direction',         type: 'select', target: '.events-inner',   prop: 'grid-template-columns',
      options: [
        { label: 'Copy fills',   value: '2fr 1fr' },
        { label: 'Photo fills',  value: '1fr 2fr' },
        { label: 'Equal',        value: '1fr 1fr' },
      ], default: '1fr 1fr',
    },
  ],
  Testimonials: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.testimonials', prop: 'padding-bottom', min: 0, max: 200, step: 4, unit: 'px', default: 80 },
  ],
  Connected: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.connected',  prop: 'padding-bottom',   min: 0, max: 200, step: 4, unit: 'px', default: 24 },
  ],
  Newsletter: [
    { key: 'sectionGap',   label: 'Section bottom gap',     type: 'slider', target: '.newsletter',     prop: 'padding-bottom', min: 0, max: 200, step: 4, unit: 'px', default: 96 },
    { key: 'colGap',       label: 'Two-column gap',         type: 'slider', target: '.newsletter-inner', prop: 'gap',          min: 0, max: 120, step: 4, unit: 'px', default: 60 },
    /* Fill-direction: 2fr/1fr per sub-agent #66 finding (1fr/auto collapses
       background-image columns to ~4px). */
    { key: 'colFill',      label: 'Fill direction',         type: 'select', target: '.newsletter-inner', prop: 'grid-template-columns',
      options: [
        { label: 'Copy fills',  value: '2fr 1fr' },
        { label: 'Form fills',  value: '1fr 2fr' },
        { label: 'Equal',       value: '1fr 1fr' },
      ], default: '1fr 1fr',
    },
  ],
  Footer: [
    { key: 'sectionPadTop',label: 'Footer top padding',     type: 'slider', target: '.footer',     prop: 'padding-top',      min: 0, max: 200, step: 4, unit: 'px', default: 80 },
    { key: 'sectionPadBot',label: 'Footer bottom padding',  type: 'slider', target: '.footer',     prop: 'padding-bottom',   min: 0, max: 100, step: 4, unit: 'px', default: 40 },
  ],
  Nav: [
    { key: 'navTopOffset', label: 'Top offset',             type: 'slider', target: '.wc-nav',     prop: 'top',              min: 0, max: 60,  step: 2, unit: 'px', default: 16 },
  ],
  // Primitives — minimal
  Btn:        [{ key: 'btnRadius', label: 'Radius', type: 'slider', target: '.btn', prop: 'border-radius', min: 0, max: 40, step: 2, unit: 'px', default: 999 }],
  Deco:       [],
  BglineWave: [],
  // HomePage sentinel (shows on page-home item) — exposes per-section tweaks
  // that would otherwise be dormant (Events/Newsletter aren't in the sidebar
  // tree as standalone items, so their col-gap/col-fill tweaks couldn't be
  // reached otherwise).
  __HOMEPAGE__: [
    // Hero / F&D / Games — section positioning
    { key: 'sectionGap',     label: 'Hero bottom padding',          type: 'slider', target: '.hero',             prop: 'padding-bottom',        min: 0, max: 600, step: 8, unit: 'px', default: 296 },
    { key: 'fdOverlap',      label: 'F&D overlap into Hero',         type: 'slider', target: '.hero-fd',          prop: 'margin-top',            min: -800, max: 0, step: 8, unit: 'px', default: -514 },
    { key: 'gamesGapTop',    label: 'Games top gap',                type: 'slider', target: '.games-wrap',       prop: 'padding-top',           min: 0, max: 200, step: 4, unit: 'px', default: 120 },
    { key: 'gamesGapBottom', label: 'Games bottom gap',             type: 'slider', target: '.games-wrap',       prop: 'padding-bottom',        min: 0, max: 200, step: 4, unit: 'px', default: 80 },
    // Events 2-col (caller's #62 — per-section col-gap + fill-direction)
    { key: 'eventsColGap',   label: 'Events: two-column gap',       type: 'slider', target: '.events-inner',     prop: 'gap',                   min: 0, max: 200, step: 4, unit: 'px', default: 60 },
    { key: 'eventsColFill',  label: 'Events: fill direction',       type: 'select', target: '.events-inner',     prop: 'grid-template-columns',
      options: [
        { label: 'Copy fills',  value: '2fr 1fr' },
        { label: 'Photo fills', value: '1fr 2fr' },
        { label: 'Equal',       value: '1fr 1fr' },
      ], default: '1fr 1fr',
    },
    // Newsletter 2-col
    { key: 'nlColGap',       label: 'Newsletter: two-column gap',   type: 'slider', target: '.newsletter-inner', prop: 'gap',                   min: 0, max: 200, step: 4, unit: 'px', default: 60 },
    { key: 'nlColFill',      label: 'Newsletter: fill direction',   type: 'select', target: '.newsletter-inner', prop: 'grid-template-columns',
      options: [
        { label: 'Copy fills', value: '2fr 1fr' },
        { label: 'Form fills', value: '1fr 2fr' },
        { label: 'Equal',      value: '1fr 1fr' },
      ], default: '1fr 1fr',
    },
    // Connected + Newsletter + Footer section padding
    { key: 'connectedGap',   label: 'Connected bottom padding',     type: 'slider', target: '.connected',        prop: 'padding-bottom',        min: 0, max: 200, step: 4, unit: 'px', default: 24 },
    { key: 'newsletterGap',  label: 'Newsletter bottom padding',    type: 'slider', target: '.newsletter',       prop: 'padding-bottom',        min: 0, max: 200, step: 4, unit: 'px', default: 96 },
  ],
};

function getTweakSchema(item) {
  if (item.v2 === '__HOMEPAGE__') return TWEAK_SCHEMA.__HOMEPAGE__ || [];
  return TWEAK_SCHEMA[item.v2] || [];
}

export default function Dashboard() {
  // Persisted status per item-id: { status: 'new'|'looks-good'|'needs-work', comment?: string }
  const [statusMap, setStatusMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc-v2-ds-status') || '{}'); } catch(_) { return {}; }
  });
  const [activeId, setActiveId] = useState(() => localStorage.getItem('wc-v2-ds-active') || 'page-home');
  const [mode, setMode] = useState(() => localStorage.getItem('wc-v2-ds-mode') || 'v2');  // 'v2' or 'html'
  const [tweaksOpen, setTweaksOpen] = useState(false);
  // tweaksValues[item.id] = { [key]: value, ... }
  const [tweaksValues, setTweaksValues] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc-v2-ds-tweaks') || '{}'); } catch(_) { return {}; }
  });
  const [commentMode, setCommentMode] = useState(false);
  // commentsMap[item.id] = [{ id, x, y, w, h, text }]
  const [commentsMap, setCommentsMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc-v2-ds-comments') || '{}'); } catch(_) { return {}; }
  });
  // Currently-editing comment id (null = none)
  const [editingCommentId, setEditingCommentId] = useState(null);
  // Edit mode — DOM-level CSS editing on iframe elements
  const [editMode, setEditMode] = useState(false);
  // Selected element rect (in iframe coords). null = nothing selected.
  // We store the React-tracked rect + a token for the panel; the DOM ref lives in a ref.
  const [editSel, setEditSel] = useState(null);     // { rect, tag, token }
  const [editHover, setEditHover] = useState(null); // { rect, tag }
  const editSelRef    = useRef(null);  // DOM element currently selected
  const editInlineRef = useRef(null);  // DOM element currently inline-editing
  // Drag-drop: sidebar component → iframe insertion point
  const dndDragSrcRef = useRef(null);  // { id, label, v2 } of item currently being dragged
  // Inspect & Replace mode
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectHover, setInspectHover] = useState(null);  // { rect, path }
  const [inspectSel,   setInspectSel]   = useState(null);  // { rect, path, token } — opens replace dialog
  const [replacePick,  setReplacePick]  = useState('');    // selected component id from dropdown
  const inspectSelRef = useRef(null);
  const iframeRef     = useRef(null);

  useEffect(() => { localStorage.setItem('wc-v2-ds-status',   JSON.stringify(statusMap)); },     [statusMap]);
  useEffect(() => { localStorage.setItem('wc-v2-ds-active',   activeId); },                       [activeId]);
  useEffect(() => { localStorage.setItem('wc-v2-ds-mode',     mode); },                           [mode]);
  useEffect(() => { localStorage.setItem('wc-v2-ds-tweaks',   JSON.stringify(tweaksValues)); },   [tweaksValues]);
  useEffect(() => { localStorage.setItem('wc-v2-ds-comments', JSON.stringify(commentsMap)); },    [commentsMap]);

  // ── v3 Tailwind token-picker: persisted element→className map ──────────
  const [twClassMap, setTwClassMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc-v3-ds-twclasses') || '{}'); } catch (_) { return {}; }
  });
  useEffect(() => { localStorage.setItem('wc-v3-ds-twclasses', JSON.stringify(twClassMap)); }, [twClassMap]);

  // Esc exits commentMode
  useEffect(() => {
    if (!commentMode) return;
    const onKey = (e) => { if (e.key === 'Escape') { setCommentMode(false); setEditingCommentId(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commentMode]);

  const active = ALL_ITEMS.find(it => it.id === activeId) || ALL_ITEMS[0];
  // Stable iframeSrc — only regenerate when active item OR mode changes.
  // Previously included Date.now() on every render, which caused the iframe
  // to remount constantly (killing Edit/Comment-mode bindings on every state
  // tick). Cache-bust via a token bumped only on active/mode change.
  const iframeSrc = useMemo(() => {
    const base = resolveSrc(active, mode);
    return base + (base.includes('?') ? '&' : '?') + 't=' + Date.now();
  }, [activeId, mode]);

  // Re-apply persisted Tailwind-class edits to the iframe on (re)load + map change.
  // Same-origin (v3 mode) → direct contentDocument access. Keyed on iframeSrc so
  // the listener re-binds when the iframe remounts (key={iframeSrc}).
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const entries = Object.entries(twClassMap);
    let timer = null;
    // Arbitrary tokens (base-[value]) can't be JIT/safelist-generated, so the
    // shared injectArbStylesheet (twPicker) builds a per-element, media-queried
    // !important preview sheet from the persisted classNames. The className stays
    // the source-of-truth string; this CSS only RENDERS the preview.
    // The iframe hosts a React app that mounts AFTER its `load` event fires, so a
    // one-shot apply races ahead of the tracked elements existing. Poll a bounded
    // window — re-applying only when an element's className has DIVERGED — until
    // every tracked selector resolves to exactly one node, then stop. Divergence
    // guard avoids churn + observer-style loops; bounded attempts avoid leaks.
    const applyAll = () => {
      let doc; try { doc = iframe.contentDocument; } catch (_) { return false; }
      if (!doc) return false;
      injectArbStylesheet(doc, entries);
      let allMatched = true;
      entries.forEach(([sel, cls]) => {
        let nodes; try { nodes = doc.querySelectorAll(sel); } catch (_) { allMatched = false; return; }
        if (nodes.length === 1) { if (nodes[0].className !== cls) nodes[0].className = cls; }
        else allMatched = false;
      });
      return allMatched;
    };
    const startPoll = () => {
      if (timer) clearInterval(timer);
      let attempts = 0;
      const tick = () => { if (applyAll() || ++attempts > 20) { clearInterval(timer); timer = null; } };
      timer = setInterval(tick, 120);
      tick();
    };
    iframe.addEventListener('load', startPoll);
    startPoll();
    return () => { if (timer) clearInterval(timer); iframe.removeEventListener('load', startPoll); };
  }, [twClassMap, iframeSrc]);

  const tweakSchema = getTweakSchema(active);
  const activeTweaks = tweaksValues[activeId] || {};

  const approvedCount = useMemo(
    () => Object.values(statusMap).filter(s => (typeof s === 'object' ? s.status : s) === 'looks-good').length,
    [statusMap]
  );

  /* Inject/update tweak styles into the iframe document. Same-origin (v2
   * mode) → direct contentDocument access. HTML mode (cross-origin) silently
   * no-ops; tweak previews need a postMessage protocol on that side.
   *
   * Strategy: maintain a single load listener that re-runs the injection on
   * every iframe-load. Plus, retry-inject on tweak changes via polling so we
   * don't need to reload the iframe to see the change. */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;

    const buildCss = () => tweakSchema
      .filter(t => activeTweaks[t.key] !== undefined && activeTweaks[t.key] !== null)
      .map(t => `${t.target} { ${t.prop}: ${activeTweaks[t.key]}${t.unit || ''} !important; }`)
      .join('\n');

    const tryInject = () => {
      if (cancelled) return;
      let doc;
      try { doc = iframe.contentDocument; } catch(_) { return; /* cross-origin */ }
      if (!doc || !doc.head) {
        // Document not yet ready — schedule retry
        setTimeout(tryInject, 100);
        return;
      }
      const STYLE_ID = 'wc-tweaks-style';
      let style = doc.getElementById(STYLE_ID);
      if (!style) {
        style = doc.createElement('style');
        style.id = STYLE_ID;
        doc.head.appendChild(style);
      }
      style.textContent = buildCss();
    };

    tryInject();
    iframe.addEventListener('load', tryInject);
    return () => { cancelled = true; iframe.removeEventListener('load', tryInject); };
  }, [tweakSchema, activeTweaks]);

  const setTweakValue = (key, value) => {
    setTweaksValues(m => ({ ...m, [activeId]: { ...(m[activeId] || {}), [key]: value } }));
    // #98 cause-fix: ALSO persist to dashboard-edits.css so the tweak survives
    // refresh + reaches the homepage + standalone previews (not just the
    // dashboard-iframe runtime <style> tag). Before this fix the runtime
    // injection at line ~384 was the only application path — values lived
    // purely in localStorage and never reached source. Caller-reported as
    // "edits don't save anywhere except Footer" — Footer edits happened to
    // be done via the EditPanel click-path which already calls schedulePersist,
    // every other component was edited via TweaksPanel sliders which didn't.
    const tweak = tweakSchema.find(t => t.key === key);
    if (tweak && tweak.target && tweak.prop) {
      const cssValue = value === null || value === undefined || value === ''
        ? null  // null/empty → delete the persisted rule (revert to default)
        : `${value}${tweak.unit || ''}`;
      schedulePersist(tweak.target, tweak.prop, cssValue);
    }
  };
  const resetTweaks = () => {
    setTweaksValues(m => { const copy = { ...m }; delete copy[activeId]; return copy; });
    // #98 cause-fix: also delete the persisted rules so reset truly reverts
    // the homepage + previews, not just the dashboard iframe's runtime injection.
    tweakSchema.forEach(t => {
      if (t.target && t.prop) schedulePersist(t.target, t.prop, null);
    });
  };

  /* Comments — persist per active item id. Comment = { id, x, y, w, h, text }
   * coords are percentage of overlay box (0..100) so they stay aligned across
   * iframe resizes. */
  const activeComments = commentsMap[activeId] || [];
  const addComment    = (c)              => setCommentsMap(m => ({ ...m, [activeId]: [...(m[activeId] || []), c] }));
  const updateComment = (id, patch)      => setCommentsMap(m => ({ ...m, [activeId]: (m[activeId] || []).map(c => c.id === id ? { ...c, ...patch } : c) }));
  const deleteComment = (id)             => setCommentsMap(m => ({ ...m, [activeId]: (m[activeId] || []).filter(c => c.id !== id) }));

  /* Edit mode — bind iframe events when editMode on, hover/click/dbl-click
   * iframe DOM elements to select + edit. Cross-origin (HTML mode) silently
   * no-ops since we can't reach contentDocument. */
  useEffect(() => {
    if (!editMode) { setEditSel(null); setEditHover(null); return; }
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;

    const placeRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };

    // Topmost SELECTABLE element at a point. The #wc-edit-pe style forces all
    // elements pointer-events:auto so pointer-events:none wrappers (e.g. the
    // absolutely-positioned .hero-cluster) become hit-testable. But that also
    // surfaces invisible full-viewport passthrough overlays (e.g. .wc-nav-backdrop:
    // position:fixed; inset:0; opacity:0; z-index:1000) which would then intercept
    // every pick. So we walk elementsFromPoint (topmost-first, z-ordered) and skip
    // anything the caller can't see: html/body, the picker's own overlay, and
    // elements rendered invisible (opacity 0 / visibility hidden / display none).
    // Net rule: select anything VISIBLE, including pointer-events:none wrappers.
    const pickAt = (doc, x, y) => {
      const win = doc.defaultView || iframe.contentWindow;
      const stack = doc.elementsFromPoint(x, y) || [];
      for (const el of stack) {
        if (!el || el === doc.documentElement || el === doc.body) continue;
        if (el.id === 'wc-edit-pe') continue;
        let cs; try { cs = win.getComputedStyle(el); } catch (_) { cs = null; }
        if (cs && (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none')) continue;
        return el;
      }
      return null;
    };

    // R2 (#52): the raw hit is frequently a leaf text/inline node (e.g. a
    // button's glyph <span>). Box properties (w-full, padding, bg) applied
    // there do nothing visible. Climb to the nearest MEANINGFUL box — a
    // semantic/interactive element, or a block/flex/grid container — skipping
    // pure-inline + inline-block text wrappers. Returns the leaf if none found.
    const BOX_DISPLAYS = new Set(['block','flex','grid','inline-flex','inline-grid','table','flow-root','list-item']);
    const BOX_TAGS = new Set(['BUTTON','A','INPUT','TEXTAREA','SELECT','IMG','SVG','FORM','SECTION','NAV','HEADER','FOOTER','ARTICLE','ASIDE','UL','OL','FIGURE','LABEL','VIDEO']);
    // Text-level wrappers are NEVER the meaningful box, even when CSS gives them
    // display:block (e.g. a button's glyph <span>{display:block}). Climb past
    // them by TAG, then stop at a semantic/interactive element or a real
    // block/flex/grid container.
    const TEXT_LEVEL = new Set(['SPAN','EM','STRONG','I','B','U','SMALL','CODE','MARK','SUB','SUP','ABBR','S','CITE','Q','TIME','VAR','SAMP','KBD','BR','WBR','BDI','BDO']);
    const climbToBox = (leaf, win) => {
      let cur = leaf, depth = 0;
      while (cur && cur.nodeType === 1 && cur.tagName !== 'BODY' && depth < 8) {
        if (BOX_TAGS.has(cur.tagName)) return cur;
        if (!TEXT_LEVEL.has(cur.tagName)) {
          let cs; try { cs = win.getComputedStyle(cur); } catch (_) { cs = null; }
          if (cs && BOX_DISPLAYS.has(cs.display)) return cur;
        }
        cur = cur.parentElement; depth++;
      }
      return leaf;
    };

    const onMove = (e) => {
      if (editInlineRef.current) return;
      const doc = iframe.contentDocument;
      if (!doc) return;
      const raw = pickAt(doc, e.clientX, e.clientY);
      const el = raw ? climbToBox(raw, doc.defaultView || iframe.contentWindow) : null;
      if (!el || el === editSelRef.current) {
        setEditHover(null); return;
      }
      setEditHover({ rect: placeRect(el), tag: el.tagName.toLowerCase() });
    };
    const onClick = (e) => {
      if (editInlineRef.current) return;
      e.preventDefault(); e.stopPropagation();
      const doc = iframe.contentDocument;
      if (!doc) return;
      const raw = pickAt(doc, e.clientX, e.clientY);
      const el = raw ? climbToBox(raw, doc.defaultView || iframe.contentWindow) : null;
      if (!el) return;
      editSelRef.current = el;
      setEditSel({ rect: placeRect(el), tag: el.tagName.toLowerCase(), token: Date.now() });
      setEditHover(null);
    };
    const EDIT_TEXT_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','SPAN','A','LI','BUTTON','LABEL']);
    const onDbl = (e) => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const el = pickAt(doc, e.clientX, e.clientY);
      if (!el || !EDIT_TEXT_TAGS.has(el.tagName)) return;
      e.preventDefault(); e.stopPropagation();
      el.contentEditable = 'plaintext-only';
      if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
      el.focus();
      const sel = iframe.contentWindow.getSelection();
      const range = doc.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
      editInlineRef.current = el;
      const onBlur = () => { el.contentEditable = 'false'; el.removeEventListener('blur', onBlur); el.removeEventListener('keydown', onKey); editInlineRef.current = null; };
      const onKey = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); el.blur(); } };
      el.addEventListener('blur', onBlur);
      el.addEventListener('keydown', onKey);
    };
    const onLeave = () => setEditHover(null);
    const onScroll = () => {
      if (editSelRef.current) setEditSel(s => s ? { ...s, rect: placeRect(editSelRef.current) } : s);
    };

    const bind = () => {
      if (cancelled) return;
      let doc, win;
      try { doc = iframe.contentDocument; win = iframe.contentWindow; } catch(_) { return; }
      if (!doc || !doc.body) { setTimeout(bind, 100); return; }
      // Force every iframe element hit-testable while editing. doc.elementFromPoint
      // (used by onMove/onClick) skips pointer-events:none elements, so wrappers
      // like the absolutely-positioned .hero-cluster (pointer-events:none, so the
      // marquee tiles behind it stay interactive) could never be selected. The
      // picker preventDefault/stopPropagations every click, so re-enabling
      // pointer-events here never triggers a real page interaction. Removed on cleanup.
      let peStyle = doc.getElementById('wc-edit-pe');
      if (!peStyle) {
        peStyle = doc.createElement('style');
        peStyle.id = 'wc-edit-pe';
        peStyle.textContent = '*{pointer-events:auto !important;}';
        doc.head.appendChild(peStyle);
      }
      doc.addEventListener('mousemove', onMove);
      doc.addEventListener('click',     onClick, true);
      doc.addEventListener('dblclick',  onDbl,   true);
      doc.addEventListener('mouseleave',onLeave);
      win.addEventListener('scroll',    onScroll);
      iframe.__editBound = { doc, win, onMove, onClick, onDbl, onLeave, onScroll, peStyle };
    };
    bind();
    iframe.addEventListener('load', bind);
    return () => {
      cancelled = true;
      iframe.removeEventListener('load', bind);
      const b = iframe.__editBound;
      if (b) {
        try {
          b.doc.removeEventListener('mousemove', b.onMove);
          b.doc.removeEventListener('click',     b.onClick, true);
          b.doc.removeEventListener('dblclick',  b.onDbl,   true);
          b.doc.removeEventListener('mouseleave',b.onLeave);
          b.win.removeEventListener('scroll',    b.onScroll);
          if (b.peStyle && b.peStyle.parentNode) b.peStyle.parentNode.removeChild(b.peStyle);
        } catch(_) {}
        iframe.__editBound = null;
      }
      editSelRef.current = null;
      if (editInlineRef.current) { try { editInlineRef.current.contentEditable = 'false'; } catch(_) {} editInlineRef.current = null; }
    };
  }, [editMode, iframeSrc]);

  // Esc exits editMode
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e) => { if (e.key === 'Escape' && !editInlineRef.current) { setEditMode(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode]);

  /* Inspect & Replace — same iframe binding pattern as Edit, but the hover/
   * click target snaps to the nearest semantic ancestor (section/nav/footer/
   * article/header/aside/main) OR a direct body child. Click opens a modal
   * Replace dialog with a component picker. */
  const SEMANTIC_TAGS = useMemo(() => new Set(['SECTION','NAV','FOOTER','ARTICLE','HEADER','ASIDE','MAIN']), []);
  const describePath = (el) => {
    const parts = [];
    let cur = el;
    while (cur && cur.tagName && cur.tagName !== 'BODY' && parts.length < 4) {
      let label = cur.tagName.toLowerCase();
      if (cur.id) label += '#' + cur.id;
      else if (cur.classList && cur.classList.length) {
        const cls = Array.from(cur.classList).slice(0, 2).join('.');
        if (cls) label += '.' + cls;
      }
      parts.unshift(label);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  };
  const findReplaceableAncestor = (el, doc) => {
    let cur = el;
    while (cur && cur !== doc.body && cur !== doc.documentElement) {
      if (SEMANTIC_TAGS.has(cur.tagName)) return cur;
      if (cur.parentElement === doc.body) return cur;
      cur = cur.parentElement;
    }
    return null;
  };

  useEffect(() => {
    if (!inspectMode) { setInspectSel(null); setInspectHover(null); return; }
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;
    const placeRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };
    const onMove = (e) => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const raw = doc.elementFromPoint(e.clientX, e.clientY);
      if (!raw) { setInspectHover(null); return; }
      const target = findReplaceableAncestor(raw, doc);
      if (!target || target === inspectSelRef.current) { setInspectHover(null); return; }
      setInspectHover({ rect: placeRect(target), path: describePath(target) });
    };
    const onClick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const doc = iframe.contentDocument;
      if (!doc) return;
      const raw = doc.elementFromPoint(e.clientX, e.clientY);
      if (!raw) return;
      const target = findReplaceableAncestor(raw, doc);
      if (!target) return;
      inspectSelRef.current = target;
      setInspectSel({ rect: placeRect(target), path: describePath(target), token: Date.now() });
      setInspectHover(null);
    };
    const onLeave = () => setInspectHover(null);
    const onScroll = () => {
      if (inspectSelRef.current) setInspectSel(s => s ? { ...s, rect: placeRect(inspectSelRef.current) } : s);
    };
    const bind = () => {
      if (cancelled) return;
      let doc, win;
      try { doc = iframe.contentDocument; win = iframe.contentWindow; } catch(_) { return; }
      if (!doc || !doc.body) { setTimeout(bind, 100); return; }
      doc.addEventListener('mousemove', onMove);
      doc.addEventListener('click',     onClick, true);
      doc.addEventListener('mouseleave',onLeave);
      win.addEventListener('scroll',    onScroll);
      iframe.__inspectBound = { doc, win, onMove, onClick, onLeave, onScroll };
    };
    bind();
    iframe.addEventListener('load', bind);
    return () => {
      cancelled = true;
      iframe.removeEventListener('load', bind);
      const b = iframe.__inspectBound;
      if (b) {
        try {
          b.doc.removeEventListener('mousemove', b.onMove);
          b.doc.removeEventListener('click',     b.onClick, true);
          b.doc.removeEventListener('mouseleave',b.onLeave);
          b.win.removeEventListener('scroll',    b.onScroll);
        } catch(_) {}
        iframe.__inspectBound = null;
      }
      inspectSelRef.current = null;
    };
  }, [inspectMode, iframeSrc, SEMANTIC_TAGS]);

  // Esc closes Replace dialog OR exits Inspect mode
  useEffect(() => {
    if (!inspectMode) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (inspectSel) { closeReplaceDialog(); }
      else { setInspectMode(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectMode, inspectSel]);

  const closeReplaceDialog = () => {
    inspectSelRef.current = null;
    setInspectSel(null);
    setReplacePick('');
  };
  const applyReplace = () => {
    const el = inspectSelRef.current;
    if (!el || !replacePick) return;
    // Find the picked component's info
    const picked = ALL_ITEMS.find(it => it.id === replacePick);
    if (!picked) return;
    // MVP: visual demo only — swap the element's outerHTML with a placeholder
    // representing the new component. Real source-file write would need a
    // Vite dev-server endpoint that edits HomePage.jsx (deferred; matches
    // HTML dashboard's /api/save pattern which also lives behind a server
    // endpoint, not the dashboard itself).
    const placeholder = el.ownerDocument.createElement('div');
    placeholder.style.cssText = 'min-height:200px;display:flex;align-items:center;justify-content:center;background:rgba(179,157,219,0.18);border:2px dashed #b39ddb;color:#1f0f0b;font-family:system-ui;font-size:14px;padding:24px;text-align:center;';
    placeholder.innerHTML = '⟦ ' + picked.label + (picked.v2 ? ' (v2 &lt;' + picked.v2 + '/&gt;)' : '') + ' ⟧<br><small style="opacity:0.7">Inspect&amp;Replace MVP — visual swap (source-write deferred)</small>';
    el.parentNode.replaceChild(placeholder, el);
    closeReplaceDialog();
  };

  /* Drag-drop — sidebar item → iframe insertion. Always active (no toggle).
   * On drag of any sidebar item, the iframe doc gets dragover/drop bindings
   * that show a purple insertion indicator between top-level sections and on
   * drop insert a placeholder div for the dropped component. Source-write
   * deferred (would need a Vite dev plugin to edit HomePage.jsx). */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;
    const DND_INDICATOR_ID = '__wc-dnd-indicator';

    const findInsertionTarget = (doc, clientY) => {
      const children = Array.from(doc.body.children).filter(c => {
        if (!c.tagName) return false;
        if (c.id === DND_INDICATOR_ID) return false;
        if (['SCRIPT','STYLE','LINK','SVG'].includes(c.tagName)) return false;
        const r = c.getBoundingClientRect();
        return r.height >= 1;
      });
      if (!children.length) return null;
      for (let i = 0; i < children.length; i++) {
        const r = children[i].getBoundingClientRect();
        const mid = r.top + r.height / 2;
        if (clientY < mid) return { el: children[i], where: 'before' };
      }
      return { el: children[children.length - 1], where: 'after' };
    };
    const showIndicator = (doc, target) => {
      let ind = doc.getElementById(DND_INDICATOR_ID);
      if (!ind) {
        ind = doc.createElement('div');
        ind.id = DND_INDICATOR_ID;
        ind.style.cssText = 'position:absolute;left:0;right:0;height:4px;background:#b39ddb;box-shadow:0 0 8px #b39ddb,0 0 16px rgba(179,157,219,0.5);z-index:2147483646;pointer-events:none;border-radius:2px;';
        doc.body.appendChild(ind);
      }
      const rect = target.el.getBoundingClientRect();
      const scrollTop = (doc.defaultView && doc.defaultView.scrollY) || 0;
      const top = target.where === 'before' ? rect.top + scrollTop - 2 : rect.bottom + scrollTop - 2;
      ind.style.top = top + 'px';
    };
    const removeIndicator = (doc) => {
      const ind = doc.getElementById(DND_INDICATOR_ID);
      if (ind) ind.remove();
    };

    const onDragOver = (e) => {
      if (!dndDragSrcRef.current) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      const doc = iframe.contentDocument;
      const tgt = findInsertionTarget(doc, e.clientY);
      if (tgt) showIndicator(doc, tgt);
    };
    const onDragLeave = (e) => {
      const doc = iframe.contentDocument;
      if (e.target === doc || e.target === doc.body) removeIndicator(doc);
    };
    const onDrop = (e) => {
      e.preventDefault();
      const doc = iframe.contentDocument;
      removeIndicator(doc);
      const src = dndDragSrcRef.current;
      if (!src) return;
      const tgt = findInsertionTarget(doc, e.clientY);
      if (!tgt) return;
      // Visual swap: insert a placeholder card before/after target
      const card = doc.createElement('div');
      card.style.cssText = 'position:relative;z-index:9999;min-height:160px;display:flex;align-items:center;justify-content:center;background:rgba(179,157,219,0.95);border:3px dashed #6b48a3;color:#1f0f0b;font-family:system-ui;font-size:16px;font-weight:600;padding:24px;text-align:center;margin:16px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.30);';
      card.innerHTML = '⟦ DROPPED: ' + src.label + (src.v2 ? ' (v2 &lt;' + src.v2 + '/&gt;)' : '') + ' ⟧<br><small style="opacity:0.85;font-weight:400">Drag-drop MVP — visual insertion (source-write deferred)</small>';
      if (tgt.where === 'before') tgt.el.parentNode.insertBefore(card, tgt.el);
      else if (tgt.el.nextSibling) tgt.el.parentNode.insertBefore(card, tgt.el.nextSibling);
      else tgt.el.parentNode.appendChild(card);
    };

    const bind = () => {
      if (cancelled) return;
      let doc;
      try { doc = iframe.contentDocument; } catch(_) { return; }
      if (!doc || !doc.body) { setTimeout(bind, 100); return; }
      if (doc.__wc_dnd_bound) return;
      doc.__wc_dnd_bound = true;
      doc.addEventListener('dragover',  onDragOver);
      doc.addEventListener('dragleave', onDragLeave);
      doc.addEventListener('drop',      onDrop);
      iframe.__dndBound = { doc, onDragOver, onDragLeave, onDrop };
    };
    bind();
    iframe.addEventListener('load', bind);
    return () => {
      cancelled = true;
      iframe.removeEventListener('load', bind);
      const b = iframe.__dndBound;
      if (b) {
        try {
          b.doc.removeEventListener('dragover',  b.onDragOver);
          b.doc.removeEventListener('dragleave', b.onDragLeave);
          b.doc.removeEventListener('drop',      b.onDrop);
          b.doc.__wc_dnd_bound = false;
        } catch(_) {}
        iframe.__dndBound = null;
      }
    };
  }, [iframeSrc]);

  const dndOnDragStart = (item) => (e) => {
    if (!item.v2) { e.preventDefault(); return; }  // only v2-mapped items draggable
    dndDragSrcRef.current = { id: item.id, label: item.label, v2: item.v2 };
    e.dataTransfer.effectAllowed = 'copy';
    try { e.dataTransfer.setData('text/plain', item.id); } catch(_) {}
    document.body.classList.add('wc-dash-dragging');
  };
  const dndOnDragEnd = () => {
    dndDragSrcRef.current = null;
    document.body.classList.remove('wc-dash-dragging');
    // Also clean up indicator if drag was canceled
    try {
      const doc = iframeRef.current && iframeRef.current.contentDocument;
      if (doc) {
        const ind = doc.getElementById('__wc-dnd-indicator');
        if (ind) ind.remove();
      }
    } catch(_) {}
  };

  const applyEditCss = (prop, value) => {
    const el = editSelRef.current;
    if (!el) return;
    // Immediate visual feedback — inline style on the selected DOM node.
    el.style.setProperty(prop, value);
    // Re-measure rect after style change
    const r = el.getBoundingClientRect();
    setEditSel(s => s ? { ...s, rect: { top: r.top, left: r.left, width: r.width, height: r.height } } : s);
    // Persist to source so the change survives refresh + propagates to other
    // open clients (homepage, standalone). Debounced per (selector, property)
    // so dragging a slider doesn't spam the dev server. See
    // `vite-plugin-edit-persistence.js` for the POST /__edit-save contract
    // + the on-disk file format.
    const selector = buildIframeSelector(el);
    if (selector) schedulePersist(selector, prop, value);
  };

  // v3 token-picker: apply a fully-computed className (the picker builds the
  // Tailwind class string for the active property + breakpoint) to the selected
  // element, then persist it to twClassMap keyed by a stable selector that
  // excludes editable utility classes.
  const applyClassName = (newClassName) => {
    const el = editSelRef.current;
    if (!el || typeof newClassName !== 'string') return;
    el.setAttribute('class', newClassName);            // works for HTML + SVG (className is read-only on SVG)
    const sel = buildStableSelector(el);
    const nextMap = sel ? { ...twClassMap, [sel]: newClassName } : twClassMap;
    // Rebuild the injected preview sheet SYNCHRONOUSLY (before the token bump that
    // re-renders the panel) so the panel's computed-style reads — R1 baselines, R3
    // cap detection — see post-apply reality this tick, not the pre-rebuild sheet.
    try { const doc = el.ownerDocument; if (doc) injectArbStylesheet(doc, Object.entries(nextMap)); } catch (_) {}
    const r = el.getBoundingClientRect();
    setEditSel(s => s ? { ...s, rect: { top: r.top, left: r.left, width: r.width, height: r.height }, token: Date.now() } : s);
    if (sel) setTwClassMap(nextMap);
  };
  // Breadcrumb (R2): manually re-select an ancestor/child of the current
  // selection, overriding the auto climb-to-container — climb UP to a wrapper
  // or DOWN into an inline leaf the climb skipped. Hover previews the target.
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height }; };
  const selectEl = (el) => {
    if (!el || el.nodeType !== 1) return;
    editSelRef.current = el;
    setEditSel({ rect: rectOf(el), tag: el.tagName.toLowerCase(), token: Date.now() });
    setEditHover(null);
  };
  const hoverEl = (el) => setEditHover(el && el.nodeType === 1 ? { rect: rectOf(el), tag: el.tagName.toLowerCase() } : null);
  const closeEditPanel = () => {
    editSelRef.current = null;
    setEditSel(null);
  };

  const getStatus  = (id) => { const e = statusMap[id]; return e ? (typeof e === 'object' ? (e.status || 'new') : e) : 'new'; };
  const setStatus  = (id, status) => setStatusMap(m => ({ ...m, [id]: { ...(typeof m[id] === 'object' ? m[id] : {}), status } }));
  const cycleStatus = (id) => {
    const cur = getStatus(id);
    const nextIdx = (STATUS_OPTIONS.indexOf(cur) + 1) % STATUS_OPTIONS.length;
    setStatus(id, STATUS_OPTIONS[nextIdx]);
  };

  return (
    <div className="wc-dash-shell">
      <Topbar
        active={active}
        mode={mode}
        setMode={setMode}
        approvedCount={approvedCount}
        totalCount={TOTAL_COUNT}
        onMarkGood={() => setStatus(activeId, 'looks-good')}
        onMarkNeedsWork={() => setStatus(activeId, 'needs-work')}
        tweaksOpen={tweaksOpen}
        onToggleTweaks={() => setTweaksOpen(o => !o)}
        tweakCount={tweakSchema.length}
        commentMode={commentMode}
        onToggleComment={() => { setCommentMode(c => !c); setEditingCommentId(null); }}
        commentCount={activeComments.length}
        editMode={editMode}
        onToggleEdit={() => setEditMode(e => !e)}
        inspectMode={inspectMode}
        onToggleInspect={() => setInspectMode(i => !i)}
      />
      <div className="wc-dash-body">
        <aside className="wc-dash-sidebar">
          <div className="wc-dash-approved-counter">
            <span className="wc-dash-approved-n">{approvedCount}/{TOTAL_COUNT}</span>
            <span className="wc-dash-approved-label">approved</span>
          </div>
          {TREE.map(cat => (
            <CatSection
              key={cat.cat}
              cat={cat}
              activeId={activeId}
              statusMap={statusMap}
              getStatus={getStatus}
              cycleStatus={cycleStatus}
              onPick={setActiveId}
              dndOnDragStart={dndOnDragStart}
              dndOnDragEnd={dndOnDragEnd}
            />
          ))}
        </aside>
        <main className="wc-dash-main">
          <iframe
            ref={iframeRef}
            className="wc-dash-iframe"
            src={iframeSrc}
            title={`Preview: ${active.label}`}
            key={iframeSrc /* force remount on src change to bypass any caching */}
          />
          <CommentOverlay
            commentMode={commentMode}
            comments={activeComments}
            editingId={editingCommentId}
            setEditingId={setEditingCommentId}
            addComment={addComment}
            updateComment={updateComment}
            deleteComment={deleteComment}
          />
          {editMode && <EditOverlays hover={editHover} sel={editSel} />}
          {inspectMode && <InspectOverlays hover={inspectHover} sel={inspectSel} />}
        </main>
        {editMode && editSel && (
          <EditPanel
            sel={editSel}
            getEl={() => editSelRef.current}
            apply={applyEditCss}
            applyClass={applyClassName}
            selectEl={selectEl}
            hoverEl={hoverEl}
            onClose={closeEditPanel}
          />
        )}
        {tweaksOpen && (
          <TweaksPanel
            active={active}
            schema={tweakSchema}
            values={activeTweaks}
            setValue={setTweakValue}
            onReset={resetTweaks}
            onClose={() => setTweaksOpen(false)}
            mode={mode}
          />
        )}
      </div>
      {inspectMode && inspectSel && (
        <ReplaceDialog
          sel={inspectSel}
          allItems={ALL_ITEMS}
          pick={replacePick}
          setPick={setReplacePick}
          onApply={applyReplace}
          onClose={closeReplaceDialog}
        />
      )}
    </div>
  );
}

function TweaksPanel({ active, schema, values, setValue, onReset, onClose, mode }) {
  return (
    <aside className="wc-dash-tweaks-panel">
      <header className="wc-dash-tweaks-header">
        <span className="wc-dash-tweaks-title">Tweaks · {active.label}</span>
        <div className="wc-dash-tweaks-actions">
          <button className="wc-dash-tweaks-action" onClick={onReset} title="Reset to defaults">Reset</button>
          <button className="wc-dash-tweaks-close" onClick={onClose} title="Close tweaks panel">×</button>
        </div>
      </header>
      {mode === 'html' && (
        <p className="wc-dash-tweaks-note">
          ⚠ Tweaks preview only works in v2 mode (cross-origin HTML iframe can't be styled from here).
        </p>
      )}
      {schema.length === 0 ? (
        <p className="wc-dash-tweaks-empty">No tweaks defined for {active.label} yet.</p>
      ) : (
        <ul className="wc-dash-tweaks-list">
          {schema.map(t => (
            <TweakControl
              key={t.key}
              tweak={t}
              value={values[t.key] !== undefined ? values[t.key] : t.default}
              onChange={(v) => setValue(t.key, v)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

function TweakControl({ tweak, value, onChange }) {
  if (tweak.type === 'slider') {
    return (
      <li className="wc-dash-tweak-row">
        <label className="wc-dash-tweak-label">
          <span>{tweak.label}</span>
          <span className="wc-dash-tweak-value">{value}{tweak.unit || ''}</span>
        </label>
        <input
          type="range"
          min={tweak.min}
          max={tweak.max}
          step={tweak.step || 1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="wc-dash-tweak-slider"
        />
      </li>
    );
  }
  if (tweak.type === 'select') {
    return (
      <li className="wc-dash-tweak-row">
        <label className="wc-dash-tweak-label">
          <span>{tweak.label}</span>
        </label>
        <div className="wc-dash-tweak-segmented">
          {tweak.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`wc-dash-tweak-seg ${value === opt.value ? 'is-active' : ''}`}
              onClick={() => onChange(opt.value)}
            >{opt.label}</button>
          ))}
        </div>
      </li>
    );
  }
  if (tweak.type === 'toggle') {
    return (
      <li className="wc-dash-tweak-row">
        <label className="wc-dash-tweak-label">
          <span>{tweak.label}</span>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        </label>
      </li>
    );
  }
  return null;
}

/* CommentOverlay — absolute layer over the iframe.
 *
 * When commentMode is ON, intercepts pointer events so the user can drag-draw
 * a rectangle that becomes a comment annotation. Existing annotations render
 * as numbered pins + bubble textareas. Coords are percentage-of-overlay so
 * comments stay anchored across iframe resize.
 *
 * When commentMode is OFF, the layer is pointer-events:none — annotations
 * still render (read-only pins) so the user can see prior comments on hover.
 */
function CommentOverlay({ commentMode, comments, editingId, setEditingId, addComment, updateComment, deleteComment }) {
  const overlayRef = useRef(null);
  const [drag, setDrag] = useState(null);  // { x0, y0, x1, y1 } in % coords

  const toPct = (clientX, clientY) => {
    const r = overlayRef.current.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width)  * 100,
      y: ((clientY - r.top)  / r.height) * 100,
    };
  };

  const onMouseDown = (e) => {
    if (!commentMode) return;
    // Ignore clicks on existing comment cards
    if (e.target.closest('.wc-dash-comment-card')) return;
    e.preventDefault();
    const p = toPct(e.clientX, e.clientY);
    setDrag({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };
  const onMouseMove = (e) => {
    if (!drag) return;
    const p = toPct(e.clientX, e.clientY);
    setDrag(d => ({ ...d, x1: p.x, y1: p.y }));
  };
  const onMouseUp = () => {
    if (!drag) return;
    const x = Math.min(drag.x0, drag.x1);
    const y = Math.min(drag.y0, drag.y1);
    const w = Math.abs(drag.x1 - drag.x0);
    const h = Math.abs(drag.y1 - drag.y0);
    setDrag(null);
    // Treat clicks (no drag) as a small default rect — 12% × 6%, anchored at click
    const isClick = w < 0.5 && h < 0.5;
    const id = 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const rect = isClick
      ? { x: Math.max(0, x - 6), y: Math.max(0, y - 3), w: 12, h: 6 }
      : { x, y, w, h };
    addComment({ id, ...rect, text: '' });
    setEditingId(id);
  };

  // Render-time helpers
  const dragRect = drag && {
    left:  Math.min(drag.x0, drag.x1) + '%',
    top:   Math.min(drag.y0, drag.y1) + '%',
    width:  Math.abs(drag.x1 - drag.x0) + '%',
    height: Math.abs(drag.y1 - drag.y0) + '%',
  };

  return (
    <div
      ref={overlayRef}
      className={`wc-dash-comment-overlay ${commentMode ? 'is-active' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Existing comments */}
      {comments.map((c, i) => (
        <CommentCard
          key={c.id}
          n={i + 1}
          c={c}
          editing={editingId === c.id}
          startEdit={() => setEditingId(c.id)}
          stopEdit={() => setEditingId(null)}
          onChange={(text) => updateComment(c.id, { text })}
          onDelete={() => { deleteComment(c.id); setEditingId(null); }}
        />
      ))}
      {/* Live drag rect */}
      {dragRect && <div className="wc-dash-comment-dragrect" style={dragRect} />}
      {commentMode && comments.length === 0 && !drag && (
        <div className="wc-dash-comment-hint">Drag to draw a comment. Esc to exit.</div>
      )}
    </div>
  );
}

function CommentCard({ n, c, editing, startEdit, stopEdit, onChange, onDelete }) {
  const taRef = useRef(null);
  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      const v = taRef.current.value;
      taRef.current.setSelectionRange(v.length, v.length);
    }
  }, [editing]);
  const style = { left: c.x + '%', top: c.y + '%', width: c.w + '%', height: c.h + '%' };
  return (
    <div
      className={`wc-dash-comment-card ${editing ? 'is-editing' : ''} ${c.text ? 'has-text' : ''}`}
      style={style}
      onClick={(e) => { e.stopPropagation(); if (!editing) startEdit(); }}
    >
      <span className="wc-dash-comment-pin">{n}</span>
      {editing ? (
        <div className="wc-dash-comment-bubble" onMouseDown={(e) => e.stopPropagation()}>
          <textarea
            ref={taRef}
            value={c.text}
            placeholder="Type a comment…"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape')               { e.preventDefault(); stopEdit(); }
              if (e.key === 'Enter' && e.metaKey)   { e.preventDefault(); stopEdit(); }
            }}
          />
          <div className="wc-dash-comment-actions">
            <button type="button" className="wc-dash-comment-del" onClick={onDelete}>Delete</button>
            <button type="button" className="wc-dash-comment-save" onClick={stopEdit}>Done</button>
          </div>
        </div>
      ) : (
        c.text && <div className="wc-dash-comment-preview" title={c.text}>{c.text}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Edit mode — overlays + property panel
 * Hover/select overlays are sized in iframe coords, then offset by the
 * iframe's position relative to its container. EditPanel renders ~25 CSS
 * properties grouped by Typography / Size / Layout / Box, mirroring HTML
 * dashboard's EDIT_SECTIONS schema.
 * ───────────────────────────────────────────────────────────────────────── */
function EditOverlays({ hover, sel }) {
  // The hover/sel rect coords are iframe-local (getBoundingClientRect inside
  // contentDocument). The overlays render inside .wc-dash-main which contains
  // the iframe — and the iframe fills .wc-dash-main with 0,0 origin. So we
  // can render the overlay directly at the rect coords.
  return (
    <>
      {hover && hover.rect && (
        <div
          className="wc-dash-edit-hover"
          style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }}
        >
          <span className="wc-dash-edit-tooltip">{hover.tag} · {Math.round(hover.rect.width)} × {Math.round(hover.rect.height)}</span>
        </div>
      )}
      {sel && sel.rect && (
        <div
          className="wc-dash-edit-sel"
          style={{ top: sel.rect.top, left: sel.rect.left, width: sel.rect.width, height: sel.rect.height }}
        />
      )}
    </>
  );
}

// Legacy px controls — ONLY the not-yet-tokenized props. Layout (Display/
// Justify/Align), Spacing (Padding/Gap) + Radius now live in the class-primary
// TwSections above; removed here to avoid duplicate controls. Typography / Size
// / Position / Box(remainder) convert to class-primary tokens next iter.
const EDIT_SECTIONS = [
  { title: 'Typography', props: [
    { label: 'Font',       css: 'font-family',     type: 'text' },
    { label: 'Size',       css: 'font-size',       type: 'num',  unit: 'px' },
    { label: 'Weight',     css: 'font-weight',     type: 'sel',  opts: ['400','500','600','700'] },
    { label: 'Color',      css: 'color',           type: 'clr' },
    { label: 'Line Height',css: 'line-height',     type: 'num',  unit: 'px' },
    { label: 'Tracking',   css: 'letter-spacing',  type: 'num',  unit: 'px' },
    { label: 'Align',      css: 'text-align',      type: 'seg',  opts: ['left','center','right'] },
  ]},
  { title: 'Size', props: [
    { label: 'Width',      css: 'width',           type: 'dim' },
    { label: 'Height',     css: 'height',          type: 'dim' },
    { label: 'Max W',      css: 'max-width',       type: 'dim',  allowNone: true },
    { label: 'Min W',      css: 'min-width',       type: 'num',  unit: 'px' },
  ]},
  { title: 'Position', props: [
    { label: 'Position',   css: 'position',        type: 'sel',  opts: ['static','relative','absolute','fixed','sticky'] },
  ]},
  { title: 'Box', props: [
    { label: 'Margin',     css: 'margin',          type: 'sides' },
    { label: 'Background', css: 'background-color',type: 'clr' },
    { label: 'Border Color',css: 'border-color',   type: 'clr' },
    { label: 'Border W',   css: 'border-top-width',type: 'num',  unit: 'px', setCss: 'border-width' },
    { label: 'Opacity',    css: 'opacity',         type: 'num',  unit: '%',  scale: 100 },
  ]},
];

// design-qa ruling 4: crumb label = tag + first SEMANTIC short class; SKIP the
// editor/framework classes, the utility classes the editor manages, AND
// arbitrary-bracket utilities (`[font-family:…]`) — those are noise, not names.
function crumbLabel(node) {
  const tag = node.tagName.toLowerCase();
  if (node.id) return tag + '#' + node.id;
  const cls = (typeof node.className === 'string' ? node.className.trim().split(/\s+/) : [])
    .filter(c => c && !c.startsWith('[') && !c.startsWith('wc-dash-') && !c.startsWith('wc-edit') && !c.startsWith('wc-tw') && !isTwUtil(c));
  return cls.length ? tag + '.' + cls[0] : tag;
}

// Sectioning elements that bound a "component" — the trail caps here so it stays
// scannable nav (design-qa ruling 4: stop at section, don't climb to the app shell).
const CRUMB_ROOTS = new Set(['SECTION', 'MAIN', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'ASIDE']);

/* Breadcrumb (R2): ancestor trail (climb UP) + child chips (drill DOWN into a
   leaf the auto climb-to-container skipped, e.g. an inline glyph span). Hovering
   a crumb previews that element via the edit overlay; clicking re-selects it.
   Trail caps at the component/section root — never includes the app shell
   (`div#root` / body) — so it reads as in-component navigation, not DOM noise. */
function Breadcrumb({ el, selectEl, hoverEl }) {
  const chain = [];
  let cur = el, depth = 0;
  while (cur && cur.nodeType === 1 && depth < 8) {
    const tag = cur.tagName;
    if (tag === 'BODY' || tag === 'HTML' || cur.id === 'root') break;   // app shell — exclude
    chain.unshift(cur);
    const par = cur.parentElement;
    if (!par || par.id === 'root' || par.tagName === 'BODY' || par.tagName === 'HTML' || CRUMB_ROOTS.has(tag)) break;  // cur = component/section root
    cur = par; depth++;
  }
  const kids = Array.from(el.children || []).filter(n => n.nodeType === 1).slice(0, 12);
  return (
    <div className="wc-dash-edit-crumbs" onMouseLeave={() => hoverEl(null)}>
      <div className="wc-dash-crumb-trail">
        {chain.map((n, i) => (
          <span className="wc-dash-crumb-wrap" key={i}>
            {i > 0 && <span className="wc-dash-crumb-sep">›</span>}
            <button type="button" className={`wc-dash-crumb${n === el ? ' is-current' : ''}`}
              onClick={() => n !== el && selectEl(n)} onMouseEnter={() => hoverEl(n)}
              title={n === el ? 'current selection' : 'select this ancestor'}>{crumbLabel(n)}</button>
          </span>
        ))}
      </div>
      {kids.length > 0 && (
        <div className="wc-dash-crumb-kids">
          <span className="wc-dash-crumb-kids-label">↓ into</span>
          {kids.map((k, i) => (
            <button type="button" key={i} className="wc-dash-crumb-kid"
              onClick={() => selectEl(k)} onMouseEnter={() => hoverEl(k)}
              title="drill into this child">{crumbLabel(k)}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditPanel({ sel, getEl, apply, applyClass, selectEl, hoverEl, onClose }) {
  // Re-read computed style on each token change (selection changed)
  const el = getEl();
  // Device tier lifted to panel level (one control, applies to all sections).
  const [device, setDevice] = useState('desktop');
  if (!el) return null;
  const cs = el.ownerDocument.defaultView.getComputedStyle(el);
  const dev = TW_DEVICES.find(d => d.id === device) || TW_DEVICES[0];
  return (
    <aside className="wc-dash-edit-panel">
      <header className="wc-dash-edit-panel-header">
        <span className="wc-dash-edit-panel-title">Edit · <span className="wc-tw-twword">Tailwind</span></span>
        <span className="wc-dash-edit-panel-tag">{sel.tag}</span>
        <span style={{ flex: 1 }} />
        <button className="wc-dash-edit-panel-close" onClick={onClose} title="Close (Esc clears selection)">✕</button>
      </header>
      {selectEl && <Breadcrumb el={el} selectEl={selectEl} hoverEl={hoverEl} key={sel.token} />}
      {/* v3 Tailwind token-picker — class-PRIMARY (tokens-prominent). Device
          control once at panel top governs every token section. The px sections
          below are the not-yet-converted legacy controls (caller "no absolute
          numbers" — Size/Type-size/Color/Position convert next iter). */}
      {applyClass
        ? <>
            <TwDeviceTabs device={device} setDevice={setDevice} el={el} />
            <TwSections el={el} prefix={dev.prefix} device={device} onClassName={applyClass} selToken={sel.token} />
          </>
        : EDIT_SECTIONS.map(section => (
            <div key={section.title} className="wc-dash-edit-section">
              <div className="wc-dash-edit-section-title">{section.title}</div>
              {section.props.map(p => (
                <EditRow key={p.css + '-' + sel.token} p={p} cs={cs} apply={apply} />
              ))}
            </div>
          ))}
    </aside>
  );
}

function rgb2hex(c) {
  const m = (c || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? '#' + [m[1], m[2], m[3]].map(n => (+n).toString(16).padStart(2, '0')).join('') : '#000000';
}

function EditRow({ p, cs, apply }) {
  const raw = cs.getPropertyValue(p.css).trim();
  if (p.type === 'text') {
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <input type="text" className="wc-dash-edit-row-input"
          defaultValue={raw}
          onChange={(e) => apply(p.css, e.target.value)} />
      </div>
    );
  }
  if (p.type === 'num') {
    const px = p.scale ? Math.round(parseFloat(raw) * p.scale) : Math.round(parseFloat(raw)) || 0;
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <input type="number" className="wc-dash-edit-row-input"
          defaultValue={isNaN(px) ? 0 : px}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (isNaN(v)) return;
            if (p.scale) apply(p.css, String(v / p.scale));
            else apply(p.setCss || p.css, v + (p.unit || ''));
          }} />
        {p.unit && <span className="wc-dash-edit-row-unit">{p.unit}</span>}
      </div>
    );
  }
  if (p.type === 'sel') {
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <select className="wc-dash-edit-row-select"
          defaultValue={raw}
          onChange={(e) => apply(p.css, e.target.value)}>
          {p.opts.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    );
  }
  if (p.type === 'clr') {
    const hex = rgb2hex(raw);
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <input type="color" className="wc-dash-edit-row-color"
          defaultValue={hex}
          onChange={(e) => apply(p.css, e.target.value)} />
        <span className="wc-dash-edit-row-hex">{hex}</span>
      </div>
    );
  }
  if (p.type === 'seg') {
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <div className="wc-dash-edit-segmented">
          {p.opts.map(v => (
            <button key={v} type="button"
              className={`wc-dash-edit-seg-btn ${raw === v ? 'is-active' : ''}`}
              onClick={() => apply(p.css, v)}>{v.charAt(0).toUpperCase()}</button>
          ))}
        </div>
      </div>
    );
  }
  if (p.type === 'dim') {
    const isAuto = raw === 'auto', isNone = raw === 'none', isPct = raw.endsWith('%');
    const curUnit = isAuto ? 'auto' : isNone ? 'none' : isPct ? '%' : 'px';
    const val = (isAuto || isNone) ? '' : (isPct ? parseFloat(raw) : Math.round(parseFloat(raw)) || 0);
    return (
      <div className="wc-dash-edit-row">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <input type="number" className="wc-dash-edit-row-input"
          defaultValue={val}
          placeholder={isAuto ? 'auto' : isNone ? 'none' : ''}
          disabled={isAuto || isNone}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) apply(p.css, v + (curUnit === '%' ? '%' : 'px'));
          }} />
        <select className="wc-dash-edit-row-select wc-dash-edit-dim-unit"
          defaultValue={curUnit}
          onChange={(e) => {
            const u = e.target.value;
            if (u === 'auto') apply(p.css, 'auto');
            else if (u === 'none') apply(p.css, 'none');
            else if (u === 'fit')  apply(p.css, 'fit-content');
          }}>
          {(p.allowNone ? ['px','%','auto','fit','none'] : ['px','%','auto','fit']).map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    );
  }
  if (p.type === 'sides') {
    const sides = [['T','-top'], ['R','-right'], ['B','-bottom'], ['L','-left']];
    return (
      <div className="wc-dash-edit-row wc-dash-edit-row-sides">
        <span className="wc-dash-edit-row-label">{p.label}</span>
        <div className="wc-dash-edit-sides-grid">
          {sides.map(([lbl, sfx]) => {
            const v = Math.round(parseFloat(cs.getPropertyValue(p.css + sfx))) || 0;
            return (
              <div key={sfx} className="wc-dash-edit-sides-field">
                <span className="wc-dash-edit-sides-label">{lbl}</span>
                <input type="number" className="wc-dash-edit-row-input"
                  defaultValue={v}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) apply(p.css + sfx, n + 'px');
                  }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Inspect & Replace — purple-themed overlays + modal replace dialog
 * Click-snap-to-semantic-ancestor (section/nav/footer/article/header/aside/
 * main) gives caller a clean section-level target instead of a leaf element.
 * Replace dialog: target path + component picker (sourced from TREE) +
 * preview iframe + Apply. MVP applies a visual placeholder swap; persistent
 * source-file write is deferred (needs dev-server endpoint).
 * ───────────────────────────────────────────────────────────────────────── */
function InspectOverlays({ hover, sel }) {
  return (
    <>
      {hover && hover.rect && (
        <div className="wc-dash-inspect-hover"
          style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }}>
          <span className="wc-dash-inspect-tooltip">{hover.path} · {Math.round(hover.rect.width)} × {Math.round(hover.rect.height)}</span>
        </div>
      )}
      {sel && sel.rect && (
        <div className="wc-dash-inspect-sel"
          style={{ top: sel.rect.top, left: sel.rect.left, width: sel.rect.width, height: sel.rect.height }} />
      )}
    </>
  );
}

function ReplaceDialog({ sel, allItems, pick, setPick, onApply, onClose }) {
  // Group items by category for the dropdown
  const grouped = useMemo(() => {
    const m = {};
    allItems.forEach(it => {
      const key = it.cat + (it.sub ? ' · ' + it.sub : '');
      (m[key] = m[key] || []).push(it);
    });
    return m;
  }, [allItems]);

  const picked = pick ? allItems.find(it => it.id === pick) : null;
  const previewSrc = picked
    ? (picked.v2
        ? (picked.v2 === '__HOMEPAGE__' ? '/?home=1' : '/?component=' + picked.v2)  /* ?home=1: avoid dashboard recursion (#82) */
        : 'http://localhost:8080' + picked.htmlSrc)
    : null;

  return (
    <div className="wc-dash-replace-backdrop" onClick={(e) => { if (e.target.classList.contains('wc-dash-replace-backdrop')) onClose(); }}>
      <div className="wc-dash-replace-dialog" role="dialog" aria-modal="true">
        <header className="wc-dash-replace-header">
          <span className="wc-dash-replace-title">Replace section with component</span>
          <button className="wc-dash-replace-close" onClick={onClose} title="Close (Esc)">✕</button>
        </header>
        <div className="wc-dash-replace-body">
          <div className="wc-dash-replace-row">
            <span className="wc-dash-replace-label">Target</span>
            <code className="wc-dash-replace-target">{sel.path}</code>
          </div>
          <div className="wc-dash-replace-row">
            <span className="wc-dash-replace-label">Replace with</span>
            <select className="wc-dash-replace-select"
              value={pick}
              onChange={(e) => setPick(e.target.value)}>
              <option value="">— Pick a component —</option>
              {Object.keys(grouped).map(grp => (
                <optgroup key={grp} label={grp}>
                  {grouped[grp].map(it => (
                    <option key={it.id} value={it.id}>{it.label}{it.v2 ? '  (v2)' : ''}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="wc-dash-replace-preview">
            {previewSrc
              ? <iframe src={previewSrc} title="Component preview" />
              : <div className="wc-dash-replace-preview-empty">Select a component to preview</div>}
          </div>
        </div>
        <footer className="wc-dash-replace-footer">
          <span className="wc-dash-replace-note">ⓘ MVP: applies visual swap. Persistent source write deferred.</span>
          <button className="wc-dash-replace-cancel" onClick={onClose}>Cancel</button>
          <button className="wc-dash-replace-apply" onClick={onApply} disabled={!pick}>Apply Replace</button>
        </footer>
      </div>
    </div>
  );
}

function Topbar({ active, mode, setMode, approvedCount, totalCount, onMarkGood, onMarkNeedsWork, tweaksOpen, onToggleTweaks, tweakCount, commentMode, onToggleComment, commentCount, editMode, onToggleEdit, inspectMode, onToggleInspect }) {
  return (
    <header className="wc-dash-topbar">
      <span className="wc-dash-brand">WILDCARD DESIGN SYSTEM</span>
      <span className="wc-dash-sep" />
      <span className="wc-dash-current">{active.cat} {active.sub ? `· ${active.sub}` : ''} · {active.label}</span>
      <span style={{ flex: 1 }} />

      {/* Project mode toggle — v3 React (default) or HTML preview.
          (Internal mode value stays 'v2' to preserve localStorage keys +
          resolveSrc logic; only the visible label is v3.) */}
      <div className="wc-dash-mode-toggle">
        <button className={`wc-dash-mode ${mode === 'v2' ? 'is-active' : ''}`}   onClick={() => setMode('v2')}>v3</button>
        <button className={`wc-dash-mode ${mode === 'html' ? 'is-active' : ''}`} onClick={() => setMode('html')}>HTML</button>
      </div>

      <button
        className={`wc-dash-tb-btn wc-dash-edit-btn ${editMode ? 'is-active' : ''}`}
        onClick={onToggleEdit}
        title={editMode ? 'Exit edit mode (Esc)' : 'Edit — click iframe element, dbl-click text to edit inline'}
      >
        <Icon name="edit" /> Edit
      </button>
      <button
        className={`wc-dash-tb-btn wc-dash-comment-btn ${commentMode ? 'is-active' : ''}`}
        onClick={onToggleComment}
        title={commentMode ? 'Exit comment mode (Esc)' : 'Enter comment mode — drag to draw, type to annotate'}
      >
        <Icon name="comment" /> Comment {commentCount > 0 && <span className="wc-dash-tweak-badge">{commentCount}</span>}
      </button>
      <button
        className={`wc-dash-tb-btn wc-dash-inspect-btn ${inspectMode ? 'is-active' : ''}`}
        onClick={onToggleInspect}
        title={inspectMode ? 'Exit inspect mode (Esc)' : 'Inspect a section → pick a component to replace it with'}
      >
        <Icon name="inspect" /> Inspect &amp; Replace
      </button>

      <div className="wc-dash-approval-group">
        <button className="wc-dash-tb-btn wc-dash-approval wc-dash-looks-good" onClick={onMarkGood} title="Mark current as Looks good">
          <Icon name="check" /> Looks good
        </button>
        <button className="wc-dash-tb-btn wc-dash-approval wc-dash-needs-work" onClick={onMarkNeedsWork} title="Mark current as Needs work">
          <Icon name="flag" /> Needs work…
        </button>
      </div>

      <button
        className={`wc-dash-tb-btn wc-dash-tweaks-btn ${tweaksOpen ? 'is-active' : ''}`}
        onClick={onToggleTweaks}
        disabled={tweakCount === 0}
        title={tweakCount === 0 ? 'No tweaks defined for this component' : `${tweaksOpen ? 'Close' : 'Open'} tweaks (${tweakCount} controls)`}
      >
        <Icon name="tweaks" /> Tweaks {tweakCount > 0 && <span className="wc-dash-tweak-badge">{tweakCount}</span>}
      </button>
    </header>
  );
}

function CatSection({ cat, activeId, statusMap, getStatus, cycleStatus, onPick, dndOnDragStart, dndOnDragEnd }) {
  return (
    <div className="wc-dash-cat">
      <h3 className="wc-dash-cat-title">{cat.cat}</h3>
      {cat.children.map((child, ci) => {
        if (child.items) {
          // Sub-grouped (Foundations → Type, Colors, Spacing)
          return (
            <div className="wc-dash-subcat" key={ci}>
              <h4 className="wc-dash-subcat-title">{child.sub}</h4>
              <ul className="wc-dash-list">
                {child.items.map(item => (
                  <Row key={item.id} item={item} activeId={activeId} status={getStatus(item.id)} cycleStatus={cycleStatus} onPick={onPick} dndOnDragStart={dndOnDragStart} dndOnDragEnd={dndOnDragEnd} />
                ))}
              </ul>
            </div>
          );
        }
        return (
          <ul className="wc-dash-list" key={ci}>
            <Row item={child} activeId={activeId} status={getStatus(child.id)} cycleStatus={cycleStatus} onPick={onPick} dndOnDragStart={dndOnDragStart} dndOnDragEnd={dndOnDragEnd} />
          </ul>
        );
      })}
    </div>
  );
}

function Row({ item, activeId, status, cycleStatus, onPick, dndOnDragStart, dndOnDragEnd }) {
  const isActive = activeId === item.id;
  const draggable = !!item.v2;  // only v2-mapped items are draggable
  return (
    <li>
      <button
        type="button"
        className={`wc-dash-item ${isActive ? 'is-active' : ''} ${draggable ? 'is-draggable' : ''}`}
        onClick={() => onPick(item.id)}
        draggable={draggable}
        onDragStart={draggable ? dndOnDragStart(item) : undefined}
        onDragEnd={draggable ? dndOnDragEnd : undefined}
        title={draggable ? `${item.label} — click to view, drag into iframe to insert` : item.label}
      >
        <span className={`wc-dash-status-dot wc-dash-status-${status}`} onClick={(e) => { e.stopPropagation(); cycleStatus(item.id); }} title={`Status: ${status}. Click to cycle.`} />
        <span className="wc-dash-item-label">{item.label}</span>
        {item.v2 && <span className="wc-dash-v2-badge" title="Available in v2 — draggable">v2</span>}
      </button>
    </li>
  );
}

function Icon({ name }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'edit':    return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'comment': return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'inspect': return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>;
    case 'check':   return <svg {...props} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'flag':    return <svg {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
    case 'tweaks':  return <svg {...props}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
    default: return null;
  }
}
