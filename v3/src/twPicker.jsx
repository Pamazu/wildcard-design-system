import { useState } from 'react';

/* =========================================================================
   v3 Tailwind token-picker (edit-mode) — tokens-PROMINENT, ALL sections

   Caller directive: "extend the tailwind to all, no absolute numbers."
   design-qa mock-v3: EVERY property section shows the Tailwind CLASS as the
   HERO readout; the computed value (px/keyword/%) is a small secondary
   teach-caption. NO absolute-number heroes anywhere.

   Cascade = DESKTOP-FIRST (team-lead): base = Desktop, scale DOWN via EXACT
   site breakpoints. 4 device tiers (design-qa ruling — site uses all four):
     Desktop = base ('')  ·  Tablet = max-[1180px]:  ·  Mobile = max-[860px]:
     ·  Phone = max-[480px]:

   Control types:
     scale → Tailwind numeric scale (snap-slider) + arbitrary off-scale
     named → a NAMED scale (radius none..full)        + arbitrary
     enum  → pick one class from a fixed option set (display/justify/weight…)
     dim   → arbitrary px value (+ named options like w-full) → base-[Npx]
     color → brand swatches + arbitrary hex             → base-[#hex]

   Finite classes (scale/named/enum/named-dim) render in the iframe via the
   @source-inline safelist. ARBITRARY tokens (base-[value]) can't be safelisted
   → Dashboard injects a per-element media-queried preview stylesheet built
   from `twArbCssForClassName` below (the className stays the source-of-truth
   Tailwind string; the injected CSS only renders the live preview).
   ========================================================================= */

export const TW_DEVICES = [
  { id: 'desktop', label: 'Desktop', prefix: '',              hint: 'base · all widths' },
  { id: 'tablet',  label: 'Tablet',  prefix: 'max-[1181px]:', hint: '≤ 1180px' },
  { id: 'mobile',  label: 'Mobile',  prefix: 'max-[861px]:',  hint: '≤ 860px' },
  { id: 'phone',   label: 'Phone',   prefix: 'max-[481px]:',  hint: '≤ 480px' },
];
export const TW_PREFIXES = TW_DEVICES.map(d => d.prefix).filter(Boolean);
// breakpoint prefix → max-width px (for the injected media-queried preview)
export function prefixMaxPx(prefix) { const m = /max-\[(\d+)px\]:/.exec(prefix); return m ? parseInt(m[1], 10) : null; }

// Normalize an element's class string. SVG elements expose `className` as an
// SVGAnimatedString (not a string), so a raw `el.className` breaks every regex
// read (`cn.match is not a function`). The breadcrumb can select SVGs, so read
// through this everywhere; writes go via setAttribute('class', …) (universal).
export function cnStr(el) {
  if (!el) return '';
  const c = el.className;
  return typeof c === 'string' ? c : (c && typeof c.baseVal === 'string' ? c.baseVal : '');
}

export const TW_SCALE = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32];
export const twStepPx = (s) => s * 4;
export const TW_TICKS = [0, 2, 4, 6, 8, 12, 16, 24, 32];
export const TW_OPACITY = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
export const TW_RADII = [
  { sfx: 'none', px: 0 }, { sfx: 'sm', px: 2 }, { sfx: '', px: 4 }, { sfx: 'md', px: 6 },
  { sfx: 'lg', px: 8 }, { sfx: 'xl', px: 12 }, { sfx: '2xl', px: 16 }, { sfx: '3xl', px: 24 },
  { sfx: 'full', px: 9999 },
];
export const TW_SWATCHES = [
  { hex: '#1b1a17', name: 'ink' }, { hex: '#f9f0ed', name: 'cream' }, { hex: '#f5ac53', name: 'amber' },
  { hex: '#4e8abe', name: 'blue' }, { hex: '#ed5a35', name: 'red' }, { hex: '#bb95ba', name: 'mauve' },
  { hex: '#199562', name: 'green' }, { hex: '#ffffff', name: 'white' },
];

