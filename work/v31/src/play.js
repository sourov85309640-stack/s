/* PLAY (owner: lead). Small hover moments that differ from section to section.
   1. Headings answer the pointer: as it passes, the nearest words move. Four styles, rotated through the page so no two
      neighbouring sections share one: lift (words rise), tilt (words rock), push (words lean away), grow (words swell).
      Moves the outer word mask with the individual `translate` / `rotate` / `scale` properties, so it never touches the
      GSAP reveal on the inner word. Fine pointers with motion allowed only.
   2. Buttons and links get their hover moments from play.css (no JS). */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('play-words', function () {
    if (!RW.fine) return;
    var STY = ['lift', 'tilt', 'push', 'grow'];
    var heads = [], px = -1e4, py = -1e4, stop = null;
    RW.$$('main > section').forEach(function (sec, i) {
      RW.$$('h2[data-split]', sec).forEach(function (h) {
        var ws = RW.$$('.w', h).map(function (w) { return { el: w, v: 0, cx: 0, cy: 0 }; });
        if (ws.length) heads.push({ h: h, ws: ws, sty: STY[i % STY.length], on: false });
      });
    });
    if (!heads.length) return;
    function measure(hd) {
      hd.ws.forEach(function (w) { var r = w.el.getBoundingClientRect(); w.cx = r.left + r.width / 2; w.cy = r.top + r.height / 2; w.w = r.width; });
    }
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      var any = false;
      heads.forEach(function (hd) {
        var r = hd.h.getBoundingClientRect(), near = px > r.left - 120 && px < r.right + 120 && py > r.top - 90 && py < r.bottom + 90;
        if (near && !hd.on) measure(hd);
        if (near) { hd.on = true; any = true; }
      });
      if (any && !stop) stop = RW.tick(step);
    }, { passive: true });
    window.addEventListener('scroll', function () { heads.forEach(function (hd) { if (hd.on) measure(hd); }); }, { passive: true });
    function step(t, dt) {
      var busy = false;
      heads.forEach(function (hd) {
        if (!hd.on) return;
        var r = hd.h.getBoundingClientRect(), near = px > r.left - 120 && px < r.right + 120 && py > r.top - 90 && py < r.bottom + 90, live = false;
        hd.ws.forEach(function (w) {
          var dx = w.cx - px, dy = w.cy - py, d = Math.sqrt(dx * dx + dy * dy), tgt = near ? Math.max(0, 1 - d / 140) : 0;
          w.v += (tgt - w.v) * Math.min(1, dt * (tgt > w.v ? 14 : 5));
          var v = w.v, s = w.el.style;
          if (v < 0.002) { if (s.translate || s.rotate || s.scale) { s.translate = s.rotate = s.scale = ''; } return; }
          live = true;
          if (hd.sty === 'lift') s.translate = '0 ' + (-6 * v).toFixed(2) + 'px';
          else if (hd.sty === 'tilt') { s.rotate = ((dx < 0 ? -1 : 1) * 5 * v).toFixed(2) + 'deg'; s.translate = '0 ' + (-2 * v).toFixed(2) + 'px'; }
          else if (hd.sty === 'push') s.translate = ((dx < 0 ? -1 : 1) * 6 * v).toFixed(2) + 'px ' + ((dy < 0 ? -1 : 1) * 2 * v).toFixed(2) + 'px';
          else { s.scale = (1 + 0.07 * v).toFixed(3); s.translate = '0 ' + (-2 * v).toFixed(2) + 'px'; }
        });
        if (!near && !live) hd.on = false;
        if (hd.on) busy = true;
      });
      if (!busy && stop) { stop(); stop = null; }
    }
  }, { motion: true });
}());

