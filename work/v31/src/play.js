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

/* LOUPE (owner: lead): in "Start with what you can see", a round magnifier follows the pointer over the problem photos,
   so people can look closer at the slates the way a roofer would. The lead photo's hand-drawn notes draw in on arrival
   and again whenever the photo is hovered. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('loupe', function () {
    var sec = RW.$('#problems'); if (!sec) return;
    var lead = RW.$('.svc:first-child', sec);
    if (lead && RW.$('.svc-notes', lead)) {
      RW.onView(lead, { once: true, margin: '0px 0px -30% 0px', enter: function () { lead.classList.add('is-noted'); } });
    }
    if (!RW.fine) return;
    var Z = 2.4, R = 78, L = document.createElement('div');
    L.className = 'rx-loupe'; L.setAttribute('aria-hidden', 'true'); L.innerHTML = '<i></i><span>Look closer</span>';
    document.body.appendChild(L);
    var cur = null;
    /* the whole card is a stretched link, so listen on the card and check whether the pointer is over its photo */
    function off() { if (!cur) return; cur = null; L.classList.remove('is-on'); document.documentElement.classList.remove('is-loupe'); }
    RW.$$('.svc', sec).forEach(function (card) {
      var img = RW.$('.cw img', card); if (!img) return;
      card.addEventListener('pointermove', function (e) {
        var r = img.closest('.cw').getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { off(); return; }
        if (cur !== img) { cur = img; L.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")'; L.classList.add('is-on'); document.documentElement.classList.add('is-loupe'); }
        var ir = img.getBoundingClientRect(), nw = img.naturalWidth || ir.width, nh = img.naturalHeight || ir.height;
        var sc = Math.max(ir.width / nw, ir.height / nh), dw = nw * sc, dh = nh * sc, ox = (ir.width - dw) / 2, oy = (ir.height - dh) / 2;
        var ix = e.clientX - ir.left - ox, iy = e.clientY - ir.top - oy;
        L.style.transform = 'translate(' + (e.clientX - R) + 'px,' + (e.clientY - R) + 'px)';
        L.style.backgroundSize = (dw * Z).toFixed(0) + 'px ' + (dh * Z).toFixed(0) + 'px';
        L.style.backgroundPosition = (R - ix * Z).toFixed(0) + 'px ' + (R - iy * Z).toFixed(0) + 'px';
      });
      card.addEventListener('pointerleave', off);
    });
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
