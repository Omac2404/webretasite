// "Kod Ekleme" alanına yapıştırılan HTML'den <meta> ve <link> etiketlerini
// ayıklar.
//
// Neden: bu etiketler sunucu tarafında, gerçek <head> içine basılmalı.
// Search Console'un meta tag doğrulaması, Meta domain doğrulaması ve benzeri
// kontroller sayfanın HAM HTML'ini okur, JavaScript çalıştırmaz — tarayıcıda
// sonradan enjekte edilen bir <meta> onlar için yok hükmündedir.
//
// <script> etiketleri ise tam tersine client tarafında kalmalı: innerHTML ile
// basılan script'ler HTML spec'i gereği hiç çalışmaz (bkz. SiteCodeInjector).

export type ParsedHeadTag = {
  tag: "meta" | "link"
  attrs: Record<string, string>
}

const TAG_RE = /<(meta|link)\b([^>]*?)\/?>/gi
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

// React, host elementlerinde bu birkaç HTML özniteliğini camelCase karşılığıyla
// bekliyor; kalanlar olduğu gibi geçiyor.
const REACT_ATTR_ALIASES: Record<string, string> = {
  charset: "charSet",
  "http-equiv": "httpEquiv",
  class: "className",
  for: "htmlFor",
  crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy",
  hreflang: "hrefLang",
  imagesrcset: "imageSrcSet",
  imagesizes: "imageSizes",
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  ATTR_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ATTR_RE.exec(raw)) !== null) {
    const name = m[1].toLowerCase()
    // Değeri olmayan (boolean) öznitelikler için boş string yeterli.
    const value = m[2] ?? m[3] ?? m[4] ?? ""
    attrs[REACT_ATTR_ALIASES[name] ?? name] = value
  }
  return attrs
}

// Sunucuda render edilecek meta/link etiketleri.
export function extractHeadTags(html: string): ParsedHeadTag[] {
  if (!html.trim()) return []
  const out: ParsedHeadTag[] = []
  TAG_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TAG_RE.exec(html)) !== null) {
    const attrs = parseAttrs(m[2] ?? "")
    // Özniteliksiz bir <meta>/<link> hiçbir işe yaramaz, atla.
    if (Object.keys(attrs).length === 0) continue
    out.push({ tag: m[1].toLowerCase() as "meta" | "link", attrs })
  }
  return out
}
