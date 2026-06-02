// Footer config types. Client-safe.

export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "x"
  | "facebook"
  | "youtube"

export const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X (Twitter)" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
]

export type FooterConfig = {
  // Big display headline, split into three styled spans so the admin
  // can keep the existing gradient highlight on the middle phrase.
  titleLeading: string
  titleHighlight: string
  titleTrailing: string
  // Paragraph under the headline.
  subtitle: string
  // Primary CTA button — defaults to "Bize Ulaşın".
  ctaLabel: string
  ctaHref: string
  // Copyright line. {year} placeholder is replaced at render time so the
  // admin doesn't have to remember to bump it every January.
  copyright: string
  // Direct-contact card values.
  contact: {
    email: string
    phone: string
    address: string
  }
  // Social URLs, keyed by platform. Empty string = hide that icon.
  socials: Record<SocialPlatform, string>
  // Menu items — the admin picks from SITE_PAGES, so we store hrefs.
  // Order is meaningful (drives display order in the footer nav).
  navHrefs: string[]
  // Legal page IDs (from legal-store) to render in the bottom-right
  // strip. Order is meaningful here too.
  legalPageIds: string[]
}

export const DEFAULT_FOOTER: FooterConfig = {
  titleLeading: "Sıradaki",
  titleHighlight: "başarı hikayesi",
  titleTrailing: "sizinki olsun.",
  subtitle:
    "Bir e-posta, bir mesaj, bir telefon — yeterli. 24 saat içinde dönüş yapıyoruz.",
  ctaLabel: "Bize Ulaşın",
  ctaHref: "/iletisim",
  copyright: "© {year} Webreta · İzmir merkezli web ajansı",
  contact: {
    email: "hello@webreta.com",
    phone: "+90 (XXX) XXX XX XX",
    address: "İzmir, Türkiye",
  },
  socials: {
    instagram: "",
    linkedin: "",
    x: "",
    facebook: "",
    youtube: "",
  },
  navHrefs: [
    "/hakkimizda",
    "/web-site",
    "/dijital-reklamlar",
    "/referanslar",
    "/blog",
    "/iletisim",
  ],
  legalPageIds: [],
}

// Substitute {year} with the current year. Anything else passes through
// untouched.
export function renderCopyright(template: string): string {
  return template.replace(/\{year\}/g, String(new Date().getFullYear()))
}
