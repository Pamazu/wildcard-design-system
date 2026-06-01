import { lazy, Suspense, Fragment } from 'react';
import HomePage from './HomePage.jsx';
import SvgSprite from './primitives/SvgSprite/SvgSprite.jsx';
import './styles/standalone-mount.css';

// Dashboard is lazy so its CSS doesn't load on the homepage render path.
const Dashboard = lazy(() => import('./Dashboard.jsx'));

/* Lazy-loaded section + primitive components. Single source of truth —
   dashboard sidebar drives which one mounts via ?component=<Name>. */
const COMPONENTS = {
  // Sections
  Nav:          lazy(() => import('./components/Nav/Nav.jsx')),
  Hero:         lazy(() => import('./components/Hero/Hero.jsx')),
  FoodDrink:    lazy(() => import('./components/FoodDrink/FoodDrink.jsx')),
  Games:        lazy(() => import('./components/Games/Games.jsx')),
  Locations:    lazy(() => import('./components/Locations/Locations.jsx')),
  Events:       lazy(() => import('./components/Events/Events.jsx')),
  Testimonials: lazy(() => import('./components/Testimonials/Testimonials.jsx')),
  Connected:    lazy(() => import('./components/Connected/Connected.jsx')),
  Newsletter:   lazy(() => import('./components/Newsletter/Newsletter.jsx')),
  Footer:       lazy(() => import('./components/Footer/Footer.jsx')),
  // Primitives — useful for dashboard browsing
  Btn:          lazy(() => import('./primitives/Btn/Btn.jsx')),
  Deco:         lazy(() => import('./primitives/Deco/Deco.jsx')),
  BglineWave:   lazy(() => import('./primitives/BglineWave/BglineWave.jsx')),
};

/* App — routes based on URL query string.
 *   ?dashboard=1      → Dashboard component browser (also the PROD default, #82)
 *   ?component=<Name> → mount that single component standalone (dashboard mode)
 *   ?home=1           → force the full HomePage even in PROD
 *   no param          → PROD: Dashboard · DEV: full HomePage (#82)
 *
 * Standalone mounts always include <SvgSprite /> so icons resolve via <use href="#i-...">.
 * The dashboard's existing sidebar populates the URL parameter; the dev server
 * (localhost:5173) serves the result and Vite HMR keeps it live as JSX/CSS change. */
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const componentName = params.get('component');
  const dashboardMode = params.get('dashboard') === '1';

  // Dashboard mode — full-viewport component browser.
  // Renders OVER the homepage as a fixed overlay.
  if (dashboardMode) {
    return (
      <Suspense fallback={<div style={{ padding: 40, fontFamily: 'Montserrat, sans-serif' }}>Loading dashboard…</div>}>
        <Dashboard />
      </Suspense>
    );
  }

  if (componentName && COMPONENTS[componentName]) {
    const Component = COMPONENTS[componentName];
    return (
      <Fragment>
        <SvgSprite />
        {/* Standalone mount — component renders in its INTRINSIC form.
            Homepage-composition rules (overlap negative margins etc.) are
            scoped to `.wc-home` per #79 architectural refactor and are NOT
            applied here. No wrapper class needed → component is naturally
            self-contained. */}
        <Suspense fallback={<div style={{ padding: 40, fontFamily: 'Montserrat, sans-serif' }}>Loading {componentName}…</div>}>
          {componentName === 'Btn' && (
            <div style={{ padding: 40 }}><Component text="Reserve in Chicago" variant="yellow" /></div>
          )}
          {componentName === 'Deco' && (
            <div style={{ padding: 40, fontFamily: 'Roc Grotesk, sans-serif', fontSize: 120, fontWeight: 500 }}>
              <Component text="WILDCARD" />
            </div>
          )}
          {!['Btn', 'Deco'].includes(componentName) && <Component />}
        </Suspense>
      </Fragment>
    );
  }

  if (componentName) {
    return (
      <div style={{ padding: 40, fontFamily: 'Montserrat, sans-serif' }}>
        <h1>Unknown component: <code>{componentName}</code></h1>
        <p>Available components:</p>
        <ul>{Object.keys(COMPONENTS).map(n => <li key={n}>{n}</li>)}</ul>
      </div>
    );
  }

  // Default route (no dashboard/component param):
  //   • PROD (deployed) → Dashboard — the deployed v3 site IS the component
  //     browser, matching v1's deployed dashboard (#82). Reuses the same
  //     self-contained path ?dashboard=1 takes.
  //   • DEV (localhost) → HomePage — preserves the live homepage dev workflow.
  //   • Explicit ?home=1 forces HomePage even in PROD (capability preserved).
  // Placed AFTER the ?component check so standalone component routes are
  // unaffected in PROD (?component=Hero etc. still render their component).
  if (import.meta.env.PROD && params.get('home') !== '1') {
    return (
      <Suspense fallback={<div style={{ padding: 40, fontFamily: 'Montserrat, sans-serif' }}>Loading dashboard…</div>}>
        <Dashboard />
      </Suspense>
    );
  }

  return <HomePage />;
}
