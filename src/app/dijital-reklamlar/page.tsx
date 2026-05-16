import SiteHeader from "@/components/SiteHeader"

export const metadata = {
  title: "Dijital Reklamlar | Webreta",
}

export default function DijitalReklamlarPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-6 py-24 md:px-12 md:py-32">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
          Dijital Reklamlar
        </span>
        <h1 className="mt-3 text-[36px] leading-[1.1] tracking-[-0.02em] text-[#0a0a0a] md:text-[52px]">
          Bu sayfa hazırlanıyor.
        </h1>
        <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-black/60">
          Google Ads, Meta Ads ve dijital reklam yönetimi hizmetlerimiz yakında
          burada.
        </p>
      </main>
    </div>
  )
}
