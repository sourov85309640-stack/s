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
      d.documentElement.classList.toggle('menu-open', open);
      if (RW.lenis) { if (open) RW.lenis.stop(); else RW.lenis.start(); }
      if (open && hdr) hdr.classList.remove('is-hidden');
      if (open && RW.motionOK) {
        RW.gsap.fromTo($$('#nav > ul > li, .nav-extra > *', nav), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.045, delay: 0.08, clearProps: 'transform,opacity' });
      }
    }
    if (btn && nav) {
      btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
      nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
        /* while the sheet is open, Tab cycles through the menu button and the sheet only */
        if (e.key === 'Tab' && btn.getAttribute('aria-expanded') === 'true') {
          var f = [btn].concat($$('a[href], button:not([disabled])', nav).filter(function (x) { return x.offsetParent !== null; }));
          var i = f.indexOf(d.activeElement);
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
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
        if (d.documentElement.classList.contains('menu-open')) setMenu(false);   /* Lenis ignores scrollTo while the sheet has it stopped */
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
    var ind = $('.nav-ind'), house = $('.hdr-house');
    var lastY = window.pageYOffset, ticking = false, curIdx = -2;
    var canHide = !RW.reduced && !RW.off;
    function placeInd(i, el) {
      if (!ind) return;
      var a = el || links[i];
      if (!a || window.innerWidth < 1240) { ind.style.setProperty('--io', 0); return; }
      var base = (ind.offsetParent || ind.parentNode).getBoundingClientRect(), ar = a.getBoundingClientRect();
      var pad = 12; /* .75rem side padding */
      ind.style.setProperty('--ix', (ar.left - base.left + pad).toFixed(1) + 'px');
      ind.style.setProperty('--iw', Math.max(1, ar.width - pad * 2).toFixed(1));
      ind.style.setProperty('--io', 1);
    }
    /* the ridge line follows the pointer across the nav, then returns to the current section */
    var hoverLink = null;
    $$('#nav > ul > li > a').forEach(function (a) {
      a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hoverLink = a; placeInd(-1, a); } });
    });
    if (nav) nav.addEventListener('pointerleave', function () { hoverLink = null; placeInd(curIdx); });
    var vaneEl = $('.brand-mark'), lastVY = 0, vaneW = false;
    function onScroll() {
      ticking = false;
      var y = window.pageYOffset || d.documentElement.scrollTop;
      /* the weathervane on the logo swings round to point the way you are scrolling */
      if (vaneEl && Math.abs(y - lastVY) > 24) { var w = y < lastVY; if (w !== vaneW) { vaneW = w; vaneEl.classList.toggle('is-west', w); } lastVY = y; }
      var max = d.documentElement.scrollHeight - window.innerHeight;
      if (hdr) hdr.classList.toggle('is-stuck', y > 8);
      var pr = max > 0 ? Math.min(1, y / max).toFixed(4) : 0;
      if (prog) prog.style.setProperty('--p', pr);
      if (hdr) hdr.style.setProperty('--p', pr);
      if (house) house.style.setProperty('--p', pr);
      var cur = -1, line = window.innerHeight * 0.35;
      secs.forEach(function (sec, i) {
        if (!sec) return;
        var r = sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) cur = i;
      });
      if (cur !== curIdx) {
        curIdx = cur;
        links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        if (!hoverLink) placeInd(cur);
      }
      if (hdr && canHide) {
        var menuOpen = (btn && btn.getAttribute('aria-expanded') === 'true') || d.documentElement.classList.contains('mega-open');
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


  /* 4b. Services mega menu: built from the cards in the "What we do" section, so the menu and the section never disagree.
     Desktop: opens on hover (with intent delay) or with the chevron button; Escape closes. Mobile drawer: an accordion. */
  RW.add('mega', function () {
    var li = $('#nav .nav-mega'), cards = $$('#services .of-card');
    if (!li || !cards.length) return;
    var link = $('a', li), root = d.documentElement;
    var tg = d.createElement('button');
    tg.type = 'button'; tg.className = 'mega-tg'; tg.setAttribute('aria-expanded', 'false'); tg.setAttribute('aria-controls', 'mega');
    tg.innerHTML = '<span class="vh">Show all services</span><svg viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5l5 5 5-5"/></svg>';
    var panel = d.createElement('div');
    panel.className = 'mega'; panel.id = 'mega'; panel.hidden = true;
    var html = '<div class="mega-in"><ul class="mega-grid">';
    cards.forEach(function (c) {
      var a = $('.of-link', c), ic = $('.of-ic', c), t = $('.of-t', c), dsc = $('.of-d', c);
      html += '<li><a class="mega-it" href="' + a.getAttribute('href') + '" data-of="' + (c.getAttribute('data-of') || '') + '">' +
        '<span class="of-ic mega-ic" aria-hidden="true">' + (ic ? ic.innerHTML : '') + '</span>' +
        '<span class="mega-tx"><b>' + (t ? t.textContent : '') + '</b><span>' + (dsc ? dsc.textContent : '') + '</span></span></a></li>';
    });
    html += '</ul><aside class="mega-side"><p class="mega-side-h">Not sure what it needs?</p><p class="mega-side-p">Tell us what you can see and we will tell you what we think, before anyone climbs up.</p>' +
      '<a class="btn btn-fill mega-cta" href="#problems">Start with the problem</a>' +
      '<a class="mega-tel" href="tel:+441632960482" data-sample="phone"><svg aria-hidden="true"><use href="#i-phone"/></svg>01632 960 482</a></aside></div>';
    panel.innerHTML = html;
    li.appendChild(tg); li.appendChild(panel);
    var openT = 0, closeT = 0, isOpen = false;
    function wide() { return window.innerWidth >= 1240; }
    function set(open, focusFirst) {
      clearTimeout(openT); clearTimeout(closeT);
      if (open === isOpen) return;
      isOpen = open;
      tg.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      li.classList.toggle('is-open', open);
      root.classList.toggle('mega-open', open && wide());
      if (open && RW.motionOK) RW.gsap.fromTo($$('.mega-grid li, .mega-side', panel), { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, ease: 'power2.out', stagger: 0.03, clearProps: 'transform,opacity' });
      if (open && focusFirst) { var f = $('.mega-it', panel); if (f) f.focus(); }
    }
    tg.addEventListener('click', function () { set(!isOpen); });
    li.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse' || !wide()) return; clearTimeout(closeT); openT = setTimeout(function () { set(true); }, 90); });
    li.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse' || !wide()) return; clearTimeout(openT); closeT = setTimeout(function () { set(false); }, 220); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) { e.stopPropagation(); set(false); tg.focus(); }
      if (e.key === 'ArrowDown' && (e.target === link || e.target === tg)) { e.preventDefault(); set(true, true); }
    });
    li.addEventListener('focusout', function (e) { if (wide() && !li.contains(e.relatedTarget)) set(false); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    d.addEventListener('pointerdown', function (e) { if (isOpen && wide() && !li.contains(e.target)) set(false); });
    window.addEventListener('resize', function () { if (isOpen && !wide()) root.classList.remove('mega-open'); });
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
