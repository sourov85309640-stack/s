/* WHO WE WORK FOR (owner: lead): cards rise in, each scene plays once as its card arrives, then on hover or focus. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('sectors'); if (s) RW.variant(s, 'scv', ['1','2'], ['Four cards','Alternating rows']); }());
  RW.add('sectors', function () {
    var sec = RW.$('#sectors'); if (!sec) return;
    var cards = RW.$$('.sc-card', sec);
    RW.headings(sec);
    RW.reveal(cards, { y: 30, stagger: 0.08 });
    /* on touch screens a tap on the picture replays its scene (hover does this with a mouse) */
    cards.forEach(function (c) {
      c.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' || (e.target.closest && e.target.closest('a'))) return;
        c.classList.remove('is-play'); void c.offsetWidth; c.classList.add('is-play');
        clearTimeout(c._pt); c._pt = setTimeout(function () { c.classList.remove('is-play'); }, 2800);
      }, { passive: true });
    });
    cards.forEach(function (c, i) {
      RW.onView(c, { once: true, margin: '0px 0px -20% 0px', enter: function () {
        setTimeout(function () { c.classList.add('is-play'); setTimeout(function () { c.classList.remove('is-play'); }, 2800); }, 300 + i * 180);
      } });
    });
  }, { motion: true });
}());
