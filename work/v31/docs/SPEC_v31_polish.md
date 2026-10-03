# SPEC v3.1 polish: one restrained, buildable layer on top of the current page

Author: polish/feasibility agent. Based on reading src/index.html, styles.css, motion.js, app.js, BRIEF.md, ideas_uav.md, ideas_roofing.md.
Nothing here was run. Contrast numbers are hand-computed. Limits: headless Chromium only, no Safari/Firefox/real phone.

Decision in one paragraph: the page already has the big moves (hero intro, survey tour, exploded roof, review widget, magnetic buttons, pointer light). What it lacks is a single hover language, a form that helps on a phone, chrome that stays legible over dark sections, and four or five small "someone cared" details. Ship 14 ideas, all CSS or tiny JS, three files in three packages. Everything else is cut.

---------------------------------------------------------------------
## 1. Decisions (all ideas from both lists)

K = KEEP, I = IMPROVE, M = MERGE (into the named shipped idea), C = CUT. Shipped ideas are numbered S1 to S14 (section 2).

### UAV list
| # | Idea | Verdict | Reason |
|---|---|---|---|
| 1 | Row/card hover wash | M into S1 | One copper wash, opacity only, clickable things only. Alpha lowered so copper text stays above 4.5:1. |
| 2 | Card hover system | M into S1 | Rcard lift and photo push already exist. Only rules: one recipe per card, never on non-links. |
| 3 | Flight path + marker in #how | C | Duplicates the survey marker two sections later. Mobile geometry is a wobble. Replaced by S14 (sheet reacts to stage 2). |
| 4 | Tone-aware chrome | I = S9 | Author data-tone in HTML. Two observers (top band for progress bar, bottom band for mobile bar), not one midline. |
| 5 | Button system | I = S2 | Existing wipe already changes colour (UAV bug does not apply). Add arrow nudge, gate hover, restrict magnet. |
| 6 | Services index photo swap | C | Sticky stage + 5 new photos, desktop only, no conversion gain over the existing list. |
| 7 | Form polish, one contact field | I = S6 | Single "Email or phone" field and per-field errors already exist. Add white focus fill + paper stack. |
| 8 | Count-up | K (have) | Exists in motion.js reviews(). No change. |
| 9 | Photo push / curtain | C | Push exists (`.svc:hover .cw img`). Curtain needs clip-path/extra layers. |
| 10 | Header never hides phone | C | Desktop visitors cannot dial. Header returns on any upward scroll. A floating pill is clutter. |
| 11 | Seam draw-in | C | The nine roof edges are the seams. Footer ridge already draws. |
| 12 | Split headings safer | C | Have it. QA concern only (P3 verifies words are not stuck hidden). |
| 13 | Reading spine | C | Needs a list worth a spine. No such list. |
| 14 | Section rail | C | UAV's rail was verified to steal clicks. Nav already tracks the section. |
| 15 | Areas marquee | C | Auto-moving text, WCAG 2.2.2, "too much". |
| 16 | Line-in-focus statements | C | Needs three invented promises. |
| 17 | Pointer light, single hue | K (have) | `.glow` already single copper-tint .11, dark sections only. |
| 18 | Text link with rule | M into S2 | Thickness 1px to 2px on hover, no fade-out. |
| 19 | Mobile menu contract | M into P3 chore | 4 lines of CSS (drawer fade). Not counted. |
| 20 | Paper stack under form | I = S6 | Static, but appears only after the form has revealed. |
| 21 | Stack cards | C | Sticky inside overflow ancestors breaks silently. |
| 22 | Fan panels | C | Layout animation. 3D roof already covers "parts". |

### Roofing list
| ID | Idea | Verdict | Reason |
|---|---|---|---|
| HERO1 | Lead phrases deep-link into form | K = S3 | Best conversion per line of code. app.js already handles `a[href^="?"]`. |
| FRM1 | Starter chips | K = S4 | Removes blank-page problem on phones. |
| X1 | Header progress fix | K = S9 | Verified defect: bar lives inside the translated header. Fix = move it out. Gable on the line is CUT (needs 100vw maths, scrollbar error, decoration). |
| SVC1 | Handshake stamp | I = S5 | Triggered by IntersectionObserver, not setTimeout. |
| CHK1 | Tick-off checklist | C | Invented copy, a11y load, state with no payoff. |
| FAQ1 | Phone link lifts after 2 opens | C | CTA mutates mid-read, layout shift, invisible on mobile (head not sticky). |
| FRM2 | House draws as fields validate | C | M effort, couples to validation state, gimmick on the money form. |
| TOUR1 | Droplet at each lock | K = S12 | Pure CSS off `.marker.is-lock`. Only water motif on the page. |
| FRM3 | Copy-number chip | K = S7 | Real desktop dead end (no tel handler). Fine pointers only. |
| FRM4 | Photo thumbnails | C | DataTransfer + object URL risk, cannot test Safari. |
| TOUR2 | Follow-the-water paths | C | Needs visual path tuning against the SVG. |
| DEC1 | Sliding diamond + step links | C | Dims text to .55 (rule), layout offsets per breakpoint. Revisit v3.2. |
| ARE1 | Towns link to form | C | Implies town pages. Also remove the existing hover colour on the non-link town list (P3). |
| X2 | Roof edges build on scroll | K = S10 | Signature element, cheap, one CSS var per section. |
| X3 | Day arc ambient | I = S11 | Reduced to one thing: the contact "lights on" glow. theme-color switching CUT (header is always paper at the top on mobile, so a dark address bar mismatches; static value should be paper). |
| XV1 | Droplet through layers | C | z-fighting risk in preserve-3d, untestable in Safari. |
| HOW1 | Quote sheet reacts at stage 2 | K = S14 | Ties the written-quote promise to the proof. Desktop only. |
| HDR1 | Sliding ridge indicator | M into S2 | Replaced with CSS scaleX draw on nav underline. |
| REV1 | Partial 5th star | K = S8 | Real-widget fidelity. Pure CSS. |
| XV2 | Slipped tile loosens | K = S13 | CSS only, meaningful (the copy talks about slipped tiles). Hover peek CUT. |
| PRJ1 | Day ticks | C | Parses client copy. Fragile. |
| BAR1 | Call icon rings | C | Attention-grabbing on the main CTA, annoying. |
| HDR2 | Drawer opens with fade | M into P3 chore | 4 lines, not counted. |
| X4 | One hover language | M into S1 | |
| FRM5 | Window light on focus | M into S6 | Replaced by a white fill on the focused field. |
| FTR1, PRJ2, FAQ2, HOW2, CHK2, ARE2, HERO2, HERO3, REV2, REV3, SVC2, TOUR3, BAR2, X5, X6 | various | C / M | Low value or too much. X5 rule kept: the water drop appears once (S12). |

