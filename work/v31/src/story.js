/* THE STORY OF ONE SLATE (owner: lead). One GSAP timeline scrubbed by scroll while the scene is pinned.
   The camera (viewBox) frames the scene for the screen: on desktop the house sits to the right of the caption card,
   on phones the scene sits above the caption. Far and middle layers drift slower than the house (parallax).
   The homeowner and the roofer are jointed rigs. Every joint turns around its own point (neck, shoulder, elbow,
   hip) by writing rotate(angle x y) itself, so no part can come loose whatever the screen or scroll speed.
   Reduced motion / data-motion="off" / no JS: the repaired scene and all five steps as a plain list (CSS). */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('story'); if (s) RW.variant(s, 'stv', ['1', '2'], ['Scroll story', 'Tap through']); }());
  RW.add('story', function () {
    var sec = RW.$('#story'); if (!sec || !RW.ST) return;
    var gsap = RW.gsap, ST = RW.ST, $ = function (s) { return RW.$(s, sec); }, $$ = function (s) { return RW.$$(s, sec); };
    var svg = $('.st-sc'), stage = $('.st-stage'), copy = $('.st-copy'), caps = $$('.st-cap'), dots = $$('.st-steps li');
    var far = $('.st-far'), mid = $('.st-mid');
    sec.classList.add('is-js');
    RW.headings(sec);
    var f1 = function (n) { return Math.round(n * 10) / 10; };

    /* ---------- camera ---------- */
    var base = null, cam = { z: 0, tx: 770, ty: 360, floor: 0 };
    function frame() {
      var r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
      var desk = window.innerWidth >= 1000, aspect = r.width / r.height;
      var f = desk ? (copy.getBoundingClientRect().right - r.left + 24) / r.width : 0;
      var X1 = desk ? 1080 : 1010, X0c = desk ? 190 : 205;
      var Wv = (X1 - X0c) / (1 - f), H = Wv / aspect;
      if (H < 470) { H = 470; Wv = H * aspect; }
      var X0 = X1 - Wv, Y0 = 640 - H;
      base = { x: X0, y: Y0, w: Wv, h: H, f: f };
      svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
      aim();
    }
    function aim() {
      if (!base) return;
      var K = 2.3, w1 = base.w / K, h1 = base.h / K;
      var sx = base.f ? base.f + (1 - base.f) * 0.5 : 0.5;          /* the open part of the screen */
      var x1 = cam.tx - w1 * sx, y1 = cam.ty - h1 * 0.5, e = cam.z;
      /* shots inside the bedroom keep the floor in frame on every screen shape */
      if (cam.floor) y1 = y1 + (Math.max(y1, 616 - h1) - y1) * cam.floor;
      var x = base.x + (x1 - base.x) * e, y = base.y + (y1 - base.y) * e, w = base.w + (w1 - base.w) * e, h = base.h + (h1 - base.h) * e;
      svg.setAttribute('viewBox', f1(x) + ' ' + f1(y) + ' ' + f1(w) + ' ' + f1(h));
      /* parallax: the far layer follows the camera at 55%, the middle layer at 25% */
      var dx = (x + w / 2) - (base.x + base.w / 2), dy = (y + h / 2) - (base.y + base.h / 2);
      far.setAttribute('transform', 'translate(' + f1(dx * 0.55) + ' ' + f1(dy * 0.4) + ')');
      mid.setAttribute('transform', 'translate(' + f1(dx * 0.25) + ' ' + f1(dy * 0.18) + ')');
    }
    frame();
    window.addEventListener('resize', frame);
    ST.addEventListener('refresh', frame);

    /* ---------- rigs ---------- */
    function rigOf(root, pre) {
      var g = function (n) { return RW.$('.' + pre + n, root); };
      return { root: root, flip: g('flip'), legL: g('legL'), legR: g('legR'), upper: g('upper'), head: g('head'), armL: g('armL'), foreL: g('foreL'), armR: g('armR'), foreR: g('foreR') };
    }
    var rot = function (el, a, x, y) { if (el) el.setAttribute('transform', 'rotate(' + f1(a) + ' ' + x + ' ' + y + ')'); };
    var PR = rigOf($('.st-person'), 'st-p-'), RR = rigOf($('.st-roofer'), 'st-r-');
    /* joint angles in degrees; for both people "forward" (the way they face) is a negative turn */
    var P = { x: 575, head: 14, bend: 0, ru: -22, rf: -96, lu: -12, lf: -84, walk: 0, wave: 0 };
    var R = { x: 905, y: 600, face: -1, head: 0, bend: 0, ru: 0, rf: 0, lu: 0, lf: 0, walk: 0, climb: 0, ham: 0, wave: 0, ll: 0, lr: 0 };
    var V = { x: 1300 }, W = { bead: 0, cal: 0, lvl: 0 };
    var bead = $('.st-bead'), water = $('.st-water'), wlen = 0;
    try { wlen = water.getTotalLength(); } catch (e) { wlen = 0; }
    var vanG = $('.st-van'), wF = $('.st-wheel-f'), wB = $('.st-wheel-b');
    var calN = $('.st-cal-n'), calPage = $('.st-cal-page'), bkWater = $('.st-bk-water'), bkRing = $('.st-bk-ring');
    function drawPerson(now) {
      var sw = Math.sin(P.x * 0.3) * 22 * P.walk, aw = Math.sin(P.x * 0.3) * 12 * P.walk;
      var wv = P.wave ? Math.sin(now * 0.012) * 26 * P.wave : 0;
      PR.root.setAttribute('transform', 'translate(' + f1(P.x) + ' 598)');
      rot(PR.legL, sw, -3, -48); rot(PR.legR, -sw, 4, -48);
      rot(PR.upper, P.bend, 0, -48); rot(PR.head, P.head, 0, -88);
      rot(PR.armR, P.ru + aw, 9, -84); rot(PR.foreR, P.rf + wv, 11, -66);
      rot(PR.armL, P.lu - aw, -8, -84); rot(PR.foreL, P.lf, -10, -66);
    }
    function drawRoofer(now) {
      var sw = Math.sin(R.x * 0.3) * 22 * R.walk, ph = (600 - R.y) * 0.09;
      var cl = R.climb, cs = Math.sin(ph) * 26 * cl;
      var hm = R.ham > 0 && R.ham < 1 ? Math.max(0, Math.sin(R.ham * Math.PI * 6)) * 48 : 0;
      var wv = R.wave ? Math.sin(now * 0.012 + 1) * 26 * R.wave : 0;
      RR.root.setAttribute('transform', 'translate(' + f1(R.x) + ' ' + f1(R.y) + ')');
      RR.flip.setAttribute('transform', 'scale(' + R.face + ' 1)');
      rot(RR.legL, sw + cs + R.ll, -3, -48); rot(RR.legR, -sw - cs + R.lr, 4, -48);
      rot(RR.upper, R.bend, 0, -48); rot(RR.head, R.head, 0, -88);
      rot(RR.armR, R.ru - cs * 0.6, 9, -84); rot(RR.foreR, R.rf + hm + wv, 11, -66);
      rot(RR.armL, R.lu + cs * 0.6, -8, -84); rot(RR.foreL, R.lf, -10, -66);
    }
    function drawProps() {
      vanG.setAttribute('transform', 'translate(' + f1(V.x) + ' 0)');
      var wa = (V.x - 880) / 13 * 57.3;
      rot(wF, wa, 26, 600); rot(wB, wa, 108, 600);
      if (wlen) { var pt = water.getPointAtLength(W.bead * wlen); bead.setAttribute('cx', f1(pt.x)); bead.setAttribute('cy', f1(pt.y)); }
      var k = Math.min(5.999, W.cal * 6), wk = Math.floor(k) + 1, fr = k - Math.floor(k);
      if (calN.textContent !== String(wk)) calN.textContent = String(wk);
      var flip = W.cal > 0 && W.cal < 1 && fr < 0.45 ? 1 - fr / 0.45 : 0;
      calPage.style.opacity = flip ? 1 : 0;
      calPage.setAttribute('transform', 'translate(0 452) scale(1 ' + (flip ? flip.toFixed(3) : 1) + ') translate(0 -452)');
      var ly = 595 - W.lvl * 17;
      bkWater.setAttribute('cy', f1(ly)); bkRing.setAttribute('cy', f1(ly));
      bkWater.setAttribute('rx', f1(11 + W.lvl * 3.2));
    }
    function drawAll() { var now = performance.now(); drawPerson(now); drawRoofer(now); drawProps(); }
    drawAll();

    /* ---------- the story, in time units (10.3 in all) ---------- */
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: drawAll });
    var t = function (target, vars, at) { tl.to(target, vars, at); };
    var slope = { x: 0.768, y: 0.640 };
    tl.set([$('.st-sky-eve'), $('.st-glass-eve'), $('.st-moonw'), $('.st-clouds'), $('.st-slate'), $('.st-lamp-glow'), $('.st-p-book')], { opacity: 1 }, 0)
      .set([$('.st-sky-storm'), $('.st-sky-night'), $('.st-sky-dawn'), $('.st-glass-storm'), $('.st-glass-night'), $('.st-glass-dawn'), $('.st-stars'), $('.st-sunw'),
        $('.st-dark'), $('.st-bolt'), $('.st-rain-far'), $('.st-rain-near'), $('.st-snow'), $('.st-wind'), $('.st-leaves'), $('.st-snowgnd'), $$('.st-snowroof'),
        $('.st-win-rain'), $('.st-frost'), $('.st-water'), $('.st-bead'), $('.st-stain'), $('.st-drips'), $('.st-floordrop'), $('.st-bucket'), $('.st-mould'),
        $('.st-rot'), $('.st-felt-wet'), $('.st-cal'), $('.st-newslate'), $('.st-shards'), $('.st-spark'), $('.st-birds'), $('.st-done'), $('.st-roofer'),
        $('.st-blossom'), $('.st-exhaust'), $('.st-p-q'), $('.st-p-waves'), $('.st-p-phone')], { opacity: 0 }, 0)
      .set($('.st-water'), { strokeDashoffset: 1 }, 0)
      .set($('.st-ladder'), { scaleY: 0, transformOrigin: '50% 100%' }, 0)
      .set($('.st-icicles'), { scaleY: 0, transformOrigin: '50% 0%' }, 0)
      .set($('.st-sunw'), { y: 110 }, 0)
      .set($('.st-dark'), { x: -260 }, 0)
      .set($('.st-done'), { scale: 0.2, transformOrigin: '50% 50%' }, 0)
      .set([$('.st-p-q'), $('.st-p-waves')], { transformOrigin: '0% 100%' }, 0);

    /* 1 to 2: the storm comes in, lightning twice; the cat jumps, the reader looks up */
    t($('.st-sky-storm'), { opacity: 1, duration: 0.8 }, 1);
    t($('.st-glass-storm'), { opacity: 1, duration: 0.8 }, 1);
    t($('.st-moonw'), { opacity: 0, duration: 0.5 }, 1);
    t($('.st-clouds'), { opacity: 0.25, duration: 0.8 }, 1);
    t($('.st-dark'), { opacity: 1, x: 0, duration: 1.2, ease: 'power1.out' }, 1);
    tl.fromTo($('.st-wind'), { x: -60 }, { opacity: 1, x: 40, duration: 1.4 }, 1.1);
    t([$('.st-rain-far'), $('.st-win-rain')], { opacity: 1, duration: 0.6 }, 1.2);
    t($('.st-rain-near'), { opacity: 1, duration: 0.6 }, 1.5);
    t($('.st-smoke'), { skewX: -30, x: 30, opacity: 0.4, duration: 1 }, 1.2);
    t($('.st-tree'), { rotation: 3.5, transformOrigin: '50% 100%', duration: 1 }, 1.2);
    $$('.st-leaves path').forEach(function (l, i) {
      tl.set(l, { opacity: 1 }, 1.4 + i * 0.12)
        .to(l, { x: 520 + i * 90, y: 40 + i * 30, rotation: 540 + i * 90, transformOrigin: '50% 50%', duration: 1.4, ease: 'power1.in' }, 1.4 + i * 0.12)
        .to(l, { opacity: 0, duration: 0.2 }, 2.6 + i * 0.12);
    });
    tl.set($('.st-leaves'), { opacity: 1 }, 1.4);
    [[1.45, 0.6], [1.85, 0.45]].forEach(function (f) {
      tl.fromTo($('.st-flash'), { opacity: 0 }, { opacity: f[1], duration: 0.05, yoyo: true, repeat: 1 }, f[0])
        .fromTo($('.st-bolt'), { opacity: 0 }, { opacity: 1, duration: 0.04, yoyo: true, repeat: 1 }, f[0]);
    });
    tl.to($('.st-cat'), { y: -22, duration: 0.12, ease: 'power2.out' }, 1.45)
      .to($('.st-cat'), { y: 0, duration: 0.25, ease: 'bounce.out' }, 1.57);
    t(P, { head: -8, rf: -70, duration: 0.15 }, 1.45);
    t(P, { head: 12, rf: -96, duration: 0.4 }, 2.2);

    /* 2: the slate slides down the slope, drops off the eaves and breaks on the ground */
    tl.to($('.st-slate'), { x: 46 * slope.x, y: 46 * slope.y, duration: 0.9, ease: 'power1.in' }, 2.1)
      .to($('.st-slate'), { x: 84, y: 258, rotation: 230, transformOrigin: '50% 50%', duration: 0.7, ease: 'power2.in' }, 3.0)
      .set($('.st-slate'), { opacity: 0 }, 3.7)
      .fromTo($('.st-shards'), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.12, ease: 'bounce.out' }, 3.7);

    /* 3: water finds the gap: a bead runs along the felt, the ceiling stains, it drips, the reader fetches a bucket */
    t($('.st-felt-wet'), { opacity: 1, duration: 0.4 }, 3.95);
    t([$('.st-water'), $('.st-bead')], { opacity: 1, duration: 0.15 }, 4.0);
    t($('.st-water'), { strokeDashoffset: 0, duration: 0.7 }, 4.0);
    t(W, { bead: 1, duration: 0.7 }, 4.0);
    t($('.st-bead'), { opacity: 0, duration: 0.15 }, 4.65);
    tl.fromTo($('.st-stain'), { scale: 0.15, opacity: 0, transformOrigin: '50% 0%' }, { scale: 1, opacity: 1, duration: 0.7 }, 4.6);
    t($('.st-floordrop'), { opacity: 1, duration: 0.2 }, 4.85);
    t($('.st-drips'), { opacity: 1, duration: 0.2 }, 4.9);
    t(P, { head: -28, rf: -40, ru: -10, duration: 0.25 }, 4.85);
    t($('.st-p-q'), { opacity: 1, duration: 0.15 }, 4.95);
    tl.fromTo($('.st-p-q'), { scale: 0.6 }, { scale: 1, duration: 0.2, ease: 'back.out(3)' }, 4.95);
    t($('.st-p-book'), { opacity: 0, duration: 0.15 }, 5.05);
    t(P, { walk: 1, duration: 0.08 }, 5.05);
    t(P, { x: 712, head: -10, ru: 0, rf: 0, lu: 0, lf: 0, duration: 0.42, ease: 'power1.inOut' }, 5.05);
    t(P, { walk: 0, duration: 0.08 }, 5.42);
    t($('.st-p-q'), { opacity: 0, duration: 0.12 }, 5.4);
    t(P, { bend: 26, ru: -35, rf: -20, lu: -30, lf: -15, head: 8, duration: 0.15 }, 5.45);
    tl.fromTo($('.st-bucket'), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.12 }, 5.52);
    t($('.st-floordrop'), { opacity: 0, duration: 0.1 }, 5.55);
    t(P, { bend: 0, ru: 0, rf: -10, lu: 0, lf: -10, head: -30, duration: 0.18 }, 5.66);

    /* 4: weeks go by in winter: snow, a night sky, the calendar turns, it gets worse; the homeowner phones */
    t([$('.st-rain-far'), $('.st-rain-near'), $('.st-win-rain'), $('.st-wind')], { opacity: 0, duration: 0.3 }, 5.6);
    t([$('.st-sky-night'), $('.st-glass-night')], { opacity: 1, duration: 0.5 }, 5.65);
    t($('.st-stars'), { opacity: 1, duration: 0.5 }, 5.8);
    t($('.st-moonw'), { opacity: 1, duration: 0.5 }, 5.8);
    t($('.st-snow'), { opacity: 1, duration: 0.4 }, 5.7);
    t([$('.st-snowgnd'), $$('.st-snowroof'), $('.st-frost')], { opacity: 1, duration: 0.6 }, 5.9);
    t($('.st-icicles'), { scaleY: 1, duration: 0.6 }, 6.0);
    t($('.st-crown'), { opacity: 0.12, duration: 0.5 }, 5.8);
    t($('.st-tree'), { rotation: 0, duration: 0.4 }, 5.8);
    t($('.st-cal'), { opacity: 1, duration: 0.3 }, 5.7);
    t(W, { cal: 1, duration: 1.2 }, 5.8);
    t(W, { lvl: 1, duration: 1.4 }, 5.7);
    t($('.st-stain'), { scale: 1.55, duration: 0.9 }, 5.8);
    t($('.st-rot'), { opacity: 1, duration: 0.6 }, 5.9);
    t([$('.st-s2'), $('.st-s3')], { x: 10, rotation: 4, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.2 }, 6.0);
    t($('.st-mould'), { opacity: 1, duration: 0.6 }, 6.3);
    t(P, { ru: -38, rf: -150, head: -4, duration: 0.2 }, 6.25);
    t($('.st-p-phone'), { opacity: 1, duration: 0.1 }, 6.3);
    tl.fromTo($('.st-p-waves'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.15, repeat: 3, yoyo: true }, 6.4);
    t(P, { ru: 0, rf: -12, head: -20, duration: 0.2 }, 7.05);
    t($('.st-p-phone'), { opacity: 0, duration: 0.1 }, 7.1);
    t($('.st-cal'), { opacity: 0, duration: 0.25 }, 7.15);

    /* 5: morning: the snow goes, the van arrives, the roofer climbs up and puts it right */
    t([$('.st-sky-dawn'), $('.st-glass-dawn')], { opacity: 1, duration: 0.6 }, 7.3);
    t([$('.st-sky-night'), $('.st-glass-night'), $('.st-sky-storm'), $('.st-glass-storm'), $('.st-stars'), $('.st-moonw'), $('.st-snow')], { opacity: 0, duration: 0.5 }, 7.35);
    t($('.st-dark'), { x: 300, opacity: 0, duration: 0.8 }, 7.3);
    t($('.st-clouds'), { opacity: 1, duration: 0.6 }, 7.5);
    t($('.st-sunw'), { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 7.4);
    t([$('.st-snowgnd'), $$('.st-snowroof'), $('.st-frost')], { opacity: 0, duration: 0.6 }, 7.6);
    t($('.st-icicles'), { scaleY: 0, duration: 0.5 }, 7.6);
    t($('.st-crown'), { opacity: 1, duration: 0.6 }, 7.6);
    t($('.st-blossom'), { opacity: 1, duration: 0.6 }, 7.9);
    t($('.st-smoke'), { skewX: 0, x: 0, opacity: 1, duration: 0.5 }, 7.5);
    t($('.st-lamp-glow'), { opacity: 0, duration: 0.5 }, 7.6);
    t($('.st-exhaust'), { opacity: 1, duration: 0.1 }, 7.6);
    t(V, { x: 880, duration: 0.7, ease: 'power2.out' }, 7.6);
    t($('.st-exhaust'), { opacity: 0, duration: 0.2 }, 8.2);
    t($('.st-shards'), { opacity: 0, duration: 0.2 }, 8.1);
    t($('.st-roofer'), { opacity: 1, duration: 0.1 }, 8.3);
    t(R, { walk: 1, duration: 0.05 }, 8.3);
    t(R, { x: 886, duration: 0.18 }, 8.3);
    t(R, { walk: 0, duration: 0.05 }, 8.45);
    t($('.st-ladder'), { scaleY: 1, duration: 0.3, ease: 'power2.out' }, 8.2);
    t(R, { climb: 1, ru: -150, rf: -20, lu: -150, lf: -20, duration: 0.08 }, 8.5);
    t(R, { y: 384, x: 852, duration: 0.55, ease: 'none' }, 8.55);
    t(R, { climb: 0, ru: 0, rf: 0, lu: 0, lf: 0, duration: 0.1 }, 9.1);
    t(R, { x: 828, y: 365, duration: 0.15, ease: 'power1.out' }, 9.12);
    t(R, { ll: -24, lr: 10, bend: 30, ru: -72, rf: -28, lu: 12, lf: -35, head: 14, duration: 0.15 }, 9.27);
    tl.fromTo($('.st-newslate'), { opacity: 0, x: 40, y: 34 }, { opacity: 1, x: 0, y: 0, duration: 0.15, ease: 'power2.out' }, 9.3);
    t(R, { ham: 1, duration: 0.45 }, 9.45);
    [9.48, 9.63, 9.78].forEach(function (s) {
      tl.fromTo($('.st-spark'), { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.2, duration: 0.05, yoyo: true, repeat: 1 }, s);
    });
    t([$('.st-s2'), $('.st-s3')], { x: 0, rotation: 0, duration: 0.2 }, 9.5);
    t([$('.st-rot'), $('.st-felt-wet'), $('.st-water'), $('.st-drips'), $('.st-mould')], { opacity: 0, duration: 0.3 }, 9.55);
    t($('.st-stain'), { opacity: 0, scale: 0.6, duration: 0.4 }, 9.6);
    t(W, { lvl: 0.4, duration: 0.4 }, 9.6);
    t($('.st-bucket'), { opacity: 0, duration: 0.2 }, 9.9);
    t(R, { bend: 4, head: -6, ru: -165, rf: 0, lu: 0, lf: -10, wave: 1, duration: 0.15 }, 9.92);
    t(P, { ru: -165, rf: 0, head: -24, wave: 1, duration: 0.15 }, 9.95);
    tl.to($('.st-done'), { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2.5)' }, 10.0);
    tl.fromTo($('.st-birds'), { opacity: 0, x: -60 }, { opacity: 1, x: 80, duration: 0.6 }, 9.65);
    tl.set({}, {}, 10.3);

    /* camera: onto the slate, follow it down, back up to the felt, into the bedroom, wide for the winter, the ladder, the fix, wide */
    var c = function (vars, at, d, ease) { vars.duration = d; vars.ease = ease || 'power2.inOut'; vars.onUpdate = aim; tl.to(cam, vars, at); };
    c({ z: 1, tx: 770, ty: 350 }, 1.9, 0.9);
    c({ z: 0.45, tx: 830, ty: 470 }, 3.0, 0.6);
    c({ z: 1, tx: 790, ty: 360 }, 3.75, 0.35);
    c({ z: 0.85, tx: 700, ty: 480, floor: 1 }, 4.6, 0.5);
    c({ z: 0, floor: 0 }, 5.75, 0.5);
    c({ z: 0.5, tx: 880, ty: 470 }, 8.35, 0.5);
    c({ z: 0.95, tx: 800, ty: 340 }, 9.05, 0.3);
    c({ z: 0 }, 9.95, 0.35);

    /* waving keeps going while the end is on screen */
    RW.tick(function () { if ((P.wave || R.wave) && sec.classList.contains('is-live')) { var now = performance.now(); drawPerson(now); drawRoofer(now); } });

    var STEPS = [0, 0.17, 0.37, 0.54, 0.72], cur = -1;
    function show(p) {
      var k = 0; for (var i = 0; i < STEPS.length; i++) if (p >= STEPS[i]) k = i;
      if (k === cur) return; cur = k;
      caps.forEach(function (cp, i) { cp.classList.toggle('is-on', i === k); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i <= k); });
      sec.classList.toggle('is-end', k === STEPS.length - 1);
    }
    show(0);
    var desk = window.matchMedia('(min-width:1000px)').matches;
    if (sec.getAttribute('data-v') === '2') {
      /* tap through: no pinning; Back and Next play the scene to each step */
      var AT = [0, 3.9, 5.7, 7.2, 10.3], step = 0, nav = document.createElement('div');
      nav.className = 'st-nav';
      nav.innerHTML = '<button type="button" class="st-prev" aria-label="Previous step">Back</button><button type="button" class="btn btn-fill st-next">Next</button>';
      copy.appendChild(nav);
      var prev = nav.firstChild, next = nav.lastChild;
      var goStep = function (k) {
        step = RW.clamp(k, 0, AT.length - 1);
        tl.tweenTo(AT[step], { duration: Math.min(3, Math.abs(tl.time() - AT[step]) * 0.45 + 0.5), ease: 'power1.inOut' });
        show(STEPS[step] + 0.001);
        prev.disabled = step === 0; next.textContent = step === AT.length - 1 ? 'Start again' : 'Next';
      };
      next.addEventListener('click', function () { goStep(step === AT.length - 1 ? 0 : step + 1); });
      prev.addEventListener('click', function () { goStep(step - 1); });
      tl.progress(0); goStep(0);
      sec.classList.add('is-tap');
      RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
      return;
    }
    ST.create({
      trigger: sec, start: 'top top', end: '+=' + (desk ? 460 : 340) + '%', pin: $('.st-pin'), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) { tl.progress(self.progress); show(self.progress); },
      onRefresh: function (self) { frame(); tl.progress(self.progress); show(self.progress); }
    });
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
