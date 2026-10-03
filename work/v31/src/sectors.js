/* WHO WE WORK FOR (owner: lead): cards rise in, each scene plays once as its card arrives, then on hover or focus. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('sectors', function () {
    var sec = RW.$('#sectors'); if (!sec) return;
    var cards = RW.$$('.sc-card', sec);
    RW.headings(sec);
    RW.reveal(cards, { y: 30, stagger: 0.08 });
    cards.forEach(function (c, i) {
      RW.onView(c, { once: true, margin: '0px 0px -20% 0px', enter: function () {
        setTimeout(function () { c.classList.add('is-play'); setTimeout(function () { c.classList.remove('is-play'); }, 2800); }, 300 + i * 180);
      } });
    });
  }, { motion: true });
}());
