/* ============================================================================
   Wildcard — Hero icons ambient physics
   Vanilla JS, zero dependencies, no build step.

   WHAT IT DOES
   The 8 icon tiles are square bodies that gently drift at all times, bounce
   elastically off each other AND the walls of a padded play area, and never
   overlap. Feel = little game pieces sliding + colliding on a table: fun,
   smooth, never aggressive.

   On top of the ambient drift there are three GENTLE input nudges
   (each optional, all inert under reduced-motion):
     - desktop: the cursor softly pushes nearby tiles aside
     - mobile/desktop: scroll speed gives the tiles a small vertical inertia
     - stretch: device tilt acts as a gentle gravity (iOS asks permission
       on first tap; silently does nothing if denied/unsupported)

   HOW IT WORKS
   Coordinates are the cluster's LOCAL (untransformed) space — read from
   offsetLeft/Top/Width, so CSS scaling and breakpoint resizes are handled
   transparently. Each tile is moved by a translate3d() delta from its CSS
   rest position; the CSS lattice (see icons-physics.css) is never touched.

   Per frame: gentle random steering (keeps motion alive + non-periodic)
   → integrate → wall bounce → speed clamped into a calm band → resolve
   pairwise square-vs-square collisions (separate on the shallower axis +
   swap that axis's velocity, equal-mass elastic).

   ACCESSIBILITY
   prefers-reduced-motion: reduce → the sim never starts and the CSS leaves
   the cluster fully static. Also reacts live to OS-setting changes.

   INTEGRATION (3 steps — see README.md for details)
   1. Markup: a container with class .hero-cluster holding 8 .tile children
      (any square absolutely-positioned tiles work).
   2. CSS: include icons-physics.css (or merge its few rules into yours).
   3. JS: include this file. It self-initializes on DOMContentLoaded.
   ========================================================================== */

