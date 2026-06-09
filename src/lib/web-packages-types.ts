// Types for the web-site quote wizard package picker. Standalone file
// (no node:fs) so client components can import the types without pulling
// the file-system code into the browser bundle.

export type WebPackageIconKey =
  | "layers"
  | "globe"
  | "boxes"
  | "rocket"
  | "sparkles"
  | "refresh"

export const WEB_PACKAGE_ICON_KEYS: WebPackageIconKey[] = [
  "layers",
  "globe",
  "boxes",
  "rocket",
  "sparkles",
  "refresh",
]

export type WebPackage = {
  // Stable slug, used as quote.projectType. Edit-safe: changing requires
  // a manual migration of existing in-memory selections (no DB yet).
  id: string
  label: string
  tagline: string
  descriptor: string
  desc: string
  bullets: string[]
  iconKey: WebPackageIconKey
  // When true, selecting this package opens the "Webreta KOBİ" cross-sell
  // popup. Admin-controlled per package.
  kobiRedirect: boolean
  // Estimated quote range (in TRY). Both null means "don't display."
  priceMin: number | null
  priceMax: number | null
}

// "Webreta KOBİ" cross-sell banner that sits under the quote wizard.
// All copy is admin-editable; the visual side optionally accepts an
// uploaded background image — when empty we fall back to the gradient.
export type KobiBanner = {
  imageUrl: string
  eyebrow: string
  bigTitle: string
  bigSubtitle: string
  tags: string[]
  rightEyebrow: string
  title: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaHref: string
}

// Heading shown above the quote wizard form. titleLeader renders in the
// regular weight; titleHighlight renders in bold brand-blue, so admins
// can decide which part of the headline pops.
export type WizardHeading = {
  titleLeader: string
  titleHighlight: string
  subtitle: string
}

// Cross-sell popup shown in the quote wizard when a visitor picks a package
// flagged `kobiRedirect`. All copy + the outbound link are admin-editable.
export type KobiPopup = {
  title: string
  description: string
  dismissLabel: string // "Bu pakette devam et" button
  ctaLabel: string // "Webreta KOBİ" button
  ctaHref: string
}

export type WebPackagesData = {
  packages: WebPackage[]
  kobiBanner: KobiBanner
  kobiPopup: KobiPopup
  wizardHeading: WizardHeading
}

export const MAX_WEB_PACKAGE_BULLETS = 6
export const MAX_KOBI_TAGS = 5
export const MAX_KOBI_BULLETS = 6
