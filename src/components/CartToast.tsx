"use client";

import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";

export function CartToast() {
  const { notice, dismissNotice, open } = useCart();
  const timerRef = useRef(0);

  // Coalesce rapid additions: each new notice restarts the timer
  // intentionally instead of stacking or resetting awkwardly mid-animation.
  useEffect(() => {
    if (!notice) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(dismissNotice, 3200);
    return () => window.clearTimeout(timerRef.current);
  }, [notice, dismissNotice]);

  return (
    <div
      className={`cart-toast ${notice ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-hidden={!notice}
    >
      <div className="cart-toast__mark" aria-hidden="true">✓</div>
      <div className="cart-toast__copy" key={notice?.id ?? "empty"}>
        <span>Dodato u upit</span>
        <strong>{notice?.name ?? "Proizvod"}</strong>
      </div>
      <button type="button" onClick={open} tabIndex={notice ? 0 : -1}>Pogledaj upit</button>
      <button type="button" className="cart-toast__close" onClick={dismissNotice} aria-label="Zatvori obaveštenje" tabIndex={notice ? 0 : -1}>×</button>
    </div>
  );
}
