# Harmonije Panonije — website

Production-oriented one-page Next.js site for **Harmonije Panonije / Immuno Craft**.

The project is intentionally simple to maintain and deploy: no database, no authentication, no payment integration, no required secrets and no CMS. Business content is centralized, uncertain legacy data stays isolated, and all ordering is handled as a lightweight inquiry flow.

## Stack

- Next.js 16.3.5 App Router
- TypeScript
- React 19.3.0
- custom CSS/SVG art direction
- dependency-free scroll animation logic using `requestAnimationFrame`, transforms and opacity

The site does **not** require Three.js or a second animation framework. The macro honey sequence uses layered SVG/CSS perspective for a cinematic 3D feeling with a much smaller runtime cost.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Full pre-deploy QA

Run:

```bash
npm run qa
```

That performs, in order:

1. the project-specific verification script (`npm run verify`),
2. ESLint (`npm run lint`, zero warnings),
3. TypeScript type checking (`npm run typecheck`),
4. a real Next.js production build (`npm run build`),
5. the Playwright behavioral suite against that production build
   (`npm run test:e2e`: full matrix on Chromium plus a WebKit/Firefox
   smoke spec that runs in CI or with `PW_CROSS_BROWSER=1`; browsers install
   via `npx playwright install --with-deps chromium webkit firefox`).

`npm run qa:static` runs steps 1–4 only. `npm run test:e2e` expects a
production build to already exist (the `qa` chain builds exactly once).

You can also run the stages separately:

```bash
npm run verify
npm run typecheck
npm run build
```

## Deploy to Vercel

### GitHub method

1. Push the contents of this project folder to the root of your GitHub repository.
2. In Vercel choose **Add New → Project**.
3. Import the repository.
4. Vercel should detect **Next.js** automatically.
5. No required environment variables are needed for the site to function.
6. Deploy.

Every later push to the production branch can redeploy automatically.

### Optional canonical-domain variable

