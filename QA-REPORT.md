# Final QA report — 20 September 2026

This file records the final pre-upload review performed on the Harmonije Panonije website source.

## Addendum — production polish pass, 21 September 2026 (branch `polish/hp-fixes`)

Scope: visual QA + motion engineering + interaction reliability across 50
tracked findings (HP-01–HP-50), verified with 10 test→inspect→fix→retest
cycles (107 browser assertions: Chromium desktop/mobile/tablet/landscape
plus a WebKit cross-engine run), axe-core (0 violations), locked-dependency
`npm ci`, and genuine Next.js production builds served over `next start`.

Notable corrections beyond the 20 September baseline:

- mobile menu is a header sibling (was covered by its own panel through a
  nested stacking context), closes by pointer/keyboard, scrolls
  independently in short viewports, and reconciles on desktop resize
- catalog expansion preserves card DOM identity and viewport position
  (panel-level scroll-anchor opt-out), animates only new cards, treats
  whitespace as empty, folds Serbian diacritics (đ↔dj), and announces a
  restrained result count
- inquiry notices carry sequence/product/quantity, pause on hover/focus,
  never steal focus, and never restore focus into hidden content; empty
  drawer CTA routes to the catalog with focus; selectable draft fallback;
  bounded inputs; quantities capped at 99; drafts intentionally reset on
  reload (no persistence)
- honey bee visibly meets the flower head, nectar travels to the stream
  origin, and a narrow-screen camera keeps the action framed; chapters use
  complementary weights with full first/last readability
- all three scroll scenes share one delta-time scheduler (view-gated,
  parks when still/hidden, static single paint in reduced motion)
- persistent-bee facing corrected to the artwork's forward direction
- reduced-motion and no-JS views expose all content in static layouts
- contrast raised to AA (muted/honey-dark tokens, honey copy, footer),
  labelled containers carry roles, hero bottle labels render real newlines
- preview deployments stay noindex/disallow even with an explicit site URL
- social artwork rebuilt with explicit column widths (verified 1200×630)
- `scripts/verify.mjs` gained 30 structural regression tripwires; prices
  publish only through per-product confirmation (`publishedPrice`)

Full cycle log, findings ledger, screenshots and raw logs are kept with
the change report; evidence paths are listed there, not in this file.
Deferred product scope (shareable filters, product URLs, extra headers,
CSP) and unresolved business approvals (prices, availability, assets in
`CLIENT-CONFIRMATION.md`) remain open by design.

## Addendum — final engineering pass (branch `polish/hp-fixes`)

Automated behavioral coverage now lives in the repository under `tests/`
(Chromium, production server via `npm run start`):

- `responsive.spec.ts` — 9 viewports, hero-local rect containment,
  150%/200% text enlargement, catalog/header/drawer fit
- `navigation.spec.ts` — routes, anchor offsets past the fixed header,
  deep-link refresh, Back/Forward
- `menu.spec.ts` — pointer/keyboard open, Escape, Tab wrap incl. close
  toggle, short-landscape internal scroll, desktop reconcile, background
  inertness, menu→drawer handoff
- `catalog.spec.ts` — tab keyboard map, search matrix (incl. đ/dj and
  whitespace), expansion DOM identity + viewport stability, tablet
  sixth-card layout, id-stable artwork
- `inquiry.spec.ts` — add/repeat/quantities/remove/clear, toast restart
  and hover pause, drawer trap/Escape/backdrop, inert background, focus
  restoration, draft fields, mailto href inspection (never navigated),
  clipboard success/rejection stubs, mobile bar
- `motion.spec.ts` — HoneyHarvest readability + geometry across progress,
  mobile framing, BeeJourney end state, rapid/reverse scroll, mid-scene
  resize, invalid-transform scan
