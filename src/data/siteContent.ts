export type SourceStatus =
  | "CLIENT_CONFIRMED"
  | "PUBLIC_VERIFIED"
  | "LEGACY_PUBLIC"
  | "CREATIVE_COPY"
  | "PENDING_CONFIRMATION";

export type ProductCategory = "sirupi" | "djumbir" | "busteri" | "sokovi";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  ingredients: string[];
  volume: string;
  legacyPriceRsd?: number;
  priceStatus: "hidden" | "confirmed" | "legacy";
  available: boolean | null;
  featured: boolean;
  image?: string;
  alt: string;
  description: string;
  clientConfirmed: boolean;
  sourceStatus: SourceStatus;
};

export const siteConfig = {
  showLegacyPublicPricing: false,
  showTestimonials: true,
  showPress: true,
} as const;

export const brand = {
  name: "Harmonije Panonije",
  productLine: "Immuno Craft",
  location: "Novi Sad, Srbija",
  since: "2022",
  status: "PUBLIC_VERIFIED" as SourceStatus,
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
  eyebrow: "Novi Sad · od 2022.",
  headline: "Harmonija prirode u svakoj flaši.",
  subheadline:
    "Ručno pravljeni Immuno Craft sirupi, sokovi i busteri sa livadskim medom, ceđenim limunom, voćem i biljem.",
  trustPoints: ["Bez dodatog šećera", "Craft proizvodnja", "Pažljivo birani sastojci"],
  primaryCta: "Pogledaj ukuse",
  secondaryCta: "Naša priča",
  sourceStatus: "CREATIVE_COPY" as SourceStatus,
};

export const story = {
  eyebrow: "Naša priča",
  title: "Počelo je za našim stolom.",
  paragraphs: [
    "U proleće 2022. Anita i Laslo Toth počeli su u Novom Sadu da prave sirupe za svoju porodicu — od zove i bilja, uz ceđeni limun i livadski med. Ideja nije nastala iz poslovnog plana, već iz želje za jednostavnijim, pažljivo biranim sastojcima u svakodnevnoj ishrani.",
    "Pozitivne reakcije ljudi oko njih pretvorile su kućni recept u mali craft brend. Deo priče vezan je i za porodično imanje u Budisavi, nadomak Novog Sada, sa voćnjakom, biljem i zovom. Danas se ukusi Harmonija Panonije grade spajanjem voća, bobica, povrća, đumbira, bilja, limuna i meda — u kombinacijama koje ostaju prepoznatljivo njihove.",
  ],
  timeline: [
    { year: "2022", text: "Počelo kao porodični recept." },
    { year: "Zatim", text: "Preraslo u mali craft brend." },
    { year: "Danas", text: "Ukusi se grade kroz sklad voća, bilja, limuna i meda." },
  ],
  sourceStatus: "PUBLIC_VERIFIED" as SourceStatus,
};

export const ingredients = [
  { name: "Livadski med", note: "Topla osnova i potpis velikog dela ponude.", kind: "honey" },
  { name: "Ceđeni limun", note: "Svežina koja povezuje brojne kombinacije.", kind: "lemon" },
  { name: "Đumbir", note: "Oštriji, aromatični sloj za posebnu liniju sirupa.", kind: "ginger" },
  { name: "Bobičasto voće", note: "Kupina, malina, aronija i šipurak donose dubinu ukusa.", kind: "berry" },
  { name: "Voće", note: "Jabuka, dunja, kruška, kajsija i druge sezonske kombinacije.", kind: "fruit" },
  { name: "Lekovito bilje", note: "Nana, žalfija, kopriva, kamilica, lavanda i matičnjak.", kind: "herb" },
  { name: "Povrće", note: "Cvekla i šargarepa ulaze u odabrane recepture.", kind: "vegetable" },
] as const;

