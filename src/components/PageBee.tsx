"use client";

import { useEffect, useRef } from "react";
import { createSceneLoop } from "@/src/lib/scene";

type Waypoint = { p: number; x: number; y: number; scale: number };

/*
 * Cinematic route: long arcs on one gutter, only two deliberate crossings.
 * Stays near edges / decorative space, avoids sustained travel through
 * centered headings, body copy and product controls.
 */
const desktopPath: Waypoint[] = [
  { p: 0.0, x: 80, y: 47, scale: 1.0 },
  { p: 0.14, x: 76, y: 24, scale: 0.92 },
  { p: 0.28, x: 82, y: 44, scale: 0.9 },
  { p: 0.42, x: 68, y: 32, scale: 0.88 },
  { p: 0.55, x: 22, y: 30, scale: 0.82 },
  { p: 0.66, x: 18, y: 44, scale: 0.84 },
  { p: 0.78, x: 24, y: 52, scale: 0.86 },
  { p: 0.9, x: 76, y: 46, scale: 0.9 },
  { p: 1.0, x: 74, y: 20, scale: 0.94 },
];

const mobilePath: Waypoint[] = [
  { p: 0.0, x: 82, y: 30, scale: 0.78 },
  { p: 0.3, x: 78, y: 26, scale: 0.72 },
  { p: 0.55, x: 80, y: 36, scale: 0.72 },
  { p: 0.75, x: 22, y: 30, scale: 0.7 },
  { p: 1.0, x: 70, y: 20, scale: 0.72 },
];

