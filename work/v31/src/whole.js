/* #whole: "A roof works as a whole" (owner: whole team). Light CSS 3D exploded roof.
   Prototype stage: ?v=1..6 picks the immersive variant (sets data-v on the section).
     1 lift apart (pinned, layers part and the list walks through them)
     2 build the roof (pinned, layers are placed from above, bottom first, then pressed together)
     3 turntable (pinned, the stack turns 40 degrees on a measured plate while it parts; the switch re-tiles in a cascade)
     4 cut-away corner (pinned, a stepped corner lifts out to show every layer in section, callouts one by one)
     5 raindrop (pinned, a drop falls through the layers and each one deals with it in turn)
     6 hands-on (no pin, a slider or a sideways drag on the stage lifts the layers)
   Features:
     'whole-ui'  (always, also reduced motion / data-motion="off"): Tiles|Slates radiogroup, list buttons highlight
                 their layer (QC-5), v6 slider, model fitting to the stage (QC-3, QC-8, QC-9).
     'whole'     (motion only): pinned at (min-width:900px) and (min-height:780px) (QC-2), flow otherwise with a sticky
                 stage on small screens (QC-6); reload at depth restores the scene (QC-1); pointer tilt; back/front parallax. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var sec = d.getElementById('whole');
  if (!sec || !RW) return;

  var V = 1;
  try { var mv = /[?&]v=([1-6])(?:&|#|$)/.exec(location.search); if (mv) V = +mv[1]; } catch (e) {}
  sec.setAttribute('data-v', String(V));

  var $ = RW.$, $$ = RW.$$, clamp = RW.clamp;
  var xv = d.getElementById('xv'), tilt = d.getElementById('xv-tilt'), grid = d.getElementById('whole-grid');
  var model = d.getElementById(V === 4 ? 'xv-cut' : 'xv-model');
  var list = d.getElementById('xv-list');
  if (!xv || !model || !list) return;
  var layers = $$(':scope > .xv-l', model).sort(function (a, b) { return a.getAttribute('data-layer') - b.getAttribute('data-layer'); });
  var btns = $$('button', list);
  var tags = layers.map(function (l) { return $('.xv-tag', l); });
  var svgs = layers.map(function (l) { return $(':scope > svg', l); });
  var calls = layers.map(function (l) { return $('.xv-call', l); });
  var note = d.getElementById('xv-note'), range = d.getElementById('xv-range'), readB = $('.xv-read b', sec);
  var drop = $('.xv-drop', model), dropB = $('.xv-drop-b', model), ripple = $('.xv-ripple', model);

  var S = RW.whole = { V: V, active: -2, go: null, live: false, cover: 'tiles', fitting: false };

  /* ---------- shared state and writer ---------- */
  var o = { s: 1, rz: -34, rx: 60, p: 1, w: 1, d0: 0, d1: 0, d2: 0, d3: 0, d4: 0 };
  S.o = o;
  function zOf(i) { return (i - 2) * (6 + 120 * o.s); }
  var lastRead = -1;
  function write() {
    model.style.setProperty('--s', o.s.toFixed(4));
    model.style.setProperty('--rz', o.rz.toFixed(2) + 'deg');
    model.style.setProperty('--rx', o.rx.toFixed(2) + 'deg');
    if (V === 4) model.style.setProperty('--w', o.w.toFixed(4));
    if (!S.live) return;
    if (V === 2) {
      var ts = clamp((o.s - 0.55) * 2.5, 0, 1);
      for (var i = 0; i < 5; i++) {
        var dd = S.fitting ? 0 : o['d' + i];
        layers[i].style.setProperty('--dz', (dd * 640).toFixed(1) + 'px');
        var op = clamp(1 - dd * 1.7, 0, 1);
        svgs[i].style.opacity = op < 1 ? op.toFixed(3) : '';
        tags[i].style.opacity = (op * ts).toFixed(3);
      }
    } else if (V === 3 && readB) {
      var deg = Math.round(o.rz + 56);
      if (deg !== lastRead) { lastRead = deg; readB.textContent = deg; }
    } else if (V === 5) { rain(); }
  }
  S.write = write;

  /* ---------- v5: the raindrop, computed from the scene progress o.p ---------- */
  var DROPS = [
    { x: 492, y: 110, hit: 4, t0: 0.13, t1: 0.21, t2: 0.29, y2: 330, h: 360 },   /* lands on the lead flashing, runs down it */
    { x: 140, y: 84, hit: 3, t0: 0.31, t1: 0.38, t2: 0.45, y2: 346, h: 360 },    /* lands on the covering, runs off at the eaves */
    { x: 320, y: 150, hit: 1, t0: 0.47, t1: 0.61, t2: 0.74, y2: 346, h: 560 }    /* through the slipped piece, caught by the underlay */
  ];
  function rain() {
    if (!drop || S.fitting) return;
    var p = o.p, cur = null;
    for (var i = 0; i < DROPS.length; i++) if (p >= DROPS[i].t0 && p <= DROPS[i].t2 + 0.02) { cur = DROPS[i]; break; }
    if (!cur) { dropB.style.opacity = 0; ripple.style.opacity = 0; return; }
    var zh = zOf(cur.hit) + 24, x = cur.x, y = cur.y, z, op = 1;
    if (p < cur.t1) {
      var u = (p - cur.t0) / (cur.t1 - cur.t0);
      z = zh + cur.h * (1 - u * u);
      op = clamp(u / 0.18, 0, 1);
    } else {
      var u2 = clamp((p - cur.t1) / (cur.t2 - cur.t1), 0, 1);
      y = cur.y + (cur.y2 - cur.y) * u2 * u2; z = zh;
      op = clamp((1 - u2) / 0.3, 0, 1);
    }
    drop.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px)';
    dropB.style.opacity = op.toFixed(3);
    var r = (p - cur.t1) / 0.07;
    if (r >= 0 && r <= 1) {
      ripple.style.transform = 'translate3d(' + cur.x + 'px,' + cur.y + 'px,' + (zh - 22).toFixed(1) + 'px) scale(' + (0.3 + 1.5 * r).toFixed(3) + ')';
      ripple.style.opacity = (0.8 * (1 - r)).toFixed(3);
    } else ripple.style.opacity = 0;
  }

  /* ---------- the variants: scene timelines on a 0..1 scale, list row windows ---------- */
  function W5(a, step) { var w = []; for (var k = 0; k < 5; k++) w.push([a + step * k, a + step * (k + 1)]); return w; }
  var CFG = {
    1: { len: 2.0, wins: W5(0.2, 0.16), spy: true,
      init: function () { o.s = 0; o.rz = -38; },
      build: function (tl) { tl.to(o, { s: 1, duration: 0.18, ease: 'power2.inOut' }, 0).to(o, { rz: -28, duration: 1 }, 0); },
      poses: [{ s: 1, rz: -38 }, { s: 1, rz: -28 }] },
    2: { len: 2.3, wins: [[0.6, 0.76], [0.46, 0.6], [0.32, 0.46], [0.18, 0.32], [0.04, 0.18]], after: -1, spy: false,
      init: function () { o.s = 1; o.rz = -40; o.d0 = o.d1 = o.d2 = o.d3 = o.d4 = 1; },
      build: function (tl) {
        for (var j = 0; j < 5; j++) { var v = {}; v['d' + j] = 0; v.duration = 0.13; v.ease = 'power3.out'; tl.to(o, v, 0.04 + 0.14 * j); }
        tl.to(o, { s: 0.16, duration: 0.18, ease: 'power2.inOut' }, 0.78).to(o, { rz: -30, duration: 1 }, 0);
      },
      poses: [{ s: 1, rz: -40 }, { s: 1, rz: -30 }] },
    3: { len: 2.3, wins: W5(0.2, 0.16), spy: true,
      init: function () { o.s = 0; o.rz = -56; },
      build: function (tl) { tl.to(o, { s: 1, duration: 0.3, ease: 'power2.inOut' }, 0).to(o, { rz: -16, duration: 1 }, 0); },
      poses: [{ s: 1, rz: -56 }, { s: 1, rz: -36 }, { s: 1, rz: -16 }] },
    4: { len: 2.2, wins: W5(0.3, 0.13), spy: true,
      init: function () { o.w = 0; o.s = 0; o.rz = -40; o.rx = 56; },
      build: function (tl) {
        tl.to(o, { w: 1, duration: 0.28, ease: 'power2.inOut' }, 0.02).to(o, { s: 1, duration: 0.26, ease: 'power2.inOut' }, 0.14)
          .to(o, { rz: -30, rx: 62, duration: 1 }, 0);
      },
      poses: [{ s: 1, rz: -40, rx: 56 }, { s: 1, rz: -30, rx: 62 }] },
    5: { len: 2.8, wins: [[0.12, 0.3], [0.3, 0.46], [0.46, 0.58], [0.58, 0.76], [0.76, 1.01]], spy: true,
      init: function () { o.s = 0; o.rz = -36; },
      build: function (tl) { tl.to(o, { s: 1, duration: 0.12, ease: 'power2.inOut' }, 0).to(o, { rz: -30, duration: 1 }, 0); },
      poses: [{ s: 1, rz: -36 }, { s: 1, rz: -30 }] },
    6: { wins: null, poses: [{ s: 1, rz: -40 }, { s: 1, rz: -28 }] }
  };
  var C = CFG[V];
  var FINAL = { s: 1, rz: -34, rx: 60, p: 1, w: 1, d0: 0, d1: 0, d2: 0, d3: 0, d4: 0 };
  function reset() { for (var k in FINAL) o[k] = FINAL[k]; }
  function rowAt(p) {
    var w = C.wins; if (!w) return S.active;
    if (C.after != null && p > 0.77) return C.after;
    var best = -1, first = 1;
    for (var k = 0; k < 5; k++) { if (w[k][0] < first) first = w[k][0]; if (p >= w[k][0] && p < w[k][1]) best = k; }
    if (best < 0 && p >= first) { /* past the last window: keep the last row */
      var last = 0; for (var j = 0; j < 5; j++) if (w[j][1] > w[last][1]) last = j; best = last;
    }
    return best;
  }
  function rowMid(k) { return (C.wins[k][0] + C.wins[k][1]) / 2; }

  /* ---------- highlight a layer: k = list row 0..4 (top first), -1 none ---------- */
  var NOTES = ['Lead at the joins turns water back onto the covering.', '', 'Where a piece has slipped, water gets past. The battens only hold the covering up.',
    'The underlay catches it and runs it down to the gutter.', 'The rafters stay dry, because every layer above did its job.'];
  function noteFor(k) {
    if (k < 0) return 'Follow a raindrop down through the layers.';
    if (k === 1) return 'The ' + S.cover + ' shed most of the rain down to the gutter.';
    return NOTES[k];
  }
  S.peel = function (k) {
    if (k === S.active) return;
    S.active = k;
    xv.classList.toggle('is-peel', k >= 0);
    layers.forEach(function (l, i) { l.classList.toggle('is-on', k >= 0 && i === 4 - k); });
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
    if (V === 4 && S.live) calls.forEach(function (c, i) { if (c) c.classList.toggle('is-shown', k >= 0 && 4 - i <= k); });
    if (V === 5 && note && S.live) note.textContent = noteFor(k);
    if (S.onPeel) S.onPeel(k);
  };

  /* ---------- fit the model (and its tags) into the stage, measured, so nothing clips at any width ---------- */
  function fitEls() {
    if (V === 4) return $$('.xv-main, .xv-cin', model);
    var els = svgs.concat(tags.filter(function (t) { return t && getComputedStyle(t).display !== 'none'; }));
    if (V === 3) els.push($('.xv-plate', model));
    return els;
  }
  function fit() {
    var st = xv.getBoundingClientRect();
    if (st.width < 40 || st.height < 40) return;
    var keep = {}, k;
    for (k in o) keep[k] = o[k];
    S.fitting = true;
    tilt.style.transform = 'none';
    var els = fitEls(), xs = 1, ox = 0, oy = 0;
    var pad = st.width < 520 ? 12 : 28;
    var cx = st.left + st.width / 2, cy = st.top + st.height / 2;
    function apply() {
      model.style.setProperty('--xs', xs.toFixed(4)); model.style.setProperty('--xi', (1 / xs).toFixed(4));
      model.style.setProperty('--ox', ox.toFixed(1) + 'px'); model.style.setProperty('--oy', oy.toFixed(1) + 'px');
    }
    apply();
    for (var pass = 0; pass < 4; pass++) {
      var l = 1e9, t = 1e9, r = -1e9, b = -1e9;
      C.poses.forEach(function (ps) {
        for (var q in ps) o[q] = ps[q];
        write();
        els.forEach(function (e) {
          var rc = e.getBoundingClientRect();
          if (!rc.width && !rc.height) return;
          if (rc.left < l) l = rc.left; if (rc.top < t) t = rc.top; if (rc.right > r) r = rc.right; if (rc.bottom > b) b = rc.bottom;
        });
      });
      if (r < l) break;
      var f = Math.min((st.width - 2 * pad) / (r - l), (st.height - 2 * pad) / (b - t));
      var nxs = clamp(xs * f, 0.22, 1.6);
      var ratio = nxs / xs;
      ox = -ratio * ((l + r) / 2 - cx - ox);
      oy = -ratio * ((t + b) / 2 - cy - oy);
      xs = nxs;
      apply();
      if (Math.abs(f - 1) < 0.01 && pass > 0) break;
    }
    for (k in keep) o[k] = keep[k];
    S.fitting = false;
    tilt.style.transform = '';
    write();
  }
  S.fit = fit;
  var fitRaf = 0;
  function fitSoon() { if (!fitRaf) fitRaf = requestAnimationFrame(function () { fitRaf = 0; fit(); }); }

  /* =================== always: switch, list, slider, fitting =================== */
  RW.add('whole-ui', function () {
    var radios = $$('.xv-switch [role="radio"]', sec), track = $('.xv-sw-track', sec);
    function label(name) {
      if (V === 4) return 'Cut-away corner of a pitched roof with ' + name + ', each layer shown in section: rafters at the bottom, then underlay, battens, the ' + name + ', and the ridge and lead on top.';
      return 'Exploded view of a pitched roof with ' + name + ': rafters at the bottom, then underlay, battens, the ' + name + ', and the ridge and lead on top, lifted apart so each layer shows.';
    }
    function setCover(name) {
      if (name === S.cover) return;
      S.cover = name;
      sec.setAttribute('data-cover', name);
      radios.forEach(function (r, i) {
        var on = r.getAttribute('data-cover') === name;
        r.setAttribute('aria-checked', on ? 'true' : 'false');
        r.tabIndex = on ? 0 : -1;
        if (on && track) track.style.setProperty('--k', i);
      });
      $$('.xv-cname', sec).forEach(function (s) { s.textContent = name; });
      $$('.xv-tag .xv-cname, .xv-cin .xv-cname', sec).forEach(function (s) { s.textContent = name.charAt(0).toUpperCase() + name.slice(1); });
      xv.setAttribute('aria-label', label(name));
      if (V === 5 && S.live && note) note.textContent = noteFor(S.active);
      if (S.onCover) S.onCover(name);
    }
    $$('.xv-tag .xv-cname, .xv-cin .xv-cname', sec).forEach(function (s) { s.textContent = 'Tiles'; });
    xv.setAttribute('aria-label', label('tiles'));
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { setCover(r.getAttribute('data-cover')); });
      r.addEventListener('keydown', function (e) {
        var n = radios.length, j = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j < 0) return;
        e.preventDefault();
        radios[j].focus();
        setCover(radios[j].getAttribute('data-cover'));
      });
    });
    S.setCover = setCover;

    /* list rows: in a scroll scene they travel there (S.go), otherwise they highlight their layer (QC-5) */
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () {
        if (S.go) S.go(k); else S.peel(S.active === k ? -1 : k);
      });
    });
    S.peel(-1);

    /* v6 slider: works without motion too (the layers simply follow it) */
    if (range) {
      range.addEventListener('input', function () {
        if (S.setS) S.setS(range.value / 100);
        else { o.s = range.value / 100; write(); }
      });
    }

    fit();
    if (window.ResizeObserver) new ResizeObserver(fitSoon).observe(xv);
    else window.addEventListener('resize', fitSoon);
    window.addEventListener('load', fitSoon);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitSoon);
  });

  /* =================== motion: scroll scenes, tilt, parallax =================== */
  RW.add('whole', function () {
    var gsap = RW.gsap, ST = RW.ST;
    S.live = true;
    var media = $('.whole-media', sec), explore = $('.whole-explore', sec);
    var back = $('.xv-back', sec), front = $('.xv-front', sec), frag = $('.xv-frag', sec), nail = $('.xv-nail', sec);
    var HDR = RW.HDR || 64;

    /* list keeps the room of its tallest open row so the button never moves (QC-2, QC-4) */
    function reserve() {
      if (!sec.classList.contains('xv-pinned')) { list.style.minHeight = ''; return; }
      var had = list.classList.contains('is-peel');
      list.classList.add('xv-measure'); list.classList.remove('is-peel'); list.style.minHeight = '';
      var sum = 0, max = 0;
      $$('.d>span', list).forEach(function (s) { var h = s.offsetHeight; sum += h; if (h > max) max = h; });
      var h = list.offsetHeight - sum + max;
      if (had) list.classList.add('is-peel');
      list.style.minHeight = Math.ceil(h) + 'px';
      void list.offsetHeight;
      list.classList.remove('xv-measure');
    }
    ST.addEventListener('refreshInit', reserve);

    /* v3: the covering re-tiles course by course */
    if (V === 3) {
      S.onCover = function (name) {
        var rects = $$('.xv-c-' + name + ' rect[data-r]', model), ridgeG = $('[data-layer="4"] .xv-c-' + name, model);
        gsap.killTweensOf(rects);
        gsap.fromTo(rects, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'opacity,transform',
          delay: function (i, el) { return (+el.getAttribute('data-r')) * 0.045 + (+el.getAttribute('x')) / 520 * 0.06; } });
        if (ridgeG) gsap.fromTo(ridgeG, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.5, ease: 'power2.out', clearProps: 'opacity' });
      };
    } else {
      /* other variants: the covering layer hops as it is replaced */
      S.onCover = function () {
        var l = layers[3]; l.classList.add('is-swap');
        setTimeout(function () { l.classList.remove('is-swap'); }, 260);
      };
    }

    if (V === 6) { handsOn(); } else {
      RW.mm.add({ pinned: '(min-width:900px) and (min-height:780px)', flow: '(max-width:899px), (max-height:779px)' }, function (ctx) {
        var pinned = ctx.conditions.pinned, mobile = window.innerWidth < 900;
        var tl, spyST = null, spyTween = null;
        if (pinned) { sec.classList.add('xv-pinned'); list.classList.add('is-peel'); }
        reserve();
        C.init(); o.p = 0; write(); S.active = -2; S.peel(-1);
        fitSoon();
        function onTl() { write(); if (!spyST) S.peel(rowAt(tl.progress())); }
        function sync(self) { if (!tl) return; tl.progress(self.progress); write(); if (!spyST) S.peel(rowAt(self.progress)); }
        var stCfg;
        if (pinned) {
          stCfg = { trigger: grid, pin: true, anticipatePin: 1, scrub: 0.7, invalidateOnRefresh: true,
            start: function () { return 'top ' + Math.max(HDR + 12, Math.round((window.innerHeight - grid.offsetHeight) / 2)); },
            end: function () { return '+=' + Math.round(window.innerHeight * C.len); },
            onRefresh: sync };
        } else if (mobile && C.spy) {
          stCfg = null; /* progress comes from the list rows passing under the sticky stage */
        } else if (mobile) {
          stCfg = { trigger: explore, scrub: 0.6, invalidateOnRefresh: true,
            start: function () { return 'top ' + (HDR + 8); },
            end: function () { return 'bottom ' + (HDR + 8 + media.offsetHeight + 40); }, onRefresh: sync };
        } else {
          stCfg = { trigger: media, scrub: 0.6, invalidateOnRefresh: true, start: 'top 80%', end: 'bottom 30%', onRefresh: sync };
        }
        tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: onTl, paused: !stCfg, scrollTrigger: stCfg || undefined });
        tl.to(o, { p: 1, duration: 1 }, 0);
        C.build(tl);
        if (stCfg) { tl.progress(tl.scrollTrigger ? tl.scrollTrigger.progress : 0); write(); }

        if (!stCfg) {
          /* small screens: the row emerging under the sticky stage is the current one; scene progress follows it */
          var rowsEl = $$('li', list);
          var spyCalc = function () {
            var line = media.getBoundingClientRect().bottom + 28, f = -1;
            var sw = $('.xv-switch', sec).getBoundingClientRect();
            if (line < sw.top) f = -1;
            for (var k = 0; k < rowsEl.length; k++) {
              var rc = rowsEl[k].getBoundingClientRect();
              if (line >= rc.top) f = k + clamp((line - rc.top) / Math.max(1, rc.height), 0, 1);
            }
            var w = C.wins, p;
            if (f < 0) { p = clamp(1 - (sw.top - line) / 260, 0, 1) * w[0][0]; }
            else { var kk = Math.min(4, Math.floor(f)); p = w[kk][0] + (f - kk) * (w[kk][1] - w[kk][0]); if (f >= 5) p = 1; }
            S.peel(f < 0 ? -1 : Math.min(4, Math.floor(f)));
            if (spyTween) spyTween.kill();
            spyTween = gsap.to(tl, { progress: clamp(p, 0, 1), duration: 0.5, ease: 'power3.out' });
          };
          spyST = ST.create({ trigger: explore, start: 'top bottom', end: 'bottom top', onUpdate: spyCalc, onRefresh: function () { spyCalc(); if (spyTween) spyTween.progress(1); } });
        }

        S.go = function (k) {
          if (spyST) {
            var rc = $$('li', list)[k].getBoundingClientRect(), line = media.getBoundingClientRect().bottom + 28;
            RW.scrollTo(window.pageYOffset + rc.top - line + rc.height * 0.4, { duration: 0.9 });
            return;
          }
          var st = tl.scrollTrigger; if (!st) return;
          RW.scrollTo(Math.round(st.start + rowMid(k) * (st.end - st.start)), { duration: 1.1 });
        };
        return function () {
          if (spyTween) spyTween.kill();
          S.go = null;
          sec.classList.remove('xv-pinned'); list.classList.remove('is-peel'); list.style.minHeight = '';
          reset();
          layers.forEach(function (l) { l.style.removeProperty('--dz'); });
          svgs.forEach(function (s) { s.style.opacity = ''; });
          tags.forEach(function (t) { if (t) t.style.opacity = ''; });
          write(); S.active = -2; S.peel(-1);
        };
      });
    }

    /* v6: hands-on lift, no pin. A slider and a sideways drag on the stage set the gap; rows highlight. */
    function handsOn() {
      var intro = null;
      o.s = 0; o.rz = -36; write();
      if (range) range.value = 0;
      S.setS = function (v) { if (intro) intro.kill(); o.s = clamp(v, 0, 1); write(); };
      function sync() { if (range) range.value = Math.round(o.s * 100); }
      RW.onView(xv, { once: true, margin: '0px 0px -30% 0px', enter: function () {
        intro = gsap.to(o, { s: 0.72, rz: -32, duration: 1.4, ease: 'power3.out', onUpdate: function () { write(); sync(); } });
      } });
      S.onPeel = function (k) {
        if (k >= 0 && o.s < 0.45) { if (intro) intro.kill(); intro = gsap.to(o, { s: 0.8, duration: 0.5, ease: 'power3.out', onUpdate: function () { write(); sync(); } }); }
      };
      var drag = null;
      xv.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        drag = { x: e.clientX, y: e.clientY, s: o.s, rz: o.rz, id: e.pointerId, on: false };
      });
      xv.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.on) {
          if (Math.abs(dx) < 8) return;
          if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; } /* a vertical swipe is a page scroll */
          drag.on = true; xv.classList.add('is-drag');
          try { xv.setPointerCapture(e.pointerId); } catch (x) {}
          if (intro) intro.kill();
        }
        o.s = clamp(drag.s + dx / 260, 0, 1);
        o.rz = clamp(drag.rz + dx * 0.02, -44, -24);
        write(); sync();
      });
      function end() { if (drag && drag.on) xv.classList.remove('is-drag'); drag = null; }
      xv.addEventListener('pointerup', end); xv.addEventListener('pointercancel', end);
    }

    /* back and front layers drift at different speeds through the whole section (also while pinned) */
    if (back || front) {
      var pt = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
      if (back) pt.fromTo(back, { y: 50 }, { y: -50, duration: 1 }, 0);
      if (frag) pt.fromTo(frag, { y: 120, rotation: -12 }, { y: -150, rotation: 16, duration: 1 }, 0);
      if (nail) pt.fromTo(nail, { y: -50, rotation: 0 }, { y: 110, rotation: -14, duration: 1 }, 0);
    }

    /* pointer: tilt the stage, nudge the layers around it (fine pointers only) */
    if (RW.fine) {
      gsap.set(tilt, { '--tx': '0deg', '--ty': '0deg' });
      if (back) gsap.set(back, { '--px': '0px', '--py': '0px' });
      if (front) gsap.set(front, { '--px': '0px', '--py': '0px' });
      var stage = d.getElementById('xv-stage');
      stage.addEventListener('pointermove', function (e) {
        if (xv.classList.contains('is-drag')) return;
        var r = stage.getBoundingClientRect();
        var nx = ((e.clientX - r.left) / r.width - 0.5) * 2, ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        gsap.to(tilt, { '--tx': (ny * -4).toFixed(2) + 'deg', '--ty': (nx * 6).toFixed(2) + 'deg', duration: 0.9, ease: 'power3.out', overwrite: true });
        if (back) gsap.to(back, { '--px': (nx * -8).toFixed(1) + 'px', '--py': (ny * -6).toFixed(1) + 'px', duration: 1.1, ease: 'power3.out', overwrite: true });
        if (front) gsap.to(front, { '--px': (nx * 14).toFixed(1) + 'px', '--py': (ny * 10).toFixed(1) + 'px', duration: 0.9, ease: 'power3.out', overwrite: true });
      });
      stage.addEventListener('pointerleave', function () {
        gsap.to(tilt, { '--tx': '0deg', '--ty': '0deg', duration: 1.1, ease: 'power3.out', overwrite: true });
        if (back) gsap.to(back, { '--px': '0px', '--py': '0px', duration: 1.2, ease: 'power3.out', overwrite: true });
        if (front) gsap.to(front, { '--px': '0px', '--py': '0px', duration: 1.2, ease: 'power3.out', overwrite: true });
      });
    }

    /* heading and a quiet reveal for the copy (once) */
    RW.headings(sec);
    RW.reveal($$('.whole-copy .lead, .whole-ctl, .whole-cta', sec), { y: 18, stagger: 0.06 });
  }, { motion: true });
}());
