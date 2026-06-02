import Link from "next/link"
import { Layers, Star, MessageCircle, Globe } from "lucide-react"
import {
  CHANNEL_ORDER,
  MAX_AUDIENCE,
  MAX_ITEMS,
  readPackages,
  type ChannelKey,
} from "@/lib/packages-store"
import { DEFAULT_GLOBAL_CTA } from "@/lib/packages-types"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { ChannelForm } from "./channel-form"
import { PackageForm } from "./package-form"
import { WhatsAppForm } from "./whatsapp-form"
import { GlobalCtaForm } from "./global-cta-form"

export const dynamic = "force-dynamic"

function isChannelKey(v: string | undefined): v is ChannelKey {
  return v !== undefined && (CHANNEL_ORDER as readonly string[]).includes(v)
}

export default async function PackagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>
}) {
  const params = await searchParams
  const activeKey: ChannelKey = isChannelKey(params.channel)
    ? params.channel
    : "google"

  const data = await readPackages()
  const channel = data.channels.find((c) => c.key === activeKey)!
  const whatsapp = data.whatsapp ?? { number: "", display: "" }
  const globalCta = data.globalCta ?? DEFAULT_GLOBAL_CTA

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Paketler
          </h1>
        </div>
        <PreviewLink href="/dijital-reklamlar" />
      </div>

      {/* WhatsApp settings — global for all packages */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <MessageCircle size={15} className="text-[#25D366]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            WhatsApp ayarları
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Tüm paketlerin &quot;WhatsApp&apos;tan yazın&quot; butonunun
          gideceği numara ve görünür format. Ön mesaj her paketin altından
          ayrı düzenlenir.
        </p>
        <div className="mt-4">
          <WhatsAppForm whatsapp={whatsapp} />
        </div>
      </section>

      {/* Global CTA — paket grid'i ile footer arasındaki "Yurtdışı reklamları"
          tarzı yönlendirme kartı. Kanaldan bağımsız, tek dokümanlık. */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yurtdışı / Global CTA kartı
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          /dijital-reklamlar sayfasının altında paketlerden sonra çıkan,
          iletişime yönlendiren büyük kart. Her kanal için aynı içerik
          gösterilir.
        </p>
        <div className="mt-4">
          <GlobalCtaForm cta={globalCta} />
        </div>
      </section>

      {/* Channel tabs — server-rendered, switched via URL query so each
          tab is bookmarkable. Active tab matches the public page's pill. */}
      <div className="flex gap-1 border-b border-black/[0.08]">
        {data.channels.map((c) => {
          const active = c.key === activeKey
          return (
            <Link
              key={c.key}
              href={`/admin/paketler?channel=${c.key}`}
              className={
                active
                  ? "-mb-px border-b-2 border-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-[#3c639f]"
                  : "border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium text-black/55 transition-colors hover:text-[#0a0a0a]"
              }
            >
              {c.label}
            </Link>
          )
        })}
      </div>

      {/* Channel-level fields */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Kanal bilgileri
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Sekme adı, kısa adı ve sayfa başlığı altındaki açıklama.
        </p>
        <div className="mt-4">
          <ChannelForm
            channelKey={channel.key}
            label={channel.label}
            pageTitle={channel.pageTitle ?? ""}
            short={channel.short}
            intro={channel.intro}
          />
        </div>
      </section>

      {/* Three package forms */}
      <div className="flex flex-col gap-5">
        {channel.packages.map((pkg) => (
          <PackageForm
            key={pkg.key}
            channelKey={channel.key}
            pkg={pkg}
            featured={pkg.key === "growth"}
          />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <Star size={14} className="mt-0.5 shrink-0 text-amber-700" />
        <p className="text-[12.5px] leading-relaxed text-amber-900/85">
          &quot;En Popüler&quot; vurgusu her zaman <strong>Büyüme</strong>{" "}
          paketinde — bu kuralı buradan değiştiremiyorsun. Yapısal değişiklik
          (yeni kanal, yeni paket veya popüler rozetinin yeri) gerekiyorsa
          söyle, kodu güncelleyelim.
        </p>
      </div>
    </div>
  )
}
