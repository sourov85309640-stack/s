/* Depth engine (owner: lead). Declarative layered parallax for every section.
   Any element inside a section can carry:
     data-depth="0.25"   scroll speed factor. Positive drifts up faster than the page (foreground feel),
                         negative lags behind (background feel). Typical: back -0.15..-0.05, front 0.1..0.4
     data-drift="40"     horizontal drift in px across one viewport of scroll (clouds, birds)
     data-rot="6"        degrees of rotation across one viewport of scroll (leaves, tile fragments)
     data-px="10"        pointer parallax in px on fine pointers (data-py for a different vertical amount)
   Movement uses the individual CSS properties `translate` and `rotate`, so it never fights GSAP (which writes
   `transform`). The frame is the closest <section>, [data-depth-frame] or <footer>. Frames are cached on refresh
   and only frames near the viewport are updated: no layout reads per frame. Nothing runs under reduced motion
   or data-motion="off": every layer simply sits where the CSS puts it. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('depth', function () {
    var els = RW.$$('[data-depth],[data-drift],[data-rot],[data-px],[data-py]');
    if (!els.length) return;
    var frames = [], byFrame = new Map();
    els.forEach(function (el) {
      var f = el.closest('[data-depth-frame],section,footer,header') || document.body;
      if (!byFrame.has(f)) { var rec = { el: f, top: 0, h: 0, on: false, items: [] }; byFrame.set(f, rec); frames.push(rec); }
      byFrame.get(f).items.push({
        el: el,
        depth: parseFloat(el.getAttribute('data-depth')) || 0,
        drift: parseFloat(el.getAttribute('data-drift')) || 0,
        rot: parseFloat(el.getAttribute('data-rot')) || 0,
        px: RW.fine ? (parseFloat(el.getAttribute('data-px')) || 0) : 0,
        py: RW.fine ? (el.hasAttribute('data-py') ? parseFloat(el.getAttribute('data-py')) : (parseFloat(el.getAttribute('data-px')) || 0) * 0.6) : 0,
        lx: 1e9, ly: 1e9, lr: 1e9
      });
    });
    var vh = window.innerHeight;
    function measure() {
      vh = window.innerHeight;
      var sy = window.pageYOffset;
      frames.forEach(function (f) {
        /* undo our own translate while measuring is unnecessary: frames are sections, which we never move */
        var r = f.el.getBoundingClientRect();
        f.top = r.top + sy; f.h = r.height;
      });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', function () { setTimeout(measure, 120); });
    if (RW.ST) RW.ST.addEventListener('refresh', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    frames.forEach(function (f) {
      RW.onView(f.el, { margin: '25% 0px 25% 0px', enter: function () { f.on = true; }, leave: function () { f.on = false; } });
    });

    /* pointer, eased */
    var tx = 0, ty = 0, nx = 0, ny = 0;
    if (RW.fine) {
      window.addEventListener('pointermove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
      document.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    }

    RW.tick(function (t, dt) {
      var k = 1 - Math.pow(0.001, dt); /* ~ 0.1 per frame at 60fps */
      nx += (tx - nx) * k; ny += (ty - ny) * k;
      var sy = window.pageYOffset, mid = sy + vh / 2;
      for (var i = 0; i < frames.length; i++) {
        var f = frames[i];
        if (!f.on) continue;
        var rel = mid - (f.top + f.h / 2);   /* px past the frame's centre */
        var u = rel / vh;                     /* in viewports */
        for (var j = 0; j < f.items.length; j++) {
          var it = f.items[j];
          var x = it.drift * u + it.px * nx;
          var y = -rel * it.depth + it.py * ny;
          if (Math.abs(x - it.lx) > 0.15 || Math.abs(y - it.ly) > 0.15) {
            it.lx = x; it.ly = y;
            it.el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
          }
          if (it.rot) {
            var r = it.rot * u;
            if (Math.abs(r - it.lr) > 0.05) { it.lr = r; it.el.style.rotate = r.toFixed(2) + 'deg'; }
          }
        }
      }
    });
    RW.depth = { measure: measure, frames: frames };
  }, { motion: true });
}());

/* Layer guard (owner: lead). A decoration in .layers must never sit behind or over text. On load and after a resize,
   any small piece (an icon, bird, cloud, leaf) whose resting box touches a heading, paragraph, list item or link in its section is hidden at that
   screen size (class is-clash). Runs with or without motion; resting box = measured with our own movement cleared. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('layer-guard', function () {
    var pieces = RW.$$('.layers > *');
    if (!pieces.length) return;
    var PAD = 6;
    function rest(el) {
      var s = el.style, t = s.translate, r = s.rotate, tr = s.transform;
      s.translate = 'none'; s.rotate = 'none'; s.transform = 'none';
      var b = el.getBoundingClientRect();
      s.translate = t; s.rotate = r; s.transform = tr;
      return b;
    }
    function check() {
      var bySec = new Map();
      pieces.forEach(function (el) { el.classList.remove('is-clash'); });
      pieces.forEach(function (el) {
        if (getComputedStyle(el).display === 'none') return;
        var sec = el.closest('section,footer'); if (!sec) return;
        if (!bySec.has(sec)) {
          bySec.set(sec, RW.$$('h1,h2,h3,p,li,a,label,dt,dd,blockquote', sec).filter(function (t) {
            return !t.closest('.layers') && t.textContent.trim() && t.getClientRects().length;
          }).map(function (t) { return t.getBoundingClientRect(); }));
        }
        var b = rest(el); if (!b.width || !b.height) return;
        if (b.width > 200 || b.height > 240) return;   /* full-width backdrops (skylines, textures, rain) are meant to sit behind */
        var hit = bySec.get(sec).some(function (r) {
          return b.left < r.right + PAD && b.right > r.left - PAD && b.top < r.bottom + PAD && b.bottom > r.top - PAD;
        });
        if (hit) el.classList.add('is-clash');
      });
    }
    var t = 0;
    var later = function () { clearTimeout(t); t = setTimeout(check, 250); };
    check();
    window.addEventListener('load', later);
    window.addEventListener('resize', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  });
}());