---------------------------------------------------------------------
## 2. The 14 shipped ideas, by package

| # | Idea | Package | Files touched |
|---|---|---|---|
| S1 | One hover language (wash on clickable rows, tokens) | 1 | fx-hover.css |
| S2 | Button and link polish (arrow nudge, link thickness, nav underline draw, gated hover, restricted magnet) | 1 (+P3 chore for magnet and gating) | fx-hover.css, motion.js, styles.css |
| S3 | Hero phrases become deep links | 1 CSS + P3 HTML | fx-hover.css, index.html |
| S4 | Form starter chips | 1 | fx-hover.css, fx-hover.js, index.html |
| S5 | Issue tag stamps in after a service pick | 1 | fx-hover.css, fx-hover.js |
| S6 | Form focus fill + paper stack | 1 | fx-hover.css, fx-hover.js |
| S7 | Copy-number button (desktop) | 1 | fx-hover.css, fx-hover.js, index.html |
| S8 | Partial 5th star on 4.8 | 1 CSS + P3 HTML | fx-hover.css, index.html |
| S9 | Chrome tone system + header progress fix | 2 CSS/JS + P3 HTML | fx-scroll.css, fx-scroll.js, index.html |
| S10 | Roof edges build as sections arrive | 2 | fx-scroll.css, fx-scroll.js |
| S11 | Contact "lights on" glow | 2 | fx-scroll.css, fx-scroll.js |
| S12 | Water drop at each tour lock | 2 CSS + P3 HTML | fx-scroll.css, index.html |
| S13 | Slipped tile loosens on the Tiles layer | 2 | fx-scroll.css |
| S14 | Quote sheet "is read" at stage 2 | 2 | fx-scroll.css, fx-scroll.js |

Ownership rule: Package 1 and 2 never edit src/index.html, styles.css, motion.js or app.js. Package 3 never edits fx-*. HTML snippets in section 6 are the single interface.

---------------------------------------------------------------------
## 3. Shared contract