const _esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ── section + property config ─────────────────────────────────────────── */
export const TW_SECTIONS = [
  { id: 'layout', title: 'Layout', props: [
    { key: 'display', label: 'Display', type: 'enum', css: 'display', opts: [
      { t: 'flex', lbl: 'flex', v: 'flex' }, { t: 'grid', lbl: 'grid', v: 'grid' }, { t: 'block', lbl: 'block', v: 'block' },
      { t: 'inline-block', lbl: 'inline-block', v: 'inline-block' }, { t: 'hidden', lbl: 'none', v: 'none' } ] },
    { key: 'flexdir', label: 'Direction', type: 'enum', css: 'flex-direction', opts: [
      { t: 'flex-row', lbl: 'row', v: 'row' }, { t: 'flex-col', lbl: 'column', v: 'column' } ] },
    { key: 'justify', label: 'Justify', type: 'enum', css: 'justify-content', opts: [
      { t: 'justify-start', lbl: 'start', v: 'flex-start' }, { t: 'justify-center', lbl: 'center', v: 'center' },
      { t: 'justify-between', lbl: 'space-between', v: 'space-between' }, { t: 'justify-end', lbl: 'end', v: 'flex-end' },
      { t: 'justify-around', lbl: 'space-around', v: 'space-around' } ] },
    { key: 'items', label: 'Align', type: 'enum', css: 'align-items', opts: [
      { t: 'items-start', lbl: 'start', v: 'flex-start' }, { t: 'items-center', lbl: 'center', v: 'center' },
      { t: 'items-end', lbl: 'end', v: 'flex-end' }, { t: 'items-stretch', lbl: 'stretch', v: 'stretch' },
      { t: 'items-baseline', lbl: 'baseline', v: 'baseline' } ] },
    { key: 'position', label: 'Position', type: 'enum', css: 'position', opts: [
      { t: 'static', lbl: 'static', v: 'static' }, { t: 'relative', lbl: 'relative', v: 'relative' },
      { t: 'absolute', lbl: 'absolute', v: 'absolute' }, { t: 'fixed', lbl: 'fixed', v: 'fixed' },
      { t: 'sticky', lbl: 'sticky', v: 'sticky' } ] },
  ]},
  { id: 'size', title: 'Size', props: [
    { key: 'w',     label: 'Width',  type: 'dim', cssProp: 'width',     named: [{ t: 'w-full', lbl: '100%' }, { t: 'w-auto', lbl: 'auto' }] },
    { key: 'max-w', label: 'Max-W',  type: 'dim', cssProp: 'max-width', named: [{ t: 'max-w-full', lbl: '100%' }, { t: 'max-w-none', lbl: 'none' }] },
    { key: 'h',     label: 'Height', type: 'dim', cssProp: 'height',    named: [{ t: 'h-full', lbl: '100%' }, { t: 'h-auto', lbl: 'auto' }] },
  ]},
  { id: 'spacing', title: 'Spacing (self)', fig: 'padding · margin · gap', props: [
    { key: 'p',   label: 'Padding',   type: 'scale', help: 'Space inside an element.' },
    { key: 'px',  label: 'Padding X', type: 'scale', help: 'Left + right inner padding.' },
    { key: 'py',  label: 'Padding Y', type: 'scale', help: 'Top + bottom inner padding.' },
    { key: 'pt',  label: 'Padding ↑', type: 'scale', perSide: 'pad', help: 'Top inner padding.' },
    { key: 'pr',  label: 'Padding →', type: 'scale', perSide: 'pad', help: 'Right inner padding.' },
    { key: 'pb',  label: 'Padding ↓', type: 'scale', perSide: 'pad', help: 'Bottom inner padding.' },
    { key: 'pl',  label: 'Padding ←', type: 'scale', perSide: 'pad', help: 'Left inner padding.' },
    { key: 'm',   label: 'Margin',    type: 'scale', help: 'Space outside an element.' },
    { key: 'mx',  label: 'Margin X',  type: 'scale', help: 'Left + right outer margin.' },
    { key: 'my',  label: 'Margin Y',  type: 'scale', help: 'Top + bottom outer margin.' },
    { key: 'mt',  label: 'Margin ↑',  type: 'scale', perSide: 'mar', help: 'Top outer margin.' },
    { key: 'mr',  label: 'Margin →',  type: 'scale', perSide: 'mar', help: 'Right outer margin.' },
    { key: 'mb',  label: 'Margin ↓',  type: 'scale', perSide: 'mar', help: 'Bottom outer margin.' },
    { key: 'ml',  label: 'Margin ←',  type: 'scale', perSide: 'mar', help: 'Left outer margin.' },
    { key: 'gap', label: 'Gap',       type: 'scale', help: 'Even space between items in a flex/grid container.' },
  ]},
  { id: 'type', title: 'Typography', props: [
    { key: 'fontfam', label: 'Family',    type: 'enum', css: 'font-family', opts: [
      { t: "[font-family:var(--font-display)]", lbl: 'Roc Grotesk', v: 'var(--font-display)', match: 'Roc Grotesk' },
      { t: "[font-family:var(--font-body)]",    lbl: 'Montserrat',  v: 'var(--font-body)',    match: 'Montserrat' },
      { t: "[font-family:var(--font-mono)]",    lbl: 'Mono',        v: 'var(--font-mono)',    match: 'SF Mono' } ] },
    { key: 'text',    label: 'Size',      type: 'dim',  cssProp: 'font-size', named: [] },
    { key: 'font',    label: 'Weight',    type: 'enum', css: 'font-weight', opts: [
      { t: 'font-normal', lbl: '400', v: '400' }, { t: 'font-medium', lbl: '500', v: '500' },
      { t: 'font-semibold', lbl: '600', v: '600' }, { t: 'font-bold', lbl: '700', v: '700' }, { t: 'font-black', lbl: '900', v: '900' } ] },
    { key: 'leading', label: 'Leading',   type: 'dim',  cssProp: 'line-height', named: [{ t: 'leading-none', lbl: '1' }] },
    { key: 'tracking',label: 'Tracking',  type: 'enum', css: 'letter-spacing', opts: [
      { t: 'tracking-tight', lbl: '-.025em', v: '-0.025em' }, { t: 'tracking-normal', lbl: '0', v: 'normal' }, { t: 'tracking-wide', lbl: '.025em', v: '0.025em' } ] },
    { key: 'text-align', label: 'Align',  type: 'enum', css: 'text-align', opts: [
      { t: 'text-left', lbl: 'left', v: 'left' }, { t: 'text-center', lbl: 'center', v: 'center' }, { t: 'text-right', lbl: 'right', v: 'right' } ] },
    { key: 'transform', label: 'Transform', type: 'enum', css: 'text-transform', opts: [
      { t: 'uppercase', lbl: 'UPPER', v: 'uppercase' }, { t: 'lowercase', lbl: 'lower', v: 'lowercase' },
      { t: 'capitalize', lbl: 'Capitalize', v: 'capitalize' }, { t: 'normal-case', lbl: 'none', v: 'none' } ] },
  ]},
  { id: 'fill', title: 'Color / Fill', props: [
    { key: 'text', label: 'Text',       type: 'color', cssProp: 'color' },
    { key: 'bg',   label: 'Background', type: 'color', cssProp: 'background-color' },
  ]},
  { id: 'border', title: 'Border', fig: 'no-preflight: set Style too', props: [
    // Width + Color share base `border` (border-[6px] vs border-[#hex]) — the
    // non-hex/hex bracket split, same as text-size vs text-color.
    { key: 'border', label: 'Width', type: 'dim', cssProp: 'border-width',
      named: [{ t: 'border-0', lbl: '0px' }, { t: 'border', lbl: '1px' }, { t: 'border-2', lbl: '2px' }, { t: 'border-4', lbl: '4px' }, { t: 'border-8', lbl: '8px' }] },
    { key: 'border', label: 'Color', type: 'color', cssProp: 'border-color' },
    { key: 'bstyle', label: 'Style', type: 'enum', css: 'border-style', opts: [
      { t: 'border-solid', lbl: 'solid', v: 'solid' }, { t: 'border-dashed', lbl: 'dashed', v: 'dashed' },
      { t: 'border-dotted', lbl: 'dotted', v: 'dotted' }, { t: 'border-double', lbl: 'double', v: 'double' },
      { t: 'border-none', lbl: 'none', v: 'none' } ] },
  ]},
  { id: 'radius', title: 'Radius', props: [
    { key: 'rounded', label: 'Corners', type: 'named' },
  ]},
  { id: 'effects', title: 'Effects', props: [
    { key: 'opacity', label: 'Opacity', type: 'opacity' },
  ]},
];

/* ── scale (numeric) ───────────────────────────────────────────────────── */
export function twReadValue(className, base, prefix) {
  const cn = className || '';
  const reNum = new RegExp('(?:^| )' + _esc(prefix) + _esc(base) + '-(\\d+(?:\\.\\d+)?)(?= |$)');
  const mNum = cn.match(reNum);
  if (mNum) return { step: parseFloat(mNum[1]) };
  const reArb = new RegExp('(?:^| )' + _esc(prefix) + _esc(base) + '-\\[([^\\]]+)\\](?= |$)');
  const mArb = cn.match(reArb);
  if (mArb) return { arb: mArb[1] };
  return null;
}
export function twReadStep(className, base, prefix) { const v = twReadValue(className, base, prefix); return v && v.step != null ? v.step : null; }
export function twSetClass(className, base, prefix, value) {
  const re = new RegExp('(?:^| )' + _esc(prefix) + _esc(base) + '-(?:\\d+(?:\\.\\d+)?|\\[[^\\]]+\\])(?= |$)', 'g');
  let out = (' ' + (className || '') + ' ').replace(re, ' ').replace(/\s+/g, ' ').trim();
  if (value != null) { const token = typeof value === 'number' ? String(value) : value; out = (out + ' ' + prefix + base + '-' + token).trim(); }
  return out;
}
export function twNearestIdx(scale, px, stepToPx) {
  let bi = 0, bd = Infinity;
  scale.forEach((s, i) => { const d = Math.abs(stepToPx(s) - px); if (d < bd) { bd = d; bi = i; } });
  return bi;
}

