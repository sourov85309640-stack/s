/* Roofing master v3.1 - core. Defines window.RW (shared helpers) and the feature registry.
   Order of script tags: vendor libs, core.js, header.js, app.js, <section>.js ..., fx.js, boot.js.
   Features register with RW.add(name, fn, {motion:true}); boot.js runs them in registration order
   (= document order, which matters for pinned scenes). motion:true features run only when RW.motionOK.
   Nothing here runs under prefers-reduced-motion or <html data-motion="off">, apart from the helpers. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var RW = window.RW = { features: [], ready: false, HDR: 64 };
  RW.d = d; RW.root = root;
  RW.$ = function (s, r) { return (r || d).querySelector(s); };
  RW.$$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  RW.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  RW.lerp = function (a, b, t) { return a + (b - a) * t; };
  RW.safe = function (name, fn) { try { return fn(); } catch (e) { if (window.console) console.warn('rw: ' + name + ' skipped', e); } };

  RW.off = root.getAttribute('data-motion') === 'off';
  RW.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  RW.gsap = window.gsap || null;
  RW.ST = window.ScrollTrigger || null;
  RW.motionOK = !RW.off && !RW.reduced && !!RW.gsap && !!RW.ST;
  RW.fine = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  RW.lenis = null;
  RW.ease = 'cubic-bezier(.2,.7,.2,1)';

  /* ---- registry ---- */
  RW.add = function (name, fn, opts) {
    RW.features.push({ name: name, fn: fn, motion: !!(opts && opts.motion) });
  };

  /* ---- design options: RW.variant(sectionEl, 'param', ['1','2','6']) returns the variant to use.
         Order: ?param=N in the address (the Design options panel), then the section's own data-v, then the first allowed.
         To fix a choice for a client, set data-v on the <section> in its partial and delete the options panel. ---- */
  RW.options = [];
  RW.variant = function (sec, param, allowed, names) {
    var v = null;
    try { var m = new RegExp('[?&]' + param + '=(\\w+)').exec(location.search); if (m) v = m[1]; } catch (e) {}
    if (allowed.indexOf(v) < 0) v = sec.getAttribute('data-v');
    if (allowed.indexOf(v) < 0) v = allowed[0];
    sec.setAttribute('data-v', v);
    RW.options.push({ id: sec.id, param: param, allowed: allowed, names: names || allowed, current: v });
    return v;
  };

  /* ---- shared ticker: one rAF loop for everything (GSAP ticker when motion is on, own rAF otherwise).
         fn(timeSeconds, dtSeconds) with dt clamped to 1/30. Returns a remover. ---- */
  var tickers = [], rafId = 0, last = 0;
  function ownLoop(t) {
    rafId = requestAnimationFrame(ownLoop);
    var s = t / 1000, dt = Math.min(1 / 30, last ? s - last : 1 / 60); last = s;
    for (var i = 0; i < tickers.length; i++) tickers[i](s, dt);
  }
  RW.tick = function (fn) {
    if (RW.gsap && RW.motionOK) {
      var wrapped = function (time, deltaMs) { fn(time, Math.min(1 / 30, (deltaMs || 16.7) / 1000)); };
      RW.gsap.ticker.add(wrapped);
      return function () { RW.gsap.ticker.remove(wrapped); };
    }
    tickers.push(fn);
    if (!rafId) rafId = requestAnimationFrame(ownLoop);
    return function () {
      var i = tickers.indexOf(fn); if (i > -1) tickers.splice(i, 1);
      if (!tickers.length && rafId) { cancelAnimationFrame(rafId); rafId = 0; last = 0; }
    };
  };

  /* ---- visibility helper: RW.onView(el, {enter, leave, once, margin}) (IntersectionObserver, no GSAP needed) ---- */
  RW.onView = function (el, o) {
    o = o || {};
    if (!el) return function () {};
    if (!('IntersectionObserver' in window)) { if (o.enter) o.enter(el); return function () {}; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (o.enter) o.enter(e.target); if (o.once) io.disconnect(); }
        else if (o.leave) o.leave(e.target);
      });
    }, { rootMargin: o.margin || '0px', threshold: o.threshold || 0 });
    io.observe(el);
    return function () { io.disconnect(); };
  };

  /* ---- split a heading into masked words (masked-reveal skill). Keeps the text readable to assistive tech. ---- */
  RW.splitWords = function (el) {
    if (el.getAttribute('data-split')) return RW.$$('.w>span', el);
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var parts = text.split(' ');
    parts.forEach(function (w, i) {
      var m = d.createElement('span'); m.className = 'w'; m.setAttribute('aria-hidden', 'true');
      var s = d.createElement('span'); s.textContent = w; m.appendChild(s); el.appendChild(m);
      if (i < parts.length - 1) el.appendChild(d.createTextNode(' '));
    });
    el.setAttribute('data-split', '1');
    return RW.$$('.w>span', el);
  };

  /* ---- once-only batch reveal: RW.reveal('.sel', {y, dur, stagger, start, skip}) ---- */
  RW.reveal = function (sel, o) {
    if (!RW.motionOK) return;
    o = o || {};
    var els = (typeof sel === 'string' ? RW.$$(sel) : sel).filter(function (e) { return !(o.skip && e.closest(o.skip)); });
    if (!els.length) return;
    var gsap = RW.gsap, ST = RW.ST;
    gsap.set(els, { y: o.y == null ? 26 : o.y, opacity: 0 });
    ST.batch(els, {
      start: o.start || 'top 90%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, duration: o.dur || 0.95, ease: 'power3.out', stagger: o.stagger == null ? 0.08 : o.stagger, overwrite: true, clearProps: 'transform,opacity' });
      }
    });
  };

  /* ---- masked word reveal for every h2 inside root (call from your feature): RW.headings(sectionEl) ---- */
  /* each section can pick its own heading entrance with data-reveal on the <section>:
     rise (default) | drop | slide | tilt | scale | skew. All transform and opacity, inside the word masks. */
  var REVEALS = {
    rise: { from: { yPercent: 112 } },
    drop: { from: { yPercent: -112 } },
    slide: { from: { xPercent: -60, opacity: 0 } },
    tilt: { from: { rotateX: -85, opacity: 0, transformOrigin: '50% 100%' }, persp: true },
    scale: { from: { scale: 0.6, opacity: 0, transformOrigin: '50% 80%' } },
    skew: { from: { yPercent: 112, skewY: 9 } }
  };
  RW.headings = function (scope) {
    if (!RW.motionOK) return;
    RW.$$('h2:not(.vh-h)', scope || d).forEach(function (h) {
      if (h.getAttribute('data-split')) return;
      var sec = h.closest('[data-reveal]'), kind = sec ? sec.getAttribute('data-reveal') : 'rise';
      var R = REVEALS[kind] || REVEALS.rise;
      var words = RW.splitWords(h);
      if (R.persp) RW.$$('.w', h).forEach(function (w) { w.style.perspective = '600px'; });
      RW.gsap.set(words, R.from);
      var to = { duration: 1.05, ease: 'expo.out', stagger: 0.05, overwrite: true };
      Object.keys(R.from).forEach(function (k) { if (k !== 'transformOrigin') to[k] = (k === 'opacity' || k === 'scale') ? 1 : 0; });
      RW.ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { RW.gsap.to(words, to); } });
    });
  };

  /* ---- scrolling: Lenis when present, native otherwise. Offset 0 lands the target at scroll-padding-top (5rem). ---- */
  RW.scrollTo = function (target, o) {
    o = o || {};
    var off = o.offset != null ? o.offset : 0;
    if (RW.lenis) {
      RW.lenis.scrollTo(target, { offset: off, duration: o.duration || 1.3, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, immediate: !!o.immediate });
    } else if (typeof target === 'number') {
      window.scrollTo(0, target);
    } else if (target && target.scrollIntoView) {
      target.scrollIntoView();
    }
  };

  /* ---- start: called once by boot.js after every script has registered ---- */
  RW.start = function () {
    if (RW.ready) return; RW.ready = true;
    var gsap = RW.gsap, ST = RW.ST;
    if (RW.motionOK) {
      gsap.registerPlugin(ST);
      root.classList.add('has-motion');
      RW.safe('lenis', function () {
        if (!window.Lenis) return;
        RW.lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
        RW.lenis.on('scroll', ST.update);
        gsap.ticker.add(function (t) { RW.lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      });
      RW.mm = gsap.matchMedia();
    }
    RW.features.forEach(function (f) {
      if (f.motion && !RW.motionOK) return;
      RW.safe(f.name, f.fn);
    });
    if (RW.motionOK) {
      var refresh = function () { ST.refresh(); };
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
      window.addEventListener('load', function () { setTimeout(refresh, 60); });
    }
    /* hooks for tests and for tearing the page down in a single-page app */
    window.rwMotion = { lenis: RW.lenis, ST: ST, gsap: gsap };
    window.rwScrollTo = function (el) { RW.scrollTo(el); };
    window.rwMotionDestroy = function () {
      if (ST) ST.getAll().forEach(function (s) { s.kill(); });
      if (RW.lenis) RW.lenis.destroy();
      root.classList.remove('has-motion');
    };
  };
}());
