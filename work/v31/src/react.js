/* REACT (owner: lead). The page answers the pointer, differently in every section.
   1. Entry wash: crossing into a section sends one soft wave across its background from the point you came in.
      Six shapes (ring, ripple, gable, glow, dots, sweep), never the same on two neighbouring sections.
   2. Living fields: a canvas behind the content that keeps reacting while the pointer moves:
        reviews  stars swell and turn gold        services  hidden roof tiles lift under the pointer
        where    rain falls and parts round an umbrella      whole  blueprint grid bends like a lens
        how      chalk-line dots join up to you   areas  contour lines rise into a hill
        projects builder's string lines you can pluck        decide  tape-measure ticks grow under you
   3. Small SVG characters: hero and footer birds scatter, the roofer looks at you, the surveyor's sight line follows
      you, the bucket follows you and catches the drip (or misses), the FAQ window lights up and the smoke bends, the
      contact lamp follows you, gallery photos tilt and catch the light, trust icons lean towards you.
   Fine pointers with motion allowed only. Each piece sleeps when the pointer is elsewhere and everything has settled.
   Writes `transform` on SVG parts and on elements depth.js never moves; never touches `translate` on [data-depth]. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('react', function () {
    if (!RW.fine) return;
    var d = document, $ = RW.$, $$ = RW.$$, clamp = RW.clamp;
    var P = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4, v: 0 };
    var cur = null, lastSY = window.pageYOffset, pr = Math.min(window.devicePixelRatio || 1, 1.5);
    var all = [];        /* every reactor: { el, wake(), frame(dt, lx, ly, inside, rect) -> keep awake? } */
    var bySec = new Map();
    function reg(sec, r) { if (!sec) return; r.el = sec; r.awake = false; all.push(r); if (!bySec.has(sec)) bySec.set(sec, []); bySec.get(sec).push(r); return r; }
    function wakeSec(sec) { (bySec.get(sec) || []).forEach(function (r) { r.awake = true; }); }

    /* ------------------------------------------------ 1. ENTRY WASH ------------------------------------------------ */
    var SHAPE = { trust: 'sweep', reviews: 'ring', services: 'gable', problems: 'glow', where: 'ripple', decide: 'dots',
      whole: 'sweep', about: 'ring', work: 'gable', projects: 'glow', how: 'dots', checks: 'ripple', areas: 'ring',
      faq: 'gable', urgent: 'sweep', contact: 'glow', types: 'dots', before: 'ripple', sectors: 'sweep', team: 'glow',
      quiz: 'ring', care: 'gable', advice: 'dots', survey: 'ripple', footer: 'ripple' };
    var lastWash = new WeakMap();
    function wash(sec, cx, cy, fromAbove) {
      var key = sec.id || (sec.tagName === 'FOOTER' ? 'footer' : '');
      var shape = SHAPE[key]; if (!shape) return;
      var now = performance.now(); if (now - (lastWash.get(sec) || 0) < 900) return; lastWash.set(sec, now);
      var host = sec.querySelector(':scope > .rx-wash');
      if (!host) { host = d.createElement('span'); host.className = 'rx-wash'; host.setAttribute('aria-hidden', 'true'); sec.insertBefore(host, sec.firstChild); }
      var r = sec.getBoundingClientRect();
      var i = d.createElement('i');
      i.className = 'rx-' + shape + (fromAbove ? ' is-down' : ' is-up');
      i.style.setProperty('--wx', (cx - r.left).toFixed(0) + 'px');
      i.style.setProperty('--wy', (cy - r.top).toFixed(0) + 'px');
      host.appendChild(i);
      setTimeout(function () { if (i.parentNode) i.parentNode.removeChild(i); }, 1800);
    }

    /* section under the pointer: on move, and again after scrolling under a still pointer */
    function secAt(el) { return el && el.closest ? el.closest('section,footer') : null; }
    function setCur(sec) {
      if (sec === cur) return;
      var prev = cur; cur = sec;
      if (prev) wakeSec(prev);            /* let it settle */
      if (sec) {
        var down = !prev || (prev.compareDocumentPosition(sec) & Node.DOCUMENT_POSITION_FOLLOWING);
        wash(sec, P.x, P.y, !!down);
        wakeSec(sec);
      }
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      P.x = e.clientX; P.y = e.clientY;
      setCur(secAt(e.target));
      if (cur) wakeSec(cur);
    }, { passive: true });
    d.documentElement.addEventListener('pointerleave', function () { P.x = P.y = -1e4; setCur(null); });

    /* ------------------------------------------------ canvas helper ------------------------------------------------ */
    function canvasFor(sec, cls) {
      var cv = d.createElement('canvas');
      cv.className = 'rx-cv' + (cls ? ' ' + cls : ''); cv.setAttribute('aria-hidden', 'true');
      sec.insertBefore(cv, sec.firstChild);
      var o = { cv: cv, c: cv.getContext('2d'), w: 0, h: 0, k: pr };
      function size() {
        var w = sec.offsetWidth, h = sec.offsetHeight; if (!w || !h) return;
        o.k = w * h * pr * pr > 4.2e6 ? 1 : pr;
        o.w = w; o.h = h; cv.width = Math.round(w * o.k); cv.height = Math.round(h * o.k);
        o.c.setTransform(o.k, 0, 0, o.k, 0, 0);
        if (o.onsize) o.onsize();
      }
      o.size = size;
      if ('ResizeObserver' in window) new ResizeObserver(function () { size(); if (o.redraw) o.redraw(); }).observe(sec); else size();
      size();
      return o;
    }
    function rnd(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
    function gauss(dx, dy, s) { return Math.exp(-(dx * dx + dy * dy) / (2 * s * s)); }

    /* ------------------------------------------------ 2. FIELDS ------------------------------------------------ */

    /* REVIEWS: scattered four-point stars. Near the pointer they swell, spin a little, turn Google gold, and step aside. */
    reg(d.getElementById('reviews'), (function () {
      var S, stars = [], pres = 0;
      return {
        init: function (sec) {
          S = canvasFor(sec, 'rx-stars');
          S.onsize = function () {
            var R = rnd(7), n = Math.round(S.w * S.h / 11000); stars = [];
            for (var i = 0; i < n; i++) stars.push({ x: R() * S.w, y: R() * S.h, s: 1.6 + R() * 2.4, a: R() * 6.28, e: 0, ox: 0, oy: 0 });
          };
          S.onsize(); S.redraw = draw; draw();
        },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 5);
          var busy = pres > 0.01, R = 150;
          for (var i = 0; i < stars.length; i++) {
            var p = stars[i], dx = p.x - lx, dy = p.y - ly, dd = Math.sqrt(dx * dx + dy * dy) || 1;
            var t = inside && dd < R ? 1 - dd / R : 0;
            p.e += (t - p.e) * Math.min(1, dt * (t > p.e ? 10 : 2.4));
            var push = 16 * p.e;
            p.ox += (dx / dd * push - p.ox) * Math.min(1, dt * 8); p.oy += (dy / dd * push - p.oy) * Math.min(1, dt * 8);
            p.a += dt * p.e * 2.2;
            if (p.e > 0.004) busy = true;
          }
          draw(); return busy;
        }
      };
      function star(c, x, y, r, a) {
        c.beginPath();
        for (var k = 0; k < 8; k++) { var rr = k % 2 ? r * 0.38 : r, aa = a + k * Math.PI / 4; c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
        c.closePath(); c.fill();
      }
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        for (var i = 0; i < stars.length; i++) {
          var p = stars[i], e = p.e;
          c.fillStyle = e > 0.02 ? 'rgba(' + Math.round(152 + 92 * e) + ',' + Math.round(86 + 94 * e) + ',' + Math.round(50 - 46 * e) + ',' + (0.16 + 0.6 * e).toFixed(3) + ')' : 'rgba(152,86,50,.14)';
          star(c, p.x + p.ox, p.y + p.oy, p.s * (1 + 2.2 * e), p.a);
        }
      }
    }()));

    /* SERVICES: the paper hides roof courses. Under the pointer the tiles show, lift and tilt, then settle and fade. */
    reg(d.getElementById('services'), (function () {
      var S, TW = 26, TH = 13, G = 3, act = new Map(), pres = 0;
      return {
        init: function (sec) { S = canvasFor(sec, 'rx-tiles'); S.redraw = draw; },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 5);
          if (inside) {
            var R = 120, r0 = Math.floor((ly - R) / (TH + G)), r1 = Math.ceil((ly + R) / (TH + G));
            for (var row = r0; row <= r1; row++) {
              var off = (row & 1) ? (TW + G) / 2 : 0, c0 = Math.floor((lx - R - off) / (TW + G)), c1 = Math.ceil((lx + R - off) / (TW + G));
              for (var col = c0; col <= c1; col++) {
                var x = col * (TW + G) + off + TW / 2, y = row * (TH + G) + TH / 2, dd = Math.hypot(x - lx, y - ly);
                if (dd > R) continue;
                var key = row * 10000 + col, t = 1 - dd / R, a = act.get(key);
                if (!a) { a = { x: x, y: y, e: 0, t: 0, ph: (col * 7 + row * 3) % 5 }; act.set(key, a); }
                a.t = Math.max(a.t, t);
              }
            }
          }
          var busy = false;
          act.forEach(function (a, key) {
            a.e += (a.t - a.e) * Math.min(1, dt * (a.t > a.e ? 12 : 1.8));
            a.t *= Math.pow(0.02, dt);                   /* the lift decays once the pointer moves on */
            if (a.e < 0.003 && a.t < 0.003) act.delete(key); else busy = true;
          });
          draw(); return busy || pres > 0.01;
        }
      };
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        act.forEach(function (a) {
          var e = a.e; if (e < 0.01) return;
          var lift = e * 7, tilt = (a.ph - 2) * 0.05 * e;
          c.save(); c.translate(a.x, a.y - lift); c.rotate(tilt);
          c.fillStyle = 'rgba(31,43,48,' + (0.08 * e).toFixed(3) + ')';
          c.fillRect(-TW / 2 + 2, -TH / 2 + 3 + lift * 0.6, TW, TH);              /* shadow grows as it lifts */
          c.fillStyle = 'rgba(217,163,131,' + (0.5 * e).toFixed(3) + ')';
          c.strokeStyle = 'rgba(152,86,50,' + (0.55 * e).toFixed(3) + ')'; c.lineWidth = 1;
          c.beginPath(); c.rect(-TW / 2, -TH / 2, TW, TH); c.fill(); c.stroke();
          c.beginPath(); c.moveTo(-TW / 2 + 3, TH / 2 - 3); c.lineTo(TW / 2 - 3, TH / 2 - 3); c.stroke();
          c.restore();
        });
      }
    }()));

    /* WHERE (the leak tour): rain falls while you are here and slides off an umbrella that follows you. */
    reg(d.getElementById('where'), (function () {
      var S, drops = [], pres = 0, ux = -1e4, uy = -1e4, R = rnd(11), umb = null;
      function seed(p, top) { p.x = R() * S.w; p.y = top ? -R() * 60 : R() * S.h; p.v = 520 + R() * 260; p.vx = -60; p.l = 10 + R() * 10; p.s = 0; }
      return {
        init: function (sec) {
          S = canvasFor(sec, 'rx-rain');
          S.onsize = function () { drops = []; var n = Math.round(S.w / 11); for (var i = 0; i < n; i++) { var p = {}; seed(p); drops.push(p); } };
          S.onsize(); S.redraw = draw;
          /* the umbrella rides with the pointer above the content (the rain stays behind it) */
          umb = d.createElement('span'); umb.className = 'rx-umb'; umb.setAttribute('aria-hidden', 'true');
          umb.innerHTML = '<svg viewBox="-60 -56 120 104" focusable="false"><path class="rx-umb-c" d="M-54 4A54 54 0 0 1 54 4Q43.2 14 32.4 4Q21.6 14 10.8 4Q0 14 -10.8 4Q-21.6 14 -32.4 4Q-43.2 14 -54 4Z"/><path class="rx-umb-r" d="M0 -50V40a6 6 0 0 1 -12 0M0 -50Q-18 -20 -10.8 4M0 -50Q18 -20 10.8 4M0 -50Q-40 -20 -32.4 4M0 -50Q40 -20 32.4 4"/></svg>';
          d.body.appendChild(umb);
        },
        frame: function (dt, lx, ly, inside, rect) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * (inside ? 2.5 : 1.6));
          if (umb) { umb.style.transform = 'translate(' + (ux + rect.left).toFixed(1) + 'px,' + (uy + rect.top).toFixed(1) + 'px) rotate(' + clamp((lx - ux) * 0.4, -14, 14).toFixed(1) + 'deg)'; umb.style.opacity = pres.toFixed(3); }
          if (inside) { ux += (lx - ux) * Math.min(1, dt * 14); uy += (ly - 34 - uy) * Math.min(1, dt * 14); if (ux < -1e3) { ux = lx; uy = ly - 34; } }
          var r = 46;
          for (var i = 0; i < drops.length; i++) {
            var p = drops[i];
            p.x += p.vx * dt; p.y += p.v * dt;
            var dx = p.x - ux, dy = p.y - uy, dd = Math.sqrt(dx * dx + dy * dy);
            if (pres > 0.2 && dd < r && dy < 4) {               /* hits the canopy: slides off the nearer edge */
              var a = Math.atan2(dy, dx);
              p.x = ux + Math.cos(a) * r; p.y = uy + Math.sin(a) * r;
              p.vx = (dx < 0 ? -1 : 1) * 160; p.s = 1;
            }
            if (p.y > S.h + 20 || p.x < -30) seed(p, true);
          }
          draw(); return pres > 0.01;
        }
      };
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h); if (pres < 0.01) return;
        c.lineCap = 'round'; c.lineWidth = 1.2;
        c.strokeStyle = 'rgba(74,104,122,' + (0.42 * pres).toFixed(3) + ')';
        c.beginPath();
        for (var i = 0; i < drops.length; i++) { var p = drops[i], k = p.l / p.v; c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * k, p.y - p.l); }
        c.stroke();
      }
    }()));

    /* WHOLE (the 3D roof): a pale blueprint grid that bends away from the pointer like a lens, copper inside the lens. */
    reg(d.getElementById('whole'), (function () {
      var S, pres = 0, gx = -1e4, gy = -1e4, SP = 44;
      return {
        init: function (sec) { S = canvasFor(sec, 'rx-grid'); S.redraw = draw; draw(); },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 4);
          if (inside) { if (gx < -1e3) { gx = lx; gy = ly; } gx += (lx - gx) * Math.min(1, dt * 9); gy += (ly - gy) * Math.min(1, dt * 9); }
          draw(); return pres > 0.01 || inside;
        }
      };
      function bend(x, y) {
        var dx = x - gx, dy = y - gy, g = gauss(dx, dy, 95) * 30 * pres, dd = Math.sqrt(dx * dx + dy * dy) || 1;
        return [x + dx / dd * g, y + dy / dd * g];
      }
      function grid(c) {
        c.beginPath();
        for (var x = SP / 2; x < S.w; x += SP) for (var y = 0; y <= S.h; y += 22) { var p = bend(x, y); y === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1]); }
        for (var y2 = SP / 2; y2 < S.h; y2 += SP) for (var x2 = 0; x2 <= S.w; x2 += 22) { var q = bend(x2, y2); x2 === 0 ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]); }
        c.stroke();
      }
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        c.lineWidth = 1; c.strokeStyle = 'rgba(62,111,163,.07)'; grid(c);
        if (pres > 0.01) {
          c.save(); c.beginPath(); c.arc(gx, gy, 150, 0, 6.283); c.clip();
          c.strokeStyle = 'rgba(152,86,50,' + (0.3 * pres).toFixed(3) + ')'; grid(c);
          c.restore();
        }
      }
    }()));

    /* HOW: chalk-line dots. Dots near the pointer snap a blue chalk line to it and to each other. */
    reg(d.getElementById('how'), (function () {
      var S, dots = [], pres = 0;
      return {
        init: function (sec) {
          S = canvasFor(sec, 'rx-chalk');
          S.onsize = function () { var R = rnd(5); dots = []; for (var y = 30; y < S.h; y += 58) for (var x = 30; x < S.w; x += 58) dots.push({ x: x + (R() - 0.5) * 22, y: y + (R() - 0.5) * 22, e: 0 }); };
          S.onsize(); S.redraw = draw; draw();
        },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 5);
          var busy = pres > 0.01;
          for (var i = 0; i < dots.length; i++) {
            var p = dots[i], dd = Math.hypot(p.x - lx, p.y - ly), t = inside && dd < 170 ? 1 - dd / 170 : 0;
            p.e += (t - p.e) * Math.min(1, dt * (t > p.e ? 9 : 2)); if (p.e > 0.004) busy = true;
          }
          this.lx = lx; this.ly = ly; draw(lx, ly); return busy;
        }
      };
      function draw(lx, ly) {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        c.fillStyle = 'rgba(62,111,163,.16)';
        for (var i = 0; i < dots.length; i++) { var p = dots[i]; c.beginPath(); c.arc(p.x, p.y, 1.5 + p.e * 2.5, 0, 6.283); c.fill(); }
        if (lx === undefined) return;
        c.setLineDash([5, 5]); c.lineWidth = 1.3;
        for (var j = 0; j < dots.length; j++) {
          var a = dots[j]; if (a.e < 0.05) continue;
          c.strokeStyle = 'rgba(62,111,163,' + (0.5 * a.e * pres).toFixed(3) + ')';
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(lx, ly); c.stroke();
        }
        c.setLineDash([]);
      }
    }()));

    /* AREAS: contour lines that rise into a little hill wherever the pointer is, like a relief map. */
    reg(d.getElementById('areas'), (function () {
      var S, pres = 0, hx = -1e4, hy = -1e4;
      return {
        init: function (sec) { S = canvasFor(sec, 'rx-contour'); S.redraw = draw; },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 3);
          if (inside) { if (hx < -1e3) { hx = lx; hy = ly; } hx += (lx - hx) * Math.min(1, dt * 6); hy += (ly - hy) * Math.min(1, dt * 6); }
          draw(); return pres > 0.01;
        }
      };
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h); if (pres < 0.01) return;
        c.lineWidth = 1.2;
        var y0 = Math.max(0, hy - 220), y1 = Math.min(S.h, hy + 220);
        for (var y = Math.floor(y0 / 18) * 18; y < y1; y += 18) {
          var fall = 1 - Math.abs(y - hy) / 220; if (fall <= 0) continue;
          c.strokeStyle = 'rgba(122,98,64,' + (0.32 * fall * pres).toFixed(3) + ')';
          c.beginPath();
          for (var x = Math.max(0, hx - 340); x <= Math.min(S.w, hx + 340); x += 8) {
            var dx = x - hx, rise = 46 * pres * Math.exp(-dx * dx / (2 * 90 * 90)) * Math.exp(-((y - hy) * (y - hy)) / (2 * 120 * 120));
            var yy = y - rise + Math.sin(x * 0.02 + y * 0.05) * 2;
            x <= Math.max(0, hx - 340) ? c.moveTo(x, yy) : c.lineTo(x, yy);
          }
          c.stroke();
        }
        c.globalCompositeOperation = 'destination-in';           /* soft edges all round */
        var g = c.createRadialGradient(hx, hy, 60, hx, hy, 330); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 0, S.w, S.h); c.globalCompositeOperation = 'source-over';
      }
    }()));

    /* PROJECTS: two builder's string lines between pegs. Drag across one and it bends with you, let go and it twangs. */
    reg(d.getElementById('projects'), (function () {
      var S, lines = [], N = 56, plx = null, ply = null;
      function mk(f) { var a = []; for (var i = 0; i < N; i++) a.push({ y: 0, v: 0 }); return { f: f, pts: a, grab: -1 }; }
      return {
        init: function (sec) { S = canvasFor(sec, 'rx-string'); lines = [mk(0.1), mk(0.93)]; S.redraw = draw; draw(); },
        frame: function (dt, lx, ly, inside) {
          var busy = false, x0 = S.w * 0.04, x1 = S.w * 0.96;
          lines.forEach(function (L) {
            var base = S.h * L.f, pts = L.pts;
            if (inside && lx > x0 && lx < x1) {
              var i = Math.round((lx - x0) / (x1 - x0) * (N - 1)), off = ly - base;
              if (L.grab < 0 && ply !== null && ((ply - base) * off < 0 || Math.abs(off) < 6)) L.grab = i;
              if (L.grab > -1) {
                if (Math.abs(off) > 46) L.grab = -1;           /* stretched too far: it slips off and twangs */
                else { L.grab = i; pts[i].y = off; pts[i].v = 0; }
              }
            } else L.grab = -1;
            var k = 900, damp = Math.pow(0.08, dt), steps = 3, h = dt / steps;
            for (var s = 0; s < steps; s++) {
              for (var j = 1; j < N - 1; j++) {
                if (j === L.grab) continue;
                var acc = k * (pts[j - 1].y + pts[j + 1].y - 2 * pts[j].y) * 0.5 - 60 * pts[j].y;
                pts[j].v += acc * h;
              }
              for (var m = 1; m < N - 1; m++) if (m !== L.grab) pts[m].y += pts[m].v * h;
            }
            for (var n = 1; n < N - 1; n++) { pts[n].v *= damp; if (Math.abs(pts[n].y) > 0.08 || Math.abs(pts[n].v) > 0.5) busy = true; }
            if (L.grab > -1) busy = true;
          });
          plx = inside ? lx : null; ply = inside ? ly : null;
          draw(); return busy || inside;
        }
      };
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        var x0 = S.w * 0.04, x1 = S.w * 0.96;
        lines.forEach(function (L) {
          var base = S.h * L.f;
          c.strokeStyle = 'rgba(193,74,58,.42)'; c.lineWidth = 1.2; c.beginPath();
          for (var i = 0; i < N; i++) { var x = x0 + (x1 - x0) * i / (N - 1), y = base + L.pts[i].y; i ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.stroke();
          [x0, x1].forEach(function (px) {                     /* timber pegs */
            c.fillStyle = 'rgba(156,122,94,.55)'; c.fillRect(px - 3, base - 4, 6, 22);
            c.fillStyle = 'rgba(156,122,94,.35)'; c.beginPath(); c.moveTo(px - 3, base + 18); c.lineTo(px, base + 25); c.lineTo(px + 3, base + 18); c.fill();
          });
        });
      }
    }()));

    /* DECIDE: tape-measure ticks along the top and bottom edges; under the pointer they grow like a level meter. */
    reg(d.getElementById('decide'), (function () {
      var S, pres = 0, mx = -1e4, h = [];
      return {
        init: function (sec) { S = canvasFor(sec, 'rx-ticks'); S.onsize = function () { h = new Float32Array(Math.ceil(S.w / 12) + 1); }; S.onsize(); S.redraw = draw; draw(); },
        frame: function (dt, lx, ly, inside) {
          pres += ((inside ? 1 : 0) - pres) * Math.min(1, dt * 5);
          if (inside) mx = lx;
          var busy = false;
          for (var i = 0; i < h.length; i++) {
            var dx = i * 12 - mx, t = inside ? Math.exp(-dx * dx / (2 * 70 * 70)) : 0;
            h[i] += (t - h[i]) * Math.min(1, dt * (t > h[i] ? 12 : 3)); if (h[i] > 0.003) busy = true;
          }
          draw(); return busy || pres > 0.01;
        }
      };
      function draw() {
        var c = S.c; c.clearRect(0, 0, S.w, S.h);
        c.strokeStyle = 'rgba(31,43,48,.22)'; c.lineWidth = 1; c.beginPath();
        for (var i = 0; i < h.length; i++) {
          var x = i * 12 + 0.5, big = i % 10 === 0, base = big ? 12 : i % 5 === 0 ? 8 : 5, len = base + h[i] * 34;
          c.moveTo(x, 0); c.lineTo(x, len); c.moveTo(x, S.h); c.lineTo(x, S.h - len);
        }
        c.stroke();
        if (pres > 0.02 && mx > -1e3) {                         /* a reading under the pointer */
          var cm = Math.max(0, Math.round(mx / 12));
          c.fillStyle = 'rgba(152,86,50,' + (0.75 * pres).toFixed(3) + ')'; c.font = '600 11px Arial, sans-serif'; c.textAlign = 'center';
          c.fillText(cm + ' cm', mx, 62); c.fillText(cm + ' cm', mx, S.h - 54);
        }
      }
    }()));

    /* ------------------------------------------------ 3. SVG CHARACTERS ------------------------------------------------ */

    /* birds that scatter: each keeps an offset that springs home. Hero birds take `translate` (no data-depth on them),
       footer birds move their inner path because depth.js owns their `translate`. */
    function flock(sec, sel, inner) {
      var birds = $$(sel, sec).map(function (el) { return { el: inner ? el.firstElementChild : el, ox: 0, oy: 0, vx: 0, vy: 0, host: el }; });
      if (!birds.length) return;
      if (inner) birds.forEach(function (b) { b.el.style.transformBox = 'fill-box'; b.el.style.transformOrigin = '50% 50%'; });
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var busy = false;
          birds.forEach(function (b) {
            if (inside) {
              var r = b.host.getBoundingClientRect(), cx = r.left + r.width / 2 - rect.left, cy = r.top + r.height / 2 - rect.top;
              var dx = cx - lx, dy = cy - ly, dd = Math.sqrt(dx * dx + dy * dy) || 1;
              if (dd < 140) { var f = (1 - dd / 140) * 2600; b.vx += dx / dd * f * dt; b.vy += (dy / dd - 0.6) * f * dt; }
            }
            b.vx += -b.ox * 9 * dt; b.vy += -b.oy * 9 * dt;
            b.vx *= Math.pow(0.12, dt); b.vy *= Math.pow(0.12, dt);
            b.ox += b.vx * dt; b.oy += b.vy * dt;
            var sp = Math.min(1, Math.hypot(b.vx, b.vy) / 400);
            var tf = 'translate(' + b.ox.toFixed(1) + 'px,' + b.oy.toFixed(1) + 'px) scaleY(' + (1 - sp * 0.55 * Math.abs(Math.sin(performance.now() / 45))).toFixed(2) + ')';
            if (inner) b.el.style.transform = tf; else b.el.style.translate = b.ox.toFixed(1) + 'px ' + b.oy.toFixed(1) + 'px';
            if (Math.abs(b.ox) + Math.abs(b.oy) > 0.3 || Math.abs(b.vx) + Math.abs(b.vy) > 2) busy = true;
          });
          return busy || inside;
        }
      });
    }
    flock(d.getElementById('top'), '.hero-bird', false);
    flock($('footer'), '.ftr-bird', true);

    /* ABOUT: the roofer turns to look at you (head and cap shift, eyes follow), and the chimney smoke leans away from you. */
    (function () {
      var sec = d.getElementById('about'), svg = sec && $('.ab-scene', sec); if (!svg) return;
      var head = $('.ab-head', svg), cap = $('.ab-cap', svg), smoke = $('.ab-smoke', svg);
      var eye = d.createElementNS('http://www.w3.org/2000/svg', 'circle');
      eye.setAttribute('class', 'ab-eye'); eye.setAttribute('cx', '388'); eye.setAttribute('cy', '129'); eye.setAttribute('r', '1.6');
      head.parentNode.insertBefore(eye, cap.nextSibling);
      smoke.style.transformBox = 'view-box'; smoke.style.transformOrigin = '318px 96px';
      var lx0 = 0, ly0 = 0, lean = 0;
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var tx = 0, ty = 0, tl = 0;
          if (inside) {
            var m = svg.getScreenCTM(); if (m) {
              var hx = m.a * 392 + m.e - rect.left, hy = m.d * 128 + m.f - rect.top, dx = lx - hx, dy = ly - hy, dd = Math.hypot(dx, dy) || 1;
              tx = dx / dd * 2.6; ty = dy / dd * 2;
              var sx = m.a * 318 + m.e - rect.left; tl = clamp((sx - lx) / 260, -1, 1) * 16;
            }
          }
          lx0 += (tx - lx0) * Math.min(1, dt * 8); ly0 += (ty - ly0) * Math.min(1, dt * 8); lean += (tl - lean) * Math.min(1, dt * 3);
          var t = 'translate(' + lx0.toFixed(2) + 'px,' + ly0.toFixed(2) + 'px)';
          head.style.transform = 'translate(' + (lx0 * 0.4).toFixed(2) + 'px,' + (ly0 * 0.3).toFixed(2) + 'px)';
          cap.style.transform = 'translate(' + (lx0 * 0.5).toFixed(2) + 'px,' + (ly0 * 0.35).toFixed(2) + 'px)';
          eye.style.transform = t;
          eye.style.opacity = '1';
          smoke.style.transform = 'skewX(' + lean.toFixed(2) + 'deg)';
          return inside || Math.abs(lx0) + Math.abs(ly0) + Math.abs(lean) > 0.02;
        }
      });
    }());

    /* CHECKS: while the pointer is over the drawing, the surveyor's head and sight line follow it.
       Off the drawing the CSS state (the active check) takes over again. Skipped when the drawing is scroll-scrubbed. */
    (function () {
      var sec = d.getElementById('checks'), dia = sec && $('.chk-dia', sec); if (!dia) return;
      if (RW.checks && RW.checks.state && RW.checks.state.scrub) return;
      var head = $('.d-head', dia), cone = $('.d-cone', dia), on = false, ang = null;
      dia.addEventListener('pointerenter', function () { on = true; wakeSec(sec); });
      dia.addEventListener('pointerleave', function () { on = false; ang = null; head.style.transform = cone.style.transform = ''; cone.style.transition = head.style.transition = ''; });
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          if (!on || !inside) return false;
          var m = dia.getScreenCTM(); if (!m) return false;
          var ox = m.a * 80 + m.e - rect.left, oy = m.d * 246 + m.f - rect.top;
          var a = clamp(Math.atan2(ly - oy, lx - ox) * 180 / Math.PI, -40, 8);
          if (ang === null) ang = a; ang += (a - ang) * Math.min(1, dt * 10);
          cone.style.transition = head.style.transition = 'none';
          cone.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';
          head.style.transform = 'rotate(' + (-14 + ang * 0.45).toFixed(2) + 'deg)';
          return true;
        }
      });
    }());

    /* URGENT: the bucket follows the pointer along the floor. Under the drip it catches (rings on the water);
       moved away, the drip reaches the floor and splashes. */
    (function () {
      var sec = d.getElementById('urgent'), art = sec && $('.ug-art svg', sec), catcher = sec && $('.ug-catch', sec); if (!catcher) return;
      var bx = 0, bv = 0;
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var target = 0;
          if (inside) {
            var m = art.getScreenCTM(); if (m) {
              var sx = (lx + rect.left - m.e) / m.a;         /* pointer in svg units */
              target = clamp(sx - 110, -78, 78);
            }
          }
          bv += ((target - bx) * 60 - bv * 11) * dt; bx += bv * dt;
          catcher.style.transform = 'translateX(' + bx.toFixed(2) + 'px) rotate(' + clamp(-bv * 0.03, -6, 6).toFixed(2) + 'deg)';
          sec.classList.toggle('is-miss', Math.abs(bx) > 20);
          return inside || Math.abs(bx) > 0.05 || Math.abs(bv) > 0.5;
        }
      });
    }());

    /* FAQ: the little house lights its windows as you come near and the smoke bends away from you. */
    (function () {
      var sec = d.getElementById('faq'), ill = sec && $('.faq-ill', sec); if (!ill || !ill.getClientRects().length) return;
      var smoke = $('.i-smoke', ill), near = 0, lean = 0;
      if (smoke) { smoke.style.transformBox = 'view-box'; smoke.style.transformOrigin = '124px 24px'; }
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var tn = 0, tl = 0;
          if (inside) {
            var r = ill.getBoundingClientRect(), cx = r.left + r.width / 2 - rect.left, cy = r.top + r.height / 2 - rect.top, dd = Math.hypot(lx - cx, ly - cy);
            tn = clamp(1 - (dd - 60) / 320, 0, 1); tl = clamp((cx - lx) / 300, -1, 1) * 18;
          }
          near += (tn - near) * Math.min(1, dt * 4); lean += (tl - lean) * Math.min(1, dt * 3);
          ill.style.setProperty('--near', near.toFixed(3));
          if (smoke) smoke.style.transform = 'skewX(' + lean.toFixed(2) + 'deg)';
          return inside || near > 0.005 || Math.abs(lean) > 0.05;
        }
      });
    }());

    /* CONTACT: a warm pool of lamp light follows the pointer across the section, as if someone carried a lamp to the form. */
    (function () {
      var sec = d.getElementById('contact'); if (!sec) return;
      var lamp = d.createElement('span'); lamp.className = 'rx-lamp'; lamp.setAttribute('aria-hidden', 'true'); sec.insertBefore(lamp, sec.firstChild);
      var x = -1e4, y = 0, o = 0;
      reg(sec, {
        frame: function (dt, lx, ly, inside) {
          if (inside) { if (x < -1e3) { x = lx; y = ly; } x += (lx - x) * Math.min(1, dt * 6); y += (ly - y) * Math.min(1, dt * 6); }
          o += ((inside ? 1 : 0) - o) * Math.min(1, dt * 3);
          lamp.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
          lamp.style.opacity = o.toFixed(3);
          return inside || o > 0.005;
        }
      });
    }());

    /* WORK: each photo tilts towards the pointer and a soft glint slides across it. */
    (function () {
      var sec = d.getElementById('work'); if (!sec) return;
      var tiles = $$('.wk-btn', sec).map(function (b) {
        var g = d.createElement('span'); g.className = 'rx-glint'; g.setAttribute('aria-hidden', 'true'); b.appendChild(g);
        return { b: b, g: g, rx: 0, ry: 0, gx: 50, on: false };
      });
      tiles.forEach(function (t) {
        t.b.addEventListener('pointerenter', function () { t.on = true; wakeSec(sec); });
        t.b.addEventListener('pointerleave', function () { t.on = false; });
      });
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var busy = false;
          tiles.forEach(function (t) {
            var trx = 0, tryy = 0, tg = t.gx;
            if (t.on && inside) {
              var r = t.b.getBoundingClientRect(), u = (lx + rect.left - r.left) / r.width - 0.5, v = (ly + rect.top - r.top) / r.height - 0.5;
              trx = -v * 9; tryy = u * 11; tg = (u + 0.5) * 100;
            }
            t.rx += (trx - t.rx) * Math.min(1, dt * 9); t.ry += (tryy - t.ry) * Math.min(1, dt * 9); t.gx += (tg - t.gx) * Math.min(1, dt * 7);
            t.b.style.transform = Math.abs(t.rx) + Math.abs(t.ry) > 0.02 ? 'perspective(900px) rotateX(' + t.rx.toFixed(2) + 'deg) rotateY(' + t.ry.toFixed(2) + 'deg)' : '';
            t.g.style.transform = 'translateX(' + (t.gx * 2 - 100).toFixed(1) + '%)';
            t.g.style.opacity = t.on ? '1' : '0';
            if (t.on || Math.abs(t.rx) + Math.abs(t.ry) > 0.02) busy = true;
          });
          return busy;
        }
      });
    }());

    /* TRUST: the four icons lean towards the pointer, nearest leans most. */
    (function () {
      var sec = d.getElementById('trust'); if (!sec) return;
      var ics = $$('.tr-ic', sec).map(function (el) { return { el: el, x: 0, y: 0, r: 0 }; });
      reg(sec, {
        frame: function (dt, lx, ly, inside, rect) {
          var busy = false;
          ics.forEach(function (o) {
            var tx = 0, ty = 0, tr = 0;
            if (inside) {
              var b = o.el.getBoundingClientRect(), cx = b.left + b.width / 2 - rect.left, cy = b.top + b.height / 2 - rect.top;
              var dx = lx - cx, dy = ly - cy, dd = Math.hypot(dx, dy) || 1, f = clamp(1 - dd / 420, 0, 1);
              tx = dx / dd * 5 * f; ty = dy / dd * 3 * f; tr = dx / dd * 10 * f;
            }
            o.x += (tx - o.x) * Math.min(1, dt * 7); o.y += (ty - o.y) * Math.min(1, dt * 7); o.r += (tr - o.r) * Math.min(1, dt * 7);
            o.el.style.transform = 'translate(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) + 'px) rotate(' + o.r.toFixed(2) + 'deg)';
            if (Math.abs(o.x) + Math.abs(o.r) > 0.03) busy = true;
          });
          return busy || inside;
        }
      });
    }());

    /* hook for new sections: RW.react.reg(sec, {init, frame}) and RW.react.wake(sec) */
    RW.react = { reg: function (sec, r) { var o = reg(sec, r); if (o && o.init) o.init(sec); return o; }, wake: wakeSec, wash: wash, canvasFor: canvasFor };

    /* init the field canvases now */
    all.forEach(function (r) { if (r.init) RW.safe('react ' + (r.el.id || ''), function () { r.init(r.el); }); });

    /* ------------------------------------------------ the loop ------------------------------------------------ */
    RW.tick(function (t, dt) {
      var sy = window.pageYOffset;
      if (sy !== lastSY) {                                     /* scrolled under a still pointer */
        lastSY = sy;
        if (P.x > -1e3) { var el = d.elementFromPoint(P.x, P.y); setCur(secAt(el)); if (cur) wakeSec(cur); }
      }
      for (var i = 0; i < all.length; i++) {
        var r = all[i]; if (!r.awake || !r.frame) continue;
        var rect = r.el.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > window.innerHeight + 50) { r.awake = false; continue; }
        var inside = r.el === cur;
        r.awake = !!r.frame(dt, P.x - rect.left, P.y - rect.top, inside, rect);
      }
    });
  }, { motion: true });
}());
