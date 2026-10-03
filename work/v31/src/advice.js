/* ROOFING ADVICE (owner: lead): cards rise in. Opening and closing is native <details>. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('advice', function () {
    var sec = RW.$('#advice'); if (!sec) return;
    RW.headings(sec);
    RW.reveal(RW.$$('.ad-card', sec), { y: 28, stagger: 0.08 });
  }, { motion: true });
}());
