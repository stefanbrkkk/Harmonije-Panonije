import { story } from "@/src/data/siteContent";

export function StorySection() {
  return (
    <section id="prica" className="story-section section-cream">
      <div className="shell story-layout">
        <div className="story-copy">
          <p className="eyebrow"><span />{story.eyebrow}</p>
          <h2>{story.title}</h2>
          <p className="story-copy__lede">Nije počelo kao brend. Počelo je kao porodična navika — traženje jednostavnijih kombinacija ukusa koje bi rado stavili i na sopstveni sto.</p>
          <div className="story-copy__paragraphs">
            {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="story-signature" aria-label="Osnivači i poreklo">
            <div><span>Osnivači</span><strong>Anita &amp; Laslo Toth</strong></div>
            <div><span>Početak</span><strong>Proleće 2022.</strong></div>
            <div><span>Mesto</span><strong>Novi Sad · Budisava</strong></div>
          </div>
          <div className="story-timeline" aria-label="Kratka vremenska linija">
            {story.timeline.map((item) => (
              <div key={item.year}>
                <span>{item.year}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="story-art" aria-label="Stilizovana ilustracija vojvođanskog imanja i biljaka">
          <div className="story-art__sun" aria-hidden="true" />
          <div className="story-art__frame" aria-hidden="true"><span>Porodična priča</span><i>2022 → danas</i></div>
          <svg viewBox="0 0 620 760" role="img" aria-label="Stilizovana vojvođanska kuća, voćnjak i bilje">
            <path className="story-art__land" d="M-10 590C95 529 180 569 271 536c84-30 151-95 245-70 54 15 89 47 124 73v231H-10Z" />
            <path className="story-art__house" d="M145 493V324l132-91 132 91v169H145Z" />
            <path className="story-art__roof" d="M128 329 277 217l149 112" />
            <path className="story-art__door" d="M232 493V372h90v121M347 361h45v50h-45z" />
            <g className="story-art__orchard">
              <path d="M103 585V444M74 497c22-60 86-61 102-3-19 39-80 53-102 3Z" />
              <path d="M478 554V405M447 456c23-65 91-64 107-1-20 43-83 57-107 1Z" />
              <path d="M535 604V487M509 524c16-44 65-45 79-2-17 32-58 44-79 2Z" />
            </g>
            <g className="story-art__botanical">
              <path d="M92 666c27-71 47-118 65-188M118 583c-40-11-60-38-50-63 37 2 59 25 50 63ZM140 535c39-13 59-40 47-64-35 5-56 28-47 64Z" />
              <path d="M452 674c-7-72-6-127 3-184M452 584c-38-20-51-52-35-73 35 11 51 39 35 73ZM454 545c40-10 63-34 54-60-37 1-60 21-54 60Z" />
            </g>
            <path className="story-art__flight" d="M98 233c67-81 131-56 165 0 38 62 91 63 153 13 48-39 93-48 139-16" />
            <g className="story-art__bee" transform="translate(541 225) rotate(-7)">
              <ellipse cx="0" cy="0" rx="15" ry="9" />
              <path d="M-10-2h20M-6-8 1 8M5-7 10 5" />
              <ellipse cx="-7" cy="-12" rx="9" ry="5" transform="rotate(-35 -7 -12)" />
              <ellipse cx="6" cy="-12" rx="9" ry="5" transform="rotate(35 6 -12)" />
            </g>
          </svg>
          <div className="story-art__note">
            <span>Budisava</span>
            <p>Voćnjak, zova i porodično imanje postali su deo priče o brendu.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
