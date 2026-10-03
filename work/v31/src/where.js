/* WHERE: "Where a roof lets water in." (owner: where team)
   Survey-marker scroll tour over the house drawing.
   - pinned (min-width:1000px and min-height:800px): the stage pins and the marker travels pin to pin with scroll.
   - flow (smaller or shorter screens): the plate is sticky, each list row crossing the reading line moves the marker.
   - pins and rows are clickable (scroll to that stop); rows become real buttons only while the tour runs.
   - reload at depth / resize while pinned: onRefresh re-applies the scroll progress (handover 7, QC-1).
   - reduced motion / data-motion="off" / no JS: nothing runs; CSS shows all six parts highlighted, no marker.
   Variants (?v=1..6, default 1) only change the immersive layer on top of the same tour engine. */
(function () {
  'use strict';
  var RW = window.RW;

  RW.add('where-variant', function () {
    var sec = RW.$('#where'); if (!sec) return;
    RW.variant(sec, 'wv', ['2', '3', '6'], ['Follow the water', 'Rain and loupe', 'Camera zoom']);
  });

  RW.add('where-tour', function () {
    var gsap = RW.gsap, ST = RW.ST, d = document;
    var sec = RW.$('#where'); if (!sec || !RW.mm) return;
    var V = +sec.getAttribute('data-v') || 1;
    var pinEl = RW.$('.dia-pin', sec), plate = RW.$('.dia-plate', sec), art = RW.$('.dia-art', sec), cam = RW.$('.dia-cam', sec);
    var marker = RW.$('.marker', sec), list = RW.$('.dia-list', sec), svg = RW.$('svg.dg', sec);
    var pins = RW.$$('.pin', art), items = RW.$$('.dia-list > li', sec), parts = RW.$$('.dg [data-part]', art);
    var tag = RW.$('.m-tag', marker), shadow = RW.$('.m-sh', marker);
    var N = pins.length;
    if (!pinEl || !art || !marker || !svg || N < 2 || N !== items.length) return;
    var names = items.map(function (li) { var b = RW.$('b', li); return b ? b.firstChild.textContent.trim() : ''; });
    var pct = pins.map(function (p) { return { x: parseFloat(p.style.left) / 100, y: parseFloat(p.style.top) / 100 }; });
    var vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    var aw = 1, ah = 1;
    function measure() { aw = art.clientWidth || 1; ah = art.clientHeight || 1; }
    function pos(i) { return { x: pct[i].x * aw, y: pct[i].y * ah }; }
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function smooth(a, b, t) { t = RW.clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
    measure();

    /* rows become buttons while the tour runs (so they are never dead controls with motion off, QC-5) */
    var rows = items.map(function (li) {
      var b = d.createElement('button'); b.type = 'button'; b.className = 'dia-row';
      while (li.firstChild) b.appendChild(li.firstChild);
      li.appendChild(b); return b;
    });

    /* only animate decorative loops while the section is near the viewport */
    var near = false;
    RW.onView(sec, { margin: '200px 0px 200px 0px',
      enter: function () { near = true; sec.classList.add('is-near'); if (fx.wake) fx.wake(); },
      leave: function () { near = false; sec.classList.remove('is-near'); } });

    var camZ = 1;
    function setMarker(x, y, s, lift) {
      marker.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + (s / camZ).toFixed(3) + ')';
      if (shadow) shadow.style.setProperty('--sh', (1 - 0.35 * lift).toFixed(3));
    }

    var cur = -1, lock = null;
    function paint(i, locked) {
      if (i !== cur) {
        cur = i;
        pins.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
        items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); });
        rows.forEach(function (r, k) { if (k === i) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current'); });
        parts.forEach(function (g) { g.classList.toggle('is-on', +g.getAttribute('data-part') === i + 1); });
        if (tag) tag.textContent = names[i];
        marker.classList.toggle('flip', pct[i].x > 0.6);
        if (fx.paint) fx.paint(i);
      }
      if (locked !== lock) {
        lock = locked; marker.classList.toggle('is-lock', !!locked);
        if (fx.lockChange) fx.lockChange(i, !!locked);
      }
    }

    /* ======================= variant layers ======================= */
    var fx = {};
    var FX = {};

    /* V1: a drop falls from the marker and splashes at each stop */
    FX[1] = function () {
      var drop = RW.$('.m-drop', marker), ring = RW.$('.m-splash', marker);
      var ring2 = ring.cloneNode(); ring2.style.borderWidth = '1px'; marker.appendChild(ring2);
      var tl = null;
      return {
        lockChange: function (i, locked) {
          if (!locked || !near) return;
          if (tl) tl.kill();
          tl = gsap.timeline()
            .fromTo(drop, { y: 0, opacity: 0, scaleY: 1 }, { opacity: 0.95, duration: 0.08, ease: 'none' }, 0.05)
            .to(drop, { y: 44, scaleY: 1.25, duration: 0.38, ease: 'power2.in' }, 0.05)
            .to(drop, { opacity: 0, duration: 0.06, ease: 'none' }, 0.41)
            .fromTo(ring, { scale: 0.45, opacity: 0.9 }, { scale: 1.45, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.42)
            .fromTo(ring2, { scale: 0.4, opacity: 0.6 }, { scale: 1.05, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.52);
        },
        destroy: function () { if (tl) tl.kill(); gsap.set([drop, ring], { clearProps: 'all' }); ring2.remove(); }
      };
    };

    /* V2: follow the water: from the active spot a path draws down into the house and leaves a damp patch */
    FX[2] = function () {
      var gs = RW.$$('.dg-w', art).sort(function (a, b) { return a.getAttribute('data-w') - b.getAttribute('data-w'); });
      var paths = gs.map(function (g) { return RW.$('.dg-wpath', g); });
      var stains = gs.map(function (g) { return RW.$('.dg-stain', g); });
      var last = -1;
      function set(k, h) {
        var dr = smooth(0.05, 0.7, h), st = smooth(0.62, 1, h);
        paths[k].style.strokeDashoffset = (1 - dr).toFixed(4);
        stains[k].style.opacity = st.toFixed(3);
        stains[k].style.transform = 'scale(' + (0.6 + 0.4 * st).toFixed(3) + ')';
      }
      return {
        paint: function (i) {
          gs.forEach(function (g, k) { g.classList.toggle('is-on', k === i); g.classList.toggle('is-past', k < i); if (k < i) set(k, 1); });
        },
        frame: function (s) {
          var h = s.holdT == null ? 1 : s.holdT;
          if (s.i !== last || h >= 0) { set(s.i, h); last = s.i; }
        },
        destroy: function () { gs.forEach(function (g, k) { g.classList.remove('is-on', 'is-past'); paths[k].style.strokeDashoffset = ''; stains[k].style.opacity = ''; stains[k].style.transform = ''; }); }
      };
    };

    /* V3: light rain across the plate (canvas, 12 streaks) + a loupe that follows the marker */
    FX[3] = function () {
      var cv = d.createElement('canvas'); cv.className = 'dia-rain'; cv.setAttribute('aria-hidden', 'true');
      plate.appendChild(cv);
      var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
      function size() { W = plate.clientWidth; H = plate.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size();
      var ro = new ResizeObserver(size); ro.observe(plate);
      var drops = [], splashes = [], SLANT = 0.22;
      function seed(dr, top) {
        dr.x = Math.random() * (W + 60) - 20; dr.y = top ? Math.random() * H : -30 - Math.random() * 60;
        dr.len = 12 + Math.random() * 14; dr.v = 380 + Math.random() * 260; dr.a = 0.16 + Math.random() * 0.16;
        dr.floor = H * (0.45 + Math.random() * 0.5);
      }
      for (var i = 0; i < 12; i++) { var o = {}; seed(o, true); drops.push(o); }
      var stop = RW.tick(function (t, dt) {
        if (!near || d.hidden) return;
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
        for (var i = 0; i < drops.length; i++) {
          var r = drops[i];
          r.y += r.v * dt; r.x -= r.v * dt * SLANT;
          if (r.y > r.floor) { if (splashes.length < 6) splashes.push({ x: r.x, y: r.floor, t: 0 }); seed(r, false); continue; }
          ctx.strokeStyle = 'rgba(79,118,134,' + r.a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.len * SLANT, r.y - r.len); ctx.stroke();
        }
        for (var j = splashes.length - 1; j >= 0; j--) {
          var s = splashes[j]; s.t += dt;
          if (s.t > 0.32) { splashes.splice(j, 1); continue; }
          var q = s.t / 0.32;
          ctx.strokeStyle = 'rgba(79,118,134,' + (0.35 * (1 - q)).toFixed(3) + ')';
          ctx.beginPath(); ctx.ellipse(s.x, s.y, 2 + 7 * q, 1 + 2.2 * q, 0, Math.PI, 2 * Math.PI); ctx.stroke();
        }
      });
      /* loupe: an <svg> that re-uses the drawing (<use>) with a zoomed viewBox centred on the marker */
      var NS = 'http://www.w3.org/2000/svg';
      var lp = d.createElement('div'); lp.className = 'dia-loupe'; lp.setAttribute('aria-hidden', 'true');
      var ls = d.createElementNS(NS, 'svg'); ls.setAttribute('focusable', 'false'); ls.setAttribute('class', 'dg');
      var use = d.createElementNS(NS, 'use'); use.setAttribute('href', '#dg-root'); ls.appendChild(use); lp.appendChild(ls);
      var hd = d.createElement('i'); hd.className = 'dia-loupe-h';
      art.appendChild(hd); art.appendChild(lp);
      var Z = 2.6, lx = null, ly = null, lastVB = '';
      return {
        frame: function (s) {
          var L = RW.clamp(aw * 0.26, 104, 170); lp.style.setProperty('--lz', L + 'px');
          var side = pct[s.i].x > 0.55 ? -1 : 1;
          var tx = s.x + side * (L * 0.62 + 26), ty = s.y - L * 0.55;
          tx = RW.clamp(tx, L / 2 + 4, aw - L / 2 - 4); ty = RW.clamp(ty, L / 2 + 4, ah - L / 2 - 4);
          if (lx === null || s.instant) { lx = tx; ly = ty; } else { lx += (tx - lx) * 0.18; ly += (ty - ly) * 0.18; }
          lp.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';
          /* handle points from the rim toward the marker */
          var ang = Math.atan2(s.y - ly, s.x - lx), rx = lx + Math.cos(ang) * L / 2, ry = ly + Math.sin(ang) * L / 2;
          var len = Math.max(0, Math.min(34, Math.hypot(s.x - rx, s.y - ry) - 16));
          hd.style.width = '34px';
          hd.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + (ry - 3.5).toFixed(1) + 'px,0) rotate(' + (ang * 180 / Math.PI).toFixed(1) + 'deg) scaleX(' + (len / 34).toFixed(3) + ')';
          var w = (L / Z) / aw * vb[2], h = (L / Z) / ah * vb[3];
          var cx = vb[0] + s.x / aw * vb[2], cy = vb[1] + s.y / ah * vb[3];
          var v = (cx - w / 2).toFixed(1) + ' ' + (cy - h / 2).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1);
          if (v !== lastVB) { ls.setAttribute('viewBox', v); lastVB = v; }
        },
        paint: function (i) { RW.$$('.dg-w', art).forEach(function (g) { g.classList.toggle('is-on', +g.getAttribute('data-w') === i + 1); }); },
        destroy: function () { stop(); ro.disconnect(); cv.remove(); lp.remove(); hd.remove(); RW.$$('.dg-w', art).forEach(function (g) { g.classList.remove('is-on'); }); }
      };
    };

    /* V4: section lens: when the marker locks, a small cut-through drawing of that spot opens beside it */
    FX[4] = function () {
      var lens = RW.$('.dia-lens', art), sx = RW.$$('.sx', lens), capB = RW.$('.dia-lens-cap b', lens);
      function place(i) {
        var p = pos(i), lw = lens.offsetWidth, lh = lens.offsetHeight, right = pct[i].x < 0.55;
        var x = right ? p.x + 34 : p.x - 34 - lw, y = RW.clamp(p.y - lh * 0.42, 4, ah - lh - 4);
        x = RW.clamp(x, 4, aw - lw - 4);
        lens.style.setProperty('--lx', x.toFixed(1) + 'px'); lens.style.setProperty('--ly', y.toFixed(1) + 'px');
        lens.style.setProperty('--lo', (right ? '0' : '100%') + ' ' + RW.clamp((p.y - y) / lh * 100, 0, 100).toFixed(0) + '%');
      }
      return {
        paint: function (i) { sx.forEach(function (g) { g.classList.toggle('is-on', +g.getAttribute('data-s') === i + 1); }); if (capB) capB.textContent = names[i].toLowerCase(); },
        lockChange: function (i, locked) { if (locked) place(i); lens.classList.toggle('is-open', locked); },
        resize: function () { if (cur > -1) place(cur); },
        destroy: function () { lens.classList.remove('is-open'); sx.forEach(function (g) { g.classList.remove('is-on'); }); }
      };
    };

    /* V5: x-ray: a soft radial mask shows the timbers and underlay under the covering, around the marker
       (and around the pointer on a fine pointer, reveal-hover-effect skill: eased 0.1 / radius 0.14) */
    FX[5] = function () {
      var xr = RW.$('.dia-xray', art);
      var ring = d.createElement('i'); ring.className = 'dia-xring'; ring.setAttribute('aria-hidden', 'true'); cam.appendChild(ring);
      var lab = d.createElement('span'); lab.className = 'dia-xlabel'; lab.setAttribute('aria-hidden', 'true'); lab.textContent = 'Under the covering'; art.appendChild(lab);
      var st = { x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0, hover: false, mx: 0, my: 0 }, m = { x: 0, y: 0, locked: true };
      function radius() { return RW.clamp(aw * 0.15, 56, 118); }
      function onMove(e) { var r = art.getBoundingClientRect(); st.hover = true; st.mx = e.clientX - r.left; st.my = e.clientY - r.top; }
      function onLeave() { st.hover = false; }
      if (RW.fine) { art.addEventListener('pointermove', onMove); art.addEventListener('pointerleave', onLeave); }
      var stop = RW.tick(function () {
        if (!near) return;
        st.tx = st.hover ? st.mx : m.x; st.ty = st.hover ? st.my : m.y;
        st.tr = radius() * (st.hover ? 1.15 : (m.locked ? 1 : 0.72));
        st.x += (st.tx - st.x) * 0.1; st.y += (st.ty - st.y) * 0.1; st.r += (st.tr - st.r) * 0.14;
        xr.style.setProperty('--xx', st.x.toFixed(1) + 'px'); xr.style.setProperty('--xy', st.y.toFixed(1) + 'px'); xr.style.setProperty('--xr', st.r.toFixed(1) + 'px');
        ring.style.setProperty('--xr', st.r.toFixed(1) + 'px');
        ring.style.transform = 'translate3d(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px,0)';
      });
      return {
        frame: function (s) { m.x = s.x; m.y = s.y; m.locked = s.locked; if (s.instant) { st.x = s.x; st.y = s.y; } },
        destroy: function () { stop(); art.removeEventListener('pointermove', onMove); art.removeEventListener('pointerleave', onLeave); ring.remove(); lab.remove(); xr.style.cssText = ''; }
      };
    };

    /* V6: camera: the drawing zooms and pans to follow the marker inside the plate; overview at start and end */
    FX[6] = function () {
      var NS = 'http://www.w3.org/2000/svg';
      var mini = d.createElement('div'); mini.className = 'dia-mini'; mini.setAttribute('aria-hidden', 'true');
      var ms = d.createElementNS(NS, 'svg'); ms.setAttribute('viewBox', vb.join(' ')); ms.setAttribute('class', 'dg'); ms.setAttribute('focusable', 'false');
      var mu = d.createElementNS(NS, 'use'); mu.setAttribute('href', '#dg-root'); ms.appendChild(mu); mini.appendChild(ms);
      var box = d.createElement('i'); mini.appendChild(box); art.appendChild(mini);
      var lastZ = -1, moving = false;
      return {
        frame: function (s) {
          var ZL = aw < 520 ? 1.55 : 1.8, Z;
          if (s.flow) Z = s.locked ? ZL : ZL - (ZL - 1.3) * Math.sin(Math.PI * (s.f || 0));
          else {
            Z = s.locked ? ZL : ZL - (ZL - 1.3) * Math.sin(Math.PI * s.f);
            if (s.locked && s.i === 0) Z = 1 + (ZL - 1) * smooth(0, 0.45, s.holdT);
            if (s.locked && s.i === N - 1) Z = ZL - (ZL - 1) * smooth(0.5, 1, s.holdT);
          }
          var tx = RW.clamp(aw / 2 - s.x * Z, aw - aw * Z, 0), ty = RW.clamp(ah / 2 - s.y * Z, ah - ah * Z, 0);
          cam.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + Z.toFixed(4) + ')';
          var mv = !s.locked; if (mv !== moving) { moving = mv; cam.style.willChange = mv ? 'transform' : 'auto'; }
          if (Math.abs(Z - lastZ) > 0.002) {
            lastZ = Z; camZ = Z;
            pins.forEach(function (p) { p.style.scale = (1 / Z).toFixed(4); });
            setMarker(s.x, s.y, 1 + 0.22 * (s.lift || 0), s.lift || 0);
          }
          var mw = mini.clientWidth, mh = mini.clientHeight;
          box.style.width = mw + 'px'; box.style.height = mh + 'px';
          box.style.transform = 'translate(' + (-tx / Z / aw * mw).toFixed(1) + 'px,' + (-ty / Z / ah * mh).toFixed(1) + 'px) scale(' + (1 / Z).toFixed(4) + ')';
        },
        destroy: function () { cam.style.transform = ''; cam.style.willChange = ''; pins.forEach(function (p) { p.style.scale = ''; }); camZ = 1; mini.remove(); }
      };
    };

    /* ======================= tour engine ======================= */
    RW.mm.add({ pinned: '(min-width:1000px) and (min-height:800px)', flow: '(max-width:999px), (max-height:799px)' }, function (ctx) {
      var pinned = ctx.conditions.pinned, cleanups = [];
      sec.classList.add('is-touring'); sec.classList.toggle('is-flow', !pinned);
      measure();
      fx = FX[V] ? (FX[V]() || {}) : {};
      cur = -1; lock = null;

      var HOLD = V === 2 ? 1.5 : 1, FL = V === 6 ? 1.1 : 0.9, CYC = HOLD + FL, TOTAL = N * HOLD + (N - 1) * FL;
      var LEN = V === 2 ? 3.1 : 2.5;
      var render, tl = null;

      function on(el, ev, f) { el.addEventListener(ev, f); cleanups.push(function () { el.removeEventListener(ev, f); }); }

      if (pinned) {
        var proxy = { p: 0 };
        render = function (instant) {
          var p = proxy.p, t = RW.clamp(p, 0, 1) * TOTAL, i = Math.min(N - 1, Math.floor(t / CYC)), c = t - i * CYC, s;
          if (i === N - 1 || c <= HOLD) { var a = pos(i); s = { i: i, from: i, to: i, f: 0, locked: true, holdT: RW.clamp(c / HOLD, 0, 1), x: a.x, y: a.y }; }
          else {
            var f = (c - HOLD) / FL, e = ease(f), a2 = pos(i), b2 = pos(i + 1), ni = f > 0.6 ? i + 1 : i;
            s = { i: ni, from: i, to: i + 1, f: f, locked: false, holdT: ni === i ? 1 : 0, x: a2.x + (b2.x - a2.x) * e, y: a2.y + (b2.y - a2.y) * e };
          }
          s.p = p; s.lift = s.locked ? 0 : Math.sin(Math.PI * s.f); s.instant = !!instant;
          paint(s.i, s.locked);
          setMarker(s.x, s.y, 1 + 0.22 * s.lift, s.lift);
          list.style.setProperty('--rail', ((s.from + (s.locked ? 0 : ease(s.f))) / (N - 1)).toFixed(4));
          if (fx.frame) fx.frame(s);
        };
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinEl,
            start: function () { return pinEl.offsetHeight > window.innerHeight - 150 ? 'top top+=72' : 'center center'; },
            end: function () { return '+=' + Math.round(window.innerHeight * LEN); },
            pin: true, anticipatePin: 1, scrub: 0.6, invalidateOnRefresh: true,
            /* reload at depth and resize while pinned: write the state from the restored progress (QC-1) */
            onRefresh: function (self) { measure(); tl.progress(self.progress); render(true); if (fx.resize) fx.resize(); }
          }
        });
        tl.to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: function () { render(false); } });
        render(true);
        var go = function (k) {
          var st = tl.scrollTrigger; if (!st) return;
          RW.scrollTo(st.start + ((k * CYC + HOLD * 0.5) / TOTAL) * (st.end - st.start), { duration: 1.1 });
        };
        pins.forEach(function (p, k) { on(p, 'click', function () { go(k); }); });
        rows.forEach(function (r, k) { on(r, 'click', function () { go(k); }); });
      } else {
        /* flow: rows crossing the reading line (62% of the viewport) move the marker */
        var mpos = { x: pos(0).x, y: pos(0).y, lift: 0, h: 1 }, flowI = -1, mtl = null;
        var flowFrame = function (instant) {
          setMarker(mpos.x, mpos.y, 1 + 0.2 * mpos.lift, mpos.lift);
          if (fx.frame) fx.frame({ i: cur, x: mpos.x, y: mpos.y, locked: !!lock, flow: true, holdT: mpos.h, f: mpos.f || 0, lift: mpos.lift, instant: !!instant });
        };
        var moveTo = function (k, instant) {
          if (k === flowI && !instant) return;
          flowI = k; var b = pos(k);
          if (mtl) mtl.kill();
          list.style.setProperty('--rail', (k / (N - 1)).toFixed(4));
          if (instant) { mpos.x = b.x; mpos.y = b.y; mpos.lift = 0; mpos.h = 1; mpos.f = 0; paint(k, true); flowFrame(true); return; }
          paint(k, false); mpos.h = 0; mpos.f = 0;
          mtl = gsap.timeline({ onUpdate: flowFrame })
            .to(mpos, { x: b.x, y: b.y, f: 1, duration: 0.85, ease: 'power2.inOut' }, 0)
            .to(mpos, { lift: 1, duration: 0.42, ease: 'sine.out' }, 0)
            .to(mpos, { lift: 0, duration: 0.43, ease: 'sine.in' }, 0.42)
            .call(function () { mpos.f = 0; paint(k, true); }, null, 0.85)
            .to(mpos, { h: 1, duration: 1.5, ease: 'none' }, 0.85);
        };
        var sts = items.map(function (li, k) {
          return ST.create({ trigger: li, start: 'top 62%', end: 'bottom 62%', onToggle: function (self) { if (self.isActive) moveTo(k); } });
        });
        var syncFlow = function () {
          measure();
          var k = -1; sts.forEach(function (s, j) { if (s.isActive) k = j; });
          if (k < 0) k = window.scrollY > (sts[N - 1].start || 0) ? N - 1 : 0;
          if (sts[0] && window.scrollY < sts[0].start) k = 0;
          moveTo(k, true);
          if (fx.resize) fx.resize();
        };
        ST.addEventListener('refresh', syncFlow);
        cleanups.push(function () { ST.removeEventListener('refresh', syncFlow); sts.forEach(function (s) { s.kill(); }); if (mtl) mtl.kill(); });
        moveTo(0, true);
        render = function () { moveTo(flowI < 0 ? 0 : flowI, true); };
        /* tap a pin or a row: bring that row to the reading line (only ever in response to a tap) */
        var goRow = function (k) {
          var y = items[k].getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.62 + 14;
          moveTo(k); RW.scrollTo(Math.max(0, y), { duration: 0.9 });
        };
        pins.forEach(function (p, k) { on(p, 'click', function () { goRow(k); }); });
        rows.forEach(function (r, k) { on(r, 'click', function () { goRow(k); }); });
      }

      /* resizing the art (container queries, font load) re-places marker, pins and loupe */
      var ro = new ResizeObserver(function () { var w = aw; measure(); if (Math.abs(w - aw) > 0.5) { render(true); if (fx.resize) fx.resize(); } });
      ro.observe(art);
      cleanups.push(function () { ro.disconnect(); });

      return function () {
        cleanups.forEach(function (f) { f(); });
        if (fx.destroy) fx.destroy(); fx = {};
        sec.classList.remove('is-touring', 'is-flow');
        pins.forEach(function (p) { p.classList.remove('is-on'); }); items.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
        rows.forEach(function (r) { r.removeAttribute('aria-current'); });
        parts.forEach(function (g) { g.classList.remove('is-on'); });
        marker.style.transform = ''; marker.classList.remove('is-lock', 'flip');
        list.style.removeProperty('--rail');
        cur = -1; lock = null;
      };
    });
  }, { motion: true });
}());
