# Who does what: every request from the owner's prompts

Sources: the start prompt and handover, the "do it all without stopping" prompt, the "immersive / layers everywhere" prompt,
the "I really like this one" round 2 prompt, the "normal roofer site too" prompt, the "don't miss anything" prompt,
and the "focus on creativity, Sonnet does QA later" prompt.

Legend: [x] done, [~] partly done, [ ] not done yet.
Opus = creative, design, new sections, animation, depth (now).
Sonnet = QA, fixes, spacing, UI polish, packaging (later).

## A. Opus: creative and depth (doing now)

### A1. Depth: layers everywhere ("foreground SVG, middle ground, background, layers playing around")
- [x] Back / front layers with scroll and pointer parallax in the round 1 sections
- [x] Round 2 sections still flat: services overview, trust strip, about, gallery, urgent, 3D roof section. Each one gets
      its own back, middle and front layers with SVGs that do not repeat elsewhere
- [x] Foreground layer is hidden under 1440 px wide. Give each section one or two small "safe" front pieces (corners, edges)
      that stay visible at 1024 to 1439, so the depth does not disappear on laptops
- [x] Mid-ground layer: a slow layer between back and content in every section (roof lines, distant chimneys, aerials, gulls,
      washing lines, scaffold, weathervanes, ladders), each section a different set

### A2. The cursor and the section backgrounds ("background reacts when the cursor goes to the next section, keeps reacting")
- [x] Cursor states: brackets on buttons, spirit level on headings, View on photos, Drag, Tilt, crosshair, hidden on fields
- [x] A different trail per section
- [x] Entry reaction: when the pointer crosses into a section its background answers once, differently per section
- [x] Living field per section that keeps reacting while the pointer moves, never the same twice:
      reviews (stars that swell), services (tiles that lift), problems (leaves blown aside), where (rain parts around the pointer),
      decide (balance tilts to the side you are on), 3D roof (blueprint grid bends), about (roofer looks at you, smoke bends),
      gallery (photos tilt), projects (pegs lean), how (chalk dots join to the pointer), checks (sight line follows you),
      areas (contour map bulges), FAQ (window lights up, smoke bends), urgent (bucket follows you and catches drips),
      contact (warm lamp light follows you), trust (icons turn to face you), hero and footer (birds scatter)

### A3. Hover: something different everywhere ("sometimes SVG animation, sometimes a colour change, never repeated")
- [x] Each service icon has its own animation; trust icons each different; nav ridge line; phone rings; weathervane
- [x] Headings: words react to the pointer passing (a small lift wave), different style per section family
- [x] Buttons: each main CTA family gets its own small hover moment (call buttons ring, quote buttons draw a roof, text links slide a tile)
- [x] Photos: different reveal per gallery tile (shutter, scan line, slate wipe)

