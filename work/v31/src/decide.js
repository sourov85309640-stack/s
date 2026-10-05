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
  var V = RW.variant(sec, 'dv', ['7', '4', '2', '1', '3', '5', '6'], ['Roof through the years', 'Dial', 'Weathering roof', 'Gauge', 'Sketch: timeline rail', 'Sketch: tabs', 'Sketch: self-check slider']);

  var body = $('.dec-body', sec), cards = $$('.dec-card', sec), picks = $$('.dec-pick', sec);
  var NAMES = ['Sound', 'Tired', 'Unclear', 'Past repair'];
  var VALUETEXT = ['Sound with one fault: repair', 'Tired: maintain', 'Unclear: investigate', 'Past repair: replace'];
  var S = { s: 0, t: 0, i: -1, hover: -1, lock: -1, scrollT: null };
  var range = $('#dec-range', sec), tabs = $$('.dec-t', sec);
  var roofLayers = (V === '2' || V === '5' || V === '7') ? $$('.dec-roof [data-lc],.dec-roof [data-lx]', sec) : [];
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
    if (V === '7') {   /* the years tick on with the condition */
      var yr = Math.round(2 + S.s / 3 * 38);
      if (yr !== S.yr) { S.yr = yr; var ye = $('.dec-yr', sec); if (ye) ye.textContent = yr; }
      paint7(S.s);
    }
    if (i === S.i) return;
    S.i = i;
    sec.setAttribute('data-stage', String(i));
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
  /* V7: the scene ages with the years. The tree grows and turns with the seasons (one round every four years),
     the chimney pot leans, the gutter sags and sprouts a weed, birds nest in it, and a ring sits on the fault */
  var X7 = V === '7' ? { tree: $('.dec-tree', sec), crown: $('.dec-tr-crown', sec), bloom: $('.dec-tr-bloom', sec), pot: $('.dec-pot', sec), gut: $('.dec-gut', sec),
    weed: $('.dec-weed', sec), slip: $('.dec-slip', sec), nest: $('.dec-nest', sec), ring: $('.dec-ring', sec) } : null;
  var RING = [[130, 128], [165, 132], [184, 122], [210, 70]], SEASON = ['#9DBE6A', '#6F9A4E', '#D08A3E', '#8C7A62'];
  function paint7(v) {
    if (!X7 || !X7.tree) return;
    var cl = function (x) { return RW.clamp(x, 0, 1); }, yrF = 2 + v / 3 * 38, ph = (yrF / 4) % 1, q = Math.floor(ph * 4);
    X7.tree.setAttribute('transform', 'translate(404 250) scale(' + (0.55 + v / 3 * 0.6).toFixed(3) + ')');
    X7.crown.style.setProperty('--dec-leaf', SEASON[q]);
    X7.crown.style.opacity = q === 3 ? 0.2 : 1;
    X7.bloom.style.opacity = q === 0 ? 1 : 0;
    X7.pot.setAttribute('transform', 'rotate(' + (-cl((v - 1.8) / 1.2) * 12).toFixed(2) + ' 291 16)');
    X7.gut.setAttribute('transform', 'rotate(' + (-cl(v - 2) * 1.2).toFixed(2) + ' 392 188)');
    X7.slip.style.opacity = (1 - cl((v - 0.55) / 0.4)).toFixed(3);
    X7.weed.setAttribute('transform', 'translate(70 186) scale(' + cl((v - 1.4) / 1).toFixed(3) + ')');
    X7.nest.style.opacity = cl((v - 1.8) / 0.5).toFixed(3);
    var a = Math.floor(RW.clamp(v, 0, 2.999)), f = v - a, p0 = RING[a], p1 = RING[Math.min(3, a + 1)];
    f = f * f * (3 - 2 * f);
    X7.ring.setAttribute('transform', 'translate(' + (p0[0] + (p1[0] - p0[0]) * f).toFixed(1) + ' ' + (p0[1] + (p1[1] - p0[1]) * f).toFixed(1) + ')');
  }
  if (V === '7') RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
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
    /* V7: the stage pins and the scroll ages the roof from new to past repair */
    var pinP = 0;
    if (V === '7') {
      /* on wide screens the heading rides along in the pinned stage, so the scene never loses its title */
      var st7 = $('.dec-stage7', sec), hd7 = $('.head2', sec);
      if (st7 && hd7 && window.innerWidth > 599 && window.innerHeight > 700) { st7.insertBefore(hd7, st7.firstChild); sec.classList.add('dec-head-in'); }
      S.active = true; S.i = -2; paint();
      RW.ST.create({ trigger: $('.dec-stage7', sec) || body, start: 'top top+=' + ((RW.HDR || 76) + 8), end: '+=' + (window.innerWidth > 999 ? 230 : 190) + '%',
        pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: function (self) { pinP = self.progress; } });
    }
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
      if (V === '7') return dwell(RW.clamp(pinP * 1.08, 0, 1) * 3);
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
