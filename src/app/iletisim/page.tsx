import { Mail, Phone, MapPin, Clock } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import ContactForm from "@/components/ContactForm"

export const metadata = {
  title: "İletişim | Webreta",
  description:
    "Webreta ile iletişime geçin. İzmir merkezli web tasarım ve dijital reklam ajansı. Projeniz için 24 saat içinde dönüş.",
}

// TODO: Replace placeholder values with real contact details when finalised.
const CONTACT = {
  email: "hello@webreta.com",
  phone: "+90 (XXX) XXX XX XX",
  address: "İzmir, Türkiye",
  hours: "Pazartesi – Cuma · 09:00 – 18:00",
}

// İzmir Konak generic coordinates — replace bbox + marker once the real
// office address is known. OpenStreetMap embed doesn't need an API key.
const MAP_BBOX = "27.0900,38.4100,27.1700,38.4500"
const MAP_MARKER = "38.4192,27.1287"

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main>
        {/* Header band */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-12 md:pb-14 md:pt-24">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
            İletişim
          </span>
          <h1 className="mt-3 text-[36px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] md:text-[56px]">
            <span className="font-normal">Bir kahve içelim, </span>
            <span className="font-bold text-[#3c639f]">projenizi konuşalım.</span>
          </h1>
          <p className="mt-5 max-w-[600px] text-[16px] leading-relaxed text-black/60">
            Yeni bir web projeniz, mevcut sitenizde iyileştirme fikriniz veya
            dijital reklam stratejiniz için bizimle iletişime geçin. 24 saat
            içinde geri dönüyoruz.
          </p>
        </section>

        {/* Info cards */}
        <section className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={<Mail size={18} strokeWidth={1.75} />}
              label="E-posta"
              value={CONTACT.email}
              href={`mailto:${CONTACT.email}`}
            />
            <InfoCard
              icon={<Phone size={18} strokeWidth={1.75} />}
              label="Telefon"
              value={CONTACT.phone}
              href={`tel:${CONTACT.phone.replace(/\s|\(|\)/g, "")}`}
            />
            <InfoCard
              icon={<MapPin size={18} strokeWidth={1.75} />}
              label="Adres"
              value={CONTACT.address}
            />
            <InfoCard
              icon={<Clock size={18} strokeWidth={1.75} />}
              label="Çalışma saatleri"
              value={CONTACT.hours}
            />
          </div>
        </section>

        {/* Form + Map */}
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                Mesaj gönderin
              </span>
              <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
                <span className="font-normal">Formu </span>
                <span className="font-bold text-[#3c639f]">doldurun</span>
                <span className="font-normal">, dönelim.</span>
              </h2>
              <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-black/55">
                Projenizle ilgili kısa bir özet, hedef tarihiniz ve bütçe
                aralığınızı paylaşırsanız daha hızlı ilerleyebiliriz.
              </p>

              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                Konum
              </span>
              <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
                <span className="font-normal">İzmir, </span>
                <span className="font-bold text-[#3c639f]">Ege'nin merkezi.</span>
              </h2>
              <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-black/55">
                Ekip İzmir'de çalışıyor, projeleri Türkiye genelindeki
                markalar için uzaktan yürütüyoruz.
              </p>

              <div className="mt-6 flex-1 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                <iframe
                  title="Webreta konum haritası"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}&layer=mapnik&marker=${MAP_MARKER}`}
                  className="h-[420px] w-full lg:h-full lg:min-h-[460px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${MAP_MARKER.split(",")[0]}&mlon=${MAP_MARKER.split(",")[1]}#map=14/${MAP_MARKER.split(",")[0]}/${MAP_MARKER.split(",")[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
              >
                Haritayı yeni sekmede aç
                <MapPin size={13} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3c639f]/[0.08] text-[#3c639f]">
        {icon}
      </div>
      <div className="mt-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
          {label}
        </span>
        <p className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-[#0a0a0a]">
          {value}
        </p>
      </div>
    </>
  )

  const className =
    "group flex flex-col rounded-xl border border-black/[0.06] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3c639f]/25 hover:shadow-[0_8px_24px_-12px_rgba(60,99,159,0.18)]"

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    )
  }
  return <div className={className}>{inner}</div>
}
