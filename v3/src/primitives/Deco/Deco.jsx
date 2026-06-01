/* Deco — decorative letter treatment. Each letter gets color-cycling + bounce.
 * Styles live in src/styles/global.css under `.deco` (global because Hero,
 * Games, Connected, Footer all compose Deco). */
export default function Deco({ text }) {
  return (
    <span className="deco">
      {text.split('').map((ch, i) => <span key={i}>{ch}</span>)}
    </span>
  );
}
