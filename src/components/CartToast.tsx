"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { restoreFocus } from "@/src/lib/focus";

const NOTICE_MS = 3600;

export function CartToast() {
  const { notice, dismissNotice, open } = useCart();
  const timerRef = useRef(0);
  const pausedRef = useRef(false);
  // Where keyboard focus came from before entering the toast, so dismissing
  // it never strands focus on a control inside an aria-hidden container.
  const returnFocusRef = useRef<HTMLElement | null>(null);

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

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    setPaused(true);
    const from = event.relatedTarget;
    if (from instanceof HTMLElement && !event.currentTarget.contains(from)) returnFocusRef.current = from;
  };

  const dismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    const hadFocus = event.currentTarget === document.activeElement;
    dismissNotice();
    if (hadFocus) {
      restoreFocus([
        returnFocusRef.current,
        document.querySelector<HTMLElement>("#proizvodi-heading"),
        document.querySelector<HTMLElement>(".site-header__logo"),
      ]);
    }
  };

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Only resume when focus truly leaves the toast, not between its buttons.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  };

  const announcement = notice
    ? `Dodato u upit: ${notice.product.name}${notice.quantity > 1 ? `, ${notice.quantity} komada` : ""}.`
    : "";

  return (
    <>
    {/* Permanent live region: it exists before any notice, so the first
        addition is announced (a region that un-hides in the same render as
        its text change is often skipped by screen readers). */}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    <div
      className={`cart-toast ${notice ? "is-visible" : ""}`}
      aria-hidden={!notice}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="cart-toast__mark" aria-hidden="true">✓</div>
      <div className="cart-toast__copy" key={notice?.seq ?? "empty"}>
        <span>{notice && notice.quantity > 1 ? `Dodato u upit · ${notice.quantity}×` : "Dodato u upit"}</span>
        <strong title={notice?.product.name ?? "Proizvod"}>{notice?.product.name ?? "Proizvod"}</strong>
      </div>
      <button type="button" onClick={open} tabIndex={notice ? 0 : -1}>Pogledaj upit</button>
      <button type="button" className="cart-toast__close" onClick={dismiss} aria-label="Zatvori obaveštenje" tabIndex={notice ? 0 : -1}>×</button>
    </div>
    </>
  );
}