- `reduced-motion.spec.ts` — static content, idle scheduler silence
- `no-js.spec.ts` — meaningful content without JavaScript
- `accessibility.spec.ts` — axe scans (settled, hero entrance, menu and
  drawer open, 320px) plus keyboard-only spot checks
- `seo.spec.ts` — canonical/robots/OG/Twitter/sitemap/manifest/404,
  social image dimensions, no unconfirmed prices, safe external links

`npm run qa` = `verify` + `lint` (zero warnings) + `typecheck` + `build`
+ `test:e2e`, each exit-gated. Security headers (`nosniff`,
`strict-origin-when-cross-origin`, `DENY`, camera/mic/geolocation/payment
off) ship via `next.config.ts`; no enforcing CSP — documented as unsafe
for Next.js hydration without a nonce architecture. `npm audit --omit=dev`
clean at the time of this pass.

## Source and structure

- project verification script: PASS
- 30 catalog entries present: PASS
- legacy public pricing disabled by default: PASS
- local import resolution: PASS
- CSS brace balance: PASS
- duplicate static IDs: none found
- broken internal hash links: none found
- document structure in static render: 1 H1, 1 main landmark, 9 sections
- unsupported/placeholder-copy scan: PASS

## Responsive layout

The actual component markup was rendered through a temporary QA-only server-render harness with the production `app/globals.css`, then inspected in Playwright/Chromium. The harness is not included in the shipping project.

Checked viewports:

- 360 × 800 — no page-level horizontal overflow
- 390 × 844 — no page-level horizontal overflow
- 430 × 932 — no page-level horizontal overflow
- 768 × 1024 — no page-level horizontal overflow
- 1024 × 768 — no page-level horizontal overflow
- 1280 × 800 — no page-level horizontal overflow
- 1440 × 1000 — no page-level horizontal overflow

Representative hero, product, story and honey-section screenshots were also visually inspected during QA.

## Motion/performance review

- persistent page bee uses passive scroll handling + `requestAnimationFrame`
- page bee now re-computes when document height changes via `ResizeObserver`
- cinematic bee scenes use transform/opacity/SVG operations rather than WebGL
- persistent bee hands off visually during local bee scenes
- mobile bee path is simplified
- reduced-motion mode removes persistent flight and collapses long sequences
- honey scene now has a deliberate static reduced-motion composition
- no autoplay video, Three.js or secondary animation framework

## Inquiry flow

- product add is non-blocking
- toast confirms additions
- quantities can be increased/decreased/removed
- optional name/phone/note fields feed the prepared inquiry
- email link is generated without API credentials
- copy-to-clipboard includes a fallback for browsers where `navigator.clipboard` is unavailable
- phone and Instagram alternatives remain available
- no checkout/payment claim is made

## Accessibility

- skip-to-main-content link added
- keyboard product tabs
- visible focus styles
- mobile menu focus trap and Escape handling
- inquiry dialog focus trap and Escape handling
- focus restoration after overlays close
- reduced-motion handling
- semantic main/section/button/link structure

## SEO / deployment

- canonical URL support
- Open Graph / Twitter image routes
- sitemap + robots metadata
- preview/local indexing disabled; production indexing enabled
- Organization + WebSite structured data
- no unverified public street address or Product price/availability schema
- Next.js pinned to 16.3.5
- React / React DOM pinned to 19.3.0

## Historical limitation — 20 September baseline only

An earlier audit environment could not reach `registry.npmjs.org`, so `npm
install` timed out there and no genuine `next build` could be executed in
that sandbox (a semantic TypeScript pass against temporary stubs was used
instead). That limitation no longer applies: locked installs, real
production builds, the committed Playwright suite, and `npm audit` all run
in the current workflow and in CI (see `.github/workflows/qa.yml`).

Before deployment, run:

```bash
npm run qa
```

## Addendum — visual composition + motion system pass (branch `visual/art-direction`)

Redesigned sections (same palette, typography, and content architecture):

