/*
 * Shared botanical drawing primitives (deterministic geometry, no random
 * values, so server and client render identical markup). Styling comes from
 * the consuming section's CSS classes: the journey draws on cream, the
 * ingredient plate on forest green, with one line grammar.
 */
export type Pt = [number, number];

/** Lanceolate leaf with a midrib, base at the origin, tip along +x. */
export function leafPath(length: number, width: number) {
  const l = length;
  const w = width;
  return `M0 0C${l * 0.28} ${-w} ${l * 0.72} ${-w} ${l} 0C${l * 0.72} ${w} ${l * 0.28} ${w} 0 0Z`;
}

export function Leaf({
  at,
  angle,
  length,
  width,
  className = "jart-leaf",
  petiole = 0,
  shade,
}: {
  at: Pt;
  angle: number;
  length: number;
  width: number;
  className?: string;
  /** Short leaf stalk joining the blade to the stem. */
  petiole?: number;
  shade?: Shade;
}) {
  const d = leafPath(length, width);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`} className={className}>
      {petiole ? <path className="jart-petiole" d={`M0 0L${petiole} 0`} /> : null}
      <g transform={petiole ? `translate(${petiole} 0)` : undefined}>
        <path d={d} />
        {/* Engraving convention: the shaded half of the blade is hatched. */}
        {shade ? (
          <path className="jart-shade" d={`M0 0C${length * 0.28} ${width} ${length * 0.72} ${width} ${length} 0Z`} fill={shade.fill} />
        ) : null}
        <path d={`M${length * 0.08} 0L${length * 0.86} 0`} className="jart-rib" />
      </g>
    </g>
  );
}

/** Radial daisy: paper petals, honey disk with a phyllotaxis of seeds. */
export function Daisy({ c, petals, reach, petalW, petalL, disk }: { c: Pt; petals: number; reach: number; petalW: number; petalL: number; disk: number }) {
  const seeds: Pt[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const count = Math.round(disk * 1.3);
  for (let i = 1; i < count; i += 1) {
    const r = Math.sqrt(i / count) * (disk - 4);
    seeds.push([c[0] + Math.cos(i * golden) * r, c[1] + Math.sin(i * golden) * r]);
  }
  return (
    <g>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          className="jart-petal"
          cx={c[0]}
          cy={c[1] - reach}
          rx={petalW}
          ry={petalL}
          transform={`rotate(${((360 / petals) * i + 7).toFixed(2)} ${c[0]} ${c[1]})`}
        />
      ))}
      <circle className="jart-disk" cx={c[0]} cy={c[1]} r={disk} />
      {seeds.map(([x, y], i) => (
        <circle key={i} className="jart-seed" cx={x.toFixed(1)} cy={y.toFixed(1)} r={1.25} />
      ))}
    </g>
  );
}

/** Elder umbel (zova): rays ending in small floret clusters. */
export function Umbel({ base, rays }: { base: Pt; rays: Pt[] }) {
  const florets: Pt[] = [];
  rays.forEach(([x, y], i) => {
    const ring = [[0, 0], [-7, -3], [7, -3], [-4, -9], [4, -9], [0, 5], [-9, 4], [9, 4]] as Pt[];
    ring.slice(0, i % 2 === 0 ? 8 : 6).forEach(([dx, dy]) => florets.push([x + dx, y + dy]));
  });
  return (
    <g>
      {rays.map(([x, y], i) => (
        <path key={i} className="jart-stem jart-stem--fine" d={`M${base[0]} ${base[1]}Q${(base[0] + x) / 2} ${y + 14} ${x} ${y}`} />
      ))}
      {florets.map(([x, y], i) => (
        <g key={i} className="jart-floret">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={(x + Math.cos(((a + i * 17) * Math.PI) / 180) * 2.6).toFixed(1)}
              cy={(y + Math.sin(((a + i * 17) * Math.PI) / 180) * 2.6).toFixed(1)}
              r={1.9}
            />
          ))}
          <circle className="jart-floret__eye" cx={x} cy={y} r={1.1} />
        </g>
      ))}
    </g>
  );
}

/** Hexagon (pointy-top) centred on c. */
export function hexPath(c: Pt, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(c[0] + Math.cos(a) * r).toFixed(1)} ${(c[1] + Math.sin(a) * r).toFixed(1)}`;
  });
  return `M${pts.join("L")}Z`;
}

/** Lemon cross-section: rind, pith, segments. */
export function LemonHalf({ c, r }: { c: Pt; r: number }) {
  const segments = 10;
  const inner = r * 0.14;
  const outer = r * 0.8;
  return (
    <g>
      <circle className="jart-lemon-rind" cx={c[0]} cy={c[1]} r={r} />
      <circle className="jart-lemon-pith" cx={c[0]} cy={c[1]} r={r * 0.9} />
      {Array.from({ length: segments }, (_, i) => {
        const a0 = ((Math.PI * 2) / segments) * i + 0.06;
        const a1 = ((Math.PI * 2) / segments) * (i + 1) - 0.06;
        const p = (a: number, rad: number) => `${(c[0] + Math.cos(a) * rad).toFixed(1)} ${(c[1] + Math.sin(a) * rad).toFixed(1)}`;
        return (
          <path
            key={i}
            className="jart-lemon-seg"
            d={`M${p(a0, inner)}L${p(a0, outer)}A${outer} ${outer} 0 0 1 ${p(a1, outer)}L${p(a1, inner)}Z`}
          />
        );
      })}
      <circle className="jart-lemon-core" cx={c[0]} cy={c[1]} r={inner * 0.8} />
    </g>
  );
}


