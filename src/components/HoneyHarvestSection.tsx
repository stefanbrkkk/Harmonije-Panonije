"use client";

import { useEffect, useMemo, useRef } from "react";

const cells = Array.from({ length: 42 }, (_, index) => index);

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

export function HoneyHarvestSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dropRef = useRef<SVGCircleElement>(null);
  const streamRef = useRef<SVGPathElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const flowerRef = useRef<SVGGElement>(null);
  const combRef = useRef<HTMLDivElement>(null);
  const copyARef = useRef<HTMLDivElement>(null);
  const copyBRef = useRef<HTMLDivElement>(null);
  const copyCRef = useRef<HTMLDivElement>(null);
  const renderedCells = useMemo(() => cells, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    let target = 0;
    let current = 0;
    let initialized = false;

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / span));
    };

    const paint = (progress: number) => {
      // Phase windows: flower 0-0.22, collect 0.18-0.44, transfer 0.38-0.64,
      // honey 0.58-0.82, final 0.78-1.0.
      const collect = smoothstep((progress - 0.12) / 0.3);
      const transfer = smoothstep((progress - 0.38) / 0.26);
      const fill = smoothstep((progress - 0.58) / 0.24);
      section.style.setProperty("--honey-fill", fill.toFixed(4));

      if (beeRef.current) {
        // Approach arc, hover at flower center, then carry across.
        const approachX = 108 + collect * 212;
        const approachY = 184 - Math.sin(collect * Math.PI) * 60;
        const carryX = approachX + transfer * 293;
        const carryY = approachY + transfer * 98 - Math.sin(transfer * Math.PI) * 14;
        const rotate = -12 + collect * 6 + transfer * 15;
        beeRef.current.setAttribute(
          "transform",
          `translate(${carryX.toFixed(1)} ${carryY.toFixed(1)}) rotate(${rotate.toFixed(1)}) scale(${(0.9 + transfer * 0.08).toFixed(3)})`,
        );
      }
      if (flowerRef.current) {
        // Rooted: ambient sway + tiny 2-3px / ~1.5deg collection reaction.
        const ambient = Math.sin(progress * Math.PI * 2) * 1.2;
        const y = ambient * (1 - collect * 0.5) + collect * 3;
        const r = ambient * 0.3 + collect * -1.5;
        flowerRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg)`;
      }
      if (dropRef.current) {
        const x = 320 + transfer * 235;
        const y = 170 + transfer * 165 - Math.sin(transfer * Math.PI) * 10;
        dropRef.current.setAttribute("cx", x.toFixed(1));
        dropRef.current.setAttribute("cy", y.toFixed(1));
        dropRef.current.setAttribute("r", String(7 + transfer * 5));
        dropRef.current.style.opacity = transfer > 0.06 && transfer < 0.95 ? "1" : "0";
      }
      if (streamRef.current) {
        streamRef.current.style.opacity = fill > 0.04 ? Math.min(1, fill * 2).toFixed(3) : "0";
        streamRef.current.style.strokeDashoffset = String(140 - fill * 140);
      }
      if (combRef.current) {
        combRef.current.style.transform =
          `perspective(900px) rotateX(${(58 - fill * 8).toFixed(2)}deg) ` +
          `rotateZ(${(-10 + fill * 4).toFixed(2)}deg) translate3d(0, ${(18 - fill * 18).toFixed(1)}px, 0)`;
      }

      // Eased crossfades with guaranteed dominant chapter.
      const fade = (node: HTMLDivElement | null, start: number, end: number) => {
        if (!node) return;
        const enter = smoothstep((progress - start) / 0.07);
        const exit = smoothstep((end - progress) / 0.07);
        const o = Math.min(enter, exit);
        node.style.opacity = o.toFixed(3);
        node.style.transform = `translate3d(0, ${((1 - enter) * 14).toFixed(1)}px, 0)`;
        node.style.visibility = o <= 0.01 ? "hidden" : "visible";
      };
      fade(copyARef.current, 0.0, 0.36);
      fade(copyBRef.current, 0.34, 0.64);
      fade(copyCRef.current, 0.62, 1.02);
    };

    const render = () => {
      raf = 0;
      if (!running) return;

      if (reduced.matches) {
        section.style.setProperty("--honey-fill", "1");
        beeRef.current?.setAttribute("transform", "translate(420 246) rotate(4) scale(.96)");
        if (flowerRef.current) flowerRef.current.style.transform = "none";
        if (dropRef.current) dropRef.current.style.opacity = "0";
        if (streamRef.current) {
          streamRef.current.style.opacity = ".9";
          streamRef.current.style.strokeDashoffset = "0";
        }
        if (combRef.current)
          combRef.current.style.transform = "perspective(900px) rotateX(50deg) rotateZ(-6deg) translate3d(0,0,0)";
        [copyARef.current, copyBRef.current, copyCRef.current].forEach((node) => {
          if (node) {
            node.style.opacity = "1";
            node.style.transform = "none";
            node.style.visibility = "visible";
          }
        });
        raf = requestAnimationFrame(render);
        return;
      }

      target = readProgress();
      if (!initialized) {
        // First paint equals current scroll position: no init jump even on
        // deep links or back/forward into mid-scene.
        current = target;
        initialized = true;
        paint(current);
      } else {
        current += (target - current) * 0.18;
        if (Math.abs(target - current) < 0.0004) current = target;
        paint(current);
      }
      raf = requestAnimationFrame(render);
    };

    running = true;
    raf = requestAnimationFrame(render);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
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
          <svg className="honey-harvest__macro" viewBox="0 0 760 500">
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

            <g ref={beeRef} className="honey-macro-bee" filter="url(#macroShadow)">
              <path d="M-8-5c-38-42-75-20-64 12 8 23 40 27 67 11Z" fill="url(#macroWing)" stroke="rgba(50,64,55,.28)"/>
              <path d="M19-7c34-44 73-28 68 6-4 25-38 34-67 21Z" fill="url(#macroWing)" stroke="rgba(50,64,55,.28)"/>
              <ellipse cx="4" cy="12" rx="36" ry="24" fill="#d9961e"/>
              <path d="M-20-2c12 12 14 33 5 43M1-11c11 14 13 38 3 47M23-7c9 13 10 33 1 42" fill="none" stroke="#1d1b16" strokeWidth="9" strokeLinecap="round"/>
              <ellipse cx="-30" cy="9" rx="20" ry="19" fill="#27231c"/>
              <circle cx="-39" cy="5" r="3" fill="#f4dda1"/>
              <path d="M-38-9c-10-18-23-12-27-3M-26-10c1-18 13-20 20-14M-25 28l-18 29M-4 34-7 66M24 31l14 27" fill="none" stroke="#29251e" strokeWidth="3" strokeLinecap="round"/>
            </g>

            <circle ref={dropRef} cx="320" cy="170" r="8" fill="url(#nectar)" className="honey-drop"/>
            <path ref={streamRef} d="M556 325c7 33-10 60-7 96" className="honey-stream" pathLength="140"/>
          </svg>

          <div ref={combRef} className="honeycomb-3d">
            <div className="honeycomb-3d__rim" />
            <div className="honeycomb-3d__cells">
              {renderedCells.map((cell) => <span key={cell}><i /></span>)}
            </div>
            <div className="honeycomb-3d__gloss" />
          </div>
        </div>
      </div>
    </section>
  );
}
