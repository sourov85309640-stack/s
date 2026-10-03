# IDEAS agent #1: UAV reference reverse-engineering, for the Ridgewell roofing homepage

## 0. How this was read (and honest limits)

- Reference: `/root/.claude/uploads/.../2cd7e3cd-uav-aerial-solutions-site.html` (8 MB). It is a wrapper page holding a JS object `PAGES` of 11 full pages. I decoded them into `../uav/p*.html` (my own files, outside the project): `phome.html`, `pservices.html`, `pprocess-deliverables.html`, `pabout.html`, `pcontact.html`, etc.
- Line refs below: **H** = `../uav/home.html` (the stripped homepage you pointed at), **S** = `../uav/pservices.html` (inner-page script, shared by every inner page).
- **The drone flying between boxes is NOT on the homepage.** `home.html` has no drone at all. It is the "flight-path timeline" on the inner pages: `.fl-drone` CSS at S:3070-3091, JS `initFlight()` at S:3885-3927, markup at `pprocess-deliverables.html:3392`. Your roofing build already has the pinned survey marker in #where, which is the same idea. See idea 3.
- I ran the reference in headless Chromium at 1440x900 (`../uav/probe_ref.py`, `probe2.py`, `probe3.py`, screenshots in `../uav/shots/ref_*.png`). Verified facts are marked **[verified]**. Everything else is from reading code. Headless frame timing (avg 16.5 ms, 0 frames over 33 ms) says nothing about real-device jank, so "janky" claims below are code-based risk, not measured.
- Not tested: real phones, Safari, Firefox, screen readers.

## 1. What UAV actually does (inventory, with where)

| Thing | Where | One-line mechanism |
|---|---|---|
| Section hover tint + pointer glow | H:2103-2108, JS H:3421-3432 | Every `main>section.sec` gets an `<i.fx>` with `.tone` (flat wash) and `.lit` (620px radial). `pointerenter` adds `.is-on`, opacity .8s / .6s. Glow follows pointer via `gsap.quickTo` .7s. |
| Per-section hue | H:3424 | Ten different RGB hues (teal, blue, green, orange, red, yellow, pink...). |
| Card hover | H:2112-2116, 788, 1597-1598, 1742 | `.svc::before` tint box blooms (scale .965 to 1, opacity .5s) + card lifts + h3 shifts 4px and turns copper + photo scales 1.027. |
| Row hover | H:2118-2121, 2134 area, 2148-2150 | `translate:8px 0` .5s on facts/steps/triage rows; FAQ row gets a tint `::before` (`scaleY(.9)` to 1, opacity .4s). |
| Photo push-in | H:2133-2136 | `scale:1.045` over 1.1s on hover, big photos. |
| Buttons | H:160-166, 755-770, 1592-1602, 2047, 2124-2126 | Hover is arrow nudge only (bg does not change, see Weak). Magnetic `translate`. Press `scale:.97`. |
| Nav | H:176-206, 755-762, 2955-2993 | Underline scaleX draw .2s, hide on scroll down (delta >8) / show up (delta <-6), 2px scaleX progress hairline. |
| Section rail | H:2032-2044, JS H:3357-3392 | Fixed right-edge dots, tone flips light/dark by reading each section's background luminance. |
| Marquee | H:2019-2027, JS H:3326-3356 | GSAP-ticker driven, 38 px/s + scroll-velocity boost (to 420), direction flips with scroll, `skewX` up to 5deg, hover slows to 15%. |
| Cursor ring | H:2049-2051, JS H:3433-3440 | 34px ring, `quickTo` .38s, scales 1.82 on links. |
| Split-word headings | JS H:3285-3325 | Every h2 split into masked words, `yPercent 118 to 0`, .95s power4.out, stagger .045. |
| Scroll-driven progress lists | H:1627-1632, JS H:3090-3125, 3147-3185 | Spine line scrubs `scaleY`, dots/steps get `is-active`/`is-complete`. |
| Flight path + drone | S:3070-3091, 3885-3927 | SVG cubic path through step dots, `stroke-dashoffset` fill, drone `translate` + 25% of path angle. |
| Services index photo swap | S:2999-3012, JS S:3845-3858 | Hover or focus a row, a sticky photo stage cross-fades. |
| Fan panels | S:2669-2681, JS S:3744-3762 | Hover/focus expands panel (`flex-grow` .85s). |
| Stack cards | S:2824-2826, JS S:3958-3972 | Sticky cards recede (scale, dark overlay) as next slides over. |
| Count-up | JS S:3930-3938 | IO threshold .6, 1.5s easeOutQuart, `Math.round`. |
| Line-in-focus statements | S:3026-3031, JS S:3861-3874 | Line nearest viewport middle goes white and nudges 14px. |
| Form polish | H:700-706, 1607-1608, 2158-2168 | Label colour on `:focus-within`, 4px copper ring, red ring on `aria-invalid`, one "Email or phone" field. |
| Seam draw-in | H:100-106, JS H:3021-3025 | 1px copper line at each section top, `scaleX 0 to 1` .68s. |
| Menu | H:1659-1660, JS H:2886-2920 | Burger to X, panel fade-down .24s, closes on Esc / outside / link, restores focus. |

