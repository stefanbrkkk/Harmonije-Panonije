"use client";

import { useEffect, useMemo, useRef } from "react";

const cells = Array.from({ length: 42 }, (_, index) => index);

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

    const render = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / span));

      if (reduced.matches) {
        section.style.setProperty("--harvest", "1");
        section.style.setProperty("--honey-fill", "1");
        beeRef.current?.setAttribute("transform", "translate(420 246) rotate(4) scale(.96)");
        if (flowerRef.current) flowerRef.current.style.transform = "none";
        if (dropRef.current) dropRef.current.style.opacity = "0";
        if (streamRef.current) {
          streamRef.current.style.opacity = ".9";
          streamRef.current.style.strokeDashoffset = "0";
        }
        if (combRef.current) combRef.current.style.transform = "perspective(900px) rotateX(50deg) rotateZ(-6deg) translate3d(0,0,0)";
        [copyARef.current, copyBRef.current, copyCRef.current].forEach((node) => {
          if (node) {
            node.style.opacity = "1";
            node.style.transform = "none";
          }
        });
        return;
      }

      section.style.setProperty("--harvest", String(progress));
      const collect = Math.min(1, Math.max(0, (progress - 0.12) / 0.36));
      const transfer = Math.min(1, Math.max(0, (progress - 0.38) / 0.34));
      const fill = Math.min(1, Math.max(0, (progress - 0.58) / 0.32));
      section.style.setProperty("--honey-fill", String(fill));

      if (beeRef.current) {
        const x = 108 + collect * 220 + transfer * 285;
        const y = 184 - Math.sin(collect * Math.PI) * 76 + transfer * 98;
        const rotate = -16 + transfer * 19;
        beeRef.current.setAttribute("transform", `translate(${x} ${y}) rotate(${rotate}) scale(${0.9 + transfer * 0.08})`);
      }
      if (flowerRef.current) {
        flowerRef.current.style.transform = `translate3d(0, ${collect * 6}px, 0) rotate(${collect * -2.5}deg)`;
      }
      if (dropRef.current) {
        const x = 320 + transfer * 235;
        const y = 170 + transfer * 165;
        dropRef.current.setAttribute("cx", String(x));
        dropRef.current.setAttribute("cy", String(y));
        dropRef.current.setAttribute("r", String(7 + transfer * 5));
        dropRef.current.style.opacity = transfer > 0.08 && transfer < 0.94 ? "1" : "0";
      }
      if (streamRef.current) {
        streamRef.current.style.opacity = fill > 0.05 ? String(Math.min(1, fill * 2)) : "0";
        streamRef.current.style.strokeDashoffset = String(140 - fill * 140);
      }
      if (combRef.current) {
        combRef.current.style.transform = `perspective(900px) rotateX(${58 - fill * 8}deg) rotateZ(${-10 + fill * 4}deg) translate3d(0, ${18 - fill * 18}px, 0)`;
      }

      const fade = (node: HTMLDivElement | null, start: number, end: number) => {
        if (!node) return;
        const enter = Math.min(1, Math.max(0, (progress - start) / 0.08));
        const exit = Math.min(1, Math.max(0, (end - progress) / 0.08));
        node.style.opacity = String(Math.min(enter, exit));
        node.style.transform = `translate3d(0, ${(1 - enter) * 18}px, 0)`;
      };
      fade(copyARef.current, 0.00, 0.39);
      fade(copyBRef.current, 0.31, 0.70);
      fade(copyCRef.current, 0.62, 1.02);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener?.("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener?.("change", schedule);
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
            <g ref={flowerRef} className="honey-flower" transform="translate(106 262)">
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
