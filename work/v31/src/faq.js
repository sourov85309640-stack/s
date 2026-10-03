/* FAQ behaviour (prototype: ?fv=1..4). Runs without motion too (accordion, deep links, find-in-page).
   Without JS: all answers open, buttons say aria-expanded="true" (markup), no role=region.
   With JS: answers close (v1, v3: all closed; v2: the first open; v4: all stay open), hidden="until-found" on
   closed answers + beforematch opens them (D4), #q1..#q6 / #a1..#a6 open and scroll to the item (D5). */
(function () {
  'use strict';
  var RW = window.RW;
  var sec = document.getElementById('faq');
  if (!sec) return;
  var V = 1;
  try { var m = /[?&]fv=(\d)/.exec(location.search); if (m && +m[1] >= 1 && +m[1] <= 4) V = +m[1]; } catch (e) {}
  sec.setAttribute('data-v', String(V));

  RW.add('faq', function () {
    var items = RW.$$('.faq-item', sec);
    var canFind = 'onbeforematch' in document.body;
    var single = V === 2;
    var motion = RW.motionOK;
    var timers = [];

    function set(i, on, instant) {
      var it = items[i], b = RW.$('.faq-btn', it), a = RW.$('.faq-a', it);
      clearTimeout(timers[i]);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) {
        a.removeAttribute('hidden');
        if (instant || !motion) it.classList.add('is-open');
        else requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.add('is-open'); }); });
        if (V === 3 && motion && !instant) typing(it);
      } else {
        it.classList.remove('is-open');
        it.classList.remove('is-typing');
        var hide = function () { if (b.getAttribute('aria-expanded') === 'false') a.setAttribute('hidden', canFind ? 'until-found' : ''); if (!canFind) a.removeAttribute('hidden'); };
        if (instant || !motion) hide(); else timers[i] = setTimeout(hide, 280);
      }
    }
    function open(i, instant) {
      if (single) items.forEach(function (it, k) { if (k !== i) set(k, false, true); });
      set(i, true, instant);
    }
    function typing(it) {
      var a = RW.$('.faq-a-in', it), t = RW.$('.faq-typing', a);
      if (!t) { t = document.createElement('span'); t.className = 'faq-typing'; t.setAttribute('aria-hidden', 'true'); t.innerHTML = '<i></i><i></i><i></i>'; a.appendChild(t); }
      it.classList.add('is-typing');
      setTimeout(function () { it.classList.remove('is-typing'); }, 520);
    }

    /* initial state */
    items.forEach(function (it, i) {
      var b = RW.$('.faq-btn', it), a = RW.$('.faq-a', it);
      var startOpen = V === 4 || (V === 2 && i === 0);
      set(i, startOpen, true);
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-expanded') === 'true';
        if (single && on) return;           /* v2: one answer is always showing */
        if (on) set(i, false); else open(i);
      });
      a.addEventListener('beforematch', function () { open(i, true); });
    });

    /* deep links: #q4 or #a4 */
    function fromHash(smooth) {
      var mm = /^#(?:q|a)([1-9])$/.exec(location.hash || '');
      if (!mm) return;
      var i = +mm[1] - 1;
      if (!items[i]) return;
      open(i, true);
      var go = function () { RW.scrollTo(items[i], { offset: 0, immediate: !smooth || !RW.lenis }); if (!RW.lenis) items[i].scrollIntoView({ block: 'start' }); };
      setTimeout(go, smooth ? 0 : 120);
      if (!smooth) window.addEventListener('load', function () { setTimeout(go, 200); });
    }
    fromHash(false);
    window.addEventListener('hashchange', function () { fromHash(true); });

    /* v4: sticky index of questions with scroll-spy */
    if (V === 4) {
      var head = RW.$('.faq-head', sec);
      var nav = document.createElement('nav'); nav.className = 'faq-index'; nav.setAttribute('aria-label', 'Questions on this page');
      var ol = document.createElement('ol');
      var links = items.map(function (it, i) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = '#q' + (i + 1); a.textContent = RW.$('.faq-qt', it).textContent;
        a.addEventListener('click', function (e) { e.preventDefault(); open(i, true); RW.scrollTo(it, { offset: 0 }); if (!RW.lenis) it.scrollIntoView({ block: 'start' }); RW.$('.faq-btn', it).focus({ preventScroll: true }); });
        li.appendChild(a); ol.appendChild(li); return a;
      });
      nav.appendChild(ol); head.appendChild(nav);
      var on = false, tk = false;
      function spy() {
        tk = false;
        var anchor = window.innerHeight * 0.35, cur = 0;
        items.forEach(function (it, i) { if (it.getBoundingClientRect().top < anchor) cur = i; });
        links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        var first = items[0].getBoundingClientRect().top, last = items[items.length - 1].getBoundingClientRect().top;
        ol.style.setProperty('--p', RW.clamp((anchor - first) / Math.max(1, last - first), 0, 1).toFixed(3));
      }
      RW.onView(sec, { enter: function () { on = true; spy(); }, leave: function () { on = false; } });
      window.addEventListener('scroll', function () { if (on && !tk) { tk = true; requestAnimationFrame(spy); } }, { passive: true });
    }
  });

  RW.add('faq-motion', function () {
    RW.headings(sec);
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
