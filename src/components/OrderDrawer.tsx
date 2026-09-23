"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { contact } from "@/src/data/siteContent";
import { useCart } from "./CartProvider";
import { ProductVisual } from "./ProductVisual";
import { restoreFocus } from "@/src/lib/focus";
import { useOverlayIsolation } from "@/src/lib/overlay";
import { bindSeparators } from "@/src/lib/typography";

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
      ".skip-link",
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
    // `scrollbar-gutter: stable` on <html> already keeps the layout width
    // constant when scrolling locks, so no manual scrollbar padding here.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("has-overlay");
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      // Only controls that can actually take focus: content of a closed
      // <details> (the draft textarea) has no boxes and must not be the
      // trap's last stop, while its <summary> must be included.
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
      )).filter((node) => {
        if (node.closest("[inert]") || node.getClientRects().length === 0) return false;
        // Closed <details>: only its own summary is reachable (Chrome keeps
        // layout boxes for the hidden content, so rects alone are not enough).
        const details = node.closest("details");
        if (details && !details.open && !(node.matches("summary") && node.parentElement === details)) return false;
        return typeof node.checkVisibility === "function" ? node.checkVisibility({ checkVisibilityCSS: true }) : true;
      });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
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

  // A stable holder: the unmount cleanup reads the latest timer id.
  const copyTimerRef = useRef({ id: 0 });

  useEffect(() => {
    const timer = copyTimerRef.current;
    return () => window.clearTimeout(timer.id);
  }, []);

  // Removing the focused control (clear, last item) must not drop focus to
  // <body> inside the modal: land on the dialog's close button instead.
  const rescueFocus = () =>
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(document.activeElement)) closeRef.current?.focus();
    });

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
      // Owned timer: a second copy restarts the reset window instead of
      // letting the first timer cut the newer feedback short.
      window.clearTimeout(copyTimerRef.current.id);
      copyTimerRef.current.id = window.setTimeout(() => setCopyState("idle"), 1800);
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
                      <h3>{bindSeparators(item.product.name)}</h3>
                      <div className="order-item__controls" role="group" aria-label={`Količina za ${item.product.name}`}>
                        <button type="button" onClick={() => { decrement(item.product.id); rescueFocus(); }} aria-label={`Smanji količinu za ${item.product.name}`}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => add(item.product, { notify: false })} aria-label={`Povećaj količinu za ${item.product.name}`}>+</button>
                      </div>
                    </div>
                    <button type="button" className="order-item__remove" onClick={() => { remove(item.product.id); rescueFocus(); }} aria-label={`Ukloni ${item.product.name}`}>×</button>
                  </article>
                ))}
              </div>
              <button type="button" className="order-clear" onClick={() => { clear(); rescueFocus(); }}>Obriši sve</button>
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
