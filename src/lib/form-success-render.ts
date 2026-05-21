// Client-safe yardımcılar — admin'in girdiği success-screen kopyasını
// {placeholder}'larla doldurur ve gövdeyi paragraflara böler.

export function fillPlaceholders(
  template: string,
  vars: Record<string, string | number | undefined | null>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key]
    return v == null ? "" : String(v)
  })
}

// Çift satır = yeni paragraf. Tek satır içindeki \n korunur (`whitespace-pre-line` kullanılabilir).
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}
