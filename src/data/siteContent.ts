export type SourceStatus =
  | "CLIENT_CONFIRMED"
  | "PUBLIC_VERIFIED"
  | "LEGACY_PUBLIC"
  | "CREATIVE_COPY"
  | "PENDING_CONFIRMATION";

export type ProductCategory = "sirupi" | "djumbir" | "busteri";

/**
 * Packaging identity for the illustrated bottle/jar, sampled from the
 * client's label photos: liquid colour, the flavour's label band, and the
 * fabric cap tied over the neck.
 */
export type ProductVisualSpec = {
  liquid: string;
  band: string;
  cap: string;
  capPattern: "gingham" | "plain" | "linen";
  line: "Immuno craft" | "Craft sirupi" | "Immuno Booster";
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  ingredients: string[];
  volume: string;
  /** Set only from client-confirmed data (see CLIENT-CONFIRMATION.md). */
  confirmedPriceRsd?: number;
  priceStatus: "hidden" | "confirmed";
  description: string;
  visual: ProductVisualSpec;
  clientConfirmed: boolean;
  sourceStatus: SourceStatus;
};

export const siteConfig = {
  // Inert by itself: publishedPrice() additionally requires per-product
  // confirmation (priceStatus "confirmed" + clientConfirmed), so flipping
  // this flag can never publish historical values as current. Publication
  // rule: only client-confirmed data ships; see CLIENT-CONFIRMATION.md.
  showLegacyPublicPricing: false,
  showTestimonials: true,
  showPress: true,
} as const;

/** Client email, 26 Sep 2026: home, growing and production in Budisava since August 2025. */
export const brand = {
  name: "Harmonije Panonije",
  productLine: "Immuno Craft",
  location: "Budisava",
  region: "Vojvodina",
  postalCode: "21242",
  origin: "Novi Sad",
  legalForm: "porodično gazdinstvo",
  since: "2022",
  status: "CLIENT_CONFIRMED" as SourceStatus,
};

export const contact = {
  phoneDisplay: "063 727 4392",
  phoneHref: "+381637274392",
  email: "harmonijepanonije@gmail.com",
  instagramHandle: "@harmonije_panonije",
  instagramUrl: "https://www.instagram.com/harmonije_panonije/",
  facebookLabel: "Harmonije Panonije",
  facebookUrl: "https://www.facebook.com/61552901584427/",
  sourceStatus: "PUBLIC_VERIFIED" as SourceStatus,
};

export const navigation = [
  { label: "Proizvodi", href: "#proizvodi" },
  { label: "Naša priča", href: "#prica" },
  { label: "Sastojci", href: "#sastojci" },
  { label: "Dostava", href: "#dostava" },
  { label: "Kontakt", href: "#kontakt" },
];

export const hero = {
  eyebrow: "Budisava · Vojvodina",
  headline: "Harmonija prirode u svakoj flaši.",
  subheadline:
    "Ručno pravljeni Immuno Craft sirupi i Immuno Booster tegle sa livadskim medom, ceđenim limunom, sezonskim voćem i biljem.",
  trustPoints: ["Med · limun · voće i bilje", "Porodično gazdinstvo", "Pažljivo birani sastojci"],
  primaryCta: "Pogledaj ukuse",
  secondaryCta: "Naša priča",
  sourceStatus: "CREATIVE_COPY" as SourceStatus,
};

export const story = {
  eyebrow: "Naša priča",
  title: "Počelo je za našim stolom.",
  paragraphs: [
    "U proleće 2022. počeli smo u Novom Sadu da pravimo sirupe za svoju porodicu — od zove i bilja, uz ceđeni limun i livadski med. Ideja nije nastala iz poslovnog plana, već iz želje za jednostavnijim, pažljivo biranim sastojcima u svakodnevnoj ishrani.",
    "Pozitivne reakcije ljudi oko nas pretvorile su kućni recept u mali craft brend. Od avgusta 2025. živimo u Budisavi, nadomak Novog Sada, gde su sada i uzgoj i proizvodnja — radimo kao porodično gazdinstvo. Ukuse gradimo od sezonskog voća, povrća, bobica, lekovitog bilja, začina i đumbira, uz limun i med, a sirovine beremo sami ili biramo one koje nisu tretirane hemikalijama.",
  ],
  timeline: [
    { year: "2022", text: "Počelo kao porodični recept u Novom Sadu." },
    { year: "Zatim", text: "Preraslo u mali craft brend." },
    { year: "2025", text: "Preselili smo se u Budisavu — dom, uzgoj i proizvodnja na jednom mestu." },
  ],
  sourceStatus: "CLIENT_CONFIRMED" as SourceStatus,
};