(function () {
  'use strict';

  /* ── Reduced-motion guard ─────────────────────────────────────────────
     If the user prefers reduced motion, set a body class and STOP. CSS
     rules gated on body:not(.wcanim-no-motion) become inert; the sim
     never binds. Static page rendered at the rest state. */
  var rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyReducedMotion() {
    document.body.classList.toggle('wcanim-no-motion', rmQuery.matches);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyReducedMotion);
  } else {
    applyReducedMotion();
  }
  if (rmQuery.addEventListener) {
    rmQuery.addEventListener('change', applyReducedMotion);
  } else if (rmQuery.addListener) {
    rmQuery.addListener(applyReducedMotion);  // legacy Safari
  }
  function motionOn() { return !document.body.classList.contains('wcanim-no-motion'); }

  /* ── The sim ──────────────────────────────────────────────────────── */
  function initIconPhysics() {
    if (!motionOn()) return;
    var cluster = document.querySelector('.hero-cluster');
    if (!cluster) return;
    var tiles = Array.prototype.slice.call(cluster.querySelectorAll('.tile'));
    if (!tiles.length) return;

    /* Tuning — gentle table-top drift. All values in local px / px-per-frame
       at 60fps. These are the knobs to play with. */
    var MARGIN     = 34;     // play-area padding beyond the tile lattice — drift room + keeps tiles off the edges/heading
    var MIN_SPEED  = 0.15;   // never fully stops → always-moving ambient
    var MAX_SPEED  = 0.50;   // gentle ceiling → never aggressive
    var WANDER     = 0.016;  // per-frame random steering magnitude
    var HOME_PULL  = 0.002;  // very soft spring toward each tile's home — keeps the cluster cohesive. Set 0 for free-floating pieces.

    /* Input-nudge layer (on top of the ambient drift) — all gentle. */
    var PTR_RADIUS   = 220;   // cursor influence radius (local px)
    var PTR_STR      = 0.9;   // cursor repel strength (negate for attract)
    var SCROLL_FORCE = 0.004; // scroll-delta → vertical nudge impulse
    var SCROLL_MAX   = 1.2;   // cap on the scroll impulse
    var SCROLL_DECAY = 0.85;  // scroll impulse decay per frame
    var TILT_FORCE   = 0.5;   // device-tilt "gravity" magnitude
    var MAX_NUDGE    = 1.8;   // speed ceiling while an input is active (~108px/s)

    /* Square tiles → axis-aligned box collisions (perfect no-overlap).
       SIDE = tile size, HALF = ½ side, in local px. */
    var bounds = null, bodies = [], SIDE = 0, HALF = 0;

    function build() {
      tiles.forEach(function (t) { t.style.transform = ''; });   // clear to read true rest layout
      var tileSize = tiles[0].offsetWidth || 0;
      if (!tileSize || !cluster.offsetWidth) { bodies = []; return false; }  // hidden → skip
      SIDE = tileSize; HALF = tileSize / 2;
      // Lattice bounding box (local coords), then expand by MARGIN for padded walls.
      var minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
      tiles.forEach(function (t) {
        minL = Math.min(minL, t.offsetLeft);
        minT = Math.min(minT, t.offsetTop);
        maxR = Math.max(maxR, t.offsetLeft + t.offsetWidth);
        maxB = Math.max(maxB, t.offsetTop + t.offsetHeight);
      });
      bounds = { minX: minL - MARGIN, minY: minT - MARGIN, maxX: maxR + MARGIN, maxY: maxB + MARGIN };
      bodies = tiles.map(function (t, i) {
        var cx = t.offsetLeft + t.offsetWidth / 2;
        var cy = t.offsetTop + t.offsetHeight / 2;
        var a = (i / tiles.length) * Math.PI * 2 + 0.7;        // spread initial headings
        var sp = (MIN_SPEED + MAX_SPEED) / 2;
        return { tile: t, x: cx, y: cy, restX: cx, restY: cy,
                 vx: Math.cos(a) * sp, vy: Math.sin(a) * sp };
      });
      return true;
    }

    if (!build()) return;
    var raf = null;

    /* ── Pluggable input-force sources ────────────────────────────────
       Interchangeable: each returns a per-tile {fx,fy} added to the ambient
       sim, or null when inactive. Add a new input by pushing a function. */
    var pointer = { lx: 0, ly: 0, active: false };
    var scroll  = { impulse: 0 };
    var tilt    = { gx: 0, gy: 0, active: false };
    var forceSources = [
      function (b) {                                   // desktop: cursor repel
        if (!pointer.active) return null;
        var dx = b.x - pointer.lx, dy = b.y - pointer.ly, d = Math.hypot(dx, dy);
        if (d >= PTR_RADIUS || d === 0) return null;
        var f = PTR_STR * (1 - d / PTR_RADIUS);        // gentle, distance-falloff
        return { fx: (dx / d) * f, fy: (dy / d) * f };
      },
      function () {                                     // mobile: scroll nudge
        if (Math.abs(scroll.impulse) < 0.02) return null;
        return { fx: 0, fy: scroll.impulse };
      },
      function () {                                     // stretch: device tilt
        if (!tilt.active) return null;
        return { fx: tilt.gx, fy: tilt.gy };
      },
    ];
    function anyInput() { return pointer.active || tilt.active || Math.abs(scroll.impulse) > 0.05; }

    /* Pointer (desktop): cursor → cluster-local coords (handles any CSS
       scale + scroll position via live getBoundingClientRect). The listener
       sits on the nearest section (.hero) so the cluster itself can keep
       pointer-events: none. */
    var hero = document.querySelector('.hero') || cluster.parentElement || cluster;
    hero.addEventListener('mousemove', function (e) {
      var r = cluster.getBoundingClientRect();
      var sx = (r.width / cluster.offsetWidth) || 1, sy = (r.height / cluster.offsetHeight) || 1;
      pointer.lx = (e.clientX - r.left) / sx;
      pointer.ly = (e.clientY - r.top)  / sy;
      pointer.active = true;
    });
    hero.addEventListener('mouseleave', function () { pointer.active = false; });

    /* Scroll: scroll delta → decaying vertical nudge (inertia feel). */
    var lastSY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY, d = y - lastSY; lastSY = y;
      scroll.impulse += -d * SCROLL_FORCE;             // scroll down → tiles lag up
      if (scroll.impulse >  SCROLL_MAX) scroll.impulse =  SCROLL_MAX;
      if (scroll.impulse < -SCROLL_MAX) scroll.impulse = -SCROLL_MAX;
    }, { passive: true });

    /* Device orientation (stretch): tilt → gentle gravity. Feature-detect +
       iOS requestPermission() on a user gesture; graceful no-op if
       unsupported / denied / non-HTTPS. */
    function onOrient(e) {
      if (e == null || e.gamma == null || e.beta == null) return;
      tilt.gx = Math.max(-1, Math.min(1, e.gamma / 45)) * TILT_FORCE;
      tilt.gy = Math.max(-1, Math.min(1, e.beta  / 45)) * TILT_FORCE;
      tilt.active = true;
    }
    (function enableTilt() {
      var DOE = window.DeviceOrientationEvent;
      if (typeof DOE === 'undefined') return;          // unsupported → no-op
      if (typeof DOE.requestPermission === 'function') {
        var req = function () {                          // iOS 13+: needs a gesture
          window.removeEventListener('touchend', req); window.removeEventListener('click', req);
          try {
            DOE.requestPermission()
              .then(function (s) { if (s === 'granted') window.addEventListener('deviceorientation', onOrient); })
              .catch(function () {});                    // denied / non-HTTPS → no-op
          } catch (err) {}
        };
        window.addEventListener('touchend', req, { once: true });
        window.addEventListener('click', req, { once: true });
      } else {
        window.addEventListener('deviceorientation', onOrient);   // non-iOS
      }
    })();

    function step() {
      raf = requestAnimationFrame(step);
      if (!motionOn()) { cancelAnimationFrame(raf); raf = null; return; }

      var minX = bounds.minX + HALF, maxX = bounds.maxX - HALF;
      var minY = bounds.minY + HALF, maxY = bounds.maxY - HALF;

      /* Integrate: ambient (wander + soft home-pull) + input nudges
         + wall bounce + speed clamp (ceiling raised while an input is
         active, so nudges read but stay gentle). */
      var maxNow = anyInput() ? MAX_NUDGE : MAX_SPEED;
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        b.vx += (Math.random() * 2 - 1) * WANDER - HOME_PULL * (b.x - b.restX);
        b.vy += (Math.random() * 2 - 1) * WANDER - HOME_PULL * (b.y - b.restY);
        for (var s = 0; s < forceSources.length; s++) {
          var f = forceSources[s](b);
          if (f) { b.vx += f.fx; b.vy += f.fy; }
        }
        b.x += b.vx; b.y += b.vy;
        if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx); }
        else if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy); }
        else if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
        var sp = Math.hypot(b.vx, b.vy) || 1;
        var cl = sp < MIN_SPEED ? MIN_SPEED : (sp > maxNow ? maxNow : sp);
        if (cl !== sp) { b.vx = b.vx / sp * cl; b.vy = b.vy / sp * cl; }
      }
      scroll.impulse *= SCROLL_DECAY;   // decay the scroll nudge back to baseline

      /* Pairwise collisions — separate along the shallower-penetration
         axis + swap that axis's velocity (equal-mass elastic). Square
         tiles never overlap. */
      for (var a = 0; a < bodies.length; a++) {
        for (var c = a + 1; c < bodies.length; c++) {
          var p = bodies[a], q = bodies[c];
          var dx = q.x - p.x, dy = q.y - p.y;
          var penX = SIDE - Math.abs(dx);
          var penY = SIDE - Math.abs(dy);
          if (penX > 0 && penY > 0) {
            if (penX <= penY) {
              var sx = dx < 0 ? -1 : 1;
              p.x -= sx * penX / 2; q.x += sx * penX / 2;
              var tvx = p.vx; p.vx = q.vx; q.vx = tvx;   // swap x-velocity
            } else {
              var sy = dy < 0 ? -1 : 1;
              p.y -= sy * penY / 2; q.y += sy * penY / 2;
              var tvy = p.vy; p.vy = q.vy; q.vy = tvy;   // swap y-velocity
            }
          }
        }
      }

      /* Apply transforms (delta from CSS rest position, local coords). */
      for (var k = 0; k < bodies.length; k++) {
        var bb = bodies[k];
        bb.tile.style.transform = 'translate3d(' + (bb.x - bb.restX).toFixed(2) + 'px, ' + (bb.y - bb.restY).toFixed(2) + 'px, 0)';
      }
    }
    step();

    /* Rebuild on resize (tile sizes / cluster layout change at breakpoints). */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (build() && motionOn()) step();
      }, 200);
    });
  }

  /* ── Self-init ────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIconPhysics);
  } else {
    initIconPhysics();
  }
})();
