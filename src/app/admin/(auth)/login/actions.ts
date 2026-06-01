"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  verifySession,
} from "@/lib/admin-session"
import { findAdminByEmail, verifyPassword } from "@/lib/admin-users-store"
import { recordAudit } from "@/lib/audit-log-store"

export type LoginState = { error?: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? formData.get("username") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." }
  }
  const admin = await findAdminByEmail(email)
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    await recordAudit("auth.login.fail", { target: email })
    return { error: "E-posta veya şifre hatalı." }
  }

  const token = await createSession(admin.email)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  await recordAudit("auth.login.ok", { target: admin.email })
  redirect("/admin")
}

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  await recordAudit("auth.logout", { target: session?.username ?? "unknown" })
  store.delete(SESSION_COOKIE)
  redirect("/admin/login")
}
