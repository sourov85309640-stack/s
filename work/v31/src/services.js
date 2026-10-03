/* SERVICES behaviour (owner: section team svc/dec). Prototype variants 1..6 behind data-v.
   ?v=N sets services and decide, ?sv=N services only. Default 1.
   Features that must work without motion (stamp, roof map sync, chooser tabs) register with {motion:false}. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var sec = d.getElementById('problems');
  if (!RW || !sec) return;
  var $ = RW.$, $$ = RW.$$;

  function q(key) { var m = new RegExp('[?&]' + key + '=([1-6])(?:&|#|$)').exec(location.search); return m ? m[1] : null; }
  var V = RW.variant(sec, 'sv', ['6', '1', '2', '3', '4', '5'], ['Chooser', 'Lead card and list', 'Roof slope of tiles', 'Sketch: roof map', 'Sketch: floating photo', 'Sketch: slate pile']);
  var list = $('.svc-list', sec), stage = $('.svc-stage', sec);
  var cards = $$('.svc', sec);
  function byKey(k) { return $('.svc[data-issue="' + k + '"]', sec); }
  function issueFromURL() { var m = /[?&]issue=([a-z]+)/.exec(location.search); return m ? m[1] : null; }

  /* ---- 1. "On your form" stamp: feedback right where the choice was made (feedback-patterns: inline first) ---- */
  RW.add('svc-stamp', function () {
    function pick(li) { cards.forEach(function (c) { c.classList.toggle('is-picked', c === li); }); }
    cards.forEach(function (li) {
      var a = $('.svc-a', li);
      if (a) a.addEventListener('click', function () { pick(li); });
    });
    var k = issueFromURL(); if (k && byKey(k)) pick(byKey(k));
  });

  /* ---- 2. V3: roof map and list point at each other ---- */
  if (V === '3') RW.add('svc-map', function () {
    var tip = $('.svc-map-txt', sec), tipDefault = tip ? tip.textContent : '';
    var hot = null;
    function setHot(k) {
      if (k === hot) return; hot = k;
      cards.forEach(function (li) { li.classList.toggle('is-hot', li.getAttribute('data-issue') === k); });
      $$('.svc-ring,.svc-z-art', sec).forEach(function (el) { el.classList.toggle('is-hot', el.getAttribute('data-z') === k); });
      sec.classList.toggle('has-hot', !!k);
      if (tip) { var li = k && byKey(k); tip.textContent = li ? $('.svc-t', li).textContent : tipDefault; }
    }
    $$('.svc-hits circle', sec).forEach(function (c) {
      var k = c.getAttribute('data-z');
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setHot(k); });
      c.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setHot(null); });
      c.addEventListener('click', function (e) {
        var li = byKey(k); if (!li) return;
        if (e.pointerType === 'mouse' || RW.fine) { var a = $('.svc-a', li); if (a) a.click(); return; }
        /* touch: light the row and bring it up (a tap, so moving the page is allowed) */
        setHot(k);
        var r = li.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight - 70) RW.scrollTo(li, { offset: -Math.round(window.innerHeight * 0.3) });
      });
    });
    cards.forEach(function (li) {
      var k = li.getAttribute('data-issue');
      li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setHot(k); });
      li.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setHot(null); });
      li.addEventListener('focusin', function () { setHot(k); });
      li.addEventListener('focusout', function () { setHot(null); });
    });
  });

  /* ---- 3. V6: chooser tabs (WAI-ARIA tabs, roving tabindex, arrow keys; hover-intent preview on fine pointers) ---- */
  if (V === '6') RW.add('svc-tabs', function () {
    var bar = d.createElement('div');
    bar.className = 'svc-tabs'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Roof problems');
    list.setAttribute('role', 'none');
    var tabs = cards.map(function (li, i) {
      var k = li.getAttribute('data-issue');
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'svc-tab'; b.id = 'svc-tab-' + k; b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'svc-pan-' + k);
      b.style.setProperty('--clip', getComputedStyle(li).getPropertyValue('--clip'));
      var th = d.createElement('span'); th.className = 'cw'; th.setAttribute('aria-hidden', 'true');
      var im = $('img', li).cloneNode(); im.alt = ''; im.removeAttribute('data-sample'); th.appendChild(im);
      var t = d.createElement('span'); t.textContent = $('.svc-t', li).textContent;
      b.appendChild(th); b.appendChild(t); bar.appendChild(b);
      li.id = 'svc-pan-' + k; li.setAttribute('role', 'tabpanel'); li.setAttribute('aria-labelledby', b.id);
      return b;
    });
    stage.insertBefore(bar, list);
    var cur = -1;
    function select(i, focus) {
      if (i === cur) { if (focus) tabs[i].focus(); return; }
      cur = i;
      tabs.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      cards.forEach(function (li, j) { li.classList.toggle('is-on', j === i); });
      if (bar.scrollWidth > bar.clientWidth + 4) bar.scrollTo({ left: Math.max(0, tabs[i].offsetLeft - 16), behavior: RW.motionOK ? 'smooth' : 'auto' });
      if (focus) tabs[i].focus();
    }
    var timer = 0;
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j != null) { e.preventDefault(); select(j, true); }
      });
      if (RW.fine) {
        b.addEventListener('pointerenter', function () { clearTimeout(timer); timer = setTimeout(function () { select(i); }, 110); });
        b.addEventListener('pointerleave', function () { clearTimeout(timer); });
      }
    });
    var k = issueFromURL(), start = 0;
    cards.forEach(function (li, i) { if (li.getAttribute('data-issue') === k) start = i; });
    /* the words move onto the photo: title, text and link are gathered into one caption block with a counter */
    cards.forEach(function (li, i) {
      var cap = d.createElement('div'); cap.className = 'svc-cap';
      var n = d.createElement('span'); n.className = 'svc-n'; n.setAttribute('aria-hidden', 'true'); n.textContent = (i + 1) + ' of ' + cards.length;
      cap.appendChild(n);
      ['.svc-t', '.svc-p', '.svc-a'].forEach(function (s) { var el = $(s, li); if (el) cap.appendChild(el); });
      li.appendChild(cap);
    });
    select(start);
    /* stories-style: while the section is on screen it moves to the next problem every few seconds, until the visitor
       touches anything in it. Swipe the photo left or right on touch screens. */
    if (RW.motionOK) {
      var auto = 0, live = false, stopped = false, T = 5500;
      var stopAuto = function () { stopped = true; clearInterval(auto); sec.classList.remove('is-auto'); };
      var run = function () { if (stopped || !live) return; clearInterval(auto); sec.classList.add('is-auto'); auto = setInterval(function () { select((cur + 1) % cards.length); }, T); };
      sec.style.setProperty('--svc-t', T + 'ms');
      RW.onView(stage, { margin: '0px 0px -25% 0px', enter: function () { live = true; run(); }, leave: function () { live = false; clearInterval(auto); sec.classList.remove('is-auto'); } });
      ['pointerdown', 'keydown', 'focusin'].forEach(function (ev) { stage.addEventListener(ev, stopAuto, { passive: true }); });
      if (RW.fine) stage.addEventListener('pointerenter', stopAuto);
    }
    var sx = null;
    list.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    list.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) select((cur + (dx < 0 ? 1 : -1) + cards.length) % cards.length);
    }, { passive: true });
  });

  /* ---- 4. V4: a roof-cut photo rides beside the rows and floods from grey into colour (reveal-hover-effect) ---- */
  if (V === '4') RW.add('svc-float', function () {
    var wide = window.matchMedia('(min-width: 900px)');
    if (!RW.fine) return;
    var fl = d.createElement('div'); fl.className = 'svc-float'; fl.setAttribute('aria-hidden', 'true');
    fl.innerHTML = '<span class="svc-float-shadow"></span><span class="cw svc-fl-base"></span><span class="cw svc-fl-col"></span>';
    var base = $('.svc-fl-base', fl), col = $('.svc-fl-col', fl);
    var imgs = cards.map(function (li) {
      var a = $('img', li).cloneNode(); a.alt = ''; a.removeAttribute('data-sample');
      var b = a.cloneNode(); base.appendChild(a); col.appendChild(b);
      return [a, b];
    });
    stage.appendChild(fl);
    var on = false;
    function setup() { on = wide.matches; sec.classList.toggle('svc-float-on', on); if (!on) hide(); }
    var st = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, mx: 0, my: 0, inside: false, frame: 0, cur: -1 };
    var ease = RW.reduced || RW.off ? 1 : 0.12, rease = RW.reduced || RW.off ? 1 : 0.14;
    function show(i) {
      if (i === st.cur) return; st.cur = i;
      imgs.forEach(function (p, j) { p[0].classList.toggle('is-on', j === i); p[1].classList.toggle('is-on', j === i); });
      fl.style.setProperty('--clip', getComputedStyle(cards[i]).getPropertyValue('--clip'));
      st.r = 0; /* colour floods in again for each new photo */
    }
    function hide() { st.inside = false; st.tr = 0; fl.classList.remove('is-on'); st.cur = -1; schedule(); }
    function target(e) {
      var sr = stage.getBoundingClientRect(), lr = list.getBoundingClientRect();
      var w = fl.offsetWidth, h = fl.offsetHeight;
      var lane = lr.right - sr.left + 48;                       /* the preview lane right of the rows */
      var px = e.clientX - sr.left, py = e.clientY - sr.top;
      st.tx = Math.min(sr.width - w, lane + (px / lr.width) * 24);
      st.ty = RW.clamp(py - h / 2, lr.top - sr.top - h * 0.15, lr.bottom - sr.top - h * 0.85);
      st.mx = px; st.my = py;
    }
    function schedule() { if (!st.frame) st.frame = requestAnimationFrame(tick); }
    function tick() {
      st.frame = 0;
      st.x += (st.tx - st.x) * ease; st.y += (st.ty - st.y) * ease; st.r += (st.tr - st.r) * rease;
      fl.style.transform = 'translate3d(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px,0)';
      /* mask centre = the pointer, in the photo's own coordinates (it sits to the left, so colour floods from the row side) */
      fl.style.setProperty('--rx', Math.max(-40, st.mx - st.x).toFixed(1) + 'px');
      fl.style.setProperty('--ry', (st.my - st.y).toFixed(1) + 'px');
      fl.style.setProperty('--rr', st.r.toFixed(1) + 'px');
      if (Math.abs(st.tx - st.x) > 0.2 || Math.abs(st.ty - st.y) > 0.2 || Math.abs(st.tr - st.r) > 0.3) schedule();
    }
    cards.forEach(function (li, i) {
      li.addEventListener('pointerenter', function (e) {
        if (!on || e.pointerType !== 'mouse') return;
        target(e);
        if (!st.inside) { st.x = st.tx; st.y = st.ty; st.r = 0; }
        st.inside = true; show(i); st.tr = fl.offsetWidth * 1.35; fl.classList.add('is-on'); schedule();
      });
    });
    list.addEventListener('pointermove', function (e) { if (on && st.inside) { target(e); schedule(); } });
    list.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', function () { if (st.inside) hide(); }, { passive: true });
    if (wide.addEventListener) wide.addEventListener('change', setup);
    setup();
  });

  /* ---- 5. motion: headings, entrances, photo drift inside the cut-outs ---- */
  RW.add('svc-motion', function () {
    var gsap = RW.gsap, ST = RW.ST;
    RW.headings(sec);
    RW.reveal($$('.head2>p', sec), { y: 14 });
    /* photo drift: the picture moves inside its roof-shaped frame, the frame stays put */
    var drift = V === '1' ? [$('.svc:first-child .cw img', sec)] : V === '6' ? $$('.svc .cw img', sec) : [];
    drift.forEach(function (im) {
      if (!im) return;
      gsap.fromTo(im, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    if (V === '1' || V === '3' || V === '4') RW.reveal(cards, { y: 22, stagger: 0.06 });
    if (V === '3') RW.reveal([$('.svc-map', sec)], { y: 18 });
    if (V === '6') RW.reveal([$('.svc-tabs', sec), list], { y: 18, stagger: 0.08 });

    /* V2: tiles hang from their nibs; each swings down onto its batten, eaves first */
    if (V === '2') {
      gsap.set(cards, { rotationX: -78, opacity: 0, transformOrigin: '50% 0%' });
      list.classList.add('svc-laying');
      cards.forEach(function (c) { c.style.transition = 'none'; });
      ST.create({ trigger: list, start: 'top 82%', once: true, onEnter: function () {
        gsap.to(cards, { rotationX: 0, opacity: 1, duration: 1.05, ease: 'expo.out', stagger: 0.07,
          onComplete: function () { gsap.set(cards, { clearProps: 'transform,opacity' }); cards.forEach(function (c) { c.style.transition = ''; }); } });
      } });
    }

    /* V5: a pile of slates fans out while the section scrolls in (scroll-linked, never pinned) */
    if (V === '5') {
      var desk = window.matchMedia('(min-width: 1000px)');
      var geo = { top: 0, tops: [] }, vh = window.innerHeight, live = false, last = [];
      function measure() {
        vh = window.innerHeight;
        var lr = list.getBoundingClientRect(), sy = window.pageYOffset;
        geo.top = lr.top + sy;
        var cx = list.offsetWidth / 2, cy = Math.min(list.offsetHeight, 420) / 2;
        cards.forEach(function (c, i) {
          var x = c.offsetLeft + c.offsetWidth / 2, y = c.offsetTop + c.offsetHeight / 2;
          if (desk.matches) {
            c.style.setProperty('--dx', (cx - x + (i - 2) * 6).toFixed(1) + 'px');
            c.style.setProperty('--dy', (cy - y + (i % 2 ? -4 : 6)).toFixed(1) + 'px');
          } else {
            var prev = cards[i - 1];
            c.style.setProperty('--dx', '0px');
            c.style.setProperty('--dy', prev ? (-(c.offsetTop - prev.offsetTop) * 0.5).toFixed(1) + 'px' : '0px');
          }
          geo.tops[i] = c.offsetTop;
        });
        last = []; write();
      }
      function smooth(t) { t = RW.clamp(t, 0, 1); return t * t * (3 - 2 * t); }
      function write() {
        var sy = window.pageYOffset;
        cards.forEach(function (c, i) {
          var f;
          if (desk.matches) f = smooth((sy + vh * 0.92 - geo.top) / (vh * 0.55));
          else f = smooth((sy + vh * 0.98 - (geo.top + geo.tops[i])) / (vh * 0.42));
          if (last[i] == null || Math.abs(f - last[i]) > 0.002) { last[i] = f; c.style.setProperty('--f', f.toFixed(3)); }
        });
      }
      measure();
      window.addEventListener('resize', measure);
      ST.addEventListener('refresh', measure);
      RW.onView(sec, { margin: '20% 0px 20% 0px', enter: function () { live = true; }, leave: function () { live = false; } });
      RW.tick(function () { if (live) write(); });
    }
  }, { motion: true });
}());