Section "theme shift while scrolling": UAV has **no scroll-interpolated background**. Sections just alternate paper / warm / dark with hard cuts plus the 1px seam. The only scroll-driven theme change is the rail flipping `data-tone` (H:3377-3380). The "background colour changes" you remember are the hover washes above.

## 2. Verified problems in the reference [verified]

1. **Rail steals clicks.** All 9 `.rail a` are 118 x 21 px (hidden label still takes layout width), sitting at x 1300-1418 at 1440 wide. `elementFromPoint` over the FAQ shows the right end of 5 of 7 FAQ question rows (their arrow) is hijacked by the rail (`RAIL-HIJACK`). Clicking a FAQ arrow scrolls the page to another section. Also 21 px tall is under the 24 px WCAG 2.2 target minimum.
2. **Rainbow hover washes.** `getComputedStyle` of `.fx .tone`: services `rgba(204,152,101,.13)`, aerial-data `rgba(58,164,168,.09)` (teal on dark), faq `rgba(102,134,208,.09)` (blue), process `rgba(196,96,76,.13)` (pink/red, see `shots/ref_process.png`), survey green, contact green, etc. Breaks the one-copper palette and looks like a theme demo.
3. **Service card hover tint overlaps the neighbour.** In `shots/ref_services_hover.png` the tint box (inset -14px / -12px) pokes under the next card's photo. Four rules fight over the same transform: `translateY(-4px)` (H:788), `-2px` (H:1597), `-3px` (H:1742), plus `::before` bloom, h3 shift, photo scale. Too many simultaneous effects. And the card is not a link (only the small "Discuss mapping" link is), so the hover promises a click that mostly does nothing.
4. **`.btn:hover` does not change colour.** Base is `background:var(--copper-strong)` (H:162) and hover sets the same value (H:765, 767). The only hover feedback is a 3px dark shadow line and the arrow nudge. And `:active` is `translateY(1px)` (H:766, 1602) in one place and `scale:.97` (H:2126) in another.
5. **Ticker skew.** `skewX(-4.64deg)` after 6 wheel ticks. Also outline text (`-webkit-text-stroke`, H:2023), which your rules ban. Auto-moving more than 5 s with no pause control (WCAG 2.2.2); `aria-hidden` does not excuse it for sighted users.
6. **Hero scroll fade.** `.hero-copy` goes to `autoAlpha:.55` while still on screen (H:3396-3398). Headline and buttons dim for no reason.
7. **Inactive text is dimmed.** `.projects .facts .uav-row` and `.process-step` sit at `opacity:.78` / `.82` until reached (H:1630, 1645). Lower contrast for text people are actively reading.
8. **Fixed-pixel Figma layout.** `--frame:1440`, `min-height:988/850/860`, `top:525px`, `.form-back{height:714px}`. Brittle with real content. Roofing build must not copy this.
9. **Counter bug.** `Math.round(to*e)` (S:3934) cannot show 4.9. Sets text to `'0'` at init (S:3936) so if the IO never fires the number shows 0. No `tabular-nums`, so width jitters.
10. **Fan panels animate `flex-grow`** (layout, S:2669) and scale the h3 to .72 (blurry text, S:2676).
11. **Cursor ring** is added on top of the system cursor, `z-index:200`, hides text under it (see ring over "mapping" in `ref_services_hover.png`).
12. **Per-frame work:** `gsap.set(fill,...)` plus `classList.toggle` on every scroll tick (H:3103-3112), `getBoundingClientRect` on every `pointermove` for each section (H:3430), `getBoundingClientRect` x2 per card per scroll in the stack (S:3962-3964). Fine on desktop, wasteful.
13. **Autoplay.** `initViewer` auto-advances every 5.2 s (S:3676-3705) and `initTimecode` fakes a recording clock (S:4017). Both are decoration that does not help a roofing visitor decide.

