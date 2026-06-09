import type { LandingPageContent } from "@/lib/landing-content-types"

// Footer-öncesi açılış içeriği: serbest metin bölümleri + SSS akordeonu.
// Server component — SSS, JS gerektirmeyen <details>/<summary> ile çalışır
// (erişilebilir ve reklam/SEO tarayıcıları içeriği görür). SSS varsa
// FAQPage JSON-LD schema da basılır (Google'da zengin sonuç şansı).

export default function LandingContent({
  content,
}: {
  content: LandingPageContent
}) {
  if (!content.enabled) return null
  const hasSections = content.sections.length > 0
  const hasFaqs = content.faqs.length > 0
  if (!hasSections && !hasFaqs) return null

  const faqJsonLd = hasFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null

  return (
    <section className="mx-auto max-w-[920px] px-6 py-16 md:px-12 md:py-20">
      {hasSections && (
        <div className="flex flex-col gap-12">
          {content.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#0a0a0a] md:text-[28px]">
                  {s.heading}
                </h2>
              )}
              {s.body.trim() && (
                <div className="mt-4 flex flex-col gap-3">
                  {s.body
                    .replace(/\r\n/g, "\n")
                    .split(/\n{2,}/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, j) => (
                      <p
                        key={j}
                        className="whitespace-pre-line text-[15px] leading-relaxed text-black/65 md:text-[16px]"
                      >
                        {p}
                      </p>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasFaqs && (
        <div className={hasSections ? "mt-16" : ""}>
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[28px]">
            {content.faqTitle}
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {content.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-black/[0.08] bg-white px-5 py-4 transition-colors open:border-[#3c639f]/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-[#0a0a0a] [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span
                    aria-hidden
                    className="shrink-0 text-[20px] leading-none text-[#3c639f] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-black/65">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {faqJsonLd && (
        <script
          type="application/ld+json"
          // FAQPage schema — Google'ın SSS'i zengin sonuç olarak göstermesi için.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </section>
  )
}
