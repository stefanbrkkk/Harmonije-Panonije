import { story } from "@/src/data/siteContent";

export function StorySection() {
  return (
    <section id="prica" data-page-bee="hide" className="story-section section-cream">
      <div className="shell story-layout">
        <div className="story-copy">
          <p className="eyebrow"><span />{story.eyebrow}</p>
          <h2>{story.title}</h2>
          <p className="story-copy__lede">Nije počelo kao brend. Počelo je kao porodična navika — traženje jednostavnijih kombinacija ukusa koje bismo rado stavili i na sopstveni sto.</p>
          <div className="story-copy__paragraphs">
            {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="story-signature" role="group" aria-label="Osnivači i poreklo">
            <div><span>Osnivači</span><strong>Anita &amp; Laslo Toth</strong></div>
            <div><span>Početak</span><strong>Novi Sad · 2022.</strong></div>
            <div><span>Gazdinstvo</span><strong>Budisava · od 2025.</strong></div>
          </div>
          <div className="story-timeline" role="list" aria-label="Kratka vremenska linija">
            {story.timeline.map((item) => (
              <div key={item.year} role="listitem">
                <span>{item.year}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="story-art">
          <div className="story-art__sun" aria-hidden="true" />
          <div className="story-art__frame" aria-hidden="true"><span>Porodična priča</span><i>2022 → danas</i></div>
          <svg viewBox="0 0 620 760" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Stilizovana vojvođanska kuća, voćnjak i bilje">
            {/* Distant sky contours */}
            <path className="story-art__sky" d="M-10 118C120 96 260 128 380 108c90-15 170-8 250 6" />
            <path className="story-art__sky" d="M-10 158C110 140 250 168 380 150c90-12 170-4 250 8" />
            {/* Distant tree line */}
            <path className="story-art__treeline" d="M-10 238C80 220 150 236 230 226c70-9 120 6 190-2 70-8 140 4 230-6v22H-10Z" />
            <g className="story-art__shrub" aria-hidden="true">
              <circle cx="70" cy="212" r="10" />
              <circle cx="150" cy="208" r="12" />
              <circle cx="470" cy="206" r="10" />
              <circle cx="548" cy="208" r="12" />
            </g>
            <path className="story-art__land" d="M-10 590C95 529 180 569 271 536c84-30 151-95 245-70 54 15 89 47 124 73v420H-10Z" />
            {/* Field rows in front of the house */}
            <g className="story-art__field" aria-hidden="true">
              <path d="M-10 640C120 612 260 640 400 618c80-12 150-8 230 2" />
              <path d="M-10 678C120 652 270 678 410 656c80-12 140-8 220 0" />
              <path d="M-10 716C130 692 280 716 420 694c75-11 130-7 210 0" />
            </g>
            {/* Orchard rows flanking the house */}
            <g className="story-art__orchard">
              <path d="M96 560V452M88 500l16-8M104 520l-14-8" />
              <circle className="story-art__canopy" cx="96" cy="424" r="30" />
              <path className="story-art__canopy-detail" d="M78 414a22 22 0 0 1 14-16" />
              <circle className="story-art__fruit-dot" cx="86" cy="430" r="3.4" />
              <circle className="story-art__fruit-dot" cx="104" cy="420" r="3.4" />
              <path d="M164 576V486M157 528l14-7" />
              <circle className="story-art__canopy" cx="164" cy="458" r="26" />
              <path className="story-art__canopy-detail" d="M148 449a18 18 0 0 1 12-14" />
              <circle className="story-art__fruit-dot" cx="156" cy="464" r="3.2" />
              <path d="M456 576V486M449 528l14-7" />
              <circle className="story-art__canopy" cx="456" cy="458" r="26" />
              <path className="story-art__canopy-detail" d="M440 449a18 18 0 0 1 12-14" />
              <circle className="story-art__fruit-dot" cx="464" cy="452" r="3.2" />
              <path d="M524 560V452M516 500l16-8M532 520l-14-8" />
              <circle className="story-art__canopy" cx="524" cy="424" r="30" />
              <path className="story-art__canopy-detail" d="M506 414a22 22 0 0 1 14-16" />
              <circle className="story-art__fruit-dot" cx="514" cy="430" r="3.4" />
              <circle className="story-art__fruit-dot" cx="532" cy="420" r="3.4" />
            </g>
            {/* The house: Vojvodina identity, richer detail */}
            <g className="story-art__house">
              <path d="M215 560V392l95-66 95 66v168H215Z" />
              <path d="M203 396 310 304l107 92" />
              <path className="story-art__eaves" d="M196 398h228" />
              <circle cx="310" cy="352" r="13" />
              <path d="M304 352h12M310 346v12" />
              <path d="M238 560V470h44v90M338 560V470h44v90" />
              <path d="M228 452h64M232 470h56M342 452h64M346 470h56" />
              <path d="M292 560v-72a18 20 0 0 1 36 0v72M284 560h52" />
              <path d="M356 318V272h22v60" />
              <path className="story-art__smoke" d="M367 262c-8-12 8-16 0-28 8 10-6 16 0 28" />
              <path d="M205 560h220" />
            </g>
            {/* Foreground elderflower sprigs */}
            <g className="story-art__foreground">
              <path d="M66 690C76 650 86 616 104 574" />
              <path d="M78 668c-34-8-52-30-44-52 32 1 50 20 44 52ZM92 624c34-10 52-32 42-52-30 4-48 22-42 52Z" />
              <g className="story-art__blossom">
                <circle cx="104" cy="556" r="7" /><circle cx="88" cy="566" r="6" /><circle cx="120" cy="566" r="6" />
                <circle cx="96" cy="580" r="6" /><circle cx="112" cy="580" r="6" /><circle cx="104" cy="570" r="5" />
              </g>
              <path d="M554 690C544 650 534 616 516 574" />
              <path d="M542 668c34-8 52-30 44-52-32 1-50 20-44 52ZM528 624c-34-10-52-32-42-52 30 4 48 22 42 52Z" />
              <g className="story-art__blossom">
                <circle cx="516" cy="556" r="7" /><circle cx="500" cy="566" r="6" /><circle cx="532" cy="566" r="6" />
                <circle cx="508" cy="580" r="6" /><circle cx="524" cy="580" r="6" /><circle cx="516" cy="570" r="5" />
              </g>
            </g>
            <path className="story-art__flight" d="M70 210c70-70 140-44 180 8 40 54 88 60 150 20 44-28 84-38 130-22" />
            <g className="story-art__bee" transform="translate(505 196) rotate(-7)">
              <ellipse cx="0" cy="0" rx="15" ry="9" />
              <path d="M-10-2h20M-6-8 1 8M5-7 10 5" />
              <ellipse cx="-7" cy="-12" rx="9" ry="5" transform="rotate(-35 -7 -12)" />
              <ellipse cx="6" cy="-12" rx="9" ry="5" transform="rotate(35 6 -12)" />
            </g>
          </svg>
          <div className="story-art__note">
            <span>Budisava</span>
            <p>Od avgusta 2025. ovde su i dom, i uzgoj, i proizvodnja.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
