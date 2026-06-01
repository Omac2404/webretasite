// Site-wide admin-managed settings. Currently small in scope: favicon
// override and a basic maintenance flag. Pure types — safe to import
// from client components.

export type SiteSettings = {
  // Public path (e.g. "/brand/favicon-1234.png") or "" to fall back to
  // the static src/app/favicon.ico that ships in the repo.
  faviconUrl: string
  // Header logo override (header + admin). Falls back to the bundled
  // /brand/webreta-logo.webp when empty.
  logoUrl: string
  // Toggleable site-wide banner / read-only mode. Off by default.
  maintenance: {
    enabled: boolean
    message: string
  }
}

export const DEFAULT_LOGO_URL = "/brand/webreta-logo.webp"

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  faviconUrl: "",
  logoUrl: "",
  maintenance: { enabled: false, message: "" },
}
