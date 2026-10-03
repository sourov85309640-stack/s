/* WHAT WE DO (owner: lead): icons play once as each card arrives (stagger), cards tilt a little toward a fine pointer. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('offer', function () {
    var sec = RW.$('#services.of'); if (!sec) return;
    var cards = RW.$$('.of-card', sec);
    RW.headings(sec);
    RW.reveal(cards, { y: 26, stagger: 0.07 });
    /* play each icon once when it is first seen, then hand it back to hover */
    cards.forEach(function (c, i) {
      RW.onView(c, { once: true, margin: '0px 0px -18% 0px', enter: function () {
        setTimeout(function () { c.classList.add('is-seen'); setTimeout(function () { c.classList.remove('is-seen'); }, 2200); }, 250 + (i % 4) * 140);
      } });
    });
    /* tilt toward the pointer (fine pointers only), transform via CSS variables */
    if (!RW.fine) return;
    cards.forEach(function (c) {
      var a = RW.$('.of-link', c), raf = 0, rx = 0, ry = 0;
      a.addEventListener('pointermove', function (e) {
        var r = a.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        rx = -((e.clientY - r.top) / r.height - 0.5) * 6;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; a.style.setProperty('--rx', rx.toFixed(2) + 'deg'); a.style.setProperty('--ry', ry.toFixed(2) + 'deg'); });
      });
      a.addEventListener('pointerleave', function () { a.style.setProperty('--rx', '0deg'); a.style.setProperty('--ry', '0deg'); });
    });
  }, { motion: true });
}());
