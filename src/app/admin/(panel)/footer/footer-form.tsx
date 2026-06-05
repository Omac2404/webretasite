"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  SOCIAL_PLATFORMS,
  type FooterConfig,
} from "@/lib/footer-types"
import type { LegalPage } from "@/lib/legal-types"
import type { SitePage } from "@/lib/site-pages"
import { saveFooterAction, type FooterFormState } from "./actions"
import { OrderedPicker } from "./ordered-picker"

const INITIAL: FooterFormState = {}

export function FooterForm({
  config,
  sitePages,
  legalPages,
}: {
  config: FooterConfig
  sitePages: SitePage[]
  legalPages: LegalPage[]
}) {
  const [state, formAction, pending] = useActionState(
    saveFooterAction,
    INITIAL,
  )
  const [showSaved, setShowSaved] = useState(false)
  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* CTA block — big title + subtitle + button */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="CTA bloğu" subtitle="Footer'ın üst yarısı — büyük başlık ve buton." />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Açılış" hint="Başlığın başı.">
            <input
              name="titleLeading"
              type="text"
              defaultValue={config.titleLeading}
              placeholder="Sıradaki"
              className={inputCls}
            />
          </Field>
          <Field label="Vurgu" hint="Gradient ile çıkar.">
            <input
              name="titleHighlight"
              type="text"
              required
              defaultValue={config.titleHighlight}
              placeholder="başarı hikayesi"
              className={inputCls}
            />
          </Field>
          <Field label="Kapanış">
            <input
              name="titleTrailing"
              type="text"
              defaultValue={config.titleTrailing}
              placeholder="sizinki olsun."
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Alt yazı">
            <textarea
              name="subtitle"
              rows={2}
              defaultValue={config.subtitle}
              placeholder="Büyük başlığın altındaki paragraf"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
          <Field label="Buton metni">
            <input
              name="ctaLabel"
              type="text"
              required
              defaultValue={config.ctaLabel}
              placeholder="Bize Ulaşın"
              className={inputCls}
            />
          </Field>
          <Field label="Buton linki" hint="İç sayfa: /iletisim · dış link: tam URL.">
            <input
              name="ctaHref"
              type="text"
              required
              defaultValue={config.ctaHref}
              placeholder="/iletisim"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Contact card */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="İletişim bilgileri" subtitle="Sağ üstteki kart — telefon, e-posta, adres." />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="E-posta">
            <input
              name="contact_email"
              type="text"
              defaultValue={config.contact.email}
              placeholder="info@webreta.com.tr"
              className={inputCls}
            />
          </Field>
          <Field label="Telefon">
            <input
              name="contact_phone"
              type="text"
              defaultValue={config.contact.phone}
              placeholder="+90 (XXX) XXX XX XX"
              className={inputCls}
            />
          </Field>
          <Field label="Adres / merkez">
            <input
              name="contact_address"
              type="text"
              defaultValue={config.contact.address}
              placeholder="İzmir, Türkiye"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Social URLs */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          title="Sosyal medya"
          subtitle="URL gir → ikon görünür. Boş bıraktığın platform footer'da çıkmaz."
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <Field key={p.key} label={p.label}>
              <input
                name={`social__${p.key}`}
                type="text"
                defaultValue={config.socials[p.key]}
                placeholder={`https://...`}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* Footer nav picker */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          title="Footer menüsü"
          subtitle="Logo'nun yanındaki yatay menü. Sitede tanımlı sayfalar arasından seç."
        />
        <div className="mt-4">
          <OrderedPicker
            name="navHrefs"
            label="Menüde gözükecek sayfalar"
            items={sitePages.map((p) => ({
              value: p.href,
              label: p.label,
              hint: p.href,
            }))}
            initialSelected={config.navHrefs}
            emptySelectedHint="Menüye sayfa eklemedin — footer'da menü boş gözükecek."
          />
        </div>
      </section>

      {/* Legal pages picker */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          title="Yasal sayfa linkleri"
          subtitle="Sağ alttaki KVKK / Gizlilik vb. bağlantılar. Yasal Sayfalar sekmesinden eklediklerin burada listelenir."
        />
        <div className="mt-4">
          <OrderedPicker
            name="legalPageIds"
            label="Footer sağ altta görünecek sayfalar"
            items={legalPages.map((p) => ({
              value: p.id,
              label: p.title,
              hint: `/yasal/${p.slug}`,
            }))}
            initialSelected={config.legalPageIds}
            emptySelectedHint="Yasal link eklemedin — sağ alt strip boş kalacak."
            emptyAvailableHint="Eklenebilir yasal sayfa yok. Yasal Sayfalar sekmesinden bir sayfa ekle."
          />
        </div>
      </section>

      {/* Copyright */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          title="Copyright"
          subtitle="En altta gözüken küçük yazı. {year} yazarsan o kısma içinde bulunduğun yıl basılır."
        />
        <div className="mt-4">
          <Field label="Copyright metni">
            <input
              name="copyright"
              type="text"
              required
              defaultValue={config.copyright}
              placeholder="© {year} Webreta · İzmir merkezli web ajansı"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
        </button>
        {showSaved && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700">
            <Check size={14} />
            Kaydedildi
          </span>
        )}
      </div>
    </form>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
      <p className="mt-1 text-[12px] text-black/50">{subtitle}</p>
    </div>
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
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-black/55">{label}</span>
        {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"
