"use client";

import { useEffect, useRef } from "react";

type Waypoint = { p: number; x: number; y: number; scale: number };

const desktopPath: Waypoint[] = [
  { p: 0.00, x: 79, y: 47, scale: 1.00 },
  { p: 0.09, x: 67, y: 24, scale: 0.92 },
  { p: 0.18, x: 18, y: 43, scale: 0.86 },
  { p: 0.29, x: 83, y: 59, scale: 0.96 },
  { p: 0.40, x: 17, y: 28, scale: 0.82 },
  { p: 0.51, x: 77, y: 36, scale: 0.92 },
  { p: 0.61, x: 48, y: 62, scale: 1.12 },
  { p: 0.70, x: 20, y: 35, scale: 0.84 },
  { p: 0.80, x: 78, y: 47, scale: 0.90 },
  { p: 0.90, x: 24, y: 57, scale: 0.82 },
  { p: 1.00, x: 76, y: 20, scale: 0.96 },
];

const mobilePath: Waypoint[] = [
  { p: 0.00, x: 82, y: 30, scale: 0.78 },
  { p: 0.22, x: 15, y: 26, scale: 0.70 },
  { p: 0.42, x: 84, y: 36, scale: 0.74 },
  { p: 0.63, x: 18, y: 29, scale: 0.70 },
  { p: 0.82, x: 82, y: 34, scale: 0.72 },
  { p: 1.00, x: 70, y: 20, scale: 0.74 },
];

function smooth(value: number) {
  return value * value * (3 - 2 * value);
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

export function PageBee() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const beeRef = useRef<SVGSVGElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const bee = beeRef.current;
    if (!wrapper || !bee) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const localScenes = Array.from(document.querySelectorAll<HTMLElement>("#put-pcele, .honey-harvest"));
    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const render = () => {
      raf = 0;
      if (reduced.matches) {
        wrapper.style.opacity = "0";
        return;
      }

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const points = window.innerWidth < 720 ? mobilePath : desktopPath;
      const point = sample(points, progress);
      const x = window.innerWidth * point.x / 100;
      const y = window.innerHeight * point.y / 100;
      const dx = x - lastX;
      const dy = y - lastY;
      const angle = Math.max(-34, Math.min(34, Math.atan2(dy, Math.abs(dx) + 0.01) * 180 / Math.PI));
      const facing = dx < -0.2 ? -1 : 1;
      const banking = angle * 0.42;

      const handoffActive = localScenes.some((scene) => {
        const sceneRect = scene.getBoundingClientRect();
        const focusY = window.innerHeight * 0.48;
        return sceneRect.top < focusY && sceneRect.bottom > focusY;
      });
      const edgeOpacity = progress < 0.012 ? 0 : progress > 0.985 ? 0.25 : 1;
      wrapper.style.opacity = String(handoffActive ? Math.min(edgeOpacity, 0.08) : edgeOpacity);
      wrapper.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${point.scale})`;
      bee.style.transform = `rotate(${banking}deg) scaleX(${facing})`;
      wrapper.style.setProperty("--flight-speed", `${Math.min(1.35, 0.72 + Math.hypot(dx, dy) / 18)}s`);
      wrapper.style.setProperty("--bee-glow", `${0.28 + Math.sin(progress * 30) * 0.05}`);
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate3d(${facing * -7}px, 17px, 0) scale(${0.82 + point.scale * 0.08})`;
      }
      lastX = x;
      lastY = y;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (resizeObserver) resizeObserver.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener?.("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener?.("change", schedule);
      resizeObserver?.disconnect();
      if (raf) cancelAnimationFrame(raf);
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
