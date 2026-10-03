/* CHECKS section behaviour (prototype: ?cv=1..5).
   checks-ui (always, also reduced motion): variant switch, tick buttons (aria-pressed), status, CTA lift,
     active item (scroll position, hover, focus) that moves the diagram / binocular / viewfinder.
   checks-motion (motion only): photo parallax, v3 scrubbed drawing, v4 eased binocular. */
(function () {
  'use strict';
  var RW = window.RW;
  var sec = document.getElementById('checks');
  if (!sec) return;
  /* variant first, before anything paints in a later frame */
  var V = +RW.variant(sec, 'cv', ['1', '4', '2', '3', '5'], ['Sightline diagram', 'Binocular photo', 'Sketch: flip cards', 'Sketch: scrubbed sightline', 'Sketch: phone viewfinder']);

  var items = RW.$$('.chk-item', sec);
  var photo = RW.$('.chk-photo', sec);
  var zones = (photo && photo.getAttribute('data-zones') || '12,33;48,14;72,68').split(';').map(function (z) {
    var p = z.split(','); return { x: parseFloat(p[0]) / 100, y: parseFloat(p[1]) / 100 };
  });
  var state = { active: 0, hover: -1, on: [false, false, false] };
  var listeners = [];   /* functions called with the active index */
  function setActive(i) {
    if (i === state.active && sec.hasAttribute('data-active')) return;
    state.active = i;
    sec.setAttribute('data-active', String(i));
    sec.classList.add('seen-' + i);
    items.forEach(function (li, k) { li.classList.toggle('is-active', k === i); });
    listeners.forEach(function (fn) { fn(i); });
  }
  RW.checks = { onActive: function (fn) { listeners.push(fn); }, setActive: setActive, state: state, zones: zones, V: V };

  RW.add('checks-ui', function () {
    var status = RW.$('.chk-status', sec);
    var names = items.map(function (li) { return RW.$('h3', li).textContent.trim(); });

    /* 1. tick buttons */
    items.forEach(function (li, i) {
      var h = RW.$('h3', li);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chk-tick';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-labelledby', 'chk-t' + (i + 1) + ' ' + h.id);
      b.setAttribute('aria-describedby', 'chk-hint');
      b.innerHTML = '<span class="chk-box" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="chk-tick-l" id="chk-t' + (i + 1) + '">I have checked the</span>';
      if (V === 2) { RW.$('.chk-tick-l', b).textContent = 'I have checked this'; b.setAttribute('aria-labelledby', 'chk-t' + (i + 1) + ' ' + h.id); }
      li.insertBefore(b, li.firstChild);
      if (V === 2) li.appendChild(b);
      b.addEventListener('click', function () {
        var on = !state.on[i];
        state.on[i] = on;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        li.classList.toggle('is-on', on);
        sec.classList.toggle('on-' + i, on);
        setActive(i);
        update(i, on);
      });
    });

    function update(i, on) {
      var n = state.on.filter(Boolean).length;
      var done = n === items.length;
      sec.classList.toggle('is-done', done);
      if (!n) status.textContent = '';
      else if (done) status.innerHTML = '<strong>All three checked.</strong> If anything looked wrong, tell us about it.';
      else status.textContent = n + ' of ' + items.length + ' checked.';
      if (V === 5) snap(i, on);
    }

    /* 2. active item: hover or focus wins, otherwise the row nearest 45% of the viewport */
    items.forEach(function (li, i) {
      li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { state.hover = i; setActive(i); } });
      li.addEventListener('pointerleave', function () { state.hover = -1; });
      li.addEventListener('focusin', function () { setActive(i); });
    });
    var inView = false, ticking = false;
    function spy() {
      ticking = false;
      if (state.hover > -1 || state.scrub) return;
      var anchor = window.innerHeight * 0.48, best = 0, bd = 1e9;
      items.forEach(function (li, i) {
        var r = li.getBoundingClientRect(), c = r.top + r.height / 2, dd = Math.abs(c - anchor);
        if (dd < bd) { bd = dd; best = i; }
      });
      setActive(best);
    }
    window.addEventListener('scroll', function () { if (inView && !ticking && V !== 2) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    RW.onView(sec, { margin: '-10% 0px -10% 0px', enter: function () { inView = true; if (V !== 2) spy(); }, leave: function () { inView = false; } });
    setActive(0);

    /* 3. v4 binocular: follows the pointer on the photo, otherwise sits on the active zone */
    if (V === 4) binocular();
    /* 4. v5 viewfinder + strip */
    if (V === 5) viewfinder();

    function binocular() {
      var scope = RW.$('.chk-scope', sec), ring = RW.$('.chk-scope-ring', sec), tag = RW.$('.chk-scope-tag', sec), img = RW.$('.chk-scope-img', sec);
      var s = { x: 0, y: 0, tx: 0, ty: 0, ptr: false, frame: 0, w: 0, h: 0, r: 70 };
      function size() { var r = photo.getBoundingClientRect(); s.w = r.width; s.h = r.height; s.r = Math.max(44, Math.min(80, s.w * 0.11)); scope.style.setProperty('--sr', s.r + 'px'); scope.style.setProperty('--so', (s.r * 0.68) + 'px'); }
      function toZone(i) { s.tx = RW.clamp(zones[i].x * s.w, s.r * 1.68, s.w - s.r * 1.68); s.ty = RW.clamp(zones[i].y * s.h, s.r, s.h - s.r); tag.textContent = names[i]; }
      function paint() {
        scope.style.setProperty('--sx', s.x.toFixed(1) + 'px'); scope.style.setProperty('--sy', s.y.toFixed(1) + 'px');
        img.style.transformOrigin = s.x.toFixed(1) + 'px ' + s.y.toFixed(1) + 'px';
        var k = (s.r * 2.04) / 120;
        ring.style.transform = 'translate(' + (s.x - 100 * k).toFixed(1) + 'px,' + (s.y - 60 * k).toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
        ring.style.transformOrigin = '0 0';
        var tx = RW.clamp(s.x - 40, 4, s.w - 170), ty = s.y + s.r + 10; if (ty > s.h - 30) ty = s.y - s.r - 36;
        tag.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
      }
      function loop() {
        s.frame = 0;
        var e = RW.motionOK ? 0.12 : 1;
        s.x += (s.tx - s.x) * e; s.y += (s.ty - s.y) * e;
        paint();
        if (Math.abs(s.tx - s.x) > 0.3 || Math.abs(s.ty - s.y) > 0.3) s.frame = requestAnimationFrame(loop);
      }
      function go() { if (!s.frame) s.frame = requestAnimationFrame(loop); }
      size(); toZone(0); s.x = s.tx; s.y = s.ty; paint();
      RW.checks.onActive(function (i) { if (!s.ptr) { toZone(i); go(); } });
      if (RW.fine) {
        photo.addEventListener('pointermove', function (e) { var r = photo.getBoundingClientRect(); s.ptr = true; s.tx = e.clientX - r.left; s.ty = e.clientY - r.top; tag.textContent = ''; go(); });
        photo.addEventListener('pointerleave', function () { s.ptr = false; toZone(state.active); go(); });
      }
      photo.addEventListener('click', function (e) {
        /* tap: jump to the nearest of the three zones */
        var r = photo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, best = 0, bd = 9;
        zones.forEach(function (z, i) { var dd = Math.hypot(z.x - x, z.y - y); if (dd < bd) { bd = dd; best = i; } });
        s.ptr = false; setActive(best); toZone(best); go();
      });
      window.addEventListener('resize', function () { size(); toZone(state.active); s.x = s.tx; s.y = s.ty; paint(); });
    }

    var vfBox, flash, strip;
    function viewfinder() {
      var vf = RW.$('.chk-vf', sec); vfBox = RW.$('.chk-vf-box', sec); flash = RW.$('.chk-vf-flash', sec);
      strip = RW.$$('.chk-strip li', sec);
      strip.forEach(function (li, i) {
        li.setAttribute('data-l', names[i]);
        /* crop the strip thumbnail around the zone: background-size 320% => position maps 0..100% */
        li.style.setProperty('--bp', (zones[i].x * 100).toFixed(0) + '% ' + (zones[i].y * 100).toFixed(0) + '%');
      });
      function place(i) {
        var r = vf.getBoundingClientRect(), bw = vfBox.offsetWidth, bh = vfBox.offsetHeight;
        var x = RW.clamp(zones[i].x * r.width - bw / 2, 4, r.width - bw - 4), y = RW.clamp(zones[i].y * r.height - bh / 2, 4, r.height - bh - 4);
        vfBox.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      }
      RW.checks.onActive(place);
      window.addEventListener('resize', function () { place(state.active); });
      place(0);
    }
    function snap(i, on) {
      if (!strip) return;
      strip[i].classList.toggle('is-on', on);
      if (!on || !RW.motionOK) return;
      flash.classList.add('is-on');
      requestAnimationFrame(function () { requestAnimationFrame(function () { flash.classList.remove('is-on'); }); });
      vfBox.classList.remove('is-snap'); void vfBox.offsetWidth; vfBox.classList.add('is-snap');
    }
  });

  RW.add('checks-motion', function () {
    var gsap = RW.gsap, ST = RW.ST;
    RW.headings(sec);
    /* gentle photo parallax inside its cutout (v1, v2, v3; v4/v5 keep the photo still so overlays stay aligned) */
    if (V <= 3) {
      var im = RW.$('.chk-img', sec);
      gsap.fromTo(im, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    /* diagram marks draw in as the section arrives (v1) */
    if (V === 1) {
      var marks = RW.$$('.d-mark', sec);
      gsap.set(marks, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' });
      ST.create({ trigger: sec, start: 'top 70%', once: true, onEnter: function () { gsap.to(marks, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08 }); } });
    }
    /* v2: card icons draw on view, cards rise once */
    if (V === 2) {
      RW.$$('.chk-ico path', sec).forEach(function (p) { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
      ST.create({ trigger: RW.$('.chk-list', sec), start: 'top 82%', once: true, onEnter: function () {
        gsap.to(RW.$$('.chk-ico path', sec), { strokeDashoffset: 0, duration: 1, ease: 'power2.out', stagger: 0.03 });
      } });
      RW.reveal(RW.$$('.chk-item', sec), { y: 22, stagger: 0.07 });
    }
    /* v3: the whole drawing is scrubbed by the list's progress through the viewport */
    if (V === 3) {
      var dia = RW.$('.chk-dia', sec), list = RW.$('.chk-list', sec);
      var lines = RW.$$('.d-ln,.d-gut,.d-lead', dia), pats = RW.$$('.d-roof-pat,.d-wall-pat,.d-fill-roof,.d-chim-fill,.d-stain,.d-moss,.d-grass,.d-fence,.d-sky', dia);
      var person = RW.$('.d-person', dia), cone = RW.$('.d-cone', dia), scan = RW.$('.d-scan', dia), marks3 = RW.$$('.d-mark', dia);
      lines.forEach(function (p) { p.style.strokeDasharray = '1'; });
      var A = [-17.95, -24.65, -5.65], P = [[330, 165], [433, 84], [474, 207]];
      cone.style.transition = 'none'; scan.style.transition = 'none'; RW.$('.d-head', dia).style.transition = 'none';
      RW.checks.state.scrub = true;
      function write(p) {
        var draw = RW.clamp(p / 0.3, 0, 1);
        lines.forEach(function (l, i) { var o = RW.clamp(draw * 1.6 - i * 0.6 / lines.length, 0, 1); l.style.strokeDashoffset = (1 - o).toFixed(3); });
        pats.forEach(function (e) { e.style.opacity = RW.clamp((p - 0.18) / 0.15, 0, 1).toFixed(2); });
        var look = RW.clamp((p - 0.3) / 0.7, 0, 1);
        person.style.opacity = RW.clamp((p - 0.22) / 0.08, 0, 1).toFixed(2);
        cone.style.opacity = scan.style.opacity = RW.clamp((p - 0.28) / 0.06, 0, 1).toFixed(2);
        var f = look * 2, k = Math.min(1, Math.floor(f)), t = f - k; if (k >= 2) { k = 1; t = 1; }
        var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var ang = A[k] + (A[k + 1] - A[k]) * ease, x = P[k][0] + (P[k + 1][0] - P[k][0]) * ease, y = P[k][1] + (P[k + 1][1] - P[k][1]) * ease;
        cone.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';
        scan.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        RW.$('.d-head', dia).style.transform = 'rotate(' + (-14 + ang * 0.4).toFixed(1) + 'deg)';
        var act = look < 0.25 ? 0 : look < 0.75 ? 1 : 2;
        if (p < 0.3) act = 0;
        list.style.setProperty('--p', look.toFixed(3));
        items.forEach(function (li, i) { li.classList.toggle('is-reached', p >= 0.3 && look >= i * 0.5 - 0.02); });
        marks3.forEach(function (mk, i) { mk.style.opacity = look >= i * 0.5 - 0.02 && p >= 0.3 ? 1 : 0; });
        RW.checks.setActive(act);
      }
      var stt = ST.create({ trigger: list, start: 'top 80%', end: 'bottom 45%', scrub: 0.6, onUpdate: function (self) { write(self.progress); }, onRefresh: function (self) { write(self.progress); } });
      write(stt.progress || 0);
    }
  }, { motion: true });
}());
