/* TRUST STRIP (owner: lead): icons draw once when the strip arrives, one after another. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('trust', function () {
    var items = RW.$$('#trust .tr-item'); if (!items.length) return;
    RW.onView(RW.$('#trust'), { once: true, margin: '0px 0px -10% 0px', enter: function () {
      items.forEach(function (it, i) {
        setTimeout(function () { it.classList.add('is-seen'); setTimeout(function () { it.classList.remove('is-seen'); }, 1600); }, 300 + i * 160);
      });
    } });
  }, { motion: true });
}());
/* trust items flip to one more line (works without motion too) */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('trust-flip', function () {
    RW.$$('#trust .tr-flip').forEach(function (b) {
      var more = RW.$('.tr-more', b), txt = RW.$('.tr-txt', b);
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        more.hidden = !on;
        var el = on ? more : txt; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      });
    });
  });
}());
