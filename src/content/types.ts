export type Lang = 'en' | 'ru' | 'ar'

export const LANGS: Lang[] = ['en', 'ru', 'ar']

/** Languages written right to left. */
export const RTL_LANGS: Lang[] = ['ar']

export interface TitledText {
  title: string
  text: string
}

export interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
}

/** Every piece of visible text on the site. One copy per language. */
export interface Copy {
  meta: { title: string; description: string }
  nav: {
    home: string
    packages: string
    about: string
    application: string
    contact: string
    startApplication: string
    instagram: string
    whatsapp: string
    menu: string
  }
  hero: {
    eyebrow: string
    line1: string
    line2: string
    description: string
    cta: string
  }
  why: { label: string; items: TitledText[] }
  steps: { label: string; title: string; stepWord: string; items: TitledText[] }
  packages: {
    label: string
    title: string
    subtitle: string
    recommended: string
    plans: Plan[]
  }
  about: { label: string; title: string; text: string; highlights: string[] }
  founder: { label: string; name: string; role: string; bio: string; quote: string }
  cofounder: { name: string; role: string; bio: string; quote: string }
  application: { label: string; title: string; text: string; cta: string; note: string }
  contact: {
    label: string
    title: string
    whatsappCta: string
    instagramCta: string
    addressLine1: string
    addressLine2: string
    mapTitle: string
    directions: string
  }
  footer: { rights: string; emailLabel: string; hoursLabel: string; hours: string; disclaimer: string }
  form: {
    title: string
    subtitle: string
    name: string
    phone: string
    email: string
    country: string
    interest: string
    interestPlaceholder: string
    package: string
    message: string
    submit: string
    sending: string
    successTitle: string
    successText: string
    whatsappInstead: string
    close: string
    error: string
  }
}

/** Non-translatable settings: contacts, links, images and display options. */
export interface Settings {
  phoneDisplay: string
  /** Company email shown in the contact section and footer. */
  email: string
  phoneLink: string
  whatsappNumber: string
  instagramUrl: string
  applicationUrl: string
  mapQuery: string
  images: {
    logo: string
    hero: string
    founder: string
    cofounder: string
    application: string
  }
  /** Web3Forms access key; when set, every consultation request is also emailed. */
  notifyKey: string
  heroUppercase: boolean
  showHeroDescription: boolean
}

export interface SiteContent {
  /** Bumped when built-in texts change in a way that must replace older saved copies. */
  version: number
  settings: Settings
  copy: Record<Lang, Copy>
}
