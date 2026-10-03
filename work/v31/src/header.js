/* Header (owner: lead): nav pruning, mobile menu, current section, progress bar, sliding nav line,
   hide on the way down (desktop), weathervane in the brand mark. Works without GSAP; the vane and
   the hide behaviour are skipped under reduced motion or data-motion="off". */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var $ = RW.$, $$ = RW.$$;

  RW.add('header', function () {
    var hdr = $('#header'), nav = $('#nav'), btn = $('#menu-btn'), prog = $('#progress');

    /* 1. drop nav links whose section is missing, then any dead in-page link */
    $$('#nav a[data-nav]').forEach(function (a) {
      if (!d.querySelector('section[data-nav="' + a.getAttribute('data-nav') + '"]')) {
        var li = a.parentNode; li.parentNode.removeChild(li);
      }
    });
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href');
      if (id.length < 2 || id === '#top') return;
      var ok = false;
      try { ok = !!d.querySelector(id); } catch (e) { ok = true; }
      if (ok) return;
      var p = a.parentNode;
      p.removeChild(a);
      if (p.tagName === 'LI' && p.parentNode) p.parentNode.removeChild(p);
      else if (p.childElementCount === 0 && !p.textContent.trim() && p.parentNode) p.parentNode.removeChild(p);
    });

    /* 2. mobile menu */
    function setMenu(open) {
      if (!btn || !nav) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      if (open && hdr) hdr.classList.remove('is-hidden');
      if (open && RW.motionOK) {
        RW.gsap.fromTo($$('li', nav), { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, ease: 'power2.out', stagger: 0.04, clearProps: 'transform,opacity' });
      }
    }
    if (btn && nav) {
      btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
      nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
      });
      window.addEventListener('resize', function () { if (window.innerWidth >= 1240) setMenu(false); });
    }

    /* 3. in-page links glide (Lenis) and move focus to the target */
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href');
      if (id.length < 2 || id === '#privacy' || id === '#terms') return;
      a.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        var t = null;
        try { t = id === '#top' ? d.body : d.querySelector(id); } catch (x) { return; }
        if (!t) return;
        if (!RW.lenis) { /* native smooth scroll + scroll-padding handle it; just move focus after */
          if (id !== '#top') setTimeout(function () { focusTarget(t); }, 0);
          return;
        }
        e.preventDefault();
        RW.scrollTo(id === '#top' ? 0 : t, { offset: 0 });
        try { history.replaceState(null, '', id); } catch (x2) {}
        if (id !== '#top') focusTarget(t);
      });
    });
    function focusTarget(t) {
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      try { t.focus({ preventScroll: true }); } catch (x3) {}
    }

    /* 4. scroll state: shadow, progress, current section, hide on the way down */
    var links = $$('#nav a[data-nav]');
    var secs = links.map(function (a) { return d.querySelector('section[data-nav="' + a.getAttribute('data-nav') + '"]'); });
    var ind = $('.nav-ind');
    var lastY = window.pageYOffset, ticking = false, curIdx = -2;
    var canHide = !RW.reduced && !RW.off;
    function placeInd(i) {
      if (!ind) return;
      if (i < 0 || !links[i] || window.innerWidth < 1240) { ind.style.setProperty('--io', 0); return; }
      var ul = ind.parentNode, a = links[i], ar = a.getBoundingClientRect(), ur = ul.getBoundingClientRect();
      var pad = 12; /* .75rem side padding */
      ind.style.setProperty('--ix', (ar.left - ur.left + pad).toFixed(1) + 'px');
      ind.style.setProperty('--iw', Math.max(1, ar.width - pad * 2).toFixed(1));
      ind.style.setProperty('--io', 1);
    }
    function onScroll() {
      ticking = false;
      var y = window.pageYOffset || d.documentElement.scrollTop;
      var max = d.documentElement.scrollHeight - window.innerHeight;
      if (hdr) hdr.classList.toggle('is-stuck', y > 8);
      if (prog) prog.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      var cur = -1, line = window.innerHeight * 0.35;
      secs.forEach(function (sec, i) {
        if (!sec) return;
        var r = sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) cur = i;
      });
      if (cur !== curIdx) {
        curIdx = cur;
        links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        placeInd(cur);
      }
      if (hdr && canHide) {
        var menuOpen = btn && btn.getAttribute('aria-expanded') === 'true';
        var dy = y - lastY;
        if (window.innerWidth < 1024 || menuOpen || y < 240) hdr.classList.remove('is-hidden');
        else if (dy > 6) hdr.classList.add('is-hidden');
        else if (dy < -6) hdr.classList.remove('is-hidden');
      }
      if (Math.abs(y - lastY) > 6 || y < 240) lastY = y;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', function () { curIdx = -2; onScroll(); });
    onScroll();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { curIdx = -2; onScroll(); });
  });

  /* 5. weathervane: the arrow turns with scroll direction and settles back (transform only) */
  RW.add('vane', function () {
    var vane = $('.brand-mark .vane');
    if (!vane) return;
    var ang = 0, vel = 0, lastY = window.pageYOffset, target = 0, idle = 0, lastVx = 1;
    RW.tick(function (t, dt) {
      var y = window.pageYOffset, dy = y - lastY; lastY = y;
      if (dy) { target = RW.clamp(target + dy * 0.004, -3.2, 3.2); idle = 0; } else { idle += dt; }
      if (idle > 0.6) target *= Math.pow(0.4, dt); /* wind drops, the vane swings home */
      var acc = (target - ang) * 30 - vel * 7; /* damped spring */
      vel += acc * dt; ang += vel * dt;
      var vx = Math.cos(ang);
      vx = Math.abs(vx) < 0.06 ? (vx < 0 ? -0.06 : 0.06) : vx;
      if (Math.abs(vx - lastVx) > 0.002) { lastVx = vx; vane.style.setProperty('--vx', vx.toFixed(3)); }
    });
  }, { motion: true });
}());
