/**
 * SVG body model that highlights the body region of the selected emergency record.
 */

/**
 * Body model.
 *
 * @param region Body region to highlight (`whole-body` highlights everything).
 * @param side   Show the side view instead of the front view.
 */
export function AstronautBody({
  region,
  side,
  gender,
}: {
  region: string
  side: boolean
  gender: 'female' | 'male'
}) {
  const active = (part: string) =>
    region === part || region === 'whole-body' ? 'body-part active' : 'body-part'
  return (
    <div className={`astronaut-body natural-human ${gender} ${side ? 'side-view' : ''}`}>
      <div className="body-orbit orbit-one" />
      <div className="body-orbit orbit-two" />
      <svg
        viewBox="0 0 300 560"
        role="img"
        aria-label={`${gender} human anatomical model highlighting ${region}`}
      >
        <defs>
          <radialGradient id={`humanSkin-${gender}`} cx="38%" cy="28%" r="78%">
            <stop offset="0" stopColor="#f2f4f4" />
            <stop offset=".42" stopColor="#c5cbcd" />
            <stop offset=".76" stopColor="#858f93" />
            <stop offset="1" stopColor="#4b585e" />
          </radialGradient>
          <linearGradient id="limbShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e7eaea" />
            <stop offset=".5" stopColor="#a7b0b3" />
            <stop offset="1" stopColor="#59666c" />
          </linearGradient>
          <linearGradient id="legShade" x1=".25" y1="0" x2=".8" y2="1">
            <stop offset="0" stopColor="#dfe3e4" />
            <stop offset=".56" stopColor="#929da1" />
            <stop offset="1" stopColor="#4a575d" />
          </linearGradient>
          <filter id="bodyDepth" x="-30%" y="-20%" width="160%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#02080b" floodOpacity=".48" />
          </filter>
          <filter id="regionGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff9a68" floodOpacity=".8" />
          </filter>
        </defs>
        <g className="mannequin-model" filter="url(#bodyDepth)">
          <ellipse
            className={active('head')}
            cx="150"
            cy="55"
            rx={gender === 'female' ? 29 : 31}
            ry="43"
          />
          <ellipse className="human-ear" cx="118" cy="58" rx="5" ry="10" />
          <ellipse className="human-ear" cx="182" cy="58" rx="5" ry="10" />
          <path
            className="human-hair"
            d={
              gender === 'female'
                ? 'M120 48c-2-30 13-44 30-44 23 0 34 19 30 47l-8-23c-14 5-30 4-44-4Z'
                : 'M120 43c3-27 18-38 34-36 17 1 28 13 26 38-17-11-42-11-60-2Z'
            }
          />
          <path
            className="human-neck-shape"
            d="M132 91c1 17-4 24-17 31l35 25 35-25c-13-7-18-14-17-31Z"
          />
          {gender === 'female' ? (
            <>
              <path
                className={active('chest')}
                d="M112 112c-31 6-55 17-68 36 11 30 18 68 25 102 20 10 142 10 162 0 7-34 14-72 25-102-13-19-37-30-68-36-8 22-20 32-38 32s-30-10-38-32Z"
              />
              <path
                className={active('abdomen')}
                d="M69 238c20 9 45 13 81 13s61-4 81-13l-12 76c-19 20-47 30-69 30s-50-10-69-30Z"
              />
              <path
                className={active('left-arm')}
                d="M52 141c-16 8-23 24-29 45L7 285c-3 16-6 30-1 40 4 8 14 6 16-1 3 7 11 5 12-2 4 5 10 1 9-6l-6-23 39-101 4-43Z"
              />
              <path
                className={active('right-arm')}
                d="M248 141c16 8 23 24 29 45l16 99c3 16 6 30 1 40-4 8-14 6-16-1-3 7-11 5-12-2-4 5-10 1-9-6l6-23-39-101-4-43Z"
              />
              <path
                className={active('left-leg')}
                d="M84 307c13 17 35 26 62 27l-12 145-7 55c-9 17-31 12-36-2l-3-51-18-98Z"
              />
              <path
                className={active('right-leg')}
                d="M216 307c-13 17-35 26-62 27l12 145 7 55c9 17 31 12 36-2l3-51 18-98Z"
              />
            </>
          ) : (
            <>
              <path
                className={active('chest')}
                d="M112 108c-27 5-46 16-57 33 10 31 19 68 28 106 18 10 116 10 134 0 9-38 18-75 28-106-11-17-30-28-57-33-8 20-20 30-38 30s-30-10-38-30Z"
              />
              <path
                className={active('abdomen')}
                d="M83 239c18 9 39 13 67 13s49-4 67-13l-12 73c-14 18-35 26-55 26s-41-8-55-26Z"
              />
              <path
                className={active('left-arm')}
                d="M62 136c-15 10-21 27-27 49L18 279c-4 15-7 29-2 39 4 9 14 7 17-1 3 7 11 5 12-2 4 5 10 1 9-6l-6-23 39-96 3-44Z"
              />
              <path
                className={active('right-arm')}
                d="M238 136c15 10 21 27 27 49l17 94c4 15 7 29 2 39-4 9-14 7-17-1-3 7-11 5-12-2-4 5-10 1-9-6l6-23-39-96-3-44Z"
              />
              <path
                className={active('left-leg')}
                d="M96 306c13 17 29 24 50 25l-10 147-7 56c-9 17-31 12-36-3l-3-52-17-97Z"
              />
              <path
                className={active('right-leg')}
                d="M204 306c-13 17-29 24-50 25l10 147 7 56c9 17 31 12 36-3l3-52 17-97Z"
              />
            </>
          )}
          <path
            className="human-foot left"
            d="M89 526c6 11 30 15 39 2l7 10c4 8-1 15-10 16H90c-9-1-11-9-1-28Z"
          />
          <path
            className="human-foot right"
            d="M211 526c-6 11-30 15-39 2l-7 10c-4 8 1 15 10 16h35c9-1 11-9 1-28Z"
          />
          <path
            className="anatomy-detail face"
            d="M137 54c3 2 7 2 10 0m6 0c3 2 7 2 10 0m-16 8 3 6 3-1m-13 13c7 4 14 4 21 0"
          />
          <path className="anatomy-detail clavicle" d="M103 137c19 15 34 15 47 7 13 8 28 8 47-7" />
          <path
            className="anatomy-detail pectoral"
            d="M83 174c21-14 42-14 64-2m6 0c22-12 43-12 64 2"
          />
          <path className="anatomy-detail center" d="M150 146v164" />
          <path className="anatomy-detail knee" d="M91 420c13 7 26 7 39 0m40 0c13 7 26 7 39 0" />
          <circle className="anatomy-detail navel" cx="150" cy="282" r="2.5" />
        </g>
      </svg>
      <span className="body-axis">
        {gender.toUpperCase()} ANATOMICAL MODEL · {side ? 'LATERAL' : 'ANTERIOR'}
      </span>
    </div>
  )
}