/* ── dim (arbitrary px + named, e.g. w-full / w-[520px]) ───────────────── */
// 'text' base is shared by font-size (text-[19px]) AND color (text-[#hex]);
// dim reads/writes ONLY non-# bracket values so the two never collide.
function dimIsHex(v) { return typeof v === 'string' && v.trim().startsWith('#'); }
export function twReadDim(className, prop, prefix) {
  const cn = ' ' + (className || '') + ' ';
  for (const n of (prop.named || [])) if (new RegExp('(?:^| )' + _esc(prefix + n.t) + '(?= |$)').test(cn)) return { named: n.t, lbl: n.lbl };
  const m = cn.match(new RegExp('(?:^| )' + _esc(prefix + prop.key) + '-\\[([^\\]]+)\\](?= |$)'));
  if (m && !dimIsHex(m[1])) return { arb: m[1] };
  return null;
}
export function twSetDim(className, prop, prefix, value) {
  // value: { named:'w-full' } | { arb:'520px' } | null. Remove named + non-hex arbitrary for this base.
  let cn = ' ' + (className || '') + ' ';
  (prop.named || []).forEach(n => { cn = cn.replace(new RegExp('(?:^| )' + _esc(prefix + n.t) + '(?= |$)', 'g'), ' '); });
  cn = cn.replace(new RegExp('(?:^| )' + _esc(prefix + prop.key) + '-\\[([^\\]]+)\\](?= |$)', 'g'),
    (full, val) => dimIsHex(val) ? full : ' ');
  cn = cn.replace(/\s+/g, ' ').trim();
  if (value && value.named) cn = (cn + ' ' + prefix + value.named).trim();
  else if (value && value.arb != null) cn = (cn + ' ' + prefix + prop.key + '-[' + value.arb + ']').trim();
  return cn;
}

/* ── color (brand swatch or arbitrary hex; base text|bg) ───────────────── */
export function twReadColor(className, base, prefix) {
  const m = (' ' + (className || '') + ' ').match(new RegExp('(?:^| )' + _esc(prefix + base) + '-\\[(#[^\\]]+)\\](?= |$)'));
  return m ? m[1] : null;
}
export function twSetColor(className, base, prefix, hex) {
  let cn = (' ' + (className || '') + ' ').replace(
    new RegExp('(?:^| )' + _esc(prefix + base) + '-\\[#[^\\]]+\\](?= |$)', 'g'), ' ').replace(/\s+/g, ' ').trim();
  if (hex) cn = (cn + ' ' + prefix + base + '-[' + hex + ']').trim();
  return cn;
}

/* ── named scale (radius) ──────────────────────────────────────────────── */
function radiusToken(sfx) { return sfx ? 'rounded-' + sfx : 'rounded'; }
export function twReadRadiusIdx(className, prefix) {
  const cn = ' ' + (className || '') + ' ';
  for (let i = TW_RADII.length - 1; i >= 0; i--) if (new RegExp('(?:^| )' + _esc(prefix + radiusToken(TW_RADII[i].sfx)) + '(?= |$)').test(cn)) return i;
  return null;
}
export function twSetRadius(className, prefix, idx) {
  let cn = ' ' + (className || '') + ' ';
  TW_RADII.forEach(r => { cn = cn.replace(new RegExp('(?:^| )' + _esc(prefix + radiusToken(r.sfx)) + '(?= |$)', 'g'), ' '); });
  cn = cn.replace(/\s+/g, ' ').trim();
  if (idx != null) cn = (cn + ' ' + prefix + radiusToken(TW_RADII[idx].sfx)).trim();
  return cn;
}

/* ── opacity scale (opacity-{0..100}) ──────────────────────────────────── */
export function twReadOpacity(className, prefix) {
  const m = (' ' + (className || '') + ' ').match(new RegExp('(?:^| )' + _esc(prefix + 'opacity') + '-(\\d+)(?= |$)'));
  return m ? parseInt(m[1], 10) : null;
}
export function twSetOpacity(className, prefix, val) {
  let cn = (' ' + (className || '') + ' ').replace(new RegExp('(?:^| )' + _esc(prefix + 'opacity') + '-\\d+(?= |$)', 'g'), ' ').replace(/\s+/g, ' ').trim();
  if (val != null) cn = (cn + ' ' + prefix + 'opacity-' + val).trim();
  return cn;
}

/* ── enum ──────────────────────────────────────────────────────────────── */
export function twReadEnum(className, opts, prefix) {
  const cn = ' ' + (className || '') + ' ';
  for (const o of opts) if (new RegExp('(?:^| )' + _esc(prefix + o.t) + '(?= |$)').test(cn)) return o.t;
  return null;
}
export function twSetEnum(className, opts, prefix, token) {
  let cn = ' ' + (className || '') + ' ';
  opts.forEach(o => { cn = cn.replace(new RegExp('(?:^| )' + _esc(prefix + o.t) + '(?= |$)', 'g'), ' '); });
  cn = cn.replace(/\s+/g, ' ').trim();
  if (token != null) cn = (cn + ' ' + prefix + token).trim();
  return cn;
}

/* ── computed-baseline (R1) ──────────────────────────────────────────────
   When an element has no explicit (or Desktop-inherited) token for a property,
   reflect its EFFECTIVE computed value mapped to the nearest token, shown MUTED
   as "from CSS" — so a Figma-fluent caller sees the current state in Tailwind
   vocabulary instead of a blank "not set" panel (most v3 elements are still
   styled by base CSS until converted). Returns { util, val, idx? } or null when
   the property is not meaningfully set (row then shows "not set"). */
