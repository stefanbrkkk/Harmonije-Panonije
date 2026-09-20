"use client";

import { useEffect, useRef } from "react";

export function BeeJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const houseRef = useRef<SVGGElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<SVGGElement>(null);
  const berryRef = useRef<SVGGElement>(null);
  const lemonRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    const bee = beeRef.current;
    if (!section || !path || !bee) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let length = path.getTotalLength();

    const render = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

      if (media.matches) {
        const p = path.getPointAtLength(length * 0.86);
        bee.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(-7)`);
        if (houseRef.current) houseRef.current.style.opacity = "1";
        if (introRef.current) introRef.current.style.opacity = "1";
        if (outroRef.current) outroRef.current.style.opacity = "1";
        return;
      }

      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const distance = length * Math.min(0.985, eased);
      const p = path.getPointAtLength(distance);
      const p2 = path.getPointAtLength(Math.min(length, distance + 2));
      const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      bee.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);

      if (introRef.current) introRef.current.style.opacity = String(Math.max(0, 1 - progress * 3.2));
      if (outroRef.current) {
        const o = Math.max(0, Math.min(1, (progress - 0.72) / 0.2));
        outroRef.current.style.opacity = String(o);
        outroRef.current.style.transform = `translateY(${(1 - o) * 24}px)`;
      }
      if (houseRef.current) {
        const o = Math.max(0.12, Math.min(1, (progress - 0.58) / 0.26));
        houseRef.current.style.opacity = String(o);
        houseRef.current.style.transformOrigin = "760px 328px";
        houseRef.current.style.transform = `scale(${0.9 + o * 0.1})`;
      }

      const react = (node: SVGGElement | null, point: number, direction: number) => {
        if (!node) return;
        const d = Math.max(0, 1 - Math.abs(progress - point) * 9);
        node.style.transform = `translate(${d * 7 * direction}px, ${-d * 9}px) rotate(${d * 5 * direction}deg)`;
      };
      react(lemonRef.current, 0.23, 1);
      react(berryRef.current, 0.42, -1);
      react(leafRef.current, 0.58, 1);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onResize = () => {
      length = path.getTotalLength();
      schedule();
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    media.addEventListener?.("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      media.removeEventListener?.("change", schedule);
      if (raf) cancelAnimationFrame(raf);
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

        <svg className="bee-scene" viewBox="0 0 1000 560" role="img" aria-label="Stilizovana pčela leti kroz sastojke ka vojvođanskoj kućici">
          <defs>
            <linearGradient id="honeyGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e7b95d" stopOpacity=".3" />
              <stop offset="1" stopColor="#d38b2e" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path className="bee-scene__contour" d="M-50 440 C130 395 240 488 375 420 C535 339 621 194 786 172 C899 158 974 206 1065 134" />
          <path ref={pathRef} className="bee-scene__path" d="M75 375 C165 290 238 365 311 297 C378 235 425 136 530 168 C641 201 634 329 732 309 C826 290 837 216 878 195" />

          <g ref={lemonRef} className="scene-ingredient scene-ingredient--lemon" transform="translate(250 330)">
            <ellipse cx="0" cy="0" rx="47" ry="36" transform="rotate(-18)" />
            <path d="M-10 -31c10-26 35-21 40-5" />
            <path d="M-32 -2h64M0-31V29M-23-22 23 22M23-22-23 22" />
          </g>

          <g ref={berryRef} className="scene-ingredient scene-ingredient--berry" transform="translate(470 178)">
            <circle cx="-20" cy="10" r="17" /><circle cx="9" cy="1" r="18" /><circle cx="28" cy="24" r="15" /><circle cx="-4" cy="30" r="17" />
            <path d="M2-18c10-20 30-24 43-16M3-17c-8-19-26-23-39-15" />
          </g>

          <g ref={leafRef} className="scene-ingredient scene-ingredient--leaf" transform="translate(665 335)">
            <path d="M0 68C4 27 6-10 11-62" />
            <path d="M7 30c-38-10-54-35-44-55 31 2 49 20 44 55Z" />
            <path d="M10 5c35-12 50-36 38-55-29 5-44 23-38 55Z" />
            <path d="M4 52c-31 0-50-16-48-34 27-5 46 7 48 34Z" />
          </g>

          <g className="scene-ingredient scene-ingredient--honey" transform="translate(585 260)">
            <path d="M0-34c22 27 33 44 33 63A33 33 0 1 1-33 29C-33 10-22-7 0-34Z" />
            <ellipse cx="0" cy="16" rx="49" ry="49" fill="url(#honeyGlow)" stroke="none" />
          </g>

          <g ref={houseRef} className="scene-house" transform="translate(760 235)">
            <path d="M0 76V-5L108-77 216-5v81H0Z" />
            <path d="M40 76V6h55v70M125 12h52v38h-52z" />
            <path d="M-9-3 108-91 225-3" />
            <circle cx="108" cy="-34" r="9" />
            <path className="scene-house__check" d="M16 59h182M16 39h182M34-3v79M62-22v98M90-40v116M118-40v116M146-22v98M174-4v80" />
            <text x="108" y="107" textAnchor="middle">HARMONIJE PANONIJE</text>
          </g>

          <g ref={beeRef} className="scene-bee">
            <ellipse cx="0" cy="0" rx="15" ry="9" />
            <path d="M-10-2h20M-6-8 1 8M5-7 10 5" />
            <ellipse className="scene-bee__wing scene-bee__wing--a" cx="-7" cy="-12" rx="9" ry="5" transform="rotate(-35 -7 -12)" />
            <ellipse className="scene-bee__wing scene-bee__wing--b" cx="6" cy="-12" rx="9" ry="5" transform="rotate(35 6 -12)" />
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
