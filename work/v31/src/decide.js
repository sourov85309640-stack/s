/* DECIDE behaviour (owner: section team svc/dec). A four-stop roof-condition scale.
   State machine (state-machine skill):
     scroll  : the stop follows the reader through the section (motion only; scroll-linked, never pinned)
     hover   : a fine pointer over a card shows that stop while it stays there
     locked  : a tap, click, Enter/Space, a tab (V5) or the slider (V6) chooses a stop; aria-pressed=true.
               Choosing the same card again releases it and scroll takes over again.
   Output: --s (0..3, continuous) on .dec-body, .is-on on the current card/labels, captions.
   Variants: ?v=N sets services and decide, ?dv=N decide only. Default 1. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var sec = d.getElementById('decide');
  if (!RW || !sec) return;
  var $ = RW.$, $$ = RW.$$;
  function q(key) { var m = new RegExp('[?&]' + key + '=([1-6])(?:&|#|$)').exec(location.search); return m ? m[1] : null; }
  var V = RW.variant(sec, 'dv', ['2', '1', '4'], ['Weathering roof', 'Gauge', 'Dial']);

  var body = $('.dec-body', sec), cards = $$('.dec-card', sec), picks = $$('.dec-pick', sec);
  var NAMES = ['Sound', 'Tired', 'Unclear', 'Past repair'];
  var VALUETEXT = ['Sound with one fault: repair', 'Tired: maintain', 'Unclear: investigate', 'Past repair: replace'];
  var S = { s: 0, t: 0, i: -1, hover: -1, lock: -1, scrollT: null };
  var range = $('#dec-range', sec), tabs = $$('.dec-t', sec);
  var roofLayers = (V === '2' || V === '5') ? $$('.dec-roof [data-lc],.dec-roof [data-lx]', sec) : [];
  var lastRoof = -1;

  function paint() {
    body.style.setProperty('--s', S.s.toFixed(3));
    var i = Math.round(RW.clamp(S.s, 0, 3));
    if (roofLayers.length && Math.abs(S.s - lastRoof) > 0.004) {
      lastRoof = S.s;
      roofLayers.forEach(function (el) {
        var k = +(el.getAttribute('data-lc') || el.getAttribute('data-lx'));
        var o = RW.clamp((S.s - k + 0.75) / 0.75, 0, 1);
        el.style.opacity = (el.hasAttribute('data-lx') ? 1 - o : o).toFixed(3);
      });
    }
    if (i === S.i) return;
    S.i = i;
    /* V1-V4 start with no card lit until the scale has a meaning (scroll reached it, or the reader chose) */
    var lit = S.active ? i : -1;
    cards.forEach(function (c, j) { c.classList.toggle('is-on', j === lit); c.classList.toggle('is-reached', j <= i && S.active); });
    $$('.dec-g-labels li,.dec-th-labels li,.dec-d-labels li,.dec-s-labels li', sec).forEach(function (li) {
      li.classList.toggle('is-on', S.active && Array.prototype.indexOf.call(li.parentNode.children, li) === i);
    });
    tabs.forEach(function (b, j) { b.classList.toggle('is-on', j === i); });
    $$('.dec-cap-t,.dec-th-v', sec).forEach(function (el) { el.textContent = NAMES[i]; });
    if (range && S.lock < 0) { range.value = String(i); }
    if (range) range.setAttribute('aria-valuetext', VALUETEXT[+range.value]);
  }
  function wanted() { return S.lock > -1 ? S.lock : S.hover > -1 ? S.hover : S.scrollT != null ? S.scrollT : S.s; }
  /* without the motion engine the scale jumps straight to the new stop */
  function settle() { S.t = wanted(); if (!loop) { S.s = S.t; S.i = -2; paint(); } }
  var loop = false;

  function setLock(i) {
    S.lock = (S.lock === i) ? -1 : i;
    S.active = true;
    picks.forEach(function (b, j) { b.setAttribute('aria-pressed', j === S.lock ? 'true' : 'false'); });
    tabs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === S.lock ? 'true' : 'false'); });
    S.i = -2; settle();
  }

  RW.add('dec-scale', function () {
    /* V5 and V6 always show one answer; the others start neutral */
    S.active = (V === '5' || V === '6');
    cards.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;           /* the link goes to the form, it does not change the scale */
        setLock(i);
      });
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { S.hover = i; S.active = true; S.i = -2; settle(); } });
      c.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { S.hover = -1; settle(); } });
    });
    tabs.forEach(function (b, i) { b.addEventListener('click', function () { if (S.lock !== i) setLock(i); }); });
    if (range) {
      var onRange = function () { if (S.lock !== +range.value) { S.lock = -1; setLock(+range.value); } };
      range.addEventListener('input', onRange); range.addEventListener('change', onRange);
    }
    S.i = -2; paint();
  });

  /* ---- scroll link + easing loop (motion only) ---- */
  RW.add('dec-scroll', function () {
    loop = true;
    var vh = window.innerHeight, geo = { top: 0, h: 0, centers: [], vertical: false };
    var snapRow = (V === '4') ? $('.dec-cards', sec) : null;
    var narrow = window.matchMedia('(max-width: 767px)');
    function measure() {
      vh = window.innerHeight;
      var sy = window.pageYOffset, r = body.getBoundingClientRect();
      geo.top = r.top + sy; geo.h = r.height;
      geo.centers = cards.map(function (c) { var b = c.getBoundingClientRect(); return b.top + sy + b.height / 2; });
      geo.vertical = (V !== '5') && (geo.centers[3] - geo.centers[0]) > vh * 0.3;
    }
    /* a soft dwell at each stop so the marker rests on a stop rather than sliding through it */
    function dwell(x) { var i = Math.floor(x), f = x - i; f = RW.clamp((f - 0.2) / 0.6, 0, 1); f = f * f * (3 - 2 * f); return Math.min(3, i + f); }
    function fromScroll() {
      if (snapRow && narrow.matches) {
        var max = snapRow.scrollWidth - snapRow.clientWidth;
        return max > 0 ? RW.clamp(snapRow.scrollLeft / max, 0, 1) * 3 : 0;
      }
      var sy = window.pageYOffset, a = sy + vh * 0.55, c = geo.centers;
      if (geo.vertical) {
        if (a <= c[0]) return 0;
        for (var k = 0; k < 3; k++) if (a <= c[k + 1]) return dwell(k + (a - c[k]) / (c[k + 1] - c[k]));
        return 3;
      }
      /* row layouts: sound when the cards are first fully on screen, past repair as they reach the header */
      var bottom = geo.top + geo.h - sy;
      var p = RW.clamp((vh - bottom) / Math.max(240, vh - RW.HDR - 24 - geo.h), 0, 1);
      return dwell(p * 3);
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', function () { setTimeout(measure, 150); });
    RW.ST.addEventListener('refresh', measure);
    var live = false;
    RW.onView(sec, { margin: '10% 0px 10% 0px', enter: function () { live = true; }, leave: function () { live = false; } });
    RW.tick(function (t, dt) {
      if (!live) return;
      var st = fromScroll();
      /* the scale only switches on once the reader has reached the cards */
      if (!S.active && window.pageYOffset + vh * 0.75 > geo.top + 40) { S.active = true; S.i = -2; }
      S.scrollT = st;
      S.t = wanted();
      var k = 1 - Math.pow(0.0006, dt);       /* about 0.12 per frame at 60fps */
      var nx = S.s + (S.t - S.s) * k;
      if (Math.abs(S.t - nx) < 0.002) nx = S.t;
      if (nx !== S.s) { S.s = nx; paint(); }
    });
  }, { motion: true });

  /* ---- reveals ---- */
  RW.add('dec-reveal', function () {
    RW.headings(sec);
    RW.reveal([$('.dec-keep', sec)], { y: 14 });
    RW.reveal($$('.dec-sec[data-v="' + V + '"] .dec-m', d).filter(function (m) { return getComputedStyle(m).display !== 'none' && getComputedStyle(m).position !== 'sticky'; }), { y: 16 });
    if (V !== '5') RW.reveal(cards, { y: 22, stagger: 0.07 });
    else RW.reveal([$('.dec-cards', sec)], { y: 18 });
  }, { motion: true });
}());
