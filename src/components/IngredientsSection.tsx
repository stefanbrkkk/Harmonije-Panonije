import { ingredients } from "@/src/data/siteContent";
import { bindShortWords } from "@/src/lib/typography";
import { hexPath, Leaf, Lemon, LemonHalf } from "./Botanical";

/*
 * One apothecary plate, one index. Honey and lemon — the foundation — are the
 * only illustrated ingredients and are captioned under their specimens on the
 * plate; everything that builds the flavour on top is set as a typographic
 * herbarium index. Hierarchy comes from scale, not from numbering.
 */
const base = ingredients.filter((item) => item.role === "base");
const layers = ingredients.filter((item) => item.role === "layer");

const SHADE = { fill: "url(#iplateHatch)", mask: "url(#iplateShade)" };

// Honeycomb chunk lying on the shelf: an irregular broken top face filled
// with foreshortened cells, a waxy cut edge and two slow drips.
const COMB_TOP = "M66 452L94 434L150 424L208 427L248 440L256 456L228 466L152 469L92 466Z";
const COMB_EDGE = "M66 452L92 466L152 469L228 466L256 456L256 474L230 486L152 490L90 488L66 472Z";

function Comb() {
  const cells: Array<[number, number]> = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 11; col += 1) {
      cells.push([62 + col * 18 + (row % 2) * 9, 426 + row * 9.5]);
    }
  }
  return (
    <g>
      <clipPath id="iplateCombTop">
        <path d={COMB_TOP} />
      </clipPath>
      <path className="iplate-comb" d={COMB_TOP} />
      <g clipPath="url(#iplateCombTop)">
        {cells.map(([x, y], i) => (
          <path
            key={i}
            className={i % 7 === 3 || i % 11 === 6 ? "iplate-cell iplate-cell--open" : "iplate-cell"}
            d={hexPath([x, y], 8.6)}
            transform={`translate(0 ${(y * 0.48).toFixed(1)}) scale(1 .52)`}
          />
        ))}
      </g>
      <clipPath id="iplateCombEdge">
        <path d={COMB_EDGE} />
      </clipPath>
      <path className="iplate-comb-edge" d={COMB_EDGE} />
      <g clipPath="url(#iplateCombEdge)">
        {Array.from({ length: 21 }, (_, i) => (
          <path key={i} className="iplate-comb-wall" d={`M${70 + i * 9} 450v44`} />
        ))}
      </g>
      <path className="iplate-shade" d={COMB_EDGE} fill="url(#iplateHatch)" />
      <path className="iplate-drip" d="M118 488c0 6 4 9 4 12a4 4 0 0 1-8 0c0-3 4-6 4-12ZM198 488c0 4 3 7 3 9a3 3 0 0 1-6 0c0-2 3-5 3-9Z" />
    </g>
  );
}

