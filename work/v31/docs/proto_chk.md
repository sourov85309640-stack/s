# Prototype: CHECKS + AREAS + FAQ (stage 1, cut short to save credits)

Build: `python3 build.py out/chk.html` (copies: out/are.html, out/faq.html, same file). Switches: `?cv=1..5` checks, `?av=1..5` areas, `?fv=1..4` FAQ.
Files: src/sections/{checks,areas,faq}.html, src/{checks,areas,faq}.{css,js}. Screenshots: shots/che_v*, are_v*, faq_v* (d = 1440x900, m = 390x844 touch).
Tested: desktop all variants, mobile checks + areas, FAQ open/close and aria state. Console clean, no overflow from my sections. NOT run (cut short): reduced motion / data-motion=off pass, axe, frame times, find-in-page, deep-link test, mobile FAQ.

## Shared (all variants)
Checks: three items with old copy; tick buttons added by JS (aria-pressed, name "I have checked the Slates and tiles"), "n of 3 checked" status (role=status), CTA lifts and fills copper when all three ticked; no-JS shows a plain list. Photo chimney-gable.webp, zones in `data-zones` on the figure (must be updated if the photo is swapped). Layered parallax: grid, distant roofline, clouds / leaf, slate, nail, swallow.
Areas: heading "Areas we cover", chips are links `?town=NAME#contact`, no separators (D6), base town marked "Our base", no marquee. `data-pos="x,y"` per town (auto ring if missing).
FAQ: no-JS all open with aria-expanded="true", role=region dropped (D9); closed answers `hidden="until-found"` + beforematch opens (D4; base.css `[hidden]{display:none!important}` is overridden in faq.css); #q1..#q6/#a1..#a6 open + scroll (D5); plus-to-minus 220 ms, panel 260 ms; hover only in (hover:hover) (D3); sticky heading column on desktop.

## Variants and scores (immersion / clarity / restraint / craft / perf, 1-10)
Checks
- v1 diagram + list: person at ground level, sightline cone and scan ring move to the zone of the hovered / focused / scrolled item; pencil ticks per zone, copper when ticked. 7/8/8/7/9
- v2 cards flip to a tick (280 ms CSS 3D), icons draw on view. 6/8/8/7/9
- v3 scrubbed sightline drawing: house sketch draws, sightline sweeps, rail fills through the boxes; sticky on mobile. 8/7/7/7/8
- v4 binocular reveal: soft grey photo, two-lens sharp reveal follows pointer, glides to the active zone on touch/scroll. 8/8/7/7/8
- v5 phone viewfinder: brackets glide to zones; ticking "takes" a photo into a strip. 7/8/7/6/9
Areas
- v1 abstract contour map, roads, ripple from base, chips on the map (desktop). 8/9/8/8/9
- v2 rooftops skyline, roof lifts on hover/focus. 7/8/9/7/10
- v3 distance rings, chips in orbit, spoke on hover. 8/8/7/7/9
- v4 roof-tile grid, tiles tilt up on hover. 6/8/8/6/10
- v5 route line + "type your town" search with van. 6/9/7/6/9
FAQ
- v1 classic grid accordion. 6/9/9/8/10
- v2 questions left, sticky answer panel right (accordion on mobile). 7/9/8/8/10
- v3 chat-like Q/A with short typing dots. 7/7/6/7/10
- v4 all answers open, sticky index with scroll-spy. 5/9/9/7/10

## Recommendation
Checks v4 (binocular) or v1 (diagram) if the owner wants no photo-dependent coordinates. Areas v1 (contour map). FAQ v2 (sticky answer panel), v1 as safe fallback.

## Known issues
- Checks v4/v5 depend on photo zone coordinates (template risk, documented in markup).
- Checks v1 mobile: photo tile overlaps the panel edge; v3 mobile sticky diagram takes about a third of the screen.
- Areas v5 van position untested on mobile; v4 last tile sits alone on mobile.
- Closed FAQ answers report as hidden text in qa_lib.hidden_text (by design).
- Wording "Was this useful? If not, call and ask." (FAQ v2) and areas lead are new copy for the owner to check.
