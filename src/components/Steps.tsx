import { Compass, FileCheck2, MessageSquareText, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useContent } from '../content/ContentContext'
import { Wand } from './Wand'

const ICONS = [MessageSquareText, Compass, FileCheck2, Send]

// The wand reveal plays once per visit; this remembers it for the rest of the browser session.
const CAST_KEY = 'lumos-steps-cast'

type Phase = 'waiting' | 'casting' | 'done'

function initialPhase(): Phase {
  try {
    if (sessionStorage.getItem(CAST_KEY)) return 'done'
  } catch {
    /* storage unavailable: still play it */
  }
  if (typeof IntersectionObserver === 'undefined') return 'done'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'done'
  return 'waiting'
}

export function Steps() {
  const { t } = useContent()
  const ref = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>(initialPhase)

  useEffect(() => {
    if (phase !== 'waiting' || !ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        setPhase('casting')
        try {
          sessionStorage.setItem(CAST_KEY, '1')
        } catch {
          /* storage unavailable */
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [phase])

  return (
    <section ref={ref} className="bg-white pt-24 pb-24 sm:pt-32 lg:pb-32" aria-labelledby="steps-title">
      <div className="container-x">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-center sm:text-start">{t.steps.label}</p>
            <h2 id="steps-title" className="display mx-auto mt-4 max-w-[680px] text-center text-5xl sm:mx-0 sm:text-start sm:text-6xl lg:text-[4.4rem]">
              {t.steps.title}
            </h2>
          </div>
          <span className="hidden shrink-0 text-gold-500 sm:inline rtl:-scale-x-100">
            <Wand cast={phase === 'casting'} className="size-24 sm:size-32 lg:size-40" />
          </span>
        </div>

        <div className="relative mt-16 lg:mt-20">
        <span
          className="pointer-events-none absolute start-0 top-3 rotate-[22deg] text-gold-500 sm:hidden rtl:-rotate-[22deg]"
          aria-hidden
        >
          <span className="block rtl:-scale-x-100">
            <Wand cast={phase === 'casting'} className="size-24" />
          </span>
        </span>
        <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {t.steps.items.map((step, i) => {
            const Icon = ICONS[i % ICONS.length]
            const last = i === t.steps.items.length - 1
            return (
              <li
                key={i}
                className={`relative text-center sm:text-start ${phase === 'waiting' ? 'opacity-0' : phase === 'casting' ? 'animate-step-in' : ''}`}
                // Steps follow the wand's flick, one after another.
                style={phase === 'casting' ? { animationDelay: `${0.55 + i * 0.3}s` } : undefined}
              >
                <div className="relative flex items-center justify-center sm:justify-start">
                  <span className="grid size-[122px] shrink-0 place-items-center rounded-full ring-1 ring-gold-500/40 ring-offset-0">
                    <span className={`grid size-[104px] place-items-center rounded-full ${last ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-gold-400'}`}>
                      <Icon size={34} strokeWidth={1.7} />
                    </span>
                  </span>
                  <span className="ms-1 hidden h-0 flex-1 border-t-2 border-dotted border-gold-500/70 lg:block" aria-hidden />
                </div>
                <p className="mt-4 font-serif text-2xl font-medium text-gold-600">
                  {t.steps.stepWord} {i + 1}
                </p>
                <h3 className="mt-4 text-[22px] font-semibold text-navy-800">{step.title}</h3>
                <p className="mx-auto mt-4 max-w-[300px] leading-relaxed text-slate-ink sm:mx-0">{step.text}</p>
              </li>
            )
          })}
        </ol>
        </div>
      </div>
    </section>
  )
}
