# OPEN ITEMS: roofing master v3.1 (homepage)

Things that still need the owner, the client, or a real device. Nothing here is a known blocker, high or medium bug.

## Needs the owner or the client
1. **Photos.** Unsplash, Pexels, Wikimedia and similar sites were blocked by this build environment's network policy (proxy 403), so no new stock photos could be downloaded. The page uses the photos already in the package (stock images of unknown licence from earlier rounds), recropped. Confirm their licence or replace them with the client's own photos, or fetch fresh Unsplash photos when the network allows (slugs listed in docs/01_HANDOVER_A-Z.md section 9). The old hero photo (a North American crew with a phone number and a street sign) and the asphalt-shingle gable were removed.
2. **Hero photo.** There is no single wide UK photo, so the hero gable shows three portrait photos side by side. One wide client photo works as well (delete two panes, see SWAP-MAP).
3. **Repeated photos.** With only about ten source photos, some appear twice in different crops: the chimney gable (hero and checks), the stone cottage (hero and project), clay tiles and tiling work (services and how it works). Client photos fix this.
4. **Reviews are invented samples.** Replace them with real Google reviews, the real rating and count, and the real review link, or delete the section.
5. **Form endpoint.** `REPLACE-ENDPOINT` must be set. Until then the form only shows its success message.
6. **data-confirm items:** process wording (how it works, FAQ), timescales, scaffold, weather, guarantee, reply time.
7. **Design options panel.** Pick the designs per section, set them as defaults (data-v in each section partial, data-hero on html) and delete the owner panel before a site goes live (SWAP-MAP explains).

## Not verified (honest limits)
8. Only **headless Chromium** (Playwright) was used. Not tested on Safari, Firefox, a real iPhone or Android phone, or with a screen reader (VoiceOver, NVDA). Touch was emulated in Chromium only.
9. **Frame times** were measured in headless software rendering (swiftshader), while other processes ran. Full-page scroll at 1440: p50 16.7 ms, p95 33 ms; at 390: p50 16.7 ms, p95 16.8 ms. Real GPUs should do better; slow phones were not tested.
10. **No conversion data.** Nothing here is proven to raise calls or enquiries; it follows the skills' conversion advice only.
11. **CSS 3D** (the exploded roof) relies on preserve-3d, which Safari renders slightly differently. It was not checked in Safari.

## Low items left on purpose
12. Some state changes animate colour, background colour or a box shadow over 150 to 250 ms on small elements (hover, active list row). They are not layout animations; the strict "transform and opacity only" rule is kept for every scroll, reveal and ambient animation.
13. Physical motions (a falling drop, a marker hop) use an ease-in on their downward phase, because that is how gravity looks. No UI control uses ease-in.
14. Closed FAQ answers use `hidden="until-found"` so find-in-page still reaches them (Chromium and Firefox; Safari falls back to plain hidden-on-close).
15. On screens narrower than 1440 px the foreground parallax pieces step out (no gutter space to keep them off the text). Background layers and the particle canvas stay at every width.
16. The "Design options" owner button sits bottom-left over content on phones. It is an owner tool and is deleted before sending.
17. The alternative designs kept in the Design options panel were checked for console errors, overflow and hidden text at 1440 and 390, but they received less visual polish than the defaults.
18. File size is about 1.7 MB (images are about two thirds of it). Lazy loading does not apply inside a single file; the hero photos load first.
