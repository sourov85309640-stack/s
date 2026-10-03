/* ABOUT AND WHY CHOOSE US (owner: lead): the roofer places the last tile, ticks draw, numbers count up once. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('about', function () {
    var sec = RW.$('#about'); if (!sec) return;
    RW.headings(sec);
    RW.reveal(RW.$$('.ab-lead, .ab-stats > div, .ab-sign', sec), { y: 18, stagger: 0.07 });
    var art = RW.$('.ab-art', sec), items = RW.$$('.ab-why li', sec);
    function place() {
      sec.classList.remove('is-place'); void sec.offsetWidth; sec.classList.add('is-place');
    }
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
    RW.onView(art, { once: true, margin: '0px 0px -25% 0px', enter: function () { setTimeout(place, 300); } });
    if (RW.fine && art) {
      var last = 0;
      art.addEventListener('pointerenter', function () { var n = Date.now(); if (n - last > 2000) { last = n; place(); } });
    }
    items.forEach(function (li, i) {
      RW.onView(li, { once: true, margin: '0px 0px -15% 0px', enter: function () { setTimeout(function () { li.classList.add('is-seen'); }, i * 90); } });
    });
    /* count up (tabular numbers, final text restored at the end) */
    RW.$$('.ab-n', sec).forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-to')), dec = +el.getAttribute('data-dec') || 0, sep = el.hasAttribute('data-sep'), fin = el.textContent;
      function fmt(v) { var s = v.toFixed(dec); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s; }
      el.textContent = fmt(0);
      RW.onView(el, { once: true, margin: '0px 0px -10% 0px', enter: function () {
        var o = { v: 0 };
        RW.gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v); }, onComplete: function () { el.textContent = fin; } });
      } });
    });
  }, { motion: true });
}());
