/* MOBILE (owner: lead). Phone-first touches that do not exist on desktop:
   - .m-rail lists get a small progress line that follows the swipe.
   Runs everywhere (no motion needed); the CSS only turns rails on under 760px. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('m-rails', function () {
    RW.$$('.m-rail').forEach(function (rail) {
      var bar = document.createElement('div'); bar.className = 'm-rail-bar'; bar.setAttribute('aria-hidden', 'true');
      var i = document.createElement('i'); bar.appendChild(i);
      rail.parentNode.insertBefore(bar, rail.nextSibling);
      function upd() {
        var max = rail.scrollWidth - rail.clientWidth; if (max <= 0) { bar.style.visibility = 'hidden'; return; }
        bar.style.visibility = '';
        var p = rail.scrollLeft / max, w = Math.max(18, 96 * rail.clientWidth / rail.scrollWidth);
        i.style.width = w + 'px'; i.style.setProperty('--mx', (p * (96 - w)).toFixed(1) + 'px');
      }
      rail.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', upd); upd();
    });
  });
}());
