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
