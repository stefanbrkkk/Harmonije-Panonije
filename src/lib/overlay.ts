import { useEffect, useEffectEvent } from "react";

const MARKER = "data-ov-inert";

type KeepRef = { readonly current: HTMLElement | null };

/**
 * Background isolation for overlays (menu, drawer). While `active`, every
 * element matching `backgroundSelectors` becomes inert unless it contains,
 * or is contained by, one of the `keep` elements. Elements already inert
 * are left untouched; everything this hook marks is unmarked on cleanup,
 * so no stale `inert` attributes survive close, resize, or rapid toggling.
 *
 * Declare this hook BEFORE any focus-restore effect in the same component:
 * cleanups run in declaration order, so inertness is lifted before focus
 * is moved back onto a background control.
 */
export function useOverlayIsolation(
  active: boolean,
  keep: KeepRef[],
  backgroundSelectors: string[],
) {
  const isolate = useEffectEvent(() => {
    const keepNodes = keep
      .map((ref) => ref.current)
      .filter((node): node is HTMLElement => node !== null);
    const kept = (node: HTMLElement) =>
      keepNodes.some((own) => own === node || own.contains(node) || node.contains(own));
    const touched: HTMLElement[] = [];
    for (const selector of backgroundSelectors) {
      document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
        if (node.hasAttribute("inert") || node.hasAttribute(MARKER) || kept(node)) return;
        node.setAttribute("inert", "");
        node.setAttribute(MARKER, "");
        touched.push(node);
      });
    }
    return () => {
      for (const node of touched) {
        node.removeAttribute("inert");
        node.removeAttribute(MARKER);
      }
    };
  });

  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    return isolate();
  }, [active]);
}
