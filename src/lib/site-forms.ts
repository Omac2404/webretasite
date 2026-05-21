// Sitedeki herkese açık formların envanteri. SMTP ayar ekranında admin'in
// hangi formların mail gönderebileceğini görmesi için tek noktadan derleniyor.
// Yeni bir form eklendiğinde buraya da ekle.

export type SiteForm = {
  id: string
  // İnsan okur etiket — admin panelde gösterilecek
  label: string
  // Görsel placement açıklaması — "İletişim sayfasındaki yan kart" gibi
  location: string
  // Formun bulunduğu sayfa
  href: string
  // Server action / API endpoint — şu an mail bağlanma noktasını işaret eder
  handler: string
  // Mail entegrasyonu henüz yapıldıysa true; yoksa false (ileride etkinleştirilecek)
  emailWired: boolean
}

export const SITE_FORMS: SiteForm[] = [
  {
    id: "iletisim",
    label: "İletişim formu",
    location: "İletişim sayfası — soldaki büyük form kartı",
    href: "/iletisim",
    handler: "submitInquiry",
    emailWired: true,
  },
  {
    id: "teklif-sihirbazi",
    label: "Teklif sihirbazı",
    location: "Web Site sayfası — 4 adımlı fiyat teklif sihirbazı",
    href: "/web-site#teklif",
    handler: "submitQuoteAction",
    emailWired: true,
  },
  {
    id: "randevu-formu",
    label: "Randevu formu (sizi ne zaman arayalım?)",
    location:
      "Dijital Reklamlar sayfası — paket modali içindeki tarih/saat seçim formu",
    href: "/dijital-reklamlar",
    handler: "bookAppointmentAction",
    emailWired: true,
  },
]
