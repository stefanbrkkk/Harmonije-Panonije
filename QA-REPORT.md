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

## Environment limitation

The sandbox cannot currently reach `registry.npmjs.org`, so `npm install` times out here. Because of that, the real framework packages could not be installed and a genuine `next build` could not be executed inside this environment.

A semantic TypeScript pass against temporary framework type stubs succeeded after the final edits. The project also exposes `npm run qa`, which performs the real project verification, TypeScript check, and Next.js production build once dependencies are installed on a normal machine or by Vercel.

Before deployment, run:

```bash
npm install
npm run qa
```
