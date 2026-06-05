import { ImagePlus, Images } from "lucide-react"
import { readMedia } from "@/lib/media-store"
import { UploadForm } from "./upload-form"
import { MediaCard } from "./media-card"

export const dynamic = "force-dynamic"

export default async function MediaAdminPage() {
  const { items } = await readMedia()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Görseller
        </h1>
        <p className="mt-1 text-[13px] text-black/55">
          Merkezi görsel kütüphanesi. Yüklediğin her görsel otomatik
          WebP&apos;ye çevrilir; blog, referans ve diğer alanlarda buradan
          seçebilirsin. {items.length} görsel.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <ImagePlus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Görsel yükle
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          PNG / JPG / WebP / SVG, max 12 MB. Raster görseller WebP&apos;ye
          çevrilir, SVG olduğu gibi saklanır.
        </p>
        <div className="mt-4">
          <UploadForm />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images size={15} className="text-[#3c639f]" />
            <div className="text-[13px] font-semibold text-[#0a0a0a]">
              Kütüphane
            </div>
          </div>
          <span className="text-[12px] text-black/50">{items.length} görsel</span>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz görsel yok. Yukarıdan ilk görselini yükle.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
