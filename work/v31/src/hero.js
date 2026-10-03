/* =====================================================================
   HERO behaviour (owner: hero team).
   - hero-variant  (always): prototype switch, ?v=1..6 sets data-v on the section (judge keeps one).
   - hero-picker   (always): OWNER TOOL, the fixed "Hero style A B C" pill. Delete before sending to a client.
   - hero-intro    (motion): masked word reveal of the h1, copy rises, photos are laid into the gable, outline draws.
   - hero-scene    (motion): one loop for the whole hero: photo parallax inside the gable (.cw pattern), swallows,
                             chimney smoke (canvas), and the per-variant interaction:
       v1 calm layered roofscape      v2 scroll-scrubbed "roof assembles"   v3 pointer depth diorama
       v4 morning light follows you   v5 rooftop horizon rises into the next section   v6 your pointer makes the wind
   Everything decorative is aria-hidden and pointer-events:none, pauses when the hero is off screen, and does not
   exist under reduced motion or data-motion="off" (the CSS shows the finished hero).
   ===================================================================== */
(function () {
  'use strict';
  var RW = window.RW;
  if (!RW) return;
  var d = document, root = d.documentElement;
  var H = RW.hero = { v: 1 };

  function layout() { var l = root.getAttribute('data-hero'); return (l === 'b' || l === 'c') ? l : 'a'; }
  function setParam(key, val) {
    try { var u = new URL(location.href); u.searchParams.set(key, val); history.replaceState(history.state, '', u.toString()); } catch (e) {}
  }

  /* ---------- prototype variant switch ---------- */
  RW.add('hero-variant', function () {
    var sec = RW.$('.hero'); if (!sec) return;
    H.sec = sec; H.v = +RW.variant(sec, 'hm', ['1', '2', '6'], ['Calm roofscape', 'Roof assembles', 'Wind']);
  });

  /* ---------- intro: one composed load sequence (cinematic-gsap-lenis: media first, headline, copy, CTA) ---------- */
  RW.add('hero-intro', function () {
    var sec = H.sec || RW.$('.hero'); if (!sec) return;
    var gsap = RW.gsap, $ = function (s) { return RW.$(s, sec); }, $$ = function (s) { return RW.$$(s, sec); };
    var h1 = $('#h-hero'), words = h1 ? RW.splitWords(h1) : [];
    var panes = $$('.hero-pane').filter(function (p) { return p.offsetParent !== null; });
    var order = panes.length === 3 ? [panes[1], panes[0], panes[2]] : panes;
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(order, { opacity: 0, y: 34, duration: 1.1, stagger: 0.08, clearProps: 'opacity,transform' }, 0.05)
      .from(order.map(function (p) { return p.querySelector('img'); }), { scale: 1.12, duration: 1.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }, 0.05)
      .from(words, { yPercent: 112, duration: 1.05, stagger: 0.06 }, 0.15)
      .from($('.hero-kicker'), { y: 14, opacity: 0, duration: 0.9, clearProps: 'opacity,transform' }, 0.1)
      .from([$('.hero-lead'), $('.hero-actions'), $('.hero-rating')].filter(Boolean), { y: 20, opacity: 0, duration: 0.95, stagger: 0.08, clearProps: 'opacity,transform' }, 0.4)
      .from($$('.hero-roofs'), { y: 18, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.3);
    var detail = $('.hero-detail');
    if (detail && getComputedStyle(detail).display !== 'none') tl.from(detail, { opacity: 0, y: 26, duration: 1, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.95);
    if (H.v !== 2) {
      var ol = $('.hero-outline');
      if (ol) tl.fromTo(ol, { clipPath: 'inset(-8px 100% -8px -8px)' }, { clipPath: 'inset(-8px -8px -8px -8px)', duration: 1.7, ease: 'power2.inOut', clearProps: 'clipPath' }, 0.75);
    }
    var sweep = $('.hero-sweep');
    if (sweep && H.v !== 4) {
      tl.fromTo(sweep, { xPercent: -70, opacity: 0 }, { xPercent: 70, duration: 2.2, ease: 'power2.inOut' }, 1.2)
        .to(sweep, { opacity: 1, duration: 0.7, ease: 'power1.out' }, 1.2)
        .to(sweep, { opacity: 0, duration: 0.9, ease: 'power1.in' }, 2.5);
    }
    H.intro = tl;
  }, { motion: true });

  /* ---------- the scene ---------- */
  RW.add('hero-scene', function () {
    var sec = H.sec || RW.$('.hero'); if (!sec) return;
    var V = H.v, fine = RW.fine;
    var stage = RW.$('.hero-stage', sec), frame = RW.$('.hero-frame', sec), plate = RW.$('.hero-plate', sec),
      plateIn = RW.$('.hero-plate-in', sec), panesEl = RW.$('.hero-panes', sec), detail = RW.$('.hero-detail', sec),
      detailSh = RW.$('.hero-detail-sh', sec), vane = RW.$('.hero-vane', sec);
    if (!stage || !frame || !plateIn) return;
    sec.classList.add('is-live');

    var S = { y0: 0, top: 0, h: 0, fw: 0, fh: 0, fx: 0, vh: innerHeight, vw: innerWidth, heroTop: 0, heroH: 0, padB: 0,
      smoke: null, panes: [], eave: 0.19 };
    var st = { py: 0, ap: 0, ep: 0, nx: 0, ny: 0, tnx: 0, tny: 0, wind: 8, gust: 0, vaneA: 0, lx: 0.8, ly: 0.2, lr: 0, tlx: 0.8, tly: 0.2, tlr: 0, ptr: false };

    /* --- V3 takes over pointer depth itself; depth.js (which runs after us) then only does scroll depth --- */
    if (V === 3) RW.$$('[data-px]', sec).forEach(function (el) { el.removeAttribute('data-px'); el.removeAttribute('data-py'); });

    /* --- canvas for smoke (all variants) and leaves (v6) --- */
    var cv = d.createElement('canvas'); cv.className = 'hero-air'; cv.setAttribute('aria-hidden', 'true');
    frame.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = 1, cw = 0, ch = 0;
    function sprite(r, g, b, a0) {
      var c = d.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
      var gr = x.createRadialGradient(64, 64, 0, 64, 64, 64), stops = [[0, 1], [0.2, 0.86], [0.4, 0.56], [0.6, 0.28], [0.8, 0.08], [1, 0]];
      stops.forEach(function (s) { gr.addColorStop(s[0], 'rgba(' + r + ',' + g + ',' + b + ',' + (a0 * s[1]).toFixed(3) + ')'); });
      x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return c;
    }
    var puffSpr = [sprite(242, 244, 245, 1), sprite(196, 203, 207, 1)];
    function leafSprite(fill, rib) {
      var c = d.createElement('canvas'); c.width = 48; c.height = 28; var x = c.getContext('2d');
      x.beginPath(); x.moveTo(2, 14); x.bezierCurveTo(12, 2, 32, 1, 46, 12); x.bezierCurveTo(34, 25, 14, 27, 2, 14); x.closePath();
      x.fillStyle = fill; x.fill(); x.strokeStyle = rib; x.lineWidth = 1.4; x.stroke();
      x.beginPath(); x.moveTo(5, 14); x.lineTo(40, 12); x.stroke(); return c;
    }
    var leafSpr = V === 6 ? [{ face: leafSprite('#DDA783', '#985632'), back: leafSprite('#EBCDB6', '#B98261') },
      { face: leafSprite('#C9B27A', '#7F6A3A'), back: leafSprite('#E2D5B0', '#9C8A5C') }] : null;

    var puffs = [], emitAcc = 0, leaves = [];

    /* --- birds --- */
    var birds = RW.$$('.hero-bird', sec).map(function (el, i) { return { el: el, i: i }; });
    function spawnBird(b, initial) {
      var W = S.vw, Hh = S.h;
      b.dir = Math.random() < 0.6 ? -1 : 1;
      b.size = 0.9 + Math.random() * 0.2;
      b.speed = (24 + Math.random() * 20) * RW.clamp(W / 1440, 0.65, 1.15);
      b.x = initial ? W * (0.15 + Math.random() * 0.7) : (b.dir > 0 ? -60 - Math.random() * 400 : W + 60 + Math.random() * 400);
      var bandTop = -Hh * 0.07, bandBot = Hh * S.eave - Hh * 0.05;
      b.y0 = bandTop + Math.random() * Math.max(10, bandBot - bandTop);
      b.amp = 4 + Math.random() * 9; b.f = 0.18 + Math.random() * 0.22; b.ph = Math.random() * 6.3;
      b.flap = 1 + Math.random() * 4; b.flapT = 0;
    }

    /* --- measuring (no layout reads inside the loop) --- */
    function eaveOf() { return { a: 0.1938, b: 0.3406, c: 0.2192 }[layout()]; }
    function measure() {
      var sy = pageYOffset;
      S.vh = innerHeight; S.vw = d.documentElement.clientWidth;
      var r = stage.getBoundingClientRect(); S.top = r.top + sy; S.h = r.height;
      var hr = sec.getBoundingClientRect(); S.heroTop = hr.top + sy; S.heroH = hr.height;
      S.padB = hr.bottom - r.bottom;
      S.fw = frame.offsetWidth; S.fh = frame.offsetHeight; S.fx = frame.offsetLeft;
      S.eave = eaveOf();
      /* canvas covers the frame plus 30% above it */
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = S.fw; ch = Math.round(S.fh * 1.3);
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      /* panes in frame coordinates (offset* ignores transforms) */
      S.panes = RW.$$('.hero-pane', panesEl).map(function (p) {
        var vis = p.offsetParent !== null;
        return { el: p, img: p.querySelector('img'), vis: vis,
          x: vis ? p.offsetLeft + panesEl.offsetLeft + plateIn.offsetLeft + plate.offsetLeft : 0,
          y: vis ? p.offsetTop + panesEl.offsetTop + plateIn.offsetTop + plate.offsetTop : 0,
          w: p.offsetWidth, h: p.offsetHeight };
      });
      S.vis = S.panes.filter(function (p) { return p.vis; });
      /* chimney mouth from data-smoke, through object-fit: cover and object-position */
      S.smoke = null;
      S.vis.forEach(function (p, idx) {
        var img = p.img, f = img && img.getAttribute('data-smoke');
        if (!f) return;
        f = f.split(/\s+/).map(parseFloat);
        var bw = img.offsetWidth, bh = img.offsetHeight, bx = img.offsetLeft, by = img.offsetTop;
        var iw = +img.getAttribute('width') || img.naturalWidth, ih = +img.getAttribute('height') || img.naturalHeight;
        var s = Math.max(bw / iw, bh / ih), rw = iw * s, rh = ih * s;
        var op = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map(function (v) { return parseFloat(v) / 100; });
        var ox = bx + (bw - rw) * (isNaN(op[0]) ? 0.5 : op[0]), oy = by + (bh - rh) * (isNaN(op[1]) ? 0.5 : op[1]);
        S.smoke = { pane: idx, x: p.x + ox + f[0] * rw, y: p.y + oy + f[1] * rh, u: RW.clamp(p.w / 480, 0.45, 1.3) };
      });
      if (V === 5) layoutHorizon();
    }

    /* ---------- v2: roof assembles (scroll-scrubbed, reversible) ---------- */
    var dash = null;
    if (V === 2) {
      var ol = RW.$('.hero-outline', sec);
      dash = ol.cloneNode(true); dash.setAttribute('class', 'hero-outline-dash'); frame.appendChild(dash);
    }
    var asm = { 3: [[-16, 0.12, -1.4], [0, 0, 0], [18, 0.19, 1.6]], 2: [[0, 0, 0], [16, 0.15, 1.4]], 1: [[0, 0.06, 0]] };

    /* ---------- v4: morning light ---------- */
    var lit = null, glow = null, sun = null;
    if (V === 4) {
      lit = panesEl.cloneNode(true); lit.classList.add('hero-panes-lit'); lit.setAttribute('aria-hidden', 'true');
      RW.$$('img', lit).forEach(function (im) { im.alt = ''; im.removeAttribute('data-smoke'); im.removeAttribute('fetchpriority'); });
      plateIn.appendChild(lit);
      glow = d.createElement('div'); glow.className = 'hero-glow'; glow.setAttribute('aria-hidden', 'true'); plate.appendChild(glow);
      sun = d.createElement('div'); sun.className = 'hero-sun'; sun.setAttribute('aria-hidden', 'true'); sec.insertBefore(sun, sec.firstChild);
    }

    /* ---------- v5: horizon ---------- */
    var hz = null;
    function roofSvg(path, fill) {
      return '<svg viewBox="0 0 1440 100" preserveAspectRatio="xMidYMax slice" focusable="false"><path style="fill:' + fill + '" d="' + path + '"/></svg><i></i>';
    }
    if (V === 5) {
      var farP = RW.$('.hero-roofs-far path', sec).getAttribute('d'), nearP = RW.$('.hero-roofs-near path', sec).getAttribute('d');
      hz = { mid: d.createElement('div'), front: d.createElement('div') };
      hz.mid.className = 'hero-horizon hero-horizon-mid'; hz.front.className = 'hero-horizon hero-horizon-front';
      hz.mid.setAttribute('aria-hidden', 'true'); hz.front.setAttribute('aria-hidden', 'true');
      hz.mid.innerHTML = roofSvg(nearP, 'var(--sand)'); hz.front.innerHTML = roofSvg(farP, 'var(--hz-bg,var(--paper))');
      stage.appendChild(hz.mid); stage.appendChild(hz.front);
    }
    function layoutHorizon() {
      if (!hz) return;
      var next = sec.nextElementSibling, bg = next ? getComputedStyle(next).backgroundColor : '';
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = getComputedStyle(sec).backgroundColor;
      var roofH = Math.round(S.h * 0.34);
      [hz.mid, hz.front].forEach(function (el) {
        el.style.setProperty('--hz-roof', roofH + 'px');
        el.style.setProperty('--hz-fill', Math.round(S.padB + S.h) + 'px');
      });
      hz.front.style.setProperty('--hz-bg', bg);
      hz.mid.style.setProperty('--hz-bg', 'var(--sand)');
      hz.roofH = roofH;
    }

    /* ---------- pointer & wind input ---------- */
    var lastPX = 0, lastPT = 0;
    if (fine) {
      sec.addEventListener('pointermove', function (e) {
        var vy = e.clientY - (S.heroTop - pageYOffset);
        st.tnx = RW.clamp(e.clientX / S.vw * 2 - 1, -1, 1);
        st.tny = RW.clamp(vy / Math.max(1, S.heroH) * 2 - 1, -1, 1);
        st.ptr = true;
        /* light target in frame coordinates */
        var fr = S.top - pageYOffset;
        st.tlx = (e.clientX - S.fx) / Math.max(1, S.fw); st.tly = (e.clientY - fr) / Math.max(1, S.fh);
        /* wind from pointer speed */
        var now = performance.now(), dt = (now - lastPT) / 1000;
        if (lastPT && dt > 0 && dt < 0.2) { var vx = (e.clientX - lastPX) / dt; st.gust = RW.lerp(st.gust, RW.clamp(vx * 0.11, -120, 120), 0.35); }
        lastPX = e.clientX; lastPT = now;
      }, { passive: true });
      sec.addEventListener('pointerleave', function () { st.tnx = 0; st.tny = 0; st.ptr = false; lastPT = 0; });
      window.addEventListener('blur', function () { st.ptr = false; });
    }
    var lastSY = pageYOffset;

    /* ---------- smoke + leaves ---------- */
    function emit(u, ox, oy) {
      puffs.push({ x: ox + (Math.random() - 0.5) * 3 * u, y: oy, r: (4 + Math.random() * 3) * u, vr: (8 + Math.random() * 6) * u,
        vy: -(30 + Math.random() * 12) * u, vx: (Math.random() - 0.5) * 6 * u, life: 5.2 + Math.random() * 2.2, age: 0,
        a: 0.2 + Math.random() * 0.14, ph: Math.random() * 6.3, s: Math.random() < 0.5 ? 0 : 1 });
    }
    function spawnLeaf(l, initial) {
      l.x = Math.random() * cw; l.y = initial ? Math.random() * ch : -20 - Math.random() * 60;
      l.fall = 16 + Math.random() * 16; l.spin = Math.random() * 6.3; l.spinV = 1.4 + Math.random() * 1.8;
      l.roll = Math.random() * 6.3; l.rollV = (Math.random() - 0.5) * 1.2; l.slip = 18 + Math.random() * 22;
      l.sz = 13 + Math.random() * 9; l.a = 0.6 + Math.random() * 0.3; l.k = Math.random() < 0.6 ? 0 : 1;
    }
    function airStep(t, dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      var sm = S.smoke, top = S.fh * 0.3;
      if (sm) {
        var u = sm.u, p = S.vis[sm.pane];
        var ox = sm.x + (p && p.dx || 0), oy = sm.y + top + st.py + (p && p.dy || 0);
        emitAcc += dt * 5.5;
        while (emitAcc > 1) { emitAcc -= 1; emit(u, ox, oy); }
        var wind = (V === 6 ? st.wind : 7 + Math.sin(t * 0.21) * 3) * u;
        for (var i = puffs.length - 1; i >= 0; i--) {
          var q = puffs[i]; q.age += dt; var k = q.age / q.life;
          if (k >= 1) { puffs.splice(i, 1); continue; }
          q.vy *= 1 - 0.1 * dt;
          q.x += (q.vx + wind * (0.3 + k * 1.2)) * dt + Math.sin(q.age * 1.5 + q.ph) * 3 * u * dt;
          q.y += q.vy * dt; q.r += q.vr * dt;
          var a = q.a * Math.min(1, k / 0.12) * Math.pow(1 - k, 1.5) * RW.clamp(q.y / (ch * 0.16), 0, 1);
          if (a <= 0.003) continue;
          ctx.globalAlpha = a; ctx.drawImage(puffSpr[q.s], q.x - q.r, q.y - q.r, q.r * 2, q.r * 2);
        }
      }
      if (leaves.length) {
        for (var j = 0; j < leaves.length; j++) {
          var l = leaves[j];
          l.spin += l.spinV * dt; l.roll += l.rollV * dt;
          l.x += (Math.sin(l.spin) * l.slip + st.wind * 0.9) * dt; l.y += l.fall * dt;
          if (l.y > ch + 30) spawnLeaf(l, false);
          if (l.x > cw + 40) l.x = -30; else if (l.x < -40) l.x = cw + 30;
          var c = Math.cos(l.spin), spr = leafSpr[l.k], img = c < 0 ? spr.back : spr.face;
          ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.roll); ctx.scale(c, 1);
          ctx.globalAlpha = l.a * RW.clamp((l.y + 20) / 60, 0, 1);
          ctx.drawImage(img, -l.sz / 2, -l.sz * 0.29, l.sz, l.sz * 0.58); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ---------- the loop ---------- */
    var on = true;
    RW.onView(sec, { margin: '10% 0px 10% 0px', enter: function () { on = true; }, leave: function () { on = false; } });
    function sstep(x) { return x * x * (3 - 2 * x); }
    function k(dt, rate) { return 1 - Math.exp(-dt * rate); }

    measure();
    birds.forEach(function (b) { spawnBird(b, true); });
    if (V === 6) { for (var li = 0; li < Math.round(RW.clamp(S.vw / 1440, 0.6, 1) * 5); li++) { var L = {}; spawnLeaf(L, true); leaves.push(L); } }

    RW.tick(function (t, dt) {
      if (!on) return;
      var y = pageYOffset, vh = S.vh;
      /* scroll velocity (for v6 wind on touch) */
      var sv = (y - lastSY) / Math.max(dt, 1 / 120); lastSY = y;

      /* photo parallax inside the gable: clip stays on .hero-plate, the child moves */
      var pp = RW.clamp((y + vh - S.top) / (vh + S.h), 0, 1);
      var py = (pp - 0.5) * -0.1 * S.fh;
      /* v5: the photo sinks a little more as the rooftops rise */
      var ep = RW.clamp(y / Math.max(160, S.top + S.h - RW.HDR - 40), 0, 1);
      st.ep += (ep - st.ep) * k(dt, 12);
      if (V === 5) py += sstep(st.ep) * 0.06 * S.fh;
      st.py = py;
      plateIn.style.translate = '0px ' + py.toFixed(1) + 'px';

      /* pointer easing (critically damped feel, Apple: response ~0.4s) */
      if (!fine) { st.tnx = (pp - 0.5) * 0.9; st.tny = (pp - 0.5) * 0.5; }
      st.nx += (st.tnx - st.nx) * k(dt, 5); st.ny += (st.tny - st.ny) * k(dt, 5);

      /* wind (v6): base breeze + gust from pointer speed or scroll speed, decaying */
      if (V === 6) {
        if (!fine) st.gust = RW.lerp(st.gust, RW.clamp(sv * 0.07, -110, 110), 0.12);
        st.gust *= Math.exp(-dt / 1.3);
        st.wind += (8 + st.gust - st.wind) * k(dt, 3);
        var target = st.wind >= 0 ? 0 : Math.PI;
        st.vaneA += (target - st.vaneA) * k(dt, 2.5);
        if (vane) vane.setAttribute('transform', 'translate(1153 0) scale(' + Math.cos(st.vaneA).toFixed(3) + ' 1) translate(-1153 0)');
      }

      /* panes: v2 assembly / v3 window parallax */
      var vis = S.vis;
      if (V === 2) {
        var ap = RW.clamp(y / Math.max(160, S.top + S.h / 2 - vh / 2 + 60), 0, 1);
        st.ap += (ap - st.ap) * k(dt, 10);
        var e = 1 - sstep(st.ap), set = asm[vis.length] || asm[1];
        for (var i = 0; i < vis.length; i++) {
          var o = set[i] || [0, 0, 0], p = vis[i];
          p.dx = o[0] * e; p.dy = o[1] * S.fh * e;
          p.el.style.translate = p.dx.toFixed(1) + 'px ' + p.dy.toFixed(1) + 'px';
          p.el.style.rotate = (o[2] * e).toFixed(2) + 'deg';
        }
        var ol2 = RW.$('.hero-outline', sec);
        ol2.style.opacity = (0.15 + 0.85 * sstep(st.ap)).toFixed(3);
        if (dash) dash.style.opacity = (1 - sstep(st.ap)).toFixed(3);
        if (detail) { detail.style.translate = '0px ' + (36 * e).toFixed(1) + 'px'; detail.style.rotate = (-3 * e).toFixed(2) + 'deg'; }
      } else if (V === 3) {
        var depths = vis.length === 3 ? [0.65, 1, 0.75] : [1, 0.75];
        for (var j = 0; j < vis.length; j++) {
          var dp = depths[j] || 0.8, q = vis[j];
          q.dx = -st.nx * 14 * dp; q.dy = -st.ny * 7 * dp;
          q.img.style.translate = q.dx.toFixed(1) + 'px ' + q.dy.toFixed(1) + 'px';
        }
        frame.style.transform = 'rotateY(' + (st.nx * 1.4).toFixed(3) + 'deg) rotateX(' + (-st.ny * 1).toFixed(3) + 'deg)';
        var far = RW.$('.hero-roofs-far', sec), near = RW.$('.hero-roofs-near', sec);
        if (far) far.style.transform = 'translate(' + (-st.nx * 10).toFixed(1) + 'px,' + (-st.ny * 3).toFixed(1) + 'px)';
        if (near) near.style.transform = 'translate(' + (-st.nx * 18).toFixed(1) + 'px,' + (-st.ny * 5).toFixed(1) + 'px)';
        if (detail) detail.style.transform = 'translate(' + (st.nx * 22).toFixed(1) + 'px,' + (st.ny * 10).toFixed(1) + 'px)';
        if (detailSh) detailSh.style.transform = 'translate(' + (4 + st.nx * 10).toFixed(1) + 'px,' + (10 + st.ny * 7).toFixed(1) + 'px)';
        RW.$$('.hf', sec).forEach(function (el, n) {
          var m = [30, 38, 46, 22][n] || 30;
          el.style.transform = 'translate(' + (st.nx * m).toFixed(1) + 'px,' + (st.ny * m * 0.45).toFixed(1) + 'px)';
        });
      }

      /* v4: the light follows the pointer; at rest it sits where the morning sun is and moves with the day (scroll) */
      if (V === 4) {
        if (!st.ptr) { st.tlx = 0.82 - pp * 0.55 + Math.sin(t * 0.15) * 0.03; st.tly = 0.22 + Math.sin(t * 0.11) * 0.03; }
        var R = Math.min(S.fw, 1440) * (st.ptr ? 0.2 : 0.26);
        st.lx += (st.tlx - st.lx) * k(dt, st.ptr ? 7 : 2); st.ly += (st.tly - st.ly) * k(dt, st.ptr ? 7 : 2);
        st.lr += (R - st.lr) * k(dt, 5);
        var lxp = st.lx * S.fw, lyp = st.ly * S.fh - py + S.fh * 0.07;
        lit.style.setProperty('--lx', lxp.toFixed(1) + 'px'); lit.style.setProperty('--ly', lyp.toFixed(1) + 'px'); lit.style.setProperty('--lr', st.lr.toFixed(1) + 'px');
        glow.style.transform = 'translate3d(' + lxp.toFixed(1) + 'px,' + (st.ly * S.fh).toFixed(1) + 'px,0)';
        sun.style.transform = 'translate3d(' + (S.fx + lxp).toFixed(1) + 'px,' + (S.top - S.heroTop - S.h * 0.2).toFixed(1) + 'px,0)';
        if (detailSh && detail) {
          var dx = (0.85 - st.lx) * 18, dyy = 10 + (0.5 - st.ly) * 6;
          detailSh.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dyy.toFixed(1) + 'px)';
        }
      }

      /* v5: rooftops rise in front of the photo and become the next section's surface */
      if (V === 5 && hz) {
        var E = sstep(st.ep), rh = hz.roofH;
        var tf = RW.lerp(S.h - rh * 0.3, S.h - rh * 1.25, E), tm = RW.lerp(S.h - rh * 0.45, S.h - rh * 1.55, E);
        hz.front.style.transform = 'translate3d(0,' + tf.toFixed(1) + 'px,0)';
        hz.mid.style.transform = 'translate3d(0,' + tm.toFixed(1) + 'px,0)';
      }

      /* swallows */
      for (var b = 0; b < birds.length; b++) {
        var B = birds[b];
        B.x += (B.dir * B.speed + (V === 6 ? st.wind * 0.6 : 0)) * dt;
        if ((B.dir > 0 && B.x > S.vw + 80) || (B.dir < 0 && B.x < -80)) spawnBird(B, false);
        var ang = t * B.f * 6.283 + B.ph, by = B.y0 + Math.sin(ang) * B.amp - (V === 5 ? sstep(st.ep) * S.h * 0.25 : 0);
        var bank = Math.cos(ang) * B.amp * 0.35;
        B.flap -= dt; var sy = 1;
        if (B.flap < 0) { B.flapT += dt; sy = 0.6 + 0.4 * Math.abs(Math.cos(B.flapT * 13)); if (B.flapT > 0.75) { B.flap = 2.5 + Math.random() * 5; B.flapT = 0; } }
        var ox = V === 3 ? -st.nx * 8 : 0;
        B.el.style.transform = 'translate3d(' + (B.x + ox).toFixed(1) + 'px,' + by.toFixed(1) + 'px,0) rotate(' + (bank * B.dir).toFixed(1) + 'deg) scale(' + B.size + ',' + (B.size * sy).toFixed(3) + ')';
      }

      airStep(t, dt);
    });

    /* --- keep measurements fresh --- */
    var rq = 0;
    function remeasure() { cancelAnimationFrame(rq); rq = requestAnimationFrame(function () { measure(); birds.forEach(function (b) { if (b.y0 > S.h) spawnBird(b, true); }); }); }
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    d.addEventListener('rw:hero-layout', function () { puffs.length = 0; remeasure(); birds.forEach(function (b) { spawnBird(b, true); }); });
    if (RW.ST) RW.ST.addEventListener('refresh', remeasure);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(remeasure);
    H.measure = measure; H.state = st; H.S = S;
  }, { motion: true });
}());
