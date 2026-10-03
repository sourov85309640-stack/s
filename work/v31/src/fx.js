/* fx (owner: global FX team). Page-wide atmosphere layer:
   1. ambient particles: declarative, one canvas layer per section (data-fx="leaves dust" data-fx-count="8"),
      falling back to DEFAULTS by section id when a section has no data-fx; data-fx="none" switches it off
   2. sky tint: a fixed overlay of stacked multiply layers whose opacities follow the scroll (morning, afternoon, dusk)
      plus an optional faint sun that arcs across the top
   3. roof edges: the .e-* ::before edges rise in as each section arrives (--fx-edge on the section, see fx.css)
   4. magnetic .btn on fine pointers (never on submit buttons)
   5. prototypes: survey-ring cursor follower, page-wide weather story, velocity skew on section images
   Variants for the judge: ?fxv=0..6 (0 = all off, control). Free mix for testing: ?fx=particles,tint,sun,edges,magnet,cursor,weather,skew
   Rules: everything runs from ONE RW.tick callback; offscreen sections sleep (IntersectionObserver); hidden tab sleeps;
   DPR capped at 2; dt clamped by RW.tick; nothing at all under reduced motion or data-motion="off" (feature is motion:true,
   CSS hooks only apply under html.has-motion). Edges are fully drawn without JS. */