export const categoryCopy: Record<ProductCategory, { label: string; title: string; note: string }> = {
  sirupi: {
    label: "Sirupi",
    title: "Immuno Craft sirupi sa medom",
    note: "Voćne, biljne i bobičaste kombinacije u staklenim bocama od 0,8 l. Za trenutnu dostupnost pojedinačnih ukusa pošaljite upit.",
  },
  djumbir: {
    label: "Đumbir",
    title: "Sirupi sa đumbirom",
    note: "Aromatičnije kombinacije sa đumbirom, limunom i medom. Za trenutnu dostupnost pojedinačnih ukusa pošaljite upit.",
  },
  busteri: {
    label: "Busteri",
    title: "Immuno Boosteri",
    note: "Koncentrisanije kombinacije u teglicama od 320 g, sa voćem, limunovom pulpom, medom i odabranim dodacima.",
  },
  sokovi: {
    label: "Sokovi",
    title: "Immuno Craft sokovi",
    note: "Manje boce od 0,3 l sa jednostavnijim kombinacijama voća, limuna, meda i odabranih aromatičnih sastojaka.",
  },
};

const legacy = (product: Omit<Product, "priceStatus" | "available" | "clientConfirmed" | "sourceStatus">): Product => ({
  ...product,
  priceStatus: "legacy",
  available: null,
  clientConfirmed: false,
  sourceStatus: "LEGACY_PUBLIC",
});

