/** Shared motion primitives for scroll-driven scenes. */

export function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

/**
 * Discrete timeline phase: eased 0 → 1 between start and end, clamped.
 * Sequential phases built from this are continuous by construction (each
 * segment begins exactly where the previous one ends) and purely a
 * function of scroll progress, so reverse/fast/jump scrolling recovers
 * the identical visual state.
 */
export function phaseProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return smoothstep((progress - start) / (end - start));
}

/**
 * Camera-follow shift (px, ≤ 0) that centers a viewBox landmark in the
 * viewport, clamped to the artwork bounds. Returns 0 when the artwork fits.
 * Applied through the CSS `translate` property so SVG `transform` attributes
 * and CSS `transform` rules keep their existing owners.
 */
export function cameraShift(viewBoxX: number, viewBoxWidth: number, viewportWidth: number, artworkWidth: number) {
  if (artworkWidth <= viewportWidth + 4) return 0;
  const landmarkPx = (viewBoxX / viewBoxWidth) * artworkWidth;
  const maxShift = artworkWidth - viewportWidth;
  return -Math.min(maxShift, Math.max(0, landmarkPx - viewportWidth * 0.5));
}

export type SceneLoopHandlers = {
  /**
   * Full paint for an explicit progress value (used for init + resync).
   * `snapped` is true on the first frame after the loop (re)starts at a
   * position it did not animate to.
   */
  paint: (progress: number, dtUnits: number, snapped: boolean) => void;
  /** Current scroll-derived target progress. */
  readTarget: () => number;
  /** Damped state advance. */
  advance: (current: number, target: number, blend: number) => number;
  /** One-shot static composition for reduced motion. */
  paintStatic: () => void;
  /**
   * Optional: true while the scene still animates on its own at a settled
   * progress (e.g. a fade in flight). The loop does not park meanwhile.
   */
  busy?: () => boolean;
};

/**
 * Controlled rAF scheduling shared by the scroll scenes (HP-16/36/37/40):
 * activates near/in view, stops when settled off-screen or the document is
 * hidden, paints reduced-motion statically exactly once, and resumes from
 * the correct progress (snap while still off-screen, so no catch-up swoop
 * is ever visible). Damping uses delta time so 30/60/120Hz converge alike.
 */
export function createSceneLoop(
  section: HTMLElement,
  media: MediaQueryList,
  handlers: SceneLoopHandlers,
  baseBlend: number,
) {
  let raf = 0;
  let mounted = true;
  let inView = true;
  let current = 0;
  let settled = false;
  let stillFrames = 0;
  let lastT = 0;

  const frame = (t: number) => {
    raf = 0;
    if (!mounted || !inView || document.hidden || media.matches) return;
    const dt = lastT === 0 ? 1 : Math.min(4, Math.max(0.25, (t - lastT) / 16.667));
    lastT = t;
    const target = handlers.readTarget();
    const snapped = !settled;
    if (!settled) {
      current = target;
      settled = true;
      stillFrames = 0;
    } else {
      const blend = 1 - Math.pow(1 - baseBlend, dt);
      const next = handlers.advance(current, target, blend);
      if (Math.abs(target - next) < 0.0004) {
        current = target;
        stillFrames += 1;
      } else {
        current = next;
        stillFrames = 0;
      }
    }
    handlers.paint(current, dt, snapped);
    if (handlers.busy?.()) stillFrames = 0;
    // Park after ~1s of stillness; scroll/resize/visibility wakes the loop.
    if (stillFrames > 60) {
      stillFrames = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const kick = (snap: boolean) => {
    if (!mounted || !inView || document.hidden || media.matches || raf) return;
    if (snap) settled = false;
    lastT = 0;
    raf = requestAnimationFrame(frame);
  };

  const settleStatic = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    handlers.paintStatic();
  };

  // IntersectionObserver reports asynchronously, after the first frames at
  // a new position have painted: a jump from far away would show the
  // stale state and then swoop. While out of view, check proximity
  // directly on scroll and snap straight to the new progress.
  const near = () => {
    const rect = section.getBoundingClientRect();
    const margin = window.innerHeight * 0.6;
    return rect.bottom > -margin && rect.top < window.innerHeight + margin;
  };
  const wake = () => {
    if (!inView && mounted && near()) {
      inView = true;
      kick(true);
      return;
    }
    kick(false);
  };

  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            inView = entries.some((entry) => entry.isIntersecting);
            if (inView) kick(true);
            else if (raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          },
          { rootMargin: "60% 0px 60% 0px" },
        )
      : null;

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else {
      kick(true);
    }
  };

  const onMedia = () => {
    if (media.matches) settleStatic();
    else kick(true);
  };

  const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(wake) : null;

  io?.observe(section);
  resizeObserver?.observe(document.body);
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
  document.addEventListener("visibilitychange", onVisibility);
  media.addEventListener?.("change", onMedia);
  if (media.matches) settleStatic();
  else kick(true);

  return () => {
    mounted = false;
    if (raf) cancelAnimationFrame(raf);
    io?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener("scroll", wake);
    window.removeEventListener("resize", wake);
    document.removeEventListener("visibilitychange", onVisibility);
    media.removeEventListener?.("change", onMedia);
  };
}
