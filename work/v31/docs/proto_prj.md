# Prototype: PROJECTS (?pv=N) and HOW IT WORKS (?hv=N). Stage 1, cut short by owner (save credits)
Out file: out/prj.html (same build as out/how.html). Shots: shots/prj_v*_{d,m}_*.png, shots/how_v*_{d,m}_*.png.
Tested: Playwright 1440x900 and 390x844 touch (all variants), reduced motion once; console clean, no overflow, nothing stuck hidden after scrolling. Frame times (hv=1 scroll at 1440, swiftshader): p50 16.7 ms, p95 33 ms. No per-variant frame times or scores beyond this (cut short).

## Projects (sample module, data-sample="project", e-hip)
Shared: peak-cut photo with offset copper outline that drops in, photo drift, facts rows, six day slates that drop in on view, back layer faint stone coursing, front stone-slate fragments, nail, leaf (depth.js). Caption kept as sample data; HTML comment says "Sample project: replace with your own".
1. Drift + day slates (restrained baseline).
2. Before/after condition toggle: SVG schematic (slipped slates, split valley, drips vs fixed), scroll flips it once, buttons (aria-pressed) take over; highlights Problem/Work row. Works with motion off.
3. Scrubbed reading: Problem/Work sentences word-reveal on scroll, six slates laid as a course.
4. Layered frame: plate/photo/fragment on CSS 3D depths, pointer tilt (scroll tilt on touch), tag on a nail swings with scroll speed.
5. Short pin (desktop >=1000x760): photo closes in on the roof while facts are read one by one; flow elsewhere.
Recommend: 1 with the v4 depth plate (calm, honest for a sample module). 2 only if owners will redraw the schematic per project.

## How it works (warm, e-saw)
Shared: stages 01 to 04 (data-confirm="process"; unverified "written summary" claim removed), roof-cut thumbnails, quote sheet (data-sample) writes row by row once stage 2 is reached and the sheet is in view, closing "Tell us about your roof" link, back: survey grid + rooflines, front: tape end, pencil, nails.
1. Vertical rail that fills with scroll, gable step numbers light up, sticky sheet.
2. Four-peak roofline, a small figure walks the ridge; sticky ridge on mobile.
3. Chapters: one sticky SVG house swaps state (ladder, measured, scaffold, finished).
4. Quote sheet as hero: rows fill per stage, step boxes tick, handover stamp (peak-end).
5. Ladder: rails from gutter to ground, rungs light up.
6. Gable tabs (tap/arrow keys/swipe), sheet highlights what each step covers.
Recommend: 1 (clearest, reads as one line) or 4 (strongest memorable moment). 2 is charming but busier.

## Known issues
- hv=3 dims non-current chapters to .5 opacity by design (QA hidden-text flags it); long section (about 3000 px).
- hv=4 on mobile the sheet fills in one pass after the list (not tied to stages).
- hv=6 thumbnails are small source images shown up to 368 px wide (slightly soft).
- Images overlap with services (clay-tiles, lead-valley, tiling-work); chimney-gable left to checks. Lead to dedupe.
- tiling-work.webp shows a scaffold brand banner (small text).
