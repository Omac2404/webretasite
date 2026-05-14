import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"

// Gates every /admin route except /admin/login. The login server action
// sets the signed cookie on success; if the cookie is missing or its
// HMAC fails to verify, the user is redirected to the login page with
// the originally requested path captured in `?next=` so we can bounce
// them back after sign-in.
//
// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` — the
// file lives at the same src/ root and the exported function is named
// `proxy` instead of `middleware`. Behavior is otherwise identical.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === "/admin/login") {
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
  matcher: ["/admin/:path*"],
}