export const products: Product[] = [
  legacy({ id: "divlja-kupina", name: "Divlja kupina", category: "sirupi", ingredients: ["divlja kupina", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: true, alt: "Ilustracija boce Immuno Craft sirupa od divlje kupine", description: "Dubok bobičasti ukus sa limunom i medom." }),
  legacy({ id: "cvekla-sargarepa-jabuka", name: "Cvekla · šargarepa · jabuka", category: "sirupi", ingredients: ["cvekla", "šargarepa", "jabuka", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce sirupa sa cveklom, šargarepom i jabukom", description: "Zemljani i voćni tonovi u jednoj upečatljivoj kombinaciji." }),
  legacy({ id: "kamilica", name: "Cvet kamilice", category: "sirupi", ingredients: ["cvet kamilice", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: false, alt: "Ilustracija boce sirupa sa kamilicom", description: "Nežna biljna aroma, limun i med." }),
  legacy({ id: "lavanda-maticnjak", name: "Lavanda · matičnjak", category: "sirupi", ingredients: ["lavanda angustifolia", "matičnjak", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: true, alt: "Ilustracija boce sirupa sa lavandom i matičnjakom", description: "Mirisna biljna kompozicija sa citrusnom svežinom." }),
  legacy({ id: "kajsija", name: "Kajsija", category: "sirupi", ingredients: ["kajsija", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: false, alt: "Ilustracija boce sirupa od kajsije", description: "Mek, voćni ukus kajsije sa limunom i medom." }),
  legacy({ id: "sipurak-jabuka", name: "Šipurak · jabuka", category: "sirupi", ingredients: ["šipurak", "jabuka", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: true, alt: "Ilustracija boce sirupa od šipurka i jabuke", description: "Voćna kombinacija šipurka i jabuke sa toplom mednom završnicom." }),
  legacy({ id: "zalfija-nana-kopriva", name: "Žalfija · nana · kopriva", category: "sirupi", ingredients: ["žalfija", "nana", "kopriva", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: false, alt: "Ilustracija boce biljnog Immuno Craft sirupa", description: "Izraženo biljna kombinacija sa osvežavajućim limunom." }),
  legacy({ id: "dunja", name: "Dunja", category: "sirupi", ingredients: ["dunja", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: true, alt: "Ilustracija boce sirupa od dunje", description: "Mirisna dunja u jednostavnoj kombinaciji sa limunom i medom." }),
  legacy({ id: "kruska-ruzmarin", name: "Kruška · ruzmarin", category: "sirupi", ingredients: ["kruška", "ruzmarin", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce sirupa od kruške i ruzmarina", description: "Voćna slatkoća kruške presečena aromom ruzmarina." }),
  legacy({ id: "aronija", name: "Aronija", category: "sirupi", ingredients: ["aronija", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 900, featured: false, alt: "Ilustracija boce sirupa od aronije", description: "Pun ukus aronije uz limun i livadski med." }),
  legacy({ id: "organska-malina", name: "Organska malina", category: "sirupi", ingredients: ["organska malina", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 1100, featured: true, alt: "Ilustracija boce sirupa od organske maline", description: "Malina, citrusna svežina i med u raskošnoj voćnoj kombinaciji." }),
  legacy({ id: "jabuka", name: "Jabuka", category: "sirupi", ingredients: ["jabuka", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 800, featured: false, alt: "Ilustracija boce sirupa od jabuke", description: "Čist, poznat ukus jabuke sa limunom i medom." }),

  legacy({ id: "dunja-djumbir", name: "Dunja · đumbir", category: "djumbir", ingredients: ["dunja", "đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce sirupa od dunje i đumbira", description: "Mirisna dunja sa toplijim završetkom đumbira." }),
  legacy({ id: "kajsija-djumbir", name: "Kajsija · đumbir", category: "djumbir", ingredients: ["kajsija", "đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce sirupa od kajsije i đumbira", description: "Voćna mekoća i aromatična oštrina u ravnoteži." }),
  legacy({ id: "djumbir-jaci", name: "Đumbir · jači", category: "djumbir", ingredients: ["đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce jačeg sirupa sa đumbirom", description: "Direktna kombinacija đumbira, limuna i meda." }),
  legacy({ id: "kurkuma-djumbir", name: "Organska kurkuma · đumbir", category: "djumbir", ingredients: ["organska kurkuma", "đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: true, alt: "Ilustracija boce sirupa sa kurkumom i đumbirom", description: "Zlatna, začinska kombinacija kurkume i đumbira." }),
  legacy({ id: "sipurak-jabuka-djumbir", name: "Šipurak · jabuka · đumbir", category: "djumbir", ingredients: ["šipurak", "jabuka", "đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: false, alt: "Ilustracija boce sirupa od šipurka, jabuke i đumbira", description: "Slojevita voćna kombinacija sa aromatičnim đumbirom." }),
  legacy({ id: "biljni-djumbir", name: "Žalfija · nana · kopriva · đumbir", category: "djumbir", ingredients: ["žalfija", "nana", "kopriva", "đumbir", "limun", "med"], volume: "0,8 l", legacyPriceRsd: 850, featured: false, alt: "Ilustracija biljnog sirupa sa đumbirom", description: "Biljni karakter pojačan đumbirom, uz limun i med." }),

  legacy({ id: "buster-kurkuma", name: "Kurkuma · đumbir", category: "busteri", ingredients: ["organska kurkuma", "đumbir", "pulpa limuna", "med"], volume: "320 g", legacyPriceRsd: 500, featured: true, alt: "Ilustracija Immuno Boostera sa kurkumom i đumbirom", description: "Koncentrisana teglica sa kurkumom, đumbirom, limunovom pulpom i medom." }),
  legacy({ id: "buster-kupina-bilje", name: "Divlja kupina · bilje", category: "busteri", ingredients: ["divlja kupina", "žalfija", "nana", "kopriva", "pulpa limuna", "med"], volume: "320 g", legacyPriceRsd: 500, featured: true, alt: "Ilustracija Immuno Boostera sa divljom kupinom i biljem", description: "Bobičasti ukus u spoju sa žalfijom, nanom i koprivom." }),
  legacy({ id: "buster-kupina-djumbir", name: "Divlja kupina · đumbir", category: "busteri", ingredients: ["divlja kupina", "đumbir", "pulpa limuna", "med"], volume: "320 g", legacyPriceRsd: 500, featured: true, alt: "Ilustracija Immuno Boostera sa kupinom i đumbirom", description: "Kupina, đumbir, limunova pulpa i med u maloj teglici." }),
  legacy({ id: "buster-aronija-malina", name: "Aronija · malina", category: "busteri", ingredients: ["aronija", "organska malina", "pulpa limuna", "livadski med"], volume: "320 g", legacyPriceRsd: 600, featured: true, alt: "Ilustracija Immuno Boostera od aronije i maline", description: "Dubok bobičasti profil sa limunovom pulpom i livadskim medom." }),
  legacy({ id: "buster-aronija-malina-djumbir", name: "Aronija · malina · đumbir", category: "busteri", ingredients: ["aronija", "organska malina", "đumbir", "pulpa limuna", "livadski med"], volume: "320 g", legacyPriceRsd: 600, featured: false, alt: "Ilustracija Immuno Boostera od aronije, maline i đumbira", description: "Bobičasta osnova sa dodatnim aromatičnim slojem đumbira." }),

  legacy({ id: "sok-jabuka", name: "Jabuka", category: "sokovi", ingredients: ["jabuka", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 210, featured: true, alt: "Ilustracija Immuno Craft soka od jabuke", description: "Jednostavan spoj jabuke, limuna i meda." }),
  legacy({ id: "sok-kruska-ruzmarin", name: "Kruška · ruzmarin", category: "sokovi", ingredients: ["kruška", "ruzmarin", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 240, featured: true, alt: "Ilustracija soka od kruške i ruzmarina", description: "Kruška i ruzmarin u osvežavajućoj manjoj boci." }),
  legacy({ id: "sok-cvekla-sargarepa-jabuka", name: "Cvekla · šargarepa · jabuka", category: "sokovi", ingredients: ["cvekla", "šargarepa", "jabuka", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 260, featured: true, alt: "Ilustracija soka od cvekle, šargarepe i jabuke", description: "Povrtno-voćna kombinacija sa limunom i medom." }),
  legacy({ id: "sok-malina", name: "Malina", category: "sokovi", ingredients: ["malina", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 280, featured: true, alt: "Ilustracija soka od maline", description: "Malina u čistoj, jarkoj kombinaciji sa limunom i medom." }),
  legacy({ id: "sok-aronija", name: "Aronija", category: "sokovi", ingredients: ["aronija", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 240, featured: false, alt: "Ilustracija soka od aronije", description: "Izražen ukus aronije u praktičnoj boci od 0,3 l." }),
  legacy({ id: "sok-djumbir", name: "Đumbir", category: "sokovi", ingredients: ["đumbir", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 230, featured: true, alt: "Ilustracija soka sa đumbirom", description: "Đumbir, limun i med za aromatičniji profil." }),
  legacy({ id: "sok-kurkuma-djumbir", name: "Organska kurkuma · đumbir", category: "sokovi", ingredients: ["organska kurkuma", "đumbir", "limun", "med"], volume: "0,3 l", legacyPriceRsd: 240, featured: false, alt: "Ilustracija soka sa kurkumom i đumbirom", description: "Začinska kombinacija kurkume i đumbira uz limun i med." }),
];

export const delivery = {
  title: "Od Novog Sada do vaše trpeze.",
  visibleCopy: "Za dostavu i preuzimanje kontaktirajte nas — dogovorićemo najjednostavniju opciju.",
  legacyRule: [
    "Istorijski: besplatna dostava u Novom Sadu za dva ili više proizvoda.",
    "Istorijski: preuzimanje prema dogovoru.",
    "Istorijski: druga mesta kurirskom službom ili drugim dogovorenim kanalom za veće porudžbine.",
  ],
  sourceStatus: "PENDING_CONFIRMATION" as SourceStatus,
};

export const testimonials = [
  { quote: "Kupci se vraćaju zbog ukusa Immuno Craft sirupa i sokova.", detail: "Sažetak javnog utiska kupca", sourceStatus: "PUBLIC_VERIFIED" as SourceStatus },
  { quote: "U javnim utiscima posebno se pominju dizajn, ukus i kvalitet.", detail: "Sažetak javnog utiska kupca", sourceStatus: "PUBLIC_VERIFIED" as SourceStatus },
];

export const press = [
  { label: "Mali Proizvođači", href: "https://maliproizvodjaci.rs/harmonije-panonije-proizvodnja-immuno-craft-sirupa/" },
  { label: "Dnevnik", href: "https://www.dnevnik.rs/lat/novi-sad/prirodni-put-do-imuniteta-proizvodi-harmonije-panonije-pruzaju-zdrava-resenja-bez-kompromisa-2024-12-29" },
];

export const pendingConfirmations = [
  "Aktuelan asortiman i sezonska dostupnost",
  "Aktuelne cene",
  "Aktuelna pravila dostave i preuzimanja",
  "Primarni kanal za poručivanje",
  "Da li se koriste WhatsApp ili Viber za porudžbine",
  "Aktuelan proces proizvodnje i poreklo sirovina",
  "Sve nutritivne i zdravstvene tvrdnje",
  "Finalna verzija priče o osnivačima",
  "Pravni/podaci o gazdinstvu koje žele javno prikazati",
  "Originalni logo i brend fajlovi",
  "Originalne fotografije proizvoda, osnivača i procesa",
];
