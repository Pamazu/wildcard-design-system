import React, { useState, useRef, useEffect } from 'react';

import BrandIcon from '../../primitives/BrandIcon.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';
import './Testimonials.css';

/* Testimonials — horizontal "Fun Experience" slider.
   Card type/spacing → Tailwind utilities (#36 6/6). The carousel MECHANISM
   (.fe-slider / .fe-track / .fe-arrow + the useLayoutEffect JS + --fe-card-w
   vars + sprocket-teeth pseudo-elements) stays RESIDUAL in Testimonials.css.
   #13: the ≤860 carousel behavior (v3 JS-arrows vs v1 native scroll-snap) is
   caller-pending — HELD, not converted. */
function StarRating() {
  return (
    <span className="fe-stars inline-flex items-center gap-2" aria-label="5 out of 5 stars">
      {[0,1,2,3,4].map(i => (
        <span key={i} className="star block w-[30px] h-[30px] max-[481px]:w-6 max-[481px]:h-6">
          <BrandIcon id="star" />
        </span>
      ))}
    </span>
  );
}

function TestimonialCard({ title, quote, author }) {
  return (
    <article className="fe-card flex flex-col gap-[18px] text-left bg-[#1b1a17] text-[#f9f0ed] pt-16 px-11 pb-14 max-[861px]:pt-12 max-[861px]:px-8 max-[861px]:pb-11 max-[481px]:pt-11 max-[481px]:px-7 max-[481px]:pb-10">
      <h3 className="m-0 [font-family:var(--font-display)] [font-stretch:125%] font-medium uppercase leading-[1.05] text-[#f9f0ed] text-[42px] max-[861px]:text-[34px] max-[481px]:text-[28px]">{title}</h3>
      <StarRating />
      <p className="mt-1 [font-family:var(--font-body)] font-medium leading-[1.45] text-[rgba(255,255,255,0.92)] [text-wrap:pretty] text-[16px] max-[481px]:text-[14px]">{quote}</p>
      <div className="author mt-auto pt-3 [font-family:var(--font-body)] font-bold text-[16px] text-[#f9f0ed]">- {author}</div>
    </article>
  );
}

export default function Testimonials() {
  const testimonials = [
    { title: 'Strong Drinks',  quote: "Espresso martini and all the food we've had so far has been excellent. Atmosphere is exactly what a good neighborhood spot should feel like.", author: 'Maya L.' },
    { title: 'Fun Experience', quote: "Awesome spot to grab food and enjoy time with friends. The menu is great and the game selection is massive, there's something for everyone. Always a fun experience every time I go.", author: 'Dom R.' },
    { title: 'Great Service',  quote: "LOVE this place! I've been a bunch of times now with phenomenal service. Staff goes out of their way to make sure you're having a good time.", author: 'Sohban G.' },
    { title: 'Date Night',     quote: "Brought my partner here on a whim and it became our new spot. The vibe, the food, the games. Everything just works.", author: 'Alex P.' },
    { title: 'Pure Vibes',     quote: "I've had more conversations and laughs here than anywhere else in the city. They really nailed the formula for a fun night out.", author: 'Priya N.' },
  ];

  const trackRef = useRef(null);
  const sliderRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [index, setIndex] = useState(Math.floor(testimonials.length / 2));

  React.useLayoutEffect(() => {
    const track = trackRef.current;
    const slider = sliderRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    if (!track || !slider) return;

    const render = () => {
      const cards = track.children;
      if (!cards.length) return;
      const cardW = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).getPropertyValue('--fe-card-gap')) || 70;
      const step = cardW + gap;
      const containerW = slider.offsetWidth;
      const offset = containerW / 2 - cardW / 2 - index * step;
      track.style.transform = `translateX(${offset}px)`;
      if (prevBtn && nextBtn) {
        const arrowW = prevBtn.offsetWidth;
        const gapCenter = containerW / 2 - cardW / 2 - gap / 2;
        prevBtn.style.left = `${gapCenter - arrowW / 2}px`;
        prevBtn.style.right = 'auto';
        nextBtn.style.right = `${gapCenter - arrowW / 2}px`;
        nextBtn.style.left = 'auto';
        prevBtn.disabled = (index <= 0);
        nextBtn.disabled = (index >= cards.length - 1);
      }
    };
    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [index]);

  return (
    <section className="testimonials bg-transparent overflow-hidden text-center pt-[100px] pb-9 max-[861px]:pt-20 max-[481px]:pt-16" aria-label="Testimonials">
      <div className="testimonials-inner max-w-[1280px] mx-auto">
        <div className="fe-header text-center mb-14 px-20 max-[861px]:px-8 max-[481px]:px-5 max-[481px]:mb-10">
          <h2 className="[font-family:var(--font-display)] [font-stretch:125%] font-medium text-[clamp(42px,5vw,60px)] max-[481px]:text-[clamp(32px,9vw,48px)] uppercase m-0 leading-[1.05]">
            <Deco text="FUN" /> Experience
          </h2>
        </div>

        <div className="fe-slider" ref={sliderRef}>
          <div className="fe-track" ref={trackRef}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
          <button
            ref={prevRef}
            className="fe-arrow fe-arrow-prev"
            type="button"
            aria-label="Previous testimonial"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
          >
            <svg viewBox="3 4 18 16" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6 L6 12 L12 18"/>
              <path d="M19 6 L13 12 L19 18"/>
            </svg>
          </button>
          <button
            ref={nextRef}
            className="fe-arrow fe-arrow-next"
            type="button"
            aria-label="Next testimonial"
            onClick={() => setIndex(i => Math.min(testimonials.length - 1, i + 1))}
          >
            <svg viewBox="3 4 18 16" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6 L18 12 L12 18"/>
              <path d="M5 6 L11 12 L5 18"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
