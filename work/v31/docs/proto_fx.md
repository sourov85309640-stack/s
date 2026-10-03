# proto_fx: global atmosphere (stage 1, cut short to save credits)

Files: src/fx.js, src/fx.css. Switch: `?fxv=0..6` (0 = all off, used as a control; the default is 1). You can also pick features freely with `?fx=particles,tint,sun,edges,magnet,cursor,weather,skew`.
Builds: out/fx.html is the real build, mid-rebuild by the other teams. out/fx_stage.html is a stable light test page I built to judge the look; it uses the real base.css, core, fx and the real section ids and edges. Screenshots: shots/fx_v{1..6}_*.png, fx_v4_edge_*.png, fx_v6_services_390.png.

## Engine (shared by all variants)
- Each section gets one particle layer as its first child: `[data-fx-canvas]`, absolutely positioned at inset 0, z-index 0, aria-hidden, pointer-events none.
- Inside that layer, one sticky canvas sized to the viewport rides along with the section. This avoids a canvas the full height of the section, which would be about 116 MB at DPR 2 for a section 5000 px tall. If a scroll container would break `position: sticky`, the canvas falls back to being placed by JS.
- A section's `data-fx` / `data-fx-count` take priority over the DEFAULTS map. `data-fx="none"` switches the layer off. `data-fx-band` sets the height band the birds fly in.
- Particle kinds:
  - leaves: tumble about their own axis (scaleX by cos), sideways slip driven by the tumble, separate front and back faces
  - rain: slanted slate-blue streaks
  - dust: motes that light up inside a soft shaft of light; the shaft is a static CSS gradient, so it costs nothing per frame
  - swallows: glide, with short bursts of wing beats
  - tiles: tumbling slate and clay fragments
  - petals
- Leaves, tiles and petals mostly keep to the outer gutters.
- Budget is 3 to 12 particles per section, scaled by area. Pointer disturbance on fine pointers only.
- Loop and pausing: one RW.tick loop. Sections pause offscreen (IntersectionObserver) and everything pauses when the tab is hidden. DPR is capped at 2.
- Reduced motion and data-motion=off: no canvas, overlay or ring at all (verified).

## Variants
| v | Combination | Verdict |
|---|---|---|
| 1 | Particles only | Calm and readable. Leaves and birds read correctly. |
| 2 | Particles + sky tint (multiply layers: morning cream, then afternoon gold, then dusk) | Gentle sense of time passing. |
| 3 | Weather story: overcast tint and page-wide light rain over #where, clearing afterwards (sun shaft and dust at #decide), then golden, then dusk | The most narrative. The grey at #where is a bit gloomy for a light brand. |
| 4 | Sky tint + sun + roof-edge build | Edges rising as each section arrives works well. The sun still looks like a smudge under the header: reject the sun. |
| 5 | Survey-ring cursor + magnetic buttons + edges + velocity skew | Desktop only. The ring takes no clicks (no rail). Skew fights other teams' transforms and does little for a roofer: reject skew. The ring is optional at best. |
| 6 | Particles + sky tint + edges + magnetic buttons (max 7 px, elastic return, never on submit buttons) | **Recommended.** |

## Measurements
- **Contrast under the tint:** I measured every visible text element while scrolling the whole page on the real build and on the stage. Every pair that passes 4.5:1 without the tint still passes with it; the lowest is 4.51:1.
  - The binding pairs are copper on warm, and the white avatar initial in reviews.
  - Copper on sand (#E6DFD0) already fails at 4.26:1 without any tint. That is a token issue for the lead.
- **Frame times while scrolling the whole page (1440, headless swiftshader, very noisy):** p50 was 16.7 to 33 ms in every variant, including v0 with everything off.
  - fx's own JS cost 0.1 to 1.4 ms per frame.
  - I did not run the CPU-throttled (4x) and mobile perf runs because of the stop request.

## Known issues
- Particle colours and placement can only be judged properly once the sections are styled. The canvas sits under `.wrap` (z-index 1), so any section content that is not positioned paints under the canvas.
- Dusk at #contact makes the sand surface slightly muddy. If the judge prefers a warm, bright contact section, lower the dusk value in the tint keys.
