/* AREAS section behaviour (prototype: ?av=1..5).
   areas-ui (always): variant switch, map pins and roads, chip <-> pin highlight, orbit placement, v5 search + van.
   areas-motion (motion only): heading, ripple only while visible, one-time arrival of pins / tiles / houses. */
(function () {
  'use strict';
  var RW = window.RW;
  var sec = document.getElementById('areas');
  if (!sec) return;
  var V = +RW.variant(sec, 'av', ['2', '1', '3', '4', '5'], ['Rooftops', 'Contour map', 'Sketch: distance rings', 'Sketch: tile grid', 'Sketch: route and search']);

  var towns = RW.$$('.are-town', sec);
  var stage = RW.$('.are-stage', sec);
  var homeIdx = Math.max(0, towns.findIndex(function (t) { return t.classList.contains('is-home'); }));
  /* positions: data-pos "x,y" in percent, or spread evenly round the base */
  var pos = towns.map(function (t, i) {
    var p = (t.getAttribute('data-pos') || '').split(',');
    if (p.length === 2 && !isNaN(parseFloat(p[0]))) return { x: parseFloat(p[0]), y: parseFloat(p[1]) };
    if (i === homeIdx) return { x: 50, y: 50 };
    var a = (i / towns.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 36, y: 50 + Math.sin(a) * 36 };
  });
  var home = pos[homeIdx];
  var api = RW.areas = { V: V, pos: pos };

  RW.add('areas-ui', function () {
    var pins = [], roads = [];
    function highlight(i, on) {
      towns[i].classList.toggle('is-hl', on);
      if (pins[i]) pins[i].classList.toggle('is-hl', on);
      if (roads[i]) roads[i].classList.toggle('is-hl', on);
    }
    towns.forEach(function (t, i) {
      var a = RW.$('a', t);
      a.addEventListener('pointerenter', function () { highlight(i, true); if (api.spoke) api.spoke(i); });
      a.addEventListener('pointerleave', function () { highlight(i, false); if (api.spoke) api.spoke(-1); });
      a.addEventListener('focus', function () { highlight(i, true); if (api.spoke) api.spoke(i); });
      a.addEventListener('blur', function () { highlight(i, false); if (api.spoke) api.spoke(-1); });
    });

    /* pins (v1 map, v3 rings on small screens) */
    var pinBox = document.createElement('span'); pinBox.className = 'are-pins';
    stage.appendChild(pinBox);
    var ripple = RW.$('.are-ripple', stage);

    if (V === 1) {
      var g = RW.$('.m-roads', stage), NS = 'http://www.w3.org/2000/svg';
      towns.forEach(function (t, i) {
        var p = pos[i], pin = document.createElement('span');
        pin.className = 'are-pin' + (i === homeIdx ? ' is-home' : '');
        pin.style.left = p.x + '%'; pin.style.top = p.y + '%';
        pinBox.appendChild(pin); pins[i] = pin;
        if (i !== homeIdx) {
          var l = document.createElementNS(NS, 'line');
          l.setAttribute('x1', home.x); l.setAttribute('y1', home.y * 0.625); l.setAttribute('x2', p.x); l.setAttribute('y2', p.y * 0.625);
          g.appendChild(l); roads[i] = l;
        }
        t.style.left = p.x + '%'; t.style.top = p.y + '%';
      });
      ripple.style.left = home.x + '%'; ripple.style.top = home.y + '%';
    }

    if (V === 3) {
      /* bearing from the base, ring by distance rank */
      var others = towns.map(function (t, i) { return i; }).filter(function (i) { return i !== homeIdx; });
      var dist = others.map(function (i) { return Math.hypot(pos[i].x - home.x, (pos[i].y - home.y) * 0.62); });
      var sorted = dist.slice().sort(function (a, b) { return a - b; });
      var R = [26, 38, 49];
      var place = [];
      others.forEach(function (i, k) {
        var rank = sorted.indexOf(dist[k]);
        var ring = R[Math.min(2, Math.floor(rank / Math.ceil(others.length / 3)))];
        var a = Math.atan2(pos[i].y - home.y, pos[i].x - home.x);
        place[i] = { x: 50 + Math.cos(a) * ring, y: 50 + Math.sin(a) * ring, a: a, r: ring };
      });
      place[homeIdx] = { x: 50, y: 50, a: 0, r: 0 };
      towns.forEach(function (t, i) {
        var p = place[i];
        t.style.left = p.x + '%'; t.style.top = p.y + '%';
        var pin = document.createElement('span');
        pin.className = 'are-pin' + (i === homeIdx ? ' is-home' : '');
        pin.style.left = p.x + '%'; pin.style.top = p.y + '%';
        pinBox.appendChild(pin); pins[i] = pin;
      });
      ripple.style.left = '50%'; ripple.style.top = '50%';
      var spoke = RW.$('.are-spoke', stage);
      api.spoke = function (i) {
        if (i < 0 || i === homeIdx) { spoke.classList.remove('is-on'); return; }
        var w = stage.offsetWidth, p = place[i], len = (p.r / 100) * w;
        spoke.style.transform = 'rotate(' + (p.a * 180 / Math.PI).toFixed(1) + 'deg) scaleX(' + (len / 100).toFixed(3) + ')';
        spoke.classList.add('is-on');
      };
    }

    if (V === 5) search();

    function search() {
      var form = RW.$('.are-find', sec), input = RW.$('#are-q', sec), out = RW.$('.are-result', sec);
      var phone = RW.$('.are-note a', sec);
      var names = towns.map(function (t) { return RW.$('.are-name', t).textContent.trim(); });
      var van = RW.$('.are-van', stage), list = RW.$('.are-list', sec), wrap = RW.$('.are-wrap', sec);
      form.hidden = false;
      wrap.appendChild(van);
      function moveVan(i) {
        var dot = RW.$('.are-dot', towns[i]), wr = wrap.getBoundingClientRect(), r = dot.getBoundingClientRect();
        var desk = window.innerWidth >= 900;
        var x = r.left - wr.left + r.width / 2 - 17, y = r.top - wr.top + r.height / 2 - (desk ? 30 : 9 + 26);
        van.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (desk ? '' : ' rotate(90deg)');
      }
      api.moveVan = moveVan;
      var cur = homeIdx;
      moveVan(cur);
      window.addEventListener('resize', function () { moveVan(cur); });
      function norm(s) { return s.toLowerCase().replace(/[^a-z]/g, ''); }
      input.addEventListener('input', function () {
        var q = norm(input.value);
        var hits = q ? names.map(function (n, i) { return norm(n).indexOf(q) === 0 || (q.length > 2 && norm(n).indexOf(q) > -1) ? i : -1; }).filter(function (i) { return i > -1; }) : [];
        towns.forEach(function (t, i) {
          t.classList.toggle('is-hl', hits.indexOf(i) > -1);
          t.classList.toggle('is-dim', !!q && hits.indexOf(i) === -1);
        });
        if (!q) { out.textContent = ''; cur = homeIdx; moveVan(cur); return; }
        if (hits.length === 1) {
          var n = names[hits[0]];
          out.innerHTML = 'Yes, we cover ' + n + '. <a href="?town=' + encodeURIComponent(n) + '#contact">Start your enquiry for ' + n + '</a>';
          cur = hits[0]; moveVan(cur);
        } else if (hits.length > 1) {
          out.textContent = hits.length + ' towns match. Keep typing or pick one below.';
        } else if (q.length >= 3) {
          out.innerHTML = 'Not on our list. <a href="' + phone.getAttribute('href') + '">Call ' + phone.textContent.replace(/^Call\s*/, '') + '</a> and ask, it may still be close enough.';
        } else out.textContent = '';
      });
    }
  });

  RW.add('areas-motion', function () {
    var gsap = RW.gsap, ST = RW.ST;
    RW.headings(sec);
    /* ripples only animate while the section is on screen */
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
    if (V === 1 || V === 3) {
      var pins = RW.$$('.are-pin', sec), chips = RW.$$('.are-chip', sec);
      var desk = window.innerWidth >= 900;
      gsap.set(pins, { opacity: 0, scale: 0.94 });
      if (desk) gsap.set(chips, { opacity: 0, y: 8 });
      if (V === 1) RW.$$('.m-roads line', sec).forEach(function (l) { l.style.opacity = 0; });
      if (V === 3) gsap.set(RW.$$('.are-rings circle', sec), { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      ST.create({ trigger: stage, start: 'top 75%', once: true, onEnter: function () {
        if (V === 3) gsap.to(RW.$$('.are-rings circle', sec), { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 });
        gsap.to(pins, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.15, clearProps: 'transform,opacity' });
        if (desk) gsap.to(chips, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.25, clearProps: 'transform,opacity' });
        if (V === 1) RW.$$('.m-roads line', sec).forEach(function (l, i) { gsap.to(l, { opacity: 0.45, duration: 0.6, delay: 0.3 + i * 0.05, clearProps: 'opacity' }); });
      } });
    }
    if (V === 2) {
      var roofs = RW.$$('.h-roof', sec);
      gsap.set(roofs, { y: -14, opacity: 0 });
      ST.create({ trigger: RW.$('.are-list', sec), start: 'top 80%', once: true, onEnter: function () {
        gsap.to(roofs, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity' });
        /* then the windows light in a wave out from the home town, like an evening across the Cotswolds */
        var home = RW.$('.are-town.is-home', sec), hp = home ? (home.getAttribute('data-pos') || '50,50').split(',') : [50, 50];
        towns.forEach(function (t) {
          var q = (t.getAttribute('data-pos') || '50,50').split(','), dist = Math.hypot(q[0] - hp[0], q[1] - hp[1]);
          setTimeout(function () { t.classList.add('is-lit'); setTimeout(function () { t.classList.remove('is-lit'); }, 1400); }, 900 + dist * 16);
        });
      } });
      /* each chimney puffs when its town is hovered, focused or tapped */
      towns.forEach(function (t) {
        var ch = RW.$('.h-ch', t), chip = RW.$('.are-chip', t), roof = RW.$('.h-roof', t);
        if (!ch || !chip || !roof) return;
        var bb; try { bb = ch.getBBox(); } catch (e) { return; }
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'h-smoke');
        var cx = bb.x + bb.width / 2, cy = bb.y - 2;
        g.innerHTML = '<circle cx="' + cx + '" cy="' + cy + '" r="2.6"/><circle cx="' + (cx + 2) + '" cy="' + (cy - 5) + '" r="3.4"/><circle cx="' + (cx - 1) + '" cy="' + (cy - 11) + '" r="4"/>';
        roof.appendChild(g);
        var puff = function () { if (chip.classList.contains('is-puff')) return; chip.classList.add('is-puff'); setTimeout(function () { chip.classList.remove('is-puff'); }, 1300); };
        chip.addEventListener('pointerenter', puff); chip.addEventListener('focus', puff); chip.addEventListener('pointerdown', puff);
      });
    }
    if (V === 4) {
      var tiles = RW.$$('.are-town', sec);
      gsap.set(tiles, { y: -18, opacity: 0 });
      ST.create({ trigger: RW.$('.are-list', sec), start: 'top 80%', once: true, onEnter: function () {
        gsap.to(tiles, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' });
      } });
    }
  }, { motion: true });
}());