- Story art panel: layered botanical composition (sky contours, treeline,
  orchard rows with fruit dots, detailed house, field rows, elderflower
  foreground, single bee path) replacing the sparse sketch; no-JS/reduced
  static fallbacks preserved.
- BeeJourney: flower origin station, 1.12–1.35× larger stations, woven
  path with vertical range, depth washes, stage numbers, persistent
  stage captions (01–04) so the middle scroll never goes textually quiet;
  section height 190vh → 165vh.
- Ingredients: asymmetric garden with primary (med/limun) emphasis, orbit
  dots, connective flora layer, center-disk ring, translucent icon fills;
  mobile grid unchanged.
- HoneyHarvest: discrete phase timeline (establish/approach/drink/
  takeoff/carry/deposit/settle) via `phaseProgress`; real drink hold with
  folded wings, proboscis, and nectar shimmer; single continuous nectar
  path; shot-based mobile camera; comb rises into framing with the
  deposit; chapters aligned to actions; stronger bee silhouette.
- Reveals: per-section local order (never global index), translate-only
  motion (headings stronger, media with subtle scale), no opacity fades.
- PageBee: `data-page-bee="hide"` exclusions (story, ingredients,
  delivery, kontakt) with damped fades; corrected facing preserved.
- Delivery: contours, Dunav label, origin halo, route drift, sprig,
  compass, legend intact; no invented coverage.
- Header clearance from one variable (`--header-height` +
  `--anchor-clearance`); clipboard timer race fixed (owned ref timer).

Tests: 47 Chromium assertions + 8 WebKit/Firefox smoke assertions,
axe fully-empty scans (incl. mid-reveal and 320px menu/drawer), dense
honey sweep (0.05 steps, teleport bounds, drink geometry <70px,
camera stillness, reverse recovery), journey captions, bee exclusions,
idle scheduler silence, header-relative anchor clearance at 7 viewports,
fresh-server default, QA CI workflow, 30+ verify tripwires.

## Addendum — motion-stability / responsive-composition / readability pass

Base: `86745f5` (verified HEAD == origin/main before editing). No push,
no deploy, no claim/pricing/inquiry changes.

Fixes (before → after, browser-measured):

- Reveal: trailing comma invalidated generic transition (0s, abrupt).
  Now `transition: translate .7s ... var(--reveal-delay,0ms)` → 0.7s.
- Honey chapters: A/B 0.502/0.497 superimposed at 26.5%. Sequential
  handoff (A out .27–.285, B in .285–.305; B out .60–.62, C in .62–.64)
  with exit lift → A=1.0/B=0 at 26.5%; equal-opacity stacking impossible
  outside single-point switches. Drink hold and phases untouched.
- Landscape: active chapter top −39px (behind 82px header) at 844×390.
  Short-landscape chapters now top-align below the header with no
  translate centering → top 92px, bottom 264px at 844×390; verified at
  844×390, 844×430, 768×390.
- Stream→comb: 28px gap at 87.3% (1440×900), worse at lower vh
  (bottom-anchored comb vs centered macro: −62px at 1280×720).
  Stream extended to the comb, comb rises 8px in deposit, comb
  top-anchored to the macro's 50% basis on desktop → gap exactly 0 at
  1440×900, 1280×800, 1280×720. Mobile/landscape framing unchanged.
- Ingredients 1024px: two overlap pairs confirmed. ≤1080px now uses a
  3-column grid (was absolute) → zero overlaps; desktop constellation
  (>1080px) and mobile grids untouched.
- PageBee: `progress > 0.985` beat `excluded === 1` → bee 0.25 in
  #kontakt at end. Exclusion now wins → 0. Footer fallback (0.25)
  retained where no dedicated art exists.
- Journey caption overlapped intro (108–137px vs 121–458px). Caption is
  bottom-anchored (clear of intro and outro); SVG station labels
  deduplicated to unique 01–04 (berry/leaf repeats removed).

