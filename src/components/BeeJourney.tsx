"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cameraShift, createSceneLoop, smoothstep } from "@/src/lib/scene";

// Pre-paint scene ownership without tripping the SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STAGES = [
  { index: "01", short: "Cvet i voće" },
  { index: "02", short: "Med i bilje" },
  { index: "03", short: "Craft" },
  { index: "04", short: "Panonija" },
];

const STAGE_WINDOWS: Array<[number, number]> = [
  [-0.05, 0.32],
  [0.27, 0.55],
  [0.5, 0.75],
  [0.7, 1.05],
];

// Resting visibility per stage: the landscape never empties, the active
// vignette carries full presence.
const STAGE_FLOORS = [0.55, 0.5, 0.5, 0.45];

const ROUTE_D = "M75 400 C150 300 220 430 310 330 C390 242 440 138 545 172 C650 206 640 338 735 312 C780 302 792 322 790 348";

export function BeeJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const routeProgRef = useRef<SVGPathElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tracerRef = useRef<HTMLSpanElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<SVGGElement>(null);
  const berryRef = useRef<SVGGElement>(null);
  const lemonRef = useRef<SVGGElement>(null);
  const stageRefs = useRef<Array<SVGGElement | null>>([]);
  const washRefs = useRef<Array<SVGEllipseElement | null>>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const path = pathRef.current;
    const bee = beeRef.current;
    if (!section || !path || !bee) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    let length = 0;
    try {
      length = path.getTotalLength();
    } catch {
      length = 1000;
    }
    if (routeProgRef.current) {
      routeProgRef.current.setAttribute("stroke-dasharray", String(length));
    }

    let sceneWidth = 0;
    let lastShift = 0;
    let stageIndex = -1;

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const measureScene = () => {
      sceneWidth = scene?.getBoundingClientRect().width ?? 0;
    };

    const stageWeight = (progress: number, i: number) => {
      const [start, end] = STAGE_WINDOWS[i];
      return Math.min(smoothstep((progress - start) / 0.05), smoothstep((end - progress) / 0.05));
    };

    const paintStatic = () => {
      try {
        const p = path.getPointAtLength(length * 0.86);
        bee.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(-7) scale(1.25)`);
      } catch {
        /* static fallback */
      }
      stageRefs.current.forEach((node) => {
        if (!node) return;
        node.style.opacity = "1";
        node.style.scale = "1";
      });
      washRefs.current.forEach((node) => {
        if (node) node.style.opacity = "1";
      });
      if (routeProgRef.current) routeProgRef.current.style.strokeDashoffset = "0";
      if (introRef.current) {
        introRef.current.style.opacity = "1";
        introRef.current.style.transform = "translateX(-50%)";
      }
      if (outroRef.current) {
        outroRef.current.style.opacity = "1";
        outroRef.current.style.transform = "translate(-50%, 0)";
      }
      if (tracerRef.current) tracerRef.current.style.width = "100%";
      if (scene) {
        scene.style.translate = "";
        lastShift = 0;
      }
    };

    const paint = (progress: number) => {
      const eased = smoothstep(progress);
      const distance = length * Math.min(0.985, Math.max(0, eased));
      try {
        const p = path.getPointAtLength(distance);
        const p2 = path.getPointAtLength(Math.min(length, distance + 2));
        const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        // Slight perpendicular independence so the bee doesn't look glued
        // to the route spline.
        const wobble = Math.sin(progress * Math.PI * 2) * 5;
        const nx = -(p2.y - p.y);
        const ny = p2.x - p.x;
        const nLen = Math.hypot(nx, ny) || 1;
        const ox = (nx / nLen) * wobble;
        const oy = (ny / nLen) * wobble;
        bee.setAttribute(
          "transform",
          `translate(${(p.x + ox).toFixed(1)} ${(p.y + oy).toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.25)`,
        );
        // Narrow screens: intentional phase shots (flower/lemon →
        // berry/honey/herbs → house) instead of chasing the bee.
        if (scene && window.innerWidth < 720) {
          const lerpShot = (a: number, b: number, t: number) => a + (b - a) * t;
          const shot = lerpShot(lerpShot(180, 570, smoothstep((progress - 0.3) / 0.08)), 800, smoothstep((progress - 0.62) / 0.08));
          const shift = cameraShift(shot, 1000, window.innerWidth, sceneWidth);
          if (Math.abs(shift - lastShift) > 0.5) {
            scene.style.translate = `${shift.toFixed(1)}px 0`;
            lastShift = shift;
          }
        } else if (scene && lastShift !== 0) {
          scene.style.translate = "";
          lastShift = 0;
        }
      } catch {
        /* keep last pose on path errors */
      }

      if (routeProgRef.current) {
        routeProgRef.current.style.strokeDashoffset = String(length * (1 - eased));
      }

      if (introRef.current) {
        // Intro reads fully, then exits cleanly early: never a pale ghost
        // sitting behind the scene.
        const o = 1 - smoothstep((progress - 0.1) / 0.08);
        introRef.current.style.opacity = o.toFixed(3);
        introRef.current.style.transform = `translateX(-50%) translateY(${((1 - o) * -12).toFixed(1)}px)`;
      }
      if (outroRef.current) {
        const o = smoothstep((progress - 0.68) / 0.22);
        outroRef.current.style.opacity = o.toFixed(3);
        outroRef.current.style.transform = `translate(-50%, ${((1 - o) * 18).toFixed(1)}px)`;
      }

      // Stage focus: exactly one vignette carries full presence; the rest
      // settle to their resting floors. Warms washes + rail follow.
      let best = 0;
      let bestWeight = -1;
      const weights = STAGES.map((_, i) => {
        const w = stageWeight(progress, i);
        if (w > bestWeight) {
          bestWeight = w;
          best = i;
        }
        return w;
      });
      stageRefs.current.forEach((node, i) => {
        if (!node) return;
        const w = weights[i] ?? 0;
        node.style.opacity = (STAGE_FLOORS[i] + (1 - STAGE_FLOORS[i]) * w).toFixed(3);
        node.style.scale = (0.97 + 0.06 * w).toFixed(3);
      });
      washRefs.current.forEach((node, i) => {
        if (node) node.style.opacity = (0.15 + 0.85 * (weights[i] ?? 0)).toFixed(3);
      });
      if (best !== stageIndex) {
        stageIndex = best;
        railRef.current?.querySelectorAll(".bee-journey__rail-item").forEach((item, i) => {
          item.classList.toggle("is-active", i === best);
        });
      }
      if (tracerRef.current) tracerRef.current.style.width = `${(eased * 100).toFixed(1)}%`;

      // Subtle ingredient parallax: ~2-3px, ~1deg. Rooted, never jumping.
      const react = (node: SVGGElement | null, point: number, direction: number) => {
        if (!node) return;
        const d = Math.max(0, 1 - Math.abs(progress - point) * 7);
        const e = smoothstep(d);
        node.style.transform =
          `translate(${(e * 2.6 * direction).toFixed(2)}px, ${(-e * 3).toFixed(2)}px) ` +
          `rotate(${(e * 1.2 * direction).toFixed(2)}deg)`;
      };
      react(lemonRef.current, 0.23, 1);
      react(berryRef.current, 0.42, -1);
      react(leafRef.current, 0.58, 1);
    };

    const onResize = () => {
      try {
        length = path.getTotalLength();
        routeProgRef.current?.setAttribute("stroke-dasharray", String(length));
      } catch {
        /* keep previous length */
      }
      measureScene();
    };

    measureScene();
    window.addEventListener("resize", onResize);
    // Own the scene before first paint: no flash of unmanaged state, and the
    // initial frame already matches the live scroll position.
    section.classList.add("is-live");
    if (media.matches) paintStatic();
    else paint(readProgress());
    const stopLoop = createSceneLoop(
      section,
      media,
      {
        paint,
        readTarget: readProgress,
        advance: (current, target, blend) => current + (target - current) * blend,
        paintStatic,
      },
      0.16,
    );
    return () => {
      window.removeEventListener("resize", onResize);
      stopLoop();
    };
  }, []);

  return (
    <section id="put-pcele" ref={sectionRef} className="bee-journey" aria-label="Od sastojaka do Harmonija Panonije">
      <div className="bee-journey__sticky">
        <div ref={introRef} className="bee-journey__intro shell">
          <p className="eyebrow"><span />Jedan mali put</p>
          <h2>Priroda → sastojci → craft → Panonija.</h2>
          <p>Put vodi od cveta i voća, preko meda i bilja, do prepoznatljive vojvođanske kućice sa etiketa.</p>
        </div>

        <svg ref={sceneRef} className="bee-scene" viewBox="0 0 1000 560" role="img" aria-label="Stilizovana pčela leti kroz sastojke ka vojvođanskoj kućici">
          <defs>
            <linearGradient id="honeyGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e7b95d" stopOpacity=".3" />
              <stop offset="1" stopColor="#d38b2e" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sageWash" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#7e9379" stopOpacity=".16" />
              <stop offset="1" stopColor="#7e9379" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="honeyWash" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#e7b95d" stopOpacity=".2" />
              <stop offset="1" stopColor="#e7b95d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Static depth washes */}
          <ellipse cx="300" cy="300" rx="270" ry="150" fill="url(#sageWash)" />
          <ellipse cx="790" cy="240" rx="220" ry="150" fill="url(#honeyWash)" />
          {/* Distant Panonian horizon + faint orchard row */}
          <g className="bee-scene__backdrop" aria-hidden="true">
            <path d="M-20 152C200 132 400 152 600 140c150-9 280 0 440-12" />
            <g className="bee-scene__orchard" aria-hidden="true">
              <circle cx="180" cy="168" r="7" /><circle cx="340" cy="162" r="8" /><circle cx="520" cy="166" r="7" /><circle cx="700" cy="160" r="8" /><circle cx="860" cy="164" r="7" />
              <path d="M180 175v14M340 170v14M520 173v14M700 168v14M860 171v14" />
            </g>
            <path d="M60 520C90 440 110 380 140 320M96 452c-46-12-66-44-54-72 42 2 64 28 54 72ZM118 398c44-14 66-44 52-70-40 6-62 30-52 70Z" />
            <path d="M920 480c-20-70-26-130-22-190M908 372c40-14 58-42 46-68-38 4-56 28-46 68Z" />
          </g>

          <path className="bee-scene__contour" d="M-50 440 C130 395 240 488 375 420 C535 339 621 194 786 172 C899 158 974 206 1065 134" />
          {/* Tracing route: faint full path + honey progress drawn with scroll. */}
          <path ref={pathRef} className="bee-scene__route-base" d={ROUTE_D} />
          <path
            ref={routeProgRef}
            className="bee-scene__route-prog"
            d={ROUTE_D}
            pathLength={1000}
            strokeDasharray={1000}
            strokeDashoffset={1000}
          />

          {/* Foreground field band: grounds the panorama so landmarks read
              as one editorial illustration instead of isolated icons. */}
          <g className="bee-scene__foreground" aria-hidden="true">
            <path d="M-20 508 C150 472 300 502 450 480 C600 460 750 492 1020 464" />
            <path d="M-20 532 C160 500 320 526 470 506 C620 488 770 514 1020 494" />
            <path d="M150 502c8-22 12-40 14-58M690 484c-6-20-8-38-8-56M880 476c8-18 12-34 14-50" />
          </g>

          {/* STAGE 01 — origin: flower cluster, bud, fruit, bee arrival. */}
          <g ref={(node) => { stageRefs.current[0] = node; }} className="scene-stage-group" data-stage="0" aria-hidden="true">
            <ellipse ref={(node) => { washRefs.current[0] = node; }} cx="150" cy="392" rx="120" ry="72" fill="url(#sageWash)" />
            <g transform="translate(130 430)" className="scene-bloom-core">
              <path d="M0 36C-2 14-4-6-6-38" strokeWidth="2" />
              <ellipse cx="-34" cy="-24" rx="24" ry="11" transform="rotate(-24 -34 -24)" className="scene-fill-sage" />
              <ellipse cx="34" cy="-24" rx="24" ry="11" transform="rotate(24 34 -24)" className="scene-fill-sage" />
              <ellipse cx="0" cy="-56" rx="15" ry="26" className="scene-fill-paper" />
              <ellipse cx="-23" cy="-42" rx="12" ry="21" transform="rotate(-36 -23 -42)" className="scene-fill-paper" />
              <ellipse cx="23" cy="-42" rx="12" ry="21" transform="rotate(36 23 -42)" className="scene-fill-paper" />
              <circle cx="0" cy="-34" r="12" className="scene-fill-honey" />
              <circle cx="44" cy="-6" r="7" className="scene-fill-sage" />
              <path d="M40 58C43 34 45 14 47-2" strokeWidth="1.6" />
              <circle cx="66" cy="6" r="4" className="scene-fill-berry" />
              <circle cx="78" cy="-6" r="3.4" className="scene-fill-berry" />
              <circle cx="60" cy="-12" r="3" className="scene-fill-berry" />
              <path d="M-4 30C-40 24-56 6-58-14" strokeWidth="1.6" />
            </g>
            <text className="scene-stage" x="72" y="352">01</text>
          </g>

          {/* STAGE 02 — ingredients: lemon branch, berry stem, herb sprig. */}
          <g ref={(node) => { stageRefs.current[1] = node; }} className="scene-stage-group" data-stage="1" aria-hidden="true">
            <ellipse ref={(node) => { washRefs.current[1] = node; }} cx="365" cy="300" rx="140" ry="95" fill="url(#sageWash)" />
            <g transform="translate(290 330)">
              <g ref={lemonRef} className="scene-ingredient__motion scene-ingredient--lemon">
                <path d="M-62 34C-32 14-2 4 40-12" strokeWidth="1.8" />
                <ellipse cx="8" cy="-4" rx="42" ry="32" transform="rotate(-18 8 -4)" />
                <path d="M-12-30c8-12 24-12 32-4M-16 8l44-24M-8-28l16 48" strokeWidth="1.2" />
                <path d="M-52 26c-16-2-28-12-30-26 14-2 28 8 30 26ZM32-12c14-8 30-8 38 2-10 10-28 10-38-2Z" className="scene-fill-sage" strokeWidth="1.4" />
              </g>
              <text className="scene-stage" x="-78" y="-58">02</text>
            </g>
            <g transform="translate(440 230)">
              <g ref={berryRef} className="scene-ingredient__motion scene-ingredient--berry">
                <path d="M0 52C-6 22-4-8 6-38" strokeWidth="1.8" />
                <circle cx="6" cy="-44" r="13" /><circle cx="-12" cy="-30" r="11" /><circle cx="22" cy="-26" r="10" /><circle cx="2" cy="-10" r="12" /><circle cx="26" cy="-6" r="9" />
                <path d="M-8-52c6-10 18-12 28-8M-14-34c-10-8-24-8-30 0" strokeWidth="1.2" />
              </g>
            </g>
            <g transform="translate(360 420)">
              <g ref={leafRef} className="scene-ingredient__motion scene-ingredient--leaf">
                <path d="M0 52C2 22 4-3 6-30" strokeWidth="1.8" />
                <path d="M3 30c-22-6-32-20-26-32 18 1 28 12 26 32ZM5 8c20-7 29-20 23-31-17 3-25 13-23 31ZM2 46c-18-1-28-9-27-21 15-2 26 6 27 21Z" className="scene-fill-sage" strokeWidth="1.3" />
              </g>
            </g>
          </g>

          {/* STAGE 03 — craft: smaller drop, botanical stem, vessel arc, wash. */}
          <g ref={(node) => { stageRefs.current[2] = node; }} className="scene-stage-group" data-stage="2" aria-hidden="true">
            <ellipse ref={(node) => { washRefs.current[2] = node; }} cx="590" cy="275" rx="130" ry="90" fill="url(#honeyWash)" />
            <g transform="translate(585 262) scale(0.85)" className="scene-ingredient scene-ingredient--honey">
              <path d="M0-34c22 27 33 44 33 63A33 33 0 1 1-33 29C-33 10-22-7 0-34Z" />
              <ellipse cx="0" cy="16" rx="49" ry="49" fill="url(#honeyGlow)" stroke="none" />
            </g>
            <path d="M507 352Q585 386 663 352" className="scene-vessel" />
            <path d="M525 358Q585 382 645 358" className="scene-vessel scene-vessel--inner" />
            <g transform="translate(672 318)" className="scene-ingredient--stem">
              <path d="M0 60C3 30 5 0 8-28" strokeWidth="1.8" />
              <path d="M4 28c-20-5-29-18-24-29 16 1 25 11 24 29ZM6 4c18-6 26-18 21-28-15 2-23 12-21 28Z" className="scene-fill-sage" strokeWidth="1.3" />
            </g>
            <text className="scene-stage" x="500" y="196">03</text>
          </g>

          {/* STAGE 04 — destination: Panonian house in the Story vocabulary. */}
          <g ref={(node) => { stageRefs.current[3] = node; }} className="scene-stage-group" data-stage="3" aria-hidden="true">
            <ellipse ref={(node) => { washRefs.current[3] = node; }} cx="790" cy="250" rx="150" ry="100" fill="url(#honeyWash)" />
            <g transform="translate(752 238)" className="scene-house">
              <path d="M-104 96V34l60-44 60 16v90h-120Z" strokeWidth="1.6" />
              <path d="M-114 38 44-52l116 90" strokeWidth="1.6" />
              <path d="M-120 40h250" strokeWidth="2" />
              <circle cx="44" cy="-16" r="10" strokeWidth="1.4" />
              <path d="M39-16h10M44-21v10" strokeWidth="1.2" />
              <path d="M-80 96V52h30v44M66 96V52h30v44" strokeWidth="1.4" />
              <path d="M-86 44h42M-84 52h38M62 44h42M64 52h38" strokeWidth="1" />
              <path d="M-6 96V64a13 14 0 0 1 26 0v32M-12 96h38" strokeWidth="1.4" />
              <path d="M84-34v-32h16v40" strokeWidth="1.4" />
              <path d="M-112 96h240" strokeWidth="1.4" />
              <text x="4" y="122" textAnchor="middle">HARMONIJE PANONIJE</text>
            </g>
            <g className="scene-house__garden" aria-hidden="true" strokeWidth="1.3">
              <path d="M648 372v-46M642 344l12-6" />
              <circle cx="648" cy="312" r="17" className="scene-fill-sage" />
              <circle cx="642" cy="316" r="2.6" className="scene-fill-berry" />
              <circle cx="654" cy="308" r="2.6" className="scene-fill-berry" />
              <path d="M892 368v-40M886 344l12-6" />
              <circle cx="892" cy="312" r="15" className="scene-fill-sage" />
              <circle cx="898" cy="308" r="2.4" className="scene-fill-berry" />
              <path d="M610 400h8M626 400h8M642 400h8M658 400h8M906 396h8M922 396h8M938 396h8M954 396h8M602 388h280M898 384h84" />
            </g>
            <text className="scene-stage" x="892" y="128">04</text>
          </g>

          <g ref={beeRef} className="scene-bee" transform="translate(75 375) scale(1.25)">
            <ellipse cx="0" cy="0" rx="15" ry="9" />
            <path d="M-10-2h20M-6-8 1 8M5-7 10 5" />
            {/*
              Wing ownership (HP-39): base splay lives on the static SVG
              anchor; the CSS flap animates only the inner shape, so the two
              transforms never compete for the same layer.
            */}
            <g transform="rotate(-35 -7 -12)">
              <ellipse className="scene-bee__wing scene-bee__wing--a" cx="-7" cy="-12" rx="9" ry="5" />
            </g>
            <g transform="rotate(35 6 -12)">
              <ellipse className="scene-bee__wing scene-bee__wing--b" cx="6" cy="-12" rx="9" ry="5" />
            </g>
            <path d="M-15-1c-9-8-13-4-14 1M15-1c8-8 12-4 13 1" />
          </g>
        </svg>

        {/* Editorial journey rail: the narrative annotation of the scene. */}
        <div ref={railRef} className="bee-journey__rail" aria-hidden="true">
          {STAGES.map((stage, i) => (
            <span key={stage.index} className={i === 0 ? "bee-journey__rail-item is-active" : "bee-journey__rail-item"}>
              <i>{stage.index}</i><em>{stage.short}</em>
            </span>
          ))}
          <span ref={tracerRef} className="bee-journey__rail-tracer" style={{ width: "0%" }} />
        </div>

        <div ref={outroRef} className="bee-journey__outro shell">
          <span className="section-number">02</span>
          <p>Prepoznatljiva vojvođanska kućica sa etiketa vraća priču tamo gde pripada — u Panoniju, ručni rad i identitet proizvoda.</p>
        </div>
      </div>
    </section>
  );
}
