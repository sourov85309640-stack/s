# Prototype: #whole (CSS 3D exploded roof), tag `whole`

Build: `out/whole.html`. Switch variants with `?v=1..6`. Files: src/sections/whole.html, src/whole.css, src/whole.js, src/svg/xv-model.svg, xv-cut.svg, xv-plate.svg (made by gen_xv2.py).

Shared to all variants: light paper stage with the beautiful-shadows lg shadow, Tiles | Slates radiogroup (arrow keys, also works with motion off; swaps the covering, the ridge, the names and the aria-label), neutral copy, a measured fit that scales the model and its tags into the stage at any width (QC-3, QC-8, QC-9). Pinned at (min-width:900px) and (min-height:780px) (QC-2). Copy column top-aligned and the list keeps room for its tallest row, so the button stays put (QC-4). Reload at depth restored through onRefresh (QC-1). List buttons highlight their layer with motion off (QC-5). Phones: the stage is sticky, the tags shrink to numbered badges, the row under the stage drives the scene (QC-6). Tags are --muted on paper, 7:1 (QC-7). Back layer: faint truss drawing; front: tile fragment and nail; pointer tilt.

| v | Concept | Screens | Immersion / clarity / restraint / craft / perf |
|---|---|---|---|
| 1 | Lift apart: layers part, list walks through them | shots/whole_v1_1440_{0,25,50,100}.png, whole_v1_390.png | 7 / 9 / 9 / 8 / 8 |
| 2 | Build the roof: layers placed from above, rafters first, then pressed into one roof | whole_v2_1440_{25,100}.png | 8 / 8 / 8 / 8 / 8 |
| 3 | Turntable: stack turns 40 degrees on a measured plate; switch re-tiles in a cascade | whole_v3_1440_75.png | 7 / 7 / 7 / 7 / 7 |
| 4 | Cut-away corner: a stepped corner lifts out, every layer shown in section | whole_v4_1440_{0,50}.png | 8 / 7 / 8 / 6 / 7 |
| 5 | Raindrop: a drop meets each layer in turn, caption explains | whole_v5_1440_25.png | 9 / 8 / 7 / 7 / 7 |
| 6 | Hands-on: no pin, slider or sideways drag lifts the layers | whole_v6_1440.png | 6 / 8 / 9 / 7 / 9 |

Checked: console clean, no overflow at 1440 and 390, reduced motion shows the final state and the list works. Frame times were not measured (stopped early to save credits).

Known issues: v4 callouts were taken out because 3D billboards over the planes were hidden by depth sorting. They still need a 2D overlay placed by DOMMatrix projection. v3 at 75% looks flat (the turn range has since moved to -56..-16 but was not re-shot). The drop in v5 is small. Variants 2 to 6 got only one screenshot pass.

Recommendation: v2 or v5, built on v1's base. v2 tells the "works as a whole" story best and stays calm. v5 is the most memorable, with the drop and caption. My pick is **v2**, with the v5 raindrop as an option for its last beat.
