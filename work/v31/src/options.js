/* OWNER TOOL: "Design options" panel. DELETE BEFORE SENDING TO A CLIENT.
   It lists the alternative designs kept for each section (registered by RW.variant in each section file) and the three hero
   layouts. Picking one reloads the page with ?param=N in the address, so each section starts cleanly with that design.
   To fix a choice for a client: set data-v="N" on that <section> in src/sections/NAME.html (and data-hero on <html>),
   then delete this file, options.css, and their two tags in index.html. Works with motion off. */
(function () {
  'use strict';
  var RW = window.RW, d = document, root = d.documentElement;
  if (!RW || root.getAttribute('data-options') === 'off') return;

  RW.add('options', function () {
    var LABELS = { top: 'Hero motion', reviews: 'Reviews', services: 'Services', where: 'Where water gets in', decide: 'Repair or replace',
      whole: '3D roof', projects: 'Project', how: 'How it works', checks: 'Checks from the ground', areas: 'Areas', faq: 'FAQ', contact: 'Contact' };
    var order = RW.$$('main > section[id]').map(function (s) { return s.id; });
    var opts = RW.options.slice().sort(function (a, b) {
      var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

    var wrap = d.createElement('div');
    wrap.className = 'opt';
    wrap.setAttribute('data-owner-tool', 'design-options');
    var btn = d.createElement('button');
    btn.type = 'button'; btn.className = 'opt-toggle';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'opt-panel');
    btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h9M15 6h2M3 14h2M8 14h9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="13.5" cy="6" r="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="14" r="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>Design options</span>';
    var panel = d.createElement('div');
    panel.className = 'opt-panel'; panel.id = 'opt-panel'; panel.hidden = true;
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Design options (owner tool)');

    var html = '<p class="opt-h">Design options</p><p class="opt-note">Owner tool: compare the designs kept for each section. Delete it before sending to a client.</p>';
    html += row('Hero layout', 'hero', ['a', 'b', 'c'], ['A: headline left', 'B: gable plate', 'C: centred'], (root.getAttribute('data-hero') || 'a'));
    opts.forEach(function (o) { html += row(o.label || LABELS[o.id] || o.id, o.param, o.allowed, o.names, o.current); });
    panel.innerHTML = html;

    function row(label, param, vals, names, cur) {
      var s = '<div class="opt-row" role="group" aria-label="' + label + '"><p class="opt-l">' + label + '</p><div class="opt-btns">';
      vals.forEach(function (v, i) {
        s += '<button type="button" data-p="' + param + '" data-val="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + (i === 0 ? names[i] + ' <small>(default)</small>' : names[i]) + '</button>';
      });
      return s + '</div></div>';
    }

    wrap.appendChild(panel); wrap.appendChild(btn); d.body.appendChild(wrap);

    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    }
    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });

    panel.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-p]'); if (!b) return;
      var p = b.getAttribute('data-p'), v = b.getAttribute('data-val');
      var url;
      try { url = new URL(location.href); url.searchParams.set(p, v); } catch (x) { return; }
      if (p === 'hero') {
        /* hero layout switches live */
        root.setAttribute('data-hero', v);
        try { history.replaceState(history.state, '', url.toString()); } catch (x2) {}
        RW.$$('button[data-p="hero"]', panel).forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        try { d.dispatchEvent(new CustomEvent('rw:hero-layout', { detail: v })); } catch (x3) {}
        if (RW.depth) RW.depth.measure();
        if (RW.motionOK && RW.ST) RW.ST.refresh();
        return;
      }
      /* everything else reloads at the same section so its scroll scenes start cleanly */
      var sec = null;
      RW.options.forEach(function (o) { if (o.param === p) sec = d.getElementById(o.id); });
      url.hash = sec && sec.id !== 'atmosphere' ? sec.id : '';
      try { sessionStorage.setItem('rw-opt-open', '1'); } catch (x4) {}
      location.href = url.toString();
    });
    try { if (sessionStorage.getItem('rw-opt-open')) { sessionStorage.removeItem('rw-opt-open'); setOpen(true); } } catch (x5) {}
  });
}());
