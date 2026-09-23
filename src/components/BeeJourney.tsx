"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createSceneLoop } from "@/src/lib/scene";
import { bindShortWords } from "@/src/lib/typography";
import { Daisy, Hip, Leaf, Lemon, LemonHalf, PinnateLeaf, Poplar, Tuft, Umbel } from "./Botanical";

// Pre-paint scene ownership without tripping the SSR useLayoutEffect warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/*
 * Four chapters, one horizon. Each chapter is a complete editorial plate:
 * a monumental word, one lead sentence and one illustration standing on the
 * shared horizon line (which doubles as the progress rule). Chapter changes
 * are scroll-selected with hysteresis and animated in time, so every scroll
 * position shows exactly one finished composition; the horizon progress is
 * the only scrubbed element.
 */
const CHAPTERS = [
  {
    word: "Priroda",
    lead: "Livada, zova i voćnjak. Sve počinje od onoga što raste oko nas.",
    index: "Livada i voćnjak",
  },
  {
    word: "Sastojci",
    // No-break spaces keep "livadski med" and "ceđeni limun" unsplit.
    lead: "Livadski\u00a0med i ceđeni\u00a0limun, uz voće, bobice i bilje.",
    index: "Med, limun i bilje",
  },
  {
    word: "Craft",
    lead: "Ručno pravljeno — onako kako je počelo, za našim stolom.",
    index: "Ručni rad",
  },
  {
    word: "Panonija",
    lead: "Vojvođanska kućica sa naše etikete — Harmonije Panonije.",
    index: "Novi Sad · Vojvodina",
  },
] as const;

const LAST = CHAPTERS.length - 1;
const BOUNDARIES = [0.25, 0.5, 0.75];
const HYSTERESIS = 0.012;

// Bee perches in artwork units (viewBox 600 × 520): x, y, facing
// (1 = native left-facing artwork, -1 = mirrored to face right).
const PERCHES: Array<[number, number, 1 | -1]> = [
  [446, 96, 1],
  [548, 142, 1],
  [300, 150, -1],
  [150, 250, -1],
];

const FLIGHT_MS = 1150;

