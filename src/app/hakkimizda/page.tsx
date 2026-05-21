import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import { DotPattern } from "@/components/DotPattern"
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
            {about.hero.subtitle && (
              <p className="mt-5 text-[16px] leading-relaxed text-black/60">
                {about.hero.subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Row 1 — image left, text right */}
        <AboutRowBlock row={about.row1} imageSide="left" />

        {/* Row 2 — text left, image right */}
        <AboutRowBlock row={about.row2} imageSide="right" />

        {/* CTA — Bir proje konuşalım mı? */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-20 pt-4 md:px-12 md:pb-28 md:pt-8">
          {/* Dekoratif nokta deseni — CTA'nın sol arka tarafına taşar */}
          <DotPattern
            style={{
              left: "-220px",
              top: "-40px",
              width: "560px",
              height: "560px",
              zIndex: 0,
            }}
            opacity={0.75}
          />

          <div className="relative z-10 flex flex-col items-start gap-5 rounded-2xl border border-[#3c639f]/15 bg-gradient-to-br from-[#3c639f]/[0.06] via-[#3c639f]/[0.02] to-transparent p-6 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-[640px]">
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[28px]">
                {about.cta.title}
              </h3>
              {about.cta.body && (
                <p className="mt-2 text-[14px] leading-relaxed text-black/60 md:text-[15px]">
                  {about.cta.body}
                </p>
              )}
            </div>
            <Link
              href={about.cta.buttonHref}
              className="group inline-flex items-center gap-2 rounded-md bg-[#3c639f] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(60,99,159,0.4)] transition-colors hover:bg-[#2f5288]"
            >
              {about.cta.buttonLabel}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
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
}: {
  row: AboutRow
  imageSide: "left" | "right"
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
            className="group inline-flex items-center gap-2 rounded-md border border-black/[0.10] bg-white px-5 py-2.5 text-[14px] font-medium text-[#0a0a0a] transition-all hover:-translate-y-0.5 hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.04] hover:text-[#3c639f] hover:shadow-[0_8px_20px_-8px_rgba(60,99,159,0.25)]"
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
