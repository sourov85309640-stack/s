# proto_where: "Where a roof lets water in." (stage 1, cut short to save credits)

Out file: out/where.html. Variant switch: `?v=1..6` (where.js sets `data-v` on #where). Desktop shots, 1440x900, pinned at 0/25/50/75/100% of the pin: shots/where_v<N>_<pct>.png, montage at 50%: shots/where_montage.png.

## Shared base (in every variant)
- A new drawing, made by a projection script (scratchpad gen_where.py, which writes src/svg/roof-diagram.svg, where-xray.svg and where-overlay.svg). It shows a cottage with a main gable roof and a front cross gable, so it has two real valleys, plus a ridge, a chimney stack with lead flashing, eaves (fascia) and a gutter with a downpipe. Nothing in it is specific to one firm. Style: ink lines at about 60%, warm flat fills, copper for highlights.
- The section is light: sky surface (`sec-sky`), `e-step` top edge, `.tile-edge` bottom edge, and the drawing sits on a paper sheet with a faint grid. The heading, the intro and the six list rows (bold name + one sentence) use neutral copy.
- Tour: the stage pins at (min-width:1000px) and (min-height:800px). On other screens it runs in flow mode: the plate is sticky and each list row drives the marker. Pins and rows can be clicked to scroll to that stop. Rows become buttons only while the tour runs (fixes QC-5). A copper rail beside the list fills as you go. `onRefresh` re-applies the scroll progress after a reload at depth or a resize. With motion off, all six parts show highlighted, the list is plain text and there is no marker.
- Parallax layers: behind, a survey grid with crosses and two distant rooflines; in front, rain streaks and a leaf in the gutters at the edges.

## Variants
1. Survey marker: a water drop falls from the marker and splashes each time it locks onto a spot. Calm and clear.
2. Follow the water: at each stop a slate-blue path draws from the failure point down into the house and ends in a damp patch. Earlier paths stay faint. This one explains the problem best.
3. Rain and loupe: light rain falls on a canvas (12 streaks plus small splashes). A magnifier follows the marker and shows animated water entering at the active spot.
4. Section lens: when the marker locks, a card opens beside the spot with a cut-through sketch of it (6 sketches, in where-sections.svg).
5. X-ray: a soft radial mask shows the rafters, battens and underlay under the covering, around the marker and also around the pointer on desktop.
6. Camera: the drawing zooms in and pans to each spot. It starts and ends on the full view, and a small map shows where you are.

## Recommendation
**V2 (follow the water)** as the base, with the **V1 drop splash** grafted on at each lock. It is the only variant that shows a homeowner what a leak actually does to the house, which leads naturally into "Tell us about your roof". It is also restrained: one moving idea, and nothing loud. Second choice: V4, which teaches well but needs the sketches polished.

## Known issues and what was not tested (stopped early)
- I tested only at 1440x900 with the tour pinned. Not run yet: 390 touch / flow mode, reduced motion, data-motion=off, axe, frame times, and reload or resize while pinned (the code for these is in place, but none of it has been tested).
- V3: in mid-flight the loupe shows only plain tiles, so it should only appear once the marker has locked. V6: the zoomed SVG may raster soft while moving (will-change is only set during flight). V4: the sketches are rough.
- The build output is now 1.9 MB. Most of that is not from my files (my SVGs add roughly 60 KB), but it should be checked.
- Scores (immersion / clarity / restraint / craft / performance, my own estimates): V1 6/8/9/7/9, V2 8/9/8/7/8, V3 8/6/6/7/6, V4 7/8/7/6/8, V5 8/6/7/7/7, V6 8/7/6/7/6.

## Skills applied
gsap-scrolltrigger-storytelling, scroll-scrubbed-visual-sequence, cinematic-scroll-storytelling, scroll-progress-timeline, reveal-hover-effect, ambient-section-particles, gsap, optimize-web-animations, animate, emil-design-eng, no-ai-design-slop, interfaces-that-feel, find-animation-opportunities, frontend-design, parallel-concepts, prototype/variant, illustration-style, state-machine.
