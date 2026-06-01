import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"
import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooter"
import { DotPattern } from "@/components/DotPattern"
import { ConstellationBackdrop } from "@/components/ConstellationBackdrop"
import { readAbout } from "@/lib/about-store"
import type { AboutRow } from "@/lib/about-types"
import { isHtmlBody, sanitizeAboutBody } from "@/lib/about-sanitize"

import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/hakkimizda")
}

export const dynamic = "force-dynamic"

export default async function HakkimizdaPage() {
  const about = await readAbout()

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafafa]">
      <SiteHeader />
      <main>
        {/* Hero — kompakt giriş */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-12 md:pb-14 md:pt-24">
          {/* Dekoratif nokta deseni — sağ üst köşede, container'dan
              dışarıya taşacak şekilde; root'taki overflow-x-clip yatay
              kaymayı engelliyor. */}
          <DotPattern
            style={{
              right: "-180px",
              top: "-160px",
              width: "620px",
              height: "620px",
              zIndex: 0,
            }}
          />

          <div className="relative z-10">
            {about.hero.kicker && (
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                {about.hero.kicker}
              </span>
            )}
            <h1 className="mt-3 text-[36px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] md:text-[56px]">
              {about.hero.titleLeader && (
                <span className="font-normal">{about.hero.titleLeader}</span>
              )}
              {about.hero.titleHighlight && (
                <span className="font-bold text-[#3c639f]">
                  {about.hero.titleHighlight}
                </span>
              )}
              {about.hero.titleTrailer && (
                <span className="font-normal">{about.hero.titleTrailer}</span>
              )}
            </h1>
            {about.hero.subtitle &&
              (isHtmlBody(about.hero.subtitle) ? (
                <div
                  className="about-hero-subtitle mt-5 text-[17px] leading-relaxed text-black/60 md:text-[18px] [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#0a0a0a]"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeAboutBody(about.hero.subtitle),
                  }}
                />
              ) : (
                <p className="mt-5 text-[17px] leading-relaxed text-black/60 md:text-[18px]">
                  {about.hero.subtitle}
                </p>
              ))}
          </div>
        </section>

        {/* Row 1 — image left, text right */}
        <AboutRowBlock row={about.row1} imageSide="left" />

        {/* Row 2 — text left, image right. This block currently hosts the
            "Webreta KOBİ" CTA; tracked so admin can see how many of the
            Hakkımızda visitors click it. */}
        <AboutRowBlock
          row={about.row2}
          imageSide="right"
          buttonTrack="hakkimizda:row2-cta"
        />

        {/* CTA — Bir proje konuşalım mı? Dijital reklamlar sayfasındaki
            global CTA ile aynı renk DNA'sı: koyu navy gradient zemin,
            atmosferik halo, takımyıldız stili amber twinkle noktalar +
            ince bağlantı çizgileri ("connect" metaforu). */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-20 pt-4 md:px-12 md:pb-28 md:pt-8">
          <div className="relative z-10 overflow-hidden rounded-2xl border border-[#3c639f]/20 bg-gradient-to-br from-[#0f1e3a] via-[#1a3464] to-[#2f5288] p-7 md:rounded-3xl md:p-12">
            {/* Atmosfer halosu — sol-üstte yumuşak mavi parıltı */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full opacity-55 md:-left-20 md:-top-20"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(91, 141, 230, 0.50) 0%, rgba(60, 99, 159, 0.22) 35%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />

            {/* Yıldız tozu — küçük statik noktalar arka planda derinlik */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.6) 0.5px, transparent 1px), radial-gradient(circle at 32% 72%, rgba(255,255,255,0.4) 0.5px, transparent 1px), radial-gradient(circle at 68% 22%, rgba(255,255,255,0.5) 0.5px, transparent 1px), radial-gradient(circle at 82% 64%, rgba(255,255,255,0.4) 0.5px, transparent 1px), radial-gradient(circle at 48% 88%, rgba(255,255,255,0.4) 0.5px, transparent 1px)",
              }}
            />

            {/* Takımyıldız — SVG'de twinkle yapan amber noktalar +
                bağlantı çizgileri. Sağ tarafa yerleşik, container'dan biraz
                taşar; mobilde gizli (sm+ görünür). */}
            <ConstellationBackdrop />

            <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="max-w-[620px]">
                <h3 className="text-[24px] font-semibold leading-[1.18] tracking-[-0.02em] text-white md:text-[32px]">
                  {about.cta.title}
                </h3>
                {about.cta.body && (
                  <p className="mt-3 text-[14px] leading-relaxed text-white/70 md:text-[15px]">
                    {about.cta.body}
                  </p>
                )}
              </div>
              <Link
                href={about.cta.buttonHref}
                data-track="hakkimizda:cta"
                data-track-label={about.cta.buttonLabel}
                className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-6 py-3 text-[14px] font-semibold text-[#1a3464] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:shadow-[0_18px_40px_-8px_rgba(0,0,0,0.55)]"
              >
                {about.cta.buttonLabel}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function AboutRowBlock({
  row,
  imageSide,
  buttonTrack,
}: {
  row: AboutRow
  imageSide: "left" | "right"
  buttonTrack?: string
}) {
  // Body ya HTML (RichTextArea'dan) ya da eski plain text. Plain text'i
  // \n\n ile paragrafla; HTML'i sanitize edip dangerouslySetInnerHTML
  // ile bas.
  const bodyIsHtml = isHtmlBody(row.body)
  const safeHtml = bodyIsHtml ? sanitizeAboutBody(row.body) : ""
  const paragraphs = bodyIsHtml
    ? []
    : row.body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

  const textBlock = (
    <div className="flex flex-col">
      {row.kicker && (
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#3c639f]/80">
          {row.kicker}
        </span>
      )}
      <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
        {row.title}
      </h2>
      {bodyIsHtml ? (
        <div
          className="about-body mt-5 text-[15px] leading-relaxed text-black/65 md:text-[16px] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#0a0a0a]"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[15px] leading-relaxed text-black/65 md:text-[16px]"
            >
              {p}
            </p>
          ))}
        </div>
      )}
      {row.buttonLabel && (
        <div className="mt-6">
          <Link
            href={row.buttonHref || "#"}
            data-track={buttonTrack}
            data-track-label={row.buttonLabel}
            className="group inline-flex items-center gap-2 rounded-md bg-[#3c639f] px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(60,99,159,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#2f5288] hover:shadow-[0_12px_28px_-8px_rgba(60,99,159,0.5)]"
          >
            {row.buttonLabel}
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      )}
    </div>
  )

  const imageBlock = <AboutImage src={row.imageUrl} alt={row.imageAlt} />

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 md:py-16">
      <div
        className={`grid grid-cols-1 items-center gap-8 md:gap-14 ${
          imageSide === "left"
            ? "md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
            : "md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]"
        }`}
      >
        {imageSide === "left" ? imageBlock : textBlock}
        {imageSide === "left" ? textBlock : imageBlock}
      </div>
    </section>
  )
}

function AboutImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#3c639f]/15 bg-gradient-to-br from-[#3c639f]/[0.10] via-[#3c639f]/[0.04] to-transparent">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #3c639f 0%, transparent 40%), radial-gradient(circle at 80% 70%, #3c639f 0%, transparent 35%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#3c639f]/40">
          <ImageIcon size={40} strokeWidth={1.25} />
          <span className="text-[12px] font-medium uppercase tracking-[0.1em]">
            Görsel eklenmedi
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <Image
        src={src}
        alt={alt || ""}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  )
}
