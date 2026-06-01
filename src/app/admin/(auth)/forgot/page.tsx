"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, KeyRound, Lock, Mail } from "lucide-react"
import {
  requestCodeAction,
  resetPasswordAction,
  verifyCodeAction,
  type RequestCodeState,
  type ResetState,
  type VerifyCodeState,
} from "./actions"

type Step = "email" | "code" | "reset" | "done"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [resetId, setResetId] = useState<string>("")
  const [email, setEmail] = useState<string>("")

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
              Şifremi unuttum
            </h1>
            <StepCopy step={step} />
          </div>

          {step === "email" && (
            <EmailStep
              onNext={(id, em) => {
                setResetId(id)
                setEmail(em)
                setStep("code")
              }}
            />
          )}
          {step === "code" && (
            <CodeStep
              resetId={resetId}
              email={email}
              onNext={(id) => {
                setResetId(id)
                setStep("reset")
              }}
              onBack={() => setStep("email")}
            />
          )}
          {step === "reset" && (
            <ResetStep
              resetId={resetId}
              onDone={() => setStep("done")}
            />
          )}
          {step === "done" && <DoneStep />}
        </div>

        <p className="mt-6 text-center text-[12px] text-black/40">
          © {new Date().getFullYear()} Webreta · Yetkisiz erişim yasaktır
        </p>
      </div>
    </main>
  )
}

function StepCopy({ step }: { step: Step }) {
  const text = {
    email: "E-posta adresinize bir doğrulama kodu göndereceğiz.",
    code: "Gelen 6 haneli kodu aşağıya yazın.",
    reset: "Yeni şifrenizi belirleyin.",
    done: "Şifreniz güncellendi.",
  }[step]
  return <p className="mt-1.5 text-center text-[13px] text-black/55">{text}</p>
}

function EmailStep({
  onNext,
}: {
  onNext: (resetId: string, email: string) => void
}) {
  const [state, formAction] = useActionState<RequestCodeState, FormData>(
    requestCodeAction,
    {},
  )
  // useActionState's resolved state arrives via `state`; promote to step
  // when the action returned ok.
  if ("ok" in state && state.ok) {
    queueMicrotask(() => onNext(state.resetId, state.email))
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 px-8 pb-7 pt-6">
      <Field
        id="forgot-email"
        name="email"
        label="E-posta"
        type="email"
        icon={<Mail size={15} />}
        placeholder="webreta.digital@gmail.com"
        autoFocus
        required
      />
      {"ok" in state && !state.ok && state.error && (
        <ErrorBox text={state.error} />
      )}
      <SubmitButton label="Kodu gönder" />
      <BackLink />
    </form>
  )
}

function CodeStep({
  resetId,
  email,
  onNext,
  onBack,
}: {
  resetId: string
  email: string
  onNext: (resetId: string) => void
  onBack: () => void
}) {
  const [state, formAction] = useActionState<VerifyCodeState, FormData>(
    verifyCodeAction,
    {},
  )
  if ("ok" in state && state.ok) {
    queueMicrotask(() => onNext(state.resetId))
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 px-8 pb-7 pt-6">
      <input type="hidden" name="resetId" value={resetId} />
      <div className="rounded-xl bg-[#fafafa] px-3.5 py-2.5 text-[12px] text-black/60">
        Kod gönderildi:{" "}
        <span className="font-medium text-[#0a0a0a]">{email}</span>
      </div>
      <Field
        id="forgot-code"
        name="code"
        label="Doğrulama kodu"
        type="text"
        icon={<KeyRound size={15} />}
        placeholder="6 haneli kod"
        autoFocus
        required
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
      />
      {"ok" in state && !state.ok && state.error && (
        <ErrorBox text={state.error} />
      )}
      <SubmitButton label="Devam et" />
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 text-[12px] text-black/55 hover:text-[#0a0a0a]"
      >
        <ArrowLeft size={12} /> E-postayı değiştir
      </button>
    </form>
  )
}

function ResetStep({
  resetId,
  onDone,
}: {
  resetId: string
  onDone: () => void
}) {
  const [state, formAction] = useActionState<ResetState, FormData>(
    resetPasswordAction,
    {},
  )
  if ("ok" in state && state.ok) {
    queueMicrotask(onDone)
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 px-8 pb-7 pt-6">
      <input type="hidden" name="resetId" value={resetId} />
      <Field
        id="forgot-password"
        name="password"
        label="Yeni şifre"
        type="password"
        icon={<Lock size={15} />}
        placeholder="En az 8 karakter"
        autoFocus
        required
        minLength={8}
      />
      <Field
        id="forgot-confirm"
        name="confirm"
        label="Yeni şifre (tekrar)"
        type="password"
        icon={<Lock size={15} />}
        placeholder="Aynı şifreyi tekrar girin"
        required
        minLength={8}
      />
      {"ok" in state && !state.ok && state.error && (
        <ErrorBox text={state.error} />
      )}
      <SubmitButton label="Şifreyi güncelle" />
    </form>
  )
}

function DoneStep() {
  return (
    <div className="flex flex-col items-center gap-3 px-8 pb-8 pt-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check size={20} />
      </div>
      <p className="text-center text-[13.5px] text-black/65">
        Şifreniz güncellendi. Artık yeni şifreyle giriş yapabilirsiniz.
      </p>
      <Link
        href="/admin/login"
        className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[#3c639f] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2f5288]"
      >
        Giriş ekranına dön
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

function Field({
  id,
  name,
  label,
  type,
  icon,
  ...rest
}: {
  id: string
  name: string
  label: string
  type: string
  icon: React.ReactNode
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[12.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          className="w-full rounded-xl border border-black/[0.1] bg-white py-3 pl-10 pr-4 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
          {...rest}
        />
      </div>
    </div>
  )
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
    >
      {text}
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="cta-primary relative mt-1 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-[14px] font-semibold tracking-[-0.005em]"
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {pending ? "Bekleyin..." : label}
        {!pending && <ArrowRight size={15} />}
      </span>
    </button>
  )
}

function BackLink() {
  return (
    <Link
      href="/admin/login"
      className="flex items-center justify-center gap-1.5 text-[12px] text-black/55 hover:text-[#0a0a0a]"
    >
      <ArrowLeft size={12} /> Giriş ekranına dön
    </Link>
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
    </>
  )
}
