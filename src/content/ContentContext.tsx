import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONTENT_ROW_ID, supabase } from '../lib/supabase'
import { mergeContent } from '../lib/merge'
import { DEFAULT_CONTENT } from './defaults'
import { LANGS, RTL_LANGS, type Copy, type Lang, type Settings, type SiteContent } from './types'

interface ContentState {
  content: SiteContent
  settings: Settings
  t: Copy
  lang: Lang
  setLang: (l: Lang) => void
  reload: () => Promise<void>
}

const Ctx = createContext<ContentState | null>(null)
const LANG_KEY = 'lumos-lang'

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl && LANGS.includes(fromUrl as Lang)) return fromUrl as Lang
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && LANGS.includes(saved as Lang)) return saved as Lang
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

type Saved = { version?: number; copy?: Record<string, Record<string, Record<string, unknown>>> }

/**
 * Brings content saved by an older version of the site up to date, so that
 * rewritten sections show their new text instead of the stale saved copy.
 * Everything else that was saved (other texts, links, images) is kept.
 */
function migrate(saved: Saved): Saved {
  const from = saved.version ?? 1
  const copy = saved.copy ?? {}
  if (from < 2) {
    // v2: packages rewritten (new plans, prices, wording); founders became two co-CEOs.
    for (const lang of Object.keys(copy)) {
      delete copy[lang].packages
      if (copy[lang].founder) {
        delete copy[lang].founder.label
        delete copy[lang].founder.role
      }
    }
  }
  if (from < 3) {
    // v3: packages heading became one line ("Need help? Start here.") with no subtitle.
    for (const lang of Object.keys(copy)) {
      delete copy[lang].packages?.title
      delete copy[lang].packages?.subtitle
    }
  }
  return { ...saved, copy, version: DEFAULT_CONTENT.version }
}

/** Saved admin edits on top of the built-in content (which may be newer than the saved copy). */
function build(saved: Saved | null): SiteContent {
  return saved ? mergeContent(DEFAULT_CONTENT, migrate(structuredClone(saved))) : DEFAULT_CONTENT
}

/** The admin edits as stored: an object, null when nothing was ever saved, undefined if unreachable. */
async function fetchSaved(): Promise<Saved | null | undefined> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_content').select('data').eq('id', CONTENT_ROW_ID).maybeSingle()
  if (error) return undefined
  return (data?.data as Saved | undefined) ?? null
}

export async function fetchContent(): Promise<SiteContent> {
  return build((await fetchSaved()) ?? null)
}

// The last saved edits this browser saw, so a repeat visit shows them instantly instead of
// flashing the built-in texts while Supabase answers. Raw edits are cached (not the merged
// result) so a new deploy's built-in texts still apply underneath them.
const CACHE_KEY = 'lumos-content'

function readCache(): Saved | null | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw === null ? undefined : (JSON.parse(raw) as Saved | null)
  } catch {
    return undefined
  }
}

function writeCache(saved: Saved | null) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(saved))
  } catch {
    /* storage unavailable */
  }
}

/** First-visit wait for saved edits before falling back to the built-in texts. */
const FIRST_LOAD_TIMEOUT_MS = 3000

function Splash() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-white">
      <img src={DEFAULT_CONTENT.settings.images.logo} alt="Lumos Global Education" className="h-14 w-auto motion-safe:animate-pulse" />
    </div>
  )
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [cached] = useState(readCache)
  const [content, setContent] = useState<SiteContent>(() => build(cached ?? null))
  // Show the page right away when this browser has seen the saved edits before (or there is no backend).
  const [ready, setReady] = useState(cached !== undefined || !supabase)
  const [lang, setLangState] = useState<Lang>(initialLang)

  const reload = useCallback(async () => {
    const saved = await fetchSaved()
    if (saved !== undefined) {
      writeCache(saved)
      setContent(build(saved))
    }
    setReady(true)
  }, [])

  useEffect(() => {
    void reload()
    const timer = setTimeout(() => setReady(true), FIRST_LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [reload])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* storage unavailable */
    }
  }, [])

  const t = content.copy[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, t])

  const value = useMemo(
    () => ({ content, settings: content.settings, t, lang, setLang, reload }),
    [content, t, lang, setLang, reload],
  )
  return <Ctx.Provider value={value}>{ready ? children : <Splash />}</Ctx.Provider>
}

export function useContent() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useContent must be used inside ContentProvider')
  return v
}
