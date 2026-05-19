// İletişim sayfası içerik tipleri. Client-safe.

export type ContactContent = {
  // Hero — kicker + 3 parçalı başlık + intro paragrafı
  hero: {
    kicker: string
    titleLeading: string
    titleHighlight: string
    titleTrailing: string
    intro: string
  }
  // 4 info kartının değerleri. label/icon sabit; sadece içerik düzenlenir.
  info: {
    email: string
    phone: string
    address: string
    hours: string
  }
  // Form bloğu başlıkları
  form: {
    kicker: string
    titleLeading: string
    titleHighlight: string
    titleTrailing: string
    intro: string
  }
  // Harita bloğu başlıkları + Google Maps embed src URL'i
  map: {
    kicker: string
    titleLeading: string
    titleHighlight: string
    titleTrailing: string
    intro: string
    // Google Maps "Share > Embed a map" iframe'inin src URL'i.
    // Tam iframe HTML'i de yapıştırılabiliyor — actions tarafında src çekiliyor.
    embedSrc: string
    // "Haritayı yeni sekmede aç" linki için paylaşım URL'i (opsiyonel).
    shareUrl: string
  }
}

export const DEFAULT_CONTACT: ContactContent = {
  hero: {
    kicker: "İletişim",
    titleLeading: "Bir kahve içelim,",
    titleHighlight: "projenizi konuşalım.",
    titleTrailing: "",
    intro:
      "Yeni bir web projeniz, mevcut sitenizde iyileştirme fikriniz veya dijital reklam stratejiniz için bizimle iletişime geçin. 24 saat içinde geri dönüyoruz.",
  },
  info: {
    email: "hello@webreta.com",
    phone: "+90 (XXX) XXX XX XX",
    address: "İzmir, Türkiye",
    hours: "Pazartesi – Cuma · 09:00 – 18:00",
  },
  form: {
    kicker: "Mesaj gönderin",
    titleLeading: "Formu",
    titleHighlight: "doldurun",
    titleTrailing: ", dönelim.",
    intro:
      "Projenizle ilgili kısa bir özet, hedef tarihiniz ve bütçe aralığınızı paylaşırsanız daha hızlı ilerleyebiliriz.",
  },
  map: {
    kicker: "Konum",
    titleLeading: "İzmir,",
    titleHighlight: "Ege'nin merkezi.",
    titleTrailing: "",
    intro:
      "Ekip İzmir'de çalışıyor, projeleri Türkiye genelindeki markalar için uzaktan yürütüyoruz.",
    embedSrc: "",
    shareUrl: "",
  },
}

// Google Maps embed iframe HTML'inden `src` URL'ini çek. Düz URL yapıştırılırsa
// olduğu gibi döner. Geçersizse boş string verir, caller fallback'i seçer.
export function extractGoogleMapsEmbedSrc(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""

  // Tam iframe HTML
  const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)
  if (iframeMatch) return iframeMatch[1].trim()

  // Düz src URL — sadece google.com/maps/embed kabul ediyoruz
  if (
    /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(trimmed) ||
    /^https:\/\/maps\.google\.[a-z.]+\/maps\?/i.test(trimmed)
  ) {
    return trimmed
  }

  return ""
}
