# OPEN ITEMS: roofing master v3.1 (homepage), after round 8

Things that still need the owner, the client, or a real device. There are no known bugs left from the round 8 QA.

## Needs the owner or the client
1. **Photos.** The page uses stock photos already in the package (licence not confirmed). Confirm the licence or swap in the client's own photos (SWAP-MAP lists every photo slot). Captions say "Photo for illustration only"; stock photos are never described as the client's work.
2. **Reviews are samples.** Replace with real Google reviews, the real rating, count and review link, or delete the section.
3. **Form endpoint.** `REPLACE-ENDPOINT` in the contact section must be set. Until then nothing is sent: a local preview (opened as a file, on localhost, or with `?demo` in the address) shows the thank-you message for demos, and a live site tells the visitor the form is not taking enquiries and to call.
4. **Owner facts** marked `data-sample` (name, phone, address, hours, stats, towns, project details) and `data-confirm` (accreditations, guarantee wording, monthly payments line, yearly roof check, landlord, business and insurance work, timescales) must be checked with the client. Delete any line the client does not offer.
5. **Accreditation badges** are neutral placeholders. Real logos only once the client supplies them and is a member.
6. **Team section** is hidden (`?team=on` shows it) and needs real photos before use; it is meant for a separate team page.
7. **Versions.** Pick the version per section in the owner build (Versions button, or `roofing-options.html` side by side), set it as `data-v` on that section, then publish the client build: `python3 build.py deliver/roofing-v3.1-client.html --client` (no Versions tool).

## Not verified (honest limits)
8. Tested in headless Chromium only (Playwright), with touch emulated. Not tested on Safari, Firefox, a real iPhone or Android phone, or with a screen reader.
9. Frame times were measured with software rendering; real GPUs should do better. Slow phones were not tested.
10. The exploded 3D roof uses CSS preserve-3d, which Safari draws slightly differently.
11. No conversion data. The layout follows the skills' conversion advice; nothing here is proven to raise calls.

## Low items left on purpose
12. A few hover and active states animate colour or shadow over 150 to 250 ms on small elements; every scroll, reveal and ambient animation uses transform and opacity only.
13. Falling things (a drip, a slate) ease in on the way down because that is how gravity looks. No UI control uses ease-in.
14. Closed FAQ answers use `hidden="until-found"`, so find-in-page still reaches them (Safari falls back to plain hidden).
15. Under 1440 px wide the big foreground pieces step out to keep them off the text; small safe corner pieces stay.
16. The other versions in the Versions tool were checked for errors, overflow and interactions, but got less visual polish than the defaults.
17. File size is about 2 MB as a single file (images are most of it).
18. **Share image.** Add `<meta property="og:image">` with a 1200x630 photo of the client's own work when the site goes live (a comment in the page head marks the spot).
19. **Opening hours** appear in three places: header, footer and the JSON-LD `openingHoursSpecification`. Change all three together.
