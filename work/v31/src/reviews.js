/* =====================================================================
   REVIEWS behaviour (owner: reviews team).
   One carousel engine for every variant (apple-design: 1:1 drag that respects the grab offset, velocity
   history, momentum projection with d = 0.998, rubber-band edges, a critically damped spring that starts
   from the current on-screen value and can be grabbed at any instant). Each variant only swaps the
   renderer that turns the engine position into transforms:
     1 rail   2 deck   3 rail + scroll drift (pinned scrub on large screens)   4 spotlight   5 rail + timer   6 cover flow
   'reviews-carousel' and 'reviews-more' run without motion too (reduced motion: no springs, instant moves).
   Motion-only extras: count-up, stars laid like tiles, card entrance, pinned scrub, notification, timer.
   ===================================================================== */
(function () {
  'use strict';
  var RW = window.RW;
  var sec = document.getElementById('reviews');
  if (!RW || !sec) return;

  /* ---- variant switch (prototype stage): ?v=1..6, default 1 ---- */
  var V = RW.variant(sec, 'rv', ['1', '2', '6'], ['Card rail', 'Card deck', 'Cover flow']);
  var MODE = { 1: 'rail', 2: 'deck', 3: 'rail', 4: 'spot', 5: 'rail', 6: 'flow' }[V];

  var car = RW.$('.rv-car', sec), vp = RW.$('.rv-vp', sec), track = RW.$('.rv-track', sec);
  var slides = RW.$$('.rv-slide', sec);
  var api = null; /* filled by the carousel, used by motion extras */

  /* =================== Read more (inline expand) =================== */
  RW.add('reviews-more', function () {
    var items = slides.map(function (s) {
      return { t: RW.$('.rv-text', s), b: RW.$('.rv-more', s) };
    });
    function measure() {
      items.forEach(function (it) {
        if (!it.t || !it.b) return;
        if (it.b.getAttribute('aria-expanded') === 'true') return;
        it.t.classList.add('is-clamp');
        var over = it.t.scrollHeight > it.t.clientHeight + 2;
        it.b.hidden = !over;
        if (!over) it.t.classList.remove('is-clamp');
      });
    }
    items.forEach(function (it) {
      if (!it.b) return;
      it.b.addEventListener('click', function () {
        var open = it.b.getAttribute('aria-expanded') !== 'true';
        it.b.setAttribute('aria-expanded', open ? 'true' : 'false');
        it.b.textContent = open ? 'Show less' : 'Read more';
        it.t.classList.toggle('is-clamp', !open);
        if (api) api.relayout();
      });
    });
    measure();
    var tm = 0;
    window.addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(measure, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  });

  /* =================== Carousel engine =================== */
  RW.add('reviews-carousel', function () {
    if (!car || !vp || !track || !slides.length) return;
    var N = slides.length;
    var prev = RW.$('.rv-prev', car), next = RW.$('.rv-next', car), dotsEl = RW.$('.rv-dots', car);
    var progF = RW.$('.rv-prog-f', car), countEl = RW.$('.rv-count', car), live = RW.$('.rv-live', car);
    var instant = RW.reduced || RW.off;
    var wrap = V === '5';

    car.classList.add('rv-js');

    /* ---- geometry ---- */
    var snaps = [0], maxX = 0, slot = 1, vpW = 1, dragScale = 1;
    var x = 0, vel = 0, target = 0, idx = 0, stopTick = null, resp = 0.42, damp = 1;
    var drag = null, pinned = false, external = null;
    var dots = [];

    function measure() {
      var cs = getComputedStyle(vp);
      vpW = (vp.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)) || 1;
      if (MODE === 'rail') {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
        slot = (slides[0].offsetWidth + gap) || 1;
        maxX = Math.max(0, slides[N - 1].offsetLeft + slides[N - 1].offsetWidth - vpW);
        var s = [];
        slides.forEach(function (el) {
          var v = Math.min(el.offsetLeft, maxX);
          if (!s.length || v - s[s.length - 1] > 4) s.push(v);
        });
        if (maxX - s[s.length - 1] > 4) s.push(maxX);
        snaps = s; dragScale = 1;
      } else {
        slot = slides[0].offsetWidth || vpW;
        snaps = slides.map(function (_, i) { return i * slot; });
        maxX = (N - 1) * slot;
        dragScale = MODE === 'flow' ? 1.5 : 1;
      }
    }

    /* ---- renderers ---- */
    function render() {
      var i, d, a, el;
      if (MODE === 'rail') {
        track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
      } else if (MODE === 'deck') {
        var k = x / slot;
        for (i = 0; i < N; i++) {
          el = slides[i]; d = i - k;
          var tx, ty, r, s, o;
          if (d >= 0) {
            a = Math.min(d, 3);
            tx = a * 14; ty = a * 10; r = (i % 2 ? 1 : -1) * a * 1.5; s = 1 - a * 0.035;
            o = d > 3 ? Math.max(0, 1 - (d - 3)) : 1;
          } else {
            tx = d * slot * 1.08; ty = -d * 18; r = d * 9; s = 1; o = Math.max(0, 1 + d * 1.15);
          }
          el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
          el.style.opacity = o.toFixed(3);
          el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        }
      } else if (MODE === 'flow') {
        var kf = x / slot;
        for (i = 0; i < N; i++) {
          el = slides[i]; d = i - kf; a = Math.abs(d);
          var ry = RW.clamp(-d * 38, -58, 58), tz = -Math.min(a, 3) * 120;
          var txf = Math.sign(d) * (Math.min(a, 1) * slot * 0.72 + Math.max(0, a - 1) * slot * 0.24);
          el.style.transform = 'translate3d(' + txf.toFixed(1) + 'px,0,' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg)';
          el.style.opacity = (a <= 2 ? 1 : Math.max(0, 3 - a)).toFixed(3);
          el.style.zIndex = String(100 - Math.round(a * 10));
        }
      } else { /* spot */
        var ks = x / slot;
        for (i = 0; i < N; i++) {
          el = slides[i]; d = i - ks; a = Math.abs(d);
          el.style.transform = 'translate3d(' + (d * 48).toFixed(1) + 'px,0,0) scale(' + (1 - Math.min(a, 1) * 0.02).toFixed(4) + ')';
          el.style.opacity = Math.max(0, 1 - a * 1.4).toFixed(3);
          el.style.zIndex = String(100 - Math.round(a * 10));
        }
      }
      if (progF) progF.style.setProperty('--p', snaps.length > 1 ? String(RW.clamp((nearest(x) + 1) / snaps.length, 0, 1)) : '1');
    }

    function nearest(px) {
      var b = 0, bd = 1e9;
      for (var i = 0; i < snaps.length; i++) { var dd = Math.abs(snaps[i] - px); if (dd < bd) { bd = dd; b = i; } }
      return b;
    }

    /* ---- state: index, dots, buttons, inert, live text ---- */
    function buildDots() {
      if (!dotsEl) return;
      dotsEl.textContent = '';
      dots = snaps.map(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'rv-dot';
        var first = MODE === 'rail' ? firstCardAt(i) : i;
        var who = RW.$('.rv-name', slides[first]);
        b.setAttribute('aria-label', 'Show review ' + (first + 1) + (who ? ', ' + who.textContent : ''));
        if (V === '4') {
          var av = RW.$('.rv-av', slides[first]);
          var c = document.createElement('span'); c.className = 'rv-av'; c.setAttribute('aria-hidden', 'true');
          c.style.setProperty('--av', av ? av.style.getPropertyValue('--av') : '#1967D2');
          c.textContent = av ? av.firstChild.textContent : '';
          b.appendChild(c);
        }
        if (V === '5') { var sg = document.createElement('span'); sg.className = 'rv-seg'; sg.setAttribute('aria-hidden', 'true'); b.appendChild(sg); }
        b.addEventListener('click', function () { go(i, true); });
        dotsEl.appendChild(b);
        return b;
      });
    }
    function firstCardAt(i) {
      var px = snaps[i], b = 0;
      for (var k = 0; k < N; k++) if (slides[k].offsetLeft <= px + 4) b = k;
      return b;
    }
    function visibleRange(i) {
      if (MODE !== 'rail') return [i, i];
      var a = firstCardAt(i), px = snaps[i], b = a;
      for (var k = a; k < N; k++) if (slides[k].offsetLeft + slides[k].offsetWidth <= px + vpW + 4) b = k;
      return [a, b];
    }
    function setIndex(i, announce) {
      var changed = i !== idx; idx = i;
      dots.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (prev) prev.disabled = !wrap && i <= 0;
      if (next) next.disabled = !wrap && i >= snaps.length - 1;
      var r = visibleRange(i);
      if (countEl) countEl.textContent = (r[0] === r[1] ? (r[0] + 1) : (r[0] + 1) + '-' + (r[1] + 1)) + ' / ' + N;
      if (MODE !== 'rail') slides.forEach(function (s, k) { if (k === i) s.removeAttribute('inert'); else s.setAttribute('inert', ''); });
      if (changed && announce && live) {
        live.textContent = r[0] === r[1] ? 'Review ' + (r[0] + 1) + ' of ' + N : 'Reviews ' + (r[0] + 1) + ' to ' + (r[1] + 1) + ' of ' + N;
      }
      if (changed && api && api.onChange) api.onChange(i);
    }

    /* ---- spring (semi-implicit Euler, sub-stepped) ---- */
    function step(t, dt) {
      if (drag) return;
      var k = Math.pow(2 * Math.PI / resp, 2), c = 4 * Math.PI * damp / resp;
      var n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
      for (var i = 0; i < n; i++) { var acc = -k * (x - target) - c * vel; vel += acc * h; x += vel * h; }
      if (Math.abs(x - target) < 0.3 && Math.abs(vel) < 6) { x = target; vel = 0; stopAnim(); }
      render();
    }
    function startAnim() { if (!stopTick) stopTick = RW.tick(step); }
    function stopAnim() { if (stopTick) { stopTick(); stopTick = null; } }
    function animateTo(px, v0) {
      target = px;
      if (instant) { x = px; vel = 0; render(); return; }
      if (v0 != null) vel = v0;
      startAnim();
    }

    function go(i, announce, opts) {
      var L = snaps.length;
      if (wrap) i = (i + L) % L; else i = RW.clamp(i, 0, L - 1);
      if (pinned && external) { external(i); setIndex(i, announce); return; }
      damp = 1; resp = opts && opts.auto ? 0.6 : 0.42;
      setIndex(i, announce);
      animateTo(snaps[i]);
      if (api && api.onUser && !(opts && opts.auto)) api.onUser();
    }

    /* ---- drag: pointer events, 1:1, rubber band, momentum projection ---- */
    function rubber(over, dim) { var c = 0.55; return (over * dim * c) / (dim + c * Math.abs(over)); }
    function bounded(raw) {
      if (raw < 0) return -rubber(-raw, vpW);
      if (raw > maxX) return maxX + rubber(raw - maxX, vpW);
      return raw;
    }
    var justDragged = false;
    vp.addEventListener('pointerdown', function (e) {
      if (pinned || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (drag) return; /* multi-touch protection */
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: x, on: false, hist: [{ t: performance.now(), p: e.clientX }], startIdx: idx };
      /* grabbing a moving row stops it where it is (interruptible) */
      if (stopTick && e.pointerType !== 'mouse') { stopAnim(); vel = 0; }
    });
    vp.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.on) {
        if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
          drag.on = true; drag.sx = e.clientX; drag.x0 = x; stopAnim(); vel = 0;
          try { vp.setPointerCapture(drag.id); } catch (err) {}
          car.classList.add('is-drag');
          dx = 0;
        } else if (Math.abs(dy) > 10) { drag = null; return; } else return;
      }
      x = bounded(drag.x0 - dx * dragScale);
      var now = performance.now();
      drag.hist.push({ t: now, p: e.clientX });
      while (drag.hist.length > 2 && now - drag.hist[0].t > 100) drag.hist.shift();
      render();
      var ni = nearest(x); if (ni !== idx) setIndex(ni, false);
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      if (!d.on) return;
      car.classList.remove('is-drag');
      justDragged = true; setTimeout(function () { justDragged = false; }, 60);
      var h = d.hist, v = 0;
      if (h.length > 1) { var a = h[0], b = h[h.length - 1]; var dt = (b.t - a.t) / 1000; if (dt > 0) v = -(b.p - a.p) / dt * dragScale; }
      if (performance.now() - h[h.length - 1].t > 80) v = 0; /* held still before release */
      var proj = x + (v / 1000) * 0.998 / (1 - 0.998);
      var i = nearest(RW.clamp(proj, 0, maxX));
      if (MODE !== 'rail') i = RW.clamp(i, d.startIdx - 1, d.startIdx + 1);
      if (MODE === 'rail' && i === d.startIdx && Math.abs(v) > 350) i = RW.clamp(d.startIdx + (v > 0 ? 1 : -1), 0, snaps.length - 1);
      damp = Math.abs(v) > 300 ? 0.86 : 1; resp = 0.42;
      setIndex(i, true);
      animateTo(snaps[i], RW.clamp(v, -6000, 6000));
      if (api && api.onUser) api.onUser();
    }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('lostpointercapture', endDrag);
    vp.addEventListener('click', function (e) {
      if (justDragged) { e.preventDefault(); e.stopPropagation(); return; }
      /* deck / cover flow: a tap on a card that is not in front brings it forward */
      if (MODE === 'flow' || MODE === 'deck') {
        var cx = vp.getBoundingClientRect().left + vpW / 2, half = slides[idx].offsetWidth / 2;
        if (MODE === 'flow' && e.clientX < cx - half) go(idx - 1, true);
        else if (MODE === 'flow' && e.clientX > cx + half) go(idx + 1, true);
      }
    }, true);
    vp.addEventListener('dragstart', function (e) { e.preventDefault(); });
    /* overflow:hidden containers still scroll when a child takes focus: keep the engine in charge */
    vp.addEventListener('scroll', function () { if (vp.scrollLeft) vp.scrollLeft = 0; });

    /* ---- buttons and keys ---- */
    if (prev) prev.addEventListener('click', function () { go(idx - 1, true); });
    if (next) next.addEventListener('click', function () { go(idx + 1, true); });
    car.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowRight') go(idx + 1, true);
      else if (k === 'ArrowLeft') go(idx - 1, true);
      else if (k === 'Home' && e.target === car) go(0, true);
      else if (k === 'End' && e.target === car) go(snaps.length - 1, true);
      else return;
      e.preventDefault();
    });
    /* keyboard focus moving into a card that is out of view brings it into view (rail) */
    car.addEventListener('focusin', function (e) {
      if (MODE !== 'rail' || pinned) return;
      var s = e.target.closest && e.target.closest('.rv-slide'); if (!s) return;
      var l = s.offsetLeft, r = l + s.offsetWidth;
      if (l >= target - 2 && r <= target + vpW + 2) return;
      var want = l < target ? l : r - vpW;
      go(nearest(RW.clamp(want, 0, maxX)), true);
    });

    /* ---- layout changes ---- */
    function relayout() {
      var keep = idx;
      if (vp.scrollLeft) vp.scrollLeft = 0;
      measure();
      var L = snaps.length;
      if (dots.length !== L) buildDots();
      keep = Math.min(keep, L - 1);
      idx = -1; setIndex(keep, false);
      if (!pinned) { stopAnim(); x = target = snaps[keep]; vel = 0; }
      render();
    }
    if ('ResizeObserver' in window) {
      var lastW = 0;
      new ResizeObserver(function () { var w = vp.clientWidth; if (Math.abs(w - lastW) > 1) { lastW = w; relayout(); } }).observe(vp);
    } else window.addEventListener('resize', relayout);

    vp.scrollLeft = 0; /* the no-JS scroll-snap may have left it at the padding offset */
    measure(); buildDots(); setIndex(0, false); render();

    api = {
      go: go, relayout: relayout,
      index: function () { return idx; },
      count: function () { return snaps.length; },
      snaps: function () { return snaps; },
      max: function () { return maxX; },
      dragging: function () { return !!(drag && drag.on); },
      setPinned: function (on, ext) { pinned = on; external = ext || null; car.classList.toggle('is-pinned', on); },
      setX: function (px) { stopAnim(); x = target = px; vel = 0; render(); var ni = nearest(px); if (ni !== idx) setIndex(ni, false); },
      onChange: null, onUser: null
    };
    sec.rvApi = api;
  });

  /* =================== Motion: shared entrance =================== */
  RW.add('reviews-enter', function () {
    var gsap = RW.gsap, ST = RW.ST;
    RW.headings(sec);
    var lead = RW.$('.rv-lead', sec), w = RW.$('.rv-w', sec), photo = RW.$('.rv-photo', sec);
    if (lead) RW.reveal([lead], { y: 18 });
    if (photo) {
      gsap.set(photo, { opacity: 0, y: 30 });
      ST.create({ trigger: photo, start: 'top 92%', once: true, onEnter: function () { gsap.to(photo, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' }); } });
    }
    if (!w) return;
    var num = RW.$('.rv-num', sec), stars = RW.$$('.rv-hs', sec), cta = RW.$('.rv-cta', sec);
    var cards = RW.$$('.rv-card', sec);
    /* which cards are on screen at the start (rail: the first ones; stacks: the front one) */
    var first = cards.filter(function (c) { var r = c.getBoundingClientRect(), vr = RW.$('.rv-vp', sec).getBoundingClientRect(); return r.left < vr.right - 4 && r.right > vr.left; });
    gsap.set(w, { opacity: 0, y: 28 });
    gsap.set(stars, { opacity: 0, y: -16, rotation: -14, transformOrigin: '50% 100%' });
    if (cta) gsap.set(cta, { opacity: 0 });
    var dealing = V === '2';
    if (dealing) gsap.set(cards, { opacity: 0, y: -70, rotation: function (i) { return (i % 2 ? 1 : -1) * (6 + i); } });
    else if (V !== '4') gsap.set(first, { opacity: 0, y: 22 });
    if (num) num.textContent = '0.0';

    ST.create({
      trigger: w, start: 'top 82%', once: true, onEnter: function () {
        var tl = gsap.timeline();
        tl.to(w, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', clearProps: 'transform,opacity' }, 0);
        /* rating counts up while the stars are laid one by one, like tiles going on */
        if (num) {
          var o = { v: 0 };
          tl.to(o, { v: 4.8, duration: 1.1, ease: 'power2.out', onUpdate: function () { num.textContent = o.v.toFixed(1); }, onComplete: function () { num.textContent = '4.8'; } }, 0.25);
        }
        tl.to(stars, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: 'back.out(1.4)', stagger: 0.08, clearProps: 'transform,opacity' }, 0.3);
        if (cta) tl.to(cta, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' }, 0.75);
        if (dealing) {
          /* the deck is dealt from the back card to the front one */
          var rev = cards.slice().reverse();
          tl.to(rev, { opacity: 1, duration: 0.18, ease: 'power1.out', stagger: 0.07 }, 0.35);
          tl.to(rev, { y: 0, rotation: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }, 0.35);
        } else if (V !== '4') {
          tl.to(first, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }, 0.35);
        }
        if (V === '4') spotArrive(tl);
        if (V === '4') ringFill(tl);
      }
    });

    function ringFill(tl) {
      var segs = RW.$$('.rv-ring-f rect', sec);
      gsap.set(segs, { opacity: 0 });
      tl.to(segs, { opacity: function (i) { return i === 19 ? 0.2 : 1; }, duration: 0.18, ease: 'none', stagger: 0.045 }, 0.3);
    }
    function spotArrive(tl) {
      /* the newest review arrives like a notification, then settles into the featured card */
      var note = RW.$('.rv-note', sec), card = cards[0], dotsW = RW.$('.rv-dots', sec);
      if (!note || !card) return;
      gsap.set(card, { opacity: 0, y: 14 });
      if (dotsW) gsap.set(dotsW.children, { opacity: 0, y: 8 });
      tl.set(note, { visibility: 'visible' }, 0.5)
        .fromTo(note, { opacity: 0, y: -14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }, 0.5)
        .to(note, { opacity: 0, y: 26, scale: 0.98, duration: 0.45, ease: 'power2.inOut' }, 1.95)
        .set(note, { visibility: 'hidden' })
        .to(card, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' }, 2.05);
      if (dotsW) tl.to(dotsW.children, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.04, clearProps: 'transform,opacity' }, 2.25);
    }
  }, { motion: true });

  /* =================== V3: horizontal scroll-linked drift =================== */
  RW.add('reviews-drift', function () {
    if (V !== '3') return;
    var api3 = sec.rvApi; if (!api3) return;
    var stage = RW.$('.rv-stage', sec), drift = RW.$('.rv-drift', sec);
    RW.mm.add('(min-width: 1000px) and (min-height: 760px)', function () {
      /* large screens: the widget holds still while the page scroll walks the row from first to last review */
      var st = RW.ST.create({
        trigger: stage, start: 'center center', end: function () { return '+=' + Math.max(300, api3.max() * 1.25); },
        pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        snap: { snapTo: function (p) { var s = api3.snaps(), mx = api3.max() || 1, b = 0, bd = 9; s.forEach(function (v) { var d = Math.abs(v / mx - p); if (d < bd) { bd = d; b = v / mx; } }); return b; }, duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: 'power2.out' },
        onUpdate: function (self) { api3.setX(self.progress * api3.max()); },
        onRefresh: function (self) { api3.setX(self.progress * api3.max()); }
      });
      api3.setPinned(true, function (i) {
        var s = api3.snaps(), mx = api3.max() || 1;
        RW.scrollTo(st.start + (s[i] / mx) * (st.end - st.start), { duration: 0.9 });
      });
      return function () { api3.setPinned(false); st.kill(); };
    });
    RW.mm.add('(max-width: 999px), (max-height: 759px)', function () {
      /* phones and short screens: no pin, the row drifts a little against the page scroll and stays draggable */
      var tw = RW.gsap.fromTo(drift, { x: 70 }, { x: -70, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      return function () { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); RW.gsap.set(drift, { clearProps: 'transform' }); };
    });
  }, { motion: true });

  /* =================== V5: timed advance with a visible pause control =================== */
  RW.add('reviews-timer', function () {
    if (V !== '5') return;
    var a = sec.rvApi; if (!a) return;
    var btn = RW.$('.rv-play', sec), label = RW.$('.rv-play-t', sec), live = RW.$('.rv-live', sec), w = RW.$('.rv-w', sec);
    var DUR = 6.5, el = 0, playing = true, visible = false, hover = false, focus = false;
    btn.hidden = false;
    function setPlaying(p) {
      playing = p;
      btn.classList.toggle('is-paused', !p);
      label.textContent = p ? 'Pause' : 'Play';
      btn.setAttribute('aria-label', p ? 'Pause automatic review rotation' : 'Start automatic review rotation');
      live.setAttribute('aria-live', p ? 'off' : 'polite');
    }
    setPlaying(true);
    btn.addEventListener('click', function () { setPlaying(!playing); el = 0; paint(); });
    w.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    w.addEventListener('pointerleave', function () { hover = false; });
    w.addEventListener('focusin', function () { focus = true; });
    w.addEventListener('focusout', function (e) { if (!w.contains(e.relatedTarget)) focus = false; });
    RW.onView(w, { threshold: 0.4, enter: function () { visible = true; }, leave: function () { visible = false; } });
    a.onUser = function () { el = 0; };
    function paint() {
      var i = a.index();
      RW.$$('.rv-seg', sec).forEach(function (s, k) {
        s.classList.toggle('is-done', k < i);
        s.style.transform = k === i ? 'scaleX(' + (el / DUR).toFixed(4) + ')' : '';
      });
    }
    a.onChange = function () { el = 0; paint(); };
    RW.tick(function (t, dt) {
      if (!playing || !visible || hover || focus || a.dragging() || document.hidden) return;
      el += dt;
      if (el >= DUR) { el = 0; a.go(a.index() + 1, false, { auto: true }); }
      paint();
    });
    paint();
  }, { motion: true });
}());
