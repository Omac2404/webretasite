import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import { matchRedirect, readRedirectsCached } from "@/lib/redirects-store"

// Runs on every page-like request (assets and /api are excluded by the
// matcher below). Two jobs:
//
//   1. Public redirects — admin-managed rules that 301 old WordPress URLs
//      to their new home, so years of indexed Google links don't 404 when
//      the domain's A record points here. Rules live in data/redirects.json
//      and are read through an mtime-cached helper, so edits in the panel
//      take effect on the next request without a redeploy.
//
//   2. Admin gate — every /admin route except the public auth flows
//      requires a valid signed session cookie; otherwise we bounce to the
//      login page with the requested path captured in `?next=`.
//
// Next 16's `proxy.ts` (the renamed `middleware.ts`) always runs in the
// Node.js runtime, so it can read the redirect file from disk with
// node:fs directly — no runtime config needed.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // --- 1. Public redirects (skip the admin area entirely) ---
  if (!pathname.startsWith("/admin")) {
    const rules = await readRedirectsCached()
    if (rules.length > 0) {
      const hit = matchRedirect(pathname, req.nextUrl.search, rules)
      if (hit) {
        const target = /^https?:\/\//i.test(hit.destination)
          ? new URL(hit.destination)
          : new URL(hit.destination, req.url)
        // 301 permanent (SEO-preserving) or 302 while testing.
        return NextResponse.redirect(target, hit.permanent ? 301 : 302)
      }
    }
    return NextResponse.next()
  }

  // --- 2. Admin gate ---
  // Public auth flows — login and the forgot-password wizard need to be
  // reachable without a session cookie.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/forgot")) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySession(cookie)
  if (session) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = "/admin/login"
  if (pathname !== "/admin") {
    url.searchParams.set("next", pathname)
  } else {
    url.searchParams.delete("next")
  }
  return NextResponse.redirect(url)
}

export const config = {
  // Run on all page-like paths (so both redirects and the admin gate
  // fire), but skip Next internals, the API, and static asset requests
  // by extension so the middleware never touches css/js/image traffic.
  matcher: [
    "/((?!api/|_next/|.*\\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|txt|xml|json|pdf|zip|mp4|webm|mp3)$).*)",
  ],
}