### 3.1 Load order (P3 wires it)
In `<head>`, exactly this format (build.py inlines `<link rel="stylesheet" href="x.css">` in the order found):
```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="fx-hover.css">
<link rel="stylesheet" href="fx-scroll.css">
```
Before `</body>`:
```html
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="vendor/lenis.min.js"></script>
<script src="app.js"></script>
<script src="motion.js"></script>
<script src="fx-hover.js"></script>
<script src="fx-scroll.js"></script>
```
Why: fx CSS must win equal-specificity ties against styles.css. fx-hover.js needs app.js done (#issue-tag, form). fx-scroll.js needs `window.rwMotion` from motion.js. fx-hover.js and fx-scroll.js do not depend on each other.

### 3.2 Variables and classes (registry, no overlaps)
Defined in fx-hover.css `:root` (P2 may read them but always with a fallback):
```
--fx-ease:cubic-bezier(.2,.7,.2,1);      same curve the page already uses
--fx-wash:rgba(152,86,50,.06);           copper wash on paper
--fx-wash-warm:rgba(250,249,246,.65);    paper wash on warm sections
--fx-wash-ink:rgba(221,167,131,.10);     copper-tint wash on ink
--fx-lift:4px;                           the only lift distance (review cards, already in styles.css)
```
Defined in fx-scroll.css (P1 never reads them): `--er` (edge rise, set by JS on `.e-*` sections), `--lamp` (set by JS on `.contact-photo`).
Html flags: `html.fx-hover` (set by fx-hover.js), `html.fx-scroll` (set by fx-scroll.js only when GSAP ran), `html[data-tone-top]`, `html[data-tone-bot]` (values paper | warm | ink; set by fx-scroll.js).
Pseudo-elements claimed (no clashes): P1 = `.svc::before`, `.q h3::before`, `.nav a::after`, `.issue-tag::after`, `.form-wrap::before/::after`. P2 = `.bar::before/::after`, `.contact-photo::after`, `.sheet::before`, `.spec-sheet>div::after`, `.e-*::before` (transform only), `.m-drip` element.
Existing and untouched: `.btn::before` (wipe), `.sheet::after` (fold), `.glow::after` (pointer light), `.field.is-valid::after`.

### 3.3 Reduced motion and no-JS
styles.css already has `*,*::before,*::after{animation:none!important;transition:none!important}` under `prefers-reduced-motion`. That kills every new transition and keyframe. Rules for the new code: P1 JS always runs (chips, copy, stamp class) because it is function, not motion. P2 tone attributes always run (no animation). Everything GSAP-based in P2 is gated by `window.rwMotion` (motion.js returns before defining it under reduced motion or `data-motion="off"`). Decorative extras default to visible in CSS so a JS failure leaves a finished page.

---------------------------------------------------------------------
## 4. Colour and hover system (the one language)

| Thing | Rule |
|---|---|
| Wash (clickable rows only) | Paper section: copper .06. Warm section: paper .65. Ink section: copper-tint .10. Opacity 0 to 1 plus `scaleY(.94)` to 1. In .2s, out .3s, `--fx-ease`. Bleed 12px sideways (`inset:0 -.75rem`), never taller than the row. Shown on `:hover` (fine pointer), `:focus-within`, and `:active` on touch (.1s). |
| Where the wash applies | `.svc-list .svc` (not the large lead card, its photo is gable-clipped), `.q h3` (the question row only), `.xv-list button` (half strength .05 on ink, pressed state stays .10). Never on non-links. |
| Contrast check | Copper #985632 text on paper+.06 copper: about 4.9:1. On warm+paper .65: above 4.7:1. Never raise copper wash above .06 behind copper text (at .07 on warm it dropped to 4.4:1). |
| Lift | One distance, 4px, only on review cards (exists). Nothing else lifts. |
| Photo push | Existing `.svc:hover .cw img{scale:1.06}`. Leave. |
| Headline on hover | `.svc:hover h3` turns copper, .2s. |
| Buttons | Existing bottom wipe stays (fill: ink wipe on paper/warm, copper-tint wipe on ink). Add arrow nudge 4px, hover gated, press `scale(.97)`. Magnet only on hero primary and submit, max 4px x / 3px y, `power3.out`, no elastic. |
| Text links (`.link`, `.inl`) | Underline 1px at rest, 2px on hover (.2s). The underline no longer disappears (old rule faded it to transparent, which removed the affordance). `.link-ink` goes tint to cream on hover. |
| Nav (desktop) | Underline draws with `scaleX` .25s on hover and stays for `aria-current`. |
| Focus | Existing 3px copper outline, offset 3px. Fix: on `.contact` (ink) the outline must be copper-tint (it currently is not, 2.4:1). Fields: white fill on focus plus the existing copper border and outline. |
| Tone (chrome) | `data-tone` on every section: paper, warm, ink. Progress bar copper normally, copper-tint when it sits over an ink section (header hidden). Mobile bar: soft shadow over light sections, 1px `--ink-line` hairline over ink so the bar does not melt into dark sections. |
| What does not shift | Body, section and header backgrounds do not interpolate. Hard roof edges are the signature. |

---------------------------------------------------------------------
## 5. PACKAGE 1: src/fx-hover.css and src/fx-hover.js

### 5.1 fx-hover.css (complete file; copy as is)
```css
/* fx-hover.css  v3.1  hover, colour, links, buttons, form micro-interactions. Loads after styles.css. */
:root{
  --fx-ease:cubic-bezier(.2,.7,.2,1);
  --fx-wash:rgba(152,86,50,.06);
  --fx-wash-warm:rgba(250,249,246,.65);
  --fx-wash-ink:rgba(221,167,131,.10);
  --fx-lift:4px;
}
.sec-warm{--fx-wash-now:var(--fx-wash-warm)}
.sec-ink,.contact{--fx-wash-now:var(--fx-wash-ink)}

/* S1 wash on clickable rows */
.svc-list .svc,.q h3{position:relative;isolation:isolate}
.svc-list .svc::before,.q h3::before{content:"";position:absolute;inset:0 -.75rem;z-index:-1;pointer-events:none;
  background:var(--fx-wash-now,var(--fx-wash));opacity:0;transform:scaleY(.94);
  transition:opacity .3s var(--fx-ease),transform .3s var(--fx-ease)}
.svc-list .svc:focus-within::before,.q h3:focus-within::before{opacity:1;transform:none}
.svc h3{transition:color .2s var(--fx-ease)}
@media (hover:hover) and (pointer:fine){
  .svc-list .svc:hover::before,.q h3:hover::before{opacity:1;transform:none;transition-duration:.2s}
  .svc:hover h3{color:var(--copper)}
  .xv-list button[aria-pressed=false]:hover{background:rgba(221,167,131,.05)}
}
@media (hover:none){
  .svc-list .svc:active::before,.q h3:active::before{opacity:1;transform:none;transition-duration:.1s}
}

/* S2 buttons and links */
.btn svg[viewBox="0 0 28 10"],.btn-text svg{transition:translate .2s var(--fx-ease)}
.btn-text svg,.btn-text:hover svg{transform:none}               /* cancels the old ungated transform nudge */
@media (hover:hover){
  .btn:hover svg[viewBox="0 0 28 10"],.btn-text:hover svg{translate:4px 0}
  .btn-text:hover{box-shadow:0 1px 0 var(--copper)}               /* second pixel of underline, no layout shift */
  .link-ink:hover{color:var(--on-ink)}
  .ftr a:hover{color:var(--copper-tint)}
  .hdr-phone:hover .hdr-phone-n{color:var(--copper)}
}
.link,.inl{text-decoration-thickness:1px;transition:text-decoration-thickness .2s var(--fx-ease),color .2s var(--fx-ease)}
.link:hover{text-decoration-color:currentColor}                   /* old rule faded the underline out */
@media (hover:hover){.link:hover,.inl:hover{text-decoration-thickness:2px}}
@media (min-width:1240px){
  .nav a::after{content:"";position:absolute;left:.75rem;right:.75rem;bottom:.3rem;height:2px;background:var(--copper);
    transform:scaleX(0);transform-origin:0 50%;transition:transform .25s var(--fx-ease)}
  .nav a[aria-current=true]::after{transform:none}
}
@media (min-width:1240px) and (hover:hover){.nav a:hover::after{transform:none}}

/* focus on ink */
.contact-copy :focus-visible{outline-color:var(--copper-tint)}

/* S3 hero phrase links */
.inl{color:var(--text);text-decoration-line:underline;text-decoration-color:var(--copper);text-underline-offset:.22em}
@media (hover:hover){.inl:hover{color:var(--copper)}}

/* S4 starter chips */
.chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.15rem}
.chip{min-height:44px;padding:.35rem .8rem;border:1px solid var(--copper);background:transparent;color:var(--copper);
  font-family:var(--ui);font-weight:600;font-size:.9375rem;line-height:1.2;cursor:pointer;
  transition:background-color .2s var(--fx-ease),color .2s var(--fx-ease),transform .12s var(--fx-ease)}
.chip[aria-pressed=true]{background:var(--copper);color:var(--paper)}
.chip:active{transform:scale(.97)}
.chip:focus-visible{outline:3px solid var(--copper);outline-offset:2px}
@media (hover:hover){.chip[aria-pressed=false]:hover{background:var(--fx-wash)}}

/* S5 issue tag stamp */
.issue-tag{position:relative}
.issue-tag.is-stamp{animation:fx-stamp .28s var(--fx-ease) both}
.issue-tag.is-stamp::after{content:"";position:absolute;inset:-1px;border:1px solid var(--copper);pointer-events:none;animation:fx-ring .7s var(--fx-ease) both}
@keyframes fx-stamp{from{transform:scale(1.07)}to{transform:none}}
@keyframes fx-ring{from{opacity:.7;transform:scale(1)}to{opacity:0;transform:scale(1.18,1.5)}}

/* S6 form focus fill and paper stack */
.form input[type=text]:focus,.form textarea:focus{background:var(--card)}
@media (min-width:640px){
  .form-wrap::before,.form-wrap::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;transition:opacity .6s var(--fx-ease)}
  .form-wrap::before{transform:translate(10px,10px);background:rgba(250,249,246,.5)}
  .form-wrap::after{transform:translate(20px,20px);background:rgba(250,249,246,.24)}
  html.fx-hover .form-wrap:not(.is-in)::before,html.fx-hover .form-wrap:not(.is-in)::after{opacity:0}
}

/* S7 copy number (shown by JS on fine pointers only) */
.big-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem}
.copy-num{min-height:44px;padding:0 .8rem;border:1px solid var(--ink-line);background:transparent;color:var(--on-ink-2);
  font-family:var(--ui);font-weight:600;font-size:.9375rem;cursor:pointer;
  transition:color .2s var(--fx-ease),border-color .2s var(--fx-ease),transform .12s var(--fx-ease)}
.copy-num:active{transform:scale(.97)}
@media (hover:hover){.copy-num:hover{color:var(--on-ink);border-color:var(--copper-tint)}}

/* S8 partial star (headline rating only) */
.stars .star-p{position:relative;display:inline-grid;width:18px;height:18px}
.stars .star-p svg{grid-area:1/1}
.stars .star-p svg:last-child{clip-path:inset(0 calc(100% - var(--f,100%)) 0 0)}
```
Notes the developer must respect:
- `.btn-text svg,.btn-text:hover svg{transform:none}` is deliberate. styles.css line 171 nudges with `transform`; our nudge uses `translate`. Without the cancel the arrow would move 8px.
- `.sec-warm`, `.sec-ink`, `.contact` set `--fx-wash-now` only for descendants; sections with neither class (paper) fall back to `--fx-wash`.
- Do not add `will-change`. Do not animate `box-shadow`. Do not add a hover to `.areas-big li` (not links).

### 5.2 fx-hover.js (function-level spec)
```js
(function(){ 'use strict';
  var d=document, root=d.documentElement;
  function $(s,r){return (r||d).querySelector(s)} function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('fx-hover');
  function safe(n,f){try{f()}catch(e){if(window.console)console.warn('fx-hover: '+n+' skipped',e)}}

  /* S4 chips: append or remove the chip's own sentence, never touch what the person typed */
  function chips(){
    var ta=$('#f-notes'), btns=$$('.chip[data-add]'); if(!ta||!btns.length) return;
    function has(b){ return ta.value.indexOf(b.getAttribute('data-add'))>-1 }
    function sync(){ btns.forEach(function(b){ b.setAttribute('aria-pressed', has(b)?'true':'false') }) }
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        var s=b.getAttribute('data-add');
        if(has(b)){ ta.value = ta.value.replace(s,'').replace(/ {2,}/g,' ').replace(/^\s+/,'') }
        else { ta.value = ta.value + (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + s + ' ' }
        ta.dispatchEvent(new Event('input',{bubbles:true}));   /* do NOT focus the textarea: avoids the phone keyboard jumping up */
        sync();
      });
    });
    ta.addEventListener('input',sync);   /* typing or deleting keeps the chips honest */
    sync();
  }

  /* S5 stamp: after a service/hero link fills the form, stamp the tag when it arrives on screen */
  function stamp(){
    var tag=$('#issue-tag'); if(!tag||!('IntersectionObserver' in window)) return;
    var armed=0;
    function fire(){ tag.classList.remove('is-stamp'); void tag.offsetWidth; tag.classList.add('is-stamp') }
    tag.addEventListener('animationend',function(e){ if(e.target===tag && e.animationName==='fx-stamp') tag.classList.remove('is-stamp') });
    var io=new IntersectionObserver(function(es){
      if(!armed||Date.now()>armed) return;
      if(es[0].isIntersecting && !tag.hidden){ armed=0; fire() }
    },{threshold:.9});
    io.observe(tag);
    $$('a[href^="?"]').forEach(function(a){                  /* app.js handler ran first (registered earlier) */
      a.addEventListener('click',function(){ armed=Date.now()+4000 });
    });
  }

  /* S6 paper stack appears after the form has revealed */
  function sheets(){
    var w=$('.form-wrap'); if(!w) return;
    if(reduce||!('IntersectionObserver' in window)){ w.classList.add('is-in'); return; }
    var io=new IntersectionObserver(function(es){
      if(es[0].isIntersecting){ io.disconnect(); setTimeout(function(){ w.classList.add('is-in') },250) }
    },{threshold:.3});
    io.observe(w);
  }

  /* S7 copy number: only where a tel: link is useless (mouse + clipboard) */
  function copyNum(){
    var b=$('.copy-num'), src=$('.big-phone'), st=$('.copy-status'); if(!b||!src||!st) return;
    if(!navigator.clipboard||!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    b.hidden=false; var t=0;
    b.addEventListener('click',function(){
      navigator.clipboard.writeText(src.textContent.trim()).then(function(){
        b.textContent='Copied'; st.textContent='Number copied';
        clearTimeout(t); t=setTimeout(function(){ b.textContent='Copy number'; st.textContent='' },1600);
      },function(){});
    });
  }
  safe('chips',chips); safe('stamp',stamp); safe('sheets',sheets); safe('copyNum',copyNum);
}());
```
Edge cases: sentence matching is plain `indexOf`, so a client who edits chip sentences in HTML keeps working. Do not `focus()` the textarea (mobile keyboard). Under reduced motion the stamp class is added but the global rule removes the animation (final state = tag visible, no ring).

Mobile behaviour: chips wrap in two rows at 390px (labels are short). Hover CSS is inert on touch; the `:active` wash gives tap feedback. Copy button never shows on touch. Paper stack hidden under 640px.

---------------------------------------------------------------------
## 6. PACKAGE 3: owner of index.html, styles.css, motion.js, app.js

### 6.1 HTML changes (exact snippets, in document order)

**H1 head: theme colour + new links.** Replace `<meta name="theme-color" content="#1F2B30">` with
```html
<meta name="theme-color" content="#FAF9F6">
```
Reason: on phones the sticky header is paper at the top in every section, so the address bar should be paper, not ink. Then add after `<link rel="stylesheet" href="styles.css">`:
```html
<link rel="stylesheet" href="fx-hover.css">
<link rel="stylesheet" href="fx-scroll.css">
```

**H2 progress bar leaves the header** (a fixed element inside a transformed header is clipped with it). Delete line `<span class="hdr-progress" id="progress" aria-hidden="true"></span>` inside `<header>` and put it right after the skip link, before `<header>`:
```html
<a class="skip" href="#main">Skip to the content</a>
<span class="hdr-progress" id="progress" aria-hidden="true"></span>
<header class="hdr" id="header">
```
app.js needs no change (it finds `#progress` by id and writes `--p`). Leave the old `.hdr-progress` rule in styles.css; fx-scroll.css overrides every property it sets.

**H3 tone attributes** (S9). Add `data-tone` to these opening tags, nothing else changes:
```
<section class="hero" id="top" data-tone="paper" ...>
<section class="reviews" id="reviews" data-tone="paper" ...>
<section class="sec sec-warm e-wave" id="services" data-tone="warm" ...>
<section class="sec sec-ink dia-sec e-step" id="where" data-tone="ink" ...>
<section class="sec decide" id="decide" data-tone="paper" ...>
<section class="sec sec-ink whole e-rake" id="whole" data-tone="ink" ...>
<section class="sec e-hip" id="projects" data-tone="paper" ...>
<section class="sec sec-warm e-saw" id="how" data-tone="warm" ...>
<section class="sec e-arc" id="checks" data-tone="paper" ...>
<section class="sec sec-warm areas-sec e-zig" id="areas" data-tone="warm" ...>
<section class="sec e-terrace" id="faq" data-tone="paper" ...>
<section class="contact e-chim" id="contact" data-tone="ink" ...>
<footer class="ftr" id="footer" data-tone="ink">
```
Also add a line to the SWAP-MAP comment: `tone attribute  [data-tone]  Keep with the section background: paper, warm or ink. Deleting a section needs no change.`

**H4 hero lead links** (S3). Replace the `.lead` paragraph in `.hero-right`:
```html
<p class="lead"><a class="inl" href="?issue=slipped#contact">Slipped slates</a>, a <a class="inl" href="?issue=leak#contact">leaking valley</a> or a <a class="inl" href="?issue=chimney#contact">chimney that needs relaying</a>. We look at the roof first, then tell you what it needs.</p>
```
Wording is unchanged, so no new claims. SWAP-MAP line: `hero phrases  .hero .inl  Keep each phrase linked to ?issue=slipped|leak|chimney|patching|notsure`.

**H5 partial star** (S8). In `.score .stars` (the headline rating only), replace the fifth `<svg><use href="#i-star"/></svg>` with:
```html
<span class="star-p" style="--f:80%"><svg aria-hidden="true"><use href="#i-star-o"/></svg><svg aria-hidden="true"><use href="#i-star"/></svg></span>
```
`--f` = (rating minus its whole number) times 100%. 4.8 gives 80%, 4.3 gives 30%. For a whole rating (5.0) leave five full stars. Add to SWAP-MAP: `rating star fill  .star-p --f  decimal part of the rating as a percent`. Do not touch card stars.

**H6 water drop** (S12). Inside `#marker`, after `<i class="m-dot"></i>`:
```html
<span class="marker" id="marker" aria-hidden="true"><i class="m-sh"></i><i class="m-ring"></i><i class="m-dot"></i><i class="m-drip"></i><b class="m-tag">Survey</b></span>
```

**H7 starter chips** (S4). In the notes field, after the `<textarea>`:
```html
<div class="field field-full">
  <label for="f-notes">What have you noticed?</label>
  <textarea id="f-notes" name="details" rows="4" placeholder="Where it is, what you can see, and when you first noticed it"></textarea>
  <div class="chips" role="group" aria-label="Tap to add a starting sentence">
    <button type="button" class="chip" aria-pressed="false" data-add="There is a damp stain on a ceiling.">Ceiling stain</button>
    <button type="button" class="chip" aria-pressed="false" data-add="Some slates or tiles look slipped or missing.">Slipped slates</button>
    <button type="button" class="chip" aria-pressed="false" data-add="Water is coming in near the chimney.">Near the chimney</button>
    <button type="button" class="chip" aria-pressed="false" data-add="The gutter overflows when it rains.">Gutter</button>
    <button type="button" class="chip" aria-pressed="false" data-add="I am not sure what the problem is.">Not sure</button>
  </div>
</div>
```

**H8 copy number** (S7). Replace `<p class="big-wrap">...</p>`:
```html
<p class="big-wrap"><a class="big-phone" href="tel:+441632960482" data-sample="phone">01632 960 482</a><button class="copy-num" type="button" hidden>Copy number</button><span class="vh copy-status" role="status"></span></p>
```
The script reads the number from `.big-phone`, so swapping the phone needs no extra edit.

**H9 scripts**: add the two fx scripts after `motion.js` (section 3.1).

### 6.2 CSS changes in styles.css (existing file, small and exact)
1. Gate the sticky-hover colour changes (touch devices keep the hover colour after a tap). Replace lines 95, 97, 99, 100:
```css
.btn-fill{background:var(--copper);color:var(--paper)}
.btn-line{background:transparent;color:var(--copper);--wipe:var(--copper)}
.sec-ink .btn-fill,.ftr .btn-fill,.contact .btn-fill{--wipe:var(--copper-tint)}
@media (hover:hover){
  .btn:hover::before{transform:none}
  .btn-fill:hover{border-color:var(--text)}
  .btn-line:hover{color:var(--paper)}
  .sec-ink .btn-fill:hover,.ftr .btn-fill:hover,.contact .btn-fill:hover{border-color:var(--copper-tint);color:var(--ink)}
}
```
2. Delete `.link:hover{text-decoration-color:transparent}` (line 104). fx-hover.css also cancels it, but remove it so the two do not fight.
3. Delete the non-link hover: line 691 `@media (hover:hover){.areas-big li{transition:color .3s}.areas-big li:hover{color:var(--copper)}}`. The town names are not links, so no hover affordance.
4. Mobile drawer fade (HDR2, not counted), append at the end:
```css
@media (max-width:1239px){.nav.is-open{animation:navIn .24s cubic-bezier(.2,.7,.2,1) both}}
@keyframes navIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
```
5. Do not touch `.hdr-progress`, `.bar`, `.sheet`, `.marker` rules.

### 6.3 motion.js change: magnet only where it earns its keep
In `touches()` replace the `$$('.btn').forEach(function (b) { ... })` block with:
```js
$$('.hero .btn-fill, #enquiry .btn-fill').forEach(function (b) {
  gsap.set(b, { '--mx': '0px', '--my': '0px' });
  b.addEventListener('pointermove', function (e) {
    var r = b.getBoundingClientRect();
    var x = clamp((e.clientX - (r.left + r.width / 2)) * 0.12, -4, 4), y = clamp((e.clientY - (r.top + r.height / 2)) * 0.2, -3, 3);
    gsap.to(b, { '--mx': x.toFixed(1) + 'px', '--my': y.toFixed(1) + 'px', duration: 0.4, ease: 'power3.out', overwrite: true });
  });
  b.addEventListener('pointerleave', function () { gsap.to(b, { '--mx': '0px', '--my': '0px', duration: 0.5, ease: 'power3.out', overwrite: true }); });
});
```
Reason: the magnet moved the nav CTA, the 3D-roof button and every dark-section button, and the elastic overshoot is a toy feel. Header phone, mobile bar and form fields never move.

### 6.4 app.js changes
- In the submit handler, add `submit.setAttribute('aria-busy','true')` next to `submit.disabled = true`, and `submit.removeAttribute('aria-busy')` in the `.catch`.
- Optional: in `setMenu(open)`, when `open` is true and the click came from the button, move focus to the first `#nav a`. Keep Escape behaviour.

### 6.5 Known defects found by reading (not tested): verify during QA
- Progress bar vanishes with the hidden header (fixed by H2 + S9).
- `meta theme-color` ink while the sticky header is paper (H1).
- `.contact` focus outline is copper on ink (fixed in fx-hover.css).
- Ungated hover colours (6.2.1), non-link hover (6.2.3), link underline fading to transparent (6.2.2).
- Count-up sets `0.0` before the trigger fires: confirm it never stays at 0.0 if the section is reached by anchor jump or reload at depth.
- Split-heading words start at `yPercent:112` and rely on ScrollTrigger firing: confirm headings are visible after reload deep in the page and after a fast jump to the bottom.

---------------------------------------------------------------------
## 7. PACKAGE 2: src/fx-scroll.css and src/fx-scroll.js

### 7.1 fx-scroll.css (complete file; copy as is)
```css
/* fx-scroll.css  v3.1  scroll-linked chrome and roof details. Loads after fx-hover.css. */

/* S9 progress bar: fixed, outside the header, survives the header hiding */
.hdr-progress{position:fixed;top:0;bottom:auto;left:0;right:auto;width:100%;height:3px;z-index:65;
  background:var(--copper);transform:scaleX(var(--p,0));transform-origin:0 50%;pointer-events:none;
  transition:background-color .3s var(--fx-ease,cubic-bezier(.2,.7,.2,1))}
html[data-tone-top="ink"]:has(.hdr.is-hidden) .hdr-progress{background:var(--copper-tint)}

/* S9 mobile bar edge: soft shadow on light sections, hairline on ink */
.bar::before{content:"";position:absolute;left:0;right:0;bottom:100%;height:18px;pointer-events:none;
  background:linear-gradient(to top,rgba(31,43,48,.16),rgba(31,43,48,0));transition:opacity .3s}
.bar::after{content:"";position:absolute;left:0;right:0;top:0;height:1px;pointer-events:none;background:var(--ink-line);opacity:0;transition:opacity .3s}
html[data-tone-bot="ink"] .bar::before{opacity:0}
html[data-tone-bot="ink"] .bar::after{opacity:1}

/* S10 roof edges build: sink up to 42% of their height, rise to full as the section arrives */
html.fx-scroll :is(.e-wave,.e-step,.e-rake,.e-hip,.e-saw,.e-arc,.e-zig,.e-terrace,.e-chim)::before{
  transform:translateY(calc(var(--er,0) * var(--eh) * .42))}

/* S11 contact: the lit window */
.contact-photo{--lamp:1}
.contact-photo::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--lamp,1);
  background:radial-gradient(58% 48% at 38% 58%,rgba(221,167,131,.15),transparent 72%)}
@media (max-width:999px){.contact-photo::after{background:radial-gradient(70% 45% at 50% 40%,rgba(221,167,131,.10),transparent 75%)}}

/* S12 water drop at each tour lock (world motion, so it falls with a soft gravity curve) */
.m-drip{position:absolute;left:-2.5px;top:7px;width:5px;height:7px;opacity:0;pointer-events:none;
  background:var(--copper-tint);border-radius:50% 50% 50% 50%/60% 60% 40% 40%}
.m-drip::after{content:"";position:absolute;left:50%;top:100%;width:14px;height:4px;margin:0 0 0 -7px;border:1px solid var(--copper-tint);border-radius:50%;opacity:0}
.marker.is-lock .m-drip{animation:fx-drip .95s .2s cubic-bezier(.35,.55,.5,1) both}
.marker.is-lock .m-drip::after{animation:fx-ripple .95s .2s cubic-bezier(.2,.7,.2,1) both}
@keyframes fx-drip{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:.9}78%{opacity:.9;transform:translateY(34px)}100%{opacity:0;transform:translateY(38px)}}
@keyframes fx-ripple{0%,76%{opacity:0;transform:scale(.4)}82%{opacity:.8}100%{opacity:0;transform:scale(1.2)}}

/* S13 slipped tile loosens when the Tiles layer is active (end keyframe equals the SVG attribute rotate(4 203 221)) */
.xv-slip{transform-box:view-box;transform-origin:203px 221px}
.xv-l.is-on .xv-slip{animation:fx-loosen 1.1s .25s var(--fx-ease,cubic-bezier(.2,.7,.2,1)) both}
@keyframes fx-loosen{0%{transform:rotate(4deg)}30%{transform:rotate(11deg)}62%{transform:rotate(2.5deg)}100%{transform:rotate(4deg)}}

/* S14 quote sheet: a copper margin rule and underlines write in while stage 2 is being read */
.sheet::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--copper);
  transform:scaleY(0);transform-origin:0 0;transition:transform .5s var(--fx-ease,cubic-bezier(.2,.7,.2,1))}
.sheet.is-read::before{transform:none}
.spec-sheet>div{position:relative}
.spec-sheet>div::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--copper);
  transform:scaleX(0);transform-origin:0 50%;transition:transform .45s var(--fx-ease,cubic-bezier(.2,.7,.2,1))}
.sheet.is-read .spec-sheet>div::after{transform:none}
.spec-sheet>div:nth-child(1){--k:0}.spec-sheet>div:nth-child(2){--k:1}.spec-sheet>div:nth-child(3){--k:2}
.spec-sheet>div:nth-child(4){--k:3}.spec-sheet>div:nth-child(5){--k:4}.spec-sheet>div:nth-child(6){--k:5}
.sheet.is-read .spec-sheet>div::after{transition-delay:calc(var(--k) * 50ms)}
```
Reading notes:
- `.xv-slip` already has an SVG `transform="rotate(4 203 221)"` attribute. The CSS keeps the same rotation point (user units with `transform-box:view-box`) so the tile does not jump when the animation starts or ends.
- The roof edge `::before` keeps its mask/clip-path. Only `transform` is added. The sink moves the shape into its own section (same background), so the previous section shows through where the edge used to be. The existing 1px seam overlap is unchanged.
- The hairline between `.bar::before` shadow and the page: the shadow sits above the bar (`bottom:100%`). When `.bar.is-away` hides the bar, the pseudo-elements go with it.

### 7.2 fx-scroll.js (function-level spec)
```js
(function(){ 'use strict';
  var d=document, root=d.documentElement;
  function $(s,r){return (r||d).querySelector(s)} function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
  function safe(n,f){try{f()}catch(e){if(window.console)console.warn('fx-scroll: '+n+' skipped',e)}}

  /* S9 tone: always runs (no animation, transitions are killed under reduced motion by styles.css) */
  function tone(){
    if(!('IntersectionObserver' in window)) return;
    var secs=$$('[data-tone]'); if(!secs.length) return;
    function watch(margin,attr){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting) root.setAttribute(attr,e.target.getAttribute('data-tone')) });
      },{rootMargin:margin,threshold:0});
      secs.forEach(function(s){ io.observe(s) });
    }
    watch('0px 0px -97% 0px','data-tone-top');    /* top 3% of the viewport: where the progress bar sits */
    watch('-96% 0px 0px 0px','data-tone-bot');    /* bottom 4%: where the mobile bar sits */
  }

  /* everything below needs motion.js (it defines rwMotion only when motion is allowed) */
  var m=window.rwMotion;
  function edges(){
    var gsap=m.gsap; root.classList.add('fx-scroll');
    $$('.e-wave,.e-step,.e-rake,.e-hip,.e-saw,.e-arc,.e-zig,.e-terrace,.e-chim').forEach(function(sec){
      gsap.fromTo(sec,{'--er':1},{'--er':0,ease:'none',scrollTrigger:{trigger:sec,start:'top bottom',end:'top 55%',scrub:.4,invalidateOnRefresh:true}});
    });
  }
  function lamp(){
    var ph=$('.contact-photo'); if(!ph) return;
    m.gsap.fromTo(ph,{'--lamp':0},{'--lamp':1,ease:'none',scrollTrigger:{trigger:'#contact',start:'top 80%',end:'top 25%',scrub:true}});
  }
  function sheet(){
    var sh=$('.sheet'), st2=$('.stages li:nth-child(2)'); if(!sh||!st2) return;
    m.gsap.matchMedia().add('(min-width:1000px)',function(){        /* sheet is sticky only from 1000px */
      m.ST.create({trigger:st2,start:'top 62%',end:'bottom 38%',onToggle:function(s){ sh.classList.toggle('is-read',s.isActive) }});
      return function(){ sh.classList.remove('is-read') };
    });
  }
  safe('tone',tone);
  if(m){ safe('edges',edges); safe('lamp',lamp); safe('sheet',sheet); }
}());
```
Why the tone observers use thin bands: a section is "under the progress bar" when it overlaps the top 3% strip, and "under the mobile bar" when it overlaps the bottom 4% strip. A single midline would colour the bar for the wrong section.
Timing: all of fx-scroll.js runs synchronously after motion.js, so its ScrollTriggers are created after the pins (correct measurement order) and are refreshed by motion.js's existing `fonts.ready` and `load` refreshes.
Cost note: `--er` is inherited, so while an edge section is scrubbing the browser recalculates style for that section's subtree. It only runs inside a 45%-of-viewport window per section. QA should sample frame times over #whole (largest subtree). Kill switch: delete `edges()` from the run list.
Out of scope on purpose: no tone observers on the pinned tour, no changes to existing ScrollTriggers, no `will-change`.

Mobile behaviour: tone bar shadow works at 390px, edges and lamp run (cheap), drip runs in flow mode (marker lock is toggled by `paint(k,true)`), sheet reaction is desktop only, loosen runs when the Tiles row is tapped.

---------------------------------------------------------------------
## 8. Acceptance checks (for the QA agents)

1. Console clean at 390 and 1440, with and without `prefers-reduced-motion`, and with `data-motion="off"`.
2. Header hidden at y=3000, 1440x900: `#progress` visible at top 0 with height 3px, colour copper-tint when the ink section is under it, copper on paper.
3. No horizontal overflow at 360 to 1920 (paper stack offsets 20px right and down: check 640 to 1000 widths).
4. Chips: press toggles `aria-pressed`, text is appended once, unpress removes only that sentence, typed text preserved, no focus jump.
5. Hero link click: lands on form, tag reads "About: ...", tag stamps once, first field focused.
6. Hover on `.svc-list .svc` and `.q h3`: wash visible, no layout shift, no wash on the lead card, none on `.areas-big li`.
7. `.btn-text` arrow moves 4px (not 8px) on hover. Touch emulation: no sticky colour on buttons.
8. Roof edges: at load of a deep anchor (reload at #faq) all edges full height; scrolling back up never leaves a hairline gap at any seam (check all nine at 1440 and 390).
9. Tour: drip plays once per lock in pinned and flow modes, nothing under reduced motion.
10. Quote sheet at 1280: rule and underlines appear while stage 2 is in the reading zone, clear at stage 3, nothing under 1000px.
11. Mobile bar over `#where`, `#whole`, `#contact`: hairline visible; over paper sections: soft shadow.
12. Reduced motion: all text visible, sheets visible, chips and copy button work, no animation running.
13. Frame-time sampling while scrolling #whole and #where.

## 9. Honest limits
- Not run, not tested. Contrast values hand-computed.
- Chromium only. `html:has()` (progress tint), `inset` clip-path and `translate` property are fine in current Chrome, Safari 15.4+, Firefox 121+, but unverified here.
- The drop animation uses a soft gravity curve; it is world motion, not UI.
- Hero photo placeholder (another firm's crew) is still not fixed by this spec.
