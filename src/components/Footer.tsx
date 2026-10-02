import { useContent } from '../content/ContentContext'
import { whatsappLink } from '../lib/links'
import { useOnceInView } from '../lib/useOnceInView'
import { InstagramIcon, WhatsAppIcon } from './BrandIcons'
import { SECTION_IDS } from './Header'
import { Wand } from './Wand'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { t, settings } = useContent()
  // Once per visit: a wand flies across the footer and the logo spins as it passes.
  const [ref, phase] = useOnceInView<HTMLDivElement>('lumos-footer-cast', 0.6)
  const playing = phase === 'playing'
  return (
    <footer className="overflow-hidden border-t-[6px] border-gold-500 bg-navy-900 text-white">
      <div className="container-x py-16">
        <div ref={ref} className="relative flex flex-col items-center gap-10 [perspective:900px] lg:flex-row lg:justify-between">
          {playing && (
            <span className="animate-wand-fly pointer-events-none absolute top-6 z-10 text-gold-400 lg:top-1/2" aria-hidden>
              <span className="block rotate-[38deg] rtl:-scale-x-100">
                <Wand className="size-20" weight={1.6} />
              </span>
            </span>
          )}
          <a href="#home" className={`rounded-xl bg-white px-5 py-3 ${playing ? 'animate-logo-flip' : ''}`}>
            <img src={settings.images.logo} alt="Lumos Global Education" className="h-12 w-auto" />
          </a>
          <nav className="flex flex-wrap justify-center gap-x-9 gap-y-3" aria-label="Footer">
            {SECTION_IDS.map((id) => (
              <a key={id} href={`#${id}`} className="text-[17px] font-medium hover:text-gold-400">
                {t.nav[id]}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-[50px] place-items-center rounded-full border border-gold-500 text-gold-500 hover:bg-gold-500/10"
            >
              <InstagramIcon size={19} />
            </a>
            <a
              href={whatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-[50px] place-items-center rounded-full bg-gold-500 text-navy-900 hover:bg-gold-400"
            >
              <WhatsAppIcon size={19} />
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-navy-600 pt-10 text-center text-[15px] text-white/80 lg:flex-row lg:justify-between lg:text-start">
          <p>
            © {YEAR} {t.footer.rights}
          </p>
          <p>
            {t.contact.addressLine1} · <bdi dir="ltr">{settings.phoneDisplay}</bdi>
          </p>
        </div>
      </div>
    </footer>
  )
}
