// Live SEO checklist for blog posts. Pure functions — no node:fs, safe
// for client components. Each rule returns ok/severity/hint so the form
// can render colored badges next to the SEO panel.

export type SeoCheckSeverity = "ok" | "warn" | "bad"

export type SeoCheck = {
  id: string
  label: string
  status: SeoCheckSeverity
  hint?: string
}

export type SeoCheckInput = {
  title: string
  metaTitle: string
  excerpt: string
  metaDescription: string
  content: string
  slug: string
  coverImage: string
  focusKeyword: string
}

// Turkish-aware lowercase + diacritic flatten so "İzmir" matches "izmir".
function flat(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
}

function contains(haystack: string, needle: string): boolean {
  if (!needle.trim()) return false
  return flat(haystack).includes(flat(needle))
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

export function runChecks(input: SeoCheckInput): SeoCheck[] {
  const checks: SeoCheck[] = []
  const effectiveTitle = input.metaTitle.trim() || input.title.trim()
  const effectiveDesc = input.metaDescription.trim() || input.excerpt.trim()
  const focus = input.focusKeyword.trim()

  // Title length
  const tl = effectiveTitle.length
  checks.push({
    id: "title-length",
    label: `Başlık uzunluğu (${tl}/60)`,
    status: tl === 0 ? "bad" : tl < 30 ? "warn" : tl > 60 ? "warn" : "ok",
    hint:
      tl === 0
        ? "Başlık boş."
        : tl < 30
          ? "Daha uzun bir başlık dönüşüm odaklı arama için daha iyi."
          : tl > 60
            ? "Google ~60 karakterden sonrasını kırpar."
            : undefined,
  })

  // Description length
  const dl = effectiveDesc.length
  checks.push({
    id: "desc-length",
    label: `Açıklama uzunluğu (${dl}/160)`,
    status: dl === 0 ? "bad" : dl < 70 ? "warn" : dl > 160 ? "warn" : "ok",
    hint:
      dl === 0
        ? "Meta açıklama veya özet ekle."
        : dl < 70
          ? "Daha doyurucu bir açıklama tıklama oranını artırır."
          : dl > 160
            ? "Google snippet'i 155–160 karakterde keser."
            : undefined,
  })

  // Focus keyword presence
  if (focus) {
    checks.push({
      id: "focus-in-title",
      label: "Odak kelime başlıkta",
      status: contains(effectiveTitle, focus) ? "ok" : "warn",
      hint: "Odak kelimeyi başlığa eklemek sıralamayı güçlendirir.",
    })
    checks.push({
      id: "focus-in-desc",
      label: "Odak kelime açıklamada",
      status: contains(effectiveDesc, focus) ? "ok" : "warn",
    })
    checks.push({
      id: "focus-in-slug",
      label: "Odak kelime URL'de",
      status: contains(input.slug, focus) ? "ok" : "warn",
      hint: "URL'de odak kelime varsa kullanıcı ve botlar konuyu anlar.",
    })
    checks.push({
      id: "focus-in-content",
      label: "Odak kelime içerikte",
      status: contains(input.content, focus) ? "ok" : "warn",
    })
    // First-paragraph check
    const firstPara = input.content.split(/\n\s*\n/)[0] ?? ""
    checks.push({
      id: "focus-first-para",
      label: "İlk paragrafta",
      status: contains(firstPara, focus) ? "ok" : "warn",
    })
  } else {
    checks.push({
      id: "focus-keyword",
      label: "Odak kelime tanımlı",
      status: "warn",
      hint: "Yazının ana arama kelimesini gir (örn. 'web tasarım izmir').",
    })
  }

  // Cover image
  checks.push({
    id: "cover",
    label: "Kapak görseli",
    status: input.coverImage.trim() ? "ok" : "warn",
  })

  // Headings
  const hasH2 = /(^|\n)##\s+\S/.test(input.content)
  checks.push({
    id: "headings",
    label: "İçerikte H2 başlığı",
    status: hasH2 ? "ok" : "warn",
    hint: "Markdown'da `## başlık` kullan; tarayıcı + bot okunabilirliği artar.",
  })

  // Word count
  const wc = wordCount(input.content)
  checks.push({
    id: "word-count",
    label: `Kelime sayısı (${wc})`,
    status: wc < 300 ? "warn" : wc > 2500 ? "warn" : "ok",
    hint:
      wc < 300
        ? "300+ kelime arama görünürlüğü için minimum sayılır."
        : wc > 2500
          ? "Çok uzun; bölmeyi düşün."
          : undefined,
  })

  // Slug quality
  checks.push({
    id: "slug-quality",
    label: "URL kısa & temiz",
    status: input.slug.length > 75 ? "warn" : input.slug ? "ok" : "bad",
    hint:
      input.slug.length > 75 ? "URL çok uzun; kısaltmayı düşün." : undefined,
  })

  return checks
}

export function summarize(checks: SeoCheck[]): {
  ok: number
  warn: number
  bad: number
  total: number
  score: number
} {
  let ok = 0,
    warn = 0,
    bad = 0
  for (const c of checks) {
    if (c.status === "ok") ok++
    else if (c.status === "warn") warn++
    else bad++
  }
  const total = checks.length
  const score = total === 0 ? 0 : Math.round((ok / total) * 100)
  return { ok, warn, bad, total, score }
}
