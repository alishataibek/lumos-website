import { ChevronDown, Minus, Plus } from 'lucide-react'
import { LANGS, RTL_LANGS, type Copy, type Lang } from '../content/types'
import { TextInput } from './ui'

type Path = (string | number)[]
type SetAt = (lang: Lang | 'both', path: Path, value: unknown) => void

const SECTION_TITLES: Record<keyof Copy, string> = {
  meta: 'Browser tab title & search description',
  nav: 'Top bar & navigation',
  hero: 'Hero (top of the page)',
  why: 'Why Lumos (three boxes under the hero)',
  steps: 'How it works (steps)',
  packages: 'Packages & prices',
  about: 'About us',
  founder: 'Founders — Diana (first card)',
  cofounder: 'Founders — Marwan, co-CEO (second card)',
  application: 'Application section',
  contact: 'Contact section',
  footer: 'Footer',
  form: 'Consultation form (pop-up)',
}

const LABELS: Record<string, string> = {
  line1: 'Headline — line 1',
  line2: 'Headline — line 2',
  cta: 'Button',
  eyebrow: 'Small label above headline',
  label: 'Small label',
  stepWord: 'Word “Step”',
  startApplication: 'Header button',
  whatsappCta: 'WhatsApp button',
  instagramCta: 'Instagram button',
  mapTitle: 'Map card title',
  rights: 'Copyright text',
}

function humanize(key: string) {
  return LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/(\d+)/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

function get(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o as Record<string | number, unknown>)?.[k], obj)
}

type Vals = Record<Lang, unknown>

const LANG_NAMES: Record<Lang, string> = { en: 'English', ru: 'Russian', ar: 'Arabic' }

/** The same child of every language's value, e.g. each language's `hero.line1`. */
function pick(vals: Vals, k: string | number): Vals {
  return Object.fromEntries(LANGS.map((l) => [l, get(vals[l], [k])])) as Vals
}

function Node({ path, vals, setAt, depth }: { path: Path; vals: Vals; setAt: SetAt; depth: number }) {
  const key = String(path[path.length - 1])
  const en = vals.en // English defines the shape of every section

  if (typeof en === 'string') {
    const long = LANGS.some((l) => String(vals[l] ?? '').length > 50) || key === 'bio' || key === 'quote'
    return (
      <div className="grid gap-2 py-3 lg:grid-cols-[150px_1fr_1fr_1fr] lg:gap-3">
        <p className="pt-2 text-[13px] font-semibold text-navy-800">{humanize(key)}</p>
        {LANGS.map((l) => (
          <div key={l} className="relative">
            <span className="pointer-events-none absolute top-2 right-2 z-10 rounded bg-navy-800/5 px-1.5 text-[10px] font-bold uppercase text-navy-800/50">{l}</span>
            <TextInput
              value={String(vals[l] ?? '')}
              onChange={(v) => setAt(l, path, v)}
              multiline={long}
              dir={RTL_LANGS.includes(l) ? 'rtl' : 'ltr'}
              className="pr-10"
            />
          </div>
        ))}
      </div>
    )
  }

  if (Array.isArray(en)) {
    const isStringList = en.every((x) => typeof x === 'string')
    return (
      <div className="py-2">
        <p className="pt-2 text-[13px] font-bold tracking-wide text-gold-600 uppercase">{humanize(key)}</p>
        <div className="divide-y divide-navy-800/5">
          {en.map((_, i) =>
            isStringList ? (
              <div key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Node path={[...path, i]} vals={pick(vals, i)} setAt={setAt} depth={depth + 1} />
                </div>
                <button
                  type="button"
                  onClick={() => setAt('both', path, i)}
                  className="mt-4 grid size-8 shrink-0 place-items-center rounded-lg text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                  aria-label="Remove line"
                >
                  <Minus size={14} />
                </button>
              </div>
            ) : (
              <div key={i} className="my-3 rounded-xl bg-navy-800/[0.03] px-4 py-2 ring-1 ring-navy-800/5">
                <p className="pt-2 text-xs font-bold text-navy-800/60">#{i + 1}</p>
                <Node path={[...path, i]} vals={pick(vals, i)} setAt={setAt} depth={depth + 1} />
              </div>
            ),
          )}
        </div>
        {isStringList && (
          <button
            type="button"
            onClick={() => setAt('both', path, 'append')}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-navy-800 ring-1 ring-navy-800/15 hover:bg-navy-800/5"
          >
            <Plus size={14} /> Add line
          </button>
        )}
      </div>
    )
  }

  if (en && typeof en === 'object') {
    return (
      <div className={depth > 0 && path.length > 1 && typeof path[path.length - 1] !== 'number' ? 'mt-2' : ''}>
        {Object.keys(en).map((k) => (
          <Node key={k} path={[...path, k]} vals={pick(vals, k)} setAt={setAt} depth={depth + 1} />
        ))}
      </div>
    )
  }
  return null
}

export function TextsEditor({ copy, setAt }: { copy: Record<Lang, Copy>; setAt: SetAt }) {
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-gold-500/10 px-4 py-3 text-sm text-navy-800">
        Columns from left to right: {LANGS.map((l, i) => (
          <span key={l}>
            {i > 0 && ', '}
            <b>{LANG_NAMES[l]}</b>
          </span>
        ))}
        . Changes go live for all visitors after you press <b>Save changes</b>.
      </p>
      {(Object.keys(SECTION_TITLES) as (keyof Copy)[]).map((section) => (
        <details key={section} className="group rounded-2xl bg-white shadow-sm ring-1 ring-navy-800/10" open={section === 'hero'}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold text-navy-800 sm:px-6">
            {SECTION_TITLES[section]}
            <ChevronDown size={18} className="transition group-open:rotate-180" />
          </summary>
          <div className="divide-y divide-navy-800/5 border-t border-navy-800/10 px-5 pb-4 sm:px-6">
            <Node path={[section]} vals={pick(copy as unknown as Vals, section)} setAt={setAt} depth={0} />
          </div>
        </details>
      ))}
    </div>
  )
}