/* EVENING (owner: lead): at the very bottom the little town in the footer settles in for the evening. Windows light up one
   by one as the footer arrives, and the ones nearest the pointer glow brighter as it passes over the roofs. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('evening', function () {
    var svg = RW.$('.ftr-roofs'); if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g'), wins = [];
    g.setAttribute('class', 'ftr-wins');
    for (var x = 24, i = 0; x < 1180; x += 46 + (i * 37) % 30, i++) {
      if (i % 4 === 3) continue;
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', i % 3 === 0 ? 108 : 116); r.setAttribute('width', 9); r.setAttribute('height', 8); r.setAttribute('rx', 1);
      g.appendChild(r); wins.push({ el: r, x: x + 4.5 });
    }
    svg.appendChild(g);
    var foot = svg.closest('footer');
    RW.onView(foot, { once: true, margin: '0px 0px -10% 0px', enter: function () {
      wins.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (w, k) { setTimeout(function () { w.el.classList.add('is-lit'); }, 300 + k * 140); });
    } });
    if (!RW.fine) return;
    foot.addEventListener('pointermove', function (e) {
      var m = svg.getScreenCTM(); if (!m) return;
      var sx = (e.clientX - m.e) / m.a;
      wins.forEach(function (w) { w.el.classList.toggle('is-near', Math.abs(w.x - sx) < 70); });
    }, { passive: true });
    foot.addEventListener('pointerleave', function () { wins.forEach(function (w) { w.el.classList.remove('is-near'); }); });
  }, { motion: true });
}());

/* IDLE LIFE (owner: lead): if nobody moves, scrolls or types for a few seconds, a small flock of birds crosses the screen,
   each time on a different path. Never more than once every 25 seconds. Motion only, any device. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('idle-life', function () {
    var last = performance.now(), lastFlock = 0, n = 0, d = document;
    ['pointermove', 'scroll', 'keydown', 'touchstart', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { last = performance.now(); }, { passive: true }); });
    var BIRD = '<svg viewBox="0 0 40 16" focusable="false"><path d="M1 9c6-6 12-6 19 1 7-7 13-7 19-1-6-2-12-1-19 5-7-6-13-7-19-5z"/></svg>';
    setInterval(function () {
      var now = performance.now();
      if (d.hidden || now - last < 7000 || now - lastFlock < 25000) return;
      lastFlock = now; n++;
      var f = d.createElement('div'); f.className = 'idle-flock idle-path' + (n % 3); f.setAttribute('aria-hidden', 'true');
      f.style.top = (12 + (n * 17) % 30) + 'vh';
      for (var i = 0; i < 4; i++) { var b = d.createElement('span'); b.className = 'idle-b'; b.innerHTML = BIRD; b.style.setProperty('--i', i); f.appendChild(b); }
      d.body.appendChild(f);
      setTimeout(function () { f.remove(); }, 9500);
    }, 1000);
  }, { motion: true });
}());

/* BACK TO THE TOP (owner: lead): a little ladder in the footer; its rungs climb on hover, the page glides up. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('to-top', function () {
    var ftr = RW.$('footer'); if (!ftr) return;
    var a = document.createElement('a');
    a.className = 'to-top'; a.href = '#top';
    a.innerHTML = '<svg viewBox="0 0 24 32" aria-hidden="true" focusable="false"><path class="tt-rail" d="M6 31V1M18 31V1"/><path class="tt-rungs" d="M6 27h12M6 21h12M6 15h12M6 9h12M6 3h12"/></svg><span>Back to the top</span>';
    ftr.appendChild(a);
  });
}());

/* BACKDROP ARRIVALS (owner: lead): the drawings in each section's back and front layers grow in softly the first time
   the section arrives, one after another. Uses the individual `scale` property and opacity, so it never fights
   depth.js (translate, rotate) or GSAP (transform). */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('backdrop-in', function () {
    RW.$$('main > section, footer').forEach(function (sec) {
      var items = RW.$$(':scope > .layers > svg, :scope > .layers > span:not(.ug-rain):not(.sv-grid):not(.faq-bk-grid)', sec);
      if (!items.length) return;
      items.forEach(function (el, i) { el.classList.add('bd-wait'); el.style.setProperty('--bd', (i * 110) + 'ms'); });
      RW.onView(sec, { once: true, margin: '0px 0px -15% 0px', enter: function () { items.forEach(function (el) { el.classList.add('bd-in'); }); } });
    });
  }, { motion: true });
}());

/* lead-photo notes for "Start with what you can see" version B (hand-drawn rings draw in once) */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('svc-notes', function () {
    var lead = RW.$('#problems .svc:first-child'); if (!lead || !RW.$('.svc-notes', lead)) return;
    RW.onView(lead, { once: true, margin: '0px 0px -30% 0px', enter: function () { lead.classList.add('is-noted'); } });
  }, { motion: true });
}());
