"use client";

import { useCart } from "./CartProvider";

export function MobileOrderBar() {
  const { count, open } = useCart();
  return (
    <button className="mobile-order-bar" type="button" onClick={open} aria-label={`Otvori upit. ${count} izabranih stavki`}>
      <span>Poruči / Kontakt</span>
      <i>{count}</i>
    </button>
  );
}
