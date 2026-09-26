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

// A broken chunk of comb set back on the ledge: irregular top face with
// foreshortened cells, a cut face showing open cells, honey pooling in front.
const COMB_TOP =
  "M34 438L52 426L70 428L84 414L108 410L120 402L148 400L162 404L184 398L206 402L222 400L244 408L262 406L262 446L240 452L214 450L196 456L168 454L146 458L120 455L96 458L74 452L52 454L36 448Z";
const COMB_FACE =
  "M34 438L36 448L52 454L74 452L96 458L120 455L146 458L168 454L196 456L214 450L240 452L262 446L262 470L240 476L214 474L196 480L168 478L146 482L120 479L96 482L74 476L52 478L36 472Z";

function Comb() {
  const cells: Array<[number, number]> = [];
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      cells.push([28 + col * 18 + (row % 2) * 9, 398 + row * 9.5]);
    }
  }
  return (
    <g>
      <clipPath id="iplateCombTop">
        <path d={COMB_TOP} />
      </clipPath>
      <clipPath id="iplateCombFace">
        <path d={COMB_FACE} />
      </clipPath>
      <path className="iplate-comb" d={COMB_TOP} />
      <g clipPath="url(#iplateCombTop)">
        {cells.map(([x, y], i) => (
          <path
            key={i}
            className={i % 7 === 3 || i % 11 === 6 || i % 13 === 9 ? "iplate-cell iplate-cell--open" : "iplate-cell"}
            d={hexPath([x, y], 8.6)}
            transform={`translate(0 ${(y * 0.48).toFixed(1)}) scale(1 .52)`}
          />
        ))}
      </g>
      <path className="iplate-comb-edge" d={COMB_FACE} />
      <g clipPath="url(#iplateCombFace)">
        {Array.from({ length: 19 }, (_, i) => (
          <path key={i} className="iplate-comb-cellcut" d={`M${40 + i * 12} 452v16a5 5 0 0 0 10 0v-16`} />
        ))}
      </g>
      <path className="iplate-shade" d={COMB_FACE} fill="url(#iplateHatch)" mask="url(#iplateShade)" />
      <path className="iplate-drip" d="M116 479c0 4 3 6 3 8h-6c0-2 3-4 3-8Z" />
      <ellipse className="iplate-pool" cx="122" cy="488" rx="44" ry="4" />
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

      {/* Comb set back on the ledge, its right end behind the jar */}
      <Comb />

      {/* Honey jar with the house label; the dipper rests on the rim and
          leans back over the opening */}
      <path className="iplate-glass" d="M232 214q0-14 18-18h142q18 4 18 18v256q0 20-20 20H252q-20 0-20-20Z" />
      <path className="iplate-honey" d="M238 268c44-8 90 8 166-3v203q0 16-16 16H254q-16 0-16-16Z" />
      <path className="iplate-shade" d="M238 268c44-8 90 8 166-3v203q0 16-16 16H254q-16 0-16-16Z" fill="url(#iplateHatch)" mask="url(#iplateShade)" />
      <path className="iplate-dipper" d="M270 188L322 76" />
      <circle className="iplate-dipper-knob" cx="324" cy="70" r="6" />
      <ellipse className="iplate-rim" cx="321" cy="198" rx="89" ry="11" />
      <path className="iplate-ribbon" d="M262 206c-2 20 3 38 2 60h-5c0-22-3-40 3-60Z" />
      <g transform="rotate(-25 264 192)">
        <ellipse className="iplate-dipper-head" cx="264" cy="194" rx="21" ry="13" />
        <path className="iplate-dipper-grooves" d="M252 182v24M264 181v26M276 182v24" />
      </g>
      <path className="iplate-glint" d="M248 222v236M260 236v60" />
      <path className="iplate-label" d="M321 326l52 22v74H269v-74Z" />
      <text className="iplate-label__brand" x="321" y="370" textAnchor="middle">HARMONIJE PANONIJE</text>
      <text className="iplate-label__name" x="321" y="398" textAnchor="middle">Med</text>
      <path className="iplate-label__rule" d="M297 408h48" />

      {/* Cut lemon branch: cut end on the ledge, leaning on the jar shoulder */}
      <path className="iplate-stem iplate-stem--wood" d="M600 486C560 420 470 300 412 222C404 206 400 180 398 150" />
      <ellipse className="iplate-cut" cx="601" cy="486" rx="4" ry="3" transform="rotate(-50 601 486)" />
      <Leaf at={[576, 444]} angle={-80} length={60} width={16} petiole={8} className="iplate-leaf" />
      <Leaf at={[552, 406]} angle={-168} length={62} width={16} petiole={8} className="iplate-leaf" />
      <Leaf at={[526, 368]} angle={-78} length={58} width={15} petiole={7} className="iplate-leaf" />
      <Leaf at={[500, 330]} angle={-170} length={60} width={15} petiole={7} className="iplate-leaf" />
      <Leaf at={[474, 294]} angle={-82} length={54} width={14} petiole={7} className="iplate-leaf" />
      <Leaf at={[450, 262]} angle={-158} length={50} width={13} petiole={6} className="iplate-leaf" />
      <Leaf at={[424, 232]} angle={-66} length={46} width={12} petiole={6} className="iplate-leaf" />
      <Leaf at={[404, 186]} angle={-150} length={40} width={11} petiole={5} className="iplate-leaf" />
      <Leaf at={[400, 162]} angle={-96} length={34} width={10} petiole={5} className="iplate-leaf" />
      <g className="iplate-blossom">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="398" cy="126" rx="6.5" ry="11" transform={`rotate(${a} 398 138)`} />
        ))}
        <circle className="iplate-blossom__eye" cx="398" cy="138" r="4" />
      </g>
      <Lemon c={[554, 462]} rx={50} ry={29} angle={-6} className="iplate-lemon" shade={SHADE} />

      {/* Cut lemon standing in front */}
      <LemonHalf c={[472, 444]} r={46} />
      <path className="iplate-shade" d="M472 398a46 46 0 0 1 0 92a46 46 0 0 0 0-92Z" fill="url(#iplateHatch)" />

      {/* Ledge; ticks drop from each specimen to its caption column */}
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
          <p>{bindShortWords("Livadski med i ceđeni limun osnova su svakog Immuno Craft sirupa. Ukusi se zatim grade sezonskim voćem, bobicama, povrćem, biljem, začinima i đumbirom.")}</p>
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
