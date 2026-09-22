"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { contact } from "@/src/data/siteContent";
import { useCart } from "./CartProvider";
import { ProductVisual } from "./ProductVisual";
import { restoreFocus } from "@/src/lib/focus";
import { useOverlayIsolation } from "@/src/lib/overlay";

export function OrderDrawer() {
  const { items, count, isOpen, close, add, decrement, remove, clear } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [copyForMessage, setCopyForMessage] = useState("");

  const message = useMemo(() => {
    const lines = items.map((item) => `- ${item.product.name} (${item.product.volume}) × ${item.quantity}`);
    return [
      "Dobar dan,",
      "",
      name ? `Ime: ${name}` : "",
      phone ? `Telefon: ${phone}` : "",
      name || phone ? "" : "",
      "Zanima me dostupnost sledećih proizvoda:",
      ...(lines.length ? lines : ["- Želeo/la bih preporuku proizvoda."]),
      note ? "" : "",
      note ? `Napomena: ${note}` : "",
      "",
      "Molim Vas javite aktuelne cene, dostupnost i opciju dostave/preuzimanja.",
      "",
      "Hvala!",
    ].filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n");
  }, [items, name, phone, note]);

  const mailto = useMemo(
    () => `mailto:${contact.email}?subject=${encodeURIComponent("Upit za porudžbinu — Harmonije Panonije")}&body=${encodeURIComponent(message)}`,
    [message],
  );

  // Declared before the scroll/focus effect so inertness lifts before focus
  // is restored on close. The whole header goes inert for the drawer.
  useOverlayIsolation(
    isOpen,
    [dialogRef, backdropRef],
    [
      ".site-header",
      "main",
      "footer.site-footer",
      ".mobile-order-bar",
      ".cart-toast",
      "#mobile-menu",
    ],
  );

  // Stale clipboard feedback must not survive draft changes: the feedback is
  // only shown while it refers to the current draft text.
  const shownCopyState = copyForMessage === message ? copyState : "idle";

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    const previousPadding = document.documentElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.classList.add("has-overlay");
    if (scrollbarWidth > 0) document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      )).filter((node) => !node.hasAttribute("inert"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.style.paddingRight = previousPadding;
      document.body.classList.remove("has-overlay");
      window.removeEventListener("keydown", onKey);
      // Never restore focus into the (now hidden) toast: prefer the original
      // trigger while visible, else the catalog heading, else the logo.
      restoreFocus([
        returnFocus,
        document.querySelector<HTMLElement>("#proizvodi-heading"),
        document.querySelector<HTMLElement>(".site-header__logo"),
      ]);
    };
  }, [isOpen, close]);

  const copyMessage = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const field = document.createElement("textarea");
        field.value = message;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy command failed");
      }
      setCopyState("copied");
      setCopyForMessage(message);
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      setCopyForMessage(message);
    }
  };

  return (
    <>
      <button ref={backdropRef} type="button" className={`drawer-backdrop ${isOpen ? "is-open" : ""}`} onClick={close} aria-label="Zatvori upit" tabIndex={isOpen ? 0 : -1} />
      <div
        ref={dialogRef}
        className={`order-drawer ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
      >
        <div className="order-drawer__head">
          <div><p className="eyebrow eyebrow--quiet">Vaš izbor</p><h2 id="order-title">Upit za porudžbinu</h2></div>
          <button ref={closeRef} type="button" className="icon-button" onClick={close} aria-label="Zatvori"><span>×</span></button>
        </div>

        <div className="order-drawer__content">
          {items.length === 0 ? (
            <div className="order-empty">
              <div className="order-empty__mark">HP</div>
              <h3>Još nema proizvoda.</h3>
              <p>Dodajte ukuse koji vas zanimaju. Na sajtu nema naplate — izbor samo priprema jasan upit za cenu, dostupnost i dostavu.</p>
              <a
                className="button button--dark"
                href="#proizvodi"
                onClick={() => {
                  close();
                  // Land focus on the catalog heading after navigation.
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => document.getElementById("proizvodi-heading")?.focus({ preventScroll: true })),
                  );
                }}
              >
                Pogledaj proizvode
              </a>
            </div>
          ) : (
            <>
              <div className="order-list">
                {items.map((item) => (
                  <article className="order-item" key={item.product.id}>
                    <ProductVisual category={item.product.category} id={item.product.id} compact />
                    <div className="order-item__info">
                      <span>{item.product.volume}</span>
                      <h3>{item.product.name}</h3>
                      <div className="order-item__controls" role="group" aria-label={`Količina za ${item.product.name}`}>
                        <button type="button" onClick={() => decrement(item.product.id)} aria-label={`Smanji količinu za ${item.product.name}`}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => add(item.product, { notify: false })} aria-label={`Povećaj količinu za ${item.product.name}`}>+</button>
                      </div>
                    </div>
                    <button type="button" className="order-item__remove" onClick={() => remove(item.product.id)} aria-label={`Ukloni ${item.product.name}`}>×</button>
                  </article>
                ))}
              </div>
              <button type="button" className="order-clear" onClick={clear}>Obriši sve</button>
            </>
          )}

          <div className="order-contact-form" role="group" aria-label="Podaci za upit">
            <div className="order-contact-form__intro">
              <span>Opcionalno</span>
              <p>Dodajte podatke da poruka bude spremna za slanje bez naknadnog dopisivanja.</p>
            </div>
            <label><span>Ime</span><input value={name} maxLength={80} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)} autoComplete="name" placeholder="Vaše ime" /></label>
            <label><span>Telefon</span><input value={phone} maxLength={30} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="06x…" /></label>
            <label className="order-contact-form__full"><span>Napomena</span><textarea value={note} maxLength={500} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)} rows={3} placeholder="Npr. grad, termin preuzimanja, pitanje o ukusu…" /></label>
          </div>
        </div>

        <div className="order-drawer__foot">
          <div className="order-drawer__summary"><span>Ukupno izabranih komada</span><strong>{count}</strong></div>
          <a className="button button--honey button--full" href={mailto}>Otvori pripremljen mejl</a>
          <div className="order-drawer__alternatives">
            <button type="button" className="text-link" onClick={copyMessage}>{shownCopyState === "copied" ? "Upit kopiran ✓" : shownCopyState === "failed" ? "Kopiranje nije uspelo" : "Kopiraj tekst upita"}<span aria-hidden="true">↗</span></button>
            <a className="text-link" href={`tel:${contact.phoneHref}`}>Pozovi {contact.phoneDisplay}<span aria-hidden="true">↗</span></a>
            <a className="text-link" href={contact.instagramUrl} target="_blank" rel="noreferrer">Instagram<span aria-hidden="true">↗</span></a>
          </div>
          <details className="order-draft">
            <summary className="text-link">Prikaži tekst upita<span aria-hidden="true">↗</span></summary>
            <textarea readOnly rows={6} value={message} aria-label="Tekst upita za kopiranje" onFocus={(event) => event.target.select()} />
          </details>
          <p>Finalnu cenu, dostupnost i način dostave potvrđujete direktno sa proizvođačem.</p>
        </div>
      </div>
    </>
  );
}
