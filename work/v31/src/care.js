/* LOOKING AFTER YOUR ROOF (owner: lead). Season tabs; opens on today's season. The tree leans towards a fine pointer
   and shakes a little when the pointer passes through its crown. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('care', function () {
    var sec = RW.$('#care'); if (!sec) return;
    var tabs = RW.$$('.cr-tab', sec), panels = RW.$$('.cr-panel', sec);
    if (RW.headings) RW.headings(sec);
    function select(i, focus) {
      tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; panels[k].classList.toggle('is-in', on); });
      sec.setAttribute('data-season', tabs[i].getAttribute('data-s'));
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
        if (j > -1) { e.preventDefault(); select(j, true); }
      });
    });
    var m = new Date().getMonth(), now = m >= 8 && m <= 10 ? 0 : (m === 11 || m <= 1) ? 1 : m <= 4 ? 2 : 3;
    select(now, false);
    RW.onView(sec, { enter: function () { sec.classList.add('is-live'); }, leave: function () { sec.classList.remove('is-live'); } });
    if (!RW.fine || !RW.motionOK) return;
    var tree = RW.$('.cr-tree', sec), svg = RW.$('.cr-scene', sec), lean = 0, target = 0, stop = null;
    svg.addEventListener('pointermove', function (e) {
      var m2 = svg.getScreenCTM(); if (!m2) return;
      var sx = (e.clientX - m2.e) / m2.a; target = RW.clamp((sx - 78) / 160, -1, 1) * 6;
      if (!stop) stop = RW.tick(step);
    });
    svg.addEventListener('pointerleave', function () { target = 0; if (!stop) stop = RW.tick(step); });
    function step(t, dt) {
      lean += (target - lean) * Math.min(1, dt * 4);
      tree.style.transform = 'rotate(' + lean.toFixed(2) + 'deg)';
      if (Math.abs(target - lean) < 0.01 && stop) { stop(); stop = null; }
    }
  });
}());
