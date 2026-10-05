/* ROOFS WE WORK ON (owner: lead). Tabs with a drawn swatch that is built in code for each roof type.
   Each piece is its own <g>: it is laid from the eaves up when a type is chosen (CSS, motion only) and lifts when the
   pointer runs over it (CSS :hover, fine pointers only). Runs without motion too: the swatch is simply drawn. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('types'); if (s) RW.variant(s, 'tyv', ['3','1','2'], ['Roof first, words beside','Tabs beside the roof','Tabs above a big roof']); }());
  RW.add('types', function () {
    var sec = RW.$('#types'); if (!sec) return;
    var tabs = RW.$$('.ty-tab', sec), panels = RW.$$('.ty-panel', sec);
    var svg = RW.$('.ty-sw', sec), gP = RW.$('.ty-pieces', svg), gT = RW.$('.ty-trim', svg);
    var NS = 'http://www.w3.org/2000/svg';
    sec.classList.add('is-js');
    if (RW.headings) RW.headings(sec);

    /* the roof outline every swatch is clipped to: a hipped slope seen from the front */
    var W = 560, EAVES = 330, RIDGE = 62, LEFT = 40, RIGHT = 520, TOPL = 128, TOPR = 432;
    var clip = el('clipPath', { id: 'ty-clip' }); clip.appendChild(el('path', { d: shape() }));
    var defs = el('defs'); defs.appendChild(clip); svg.insertBefore(defs, svg.firstChild);
    gP.setAttribute('clip-path', 'url(#ty-clip)');
    function shape() { return 'M' + LEFT + ' ' + EAVES + 'L' + TOPL + ' ' + RIDGE + 'H' + TOPR + 'L' + RIGHT + ' ' + EAVES + 'Z'; }

    function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
    function pick(R, arr) { return arr[Math.floor(R() * arr.length)]; }

    /* one piece: outer g (laid) > inner g (lifts) > shapes */
    function piece(row, i, shapes) {
      var g = el('g', { 'class': 'ty-pc' }), inner = el('g', { 'class': 'ty-pcs' });
      g.style.setProperty('--d', (row * 45 + i * 9) + 'ms');
      shapes.forEach(function (s) { inner.appendChild(s); });
      g.appendChild(inner); gP.appendChild(g);
    }
    function courses(rowH, fn) {             /* rows from the eaves up; rowH may be a function of the row index */
      var y = EAVES + 6, row = 0;
      while (y > RIDGE - 10) { var h = typeof rowH === 'function' ? rowH(row) : rowH; y -= h; fn(row, y, h); row++; }
    }

    var B = {
      tiles: function () {
        var R = rnd(3), cols = ['#C9774F', '#B8643F', '#D48A60', '#BF6E47', '#C47A55'];
        courses(26, function (row, y, h) {
          var w = 40, off = row % 2 ? -w / 2 : 0, i = 0;
          for (var x = LEFT - w + off; x < RIGHT + w; x += w, i++) {
            var c = pick(R, cols);
            piece(row, i, [
              el('path', { d: 'M' + (x + 1) + ' ' + y + 'h' + (w - 2) + 'v' + (h + 4) + 'q-' + ((w - 2) / 2) + ' 4 -' + (w - 2) + ' 0z', fill: c, stroke: 'rgba(90,40,20,.45)', 'stroke-width': '1' }),
              el('path', { d: 'M' + (x + 4) + ' ' + (y + h + 1) + 'h' + (w - 8), stroke: 'rgba(255,255,255,.22)', 'stroke-width': '1.2', fill: 'none' })
            ]);
          }
        });
        return 'ridge';
      },
      slate: function () {
        var R = rnd(5), cols = ['#5E6B73', '#6B7880', '#57636B', '#66737B', '#4F5B62'];
        courses(20, function (row, y, h) {
          var w = 34, off = row % 2 ? -w / 2 : 0, i = 0;
          for (var x = LEFT - w + off; x < RIGHT + w; x += w, i++) {
            piece(row, i, [
              el('rect', { x: x + 0.8, y: y, width: w - 1.6, height: h + 9, rx: 1, fill: pick(R, cols), stroke: 'rgba(20,28,32,.5)', 'stroke-width': '.8' }),
              el('path', { d: 'M' + (x + 3) + ' ' + (y + 3) + 'l' + (w - 8) + ' ' + (R() * 2 - 1).toFixed(1), stroke: 'rgba(255,255,255,.12)', 'stroke-width': '1', fill: 'none' })
            ]);
          }
        });
        return 'ridge-slate';
      },
      stone: function () {
        var R = rnd(9), cols = ['#C9B48E', '#BFA77E', '#B5A07A', '#CDBB98', '#B09A72'];
        courses(function (row) { return Math.max(12, 34 - row * 2); }, function (row, y, h) {
          var x = LEFT - 40 - R() * 30, i = 0;
          while (x < RIGHT + 40) {
            var w = h * (1.3 + R() * 1.4), s = [
              el('path', { d: 'M' + (x + 1) + ' ' + (y + 1) + 'h' + (w - 2) + 'l' + (R() * 2 - 1).toFixed(1) + ' ' + (h + 6) + 'h-' + (w - 2) + 'z', fill: pick(R, cols), stroke: 'rgba(80,64,40,.5)', 'stroke-width': '1', 'stroke-linejoin': 'round' })
            ];
            if (R() < 0.3) s.push(el('circle', { cx: x + w * R(), cy: y + h * (0.4 + R() * 0.5), r: 1.5 + R() * 2.5, fill: R() < 0.5 ? '#C8C27A' : '#9FA86A', opacity: '.8' }));
            piece(row, i++, s); x += w;
          }
        });
        return 'ridge-stone';
      },
      flat: function () {
        var R = rnd(13), i = 0;
        for (var x = LEFT - 20; x < RIGHT + 20; x += 74, i++) {
          piece(0, i, [
            el('rect', { x: x, y: RIDGE - 10, width: 78, height: EAVES - RIDGE + 20, fill: i % 2 ? '#4A5257' : '#525B60', stroke: 'rgba(0,0,0,.35)', 'stroke-width': '1' }),
            el('path', { d: 'M' + (x + 74) + ' ' + RIDGE + 'V' + EAVES, stroke: 'rgba(255,255,255,.14)', 'stroke-width': '2', fill: 'none' })
          ]);
        }
        for (var k = 0; k < 26; k++) piece(2, k, [el('circle', { cx: LEFT + 30 + R() * (RIGHT - LEFT - 60), cy: RIDGE + 40 + R() * (EAVES - RIDGE - 60), r: 1.2 + R() * 1.4, fill: 'rgba(255,255,255,.18)' })]);
        piece(3, 0, [el('ellipse', { cx: 300, cy: 250, rx: 70, ry: 12, fill: 'rgba(140,175,195,.35)' })]);   /* a puddle: ponding */
        return 'flat';
      },
      lead: function () {
        var i = 0;
        for (var x = LEFT - 30; x < RIGHT + 30; x += 56, i++) {
          piece(0, i, [
            el('rect', { x: x, y: RIDGE - 10, width: 56, height: EAVES - RIDGE + 20, fill: i % 2 ? '#8E9AA0' : '#97A2A7' }),
            el('rect', { x: x + 50, y: RIDGE - 10, width: 8, height: EAVES - RIDGE + 20, rx: 4, fill: '#B3BCC0', stroke: 'rgba(40,50,55,.4)', 'stroke-width': '1' }),
            el('path', { d: 'M' + (x + 10) + ' ' + (RIDGE + 30 + (i * 37) % 120) + 'q12 8 30 2', stroke: 'rgba(255,255,255,.25)', 'stroke-width': '1.5', fill: 'none' })
          ]);
        }
        return 'ridge-lead';
      },
      heritage: function () {
        var R = rnd(21), cols = ['#B5603C', '#A4532F', '#C26F48', '#8F4A2C', '#C98058', '#9C5A3A'];
        courses(20, function (row, y, h) {
          var w = 30, off = row % 2 ? -w / 2 : 0, i = 0;
          for (var x = LEFT - w + off; x < RIGHT + w; x += w, i++) {
            var rot = (R() * 4 - 2).toFixed(1), cx = x + w / 2, cy = y + h / 2, s = [
              el('path', { d: 'M' + (x + 1) + ' ' + y + 'h' + (w - 2) + 'v' + (h + 3) + 'q-' + ((w - 2) / 2) + ' 3 -' + (w - 2) + ' 0z', fill: pick(R, cols), stroke: 'rgba(70,30,15,.5)', 'stroke-width': '.9', transform: 'rotate(' + rot + ' ' + cx + ' ' + cy + ')' })
            ];
            if (R() < 0.12) s.push(el('ellipse', { cx: x + w * R(), cy: y + h - 2, rx: 4 + R() * 4, ry: 2 + R() * 1.5, fill: '#8C9A55', opacity: '.85' }));
            piece(row, i, s);
          }
        });
        return 'ridge';
      }
    };

    function trim(kind) {
      gT.textContent = '';
      var edge = { d: shape(), fill: 'none', stroke: 'rgba(31,43,48,.55)', 'stroke-width': '2', 'stroke-linejoin': 'round' };
      gT.appendChild(el('path', edge));
      if (kind === 'flat') {
        gT.appendChild(el('path', { d: 'M' + (LEFT - 6) + ' ' + (EAVES + 4) + 'H' + (RIGHT + 6), stroke: '#3F4A50', 'stroke-width': '6', 'stroke-linecap': 'round' }));
        gT.appendChild(el('path', { d: 'M' + (TOPL - 4) + ' ' + (RIDGE - 4) + 'H' + (TOPR + 4), stroke: '#C9B9A2', 'stroke-width': '8', 'stroke-linecap': 'round' }));
        return;
      }
      var col = kind === 'ridge-slate' ? '#4A565D' : kind === 'ridge-stone' ? '#A89270' : kind === 'ridge-lead' ? '#7E8A90' : '#A5532F';
      /* ridge pieces fit exactly between the two top corners; each covering gets its real ridge:
         half-round clay on tiles, an angled ridge on slate and stone, a folded flat cap on lead and metal */
      var span = TOPR - TOPL;
      if (kind === 'ridge-lead') {
        gT.appendChild(el('path', { d: 'M' + TOPL + ' ' + (RIDGE + 2) + 'L' + (TOPL + 4) + ' ' + (RIDGE - 7) + 'H' + (TOPR - 4) + 'L' + TOPR + ' ' + (RIDGE + 2) + 'Z', fill: col, stroke: 'rgba(31,43,48,.5)', 'stroke-width': '1.2', 'stroke-linejoin': 'round', 'class': 'ty-ridge' }));
        gT.appendChild(el('path', { d: 'M' + (TOPL + 6) + ' ' + (RIDGE - 3) + 'H' + (TOPR - 6), stroke: 'rgba(255,255,255,.35)', 'stroke-width': '1.2', fill: 'none', 'class': 'ty-ridge' }));
      } else {
        var n = Math.max(1, Math.round(span / 34)), w = span / n, angled = kind === 'ridge-slate' || kind === 'ridge-stone';
        for (var k = 0; k < n; k++) {
          var x = TOPL + k * w;
          var d = angled ? 'M' + x + ' ' + (RIDGE + 3) + 'L' + (x + 2) + ' ' + (RIDGE - 6) + 'H' + (x + w - 2) + 'L' + (x + w) + ' ' + (RIDGE + 3) + 'Z'
                         : 'M' + x + ' ' + (RIDGE + 3) + 'q' + (w / 2) + ' -16 ' + w + ' 0';
          gT.appendChild(el('path', { d: d, fill: col, stroke: 'rgba(31,43,48,.5)', 'stroke-width': '1.2', 'stroke-linejoin': 'round', 'class': 'ty-ridge' }));
        }
      }
      gT.appendChild(el('path', { d: 'M' + (LEFT - 8) + ' ' + (EAVES + 6) + 'H' + (RIGHT + 8), stroke: '#3F4A50', 'stroke-width': '7', 'stroke-linecap': 'round', fill: 'none' }));   /* gutter */
      gT.appendChild(el('path', { d: 'M' + (RIGHT - 30) + ' ' + (EAVES + 9) + 'v40', stroke: '#3F4A50', 'stroke-width': '6', 'stroke-linecap': 'round' }));   /* downpipe */
    }

    var curKind = '';
    function build(kind) {
      if (kind === curKind) return; curKind = kind;
      gP.textContent = '';
      sec.setAttribute('data-sw', kind);
      svg.classList.remove('is-laying'); void svg.getBoundingClientRect();
      trim((B[kind] || B.tiles)());
      svg.classList.add('is-laying');
      clearTimeout(build.t); build.t = setTimeout(function () { svg.classList.remove('is-laying'); }, 2400);
    }

    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
      build(tabs[i].getAttribute('data-swatch'));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j > -1) { e.preventDefault(); select(j, true); }
      });
    });
    /* draw the first swatch now; the lay animation waits until the section is on screen */
    svg.classList.add('is-wait');
    select(0, false);
    RW.onView(svg, { once: true, margin: '0px 0px -20% 0px', enter: function () { svg.classList.remove('is-wait'); curKind = ''; build(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0].getAttribute('data-swatch')); } });
  });
}());
