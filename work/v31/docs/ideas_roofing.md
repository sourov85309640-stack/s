# Ideas agent #2: original roofing-specific interactions (Ridgewell v3.1)

Evidence base: read src/index.html, styles.css, motion.js, app.js; built to out_ideas2.html; screenshots in shots/ideas2_{1440,390}_{section}.png; probe t_ideas2.py.
Scales: Effort S (under 1 hour, CSS plus a few lines JS), M (half a day), L (a day plus). Conversion value 1 to 5. "Too much?" 1 = invisible, 5 = clutter.
All sketches use transform/opacity (or a CSS var on a single element), hover gated by @media (hover:hover), 150 to 300ms UI timings, reveals 0.75 to 1.1s, ease-out only, no scale(0). Reduced motion = final state shown, nothing animated, content unchanged. Nothing needs WebGL or new image assets.

## 0. One real defect found while looking (fix first)

The header progress bar (#progress, `.hdr-progress`, child of `.hdr`) disappears on desktop while scrolling down. `.hdr.is-hidden{transform:translateY(-101%)}` takes the bar with it. Measured at 1440x900 after scrolling to y=3000: header is-hidden, bar top = -3.6px, bottom = -0.6px, --p = 0.2394. So the progress bar is only visible while the header is visible (scroll up). See X1 for the fix.

## 1. Ranked list (best value for restraint first)

| Rank | ID | Idea | Section | Value | Effort | Too much? |
|---|---|---|---|---|---|---|
| 1 | HERO1 | Hero lead phrases become deep links into the pre-filled form | Hero | 4 | S | 1 |
| 2 | FRM1 | Starter chips under "What have you noticed?" | Contact form | 4 | S | 1 |
| 3 | X1 | Header progress: fix hidden bar plus a tiny gable riding the line | Cross-page | 2 (fixes defect) | S | 1 |
| 4 | SVC1 | Service pick "handshake": issue tag stamps in, row ticks | Services to form | 3 | S | 1 |
| 5 | CHK1 | Tick-off checklist; all three ticked lifts the CTA | Checks | 3 | S | 1 |
| 6 | FAQ1 | After two questions opened, the phone link in the sticky column lifts | FAQ | 3 | S | 1 |
| 7 | FRM2 | The brand house draws itself as the three required fields validate | Contact form | 3 | M | 2 |
| 8 | TOUR1 | Droplet falls and splashes at each lock | Leak tour | 3 | S | 2 |
| 9 | FRM3 | Copy-number chip on desktop | Contact | 3 | S | 1 |
| 10 | FRM4 | Photo thumbnails after "Add a photo" | Contact form | 3 | S | 1 |
| 11 | TOUR2 | "Follow the water" path draws from the active leak point | Leak tour | 3 | M | 2 |
| 12 | DEC1 | Four steps: pick one, copper diamond slides, step links to the form | Repair or replace | 3 | S | 1 |
| 13 | ARE1 | Towns link to the form with the town recorded | Areas | 2 to 3 | S | 1 |
| 14 | X2 | Roof edges grow as each section arrives | Cross-page | 2 | S | 2 |
| 15 | X3 | Ambient day arc in the three dark sections plus theme-color | Cross-page | 2 | S | 2 |
| 16 | XV1 | A droplet falls through the exploded layers and stops at the active one | Exploded roof | 3 | M | 3 |
| 17 | HOW1 | Quote sheet reacts when stage 2 is reached | How it works | 2 | S | 2 |
| 18 | HDR1 | One sliding ridge indicator in the nav | Header | 2 | S | 1 |
| 19 | REV1 | 4.8 shows a real partial fifth star | Reviews | 2 | S | 1 |
| 20 | XV2 | Slipped tile loosens when the Tiles layer is active; hover peek | Exploded roof | 2 | S | 1 |
| 21 | PRJ1 | Six day ticks beside "Duration" | Project | 2 | S | 1 |
| 22 | BAR1 | Call icon rings once when the bar first earns attention | Mobile bar | 2 | S | 1 |
| 23 | HDR2 | Mobile menu opens with a short clip and row stagger | Header | 2 | S | 1 |
| 24 | X4 | One hover language: warm wash behind rows | Cross-page | 1 to 2 | S | 1 |
| 25 | FRM5 | Window light warms when a field is focused | Contact | 1 | S | 1 |
| 26 | FTR1 | Back-to-top gable on the footer ridge | Footer | 1 | S | 1 |
| 27 | PRJ2 | Peak outline sweeps in like the hero one | Project | 1 | S | 1 |
| 28 | FAQ2 | Rain streak sweeps across the "work in the rain?" answer | FAQ | 1 | S | 3 |

Suggested bundle for "tiny details, not too much": HERO1, FRM1, X1, SVC1, CHK1, FAQ1, TOUR1, FRM2 (or FRM3/FRM4), DEC1, X3. Ten ideas, six of them under 30 lines of code, only four are visible motion.

---

## 2. Section by section

### Header / nav

**HDR1. One sliding ridge indicator (desktop, >=1240px).**
- Sees: the copper underline for the current section (now a `::after` per link, appears instantly) is one 2px bar with a small peak that slides to the next link as sections change.
- Trigger: scroll-spy. app.js already sets `aria-current="true"`.
- Sketch: add `<i class="nav-ind" aria-hidden="true">` inside `#nav ul` (position:absolute, left 0, bottom .3rem, width 1px, height 2px, background copper, transform-origin 0 50%). In motion.js a MutationObserver on `#nav a` (attributes: aria-current) reads the link's offsetLeft/offsetWidth and runs `gsap.to(ind,{x:left+12,scaleX:width-24,duration:.28,ease:'power3.out',overwrite:true})`. Hide `a[aria-current]::after` when `.has-motion`. Peak: `.nav-ind::before` 8px triangle via clip-path (it is scaled by scaleX, so use a second element or width-in-px instead of scaleX).
- Reduced motion: keeps current per-link underline. Mobile: not applicable (menu is a drawer).
- Risk: link widths change when fonts load; recompute on `document.fonts.ready` and resize. Effort S. Value 2. Too much 1.

**HDR2. Mobile menu opens with a short reveal.**
- Sees: tapping Menu, the drawer opens with a 240ms top-down clip and rows rising 8px with 30ms stagger, instead of popping in. Closing is instant (exit faster than enter).
- Sketch: `.nav.is-open` currently display:block. Use `@keyframes drawer{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}` 240ms cubic-bezier(.2,.7,.2,1) and `.nav.is-open li{animation:rowIn .28s both; animation-delay:calc(var(--i)*30ms)}` with `--i` set by JS or nth-child. rowIn: translateY(8px) opacity 0 to none.
- Reduced motion: the global reduce rule already kills animation. Mobile: this is the mobile feature. Risk: clip-path animation is paint, fine on a 5-row panel. Effort S. Value 2 (tactile). Too much 1.

**HDR3 (covered in BAR1 and X1).**

### Hero

**HERO1. Lead phrases become deep links (conversion).**
- Sees: in "Slipped slates, a leaking valley or a chimney that needs relaying." the three phrases are quiet underlined links. Click one and the page glides to the form with "About: slipped or missing tiles or slates" already on the form. It is what the services section already does, but available in the first screen.
- Trigger: click or tap. Hover: underline thickens by scaleX swap (see sketch).
- Sketch: markup `<a class="inl" href="?issue=slipped#contact">Slipped slates</a>`, `?issue=leak`, `?issue=chimney` (app.js already handles `a[href^="?"]`, prefills, scrolls, focuses first field). CSS: `.inl{color:inherit;text-decoration:none;background:linear-gradient(var(--copper),var(--copper)) 0 100%/100% 1px no-repeat;padding-bottom:1px}` and for hover `@media (hover:hover){.inl{background-size:100% 2px;transition:background-size .2s}}`. Keep text colour. Wording is unchanged, so no new claims. Mobile: tap targets are inline text (WCAG 2.2 inline exemption); line-height 1.5 gives about 24px height, acceptable but keep the existing big buttons as the primary targets.
- Reduced motion: no transition, links still work. Risk: lead copy is client-edited, so mark in the swap map that phrases map to ?issue keys. Effort S. Value 4. Too much 1.

**HERO2 (considered, not recommended): pointer-following gable peak.** The peak is a CSS clip-path polygon plus an SVG outline; moving it is not a transform/opacity change. Skip.

**HERO3 (optional, low value): warm "sun patch" following the pointer on the paper hero**, the light twin of the existing dark-section glow. radial-gradient copper-tint at 6% opacity, opacity transition on `.hero::after`. Value 1. Too much 2. Fine to skip.

### Reviews widget

**REV1. Real partial star for 4.8.**
- Sees: the rating chip shows 4 full stars and a fifth star filled to 80%, as on a real Google widget. Today all five are full while the number says 4.8.
- Sketch: in the `.score .stars` row, last svg gets class `part`; wrap it in a span with `position:relative`, put the outlined star (`#i-star-o`) underneath and the filled star above with `clip-path:inset(0 20% 0 0)` (set `--fill` from the number: `(4.8-4)`; JS writes inset on load). Count-up already runs; the partial star can pop with the others (existing back.out).
- Reduced motion: static. Mobile: same. Risk: the partial star should also be correct if client has 5.0 (set no clip) or 4.3 (30%): drive from the number text. Effort S. Value 2 (trust fidelity). Too much 1.

**REV2 (considered, not recommended): rain overlay on the lodge photo that clears ("Dry since").** Diagonal streak gradients fading over 2.4s. It reads cheap on a real photo and fights the "embedded widget" restraint. Rate too much 4. Skip.

**REV3 (optional): key-phrase marks.** A copper highlighter underline draws under the problem phrase in each card (clip-path or scaleX on a background-image) when the card enters. Requires client to mark a phrase per review; fragile. Skip.

### Services

**SVC1. The "handshake" between a service row and the form.**
- Sees: click "Tell us about this" on a row. The row's link shows a copper tick for 400ms, the page glides down, and when the form arrives the existing issue tag ("About: chimney or lead") stamps in: scale 1.06 to 1 over 260ms with a one-off 600ms copper outline flash. Focus goes to the first field (already done in app.js).
- Trigger: click on `a[href^="?"]`. Sketch: in app.js's click handler (after `applyParams`) add class `is-stamp` to `#issue-tag` (remove on `animationend`). CSS: `@keyframes stamp{0%{transform:scale(1.08);box-shadow:0 0 0 0 rgba(152,86,50,.4)}60%{transform:none;box-shadow:0 0 0 6px rgba(152,86,50,0)}100%{transform:none}}`. Delay the animation by about 900ms so it plays when the scroll lands (or trigger from the Lenis scrollTo onComplete: `lenis.scrollTo(target,{onComplete})`).
- Reduced motion: tag appears with no stamp. Mobile: same, and the sticky bottom bar is already hidden at the form. Risk: timing offset when the user scrolls manually. Effort S. Value 3 (confirms the "form opens filled in" promise, which people otherwise do not notice). Too much 1.

**SVC2 (optional): row hover wash.** See X4.

### Leak tour (#where)

**TOUR1. A droplet falls and splashes at each lock.**
- Sees: when the survey marker locks on a pin (ring turns solid), one 5px copper-tint drop leaves the dot, falls about 36px and fades with a tiny elliptical ripple. Six locks, six drips. The visual says "this is where water gets in" without a word.
- Trigger: the existing `.marker.is-lock` toggling in `paint()`.
- Sketch: add `<i class="m-drip"></i>` inside `#marker`. CSS: `.m-drip{position:absolute;left:-2.5px;top:6px;width:5px;height:7px;background:var(--copper-tint);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;opacity:0}` and `.marker.is-lock .m-drip{animation:drip .9s .15s cubic-bezier(.4,0,1,1) both}` hmm: use ease-out for the fade but a gravity-like accelerate is physically right for a falling drop; this is decorative world motion, not UI motion, so ease-in on the fall is acceptable, but to keep to the "no ease-in" rule use `cubic-bezier(.3,.6,.5,1)`. `@keyframes drip{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:.9}80%{transform:translateY(36px);opacity:.9}100%{transform:translateY(40px);opacity:0}}`. Ripple via `.m-drip::after` ellipse 14x4, border 1px, scale .4 to 1 at 80 to 100%. Because `is-lock` is removed when the marker travels and re-added on arrival, the animation restarts per pin with no JS.
- Reduced motion: marker hidden entirely already. Mobile flow mode: `paint(k,true)` runs onComplete of the move, so it drips there too. Risk: low. If the marker's `will-change:transform` layer is promoted, the child adds no cost. Effort S. Value 3. Too much 2.

**TOUR2. "Follow the water" path.**
- Sees: for the active point a thin dashed copper-tint line draws from the pin down the diagram to where water ends up: ridge to eaves, chimney down the stack to flashing then slope, valley to eaves, eaves to wall, gutter to downpipe. Shows how a small fault becomes a stain.
- Sketch: sibling `<svg class="dia-water" viewBox="0 0 100 100" preserveAspectRatio="none">` over `.dia-art`, six `<path pathLength="1" vector-effect="non-scaling-stroke">` using the same % coordinates as the pins (pin 1 at 50/17.6, 2 at 74/8.1, 3 at 74.2/42.2, 4 at 35.3/38.5, 5 at 10/57.8, 6 at 83.3/61.1). Paths: p1 M50 17.6 L55 40 L58 56; p2 M74 8 V42; p3 M74 42 L76 56 V62; p4 M35 38 L30 52 L27 58; p5 M10 58 V66; p6 M83 61 V90. CSS: `stroke-dasharray:1;stroke-dashoffset:1` and `.is-on` toggled in `paint()` (add alongside parts/ticks) animates `stroke-dashoffset` to 0 over .7s ease-out (transition on dashoffset is paint-only on a tiny SVG; alternatively scaleY the path with transform-box). Fade previous path out in 200ms.
- Reduced motion: no marker, so show the active-row path statically or not at all (recommend not at all). Mobile: diagram is sticky and small, so stroke 1.5px; fine.
- Risk: needs path tuning against roof-diagram.svg (do it visually). Effort M. Value 3. Too much 2. Do TOUR1 first; TOUR2 only if you want the section to teach more.

**TOUR3 (small): the end of the tour nudges the CTA.** When `self.progress > .96` toggle `.dia-foot.is-ready`: the two links' underlines sweep once (scaleX .0 to 1 pseudo) and the phone link gets a 2px translateY lift. Conversion moment at the end of the tour. Effort S. Value 2. Too much 1. Add to TOUR1 if wanted.

### Repair or replace (#decide)

**DEC1. Pick a step: a diamond slides, the step links to the form.**
- Sees: the four steps already climb as a rising stair. Hover (or tap) one and the other three dim to .55, the copper diamond travels to it (one shared diamond instead of four static), and under the active step a link appears: Repair "Tell us about this" (?issue=slipped), Maintain (?issue=notsure), Investigate (?issue=notsure), Replace (?issue=patching). The page says "which of these is your roof" and offers the next step in place.
- Sketch: keep `ol.steps4 li` as is. Add one `<li>`-external `<i class="step-d">` (the diamond, 12px rotated square) absolutely positioned; GSAP `quickTo` x and y from each li's offsetLeft/offsetTop, 260ms power3.out. `li.is-on` shows `.step-link` (grid-template-rows 0fr to 1fr, same pattern as xv-list). Pointer: `pointerenter` on fine pointers; `click` on touch (button inside each li for a11y; `aria-pressed`). Hide the four static `::before` diamonds when `.has-motion` (`li::before{opacity:0}`; shared diamond on top).
- Reduced motion: static diamonds, links hidden until focus (visible on focus-within). Mobile (<900px): the stair is a vertical list or 2 columns: diamond slides vertically; tap toggles.
- Risk: the stair offsets (margin-top 4.5rem to 0) change at breakpoints, so read offsets on resize. Effort S to M. Value 3. Too much 1.

### A roof as a whole (exploded)

**XV1. A droplet falls through the layers and stops at the active one.**
- Sees: during the peel, one copper-tint drop hangs above the top layer; when you peel "Tiles" it sits on the tile layer next to the slipped tile; "Battens": it has dropped to the battens (now wet-darkened); "Underlay": it pools on the sheet; "Rafters": it reaches the frame. Meaning: what each layer stands between you and the water. In 3D it falls on the model's Z axis, as a billboard facing the camera.
- Sketch: inside `#xv-model` add `<span class="xv-drop" aria-hidden="true">` with `position:absolute;left:203px;top:221px;width:8px;height:11px;transform-origin:50% 100%;transform:translateZ(var(--dz,300px)) rotateZ(calc(-1*var(--rz))) rotateX(calc(-1*var(--rx)))` (same counter-rotation as `.xv-tag`). In `peel(k)` set `--dz` to the same formula as `.xv-l`: `(layerIndex-2)*(base+gap*s)+8px`; add `transition:transform .55s cubic-bezier(.2,.7,.2,1)` (is a transform: fine). `.xv.is-peel .xv-drop{opacity:1}` else 0. Add a `@keyframes sway` 2s infinite 3px translateY on a child so it looks like it hangs.
- Reduced motion: hidden. Mobile (<900px, flow mode): works the same on tap; tags are already hidden below 700px so the drop is the only cue; keep.
- Risk: sub-pixel flicker with `preserve-3d` and `translateZ` transitions on a small element; test in headless Chromium, cannot test Safari (known limit). `.xv-tilt` pointer tilt moves the perspective, so check z-fighting against the layer planes (offset 8px above plane). Effort M. Value 3. Too much 3. Do it only if you want the section to feel designed rather than diagrammatic.

**XV2. Slipped tile loosens; hover peeks a layer.**
- Sees: when the Tiles layer is active the orange slipped tile (`.xv-slip`) rocks 4 to 7 degrees once and the dashed gap tile (`.xv-gap`) pulses its dash. On hover over a list row (desktop), the layer lifts a little (peek) without scrolling; click still jumps.
- Sketch: `.xv-l.is-on .xv-slip{transform-box:fill-box;transform-origin:50% 100%;animation:loosen 1.2s cubic-bezier(.2,.7,.2,1) both}` with `@keyframes loosen{0%{transform:rotate(4deg)}35%{transform:rotate(8deg)}100%{transform:rotate(4deg)}}`. Note the slip rect already has an SVG `transform="rotate(4 203 221)"` attribute; the CSS transform will override it, so write the keyframes as absolute rotations around the same point using `transform-origin:203px 221px` in `transform-box:view-box`. For hover peek: `.xv-list button:hover` sets `--peek` on `.xv-l[data-layer]` via JS (`pointerenter` adds `.is-peek`, which is `--lift:12px`), skipped on touch.
- Reduced motion: none. Risk: low. Effort S. Value 2. Too much 1.

### Project

**PRJ1. Six day ticks beside "Duration".** The `Duration` dd ("Six working days") gets a row of six 10x10px tiles (copper outline) that fill one by one (60ms stagger, 0.3s) when the spec rows reveal. Needs `data-days="6"` on the dd (set in the swap map; builds the ticks in JS). Reduced motion: all filled. Effort S. Value 2. Too much 1. Roofing-specific: durations are the first thing homeowners ask.

**PRJ2. Peak outline sweeps in** like the hero outline: `clip-path: inset(-4px 100% -4px -4px)` to `inset(-4px)` on `.peak-line`, 1.4s power2.inOut, once, on enter. Effort S. Value 1. Too much 1. Consistency only.

### How it works

**HOW1. Quote sheet reacts when stage 2 is reached (desktop, >=1000px, sheet is sticky).**
- Sees: scrolling the stages, when "2 Quote" crosses the reading line the sheet gains a 2px copper left rule and its six rows underline one after another with a short 40ms stagger, as if being written. At stage 3 or 4 it relaxes. It ties "written quote" (the differentiator) to the proof.
- Sketch: `ST.create({trigger:'.stages li:nth-child(2)',start:'top 60%',end:'bottom 40%',onToggle:s=>sheet.classList.toggle('is-read',s.isActive)})`. CSS: `.sheet::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--copper);transform:scaleY(0);transform-origin:0 0;transition:transform .5s cubic-bezier(.2,.7,.2,1)}` `.sheet.is-read::before{transform:none}` and per row `dt` colour shift (copper stays; text becomes ink). `.spec-sheet>div::after` 1px copper line scaleX 0 to 1 with `transition-delay:calc(var(--k)*40ms)`.
- Reduced motion: none. Mobile: sheet follows stages (not sticky), so skip. Effort S. Value 2. Too much 2.

**HOW2 (optional): rail dot.** A copper dot slides down a 1px vertical line left of the stage numbers as you read (scrub). Duplicates the existing rule draw, so skip.

### Three checks

**CHK1. Tick-off checklist.**
- Sees: each of the three checks has an empty 22px square box on the left (copper outline). Tap it and a tick draws (stroke-dashoffset, 280ms). When all three are ticked, the "Tell us about your roof" link below turns into a filled button and its text becomes "Checked all three? Tell us what you saw." (copy needs owner OK; keep the original if not wanted). It turns reading into doing and creates a natural next step.
- Sketch: markup per li `<button type="button" role="checkbox" aria-checked="false" aria-labelledby="c1h">` with the same inline `.ok-tick` style path (reuse `draw` keyframes). JS toggles aria-checked and counts; at 3 add `.is-done` to `.sec-cta` (`.link` gains `.btn .btn-fill` classes via swap; or simpler CSS: `.sec-cta.is-done .link{background:var(--copper);color:var(--paper);padding:.65rem 1.25rem}`). The state is not stored (per-visit only).
- Reduced motion: ticks switch instantly. Mobile: 44px target via padding on the button. Risk: li layout shifts (add 2.25rem left column). Effort S. Value 3. Too much 1.

**CHK2 (optional): viewfinder corners** around the chimney photo (four 14px L brackets scaleIn, "from the ground") on enter. Value 1.

### Areas

**ARE1. Towns link to the form with the town recorded.**
- Sees: the big town list; hovering one dims the rest to .45 and underlines it in copper; click glides to the form and the tag reads "About: a roof in Tetbury" (hidden field `from` receives `area-tetbury`).
- Sketch: li text wrapped in `<a href="?from=area-tetbury&issue=notsure#contact">`; extend `applyParams` label map to build "About: a roof in " + town when `from` starts with `area-`. List hover dim: `@media (hover:hover){.areas-big:hover li:not(:hover){opacity:.45}}`; underline via background-size trick as HERO1.
- Reduced motion: no dimming transition. Mobile: each is a 44px-plus line at this font size. Risk: visitors may expect a town page; the form tag text mitigates. Effort S. Value 2 to 3. Too much 1.

**ARE2 (optional): sliding copper bar** under the hovered town (one element, same as HDR1). Skip if ARE1 is used.

### FAQ

**FAQ1. Engagement lifts the phone link.**
- Sees: open any two questions and the "Anything else? Call 01632 960 482" in the sticky left column goes from a text link to a filled copper button (160ms colour/translate), because a visitor reading two answers has an unresolved question. No popup.
- Sketch: count `.q.is-open` toggles in a capture listener on `.faq`; at 2 add `.is-warm` on `.sec-head p`. `.is-warm .link{background:var(--copper);color:var(--paper);padding:.5rem 1rem;text-decoration:none}` with `transition:background-color .2s,color .2s`; icon svg prefix optional. Mobile (<900px): the head sits above the list, not sticky, so also append a one-line "Call 01632 960 482" under the last opened answer (inline `.a-in::after`) only once.
- Reduced motion: change is instant. Risk: low; do not repeat. Effort S. Value 3. Too much 1.

**FAQ2. (low value) Rain streak on "Can you work in the rain?"** On open, five 1px diagonal lines (repeating-linear-gradient, rgba ink .12) translate across `.a-in` once in 700ms and fade. Needs `data-fx="rain"` on that `.q`. Cute, on theme, but it is decoration and invites "what is this" from clients. Too much 3. Skip unless you want one playful thing.

### Contact form

**FRM1. Starter chips under the notes field (conversion).**
- Sees: under "What have you noticed?" four or five small outlined chips: "Stain on a ceiling", "Slipped or missing slates", "Water near the chimney", "Gutter overflowing", "Not sure". Tap one and a plain starter sentence is added to the box ("There is a stain on a ceiling. ") and the chip shows pressed. Tap again to remove. It removes the blank-page problem on mobile, which is where this form loses people.
- Sketch: `<div class="chips" role="group" aria-label="Quick start">` of `<button type="button" aria-pressed="false">`; JS appends/removes the sentence in `#f-notes`, dispatches `input`. Chip CSS: 44px min-height, 1px copper outline, 8px radius no (keep square like the site), pressed = copper fill; transition background-color 150ms. When `?issue=` pre-selects a service, pre-press the matching chip. Press scale .97.
- Reduced motion: none needed. Mobile: wrap to two lines, scrollable not needed. Risk: do not overwrite what the user typed; only append/remove its own sentence. Effort S. Value 4. Too much 1.

**FRM2. The brand house draws itself as fields validate.**
- Sees: a 36px outline house (the same mark as the logo, split into its three paths: roof, walls, door) top-right of the form sheet. Valid name draws the roof, valid postcode the walls, valid email or phone the door. All three: the strokes turn copper to ink for 600ms and the Send button gets one soft 1.2s copper ring pulse. Endowed progress; roofing-literal.
- Sketch: inline SVG with three `<path pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1">`, from `#i-mark` path data. Listener: `MutationObserver` on `.field` class changes (`is-valid`) or just `input`/`blur` events; set `dashoffset` to 0 with `transition:stroke-dashoffset .45s cubic-bezier(.2,.7,.2,1)`. Ready pulse: `@keyframes ready{0%{box-shadow:0 0 0 0 rgba(152,86,50,.45)}100%{box-shadow:0 0 0 12px rgba(152,86,50,0)}}` on `.btn[data-ready]` once.
- Reduced motion: all three paths drawn from the start? Better: show full house, no change. Mobile: place beside the heading, same size. Risk: validity state lives in app.js; keep read-only. Effort M (about 40 lines). Value 3. Too much 2.

**FRM3. Copy-number chip on desktop (fine pointers only).**
- Sees: next to the big phone number a small "Copy" button; click copies "01632 960 482" and shows "Copied" for 1.5s. Many desktops have no tel: handler, so the big number is a dead end for them. On touch the number stays a plain call link and the chip is hidden.
- Sketch: `<button class="copy" type="button" hidden>` shown by JS when `matchMedia('(hover:hover) and (pointer:fine)')`; `navigator.clipboard.writeText(tel)` in try/catch; `aria-live="polite"` label swap. Effort S. Value 3 on desktop. Too much 1. Also usable in the footer address.

**FRM4. Photo thumbnails after "Add a photo".** Show up to 4 40px thumbnails (object URLs) with a name and a remove x under the button, each rising in 200ms. Confirms the photo actually attached (the label currently only says "1 photo added"), and photos raise lead quality for a roofer. Reduced motion: no rise. Mobile: grid of 4. Risk: revoke object URLs on remove; limit sizes; the input is `multiple` and removal needs a DataTransfer rebuild (supported in Chromium, Safari 14.1+; I cannot test Safari). Effort S to M. Value 3. Too much 1.

**FRM5. Window light.** When any field has focus, the gable photo behind (`.contact-photo img`) lifts from .17 to .26 opacity (500ms) so the window "warms". Pure opacity on one element. Value 1. Too much 1.

### Footer

**FTR1. Back-to-top gable.** At the right end of the footer ridge line a 44px outlined gable button (arrow inside) scrolls to top via `rwScrollTo`. Hover: apex lifts 2px. Value 1. Effort S. The ridge-line draw already exists; the button fades in after it finishes.

### Mobile bar

**BAR1. Call icon rings once.** The first time the bar has been on screen for the user for 6s past the hero, the phone icon rotates +-8 degrees twice in 450ms (once per page view). Tiny and stops. Effort S. Value 2. Too much 1. Also a 6s delay prevents annoyance. Reduced motion: none.

**BAR2 (considered, do not do): hide the bar while the hero buttons are visible.** Currently the bar and the hero Call button are both on screen at 390px (see ideas2_390_top.png). Cleaner, but the bar is guaranteed call access for a visitor who is already decided. I rate it cosmetic and slightly negative for conversion. Skip. Optional upgrade instead: after the hero, the bar shows "Call 01632 960 482" (number text) with a 200ms crossfade; helps people who dial by hand. Value 2, Too much 1, risk low.

---

## 3. Cross-page ideas

**X1. Header progress: fix plus a tiny gable on the line.** (Rank 3, S.)
- Fix: change `.hdr.is-hidden{transform:translateY(-101%)}` to `translateY(calc(-100% + 4px))` so the 3px bar (bottom -1px) stays visible at the top of the viewport while the header is hidden, and keep `:focus-within{transform:none}`. Do the same for `.hdr-progress{will-change:transform}`.
- Pitch detail: add `<i class="hdr-roof" aria-hidden="true">` inside `.hdr`: 18x9px copper triangle `clip-path:polygon(0 100%,50% 0,100% 100%)`, `position:absolute;bottom:2px;left:0`, `transform:translateX(var(--rx))`. In motion.js, extend the `ST.create({start:0,end:'max'})` in `headerBehaviour` to write `--rx` = `progress*(hdr.clientWidth-18)` px. It is a ridge riding the progress line; when the header is hidden only the bar shows (gable clipped above the viewport), which is fine.
- Reduced motion: bar and gable still update on scroll (it is position feedback, not decoration; app.js already writes --p). If you want zero motion, set transition none; there is none. Mobile: header never hides on mobile, so the gable shows always; 18px wide fits. Risk: the bar and gable overlay the sticky header's bottom hairline, so check the 1px `--line` border. Effort S. Value 2 plus restores a feature that silently disappears.

**X2. Roof edges grow as each section arrives.**
- Sees: each of the nine roof-shaped section edges (wave, step, rake, hip, saw, arc, zig, terrace, chimney) starts about 45% shorter and rises to full height as it crosses the viewport, so the gables "build" while you scroll. Quiet, only the page edges move.
- Sketch: `.e-*::before{transform:translateY(calc(var(--er,0)*var(--eh)*.45));}` (it sinks into its own section colour, invisible below the seam). In motion.js, per edge section `gsap.fromTo(sec,{'--er':1},{'--er':0,ease:'none',scrollTrigger:{trigger:sec,start:'top 100%',end:'top 55%',scrub:.5}})`. Because the edge uses `background:inherit`, nothing else changes. The tile edge under #where (`.tile-edge`, a real element) can be handled the same via `y`.
- Reduced motion: edges full height (final state). Mobile: same; cheap. Risk: `--er` on a section whose `::before` is also mask-positioned: transform does not touch the mask, fine; verify no hairline gap at the seam (the 1px overlap `top:calc(1px - var(--eh))` already guards). Do not combine with the existing section reveals on the same element's `transform` (the sections have none). Effort S. Value 2. Too much 2.

**X3. Ambient "day arc" in the three dark sections plus mobile browser colour.**
- Sees: no new colours, just tints of the palette. #where gets a cool overcast glow (bone-grey at 7% from top-left, storm), #whole a low warm glow from bottom-right (late sun, copper-tint 6%), #contact a warm lit-window glow (copper-tint 14% centred behind the form's left column, lights on at home). Each fades in as its section crosses, so the page moves from rain to shelter. `meta[name=theme-color]` also switches between #FAF9F6 (paper sections), #F0ECE3 (warm) and #1F2B30 (ink) so the Android Chrome address bar follows the section.
- Sketch: JS appends `<span class="amb" aria-hidden="true">` as the first child of `.dia-sec`, `.whole`, `.contact` (z-index 0, inset 0, pointer-events none; the edges use `::before` and the pointer glow `::after`, so no clash; do not set it as the section background because `.e-*::before` inherits the background). `background:radial-gradient(60% 55% at var(--ax) var(--ay),var(--ac),transparent 70%);opacity:var(--ao,0)`; per-section `--ax,--ay,--ac` inline; `gsap.fromTo(amb,{'--ao':0},{'--ao':1,ease:'none',scrollTrigger:{trigger:sec,start:'top 80%',end:'top 20%',scrub:true}})`. Theme-color: one `ST.create` per section with `onToggle` setting `meta.content` (guard: only on touch, 200ms debounce).
- Reduced motion: do not render `.amb` or show it static at final opacity (static is harmless). Mobile: theme-color is the mobile benefit; iOS Safari ignores or partially uses it (cannot verify). Risk: radial gradients over large dark areas can band on some screens; keep opacities low. Effort S. Value 2. Too much 2.

**X4. One hover language: a warm wash behind rows.** On `@media (hover:hover)` the rows that are clickable or scannable (`.svc-list .svc`, `.checks li`, `.q`, `.dia-list li`, `.stages li>div`) get a `--wash` (#F6ECE5) background fading in 180ms behind the row, with 12px padding bleed (negative margin) so text does not move, and the copper rule above brightens. Dark sections already use copper-tint 10% on active rows, so this is the paper twin. On touch use `:active` only. Effort S. Value 1 to 2. Too much 1. Gives the "hover colour changes" feel without anything flashy.

**X5. Water-drop motif, used only three times, only where it means something.** (1) TOUR1 drip at each leak lock. (2) XV1 droplet through the layers (optional). (3) FAQ2 rain streak (optional) or the form-success tick (no). Keep it to one shared shape: a 5x7px teardrop (`border-radius:50% 50% 50% 50%/60% 60% 40% 40%`) in copper-tint on dark and copper on paper, plus a 14x4 elliptical ripple. If it appears more than three times it becomes wallpaper.

**X6 (considered, not recommended).** Custom cursor ring (UAV site has it): no. Side section rail: the nav already shows the current section, and a rail adds clutter. `navigator.vibrate` on tour locks: unexpected on Android, not supported on iOS. Auto-advancing reviews: patronising and fights the swipe row.

---

## 4. Implementation notes for whoever builds these

- Everything in motion.js should go in new `safe('name', fn)` blocks after `touches`, so one failure does not break the rest.
- All new CSS goes after the existing "v3.1 motion layer" block; guard decorative keyframes with the existing `prefers-reduced-motion` rule (it already sets `animation:none!important;transition:none!important`).
- No new `transition:all`. Use property lists.
- All new inline links in the hero and areas must keep the click handler path (`a[href^="?"]` in app.js), which already sets the tag, scrolls via Lenis and focuses the first field.
- Mobile priorities: HERO1, FRM1, FRM4, SVC1, FAQ1, BAR1 matter more on phones than any of the desktop motion.
- Cannot verify here: Safari/iOS behaviour (sticky, preserve-3d with moving translateZ elements in XV1, theme-color), real device touch, screen readers. All ideas rated against headless Chromium measurements only.
