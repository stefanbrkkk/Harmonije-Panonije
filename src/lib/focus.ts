/** True only for elements a user can see and interact with right now. */
export function isVisibleTarget(node: HTMLElement | null): node is HTMLElement {
  if (!node || !node.isConnected) return false;
  const rect = node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  if (node.closest('[aria-hidden="true"],[inert]')) return false;
  return true;
}

/**
 * Focus restoration that never lands inside hidden/inert content (HP-15).
 * Uses the first visible candidate: preferred trigger, then fallbacks.
 */
export function restoreFocus(candidates: Array<HTMLElement | null>) {
  for (const candidate of candidates) {
    if (isVisibleTarget(candidate)) {
      // Never scroll: a fallback target (catalog heading, logo) may be far
      // from where the visitor is reading.
      candidate.focus({ preventScroll: true });
      return true;
    }
  }
  return false;
}