Verified intentional, unchanged: mobile flower framing (95% visible,
7px edge bleed, bee fully visible — shot camera kept), product-bee
path (crosses body copy at rest but clears search/tabs/controls, no
overflow — brand motion kept), story frame labels (1.11:1 but
aria-hidden decorative, exempt; note text 4.97:1 passes AA).

Tests: 58/58 Chromium + 8/8 WebKit/Firefox smoke, axe clean,
`verify`/`lint`/`typecheck`/`build` exit 0, `npm audit --omit=dev`
clean, `git diff --check` clean. New: reveal duration, handoff
non-equality (0.265/0.30/0.61/0.63), stream contact ±tolerance,
landscape clearance ×3, caption clearance, kontakt-320 exclusion,
mobile drink framing, bee-vs-controls, 1024 non-overlap, stored-pose
reverse comparison (drink bee + chapters), comb in dense sweep,
844×430 + 768×390 overflow.

## Addendum — final motion-debugging + art-direction pass (HoneyHarvest root cause)

Base: `472a279` (verified HEAD == origin/main, tree clean). No push,
no deploy, no mailto/tel/social/press activation, no submissions,
no claim/pricing/inquiry changes.

ROOT CAUSE (Round 1 diagnostics, browser-measured): settled-state
tests could not see it — all four defects are transient-only.
(a) 37 wing sign-flips per 100 scroll steps: `sin(progress*140)`
aliased into strobing at real scroll speeds. (b) Proboscis opacity
1.0 at f=0.44–0.45 while takeoff already moved the bee (drinkHold
ran to ~0.50, takeoff started 0.44). (c) Double smoothing: 42 comb
cells showed fill 0.16 when scroll state demanded 0.43 (CSS
transitions chasing the damped scheduler; `--honey-fill` itself
lagged ~7 frames). (d) Frame jank p95 63.7ms / max 109ms through
drink/deposit with zero JS longtasks (style/compositor cost).

ARCHITECTURE (one owner per property): pose is a pure function of
scroll progress (damped once by the scene scheduler); wing/shimmer
flap PHASE is wall-time (flapT accumulator) so fast scroll cannot
alias it; zero CSS transitions on any scroll-scrubbed value
(comb cells, drop); bee/drop/stream/comb share viewBox units.

TIMELINE (final): establish 0–.08, approach .08–.28, LAND .28–.31,
DRINK .31–.40, RETRACT .40–.45, takeoff .45–.53, carry .53–.70,
align .70–.77, pour+fill .77–.90, settle .90–1. Proboscis fully
retracted exactly at takeoff start (parked mapping reads 0 at .45).

COMB: 42 transition-chasing HTML cells → one SVG comb in-scene
(static wood/hex/gloss + ONE animated gold rect). Deposit contact by
construction (stream end (588,366) on surface line). Profile after:
p50 16.7ms / p95 17.5ms / max 26.5ms, no longtasks. Desktop
overflow camera pans flower→pour framing once per pass during
align; scene edges get a soft mask so artwork never hard-clips.

BEEJOURNEY: intro exits by 18% (no ghost); house floor 0.12→0.45;
landmark scales rebalanced (1.35/1.3→1.15–1.22); foreground field
band grounds the panorama; caption is rule+text only (landmark
numbers are the single system), bottom-centered on desktop,
bottom-left rail in short landscape, handed to outro at mobile end;
mobile camera is 3 intentional shots (no bee-chasing).

REVEALS: semantic role bases (heading 0 / lead 40 / copy 70 /
media 100 / detail 150) + local order, capped 200ms, still
translate-only. REDUCED MOTION: routeDrift explicitly disabled;
perpetual-animation test added (wings/route/hero/halo all none).

