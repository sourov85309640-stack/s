/* COMPANION (owner: lead). A small drawn roofer who leans in from the left edge as you reach certain sections, does
   something that fits the section (holds an umbrella in the leak tour, a bucket by the urgent band, a camera by the
   gallery ...), says one short tip, then ducks back out. His eyes follow the pointer, he blinks, he bobs with the scroll.
   Click him to hear the tip again (he waves). "Hide" sends him away for the rest of the visit.
   Desktop with a fine pointer and motion allowed only. Design options: ?pal=on (default) | off. */
(function () {
  'use strict';
  var RW = window.RW, d = document;
  var MODE = 'on';
  try { var m = /[?&]pal=(on|off)\b/.exec(location.search); if (m) MODE = m[1]; } catch (e) {}
  if (RW.motionOK && RW.fine) RW.options.push({ id: 'companion', param: 'pal', allowed: ['on', 'off'], names: ['Roofer peeks in with tips', 'No roofer'], current: MODE, label: 'Roofer' });

  /* per section: prop shown, arm action, tip */
  var CUES = {
    reviews: ['thumb', 'raise', 'Read a few. Look for the ones that mention photos and a tidy site.'],
    services: ['hammer', 'tap', 'Pick a card and the form fills itself in.'],
    types: ['slate', 'raise', 'Not sure what your roof is made of? A photo from the street tells us.'],
    problems: ['bino', 'raise', 'Look from the garden or the street. Never from a ladder.'],
    where: ['umbrella', 'raise', 'Most leaks start higher up than the stain on the ceiling.'],
    decide: ['think', 'scratch', 'If the rest of the roof is sound, a repair usually comes first.'],
    whole: ['tape', 'raise', 'The tiles are only the top layer. The battens and felt matter too.'],
    quiz: ['board', 'raise', 'Three taps and I will fill the form in for you.'],
    work: ['camera', 'raise', 'We photograph every job, before and after.'],
    before: ['brush', 'sweep', 'Drag the handle across the cottage.'],
    how: ['board', 'raise', 'Nothing starts without a written quote.'],
    checks: ['bino', 'raise', 'Tick them off as you look. Photos help us a lot.'],
    care: ['rake', 'sweep', 'Clear gutters in autumn and you save a lot of winter leaks.'],
    areas: ['map', 'raise', 'Not on the list? Ask anyway.'],
    faq: ['mug', 'raise', 'Anything not covered here? Just ask.'],
    urgent: ['bucket', 'raise', 'Bucket first, electrics away, then call.'],
    contact: ['wave', 'wave', 'A few details is plenty. We will do the rest.']
  };

  RW.add('companion', function () {
    if (!RW.fine || MODE === 'off') return;
    try { if (sessionStorage.getItem('rw-pal') === 'gone') return; } catch (e) {}
    var mq = window.matchMedia('(min-width:1024px)');
    var el = d.createElement('aside');
    el.className = 'pal'; el.setAttribute('aria-label', 'Roofer tips');
    el.innerHTML =
      '<button class="pal-me" type="button" aria-label="Hear the roofer\'s tip again">' +
      '<svg class="pal-svg" viewBox="0 0 120 170" aria-hidden="true" focusable="false">' +
        '<path class="pal-body" d="M18 170c0-38 18-58 42-58s42 20 42 58z"/>' +
        '<path class="pal-vest" d="M30 170c0-30 8-46 22-52l4 52zM90 170c0-30-8-46-22-52l-4 52z"/><path class="pal-strip" d="M30 152h26M64 152h26"/>' +
        '<path class="pal-neck" d="M52 98h16v16H52z"/>' +
        '<circle class="pal-skin" cx="38" cy="80" r="5"/><circle class="pal-skin" cx="82" cy="80" r="5"/>' +
        '<ellipse class="pal-skin pal-head" cx="60" cy="78" rx="22" ry="25"/>' +
        '<path class="pal-cap" d="M37 70c0-28 46-28 46 0z"/><path class="pal-brim" d="M60 69h34"/>' +
        '<g class="pal-eyes"><circle cx="52" cy="80" r="2.6"/><circle cx="68" cy="80" r="2.6"/></g>' +
        '<path class="pal-brow" d="M47 73l9-1M64 72l9 1"/>' +
        '<path class="pal-mouth" d="M53 91q7 6 14 0"/>' +
        '<g class="pal-q"><path d="M96 40c0-10 14-10 14 0 0 6-7 7-7 13M103 60v1"/></g>' +
        '<g class="pal-arm"><path class="pal-sleeve" d="M86 122L106 96"/><circle class="pal-skin pal-hand" cx="107" cy="94" r="5.5"/>' +
          '<g class="pal-p" data-p="thumb"><path d="M105 86v-8c0-3 4-3 4 0v8"/></g>' +
          '<g class="pal-p" data-p="hammer"><path class="pp-wood" d="M107 94L112 70"/><path class="pp-steel" d="M104 64l18 5-2 7-18-5z"/></g>' +
          '<g class="pal-p" data-p="slate"><path class="pp-slate" d="M98 70l24-3 2 20-24 3z"/><circle class="pp-hole" cx="110" cy="72" r="1.4"/></g>' +
          '<g class="pal-p" data-p="bino"><circle class="pp-dark" cx="102" cy="86" r="6"/><circle class="pp-dark" cx="114" cy="86" r="6"/></g>' +
          '<g class="pal-p" data-p="umbrella"><path class="pp-wood" d="M107 94V40"/><path class="pp-canopy" d="M75 46a32 26 0 0 1 64 0q-8-6-16 0q-8-6-16 0q-8-6-16 0q-8-6-16 0z"/></g>' +
          '<g class="pal-p" data-p="tape"><rect class="pp-yellow" x="100" y="84" width="14" height="14" rx="3"/><path class="pp-tape" d="M114 90h18"/></g>' +
          '<g class="pal-p" data-p="board"><path class="pp-board" d="M98 74h20v26H98z"/><path class="pp-line" d="M101 82h14M101 88h10M101 94h12"/></g>' +
          '<g class="pal-p" data-p="camera"><path class="pp-dark" d="M97 84h22v14H97z"/><circle class="pp-lens" cx="108" cy="91" r="4.5"/><path class="pp-dark" d="M101 81h6v3h-6z"/></g>' +
          '<g class="pal-p" data-p="brush"><path class="pp-wood" d="M107 94L120 74"/><path class="pp-bristle" d="M114 70l12 7-3 5-12-7z"/></g>' +
          '<g class="pal-p" data-p="rake"><path class="pp-wood" d="M107 94L118 56"/><path class="pp-steel2" d="M110 54h16M112 54v6M116 54v6M120 54v6M124 54v6"/></g>' +
          '<g class="pal-p" data-p="map"><path class="pp-map" d="M96 76l8-3 8 3 8-3v22l-8 3-8-3-8 3z"/><path class="pp-line" d="M104 73v22M112 76v22"/></g>' +
          '<g class="pal-p" data-p="mug"><path class="pp-mug" d="M100 84h12v12h-12z"/><path class="pp-line" d="M112 87h3v6h-3"/><path class="pp-steam" d="M104 80c-2-2 2-3 0-6M108 80c-2-2 2-3 0-6"/></g>' +
          '<g class="pal-p" data-p="bucket"><path class="pp-bucket" d="M98 92h20l-3 16h-14z"/><path class="pp-line" d="M98 92c2-8 18-8 20 0"/></g>' +
        '</g>' +
      '</svg></button>' +
      '<p class="pal-tip" role="status" aria-live="polite"></p>' +
      '<button class="pal-x" type="button" aria-label="Hide the roofer for this visit">Hide</button>';
    d.body.appendChild(el);
    var me = RW.$('.pal-me', el), tip = RW.$('.pal-tip', el), eyes = RW.$('.pal-eyes', el), svg = RW.$('.pal-svg', el);
    var shown = false, cueNow = '', seen = {}, lastShow = -1e9, hideT = 0;

    /* the tip only opens by itself when it would not sit on top of text; otherwise he just peeks with a small
       "..." bubble and the tip opens when he is hovered or clicked */
    function probe(fn) { el.classList.add('is-probe'); try { return fn(); } finally { el.classList.remove('is-probe'); } }
    function spaceFree() { return probe(function () { return spaceFree0() && tipFree(); }); }
    function tipFree() {   /* when the tip is open, test its real box: long tips are taller than the fixed points */
      if (!tip.textContent) return true;
      var r = tip.getBoundingClientRect(); if (!r.width) return true;
      for (var x = r.left + 8; x < r.right; x += 24) for (var y = r.top + 6; y < r.bottom; y += 14) {
        var e = d.elementFromPoint(x, y);
        if (e && !e.closest('.pal') && e.closest('main p,main h1,main h2,main h3,main li,main a,main button,main label,main input,main textarea,main img,main .dec-roof,main .dia-art,main .xv-stage,main .ty-stage,main .cr-art,main .qz-art,main .sc-art,main .faq-board,main .bf-view,main .prj-build,main .ab-art,main .sv-art,main .ug-art,main .chk-photo,main .how-art,main .are-list,main .ad-card,main .svc-stage,main .st-stage,main .ct-photo,main .wk-btn,main .rv-card,main dl,footer p,footer a,footer li')) return false;
      }
      return true;
    }
    function bodyFree() { return probe(bodyFree0); }
    function spaceFree0() {
      var x0 = window.innerWidth < 1400 ? 60 : 100, y1 = window.innerHeight - 84 - 96, pts = [[x0 + 20, y1 - 10], [x0 + 120, y1 - 10], [x0 + 220, y1 - 10], [x0 + 20, y1 - 60], [x0 + 120, y1 - 60], [x0 + 220, y1 - 60]];
      for (var i = 0; i < pts.length; i++) {
        var e = d.elementFromPoint(pts[i][0], pts[i][1]);
        if (e && !e.closest('.pal') && e.closest('main p,main h1,main h2,main h3,main li,main a,main button,main label,main input,main textarea,main img,main .dec-roof,main .dia-art,main .xv-stage,main .ty-stage,main .cr-art,main .qz-art,main .sc-art,main .faq-board,main .bf-view,main .prj-build,main .ab-art,main .sv-art,main .ug-art,main .chk-photo,main .how-art,main .are-list,main .ad-card,main .svc-stage,main .st-stage,main .ct-photo,main .wk-btn,main .rv-card,main dl,footer p,footer a,footer li')) return false;
      }
      return true;
    }
    function bodyFree0() {   /* where he stands must be clear of text too, or he waits for a better moment */
      var H = window.innerHeight, xs = window.innerWidth < 1400 ? [20, 44, 70, 92] : [30, 70, 92, 120];
      for (var i = 0; i < xs.length; i++) for (var y = H - 200; y < H - 90; y += 36) {
        var e = d.elementFromPoint(xs[i], y);
        if (e && !e.closest('.pal,.rwopt') && e.closest('main p,main h1,main h2,main h3,main li,main a,main button,main label,main input,main img,main .dec-roof,main .dia-art,main .xv-stage,main .ty-stage,main .cr-art,main .qz-art,main .sc-art,main .faq-board,main .bf-view,main .prj-build,main .ab-art,main .sv-art,main .ug-art,main .chk-photo,main .how-art,main .are-list,main .ad-card,main .svc-stage,main .st-stage,main .ct-photo,main .wk-btn,main .rv-card,footer p,footer a,footer li')) return false;
      }
      return true;
    }
    function show(id) {
      var c = CUES[id]; if (!c) return;
      if (!bodyFree()) return;
      cueNow = id; seen[id] = true; lastShow = performance.now();
      el.setAttribute('data-p', c[0]); el.setAttribute('data-act', c[1]);
      var free = spaceFree();
      tip.textContent = free ? c[2] : '';
      if (free && !probe(tipFree)) { free = false; tip.textContent = ''; }
      el.classList.toggle('is-quiet', !free); autoQuiet = !free;
      el.classList.add('is-in'); shown = true;
      el.classList.remove('is-act'); void el.offsetWidth; el.classList.add('is-act');
      clearTimeout(hideT); hideT = setTimeout(hide, free ? 4800 : 3800);
    }
    function hide() { el.classList.remove('is-in', 'is-act', 'is-quiet'); shown = false; tip.textContent = ''; autoQuiet = false; }
    function speak() { if (!cueNow) return; tip.textContent = CUES[cueNow][2]; el.classList.remove('is-quiet'); }
    /* while he is out, keep checking as the page moves: text sliding under the bubble shrinks it to "...", text
       reaching where he stands sends him away */
    var watchT = 0, autoQuiet = false;
    window.addEventListener('scroll', function () {
      if (!shown || watchT) return;
      watchT = requestAnimationFrame(function () {
        watchT = 0; if (!shown) return;
        if (el.matches(':hover')) return;
        if (!bodyFree()) { hide(); return; }
        var free = spaceFree();
        if (!el.classList.contains('is-quiet') && !free) { tip.textContent = ''; el.classList.add('is-quiet'); autoQuiet = true; }
        else if (autoQuiet && free && cueNow) { speak(); if (!probe(tipFree)) { tip.textContent = ''; el.classList.add('is-quiet'); } else autoQuiet = false; }
      });
    }, { passive: true });

    /* when a section's top passes 55% of the screen, maybe peek in: never in the hero, at most every 14s, once per section */
    var secs = Object.keys(CUES).map(function (id) { return d.getElementById(id); }).filter(Boolean);
    secs.forEach(function (s) {
      RW.onView(s, { margin: '-45% 0px -45% 0px', leave: function () { if (cueNow === s.id && shown) hide(); }, enter: function () {
        if (!mq.matches || seen[s.id] || d.documentElement.classList.contains('menu-open')) return;
        if (performance.now() - lastShow < 14000) return;
        if (window.pageYOffset < window.innerHeight * 0.6) return;
        show(s.id);
        if (!shown) setTimeout(function () { if (!seen[s.id] && !shown && performance.now() - lastShow > 14000) show(s.id); }, 1600);
      } });
    });
    me.addEventListener('click', function () {
      if (!cueNow) return;
      el.setAttribute('data-act', 'wave'); speak();
      el.classList.add('is-in'); el.classList.remove('is-act'); void el.offsetWidth; el.classList.add('is-act');
      clearTimeout(hideT); hideT = setTimeout(hide, 6000);
    });
    el.addEventListener('pointerenter', function () { clearTimeout(hideT); if (shown) speak(); });
    el.addEventListener('pointerleave', function () { if (shown) { clearTimeout(hideT); hideT = setTimeout(hide, 2500); } });
    RW.$('.pal-x', el).addEventListener('click', function () { hide(); try { sessionStorage.setItem('rw-pal', 'gone'); } catch (e) {} setTimeout(function () { el.remove(); }, 400); });

    /* eyes follow the pointer, a blink now and then, a small bob that follows scroll speed */
    var px = 0, py = 0, ex = 0, ey = 0, bob = 0, lastY = window.pageYOffset;
    window.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
    (function blink() { setTimeout(function () { if (shown) { eyes.classList.add('is-blink'); setTimeout(function () { eyes.classList.remove('is-blink'); }, 130); } blink(); }, 1800 + Math.random() * 2600); }());
    RW.tick(function (t, dt) {
      if (!shown && Math.abs(bob) < 0.05) return;
      var sy = window.pageYOffset, v = (sy - lastY) / Math.max(dt, 0.001); lastY = sy;
      bob += (RW.clamp(-v * 0.01, -8, 8) - bob) * Math.min(1, dt * 6);
      el.style.setProperty('--bob', bob.toFixed(2) + 'px');
      var mx = svg.getScreenCTM(); if (!mx) return;
      var cx = mx.a * 60 + mx.e, cy = mx.d * 80 + mx.f, dx = px - cx, dy = py - cy, dd = Math.hypot(dx, dy) || 1;
      ex += (dx / dd * 3 - ex) * Math.min(1, dt * 10); ey += (dy / dd * 2.4 - ey) * Math.min(1, dt * 10);
      eyes.style.transform = 'translate(' + ex.toFixed(2) + 'px,' + ey.toFixed(2) + 'px)';
    });
  }, { motion: true });
}());
