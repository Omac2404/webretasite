"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { GlobalSeo } from "@/lib/seo-types"
import { saveGlobalSeoAction, type SaveState } from "./actions"

export function GlobalSeoForm({ initial }: { initial: GlobalSeo }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveGlobalSeoAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Site adı" hint="OpenGraph site_name olarak kullanılır.">
          <input
            name="siteName"
            type="text"
            defaultValue={initial.siteName}
            className={inputCls}
          />
        </Field>
        <Field
          label="Site URL"
          hint="https://webreta.com — sitemap & robots burayı baz alır."
        >
          <input
            name="siteUrl"
            type="url"
            placeholder="https://webreta.com"
            defaultValue={initial.siteUrl}
            className={inputCls}
          />
        </Field>
      </div>
      <Field
        label="Varsayılan başlık"
        hint="Sayfa kendi başlığını boş bırakırsa bu kullanılır."
      >
        <input
          name="defaultTitle"
          type="text"
          defaultValue={initial.defaultTitle}
          className={inputCls}
        />
      </Field>
      <Field
        label="Başlık şablonu"
        hint='Örn: "%s | Webreta" — alt sayfaların başlığına eklenir.'
      >
        <input
          name="titleTemplate"
          type="text"
          placeholder="%s | Webreta"
          defaultValue={initial.titleTemplate}
          className={inputCls}
        />
      </Field>
      <Field
        label="Varsayılan açıklama"
        hint="Sayfa açıklamasını boş bıraktığında bu metin kullanılır."
      >
        <textarea
          name="defaultDescription"
          rows={3}
          defaultValue={initial.defaultDescription}
          className={`${inputCls} resize-none`}
        />
      </Field>
      <Field
        label="Varsayılan anahtar kelimeler"
        hint="Virgül veya satır ile ayır. Modern Google fazla kullanmıyor ama Bing & sosyal taglar için faydalı."
      >
        <textarea
          name="defaultKeywords"
          rows={2}
          defaultValue={initial.defaultKeywords.join(", ")}
          className={`${inputCls} resize-none`}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          label="Varsayılan paylaşım görseli"
          hint="OpenGraph / Twitter card için tam URL veya /public/ yolu."
        >
          <input
            name="defaultOgImage"
            type="text"
            placeholder="/brand/og-cover.png"
            defaultValue={initial.defaultOgImage}
            className={inputCls}
          />
        </Field>
        <Field label="Twitter handle" hint="@webreta">
          <input
            name="twitterHandle"
            type="text"
            placeholder="@webreta"
            defaultValue={initial.twitterHandle}
            className={inputCls}
          />
        </Field>
      </div>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      {children}
    </label>
  )
}

function SubmitRow({
  state,
  pending,
}: {
  state: SaveState
  pending: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      {state.ok && !pending && (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
          <Check size={14} /> Kaydedildi
        </span>
      )}
      {state.error && (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
          <AlertCircle size={14} /> {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        Kaydet
      </button>
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
