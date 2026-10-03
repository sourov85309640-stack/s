/* FREE SURVEY BAND (owner: lead): ticks draw as the band arrives; the pencil signs while the button is hovered or focused. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('survey'); if (s) RW.variant(s, 'svv', ['2','1'], ['Centred card','Band']); }());
  RW.add('survey', function () {
    var sec = RW.$('#survey'); if (!sec) return;
    RW.headings(sec);
    RW.onView(sec, { once: true, margin: '0px 0px -25% 0px', enter: function () { sec.classList.add('is-in'); } });
    var go = RW.$('.sv-go', sec);
    function on() { sec.classList.add('is-sign'); }
    function off() { sec.classList.remove('is-sign'); }
    go.addEventListener('pointerenter', on); go.addEventListener('pointerleave', off);
    go.addEventListener('focus', on); go.addEventListener('blur', off);
    /* the card leans a little towards the pointer (version 2, fine pointers) */
    var card = RW.$('.sv-in', sec);
    if (RW.fine && sec.getAttribute('data-v') === '2') {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), u = (e.clientX - r.left) / r.width - 0.5, v = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(1200px) rotateX(' + (-v * 4).toFixed(2) + 'deg) rotateY(' + (u * 5).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
  }, { motion: true });
}());
