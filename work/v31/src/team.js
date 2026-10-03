/* MEET THE TEAM (owner: lead). Portraits rise in; each plays its hover moment once as it arrives.
   Fine pointers: eyes follow the pointer anywhere in the section. Everyone blinks now and then while on screen. */
(function () {
  'use strict';
  var RW = window.RW;
  /* Design options: the team section is hidden unless ?team=on (most firms put people on a separate team page) */
  RW.options.push({ id: 'team', param: 'team', allowed: ['off', 'on'], names: ['Hidden (use a team page)', 'Show the team section'], current: document.documentElement.getAttribute('data-team') || 'off', label: 'Team' });
  RW.add('team', function () {
    var sec = RW.$('#team'); if (!sec) return;
    var cards = RW.$$('.tm-card', sec), live = false;
    RW.headings(sec);
    RW.reveal(cards, { y: 34, stagger: 0.09 });
    cards.forEach(function (c, i) {
      RW.onView(c, { once: true, margin: '0px 0px -20% 0px', enter: function () {
        setTimeout(function () { c.classList.add('is-play'); setTimeout(function () { c.classList.remove('is-play'); }, 1300); }, 450 + i * 260);
      } });
    });
    RW.onView(sec, { enter: function () { live = true; sec.classList.add('is-live'); }, leave: function () { live = false; sec.classList.remove('is-live'); } });
    /* blink: one person at a time, at random */
    (function blink() {
      setTimeout(function () {
        if (live) { var e = RW.$('.tm-eyes', cards[Math.floor(Math.random() * cards.length)]); e.classList.add('is-blink'); setTimeout(function () { e.classList.remove('is-blink'); }, 140); }
        blink();
      }, 1400 + Math.random() * 2200);
    }());
    if (!RW.fine) return;
    var eyes = cards.map(function (c) { return { svg: RW.$('svg', c), g: RW.$('.tm-eyes', c), x: 0, y: 0, tx: 0, ty: 0 }; });
    var px = 0, py = 0, on = false, stop = null;
    sec.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; on = true; run(); });
    sec.addEventListener('pointerleave', function () { on = false; run(); });
    function run() { if (!stop) stop = RW.tick(step); }
    function step(t, dt) {
      var busy = false;
      eyes.forEach(function (o) {
        if (on) {
          var m = o.svg.getScreenCTM(); if (!m) return;
          var cx = m.a * 80 + m.e, cy = m.d * 86 + m.f, dx = px - cx, dy = py - cy, dd = Math.hypot(dx, dy) || 1, k = Math.min(1, dd / 160);
          o.tx = dx / dd * 3.2 * k; o.ty = dy / dd * 2.4 * k;
        } else { o.tx = 0; o.ty = 0; }
        o.x += (o.tx - o.x) * Math.min(1, dt * 12); o.y += (o.ty - o.y) * Math.min(1, dt * 12);
        o.g.style.transform = 'translate(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) + 'px)';
        if (Math.abs(o.tx - o.x) + Math.abs(o.ty - o.y) > 0.02) busy = true;
      });
      if (!busy && stop) { stop(); stop = null; }
    }
  }, { motion: true });
}());