function smooth(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function sample(points: Waypoint[], progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  const nextIndex = points.findIndex((point) => point.p >= p);
  if (nextIndex <= 0) return points[0];
  if (nextIndex === -1) return points[points.length - 1];
  const a = points[nextIndex - 1];
  const b = points[nextIndex];
  const local = smooth((p - a.p) / Math.max(0.0001, b.p - a.p));
  return {
    p,
    x: a.x + (b.x - a.x) * local,
    y: a.y + (b.y - a.y) * local,
    scale: a.scale + (b.scale - a.scale) * local,
  };
}

const JOURNEY_SELECTORS = [
  "#vrh",
  "#put-pcele",
  "#proizvodi",
  "#prica",
  "#sastojci",
  ".honey-harvest",
  "#dostava",
  "#kontakt",
];

export function PageBee() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const beeRef = useRef<SVGSVGElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const bee = beeRef.current;
    if (!wrapper || !bee) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Damped state (target/current model).
    let currentX = 0;
    let currentY = 0;
    let currentScale = 1;
    let currentAngle = 0;
    let currentFacing: 1 | -1 = 1;
    let facingLock = 0;
    let currentOpacity = 0;
    let wingDuration = 0.34;
    let initialized = false;
    let anchors: number[] = [];
    let anchorCount = 0;
    let localScenes: HTMLElement[] = [];

    const measureAnchors = () => {
      const tops: number[] = [];
      for (const selector of JOURNEY_SELECTORS) {
        const node = document.querySelector<HTMLElement>(selector);
        if (!node) continue;
        tops.push(node.offsetTop);
      }
      tops.sort((a, b) => a - b);
      anchors = tops;
      anchorCount = tops.length;
      localScenes = Array.from(document.querySelectorAll<HTMLElement>("#put-pcele, .honey-harvest"));
    };

    const sectionProgress = (scrollY: number) => {
      if (anchorCount < 2) {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        return Math.min(1, Math.max(0, scrollY / max));
      }
      const viewportCenter = scrollY + window.innerHeight * 0.5;
      if (viewportCenter <= anchors[0]) return 0;
      const last = anchors[anchorCount - 1];
      if (viewportCenter >= last) return 1;
      for (let i = 0; i < anchorCount - 1; i += 1) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (viewportCenter >= a && viewportCenter <= b) {
          const local = (viewportCenter - a) / Math.max(1, b - a);
          return (i + smooth(local)) / (anchorCount - 1);
        }
      }
      return 0;
    };

    const overlayOpen = () =>
      document.querySelector(".order-drawer.is-open") !== null ||
      document.querySelector(".mobile-menu--open") !== null ||
      document.body.classList.contains("has-overlay");

    const paintStatic = () => {
      wrapper.style.opacity = "0";
    };

    const paint = (progress: number, dt: number) => {
      const points = window.innerWidth < 720 ? mobilePath : desktopPath;
      const point = sample(points, progress);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetX = (vw * point.x) / 100;
      const targetY = (vh * point.y) / 100;

      if (!initialized) {
        currentX = targetX;
        currentY = targetY;
        currentScale = point.scale;
        initialized = true;
      }

      // Position + scale damping (frame-rate independent).
      const move = 1 - Math.pow(1 - 0.16, dt);
      currentX += (targetX - currentX) * move;
      currentY += (targetY - currentY) * move;
      currentScale += (point.scale - currentScale) * (1 - Math.pow(1 - 0.1, dt));

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const speed = Math.hypot(dx, dy);
      const rawAngle = Math.max(-18, Math.min(18, (Math.atan2(dy, Math.abs(dx) + 0.01) * 180) / Math.PI));
      currentAngle += (rawAngle * 0.5 - currentAngle) * (1 - Math.pow(1 - 0.08, dt));

      // Facing with dead zone + delayed flip to avoid micro-scroll flicker.
      // The artwork faces left natively (head at low x), so motion to the
      // right mirrors it and motion to the left keeps it as drawn.
      if (dx < -6) {
        facingLock += 1;
        if (facingLock >= 3) currentFacing = 1;
      } else if (dx > 6) {
        facingLock += 1;
        if (facingLock >= 3) currentFacing = -1;
      } else {
        facingLock = 0;
      }

      // Local cinematic handoff: fade out smoothly near sticky scenes.
      let handoff = 0;
      const focusY = vh * 0.48;
      for (const scene of localScenes) {
        const r = scene.getBoundingClientRect();
        if (r.top < focusY && r.bottom > focusY) {
          handoff = 1;
          break;
        }
      }

      let targetOpacity: number;
      if (progress < 0.012) targetOpacity = 0;
      else if (progress > 0.985) targetOpacity = 0.25;
      else if (handoff === 1) targetOpacity = 0.0;
      else targetOpacity = 1;
      if (overlayOpen()) targetOpacity = 0;
      currentOpacity += (targetOpacity - currentOpacity) * (1 - Math.pow(1 - 0.12, dt));
      if (Math.abs(targetOpacity - currentOpacity) < 0.004) currentOpacity = targetOpacity;

      wrapper.style.opacity = currentOpacity.toFixed(3);
      wrapper.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${currentScale.toFixed(3)})`;
      bee.style.transform = `rotate(${currentAngle.toFixed(2)}deg) scaleX(${currentFacing})`;

      // Wings: stable baseline, narrow speed-reactive band, smoothed so no
      // sudden animation-duration jumps.
      const targetWing = Math.min(0.42, Math.max(0.28, 0.34 - speed * 0.0012));
      wingDuration += (targetWing - wingDuration) * (1 - Math.pow(1 - 0.06, dt));
      wrapper.style.setProperty("--flight-speed", `${wingDuration.toFixed(3)}s`);
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate3d(${(currentFacing * -7).toFixed(1)}px, 17px, 0) scale(${(0.82 + currentScale * 0.08).toFixed(3)})`;
      }
    };

    const scheduleMeasure = () => {
      measureAnchors();
    };

    measureAnchors();
    window.addEventListener("resize", scheduleMeasure);
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasure) : null;
    if (resizeObserver) resizeObserver.observe(document.body);
    // Catalog expand / search / tab changes alter document height and anchor
    // offsets; re-measure without moving the bee.
    const mutations = new MutationObserver(scheduleMeasure);
    mutations.observe(document.body, { childList: true, subtree: true });

    // The shared loop owns scroll wakeups, viewport gating (body is always
    // in view), hidden-document pauses and reduced-motion static state.
    const stopLoop = createSceneLoop(
      document.body,
      reduced,
      {
        paint: (progress, dt) => paint(progress, dt),
        readTarget: () => sectionProgress(window.scrollY),
        advance: (current, target, blend) => current + (target - current) * blend,
        paintStatic,
      },
      0.14,
    );

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
      mutations.disconnect();
      stopLoop();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="page-bee" aria-hidden="true">
      <span ref={shadowRef} className="page-bee__shadow" />
      <svg ref={beeRef} viewBox="0 0 150 120" className="page-bee__svg">
        <defs>
          <linearGradient id="beeBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8cf63" />
            <stop offset="0.45" stopColor="#d99a23" />
            <stop offset="1" stopColor="#9b5c0a" />
          </linearGradient>
          <radialGradient id="beeThorax" cx="42%" cy="35%" r="70%">
            <stop offset="0" stopColor="#4c3623" />
            <stop offset="1" stopColor="#171713" />
          </radialGradient>
          <linearGradient id="wingGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".84" />
            <stop offset=".55" stopColor="#e9efe4" stopOpacity=".34" />
            <stop offset="1" stopColor="#adbdad" stopOpacity=".12" />
          </linearGradient>
          <filter id="wingBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation=".55" />
          </filter>
        </defs>
        <g className="page-bee__wings" filter="url(#wingBlur)">
          <path d="M65 51C35 16 9 23 12 43c3 20 31 28 54 20Z" fill="url(#wingGlass)" />
          <path d="M82 50c24-38 53-34 55-14 2 20-25 32-52 27Z" fill="url(#wingGlass)" />
          <path d="M64 55C41 35 29 40 31 53c2 13 18 19 34 14Z" fill="none" stroke="rgba(55,73,64,.38)" strokeWidth="1" />
          <path d="M85 54c19-23 34-20 34-7 0 12-15 20-32 20Z" fill="none" stroke="rgba(55,73,64,.38)" strokeWidth="1" />
        </g>
        <g className="page-bee__body">
          <ellipse cx="74" cy="66" rx="26" ry="18" fill="url(#beeBody)" />
          <path d="M56 56c7 5 10 18 3 28M69 50c6 7 9 24 1 33M85 50c5 7 7 22 0 31M98 55c4 5 4 16-1 22" fill="none" stroke="#1b1b15" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="51" cy="64" rx="16" ry="15" fill="url(#beeThorax)" />
          <circle cx="39" cy="61" r="10" fill="#171713" />
          <circle cx="35.5" cy="58" r="2.2" fill="#f5e6aa" />
          <path d="M34 52c-9-13-17-8-20-2M42 51c-3-14 6-18 12-15" fill="none" stroke="#27251d" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M46 73 31 92M57 77 53 98M82 80l6 18M95 75l15 16" fill="none" stroke="#24221b" strokeWidth="2.4" strokeLinecap="round" />
          <path d="m101 66 18 3-18 4Z" fill="#24221b" />
        </g>
      </svg>
    </div>
  );
}
