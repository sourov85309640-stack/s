/* CURSOR (owner: lead). Fine pointers only, never under reduced motion or data-motion="off"; the system cursor stays visible.
   1. A follower (dot + ring) that changes with what it is over:
        links and buttons  -> four survey brackets close on the control's corners
        headings           -> a small spirit level whose bubble follows the pointer along the line
        photos             -> a loupe with "View" or "Look"
        review cards       -> "Drag"          3D roof -> "Tilt"          leak diagram -> crosshair
        form fields        -> steps aside
   2. A trail that is different in every section (pointer-trail-emitter: emitted by distance, not by time):
        tile chips, leaves, rain with ripples, dust, wood shavings, chalk dashes, survey rings, contour ripples, warm sparks ...
   One canvas, one shared ticker (RW.tick), sleeps when nothing is moving. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  /* Design options: ?cur=soft (default: a short fading line and the odd themed piece on fast moves)
     | full (busier themed trails) | ring (follower, no trail) | off */
  var MODE = 'soft';
  try { var mc = /[?&]cur=(soft|full|ring|off)\b/.exec(location.search); if (mc) MODE = mc[1]; } catch (e) {}
  if (RW.motionOK && RW.fine) RW.options.push({ id: 'cursor', param: 'cur', allowed: ['soft', 'full', 'ring', 'off'], names: ['Soft trail', 'Busier themed trails', 'Cursor only', 'No cursor effects'], current: MODE, label: 'Cursor' });
  RW.add('cursor', function () {
    if (!RW.fine || MODE === 'off') return;
    var root = d.documentElement;
    root.classList.add('has-cursor');

    /* ---------- follower ---------- */
    var c = d.createElement('div');
    c.className = 'cur'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cur-ring"></span><span class="cur-dot"></span><span class="cur-lab"></span>' +
      '<span class="cur-b cur-b1"></span><span class="cur-b cur-b2"></span><span class="cur-b cur-b3"></span><span class="cur-b cur-b4"></span>' +
      '<span class="cur-level"><i></i></span><span class="cur-x"></span>';
    d.body.appendChild(c);
    var ring = c.querySelector('.cur-ring'), dot = c.querySelector('.cur-dot'), lab = c.querySelector('.cur-lab'),
      level = c.querySelector('.cur-level'), bub = level.querySelector('i'), cross = c.querySelector('.cur-x'),
      br = RW.$$('.cur-b', c);
    var px = -100, py = -100, rx = -100, ry = -100, dx = -100, dy = -100, seen = false, state = 'idle', tgt = null, lastMove = 0;
    var B = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], BT = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];

    var RULES = [
      ['input,textarea,select,[contenteditable]', 'text'],
      ['.rv-vp', 'drag', 'Drag'],
      ['.xv-stage,#xv', 'tilt', 'Tilt'],
      ['.dia-art', 'cross'],
      ['.wk-btn', 'look', 'View'],
      ['a,button,[role="button"],summary,label[for],[role="radio"],[role="tab"]', 'frame'],
      ['.cw,.hero-plate,.prj-media,.chk-photo,figure,img', 'look', 'Look'],
      ['h1,h2', 'level']
    ];
    function classify(el) {
      if (!el || !el.closest) return ['idle'];
      if (el.closest('.cur,.rwopt')) return ['idle'];
      for (var i = 0; i < RULES.length; i++) { var m = el.closest(RULES[i][0]); if (m) return [RULES[i][1], RULES[i][2] || '', m]; }
      return ['idle'];
    }
    function setState(s, label, el) {
      tgt = el || null;
      if (s === state && (label || '') === lab.textContent) return;
      state = s; c.setAttribute('data-s', s);
      lab.innerHTML = label ? '<b>' + label + '</b>' : '';
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; lastMove = performance.now();
      if (!seen) { seen = true; rx = dx = px; ry = dy = py; c.classList.add('is-on'); }
      emit(px, py);
    }, { passive: true });
    d.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; var r = classify(e.target); setState(r[0], r[1], r[2]); }, { passive: true });
    d.addEventListener('pointerleave', function () { c.classList.remove('is-on'); seen = false; });
    d.addEventListener('pointerdown', function () { c.classList.add('is-down'); });
    d.addEventListener('pointerup', function () { c.classList.remove('is-down'); });
    window.addEventListener('blur', function () { c.classList.remove('is-on'); seen = false; });

    /* ---------- trail ---------- */
    var cv = d.createElement('canvas'), ctx = cv.getContext('2d');
    cv.className = 'cur-trail'; cv.setAttribute('aria-hidden', 'true');
    d.body.appendChild(cv);
    var DPR = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
    function size() { W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
    size(); window.addEventListener('resize', size);
    var KIND = { top: 'breeze', reviews: 'stars', services: 'chips', problems: 'leaves', where: 'rain', decide: 'dust', whole: 'shavings',
      about: 'smoke', work: 'glint', projects: 'stones', how: 'chalk', checks: 'scan', areas: 'ripple', faq: '', urgent: 'drops', contact: 'sparks', trust: 'chips',
      accred: '', types: 'stones', quiz: 'sparks', team: 'stars', before: 'drops', sectors: 'breeze', survey: 'scan', care: 'leaves', advice: 'dust' };
    var STEP = { breeze: 26, stars: 30, chips: 34, leaves: 40, rain: 22, dust: 14, shavings: 26, smoke: 30, glint: 36, stones: 30, chalk: 12, scan: 70, ripple: 64, drops: 24, sparks: 16 };
    var secs = RW.$$('main > section[id]'), secTops = [];
    function measure() { var sy = window.pageYOffset; secTops = secs.map(function (s) { var r = s.getBoundingClientRect(); return { id: s.id, t: r.top + sy, b: r.bottom + sy }; }); }
    measure(); window.addEventListener('resize', measure); window.addEventListener('load', function () { setTimeout(measure, 200); });
    if (RW.ST) RW.ST.addEventListener('refresh', measure);
    function secId(y) {
      var Y = y + window.pageYOffset;
      for (var i = 0; i < secTops.length; i++) if (Y >= secTops[i].t && Y < secTops[i].b) return secTops[i].id;
      return '';
    }
    function kindAt(y) {
      var Y = y + window.pageYOffset;
      for (var i = 0; i < secTops.length; i++) if (Y >= secTops[i].t && Y < secTops[i].b) return KIND[secTops[i].id] || '';
      return '';
    }
    var P = [], MAX = 70, acc = 0, lx = null, ly = null;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function spawn(k, x, y, vx, vy) {
      if (P.length >= MAX) P.shift();
      var p = { k: k, x: x, y: y, vx: vx, vy: vy, a: 0, life: 0, max: 1, r: 0, rot: rnd(0, 6.28), vr: rnd(-4, 4), s: rnd(.7, 1.2) };
      switch (k) {
        case 'breeze': p.max = rnd(.8, 1.3); p.vx = vx * .3 + rnd(10, 40); p.vy = rnd(-20, 10); break;
        case 'stars': p.max = rnd(.6, 1); p.vy = rnd(-30, -10); p.vx = rnd(-15, 15); break;
        case 'chips': p.max = rnd(.8, 1.2); p.vx = vx * .2 + rnd(-30, 30); p.vy = rnd(-60, -20); break;
        case 'leaves': p.max = rnd(1.2, 1.8); p.vx = vx * .25 + rnd(-20, 20); p.vy = rnd(10, 30); break;
        case 'rain': p.max = rnd(.5, .8); p.vx = -30; p.vy = rnd(260, 360); break;
        case 'dust': p.max = rnd(1, 1.8); p.vx = vx * .15 + rnd(-12, 12); p.vy = rnd(-14, 4); p.r = rnd(1, 2.2); break;
        case 'shavings': p.max = rnd(.8, 1.2); p.vx = rnd(-50, 50); p.vy = rnd(-50, -10); break;
        case 'smoke': p.max = rnd(1.2, 1.8); p.vx = rnd(-8, 8); p.vy = rnd(-30, -16); p.r = rnd(4, 7); break;
        case 'glint': p.max = .55; p.vx = 0; p.vy = 0; break;
        case 'stones': p.max = rnd(.8, 1.1); p.vx = rnd(-40, 40); p.vy = rnd(-70, -30); break;
        case 'chalk': p.max = 1.1; p.vx = 0; p.vy = 0; break;
        case 'scan': p.max = 1; p.vx = 0; p.vy = 0; break;
        case 'ripple': p.max = 1.4; p.vx = 0; p.vy = 0; break;
        case 'drops': p.max = rnd(.6, .9); p.vx = vx * .1; p.vy = rnd(40, 80); break;
        case 'sparks': p.max = rnd(.5, .9); p.vx = vx * .2 + rnd(-30, 30); p.vy = rnd(-50, -15); p.r = rnd(1, 2); break;
      }
      P.push(p);
    }
    var lastT = 0, RIB = [], lastAccent = 0, ribCol = '152,86,50';
    var TINT = { where: '74,104,122', before: '74,104,122', urgent: '74,104,122', reviews: '214,160,40', team: '214,160,40', care: '122,140,70', problems: '122,140,70', how: '62,111,163', whole: '62,111,163', checks: '62,111,163' };
    function emit(x, y) {
      if (MODE === 'soft') {
        if (state === 'text') { RIB.length = 0; return; }
        var now2 = performance.now();
        RIB.push({ x: x, y: y, t: now2 });
        if (RIB.length > 24) RIB.shift();
        var k2 = kindAt(y), id = secId(y); ribCol = TINT[id] || '152,86,50';
        if (k2 && RIB.length > 1) {                      /* the odd themed piece, only on a quick flick */
          var a2 = RIB[RIB.length - 2], sp = Math.hypot(x - a2.x, y - a2.y) / Math.max(8, now2 - a2.t) * 1000;
          if (sp > 1100 && now2 - lastAccent > 180) { lastAccent = now2; spawn(k2, x, y, (x - a2.x) * 6, (y - a2.y) * 6); P[P.length - 1].soft = true; }
        }
        return;
      }
      if (MODE !== 'full') return;
      var k = kindAt(y); if (!k || state === 'text') { lx = x; ly = y; return; }
      if (lx === null) { lx = x; ly = y; return; }
      var ddx = x - lx, ddy = y - ly, dist = Math.sqrt(ddx * ddx + ddy * ddy), step = STEP[k] || 30;
      var now = performance.now(), dt = Math.max(16, now - lastT) / 1000; lastT = now;
      acc += dist;
      while (acc >= step) {
        acc -= step;
        var f = 1 - acc / Math.max(dist, 1);
        spawn(k, lx + ddx * f, ly + ddy * f, ddx / dt, ddy / dt);
      }
      lx = x; ly = y;
    }
    var TILE = ['#D9A383', '#C98B62', '#B9774E'], STONE = ['#B8B2A4', '#A49E91', '#CFC8B8'];
    function draw(p, t) {
      var a = 1 - t, k = p.k;
      ctx.save(); ctx.translate(p.x, p.y);
      if (p.soft) { a *= 0.55; ctx.scale(0.75, 0.75); }
      switch (k) {
        case 'breeze': case 'leaves':
          ctx.rotate(p.rot); ctx.scale(Math.cos(p.rot * 2) * p.s, p.s);
          ctx.globalAlpha = a * .8; ctx.fillStyle = k === 'leaves' ? '#C98B62' : '#DDA783';
          ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, 6.28); ctx.fill(); break;
        case 'stars':
          ctx.globalAlpha = a; ctx.fillStyle = '#FBBC04'; ctx.rotate(p.rot * .3);
          var r = 4 * p.s; ctx.beginPath();
          for (var i = 0; i < 8; i++) { var rr = i % 2 ? r * .4 : r, an = i * Math.PI / 4; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
          ctx.closePath(); ctx.fill(); break;
        case 'chips': case 'stones': case 'shavings':
          ctx.rotate(p.rot); ctx.globalAlpha = a * .9;
          ctx.fillStyle = k === 'chips' ? TILE[(p.s * 10 | 0) % 3] : (k === 'stones' ? STONE[(p.s * 10 | 0) % 3] : '#D8BC92');
          if (k === 'shavings') { ctx.beginPath(); ctx.ellipse(0, 0, 6 * p.s, 1.4, 0, 0, 6.28); ctx.fill(); }
          else { ctx.fillRect(-3.5 * p.s, -2.2 * p.s, 7 * p.s, 4.4 * p.s); }
          break;
        case 'rain':
          ctx.globalAlpha = a * .55; ctx.strokeStyle = '#4A687A'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2, 9); ctx.stroke(); break;
        case 'dust': case 'sparks':
          ctx.globalAlpha = a * (k === 'sparks' ? .9 : .6); ctx.fillStyle = k === 'sparks' ? '#E7A15E' : '#B28056';
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.28); ctx.fill(); break;
        case 'smoke':
          ctx.globalAlpha = a * .35; ctx.fillStyle = '#C9C6BF';
          ctx.beginPath(); ctx.arc(0, 0, p.r * (1 + t * 1.6), 0, 6.28); ctx.fill(); break;
        case 'glint':
          ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          var g = 3 + t * 6; ctx.beginPath(); ctx.moveTo(-g, 0); ctx.lineTo(g, 0); ctx.moveTo(0, -g); ctx.lineTo(0, g); ctx.stroke(); break;
        case 'chalk':
          ctx.globalAlpha = a * .7; ctx.fillStyle = '#985632'; ctx.fillRect(-2, -1, 4, 2); break;
        case 'scan': case 'ripple':
          ctx.globalAlpha = a * (k === 'scan' ? .55 : .4); ctx.strokeStyle = k === 'scan' ? '#985632' : '#7FA3B6'; ctx.lineWidth = 1.2;
          if (k === 'scan') ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.arc(0, 0, 4 + t * (k === 'scan' ? 26 : 38), 0, 6.28); ctx.stroke(); break;
        case 'drops':
          ctx.globalAlpha = a * .7; ctx.fillStyle = '#6F98AE';
          ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(3, 1, 0, 3); ctx.quadraticCurveTo(-3, 1, 0, -4); ctx.fill(); break;
      }
      ctx.restore();
    }
    var ripples = [], drew = false;
    RW.tick(function (time, dt) {
      /* follower */
      if (seen) {
        var k1 = 1 - Math.pow(0.0001, dt), k2 = 1 - Math.pow(0.02, dt);
        dx += (px - dx) * k1; dy += (py - dy) * k1;
        rx += (px - rx) * k2; ry += (py - ry) * k2;
        dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
        var tx = rx, ty = ry;
        if (state === 'frame' && tgt) {
          var r = tgt.getBoundingClientRect(), pad = 6;
          BT[0].x = r.left - pad; BT[0].y = r.top - pad; BT[1].x = r.right + pad; BT[1].y = r.top - pad;
          BT[2].x = r.right + pad; BT[2].y = r.bottom + pad; BT[3].x = r.left - pad; BT[3].y = r.bottom + pad;
        } else {
          var s = 13; BT[0].x = rx - s; BT[0].y = ry - s; BT[1].x = rx + s; BT[1].y = ry - s; BT[2].x = rx + s; BT[2].y = ry + s; BT[3].x = rx - s; BT[3].y = ry + s;
        }
        for (var i = 0; i < 4; i++) {
          B[i].x += (BT[i].x - B[i].x) * k2 * 1.15; B[i].y += (BT[i].y - B[i].y) * k2 * 1.15;
          br[i].style.transform = 'translate3d(' + B[i].x.toFixed(1) + 'px,' + B[i].y.toFixed(1) + 'px,0)';
        }
        ring.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
        lab.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
        cross.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
        if (state === 'level' && tgt) {
          var hr = tgt.getBoundingClientRect(), u = RW.clamp((px - hr.left) / Math.max(1, hr.width), 0, 1);
          level.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + (ry + 26).toFixed(1) + 'px,0)';
          bub.style.transform = 'translateX(' + ((u - 0.5) * 40).toFixed(1) + 'px)';
        }
      }
      /* trail */
      var nowT = performance.now();
      while (RIB.length && nowT - RIB[0].t > 240) RIB.shift();
      if (!P.length && !RIB.length) { if (drew) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); drew = false; } return; }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); drew = true;
      if (RIB.length > 1) {                                /* soft trail: a short line that thins and fades behind the pointer */
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (var q = 1; q < RIB.length; q++) {
          var age = (nowT - RIB[q].t) / 240, al = (1 - age) * 0.32;
          if (al <= 0) continue;
          ctx.strokeStyle = 'rgba(' + ribCol + ',' + al.toFixed(3) + ')'; ctx.lineWidth = 0.6 + (1 - age) * 1.8;
          ctx.beginPath(); ctx.moveTo(RIB[q - 1].x, RIB[q - 1].y); ctx.lineTo(RIB[q].x, RIB[q].y); ctx.stroke();
        }
      }
      for (var j = P.length - 1; j >= 0; j--) {
        var p = P[j]; p.life += dt;
        var t = p.life / p.max;
        if (t >= 1) { P.splice(j, 1); continue; }
        if (p.k === 'chips' || p.k === 'stones' || p.k === 'shavings') p.vy += 260 * dt;
        else if (p.k === 'leaves' || p.k === 'breeze') { p.vx += Math.sin(p.life * 4 + p.rot) * 30 * dt; p.vy += 10 * dt; }
        else if (p.k === 'drops') p.vy += 500 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        draw(p, t);
      }
    });
  }, { motion: true });
}());
