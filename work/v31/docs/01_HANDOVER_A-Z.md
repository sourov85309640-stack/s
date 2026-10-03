# Handover A to Z: Roofing master template, homepage "version 3.1"

Written 3 Oct 2026 by the previous AI for the next AI. Read this whole file, then 00_START_HERE_PROMPT.md, then skim 02_SKILLS_REFERENCE.md.

## 1. Who the user is and how he works
- Asiful, solo founder, works from Dhaka. Sells websites to UK roofers by cold email (brand North Page Sites) next to DentivaX (UK dental websites). Student, freelance web developer (WordPress, HTML/CSS/JS).
- He wants firm verdicts, honest pushback, finished deliverables, not hedged analysis. Direct, decisive.
- Site typography must NOT look AI-made: no fancy display fonts, no tracked all-caps eyebrows, no giant outline text. Plain Arial headings, Source Sans 3 body.
- On big builds he wants parallel agents split by role (ideas, polish/feasibility, improve, implement, check, audit, fix) and QA split by section, for speed with no quality drop. He wants proper QA and repeated fixing before anything is called finished.
- Copy rules for anything he sends: no em dashes, simple everyday English, no scarcity language, no invented claims.
- He interrupts often by voice. Keep messages short, send a one-line status early, deliver partial files when asked. He rejected two Agent launches at the very end (he wanted to speak), so tell him in one line what you are about to launch, then launch.

## 2. The product
- A reusable single-file HTML template for UK roofing companies. Sample firm "Ridgewell Roofing", Cirencester, drama phone 01632 960 482 (Ofcom). He swaps in each client's name, photos, reviews.
- THIS JOB: the HOMEPAGE ONLY, called "v3.1". Goal: feels like a $20,000 website. Immersive, scroll-driven, smooth, 3D where it helps, tiny details interactive but "not too much", best UX and spacing, converts leads (call, form, trust, FAQ).
- It is a TEMPLATE: nothing may be specific to one roofing company (no firm-specific materials, no one-off claims).

## 3. History in one paragraph
Rounds 1 to 6 produced v1/v2/v3 masters (`roofing-master-v3.html`, delivered earlier; copy in /mnt/user-data/outputs/roofing-master-v3/ if that folder still exists). Then he asked for "v3.1": much more interactive, using a client site (UAV Aerial Solutions) only as a rough reference for hover/background-colour effects. The previous AI built a motion layer (Lenis + GSAP ScrollTrigger, survey-marker tour, CSS 3D exploded roof, review widget details, magnetic buttons, FAQ animation, header hide). Several QA agents found bugs (listed in 7). Then his direction changed twice (section 4).

## 4. Latest direction (binding, newest wins)
Message A (18:52 Dhaka): deliver what is built so far (done, `roofing-master-v3.1.html` was sent). No 3D modelling that "shows different parts" and no image with hover points, because every roofing company differs. THEME MUST BE LIGHT, no dark sections, use the accent colour. Make it immersive: little things floating around, little roof-themed details, every section with small natural interactions (not forced, not too much). Free to create new sections, layouts, designs. Can offer multiple hero options. He LIKES the current hero: roof-gable-shaped cutout, text on top, image on the bottom. Second section (reviews) must feel like a truly imported real Google reviews widget, real Google logo colours allowed, change images to stock photos. Reread the skills carefully and use them.

Message B (19:00, UPDATE to A, newest): he saw the build and "there are a couple of 3D things I really liked ... a couple of sections I really liked. So KEEP them, but make them sensible for ALL roofing companies. I like the 3D and the scrolling animation that takes the full view." Needs LOTS of small interactions. A couple of sections feel dead, "nothing happening to them": make the whole page fully immersive. This is an update to the earlier prompt, not a replacement.

Message C (19:02): hand everything over to the next AI (this package) because this AI's usage has issues.

