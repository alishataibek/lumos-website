import { CheckCircle2, ChevronDown, LoaderCircle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useContent } from '../content/ContentContext'
import { countryList, DEFAULT_COUNTRY } from '../lib/countries'
import { whatsappLink } from '../lib/links'
import { supabase } from '../lib/supabase'
import { WhatsAppIcon } from './BrandIcons'

interface Props {
  planIndex: number
  onClose: () => void
}

type Status = 'idle' | 'sending' | 'done' | 'error'

/** Emails the request to the owner via Web3Forms. Best effort: the request is already saved. */
async function notifyByEmail(key: string, lead: Record<string, string | null>) {
  if (!key.trim()) return
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key.trim(),
        subject: `New consultation request: ${lead.name}`,
        from_name: 'Lumos website',
        Name: lead.name,
        Country: lead.countryName ?? '—',
        Phone: lead.phone,
        email: lead.email ?? undefined,
        'Wants to study': lead.interest ?? '—',
        Package: lead.package ?? '—',
        Message: lead.message ?? '—',
        Language: lead.lang,
      }),
    })
  } catch {
    /* the admin inbox still has the request */
  }
}

const field =
  'mt-1.5 w-full rounded-xl border border-navy-800/15 bg-white px-4 py-3 text-[15px] text-navy-800 outline-none transition placeholder:text-navy-800/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30'

// The phone box sits beside the country picker, so it takes no top margin of its own.
const fieldInRow = field.replace('mt-1.5 ', '')

/** Mounted only while open, so every opening starts from a fresh form. */
export function ConsultModal({ planIndex, onClose }: Props) {
  const { t, settings, content, lang } = useContent()
  const [status, setStatus] = useState<Status>('idle')
  const [plan, setPlan] = useState(planIndex)
  const countries = useMemo(() => countryList(lang), [lang])
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY)
  const country = countries.find((c) => c.iso === countryIso) ?? countries[0]
  const firstInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    setTimeout(() => firstInput.current?.focus(), 50)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get('company')) return // honeypot: bots fill every field
    const lead = {
      name: String(fd.get('name') ?? '').trim(),
      // Stored with its country code (e.g. "+971 50 123 4567") so the number is always dialable.
      phone: `+${country.dial} ${String(fd.get('phone') ?? '').trim().replace(/^\+?0*/, '')}`,
      country: country.iso,
      email: String(fd.get('email') ?? '').trim() || null,
      interest: String(fd.get('interest') ?? '').trim() || null,
      package: content.copy.en.packages.plans[plan]?.name ?? null,
      message: String(fd.get('message') ?? '').trim() || null,
      lang,
    }

    if (!supabase) {
      // No backend configured: hand the request over to WhatsApp instead.
      const text = [
        `${t.form.title}`,
        `${t.form.name}: ${lead.name}`,
        `${t.form.phone}: ${lead.phone} (${country.name})`,
        lead.email && `Email: ${lead.email}`,
        lead.interest && `${t.form.interest} ${lead.interest}`,
        `${t.form.package}: ${t.packages.plans[plan]?.name ?? ''}`,
        lead.message,
      ]
        .filter(Boolean)
        .join('\n')
      window.open(whatsappLink(settings, text), '_blank', 'noopener')
      setStatus('done')
      return
    }

    setStatus('sending')
    let { error } = await supabase.from('leads').insert(lead)
    // Databases set up before the country column or Arabic existed reject those values; save the
    // request anyway (the phone number still starts with the country code).
    if (error) {
      ;({ error } = await supabase
        .from('leads')
        .insert({ ...lead, country: undefined, lang: lead.lang === 'ar' ? null : lead.lang }))
    }
    if (!error) void notifyByEmail(settings.notifyKey, { ...lead, countryName: country.name })
    setStatus(error ? 'error' : 'done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/70 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-title"
        className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-white p-7 shadow-2xl sm:rounded-[28px] sm:p-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.form.close}
          className="absolute top-5 end-5 grid size-10 place-items-center rounded-full text-navy-800/60 hover:bg-navy-800/5 hover:text-navy-800"
        >
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={56} className="mx-auto text-gold-500" strokeWidth={1.5} />
            <h2 className="display mt-5 text-4xl">{t.form.successTitle}</h2>
            <p className="mt-3 text-slate-ink">{t.form.successText}</p>
            <button type="button" onClick={onClose} className="btn-navy mt-8">
              {t.form.close}
            </button>
          </div>
        ) : (
          <>
            <h2 id="consult-title" className="display pe-10 text-4xl sm:text-[2.6rem]">
              {t.form.title}
            </h2>
            <p className="mt-3 text-slate-ink">{t.form.subtitle}</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <label className="block text-sm font-semibold">
                {t.form.name}
                <input ref={firstInput} name="name" required maxLength={120} autoComplete="name" className={field} />
              </label>
              <div>
                <label htmlFor="consult-phone" className="block text-sm font-semibold">
                  {t.form.phone}
                </label>
                <div className="mt-1.5 flex gap-2" dir="ltr">
                  {/* Country code: a compact flag + code, with the full country list on tap. */}
                  <div className="relative shrink-0 rounded-xl border border-navy-800/15 bg-white transition focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/30">
                    <span className="pointer-events-none flex h-full items-center gap-1.5 ps-3 pe-8 text-[15px] text-navy-800" aria-hidden>
                      <span className="text-lg leading-none">{country.flag}</span>+{country.dial}
                    </span>
                    <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-navy-800/50" />
                    <select
                      value={countryIso}
                      onChange={(e) => setCountryIso(e.target.value)}
                      aria-label={t.form.country}
                      className="absolute inset-0 w-full cursor-pointer opacity-0"
                    >
                      {countries.map((c, i) => (
                        <option key={c.iso + i} value={c.iso}>
                          {c.flag} {c.name} (+{c.dial})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    id="consult-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    required
                    maxLength={24}
                    autoComplete="tel-national"
                    placeholder="50 123 4567"
                    className={fieldInRow}
                  />
                </div>
              </div>
              <label className="block text-sm font-semibold">
                {t.form.email}
                <input name="email" type="email" required maxLength={160} autoComplete="email" className={field} />
              </label>
              <label className="block text-sm font-semibold">
                {t.form.interest}
                <input name="interest" required maxLength={200} placeholder={t.form.interestPlaceholder} className={field} />
              </label>
              <label className="block text-sm font-semibold">
                {t.form.package}
                <select value={plan} onChange={(e) => setPlan(Number(e.target.value))} className={field}>
                  {t.packages.plans.map((p, i) => (
                    <option key={i} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                {t.form.message}
                <textarea name="message" rows={3} maxLength={2000} className={field} />
              </label>

              {status === 'error' && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t.form.error}</p>}

              <button type="submit" disabled={status === 'sending'} className="btn-gold w-full py-4 text-base">
                {status === 'sending' && <LoaderCircle size={18} className="animate-spin" />}
                {status === 'sending' ? t.form.sending : t.form.submit}
              </button>
            </form>

            <a
              href={whatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-navy-800/80 hover:text-navy-800"
            >
              <WhatsAppIcon size={16} className="text-gold-600" />
              {t.form.whatsappInstead}
            </a>
          </>
        )}
      </div>
    </div>
  )
}
