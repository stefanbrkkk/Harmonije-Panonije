"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cameraShift, createSceneLoop, phaseProgress, smoothstep } from "@/src/lib/scene";

// Pre-paint scene ownership without tripping the SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Flower head (nectar) center in macro viewBox coordinates.
const FLOWER_X = 106;
const FLOWER_Y = 242;
// Pour geometry, all in the same viewBox system: bee pour pose, stream
// endpoints, drop release and comb surface share these constants.
const POUR_X = 592;
const POUR_Y = 262;
const STREAM_TOP_X = 592;
const STREAM_TOP_Y = 296;
const STREAM_BOT_X = 588;
const STREAM_BOT_Y = 366;

// Static honeycomb hex grid (flat-top hexagons, radius 20). Rendered once;
// only the single gold fill rect below is animated per frame.
const HEX_R = 20;
const HEX_W = HEX_R * 1.5;
const HEX_H = Math.sin(Math.PI / 3) * HEX_R * 2;
const COMB_SURFACE_Y = (x: number) => 372 - ((x - 492) * 40) / 308;
const hexPoints = (cx: number, cy: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + HEX_R * Math.cos(a)).toFixed(1)},${(cy + HEX_R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
const combCells: Array<{ points: string; key: string }> = [];
{
  let col = 0;
  for (let x = 505; x <= 795; x += HEX_W) {
    const offset = col % 2 === 1 ? HEX_H / 2 : 0;
    let row = 0;
    for (let y = 352 + offset; y <= 515; y += HEX_H) {
      if (y > COMB_SURFACE_Y(x) - 16) {
        combCells.push({ points: hexPoints(x, y), key: `${col}-${row}` });
      }
      row += 1;
    }
    col += 1;
  }
}
const COMB_REGION = "492,372 800,332 800,520 492,520";

export function HoneyHarvestSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const macroRef = useRef<SVGSVGElement>(null);
  const dropRef = useRef<SVGCircleElement>(null);
  const streamRef = useRef<SVGPathElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const wingLRef = useRef<SVGGElement>(null);
  const wingRRef = useRef<SVGGElement>(null);
  const probRef = useRef<SVGPathElement>(null);
  const shimmerRef = useRef<SVGCircleElement>(null);
  const flowerRef = useRef<SVGGElement>(null);
  const combRef = useRef<SVGGElement>(null);
  const fillRef = useRef<SVGRectElement>(null);
  const copyARef = useRef<HTMLDivElement>(null);
  const copyBRef = useRef<HTMLDivElement>(null);
  const copyCRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / span));
    };

    // Narrow-screen camera state (reads coalesced, writes only on change).
    let macroWidth = 0;
    let sceneWidth = 0;
    let lastShift = 0;
    // The comb is drawn past the macro's own box (overflow: visible), so the
    // pan must bring its real right edge into the scene, not just the box.
    let contentRight = 0;
    const measureMacro = () => {
      const scene = macroRef.current?.parentElement;
      macroWidth = macroRef.current?.getBoundingClientRect().width ?? 0;
      sceneWidth = scene?.getBoundingClientRect().width ?? 0;
      const comb = combRef.current?.getBoundingClientRect();
      contentRight = comb && scene ? comb.right - lastShift - scene.getBoundingClientRect().left : macroWidth;
    };

    // Ambient flap clock (frame units). Pose stays a pure function of
    // scroll progress; only the wing/nectar tremble phase advances with
    // wall time so fast scrolling can never alias it into strobing.
    let flapT = 0;

    const paint = (progress: number, dtUnits: number = 1) => {
      flapT += Math.min(4, Math.max(0.25, dtUnits));
      // Truly sequential timeline — each beat owns its window outright:
      // establish 0–.08, approach .08–.28, LAND .28–.31, DRINK .31–.40,
      // RETRACT .40–.45, takeoff .45–.53, carry .53–.70, align .70–.77,
      // pour+fill .77–.90, settle .90–1.
      const approach = phaseProgress(progress, 0.08, 0.28);
      const land = phaseProgress(progress, 0.28, 0.31);
      const drink = phaseProgress(progress, 0.31, 0.35) * (1 - phaseProgress(progress, 0.4, 0.45));
      const retract = 1 - phaseProgress(progress, 0.4, 0.45);
      const takeoff = phaseProgress(progress, 0.45, 0.53);
      const carry = phaseProgress(progress, 0.53, 0.7);
      const align = phaseProgress(progress, 0.7, 0.77);
      const deposit = phaseProgress(progress, 0.77, 0.9);
      const fill = deposit;

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      // Bee keyframes (viewBox coords). HOLD pins the head at the nectar;
      // POUR pins the bee over the stream origin through the whole pour.
      const HOLD_X = FLOWER_X + 30;
      const HOLD_Y = FLOWER_Y - 8;
      const LIFT_X = 140;
      const LIFT_Y = 214;

      let beeX = lerp(150, HOLD_X, approach);
      let beeY = lerp(150, HOLD_Y, approach) - Math.sin(approach * Math.PI) * 20;
      beeY -= Math.sin(land * Math.PI) * 3;
      let beeR = -10 - 4 * approach;
      beeX = lerp(beeX, LIFT_X, takeoff);
      beeY = lerp(beeY, LIFT_Y, takeoff);
      beeR = lerp(beeR, -6, takeoff);
      beeX = lerp(beeX, POUR_X, carry);
      beeY = lerp(beeY, POUR_Y, carry) - Math.sin(carry * Math.PI) * 18;
      beeR = lerp(beeR, 2, carry);
      beeY = lerp(beeY, POUR_Y + 6, align);
      beeR = lerp(beeR, 6, align);
      const settle = phaseProgress(progress, 0.9, 1);
      beeX += settle * 4;
      beeY += settle * 4;

      if (beeRef.current) {
        beeRef.current.setAttribute(
          "transform",
          `translate(${beeX.toFixed(1)} ${beeY.toFixed(1)}) rotate(${beeR.toFixed(1)}) scale(${(0.9 + carry * 0.08).toFixed(3)})`,
        );
        // Narrow screens: stable phase shots instead of chasing the bee —
        // flower shot, carry shot, pour shot with quick blends between.
        if (macroRef.current && window.innerWidth < 720) {
          const shot = lerp(lerp(140, 360, smoothstep((progress - 0.5) / 0.06)), 590, smoothstep((progress - 0.68) / 0.06));
          const shift = cameraShift(shot, 760, window.innerWidth, macroWidth);
          if (Math.abs(shift - lastShift) > 0.5) {
            macroRef.current.style.translate = `${shift.toFixed(1)}px 0`;
            lastShift = shift;
          }
        } else if (macroRef.current) {
          // Mid-size desktops: the macro can overflow its scene column, so
          // pan once from the flower framing to the pour framing across
          // carry and align — never chasing, one intentional move per pass.
          // 26px keeps the comb clear of the scene's 24px right mask ramp.
          const overflow = Math.min(0, sceneWidth - 26 - Math.max(macroWidth, contentRight));
          // Spread over .2 of progress (late carry through align): the
          // comb-aware pan is longer, and the camera must glide with the
          // bee, never jump.
          const shift = overflow * smoothstep((progress - 0.6) / 0.2);
          if (Math.abs(shift - lastShift) > 0.5) {
            macroRef.current.style.translate = shift ? `${shift.toFixed(1)}px 0` : "";
            lastShift = shift;
          }
        }
      }

      // Wings: fold amount is scroll state, flap phase is wall time.
      const wingFold = -28 * phaseProgress(progress, 0.28, 0.33) * (1 - phaseProgress(progress, 0.45, 0.52));
      const wingAmp = 26 + wingFold * 0.77;
      const flap = wingFold + Math.sin(flapT * 0.35) * wingAmp;
      if (wingLRef.current) wingLRef.current.setAttribute("transform", `rotate(${flap.toFixed(1)} -8 -5)`);
      if (wingRRef.current) wingRRef.current.setAttribute("transform", `rotate(${(-flap * 0.85).toFixed(1)} 19 -7)`);
      // Proboscis is fully retracted before takeoff begins.
      if (probRef.current) {
        probRef.current.style.opacity = (phaseProgress(progress, 0.31, 0.35) * retract).toFixed(3);
      }
      if (shimmerRef.current) {
        const shimmer = phaseProgress(progress, 0.31, 0.35) * retract;
        shimmerRef.current.style.opacity = (shimmer * (0.3 + 0.15 * Math.sin(flapT * 0.3))).toFixed(3);
        shimmerRef.current.setAttribute("r", String(30 + 10 * shimmer));
      }

      if (flowerRef.current) {
        // Rooted: ambient sway plus a subtle collection lean during drink.
        const ambient = Math.sin(progress * Math.PI * 2) * 1.2;
        const y = ambient * (1 - drink * 0.5) + drink * 2.5;
        const r = ambient * 0.3 + drink * -1.2;
        flowerRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg)`;
      }

      // Single deterministic nectar timeline: bud at the flower during the
      // drink → attach under the bee through takeoff → carried → released
      // into the stream origin during align → merged into the pour.
      if (dropRef.current) {
        const bud = phaseProgress(progress, 0.31, 0.38);
        const attach = phaseProgress(progress, 0.45, 0.53);
        const merge = phaseProgress(progress, 0.8, 0.86);
        const carryX = beeX;
        const carryY = beeY + 20;
        const flow = phaseProgress(progress, 0.7, 0.78);
        const x = lerp(lerp(FLOWER_X, carryX, attach), STREAM_TOP_X, flow);
        const y = lerp(lerp(FLOWER_Y, carryY, attach), STREAM_TOP_Y, flow);
        const visible = bud > 0 && merge < 1;
        dropRef.current.setAttribute("cx", x.toFixed(1));
        dropRef.current.setAttribute("cy", y.toFixed(1));
        dropRef.current.setAttribute("r", String(4 + bud * 3 + carry * 2));
        dropRef.current.style.opacity = visible ? (1 - merge).toFixed(3) : "0";
      }
      if (streamRef.current) {
        const draw = phaseProgress(progress, 0.77, 0.89);
        streamRef.current.style.opacity = draw > 0.02 ? Math.min(1, draw * 2).toFixed(3) : "0";
        streamRef.current.style.strokeDashoffset = String(140 - draw * 140);
      }
      // Comb presence + the single gold fill layer (one animated element).
      if (combRef.current) {
        const intro = phaseProgress(progress, 0.6, 0.72);
        combRef.current.style.opacity = (0.55 + 0.45 * intro).toFixed(3);
      }
      if (fillRef.current) {
        const top = 520 - fill * 195;
        fillRef.current.setAttribute("y", top.toFixed(1));
        fillRef.current.setAttribute("height", (fill * 195).toFixed(1));
      }

      // Chapters aligned to visual actions: A approach/land/drink,
      // B carry/nectar transformation, C deposit/flavor story.
      // Sequential handoff (never a symmetric crossfade): the outgoing
      // chapter lifts away as it exits and the incoming rises only after
      // the switch point, so two large headings never share coordinates
      // at near-equal opacity. Single-point switch, pure function of
      // progress — reverse/fast/jump scrolling resolves identically.
      const fade = (node: HTMLDivElement | null, in0: number, in1: number, out0: number, out1: number) => {
        if (!node) return;
        const enter = smoothstep((progress - in0) / (in1 - in0));
        const exit = smoothstep((out1 - progress) / (out1 - out0));
        const o = Math.min(enter, exit);
        node.style.opacity = o.toFixed(3);
        node.style.transform = `translate3d(0, ${((1 - enter) * 14 - (1 - exit) * 22).toFixed(1)}px, 0)`;
        // Opacity only: faded chapters stay in the accessibility tree so
        // screen readers can read all three regardless of scroll position
        // (the copy layer is pointer-events:none, so nothing is hit-testable).
      };
      fade(copyARef.current, -0.05, 0.0, 0.3, 0.325);
      fade(copyBRef.current, 0.325, 0.35, 0.665, 0.68);
      fade(copyCRef.current, 0.68, 0.695, 1.02, 1.07);
    };

    const paintStatic = () => {
      // The final pour pose, so the static stream hangs from the bee.
      beeRef.current?.setAttribute("transform", "translate(596 272) rotate(6) scale(.98)");
      if (wingLRef.current) wingLRef.current.setAttribute("transform", "rotate(0 -8 -5)");
      if (wingRRef.current) wingRRef.current.setAttribute("transform", "rotate(0 19 -7)");
      if (probRef.current) probRef.current.style.opacity = "0";
      if (shimmerRef.current) shimmerRef.current.style.opacity = "0";
      if (flowerRef.current) flowerRef.current.style.transform = "none";
      if (dropRef.current) dropRef.current.style.opacity = "0";
      if (streamRef.current) {
        streamRef.current.style.opacity = ".9";
        streamRef.current.style.strokeDashoffset = "0";
      }
      if (combRef.current) combRef.current.style.opacity = "1";
      if (fillRef.current) {
        fillRef.current.setAttribute("y", "325");
        fillRef.current.setAttribute("height", "195");
      }
      if (macroRef.current) macroRef.current.style.translate = "";
      [copyARef.current, copyBRef.current, copyCRef.current].forEach((node) => {
        if (node) {
          node.style.opacity = "1";
          node.style.transform = "none";
          node.style.visibility = "visible";
        }
      });
    };

    measureMacro();
    window.addEventListener("resize", measureMacro);
    // Own the scene before first paint: no flash of unmanaged state, and the
    // initial frame already matches the live scroll position.
    section.classList.add("is-live");
    if (reduced.matches) paintStatic();
    else paint(readProgress(), 1);
    const stopLoop = createSceneLoop(
      section,
      reduced,
      {
        paint,
        readTarget: readProgress,
        advance: (current, target, blend) => current + (target - current) * blend,
        paintStatic,
      },
      0.18,
    );
    return () => {
      window.removeEventListener("resize", measureMacro);
      stopLoop();
    };
  }, []);

  return (
    <section ref={sectionRef} className="honey-harvest section-honey" aria-labelledby="honey-harvest-title">
      <div className="honey-harvest__sticky">
        <div className="honey-harvest__copy shell">
          <div ref={copyARef} className="honey-harvest__chapter honey-harvest__chapter--a">
            <p className="eyebrow"><span />Priča jednog sastojka</p>
            <h2 id="honey-harvest-title">Od cveta do <em>meda.</em></h2>
            <p>Pčela sleće na cvet, uzima nektar i nosi ga dalje. Taj prirodni put vodi do livadskog meda — osnove svakog Immuno Craft sirupa.</p>
          </div>
          <div ref={copyBRef} className="honey-harvest__chapter honey-harvest__chapter--b">
            <p className="eyebrow"><span />Sakupljanje</p>
            <h2>Nektar postaje <em>zlatna osnova.</em></h2>
            <p>U košnici pčele nektar pretvaraju u med. Kod nas livadski med čini trećinu svake boce sirupa.</p>
          </div>
          <div ref={copyCRef} className="honey-harvest__chapter honey-harvest__chapter--c">
            <p className="eyebrow"><span />Harmonija</p>
            <h2>Med + limun + <em>karakter ukusa.</em></h2>
            <p>Na toj osnovi grade se različite kombinacije voća, bobica, bilja, povrća i đumbira — svaki ukus sa sopstvenim karakterom.</p>
          </div>
        </div>

        <div className="honey-harvest__scene" aria-hidden="true">
          <div className="honey-harvest__atmosphere" />
          <svg ref={macroRef} className="honey-harvest__macro" viewBox="0 0 760 500">
            <defs>
              <radialGradient id="petal" cx="40%" cy="35%" r="72%"><stop offset="0" stopColor="#fff9df"/><stop offset=".7" stopColor="#e9dec1"/><stop offset="1" stopColor="#bdae8b"/></radialGradient>
              <radialGradient id="nectar" cx="38%" cy="30%" r="70%"><stop offset="0" stopColor="#fff0a8"/><stop offset=".4" stopColor="#e5ad38"/><stop offset="1" stopColor="#8c5009"/></radialGradient>
              <linearGradient id="macroWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".86"/><stop offset="1" stopColor="#d9e0d7" stopOpacity=".12"/></linearGradient>
              <linearGradient id="combWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9b6d34"/><stop offset="1" stopColor="#56371b"/></linearGradient>
              <linearGradient id="honeyGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0bf45"/><stop offset=".48" stopColor="#d98e13"/><stop offset="1" stopColor="#934d04"/></linearGradient>
              <filter id="macroShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#49320f" floodOpacity=".25"/></filter>
              <clipPath id="combClip"><polygon points={COMB_REGION} /></clipPath>
            </defs>
            <g transform="translate(106 262)" className="honey-flower__anchor">
              <g ref={flowerRef} className="honey-flower">
                <path d="M0 175c38-75 61-123 69-195" fill="none" stroke="#32533e" strokeWidth="11" strokeLinecap="round"/>
                <path d="M30 100c-54-18-76-55-62-84 50 2 76 30 62 84Z" fill="#6c8467"/>
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = i * 45;
                  return <ellipse key={i} cx="0" cy="-20" rx="48" ry="20" fill="url(#petal)" transform={`rotate(${angle}) translate(64 0)`}/>;
                })}
                <circle cx="0" cy="-20" r="31" fill="#d49b28"/>
                <circle cx="-8" cy="-28" r="7" fill="#f3ce63"/>
                <circle cx="11" cy="-11" r="6" fill="#a76a14"/>
              </g>
            </g>

            {/* Honeycomb: one coordinate system with the bee, drop and
                stream. Static wood/cells/gloss; a single gold rect rises
                as the pour fills the comb. */}
            <g ref={combRef} className="honey-comb" aria-hidden="true">
              <ellipse cx="640" cy="478" rx="150" ry="24" fill="rgba(60,30,0,.25)" />
              <polygon points={COMB_REGION} fill="#8a5a24" />
              <g clipPath="url(#combClip)">
                <rect ref={fillRef} x="488" y="520" width="316" height="0" fill="url(#honeyGold)" className="honey-fill-level" />
                <g fill="none" stroke="rgba(70,35,5,.5)" strokeWidth="2">
                  {combCells.map((cell) => <polygon key={cell.key} points={cell.points} />)}
                </g>
                <polygon points="488,330 804,330 620,520 488,520" fill="rgba(255,247,206,.14)" />
              </g>
              <line x1="492" y1="372" x2="800" y2="332" stroke="#ffd98a" strokeWidth="3" opacity=".8" />
              <polygon points={COMB_REGION} fill="none" stroke="#5a3a1a" strokeWidth="12" strokeLinejoin="round" />
              <polygon points={COMB_REGION} fill="none" stroke="#2e1c0a" strokeWidth="2" strokeLinejoin="round" />
            </g>

            <g ref={beeRef} className="honey-macro-bee" transform="translate(150 150) rotate(-10)" filter="url(#macroShadow)">
              <g ref={wingLRef} transform="rotate(0 -8 -5)">
                <path d="M-8-5c-38-42-75-20-64 12 8 23 40 27 67 11Z" fill="url(#macroWing)" stroke="rgba(50,64,55,.28)" />
              </g>
              <g ref={wingRRef} transform="rotate(0 19 -7)">
                <path d="M19-7c34-44 73-28 68 6-4 25-38 34-67 21Z" fill="url(#macroWing)" stroke="rgba(50,64,55,.28)" />
              </g>
              <ellipse cx="4" cy="12" rx="36" ry="24" fill="#d9961e" stroke="#5a3a08" strokeWidth="2" />
              <path d="M-20-2c12 12 14 33 5 43M1-11c11 14 13 38 3 47M23-7c9 13 10 33 1 42" fill="none" stroke="#14120d" strokeWidth="9" strokeLinecap="round" />
              <ellipse cx="-30" cy="9" rx="20" ry="19" fill="#27231c" stroke="#14120d" strokeWidth="1.5" />
              <circle cx="-39" cy="5" r="3" fill="#f4dda1" />
              <path ref={probRef} d="M-36 13L-46 25" fill="none" stroke="#29251e" strokeWidth="3.5" strokeLinecap="round" opacity="0" className="honey-proboscis" />
              <path d="M-38-9c-10-18-23-12-27-3M-26-10c1-18 13-20 20-14M-25 28l-18 29M-4 34-7 66M24 31l14 27" fill="none" stroke="#29251e" strokeWidth="3" strokeLinecap="round"/>
            </g>

            <circle ref={dropRef} cx="106" cy="242" r="8" fill="url(#nectar)" opacity="0" className="honey-drop"/>
            <circle ref={shimmerRef} cx="106" cy="242" r="30" fill="none" stroke="#fff0a8" strokeWidth="2.5" opacity="0" className="honey-shimmer"/>
            <path ref={streamRef} d="M592 296C590 320 586 344 588 366" className="honey-stream" pathLength="140"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
