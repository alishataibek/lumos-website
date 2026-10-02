import type { CSSProperties } from 'react'

/** Four-pointed sparkle (concave star), matching the stars in the Lumos logo. */
function star(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`
}

// Knots along the wand, as [distance from handle, half-width, half-length]: the logo's gnarled wand.
const KNOTS: [number, number, number][] = [
  [5, 4.2, 3],
  [11, 3.8, 2.2],
  [33, 3.2, 2.1],
  [55, 2.7, 1.9],
  [75, 2.2, 1.6],
]

const SPARKS = [
  { d: star(84, 10, 9), delay: 0.35 },
  { d: star(66, 7, 4.5), delay: 0.45 },
  { d: star(93, 25, 5), delay: 0.55 },
]

const fromCenter: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' }

/**
 * The wand from the Lumos logo, drawn on its own. Uses currentColor.
 * `cast` plays the swish once: the wand flicks and the sparkles pop.
 */
export function Wand({
  className = '',
  cast = false,
  sparkles = true,
  weight = 1,
}: {
  className?: string
  cast?: boolean
  sparkles?: boolean
  /** Thickness multiplier; small icons need a sturdier wand to read. */
  weight?: number
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden
      className={`${className} ${cast ? 'animate-wand-swish' : ''}`}
      style={{ transformOrigin: '12% 92%' }}
    >
      <g transform="translate(12 92) rotate(-50)">
        <path d={`M0 ${-3.4 * weight} L100 ${-1.1 * weight} L100 ${1.1 * weight} L0 ${3.4 * weight} Z`} />
        {KNOTS.map(([x, w, l]) => (
          <ellipse key={x} cx={x} cy={0} rx={l * weight} ry={w * weight} />
        ))}
        <path d={star(100, 0, 3.4 * weight)} />
      </g>
      {sparkles &&
        SPARKS.map((s) => (
          <path
            key={s.d}
            d={s.d}
            className={cast ? 'animate-spark-pop' : ''}
            style={{ ...fromCenter, animationDelay: cast ? `${s.delay}s` : undefined }}
          />
        ))}
    </svg>
  )
}

/**
 * Slim wand with a five-point star on the tip, used on the "Book a free consultation" button.
 * `cast` swishes the wand while the star spins and glows. Uses currentColor.
 */
export function StarWand({ className = '', cast = false }: { className?: string; cast?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden
      className={`overflow-visible ${className} ${cast ? 'animate-wand-swish' : ''}`}
      style={{ transformOrigin: '15% 85%' }}
    >
      <path d="M14 90 L68 36 L74 42 L20 96 Z" />
      <path
        d="M78 8 L83 22 L98 22 L86 31 L90 45 L78 36 L66 45 L70 31 L58 22 L73 22 Z"
        className={cast ? 'animate-star-spin' : ''}
        style={fromCenter}
      />
    </svg>
  )
}
