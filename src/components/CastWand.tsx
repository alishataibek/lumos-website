import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { StarWand } from './Wand'

// Long enough for the star to spin and the glitter to spray before the action runs.
const CAST_MS = 750

/**
 * Plays the wand animation, then runs the action. Visitors who prefer reduced motion get the
 * action straight away. Clicks during the animation are ignored.
 */
export function useCast() {
  const [casting, setCasting] = useState(false)
  const busy = useRef(false)
  const cast = useCallback((action: () => void) => {
    if (busy.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return action()
    busy.current = true
    setCasting(true)
    setTimeout(() => {
      busy.current = false
      setCasting(false)
      action()
    }, CAST_MS)
  }, [])
  return [casting, cast] as const
}

// Glitter sprayed from the star: fixed positions (not random) so every cast looks the same.
// Each piece flies up and outwards from the tip, then drifts down as it fades.
const GLITTER = Array.from({ length: 16 }, (_, i) => {
  const angle = (-115 + i * 9) * (Math.PI / 180) // fan from up-left round to the right
  const dist = 34 + ((i * 37) % 30)
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist),
    fall: 18 + ((i * 13) % 22),
    size: 3 + (i % 4),
    star: i % 3 === 0,
    color: ['#ffffff', '#fff3c4', '#e2c683'][i % 3],
    delay: 0.08 + (i % 5) * 0.04,
  }
})

/** The star-tipped wand used in gold buttons; while `casting` it swishes and sprays glitter. */
export function CastWand({ casting }: { casting: boolean }) {
  return (
    <span className="relative inline-block size-7 rtl:-scale-x-100">
      <StarWand cast={casting} className="size-7" />
      {casting &&
        GLITTER.map((g, i) => (
          <span
            key={i}
            aria-hidden
            className="animate-glitter pointer-events-none absolute"
            style={
              {
                top: '6%',
                right: '6%',
                width: g.star ? g.size * 2.2 : g.size,
                height: g.star ? g.size * 2.2 : g.size,
                '--dx': `${g.dx}px`,
                '--dy': `${g.dy}px`,
                '--fall': `${g.fall}px`,
                animationDelay: `${g.delay}s`,
                background: g.star ? undefined : g.color,
                borderRadius: g.star ? undefined : '999px',
                boxShadow: g.star ? undefined : `0 0 6px ${g.color}`,
              } as CSSProperties
            }
          >
            {g.star && (
              <svg viewBox="0 0 24 24" fill={g.color} className="size-full drop-shadow-[0_0_4px_rgba(255,244,200,0.95)]">
                <path d="M12 0Q12 12 24 12Q12 12 12 24Q12 12 0 12Q12 12 12 0Z" />
              </svg>
            )}
          </span>
        ))}
    </span>
  )
}
