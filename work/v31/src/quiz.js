/* QUICK ROOF CHECK (owner: lead). Three radio questions shown one at a time, then a plain answer.
   "Send this to us" fills the enquiry form (issue tag and a note) and moves to it. Works without motion. */
(function () {
  'use strict';
  var RW = window.RW;
  /* plain wording for each answer; keep it general and honest */
  var RESULT = {
    leak: { h: 'Sounds like water is getting in.', p: 'Most leaks start at a slipped slate, a cracked ridge, lifted flashing or a blocked valley, and the stain inside is rarely right under the cause.', issue: 'leak' },
    slipped: { h: 'Sounds like slipped or broken tiles or slates.', p: 'Usually rusted nails, a storm, or tiles that have reached the end of their life. A few are a quick repair; lots can mean the roof needs more.', issue: 'slipped' },
    moss: { h: 'Sounds like the roof needs a clean and the gutters cleared.', p: 'Moss holds water and lifts tiles, and blocked gutters send water down the wall. Clearing them early is the cheapest roof work there is.', issue: 'gutters' },
    chimney: { h: 'Sounds like the chimney or its lead.', p: 'Crumbling pointing, a cracked top or lifted flashing lets water run down inside the stack. It often shows as damp on a chimney breast.', issue: 'chimney' },
    flat: { h: 'Sounds like the flat roof covering.', p: 'Ponding, splits at the edges and failed upstands are the usual causes. Sometimes a repair holds; an old covering often needs replacing.', issue: 'flat' },
    check: { h: 'A check is a good idea.', p: 'A look from a ladder and the loft catches small problems before they become leaks, and you get photos and a plain summary.', issue: 'inspection' }
  };
  var WHERE = { main: 'the main roof', flat: 'a flat roof, extension or garage', chimney: 'the chimney', edges: 'the gutters, fascias or edges', notsure: 'not sure where' };
  var WHEN = {
    now: 'Water is coming in now, so please call. Put a bucket under it and move anything electrical away; we will tell you what to do first.',
    soon: 'Send it over and we will arrange a look in the next few weeks, with a written quote after.',
    plan: 'Planning ahead is the best time: we can look, explain the options and give you a written quote with no rush.'
  };
  RW.add('quiz', function () {
    var sec = RW.$('#quiz'); if (!sec) return;
    var qs = RW.$$('.qz-q', sec), res = RW.$('.qz-res', sec), back = RW.$('.qz-back', sec), again = RW.$('.qz-again', sec);
    var steps = RW.$$('.qz-st', sec), keys = ['what', 'where', 'when'], ans = {}, step = 0;
    sec.classList.add('is-js');
    if (RW.headings) RW.headings(sec);
    function show(n, focus) {
      step = n;
      sec.setAttribute('data-step', String(n));
      qs.forEach(function (q, i) { q.hidden = i !== n; q.classList.toggle('is-in', i === n); });
      res.hidden = n < 3; res.classList.toggle('is-in', n === 3);
      back.hidden = n === 0 || n === 3; again.hidden = n < 3;
      steps.forEach(function (s, i) { s.classList.toggle('is-done', i < n); s.classList.toggle('is-on', i === n); });
      if (n === 3) fill();
      if (focus) { var t = n === 3 ? RW.$('.qz-res-h', res) : RW.$('.qz-leg', qs[n]); if (t) t.focus({ preventScroll: true }); }
    }
    function fill() {
      var r = RESULT[ans.what] || RESULT.check;
      RW.$('.qz-res-h', res).textContent = r.h;
      RW.$('.qz-res-p', res).textContent = r.p;
      RW.$('.qz-res-next', res).textContent = WHEN[ans.when] || WHEN.soon;
      var call = RW.$('.qz-call', res), send = RW.$('.qz-send', res);
      call.classList.toggle('btn-fill', ans.when === 'now'); call.classList.toggle('btn-line', ans.when !== 'now');
      send.classList.toggle('btn-fill', ans.when !== 'now'); send.classList.toggle('btn-line', ans.when === 'now');
    }
    qs.forEach(function (q, i) {
      RW.$$('input', q).forEach(function (inp) {
        inp.addEventListener('change', function () {
          ans[keys[i]] = inp.value;
          sec.setAttribute('data-' + keys[i], inp.value);
          clearTimeout(show.t);
          show.t = setTimeout(function () { show(i + 1, true); }, RW.motionOK ? 420 : 0);
        });
      });
    });
    back.addEventListener('click', function () { if (step > 0) show(step - 1, true); });
    again.addEventListener('click', function () {
      ans = {}; keys.forEach(function (k) { sec.removeAttribute('data-' + k); });
      RW.$$('input', sec).forEach(function (i) { i.checked = false; });
      show(0, true);
    });
    RW.$('.qz-send', res).addEventListener('click', function () {
      var r = RESULT[ans.what] || RESULT.check;
      if (RW.formParams) RW.formParams('?issue=' + r.issue + '&from=quiz');
      var notes = document.getElementById('f-notes');
      if (notes) {
        var lab = function (k) { var c = RW.$('input[name="qz-' + k + '"]:checked', sec); return c ? c.parentNode.textContent.trim() : ''; };
        var line = 'Quick roof check: ' + lab('what') + '. Where: ' + (WHERE[ans.where] || lab('where')) + '. How soon: ' + lab('when') + '.';
        notes.value = notes.value ? notes.value + '\n' + line : line;
      }
      var target = document.getElementById('contact');
      if (RW.scrollTo && target) RW.scrollTo(target); else if (target) target.scrollIntoView();
      setTimeout(function () { var f = document.getElementById('f-name'); if (f) f.focus({ preventScroll: true }); }, RW.motionOK ? 900 : 0);
    });
    show(0, false);
  });
}());