(function () {
  'use strict';
  var RW = window.RW, d = document, root = d.documentElement;
  if (!RW) return;

  /* ---------------- variant switch ---------------- */
  var VARIANTS = {
    0: {},
    1: { particles: 1 },
    2: { particles: 1, tint: 1 },
    3: { particles: 1, tint: 1, weather: 1 },
    4: { tint: 1, sun: 1, edges: 1 },
    5: { cursor: 1, magnet: 1, edges: 1, skew: 1 },
    6: { particles: 1, tint: 1, edges: 1, magnet: 1 }
  };
  var DEFAULT_V = 6;
  var V = DEFAULT_V, F = VARIANTS[DEFAULT_V];
  try {
    var mv = /[?&]fxv=(\d)\b/.exec(location.search);
    if (mv && VARIANTS[mv[1]]) { V = +mv[1]; F = VARIANTS[V]; }
    RW.options.push({ id: 'atmosphere', param: 'fxv', allowed: ['6', '3', '1', '0'], names: ['Full atmosphere', 'Weather story', 'Particles only', 'Off'], current: String(V), label: 'Page atmosphere' });
    var mf = /[?&]fx=([a-z,]+)/.exec(location.search);
    if (mf) { F = {}; V = 'custom'; mf[1].split(',').forEach(function (k) { if (k) F[k] = 1; }); }
  } catch (e) {}
  root.setAttribute('data-fxv', String(V));

  /* ---------------- ambient defaults by section id (used only when a section has no data-fx) ---------------- */
  var DEFAULTS = {
    top: 'birds 3', hero: 'birds 3',
    services: 'leaves 6', where: 'rain 10', decide: 'dust 8', whole: 'dust 6',
    projects: 'leaves 5', checks: 'leaves 4', areas: 'dust 6', contact: 'dust 6'
  };
  /* the weather story (fxv=3) lets the page-wide weather layer carry the rain, and the sun breaks through after it */
  var WEATHER_DEFAULTS = { where: 'none', decide: 'dust 9' };

  /* palette (light theme, all used at low alpha) */
  var LEAF_COLS = ['#C98B62', '#DDA783', '#B9774E', '#A96B47', '#D29A6E'];
  var PETAL_COLS = ['#E8BBA9', '#EFCDBF', '#E2AE9A'];
  var TILE_COLS = ['#6E7E86', '#7D8B91', '#B0643F', '#A9714F'];
  var RAIN_RGB = '74,104,122';   /* slate blue */
  var MOTE_RGB = '178,128,86';   /* warm dust: darker than paper so it reads on light surfaces */
  var BIRD_RGB = '31,43,48';     /* ink */

  var EDGE_SEL = '.e-wave,.e-step,.e-rake,.e-hip,.e-saw,.e-arc,.e-zig,.e-terrace,.e-chim';
  var TAU = Math.PI * 2;
  var clamp = RW.clamp;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0 || 1), 0, 1); return t * t * (3 - 2 * t); }

  RW.add('fx', function () {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var vw = window.innerWidth, vh = window.innerHeight;
    var hidden = d.hidden;
    var sy = window.pageYOffset, lastSY = sy, vel = 0;   /* scroll position and smoothed velocity (px/s) */
    var px = -1e4, py = -1e4, pvx = 0, pvy = 0, pT = 0;  /* pointer (client px), its velocity, last move time */
    var now = 0;
    var cleanups = [];
    var docH = 1;

    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); cleanups.push(function () { t.removeEventListener(ev, fn, o); }); }

    /* ---------- section offsets: cached, re-measured on resize / ST refresh / body size change (no layout reads per frame) ---------- */
    var measured = [];   /* objects with .el, .top, .h */
    function track(el) { var m = { el: el, top: 0, h: 0 }; measured.push(m); return m; }
    function measure() {
      vw = window.innerWidth; vh = window.innerHeight;
      var s = window.pageYOffset;
      docH = Math.max(1, root.scrollHeight);
      for (var i = 0; i < measured.length; i++) {
        var r = measured[i].el.getBoundingClientRect();
        measured[i].top = r.top + s; measured[i].h = r.height;
      }
      if (tint) tint.build();
      if (weather) weather.build();
    }
    var mTimer = 0;
    function measureSoon() { clearTimeout(mTimer); mTimer = setTimeout(measure, 80); }

    /* ======================================================================
       1. AMBIENT PARTICLES
       ====================================================================== */
    var fields = [];
    var sprites = {};

    function bake(kind, col) {
      var key = kind + col;
      if (sprites[key]) return sprites[key];
      var S = Math.ceil(36 * DPR), out = {};
      ['face', 'back'].forEach(function (side) {
        var c = d.createElement('canvas'); c.width = S; c.height = S;
        var x = c.getContext('2d');
        x.translate(S / 2, S / 2); x.scale(S / 36, S / 36);
        x.fillStyle = col;
        if (side === 'back') { x.fillStyle = col; }
        if (kind === 'leaves') {
          x.beginPath();
          x.moveTo(-15, 0); x.bezierCurveTo(-7, -9.5, 7, -9, 15, 0); x.bezierCurveTo(7, 9, -7, 9.5, -15, 0); x.closePath();
          x.fill();
          if (side === 'back') { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(250,249,246,.45)'; x.fillRect(-18, -18, 36, 36); x.globalCompositeOperation = 'source-over'; }
          x.strokeStyle = side === 'face' ? 'rgba(250,249,246,.55)' : 'rgba(31,43,48,.18)';
          x.lineWidth = 0.9; x.beginPath(); x.moveTo(-17, 0.6); x.lineTo(12, 0); x.stroke();
          x.strokeStyle = col; x.lineWidth = 1.1; x.beginPath(); x.moveTo(-15, 0); x.lineTo(-18, 1.2); x.stroke();
        } else if (kind === 'petals') {
          x.beginPath();
          x.moveTo(-11, 0); x.bezierCurveTo(-8, -8, 9, -8, 11, -1); x.quadraticCurveTo(12, 0, 11, 1); x.bezierCurveTo(9, 8, -8, 8, -11, 0); x.closePath();
          x.fill();
          if (side === 'back') { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(250,249,246,.5)'; x.fillRect(-18, -18, 36, 36); }
        } else { /* tiles: an irregular chipped fragment, back side darker (the unglazed underside) */
          x.beginPath(); x.moveTo(-9, -6); x.lineTo(8, -7); x.lineTo(10, 3); x.lineTo(2, 7); x.lineTo(-8, 5); x.closePath();
          x.fill();
          x.globalCompositeOperation = 'source-atop';
          x.fillStyle = side === 'back' ? 'rgba(31,43,48,.22)' : 'rgba(250,249,246,.18)';
          x.fillRect(-18, -18, 36, side === 'back' ? 36 : 14);
        }
        out[side] = c;
      });
      sprites[key] = out;
      return out;
    }

    function parseSpec(s) {
      var kinds = [], count = 0;
      String(s || '').trim().split(/\s+/).forEach(function (t) {
        if (/^\d+$/.test(t)) count = +t;
        else if (/^(leaves|dust|rain|petals|tiles|birds)$/.test(t)) kinds.push(t);
      });
      return { kinds: kinds, count: count };
    }

    function sectionKey(el) {
      if (el.id && (DEFAULTS[el.id] || WEATHER_DEFAULTS[el.id])) return el.id;
      if (el.classList.contains('hero')) return 'hero';
      return el.id || '';
    }

    /* a scroll container between the host and the viewport breaks position:sticky: fall back to a JS-placed canvas */
    function stickyOK(el) {
      for (var n = el; n && n !== d.body && n !== root; n = n.parentElement) {
        var o = getComputedStyle(n);
        if (/(hidden|auto|scroll)/.test(o.overflowY + o.overflowX)) return false;
      }
      return true;
    }

    function mount(host) {
      if (host.querySelector(':scope > [data-fx-canvas]')) return;
      var attr = host.getAttribute('data-fx');
      if (attr && attr.trim() === 'none') return;
      var spec;
      if (attr) {
        spec = parseSpec(attr);
        var c = parseInt(host.getAttribute('data-fx-count'), 10);
        if (c > 0) spec.count = c;
      } else {
        var key = sectionKey(host);
        var src = (F.weather && key in WEATHER_DEFAULTS) ? WEATHER_DEFAULTS[key] : DEFAULTS[key];
        if (!src || src === 'none') return;
        spec = parseSpec(src);
      }
      if (!spec.kinds.length) return;
      if (!spec.count) spec.count = 8;

      var layer = d.createElement('div');
      layer.setAttribute('data-fx-canvas', '');
      layer.setAttribute('aria-hidden', 'true');
      layer.className = 'fx-layer';
      var cv = d.createElement('canvas');
      cv.className = 'fx-cv' + (spec.kinds.indexOf('dust') > -1 ? ' fx-beam' : '');
      layer.appendChild(cv);
      host.insertBefore(layer, host.firstChild);
      host.setAttribute('data-fx-on', spec.kinds.join(' '));

      var f = {
        host: host, layer: layer, cv: cv, ctx: cv.getContext('2d'), m: track(host),
        kinds: spec.kinds, count: spec.count, parts: [], w: 0, h: 0, on: false, dirty: false,
        sticky: stickyOK(host),
        band: (host.getAttribute('data-fx-band') || '0.2 0.4').split(/\s+/).map(Number)
      };
      if (!f.sticky) layer.classList.add('fx-js');
      fields.push(f);

      function size() {
        var w = cv.clientWidth, h = cv.clientHeight;
        if (!w || !h) return;
        if (Math.abs(w - f.w) < 1 && Math.abs(h - f.h) < 1) return;
        var first = !f.w;
        f.w = w; f.h = h;
        cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
        if (first || !f.parts.length) populate(f);
        else f.parts.forEach(function (p) { if (p.x > w + 40) p.x = rnd(0, w); if (p.y > h + 40) p.y = rnd(0, h); });
      }
      if ('ResizeObserver' in window) {
        var ro = new ResizeObserver(size); ro.observe(cv);
        cleanups.push(function () { ro.disconnect(); });
      } else { on(window, 'resize', size); }
      size();
      cleanups.push(RW.onView(host, {
        margin: '80px 0px 80px 0px',
        enter: function () { f.on = true; size(); },
        leave: function () { f.on = false; f.ctx.setTransform(1, 0, 0, 1, 0, 0); f.ctx.clearRect(0, 0, cv.width, cv.height); }
      }));
    }

    function populate(f) {
      var k = clamp(Math.sqrt((f.w * Math.min(f.h, vh)) / (1440 * 900)), 0.6, 1.15);
      var total = Math.min(12, Math.max(3, Math.round(f.count * k)));
      f.parts = [];
      for (var i = 0; i < total; i++) {
        var kind = f.kinds[i % f.kinds.length];
        if (kind === 'birds' && countKind(f, 'birds') >= Math.max(2, Math.round(f.count * k))) kind = f.kinds[0];
        var p = { kind: kind, i: i };
        spawn(p, f, true);
        f.parts.push(p);
      }
    }
    function countKind(f, k) { var n = 0; f.parts.forEach(function (p) { if (p.kind === k) n++; }); return n; }

    function spawn(p, f, initial) {
      var w = f.w, h = f.h, r = Math.random();
      p.vx = 0; p.vy = 0;
      /* three depth bands: far (small, faint, slow, lags the scroll), mid, near (few) */
      var band = r < 0.3 ? 0 : (r < 0.86 ? 1 : 2);
      p.band = band;
      p.depth = [0.18, 0.42, 0.7][band] * rnd(0.85, 1.15);
      p.x = rnd(-10, w + 10);
      if (p.kind !== 'rain' && p.kind !== 'birds' && Math.random() < 0.6) p.x = gutterX(w);
      p.y = initial ? rnd(-20, h) : -rnd(14, 60);
      if (p.kind === 'leaves' || p.kind === 'petals' || p.kind === 'tiles') {
        var tile = p.kind === 'tiles';
        p.spr = bake(p.kind, pick(tile ? TILE_COLS : (p.kind === 'leaves' ? LEAF_COLS : PETAL_COLS)));
        p.s = (tile ? rnd(9, 14) : rnd(21, 30)) * [0.6, 0.85, 1.15][band];
        p.fall = (tile ? rnd(55, 95) : rnd(16, 32)) * [0.7, 1, 1.35][band];
        p.spin = rnd(0, TAU); p.spinR = (tile ? rnd(3.5, 6.5) : rnd(1.1, 2.6)) * (Math.random() < 0.5 ? -1 : 1);
        p.roll = rnd(-0.6, 0.6); p.rollR = rnd(-0.45, 0.45);
        p.slip = tile ? rnd(6, 14) : rnd(22, 46);
        p.a = (tile ? rnd(0.38, 0.55) : rnd(0.36, 0.58)) * [0.7, 1, 1.05][band];
        p.wind = rnd(-3, 5);
      } else if (p.kind === 'rain') {
        p.len = rnd(16, 28) * [0.7, 1, 1.2][band];
        p.fall = rnd(380, 560) * [0.75, 1, 1.2][band];
        p.a = rnd(0.16, 0.28) * [0.7, 1, 1.15][band];
        p.slant = 0.24; /* dx per dy: light wind from the left */
        if (!initial) { p.y = -rnd(10, h * 0.6); p.x = rnd(-h * 0.25, w); }
      } else if (p.kind === 'dust') {
        p.y = rnd(0, h);
        p.x = beamX(f, p.y) + (Math.random() + Math.random() + Math.random() - 1.5) * 0.09 * w;
        p.fade = initial ? 1 : 0;
        p.r = rnd(1.6, 3.1) * [0.8, 1, 1.25][band];
        p.a = rnd(0.24, 0.42);
        p.ph = rnd(0, TAU); p.fr = rnd(0.25, 0.6);
        p.drift = rnd(-5, 5); p.rise = rnd(-4, 3);
      } else if (p.kind === 'birds') {
        p.dir = Math.random() < 0.7 ? 1 : -1;
        p.s = rnd(24, 34) * [0.8, 1, 1.12][band];
        p.sp = rnd(26, 44) * [0.7, 1, 1.2][band];
        p.x = initial ? rnd(0, w) : (p.dir > 0 ? -40 - rnd(0, w * 0.5) : w + 40 + rnd(0, w * 0.5));
        p.y = p.base = rnd(f.band[0], f.band[1]) * Math.min(h, vh);
        p.bob = rnd(0, TAU); p.flap = 0; p.wing = 0; p.next = rnd(1, 5); p.a = rnd(0.32, 0.5);
        p.depth = 0.12;
      }
    }

    /* most falling things keep to the outer gutters, where content is thinnest */
    function gutterX(w) { var u = Math.random(), e = Math.pow(Math.random(), 1.6) * 0.2 * w; return u < 0.5 ? e : w - e; }

    /* x of the light shaft's centre line at height y (same geometry as the 112deg CSS gradient, centre at 49%) */
    function beamX(f, y) { var gl = f.w * 0.927 + f.h * 0.375; return f.w / 2 - (0.01 * gl + (y - f.h / 2) * 0.375) / 0.927; }

    function stepField(f, dt, dScroll, ptr) {
      var w = f.w, h = f.h, parts = f.parts, i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        var k = p.kind;
        if (k === 'birds') {
          p.x += p.dir * p.sp * dt;
          p.bob += dt * 0.7;
          p.base -= dScroll * p.depth;
          p.y = p.base + Math.sin(p.bob) * 6;
          p.next -= dt;
          if (p.next <= 0 && p.flap <= 0) { p.flap = rnd(0.7, 1.3); p.next = rnd(3, 7); }
          if (p.flap > 0) { p.flap -= dt; p.wing += dt * 13; } else { p.wing += (Math.round(p.wing / TAU) * TAU - p.wing) * Math.min(1, dt * 6); }
          if ((p.dir > 0 && p.x > w + 50) || (p.dir < 0 && p.x < -50)) spawn(p, f, false);
          continue;
        }
        if (k === 'rain') {
          p.y += p.fall * dt - dScroll * p.depth;
          p.x += p.fall * p.slant * dt;
          if (p.y - p.len > h + 4 || p.x > w + 30) spawn(p, f, false);
          else if (p.y < -h * 0.7) { p.y += h * 1.4; }
          continue;
        }
        /* pointer disturbance (fine pointers only): a small push away plus a wake, settles back on its own */
        if (ptr) {
          var dx = p.x - ptr.x, dy = p.y - ptr.y, dd = dx * dx + dy * dy;
          if (dd < 8100) {
            var dist = Math.sqrt(dd) || 1, fo = 1 - dist / 90;
            p.vx += (dx / dist * 70 + ptr.vx * 0.12) * fo * dt * 6;
            p.vy += (dy / dist * 50 + ptr.vy * 0.08) * fo * dt * 6;
          }
        }
        var damp = Math.exp(-2.2 * dt);
        p.vx *= damp; p.vy *= damp;
        if (k === 'dust') {
          p.ph += p.fr * dt;
          p.x += (p.drift + Math.sin(p.ph * 1.3) * 6 + p.vx) * dt;
          p.y += (p.rise + Math.cos(p.ph) * 4 + p.vy) * dt - dScroll * p.depth * 0.6;
          if (p.fade < 1) p.fade = Math.min(1, p.fade + dt * 0.6);
          /* a mote that wanders out of the light (or off the canvas) fades back in somewhere inside it */
          if (p.y < -12 || p.y > h + 12 || Math.abs(p.x - beamX(f, p.y)) > 0.2 * w) spawn(p, f, false);
          continue;
        }
        /* leaves, petals, tiles: tumble about the long axis; the sideways slip is driven by the same angle */
        p.spin += p.spinR * dt;
        p.roll += p.rollR * dt + Math.sin(p.spin * 0.5) * 0.15 * dt;
        p.x += (Math.sin(p.spin) * p.slip + p.wind + p.vx) * dt;
        p.y += (p.fall + p.vy) * dt - dScroll * p.depth;
        if (p.y > h + 30) spawn(p, f, false);
        else if (p.y < -h * 0.6) { p.y = h + 20; p.x = rnd(0, w); }
        if (p.x < -30) p.x = w + 20; else if (p.x > w + 30) p.x = -20;
      }
    }

    function drawField(f) {
      var c = f.ctx, parts = f.parts, i, p;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, f.cv.width, f.cv.height);
      var rainPath = null;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        var k = p.kind;
        if (k === 'rain') {
          if (!rainPath) { c.setTransform(DPR, 0, 0, DPR, 0, 0); c.lineCap = 'round'; c.lineWidth = 1.15; }
          rainPath = 1;
          c.globalAlpha = 1;
          /* a streak: bright head, fading tail */
          c.strokeStyle = 'rgba(' + RAIN_RGB + ',' + p.a.toFixed(3) + ')';
          c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.len * 0.45 * p.slant, p.y - p.len * 0.45); c.stroke();
          c.strokeStyle = 'rgba(' + RAIN_RGB + ',' + (p.a * 0.45).toFixed(3) + ')';
          c.beginPath(); c.moveTo(p.x - p.len * 0.45 * p.slant, p.y - p.len * 0.45); c.lineTo(p.x - p.len * p.slant, p.y - p.len); c.stroke();
          continue;
        }
        if (k === 'dust') {
          /* motes catch the light where the beam crosses them (the beam itself is a CSS gradient on the canvas) */
          /* same geometry as the 112deg CSS gradient: position along the gradient line, beam centred at 49% */
          var gl = f.w * 0.927 + f.h * 0.375;
          var bt = ((p.x - f.w / 2) * 0.927 + (p.y - f.h / 2) * 0.375) / (gl || 1) + 0.5 - 0.49;
          var beam = Math.exp(-(bt * bt) / 0.005);
          var tw = (0.75 + 0.25 * Math.sin(p.ph * 2.1)) * (p.fade == null ? 1 : p.fade);
          c.setTransform(DPR, 0, 0, DPR, 0, 0);
          c.globalAlpha = 1;
          /* outside the light: a faint warm speck; inside it: a lit cream core with a soft gold halo */
          c.fillStyle = 'rgba(' + MOTE_RGB + ',' + (p.a * 0.5 * (1 - beam) * tw).toFixed(3) + ')';
          c.beginPath(); c.arc(p.x, p.y, p.r * 0.8, 0, TAU); c.fill();
          if (beam > 0.08) {
            c.fillStyle = 'rgba(214,160,104,' + (0.22 * beam * tw).toFixed(3) + ')';
            c.beginPath(); c.arc(p.x, p.y, p.r * 2.4, 0, TAU); c.fill();
            c.fillStyle = 'rgba(255,251,242,' + (0.9 * beam * tw).toFixed(3) + ')';
            c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill();
          }
          continue;
        }
        if (k === 'birds') { drawBird(c, p); continue; }
        /* tumbling sprite: translate, roll in plane, then scaleX by cos(spin) (edge-on at 0) */
        var sx = Math.cos(p.spin);
        if (Math.abs(sx) < 0.05) continue;
        var cr = Math.cos(p.roll), sr = Math.sin(p.roll), sc = p.s / 36;
        c.globalAlpha = p.a;
        c.setTransform(DPR * cr * sx * sc, DPR * sr * sx * sc, -DPR * sr * sc, DPR * cr * sc, p.x * DPR, p.y * DPR);
        var img = sx < 0 ? p.spr.back : p.spr.face;
        c.drawImage(img, -18, -18, 36, 36);
      }
      c.globalAlpha = 1;
    }

    /* a swallow seen from below: swept crescent wings, forked tail. Glides with the wings open; a beat
       foreshortens the wings (span 1 -> .35 -> 1) in short bursts */
    function drawBird(c, p) {
      var s = p.s / 26, sp = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(p.wing));
      c.setTransform(DPR * s * p.dir, 0, 0, DPR * s, p.x * DPR, p.y * DPR);
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(' + BIRD_RGB + ',' + p.a.toFixed(3) + ')';
      c.beginPath();
      c.moveTo(8, 0);                                         /* head */
      c.quadraticCurveTo(6, -1.8, 2.5, -1.6);
      c.quadraticCurveTo(1, -8 * sp, -7, -12.5 * sp);          /* leading edge out to the upper tip */
      c.quadraticCurveTo(-2.5, -6 * sp, -3, -1.4);             /* trailing edge back to the body */
      c.lineTo(-6, -1.1);
      c.lineTo(-13, -4.6);                                     /* tail fork */
      c.lineTo(-9, 0);
      c.lineTo(-13, 4.6);
      c.lineTo(-6, 1.1);
      c.lineTo(-3, 1.4);
      c.quadraticCurveTo(-2.5, 6 * sp, -7, 12.5 * sp);         /* lower wing */
      c.quadraticCurveTo(1, 8 * sp, 2.5, 1.6);
      c.quadraticCurveTo(6, 1.8, 8, 0);
      c.closePath();
      c.fill();
    }

    if (F.particles || F.weather) {
      var hosts = RW.$$('main > section, main section[data-fx], [data-fx]');
      var seen = [];
      hosts.forEach(function (h) { if (seen.indexOf(h) < 0) { seen.push(h); RW.safe('fx-mount', function () { mount(h); }); } });
      if (fields.length && RW.fine) {
        on(window, 'pointermove', function (e) {
          var t = e.timeStamp / 1000, dtp = Math.max(0.008, t - pT);
          if (pT && px > -1e3) { pvx = clamp((e.clientX - px) / dtp, -1500, 1500); pvy = clamp((e.clientY - py) / dtp, -1500, 1500); }
          px = e.clientX; py = e.clientY; pT = t;
        }, { passive: true });
        on(d, 'pointerleave', function () { px = py = -1e4; });
      }
    }

    /* ======================================================================
       2. SKY TINT (+ sun, + overcast for the weather story)
       ====================================================================== */
    var tint = null;
    if (F.tint || F.sun || F.weather) {
      tint = (function () {
        var box = d.createElement('div');
        box.className = 'fx-sky'; box.setAttribute('aria-hidden', 'true');
        var names = ['m', 'g', 'd', 'o'], L = {};
        names.forEach(function (n) { var e = d.createElement('i'); e.className = 'fx-sky-' + n; box.appendChild(e); L[n] = { el: e, v: -1 }; });
        var sun = null;
        if (F.sun) { sun = d.createElement('i'); sun.className = 'fx-sun'; box.appendChild(sun); }
        d.body.appendChild(box);
        var anchors = {};
        ['services', 'where', 'decide', 'whole', 'projects', 'how', 'faq', 'contact'].forEach(function (id) {
          var el = d.getElementById(id); if (el) anchors[id] = track(el);
        });
        var keys = [];
        /* position of a section's top as a fraction of the page, with a fallback when the section is missing */
        function at(id, fb) { var m = anchors[id]; return m && m.h ? m.top : fb * docH; }
        function build() {
          var end = Math.max(1, docH - vh * 0.5);
          if (F.weather) {
            var wt = at('where', 0.4), wb = anchors.where && anchors.where.h ? wt + anchors.where.h : wt + vh;
            keys = [
              { p: 0, m: 0.55, g: 0, d: 0, o: 0 },
              { p: at('services', 0.2), m: 0.22, g: 0.08, d: 0, o: 0.06 },
              { p: wt - vh * 0.3, m: 0, g: 0.04, d: 0, o: 0.42 },
              { p: wt + vh * 0.3, m: 0, g: 0, d: 0, o: 0.62 },
              { p: wb, m: 0, g: 0.08, d: 0, o: 0.36 },
              { p: at('whole', 0.52), m: 0.2, g: 0.3, d: 0, o: 0 },      /* clearing: the sun is back */
              { p: at('how', 0.7), m: 0, g: 0.34, d: 0, o: 0 },
              { p: at('faq', 0.88), m: 0, g: 0.2, d: 0.14, o: 0 },
              { p: at('contact', 0.93), m: 0, g: 0.08, d: 0.3, o: 0 },
              { p: end, m: 0, g: 0.05, d: 0.32, o: 0 }
            ];
          } else {
            keys = [
              { p: 0, m: 0.55, g: 0, d: 0, o: 0 },
              { p: at('services', 0.2), m: 0.25, g: 0.1, d: 0, o: 0 },
              { p: at('whole', 0.5), m: 0, g: 0.3, d: 0, o: 0 },
              { p: at('how', 0.7), m: 0, g: 0.34, d: 0, o: 0 },
              { p: at('faq', 0.88), m: 0, g: 0.2, d: 0.14, o: 0 },
              { p: at('contact', 0.93), m: 0, g: 0.08, d: 0.3, o: 0 },
              { p: end, m: 0, g: 0.05, d: 0.32, o: 0 }
            ];
            if (!F.tint) keys = [{ p: 0, m: 0, g: 0, d: 0, o: 0 }];
          }
          keys.sort(function (a, b) { return a.p - b.p; });
        }
        function sample(pos) {
          if (pos <= keys[0].p) return keys[0];
          for (var i = 1; i < keys.length; i++) {
            if (pos <= keys[i].p) {
              var a = keys[i - 1], b = keys[i], t = smooth(a.p, b.p, pos);
              return { m: a.m + (b.m - a.m) * t, g: a.g + (b.g - a.g) * t, d: a.d + (b.d - a.d) * t, o: a.o + (b.o - a.o) * t };
            }
          }
          return keys[keys.length - 1];
        }
        var sunV = { x: -1, y: -1, o: -1 };
        function update() {
          var s = sample(sy + vh * 0.5);
          for (var i = 0; i < names.length; i++) {
            var n = names[i], l = L[n], v = s[n] || 0;
            if (Math.abs(v - l.v) > 0.002) { l.v = v; l.el.style.opacity = v.toFixed(3); }
          }
          if (sun) {
            /* the sun rises from the left, tops out mid-page, sets on the right into the dusk */
            var t = clamp(sy / Math.max(1, docH - vh), 0, 1);
            var x = (0.08 + 0.84 * t) * vw, y = (-0.22 - Math.sin(t * Math.PI) * 0.08) * vh;
            var o = (F.weather ? 1 - (s.o || 0) * 1.1 : 1) * (0.55 + 0.45 * Math.sin(t * Math.PI));
            o = clamp(o, 0, 1);
            if (Math.abs(x - sunV.x) > 0.3 || Math.abs(y - sunV.y) > 0.3) { sunV.x = x; sunV.y = y; sun.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
            if (Math.abs(o - sunV.o) > 0.004) { sunV.o = o; sun.style.opacity = o.toFixed(3); }
          }
          return s;
        }
        return { build: build, update: update, el: box, state: function () { return sample(sy + vh * 0.5); } };
      }());
    }

    /* ======================================================================
       2b. WEATHER (fxv=3): one fixed canvas, light rain page-wide while the leaks section passes, then it clears
       ====================================================================== */
    var weather = null;
    if (F.weather) {
      weather = (function () {
        var cv = d.createElement('canvas');
        cv.className = 'fx-weather'; cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-fx-canvas', '');
        d.body.appendChild(cv);
        var ctx = cv.getContext('2d'), W = 0, H = 0, drops = [], N = 18, cleared = true;
        var where = d.getElementById('where'), wm = where ? track(where) : null;
        var env = { a: 0, b: 0, c: 0, e: 0 };
        function size() {
          W = window.innerWidth; H = window.innerHeight;
          cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
        }
        function build() {
          var t = wm && wm.h ? wm.top : 0.4 * docH, b = wm && wm.h ? wm.top + wm.h : t + vh;
          env = { a: t - vh * 1.1, b: t - vh * 0.35, c: b - vh * 0.2, e: b + vh * 0.6 };
        }
        function drop(p, init) {
          p.x = rnd(-H * 0.25, W); p.y = init ? rnd(-20, H) : -rnd(10, H * 0.5);
          p.len = rnd(18, 32); p.fall = rnd(420, 640); p.a = rnd(0.14, 0.24); p.depth = rnd(0.15, 0.45);
        }
        for (var i = 0; i < N; i++) { var p = {}; drop(p, true); drops.push(p); }
        size();
        on(window, 'resize', size);
        function frame(dt, dScroll) {
          var pos = sy + vh * 0.5;
          var I = smooth(env.a, env.b, pos) * (1 - smooth(env.c, env.e, pos));
          if (I < 0.01) {
            if (!cleared) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); cleared = true; }
            return;
          }
          cleared = false;
          var n = Math.max(1, Math.round(N * I));
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.lineCap = 'round'; ctx.lineWidth = 1.15;
          for (var i = 0; i < N; i++) {
            var p = drops[i];
            p.y += p.fall * dt - dScroll * p.depth; p.x += p.fall * 0.24 * dt;
            if (p.y - p.len > H || p.x > W + 30) drop(p, false);
            else if (p.y < -H * 0.6) p.y += H * 1.3;
            if (i >= n) continue;
            var a = p.a * Math.min(1, I * 1.4);
            ctx.strokeStyle = 'rgba(' + RAIN_RGB + ',' + a.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.len * 0.108, p.y - p.len * 0.45); ctx.stroke();
            ctx.strokeStyle = 'rgba(' + RAIN_RGB + ',' + (a * 0.45).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.x - p.len * 0.108, p.y - p.len * 0.45); ctx.lineTo(p.x - p.len * 0.24, p.y - p.len); ctx.stroke();
          }
        }
        return { build: build, frame: frame, el: cv, level: function () { var pos = sy + vh * 0.5; return smooth(env.a, env.b, pos) * (1 - smooth(env.c, env.e, pos)); } };
      }());
    }

    /* ======================================================================
       3. ROOF EDGES: each .e-* edge rises from the section's top line as it arrives (scrubbed, CSS var on the section)
       ====================================================================== */
    var edges = [];
    if (F.edges) {
      root.setAttribute('data-fx-edges', '');
      RW.$$(EDGE_SEL).forEach(function (el) { edges.push({ m: track(el), el: el, v: -1 }); });
    }
    function updateEdges() {
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i], top = e.m.top - sy;
        if (top < -vh || top > vh * 1.6) { if (e.v !== (top < 0 ? 1 : 0)) { e.v = top < 0 ? 1 : 0; e.el.style.setProperty('--fx-edge', e.v); } continue; }
        var t = clamp((vh * 0.98 - top) / (vh * 0.42), 0, 1);
        var v = 1 - Math.pow(1 - t, 3);
        if (Math.abs(v - e.v) > 0.004) { e.v = v; e.el.style.setProperty('--fx-edge', v.toFixed(3)); }
      }
    }

    /* ======================================================================
       4. MAGNETIC BUTTONS (fine pointers): .btn drifts up to 7px toward the pointer, springs back with a small overshoot
       ====================================================================== */
    var mags = [];
    function magFor(b) {
      for (var i = 0; i < mags.length; i++) if (mags[i].el === b) return mags[i];
      var m = { el: b, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, live: true };
      mags.push(m); return m;
    }
    function magOK(b) {
      if (!b || b.disabled || b.hasAttribute('data-no-magnet')) return false;
      if (b.matches('[type=submit],input,form button:not([type=button]):not([type=reset])')) return false;
      return true;
    }
    if (F.magnet && RW.fine) {
      var curBtn = null;
      on(d, 'pointermove', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('.btn') : null;
        if (b !== curBtn && curBtn) { var o = magFor(curBtn); o.tx = 0; o.ty = 0; }
        curBtn = magOK(b) ? b : null;
        if (!curBtn) return;
        var r = curBtn.getBoundingClientRect(), m = magFor(curBtn);
        /* measure without our own offset so the pull does not feed back on itself */
        var cx = r.left + r.width / 2 - m.x, cy = r.top + r.height / 2 - m.y;
        m.tx = clamp((e.clientX - cx) * 0.2, -7, 7);
        m.ty = clamp((e.clientY - cy) * 0.3, -5, 5);
        m.live = true;
      }, { passive: true });
      on(d, 'pointerleave', function () { if (curBtn) { var o = magFor(curBtn); o.tx = o.ty = 0; } curBtn = null; });
    }
    function updateMags(dt) {
      for (var i = mags.length - 1; i >= 0; i--) {
        var m = mags[i];
        if (!m.live) continue;
        /* spring: stiffness 180, damping 13 (one small overshoot on release) */
        var ax = 180 * (m.tx - m.x) - 13 * m.vx, ay = 180 * (m.ty - m.y) - 13 * m.vy;
        m.vx += ax * dt; m.vy += ay * dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (!m.tx && !m.ty && Math.abs(m.x) < 0.05 && Math.abs(m.y) < 0.05 && Math.abs(m.vx) < 0.5 && Math.abs(m.vy) < 0.5) {
          m.x = m.y = m.vx = m.vy = 0; m.live = false;
          m.el.style.removeProperty('--mx'); m.el.style.removeProperty('--my');
          continue;
        }
        m.el.style.setProperty('--mx', m.x.toFixed(2) + 'px');
        m.el.style.setProperty('--my', m.y.toFixed(2) + 'px');
      }
    }

    /* ======================================================================
       5a. SURVEY-RING CURSOR (prototype): follows with a short lag, opens over things you can press.
           The system cursor stays; the ring takes no clicks; no section rail.
       ====================================================================== */
    var ring = null;
    if (F.cursor && RW.fine) {
      ring = (function () {
        var el = d.createElement('div');
        el.className = 'fx-ring'; el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<i class="fx-ring-in"><i></i><i></i><i></i><i></i></i>';
        d.body.appendChild(el);
        var x = -100, y = -100, lx = 0, ly = 0, shown = false;
        on(d, 'pointerover', function (e) {
          var t = e.target;
          var hot = t && t.closest && t.closest('a[href],button,[role=button],summary,label,select,[tabindex]:not([tabindex="-1"])');
          var txt = t && t.closest && t.closest('input,textarea,[contenteditable]');
          el.classList.toggle('is-hot', !!hot && !txt);
          el.classList.toggle('is-text', !!txt);
        }, { passive: true });
        on(d, 'pointerdown', function () { el.classList.add('is-down'); }, { passive: true });
        on(d, 'pointerup', function () { el.classList.remove('is-down'); }, { passive: true });
        on(d, 'pointerleave', function () { el.classList.remove('is-on'); shown = false; });
        return {
          update: function (dt) {
            if (px < -1e3) return;
            if (!shown) { x = px; y = py; shown = true; el.classList.add('is-on'); }
            var k = 1 - Math.exp(-dt * 18);
            x += (px - x) * k; y += (py - y) * k;
            if (Math.abs(x - lx) > 0.1 || Math.abs(y - ly) > 0.1) { lx = x; ly = y; el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
          }
        };
      }());
      if (!fields.length || !RW.fine) {
        on(window, 'pointermove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
      }
    }

    /* ======================================================================
       5b. VELOCITY SKEW (prototype): visible section photos lean a little with scroll speed.
           Only images nobody else transforms (computed transform none at start).
       ====================================================================== */
    var skews = [], skewV = 0;
    if (F.skew) {
      RW.$$('main section img').forEach(function (img) {
        if (img.closest('.hero,[data-no-skew]')) return;
        if (getComputedStyle(img).transform !== 'none') return;
        var s = { el: img, on: false, v: 0 };
        skews.push(s);
        cleanups.push(RW.onView(img, { enter: function () { s.on = true; }, leave: function () { s.on = false; if (s.v) { s.v = 0; img.style.transform = ''; } } }));
      });
    }
    function updateSkew(dt) {
      var target = clamp(vel * 0.0011, -2.2, 2.2);
      skewV += (target - skewV) * (1 - Math.exp(-dt * 8));
      if (Math.abs(skewV) < 0.02) skewV = 0;
      for (var i = 0; i < skews.length; i++) {
        var s = skews[i];
        if (!s.on) continue;
        if (Math.abs(s.v - skewV) < 0.02) continue;
        s.v = skewV;
        s.el.style.transform = skewV ? 'skewY(' + skewV.toFixed(2) + 'deg) scale(' + (1 + Math.abs(skewV) * 0.012).toFixed(4) + ')' : '';
      }
    }

    /* ======================================================================
       the ONE loop
       ====================================================================== */
    measure();
    on(window, 'resize', measureSoon);
    on(window, 'load', function () { setTimeout(measure, 150); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
    if (RW.ST) { RW.ST.addEventListener('refresh', measure); cleanups.push(function () { RW.ST.removeEventListener('refresh', measure); }); }
    if ('ResizeObserver' in window) {
      var bodyRO = new ResizeObserver(measureSoon); bodyRO.observe(d.body);
      cleanups.push(function () { bodyRO.disconnect(); });
    }
    on(d, 'visibilitychange', function () { hidden = d.hidden; lastSY = window.pageYOffset; });
    if (edges.length) updateEdges();

    var stats = { frames: 0, work: 0 };
    var stop = RW.tick(function (t, dt) {
      if (hidden) return;
      var t0 = performance.now();
      now = t;
      sy = window.pageYOffset;
      var dScroll = sy - lastSY; lastSY = sy;
      if (Math.abs(dScroll) > vh * 1.5) dScroll = 0;   /* a jump (anchor link, reload) is not a scroll */
      vel += ((dScroll / Math.max(dt, 1e-3)) - vel) * (1 - Math.exp(-dt * 10));

      /* particles */
      var ptrAge = (performance.now() / 1000) - pT;
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (!f.on || !f.w) continue;
        var ptr = null;
        var top = f.m.top - sy;   /* host top in viewport px */
        var cvTop = f.sticky ? clamp(0, top, top + f.m.h - f.h) : top;
        if (!f.sticky) {
          var off = clamp(-top, 0, Math.max(0, f.m.h - f.h));
          if (Math.abs(off - (f.off || 0)) > 0.5) { f.off = off; f.cv.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)'; }
          cvTop = top + off;
        }
        if (px > -1e3 && ptrAge < 1.2 && py > cvTop && py < cvTop + f.h) {
          ptr = { x: px, y: py - cvTop, vx: ptrAge < 0.1 ? pvx : 0, vy: ptrAge < 0.1 ? pvy : 0 };
        }
        /* while the canvas is held in the viewport the world scrolls past it, so particles carry the scroll (by depth) */
        var held = -top > 0 && -top < f.m.h - f.h;
        stepField(f, dt, held ? dScroll : 0, ptr);
        drawField(f);
      }
      if (tint) tint.update();
      if (weather) weather.frame(dt, dScroll);
      if (edges.length) updateEdges();
      if (mags.length) updateMags(dt);
      if (ring) ring.update(dt);
      if (skews.length) updateSkew(dt);
      stats.frames++; stats.work += performance.now() - t0;
    });

    RW.fx = {
      variant: V, flags: F, fields: fields, measure: measure, stats: stats,
      tintState: function () { return tint ? tint.state() : null; },
      rain: function () { return weather ? weather.level() : 0; },
      destroy: function () {
        stop();
        cleanups.forEach(function (c) { try { c(); } catch (e) {} });
        fields.forEach(function (f) { if (f.layer.parentNode) f.layer.parentNode.removeChild(f.layer); f.host.removeAttribute('data-fx-on'); });
        [tint && tint.el, weather && weather.el, ring && d.querySelector('.fx-ring')].forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
        edges.forEach(function (e) { e.el.style.removeProperty('--fx-edge'); });
        mags.forEach(function (m) { m.el.style.removeProperty('--mx'); m.el.style.removeProperty('--my'); });
        skews.forEach(function (s) { s.el.style.transform = ''; });
        root.removeAttribute('data-fx-edges');
        fields = []; edges = []; mags = []; skews = [];
      }
    };
  }, { motion: true });
}());
