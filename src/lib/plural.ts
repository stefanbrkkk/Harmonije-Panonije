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

/** Cart counts are pieces (sum of quantities): "1 komad", "3 komada". */
export const itemsLabel = (count: number) => `${count} ${pluralSr(count, "komad", "komada", "komada")}`;

/** "1 izabran komad", "3 izabrana komada", "12 izabranih komada". */
export const selectedItemsLabel = (count: number) =>
  `${count} ${pluralSr(count, "izabran komad", "izabrana komada", "izabranih komada")}`;

/** Product name as announced: syrups and juices share some names. */
export const productLabel = (product: { name: string; volume: string }) => `${product.name} (${product.volume})`;
