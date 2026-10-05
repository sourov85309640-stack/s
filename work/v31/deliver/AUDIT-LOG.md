# AUDIT LOG: roofing master v3.1 homepage

Build tested: `roofing-master-v3.1.html` built from `src/` with `python3 build.py`. Browser: headless Chromium 141 (Playwright) only.

## How the work was done
1. **Scaffold (lead).** The old single-page dark interim build was split into a modular source: one partial plus its own CSS and JS file per section (`src/sections/*.html`, `src/<section>.css/.js`), a shared core (`core.js`: smooth scroll with Lenis on the GSAP ticker, reveals, masked headings, one shared ticker), a declarative depth engine (`depth.js`: layered parallax with `data-depth`, `data-drift`, `data-rot`, `data-px`, moved with the CSS `translate` and `rotate` properties so it never fights GSAP), a light `base.css`, a header module (weathervane, progress bar outside the header, sliding nav line), and a build script with lint (dashes in text, duplicate ids, missing assets, `transition: all`).
2. **Section teams (9 agents in parallel).** Each team prototyped 5 or 6 genuinely different versions of its section's key immersive idea behind a variant switch, tested and screenshotted them, and recommended one. Teams: hero, reviews, services + decide, where (problem spots), whole (3D roof), projects + how it works, checks + areas + FAQ, contact + form, global atmosphere. A photo agent recropped the existing photos (new downloads were blocked by the network policy). The owner asked to save credits midway, so the teams wrapped up early and no further agents were started.
3. **Judging (lead).** Every variant was screenshotted at 1440 x 900 (scroll states inside pinned scenes too) and compared side by side. Each section got a default plus one or two alternatives (kept, at the owner's request, in an owner-only "Design options" panel); weak or broken variants were removed from the markup.
4. **QA rounds (lead, three rounds).** Scripted checks (tools/qa_round.py, tools/qa_interact.py, tools/tour.py) plus manual review of every screenshot at 1440, 390, 768 and 1920.

## Rule audit (owner's binding rules)
| Rule | Result |
|---|---|
| Light theme everywhere | Pass. No section, panel, footer or bar uses ink as a background (grep and screenshots). Surfaces: paper, warm, sky tint, sand footer. |
| Copper accent | Pass. Copper #985632 is the single accent; copper tint only as decoration. |
| Plain typography | Pass. Arial 700 for h1/h2, Source Sans 3 elsewhere. No uppercase transforms, no tracked labels, no outline text (grep). Kicker labels are sentence case. |
| Company neutral | Pass. Diagram parts are ridge, chimney stack, lead flashing, valley, eaves, gutter on a generic cottage with a cross gable; the 3D roof has a Tiles / Slates switch and generic layer names; firm-specific details (town, project, reviews) are data-sample. |
| No em or en dashes | Pass. Build lint checks all visible text; none found. |
| No scarcity or invented claims | Pass. The unverified "written summary at the end of the first two" claim was removed. Process, timescale, scaffold, weather, guarantee and reply wording carry data-confirm. Reviews are flagged invented samples. |
| Stock photos never called client work | Pass after fix. Footer: "Photographs are for illustration only and do not show this firm's work." Project caption changed to "Photo for illustration only". |
| Motion: transform and opacity | Pass for all scroll, reveal, ambient and parallax motion. Small hover and active state changes also fade colour or shadow (accepted, listed in OPEN-ITEMS). Menu icon changed from animating `top` to transform. |
| No ease-in on UI | Pass. One decorative fade used ease-in and was changed. Falling drops keep a gravity ease-in (not UI). |
| UI under 300 ms, reveals 0.75 to 1.1 s, stagger 30 to 80 ms | Pass (spot-checked in code: FAQ 220 to 260 ms, buttons 180 to 300 ms, reveals 0.95 s, stagger 40 to 80 ms). |
| Hover only with hover:hover, press scale .96 to .97 | Pass (grep). |
| One smooth-scroll engine, no scroll-jacking on touch | Pass. Lenis on the GSAP ticker; pinned scenes only on large screens; touch scrolls natively. |
| Readable without JS, with reduced motion, with data-motion=off | Pass. Final states verified in reduced-motion and data-motion=off runs: no pins, no canvases, no hidden text (closed FAQ answers excepted by design). |
| 44 px targets, visible focus | Pass. Focus walk of 90 stops at 1440 and 390: every ring visible, none under the sticky header or the mobile bar. |
| CSS 3D only, no WebGL | Pass. |

## Issues found and fixed during integration and QA
| ID | Severity | Where | Problem | Fix |
|---|---|---|---|---|
| L1 | High | all sections | Every team read the same `?v=` address parameter, so one switch changed every section | One helper `RW.variant(section, param, allowed)` with a separate parameter per section and a data-v default in each partial |
| L2 | High | projects | Caption read like this firm's project under a stock photo | "Photo for illustration only" |
| L3 | Medium | hero, reviews | The same lodge photo appeared three times on one screen (hero panel, detail tile, reviews side photo) | Detail tile uses the fish-scale slate close-up; reviews side photo removed |
| L4 | Medium | services, where, checks, how, faq, decide (1100 to 1439 px) | Foreground parallax pieces drifted over headings, list rows and FAQ buttons | Pieces repositioned (leaf, bird, project leaf); foreground layer hidden under 1440 px where there is no gutter; geometric overlap check now finds none at 1440, 1600, 1920 |
| L5 | Medium | reviews (phones) | A quick swipe skipped up to three reviews | One review per swipe under 640 px |
| L6 | Medium | atmosphere (slow desktops) | Particle canvases dominated frame time under 4x CPU throttling | Adaptive quality: if frames stay slow for 2.5 s the particles switch off (data-fx-low) |
| L7 | Low | 3D roof | Pinned stage touched the bottom of a 900 px viewport | Pinned grid height 100vh minus 7rem |
| L8 | Low | hero | Light sweep faded out with ease-in | ease-out |
| L9 | Low | header | Menu icon animated `top` | transform only |
| L10 | Low | decide | Links used `?issue=notsure&from=...` | Proper `maintain` and `investigate` issue keys |
| L11 | Low | owner panel (phones) | "Design options" pill covered text | Icon-only 44 px button under 600 px |
| L12 | Medium | contact form, all widths | Final visual check: the owner panel's class name `.opt` clashed with the form's "(optional)" labels, which became fixed to the bottom-left corner | Panel classes renamed `.rwopt-*` |
| L13 | Low | footer (1440) | Footer swallows drifted over the areas list | Moved above the ridge line |

## Known bugs from the handover (QC-1 to QC-9, D1 to D10)
| ID | Status | Evidence |
|---|---|---|
| QC-1 reload at depth leaves 3D roof collapsed | Fixed | Reload at 60 percent of the pin: `--s` 1.000 before and after, at 1440x900 and 1280x800 |
| QC-2 button below viewport at 720 to 745 tall | Fixed | Pin needs min-height 780; flow mode below |
| QC-3 3D tags clip at 900 to 1024 | Fixed | Tags measured 15 to 83 px inside the stage at 920x800, 1000x800, 1024x900 |
| QC-4 copy column jumps while scrubbing | Fixed | Fixed-height grid, copy aligned to start while pinned |
| QC-5 list buttons dead with motion off | Fixed | Buttons highlight layers without motion (team test) |
| QC-6 mobile model unlabelled, list far below | Fixed | Sticky stage on phones with numbered badges |
| QC-7 inactive tag contrast | Fixed | axe: 0 contrast violations |
| QC-8 flow overhang | Fixed | No overflow at any of 8 widths |
| QC-9 empty area at 1920 | Fixed | 1920 screenshots reviewed |
| D1/D2 focus hidden behind the mobile bar | Fixed | scroll-padding-bottom plus focus walk: 0 hidden; bar steps aside (and is inert) while the form is on screen |
| D3 FAQ hover not gated | Fixed | Hover rules inside (hover:hover) |
| D4 find-in-page cannot reach closed answers | Fixed | `hidden="until-found"` set by JS on closed answers |
| D5 #q4 deep links | Fixed | Opening `#q4` expands it (test) |
| D6 dangling "/" separators | Fixed | Town chips instead of a slash list |
| D7 Lenis anchor offset | Fixed | Nav links land the target 80 px from the top (below the 64 px header) at 1440 and 390 |
| D8 accordion timing over 300 ms | Fixed | 220 to 260 ms |
| D9 aria-expanded without JS, role=region | Fixed | Markup ships expanded=true (all open without JS); no role=region |
| D10 chimney photo twice, tiny images, sparse areas, unverified claim | Partly | Claim removed, areas rebuilt as a map, repeats reduced with different crops; some repeats remain until client photos arrive (OPEN-ITEMS 3) |

## QA rounds
**Round 1** (after integration): console clean at all widths; no horizontal overflow at 360, 390, 430, 768, 1024, 1280, 1440, 1920; axe 0 violations at 1440 and 390; focus walk clean; reload at depth and resize inside pinned scenes clean at 1440x900, 1280x720, 1024x768; reduced motion and data-motion=off show the final state; every Design options alternative loads without errors, overflow or hidden text at 1440 and 390. Visual review found L3, L4, L5, L7 and the honesty fix L2. Interaction suite: carousel arrows, keyboard, Read more, Tiles/Slates switch, decide picks, FAQ toggle and deep link, service link pre-fills the form, validation errors with focus on the first error, starter chip fills the notes, success state with focus, town link records the town, mobile menu with Escape, touch swipe, desktop hover sweep. All passed apart from L5.
**Round 2** (after fixes): every check above repeated: 0 blockers, 0 high, 0 medium, 0 low found. Swipe now moves one review.
**Round 3** (after the menu icon and adaptive particles changes): full suite again: 0 blockers, 0 high, 0 medium, 0 low from the scripts. The final visual check that followed (1440 and 390 walk-through, every section) found L12 and L13.
**Round 4** (after L12 and L13, CSS only): overflow at 8 widths, walk, reduced motion, data-motion=off, axe and focus walk repeated: clean. Contact and footer re-checked by eye at 1440 and 390.

## Performance (headless software rendering, so indicative only)
Full-page scroll, unthrottled: 1440 p50 16.7 ms, p95 33.4 ms; 390 p50 16.7 ms, p95 16.7 ms. With 4x CPU throttling at 1440 the particles now switch themselves off; at 390 p50 16.7 ms, p95 33.4 ms.

---

# Round 10: five independent audits (October 2026)
## Audit 1: words, meaning, logic, roofing facts
Checked: every visible string with JS off and on (quiz results, companion lines, form messages, area search, FAQ drawings, scene captions), meta and JSON-LD, dashes (none), US spellings (none), contractions, issue keys vs form tags.
Fixed:
- Hero "a chimney that needs relaying" -> "repointing" (chimneys are repointed or rebuilt, not relaid)
- Meta and social description promised "a written quote" from photos; FAQ and About say most roofs need a visit -> "send photos and we will arrange a look"
- Trust band repeated itself (sub-line and line both about what is left out) -> "Free and itemised"
- Clay tiles "every few courses are nailed" is out of date -> "some or all are nailed or clipped, depending on its age"
- Story caption used "quiet" twice -> "A calm evening"
- Leak tour: "damp on the loft along the top", "damp on where the roof meets a wall", "damp on a corner of a ceiling" -> fixed grammar
- Decide: "Ask about a repair" opened the form as "water coming in" -> now "a roof repair"; "nails sliding" -> "nails rusting through"; "patching costs more than a new roof" (absolute) -> "tends to cost more"
- Team: "the person who quotes is the person who turns up" contradicted the office role and the owner/crew split -> "you meet the people who will be on your roof"
- How it works step 3 described only a re-roof for every job -> "The agreed work, done as quoted. On a re-roof..."
- Example quote "Strip and replace six slates" (strip means the whole roof) -> "Replace six slates"
- Care: "saves most of the repairs" overclaim -> "heads off many"
- FAQ: guarantee answer read like advice about other firms and contradicted the trust band -> "Yes. Written on the invoice..."; more-work answer now in our voice
- Contact heading "you've" (only contraction on the site) -> "you have"
- Gallery intro called stock photos "roofs we have repaired" -> "Repairs and re-roofs of the kind we do every week"
- Footer "Talk to a roofer, not a call centre" contradicted the office person answering the phone -> "A small local team, not a call centre"
- Quiz "arrange a look in the next few weeks" (implied delay) -> "arrange a time to look"
- Companion "A few details is plenty" -> "are"; area search comma splice
- Story: roofer stood directly on slates (bad practice, breaks slates) -> added a roof ladder he slides up and hooks over the ridge
## Audit 2: animated scenes frame by frame
Method: new tool scrolls every section forwards, then backwards to the same points, and diffs the two screenshots (catches reverse-scroll bugs); contact sheets reviewed; separate checks for CSS loops fighting GSAP, CSS transitions fighting GSAP, reduced motion and data-motion=off full pages, decorations over text.
Fixed:
- Story lamp: its flicker loop overrode the "lamp off at dawn" step, so it glowed in daylight -> glow wrapped, timeline drives the wrapper
- Problems photo: a 6 second CSS zoom transition sat on the same property as the scroll drift, so the drift lagged seconds behind the scroll -> zoom moved to the separate scale property
- Every entrance animation (shared reveal helper) fought the cards' hover transitions, making entrances mushy -> transitions paused during the entrance and restored after; same for the hero rating and area roofs
- Decorations behind text (leaf, calendar, book, vane, question mark, sun, crane, clouds) at several sizes -> new layer guard hides any small decoration whose resting box touches text, rechecked on resize, works with and without motion
- Checks inset photo touched the screen edge on phones -> kept inside the margin
- Motion-off (data-motion="off") verified identical to reduced motion
- Resizing or rotating while in the page threw you back to the top (breakpoint rebuild of pinned scenes ran a refresh inside a refresh and lost the scroll) -> the page now remembers which section you are in and how far through, and returns there after the resize settles
- Decide scene on phones and tablets: dead band under the card (a third of a tablet screen) -> stage fills the space between header and bottom bar and centres; tablets keep the heading in view
- Verified: every section forwards vs backwards matches at 1440 (all sections), and the four pinned scenes at 390, 820 and 1440 with 16 to 18 frames each; companion never covers text at 1024 to 1920; story tap version all six steps; no page errors anywhere
## Audit 3: layout at every screen size
Method: automated layout check (overlap, clipped text, spill, offscreen, tap size, font size, alignment) at 16 sizes from 320x568 to 2560x1440 plus 125% text at 390 and 1440; visual walks of the whole page at 320x568, 667x375 (phone on its side), 1024x1366 (iPad Pro upright), 1366x768, 2560x1440 and 390 with larger text; in-page link landing at four sizes; phone menu on its side; scrollbar styling of every horizontal strip; story caption fit at six sizes.
Fixed:
- Story on short phones (320x568) and phones on their side: the caption ran under the bottom bar or off the screen (scene had a fixed 56% height) -> scene and caption now share exactly one screen; on a phone on its side the caption sits beside the scene
- Leak tour on a phone on its side: the sticky drawing filled the whole short screen and hid the stops -> drawing on the left, stops on the right
- About section on phones led with the drawing; the menu's About link landed on a picture (and in landscape the heading was off screen) -> text first, drawing after
- Recent project on phones led with a tall photo before its heading -> heading, then photo, then details; shorter crop on phones
- iPad Pro upright (1024x1366) used the desktop layout for the story and decide scenes: a small house under a huge empty sky, cards floating in empty space -> layout now follows orientation as well as width, so tall screens get the stacked tablet layout
- 2000px and wider screens: content sat small in the middle -> content width and text size grow on very large screens
Checked and fine: every in-page link lands with its heading in view (the privacy link sits low only because it is at the very end of the page); menu reachable and scrollable on phones on their side; all horizontal strips hide scrollbars; remaining automated flags were mid-animation readings or by design (two-column headings)
## Audit 4: every interaction and state
Method: inventory of every link, button and input (broken targets, duplicate ids, missing references); every one of about 100 buttons pressed by mouse at 1440 and by touch at 390 to find dead ones; full keyboard walks (about 150 stops each at 1440 and 390) checking each focus is visible, ringed, not hidden and not under the header or bar; arrow keys, Home and End on all tab sets, carousel and slider; lightbox open, arrows, focus trap, Escape and focus return; all 90 quiz answer paths; full form test (empty, wrong formats, long text, emoji, chips, photo upload, submit locally and on a live address); reload part way down; Back and Forward; JavaScript turned off; rapid clicking; menu opened mid-scene.
Fixed:
- Form: with the placeholder endpoint, a live site said "Thanks, we have your details" while sending nothing, so real enquiries could vanish -> on a live address it now says the form is not taking enquiries and gives the phone number; local previews still show the thank-you for demos
- Photo upload accepted any file and any size silently -> only photos (including iPhone HEIC), each up to 10 MB; anything else is left out with a plain note
- "Start with what you can see" was completely blank with JavaScript off (all five problem cards hidden, and dark text on a dark card) -> shown as a readable list
- Keyboard focus could land on things still waiting for their entrance animation (form fields, buttons) and so be invisible for a second -> entrance finishes the moment focus arrives
- Story: the link in a hidden caption could take keyboard focus -> hidden captions cannot be focused
- Leak tour on desktop: on screens under 900px tall the pinned stage was taller than the screen, so the last stop and the links under it were cut off -> those screens use the side by side layout; when pinned, focusing a stop walks the tour there and focusing the links scrolls past the pin
- Back button after a menu link left the site -> Back and Forward now return to where you were in the page
Checked and fine: no dead buttons, no broken links, no duplicate ids; all tab sets, the carousel and slider work by keyboard; lightbox is a true modal; all 90 quiz paths give a result and fill the form; reload keeps your place; menu reachable everywhere
## Audit 5: accessibility, structure, performance, technical
Method: axe (WCAG 2.2 AA plus best practice) in six states (desktop, phone, reduced motion, menu open, lightbox open, FAQ + quiz + form errors); heading outline, landmarks, link names out of context, live regions, image and SVG text; CSS rule checks via the browser's own parser; network requests; load metrics on 4G, slow 4G and cable with a slowed phone CPU; start-up profile per feature; animations running off screen; removing each of the 28 sections in turn; Windows high contrast; printing to PDF.
Fixed:
- Hover effects on buttons, links and three card sets also fired on phones (stuck hover after a tap) -> hover only where a mouse can hover
- "Sounds like mine" (x6) and "Read more" (x7) said the same thing out of context -> each now says which stop or whose review
- No site icon (browser asked the server for one and got a 404) -> small copper house icon built in
- Structured data had no opening hours -> hours match the footer exactly; social links added
- Start-up on a mid-range phone blocked the page for 1.7 seconds in one go -> features start in short slices, top of the page first; longest freeze now 0.4 seconds, blocking time down about 40% on phones and 65% on desktop
- Reload part way down landed too high after that change (scroll engine had the old page height) -> engine re-measures before restoring; same for the resize keeper
- About 15 looping animations kept running in sections far off screen (battery) -> paused until the section comes back near the screen
- Printing gave blank pages (fixed sky layer over everything, pinned scenes, faded-out items, curtains over photos, lazy photos, counters at 0) -> a proper print style: a plain complete copy with photos and real numbers
Checked and fine: axe 0 violations in every state; one h1, no skipped heading levels; every image described or marked decorative; the page makes no network requests beyond itself; first paint 0.6 seconds on 4G; layout shift under 0.04; removing any section causes no errors; high contrast mode readable with visible focus