TESTS: new `tests/honey-transient.spec.ts` (fine 0.01 sweep, 0.005
critical zones, parked slow-mapping with analytic bounds, retract
proof incl. parked 0.45, exact parked reverse equality, jumps +
mid-scene resize) separate from settled suites. Reverse equality
required removing bee breathing (±1.2 units broke exactness) and
parsing pose from attributes (bboxes include flapping wings).

Full chain: `npm ci` 0, `npm run qa` 0 (67/67 Chromium, incl. all
protected functionality), WebKit/Firefox 8/8, audit 0 vulns,
`git diff --check` clean. Two full-suite runs each showed ONE
flaky timing assertion in untouched `tests/inquiry.spec.ts`
(different test each time; 10/10 green in isolation, 60/60 green
without the transient spec, 12/12 transient+inquiry green) —
environmental suite-load flakiness, no code overlap with this diff.

## Addendum — design-direction + production-hardening pass

Base: `59bd2e1` (verified HEAD == origin/main, tree clean). No push,
no deploy, no external-link activation, no submissions, no business
data changes. Baseline before edits: 67/67 Chromium, audit clean.

DIRECTION: "Panonian botanical editorial" — paper/ink/forest/honey/
sage/restrained berry, hairline rules, serif + small caps, layered
fills (8–22% active, 4–10% background). Mechanics from tracing-beam
research (faint full route + honey progress), never its neon look.

BEEJOURNEY (panorama, not icons): 4 stage vignettes (origin cluster /
lemon branch + berry stem + herb / smaller drop + stem + vessel arc +
wash / Story-vocabulary house + garden + fence), horizon + orchard
row + field band (foreground/midground/background), normalized focus
(active 1.0/scale 1.03, rest at floors), tracing route (base 14% +
honey progress, doorstep destination), bee ×1.25, intro exits by 18%,
rail (4 annotated stages + tracer, 220ms active transitions) with
per-form-factor placement, outro payoff.

INGREDIENTS (atlas, not radar): 12-col grid (primaries span 6, seal
band 4–10, 3+2 supporting), catalog numbers locked to titles in DOM
reading order, H+P embossed seal (incomplete ring + sprig), 7
upgraded specimen illustrations, hover (wash + brighten + 3px lift,
siblings to .9) + pointer spotlight (fine-pointer, no reduced
motion), tablet/phone/tablet-small responsive tracks. Fits cleanly;
no accidental cropping.

HONEYHARVEST: re-tested aggressively (16/16 transient + settled),
architecture untouched — one geometry improvement found by testing
(desktop overflow camera + soft scene-edge mask).

OTHER: semantic reveal roles; routeDrift disabled under reduced
motion + perpetual-animation test; caption→rail test migration;
single-point handoff gap documented (mid-flight readability is a
parked property; jumps test asserts finite + parked recovery).

Final: `npm run qa` 0 (68/68 Chromium), WebKit/Firefox 8/8, audit
0 vulns, `git diff --check` clean. ~50 screenshots reviewed (bursts,
11-viewport matrix, journey/ingredient states, adversarial sweep).

## Addendum — surgical redesign of BeeJourney + Ingredients

Scope: `BeeJourney.tsx`, `IngredientsSection.tsx`, `globals.css`,
`verify.mjs` tripwires only. No other section touched; no HoneyHarvest
changes; no business-data changes. No push/deploy.

BEEJOURNEY: scattered bare stage numbers became systematic
number+name lockups (01 PRIRODA … 04 PANONIJA); tracing route
thinned to 1.6px/65% so it guides instead of dominating. Architecture
(focus system, rail, shots, intro pacing) proven good and kept.

INGREDIENTS: apothecary corner stamps (small serif numerals,
top-right, 8% opacity) give the supporting rows editorial rhythm
without noise — after rejecting an oversized ghost-numeral pass that
read as cheap. Marker/reading order, seal, hover, spotlight unchanged.

Validation: `npm run qa` 0 (68/68 Chromium, zero test modifications
required), WebKit/Firefox 8/8, audit 0 vulns, `git diff --check`
clean. Before/after matrices at 1440/1024/390/844 (+320/768/1280
spot checks) reviewed side by side.

