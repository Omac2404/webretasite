// Hakkımızda body alanı için dar whitelist'li HTML sanitizer. Admin
// /admin/hakkimizda'daki RichTextArea (contentEditable) editor'den
// gelen innerHTML'i temizler. Sadece bizim tanıdığımız tag/style'a
// izin verilir; geri kalan her şey strip edilir.
//
// İzin verilen tag'ler:
//   <p>, <br>, <strong>, <b>, <em>, <i>, <u>,
//   <span style="color: #xxx[xxx]; font-size: Npx">
//
// Hiçbir attribute (span'ın style'ı hariç) korunmaz. Onsubmit, onclick
// gibi event handler'ları, href, src, anything else düşürülür.

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "span",
])

// Style property whitelist. Her property için değerini de doğrularız.
function sanitizeStyle(style: string): string {
  const out: string[] = []
  // CSS property'leri ";" ile ayır, "prop: value" çiftlerine böl.
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":")
    if (idx < 0) continue
    const prop = decl.slice(0, idx).trim().toLowerCase()
    const value = decl.slice(idx + 1).trim()
    if (prop === "color") {
      // 3 ya da 6 haneli hex renk veya rgb(...) formatı.
      if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)) {
        out.push(`color: ${value.toLowerCase()}`)
      } else if (
        /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(value)
      ) {
        out.push(`color: ${value}`)
      }
    } else if (prop === "font-size") {
      // px değeri, 10–96 arası.
      const m = /^(\d{1,3})px$/.exec(value)
      if (m) {
        const n = Number(m[1])
        if (n >= 10 && n <= 96) out.push(`font-size: ${n}px`)
      }
    }
  }
  return out.join("; ")
}

// Çok küçük bir HTML parser. <tag attrs> ve </tag> token'larını
// tanır, kalan kısmı text olarak kabul eder. Strict değil ama bizim
// kontrolümüzdeki contentEditable çıktısı için yeterli.
type Token =
  | { type: "open"; tag: string; attrs: string }
  | { type: "close"; tag: string }
  | { type: "self"; tag: string; attrs: string }
  | { type: "text"; value: string }

function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i)
      if (end < 0) {
        // Açık < — kapanmamış, text olarak escape et.
        tokens.push({ type: "text", value: html.slice(i) })
        break
      }
      const inner = html.slice(i + 1, end).trim()
      if (inner.startsWith("/")) {
        const tag = inner.slice(1).trim().toLowerCase()
        tokens.push({ type: "close", tag })
      } else if (inner.endsWith("/")) {
        const body = inner.slice(0, -1).trim()
        const sp = body.indexOf(" ")
        const tag = (sp < 0 ? body : body.slice(0, sp)).toLowerCase()
        const attrs = sp < 0 ? "" : body.slice(sp + 1)
        tokens.push({ type: "self", tag, attrs })
      } else {
        const sp = inner.indexOf(" ")
        const tag = (sp < 0 ? inner : inner.slice(0, sp)).toLowerCase()
        const attrs = sp < 0 ? "" : inner.slice(sp + 1)
        tokens.push({ type: "open", tag, attrs })
      }
      i = end + 1
    } else {
      const next = html.indexOf("<", i)
      const end = next < 0 ? html.length : next
      tokens.push({ type: "text", value: html.slice(i, end) })
      i = end
    }
  }
  return tokens
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

// attrs string'inden sadece style="..." parçasını ayıkla; kalanını at.
function extractStyle(attrs: string): string {
  const m = /style\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs)
  if (!m) return ""
  return m[2] ?? m[3] ?? ""
}

export function sanitizeAboutBody(input: string): string {
  if (!input) return ""
  const tokens = tokenize(input)
  let out = ""
  // Stack'i sadece dengeyi kontrol için tutuyoruz; eşleşmeyen close
  // tag'lerini düşürmek için.
  const stack: string[] = []
  for (const tk of tokens) {
    if (tk.type === "text") {
      // contentEditable bazen &nbsp; üretir — olduğu gibi bırak.
      out += tk.value
      continue
    }
    if (tk.type === "self") {
      if (tk.tag === "br") out += "<br>"
      continue
    }
    if (tk.type === "open") {
      if (!ALLOWED_TAGS.has(tk.tag)) continue
      if (tk.tag === "br") {
        out += "<br>"
        continue
      }
      if (tk.tag === "span") {
        const style = sanitizeStyle(extractStyle(tk.attrs))
        if (!style) {
          // Style'sız span'ı düşür ama içeriği akışta kalsın — stack'e
          // ekleme; ama biz tag'i atladığımız için kapanışı da
          // eşleştiremeyiz. Çözüm: span açıyoruz ama style'sız.
          out += "<span>"
        } else {
          out += `<span style="${style}">`
        }
        stack.push("span")
      } else {
        out += `<${tk.tag}>`
        stack.push(tk.tag)
      }
      continue
    }
    if (tk.type === "close") {
      if (!ALLOWED_TAGS.has(tk.tag)) continue
      if (tk.tag === "br") continue
      const last = stack[stack.length - 1]
      if (last === tk.tag) {
        stack.pop()
        out += `</${tk.tag}>`
      }
      // Eşleşmeyen close tag'i sessizce düşür.
    }
  }
  // Kalan açık tag'leri kapat — bozuk HTML çıkmasın.
  while (stack.length > 0) {
    out += `</${stack.pop()}>`
  }
  return out.trim()
}

// Eski plain-text body'lerini (\n\n paragraflı) HTML'e çevir. RichText
// editor'e ilk yüklenirken çalışır.
export function plainTextToHtml(text: string): string {
  if (!text) return ""
  if (/<[a-zA-Z][^>]*>/.test(text)) return text // zaten HTML
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${escapeText(p).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

// Render-time helper. Body HTML mi (en az bir tag var mı) yoksa plain
// text mi olduğunu söyler — render katmanı paragraflara bölmeye veya
// dangerouslySetInnerHTML kullanmaya buna göre karar verir.
export function isHtmlBody(body: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(body)
}
