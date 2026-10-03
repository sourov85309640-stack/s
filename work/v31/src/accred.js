/* ACCREDITATIONS (owner: lead): seals stamp in once, ribbons flutter while the band is on screen. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('accred'); if (s) RW.variant(s, 'acv', ['2','1'], ['Slow moving strip','Row of badges']); }());
  RW.add('accred', function () {
    var sec = RW.$('#accred'); if (!sec) return;
    RW.onView(sec, { once: true, margin: '0px 0px -15% 0px', enter: function () { sec.classList.add('is-in'); } });
    /* version 2: a seamless strip needs a second copy of the badges (hidden from screen readers) */
    if (sec.getAttribute('data-v') === '2') {
      var list = RW.$('.ac-list', sec);
      RW.$$('.ac-it', list).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); list.appendChild(c); });
    }
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
