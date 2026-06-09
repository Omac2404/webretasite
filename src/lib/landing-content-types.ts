// Footer-öncesi, admin-yönetimli açılış içerikleri. /web-site ve
// /dijital-reklamlar sayfalarına Google Ads açılış sayfası deneyimini ve
// organik SEO'yu güçlendiren metin + SSS blokları ekler. Saf tipler —
// client component'lerden de import edilebilir (node:fs yok).

export type LandingSection = {
  // Bölüm başlığı (ör. "Nasıl çalışıyoruz?")
  heading: string
  // Serbest metin gövdesi. Boş satır = yeni paragraf.
  body: string
}

export type LandingFaq = {
  question: string
  answer: string
}

export type LandingPageContent = {
  // Kapalıyken bölüm hiç render edilmez (içerik korunur).
  enabled: boolean
  sections: LandingSection[]
  // SSS başlığı (ör. "Sıkça Sorulan Sorular")
  faqTitle: string
  faqs: LandingFaq[]
}

export type LandingPageKey = "web-site" | "dijital-reklamlar"

export type LandingContentData = Record<LandingPageKey, LandingPageContent>

export const LANDING_PAGES: {
  key: LandingPageKey
  label: string
  path: string
}[] = [
  { key: "web-site", label: "Web Site", path: "/web-site" },
  { key: "dijital-reklamlar", label: "Dijital Reklamlar", path: "/dijital-reklamlar" },
]

export const MAX_LANDING_SECTIONS = 8
export const MAX_LANDING_FAQS = 15

