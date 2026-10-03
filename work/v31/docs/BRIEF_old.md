# Roofing master v3.1 (interactive homepage) - shared brief for all agents

Working dir: /tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31
Build: `python3 build.py` -> roofing-master-v3.1.html (single file, everything inlined). Source in src/ (index.html, styles.css, app.js, motion.js, vendor/gsap|ScrollTrigger|lenis, svg/, img/). build.py inlines EVERY `<link rel="stylesheet" href="x.css">` and `<script src="x.js"></script>` found in src/index.html, so extra files can be added.
Tests (Playwright, chromium at /opt/pw-browsers/chromium, headless; no real phone/Safari/Firefox): probe.py, t_tour.py, t_xv.py, t_rel.py, t_walk.py, t_intro.py, t_qa.py in the working dir. Screenshots go to shots/ (use a unique tag so you do not overwrite other agents' files). NOTE `html{scroll-behavior:smooth}` plus Lenis: use window.scrollTo then wait ~1.5s; ScrollTrigger scrub has 0.7s smoothing.

## Product
Reusable single-page roofing template, sample firm "Ridgewell Roofing", Cirencester, Ofcom drama phone 01632 960 482. Owner Asiful sells websites to UK roofers by cold email (brand North Page Sites). HOMEPAGE ONLY. Goal: feels like a $20,000 site: immersive, scroll-driven, 3D, smooth, tiny details interactive but NOT too much, best UX and spacing, and it must CONVERT (call, enquiry form, trust, FAQ). Reviews block must feel like a real embedded Google reviews widget (Google coloured G logo intentionally omitted, empty .g-slot spans reserved).

## Design rules (binding)
- Palette: paper #FAF9F6, warm #F0ECE3, ink #1F2B30, copper #985632, copper tint #DDA783. Tokens in :root of styles.css. No new colours except tints of these.
- Typography stays PLAIN: Arial for h1/h2 (700), Source Sans 3 for everything else. NO fancy display fonts, no tracked all-caps eyebrows, no giant outline text, nothing that looks AI-made. User dislikes heavy bold, clutter, "placeholder" feeling.
- Keep the roof-shape section edges (.e-wave .e-step .e-rake .e-hip .e-saw .e-arc .e-zig .e-terrace .e-chim, .tile-edge) and the hero layout (headline left, lead+buttons right, wide photo below cut to a gable).
- Copy: no em dashes, no scarcity language, no invented claims. Sample reviews are invented and flagged data-sample.
- Motion rules: transform/opacity only (CSS vars on single elements are ok), no transition:all, no ease-in for UI, no scale(0), UI motion <300ms, reveals .75-1.1s, stagger 30-80ms, hover effects gated by @media (hover:hover), press scale .96-.97, once-only reveals, nothing runs under prefers-reduced-motion (page must show final state, all text visible), content readable without JS, one smooth-scroll engine (Lenis driven by GSAP ticker, already set up in motion.js), never scroll-jack on touch, keep 44px targets, visible focus, console clean.
- 3D is CSS 3D (no WebGL). Already built: hero intro + scroll depth, survey marker tour in #where (pinned >=1000px wide and >=800px tall, scroll-spy otherwise), exploded 3D roof layers in #whole (pinned >=900 wide and >=720 tall), review widget details, magnetic buttons, pointer light on dark sections, FAQ grid animation, header hide on scroll (desktop only).
- Reference only (NOT gold standard): UAV site at /root/.claude/uploads/d95ffac0-591c-525e-b9e4-2b56d578c3cb/2cd7e3cd-uav-aerial-solutions-site.html (big; extracted copy at ../uav/home.html lines ~2858-3455 hold its JS). It has hover/background colour changes, section theme shifts, a drone flying between boxes, skewed velocity marquee, magnetic buttons, cursor ring, section rail.

## Known facts / honest limits
Hero photo is a placeholder of another firm's crew (flag, not our job to fix). Only headless Chromium is available. Do not claim real-device, Safari, Firefox or screen-reader results.

## Agent hygiene
Other agents work in the same directory at the same time. Only edit the files you are assigned. Before editing a shared file re-read it. Never run `rm -rf`. Do not overwrite roofing-master-v3.1.html unless you are told to build; build to your own output path: `python3 build.py /tmp/.../scratchpad/v31/out_<yourtag>.html` (build.py accepts an output path) and test that file (edit the F path in your own copy of probe.py or pass the file in your own script). Report back concisely: what you changed or found, file paths, evidence (numbers/screenshots), anything you could not do.