## Addendum — fundamental recomposition of BeeJourney + Ingredients

Scope: `BeeJourney.tsx`, `IngredientsSection.tsx`, `globals.css`,
`verify.mjs` only. HoneyHarvest and every other section untouched
(byte-identical). No push/deploy, no business-data changes.

BEEJOURNEY (environment, not icons): origin thicket (bloom + second
blossom + grasses + fruit), bridge stem S-joining the extended lemon
branch, twin berry canes, craft clearing (honey ribbon + suspended
drop + vessel + wash), homestead (sun disc, orchard row, ground
contour, extended fence), edge-bleeding foreground fragments,
ground-hugging route ending at the doorstep, bee ×1.4. Rail survived
with collision-proof placement (verified by test at 1440 + 1280).

INGREDIENTS (table, not radar): staggered heroes (honey 7 cols,
lemon 5 cols offset), compact seal chapter-break band, varied
supporting treatments (horizontal fruit/herbs, compact ginger),
redrawn editorial illustrations with semantic colors, ghost-leaf
depth, hover tick extension, phone alternation. Fixed during
iteration: grid-span arithmetic (3+4+5), specificity-qualified
responsive overrides, ghost overflow, phone seal stacking.

Validation: `npm run qa` 0 (68/68 Chromium), WebKit/Firefox 8/8,
audit 0 vulns, `git diff --check` clean. ~40 further screenshots
across 3 journey + 3 ingredient visual iterations.

## Addendum — ground-up redesign of BeeJourney + Ingredients, full-site audit (23 September 2026)

Scope: the two rejected sections were rebuilt from scratch (new concept,
markup, artwork, CSS, choreography); every other section was audited and
only concrete, reproduced defects were fixed.

BEEJOURNEY — "Put pčele": four chapters on one Panonian horizon. Each
chapter is a finished plate (lead + monumental word lock-up, one engraved
illustration standing on the horizon rule, which is also the progress
bar; four-step index beneath). Chapter selection from scroll with
hysteresis (±0.012), time-based swaps (mask-slide word, plate
cross-fade), interruptible arc flight for the local bee. Dedicated
portrait (text on top, plate on the horizon) and short-landscape layouts.
No-JS / reduced motion: one static, non-pinned frame (final plate + full
index) via `@media (scripting: none), (prefers-reduced-motion: reduce)`.

INGREDIENTS — one apothecary still-life plate (honey jar with the house
label, comb chunk, dipper, lemon branch, cut and whole lemon) captioned
with the two foundations under specimen ticks, plus a typographic
herbarium index of the five flavour layers (Latin set inline after each
name: pharmacopoeia names for the foundations, genus names in the order
of each Serbian list for the layers). Server component; fits one
viewport at 1440×900, 1280×800 and 1024×768.

To confirm with the client before launch: the Latin references
("Mel", "Citri succus", "Rosa canina", the genus lists), the new chapter
leads and the ginger note ("srce naših sirupa sa đumbirom") are
editorial copy written for this redesign, not supplied by the brand.

Shared: `Botanical.tsx` drawing primitives (one engraved language:
hairline, opaque muted fills, hatch shading via SVG pattern + mask),
`typography.ts` (Serbian short-word / dash / separator binding),
`plural.ts` (Serbian count agreement for screen-reader labels).

Full-site audit fixes (each reproduced first):
- inquiry drawer focus trap leaked to <body>/skip link (closed <details>
  textarea counted as last stop; summary missing) and stuck on Shift+Tab;
  focus now rescued after "Obriši sve" / removing the last item; double
  scrollbar compensation (7.5px shift) removed; copy-timer cleanup bug
- mobile menu close icon was cream-on-cream at page top; inert header
  "Poruči" hidden while the menu is open; menu links in a <nav>; compact
  landscape menu
