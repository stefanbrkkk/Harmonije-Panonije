const TISA =
  "M456 -4C455.7 -2.3 453 1.3 454 6C455 10.7 457.7 17.7 462 24C466.3 30.3 474.2 38.2 480 44C485.8 49.8 492 53.7 497 59C502 64.3 509 71.2 510 76C511 80.8 505.5 84 503 88C500.5 92 497 95.8 495 100C493 104.2 490.8 108.3 491 113C491.2 117.7 491.3 121.7 496 128C500.7 134.3 510.8 142.5 519 151C527.2 159.5 539 170.3 545 179C551 187.7 552.8 193.2 555 203C557.2 212.8 557.8 226.7 558 238C558.2 249.3 558 262.3 556 271C554 279.7 550 285.2 546 290C542 294.8 535.3 295.7 532 300C528.7 304.3 526.8 310 526 316C525.2 322 526.8 329 527 336C527.2 343 527 354.3 527 358.0";
const DANUBE =
  "M-4 225C-3.3 225.2 -4 225.5 0 226C4 226.5 13.3 227.2 20 228C26.7 228.8 34.2 229.8 40 231C45.8 232.2 50 233.7 55 235C60 236.3 65 238.5 70 239C75 239.5 80 238.8 85 238C90 237.2 95.8 235.3 100 234C104.2 232.7 106.7 231.8 110 230C113.3 228.2 117.2 225.8 120 223C122.8 220.2 125.2 216.3 127 213C128.8 209.7 130.3 206.5 131 203C131.7 199.5 130.5 195.1 131 192C131.5 188.9 132.3 186.3 134 184.5C135.7 182.7 138.3 181.3 141 181C143.7 180.7 146.8 181.7 150 182.5C153.2 183.3 156.7 184.6 160 186C163.3 187.4 166.7 189.2 170 191C173.3 192.8 177.3 194.8 180 197C182.7 199.2 184.3 201.3 186 204C187.7 206.7 188.8 210 190 213C191.2 216 191.7 219 193 222C194.3 225 195.7 227.4 198 231C200.3 234.6 203.8 238.8 207 243.5C210.2 248.2 213.7 253.6 217 259C220.3 264.4 223.7 271.4 227 276C230.3 280.6 233.2 283.7 237 286.5C240.8 289.3 245.7 291.2 250 293C254.3 294.8 258 296.1 263 297.5C268 298.9 274.3 300.2 280 301.5C285.7 302.8 291.5 304.7 297 305.5C302.5 306.3 307.5 306.4 313 306.5C318.5 306.6 323.8 306 330 306C336.2 306 343.3 306.4 350 306.5C356.7 306.6 364.2 306.8 370 306.5C375.8 306.2 380.5 305.9 385 305C389.5 304.1 392.8 302.5 397 301C401.2 299.5 405.7 297.7 410 296C414.3 294.3 418.5 292 423 291C427.5 290 432.5 289.8 437 290C441.5 290.2 445.7 290.8 450 292.5C454.3 294.2 458.5 297.3 463 300C467.5 302.7 472.5 305.2 477 308.5C481.5 311.8 485.7 315.9 490 320C494.3 324.1 498.8 328.6 503 333C507.2 337.4 511 342 515 346.5C519 351 523.3 354.6 527 360C530.7 365.4 533.7 372.8 537 379C540.3 385.2 543.2 391.8 547 397.5C550.8 403.2 555.7 407.9 560 413C564.3 418.1 568.5 423 573 428C577.5 433 583 438.2 587 443C591 447.8 594.2 452.7 597 456.5C599.8 460.3 602.8 464.4 604 466.0";
const ROUTE =
  "M234 144.2C231 143 228.2 142.1 225 141C217.2 138.2 207.7 133.3 201 133.5C194.3 133.7 191.8 137.6 185 142C178.2 146.4 168.7 153.8 160 160C151.3 166.2 137.5 175.8 133 179";