function chapterFor(progress: number, current: number) {
  let next = 0;
  for (const boundary of BOUNDARIES) if (progress >= boundary) next += 1;
  if (next === current || current < 0) return next;
  const edge = next > current ? BOUNDARIES[next - 1] : BOUNDARIES[current - 1];
  return Math.abs(progress - edge) > HYSTERESIS ? next : current;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- The four plates ---------- */

// One engraved language: forest hairline, opaque muted fills, hatch shading.
const SHADE = { fill: "url(#journeyHatch)", mask: "url(#journeyShade)" };

function PlateNature() {
  return (
    <>
      {/* Grass tufts rooted on the horizon */}
      <Tuft at={[136, 520]} height={70} lean={-6} />
      <Tuft at={[296, 520]} height={58} lean={8} />
      <Tuft at={[430, 520]} height={52} lean={-4} />
      <Tuft at={[572, 520]} height={66} lean={6} />
      {/* Elder (zova): pinnate leaves, umbel of five-petal florets */}
      <path className="jart-stem" d="M512 520C510 452 504 368 494 300" />
      <PinnateLeaf at={[508, 438]} angle={-24} length={88} />
      <PinnateLeaf at={[505, 396]} angle={-158} length={74} />
      <Umbel
        base={[494, 300]}
        rays={[[436, 262], [452, 238], [474, 224], [498, 220], [522, 226], [544, 240], [558, 262]]}
      />
      {/* Bud */}
      <path className="jart-stem jart-stem--fine" d="M262 520C262 470 266 420 276 372" />
      <path className="jart-bud" d="M276 372c-9-10-10-24-2-34 9 8 12 22 2 34Z" />
      <path className="jart-shade" d="M276 372c-9-10-10-24-2-34 9 8 12 22 2 34Z" fill="url(#journeyHatch)" mask="url(#journeyShade)" />
      <path className="jart-sepal" d="M276 372c-8-2-13-8-14-15M276 372c7-3 12-9 12-16" />
      {/* Second daisy */}
      <path className="jart-stem" d="M202 520C204 452 206 372 214 300" />
      <Leaf at={[205, 440]} angle={-150} length={58} width={12} shade={SHADE} />
      <Daisy c={[214, 282]} petals={13} reach={30} petalW={8} petalL={20} disk={17} />
      {/* Principal daisy */}
      <path className="jart-stem" d="M352 520C348 420 350 300 358 188" />
      <Leaf at={[350, 400]} angle={-32} length={96} width={19} shade={SHADE} />
      <Leaf at={[351, 338]} angle={-146} length={82} width={16} shade={SHADE} />
      <Daisy c={[358, 168]} petals={16} reach={52} petalW={12} petalL={34} disk={27} />
    </>
  );
}

function PlateIngredients() {
  return (
    <>
      {/* Rosehip (šipurak) cane; hips on short pedicels along it */}
      <path className="jart-stem" d="M470 520C470 430 462 330 446 230C436 170 424 120 404 70" />
      <PinnateLeaf at={[468, 452]} angle={-24} length={86} />
      <PinnateLeaf at={[466, 420]} angle={-158} length={78} />
      <PinnateLeaf at={[454, 300]} angle={-150} length={68} />
      <PinnateLeaf at={[450, 262]} angle={-28} length={64} />
      <PinnateLeaf at={[430, 140]} angle={-150} length={56} />
      <PinnateLeaf at={[416, 104]} angle={-40} length={48} />
      <Hip at={[466, 360]} angle={-30} />
      <Hip at={[460, 330]} angle={24} size={0.9} />
      <Hip at={[440, 196]} angle={-26} />
      <Hip at={[426, 150]} angle={22} size={0.86} />
      <Hip at={[404, 70]} angle={-8} size={0.8} />
      {/* Whole lemon lying on the horizon */}
      <Lemon c={[190, 472]} rx={84} ry={46} angle={-2} shade={SHADE} />
      {/* Lemon half, upright: the hero of the plate */}
      <LemonHalf c={[346, 446]} r={74} />
      <path className="jart-shade" d="M346 372a74 74 0 0 1 0 148a74 74 0 0 0 0-148Z" fill="url(#journeyHatch)" />
      {/* Honey dipper laid on the ground to the right, a small pool beneath its head */}
      <ellipse className="jart-pool" cx="566" cy="516" rx="26" ry="4" />
      <g transform="rotate(-3 500 506)">
        <path className="jart-wood" d="M410 508h124" />
        <ellipse className="jart-dipper" cx="556" cy="506" rx="26" ry="11" />
        <path className="jart-dipper-grooves" d="M543 497v18M555 496v20M567 497v18" />
      </g>
    </>
  );
}

function PlateCraft() {
  return (
    <>
      {/* Glass hand reamer: saucer with spout, ribbed dome, pressed juice */}
      <g className="jart-glassware">
        <path className="jart-reamer" d="M92 474h184l-14 32q-4 14-18 14H124q-14 0-18-14Z" />
        <path className="jart-juice" d="M104 482h160l-8 20q-3 8-12 8H124q-9 0-12-8Z" />
        <path className="jart-reamer" d="M92 474l-24-6q-7-2-5 5l7 9Z" />
        <path className="jart-reamer" d="M140 476C140 432 160 404 184 404S228 432 228 476Z" />
        <path className="jart-reamer-rib" d="M184 404C170 420 164 448 164 476M184 404C178 424 176 450 176 476M184 404C190 424 192 450 192 476M184 404C198 420 204 448 204 476" />
        <path className="jart-shade" d="M92 474h184l-14 32q-4 14-18 14H124q-14 0-18-14Z" fill="url(#journeyHatch)" mask="url(#journeyShade)" />
        <path className="jart-shade" d="M140 476C140 432 160 404 184 404S228 432 228 476Z" fill="url(#journeyHatch)" mask="url(#journeyShade)" />
      </g>
      <LemonHalf c={[64, 474]} r={46} />
      {/* The brand bottle, twine tag at the neck */}
      <path className="jart-glass" d="M346 150h56v28c0 16 40 30 40 70v252a20 20 0 0 1-20 20H326a20 20 0 0 1-20-20V248c0-40 40-54 40-70Z" />
      <path className="jart-liquid" d="M310 292c40 10 76-6 128 4v204a16 16 0 0 1-16 16H326a16 16 0 0 1-16-16Z" />
      <path className="jart-shade" d="M310 292c40 10 76-6 128 4v204a16 16 0 0 1-16 16H326a16 16 0 0 1-16-16Z" fill="url(#journeyHatch)" mask="url(#journeyShade)" />
      <path className="jart-glint" d="M320 300v176" />
      <rect className="jart-cap" x="340" y="108" width="68" height="46" rx="6" />
      <path className="jart-cap-rib" d="M352 114v34M364 114v34M376 114v34M388 114v34M400 114v34" />
      <path className="jart-label" d="M374 330l54 24v104H320V354Z" />
      <text className="jart-label-small" x="374" y="380" textAnchor="middle">HARMONIJE PANONIJE</text>
      <text className="jart-label-big" x="374" y="408" textAnchor="middle">IMMUNO</text>
      <text className="jart-label-big" x="374" y="428" textAnchor="middle">CRAFT</text>
      <path className="jart-label-rule" d="M350 440h48" />
      <path className="jart-string" d="M346 184c10 8 46 8 56 0M352 188c-4 14-12 26-22 32" />
      <g transform="rotate(-18 316 236)">
        <rect className="jart-tag" x="290" y="218" width="48" height="30" rx="2" />
        <circle className="jart-tag-hole" cx="332" cy="233" r="2.4" />
        <text className="jart-tag-script" x="310" y="238" textAnchor="middle">ručno</text>
      </g>
    </>
  );
}

function PlatePanonia() {
  return (
    <>
      {/* Low sun, engraved in horizontal lines */}
      <circle className="jart-sun" cx="300" cy="266" r="118" />
      <circle cx="300" cy="266" r="118" fill="url(#journeySunLines)" />
      {/* The brand house, drawn as on the story plate and the label */}
      <g className="jart-house" transform="translate(300 520) scale(1.18) translate(-310 -560)">
        <path className="jart-chimney" d="M356 343.6V272h22v90.5Z" />
        <path className="jart-wall" d="M215 560V392l95-66 95 66v168H215Z" />
        <path className="jart-shade" d="M215 560V392l95-66 95 66v168H215Z" fill="url(#journeyHatch)" mask="url(#journeyShade)" />
        <path className="jart-roof-band" d="M203 396L310 304L417 396L405 392L310 326L215 392Z" />
        <path className="jart-eaves" d="M196 398h228" />
        <circle className="jart-vent" cx="310" cy="352" r="13" />
        <path d="M304 352h12M310 346v12" />
        <path className="jart-window" d="M238 560V470h44v90M338 560V470h44v90" />
        <path d="M228 452h64M232 470h56M342 452h64M346 470h56" />
        <path className="jart-door" d="M292 560v-72a18 20 0 0 1 36 0v72" />
      </g>
      {/* A row of poplars on the plain */}
      <Poplar x={468} base={520} height={196} width={38} shade={SHADE} />
      <Poplar x={508} base={520} height={250} width={46} shade={SHADE} />
      <Poplar x={550} base={520} height={284} width={50} shade={SHADE} />
      <Poplar x={590} base={520} height={206} width={38} shade={SHADE} />
    </>
  );
}

const PLATES = [PlateNature, PlateIngredients, PlateCraft, PlatePanonia];

export function BeeJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const beeRef = useRef<SVGGElement>(null);
  const flipRef = useRef<SVGGElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const bee = beeRef.current;
    const flip = flipRef.current;
    if (!section || !bee || !flip) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const chapters = Array.from(section.querySelectorAll<HTMLElement>("[data-chapter]"));
    const plates = Array.from(section.querySelectorAll<SVGGElement>("[data-plate]"));
    const indexItems = Array.from(section.querySelectorAll<HTMLElement>("[data-index]"));

    let active = -1;
    let beeX = PERCHES[0][0];
    let beeY = PERCHES[0][1];
    let flight = 0;

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const placeBee = (x: number, y: number, tilt: number) => {
      beeX = x;
      beeY = y;
      bee.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})`);
    };

    const face = (direction: 1 | -1) => {
      flip.style.transform = `scaleX(${direction})`;
    };

    const setActive = (next: number, animate: boolean) => {
      if (next === active) return;
      const previous = active;
      active = next;
      chapters.forEach((node, i) => {
        node.classList.toggle("is-active", i === next);
        node.classList.toggle("is-before", i < next);
      });
      plates.forEach((node, i) => {
        node.classList.toggle("is-active", i === next);
        node.classList.toggle("is-before", i < next);
      });
      indexItems.forEach((node, i) => {
        node.classList.toggle("is-active", i === next);
        node.classList.toggle("is-done", i < next);
      });

      const [tx, ty, facing] = PERCHES[next];
      if (flight) cancelAnimationFrame(flight);
      flight = 0;
      if (!animate || previous === -1) {
        placeBee(tx, ty, 0);
        face(facing);
        return;
      }
      // Arc flight from wherever the bee currently is (interruptible).
      const sx = beeX;
      const sy = beeY;
      const cx = (sx + tx) / 2;
      const cy = Math.min(sy, ty) - 70;
      face(tx > sx ? -1 : 1);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FLIGHT_MS);
        const e = easeInOut(t);
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * tx;
        const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ty;
        const dy = 2 * (1 - e) * (cy - sy) + 2 * e * (ty - cy);
        placeBee(x, y, Math.max(-14, Math.min(14, dy * 0.06)) * (tx > sx ? 1 : -1));
        if (t < 1) {
          flight = requestAnimationFrame(step);
        } else {
          flight = 0;
          placeBee(tx, ty, 0);
          face(facing);
        }
      };
      flight = requestAnimationFrame(step);
    };

    const paint = (progress: number) => {
      section.classList.add("is-live");
      setActive(chapterFor(readProgress(), active), active !== -1);
      // The horizon rule is the one scrubbed element: plates stay grounded.
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const paintStatic = () => {
      if (flight) cancelAnimationFrame(flight);
      flight = 0;
      section.classList.remove("is-live");
      active = -1;
      chapters.forEach((node) => {
        node.classList.remove("is-active", "is-before");
      });
      plates.forEach((node) => node.classList.remove("is-active", "is-before"));
      indexItems.forEach((node) => node.classList.remove("is-active", "is-done"));
      if (progressRef.current) progressRef.current.style.transform = "";
      placeBee(PERCHES[LAST][0], PERCHES[LAST][1], 0);
      face(PERCHES[LAST][2]);
    };

    // Own the scene before first paint: the first frame already shows the
    // chapter that matches the live scroll position.
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
      0.2,
    );
    return () => {
      if (flight) cancelAnimationFrame(flight);
      stopLoop();
    };
  }, []);

  return (
    <section id="put-pcele" ref={sectionRef} className="journey" aria-labelledby="put-pcele-naslov">
      <div className="journey__sticky">
        <div className="journey__frame shell">
          <div className="journey__top">
            <h2 id="put-pcele-naslov" className="eyebrow"><span aria-hidden="true" />Put pčele</h2>
          </div>

          <div className="journey__stage">
            <ol className="journey__chapters">
              {CHAPTERS.map((chapter, i) => (
                <li key={chapter.word} className="journey__chapter" data-chapter={i}>
                  <p className="journey__lead">{bindShortWords(chapter.lead)}</p>
                  <h3 className="journey__word">
                    <span>{chapter.word}</span>
                  </h3>
                </li>
              ))}
            </ol>

            <svg className="journey__art" viewBox="0 0 600 520" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <defs>
                <pattern id="journeyHatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                  <path d="M0 0V4.5" stroke="rgba(15,40,33,.34)" strokeWidth=".9" />
                </pattern>
                <pattern id="journeySunLines" width="8" height="7" patternUnits="userSpaceOnUse">
                  <path d="M0 3.5H8" stroke="rgba(122,79,14,.42)" strokeWidth="1" />
                </pattern>
                <linearGradient id="journeyShadeRamp" x1="0" y1="0" x2="1" y2="1">
                  <stop offset=".42" stopColor="#000" />
                  <stop offset=".92" stopColor="#fff" />
                </linearGradient>
                <mask id="journeyShade" maskContentUnits="objectBoundingBox">
                  <rect width="1" height="1" fill="url(#journeyShadeRamp)" />
                </mask>
              </defs>
              {PLATES.map((Plate, i) => (
                <g key={i} className="journey__plate" data-plate={i}>
                  <Plate />
                </g>
              ))}
              <g ref={beeRef} className="journey-bee" transform={`translate(${PERCHES[LAST][0]} ${PERCHES[LAST][1]})`}>
                <g ref={flipRef} className="journey-bee__flip">
                  <g className="journey-bee__bob">
                    <g className="journey-bee__wings">
                      <ellipse cx="-2" cy="-13" rx="9" ry="14" transform="rotate(-28 -2 -13)" />
                      <ellipse cx="8" cy="-12" rx="8" ry="12" transform="rotate(22 8 -12)" />
                    </g>
                    <ellipse className="journey-bee__body" cx="4" cy="0" rx="16" ry="10" />
                    <path className="journey-bee__stripes" d="M-2-9.5c3 5 3 14 0 19M5-10c3 6 3 14 0 20M12-8.5c2.4 5 2.4 12 0 17" />
                    <circle className="journey-bee__head" cx="-14" cy="-1" r="6.5" />
                    <path className="journey-bee__line" d="M-17-6c-3-6-8-8-11-6M-14-7c-1-6 2-10 6-10M20 0l6 1" />
                  </g>
                </g>
              </g>
            </svg>
          </div>

          <div className="journey__horizon" aria-hidden="true">
            <span ref={progressRef} className="journey__progress" />
          </div>

          <ol className="journey__index" aria-hidden="true">
            {CHAPTERS.map((chapter, i) => (
              <li key={chapter.word} data-index={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{chapter.word}</strong>
                <em>{bindShortWords(chapter.index)}</em>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