function _csNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function _rgbToHex(c) {
  const m = /rgba?\(([^)]+)\)/i.exec(c || ''); if (!m) return null;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  if (p.length >= 4 && p[3] === 0) return null;            // fully transparent → not set
  const h = n => ('0' + Math.max(0, Math.min(255, Math.round(n))).toString(16)).slice(-2);
  return '#' + h(p[0]) + h(p[1]) + h(p[2]);
}
export function twComputedBaseline(prop, el) {
  if (!el || el.nodeType !== 1) return null;
  const win = el.ownerDocument && el.ownerDocument.defaultView; if (!win) return null;
  let cs; try { cs = win.getComputedStyle(el); } catch (_) { return null; }
  const t = prop.type;
  if (t === 'scale') {
    let v;
    if (prop.key === 'p' || prop.key === 'm') {
      const pre = prop.key === 'p' ? 'padding' : 'margin';
      const s = [cs[pre + 'Top'], cs[pre + 'Right'], cs[pre + 'Bottom'], cs[pre + 'Left']].map(_csNum);
      if (s.some(x => x == null) || new Set(s).size > 1) return null;  // non-uniform → px/py rows cover it
      v = s[0];
    } else if (prop.key === 'px') { v = _csNum(cs.paddingLeft); }
    else if (prop.key === 'py') { v = _csNum(cs.paddingTop); }
    else if (prop.key === 'mx') { v = _csNum(cs.marginLeft); }
    else if (prop.key === 'my') { v = _csNum(cs.marginTop); }
    else if (prop.key === 'pt') { v = _csNum(cs.paddingTop); }
    else if (prop.key === 'pr') { v = _csNum(cs.paddingRight); }
    else if (prop.key === 'pb') { v = _csNum(cs.paddingBottom); }
    else if (prop.key === 'pl') { v = _csNum(cs.paddingLeft); }
    else if (prop.key === 'mt') { v = _csNum(cs.marginTop); }
    else if (prop.key === 'mr') { v = _csNum(cs.marginRight); }
    else if (prop.key === 'mb') { v = _csNum(cs.marginBottom); }
    else if (prop.key === 'ml') { v = _csNum(cs.marginLeft); }
    else if (prop.key === 'gap') { v = _csNum(cs.rowGap); }           // 'normal' (non flex/grid) → null
    if (v == null || v === 0) return null;                            // 0 = default/absence → "not set", not a baseline
    const idx = twNearestIdx(TW_SCALE, v, twStepPx);
    return { util: `${prop.key}-${TW_SCALE[idx]}`, val: `= ${Math.round(v)}px`, idx };
  }
  if (t === 'dim') {
    if (prop.cssProp === 'border-width') {                               // only reflect a VISIBLE border
      if (cs.borderTopStyle === 'none') return null;
      const bw = _csNum(cs.borderTopWidth); if (!bw) return null;
      return { util: `border-[${Math.round(bw)}px]`, val: `= ${Math.round(bw)}px` };
    }
    const map = { width: 'width', 'max-width': 'maxWidth', height: 'height', 'font-size': 'fontSize', 'line-height': 'lineHeight' };
    const raw = cs[map[prop.cssProp] || 'width'];
    if (raw === 'none') return prop.key === 'max-w' ? { util: 'max-w-none', val: '= none' } : null;
    const v = _csNum(raw); if (v == null) return null;
    return { util: `${prop.key}-[${Math.round(v)}px]`, val: `= ${Math.round(v)}px` };
  }
  if (t === 'color') {
    let raw;
    if (prop.cssProp === 'border-color') {                               // only when a visible border exists
      if (cs.borderTopStyle === 'none' || !_csNum(cs.borderTopWidth)) return null;
      raw = cs.borderTopColor;
    } else raw = prop.cssProp === 'background-color' ? cs.backgroundColor : cs.color;
    const hex = _rgbToHex(raw);
    if (!hex) return null;
    const sw = TW_SWATCHES.find(s => s.hex.toLowerCase() === hex.toLowerCase());
    return { util: `${prop.key}-[${hex}]`, val: sw ? sw.name : hex };
  }
  if (t === 'named') {                                                 // radius
    const v = _csNum(cs.borderTopLeftRadius); if (v == null) return null;
    let bi = 0, bd = Infinity;
    TW_RADII.forEach((r, i) => { const rp = r.px >= 9000 ? 9999 : r.px, vv = v >= 9000 ? 9999 : v; const d = Math.abs(rp - vv); if (d < bd) { bd = d; bi = i; } });
    const r = TW_RADII[bi];
    return { util: r.sfx ? `rounded-${r.sfx}` : 'rounded', val: `= ${Math.round(v)}px`, idx: bi };
  }
  if (t === 'opacity') {
    const v = parseFloat(cs.opacity); if (isNaN(v)) return null;
    const pct = Math.round(v * 100);
    let bi = 0, bd = Infinity; TW_OPACITY.forEach((o, i) => { const d = Math.abs(o - pct); if (d < bd) { bd = d; bi = i; } });
    return { util: `opacity-${TW_OPACITY[bi]}`, val: `= ${pct}%`, idx: bi };
  }
  if (t === 'enum') {
    if (prop.css === 'font-family') {                                    // match by primary family (computed resolves the var)
      const ff = cs.fontFamily || '';
      const o = prop.opts.find(x => x.match && ff.toLowerCase().includes(x.match.toLowerCase()));
      return o ? { util: o.t, val: o.lbl } : null;
    }
    if (prop.css === 'border-style') {                                   // only reflect a visible border
      if (!_csNum(cs.borderTopWidth)) return null;
      const o = prop.opts.find(x => x.v === cs.borderTopStyle);
      return o ? { util: o.t, val: o.lbl } : null;
    }
    const camel = prop.css.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const o = prop.opts.find(x => x.v === cs[camel]);
    return o ? { util: o.t, val: o.lbl } : null;
  }
  return null;
}

/* ── R3: masked-dimension detection ────────────────────────────────────────
   A width/height token can be a visual no-op because the element is capped by
   its max-* counterpart (e.g. `w-full` / `w-[800px]` renders 520px because a
   `max-w-[520px]` caps it). Detect via computed style (width sits AT the cap,
   within 1px), then return the capping max-* TOKEN so the panel can name it +
   offer a one-click strip. Returns null when not capped, or when the cap comes
   from host CSS rather than a token (then surface info-only, no strip button —
   stripping a non-token is impossible and `max-w-none` wouldn't win the cascade
   on a not-yet-converted element). prefix-aware: prefers the active-breakpoint
   token, falls back to the base token (what binds at desktop render). */