- HoneyHarvest: inactive chapters were `visibility:hidden` (unreachable
  for screen readers) → opacity only; chapter measure now derived from
  the gap to the macro column, so headings no longer run into the flower
  (was 21–52px at 1440×900, worse at 1920)
- persistent page bee sat on product titles, intro copy and proof
  headings → margin route + occlusion fade against cached content boxes;
  no per-frame layout reads; no pre-JS flash; no end-of-page smudge
- focus indicator contrast (1.2–1.4:1 on light grounds) → two-tone ring;
  search/drawer inputs got strong focus cues; tabs use an inset ring;
  focus scrolling clears the fixed header and the phone order bar
- `--shell` used 100vw (with scrollbar-gutter: stable → ~10px gutters on
  classic-scrollbar desktops) → 100%
- hero bottle group overflowed to one side at ≤390px (third bottle
  cropped at 320/360) → grid-item min-width fix
- 200% text: rem-based display minimums clipped/split words (hero, final
  CTA, journey word) → vw caps
- drawer unusable on landscape phones → single scrolling sheet ≤600px
  tall; header legible without JavaScript; story caption was invisible
- a11y copy: distinct "Dodaj … u upit" names, correct Serbian plurals,
  permanent live region for the add-to-inquiry toast, focus restored
  when the toast is dismissed by keyboard, search empty state quotes the
  visitor's own text and returns focus to the field
- SEO: typed Brand in JSON-LD, apple-touch icon, NEXT_PUBLIC_SITE_URL
  normalised (a value without protocol previously crashed the build)
- lint now enforces zero warnings as documented

Tests: new `journey.spec.ts` (checkpoints, reverse/jumps/interrupted
flights, hysteresis, 9-viewport collision geometry, mid-scene resize,
deep link) and `ingredients.spec.ts` (hierarchy, one-viewport fit,
9 viewports × 100/150/200% text); strengthened drawer-trap, keyboard
journey, SEO, catalog, menu and page-bee occlusion tests; cross-engine
smoke extended to both redesigned sections. Selector-bound tests of the
removed markup were replaced by behaviour-level equivalents.

## Addendum — second audit pass (23 September 2026)

Three independent audits (code, browser/visual at 9 viewports incl. 200%
text, no-JS and reduced motion, and per-frame scroll-motion tracing) were
run against the merged build. Every fix below was reproduced first.

- Journey: a jump or fast sweep across chapters slid the skipped words
  through the word slot (stacked type for ~130–260 ms). Skipped and
  swept-past chapters now change side without travelling; a new test fails
  on the old code and passes now.
- Shared scene loop: a jump from far away painted ~3 stale frames before
  snapping (IntersectionObserver is async) → synchronous proximity check on
  scroll; the loop no longer parks while a scene is still fading.
- Page bee: froze half-faded over body copy (loop parked mid-fade); pulsed
  over product cards on phones; sat on the journey index as the pinned frame
  left → busy-aware parking, clear-time hysteresis, whole cards protected on
  phones, handoff kept while the pinned frame is on screen.
- Honey section: chapters overlapped without JavaScript → static stacked
  layout; copy ran over the flower at 1024×768 and 844×390 → measure ends
  before the scene column.
- 200% text on phones: delivery section overflowed the page (649 px wide),
  product cards split words → capped display type, shrinkable grid column,
  cards stack when narrower than 18em; journey index capped (decorative).
- Header blur was dropped by the CSS minifier (only the -webkit- rule
  survived) → single unprefixed declaration, prefixed at build.
- Drawer and toast used 100vw and overflowed the reserved scrollbar gutter
  on narrow classic-scrollbar windows → 100%.
- Keyboard focus could land behind the phone order bar → scroll-padding.
- Catalog: search finds matches in other categories (one-click switch
  keeping the query); tabs are a 2×2 grid on phones (no hidden 4th tab).