/** Lemon silhouette: elliptical body tapering into small nubs, origin-centred. */
export function lemonPath(rx: number, ry: number) {
  const n = Math.max(3, ry * 0.12);
  const k = 0.47;
  const tip = rx + Math.max(6, rx * 0.12);
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(-rx)} ${f(-n)}C${f(-rx)} ${f(-ry * k)} ${f(-rx * 0.55)} ${f(-ry)} 0 ${f(-ry)}` +
    `C${f(rx * 0.55)} ${f(-ry)} ${f(rx)} ${f(-ry * k)} ${f(rx)} ${f(-n)}` +
    `C${f(rx + 2)} ${f(-n)} ${f(tip)} ${f(-n * 0.5)} ${f(tip)} 0C${f(tip)} ${f(n * 0.5)} ${f(rx + 2)} ${f(n)} ${f(rx)} ${f(n)}` +
    `C${f(rx)} ${f(ry * k)} ${f(rx * 0.55)} ${f(ry)} 0 ${f(ry)}` +
    `C${f(-rx * 0.55)} ${f(ry)} ${f(-rx)} ${f(ry * k)} ${f(-rx)} ${f(n)}` +
    `C${f(-rx - 2)} ${f(n)} ${f(-tip)} ${f(n * 0.5)} ${f(-tip)} 0C${f(-tip)} ${f(-n * 0.5)} ${f(-rx - 2)} ${f(-n)} ${f(-rx)} ${f(-n)}Z`
  );
}

/** Engraved shading: a hatch fill masked to fade in toward the shadow side. */
export type Shade = { fill: string; mask: string };

/** Whole lemon: silhouette, engraved shadow, a few oil-gland pores. */
export function Lemon({ c, rx, ry, angle = 0, className = "jart-lemon", shade }: { c: Pt; rx: number; ry: number; angle?: number; className?: string; shade?: Shade }) {
  const pores: Pt[] = [[-0.42, -0.1], [-0.12, -0.36], [0.24, -0.12], [-0.28, 0.34], [0.08, 0.42], [0.46, 0.18]];
  const d = lemonPath(rx, ry);
  return (
    <g transform={`translate(${c[0]} ${c[1]}) rotate(${angle})`}>
      <path className={className} d={d} />
      {shade ? <path className="jart-shade" d={d} fill={shade.fill} mask={shade.mask} /> : null}
      <g className="jart-pores">
        {pores.map(([x, y], i) => (
          <circle key={i} cx={(x * rx).toFixed(1)} cy={(y * ry).toFixed(1)} r="1.1" />
        ))}
      </g>
    </g>
  );
}

/** Rose leaf: rachis with paired oval leaflets and a terminal leaflet. */
export function PinnateLeaf({ at, angle, length, className = "jart-leaf" }: { at: Pt; angle: number; length: number; className?: string }) {
  const pairs = [0.34, 0.62];
  const w = length * 0.13;
  const l = length * 0.3;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`} className={className}>
      <path className="jart-rachis" d={`M0 0L${length * 0.78} 0`} />
      {pairs.map((t) => (
        <g key={t}>
          <path d={leafPath(l, w)} transform={`translate(${length * t} 0) rotate(-52)`} />
          <path d={leafPath(l, w)} transform={`translate(${length * t} 0) rotate(52)`} />
        </g>
      ))}
      <path d={leafPath(l * 1.1, w)} transform={`translate(${length * 0.78} 0)`} />
    </g>
  );
}

/** Rosehip (šipurak): hanging oval hip with a crown of dry sepals. */
export function Hip({ at, angle = 0, size = 1 }: { at: Pt; angle?: number; size?: number }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${size})`}>
      <path className="jart-stem jart-stem--fine" d="M0 0v6" />
      <path className="jart-hip" d="M0 6c-9 0-12 10-12 18 0 10 6 16 12 16s12-6 12-16c0-8-3-18-12-18Z" />
      <path className="jart-sepal-crown" d="M0 38.5l-5 4.5 3 .6-4 3.2 4.4-.8 1.6 3.6.8-4.4 1.2 4.4 1.8-3.6 4.2.8-4-3.2 3-.6Z" />
    </g>
  );
}

/** Lombardy poplar: a narrow flame-shaped crown on a short trunk. */
export function Poplar({ x, base, height, width, shade }: { x: number; base: number; height: number; width: number; shade?: Shade }) {
  const top = base - height;
  const bottom = base - height * 0.16;
  const d = `M${x} ${top}C${x + width * 0.62} ${top + height * 0.3} ${x + width * 0.56} ${bottom - 10} ${x} ${bottom}C${x - width * 0.56} ${bottom - 10} ${x - width * 0.62} ${top + height * 0.3} ${x} ${top}Z`;
  return (
    <g>
      <path className="jart-stem" d={`M${x} ${base}V${bottom - 6}`} />
      <path className="jart-poplar" d={d} />
      {shade ? <path className="jart-shade" d={d} fill={shade.fill} mask={shade.mask} /> : null}
      <path className="jart-rib" d={`M${x} ${top + 14}V${bottom - 8}`} />
    </g>
  );
}

/** Grass tuft: several blades fanning from one root point. */
export function Tuft({ at, height, lean = 0 }: { at: Pt; height: number; lean?: number }) {
  const blades = [-0.9, -0.45, 0, 0.4, 0.85];
  return (
    <g className="jart-grass">
      {blades.map((b, i) => {
        const h = height * (0.62 + ((i * 37) % 5) * 0.09);
        const tipX = at[0] + (b * height * 0.42) + lean;
        return <path key={i} d={`M${at[0]} ${at[1]}C${at[0] + b * 3} ${at[1] - h * 0.5} ${tipX - b * 4} ${at[1] - h * 0.85} ${tipX.toFixed(1)} ${(at[1] - h).toFixed(1)}`} />;
      })}
    </g>
  );
}