/**
 * Honey and lemon are the foundation (`role: "base"`); everything else builds
 * the flavour on top. Base composition confirmed by the client: one third of
 * every syrup bottle is meadow honey, plus 1 dl of squeezed lemon. Latin
 * names are botanical references for the herbarium-style index
 * (pharmacopoeia names for the foundation, genus names in the order of each
 * note for the layers), not product claims.
 */
export const ingredients = [
  { name: "Livadski med", latin: "Mel", note: "Trećina svake boce — topla, cvetna osnova sirupa.", kind: "honey", role: "base" },
  { name: "Ceđeni limun", latin: "Citri succus", note: "Po 1 dl ceđenog limuna u svakoj boci sirupa.", kind: "lemon", role: "base" },
  { name: "Đumbir i začini", latin: "Zingiber · Curcuma · Capsicum", note: "Đumbir, kurkuma i kajenska paprika daju toplinu i oštrinu.", kind: "ginger", role: "layer" },
  { name: "Bobičasto voće", latin: "Rubus · Sambucus · Rosa canina", note: "Divlja kupina, crna zova i šipurak donose dubinu ukusa.", kind: "berry", role: "layer" },
  { name: "Voće", latin: "Malus · Ananas · Ceratonia", note: "Jabuka, ananas, rogač i drugo voće koje donosi sezona.", kind: "fruit", role: "layer" },
  { name: "Lekovito bilje", latin: "Lavandula · Melissa · Urtica · Mentha · Geranium · Moringa", note: "Lavanda, matičnjak, kopriva, menta, zdravac i moringa.", kind: "herb", role: "layer" },
  { name: "Povrće", latin: "Beta · Daucus", note: "Cvekla i šargarepa ulaze u odabrane recepture.", kind: "vegetable", role: "layer" },
] as const;

export const categoryCopy: Record<ProductCategory, { label: string; title: string; note: string }> = {
  sirupi: {
    label: "Sirupi",
    title: "Immuno Craft sirupi sa medom",
    note: "Voćne, biljne i bobičaste kombinacije u staklenim bocama od 0,75 l. Osnova svakog sirupa je livadski med — trećina boce — i 1 dl ceđenog limuna.",
  },
  djumbir: {
    label: "Đumbir",
    title: "Sirupi sa đumbirom",
    note: "Topliji, aromatičniji ukusi: đumbir sa limunom i medom — sam ili uz cvet zove. Boce od 0,75 l.",
  },
  busteri: {
    label: "Booster",
    title: "Immuno Booster tegle",
    note: "Gušće, koncentrisanije kombinacije u staklenim teglama — voće ili povrće, pulpa limuna i med, uz odabrane dodatke.",
  },
};

type ProductInput = Omit<Product, "priceStatus" | "clientConfirmed" | "sourceStatus">;

/** On a current (2025) label the client sent: confirmed product, price still hidden. */
const onLabel = (product: ProductInput): Product => ({
  ...product,
  priceStatus: "hidden",
  clientConfirmed: true,
  sourceStatus: "CLIENT_CONFIRMED",
});

/** Seen only on the client's May 2024 market photo: shown, but awaiting reconfirmation. */
const toConfirm = (product: ProductInput): Product => ({
  ...product,
  priceStatus: "hidden",
  clientConfirmed: false,
  sourceStatus: "PENDING_CONFIRMATION",
});

/**
 * Safe publication rule for price display (HP-45). A price publishes only
 * when the product itself carries client confirmation; no global flag can
 * promote historical values to current pricing on its own.
 */
export function publishedPrice(product: Product): number | null {
  if (product.priceStatus === "confirmed" && product.clientConfirmed && typeof product.confirmedPriceRsd === "number") {
    return product.confirmedPriceRsd;
  }
  return null;
}

/**
 * The range as it appears on the client's current labels (email and photos,
 * 26 Sep 2026). Order is the display order within each category.
 */
