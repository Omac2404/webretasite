// Mail şablonları — client-safe tipler.

export type TemplateKey =
  | "appointment_user_confirmation"
  | "appointment_admin_notification"

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
}

export const TEMPLATE_META: TemplateMeta[] = [
  {
    key: "appointment_user_confirmation",
    label: "Randevu onay (kullanıcıya)",
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
  },
  {
    key: "appointment_admin_notification",
    label: "Randevu bildirim (size)",
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
  },
]

export const DEFAULT_TEMPLATES: EmailTemplates = {
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