### A4. New sections ("everything a normal roofing company site has, plus the teaching")
What a typical UK roofer's homepage has, checked against this page:
header with phone [x], hero with CTA [x], services [x], why us and about [x], stats [x], reviews [x], gallery [x],
process [x], areas [x], FAQ [x], quote form [x], emergency [x], guarantee and insurance [x], footer [x], mobile call bar [x].
Missing, to add (each with its own SVG moment, none repeated):
- [x] Accreditation and membership row (neutral placeholder badges, data-confirm; never real logos until the client supplies them)
- [x] Roof types we work on: tiles, slate, stone, flat, lead and metal, with drawn swatches (hover lays a course)
- [x] Before and after drag slider, drawn in SVG (honest: a drawing, not a photo of client work)
- [x] Who we work for: homeowners, landlords and letting agents, businesses, insurance work (data-confirm)
- [x] Meet the team: illustrated people, names and roles as samples (data-sample)
- [x] Quick roof check: 3 taps (what you see, where, how urgent) that fills the enquiry form
- [x] Looking after your roof: seasonal care (autumn, winter, spring, summer) plus a maintenance visit option (data-confirm)
- [x] Roofing advice: 3 guide cards (teaching, links to the client's own articles, data-sample)
- [x] Free survey and quote band with optional "spread the cost" line (both data-confirm, delete if not offered)

### A5. Showing the other ideas
- [x] Design options panel with default, alternatives and sketches for every section
- [ ] List all of them in the final message to the owner

### A6. Normal roofing homepage content (alongside the teaching)
- [x] Services, trust, about and why us, stats, gallery, urgent band, reviews, areas, FAQ, contact, full footer
- [ ] Roof types (A4), before and after (A4), accreditations placeholder row (data-confirm) inside trust

## B. Sonnet: QA, fixes, polish (later)
- [ ] Spacing pass inside small boxes (cards, chips, stats, steps, form, FAQ, reviews, mega menu)
- [ ] Full QA at 360, 390, 768, 1024, 1280, 1440, 1920: overflow, console, hidden text, reduced motion, data-motion=off, axe,
      keyboard and focus, reload at depth, resize while pinned, fast and reverse scroll, touch
- [ ] Check every new cursor reaction and field at 60 fps; lower particle counts if slow
- [ ] Check copy rules: no dashes, no scarcity, no invented claims, data-sample and data-confirm on all owner facts
- [ ] Better stock photos: blocked by the network. Allow images.unsplash.com or upload photos, then swap (see SWAP-MAP)
- [ ] Update AUDIT-LOG.md, OPEN-ITEMS.md, SWAP-MAP.txt; rebuild deliver/roofing-master-v3.1.html and the source zip
- [ ] Short three-part final message to the owner

## Standing rules (both)
Light theme only, copper accent, Arial and Source Sans 3, no tracked caps or outline text, plain UK English, no em or en dashes,
stock photos never called the client's work, transform and opacity only, hover inside (hover:hover), reduced motion and
data-motion=off show the final state, 44 px targets, visible focus, Lenis only, no scroll-jacking on touch.

## Round 3 notes for Sonnet (QA later)
- New files: react.js/css (pointer fields, washes, characters), play.js/css (heading words, hover families), and nine sections:
  accred, types, quiz, team, before, sectors, survey, care, advice (each has html in sections/, plus css and js).
- Check at 1024 to 1439: the .fr-safe foreground pieces must not touch text; move or drop any that do.
- Check edges: sections now use overflow-x:clip so the roof-shaped top edges show; confirm no horizontal overflow at 8 widths.
- Check the quiz end to end (fills #f-notes and the issue tag), the before/after range with keyboard, types and care tabs with arrows.
- Check the canvas fields stay smooth (one active at a time); lower counts in react.js if a section drops frames.
- Design options panel has no rows for the nine new sections yet; add variants later if wanted.

## Round 4 (owner feedback) done by Opus
- Cursor trail: default is now a soft short line with the odd themed piece on quick flicks (?cur=soft). Busier trails kept as ?cur=full.
- Pointer fields dim to 30% while the pointer is over text; "How it works" chalk lines calmer (4 lines max, smaller radius).
- Leak tour (#where): stop counter, and for each stop "You might notice", "Usual fix" and a "Sounds like mine" link.
- Plain sections upgraded: FAQ drawing board (scene per question, hover previews), problem photo loupe and hand-drawn notes,
  project "day by day" drawing with six day buttons.
- Roofer companion (companion.js, ?pal=on|off): leans in at sections with a prop and a tip; eyes follow the pointer; Hide button.
- Team section hidden by default (?team=on shows it); intended for a separate team page later.
- Two or three versions for every new section; Versions tool rewritten (current section, A/B/C, open in new tab);
  deliver/roofing-options.html = pictures of every version (rebuild with: python3 tools/gallery.py deliver/roofing-master-v3.1.html deliver/roofing-options.html).
- Hero smoke parts around the pointer; footer windows light up for the evening.
## Round 4 checks for Sonnet
- Companion must never cover the form, the mobile bar or the Versions button; check at 1024 to 1920.
- FAQ board scenes at 960 to 1100 wide (sticky column), the loupe at the edges of photos, day-by-day buttons on phones.
- Where tour: the expanded current row shifts the rows below while pinned; check it reads well at 1000 to 1440.

## Round 5 (deep pass) done by Opus
- Full tours at 390 and 1440 looked at screen by screen. Fixed: companion lingering and covering text (now hides when its
  section leaves, smaller, half-peek under 1400 wide, skips spots with text, quiet "..." bubble when the tip would cover text),
  accreditation row wrapping on desktop (CSS order bug), long service list on phones (tighter cards), badges 2-up on phones.
- Touch screens: the living fields now answer the finger (react.js TOUCH mode); no washes, umbrella or lamp on touch.
- Click on empty background drops a small handful of that section's pieces (cursor.js).
- Idle life: a small flock crosses the screen after 7 s without input (max every 25 s). Footer ladder "Back to the top".
- Backdrop drawings grow in when a section arrives (individual scale property); small idle loops on weathervane, sun rays,
  crane, question mark, leaf, aerial. Brand text-selection colour.
## Round 5 checks for Sonnet
- Touch fields: check scrolling smoothness on a real phone; drop TOUCH mode in react.js if it costs frames.
- Click bursts must never fire on controls (selector list in cursor.js pointerdown).

## Round 7 done by Opus
- "No blocks": brick textures (services, contact, projects), the services cursor tile field, the 3D roof grid field and all
  square background grids removed; Versions pill icon is now a slider icon.
- Header rebuilt: floating frosted bar, roof-peak marker under the current or hovered link, progress along the bar's foot,
  "Call us" over the number, round menu button, full-screen phone/tablet menu sheet (numbered links, Services accordion,
  call and quote buttons, hours, roofline). Services panel floats as a card on desktop.
- Repair or replace: new default "Roof through the years" (pinned; roof ages, years count, weather turns, dial swings, one card).
- Story: homeowner in the bedroom (notices, phones, waves), lightning; second version "Tap through" (?stv=2).
- Free survey band: more spacing; clipboard swing, seal stamp, roofline draw, button shine, card tilt.
- Who we work for: door swing only on the home card; landlord homes light up in turn.
## Round 7 checks for Sonnet
- Header at 1024 to 1239 (sheet mode) and 1240 to 1440 (nav fits?); mega card position; menu sheet focus order and Escape.
- Decide v7 pin with Lenis on desktop and on phones; cards hidden when not current must still be reachable by keyboard.

## Round 8 (owner feedback + full QA) done by Opus
- "What we do": brick-reveal pointer field restored (removing it in round 7 was a misread of "remove blocks"; the static
  square grids and textures stay removed).
- Header: full-width bar, transparent over the hero, frosted once you scroll; hero top padding follows the header height.
- More to discover: trust items flip for detail, hero chimney puffs on a click, areas windows light in a wave from
  Cirencester and every chimney puffs on hover or tap.
- QA, desktop (1440, 1280, 1920), tablet (820, 1024x768, 768) and phone (390, 360), each section captured, scroll scenes
  checked frame by frame, every option and interaction scripted. Fixed:
  - phone menu: tapping a link (Services, About...) closed the sheet but did not scroll (Lenis was still stopped);
    the sheet now starts under the header so long lists never slide under the logo
  - leak tour on phones and tablets: the current stop is the row just under the drawing, so its heading is always
    readable and the marker matches it
  - repair or replace (Roof through the years): the rain layer took up space under the house (empty half card);
    on wide screens the heading now rides in the pinned stage; no radio circle on the shown card
  - 3D roof on short laptop screens (1024x768): stage is one screen tall and sticky instead of stretching
  - about drawing aligned with the text on tablets; contact photo smaller on phones; footer two columns on phones;
    phone intro text one step smaller so headings lead
  - accessibility: tab roles, aria-hidden on focusable content, focus ring on decide picks, menu toggle target size
- Client build: `python3 build.py deliver/roofing-v3.1-client.html --client` leaves the Versions tool out.