export const products: Product[] = [
  onLabel({ id: "lavanda-maticnjak", name: "Lavanda · matičnjak", category: "sirupi", ingredients: ["lavanda angustifolia", "matičnjak", "limun", "med"], volume: "0,75 l", description: "Mirisna, cvetna kombinacija lavande i matičnjaka sa citrusnom svežinom.", visual: { liquid: "#eec84a", band: "#a86aa8", cap: "#c7a3d6", capPattern: "plain", line: "Craft sirupi" } }),
  onLabel({ id: "sargarepa-ananas-kurkuma", name: "Šargarepa · ananas · kurkuma", category: "sirupi", ingredients: ["šargarepa", "ananas", "kurkuma", "limun", "med"], volume: "0,75 l", description: "Sunčana kombinacija šargarepe i ananasa sa toplom notom kurkume.", visual: { liquid: "#ec7c10", band: "#f08c0c", cap: "#e8742a", capPattern: "gingham", line: "Immuno craft" } }),
  onLabel({ id: "kopriva-moringa", name: "Kopriva · moringa", category: "sirupi", ingredients: ["kopriva", "moringa", "limun", "med"], volume: "0,75 l", description: "Zelena, biljna kombinacija koprive i moringe sa limunom i medom.", visual: { liquid: "#4f4a22", band: "#2d5a40", cap: "#3f7a4a", capPattern: "gingham", line: "Immuno craft" } }),
  onLabel({ id: "maticnjak-zdravac-kopriva-menta", name: "Matičnjak · zdravac · kopriva · menta", category: "sirupi", ingredients: ["matičnjak", "zdravac", "kopriva", "menta", "limun", "med"], volume: "0,75 l", description: "Biljna mešavina matičnjaka, zdravca i koprive, osvežena mentom i limunom.", visual: { liquid: "#c9bd7e", band: "#a4bf45", cap: "#e8742a", capPattern: "gingham", line: "Craft sirupi" } }),
  onLabel({ id: "sipurak-kajenska-paprika", name: "Šipurak · kajenska paprika", category: "sirupi", ingredients: ["šipurak", "kajenska paprika", "limun", "med"], volume: "0,75 l", description: "Voćni šipurak sa iskrom kajenske paprike i mednom završnicom.", visual: { liquid: "#b8381a", band: "#d7294f", cap: "#c23a58", capPattern: "gingham", line: "Craft sirupi" } }),
  onLabel({ id: "crna-zova", name: "Crna zova", category: "sirupi", ingredients: ["crna zova", "limun", "med"], volume: "0,75 l", description: "Tamne bobice zove u dubokom, baršunastom spoju sa limunom i medom.", visual: { liquid: "#2b1a1f", band: "#433d39", cap: "#8a2a3c", capPattern: "gingham", line: "Immuno craft" } }),
  toConfirm({ id: "divlja-kupina", name: "Divlja kupina", category: "sirupi", ingredients: ["divlja kupina", "limun", "med"], volume: "0,75 l", description: "Dubok bobičasti ukus divlje kupine sa limunom i medom.", visual: { liquid: "#5a0f1c", band: "#8e4987", cap: "#8a2a3c", capPattern: "gingham", line: "Immuno craft" } }),
  toConfirm({ id: "jabuka", name: "Jabuka", category: "sirupi", ingredients: ["jabuka", "limun", "med"], volume: "0,75 l", description: "Čist, poznat ukus jabuke sa limunom i medom.", visual: { liquid: "#b86e1a", band: "#a5b00f", cap: "#c8372d", capPattern: "gingham", line: "Immuno craft" } }),

  onLabel({ id: "djumbir", name: "Đumbir", category: "djumbir", ingredients: ["đumbir", "limun", "med"], volume: "0,75 l", description: "Direktna, aromatična kombinacija đumbira, limuna i meda.", visual: { liquid: "#e3b56a", band: "#c9a24a", cap: "#c8372d", capPattern: "gingham", line: "Craft sirupi" } }),
  toConfirm({ id: "cvet-zove-djumbir", name: "Cvet zove · đumbir", category: "djumbir", ingredients: ["cvet zove", "đumbir", "limun", "med"], volume: "0,75 l", description: "Cvetna nežnost zove i topla oštrina đumbira u istoj boci.", visual: { liquid: "#d29f22", band: "#d9d49c", cap: "#e6dfd0", capPattern: "linen", line: "Craft sirupi" } }),

  toConfirm({ id: "booster-kurkuma-djumbir", name: "Kurkuma · đumbir", category: "busteri", ingredients: ["kurkuma", "đumbir", "pulpa limuna", "med"], volume: "tegla", description: "Zlatna, začinska tegla kurkume i đumbira sa pulpom limuna i medom.", visual: { liquid: "#dc9414", band: "#ebc318", cap: "#e6dfd0", capPattern: "linen", line: "Immuno Booster" } }),
  toConfirm({ id: "booster-kupina-moringa", name: "Divlja kupina · moringa", category: "busteri", ingredients: ["divlja kupina", "moringa", "pulpa limuna", "med"], volume: "tegla", description: "Bobičasta tegla divlje kupine i zelene moringe sa pulpom limuna i medom.", visual: { liquid: "#6e1f35", band: "#8c2c68", cap: "#e6dfd0", capPattern: "linen", line: "Immuno Booster" } }),
  toConfirm({ id: "booster-cvekla-sargarepa-jabuka-rogac", name: "Cvekla · šargarepa · jabuka · rogač", category: "busteri", ingredients: ["cvekla", "šargarepa", "jabuka", "rogač", "pulpa limuna", "livadski med"], volume: "tegla", description: "Zemljani tonovi cvekle i šargarepe, zaobljeni jabukom i rogačem.", visual: { liquid: "#8a3b22", band: "#a51f3a", cap: "#e6dfd0", capPattern: "linen", line: "Immuno Booster" } }),
];

