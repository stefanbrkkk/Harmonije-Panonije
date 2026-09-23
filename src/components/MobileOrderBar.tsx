"use client";

import { useCart } from "./CartProvider";
import { selectedItemsLabel } from "@/src/lib/plural";

export function MobileOrderBar() {
  const { count, open } = useCart();
  return (
    <button className="mobile-order-bar" type="button" onClick={open} aria-label={`Otvori upit. ${selectedItemsLabel(count)}`}>
      <span>Poruči / Kontakt</span>
      <i>{count}</i>
    </button>
  );
}
