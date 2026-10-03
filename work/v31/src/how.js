/* How it works. Owner: projects/how agent.
   Stage 1 prototype: variant from ?hv=1..6 sets data-v on #how.
   'how-ui' always runs (variant, v3 chapter tracking, v6 tabs). 'how-motion' only when motion is allowed. */
(function () {
  'use strict';
  var RW = window.RW;
  var MAX = 6;
  var NAMES = ['Inspect', 'Quote', 'Work', 'Handover'];

  function variantOf(sec) {
    return RW.variant(sec, 'hv', ['2', '1', '4', '3', '5', '6'], ['Ridge walk', 'Timeline', 'Quote fills in', 'Sketch: chapters', 'Sketch: ladder', 'Sketch: gable tabs']);
  }

  /* ---------------- always ---------------- */
  RW.add('how-ui', function () {
    var sec = RW.$('#how'); if (!sec) return;
    var v = variantOf(sec);
    var lis = RW.$$('.how-st', sec);

    /* v3: the stage in the middle of the viewport sets the picture */
    if (v === '3' && 'IntersectionObserver' in window) {
      var art = RW.$('.how-art', sec);
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          lis.forEach(function (li) { li.classList.toggle('is-cur', li === e.target); });
          art.setAttribute('data-s', e.target.getAttribute('data-st'));
        });
      }, { rootMargin: '-46% 0px -46% 0px' });
      lis.forEach(function (li) { io.observe(li); });
      lis[0].classList.add('is-cur');
    }

    /* v6: four gable tabs; arrows, Home/End and a sideways swipe move between steps */
    if (v === '6') tabs(sec, lis);
  });

  function tabs(sec, lis) {
    var body = RW.$('.how-body', sec), steps = RW.$('.how-steps', sec), list = RW.$('.how-list', sec);
    var sheet = RW.$('.how-sheet', sec), rows = RW.$$('.how-spec>div', sec);
    var HL = [[0, 1], [2, 3, 4, 5], [3, 5], []];
    var bar = document.createElement('div');
    bar.className = 'how-tabs'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Steps');
    var btns = lis.map(function (li, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'how-tab'; b.id = 'how-tab-' + (i + 1);
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'how-p-' + (i + 1));
      b.innerHTML = '<span class="how-tab-n" aria-hidden="true">0' + (i + 1) + '</span><span>' + NAMES[i] + '</span>';
      li.id = 'how-p-' + (i + 1); li.setAttribute('role', 'tabpanel'); li.setAttribute('aria-labelledby', b.id); li.tabIndex = 0;
      if (i < lis.length - 1) {
        var nx = document.createElement('button');
        nx.type = 'button'; nx.className = 'how-next';
        nx.innerHTML = 'Next: ' + NAMES[i + 1] + '<svg aria-hidden="true" viewBox="0 0 28 10"><path d="M0 5h26M21 1l5 4-5 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
        nx.addEventListener('click', function () { select(i + 1, true); });
        RW.$('.how-txt', li).appendChild(nx);
      }
      b.addEventListener('click', function () { select(i, false); });
      bar.appendChild(b);
      return b;
    });
    body.insertBefore(bar, steps);
    var cur = -1;
    function select(i, focusTab) {
      if (i === cur) return;
      cur = i;
      btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
      lis.forEach(function (li, k) {
        li.hidden = k !== i;
        if (k === i) { li.classList.remove('is-in'); void li.offsetWidth; li.classList.add('is-in'); }
      });
      rows.forEach(function (r, k) { r.classList.toggle('is-hl', HL[i].indexOf(k) > -1); });
      sheet.classList.toggle('is-mid', i < 3);
      if (focusTab) btns[i].focus();
    }
    bar.addEventListener('keydown', function (e) {
      var k = e.key, n = lis.length, to = -1;
      if (k === 'ArrowRight') to = (cur + 1) % n; else if (k === 'ArrowLeft') to = (cur + n - 1) % n;
      else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
      if (to > -1) { e.preventDefault(); select(to, true); }
    });
    /* swipe sideways on the panel (touch); vertical scrolling stays native (touch-action: pan-y) */
    var sx = 0, sy = 0, down = false;
    list.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; down = true; sx = e.clientX; sy = e.clientY; });
    list.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(RW.clamp(cur + (dx < 0 ? 1 : -1), 0, lis.length - 1), false);
    });
    list.addEventListener('pointercancel', function () { down = false; });
    select(0, false);
  }

  /* ---------------- motion ---------------- */
  RW.add('how-motion', function () {
    var sec = RW.$('#how'); if (!sec) return;
    var gsap = RW.gsap, ST = RW.ST, v = sec.getAttribute('data-v') || '1';
    var lis = RW.$$('.how-st', sec), nums = RW.$$('.how-n', sec);
    var sheet = RW.$('.how-sheet', sec), rows = RW.$$('.how-spec>div', sec);
    var foot = RW.$$('.how-sheet-foot span', sec), stamp = RW.$('.how-stamp', sec);
    sec.classList.add('is-live');
    RW.headings(sec);

    /* thumbnails drift a touch inside their roof cutouts */
    RW.$$('.how-thumb img', sec).forEach(function (im) {
      gsap.fromTo(im, { yPercent: -6, scale: 1.16 }, { yPercent: 6, scale: 1.16, ease: 'none',
        scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    /* ---- shared: reached state ---- */
    var reachedN = 0;
    function setReached(n) {
      reachedN = n;
      lis.forEach(function (li, k) { li.classList.toggle('is-reached', k < n); });
      foot.forEach(function (f, k) { f.classList.toggle('on', k < n); });
      if (n >= 2) { stage2 = true; maybeWrite(); }
      if (n >= 4) stampIn();
    }

    /* ---- shared: the sheet writes itself row by row ---- */
    var stage2 = false, sheetSeen = false, written = false;
    var dds = rows.map(function (r) { return RW.$('dd', r); });
    function blank(list) { list.forEach(function (r) { r.classList.add('is-blank'); gsap.set(RW.$('dd', r), { clipPath: 'inset(-2px 100% -2px 0)' }); }); }
    function write(list, delay) {
      var tl = gsap.timeline({ delay: delay || 0 });
      list.forEach(function (r, i) {
        var dd = RW.$('dd', r);
        tl.add(function () { r.classList.remove('is-blank'); }, i * 0.32);
        tl.to(dd, { clipPath: 'inset(-2px 0% -2px 0)', duration: 0.5, ease: 'power2.out', clearProps: 'clipPath' }, i * 0.32);
      });
      return tl;
    }
    function maybeWrite() {
      if (written || !stage2 || !sheetSeen || v === '4' || v === '6') return;
      written = true; write(rows);
    }
    if (v !== '4') {
      blank(rows);
      ST.create({ trigger: sheet, start: 'top 78%', once: true, onEnter: function () { sheetSeen = true; if (v === '6' || v === '3' || v === '2') stage2 = true; if (v === '6') { written = true; write(rows); } else maybeWrite(); } });
    }

    var stampShown = false;
    function stampIn() {
      if (!stamp || stampShown || v !== '4') return;
      stampShown = true;
      gsap.fromTo(stamp, { opacity: 0, scale: 1.25, rotation: -22 }, { opacity: 0.9, scale: 1, rotation: -10, duration: 0.55, ease: 'power3.out' });
    }

    /* ---- v1, v5: rail fills between the first and last number; numbers light as the line head passes ---- */
    if (v === '1' || v === '5') {
      var steps = RW.$('.how-steps', sec), rail = RW.$('.how-rail', sec), fill = RW.$('.how-rail-fill', sec);
      var first = nums[0], last = nums[nums.length - 1];
      var layout = function () {
        var sr = steps.getBoundingClientRect(), a = first.getBoundingClientRect(), b = last.getBoundingClientRect();
        var top = v === '5' ? 46 : a.top - sr.top + a.height / 2;
        rail.style.top = top + 'px';
        rail.style.height = Math.max(0, b.top - sr.top + b.height / 2 - top) + 'px';
      };
      layout();
      ST.addEventListener('refreshInit', layout);
      fill.style.transform = 'scaleY(0)';
      ST.create({ trigger: v === '5' ? rail : first, start: (v === '5' ? 'top' : 'center') + ' 62%', endTrigger: last, end: 'center 62%', scrub: true,
        onUpdate: function (s) { fill.style.transform = 'scaleY(' + s.progress.toFixed(4) + ')'; },
        onRefresh: function (s) { fill.style.transform = 'scaleY(' + s.progress.toFixed(4) + ')'; } });
      nums.forEach(function (n, i) {
        ST.create({ trigger: n, start: 'center 62%', onEnter: function () { setReached(Math.max(reachedN, i + 1)); }, onLeaveBack: function () { setReached(i); } });
      });
      RW.reveal(RW.$$('.how-txt', sec), { y: 18, stagger: 0.06 });
    }

    /* ---- v2: a figure walks the four-peak ridge ---- */
    if (v === '2') walkRidge(sec, lis, setReached, function () { return reachedN; });

    /* ---- v3: quiet the chapters that are not being read ---- */
    if (v === '3') {
      var art = RW.$('.how-art-svg', sec);
      gsap.fromTo(art, { scale: 1.04 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: 0.6 } });
      setReached(4);
    }

    /* ---- v4: the sheet fills as the stages pass ---- */
    if (v === '4') {
      var rowsFor = function (st) { return rows.filter(function (r) { return r.getAttribute('data-st') === String(st); }); };
      var done = {};
      blank(rows);
      if (stamp) gsap.set(stamp, { opacity: 0 });
      var writeStage = function (st) { if (done[st]) return; done[st] = true; write(rowsFor(st)); };
      RW.mm.add('(min-width: 1000px)', function () {
        var sts = lis.map(function (li, i) {
          return ST.create({ trigger: li, start: 'top 58%', onEnter: function () { setReached(Math.max(reachedN, i + 1)); if (i < 2) writeStage(i + 1); }, onLeaveBack: function () { setReached(i); } });
        });
        return function () { sts.forEach(function (s) { s.kill(); }); };
      });
      RW.mm.add('(max-width: 999px)', function () {
        /* the sheet sits below the steps here: it fills in one pass when it arrives */
        var s = ST.create({ trigger: sheet, start: 'top 70%', once: true, onEnter: function () {
          done[1] = done[2] = true;
          var tl = write(rows);
          tl.add(function () { setReached(1); }, 0).add(function () { setReached(2); }, 0.7)
            .add(function () { setReached(3); }, 1.6).add(function () { setReached(4); }, 2.1);
        } });
        return function () { s.kill(); };
      });
    }

    /* ---- v5 extra: the ground line and eave come in once ---- */
    if (v === '5') RW.reveal(RW.$$('.how-eave, .how-ground', sec), { y: 10 });

    if (v === '6') RW.reveal([RW.$('.how-tabs', sec)], { y: 16 });
  }, { motion: true });

  /* walker along a ridge with peaks at 12.5/37.5/62.5/87.5 percent of a 1000 x 120 box */
  function walkRidge(sec, lis, setReached, getN) {
    var ST = RW.ST;
    var ridge = RW.$('.how-ridge', sec), svg = RW.$('.how-ridge-svg', sec), walker = RW.$('.how-walker', sec);
    var crect = RW.$('.how-ridge-cr', sec), legA = RW.$('.hw-leg-a', sec), legB = RW.$('.hw-leg-b', sec), list = RW.$('.how-list', sec);
    var PX = [0, 60, 125, 190, 310, 375, 440, 560, 625, 690, 810, 875, 940, 1000];
    var PY = [100, 100, 24, 100, 100, 24, 100, 100, 24, 100, 100, 24, 100, 100];
    var PEAK = [125, 375, 625, 875];
    var box = { l: 0, t: 0, w: 1, h: 1 }, anchors = [0, 0, 0, 0], vh = window.innerHeight;
    function yAt(x) {
      for (var i = 1; i < PX.length; i++) if (x <= PX[i]) { var k = (x - PX[i - 1]) / (PX[i] - PX[i - 1]); return PY[i - 1] + (PY[i] - PY[i - 1]) * k; }
      return 100;
    }
    function measure() {
      vh = window.innerHeight;
      var rr = ridge.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      box = { l: sr.left - rr.left, t: sr.top - rr.top, w: sr.width, h: sr.height };
      var sy = window.pageYOffset;
      if (window.matchMedia('(min-width: 900px)').matches) {
        var base = list.getBoundingClientRect().top + sy - vh * 0.74;
        anchors = [0, 1, 2, 3].map(function (i) { return base + i * vh * 0.17; });
      } else {
        anchors = lis.map(function (li) { return li.getBoundingClientRect().top + sy - vh * 0.6; });
      }
    }
    function xFor(sy) {
      var S = [anchors[0] - vh * 0.3].concat(anchors, [anchors[3] + vh * 0.3]), X = [0].concat(PEAK, [1000]);
      if (sy <= S[0]) return 0;
      for (var i = 1; i < S.length; i++) if (sy <= S[i]) return X[i - 1] + (X[i] - X[i - 1]) * (sy - S[i - 1]) / Math.max(1, S[i] - S[i - 1]);
      return 1000;
    }
    var lastX = -1;
    function render() {
      var sy = window.pageYOffset, x = xFor(sy);
      var n = 0; anchors.forEach(function (a) { if (sy >= a) n++; });
      if (n !== getN()) setReached(n);
      if (Math.abs(x - lastX) < 0.05) return; lastX = x;
      var y = yAt(x), y2 = yAt(Math.min(1000, x + 4));
      var px = box.l + x / 1000 * box.w, py = box.t + y / 120 * box.h;
      var ang = Math.atan2((y2 - y) / 120 * box.h, 4 / 1000 * box.w) * 180 / Math.PI;
      walker.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) rotate(' + (ang * 0.22).toFixed(1) + 'deg)';
      var ph = Math.sin(x / 1000 * box.w / 7);
      legA.style.transform = 'rotate(' + (ph * 20).toFixed(1) + 'deg)';
      legB.style.transform = 'rotate(' + (-ph * 20).toFixed(1) + 'deg)';
      crect.setAttribute('transform', 'scale(' + (x / 1000).toFixed(4) + ',1)');
    }
    measure();
    ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: render, onRefresh: function () { measure(); lastX = -1; render(); } });
    window.addEventListener('resize', function () { measure(); lastX = -1; render(); });
    render();
  }
}());