/** Serving and storage, from the client's email (26 Sep 2026). Syrups only. */
export const usage = {
  eyebrow: "Kako se pije sirup",
  statement: { lead: "Jedna boca,", amount: "3–3,5 litra", tail: "napitka." },
  note: "Sirup se razblažuje po ukusu i pije kad god poželite.",
  ways: [
    { key: "spoon", title: "Na kašiku", text: "Nerazblaženo, bez vode — naročito sirupi za decu; pitajte nas koji." },
    { key: "water", title: "Sa vodom", text: "Toplom, hladnom ili mineralnom — u razmeri koja vam odgovara." },
    { key: "coupe", title: "U koktelima i kolačima", text: "Za aromu u čaši, kremu ili testu." },
    { key: "morning", title: "Ujutru, pre jela", text: "Neke ukuse najbolje je piti tako — pitajte nas koje." },
  ],
  storage: "Posle otvaranja čuvajte bocu u frižideru do mesec dana. Pre svake upotrebe promućkajte.",
  sourceStatus: "CLIENT_CONFIRMED" as SourceStatus,
};

export const delivery = {
  title: "Iz Budisave do vaše trpeze.",
  visibleCopy: "Sve što pravimo nastaje na našem porodičnom gazdinstvu u Budisavi, nadomak Novog Sada. Dostavu i preuzimanje dogovaramo direktno — javite se i naći ćemo najjednostavniju opciju.",
  note: "Počeli smo u Novom Sadu, a danas su dom, uzgoj i proizvodnja na jednom mestu — u Budisavi. Za adresu, preuzimanje i termin javite nam se.",
  sourceStatus: "CLIENT_CONFIRMED" as SourceStatus,
};

export const testimonials = [
  { quote: "Kupci se vraćaju zbog ukusa Immuno Craft sirupa.", detail: "Sažetak javnih utisaka kupaca", sourceStatus: "PUBLIC_VERIFIED" as SourceStatus },
  { quote: "U javnim utiscima posebno se pominju dizajn, ukus i kvalitet.", detail: "Sažetak javnih utisaka kupaca", sourceStatus: "PUBLIC_VERIFIED" as SourceStatus },
];

export const press = [
  { label: "Mali proizvođači", href: "https://maliproizvodjaci.rs/harmonije-panonije-proizvodnja-immuno-craft-sirupa/" },
  { label: "Dnevnik", href: "https://www.dnevnik.rs/lat/novi-sad/prirodni-put-do-imuniteta-proizvodi-harmonije-panonije-pruzaju-zdrava-resenja-bez-kompromisa-2024-12-29" },
];
