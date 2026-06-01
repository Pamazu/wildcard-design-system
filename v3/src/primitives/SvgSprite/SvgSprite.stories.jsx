import SvgSprite from './SvgSprite.jsx';

export default {
  title: 'Primitives/SvgSprite',
  component: SvgSprite,
};

// SvgSprite is invisible (sprite sheet) — render a usage example showing icons referenced via <use>
export const IconReferences = {
  render: () => (
    <>
      <SvgSprite />
      <div style={{ display: 'flex', gap: 12, padding: 24 }}>
        {['martini','wine','flute','beer','heart','star','spade','clubs','diamond','meeple','chess','cd','lines'].map(id =>
          <svg key={id} width={48} height={48} viewBox="0 0 125 125"><use href={`#i-${id}`} /></svg>
        )}
      </div>
    </>
  ),
};
