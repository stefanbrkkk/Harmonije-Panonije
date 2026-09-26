"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";
import { navigation } from "@/src/data/siteContent";
import { useCart } from "./CartProvider";
import { useOverlayIsolation } from "@/src/lib/overlay";
import { itemsLabel } from "@/src/lib/plural";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, open } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Destination of a menu link, read once when the menu closes.
  const navTargetRef = useRef<string | null>(null);

  // Declared first so inertness lifts before focus is restored on close.
  // The toggle stays live: only unrelated header controls are isolated.
  useOverlayIsolation(
    menuOpen,
    [menuRef, menuButtonRef],
    [
      ".skip-link",
      ".site-header__logo",
      ".site-nav",
      ".order-button",
      "main",
      "footer.site-footer",
      ".mobile-order-bar",
      ".cart-toast",
      ".order-drawer",
      ".drawer-backdrop",
    ],
  );

  // The first scrolled state is set before paint, in the same commit in
  // which MotionOrchestrator ends the pre-hydration solid header: otherwise
  // the header flashed transparent (white nav over cream) for ~0.4s on a
  // reload or deep link below the top.
  const headerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    // Class written directly for this first frame; the scroll listener below
    // brings React state into line on the next animation frame.
    if (window.scrollY > 24) headerRef.current?.classList.add("site-header--scrolled");
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // Hysteresis avoids flicker when hovering near the threshold.
        setScrolled((value) => (value ? window.scrollY > 12 : window.scrollY > 24));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-overlay", menuOpen);
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Capture the toggle node at setup: reading a mutable ref during effect
    // cleanup is unreliable once React has detached the node.
    const toggleNode = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>("a,button")?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      // Focus scope covers the toggle (close) plus the menu panel, so the
      // close control stays keyboard-reachable while open.
      const panel = menuRef.current ? Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')) : [];
      const focusable = toggleNode ? [toggleNode, ...panel] : panel;
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

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove("has-overlay");
      window.removeEventListener("keydown", onKeyDown);
      // Restore focus to a visible control: the toggle may be display:none
      // after a breakpoint change, so fall back to the logo link.
      const visible = (node: HTMLElement | null) => (node && node.offsetParent !== null ? node : null);
      // A menu link was chosen: continue from its destination instead of
      // sending keyboard and screen-reader users back to the header.
      const target = navTargetRef.current ? document.querySelector<HTMLElement>(navTargetRef.current) : null;
      navTargetRef.current = null;
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return;
      }
      const logo = document.querySelector<HTMLElement>(".site-header__logo");
      (visible(previousFocus) ?? visible(toggleNode) ?? logo)?.focus();
    };
  }, [menuOpen]);

  // Reconcile with the desktop breakpoint: an open mobile menu cannot strand
  // users after resize; focus returns to the (visible) toggle via cleanup.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1081px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  return (
    <>
    {/* While the cream menu panel is open the header takes its solid
        (scrolled) colours, so the close control stays visible at page top. */}
    <header ref={headerRef} className={`site-header ${scrolled || menuOpen ? "site-header--scrolled" : ""} ${menuOpen ? "site-header--menu-open" : ""}`}>
      <div className="site-header__inner shell">
        <a href="#vrh" className="site-header__logo" aria-label="Harmonije Panonije — početna">
          <BrandMark compact />
        </a>

        <nav className="site-nav" aria-label="Glavna navigacija">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="site-header__actions">
          <button className="order-button" type="button" onClick={open} aria-label={`Poruči — u upitu ${itemsLabel(count)}`}>
            <span>Poruči</span>
            <span className="order-button__count" aria-hidden="true">{count}</span>
          </button>
          <button
            ref={menuButtonRef}
            className={`menu-button ${menuOpen ? "menu-button--open" : ""}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>

    {/*
      Sibling of the header (not a child): the panel previously stacked above
      the toggle because a positioned z-index child always paints over the
      toggle's z-auto button inside the same header stacking context.
    */}
    <div
      ref={menuRef}
      id="mobile-menu"
      className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}
      aria-hidden={!menuOpen}
      inert={!menuOpen}
    >
      <div className="mobile-menu__inner shell">
        <p className="eyebrow" aria-hidden="true">Meni</p>
        <nav className="mobile-menu__nav" aria-label="Meni">
          {navigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                navTargetRef.current = item.href;
                setMenuOpen(false);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{item.label}
            </a>
          ))}
        </nav>
        <button type="button" className="button button--honey" onClick={() => { setMenuOpen(false); open(); }}>
          Započni upit
        </button>
      </div>
    </div>
    </>
  );
}
