/* RECENT WORK GALLERY (owner: lead): lightbox with arrow keys, Escape closes (native <dialog>), focus returns to the tile. */
(function () {
  'use strict';
  var RW = window.RW;
  RW.add('work-lightbox', function () {
    var sec = RW.$('#work'), dlg = RW.$('#wk-dlg'); if (!sec || !dlg || !dlg.showModal) return;
    var btns = RW.$$('.wk-btn', sec), big = RW.$('.wk-big', dlg), cap = RW.$('.wk-figcap', dlg), idx = 0, opener = null;
    function show(i, dir) {
      idx = (i + btns.length) % btns.length;
      /* next and previous slide the photo in from the side it comes from */
      if (dir && RW.motionOK) { big.classList.remove('is-from-l', 'is-from-r'); void big.offsetWidth; big.classList.add(dir > 0 ? 'is-from-r' : 'is-from-l'); }
      var im = RW.$('img', btns[idx]), c = RW.$('.wk-cap', btns[idx]);
      big.src = im.currentSrc || im.src; big.alt = im.alt;
      big.style.maxWidth = 'min(100%, ' + Math.round((im.naturalWidth || 600) * 1.6) + 'px)';
      var bits = c ? Array.prototype.map.call(c.children.length ? c.children : [c], function (n) { return n.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean) : [];
      cap.textContent = (idx + 1) + ' of ' + btns.length + (bits.length ? ': ' + bits.join(', ') : '');
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { opener = b; show(i); dlg.showModal(); RW.$('.wk-x', dlg).focus(); if (RW.lenis) RW.lenis.stop(); }); });
    RW.$('.wk-x', dlg).addEventListener('click', function () { dlg.close(); });
    RW.$('.wk-prev', dlg).addEventListener('click', function () { show(idx - 1, -1); });
    RW.$('.wk-next', dlg).addEventListener('click', function () { show(idx + 1, 1); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(idx + 1, 1); else if (e.key === 'ArrowLeft') show(idx - 1, -1); });
    /* swipe left or right on a phone */
    var sx = null, sy = 0;
    dlg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (RW.lenis) RW.lenis.start(); if (opener) opener.focus(); });
  });
  RW.add('work-motion', function () {
    var sec = RW.$('#work'); if (!sec) return;
    RW.headings(sec);
    RW.reveal(RW.$$('.wk-it', sec), { y: 30, stagger: 0.07 });
    /* every photo uncovers in its own way: shutter, wipe, iris, slats, lift, diagonal */
    var KINDS = ['shut', 'wipe', 'iris', 'slats', 'lift', 'diag'];
    RW.$$('.wk-btn', sec).forEach(function (b, i) {
      var c = document.createElement('span'); c.className = 'wk-cov wk-cov-' + KINDS[i % KINDS.length]; c.setAttribute('aria-hidden', 'true');
      if (KINDS[i % KINDS.length] === 'slats') for (var k = 0; k < 4; k++) c.appendChild(document.createElement('i'));
      b.appendChild(c);
      RW.onView(b, { once: true, margin: '0px 0px -12% 0px', enter: function () { setTimeout(function () { c.classList.add('is-open'); }, 120 + (i % 3) * 110); } });
    });
    RW.reveal(RW.$$('.head2 > p, .wk-cta', sec), { y: 16 });
  }, { motion: true });
}());
