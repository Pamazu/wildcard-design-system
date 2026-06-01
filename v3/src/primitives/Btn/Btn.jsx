/* Btn — shared button primitive. Styling lives in `src/styles/btn.css`
 * (global tokens + chrome) and is imported once in main.jsx. */
export default function Btn({ text, variant = 'yellow', size = 'btn-sm', className = '', type = 'button', onClick }) {
  return (
    <button className={`btn btn-${variant} ${size} ${className}`} type={type} onClick={onClick}>
      <span className="btn-label">
        <span>{text}</span>
        <span>{text}</span>
      </span>
      <span className="btn-arrow" aria-hidden="true">
        <svg viewBox="3 4 18 16" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}

/* BrandIcon lives in ../BrandIcon.jsx (own file per spec). */