export function twDetectDimCap(el, prop, prefix) {
  const axis = prop.key === 'w' ? { dim: 'width', max: 'maxWidth', mtok: 'max-w', word: 'max-width' }
    : prop.key === 'h' ? { dim: 'height', max: 'maxHeight', mtok: 'max-h', word: 'max-height' } : null;
  if (!axis || !el || el.nodeType !== 1) return null;
  const win = el.ownerDocument && el.ownerDocument.defaultView; if (!win) return null;
  let cs; try { cs = win.getComputedStyle(el); } catch (_) { return null; }
  if (cs[axis.max] === 'none') return null;
  const v = parseFloat(cs[axis.dim]), mv = parseFloat(cs[axis.max]);
  if (isNaN(v) || isNaN(mv) || mv <= 0) return null;
  if (Math.abs(v - mv) > 1) return null;            // width not at the cap → max-* isn't binding
  // Require the element COULD be wider if uncapped — else the parent (not max-*)
  // is the binding constraint and removing max-* would change nothing (no mask).
  const parent = el.parentElement;
  if (parent) {
    let pcs; try { pcs = win.getComputedStyle(parent); } catch (_) { pcs = null; }
    if (pcs) {
      const pad = axis.dim === 'width'
        ? (parseFloat(pcs.paddingLeft) || 0) + (parseFloat(pcs.paddingRight) || 0)
        : (parseFloat(pcs.paddingTop) || 0) + (parseFloat(pcs.paddingBottom) || 0);
      const pInner = (parseFloat(pcs[axis.dim]) || 0) - pad;
      if (!(pInner > mv + 1)) return null;          // parent not wider than the cap → cap isn't masking
    }
  }
  const cn = ' ' + ((el.className && el.className.baseVal != null ? el.className.baseVal : el.className) || '') + ' ';
  const find = (pfx) => {
    const mArb = cn.match(new RegExp('(?:^| )' + _esc(pfx + axis.mtok) + '-\\[([^\\]]+)\\](?= |$)'));
    if (mArb) return pfx + axis.mtok + '-[' + mArb[1] + ']';
    const mNum = cn.match(new RegExp('(?:^| )' + _esc(pfx + axis.mtok) + '-(\\d+(?:\\.\\d+)?|full|screen)(?= |$)'));
    if (mNum) return pfx + axis.mtok + '-' + mNum[1];
    return null;
  };
  const token = (prefix && find(prefix)) || find('');
  return { capPx: Math.round(mv), token, mtok: axis.mtok, word: axis.word };
}

/* ── arbitrary-token → CSS resolver (for the injected preview) ─────────────
   Maps each `base-[value]` arbitrary token to CSS declaration(s). Finite
   tokens are handled by the safelist, so only arbitrary tokens are resolved. */
const ARB_CSS = {
  p: ['padding'], px: ['padding-left', 'padding-right'], py: ['padding-top', 'padding-bottom'],
  pt: ['padding-top'], pb: ['padding-bottom'], pl: ['padding-left'], pr: ['padding-right'],
  m: ['margin'], mx: ['margin-left', 'margin-right'], my: ['margin-top', 'margin-bottom'],
  mt: ['margin-top'], mb: ['margin-bottom'], ml: ['margin-left'], mr: ['margin-right'],
  gap: ['gap'], 'gap-x': ['column-gap'], 'gap-y': ['row-gap'],
  w: ['width'], h: ['height'], 'min-w': ['min-width'], 'max-w': ['max-width'], 'min-h': ['min-height'], 'max-h': ['max-height'],
  leading: ['line-height'], tracking: ['letter-spacing'], rounded: ['border-radius'], bg: ['background-color'],
};
// One arbitrary token "base-[value]" (no prefix) → [{prop, value}].
export function twArbTokenCss(base, value) {
  if (base === 'text') return dimIsHex(value) ? [{ p: 'color', v: value }] : [{ p: 'font-size', v: value }];
  if (base === 'border') return dimIsHex(value) ? [{ p: 'border-color', v: value }] : [{ p: 'border-width', v: value }];
  const props = ARB_CSS[base];
  if (!props) return [];
  return props.map(p => ({ p, v: value }));
}
// ANY single token (finite OR arbitrary), no breakpoint prefix → [{p,v}].
// Finite tokens MUST resolve here too: Tailwind utilities live in @layer
// utilities, which LOSES to the project's unlayered CSS — so the injected
// preview (!important) is the only reliable renderer for an element that
// already has an unlayered rule for that property (e.g. .lede font-weight).
const DIM_NAMED_CSS = {
  'w-full': ['width', '100%'], 'w-auto': ['width', 'auto'],
  'max-w-full': ['max-width', '100%'], 'max-w-none': ['max-width', 'none'],
  'h-full': ['height', '100%'], 'h-auto': ['height', 'auto'], 'leading-none': ['line-height', '1'],
  'border-0': ['border-width', '0px'], 'border': ['border-width', '1px'],
  'border-2': ['border-width', '2px'], 'border-4': ['border-width', '4px'], 'border-8': ['border-width', '8px'],
};
export function twTokenCss(token) {
  const arb = /^([a-z-]+)-\[([^\]]+)\]$/.exec(token);
  if (arb) return twArbTokenCss(arb[1], arb[2]);
  const sc = /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(\d+(?:\.\d+)?)$/.exec(token);
  if (sc) { const props = ARB_CSS[sc[1]]; const v = twStepPx(parseFloat(sc[2])) + 'px'; return props ? props.map(p => ({ p, v })) : []; }
  const op = /^opacity-(\d+)$/.exec(token); if (op) return [{ p: 'opacity', v: String(parseInt(op[1], 10) / 100) }];
  if (token === 'rounded') return [{ p: 'border-radius', v: '4px' }];
  const rad = /^rounded-([\w]+)$/.exec(token); if (rad) { const r = TW_RADII.find(x => x.sfx === rad[1]); if (r) return [{ p: 'border-radius', v: r.px + 'px' }]; }
  if (DIM_NAMED_CSS[token]) return [{ p: DIM_NAMED_CSS[token][0], v: DIM_NAMED_CSS[token][1] }];
  for (const sec of TW_SECTIONS) for (const prop of sec.props) if (prop.opts) { const o = prop.opts.find(x => x.t === token); if (o) return [{ p: prop.css, v: o.v }]; }
  return [];
}
// Full className → { '<prefix>': [{p,v}, …] } resolving EVERY token, grouped by breakpoint prefix ('' = base).
export function twCssForClassName(className) {
  const out = {};
  (className || '').split(/\s+/).forEach(tok => {
    const m = /^((?:max-\[\d+px\]:)?)(.+)$/.exec(tok);
    if (!m) return;
    const decls = twTokenCss(m[2]);
    if (!decls.length) return;
    (out[m[1]] = out[m[1]] || []).push(...decls);
  });
  return out;
}

/* Build + inject the per-element arbitrary-token preview stylesheet into `doc`
   (id `wc-tw-arb`). `entries` = [[selector, className], …]. Resolves every
   token to !important declarations (beats the project's unlayered CSS), wrapping
   breakpoint-prefixed tokens in `@media (max-width:Npx)`. Shared by the Dashboard
   poll-effect AND applyClassName so a just-applied class is reflected in the SAME
   synchronous tick — else the panel's computed-style reads (R1 baselines, R3 cap
   detection) lag the rebuild by one effect cycle and read stale values. */
