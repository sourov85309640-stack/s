/* ACCREDITATIONS (owner: lead): seals stamp in once, ribbons flutter while the band is on screen. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('accred', function () {
    var sec = RW.$('#accred'); if (!sec) return;
    RW.onView(sec, { once: true, margin: '0px 0px -15% 0px', enter: function () { sec.classList.add('is-in'); } });
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
