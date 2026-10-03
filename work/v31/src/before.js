/* BEFORE AND AFTER (owner: lead). The range input drives --bf. On fine pointers the handle eases after the pointer while it
   hovers the drawing; crossing a repaired part lights up its note. On arrival the handle sweeps once to show it moves. */
(function () {
  'use strict';
  var RW = window.RW;
  (function () { var s = document.getElementById('before'); if (s) RW.variant(s, 'bfv', ['1','2'], ['Slider with notes beside','Wide slider, notes below']); }());
  RW.add('before', function () {
    var sec = RW.$('#before'); if (!sec) return;
    var view = RW.$('.bf-view', sec), range = RW.$('.bf-range', sec), notes = RW.$$('.bf-notes li', sec);
    var tagB = RW.$('.bf-tag-b', sec), tagA = RW.$('.bf-tag-a', sec);
    sec.classList.add('is-js');
    if (RW.headings) RW.headings(sec);
    var HIT = [{ at: 46, i: 0 }, { at: 84, i: 1 }, { at: 66, i: 2 }];   /* where each repair sits across the drawing (%) */
    var val = 50, shown = 50, target = 50, last = 50, raf = 0;
    function paint(v) {
      view.style.setProperty('--bf', v.toFixed(2) + '%');
      tagB.style.opacity = v < 12 ? 0 : 1; tagA.style.opacity = v > 88 ? 0 : 1;
      HIT.forEach(function (h) {
        if ((last < h.at && v >= h.at) || (last > h.at && v <= h.at)) {
          var li = notes[h.i]; li.classList.add('is-hit'); clearTimeout(li._t); li._t = setTimeout(function () { li.classList.remove('is-hit'); }, 900);
        }
      });
      last = v;
    }
    function text(v) { return v < 10 ? 'Mostly after' : v > 90 ? 'Mostly before' : v < 40 ? 'More after than before' : v > 60 ? 'More before than after' : 'Half before, half after'; }
    function set(v, fromInput) {
      val = RW.clamp(v, 0, 100);
      if (!fromInput) range.value = Math.round(val);
      range.setAttribute('aria-valuetext', text(val));
      target = val; loop();
    }
    function loop() {
      if (raf) return;
      raf = requestAnimationFrame(function step() {
        shown += (target - shown) * (RW.motionOK ? 0.22 : 1);
        if (Math.abs(target - shown) < 0.05) shown = target;
        paint(shown);
        raf = shown !== target ? requestAnimationFrame(step) : 0;
      });
    }
    range.addEventListener('input', function () { set(+range.value, true); });
    range.addEventListener('pointerdown', function () { view.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { view.classList.remove('is-drag'); });
    if (RW.fine) {
      range.addEventListener('pointermove', function (e) {
        var r = view.getBoundingClientRect();
        set((e.clientX - r.left) / r.width * 100, false);
      });
    }
    paint(50);
    RW.onView(sec, { margin: '0px', enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
    if (RW.motionOK) {
      RW.onView(view, { once: true, margin: '0px 0px -30% 0px', enter: function () {
        var o = { v: 50 };
        RW.gsap.timeline({ delay: 0.3, onUpdate: function () { target = shown = o.v; paint(o.v); range.value = Math.round(o.v); } })
          .to(o, { v: 22, duration: 0.7, ease: 'power2.inOut' })
          .to(o, { v: 78, duration: 1, ease: 'power2.inOut' })
          .to(o, { v: 50, duration: 0.6, ease: 'power2.out' });
      } });
    }
  });
}());
