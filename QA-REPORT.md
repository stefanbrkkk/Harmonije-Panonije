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