function Plate() {
  return (
    <svg className="ingredients-plate__art" viewBox="0 0 640 520" aria-hidden="true">
      <defs>
        <radialGradient id="iplateGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#efc96e" stopOpacity=".17" />
          <stop offset=".55" stopColor="#efc96e" stopOpacity=".06" />
          <stop offset="1" stopColor="#efc96e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="iplateHoney" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efc162" />
          <stop offset=".6" stopColor="#d4943a" />
          <stop offset="1" stopColor="#a5651d" />
        </linearGradient>
        <pattern id="iplateHatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <path d="M0 0V4.5" stroke="rgba(15,40,33,.42)" strokeWidth=".9" />
        </pattern>
        <linearGradient id="iplateShadeRamp" x1="0" y1="0" x2="1" y2="1">
          <stop offset=".42" stopColor="#000" />
          <stop offset=".92" stopColor="#fff" />
        </linearGradient>
        <mask id="iplateShade" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="url(#iplateShadeRamp)" />
        </mask>
      </defs>
      <circle cx="320" cy="300" r="300" fill="url(#iplateGlow)" />

      {/* Honey jar with the house label; dipper resting on the rim */}
      <path className="iplate-dipper" d="M258 186L116 66" />
      <circle className="iplate-dipper-knob" cx="112" cy="62" r="6" />
      <path className="iplate-glass" d="M232 214q0-14 18-18h142q18 4 18 18v256q0 20-20 20H252q-20 0-20-20Z" />
      <path className="iplate-honey" d="M238 268c44-8 90 8 166-3v203q0 16-16 16H254q-16 0-16-16Z" />
      <path className="iplate-shade" d="M238 268c44-8 90 8 166-3v203q0 16-16 16H254q-16 0-16-16Z" fill="url(#iplateHatch)" mask="url(#iplateShade)" />
      <ellipse className="iplate-rim" cx="321" cy="198" rx="89" ry="11" />
      <path className="iplate-ribbon" d="M262 204c-2 20 3 38 2 62h-5c0-22-3-42 3-62Z" />
      <g transform="rotate(-40 262 190)">
        <ellipse className="iplate-dipper-head" cx="262" cy="196" rx="22" ry="13" />
        <path className="iplate-dipper-grooves" d="M250 184v24M262 183v26M274 184v24" />
      </g>
      <path className="iplate-glint" d="M248 222v236M260 236v60" />
      <path className="iplate-label" d="M321 326l52 22v74H269v-74Z" />
      <text className="iplate-label__brand" x="321" y="370" textAnchor="middle">HARMONIJE PANONIJE</text>
      <text className="iplate-label__name" x="321" y="398" textAnchor="middle">Med</text>
      <path className="iplate-label__rule" d="M297 408h48" />

      {/* Lemon branch leaning on the jar's shoulder, rising above the rim */}
      <path className="iplate-stem" d="M612 488C574 420 520 332 470 250C446 212 424 172 400 128" />
      <path className="iplate-stem" d="M520 334C546 318 568 300 584 276" />
      <Leaf at={[588, 450]} angle={-96} length={70} width={18} className="iplate-leaf" />
      <Leaf at={[556, 396]} angle={-14} length={72} width={18} className="iplate-leaf" />
      <Leaf at={[584, 276]} angle={-40} length={58} width={15} className="iplate-leaf" />
      <Leaf at={[520, 332]} angle={-118} length={66} width={17} className="iplate-leaf" />
      <Leaf at={[492, 286]} angle={-20} length={64} width={16} className="iplate-leaf" />
      <Leaf at={[466, 244]} angle={-124} length={58} width={15} className="iplate-leaf" />
      <Leaf at={[444, 204]} angle={-26} length={54} width={14} className="iplate-leaf" />
      <Leaf at={[422, 164]} angle={-128} length={46} width={12} className="iplate-leaf" />
      <g className="iplate-blossom">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="400" cy="112" rx="6.5" ry="11" transform={`rotate(${a} 400 124)`} />
        ))}
        <circle className="iplate-blossom__eye" cx="400" cy="124" r="4" />
      </g>
      <g className="iplate-blossom">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="586" cy="254" rx="5.5" ry="9" transform={`rotate(${a + 20} 586 264)`} />
        ))}
        <circle className="iplate-blossom__eye" cx="586" cy="264" r="3.4" />
      </g>
      <path className="iplate-stem" d="M548 404c-4 12-4 24-2 34" />
      <Lemon c={[548, 462]} rx={50} ry={29} angle={-6} className="iplate-lemon" shade={SHADE} />

      <Comb />

      {/* Cut lemon standing in front */}
      <LemonHalf c={[472, 444]} r={46} />
      <path className="iplate-shade" d="M472 398a46 46 0 0 1 0 92a46 46 0 0 0 0-92Z" fill="url(#iplateHatch)" />

      {/* Shelf; ticks drop from each specimen to its caption column */}
      <path className="iplate-shelf" d="M0 490H640" />
      <path className="iplate-tick" d="M232 498v22M426 498v22" />
    </svg>
  );
}

export function IngredientsSection() {
  return (
    <section id="sastojci" data-page-bee="hide" className="ingredients-section section-dark" aria-labelledby="sastojci-naslov">
      <div className="shell ingredients-layout">
        <div className="ingredients-head">
          <p className="eyebrow eyebrow--light"><span />Sastojci</p>
          <h2 id="sastojci-naslov">Šta ulazi u harmoniju?</h2>
          <p>{bindShortWords("Livadski med i ceđeni limun povezuju mnoge Immuno Craft kombinacije. Ukusi se zatim grade voćem, bobicama, povrćem, đumbirom i biljem.")}</p>
        </div>

        <figure className="ingredients-plate">
          <Plate />
          <figcaption className="ingredients-plate__captions">
            <p className="ingredients-plate__kicker">Osnova</p>
            {base.map((item) => (
              <div key={item.name} className={`ingredients-base ingredients-base--${item.kind}`}>
                <h3>{item.name}</h3>
                <span lang="la">{item.latin}</span>
                <p>{bindShortWords(item.note)}</p>
              </div>
            ))}
          </figcaption>
        </figure>

        <div className="ingredients-index">
          <p className="ingredients-index__kicker">Uz med i limun</p>
          <ul>
            {layers.map((item) => (
              <li key={item.name}>
                <h3>{item.name}</h3>
                <span lang="la">{item.latin}</span>
                <p>{bindShortWords(item.note)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
