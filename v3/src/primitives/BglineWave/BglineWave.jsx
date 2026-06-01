/* BglineWave — the shared SVG wave for any `.wc-bgline` section.
   Single source of truth for the bezier `M -40 146 C 701 604, 863 -235,
   1485 305` curve geometry. Renders the two paths the wc-bgline CSS
   utility expects:
     1. `.ink-fill` — dark closed shape above the curve, eliminates the
        subpixel AA gap between the ink mask and the stroke (paints in
        the same SVG coord space so there is zero gap).
     2. The stroke-only path — gets the yellow stroke from CSS.
   The `--flip` variant (footer) is handled entirely by CSS
   `transform: scaleY(-1)` on the parent — this component is identical
   in both Hero and Footer call-sites. */
export default function BglineWave() {
  return (
    <svg className="wc-bgline__stroke" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
      <path className="ink-fill" d="M -40 146 C 701 604, 863 -235, 1485 305 L 1500 -20 L -60 -20 Z"/>
      <path d="M -40 146 C 701 604, 863 -235, 1485 305" />
    </svg>
  );
}
