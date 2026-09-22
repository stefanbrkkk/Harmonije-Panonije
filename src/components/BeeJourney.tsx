"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cameraShift, createSceneLoop, smoothstep } from "@/src/lib/scene";

// Pre-paint scene ownership without tripping the SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STAGES = [
  { index: "01", text: "Cvet i voće — početak puta" },
  { index: "02", text: "Med i bilje — darovi livade" },
  { index: "03", text: "Zlatna kap — craft u nastajanju" },
  { index: "04", text: "Panonija — dom sa etikete" },
];

const STAGE_WINDOWS: Array<[number, number]> = [
  [-0.05, 0.32],
  [0.27, 0.55],
  [0.5, 0.75],
  [0.7, 1.05],
];

export function BeeJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const houseRef = useRef<SVGGElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<SVGGElement>(null);
  const berryRef = useRef<SVGGElement>(null);
  const lemonRef = useRef<SVGGElement>(null);

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

    const paintStatic = () => {
      try {
        const p = path.getPointAtLength(length * 0.86);
        bee.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(-7)`);
      } catch {
        /* static fallback */
      }
      if (houseRef.current) {
        houseRef.current.style.opacity = "1";
        houseRef.current.style.transform = "none";
      }
      if (introRef.current) {
        introRef.current.style.opacity = "1";
        introRef.current.style.transform = "translateX(-50%)";
      }
      if (outroRef.current) {
        outroRef.current.style.opacity = "1";
        outroRef.current.style.transform = "translate(-50%, 0)";
      }
      if (captionRef.current) {
        captionRef.current.style.opacity = "1";
        captionRef.current.style.transform = "translateX(-50%)";
      }
      if (scene) {
        scene.style.translate = "";
        lastShift = 0;
      }
    };

    const paint = (progress: number) => {
      const eased = smoothstep(progress);      const distance = length * Math.min(0.985, Math.max(0, eased));
      try {
        const p = path.getPointAtLength(distance);
        const p2 = path.getPointAtLength(Math.min(length, distance + 2));
        const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        // Slight perpendicular independence so the bee doesn't look glued to
        // the dotted debug spline.
        const wobble = Math.sin(progress * Math.PI * 2) * 5;
        const nx = -(p2.y - p.y);
        const ny = p2.x - p.x;
        const nLen = Math.hypot(nx, ny) || 1;
        const ox = (nx / nLen) * wobble;
        const oy = (ny / nLen) * wobble;
        bee.setAttribute(
          "transform",
          `translate(${(p.x + ox).toFixed(1)} ${(p.y + oy).toFixed(1)}) rotate(${angle.toFixed(1)})`,
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
      if (houseRef.current) {
        // The destination anchors the right side early (never a ghost),
        // resolving to full presence at the final stage.
        const o = smoothstep((progress - 0.56) / 0.28);
        const opacity = 0.45 + o * 0.55;
        houseRef.current.style.opacity = opacity.toFixed(3);
        houseRef.current.style.transform = `scale(${(0.94 + o * 0.06).toFixed(3)})`;
      }

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

      // Persistent stage caption: exactly one textual anchor is dominant at
      // any progress, so the long middle of the scene never goes quiet.
      if (captionRef.current) {
        let best = 0;
        let bestWeight = -1;
        for (let i = 0; i < STAGES.length; i += 1) {
          const [start, end] = STAGE_WINDOWS[i];
          const enter = smoothstep((progress - start) / 0.05);
          const exit = smoothstep((end - progress) / 0.05);
          const weight = Math.min(enter, exit);
          if (weight > bestWeight) {
            bestWeight = weight;
            best = i;
          }
        }
        if (best !== stageIndex) {
          stageIndex = best;
          const label = captionRef.current.querySelector("p");
          if (label) label.textContent = STAGES[best].text;
        }
        // Small screens hand the ending to the house + outro: the caption
        // would collide with the centered house label at the final stage.
        const endFade = window.innerWidth < 720 ? 1 - smoothstep((progress - 0.88) / 0.07) : 1;
        captionRef.current.style.opacity = (bestWeight * endFade).toFixed(3);
      }
    };

    const onResize = () => {
      try {
        length = path.getTotalLength();
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
        <div ref={captionRef} className="bee-journey__caption shell" aria-live="off">
          <p>Cvet i voće — početak puta</p>
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
          {/* Faint background botanical silhouettes */}
          <g className="bee-scene__backdrop" aria-hidden="true">
            <path d="M60 520C90 440 110 380 140 320M96 452c-46-12-66-44-54-72 42 2 64 28 54 72ZM118 398c44-14 66-44 52-70-40 6-62 30-52 70Z" />
            <path d="M920 480c-20-70-26-130-22-190M908 372c40-14 58-42 46-68-38 4-56 28-46 68Z" />
            <path d="M880 120c30 22 68 30 108 26M852 210c22-30 58-44 96-40" />
          </g>

          <path className="bee-scene__contour" d="M-50 440 C130 395 240 488 375 420 C535 339 621 194 786 172 C899 158 974 206 1065 134" />
          <path ref={pathRef} className="bee-scene__path" d="M75 400 C150 300 220 430 310 330 C390 242 440 138 545 172 C650 206 640 338 735 312 C815 290 830 228 880 202" />

          {/* Foreground field band: grounds the panorama so landmarks read
              as one editorial illustration instead of isolated icons. */}
          <g className="bee-scene__foreground" aria-hidden="true">
            <path d="M-20 508 C150 472 300 502 450 480 C600 460 750 492 1020 464" />
            <path d="M-20 532 C160 500 320 526 470 506 C620 488 770 514 1020 494" />
            <path d="M150 502c8-22 12-40 14-58M690 484c-6-20-8-38-8-56M880 476c8-18 12-34 14-50" />
          </g>

          <g transform="translate(112 442)" className="scene-ingredient scene-ingredient--bloom">
            <g className="scene-ingredient__static">
              <path d="M0 40C2 10 4-12 6-34" />
              <ellipse cx="-38" cy="-28" rx="26" ry="12" transform="rotate(-24 -38 -28)" style={{ fill: "rgba(126,147,121,.25)" }} />
              <ellipse cx="38" cy="-28" rx="26" ry="12" transform="rotate(24 38 -28)" style={{ fill: "rgba(126,147,121,.25)" }} />
              <ellipse cx="0" cy="-52" rx="15" ry="26" style={{ fill: "#fbf7ec" }} />
              <ellipse cx="-24" cy="-38" rx="13" ry="22" transform="rotate(-38 -24 -38)" style={{ fill: "#fbf7ec" }} />
              <ellipse cx="24" cy="-38" rx="13" ry="22" transform="rotate(38 24 -38)" style={{ fill: "#fbf7ec" }} />
              <circle cx="0" cy="-30" r="13" style={{ fill: "#d8a248" }} />
              <circle cx="-6" cy="-34" r="3.4" style={{ fill: "#7a4f0e", stroke: "none" }} />
              <circle cx="7" cy="-26" r="3" style={{ fill: "#7a4f0e", stroke: "none" }} />
            </g>
            <text className="scene-stage" x="-58" y="-72">01</text>
          </g>

          <g transform="translate(250 330) scale(1.2)" className="scene-ingredient scene-ingredient--lemon">
            <g ref={lemonRef} className="scene-ingredient__motion">
              <ellipse cx="0" cy="0" rx="47" ry="36" transform="rotate(-18)" />
              <path d="M-10 -31c10-26 35-21 40-5" />
              <path d="M-32 -2h64M0-31V29M-23-22 23 22M23-22-23 22" />
            </g>
            <text className="scene-stage" x="-64" y="-52">02</text>
          </g>

          <g transform="translate(470 178) scale(1.2)" className="scene-ingredient scene-ingredient--berry">
            <g ref={berryRef} className="scene-ingredient__motion">
              <circle cx="-20" cy="10" r="17" /><circle cx="9" cy="1" r="18" /><circle cx="28" cy="24" r="15" /><circle cx="-4" cy="30" r="17" />
              <path d="M2-18c10-20 30-24 43-16M3-17c-8-19-26-23-39-15" />
            </g>
          </g>

          <g transform="translate(665 335) scale(1.18)" className="scene-ingredient scene-ingredient--leaf">
            <g ref={leafRef} className="scene-ingredient__motion">
              <path d="M0 68C4 27 6-10 11-62" />
              <path d="M7 30c-38-10-54-35-44-55 31 2 49 20 44 55Z" />
              <path d="M10 5c35-12 50-36 38-55-29 5-44 23-38 55Z" />
              <path d="M4 52c-31 0-50-16-48-34 27-5 46 7 48 34Z" />
            </g>
          </g>

          <g className="scene-ingredient scene-ingredient--honey" transform="translate(585 260) scale(1.15)">
            <path d="M0-34c22 27 33 44 33 63A33 33 0 1 1-33 29C-33 10-22-7 0-34Z" />
            <ellipse cx="0" cy="16" rx="49" ry="49" fill="url(#honeyGlow)" stroke="none" />
            <text className="scene-stage" x="-72" y="-48">03</text>
          </g>

          <g transform="translate(760 235) scale(1.22)" className="scene-house__anchor">
            <g ref={houseRef} className="scene-house">
              <path d="M0 76V-5L108-77 216-5v81H0Z" />
              <path d="M40 76V6h55v70M125 12h52v38h-52z" />
              <path d="M-9-3 108-91 225-3" />
              <circle cx="108" cy="-34" r="9" />
              <path className="scene-house__check" d="M16 59h182M16 39h182M34-3v79M62-22v98M90-40v116M118-40v116M146-22v98M174-4v80" />
              <text x="108" y="107" textAnchor="middle">HARMONIJE PANONIJE</text>
            </g>
            <text className="scene-stage" x="150" y="-96">04</text>
          </g>

          <g ref={beeRef} className="scene-bee" transform="translate(75 375)">
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

        <div ref={outroRef} className="bee-journey__outro shell">
          <span className="section-number">02</span>
          <p>Prepoznatljiva vojvođanska kućica sa etiketa vraća priču tamo gde pripada — u Panoniju, ručni rad i identitet proizvoda.</p>
        </div>
      </div>
    </section>
  );
}
