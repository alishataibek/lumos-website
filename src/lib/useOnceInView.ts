import { useEffect, useRef, useState } from 'react'

export type RevealPhase = 'waiting' | 'playing' | 'done'

function initialPhase(key: string): RevealPhase {
  try {
    if (sessionStorage.getItem(key)) return 'done'
  } catch {
    /* storage unavailable: still play it */
  }
  if (typeof IntersectionObserver === 'undefined') return 'done'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'done'
  return 'waiting'
}

/**
 * Plays an entrance animation the first time the element scrolls into view, once per browser
 * session (`key` remembers it). Visitors who prefer reduced motion get the finished state.
 */
export function useOnceInView<T extends HTMLElement>(key: string, threshold = 0.3) {
  const ref = useRef<T>(null)
  const [phase, setPhase] = useState<RevealPhase>(() => initialPhase(key))

  useEffect(() => {
    if (phase !== 'waiting' || !ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        setPhase('playing')
        try {
          sessionStorage.setItem(key, '1')
        } catch {
          /* storage unavailable */
        }
      },
      { threshold },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [phase, key, threshold])

  return [ref, phase] as const
}