export function injectArbStylesheet(doc, entries) {
  if (!doc || !doc.head) return;
  const byPrefix = {};
  (entries || []).forEach(([sel, cls]) => {
    const grouped = twCssForClassName(cls);
    Object.entries(grouped).forEach(([prefix, decls]) => {
      const body = decls.map(d => `${d.p}:${d.v} !important`).join(';');
      (byPrefix[prefix] = byPrefix[prefix] || []).push(`${sel}{${body}}`);
    });
  });
  let css = (byPrefix[''] || []).join('\n');
  Object.keys(byPrefix).filter(p => p).forEach(prefix => {
    const px = prefixMaxPx(prefix);
    if (px) css += `\n@media (max-width:${px}px){${byPrefix[prefix].join('')}}`;
  });
  let style = doc.getElementById('wc-tw-arb');
  if (!style) { style = doc.createElement('style'); style.id = 'wc-tw-arb'; doc.head.appendChild(style); }
  style.textContent = css;
}

/* ── stable selector (unchanged) ───────────────────────────────────────── */
const TW_UTIL_RE = /^(?:max-\[[^\]]+\]:)?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|w|h|min-w|max-w|min-h|max-h|text|leading|tracking|rounded|font|justify|items|flex|grid|opacity|bg|border|cursor|appearance|outline|box|transition|object|overflow|select|whitespace|ring|shadow|accent|aspect|snap|scroll|isolate|backdrop|pointer-events|self)-?/;
const TW_BARE = new Set(['flex','grid','block','inline','inline-block','hidden','flex-wrap','flex-col','flex-row','items-center','items-start','items-end','items-baseline','items-stretch','justify-center','justify-between','justify-start','justify-end','justify-around','relative','absolute','fixed','sticky','static','truncate','uppercase','lowercase','capitalize','normal-case','text-left','text-center','text-right']);
// A token carrying an arbitrary value/property (`[...]`) OR a variant modifier
// (`focus:`/`hover:`/`placeholder:`/`max-[]:`) is ALWAYS a utility — neither shape
// occurs in semantic class names, so these two checks are false-positive-free and
// cover the whole arbitrary + modifier vocabulary without enumerating it.
export function isTwUtil(cls) { return !!cls && (cls.includes('[') || cls.includes(':') || TW_UTIL_RE.test(cls) || TW_BARE.has(cls)); }
export function buildStableSelector(el) {
  if (!el || el.nodeType !== 1) return null;
  const doc = el.ownerDocument; if (!doc) return null;
  const parts = []; let cur = el, depth = 0;
  while (cur && cur.nodeType === 1 && cur !== doc.body && cur !== doc.documentElement && depth < 6) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) { parts.unshift('#' + cur.id); break; }
    const cls = (typeof cur.className === 'string' ? cur.className.trim().split(/\s+/) : [])
      .filter(c => c && !c.startsWith('wc-dash-') && !c.startsWith('__') && !isTwUtil(c));
    if (cls.length) part = '.' + cls.join('.');
    parts.unshift(part);
    try { if (doc.querySelectorAll(parts.join(' > ')).length === 1) return parts.join(' > '); } catch (_) {}
    cur = cur.parentElement; depth++;
  }
  return parts.length ? parts.join(' > ') : null;
}

/* ── UI ────────────────────────────────────────────────────────────────── */
export function TwDeviceTabs({ device, setDevice, el }) {
  const cn = el ? cnStr(el) : '';
  const dev = TW_DEVICES.find(d => d.id === device) || TW_DEVICES[0];
  const hasOverride = (prefix) => prefix !== '' && new RegExp('(?:^| )' + _esc(prefix)).test(cn);
  return (
    <div className="wc-tw-bp">
      <div className="wc-tw-bp-label">Editing viewport</div>
      <div className="wc-tw-seg" role="tablist">
        {TW_DEVICES.map(d => (
          <button key={d.id} type="button" role="tab" title={d.hint}
            className={`wc-tw-segbtn${device === d.id ? ' is-active' : ''}`} onClick={() => setDevice(d.id)}>
            {d.label}{hasOverride(d.prefix) && <span className="wc-tw-segdot" title="has overrides" />}
          </button>
        ))}
      </div>
      <div className="wc-tw-bpctx">
        Editing <b>{dev.label}</b> → writes {dev.prefix ? <code>{dev.prefix}</code> : <code>base</code>}
        <span className="wc-tw-ctx-hint"> {dev.prefix ? `(applies ${dev.hint})` : '(all widths)'}</span>
      </div>
    </div>
  );
}

function Hero({ prefix, util, value, inherited, note }) {
  return (
    <span className="wc-tw-vstack">
      <span className="wc-tw-cls">
        {util ? <>{prefix && <span className="wc-tw-pfx">{prefix}</span>}<span className="wc-tw-util">{util}</span></>
              : <span className="wc-tw-unset-cls">—</span>}
      </span>
      <span className="wc-tw-px">{value != null ? value : 'not set'}{note ? ' · ' + note : (inherited ? ' · inherited' : '')}</span>
    </span>
  );
}
function Foot({ active, inherited, fromCss, prefix, baseLabel, set, verb }) {
  return (
    <div className="wc-tw-foot">
      {active ? <button className="wc-tw-reset" type="button" onClick={() => set(null)}>{prefix ? 'reset → inherit Desktop' : 'clear'}</button>
      : inherited ? <span className="wc-tw-inh">↑ inherited from Desktop{baseLabel ? <> (<code>{baseLabel}</code>)</> : null}</span>
      : fromCss ? <span className="wc-tw-inh">from base CSS — {verb || 'drag to set a token'}</span>
      : <span className="wc-tw-unset">not set — {verb || 'drag to add'}</span>}
    </div>
  );
}

