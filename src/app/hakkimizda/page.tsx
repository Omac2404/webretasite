import {
  Sparkles,
  Gauge,
  MessageCircle,
  Code2,
  Compass,
  Rocket,
  ArrowRight,
} from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"

export const metadata = {
  title: "Hakkımızda | Webreta",
  description:
    "Webreta — İzmir merkezli web tasarım ve dijital reklam ajansı. Yalın tasarım, hızlı teslim, açık iletişim.",
}

const STATS = [
  { value: "60+", label: "Tamamlanan proje" },
  { value: "8 yıl", label: "Sektör tecrübesi" },
  { value: "24 sa.", label: "Ortalama dönüş süresi" },
  { value: "%95+", label: "Lighthouse skoru" },
]

const VALUES = [
  {
    icon: Sparkles,
    title: "Yalın tasarım",
    body: "Süslü detaylar değil; kullanıcının aradığını bulduğu, içeriğin nefes aldığı arayüzler. Az ama doğru.",
  },
  {
    icon: Gauge,
    title: "Hızlı teslim",
    body: "Aylar süren projeler yerine net kapsam ve kısa iterasyonlar. Çıkan iş canlıya hızla alınır, ölçülür.",
  },
  {
    icon: MessageCircle,
    title: "Açık iletişim",
    body: "Teknik jargonla saklanmak yok. Ne yaptığımızı, neden öyle yaptığımızı sade Türkçe ile anlatırız.",
  },
]

const STEPS = [
  {
    icon: Compass,
    title: "Keşif",
    body: "Markanızı, hedef kitleyi ve önceliklerinizi anlamak için kısa bir toplantı. Çıktı: net kapsam ve teklif.",
  },
  {
    icon: Sparkles,
    title: "Tasarım",
    body: "Akış ve görsel dilin oturduğu prototip. Geri bildirim turlarıyla son hâline kavuşur.",
  },
  {
    icon: Code2,
    title: "Geliştirme",
    body: "Modern, performansı yüksek bir altyapı. SEO, erişilebilirlik ve mobil deneyim her zaman dahil.",
  },
  {
    icon: Rocket,
    title: "Yayın",
    body: "Test, performans ölçümü, içerik aktarımı ve yayına alma. Sonrasında destek devam eder.",
  },
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-12 md:pb-14 md:pt-24">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
            Hakkımızda
          </span>
          <h1 className="mt-3 text-[36px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] md:text-[56px]">
            <span className="font-normal">İzmir&apos;den, </span>
            <span className="font-bold text-[#3c639f]">dijital dünyaya</span>
            <span className="font-normal"> — basit ve net.</span>
          </h1>
          <p className="mt-5 max-w-[620px] text-[16px] leading-relaxed text-black/60">
            Webreta, küçük ve orta ölçekli markalar için web tasarımı,
            geliştirmesi ve dijital reklam üreten bir stüdyodur. Süslü
            sözlerden uzak; tasarımı sade, performansı yüksek, kurmaya
            değer işler peşindeyiz.
          </p>
        </section>

        {/* Manifesto + stats */}
        <section className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-black/[0.06] bg-white p-6 md:grid-cols-[1.3fr_1fr] md:gap-10 md:p-10">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                Hikayemiz
              </span>
              <h2 className="mt-2 text-[24px] leading-[1.2] tracking-[-0.02em] text-[#0a0a0a] md:text-[30px]">
                Bir <span className="font-bold text-[#3c639f]">fikrin</span>{" "}
                hayata geçtiği yer.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-black/65">
                Webreta, küçük bir ekiple büyük markalara hizmet verme
                fikrinden doğdu. Uzun süredir hem ajans hem freelance
                tarafında çalışan ekibimiz; her projenin kendine özgü bir
                ses tonu, hedefi ve müşterisi olduğunu biliyor. Bir kafe
                için tasarladığımız siteyle bir hukuk bürosuna kurduğumuz
                portal aynı şablondan çıkmaz; ihtiyaç ne ise yanıt da
                odur.
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-black/65">
                Yaptığımız her işin arkasında üç söz duruyor:{" "}
                <span className="font-medium text-[#0a0a0a]">yalın</span>,{" "}
                <span className="font-medium text-[#0a0a0a]">hızlı</span>,{" "}
                <span className="font-medium text-[#0a0a0a]">açık</span>.
                Tasarımda gereksiz hiçbir şey istemiyoruz; teslimde
                geciktirmiyoruz; iletişimde dolambaçlı konuşmuyoruz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 self-start">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4"
                >
                  <div className="text-[26px] font-bold leading-none tracking-[-0.02em] text-[#3c639f]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-[12px] leading-snug text-black/55">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
          <div className="max-w-[620px]">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
              Değerlerimiz
            </span>
            <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
              <span className="font-normal">Hangi işi yaparsak yapalım,{" "}</span>
              <span className="font-bold text-[#3c639f]">aynı çizgide</span>
              <span className="font-normal"> duruyoruz.</span>
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3c639f]/25 hover:shadow-[0_8px_24px_-12px_rgba(60,99,159,0.18)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#3c639f]/[0.08] text-[#3c639f]">
                  <v.icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                  {v.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-black/60">
                  {v.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mx-auto max-w-[1280px] px-6 pb-16 md:px-12 md:pb-24">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-10">
            <div className="max-w-[620px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                Nasıl çalışıyoruz
              </span>
              <h2 className="mt-2 text-[24px] leading-[1.2] tracking-[-0.02em] text-[#0a0a0a] md:text-[30px]">
                İlk konuşmadan yayına dek{" "}
                <span className="font-bold text-[#3c639f]">dört adım</span>.
              </h2>
            </div>

            <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="relative flex flex-col rounded-xl border border-black/[0.06] bg-[#fafafa] p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-[#3c639f]/70">
                      0{i + 1}
                    </span>
                    <span className="h-px flex-1 bg-black/[0.08]" />
                    <s.icon
                      size={18}
                      strokeWidth={1.75}
                      className="text-[#3c639f]"
                    />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-black/60">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mini CTA — yumuşak geçiş, footer'daki büyük CTA bloğuyla
            yarışmasın diye küçük tutuluyor. */}
        <section className="mx-auto max-w-[1280px] px-6 pb-20 md:px-12 md:pb-28">
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-[#3c639f]/15 bg-gradient-to-br from-[#3c639f]/[0.04] to-transparent p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[#0a0a0a] md:text-[24px]">
                Bir proje konuşalım mı?
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/60">
                Kısa bir özet bırakın, 24 saat içinde dönelim.
              </p>
            </div>
            <a
              href="/iletisim"
              className="group inline-flex items-center gap-2 rounded-md bg-[#3c639f] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288]"
            >
              İletişime geç
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
