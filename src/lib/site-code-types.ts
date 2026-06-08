// Admin-managed custom code injected into the site's <head> and end of
// <body>. Used for third-party snippets: Google Ads / Analytics tags,
// Search Console verification meta, Meta Pixel, custom API loaders, etc.
// Pure types — safe to import from client components.

export type SiteCodeSettings = {
  // Master toggle for the head slot — lets the admin keep code saved but
  // temporarily disabled without losing it.
  headEnabled: boolean
  // Raw HTML/script pasted by the admin, injected into <head>.
  headCode: string
  // Same, injected at the end of <body>.
  bodyEnabled: boolean
  bodyCode: string
}

export const DEFAULT_SITE_CODE: SiteCodeSettings = {
  headEnabled: true,
  headCode: "",
  bodyEnabled: true,
  bodyCode: "",
}
