"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Lock, Mail } from "lucide-react"
import { loginAction, type LoginState } from "./actions"

const initialState: LoginState = {}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState)

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-12">
      <BgDecor />

      <div className="relative w-full max-w-[420px]">
        <div
          className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white"
          style={{
            boxShadow:
              "0 1px 2px rgba(60,99,159,0.04), 0 24px 60px -20px rgba(60,99,159,0.22), 0 4px 16px -4px rgba(60,99,159,0.08)",
          }}
        >
          <div className="flex flex-col items-center px-8 pb-2 pt-9">
            <Image
              src="/brand/webreta-logo.webp"
              alt="Webreta"
              width={364}
              height={64}
              priority
              className="h-7 w-auto"
            />
            <h1 className="mt-5 text-[20px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
              Yönetim Paneli
            </h1>
            <p className="mt-1.5 text-[13px] text-black/55">
              Devam etmek için giriş yapın
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4 px-8 pb-7 pt-6">
            <div>
              <label
                htmlFor="email"
                className="text-[12.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
              >
                E-posta
              </label>
              <div className="relative mt-2">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username email"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-black/[0.1] bg-white py-3 pl-10 pr-4 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                  placeholder=""
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-[12.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
              >
                Şifre
              </label>
              <div className="relative mt-2">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-black/[0.1] bg-white py-3 pl-10 pr-4 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                  placeholder="••••••"
                />
              </div>
            </div>

            {state.error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
              >
                {state.error}
              </div>
            )}

            <SubmitButton />

            <div className="mt-1 text-center">
              <Link
                href="/admin/forgot"
                className="text-[12px] font-medium text-[#3c639f] underline-offset-2 hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-black/40">
          © {new Date().getFullYear()} Webreta · Yetkisiz erişim yasaktır
        </p>
      </div>
    </main>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="cta-primary relative mt-1 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-[14px] font-semibold tracking-[-0.005em]"
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
        {!pending && <ArrowRight size={15} />}
      </span>
    </button>
  )
}

function BgDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(60,99,159,0.22) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(60,99,159,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(rgba(60,99,159,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </>
  )
}