function ScaleRow({ prop, prefix, className, onClassName, el }) {
  const [arb, setArb] = useState('');
  const cur = twReadValue(className, prop.key, prefix);
  const baseVal = prefix ? twReadValue(className, prop.key, '') : null;
  const inherited = !cur && !!baseVal;
  const css = (!cur && !baseVal) ? twComputedBaseline(prop, el) : null;
  const shown = cur || (inherited ? baseVal : null);
  const tokenOf = (v) => v == null ? null : (v.step != null ? `${prop.key}-${v.step}` : `${prop.key}-[${v.arb}]`);
  const valOf = (v) => v == null ? null : (v.step != null ? `= ${twStepPx(v.step)}px` : `= ${v.arb}`);
  const idx = shown ? (shown.step != null ? Math.max(0, TW_SCALE.indexOf(shown.step)) : twNearestIdx(TW_SCALE, parseFloat(shown.arb) || 0, twStepPx)) : (css ? css.idx : 0);
  const set = (value) => onClassName(twSetClass(cnStr(el), prop.key, prefix, value));
  const commitArb = () => { const n = parseFloat(arb); if (!isNaN(n)) { set(`[${n}px]`); setArb(''); } };
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label" title={prop.help}>{prop.label}</span>
        <Hero prefix={cur ? prefix : ''} util={shown ? tokenOf(shown) : (css ? css.util : null)} value={shown ? valOf(shown) : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      <input className={`wc-tw-slider${(inherited || css) ? ' is-inh' : ''}`} type="range" min="0" max={TW_SCALE.length - 1} step="1" value={idx}
        onChange={(e) => set(TW_SCALE[parseInt(e.target.value, 10)])} />
      <div className="wc-tw-ticks">{TW_TICKS.map(s => <span key={s} className="wc-tw-tick">{prop.key}-{s}</span>)}</div>
      <Foot active={cur != null} inherited={inherited} fromCss={!!css} prefix={prefix} baseLabel={tokenOf(baseVal)} set={set} />
      <div className="wc-tw-offscale">Off-scale?
        <input className="wc-tw-arb" type="number" placeholder="px" value={arb}
          onChange={(e) => setArb(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitArb(); }} onBlur={commitArb} />
        → <code>{prefix}{prop.key}-[{arb || '…'}px]</code></div>
    </div>
  );
}

function DimRow({ prop, prefix, className, onClassName, el }) {
  const [arb, setArb] = useState('');
  const cur = twReadDim(className, prop, prefix);
  const baseVal = prefix ? twReadDim(className, prop, '') : null;
  const inherited = !cur && !!baseVal;
  const css = (!cur && !baseVal) ? twComputedBaseline(prop, el) : null;
  const shown = cur || (inherited ? baseVal : null);
  const tokenOf = (v) => v == null ? null : (v.named ? v.named : `${prop.key}-[${v.arb}]`);
  const valOf = (v) => v == null ? null : (v.named ? `= ${v.lbl}` : `= ${v.arb}`);
  const set = (value) => onClassName(twSetDim(cnStr(el), prop, prefix, value));
  const commitArb = () => { const n = parseFloat(arb); if (!isNaN(n)) { set({ arb: `${n}px` }); setArb(''); } };
  const cap = twDetectDimCap(el, prop, prefix);       // R3: width/height masked by max-*
  const removeCap = (token) => onClassName((' ' + cnStr(el) + ' ').replace(new RegExp('(?:^| )' + _esc(token) + '(?= |$)', 'g'), ' ').replace(/\s+/g, ' ').trim());
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label">{prop.label}</span>
        <Hero prefix={(cur && cur.arb != null) ? prefix : (cur && cur.named ? prefix : '')} util={shown ? tokenOf(shown) : (css ? css.util : null)} value={shown ? valOf(shown) : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      {cap && (
        <div className="wc-tw-conflict">
          <span className="wc-tw-conflict-msg">⚠ Renders {cap.capPx}px — capped by {cap.token ? <code>{cap.token}</code> : <>{cap.word} (host CSS)</>}</span>
          {cap.token && <button type="button" className="wc-tw-conflict-rm" onClick={() => removeCap(cap.token)} title={`Strip ${cap.token} so the ${prop.key === 'w' ? 'width' : 'height'} can grow`}>Remove {cap.token}</button>}
        </div>
      )}
      {(prop.named && prop.named.length > 0) && (
        <div className="wc-tw-chips">
          {prop.named.map(n => (
            <button key={n.t} type="button" className={`wc-tw-chip${shown && shown.named === n.t ? ' is-active' : ''}`}
              onClick={() => set(cur && cur.named === n.t ? null : { named: n.t })}>{n.t}</button>
          ))}
        </div>
      )}
      <Foot active={cur != null} inherited={inherited} fromCss={!!css} prefix={prefix} baseLabel={tokenOf(baseVal)} set={set} verb="enter px or pick" />
      <div className="wc-tw-offscale">px value
        <input className="wc-tw-arb" type="number" placeholder="px" value={arb}
          onChange={(e) => setArb(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitArb(); }} onBlur={commitArb} />
        → <code>{prefix}{prop.key}-[{arb || '…'}px]</code></div>
    </div>
  );
}

function ColorRow({ prop, prefix, className, onClassName, el }) {
  const [hex, setHex] = useState('');
  const cur = twReadColor(className, prop.key, prefix);
  const baseVal = prefix ? twReadColor(className, prop.key, '') : null;
  const inherited = !cur && !!baseVal;
  const css = (!cur && !baseVal) ? twComputedBaseline(prop, el) : null;
  const shown = cur || (inherited ? baseVal : null);
  const sw = shown ? TW_SWATCHES.find(s => s.hex.toLowerCase() === shown.toLowerCase()) : null;
  const set = (h) => onClassName(twSetColor(cnStr(el), prop.key, prefix, h));
  const commitHex = () => { const h = hex.trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(h)) { set(h); setHex(''); } };
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label">{prop.label}</span>
        <Hero prefix={cur ? prefix : ''} util={shown ? `${prop.key}-[${shown}]` : (css ? css.util : null)} value={shown ? (sw ? sw.name : shown) : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      <div className="wc-tw-swatches">
        {TW_SWATCHES.map(s => (
          <button key={s.hex} type="button" title={s.name + ' ' + s.hex} style={{ background: s.hex }}
            className={`wc-tw-swatch${shown && shown.toLowerCase() === s.hex.toLowerCase() ? ' is-active' : ''}`}
            onClick={() => set(cur && cur.toLowerCase() === s.hex.toLowerCase() ? null : s.hex)} />
        ))}
      </div>
      <Foot active={cur != null} inherited={inherited} prefix={prefix} baseLabel={baseVal ? `${prop.key}-[${baseVal}]` : null} set={set} verb="pick a swatch" />
      <div className="wc-tw-offscale">hex
        <input className="wc-tw-arb wc-tw-arb-hex" type="text" placeholder="#rrggbb" value={hex}
          onChange={(e) => setHex(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitHex(); }} onBlur={commitHex} />
        → <code>{prefix}{prop.key}-[{hex || '#…'}]</code></div>
    </div>
  );
}