How to reconcile A and B (previous AI's decision, flagged to the user as changeable):
- KEEP the pinned full-view scroll scenes and the CSS 3D exploded roof, but make them company-agnostic: the exploded roof gets a Tiles / Slates switch (and neutral copy: "tiles or slates or whichever covering your roof has"); layer names stay generic (Ridge and lead, Covering, Battens, Underlay, Rafters). The problem-spots diagram keeps only parts every roof has (ridge, chimney stack, flashing, valley, eaves, gutter) and the tour/hover pins stay only if copy is neutral. If the user later says the pins are unwanted, replace them with a scroll-driven "water path" that needs no pins.
- Convert both from dark (ink) to LIGHT surfaces. Everything light.
- Ask nothing; build, then show him.

## 5. Files and build system
Everything is in `v31_source.zip` (this package). Extract anywhere.
- `build.py`: stdlib only. `python3 build.py [out.html]`. Reads `src/index.html`, inlines every `<link rel=stylesheet href=x.css>` and `<script src=x.js></script>`, `<!-- @include svg/x.svg -->`, all `img/` and `fonts/` files as base64, writes the output file plus `SWAP-MAP.txt` (taken from the opening comment of index.html). Extra css/js files can simply be added with their own link/script tags.
- `src/index.html`: markup. Section order today: header (+`#progress`), hero `#top`, reviews `#reviews`, services `#services`, `#where` (dark leak diagram tour), `#decide` (repair/maintain/investigate/replace), `#whole` (dark exploded 3D roof), `#projects`, `#how`, `#checks`, `#areas`, `#faq`, `#contact` (dark, form `#enquiry`), footer, mobile `.bar`. Scripts: vendor gsap, ScrollTrigger, lenis, app.js, motion.js.
- `src/styles.css` (~51 KB): tokens at top (see 6), v3 styles, then a "v3.1 MOTION LAYER" block at the end.
- `src/motion.js` (~25 KB): `safe()` wrapper per feature, Lenis (driven by `gsap.ticker`, `lagSmoothing(0)`, `lenis.on('scroll', ST.update)`), `headerBehaviour`, `splitWords`, `reveal`, `hero`, `reviews` (count-up etc.), `tour` (survey marker), `exploded` (3D roof), `sections`, `touches` (magnetic buttons, pointer glow), `reveals` (ScrollTrigger.batch), `window.rwMotion`, `rwMotionDestroy`, `rwScrollTo`. Uses `gsap.matchMedia()`: pinned mode at (min-width 1000px and min-height 800px) for the tour, (min-width 900 and min-height 720) for the roof; flow/scroll-spy mode otherwise.
- `src/app.js`: nav pruning, mobile menu, FAQ `.is-open`, header progress, `aria-current`, pin/list hover, review carousel arrows, `?issue=` pre-select (service links like `?issue=leak#contact`), form validation (name, UK postcode, email or phone), success state.
- `src/svg/roof-diagram.svg` (parts tagged `data-part` 1 to 6), `src/svg/xv-layers.svg` (generated by `gen_xv.py` from the 3D layers markup).
- `src/vendor/`: gsap, ScrollTrigger, lenis (npm, minified). `src/fonts/source-sans-3-latin.woff2`. `src/img/*.webp` current photos (placeholders, see 9).
- `*_backup.*` in src: earlier versions for reference only.
- Tests (Playwright, headless Chromium at /opt/pw-browsers/chromium): `probe.py`, `t_tour.py`, `t_xv.py`, `t_rel.py`, `t_walk.py`, `t_intro.py`, `t_qa.py`, `qa_*`, `qb_*`. Adapt the file path inside.
- Docs: `BRIEF.md` (shared agent brief), `QA_SCOPE.md`, `SPEC_v31_polish.md` (14 vetted polish ideas S1 to S14), `ideas_uav.md`, `ideas_roofing.md`, `qa_c.md`, `qa_qa_d.md` (QA findings), `SWAP-MAP.txt`.
- `reference/uav-aerial-solutions-site.html`: the UAV client page (8 MB). Reference only, NOT the gold standard. It has hover/background colour changes, a drone flying between boxes, velocity marquee, magnetic buttons, cursor ring, section rail. Its issues: section rail steals clicks, hover colour state bugs.
- `roofing-master-v3.1.html`: the current interim build (dark sections, pin tour, 3D roof; 1.07 MB).

## 6. Design system (current tokens, adapt for light)
`--paper #FAF9F6`, `--warm #F0ECE3`, `--ink #1F2B30` (text colour; stop using it as a section background), `--text #222C30`, `--muted #4D575C`, `--copper #985632` (accent, passes 4.5:1 on paper), `--copper-tint #DDA783`, `--line #D7D1C5`, `--wash #F6ECE5`, `--field #767F83`, star gold `#C27D00`, Google blue `#1A5FC8`. Suggested light additions (tints only): a pale sky/slate tint (about #EAF0F2) for cool contrast sections, a sand (#E6DFD0), and keep copper as the one accent.
Type: h1/h2 Arial 700 (`--h1: clamp(2rem,1rem+3.6vw,3.9rem)`, `--h2: clamp(1.5rem,1.1rem+1.4vw,2.125rem)`), everything else Source Sans 3 (400 to 600), five heading sizes, one tracking each. Layout: `--max 1200px`, `--gut clamp(1rem,4vw,2.5rem)`, `--pad clamp(2.75rem,6vw,5.5rem)`.
Roof-shape section edges (keep): classes `.e-wave .e-step .e-rake .e-hip .e-saw .e-arc .e-zig .e-terrace .e-chim`, `.tile-edge`; cutout photos use `clip-path` gable shapes inside a `.cw` wrapper (so a transformed element does not drag its clip).
Hero (keep, user likes it): headline left, lead plus buttons right, wide photo band below cut to a gable peak (`.hero-plate`, `.hero-outline` svg path `M0 107H313L517 9L719 107H1440`), small offset detail tile `.hero-detail`. Photo top fifth must stay quiet because the peak is cut there.

## 7. Technical lessons (do not relearn the hard way)
- Single scroll engine: Lenis driven by `gsap.ticker`. `html{scroll-behavior:smooth}` plus Lenis: in tests use `window.scrollTo`, then wait about 1.5 s (scrub smoothing 0.6 to 0.7 s).
- Lenis 1.3.26 subtracts html `scroll-padding-top` on top of the code offset: in-page links land 80 px low (bug D7). Use offset 0 in scrollTo.
- CSS 3D: `opacity < 1` on a `preserve-3d` element flattens its children (billboard tags broke). Dim only the inner svg. `filter` also flattens.
- GSAP writes `transform`; for hover lift use the individual CSS properties `translate`/`scale` so they do not fight.
- `clip-path` on an element that is also transformed moves with it: use the `.cw` wrapper (clip on wrapper, transform on child).
- Create ScrollTriggers in DOM order (pins first, reveals last). `ST.batch` reveals with `clearProps`.
- Reload at depth: ScrollTrigger refresh restores progress but scrub `onUpdate` may not fire, so state (like the 3D roof `--s`) stays collapsed. Fix pattern: `onRefresh:self=>{tl.progress(self.progress);write();}` (QC-1).
- Progressive enhancement: `html.js` set in head; `html.has-motion`; page must show the FINAL state without JS, under `prefers-reduced-motion`, and with `data-motion="off"`. Split-word headings keep `aria-label` on the heading and `aria-hidden` on word spans; word mask spans need `padding-bottom:.16em;margin-bottom:-.16em` so descenders are not clipped.
- Header progress bar lives inside the translated header, so it vanishes when the header hides (move it out, fixed).
- Motion rules (binding): animate transform/opacity only; no `transition:all`; no ease-in on UI; no `scale(0)`; UI motion under 300 ms; reveals .75 to 1.1 s; stagger 30 to 80 ms; hover only inside `@media (hover:hover)`; press scale .96 to .97; reveals once only; 44 px targets; visible focus; no scroll-jacking on touch; console clean.
- Images: build inlines base64, keep each under about 140 KB (webp). Whole file target under about 2 MB.

## 8. What the next build must do (the actual to-do)
1. LIGHT theme everywhere. Convert `#where`, `#whole`, `#contact`, footer, tooltips, `.xv` stage, tour marker, pointer glow (`.glow` currently only on dark sections) to light surfaces with copper accent. Check contrast again (the old inactive 3D tag labels failed at 3.3:1).
2. Company-agnostic keepers:
   - `#whole`: keep the pinned CSS 3D exploded roof (five layers lifting apart on scroll, pointer tilt, list rows that highlight layers). Add a Tiles / Slates segmented switch (and optionally Metal) that swaps layer artwork and a neutral heading, "A roof works as a whole". Light stage (warm panel, soft Beautiful-shadow), no dark.
   - `#where`: keep the scroll tour with survey marker only with parts every roof has. Neutral heading "Where a roof lets water in". Light plate. Pins are numbered markers, not firm-specific. Make sure it also works as scroll-spy without pinning on small/short screens.
3. Immersion (every section gets one or two small natural things, never forced, never loud; decorative, `aria-hidden`, pointer-events none, pause offscreen, none under reduced motion). Ideas the previous AI had not yet built:
   - Hero: a few swallows or birds gliding slowly across the sky band, chimney smoke wisps from the cutout peak, slight parallax of photo inside the gable, outline draws itself on load.
   - Whole page: a "sun/sky tint" that eases from morning cream to warm afternoon as you scroll (CSS variables on `body`, not repainting heavy layers); a tiny weathervane in the header brand that turns with scroll direction; roof-edge seams that build in as each section arrives (S10 in SPEC).
   - Reviews: Google-style widget (see 9), cards with gentle lift, stars filling once, count-up rating, drag/arrow carousel with progress.
   - Services: cards with roof-shape photo cutouts, hover wash (S1), drips/rain dots on hover only on the leak card (tiny), photo push.
   - Decide (Repair/Maintain/Investigate/Replace): currently static. Make a four-stop condition scale: as you scroll or hover, a slider/roof-health meter moves and the active card gains a copper edge and tile pattern; tap to select on touch.
   - How it works: a thin ridge-line path that draws as you scroll through the four stages, step numbers light up, the quote sheet "writes" row by row at stage 2 (S14).
   - Checks: three "from the ground" items with a small animated eye/ladder-free diagram, tick marks drawing on view; image with gentle parallax.
   - Areas: instead of a plain list, a soft map-like pattern or ripple rings from the firm town; town chips with hover wash. No auto-marquee (accessibility).
   - FAQ: keep grid accordion; add small plus-to-minus rotation, and deep-link opening (D5).
   - Contact: starter chips (S4), issue tag stamp (S5), focus fill (S6), copy-number chip (S7), "lights on" warm glow, success state with drawn tick. Light surface.
   - Floating ambient layer: 6 to 12 tiny elements per section at most (falling leaf, raindrop, dust mote in a light beam, tile fragment). Use the `falling-leaves` and `ambient-section-particles` skills: canvas, one rAF loop, IntersectionObserver pause, DPR cap 2, dt clamp 1/30.
4. Hero options: user may like to choose, so provide 2 to 3 variants behind a `data-hero="a|b|c"` attribute and a class on the section (A = current gable cutout, B = full-width gable plate with two-column text, C = gable cutout with copy centred and a slim reviews chip). Keep A as default. Document how to switch in SWAP-MAP.
5. Reviews section rebuilt as a genuine Google reviews widget (spec in 9).
6. Stock photos replacing the placeholders (method in 9).
7. Fix the open QA bugs (list below), then run full QA again (section 10).

### Open QA bugs still unfixed (from QA agents C and D; QA for header/hero/reviews, services, contact/footer never ran)
QC-1 HIGH reload at depth leaves 3D model collapsed (onRefresh fix). QC-2 button falls below viewport when pinned at heights 720 to 745 (raise pin min-height to 780 or reserve open row height). QC-3 3D layer tags clip at 900 to 1024 wide (shift model left or reserve 170 px). QC-4 copy column jumps 11 to 22 px while scrubbing (align-self:start in pinned mode). QC-5 list buttons are dead with motion off (make non-interactive or attach handler). QC-6 mobile: model unlabelled and list 1000 px below it (make the visual sticky or drop button affordance). QC-7 inactive tag contrast. QC-8 flow mode overhang. QC-9 1920 empty area. D1/D2 add `scroll-padding-bottom` for the fixed mobile bar (focus hidden behind it, WCAG 2.4.11). D3 `.q button:hover` not inside `@media (hover:hover)` (sticky hover colour on touch). D4 find-in-page cannot find closed FAQ answers (accept or `hidden=until-found`). D5 `#q4`/`#a4` deep links should open the item. D6 areas list dangling "/" separators. D7 Lenis anchor offset. D8 accordion/chevron timing over 300 ms and animating grid rows (accepted). D9 aria-expanded without JS mismatch, drop 6 `role=region`. D10 chimney image used twice, tiny stage images, sparse areas section, unverified "written summary at the end of the first two" claim.
Full text: `qa_c.md`, `qa_qa_d.md`.

## 9. Reviews widget and stock photos
### Google reviews widget (second section, must look like an embedded real widget)
Layout like Elfsight/Trustindex/EmbedSocial: a rounded white card container on the light page with a header row, then a carousel of review cards.
- Header: official-looking Google "G" mark (use the 4-colour SVG below), the word "Google" or "Google Reviews", rating "4.8" large, five gold stars (last one partial for 4.8, S8), "Based on 63 reviews", a blue pill button "Review us on Google" (links to the client's Google review URL, placeholder `data-sample="review-link"`).
- Cards: white, 1px light border, radius 12 to 16, avatar circle 40 px (photo or coloured initial) with a tiny G badge at its corner, name (bold), date ("2 weeks ago"), 5 gold stars, 3 to 5 lines of text with "Read more" expanding inline, small "posted on Google" G at bottom. Arrows left/right (circle buttons), dots, keyboard and swipe, progress. Cards lift on hover (translate only). Count-up and star fill once on entering view.
- Honesty: the sample reviews are INVENTED, the section keeps `data-sample="reviews"` and a SWAP-MAP note: paste the client's real reviews and real rating, or delete. Use clearly neutral first name plus initial. Do not use real firm names.
- The side photo (`.rv-plane`) becomes a stock photo of a house/homeowner.
Google G mark (standard 48x48):
```
<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
```
Google colours: blue #4285F4, red #EA4335, yellow #FBBC05, green #34A853; star gold #FBBC04 (Google) or #C27D00 (current, better contrast on white for text; stars are graphics so #FBBC04 is fine).

### Stock photos
- Source: Unsplash (free licence; avoid Unsplash+). Direct unsplash.com downloads are blocked by an anti-bot wall. WORKING METHOD: find a photo page with WebSearch ("unsplash.com photos roofer tile roof"), then WebFetch the photo page URL asking for "the exact images.unsplash.com image URL (photo-... path)", then `curl "https://images.unsplash.com/photo-XXXX?w=1800&q=78&fm=jpg&fit=max"` from bash (images.unsplash.com is reachable through the proxy; pexels is not). Look at each image yourself, then resize to WebP (Pillow) under about 140 KB.
- One verified example: https://unsplash.com/photos/a-man-on-a-roof-working-on-a-roof-G2J41LRaKkE is `https://images.unsplash.com/photo-1726589004565-bedfba94d3a2` (roofer on a roof, Christer Lassman). Other pages found, not yet downloaded or checked: `two-men-working-on-the-roof-of-a-house-RGkNFjRPyO0`, `old-stone-building-with-gabled-roofs-and-chimneys-EyYX-lBtmTQ`, `a-white-house-with-red-shutters-and-a-chimney-eHSXVPHjNnE`, `a-tree-with-a-building-in-the-background-gtmFR35LsPs`, avatars: `a-smiling-woman-in-a-brown-sweater-M_y36MbKxzc`, `a-smiling-blonde-woman-in-a-white-shirt-indoors-vnppvekjH6o`, `smiling-young-businesswoman-wearing-glasses-...-KFQRpw9Yfw4`.
- Slots needed: hero band (wide, roofer on pitched tile/slate roof or roofscape, calm top fifth), reviews side photo (house with tile/slate roof or homeowner, portrait), 5 service close-ups (slipped slates, clay tile, chimney, lead/valley or gutter, scaffolding/ladder), project (stone cottage or stone-tile roof), contact gable, 5 headshots for review avatars (160 px, mixed ages and backgrounds), optional rain/leaf mood shots.
- Prefer UK/European pitched roofs, no hard-hat posing, no readable signs/phone numbers/logos. Never present stock photos as client work: SWAP-MAP must say so and the footer says "Photographs are for illustration".
- The existing placeholders in `src/img` (hero-main etc.) are of unknown origin. `hero-main.webp` is another firm's crew (a jacket shows a phone number, a street sign "Rue Astrid"): replace it.

## 10. Process the user expects (do this)
1. One-line status to the user first. Create a task list.
2. Pipeline with parallel agents: (a) ideas agent(s) for light immersive concepts per section, (b) polish/feasibility agent that cuts or keeps ideas (see SPEC_v31_polish.md for the previous round's verdicts), (c) improve, (d) implementation agents on SEPARATE FILES to avoid edit conflicts (e.g. `fx-ambient.js/css`, `fx-hover.css/js`, `reviews-google.css`, plus one owner of index.html/styles.css/motion.js/app.js), (e) check agents, (f) audit agent, (g) fix agent. Stock-photo agent runs in parallel from the start.
3. QA split by section across several agents (suggested: A header/hero/reviews, B services/where, C decide/whole/projects, D how/checks/areas/faq, E contact/footer/global). Every QA agent applies QA_SCOPE.md checks: console, overflow at 360/390/430/768/1024/1280/1440/1920, stuck-hidden elements, forward/reverse/fast scroll, reload at depth, resize while pinned, reduced motion, `data-motion=off`, keyboard, hover, touch at 390, axe, rough frame times. Fix, then re-run until clean.
4. Honest limits to state at the end: only headless Chromium was available (no Safari, Firefox, real phone, screen reader); no conversion data.
5. Deliver: `roofing-master-v3.1.html` (final), source zip, SWAP-MAP.txt (remove 3D notes only if removed; add the Tiles/Slates switch, hero variants, Google widget replace note, stock-photo note), AUDIT-LOG.md, OPEN-ITEMS.md. Short final message: what came out, the file, one next step.

## 11. Environment notes
- The previous session ran in a cloud Linux container with Playwright and Chromium at /opt/pw-browsers/chromium, Python 3, Node, pandoc. Network goes through an allowlist proxy: npm/pip/GitHub and images.unsplash.com work; most other sites do not.
- Previous scratch path (may be gone): /tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/. Full previous chat transcript (may not be reachable): /root/.claude/projects/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb.jsonl
- Memory note about this project exists in the user's memory store at /areas/roofing-websites.md.
