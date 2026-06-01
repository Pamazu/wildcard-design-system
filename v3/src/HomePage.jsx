import SvgSprite from './primitives/SvgSprite/SvgSprite.jsx';
import Nav from './components/Nav/Nav.jsx';
import Hero from './components/Hero/Hero.jsx';
import FoodDrink from './components/FoodDrink/FoodDrink.jsx';
import Games from './components/Games/Games.jsx';
import Locations from './components/Locations/Locations.jsx';
import Events from './components/Events/Events.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import Connected from './components/Connected/Connected.jsx';
import Newsletter from './components/Newsletter/Newsletter.jsx';
import Footer from './components/Footer/Footer.jsx';

/* HomePage — composes all sections into the full homepage.
 *
 * `.wc-home` class on the root wrapper is the HOMEPAGE-SCOPE for composition
 * rules. Rules that exist ONLY because sections compose (e.g. `.hero-fd`
 * overlapping into `.hero` via `margin-top:-514px`) live behind `.wc-home`
 * in CSS so the components stay intrinsically clean. This lets standalone
 * component routes (`?component=FoodDrink`, etc.) render the component in
 * its NATURAL form — no negative-margin off-screen pulls, no min-height
 * hacks. Per #79 architectural refactor. */
export default function HomePage() {
  return (
    <div className="wc-home">
      <SvgSprite />
      <Nav />
      <Hero />
      <FoodDrink />
      <Games />
      <Locations />
      <Events />
      <Testimonials />
      <Connected />
      <Newsletter />
      <Footer />
    </div>
  );
}
