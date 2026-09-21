"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCart } from "./CartProvider";

const NOTICE_MS = 3600;

export function CartToast() {
  const { notice, dismissNotice, open } = useCart();
  const timerRef = useRef(0);
  const pausedRef = useRef(false);

  const schedule = useCallback(() => {
    window.clearTimeout(timerRef.current);
    if (!notice || pausedRef.current) return;
    timerRef.current = window.setTimeout(dismissNotice, NOTICE_MS);
  }, [notice, dismissNotice]);

  // Each addition is a new notice event: restarting the timeout refreshes the
  // feedback instead of stacking or cutting it off mid-animation.
  useEffect(() => {
    schedule();
    return () => window.clearTimeout(timerRef.current);
  }, [schedule]);

  const setPaused = useCallback(
    (paused: boolean) => {
      pausedRef.current = paused;
      if (paused) window.clearTimeout(timerRef.current);
      else schedule();
    },
    [schedule],
  );

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Only resume when focus truly leaves the toast, not between its buttons.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  };

  return (
    <div
      className={`cart-toast ${notice ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-hidden={!notice}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={onBlur}
    >
      <div className="cart-toast__mark" aria-hidden="true">✓</div>
      <div className="cart-toast__copy" key={notice?.seq ?? "empty"}>
        <span>{notice && notice.quantity > 1 ? `Dodato u upit · ${notice.quantity}×` : "Dodato u upit"}</span>
        <strong title={notice?.product.name ?? "Proizvod"}>{notice?.product.name ?? "Proizvod"}</strong>
      </div>
      <button type="button" onClick={open} tabIndex={notice ? 0 : -1}>Pogledaj upit</button>
      <button type="button" className="cart-toast__close" onClick={dismissNotice} aria-label="Zatvori obaveštenje" tabIndex={notice ? 0 : -1}>×</button>
    </div>
  );
}
