/* Projects (sample module). Owner: projects/how agent.
   Stage 1 prototype: variant from ?pv=1..5 sets data-v on #projects.
   'projects-ui' always runs (variant switch, before/after toggle); 'projects-motion' only when motion is allowed. */
(function () {
  'use strict';
  var RW = window.RW;
  var MAX = 5;

  function variantOf(sec, key) {
    return RW.variant(sec, key, ['1', '2'], ['Facts list', 'Before and after drawing']);
  }

  /* ---------- always: variant + v2 toggle (works with motion off) ---------- */
  RW.add('projects-ui', function () {
    var sec = RW.$('#projects'); if (!sec) return;
    var v = variantOf(sec, 'pv');
    var cond = RW.$('.prj-cond', sec);
    if (v !== '2' || !cond) return;
    var btns = RW.$$('.prj-cond-b', cond);
    function set(to, byUser) {
      cond.setAttribute('data-cond', to);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-to') === to ? 'true' : 'false'); });
      if (byUser) cond.setAttribute('data-user', '1');
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-to'), true); }); });
    RW.prjCond = set;
  });

  /* ---------- motion ---------- */
  RW.add('projects-motion', function () {
    var sec = RW.$('#projects'); if (!sec) return;
    var gsap = RW.gsap, ST = RW.ST, v = sec.getAttribute('data-v') || '1';
    var img = RW.$('.prj-cw img', sec), cw = RW.$('.prj-cw', sec), line = RW.$('.prj-line', sec);
    var rows = RW.$$('.prj-spec>div', sec);
    var days = RW.$('.prj-days:not(.prj-days-tag)', sec), tagDays = RW.$('.prj-days-tag', sec);

    RW.headings(sec);

    /* outline drops from the ridge once (one-off intro mask) */
    if (line) {
      gsap.set(line, { clipPath: 'inset(0% 0% 100% 0%)' });
      ST.create({ trigger: cw, start: 'top 80%', once: true, onEnter: function () {
        gsap.to(line, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut', clearProps: 'clipPath' });
      } });
    }

    /* day slates drop in one after another */
    function fillDays(el, delay) {
      if (!el) return;
      var ticks = RW.$$('i', el);
      el.classList.add('is-set');
      return function () {
        ticks.forEach(function (t, i) { setTimeout(function () { t.classList.add('on'); }, (delay || 0) + i * 70); });
      };
    }

    /* photo drifts inside the peak (all variants except the pinned one, which drives it itself) */
    function drift() {
      if (!img) return;
      gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: cw, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    }

    function rowsReveal() { RW.reveal(rows, { y: 16, stagger: 0.06, start: 'top 88%' }); }

    if (v === '1' || v === '2') {
      drift(); rowsReveal();
      var go = fillDays(days, 250);
      ST.create({ trigger: days, start: 'top 85%', once: true, onEnter: go });
    }

    /* v2: scroll flips the drawing from before to after once it has been seen, unless the visitor took over */
    if (v === '2') {
      var cond = RW.$('.prj-cond', sec);
      if (cond && RW.prjCond) {
        RW.prjCond('before');
        ST.create({ trigger: cond, start: 'top 80%', end: 'bottom 45%',
          onUpdate: function (s) {
            if (cond.getAttribute('data-user')) return;
            var want = s.progress > 0.55 ? 'after' : 'before';
            if (cond.getAttribute('data-cond') !== want) RW.prjCond(want);
          },
          onLeave: function () { if (!cond.getAttribute('data-user')) RW.prjCond('after'); } });
      }
    }

    /* v3: scroll-scrubbed word reveal + slates laid course by course */
    if (v === '3') {
      if (img) {
        gsap.set(img, { scale: 1.3 });
        ST.create({ trigger: cw, start: 'top 82%', once: true, onEnter: function () { gsap.to(img, { scale: 1.12, duration: 1.6, ease: 'expo.out' }); } });
        gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: cw, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      }
      RW.$$('.prj-words', sec).forEach(function (dd) {
        var words = splitText(dd);
        var n = words.length;
        ST.create({ trigger: dd, start: 'top 82%', end: 'bottom 50%', scrub: 0.4,
          onUpdate: function (s) {
            var r = s.progress * (n + 2);
            for (var i = 0; i < n; i++) {
              var k = RW.clamp(r - i, 0, 1);
              words[i].style.opacity = (0.18 + 0.82 * k).toFixed(3);
            }
          },
          onRefresh: function (s) { if (s.progress >= 1) words.forEach(function (w) { w.style.opacity = 1; }); } });
      });
      var slates = RW.$$('.prj-course-slates path', sec);
      if (slates.length) {
        gsap.set(slates, { opacity: 0, y: -10, transformOrigin: '50% 0' });
        var tl = gsap.timeline({ paused: true });
        slates.forEach(function (sl, i) { tl.to(sl, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i * 0.8); });
        ST.create({ trigger: RW.$('.prj-course', sec), start: 'top 88%', end: 'top 50%', scrub: 0.5,
          onUpdate: function (s) { tl.progress(s.progress); }, onRefresh: function (s) { tl.progress(s.progress); } });
      }
      RW.reveal(rows.filter(function (r) { return !RW.$('.prj-words', r); }), { y: 16, stagger: 0.06 });
    }

    /* v4: layered frame tilts with the pointer; the tag swings with scroll speed */
    if (v === '4') {
      rowsReveal();
      var stack = RW.$('.prj-stack', sec), media = RW.$('.prj-media', sec), tag = RW.$('.prj-tag', sec);
      if (img) gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: cw, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      if (stack) {
        var rx = gsap.quickTo(stack, 'rotationX', { duration: 0.8, ease: 'power3.out' });
        var ry = gsap.quickTo(stack, 'rotationY', { duration: 0.8, ease: 'power3.out' });
        if (RW.fine) {
          media.addEventListener('pointermove', function (e) {
            var r = media.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
            ry(px * 12); rx(-py * 9);
          });
          media.addEventListener('pointerleave', function () { rx(0); ry(0); });
          /* also lean a little with scroll so the depth reads before the pointer arrives */
          gsap.fromTo(stack, { rotationX: 7 }, { rotationX: -5, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        } else {
          gsap.fromTo(stack, { rotationX: 9, rotationY: -6 }, { rotationX: -5, rotationY: 5, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        }
      }
      if (tag) {
        var swing = gsap.quickTo(tag, 'rotation', { duration: 1.2, ease: 'elastic.out(1,0.35)' });
        var lastV = 0;
        ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
          var vel = RW.clamp(s.getVelocity() / 140, -9, 9);
          if (Math.abs(vel - lastV) > 0.4) { lastV = vel; swing(-vel); }
        }, onLeave: function () { swing(0); }, onLeaveBack: function () { swing(0); } });
        var goTag = fillDays(tagDays, 300);
        ST.create({ trigger: tag, start: 'top 85%', once: true, onEnter: goTag });
      }
      var go4 = fillDays(days, 250);
      ST.create({ trigger: days, start: 'top 85%', once: true, onEnter: go4 });
    }

    /* v5: a short pinned scene on large screens; flow with the v1 behaviour elsewhere */
    if (v === '5') {
      var goDays = fillDays(days, 0);
      var daysDone = false;
      RW.mm.add('(min-width: 1000px) and (min-height: 760px)', function () {
        rows.forEach(function (r, i) { r.classList.toggle('is-later', i > 0); r.classList.toggle('is-cur', i === 0); });
        var tl = gsap.timeline({ defaults: { ease: 'none' } });
        tl.fromTo(img, { scale: 1.08, yPercent: 0 }, { scale: 1.55, yPercent: 9, duration: 1 }, 0);
        var st = ST.create({
          trigger: sec, start: 'top top', end: '+=' + Math.round(window.innerHeight * 1.3), pin: true, scrub: 0.7, animation: tl,
          onUpdate: function (s) { mark(s.progress); },
          onRefresh: function (s) { tl.progress(s.progress); mark(s.progress); }
        });
        function mark(p) {
          var cur = Math.min(rows.length - 1, Math.floor(p * rows.length * 0.999 + 0.0001));
          if (p >= 0.98) cur = rows.length;
          rows.forEach(function (r, i) {
            r.classList.toggle('is-later', i > cur);
            r.classList.toggle('is-cur', i === cur);
          });
          if (!daysDone && cur >= rows.length - 1) { daysDone = true; goDays(); }
        }
        return function () { st.kill(); rows.forEach(function (r) { r.classList.remove('is-later', 'is-cur'); }); };
      });
      RW.mm.add('not all and (min-width: 1000px) and (min-height: 760px)', function () {
        var t = gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none',
          scrollTrigger: { trigger: cw, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        var s2 = ST.create({ trigger: days, start: 'top 85%', once: true, onEnter: function () { if (!daysDone) { daysDone = true; goDays(); } } });
        return function () { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); s2.kill(); };
      });
    }
  }, { motion: true });

  /* split text nodes into word spans (TreeWalker keeps inline markup) */
  function splitText(el) {
    var out = [], walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    /* one untouched readable copy for assistive tech; the split copy is aria-hidden */
    var copy = document.createElement('span'); copy.className = 'vh'; copy.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    nodes.forEach(function (t) {
      var frag = document.createElement('span'); frag.setAttribute('aria-hidden', 'true');
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span'); s.className = 'pw'; s.textContent = part;
        frag.appendChild(s); out.push(s);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.insertBefore(copy, el.firstChild);
    return out;
  }
}());