- Menu links move focus to their destination; focus restoration never
  scrolls; clipboard falls back to the legacy copy path on rejection;
  CRLF mailto with a length cap and a paste hint; quantity cap disables +;
  counts announced as pieces; drawer labels include the volume.
- Lookbehind-free typography regex (Safari < 16.4 parse error took down
  the cart there); verify.mjs now guards it, checks every in-page link and
  the honey no-JS fallback.
- Indexing on hosts other than Vercel: SITE_INDEXABLE=1 (see README).

Left for the client: "Busteri" vs "Boosteri" spelling; "Lekovito bilje"
wording (possible health connotation); footer year updates on redeploy.
Not changed (protected HoneyHarvest choreography): the brief copy gap at
two exact scroll positions, the fast catch-up swoop on large in-section
jumps, and comb cropping at the right edge during the pour at ≤1024 px.

## Addendum — client email, Budisava atlas map, third audit (26 September 2026)

Input: the client's email of 26 September 2026 (see `CLIENT-CONFIRMATION.md`)
and their photo set. Discovery ran as parallel design, content and audit
agents; every audit finding was re-reproduced by an independent verifier
before it was fixed (94 confirmed, 11 rejected).

Client content, implemented:

- Syrups are 0,75 l everywhere (catalogue, drawer, mailto, metadata, social
  image). verify.mjs now fails if the old volume string comes back.
- Base recipe stated plainly: one third meadow honey + 1 dl squeezed lemon
  (hero caption, honey scene, ingredients plate, catalogue note).
- New "Kako se pije" strip in the catalogue: 3–3,5 l of drink per bottle;
  by the spoon, with warm/cold/mineral water, in cocktails and cakes,
  mornings before food; storage (fridge up to a month, shake before use).
- Budisava is the home of production and growing since August 2025, Novi
  Sad is where it started: hero eyebrow, story (first person, timeline),
  delivery copy, footer, meta description, JSON-LD (address Budisava 21242,
  foundingLocation Novi Sad), manifest, OG image.
- Catalogue realigned with the real range: 13 products in three
  categories. Seven match the client's current labels; six stay listed with
  the "to confirm" badge. The 0,3 l juice family is removed (no current
  label or mention). Boosters are named "Immuno Booster" consistently.
- Product art redrawn as packaging-true SVG (gable-house label, label line,
  band colour, gingham/plain/linen fabric cap, twine) from a per-product
  spec; the photo set was used only as colour reference. The AI promo
  composites and their immunity headline are not used.

Delivery map: replaced the pastel blob widget with an engraved atlas plate
of southern Bačka (real projection, 12 units = 1 km): Danube and Tisa,
Novi Sad as a hatched city, poplar rows, the farm vignette in Budisava, a
route that draws once, north arrow, scale bar, coordinates, and an HTML
legend. Container-query crop tiers keep labels ≥ 8 px at every width.

Audit fixes (highlights): hero headline no longer breaks inside a word at
≥1700 px; journey multi-boundary jumps land on the right chapter and
skipped chapters never slide through the word slot; honey scene frames the
whole comb during the pour at mid-size desktops (comb-aware camera pan)
and no longer shows all chapters before hydration; final-CTA bee redrawn
and moved off the headline; drawer fits at 200 % text; toast never covers
the focused control (WCAG 2.4.11); add/quantity/remove controls carry
their visible text in the accessible name (WCAG 2.5.3); 44 px tap targets;
contrast fixes; decorative loops pause off-screen; mobile menu fades out;
header is solid before hydration on deep links; self-hosted Gelasio as the
fallback serif (Georgia metrics, Serbian Latin glyphs); favicon.ico and
192/512 PNG manifest icons; unused CSS selectors removed.

Deliberately not changed: the per-frame scroll read/write refactor (no long
tasks measured; high risk to tuned scenes), the OG image serif font, and
the phone availability-badge wording (client decision).
