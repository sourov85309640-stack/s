/* THE STORY OF ONE SLATE (owner: lead). One GSAP timeline scrubbed by scroll while the scene is pinned.
   The camera (viewBox) frames the scene for the screen: on desktop the house sits to the right of the caption card,
   on phones the scene sits above the caption. Scroll moves the story both ways; nothing is forced.
   Reduced motion / data-motion="off" / no JS: the repaired scene and all five steps as a plain list (CSS). */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('story'); if (s) RW.variant(s, 'stv', ['1', '2'], ['Scroll story', 'Tap through']); }());
  RW.add('story', function () {
    var sec = RW.$('#story'); if (!sec || !RW.ST) return;
    var gsap = RW.gsap, ST = RW.ST, $ = function (s) { return RW.$(s, sec); }, $$ = function (s) { return RW.$$(s, sec); };
    var svg = $('.st-sc'), stage = $('.st-stage'), copy = $('.st-copy'), caps = $$('.st-cap'), dots = $$('.st-steps li');
    sec.classList.add('is-js');
    RW.headings(sec);

    /* camera: keep x from 200 (van) to 1060 (beyond the ladder) visible, clear of the caption card on desktop */
    function frame() {
      var r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
      var desk = window.innerWidth >= 1000, aspect = r.width / r.height;
      var f = desk ? (copy.getBoundingClientRect().right - r.left + 24) / r.width : 0;
      var X1 = desk ? 1080 : 1010, X0c = desk ? 190 : 210;
      var Wv = (X1 - X0c) / (1 - f), H = Wv / aspect;
      if (H < 470) { H = 470; Wv = H * aspect; }
      var X0 = X1 - Wv, Y0 = 640 - H;
      base = { x: X0, y: Y0, w: Wv, h: H, f: f };
      svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
      aim();
    }
    /* camera: cam.z 0 = the whole scene, 1 = close on the slipped slate; cam.tx/ty = the point it looks at */
    var base = null, cam = { z: 0, tx: 770, ty: 360 };
    function aim() {
      if (!base) return;
      var K = 2.3, w1 = base.w / K, h1 = base.h / K;
      var sx = base.f ? base.f + (1 - base.f) * 0.5 : 0.5;          /* the open part of the screen */
      var x1 = cam.tx - w1 * sx, y1 = cam.ty - h1 * 0.5, e = cam.z;
      var x = base.x + (x1 - base.x) * e, y = base.y + (y1 - base.y) * e, w = base.w + (w1 - base.w) * e, h = base.h + (h1 - base.h) * e;
      svg.setAttribute('viewBox', x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1));
    }
    frame();
    window.addEventListener('resize', frame);
    if (RW.ST) RW.ST.addEventListener('refresh', frame);

    /* the story, in time units (10 in all) */
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    var slope = { x: 0.768, y: 0.640 };
    tl.set($('.st-sky-eve'), { opacity: 1 }, 0)
      .set([$('.st-sky-storm'), $('.st-sky-dawn'), $('.st-sun'), $('.st-water'), $('.st-stain'), $('.st-drips'), $('.st-bucket'), $('.st-rot'), $('.st-felt-wet'), $('.st-cal'), $('.st-man'), $('.st-newslate'), $('.st-spark'), $('.st-birds')], { opacity: 0 }, 0)
      .set([$('.st-moon'), $('.st-lamp-glow'), $('.st-slate')], { opacity: 1 }, 0)
      .set($('.st-water'), { strokeDashoffset: 1 }, 0)
      .set($('.st-van'), { x: -560 }, 0)
      .set($('.st-ladder'), { scaleY: 0, transformOrigin: '50% 100%' }, 0)
      .set($('.st-man'), { y: 180 }, 0)
      .set($('.st-sun'), { y: 90 }, 0)
      /* 1 to 2: the storm comes in */
      .to($('.st-sky-storm'), { opacity: 1, duration: 1 }, 1)
      .to($('.st-moon'), { opacity: 0, duration: 0.6 }, 1)
      .fromTo($('.st-wind'), { opacity: 0, x: -60 }, { opacity: 1, x: 40, duration: 1.2 }, 1.1)
      .to($('.st-rain'), { opacity: 0.9, duration: 0.8 }, 1.3)
      .to($('.st-clouds'), { x: 80, duration: 2 }, 1)
      .to($('.st-smoke'), { skewX: -30, x: 30, opacity: 0.4, duration: 1 }, 1.2)
      .to($('.st-crown'), { rotation: 4, transformOrigin: '50% 100%', duration: 1 }, 1.2)
      /* 2: the slate slides down the slope, then drops off the eaves */
      .to($('.st-slate'), { x: 46 * slope.x, y: 46 * slope.y, duration: 1, ease: 'power1.in' }, 2.1)
      .to($('.st-slate'), { x: 120, y: 262, rotation: 210, transformOrigin: '50% 50%', duration: 0.9, ease: 'power2.in' }, 3.1)
      .to($('.st-slate'), { opacity: 0, duration: 0.2 }, 3.9)
      /* 3: water finds the gap */
      .to($('.st-felt-wet'), { opacity: 1, duration: 0.5 }, 4)
      .to($('.st-water'), { opacity: 1, duration: 0.2 }, 4)
      .to($('.st-water'), { strokeDashoffset: 0, duration: 1 }, 4.1)
      .fromTo($('.st-stain'), { scale: 0.2, opacity: 0, transformOrigin: '50% 0%' }, { scale: 1, opacity: 1, duration: 0.8 }, 4.8)
      .to($('.st-drips'), { opacity: 1, duration: 0.3 }, 5.2)
      .to($('.st-bucket'), { opacity: 1, duration: 0.3 }, 5.4)
      .to($('.st-lamp-glow'), { opacity: 0.6, duration: 0.5 }, 5)
      /* 4: weeks go by */
      .to($('.st-cal'), { opacity: 1, duration: 0.4 }, 5.6)
      .to($('.st-rot'), { opacity: 1, duration: 0.8 }, 5.8)
      .to($('.st-stain'), { scale: 1.45, duration: 0.8 }, 5.8)
      .to([$('.st-s2'), $('.st-s3')], { x: 10, rotation: 4, transformOrigin: '0% 50%', duration: 0.6, stagger: 0.2 }, 6)
      .to($('.st-crown'), { opacity: 0.55, duration: 0.6 }, 5.9)
      /* 5: the weather clears and the roofer comes */
      .to($('.st-cal'), { opacity: 0, duration: 0.3 }, 6.7)
      .to([$('.st-rain'), $('.st-wind')], { opacity: 0, duration: 0.5 }, 6.7)
      .to($('.st-sky-dawn'), { opacity: 1, duration: 0.8 }, 6.8)
      .to($('.st-sky-storm'), { opacity: 0, duration: 0.8 }, 6.9)
      .to($('.st-sun'), { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 6.9)
      .to($('.st-crown'), { opacity: 1, rotation: 0, duration: 0.6 }, 7)
      .to($('.st-smoke'), { skewX: 0, x: 0, opacity: 1, duration: 0.5 }, 7)
      .to($('.st-van'), { x: 0, duration: 0.9, ease: 'power2.out' }, 7.4)
      .to($('.st-ladder'), { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 8.2)
      .to($('.st-man'), { opacity: 1, duration: 0.2 }, 8.7)
      .to($('.st-man'), { y: 0, duration: 0.7, ease: 'power1.inOut' }, 8.7)
      .fromTo($('.st-newslate'), { opacity: 0, x: 70, y: 50 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power2.out' }, 9.3)
      .to([$('.st-s2'), $('.st-s3')], { x: 0, rotation: 0, duration: 0.3 }, 9.4)
      .to([$('.st-rot'), $('.st-felt-wet'), $('.st-water'), $('.st-drips'), $('.st-bucket')], { opacity: 0, duration: 0.4 }, 9.5)
      .to($('.st-stain'), { opacity: 0, duration: 0.5 }, 9.6)
      .to($('.st-lamp-glow'), { opacity: 0, duration: 0.4 }, 9.6)
      .fromTo($('.st-spark'), { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.2, duration: 0.25 }, 9.75)
      .to($('.st-spark'), { opacity: 0, duration: 0.2 }, 10)
      .fromTo($('.st-birds'), { opacity: 0, x: -40 }, { opacity: 1, x: 60, duration: 0.6 }, 9.6)
      .set({}, {}, 10.3)
      /* lightning twice as the storm arrives */
      .fromTo($('.st-flash'), { opacity: 0 }, { opacity: 0.55, duration: 0.06, yoyo: true, repeat: 1 }, 1.45)
      .fromTo($('.st-flash'), { opacity: 0 }, { opacity: 0.4, duration: 0.05, yoyo: true, repeat: 1 }, 1.8)
      /* the person in the bedroom: looks up at the stain, wonders, then phones; waves when it is fixed */
      .set($('.st-p-q'), { opacity: 0 }, 0)
      .to($('.st-p-head'), { rotation: -18, duration: 0.4 }, 5.0)
      .to($('.st-person'), { x: 90, duration: 0.6, ease: 'power1.inOut' }, 5.1)
      .to($('.st-p-q'), { opacity: 1, duration: 0.25 }, 5.3)
      .to($('.st-p-q'), { opacity: 0, duration: 0.2 }, 6.3)
      .to($('.st-p-head'), { rotation: 0, duration: 0.3 }, 6.4)
      .to($('.st-p-arm'), { rotation: -110, duration: 0.4 }, 6.5)
      .to($('.st-p-arm'), { rotation: 0, duration: 0.3 }, 7.6)
      .to($('.st-person'), { x: 0, duration: 0.6, ease: 'power1.inOut' }, 9.4)
      .to($('.st-p-arm'), { rotation: -140, duration: 0.25 }, 10.0)
      .to($('.st-p-arm'), { rotation: -110, duration: 0.15, yoyo: true, repeat: 3 }, 10.05)
      /* camera moves: in on the slate as it goes, hold while the water runs, out for the winter, in again for the fix */
      .to(cam, { z: 1, duration: 1.1, ease: 'power2.inOut', onUpdate: aim }, 1.9)
      .to(cam, { tx: 790, ty: 395, duration: 1.2, ease: 'power1.inOut', onUpdate: aim }, 4.0)
      .to(cam, { z: 0, duration: 1, ease: 'power2.inOut', onUpdate: aim }, 5.5)
      .to(cam, { z: 0.55, tx: 820, ty: 400, duration: 0.9, ease: 'power2.inOut', onUpdate: aim }, 8.5)
      .to(cam, { z: 0, duration: 0.8, ease: 'power2.inOut', onUpdate: aim }, 9.7);

    var STEPS = [0, 0.17, 0.37, 0.54, 0.72], cur = -1;
    function show(p) {
      var k = 0; for (var i = 0; i < STEPS.length; i++) if (p >= STEPS[i]) k = i;
      if (k === cur) return; cur = k;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i <= k); });
      sec.classList.toggle('is-end', k === STEPS.length - 1);
    }
    show(0);
    var desk = window.matchMedia('(min-width:1000px)').matches;
    if (sec.getAttribute('data-v') === '2') {
      /* tap through: no pinning; Back and Next play the scene to each step */
      var AT = [0, 1.95, 4.3, 5.75, 10.3], step = 0, nav = document.createElement('div');
      nav.className = 'st-nav';
      nav.innerHTML = '<button type="button" class="st-prev" aria-label="Previous step">Back</button><button type="button" class="btn btn-fill st-next">Next</button>';
      copy.appendChild(nav);
      var prev = nav.firstChild, next = nav.lastChild;
      var goStep = function (k) {
        step = RW.clamp(k, 0, AT.length - 1);
        tl.tweenTo(AT[step], { duration: Math.min(2.4, Math.abs(tl.time() - AT[step]) * 0.4 + 0.5), ease: 'power1.inOut' });
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
      trigger: sec, start: 'top top', end: '+=' + (desk ? 420 : 300) + '%', pin: $('.st-pin'), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) { tl.progress(self.progress); show(self.progress); },
      onRefresh: function (self) { frame(); tl.progress(self.progress); show(self.progress); }
    });
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
  }, { motion: true });
}());
