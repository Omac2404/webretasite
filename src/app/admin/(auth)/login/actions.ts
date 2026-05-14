"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
} from "@/lib/admin-session"

const ADMIN_USER = process.env.ADMIN_USER ?? "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "123456"

export type LoginState = { error?: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!username || !password) {
    return { error: "Kullanıcı adı ve şifre gerekli." }
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return { error: "Kullanıcı adı veya şifre hatalı." }
  }

  const token = await createSession(username)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  redirect("/admin")
}

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect("/admin/login")
}
