"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cameraShift, createSceneLoop, phaseProgress, smoothstep } from "@/src/lib/scene";

// Pre-paint scene ownership without tripping the SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const cells = Array.from({ length: 42 }, (_, index) => index);

// Flower head (nectar) center in macro viewBox coordinates.
const FLOWER_X = 106;
const FLOWER_Y = 242;
// Honey stream origin: the drop's destination and the stream's start.
const STREAM_X = 556;
const STREAM_Y = 325;

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
  const combRef = useRef<HTMLDivElement>(null);
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
    let lastShift = 0;
    const measureMacro = () => {
      macroWidth = macroRef.current?.getBoundingClientRect().width ?? 0;
    };

    const paint = (progress: number) => {
      // Discrete cinematic timeline. Each segment lerps from the previous
      // segment's exact endpoint, so forward/backward/fast/jump scrolling
      // always resolves to the same valid composition:
      // establish 0–.07, approach .07–.29, DRINK .29–.44, takeoff .44–.52,
      // carry .52–.72, deposit .72–.88, settle .88–1.
      const drinkHold =
        phaseProgress(progress, 0.3, 0.345) * (1 - phaseProgress(progress, 0.435, 0.5));
      const approach = phaseProgress(progress, 0.07, 0.29);
      const takeoff = phaseProgress(progress, 0.44, 0.52);
      const carry = phaseProgress(progress, 0.52, 0.72);
      const deposit = phaseProgress(progress, 0.72, 0.88);
      const fill = deposit;

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      // Bee keyframes (viewBox coords). HOLD puts the head inside the nectar.
      const HOLD_X = FLOWER_X + 30;
      const HOLD_Y = FLOWER_Y - 8;
      const LIFT_X = 140;
      const LIFT_Y = 214;
      const COMB_X = 600;
      const COMB_Y = 280;

      let beeX = lerp(150, HOLD_X, approach);
      let beeY = lerp(150, HOLD_Y, approach) - Math.sin(approach * Math.PI) * 20;
      let beeR = -10 - 4 * approach;
      beeX = lerp(beeX, LIFT_X, takeoff);
      beeY = lerp(beeY, LIFT_Y, takeoff);
      beeR = lerp(beeR, -6, takeoff);
      beeX = lerp(beeX, COMB_X, carry);
      beeY = lerp(beeY, COMB_Y, carry) - Math.sin(carry * Math.PI) * 18;
      beeR = lerp(beeR, 3, carry);
      // Drink breathing + final settle drift (smooth envelopes, no jumps).
      beeY += Math.sin(progress * 120) * 1.2 * drinkHold;
      const settle = phaseProgress(progress, 0.88, 1);
      beeX += settle * 4;
      beeY += settle * 4;

      section.style.setProperty("--honey-fill", fill.toFixed(4));

      if (beeRef.current) {
        beeRef.current.setAttribute(
          "transform",
          `translate(${beeX.toFixed(1)} ${beeY.toFixed(1)}) rotate(${beeR.toFixed(1)}) scale(${(0.9 + carry * 0.08).toFixed(3)})`,
        );
        // Narrow screens: stable phase shots instead of chasing the bee.
        if (macroRef.current && window.innerWidth < 720) {
          const shot = 200 + 280 * smoothstep((progress - 0.55) / 0.2);
          const shift = cameraShift(shot, 760, window.innerWidth, macroWidth);
          if (Math.abs(shift - lastShift) > 0.5) {
            macroRef.current.style.translate = `${shift.toFixed(1)}px 0`;
            lastShift = shift;
          }
        } else if (macroRef.current && lastShift !== 0) {
          macroRef.current.style.translate = "";
          lastShift = 0;
        }
      }

      // Wings: flight beat folds down to a resting tremble while drinking;
      // pure function of progress, no wall-clock involved.
      const wingAmp = 26 - 20 * drinkHold;
      const wingFold = -28 * drinkHold;
      const flap = wingFold + Math.sin(progress * 140) * wingAmp;
      if (wingLRef.current) wingLRef.current.setAttribute("transform", `rotate(${flap.toFixed(1)} -8 -5)`);
      if (wingRRef.current) wingRRef.current.setAttribute("transform", `rotate(${(-flap * 0.85).toFixed(1)} 19 -7)`);
      if (probRef.current) probRef.current.style.opacity = drinkHold.toFixed(3);
      if (shimmerRef.current) {
        shimmerRef.current.style.opacity = (drinkHold * (0.3 + 0.15 * Math.sin(progress * 160))).toFixed(3);
        shimmerRef.current.setAttribute("r", String(30 + 10 * drinkHold));
      }

      if (flowerRef.current) {
        // Rooted: ambient sway damped while drinking + tiny collection lean.
        const ambient = Math.sin(progress * Math.PI * 2) * 1.2;
        const y = ambient * (1 - drinkHold * 0.5) + drinkHold * 2.5;
        const r = ambient * 0.3 + drinkHold * -1.2;
        flowerRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg)`;
      }

      // Single deterministic nectar timeline: bud at the flower → attach
      // under the bee through takeoff → carried → merge into the stream.
      if (dropRef.current) {
        const bud = phaseProgress(progress, 0.3, 0.4);
        const attach = phaseProgress(progress, 0.46, 0.52);
        const merge = phaseProgress(progress, 0.78, 0.84);
        const carryX = beeX;
        const carryY = beeY + 20;
        const flow = phaseProgress(progress, 0.72, 0.8);
        const x = lerp(lerp(FLOWER_X, carryX, attach), STREAM_X, flow);
        const y = lerp(lerp(FLOWER_Y, carryY, attach), STREAM_Y, flow);
        const visible = bud > 0 && merge < 1;
        dropRef.current.setAttribute("cx", x.toFixed(1));
        dropRef.current.setAttribute("cy", y.toFixed(1));
        dropRef.current.setAttribute("r", String(4 + bud * 3 + carry * 3));
        dropRef.current.style.opacity = visible ? (1 - merge).toFixed(3) : "0";
      }
      if (streamRef.current) {
        const draw = phaseProgress(progress, 0.74, 0.86);
        streamRef.current.style.opacity = draw > 0.02 ? Math.min(1, draw * 2).toFixed(3) : "0";
        streamRef.current.style.strokeDashoffset = String(140 - draw * 140);
      }
      if (combRef.current) {
        // The comb rises into its final framing as the deposit begins,
        // instead of dominating the viewport from the start — and lifts
        // the final 8px to meet the honey stream at the deposit surface.
        const intro = phaseProgress(progress, 0.58, 0.72);
        combRef.current.style.opacity = (0.3 + 0.7 * intro).toFixed(3);
        combRef.current.style.transform =
          `perspective(900px) rotateX(${(58 - fill * 8).toFixed(2)}deg) ` +
          `rotateZ(${(-10 + fill * 4).toFixed(2)}deg) translate3d(0, ${((18 - fill * 18 - fill * 8) + (1 - intro) * 44).toFixed(1)}px, 0)`;
      }

      // Chapters aligned to visual actions: A flower/approach, B landing
      // and nectar transformation, C honey and final flavor story.
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
        node.style.visibility = o <= 0.01 ? "hidden" : "visible";
      };
      fade(copyARef.current, -0.05, 0.0, 0.27, 0.285);
      fade(copyBRef.current, 0.285, 0.305, 0.6, 0.62);
      fade(copyCRef.current, 0.62, 0.64, 1.02, 1.07);
    };

    const paintStatic = () => {
      section.style.setProperty("--honey-fill", "1");
      beeRef.current?.setAttribute("transform", "translate(420 246) rotate(4) scale(.96)");
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
      if (combRef.current) {
        combRef.current.style.opacity = "1";
        combRef.current.style.transform = "perspective(900px) rotateX(50deg) rotateZ(-6deg) translate3d(0,-8px,0)";
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
    else paint(readProgress());
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
            <p>Pčela sleće na cvet, uzima nektar i nosi ga dalje. Taj prirodni put vodi do livadskog meda — jednog od osnovnih sastojaka mnogih Immuno Craft kombinacija.</p>
          </div>
          <div ref={copyBRef} className="honey-harvest__chapter honey-harvest__chapter--b">
            <p className="eyebrow"><span />Sakupljanje</p>
            <h2>Nektar postaje <em>zlatna osnova.</em></h2>
            <p>U košnici pčele nektar pretvaraju u med. U Harmonijama Panonije livadski med zatim ulazi kao jedan od osnovnih sastojaka mnogih kombinacija.</p>
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
              <filter id="macroShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#49320f" floodOpacity=".25"/></filter>
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

            <circle ref={dropRef} cx="320" cy="170" r="8" fill="url(#nectar)" className="honey-drop"/>
            <circle ref={shimmerRef} cx="106" cy="242" r="30" fill="none" stroke="#fff0a8" strokeWidth="2.5" opacity="0" className="honey-shimmer"/>
            <path ref={streamRef} d="M556 325c7 33-10 60-7 116" className="honey-stream" pathLength="140"/>
          </svg>

          <div ref={combRef} className="honeycomb-3d">
            <div className="honeycomb-3d__rim" />
            <div className="honeycomb-3d__cells">
              {cells.map((cell) => <span key={cell}><i /></span>)}
            </div>
            <div className="honeycomb-3d__gloss" />
          </div>
        </div>
      </div>
    </section>
  );
}
