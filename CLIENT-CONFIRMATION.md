# Harmonije Panonije — client confirmation checklist

The website intentionally separates stable public facts from legacy/public data that must be confirmed before production launch.

## Must confirm

- Current product range and seasonal availability
- Current flavors / discontinued flavors / new flavors
- Current prices
- Current delivery and pickup rules
- Preferred ordering channel: email, Instagram, phone, another channel
- Whether WhatsApp or Viber is actually used for orders
- Current production process
- Current ingredient sourcing
- Any nutrition or health claims they explicitly want published and are allowed to use
- Client-approved founder story/copy
- Legal/business information they want displayed
- Original logo / SVG / transparent PNG assets
- Original product, founder, garden and production photographs

## Current prototype behavior

- Historical public prices are stored in `src/data/siteContent.ts` but `showLegacyPublicPricing` is `false`.
- Delivery copy shown publicly is neutral: contact the producer to arrange the easiest option.
- The order flow sends a pre-filled email. There is no payment or checkout.
- No WhatsApp button is included.
- No medical/prevention claims are used.

## Source status convention

- `CLIENT_CONFIRMED` — direct client data; highest priority.
- `PUBLIC_VERIFIED` — stable facts supported by public sources.
- `LEGACY_PUBLIC` — historical public information; must not be presented as current without confirmation.
- `CREATIVE_COPY` — brand/marketing wording, not a business fact.
- `PENDING_CONFIRMATION` — deliberately neutral until client answers.
