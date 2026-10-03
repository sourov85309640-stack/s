# Round 2 checklist (every request from the owner's recent messages)

## Latest round
- [x] Hero uses ONE image (single-image slot; best available photo until real stock or a client photo arrives)
- [ ] Better stock photos everywhere: BLOCKED by network policy (told the owner how to allow images.unsplash.com or upload). Re-check before delivery.
- [x] Header more dynamic (frosted on scroll, house riding the progress line, ridge line follows hover, phone rings, brand bob, weathervane)
- [x] Services mega menu (hover, chevron button, keyboard, mobile accordion), built from the services cards
- [x] Answer: is the flow best / what is missing -> added what a normal roofing homepage has:
  - [x] Services overview (8 services, each icon with its own animation)
  - [x] Trust strip (data-confirm)
  - [x] About / why choose us with stats (data-sample, data-confirm)
  - [x] Recent work gallery with lightbox (photos for illustration)
  - [x] Urgent leak band
  - [x] Full footer: CTA, services, company links, areas, hours, social, company number, VAT
- [ ] Spacing pass on small inner boxes (cards, chips, sheets, stats, steps, form, FAQ, reviews)
- [ ] Show the other 5 to 6 ideas per section: re-enable all surviving prototypes in Design options as "sketches" + list them in the final message
- [x] Section dividers each animate differently (12 edge types, each with its own entrance)
- [x] Heading entrances vary by section (rise, drop, slide, tilt, scale, skew)
- [ ] Cursor interacts differently with headings, titles, buttons, images, carousel, 3D roof, diagram, fields (cursor.js) + cursor.css
- [ ] Cursor interacts with section backgrounds: a different trail per section
- [ ] Offer cursor options in Design options (full, simple ring, off) since it was not prototyped in several versions
- [ ] More creative SVG moments: check each section has at least one unique interactive SVG; add where missing
- [ ] Keep everything liked: hero SVGs (birds, roofs, smoke), light theme, the 3D roof, the tour, the reviews widget
- [ ] Follow the skills catalog (motion rules, a11y, no slop)

## Standing rules from earlier rounds (never drop)
- Light theme only, copper accent, plain Arial/Source Sans, no tracked caps, no outline text
- No em or en dashes, no scarcity, no invented claims (samples flagged data-sample / data-confirm)
- Stock photos never described as the client's work
- Motion: transform/opacity, no ease-in on UI, UI under 300 ms, reveals .75 to 1.1 s, hover in (hover:hover), reduced motion and data-motion=off show the final state, 44 px targets, visible focus
- QA: at least two rounds (overflow 8 widths, console, hidden text, reduced/off, axe, focus, reload at depth, interactions, design options), look at screenshots at 1440 and 390
- Deliver: roofing-master-v3.1.html, source zip, SWAP-MAP.txt, AUDIT-LOG.md, OPEN-ITEMS.md, short 3-part message; commit and push