// Starter copy — admin bunları /admin/landing'den düzenler. İçerik Ads
// açılış deneyimini desteklemek için yazıldı; abartısız, dürüst ve
// dönüşüm odaklı.
export const DEFAULT_LANDING_CONTENT: LandingContentData = {
  "web-site": {
    enabled: true,
    sections: [
      {
        heading: "Markanıza özel, sıfırdan kodlanan web siteleri",
        body: "Hazır tema satmıyoruz. İşinizi dinliyor, hedef kitlenizi ve rakiplerinizi inceliyor, size özel bir site kurguluyoruz. Hızlı açılan, mobil uyumlu ve Google'da bulunmaya hazır bir altyapı; tasarımdan teknik SEO'ya kadar uçtan uca bizde.\n\nKurumsal tanıtım sitesinden ürün/proje vitrinine, online randevudan müşteri paneline kadar ihtiyacınız neyse ona göre ölçeklenen bir çözüm sunuyoruz.",
      },
      {
        heading: "Nasıl çalışıyoruz?",
        body: "1. Keşif görüşmesi — İhtiyacınızı, hedeflerinizi ve bütçenizi konuşuyoruz.\n\n2. Net teklif — Kapsamı ve fiyat aralığını şeffaf şekilde paylaşıyoruz; sürpriz maliyet yok.\n\n3. Tasarım & geliştirme — Onayınızla birlikte siteyi sıfırdan tasarlayıp kodluyoruz.\n\n4. Yayın & destek — Siteniz yayına alınır, sonrasında teknik destek devam eder.",
      },
      {
        heading: "Neden Webreta?",
        body: "• Şablon değil, size özel kod — daha hızlı, daha güvenli, daha esnek.\n\n• Tasarımdan SEO'ya tek elden hizmet; ayrı ajanslarla uğraşmazsınız.\n\n• Mobil öncelikli, yüksek performanslı sayfalar.\n\n• Yayın sonrası gerçek, ulaşılabilir teknik destek.",
      },
    ],
    faqTitle: "Sıkça Sorulan Sorular",
    faqs: [
      {
        question: "Web sitesi ne kadar sürede teslim edilir?",
        answer:
          "Kapsamına göre değişir; tek sayfalık siteler birkaç gün, kurumsal siteler genellikle 2–4 hafta içinde yayına alınır. Görüşme sonrası net bir süre paylaşıyoruz.",
      },
      {
        question: "Fiyat neye göre belirleniyor?",
        answer:
          "Sayfa sayısı, tasarım detayı ve istediğiniz özelliklere (örn. online randevu, özel panel, çok dillilik) göre belirlenir. İhtiyacınızı dinledikten sonra net bir fiyat aralığı sunuyoruz.",
      },
      {
        question: "Hazır tema mı kullanıyorsunuz?",
        answer:
          "Hayır. Her projeyi ihtiyacınıza göre sıfırdan tasarlayıp kodluyoruz. Bu sayede site daha hızlı açılır, markanıza birebir uyar ve sonradan kolayca geliştirilebilir.",
      },
      {
        question: "SEO (Google'da bulunurluk) dahil mi?",
        answer:
          "Temel teknik SEO (hız, mobil uyum, doğru başlık/etiket yapısı, site haritası) her projeye dahildir. Daha kapsamlı içerik ve reklam çalışmalarını ayrıca planlıyoruz.",
      },
      {
        question: "Siteyi sonradan kendim güncelleyebilir miyim?",
        answer:
          "Evet. İçerik yönetim paneli olan paketlerde yazı, görsel ve sayfaları kendiniz düzenleyebilirsiniz. Dilerseniz güncellemeleri biz de üstlenebiliriz.",
      },
    ],
  },
  "dijital-reklamlar": {
    enabled: true,
    sections: [
      {
        heading: "Reklam bütçenizi doğru yere harcayın",
        body: "Google Ads ve Meta (Instagram/Facebook) reklamlarınızı, tıklama değil dönüşüm odaklı yönetiyoruz. Hedefimiz daha fazla gösterim değil; size gerçekten müşteri ve talep getiren kampanyalar.\n\nDoğru anahtar kelimeler, doğru kitle ve sürekli optimizasyon ile bütçenizin boşa gitmesini engelliyoruz.",
      },
      {
        heading: "Şeffaf ve ölçülebilir yönetim",
        body: "Reklamların nasıl performans gösterdiğini net raporlarla görürsünüz: kaç kişi ulaştı, kaç tıklama, kaç talep/dönüşüm geldi. Tahmin yok, veri var.\n\nKampanyaları düzenli olarak optimize eder, işe yarayanı büyütüp işe yaramayanı keseriz.",
      },
      {
        heading: "Nasıl çalışıyoruz?",
        body: "1. Hedef & bütçe görüşmesi — Ne satıyorsunuz, kime ulaşmak istiyorsunuz, bütçeniz nedir?\n\n2. Kurulum — Hesap, dönüşüm takibi ve kampanya yapısını kuruyoruz.\n\n3. Yayın & optimizasyon — Reklamlar yayına alınır, verilere göre sürekli iyileştirilir.\n\n4. Raporlama — Sonuçları düzenli olarak paylaşır, birlikte yorumlarız.",
      },
    ],
    faqTitle: "Sıkça Sorulan Sorular",
    faqs: [
      {
        question: "Minimum reklam bütçesi nedir?",
        answer:
          "Sektöre ve hedeflerinize göre değişir. Görüşmede gerçekçi bir başlangıç bütçesi öneriyoruz; küçük bütçeyle test edip işe yaradıkça ölçeklemek mümkün.",
      },
      {
        question: "Reklam bütçesi sizin ücretinize dahil mi?",
        answer:
          "Hayır. Google/Meta'ya ödenen reklam bütçesi ayrıdır ve doğrudan platformlara gider. Biz yönetim/optimizasyon hizmetini veririz; bütçeniz tamamen size aittir.",
      },
      {
        question: "Hangi platformlarda reklam veriyorsunuz?",
        answer:
          "Google Ads (arama, görüntülü, YouTube, alışveriş) ve Meta Ads (Instagram + Facebook). İşinize en uygun kanalı ya da ikisini birlikte 360° yönetebiliriz.",
      },
      {
        question: "Ne kadar sürede sonuç alırım?",
        answer:
          "Reklamlar yayına alındığında trafik hemen başlar. Anlamlı optimizasyon ve istikrarlı sonuç için genellikle ilk 2–4 hafta veri toplama dönemidir.",
      },
      {
        question: "Raporlama nasıl oluyor?",
        answer:
          "Düzenli aralıklarla sade ve anlaşılır raporlar paylaşıyoruz: harcama, tıklama, dönüşüm ve maliyet metrikleri. İstediğiniz zaman güncel durumu sorabilirsiniz.",
      },
    ],
  },
}