---

## 3. Ranked ideas (22)

Ranking = conversion value for a roofing visitor x how well it fits the plain, calm brand x risk. Items marked (have) already exist in the roofing build, so the spec is a refinement.

### 1. Row and card hover wash, one copper tint, opacity-only
- **Source:** FAQ row `::before` H:2148-2150, triage row H:2127-2130, services bloom H:2112-2114. This is the "background colour change on hover" you asked about.
- **Why it converts:** tells a visitor "this row is clickable" without noise. On FAQ and service rows it nudges the click that leads to the enquiry.
- **Risk:** low if limited to copper tint and `hover:hover`. UAV's version used 10 hues and overflowed into neighbours.
- **Spec:** wrap in `@media (hover:hover) and (pointer:fine)`. Row/card gets `position:relative;isolation:isolate`. `::before{content:"";position:absolute;inset:0 -12px;z-index:-1;background:rgba(152,86,50,.07);opacity:0;transform:scaleY(.92);transition:opacity .25s cubic-bezier(.23,1,.32,1),transform .3s cubic-bezier(.23,1,.32,1);pointer-events:none}` `:hover::before,:focus-within::before{opacity:1;transform:none}`. Use `rgba(221,167,131,.18)` on paper and `rgba(221,167,131,.10)` on ink. Never more than .14 effective alpha behind copper text (copper #985632 on paper is about 5.5:1, on a .14 tint about 5:1, ok). No tint box may extend past its own column gap (keep inset negative <= half the gap). Also shows on `:focus-within` so keyboard users get it. No hover effect on touch.

### 2. Card hover system (3 recipes, never stacked)
- **Source:** about-col lift with pre-rendered shadow H:2142-2145 (good), services (too much) H:2112-2116.
- **Why:** services and project cards are the main click targets after the hero. One clean hover reads premium.
- **Risk:** low. UAV's mistake was stacking five effects.
- **Spec:** make the whole card the link (stretched `::after{content:"";position:absolute;inset:0}` on the real `<a>`; the card itself is not an `<a>`, keep one tab stop). Pick ONE recipe per card type:
  - **Lift:** `transform:translateY(-4px)` .45s `cubic-bezier(.23,1,.32,1)` + `::before` shadow `0 24px 40px -22px rgba(31,43,48,.38)` fading `opacity 0 to 1` over .45s (animate opacity of a pre-drawn shadow, never `box-shadow`).
  - **Wash:** idea 1.
  - **Photo push:** idea 9.
  Link arrow inside the card nudges `translateX(4px)` .22s. Press: `scale:.98` .12s. Under `prefers-reduced-motion` no transform, keep colour change only.

### 3. Job path with a roofing marker (UAV flight path + drone), non-pinned, for #how
- **Source:** S:3070-3091 (CSS), S:3885-3927 (JS), markup `pprocess-deliverables.html:3392`. This is the "drone flying between boxes".
- **What it does:** an SVG curve (cubic Bezier through each step dot, control points at mid-Y) is drawn dashed grey; a second copper path fills by `stroke-dashoffset` as you scroll; a 46px circle marker rides the head of the fill with a slight tilt; step cards alternate left/right of the dots; active step gets a copper dot, copper card border, reached steps stay copper.
- **Implementation detail:** `measure()` reads dot centres via `getBoundingClientRect`, builds `d`, `fill.getTotalLength()`, then a 241-point lookup table. `update()` on scroll (rAF throttled): anchor = `innerHeight*.62 - wrapTop`, `L = lengthAtY(anchor)` by binary search, `drone.style.transform = translate(x,y) rotate(angle*.25)`.
- **Weak:** (a) re-measures only on resize, `load` and `fonts.ready`. Late images or an accordion above shift layout and the marker drifts off the dots. No ResizeObserver. (b) Inactive cards at `opacity:.72` (S:3088) drops text contrast. (c) Under 1024px the dots go to one left column but the curve is still a pair of S bends through a straight column (looks like a wobble, `translate:none` on dots). (d) Marker visible only when `fl-live` (JS), fine, but `display:none` without it. (e) `will-change:transform` forever.
- **Why it helps a roofer:** a stage-by-stage "how a roof job runs" (survey, written quote, scaffold, strip, re-roof, handover) is the second biggest objection killer after reviews. The marker makes the order obvious and rewards scrolling.
- **Risk:** medium (measurement drift, mobile geometry). Your #where pinned tour already does a marker, so do not use two markers close together.
- **Spec for #how (desktop >= 1024 only):** same path maths. Marker = 40px circle, paper bg, 1px copper ring, small tile-stack or ridge-cap icon (inline SVG, no drone). Anchor `innerHeight*.6`. Add `new ResizeObserver(measure)` on the wrap and on `document.body` (debounced 120 ms) so late layout cannot desync. Tilt `rotate(clamp(angle*.2,-8,8)deg)`. Cards: inactive keep opacity 1, dim only the border to `var(--line)`; active border copper + `translateY(-2px)` .4s. Marker uses only `transform`; remove `will-change` when `L` unchanged for 250 ms. Below 1024: no path, no marker, a straight 2px copper spine `scaleY` scrubbed (see idea 13) with dots. Reduced motion: whole path drawn, all steps `is-reached`, marker hidden.

### 4. Tone-aware chrome (the honest version of "theme shift while scrolling")
- **Source:** `toneOf()` H:3274-3280, section `onToggle` H:3377-3380, rail colour transition H:2033-2034.
- **What it does:** a fixed element recolours (ink on light sections, white on dark) as different sections pass the middle of the screen.
- **Weak:** `toneOf` reads `backgroundColor` once and caches it; sections with image/gradient bg report transparent = "light" (wrong). Only the rail uses it.
- **Why it converts:** the mobile call bar, header progress hairline and spy dots stay legible over both paper and ink sections, so the call button never disappears into a dark section.
- **Risk:** low.
- **Spec:** author `data-tone="light|dark"` on every `<section>` in HTML (do not detect). One IntersectionObserver with `rootMargin:"-50% 0px -50% 0px"` sets `document.documentElement.dataset.tone` to the intersecting section's value. CSS: `:root{--chrome:#1F2B30;--chrome-line:rgba(31,43,48,.28)} :root[data-tone=dark]{--chrome:#FAF9F6;--chrome-line:rgba(250,249,246,.32)}`; chrome elements use `color:var(--chrome); transition:color .35s ease, background-color .35s ease` (colour transition is fine on 3-4 small elements). No JS needed under reduced motion except setting the attribute (no animation).

### 5. Button system: colour change by opacity, arrow nudge, press, gentle magnet (have: magnetic)
- **Source:** H:160-166, 755-770, 1592-1602, 2047, 2124-2126, magnet JS H:3408-3421.
- **Weak:** hover colour is identical to base so there is no colour change (verified). `:active translateY(1px)` and `scale:.97` conflict. Magnet: `dx*10` with `dx` in +/-0.5 gives +/-5px, but it only listens on the button itself so there is no approach feel, and the hit area moves under the cursor. Applied to every `.btn` including the nav CTA.
- **Why:** primary CTA must feel solid. This is the most-clicked element on the page.
- **Risk:** low.
- **Spec:** `.btn{position:relative;isolation:isolate;background:#985632;color:#fff} .btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#1F2B30;opacity:0;transition:opacity .22s cubic-bezier(.23,1,.32,1)}` hover: `::before{opacity:1}`. Arrow span `transition:translate .2s var(--ease); :hover translate:4px 0`. Press: `.btn:active{scale:.97;transition-duration:.12s}` (use `scale` only, never mix with `transform`). Magnet only on the hero primary and the contact submit: max +/-3px, pointermove listener on a 24px padded wrapper (not the button), `translate` property via CSS vars, transition `translate .3s cubic-bezier(.23,1,.32,1)`. Never on the header phone, mobile bar, or form fields. Minimum 44px height.

### 6. Services index with hover/focus photo swap
- **Source:** S:2999-3012 CSS, S:3845-3858 JS.
- **What:** a text list of services on the left (number, name, one line, arrow) and a sticky photo on the right. Hovering or focusing a row fades that service's photo in (`opacity .7s`, `img scale 1.08 to 1` over 1.6s). Active row gets a tint `::before` (`scaleY(.6)` to 1, opacity .4s) and number turns copper.
- **Weak:** `pointerenter` fires on every row you cross, so fast mouse travel flickers the photo (the fan has a 90 ms intent delay, this does not). Stage has fixed `aspect-ratio:4/4.5`. Mobile uses inline thumbs (good).
- **Why:** a roofer's services (slate, flat roofs, chimneys, guttering, repairs) are compared visually. One screen, one list, one big photo is faster than six cards. Every row is also a link to enquire.
- **Risk:** medium (photos needed per service, sample images flagged).
- **Spec:** desktop >= 1024, `hover:hover`. 140 ms hover-intent timer before swap (`setTimeout`, cleared on leave). Photo swap = `opacity` 0 to 1 .45s, inner `img` `scale 1.05 to 1` .9s `cubic-bezier(.23,1,.32,1)`, once only per swap. Active row: idea 1 wash + `translate:6px 0`. Keyboard: `focus` swaps too, `aria-current="true"` on active row. Stage keeps the roof-gable clip. Under 1024: rows stack, each has its own 16:9 thumb, no JS swap.

### 7. Form polish plus single "Email or phone" field
- **Source:** H:700-706, 1607-1608, 2158-2168, markup H:2630-2650, validation JS H:2800-2830 area (`contactIsValid`).
- **What:** label turns copper on `:focus-within` (.3s), 4px ring `rgba(copper,.16)` fades in .4s, `aria-invalid` gives red ring, `role=status` live region, ONE required "Email or phone" field accepting either, name and postcode optional.
- **Weak:** one generic error for every failure, placeholder repeats the label, no per-field message, `form-back` sheets use fixed 714px/842px heights.
- **Why:** friction is the whole game on a quote form. Fewer required fields and an either/or contact field is a real conversion trick.
- **Risk:** low.
- **Spec:** required fields: phone-or-email + "What needs doing". Optional: name, postcode. Per-field message under the field (`<p id=...-err>` + `aria-describedby`), error shown on blur or submit, not on every key. Focus ring `box-shadow:0 0 0 3px rgba(152,86,50,.18)` + `border-color:#985632`. Do NOT duplicate label as placeholder; use an example in `placeholder` only ("07700 900123 or you@email.co.uk"). Submit button: while sending, `aria-busy`, label "Sending", disabled. Success replaces the form with a short confirmation, focus moved to it. Optional depth: two paper "sheets" behind the form `transform:translate(10px,10px)` and `(20px,20px)` at .55 / .28 alpha (H:683-685), static, no animation.

### 8. Count-up figures (fixed)
- **Source:** S:3930-3938.
- **Weak:** see verified list 9.
- **Why:** years trading, roofs completed, rating. Small, honest proof when numbers are real. Our numbers are samples, flagged `data-sample`.
- **Risk:** low if used on 3 numbers at most.
- **Spec:** markup keeps the final value (`<b data-count="4.9" data-dec="1">4.9</b>`) and `font-variant-numeric:tabular-nums; min-width:Nch`. JS only on `fine` or any pointer but never under reduced motion: IO `threshold:.6`, once. Do not set `0` until the IO says it is intersecting (set the start value in the same frame the tween starts). Duration 1.2s, ease `1-(1-p)^4`, `toFixed(dec)`. Wrap the animated number in `aria-hidden`, put the final value in a visually hidden span or `aria-label`.

### 9. Photo push-in on hover and curtain reveal on enter
- **Source:** hover H:2133-2136 (`scale:1.045` 1.1s), reveal `clipPath inset(0 0 18% 0)` + `scale 1.03` .82s (JS H:3060-3070 area, svc loop ~H:3067).
- **Why:** makes project photos feel alive, low cost.
- **Weak:** reveal uses `clip-path` (paint cost, and your motion rule is transform/opacity only). Hover scale on a photo that is not clickable.
- **Risk:** low.
- **Spec:** hover only if the card is a link: `img{transition:scale .9s cubic-bezier(.23,1,.32,1)} a:hover img{scale:1.04}` frame `overflow:hidden`. Reveal without clip-path: a paper-coloured `::after` curtain over the frame, `transform:scaleY(1)` to `0`, `transform-origin:top`, .9s `cubic-bezier(.77,0,.175,1)` (strong ease-in-out is fine for a mask), image `scale 1.04 to 1` over 1.1s, once. If the frame is a gable shape, the curtain is clipped by the frame already.

### 10. Header behaviour that never loses the phone number (have: hide on scroll)
- **Source:** H:2955-2993 (hide when `delta>8`, show `delta<-6`, always at `y<80`, locked while menu open or focus inside).
- **Weak:** the hidden header takes the only CTA with it at exactly the moment a reader decides to act.
- **Spec:** keep thresholds (hide 8px down, show 6px up, `y<80` always visible, `focus-within` locks). Add: do not hide at all if `#contact` is within 1.5 screens, and keep the phone number as a separate 44px pill (`position:fixed; right:16px; top:12px; transform:translateY(0)`) that stays when the bar hides (desktop). Hide uses `transform:translateY(-101%)` `.32s cubic-bezier(.4,0,.2,1)`. Mobile: never hide, the existing bottom call bar stays.

### 11. Ridge seam draw-in at section tops
- **Source:** `animateSeam` H:3021-3025, `.seam` H:100-106 (1px copper, `scaleX 0 to 1` .68s, `power2.out`, once at `top 88%`).
- **Why:** a quiet "chapter start" detail. It matches the roof-edge sections: the seam can be the ridge line.
- **Risk:** low.
- **Spec:** reuse your existing footer roofline draw. For each `.e-*` edge, a 1.5px copper-tint SVG stroke (`vector-effect:non-scaling-stroke`) along the edge with `stroke-dasharray:1;stroke-dashoffset:1` to 0, 0.9s, once at `top 90%`, `stroke:rgba(152,86,50,.45)`. Reduced motion: `dashoffset:0` static.

### 12. Split-word heading reveal (have: helpers), done safer
- **Source:** H:3285-3325.
- **Weak:** `aria-label` on the h2 and `aria-hidden` on every word span (screen readers get the label, ok) but `window.setTimeout(play,7000)` leaves a heading invisible for up to 7s if the ScrollTrigger never fires. `.sw` uses `overflow:hidden` with a -.08em/.18em padding hack to protect descenders.
- **Spec:** hide words only after JS adds `html.has-split` (so no-JS and failure show the text). Safety `setTimeout` 2200 ms. `.sw{display:inline-block;overflow:hidden;vertical-align:top;padding:.1em 0 .22em;margin:-.1em 0 -.22em}`. `yPercent:110 to 0`, .9s, `power4.out`, stagger .04, max 12 words (longer headings fade as one line). Keep real text in the DOM (no `aria-label`).

### 13. Reading spine with active step (UAV projects facts + process)
- **Source:** facts spine H:1627-1632 and JS H:3090-3125; process line H:1641-1650 and JS H:3147-3185; mobile variants H:1679-1686.
- **What:** a 1-2px line fills as you scroll; each row's dot becomes copper when reached.
- **Weak:** work per scroll tick (`gsap.set` + 2 `classList.toggle` per row), inactive rows at `opacity:.78`, mobile version uses `setTimeout(300)` to clear `is-active`.
- **Why:** shows the reader how far they are in "what we check on the roof" and gives momentum.
- **Risk:** low.
- **Spec:** one `ScrollTrigger.create({trigger:list,start:'top 70%',end:'bottom 45%',scrub:.4,onUpdate:s=>line.style.transform='scaleY('+s.progress+')'})`. Row state by one IO per row (`rootMargin:'-45% 0px -45% 0px'`) toggling `.is-active`, reached rows keep `.is-done`. Inactive row opacity stays 1, only the dot is hollow. Reduced motion: line full, all dots filled.

### 14. Section spy rail (have: nav spy) done right
- **Source:** H:2032-2044, H:3357-3392. Dot, label on hover/focus, `aria-current`, progress fill `scaleY`.
- **Weak:** see verified problems 1 (dead zone, 21px targets). Hidden under 1100px. Hover-only label.
- **Why:** orientation on a long page, plus "FAQ" and "Contact" one click away.
- **Risk:** medium (it overlaps content at the right edge).
- **Spec:** show only >= 1280px wide AND >= 760 tall. `ol` is `pointer-events:none`, each `a` `pointer-events:auto` with a **44 x 24** hit box (dot 9px centred, label absolutely positioned and `pointer-events:none`, not in flow). Sit at `right:max(10px,calc((100vw - 1240px)/2 - 40px))` so it lives in the page gutter, not over content. Labels fade in `.2s` on `:hover` and `:focus-visible`, and show for 1.2s after the active section changes. Tone from idea 4. Fill via the same scrub as idea 13. Click uses the existing Lenis `scrollTo` with 92px offset.

### 15. Calmer areas-served marquee (UAV services ticker)
- **Source:** H:2019-2027, JS H:3326-3356.
- **Weak:** velocity boost (to 420 px/s), direction flip, skew, outline text, no pause, JS-driven every frame.
- **Why:** a strip of the towns you cover ("Cirencester, Tetbury, Stroud, Cheltenham...") is local trust, and it sits well between sections.
- **Risk:** medium (WCAG 2.2.2, "too much" for you).
- **Spec:** pure CSS: duplicate the list once, `.track{display:flex;width:max-content;animation:run 70s linear infinite} @keyframes run{to{transform:translateX(-50%)}}` (about 28 px/s). No skew, no velocity. `:hover,:focus-within{animation-play-state:paused}`. Text solid `#1F2B30`, 22-28px, separated by a small roof-ridge SVG, edges faded with `mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)`. `prefers-reduced-motion`: static, wrapping, centred, no animation. `aria-hidden="true"` and put the same towns in the real areas section.

### 16. Line-in-focus statements (UAV "Start with the question")
- **Source:** S:3026-3031 CSS, S:3861-3874 JS.
- **What:** three big statements; the one nearest screen centre is white, the others dim to .5 alpha.
- **Why:** a good 3-promise moment on a dark section ("Written quote before work starts", "Photos before and after", "One tidy site").
- **Risk:** medium: copy must be real, not invented. Dim alpha .5 on cream over ink is still about 6:1 but check.
- **Spec:** IO with `rootMargin:'-45% 0 -45% 0'` instead of per-scroll `getBoundingClientRect`. Active `color:#FAF9F6; translate:12px 0`; inactive `color:rgba(250,249,246,.58)` (keep >= 4.5:1). Transition `color .5s, translate .6s cubic-bezier(.23,1,.32,1)`. Reduced motion: all at full colour, no translate. No-JS: all at full colour.

### 17. Pointer light on dark sections (have), single hue and cheaper
- **Source:** H:2103-2108, JS H:3421-3432.
- **Weak:** whole-section tint on `pointerenter` (flat wash, opacity .8s) AND a 620px glow; ten hues; a `getBoundingClientRect` per `pointermove` per section; ten always-mounted `will-change` layers.
- **Spec:** dark sections only. One glow element per dark section (or one global, repositioned). `width:520px;height:520px;background:radial-gradient(circle,rgba(221,167,131,.16),transparent 62%)`. Position via `translate3d` from cached section rect (update the rect on resize/scroll end, not per move). `quickTo` .6s `power3.out`. Fade opacity .5s on enter/leave. No flat tone wash. No glow on light sections. Off under `prefers-reduced-motion` and on touch.

### 18. Text link with rule (UAV `.tlink`)
- **Source:** H:154-157, 772-775.
- **What:** link text + a 1px rule below; on hover the rule and text turn copper and the arrow nudges 4px.
- **Spec:** `.tlink .rule{transform-origin:left;transition:background-color .2s ease} .tlink:hover .rule{background:#985632}` plus a second copper rule `scaleX(0 to 1)` .3s `cubic-bezier(.23,1,.32,1)` for a draw-under effect. Arrow `translateX(4px)`. 44px min hit height via padding. Use this for "See this project" and "Read the guide" links so the page is not all filled buttons.

### 19. Mobile menu contract (UAV initMobileMenu)
- **Source:** H:2886-2920, H:1659-1660, burger H:841-844.
- **Good:** `aria-expanded`, label swap "Open menu / Close menu", focus the first link on open, Escape closes and returns focus, outside `pointerdown` closes, link click closes, nav forced visible while open, burger lines `transform` .22s.
- **Spec:** check roofing menu against that list. Panel `animation: .24s cubic-bezier(.23,1,.32,1)` from `translateY(-6px)` + `opacity:0`. Lock scroll with Lenis `stop()` while open, `start()` on close. Close on `resize` past the breakpoint (UAV does this on inner pages only, H:2750 area).

### 20. Static paper stack under the form (UAV `.form-back`)
- **Source:** H:683-685, entry `gsap.from('.form-back',{y:'+=18'})` H:~3236.
- **Why:** subtle depth that says "this is a real sheet we will read". Costs nothing.
- **Spec:** two `::before/::after` sheets, `transform:translate(10px,10px)` `rgba(240,236,227,.7)` and `translate(20px,20px)` `rgba(221,167,131,.18)`, `z-index:-1`, hidden under 640px. No animation, no JS.

### 21. Stack cards that recede (UAV us-card)
- **Source:** S:2824-2826, JS S:3958-3972.
- **What:** sticky cards, each scales to .95 and darkens as the next slides over it.
- **Weak:** two `getBoundingClientRect` per card per scroll event; fixed 350px card heights.
- **Why:** a good way to show "Roof types" or "Why Ridgewell" without a carousel. Medium wow, higher risk (sticky inside `overflow` ancestors breaks silently).
- **Spec:** desktop >= 1024 only; ScrollTrigger per card (`trigger:next,start:'top 80%',end:'top 24%',scrub:true`) animating `scale 1 to .95` and an overlay `opacity 0 to .3`. Reduced motion and < 1024: plain stacked cards.

### 22. Expanding panels (UAV fan)
- **Source:** S:2669-2681, JS S:3744-3762.
- **What:** 4-5 tall photo panels, hover/focus/click expands one (`flex-grow` 1 to 3.3, .85s).
- **Weak:** animates layout (`flex-grow`), h3 `scale(.72)` blurry at rest, text hidden with `height:0`.
- **Why:** low for roofing: the exploded 3D layers in #whole already cover "show me the parts". Only use for "Roof types we fit" if you have good photos.
- **Spec if used:** keep a 90 ms hover-intent delay (UAV has it), `grid-template-columns` transition (layout, but one container, once per interaction) `.6s cubic-bezier(.23,1,.32,1)`, h3 stays full size, text revealed with opacity/translate not height. Stacked and all open below 1024.

---

## 4. Do NOT copy

1. **Cursor ring** (H:2049-2051, 3433-3440): hides text under it, doubles the system cursor, nothing to do with converting.
2. **Rainbow hue map** (H:3424) and **whole-section tint on pointerenter**: off-palette, reads as a demo, also flickers when scrolling under a still mouse.
3. **Velocity marquee with `skewX`** and **outline text** (H:2023, 3347-3350).
4. **Hero copy fade to .55** (H:3396-3398) and dimmed inactive text (`opacity .78/.82`).
5. **Auto-advancing viewer** (S:3697-3703, 5.2 s) and **fake REC timecode** (S:4017).
6. **Tracked all-caps eyebrow with a rule** (`.kicker .uav-rule`, e.g. "DRONE SERVICES"), against your type rules.
7. **Fixed-pixel Figma frame** (1440 frame, `min-height:988px`, `top:525px`, `form-back height:714px`).
8. **`clip-path` reveals** as the main reveal tool (paint-heavy and against your transform/opacity rule).
9. **Rail as a fixed overlay with 118px hit boxes** (verified click hijack).
10. **Stacked, contradictory hover rules** (`.svc:hover` set three times with -4/-2/-3px, `.btn` hover same colour as base, `:active` translateY vs scale).
11. **`flex-grow` panel animation + `scale(.72)` text.**
12. **`will-change:transform` left on permanently**, ten glow layers always mounted.
13. **`setTimeout` class clean-ups** (H:3187, 3197) instead of state from IO.
14. **Hover affordance on non-clickable cards.**
15. **Counter that rounds decimals and starts at `0` before it is visible.**
16. **Arrow as text glyph "→"** in links (use inline SVG so it aligns and can translate).
17. **UAV copy and brand details**: drone/aerial wording, "Discuss ... " CTA verbs, teal/blue accents, Manrope/Poppins.

## 5. Short build order for the roofing template

Highest return, lowest risk first: 1 (hover wash), 2 (card system), 5 (button fix), 7 (form), 4 (tone-aware chrome), 6 (services index), 3 (job path in #how), 13 (reading spine as the mobile fallback for 3), 9, 8, 14, 12, 10, then the rest only if the page still feels flat. Everything above is gated by `@media (hover:hover)` for hover effects and does nothing under `prefers-reduced-motion` (final state shown), per the brief.