/**
 * Engraved atlas plate of southern Bačka for the Dostava section: the family
 * farm in Budisava (drawn as the label house) as the origin, the route
 * through Kać to Novi Sad, the Danube, Tisa and Fruška Gora. Projection:
 * 12 viewBox units = 1 km; x = (lon − 19.72)·940.95, y = (45.40 − lat)·1333.56.
 * The hachured relief and field pattern (generated from SRTM elevation data)
 * load as a static image from /atlas/; everything with meaning is inline.
 * Rendered once per page (fixed ids).
 */
export function DeliveryMapArt() {
  return (
      <svg className="atlas" viewBox="0 0 600 480" role="img" aria-labelledby="atlasTitle">
      <title id="atlasTitle">Mapa južne Bačke: porodično gazdinstvo Harmonije Panonije u Budisavi i put preko Kaća do Novog Sada, uz Dunav, Tisu i Frušku goru. Dostava i preuzimanje po dogovoru.</title>
      <defs>
        <pattern id="atCity" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(22)"><rect x=".55" y=".55" width="2.1" height="2.1" className="at-cityblock"/></pattern>
        <pattern id="atSunLines" width="6" height="2.6" patternUnits="userSpaceOnUse"><path d="M0 1.3H6" stroke="rgba(122,79,14,.42)" strokeWidth=".7"/></pattern>
        <mask id="atRouteReveal" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="480"><path className="at-route-mask" d={ROUTE} pathLength="1" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 1"/></mask>
        <clipPath id="atVigClip"><circle cx="0" cy="-16" r="24.6"/></clipPath>
      </defs>
      <rect className="at-paper" width="600" height="480"/>
      <image className="at-base" href="/atlas/juzna-backa-podloga.svg" x="0" y="0" width="600" height="480" preserveAspectRatio="none"/>
      <g className="at-water">
        <path className="at-tw0" d={TISA} style={{ strokeWidth: 11 }}/>
        <path className="at-tw1" d={TISA} style={{ strokeWidth: 10 }}/>
        <path className="at-tw2" d={TISA} style={{ strokeWidth: 5 }}/>
        <path className="at-tw3" d={TISA} style={{ strokeWidth: 3.8 }}/>
        <path className="at-dw0" d={DANUBE} style={{ strokeWidth: 17 }}/>
        <path className="at-dw1" d={DANUBE} style={{ strokeWidth: 16 }}/>
        <path className="at-dw2" d={DANUBE} style={{ strokeWidth: 11.8 }}/>
        <path className="at-dw3" d={DANUBE} style={{ strokeWidth: 11 }}/>
        <path className="at-dw4" d={DANUBE} style={{ strokeWidth: 7.4 }}/>
        <path className="at-dw5" d={DANUBE} style={{ strokeWidth: 6 }}/>
      </g>
      <g className="at-city">
        <path className="at-city__area" d="M66 219C70 221.8 78.5 222.3 84 224C89.5 225.7 94.5 229.3 99 229C103.5 228.7 107.7 224.5 111 222C114.3 219.5 116.8 217.2 119 214C121.2 210.8 122.8 206.7 124 203C125.2 199.3 125.2 195.3 126 192C126.8 188.7 129.3 186.2 129 183C128.7 179.8 126.2 175.8 124 173C121.8 170.2 118.7 168.5 116 166C113.3 163.5 111.3 159.7 108 158C104.7 156.3 99.7 155.7 96 156C92.3 156.3 89.3 159.8 86 160C82.7 160.2 79.3 156.7 76 157C72.7 157.3 68.7 159.5 66 162C63.3 164.5 60.5 168.5 60 172C59.5 175.5 63.5 179.3 63 183C62.5 186.7 57.5 190 57 194C56.5 198 58.5 202.8 60 207C61.5 211.2 62 216.2 66 219.0Z"/>
        <path className="at-fort" d="M138.0 189.8L139.7 192.7L142.9 193.4L140.8 195.9L141.1 199.2L138.0 197.9L134.9 199.2L135.2 195.9L133.1 193.4L136.3 192.7Z"/>
      </g>
      <g className="at-roads">
        <path className="at-road" d="M112 170C114.7 157.5 123 116.7 128 95C133 73.3 137.3 56.5 142 40C146.7 23.5 153.7 3.3 156 -4.0"/>
        <path className="at-road" d="M201 133.5C206.2 128.2 219.7 113.6 232 102C244.3 90.4 259.8 74.8 275 64C290.2 53.2 311.2 48.3 323 37C334.8 25.7 342.2 2.8 346 -4.0"/>
        <path className="at-road at-road--main" d="M118 186C120.5 184.8 126 183.3 133 179C140 174.7 151.3 166.2 160 160C168.7 153.8 178.2 146.4 185 142C191.8 137.6 194.3 133.7 201 133.5C207.7 133.3 217.2 138.2 225 141C232.8 143.8 241.7 147.5 248 150C254.3 152.5 259.3 151 263 156C266.7 161 267.8 172.2 270 180C272.2 187.8 274.3 196 276 203C277.7 210 279.3 218.8 280 222.0"/>
      </g>

      <g className="at-poplars"><path className="at-poplar" d="M212 131c-2.2 -3.1 -1.8 -7.2 0 -9c1.8 1.8 2.2 5.9 0 9Z"/>
        <path className="at-trunk" d="M212 131v1.6"/>
        <path className="at-poplar" d="M221 134c-2.2 -3.1 -1.8 -7.2 0 -9c1.8 1.8 2.2 5.9 0 9Z"/>
        <path className="at-trunk" d="M221 134v1.6"/>
        <path className="at-poplar" d="M226 160c-2.2 -3.1 -1.8 -7.2 0 -9c1.8 1.8 2.2 5.9 0 9Z"/>
        <path className="at-trunk" d="M226 160v1.6"/>
        <path className="at-poplar" d="M219 167c-2.2 -3.1 -1.8 -7.2 0 -9c1.8 1.8 2.2 5.9 0 9Z"/>
        <path className="at-trunk" d="M219 167v1.6"/></g>
      <g className="at-place"><circle className="at-village" cx="201" cy="133.5" r="2.3"/><circle className="at-village-dot" cx="201" cy="133.5" r=".85"/></g><g className="at-place"><circle className="at-village" cx="280" cy="222.5" r="2.3"/><circle className="at-village-dot" cx="280" cy="222.5" r=".85"/></g><g className="at-place at-minor"><circle className="at-village" cx="201" cy="263" r="2.3"/><circle className="at-village-dot" cx="201" cy="263" r=".85"/></g><g className="at-place at-minor"><circle className="at-village" cx="540" cy="259" r="2.3"/><circle className="at-village-dot" cx="540" cy="259" r=".85"/></g><g className="at-place at-minor"><circle className="at-village" cx="323" cy="37" r="2.3"/><circle className="at-village-dot" cx="323" cy="37" r=".85"/></g>
      <path className="delivery-map__route at-route" d={ROUTE} mask="url(#atRouteReveal)"/>
      <circle className="at-dest-ring" cx="131" cy="180" r="5.2"/>
      <circle className="at-dest" cx="131" cy="180" r="2.4"/>

      <g className="at-house" transform="translate(263.5 157.5) scale(1.3)">
        <circle className="at-vig__disc" cx="0" cy="-16" r="25"/>
        <g clipPath="url(#atVigClip)">
          <circle className="at-sun" cx="0" cy="-23" r="16"/>
          <circle cx="0" cy="-23" r="16" fill="url(#atSunLines)"/>
          <path className="at-vig__f1" d="M-26 -3C-16 -7 -6 -5 2 -4C10 -3 18 -6 26 -8V10H-26Z"/>
          <path className="at-vig__f2" d="M-26 2C-14 -2 -2 0 8 1C16 2 22 0 26 -1V10H-26Z"/>
          <path className="at-vig__f3" d="M-26 6.5C-12 3.5 0 5.5 10 6.5C18 7.3 23 5.8 26 5V10H-26Z"/>
          <path className="at-vig__rows" d="M-24 -.6C-16 -3.4 -8 -2.4 0 -1.6M4 -1.2C12 -.6 18 -2.2 24 -3.4M-24 4.4C-14 1.6 -4 3 6 3.8M12 4.4C18 4.6 21 3.6 24 2.8M-22 8.6C-12 6.6 -2 8 8 8.8"/>
        </g>
        <circle className="at-vig__ring" cx="0" cy="-16" r="25"/>
        <path className="at-ground" d="M-19 .4H19"/>
        <path className="at-facade" d="M-13 0V-16C-13-19-9.6-19.4-9.6-22.2C-9.6-23.8-11.6-24-11.6-25.6C-11.6-28-7.6-28.8-6.8-31.2C-6-34.6-3.4-36.2 0-36.2C3.4-36.2 6-34.6 6.8-31.2C7.6-28.8 11.6-28 11.6-25.6C11.6-24 9.6-23.8 9.6-22.2C9.6-19.4 13-19 13-16V0Z"/>
        <path className="at-curl" d="M-11.6-25.6c-1.9-.2-2.6 1.7-1.3 2.4.9.4 1.6-.5 1.1-1.1M11.6-25.6c1.9-.2 2.6 1.7 1.3 2.4-.9.4-1.6-.5-1.1-1.1M-13-16c-1.8.3-2.2 2-.9 2.5M13-16c1.8.3 2.2 2 .9 2.5"/>
        <path className="at-band" d="M-13-4.4H13V0H-13Z"/>
        <path className="at-cornice" d="M-14.4-16H14.4"/>
        <path className="at-detail" d="M-4.4-24.2h3v3.8h-3ZM1.4-24.2h3v3.8h-3ZM-10.2-4.4V-13.4H-3.8V-4.4M-7-13.4V-4.4M-9.2-12.2h1.4v3h-1.4ZM-6.2-12.2h1.4v3h-1.4ZM.2-6.2V-10.4A2.2 2.2 0 0 1 4.6-10.4V-6.2ZM6.8-6.2V-10.4A2.2 2.2 0 0 1 11.2-10.4V-6.2ZM2.4-12.6V-6.2M9-12.6V-6.2"/>
        <path className="at-steps" d="M-10.6-3.1H-3.4M-10.6-1.6H-3.4"/>
        <path className="at-hex" d="M0-33.2l1.9 1.1v2.2L0-28.8l-1.9-1.1v-2.2Z"/>
      </g>

      <g className="at-bee" transform="translate(221 111)">
        <g className="at-bee__flight">
        <g className="at-bee__bob" transform="scale(-1 1)">
          <ellipse className="at-bee__wing" cx="1.5" cy="-4.6" rx="3.4" ry="4.8" transform="rotate(-24 1.5 -4.6)"/>
          <ellipse className="at-bee__wing" cx="4.6" cy="-4" rx="2.8" ry="4" transform="rotate(20 4.6 -4)"/>
          <ellipse className="at-bee__body" cx="3" cy="0" rx="5.6" ry="3.5"/>
          <path className="at-bee__stripe" d="M1.2-3.3c1 1.8 1 4.8 0 6.6M3.8-3.4c1 2 1 4.9 0 6.8M6.3-2.9c.8 1.7.8 4.1 0 5.8"/>
          <circle className="at-bee__head" cx="-3.4" cy="-.3" r="2.3"/>
          <path className="at-bee__line" d="M-4.4-2.2c-1-2-2.8-2.8-3.8-2.1M-3.4-2.5c-.4-2-.9-3.4.8-3.6M8.6 0l2 .4"/>
        </g>
        </g>
      </g>

      <g className="at-north" transform="translate(404 58)">
        <path className="at-north__stem" d="M0 20V-14"/>
        <path className="at-north__grain" d="M0-14c-2.2 2-2.4 4.6 0 6.6 2.4-2 2.2-4.6 0-6.6ZM0-8c-3.6.2-5.2 2.6-4.8 5.2 2.6-.2 4.4-2.2 4.8-5.2ZM0-8c3.6.2 5.2 2.6 4.8 5.2-2.6-.2-4.4-2.2-4.8-5.2ZM0-2.2c-3.6.2-5.2 2.6-4.8 5.2 2.6-.2 4.4-2.2 4.8-5.2ZM0-2.2c3.6.2 5.2 2.6 4.8 5.2-2.6-.2-4.4-2.2-4.8-5.2ZM0 3.6c-3.4.2-4.8 2.4-4.4 4.8 2.4-.2 4.1-2 4.4-4.8ZM0 3.6c3.4.2 4.8 2.4 4.4 4.8-2.4-.2-4.1-2-4.4-4.8Z"/>
        <text className="at-north__s" x="0" y="-18" textAnchor="middle">S</text>
      </g>

      <g className="at-scale" transform="translate(262 428)">
        <path className="at-scale__fill" d="M0 0h30v2.6H0ZM60 0h60v2.6H60Z"/>
        <path className="at-scale__frame" d="M0 0h120v2.6H0ZM30 0v2.6M60 0v2.6"/>
        <text className="at-scale__t" x="0" y="11" textAnchor="middle">0</text>
        <text className="at-scale__t" x="60" y="11" textAnchor="middle">5</text>
        <text className="at-scale__t" x="120" y="11" textAnchor="middle">10 km</text>
      </g>

      <g className="at-labels">
        <text className="at-l at-l--route" transform="translate(157 151) rotate(-34)" textAnchor="middle">po dogovoru</text>
        <text className="at-l at-l--origin" x="300" y="140">Budisava</text>
        <text className="at-l at-l--tag" x="300.5" y="151">PORODIČNO GAZDINSTVO</text>
        <text className="at-l at-l--city" x="62" y="129">NOVI SAD</text>
        <text className="at-l at-l--note" x="62.5" y="139.5">gde je sve počelo</text>
        <text className="at-l at-l--village" x="196" y="126" textAnchor="end">Kać</text>
        <text className="at-l at-l--village" x="287" y="226">Kovilj</text>
        <text className="at-l at-l--village at-l--minor" x="195" y="267" textAnchor="end">Sremski Karlovci</text>
        <text className="at-l at-l--village at-l--minor" x="534" y="262" textAnchor="end">Titel</text>
        <text className="at-l at-l--village at-l--minor" x="330" y="40">Žabalj</text>
        <text className="at-l at-l--water" x="300" y="296" transform="rotate(3 300 296)">Dunav</text>
        <text className="at-l at-l--water at-l--minor" x="512" y="146" transform="rotate(43 512 146)">Tisa</text>
        <text className="at-l at-l--range" x="96" y="388">FRUŠKA GORA</text>
        <text className="at-l at-l--region at-l--minor" x="330" y="212">ŠAJKAŠKA</text>
        <text className="at-l at-l--region at-l--minor" x="30" y="64">BAČKA</text>
        <text className="at-l at-l--region at-l--minor" x="452" y="418">SREM</text>
        <text className="at-l at-l--region at-l--minor" x="536" y="112">BANAT</text>
        <text className="at-l at-l--physical at-l--minor" x="468" y="190" transform="rotate(40 468 190)">Titelski breg</text>
        <text className="at-l at-l--physical at-l--minor" x="236" y="268">Koviljski rit</text>
      </g>
      <path className="at-ticks" d="M28.2 0v6M28.2 480v-6M106.6 0v6M106.6 480v-6M185.1 0v3.5M185.1 480v-3.5M263.5 0v6M263.5 480v-6M341.9 0v3.5M341.9 480v-3.5M420.3 0v6M420.3 480v-6M498.7 0v3.5M498.7 480v-3.5M577.1 0v6M577.1 480v-6M0 88.9h6M600 88.9h-6M0 200.0h6M600 200.0h-6M0 311.2h6M600 311.2h-6M0 422.3h3.5M600 422.3h-3.5"/>

      </svg>
  );
}
