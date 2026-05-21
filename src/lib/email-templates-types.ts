// Mail şablonları — client-safe tipler.
//
// 3 form × 2 şablon (kullanıcı onayı + admin bildirim) = 6 şablon.
// Yeni bir form eklenince hem buraya hem `src/lib/site-forms.ts`'e ekle.

export type TemplateKey =
  | "appointment_user_confirmation"
  | "appointment_admin_notification"
  | "inquiry_user_confirmation"
  | "inquiry_admin_notification"
  | "quote_user_confirmation"
  | "quote_admin_notification"

export type EmailTemplate = {
  subject: string
  body: string
}

export type EmailTemplates = Record<TemplateKey, EmailTemplate>

export type TemplateMeta = {
  key: TemplateKey
  label: string
  description: string
  // Hangi {placeholder} anahtarları desteklendiği — UI'da hint olarak gösteriliyor.
  placeholders: string[]
  // Hangi forma ait — admin UI'da gruplamak için.
  group: "appointment" | "inquiry" | "quote"
  // Kime gidiyor — user (form sahibi) ya da admin (biz).
  audience: "user" | "admin"
}

export const TEMPLATE_GROUPS: {
  key: "appointment" | "inquiry" | "quote"
  label: string
  description: string
}[] = [
  {
    key: "inquiry",
    label: "İletişim formu",
    description:
      "İletişim sayfasındaki büyük form. Ziyaretçi mesaj bıraktığında tetiklenir.",
  },
  {
    key: "quote",
    label: "Teklif sihirbazı",
    description:
      "Web Site sayfasındaki 4 adımlı teklif sihirbazı. 'Gönder' adımında tetiklenir.",
  },
  {
    key: "appointment",
    label: "Randevu formu",
    description:
      "Dijital Reklamlar sayfasındaki paket modali içindeki randevu formu.",
  },
]

export const TEMPLATE_META: TemplateMeta[] = [
  // ─── İletişim formu ─────────────────────────────────────────────
  {
    key: "inquiry_user_confirmation",
    label: "İletişim — kullanıcıya onay",
    description:
      "İletişim formunu dolduran ziyaretçiye gider. Mesajının ulaştığını teyit eder.",
    placeholders: ["name", "email", "phone", "subject", "message"],
    group: "inquiry",
    audience: "user",
  },
  {
    key: "inquiry_admin_notification",
    label: "İletişim — bize bildirim",
    description:
      "Bir iletişim formu geldiğinde SMTP 'From' adresine düşen iç bildirim.",
    placeholders: ["name", "email", "phone", "subject", "message"],
    group: "inquiry",
    audience: "admin",
  },

  // ─── Teklif sihirbazı ───────────────────────────────────────────
  {
    key: "quote_user_confirmation",
    label: "Teklif — kullanıcıya onay",
    description:
      "Teklif sihirbazını tamamlayan ziyaretçiye gider. Talebinin alındığını ve ne zaman dönüleceğini söyler.",
    placeholders: [
      "name",
      "company",
      "email",
      "phone",
      "industry",
      "service",
      "projectType",
      "channels",
      "date",
      "time",
    ],
    group: "quote",
    audience: "user",
  },
  {
    key: "quote_admin_notification",
    label: "Teklif — bize bildirim",
    description:
      "Yeni bir teklif talebi geldiğinde SMTP 'From' adresine düşen iç bildirim. Tüm sihirbaz cevapları gövdede.",
    placeholders: [
      "name",
      "company",
      "email",
      "phone",
      "industry",
      "services",
      "service",
      "existingSiteUrl",
      "projectType",
      "description",
      "refs",
      "refNotes",
      "channels",
      "date",
      "time",
    ],
    group: "quote",
    audience: "admin",
  },

  // ─── Randevu formu ──────────────────────────────────────────────
  {
    key: "appointment_user_confirmation",
    label: "Randevu — kullanıcıya onay",
    description:
      "Dijital reklamlar sayfasındaki randevu formunu dolduran kişiye gider. Onay mesajıdır.",
    placeholders: [
      "name",
      "phone",
      "date",
      "hour",
      "channel",
      "package",
      "price",
    ],
    group: "appointment",
    audience: "user",
  },
  {
    key: "appointment_admin_notification",
    label: "Randevu — bize bildirim",
    description:
      "Bir randevu oluştuğunda SMTP 'From' adresine düşen iç bildirim. Müşteriyi aramanız için.",
    placeholders: [
      "name",
      "phone",
      "date",
      "hour",
      "channel",
      "package",
      "price",
    ],
    group: "appointment",
    audience: "admin",
  },
]

