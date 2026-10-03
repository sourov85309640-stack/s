# Hero prototypes (tag: hero), stage 1. Cut short when the owner asked to save credits

Out file: `out/hero.html`. Open it with `?v=1..6&hero=a|b|c`. When `?v=` is in the address, the picker pill also shows a "Motion 1-6" row.
Files: `src/sections/hero.html`, `src/hero.css`, `src/hero.js`. No new images.

## Built once, shared by every variant
- Three layouts on `html[data-hero]`. A: h1 on the left, copy on the right, a full-bleed gable band, and the detail tile. B: a large pentagon gable plate (up to 1440px wide) with a paper card overlapping its foot. C: copy centred, a symmetric gable, and a Google rating chip (#i-g, 4.8, 96% stars, 63 reviews, all marked data-sample="rating").
- Photo: a triptych of hero-p1, p2 and p3 with 6px paper gaps. On phones it shows only p2 and p3. Swapping to one wide photo means deleting two panes; the one left fills the gable (the comment in the markup explains it). `data-smoke` marks the chimney top.
- Layers: distant rooftops in two depths, with chimneys and a weathervane, standing on the eave line. Three swallows glide behind the gable peak. Canvas smoke rises from the p2 chimney and escapes over the roofline. The photo has parallax inside the clip (clip on .hero-plate, `translate` on .hero-plate-in). The outline draws itself. One sun sweep plays on load. Small slate, ridge tile, leaf and nail pieces sit at the edges and move with depth.js.
- Owner tool: the "Hero style A B C" pill. It is fixed bottom-left and sits above the mobile bar on phones. Buttons are 44px with aria-pressed, the choice goes into the address with replaceState, it works with motion off, and it carries data-owner-tool and a "delete before sending to a client" comment.
- Without JS, under reduced motion and with data-motion=off, the CSS alone shows the finished hero.

## Variants
1. **Calm roofscape.** Layered parallax, swallows, smoke and light pointer depth. Tested at 1440, 390, and layouts A, B and C. Immersion 7, clarity 9, restraint 9, craft 8, performance 8.
2. **Roof assembles.** As you scroll, the panes slide and rotate into the gable and a dashed construction outline turns solid. Tested at 1440 (`shots/hero_v2_*`). Immersion 8, clarity 7, restraint 7, craft 7.
3. **Pointer diorama.** Each photo shifts inside its pane by its own depth, the frame tilts up to 1.4 degrees, and the rooftops, tile and edge pieces sit on separate planes. On touch, scroll drives it instead. Code only, not checked in a browser.
4. **Morning light.** A sunlit copy of the photos is revealed through a mask that follows the pointer (reveal-hover-effect), with a warm glow and the tile shadow moving with the light. At rest, the light moves right to left as you scroll. Code only.
5. **Rising horizon.** Rooftops in front of the photo rise as you scroll, filled with the next section's background, so the hero hands over to the reviews. Code only.
6. **Wind.** Pointer speed, or scroll speed on touch, makes gusts. The smoke bends, the weathervane turns, swallows drift and five tumbling leaves are blown (falling-leaves). Code only.

## Recommendation
Ship **v1 as the base** and add v2's assembly as a subtle touch only if the judge likes it. v1 is the calmest and keeps the CTA clear at every width. Layout A is the default and C is the strongest at converting (it has the rating chip).

## Known issues
- v3 to v6 have not been checked in a browser yet. They need one pass at 1440 and 390, checking the console and frame times.
- Headless frame times (swiftshader) while scrolling the whole page: p50 16.7ms, p95 66.7ms. This is mostly page-wide; it was not profiled per variant.
- The picker covers part of the photo on phones (it is an owner tool, and it is two rows when ?v is set).
- fx.js adds its own birds to the hero by default. The hero sets `data-fx="none"` because it has its own swallows.
- The detail tile (hero-tile) crops the same lodge as p1. This is how the brief specified it.
- Overflow at 390 comes from services (`li.svc`), not the hero.

Skills applied: prototype/variant/parallel-concepts, masked-reveal, staggered-word-reveal, cinematic-gsap-lenis, scroll-scrubbed-visual-sequence, reveal-hover-effect, falling-leaves, ambient-section-particles, beautiful-shadows, apple-design, emil/animate rules, better-typography, visual-hierarchy, landing-page-design (one proof signal next to the CTA in C; its font and gradient rules overridden by the brief), no-ai-design-slop, figure-ground, Fitts (44px targets), Jakob (Google-style chip).
