/**
 * Serbian count agreement: 1, 21, 31… take the singular; 2–4, 22–24… the
 * paucal; everything else (incl. 11–14) the genitive plural.
 */
export function pluralSr(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** "1 stavka", "3 stavke", "12 stavki". */
export const itemsLabel = (count: number) => `${count} ${pluralSr(count, "stavka", "stavke", "stavki")}`;

/** "1 izabrana stavka", "3 izabrane stavke", "12 izabranih stavki". */
export const selectedItemsLabel = (count: number) =>
  `${count} ${pluralSr(count, "izabrana stavka", "izabrane stavke", "izabranih stavki")}`;
