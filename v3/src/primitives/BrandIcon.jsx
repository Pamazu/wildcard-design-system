/* BrandIcon — renders a brand-system icon (asterisk, star, suit, etc.)
   via <use> reference to the SvgSprite mounted once at top of page. */
export default function BrandIcon({ id, size, className = '' }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg viewBox="0 0 125 125" style={style} className={className}>
      <use href={`#i-${id}`} />
    </svg>
  );
}