Once the permanent domain is known, you may add:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.rs
```

This is optional, but it makes canonical/structured-data URLs explicit before the final domain is attached. Vercel production URLs work without it.

Preview/local environments are configured not to invite search-engine indexing; production enables normal indexing.

Indexing switches on automatically for the Vercel production deployment (`VERCEL_ENV=production`). On any other host, set both `NEXT_PUBLIC_SITE_URL` and `SITE_INDEXABLE=1` for the production build; without them the site stays `noindex` and canonical URLs fall back to localhost.

### Vercel CLI alternative

```bash
npm i -g vercel
vercel
```

For production:

```bash
vercel --prod
```

## Where business content lives

All reusable business/product data is centralized in:

```text
src/data/siteContent.ts
```

That includes:

- brand/contact details,
- navigation,
- hero copy,
- product categories,
- all catalog entries,
- delivery text,
- testimonials/press,
- content-source statuses,
- the per-product packaging spec (`visual`) that drives the bottle/jar art,
- the "Kako se pije" usage and storage copy.

Open questions for the client live in `CLIENT-CONFIRMATION.md`, not in the
data file. Products still awaiting confirmation are created with the
`toConfirm()` helper; products whose label was seen with `onLabel()`.
Update this file first when the client answers.

### Prices

Legacy public prices are retained only as internal reference and are hidden by default:

```ts
showLegacyPublicPricing: false
```

Do not expose old pricing as current. Update the product data with client-confirmed values first.

### Delivery

Production and growing moved to the family farm in Budisava in August 2025
(client email, 26 Sep 2026); Novi Sad is where the business started and the
nearest city. The `delivery` object carries that copy. Delivery and pickup
terms are still "po dogovoru" — update the object once the client confirms
concrete rules (areas, courier, pickup address/time).

## Product inquiry flow

This is **not** ecommerce and does not pretend to be checkout.

A visitor can:

1. browse/search products,
2. add multiple products without being interrupted by a drawer,
3. review quantities in the inquiry drawer,
4. optionally add name, phone and a note,
5. open a pre-filled email,
6. copy the full inquiry text,
7. call or continue through Instagram.

There is no online payment and no hidden account flow.

## Motion system

The motion hierarchy is intentional:

1. **Put pčele (BeeJourney)** — a pinned, four-chapter sequence (Priroda →
   Sastojci → Craft → Panonija). Each chapter is one finished editorial plate:
   a monumental word + lead, one engraved illustration standing on a shared
   horizon rule that doubles as the progress bar, and a chapter index.
   Chapters are selected from scroll position with hysteresis and swap with
   short time-based transitions, so every scroll position shows exactly one
   complete composition; only the horizon progress is scrubbed. The local
   bee flies between chapter perches (interruptible arc flights).
2. **Honey macro sequence** — flower → bee/nectar → honeycomb fill.
3. **Persistent page bee** — travels in the page margins between scenes,
   hands off to the local scenes, and fades out whenever it would sit on
   text or a control (occlusion test against cached document boxes).
4. **Delivery atlas plate** — the route from Budisava draws once when the
   plate enters view and the farm vignette settles; nothing on it loops.
5. **Section reveals and tactile microinteractions** — secondary only.

Performance rules:

- scroll work is throttled through `requestAnimationFrame` (one shared
  scheduler, parked when idle or off-screen),
- scroll listeners are passive; per-frame work avoids layout reads,
- animation favors transform/opacity,
- no scroll-jacking,
- no autoplay video,
- no WebGL dependency,
- phones and short landscape screens get dedicated compositions,
- `prefers-reduced-motion` (and no-JavaScript) show static, complete frames:
  the journey becomes one non-pinned plate with the full chapter index, the
  persistent bee is removed and long sequences collapse to readable states.

## Illustration system

Product art (`ProductVisual.tsx`) is drawn from each product's `visual`
spec — liquid colour, label band, fabric cap colour/pattern and label line
(Immuno craft / Craft sirupi / Immuno Booster) — so every bottle and jar
matches its real packaging without photographs. The delivery map
(`DeliveryMapArt.tsx` + `public/atlas/juzna-backa-podloga.svg`) is an
engraved atlas plate of southern Bačka projected from real coordinates
(12 units = 1 km); the relief is a separate static SVG so the inline map
stays small.

`src/components/Botanical.tsx` holds the shared, deterministic drawing
primitives (leaves, daisies, elder umbels, lemons, rosehips, poplars, comb
cells). Both the journey plates (on cream) and the ingredient plate (on
forest) use one engraved language: a single hairline weight, opaque muted
fills and hatch shading through an SVG pattern + mask — no gloss, no
gradients on objects.

## Responsive behavior

The layout has dedicated behavior for:

- phones around 360–430 px,
- tablets around 768–1024 px,
- laptops/desktops 1280–1440+ px,
- short laptop windows where the order drawer needs a compact vertical layout.

Do a final real-browser review after client photography is inserted because image crops can change the visual balance even when the layout code itself is unchanged.

## Images

Replacement folders:

```text
public/images/hero/
public/images/products/
public/images/story/
public/images/ingredients/
```

The current build uses custom SVG/CSS artwork instead of unrelated stock photography. Replace those visuals with client-approved photography/cutouts when supplied.

The photo set the client shared in September 2026 was used as a colour and
packaging reference only (label colours, cap fabrics, label lines). Most
frames are phone snapshots on mixed backgrounds, and two are AI promotional
composites that must not be published. The client wrote that better
photographs and the logo will follow.

See `docs/images.md` for the replacement map.

## Logo

The current mark is a temporary typographic treatment with an original bee/house motif. Replace the artwork inside `BrandMark.tsx` when the client supplies the official logo while preserving the outer component API/classes.

## SEO included

- Serbian Latin document language
- title/description metadata
- canonical handling
- Open Graph + Twitter social artwork
- Organization + WebSite structured data
- sitemap
- robots rules that distinguish production from previews/local
- semantic section headings and navigation anchors
- no unverified storefront address
- no Product structured data until current price/availability is confirmed

## Accessibility included

- semantic links/buttons/sections
- keyboard-operable product tabs
- visible focus treatment
- mobile-menu focus trap + Escape handling
- inquiry-dialog focus trap + Escape handling
- reduced-motion mode
- decorative artwork hidden from accessibility APIs where appropriate
- normal scrolling remains under user control

## QA report

The final source/responsive audit is documented in `QA-REPORT.md`.

## Before the client-facing launch

Read:

```text
CLIENT-CONFIRMATION.md
```

The biggest remaining content upgrade is not code: replace prototype artwork with the client's original logo and photography, and replace all legacy/unconfirmed product, price and delivery data with questionnaire-confirmed values.
