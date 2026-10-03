/* ROOFING ADVICE (owner: lead): cards rise in. Opening and closing is native <details>. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('advice'); if (s) RW.variant(s, 'adv', ['1','2'], ['Three cards','List with pictures']); }());
  RW.add('advice', function () {
    var sec = RW.$('#advice'); if (!sec) return;
    RW.headings(sec);
    RW.reveal(RW.$$('.ad-card', sec), { y: 28, stagger: 0.08 });
  }, { motion: true });
}());