function NamedRow({ prop, prefix, className, onClassName, el }) {
  const cur = twReadRadiusIdx(className, prefix);
  const baseIdx = prefix ? twReadRadiusIdx(className, '') : null;
  const inherited = cur == null && baseIdx != null;
  const css = (cur == null && baseIdx == null) ? twComputedBaseline(prop, el) : null;
  const shownIdx = cur != null ? cur : (inherited ? baseIdx : null);
  const r = shownIdx != null ? TW_RADII[shownIdx] : null;
  const util = r ? (r.sfx ? `rounded-${r.sfx}` : 'rounded') : null;
  const set = (idx) => onClassName(twSetRadius(cnStr(el), prefix, idx));
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label">{prop.label}</span>
        <Hero prefix={cur != null ? prefix : ''} util={util || (css ? css.util : null)} value={r ? `= ${r.px}px${r.px === 9999 ? ' (pill)' : ''}` : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      <input className={`wc-tw-slider${(inherited || css) ? ' is-inh' : ''}`} type="range" min="0" max={TW_RADII.length - 1} step="1"
        value={shownIdx != null ? shownIdx : (css ? css.idx : 0)} onChange={(e) => set(parseInt(e.target.value, 10))} />
      <div className="wc-tw-ticks">{TW_RADII.map(rr => <span key={rr.sfx || 'd'} className="wc-tw-tick">{rr.sfx || 'sm'}</span>)}</div>
      <Foot active={cur != null} inherited={inherited} prefix={prefix} set={set} fromCss={!!css} />
    </div>
  );
}

function OpacityRow({ prop, prefix, className, onClassName, el }) {
  const cur = twReadOpacity(className, prefix);
  const baseV = prefix ? twReadOpacity(className, '') : null;
  const inherited = cur == null && baseV != null;
  const css = (cur == null && baseV == null) ? twComputedBaseline(prop, el) : null;
  const shown = cur != null ? cur : (inherited ? baseV : null);
  const idx = shown != null ? Math.max(0, TW_OPACITY.indexOf(shown)) : (css ? css.idx : TW_OPACITY.length - 1);
  const set = (v) => onClassName(twSetOpacity(cnStr(el), prefix, v));
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label">{prop.label}</span>
        <Hero prefix={cur != null ? prefix : ''} util={shown != null ? `opacity-${shown}` : (css ? css.util : null)} value={shown != null ? `= ${shown}%` : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      <input className={`wc-tw-slider${(inherited || css) ? ' is-inh' : ''}`} type="range" min="0" max={TW_OPACITY.length - 1} step="1" value={idx}
        onChange={(e) => set(TW_OPACITY[parseInt(e.target.value, 10)])} />
      <div className="wc-tw-ticks">{[0, 25, 50, 75, 100].map(v => <span key={v} className="wc-tw-tick">{v}</span>)}</div>
      <Foot active={cur != null} inherited={inherited} prefix={prefix} set={set} fromCss={!!css} />
    </div>
  );
}

function TwPropRow(props) {
  const t = props.prop.type;
  if (t === 'enum')    return <EnumRow {...props} />;
  if (t === 'named')   return <NamedRow {...props} />;
  if (t === 'dim')     return <DimRow {...props} />;
  if (t === 'color')   return <ColorRow {...props} />;
  if (t === 'opacity') return <OpacityRow {...props} />;
  return <ScaleRow {...props} />;
}

function EnumRow({ prop, prefix, className, onClassName, el }) {
  const cur = twReadEnum(className, prop.opts, prefix);
  const baseTok = prefix ? twReadEnum(className, prop.opts, '') : null;
  const inherited = !cur && !!baseTok;
  const css = (!cur && !baseTok) ? twComputedBaseline(prop, el) : null;
  const shown = cur || (inherited ? baseTok : null);
  const shownOpt = prop.opts.find(o => o.t === shown);
  const set = (token) => onClassName(twSetEnum(cnStr(el), prop.opts, prefix, token));
  return (
    <div className={`wc-tw-row${(inherited || css) ? ' is-inherited' : ''}`}>
      <div className="wc-tw-rh"><span className="wc-tw-label">{prop.label}</span>
        <Hero prefix={cur ? prefix : ''} util={shown || (css ? css.util : null)} value={shownOpt ? shownOpt.lbl : (css ? css.val : null)} inherited={inherited} note={css ? 'from CSS' : null} /></div>
      <div className="wc-tw-chips">
        {prop.opts.map(o => (
          <button key={o.t} type="button" className={`wc-tw-chip${shown === o.t ? ' is-active' : (css && css.util === o.t ? ' is-cssbase' : '')}`}
            onClick={() => set(shown === o.t && cur ? null : o.t)}>{o.t}</button>
        ))}
      </div>
      <Foot active={cur != null} inherited={inherited} prefix={prefix} baseLabel={baseTok} set={set} verb="pick one" fromCss={!!css} />
    </div>
  );
}

export function TwSections({ el, prefix, device, onClassName, selToken }) {
  const className = el ? cnStr(el) : '';
  const [perSideOpen, setPerSideOpen] = useState(false);
  // Per-side collapse (design-qa ruling): when a box's sides are symmetric the
  // axis rows (px/py, mx/my) fully describe it → hide the 4 per-side rows;
  // auto-show them when asymmetric (the only way to see/edit the difference).
  // The header toggle force-reveals them on demand even when symmetric.
  let padSym = true, marSym = true;
  if (el) {
    try {
      const cs = el.ownerDocument.defaultView.getComputedStyle(el);
      const n = (x) => parseFloat(x) || 0;
      padSym = n(cs.paddingTop) === n(cs.paddingBottom) && n(cs.paddingLeft) === n(cs.paddingRight);
      marSym = n(cs.marginTop) === n(cs.marginBottom) && n(cs.marginLeft) === n(cs.marginRight);
    } catch (_) {}
  }
  const showProp = (prop) => {
    if (!prop.perSide) return true;
    if (perSideOpen) return true;
    if (twReadValue(className, prop.key, prefix) != null) return true;  // explicit per-side token → always visible
    return prop.perSide === 'pad' ? !padSym : !marSym;
  };
  return (
    <>
      {TW_SECTIONS.map(section => {
        const hasPerSide = section.props.some(p => p.perSide);
        return (
          <div key={section.id} className="wc-dash-edit-section wc-tw-section">
            <div className="wc-dash-edit-section-title wc-tw-sectitle">
              {section.title}{section.fig && <span className="wc-tw-secfig">{section.fig}</span>}
              {hasPerSide && (
                <button type="button" className={`wc-tw-perside${perSideOpen ? ' is-on' : ''}`}
                  onClick={() => setPerSideOpen(v => !v)}
                  title="Show/hide individual side rows (auto-shown when sides differ)">per-side</button>
              )}
            </div>
            {section.props.filter(showProp).map(prop => (
              <TwPropRow key={prop.key + '-' + prop.label + '-' + device + '-' + selToken}
                prop={prop} prefix={prefix} className={className} el={el} onClassName={onClassName} />
            ))}
          </div>
        );
      })}
    </>
  );
}
