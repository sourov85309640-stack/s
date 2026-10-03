/* contact.js (owner: contact team). Section behaviour around the form (the form itself is in app.js).
   Variants for the judge: ?v=1..6 sets data-v on #contact (1 split, 2 clipboard, 3 one question at a time,
   4 evening house windows, 5 roof outline draws, 6 picture cards first).
   Function features ({motion:false}) run everywhere: variant switch, copy chip, tag stamp, lights, mobile bar,
   progress, one-question mode, picture cards. Motion features: heading/reveal, clipboard tilt. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var sec = function () { return d.getElementById('contact'); };

  /* ---------- variant switch ---------- */
  RW.add('ct-variant', function () {
    var s = sec(); if (!s) return;
    var m = /[?&]v=([1-6])\b/.exec(window.location.search);
    if (m) s.setAttribute('data-v', m[1]);
  });
  function v() { var s = sec(); return s ? s.getAttribute('data-v') : '1'; }

  /* ---------- copy-number chip: only where a tel: link goes nowhere (mouse + clipboard) ---------- */
  RW.add('ct-copy', function () {
    var b = RW.$('.ct .copy-num'), src = RW.$('.ct .big-phone .ct-num'), st = RW.$('.ct .copy-status');
    if (!b || !src || !st) return;
    if (!RW.fine || !navigator.clipboard || !window.isSecureContext) return;
    b.hidden = false;
    var t = 0;
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(src.textContent.trim()).then(function () {
        b.textContent = 'Copied'; b.classList.add('is-done'); st.textContent = 'Number copied';
        clearTimeout(t);
        t = setTimeout(function () { b.textContent = 'Copy number'; b.classList.remove('is-done'); st.textContent = ''; }, 1800);
      }, function () { /* no permission: say nothing, the number is right there to read */ });
    });
  });

  /* ---------- issue / area tag stamps in when it comes into view ---------- */
  RW.add('ct-stamp', function () {
    var form = RW.$('#enquiry'); if (!form) return;
    var tags = [RW.$('#issue-tag'), RW.$('#area-tag')].filter(Boolean);
    var queued = [];
    function fire(tag) {
      tag.classList.remove('is-stamp'); void tag.offsetWidth; tag.classList.add('is-stamp');
    }
    tags.forEach(function (tag) {
      tag.addEventListener('animationend', function (e) { if (e.target === tag && e.animationName === 'ct-ring') tag.classList.remove('is-stamp'); });
      if (!tag.hidden) queued.push(tag);   /* filled from the URL on load */
    });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = queued.indexOf(e.target);
        if (e.isIntersecting && i > -1 && !e.target.hidden) { queued.splice(i, 1); fire(e.target); }
      });
    }, { threshold: 0.9 });
    tags.forEach(function (t) { io.observe(t); });
    form.addEventListener('rw:tag', function (e) {
      var tag = e.detail.kind === 'town' ? RW.$('#area-tag') : RW.$('#issue-tag');
      if (!tag) return;
      requestAnimationFrame(function () {
        var r = tag.getBoundingClientRect();
        if (r.top > 70 && r.bottom < window.innerHeight - 10) fire(tag);   /* already on screen: stamp now */
        else if (queued.indexOf(tag) < 0) { queued.push(tag); io.unobserve(tag); io.observe(tag); }
      });
    });
  });

  /* ---------- lights on when the section arrives ---------- */
  RW.add('ct-lights', function () {
    var s = sec(); if (!s) return;
    RW.onView(s, { once: true, threshold: 0.18, enter: function () { s.classList.add('is-lit'); } });
  });

  /* ---------- the mobile bar steps aside while the form is on screen ---------- */
  RW.add('ct-bar', function () {
    var bar = RW.$('.bar'), wrap = RW.$('.ct .form-wrap');
    if (!bar || !wrap || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      var away = es[0].isIntersecting;
      bar.classList.toggle('is-away', away);
      /* a bar that has stepped off screen must not take keyboard focus either */
      if ('inert' in bar) bar.inert = away; else bar.setAttribute('aria-hidden', away ? 'true' : 'false');
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(wrap);
  });

  /* ---------- progress: windows (v4), roof outline and brand mark (v5) ---------- */
  RW.add('ct-progress', function () {
    var s = sec(), form = RW.$('#enquiry'); if (!s || !form) return;
    var state = { name: false, postcode: false, contact: false, details: false };
    var roof = RW.$('.ct-roof', s);
    function paint() {
      Object.keys(state).forEach(function (k) {
        RW.$$('[data-light="' + k + '"],[data-part="' + k + '"]', s).forEach(function (el) {
          el.classList.toggle('is-on', state[k]);   /* SVG elements: classList works on them too */
        });
      });
      if (roof) roof.classList.toggle('is-done', state.name && state.postcode && state.contact);
    }
    form.addEventListener('rw:field', function (e) {
      if (e.detail.name in state) { state[e.detail.name] = !!e.detail.ok; paint(); }
    });
    form.addEventListener('rw:sent', function () {
      Object.keys(state).forEach(function (k) { state[k] = true; }); paint();
      s.classList.add('is-done');
    });
  });

  /* ---------- v6: picture cards first ---------- */
  RW.add('ct-pick', function () {
    if (v() !== '6') return;
    var p = RW.$('#ct-pick'); if (p) p.hidden = false;
  });

  /* ---------- v3: one question at a time ---------- */
  RW.add('ct-convo', function () {
    if (v() !== '3') return;
    var s = sec(), form = RW.$('#enquiry'); if (!s || !form) return;
    var N = 4, cur = 1;
    var stepOf = { name: 1, postcode: 2, contact: 3, details: 4 };
    var grid = RW.$(".form-grid", form), actions = RW.$('.form-actions', form);
    var prog = d.createElement('div');
    prog.className = 'ct-prog';
    prog.innerHTML = '<span class="ct-tiles" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ct-prog-t" aria-live="polite"></span>';
    grid.parentNode.insertBefore(prog, grid);
    var nav = d.createElement('div');
    nav.className = 'ct-nav';
    nav.innerHTML = '<button type="button" class="btn btn-fill ct-next">Next<svg aria-hidden="true" viewBox="0 0 28 10"><path d="M0 5h26M21 1l5 4-5 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>' +
      '<button type="button" class="ct-back">Back</button><span class="ct-nav-hint">or press Enter</span>';
    actions.parentNode.insertBefore(nav, actions.nextSibling);
    var next = RW.$('.ct-next', nav), back = RW.$('.ct-back', nav), hint = RW.$('.ct-nav-hint', nav);
    var text = RW.$('.ct-prog-t', prog), tiles = RW.$$('.ct-tiles i', prog);
    function show(n, focus) {
      cur = Math.max(1, Math.min(N, n));
      RW.$$('[data-step]', form).forEach(function (el) { el.classList.toggle('is-cur', +el.getAttribute('data-step') === cur); });
      tiles.forEach(function (t, i) { t.classList.toggle('is-done', i < cur - 1); t.classList.toggle('is-now', i === cur - 1); });
      text.textContent = 'Question ' + cur + ' of ' + N;
      back.hidden = cur === 1;
      next.hidden = cur === N; hint.hidden = cur === N;
      if (focus) {
        var inp = RW.$('[data-step="' + cur + '"] input[type="text"],[data-step="' + cur + '"] textarea', form);
        if (inp) { try { inp.focus({ preventScroll: true }); } catch (x) { inp.focus(); } }
      }
    }
    function advance() {
      var inp = RW.$('[data-step="' + cur + '"] input[type="text"]', form);
      if (inp && RW.formCheck && !RW.formCheck(inp.name)) { inp.focus(); return; }
      show(cur + 1, true);
    }
    next.addEventListener('click', advance);
    back.addEventListener('click', function () { show(cur - 1, true); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && cur < N && e.target.matches && e.target.matches('input[type="text"]')) { e.preventDefault(); advance(); }
    });
    form.addEventListener('rw:invalid', function (e) { var n = stepOf[e.detail.field]; if (n && n !== cur) show(n, false); });
    s.classList.add('is-convo');
    show(1, false);
  });

  /* ---------- v2: the clipboard leans a little toward the pointer, and holds still while you write ---------- */
  RW.add('ct-tilt', function () {
    if (v() !== '2' || !RW.fine) return;
    var s = sec(), board = RW.$('.ct .form-wrap'); if (!s || !board) return;
    var tx = 0, ty = 0, x = 0, y = 0, on = false, lx = 9, ly = 9;
    s.addEventListener('pointermove', function (e) {
      if (board.contains(d.activeElement) && d.activeElement !== d.body) { tx = 0; ty = 0; return; }
      var r = board.getBoundingClientRect();
      var nx = RW.clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9), -1, 1);
      var ny = RW.clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9), -1, 1);
      tx = nx * 3; ty = -ny * 2.2;
    }, { passive: true });
    s.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    board.addEventListener('focusin', function () { tx = 0; ty = 0; });
    RW.onView(s, { enter: function () { on = true; }, leave: function () { on = false; } });
    RW.tick(function (t, dt) {
      if (!on) return;
      var k = 1 - Math.pow(0.002, dt);   /* soft spring-like follow, about 0.1 per frame */
      x += (tx - x) * k; y += (ty - y) * k;
      if (Math.abs(x - lx) > 0.01 || Math.abs(y - ly) > 0.01) {
        lx = x; ly = y;
        board.style.transform = 'perspective(1400px) rotateX(' + y.toFixed(2) + 'deg) rotateY(' + x.toFixed(2) + 'deg)';
      }
    });
  }, { motion: true });

  /* ---------- entrance: heading words, then copy, photo and sheet (once) ---------- */
  RW.add('ct-reveal', function () {
    var s = sec(); if (!s) return;
    RW.headings(s);
    RW.reveal(RW.$$('.ct-copy .lead, .ct-phone, .ct .note, .ct-photo, .ct-formcol', s), { y: 22, stagger: 0.07 });
  }, { motion: true });
}());
