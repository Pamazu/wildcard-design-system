import React from 'react';

import Btn from '../../primitives/Btn/Btn.jsx';
import Deco from '../../primitives/Deco/Deco.jsx';

/* Events — "Events & Big Group Reservations" section.
   Layout/type/visual → Tailwind utilities (#36 5/6, design-qa RULED):
   grid = 1.5fr/1fr flexing + max-[861px]:grid-cols-1 collapse
   (copy then photo; photo fluid max-width:100%). */
export default function Events() {
  return (
    <section
      className="events bg-transparent pt-20 px-20 pb-14 max-[861px]:px-8 max-[481px]:pt-16 max-[481px]:px-5"
      aria-label="Events"
    >
      <div className="events-inner max-w-[1280px] mx-auto grid grid-cols-[1.5fr_1fr] max-[861px]:grid-cols-1 gap-6 items-center">
        <div className="events-copy">
          <h2 className="[font-family:var(--font-display)] [font-stretch:125%] font-medium text-[clamp(42px,5vw,64px)] max-[481px]:text-[clamp(32px,9vw,48px)] uppercase m-0 mb-5 leading-[1.05]">
            Events &amp;<br/>
            <Deco text="BIG" /> <Deco text="GROUP" /><br/>
            Reservations
          </h2>
          <p className="text-[16px] leading-[1.6] text-[rgba(27,26,23,0.72)] m-0 mb-8 max-w-[480px]">Planning a birthday, team outing, or date night for 20? We host private events, group reservations, and everything in between. Let us take care of the details so you can focus on the fun.</p>
          <div className="events-ctas flex gap-[14px] flex-wrap">
            <Btn text="Book Now in Chicago" variant="red" />
            <Btn text="Learn More" variant="red" />
          </div>
        </div>
        <div
          className="events-photo aspect-[3/4] w-full max-w-none justify-self-end border-4 border-[#ed5a35] rounded-none bg-cover bg-center bg-[#f5e5e0]"
          style={{backgroundImage: "url('../assets/photography/hero-6.jpg')"}}
          aria-hidden="true"
        ></div>
      </div>
    </section>
  );
}
