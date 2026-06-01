import { Globe, FileText, Map } from "lucide-react"
import { readSeo } from "@/lib/seo-store"
import { GlobalSeoForm } from "./global-form"
import { PageSeoList } from "./page-form"
import { SitemapForm } from "./sitemap-form"

export const dynamic = "force-dynamic"

export default async function SeoAdminPage() {
  const seo = await readSeo()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          SEO
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Site geneli ve sayfa bazlı SEO ayarları, sitemap & robots.txt
          yönetimi. Blog yazılarının kendi SEO alanları yazı editörünün
          içindedir.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Site geneli SEO
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Varsayılan başlık, açıklama, paylaşım görseli. Bir sayfa kendi
          alanını boş bıraktığında buradaki değerler kullanılır.
        </p>
        <div className="mt-4">
          <GlobalSeoForm initial={seo.global} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Sayfa bazlı SEO
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Statik sayfalar için başlık, açıklama, paylaşım görseli, noindex
          ve sitemap kontrolleri. Blog yazıları için yazı editörünü kullan.
        </p>
        <div className="mt-4">
          <PageSeoList pages={seo.pages} global={seo.global} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Map size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Sitemap & robots
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Search Console'a vereceğin sitemap URL'i, yasal sayfa kontrolü
          ve manuel URL ekleme.
        </p>
        <div className="mt-4">
          <SitemapForm initial={seo.sitemap} siteUrl={seo.global.siteUrl} />
        </div>
      </section>
    </div>
  )
}
