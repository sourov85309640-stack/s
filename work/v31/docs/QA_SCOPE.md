# Baseline QA scope (shared). Each QA agent covers its own sections but applies ALL checks below to them.
Build your own copy: python3 build.py out_<tag>.html ; test ONLY that file. Do NOT edit src/. Screenshots to shots/<tag>_*.png. Look at the screenshots yourself.
Checks per section:
1. console errors/warnings; 2. horizontal overflow at 360,390,430,768,1024,1280,1440,1920; 3. elements stuck hidden or low opacity after scrolling through, split-heading masks clipping descenders, missing words; 4. layout: spacing, clipped text, overlaps, awkward empty space, low contrast, image crops;
5. scroll robustness: forward, reverse, fast jump to bottom then top, reload at depth, resize while in the section; pinned scenes (#where tour, #whole 3D roof) at 1024x768, 1280x720, 1440x900, 1920x1080, 768x1024, 390x844;
6. reduced motion (Playwright reduced_motion='reduce') and html[data-motion=off]: final readable state, no pinning, all text visible;
7. keyboard: tab order, visible focus not hidden behind sticky header or clipped, Enter/Space/Escape behaviours; 8. hover at desktop via page.hover: glitches, jitter, stuck states; 9. touch behaviour at 390 (has_touch, is_mobile);
10. accessibility: headings order, names/labels, aria correctness, contrast, targets >=44px (axe_run.py exists; adapt to your file); 11. rough performance: rAF frame-time sampling while scrolling your sections, offscreen work.
Output: prioritised bug list, each: id, severity (blocker/high/med/low), where, repro (viewport + scroll position), evidence, suspected cause in src/ (file + selector/line), suggested fix. Write to qa_<tag>.md in the working dir and return a condensed summary under 350 words. Be honest about limits: headless Chromium only, no real phone/Safari/Firefox/screen reader.