export const DEFAULT_TEMPLATES: EmailTemplates = {
  // ─── İletişim formu ─────────────────────────────────────────────
  inquiry_user_confirmation: {
    subject: "Mesajınızı aldık — Webreta",
    body: `Merhaba {name},

İletişim formu üzerinden gönderdiğiniz mesajınız bize ulaştı. En kısa sürede {email} üzerinden size dönüş yapacağız.

— Mesajınızın özeti —
Konu: {subject}
Mesaj: {message}

Webreta
`,
  },
  inquiry_admin_notification: {
    subject: "Yeni iletişim mesajı: {subject}",
    body: `İletişim formundan yeni bir mesaj geldi.

İsim: {name}
E-posta: {email}
Telefon: {phone}
Konu: {subject}

Mesaj:
{message}
`,
  },

  // ─── Teklif sihirbazı ───────────────────────────────────────────
  quote_user_confirmation: {
    subject: "Teklif talebiniz alındı — Webreta",
    body: `Merhaba {name},

Teklif sihirbazını doldurduğunuz için teşekkürler. Talebiniz bize ulaştı.

Tercih ettiğiniz iletişim kanalı/kanalları: {channels}
Görüşme için belirttiğiniz zaman: {date} {time}

Yukarıdaki tarih/saatte sizinle iletişime geçeceğiz. Görüşmek istemediğiniz bir durum olursa bu mesaja cevap olarak yazmanız yeterli.

Webreta
`,
  },
  quote_admin_notification: {
    subject: "Yeni teklif talebi: {projectType} · {name}",
    body: `Yeni bir teklif talebi geldi.

— Müşteri —
İsim: {name}
Firma: {company}
E-posta: {email}
Telefon: {phone}
Tercih kanal(lar)ı: {channels}
Görüşme zamanı: {date} {time}

— Sektör & Hizmet —
Sektör: {industry}
Verdiği hizmetler: {services}
İhtiyaç: {service}
Mevcut site (varsa): {existingSiteUrl}

— Paket & Detay —
Seçilen paket: {projectType}
Proje açıklaması: {description}

— Beğenilen örnek siteler —
{refs}

Notlar: {refNotes}
`,
  },

  // ─── Randevu formu ──────────────────────────────────────────────
  appointment_user_confirmation: {
    subject: "Randevunuz oluşturuldu — Webreta",
    body: `Merhaba {name},

{channel} kanalı için talep ettiğiniz "{package}" paketi randevunuz oluşturuldu.

Tarih: {date}
Saat: {hour}

Belirttiğiniz saatte {phone} numaralı telefonu arayacağız. Görüşmek için sizinle iletişime geçmemizi istemediğiniz bir durum olursa cevap olarak bu mesaja yazmanız yeterli.

Webreta
`,
  },
  appointment_admin_notification: {
    subject: "Yeni randevu: {channel} · {package}",
    body: `Yeni bir randevu oluştu.

İsim: {name}
Telefon: {phone}
Kanal: {channel}
Paket: {package} ({price}/ay)
Tarih: {date}
Saat: {hour}

Yukarıdaki tarih/saatte müşteriyi arayın.
`,
  },
}
