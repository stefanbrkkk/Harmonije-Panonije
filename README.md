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

1. the project-specific verification script,
2. TypeScript type checking,
3. a real Next.js production build.

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
- pending confirmations.

Update this file first when the client completes the questionnaire.

### Prices

Legacy public prices are retained only as internal reference and are hidden by default:

```ts
showLegacyPublicPricing: false
```

Do not expose old pricing as current. Update the product data with client-confirmed values first.

### Delivery

Update the `delivery` object after the client reconfirms the current Novi Sad / pickup / courier policy. The visible website deliberately uses neutral wording until then.

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

1. **Persistent page bee** — follows document scroll across the narrative.
2. **Ingredient-to-house bee scene** — the persistent bee visually hands off to the local cinematic scene rather than competing with it.
3. **Honey macro sequence** — flower → bee/nectar → honeycomb fill.
4. **Section reveals and tactile microinteractions** — secondary only.

Performance rules:

- scroll work is throttled through `requestAnimationFrame`,
- scroll listeners are passive,
- animation favors transform/opacity,
- no scroll-jacking,
- no autoplay video,
- no WebGL dependency,
- mobile paths/scenes are simplified,
- `prefers-reduced-motion` removes the persistent bee and collapses long cinematic sequences to static/readable states.

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

See `public/images/README.md` for the replacement map.

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
