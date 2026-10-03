/* app.js (owner: contact team). Enquiry form behaviour that must work everywhere, also under reduced motion
   and <html data-motion="off">: ?issue= / ?town= / ?from= prefill, legal <details> opening when linked,
   starter chips, field validation, honeypot, sending and the success state.
   Menu, nav, header, FAQ, carousel and diagram behaviour live in their own files now.
   Talks to contact.js through DOM events on the form (all synchronous):
     rw:field   {name, ok}     whenever a field's validity is (re)computed, also silently while typing
     rw:tag     {kind}         an issue or area tag was just filled in (contact.js stamps it)
     rw:invalid {field}        just before focus moves to the first invalid field on submit
     rw:sent    {}             the success state is showing */
(function () {
  'use strict';
  var RW = window.RW, d = document;

  RW.add('form', function () {
    var $ = RW.$, $$ = RW.$$;
    var form = $('#enquiry');

    /* ---------- 1. ?issue= ?town= ?from= ---------- */
    var labels = {
      leak: 'About: water coming in or damp',
      slipped: 'About: slipped or missing tiles or slates',
      chimney: 'About: chimney or lead',
      patching: 'About: an old roof that keeps needing patching',
      notsure: 'About: not sure yet',
      maintain: 'About: keeping the roof in good order',
      investigate: 'About: finding the cause of a problem'
    };
    function emit(name, detail) {
      if (!form) return;
      var ev;
      try { ev = new CustomEvent(name, { detail: detail || {} }); }
      catch (x) { ev = d.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail || {}); }
      form.dispatchEvent(ev);
    }
    function setIssue(key) {
      var fi = $('#f-issue'), tag = $('#issue-tag');
      if (!key || !labels[key] || !fi) return false;
      fi.value = key;
      if (tag) { tag.textContent = labels[key]; tag.hidden = false; }
      emit('rw:tag', { kind: 'issue', key: key });
      return true;
    }
    function setTown(name) {
      var ft = $('#f-town'), tag = $('#area-tag');
      if (!name || !ft) return false;
      ft.value = name;
      if (tag) { tag.textContent = 'Area: ' + name; tag.hidden = false; }
      emit('rw:tag', { kind: 'town', key: name });
      return true;
    }
    function applyParams(qs) {
      var p;
      try { p = new URLSearchParams(qs || ''); } catch (x) { return; }
      setIssue((p.get('issue') || '').toLowerCase().replace(/[^a-z]/g, ''));
      /* town names: letters, spaces, hyphens, apostrophes and full stops only, tidy case, 40 characters */
      var town = (p.get('town') || '').replace(/[^A-Za-zÀ-ſ '\-.]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
      if (town) setTown(town.replace(/(^|[\s\-])([a-zà-ſ])/g, function (m, a, b) { return a + b.toUpperCase(); }));
      var from = (p.get('from') || '').replace(/[^a-zA-Z0-9 _\-]/g, '').slice(0, 40);
      var f = $('#f-from');
      if (from && f) f.value = from;
    }
    RW.formParams = applyParams;
    applyParams(window.location.search);

    /* links such as ?issue=leak#contact or ?town=Tetbury#contact: fill the form without reloading.
       Delegated, so links that other sections render later work too. */
    d.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="?"]');
      if (!a) return;
      var href = a.getAttribute('href'), i = href.indexOf('#');
      var qs = i > -1 ? href.slice(0, i) : href, hash = i > -1 ? href.slice(i) : '';
      var target = hash ? d.querySelector(hash) : null;
      if (!target) return;
      e.preventDefault();
      applyParams(qs);
      try { history.pushState(null, '', qs + hash); } catch (x) {}
      RW.scrollTo(target);
      if (!form || form.hidden) return;
      /* keyboard and mouse: straight into the first field. Touch: no keyboard pop-up, focus the sheet heading */
      var first = RW.fine ? form.querySelector('input[type="text"]') : form.querySelector('.sheet-h');
      if (first) { try { first.focus({ preventScroll: true }); } catch (x2) { first.focus(); } }
    });

    /* ---------- 2. legal details open when linked ---------- */
    function openHash() {
      var t = window.location.hash && d.getElementById(window.location.hash.slice(1));
      if (t && t.tagName === 'DETAILS') t.open = true;
    }
    window.addEventListener('hashchange', openHash);
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#privacy"],a[href="#terms"]');
      if (!a) return;
      var t = d.querySelector(a.getAttribute('href'));
      if (t && t.tagName === 'DETAILS') t.open = true;
    });
    openHash();

    if (!form) return;

    /* ---------- 3. starter chips: add or remove the chip's own sentence, never touch what the person typed ---------- */
    var notes = $('#f-notes');
    var chips = $$('[data-add]', form.closest('section') || d);
    function hasChip(b) { return notes.value.indexOf(b.getAttribute('data-add')) > -1; }
    function syncChips() { chips.forEach(function (b) { b.setAttribute('aria-pressed', hasChip(b) ? 'true' : 'false'); }); }
    if (notes && chips.length) {
      chips.forEach(function (b) {
        b.addEventListener('click', function () {
          var s = b.getAttribute('data-add');
          if (hasChip(b)) notes.value = notes.value.replace(s, '').replace(/ {2,}/g, ' ').replace(/^\s+/, '');
          else notes.value = notes.value + (notes.value && !/\s$/.test(notes.value) ? ' ' : '') + s + ' ';
          /* no focus() on the textarea: it would pull the phone keyboard up */
          notes.dispatchEvent(new Event('input', { bubbles: true }));
          var key = b.getAttribute('data-issue');
          if (key && b.getAttribute('aria-pressed') === 'true' && !$('#f-issue').value) setIssue(key);
        });
      });
      notes.addEventListener('input', syncChips);
      syncChips();
    }

    /* ---------- 4. validation: errors on blur and on submit, positive feedback as soon as a value is right ---------- */
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Enter your name.'; },
      postcode: function (v) {
        return /^[A-Za-z]{1,2}[0-9][A-Za-z0-9]?\s*[0-9][A-Za-z]{2}$/.test(v.trim()) ? '' : 'Enter a UK postcode, for example GL7 1AA.';
      },
      contact: function (v) {
        var t = v.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return '';
        var digits = t.replace(/\D/g, '');
        if (/^[0-9 +()\-]+$/.test(t) && digits.length >= 10 && digits.length <= 13) return '';
        return 'Enter an email address or a phone number we can ring, for example 01632 960 482.';
      }
    };
    var errId = { name: 'e-name', postcode: 'e-post', contact: 'e-contact' };
    function mark(field, ok) {
      var el = form.elements[field], box = el.closest('.field');
      if (box) box.classList.toggle('is-valid', ok && !!el.value.trim());
      emit('rw:field', { name: field, ok: ok });
    }
    function check(field) {
      var el = form.elements[field];
      var msg = rules[field](el.value);
      var out = d.getElementById(errId[field]);
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        out.textContent = msg; out.hidden = false;
      } else {
        el.removeAttribute('aria-invalid');
        out.textContent = ''; out.hidden = true;
      }
      mark(field, !msg);
      return !msg;
    }
    RW.formCheck = check;
    Object.keys(rules).forEach(function (f) {
      var el = form.elements[f];
      el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid')) check(f); });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid')) { check(f); return; }
        mark(f, !rules[f](el.value)); /* silent: a tick and progress, never an error while typing */
      });
    });
    if (notes) notes.addEventListener('input', function () { emit('rw:field', { name: 'details', ok: !!notes.value.trim() }); });

    /* ---------- 5. photos: count and thumbnails ---------- */
    var files = $('#f-files'), pa = $('#photo-add'), thumbs = $('#f-thumbs'), urls = [];
    if (files && pa) {
      var paText = pa.innerHTML;
      files.addEventListener('change', function () {
        var list = files.files ? Array.prototype.slice.call(files.files) : [];
        urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (x) {} }); urls = [];
        if (thumbs) {
          thumbs.textContent = '';
          list.slice(0, 6).forEach(function (f) {
            if (!/^image\//.test(f.type) || !window.URL || !URL.createObjectURL) return;
            var li = d.createElement('li'), img = d.createElement('img'), u = URL.createObjectURL(f);
            urls.push(u); img.src = u; img.alt = f.name; img.width = 64; img.height = 64; img.decoding = 'async';
            li.appendChild(img); thumbs.appendChild(li);
          });
          if (list.length > 6) { var more = d.createElement('li'); more.className = 'more'; more.textContent = '+' + (list.length - 6); thumbs.appendChild(more); }
          thumbs.hidden = !thumbs.children.length;
        }
        var n = list.length;
        pa.innerHTML = n ? paText.replace(/<span class="photo-t">[^<]*<\/span>/, '<span class="photo-t">' + (n === 1 ? '1 photo added' : n + ' photos added') + ', change</span>') : paText;
        emit('rw:field', { name: 'photos', ok: n > 0 });
      });
    }

    /* ---------- 6. send ---------- */
    var ok = $('#form-ok');
    function showOk() {
      var name = (form.elements.name.value || '').trim().split(/\s+/)[0];
      var how = (form.elements.contact.value || '').trim();
      var hi = $('#ok-h'), to = $('#ok-to');
      if (hi && name) hi.textContent = 'Thanks, ' + name + '. We have your details.';
      if (to && how) to.textContent = how;
      form.hidden = true;
      ok.hidden = false;
      try { ok.focus({ preventScroll: true }); } catch (x) { ok.focus(); }
      var r = ok.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight) RW.scrollTo(ok, { offset: -24 });
      emit('rw:sent', {});
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      Object.keys(rules).forEach(function (f) { if (!check(f) && !bad) bad = form.elements[f]; });
      if (bad) {
        emit('rw:invalid', { field: bad.name });
        try { bad.focus({ preventScroll: false }); } catch (x) { bad.focus(); }
        return;
      }
      if (form.elements.website && form.elements.website.value) { showOk(); return; } /* honeypot: pretend success */
      var action = form.getAttribute('action') || '';
      var err = $('#e-form');
      err.hidden = true;
      if (!action || action === 'REPLACE-ENDPOINT') {
        if (window.console && console.info) console.info('Form endpoint not set: nothing was sent (see the FORM ENDPOINT comment in the contact section).');
        showOk(); return;
      }
      var submit = form.querySelector('button[type="submit"]');
      var label = submit.querySelector('.send-t'), oldLabel = label ? label.textContent : '';
      submit.disabled = true; if (label) label.textContent = 'Sending…';
      fetch(action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('bad'); showOk(); })
        .catch(function () {
          var tel = $('.big-phone .ct-num') || $('.big-phone');
          err.textContent = 'That did not send. Check your connection and try again, or call ' + (tel ? tel.textContent.trim() : 'us') + '.';
          err.hidden = false;
          submit.disabled = false; if (label) label.textContent = oldLabel;
        });
    });
  });
}());
