# Harmonije Panonije — client confirmation checklist

The website separates facts the client has confirmed from public or legacy
data that still needs a yes/no before it can be shown as current.

## Confirmed by the client (email, 26 September 2026)

Implemented on the site:

- The client likes the current version; the next phase is product content.
- Every syrup is built on the same base: **one third of the bottle is meadow
  honey** plus **1 dl of freshly squeezed lemon**. Fruit, vegetables,
  berries, herbs, spices and ginger give each syrup its character.
- Syrup bottles are now **7,5 dl (0,75 l)**; the earlier 8 dl size is gone.
- One bottle makes **3–3,5 l of drink**. It can be taken by the spoon
  (especially the children's syrups), diluted with warm, cold or mineral
  water, used in cocktails and cakes; dilution is to taste, and some
  syrups are best in the morning before food.
- After opening: keep refrigerated for up to a month and shake before each
  use.
- Raw materials are picked by the family or bought untreated with
  chemicals; many are of organic origin (see the open question below —
  the site does not use the word "organic").
- Since **August 2025** the family lives in **Budisava**, where both
  production and growing now happen; they started in **Novi Sad**.
- The business operates as a **porodično gazdinstvo** (family farm).
- Some syrups listed on the Mali proizvođači profile are discontinued or
  have been improved.
- Better photographs and the logo will come later.

## Catalogue as shown now

Shown as confirmed, because the client's own label photos show them
(`onLabel()` in `src/data/siteContent.ts`):

| Product | Line on label |
| --- | --- |
| Lavanda · matičnjak | Craft sirupi |
| Šargarepa · ananas · kurkuma | Immuno craft |
| Kopriva · moringa | Immuno craft |
| Matičnjak · zdravac · kopriva · menta | Craft sirupi |
| Šipurak · kajenska paprika | Craft sirupi |
| Crna zova | Immuno craft |
| Đumbir | Craft sirupi |

Still listed, but marked as awaiting confirmation in the data
(`toConfirm()`, `clientConfirmed: false`). On the site every card, confirmed
or not, carries the same neutral "Dostupnost po upitu" badge, because
availability is seasonal and settled per inquiry anyway:

- Divlja kupina, Jabuka (syrups)
- Cvet zove · đumbir (ginger line)
- Immuno Booster jars: Kurkuma · đumbir; Divlja kupina · moringa;
  Cvekla · šargarepa · jabuka · rogač

Removed: the separate "Sokovi" (juices) category. Nothing in the email or
the photos shows juices as a current product.

## Open questions for the client

1. **Range:** are Divlja kupina, Jabuka, Cvet zove · đumbir and the three
   Immuno Booster jars still made? Any new syrups to add? Which Mali
   proizvođači syrups are discontinued, and which were improved (new names
   or ingredients)?
2. **Immuno Booster jars:** jar size/weight, how they are used and stored.
   The site currently shows only "tegla".
3. **Children and mornings:** which syrups are recommended for children by
   the spoon, and which are best in the morning before food? The site
   repeats the general advice without naming products.
4. **Organic origin:** may the site say that ingredients are of organic
   origin, and for which products? In Serbia "organski" is a protected term
   tied to certification, so the site currently says only "picked by us or
   chosen untreated with chemicals". The turmeric booster label says
   "organska kurkuma"; the site lists it as "kurkuma" until this is
   answered.
5. **Juices / other lines:** do juices, Immuno Fermenta or other lines
   still exist? If yes, the category can come back.
6. **Label lines:** is the split between "Immuno craft", "Craft sirupi" and
   "Immuno Booster" intentional (different lines), or one line with two
   label generations? One booster label reads "Imunno Booster" — typo on
   the label, or intended?
7. **Category name:** is "Immuno Booster" the right public name (the old
   site used "Busteri")?
8. **Delivery:** is delivery from Budisava the same as before (Novi Sad
   area, courier, pickup)? Is pickup at the farm possible, and at what
   address/time? The site says "po dogovoru" until confirmed.
9. **Prices:** current prices per bottle and per jar. Prices stay hidden
   until confirmed (`showLegacyPublicPricing: false`).
10. **Legal data:** which gazdinstvo details (registration number, holder
    name, address) should appear in the footer?
11. **Brand assets:** the vector logo (SVG or transparent PNG), and the
    promised new photographs (products, the farm in Budisava, the family,
    the garden).
12. **Story:** is the first-person story text on the site acceptable as
    written (Novi Sad 2022 → Budisava 2025)?
13. **Contact channels:** is Instagram + phone + email still the preferred
    ordering path? Is WhatsApp or Viber used for orders?
14. **Health wording:** any health or nutrition statements they want
    published and are legally allowed to use. The site currently makes no
    health claims. The ingredient group is called "Lekovito bilje", the
    client's own wording from the email; confirm it may stay, or switch to
    plain "Bilje".

## Current prototype behaviour

- Historical public prices are stored in `src/data/siteContent.ts` but
  `showLegacyPublicPricing` is `false`.
- Delivery copy is neutral: Budisava as the origin, terms by arrangement.
- The order flow opens a pre-filled email. There is no payment or checkout.
- No WhatsApp button is included.
- No medical, prevention or organic-certification claims are used.
- The two AI-generated promotional images in the client's photo set and
  their immunity-programme headline are not used anywhere.

## Source status convention

- `CLIENT_CONFIRMED` — direct client data; highest priority.
- `PUBLIC_VERIFIED` — stable facts supported by public sources.
- `LEGACY_PUBLIC` — historical public information; must not be presented as current without confirmation.
- `CREATIVE_COPY` — brand/marketing wording, not a business fact.
- `PENDING_CONFIRMATION` — deliberately neutral until client answers.
