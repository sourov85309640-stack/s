# Prototype: SERVICES + DECIDE (tags svc, dec)

Build: `out/svcdec.html`. Switch: `?v=N` (both), `?sv=N` (services), `?dv=N` (decide). Default 1 (also the no-JS state).
Files: src/sections/services.html, services.css, services.js, src/sections/decide.html, decide.css, decide.js.
Shots: `shots/svc_v<N>_*.png`, `shots/dec_v<N>_*.png` (d = 1440x900, m = 390x844; number = % through the section pass), `svcdec_*` = first pass.
Shared in every variant: light warm surface + e-wave; five problems with roof-cut photos (gable, mono-pitch, chimney notch, hip, catslide); stretched link (whole card is the target), `?issue=` links; hover wash + photo push; drips under the leak photo on hover only; "On your form" stamp on the chosen card; back layer (tile coursing, roofline), front layer (slate, leaf, nail) via depth.js.
Decide shared: one state (`--s` 0..3 on .dec-body); scroll-linked (not pinned) or hover; tap/click/Enter locks a stop (aria-pressed buttons; same card again releases); active card gets copper edge + tile pattern; links: repair `leak`, maintain `notsure&from=maintain`, investigate `notsure&from=investigate`, replace `patching`.

Scores: immersion / clarity-conversion / restraint / craft / performance (1 to 10, my own).

## Services
1. Lead card + ruled list (current model, made alive). Calm, scannable. 6 / 9 / 9 / 7 / 9.
2. Roof slope: five tiles hung on battens rising to a ridge; they swing down from their nibs on entry, lift by the tail on hover; phone = swipe row. Most roof-specific. 8 / 7 / 7 / 7 / 8.
3. Roof map: drawn house, hover a zone (leak gap with drip, slipped tiles, chimney, patch, dormer) and the matching row lights, and back. Clear but busy; the drawing repeats #where. 7 / 7 / 6 / 6 / 9.
4. Ruled rows + floating roof-cut photo that follows the pointer in a side lane and floods from grey to colour (reveal-hover-effect). Desktop only; thumbnails elsewhere. 7 / 7 / 7 / 6 / 7.
5. Pile of slates that fans into an arc as the section scrolls in (phone: lapped cards that spread). 8 / 6 / 6 / 7 / 7.
6. Chooser: five tabs (WAI-ARIA tabs, arrows, hover intent) + one big roof-cut stage with a filled button. Strong CTA, but hides four answers; photos upscale soft. 6 / 8 / 8 / 7 / 9.
**Recommend 2** (or 1 if the judge wants the calmest). 

## Decide
1. Horizontal gauge (house marker) over four cards; sticky under the header on phones. Clearest. 7 / 9 / 8 / 8 / 9.
2. One roof drawn in four conditions (moss, stain + lifted flashing, sagging ridge + slipped tiles) that weathers with the stop, sticky beside the cards. Most memorable. 9 / 8 / 7 / 7 / 8.
3. Vertical scroll-progress timeline rail + sticky "Roof health" thermometer. 7 / 8 / 8 / 7 / 8.
4. Dial and needle; on phones the cards swipe sideways and the swipe turns the needle. 7 / 7 / 7 / 7 / 8.
5. Segmented tabs with sliding indicator, one answer at a time beside the roof drawing. Content swaps under the reader when scroll-driven. 6 / 6 / 7 / 6 / 9.
6. Self-check: a real range input ("How does your roof look from the ground?") with a house thumb that cracks; cards follow. 7 / 8 / 8 / 7 / 9.
**Recommend 2**, with V1's gauge labels as a fallback idea; V6's slider is a good second.

## Measured (1440, headless software raster, other agents running, so noisy)
Frame p50 16.7 ms in most runs; p95 33 to 67 ms; one V4 decide run p50 33 / p95 183 (noise suspected, not reproduced). Console clean, no horizontal overflow, nothing stuck hidden after a walk (V1 to V4 checked fully).

## Known issues
- V4 services float lane fixed late (rows first overlapped the photo); re-check. Colour flood is subtle.
- Mobile 390, reduced motion and motion-off not screenshot-checked in this pass (stopped to save credits); logic is motion:false for picks, tabs, map, stamp.
- Photos are small (clay-tiles 410 px): soft when large (services V6).
- Moss tint #A9AE7E / #B7B98F is an illustration-only colour outside the palette.
- REQUEST TO LEAD (app.js): add `maintain` issue key ("About: maintenance, moss, gutters, pointing") and keep reading `from=`; decide links use `notsure&from=maintain|investigate` until then. The variant switch reads `?v`, which the shared picker also sets.
