/**
 * Animated figure that visualises the current breathing phase.
 */

/** Figure whose chest expands and contracts with the breathing phase. */
export function HumanBreathingFigure({ phase, running }: { phase: number; running: boolean }) {
  return (
    <svg
      className={`human-breathing-figure phase-${phase} ${running ? 'active' : ''}`}
      viewBox="0 0 280 430"
      role="img"
      aria-label="Natural human silhouette demonstrating gentle chest breathing"
    >
      <defs>
        <linearGradient id="skinSilhouette" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0c3ad" stopOpacity=".92" />
          <stop offset=".52" stopColor="#b18472" stopOpacity=".78" />
          <stop offset="1" stopColor="#684e4d" stopOpacity=".58" />
        </linearGradient>
        <radialGradient id="chestGlow">
          <stop offset="0" stopColor="#b9f3e5" stopOpacity=".62" />
          <stop offset=".65" stopColor="#72cfc1" stopOpacity=".18" />
          <stop offset="1" stopColor="#72cfc1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="human-head" cx="140" cy="68" rx="43" ry="54" />
      <path className="human-neck" d="M119 110c2 23-5 29-18 38l39 28 39-28c-13-9-20-15-18-38Z" />
      <path
        className="human-torso"
        d="M101 140c-30 8-54 22-65 50-14 38-10 114-7 178h222c3-64 7-140-7-178-11-28-35-42-65-50-8 20-21 31-39 31s-31-11-39-31Z"
      />
      <path
        className="human-shoulder-line"
        d="M46 192c34-13 54-11 73 1M234 192c-34-13-54-11-73 1"
      />
      <path className="human-center-line" d="M140 174v176" />
      <ellipse className="human-chest-glow" cx="140" cy="240" rx="78" ry="68" />
      <path className="human-rib left" d="M132 210c-30 1-49 14-57 37 10 19 28 31 56 34" />
      <path className="human-rib right" d="M148 210c30 1 49 14 57 37-10 19-28 31-56 34" />
      <circle className="breath-center" cx="140" cy="244" r="8" />
    </svg>
  )
}
