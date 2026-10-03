/* URGENT LEAK BAND (owner: lead): the drip only runs while the band is on screen. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('urgent', function () {
    var sec = RW.$('#urgent'); if (!sec) return;
    RW.headings(sec);
    RW.reveal(RW.$$('.ug-lead, .ug-act', sec), { y: 18, stagger: 0.08 });
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
