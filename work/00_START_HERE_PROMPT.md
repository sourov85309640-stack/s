# PROMPT FOR THE NEXT AI (paste this, attach the package)

You are taking over a website build from another AI. Read `01_HANDOVER_A-Z.md` fully first, then `02_SKILLS_REFERENCE.md` (the user's design and motion skills; follow them), then the files in the package. Extract `v31_source.zip` to a working folder.

## Your job
Finish the HOMEPAGE of a reusable single-file roofing website template ("version 3.1"). The owner, Asiful, sells it to UK roofers. It must feel like a $20,000 website: very immersive, scroll-driven, smooth, with the best UX and spacing, and it must convert visitors into calls and enquiries. It is a TEMPLATE, so nothing may depend on one roofing company's specifics.

## What the user said (newest wins)
1. The theme must be LIGHT everywhere (no dark sections). Use the copper accent (#985632) on the paper/warm surfaces.
2. He liked the existing 3D and full-view scrolling sections. KEEP them, but make them right for ALL roofing companies: the 3D exploded roof gets a Tiles / Slates switch and neutral copy; the problem-spots diagram only shows parts every roof has. Convert both to the light theme.
3. Add many small, natural, roof-themed interactions and floating details in every section (not too much, nothing forced). Several sections currently feel dead (decide, areas, checks, how it works): make them alive. You may create new sections, layouts and designs.
4. Keep the hero he likes: gable-shaped cutout, text on top, photo at the bottom. Offer 2 to 3 hero variants (default = current).
5. The second section must look like a genuine imported Google reviews widget: real Google G colours, rating header, review cards with avatars and G badges, carousel arrows, "Review us on Google" button. Use stock photos (Unsplash) instead of the placeholders. The reviews are invented samples and must stay flagged `data-sample`.
6. Typography stays plain (Arial headings, Source Sans 3 body). Nothing that looks AI-made: no fancy display fonts, no tracked all-caps eyebrows, no giant outline text.
7. Use all the skills in `02_SKILLS_REFERENCE.md`, reread carefully. If something is too much, just do the job and be honest about it.

## How to work
- Start with one sentence to the user saying what you are about to do. Make a task list.
- Use parallel agents split by role: ideas, polish/feasibility (what can and cannot be done), improve, implement (each on separate files so edits do not collide), check, audit, fix. Run a stock-photo agent in parallel from the start (method in section 9 of the handover: WebSearch, WebFetch the Unsplash photo page for the images.unsplash.com URL, curl that URL, view it, convert to WebP under about 140 KB).
- Split QA by section across several agents, then fix and re-run until clean. Required checks per section: console clean; no horizontal overflow at 360, 390, 430, 768, 1024, 1280, 1440, 1920; nothing stuck hidden; forward, reverse and fast scrolling; reload at depth; resize while pinned; `prefers-reduced-motion` and `data-motion=off` show the full final state; keyboard order and visible focus not hidden by the sticky header or the mobile bar; touch at 390; axe; frame-time sampling. Fix the known open bugs listed in the handover (QC-1 to QC-9, D1 to D10).
- Build with `python3 build.py out.html` from the source folder, test that file with Playwright (headless Chromium), and look at screenshots yourself.

## Hard rules
- Motion: transform and opacity only, no `transition:all`, no ease-in on UI, no `scale(0)`, UI motion under 300 ms, reveals 0.75 to 1.1 s, stagger 30 to 80 ms, hover gated by `@media (hover:hover)`, press scale 0.96 to 0.97, reveals once, 44 px targets, visible focus, no scroll-jacking on touch, single smooth-scroll engine (Lenis driven by the GSAP ticker), page readable without JS and under reduced motion. CSS 3D only, no WebGL.
- Keep the roof-shape section edges and the gable hero.
- Copy: plain UK English, no em dashes, no scarcity language, no invented claims. Mark anything the owner must confirm with `data-confirm`.
- Stock photos are never described as the client's work.
- Be honest: only headless Chromium was tested (no Safari, Firefox, real phone, screen reader), no conversion data.

## Deliverables
`roofing-master-v3.1.html` (single file), source zip (src, build.py, tests, docs), updated `SWAP-MAP.txt`, `AUDIT-LOG.md`, `OPEN-ITEMS.md`. Final message to the user: short, say what came out, give the file, name one next step. Send partial builds when he asks.
