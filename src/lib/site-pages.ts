// Master list of internal pages the admin can pick from when wiring up
// the footer menu. Single source of truth — add a route here if you
// want it to show up in the footer picker.

export type SitePage = {
  href: string
  label: string
}

export const SITE_PAGES: SitePage[] = [
  { href: "/", label: "Anasayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/web-site", label: "Web Site" },
  { href: "/dijital-reklamlar", label: "Dijital Reklamlar" },
  { href: "/referanslar", label: "Referanslar" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
]
