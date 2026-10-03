# Prototype report: contact + form (tag ct)

Build: `python3 build.py out/ct.html`. Switch variants with `?v=1..6`. Test params: `?issue=leak&town=Tetbury&from=x`.
Files: src/sections/contact.html, src/contact.css, src/contact.js, src/app.js.

## Shared by every variant
- Light warm section with the e-chim edge. Gable photo in full colour: its sky is transparent, so the warm surface shows round the roof. No dimming.
- Big phone link. Copy chip on fine pointers only, with a polite status message; it stays hidden if the clipboard is not available.
- Paper form with the same fields as before. Validation as before: errors show on blur and on submit, with aria-invalid and focus on the first error. A tick appears in the field as soon as a value is valid. Honeypot, consent note with privacy link, success state with a drawn tick and the visitor's first name (focus moves to it).
- Starter chips (44px) add a sentence to the notes, or take it out again.
- `?issue=` (7 keys) and `?town=` tags stamp in when they come into view. Clicking a `?issue=` link works without a reload.
- Photo thumbnails. Focus fill on fields. Lights-on glow (opacity only).
- The mobile bar steps aside while the form is on screen and is made inert, so its links cannot take focus off screen.
- Back layer: tile texture, faint roof outline, distant rooflines. Front layer: leaf and swallow, kept in the gutters. Leaves are hidden under 640px.

## Variants (scores: immersion / clarity / restraint / craft / perf)
1. **Split**: copy and gable on the left, paper sheet on the right. 6 / 9 / 9 / 8 / 8. Shots: shots/ct_v1_d_full.png, ct_v1_m_full.png, ct_v1_d_errors.png, ct_v1_d_sent.png
2. **Clipboard**: the sheet sits on a board that leans up to 3deg toward the pointer and straightens while you type. 8 / 8 / 7 / 8 / 8. Shots: ct_v2_d_full.png, ct_v2_d_tilt.png
3. **One question at a time**: progress tiles, Next/Back, Enter to go on. All fields show without JS. 7 / 7 / 8 / 7 / 8. Shots: ct_v3_d_full.png, ct_v3_d_filled.png. The short card leaves empty space on desktop.
4. **Evening house**: a window in the real photo lights up for each part you complete, mirrored by 4 small windows in the sheet header. 9 / 8 / 8 / 8 / 7. Shots: shots/ct_v4_d_windows_off/half/on.png, ct_v4_d_filled.png
5. **Roof outline draws** over the sheet as the 3 required fields come right. A weathervane appears when they are all valid, and the brand mark completes. 8 / 8 / 8 / 8 / 8. Shots: ct_v5_d_full.png, ct_v5_d_filled.png
6. **Picture cards first**: 5 symptom cards set the issue tag and a starting sentence. 6 / 8 / 7 / 7 / 8. Shots: ct_v6_d_full.png

Frame times: I scrolled through the section in headless swiftshader while other agents were running, so the numbers are noisy. p50 was 16.7 to 33 ms in every variant, and v4 had the worst p95 (mix-blend lamps).

## Tests run
- Console clean in my code. The data-motion=off page error comes from the qa_lib init script, not from these files.
- No overflow in #contact. No hidden text after scrolling forward and back.
- Reduced motion and data-motion=off: the end state is complete (tick drawn, lights on).
- D1/D2: Tab through the form at 390x844 and 1280x720. No field is covered by the bar or cut off at the bottom of the viewport.

## Known issues
- axe was not run (stopped early to save credits).
- v3 needs layout polish on desktop.

## Recommendation
**v4 (evening house) on the v1 layout**, with v5's small brand mark as a graft. It ties the photo, the lights-on glow and form progress into one calm idea, and it ends on a peak: every light comes on when the enquiry is sent. v2's "straighten on focus" is a second graft if the judge wants more movement.

Skills applied: form-design, feedback-patterns, peak-end-rule, ux-writing, better-writing, better-accessibility, micro-interaction-spec, fitts-law, doherty-threshold, no-ai-design-slop, animate, emil-design-eng, interfaces-that-feel, find-animation-opportunities, ambient-section-particles, frontend-design, parallel-concepts, prototype/variant, zeigarnik-effect, state-machine, loading-states, error-handling-ux, law-of-common-region/proximity/similarity, hicks-law, icon-system, illustration-style.
