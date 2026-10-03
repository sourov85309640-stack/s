/* OWNER TOOL: "Versions". DELETE BEFORE SENDING TO A CLIENT (this file, options.css and their two tags in index.html).
   Simple on purpose:
   - The button at the bottom left always names the section you are looking at and how many versions it has.
   - Open it: that section's versions as big buttons (A, B, C). Click one to switch (the page reloads at that section),
     or the arrow next to it to open that version in a new tab, so you can compare two tabs side by side.
   - "Whole page" holds the settings that are not one section (hero layout, cursor, roofer, team, atmosphere).
   - "See every version side by side" opens roofing-options.html (pictures of every version) in a new tab.
   To fix a choice for a client: set data-v="N" on that <section> (or data-hero on <html>), then delete the tool. */
(function () {
  'use strict';
  var RW = window.RW, d = document, root = d.documentElement;
  if (!RW || root.getAttribute('data-options') === 'off') return;

  RW.add('options', function () {
    var LABELS = { top: 'Hero motion', reviews: 'Reviews', services: 'What we do', problems: 'Start with what you can see', where: 'Where water gets in',
      decide: 'Repair or replace', whole: '3D roof', projects: 'Recent project', how: 'How it works', checks: 'Checks from the ground', areas: 'Areas',
      faq: 'FAQ', contact: 'Contact', types: 'Roofs we work on', quiz: 'Quick roof check', before: 'Before and after', sectors: 'Who we work for',
      survey: 'Free survey band', care: 'Seasonal care', advice: 'Advice guides', accred: 'Accreditations', trust: 'Trust strip', about: 'About', work: 'Gallery', urgent: 'Urgent band' };
    var GLOBAL = ['cursor', 'companion', 'team', 'atmosphere'];
    var all = [{ id: 'top-layout', sec: 'top', param: 'hero', allowed: ['a', 'b', 'c'], names: ['Headline left', 'Gable plate', 'Centred'], current: root.getAttribute('data-hero') || 'a', label: 'Hero layout' }]
      .concat(RW.options.map(function (o) { return { id: o.id, sec: o.id, param: o.param, allowed: o.allowed, names: o.names, current: o.current, label: o.label || LABELS[o.id] || o.id }; }));
    var bySec = {};
    all.forEach(function (o) {
      var k = GLOBAL.indexOf(o.id) > -1 || !d.getElementById(o.sec) ? 'page' : o.sec;
      (bySec[k] = bySec[k] || []).push(o);
    });
    var LET = 'ABCDEFGH';

    var wrap = d.createElement('div'); wrap.className = 'rwopt'; wrap.setAttribute('data-owner-tool', 'design-options');
    wrap.innerHTML =
      '<div class="rwopt-panel" id="rwopt-panel" role="region" aria-label="Versions (owner tool)" hidden>' +
        '<div class="rwopt-top"><p class="rwopt-h"></p><button type="button" class="rwopt-close" aria-label="Close">&times;</button></div>' +
        '<div class="rwopt-body"></div>' +
        '<div class="rwopt-foot"><a class="rwopt-gallery" href="roofing-options.html" target="_blank" rel="noopener">See every version side by side<span aria-hidden="true"> &#8599;</span></a>' +
        '<button type="button" class="rwopt-page">Whole page settings</button></div>' +
        '<p class="rwopt-note">Owner tool. Delete before sending to a client.</p>' +
      '</div>' +
      '<button type="button" class="rwopt-toggle" aria-expanded="false" aria-controls="rwopt-panel"><span class="rwopt-ic" aria-hidden="true">&#9638;</span><span class="rwopt-t">Versions</span></button>';
    d.body.appendChild(wrap);
    var panel = RW.$('.rwopt-panel', wrap), body = RW.$('.rwopt-body', wrap), head = RW.$('.rwopt-h', wrap), tog = RW.$('.rwopt-toggle', wrap), togT = RW.$('.rwopt-t', wrap);
    var curSec = 'page', mode = 'sec';

    function urlFor(param, v, hash) {
      var u; try { u = new URL(location.href); } catch (e) { return '#'; }
      u.searchParams.set(param, v); u.hash = hash || '';
      return u.toString();
    }
    function rows(list, hash) {
      return list.map(function (o) {
        var h = '<div class="rwopt-row"><p class="rwopt-l">' + o.label + '</p><ol class="rwopt-vs">';
        o.allowed.forEach(function (v, i) {
          var n = (o.names[i] || v).replace(/^Sketch: /, ''), sketch = /^Sketch: /.test(o.names[i] || ''), on = String(o.current) === String(v);
          h += '<li class="rwopt-v' + (on ? ' is-on' : '') + '"><button type="button" class="rwopt-pick" data-p="' + o.param + '" data-val="' + v + '" aria-pressed="' + on + '">' +
            '<b>' + LET[i] + '</b><span>' + n + (sketch ? ' <small>rough sketch</small>' : '') + (i === 0 ? ' <small>default</small>' : '') + (on ? ' <small class="rwopt-now">showing</small>' : '') + '</span></button>' +
            '<a class="rwopt-new" href="' + urlFor(o.param, v, hash) + '" target="_blank" rel="noopener" aria-label="Open version ' + LET[i] + ' in a new tab">&#8599;</a></li>';
        });
        return h + '</ol></div>';
      }).join('');
    }
    function render() {
      if (mode === 'page' || !bySec[curSec]) {
        head.textContent = 'Whole page';
        body.innerHTML = rows(bySec.page || [], '');
      } else {
        head.textContent = (LABELS[curSec] || curSec) + ': ' + bySec[curSec].reduce(function (n, o) { return n + o.allowed.length; }, 0) + ' versions';
        body.innerHTML = rows(bySec[curSec], curSec === 'top' ? '' : curSec);
      }
    }
    function label() {
      var n = bySec[curSec] ? bySec[curSec].reduce(function (k, o) { return k + o.allowed.length; }, 0) : 0;
      togT.textContent = n ? (LABELS[curSec] || curSec) + ': ' + n + ' versions' : 'Versions';
      tog.classList.toggle('has-v', !!n);
    }
    function setOpen(open) { tog.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.hidden = !open; if (open) render(); }
    tog.addEventListener('click', function () { mode = 'sec'; setOpen(panel.hidden); });
    RW.$('.rwopt-close', wrap).addEventListener('click', function () { setOpen(false); tog.focus(); });
    RW.$('.rwopt-page', wrap).addEventListener('click', function () { mode = mode === 'page' ? 'sec' : 'page'; render(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); tog.focus(); } });

    /* follow the section in the middle of the screen */
    RW.$$('main > section[id]').forEach(function (s) {
      RW.onView(s, { margin: '-50% 0px -50% 0px', enter: function () { curSec = s.id; label(); if (!panel.hidden && mode === 'sec') render(); } });
    });
    label();

    body.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.rwopt-pick'); if (!b) return;
      var p = b.getAttribute('data-p'), v = b.getAttribute('data-val');
      if (p === 'hero') {   /* hero layout switches live */
        root.setAttribute('data-hero', v);
        all.forEach(function (o) { if (o.param === 'hero') o.current = v; });
        try { history.replaceState(history.state, '', urlFor(p, v, '')); } catch (x) {}
        try { d.dispatchEvent(new CustomEvent('rw:hero-layout', { detail: v })); } catch (x2) {}
        if (RW.depth) RW.depth.measure(); if (RW.motionOK && RW.ST) RW.ST.refresh();
        render(); return;
      }
      try { sessionStorage.setItem('rw-opt-open', mode); } catch (x3) {}
      location.href = urlFor(p, v, mode === 'page' || curSec === 'top' ? '' : curSec);
    });
    try { var reopen = sessionStorage.getItem('rw-opt-open'); if (reopen) { sessionStorage.removeItem('rw-opt-open'); mode = reopen; setTimeout(function () { setOpen(true); }, 600); } } catch (x4) {}
  });
}());
