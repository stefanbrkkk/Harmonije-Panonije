"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

export function CartToast() {
  const { notice, dismissNotice, open } = useCart();

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(dismissNotice, 3600);
    return () => window.clearTimeout(timeout);
  }, [notice, dismissNotice]);

  return (
    <div className={`cart-toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite" aria-atomic="true">
      <div className="cart-toast__mark" aria-hidden="true">✓</div>
      <div className="cart-toast__copy">
        <span>Dodato u upit</span>
        <strong>{notice?.name ?? "Proizvod"}</strong>
      </div>
      <button type="button" onClick={open}>Pogledaj upit</button>
      <button type="button" className="cart-toast__close" onClick={dismissNotice} aria-label="Zatvori obaveštenje">×</button>
    </div>
  );
}
