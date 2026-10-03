/* FREE SURVEY BAND (owner: lead): ticks draw as the band arrives; the pencil signs while the button is hovered or focused. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('survey'); if (s) RW.variant(s, 'svv', ['1','2'], ['Band','Centred card']); }());
  RW.add('survey', function () {
    var sec = RW.$('#survey'); if (!sec) return;
    RW.headings(sec);
    RW.onView(sec, { once: true, margin: '0px 0px -25% 0px', enter: function () { sec.classList.add('is-in'); } });
    var go = RW.$('.sv-go', sec);
    function on() { sec.classList.add('is-sign'); }
    function off() { sec.classList.remove('is-sign'); }
    go.addEventListener('pointerenter', on); go.addEventListener('pointerleave', off);
    go.addEventListener('focus', on); go.addEventListener('blur', off);
  }, { motion: true });
}());
