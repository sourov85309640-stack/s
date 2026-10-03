# Reviews section: stage 1 prototypes (tag: reviews)

Out file: `out/reviews.html`. Switch with `?v=1..6`. `?rv=N` overrides `?v`, so the reviews variant can be picked independently of other sections that also read `?v`.
Files: `src/sections/reviews.html`, `src/reviews.css`, `src/reviews.js`.

## Shared by every variant
- An imported-looking Google widget: a white rounded card, the 4-colour G, "Google Reviews", 4.8 with five stars (the fifth filled to 80 percent), "Based on 63 reviews", and a blue pill "Review us on Google" link (data-sample="review-link").
- 7 invented reviews (one 4-star, short and long ones). Each has a 40px initial avatar with a G badge, inline "Read more" (aria-expanded) and a "Posted on Google" line.
- One carousel engine: 1:1 pointer drag, momentum projection, rubber-band edges, an interruptible spring, arrows, dots (progress bar plus "n / 7" on phones), arrow keys, Home and End. Focus moving onto a card scrolls it into view. A polite live region announces the position.
- Parallax layers: rooftops, outline houses, map pins and a dot grid behind; swallows, a leaf and a tile fragment in front, kept in the gutters. Gable cutout photo (stock).
- Motion on entering view: the rating counts up and the stars land one by one like tiles. These run once and only when motion is allowed.
- Without JS: a native scroll-snap strip with the full text. With reduced motion or `data-motion=off`: everything is visible and moves happen instantly. In those runs: 0 console errors, no overflow from my files, and axe found 0 violations (v1, v4, v5).

## Variants (scores: immersion / clarity / restraint / craft / perf)
1. **Drag rail** (Elfsight style). 3, 2 or 1.15 cards per view, physics drag, arrows on the card edges. Shots: `shots/reviews_v1_desk_1-3.png`, `_mob_1-3`. Scores 6/9/9/8/9.
2. **Deck**. One review on a fanned pile, dealt in on entry. You flick the top card away, and cards waiting in the pile show blank. Shots: `reviews_v2_*`, `reviews_v2_desk_enter1-2`. Scores 8/7/7/8/9.
3. **Scroll drift**. On screens 1000px wide and 760px tall or more, the widget pins and page scroll walks the row, with gentle snap. Arrows scroll the page. On smaller screens the row drifts against the scroll and stays draggable. Shots: `reviews_v3_desk_pin25/50/75.png`. Scores 7/7/6/8/8.
4. **Spotlight**. One featured review, with the reviewers' avatars as the picker, a 20-segment rating ring, and the first review arriving like a notification. Shots: `reviews_v4_desk_enter1-3`, `reviews_v4_*`. Scores 8/8/8/7/9.
5. **Timed**. The rail advances every 6.5 s, with story-style segments and a visible Pause button. It pauses on hover, on focus, while off screen and under reduced motion. Scores 6/8/6/8/9.
6. **Cover flow**. The current review faces you and its neighbours turn away in CSS 3D. Tap a side card to bring it forward. Scores 7/7/6/7/8.

Frame times while scrolling through: p50 16.7 ms and p95 16.8 ms for all variants in the first run. A later run, made while other agents were loading the machine, gave p95 50 ms.

## Recommendation
**v1 (drag rail) as the base, plus v4's notification arrival and rating ring as the one memorable moment.** v1 is what visitors know from real Elfsight or Trustindex widgets (Jakob's law), so it looks genuinely imported, and it shows 3 reviews at once, which is the strongest proof. v4 adds feeling without hiding reviews. v2 is the best runner-up for phones.

## Known issues
- In v2, v4 and v6, the inactive slides are `inert` and at opacity 0 on purpose, so `qa_lib.hidden_text` lists them.
- `qa_lib.goto(motion_off=True)` throws, because its init script runs before `<html>` exists, so data-motion=off is never set. I tested with a MutationObserver init instead.
- The hero team's fixed variant switcher sits over the bottom left of this section in screenshots.
- One mobile v6 run did not advance on ArrowRight after a swipe followed by "Read more". A clean rerun worked, and I could not reproduce it.

Skills applied: better-ui, beautiful-shadows, apple-design, feedback-patterns, micro-interaction-spec, better-accessibility, animation-on-scroll, staggered-word-reveal (masked h2 via RW.headings), number-details (none added: nothing here is a sequence), no-ai-design-slop, animate, emil-design-eng, interfaces-that-feel, find-animation-opportunities, ambient-section-particles, frontend-design, prototype/variant/parallel-concepts, jakobs-law, serial-position-effect, von-restorff-effect, gesture-patterns, state-machine, law-of-common-region, figure-ground, fitts-law, zeigarnik-effect.

SWAP-MAP: paste the client's real Google reviews, rating and count, or delete the section. Set the "Review us on Google" href to the client's review link. The gable photo is stock and is not the client's work.
