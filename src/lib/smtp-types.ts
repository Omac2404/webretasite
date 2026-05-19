// SMTP ayarları — client-safe tip tanımları.

export type SmtpEncryption = "none" | "ssl" | "tls"

export type SmtpSettings = {
  // SMTP gönderim aktif mi? Form action'ları bu bayrağa bakar.
  enabled: boolean
  host: string
  // 1..65535
  port: number
  // SMTP Authentication kullanılsın mı?
  auth: boolean
  username: string
  // Düz metin olarak diskte tutulur (file-based store, mevcut diğer
  // sırlarla aynı pattern). API yanıtlarında / admin form default'unda
  // ASLA döndürülmez — admin formu boş gelir, boş kaldıysa eski şifre
  // korunur.
  password: string
  encryption: SmtpEncryption
  fromEmail: string
  fromName: string
  // Çıkan tüm maillerin From adresini buradakine zorla
  forceFromAddress: boolean
  // PHP'deki "Disable SSL Certificate Verification" karşılığı —
  // self-signed cert kullanan hostlar için
  disableTLSVerification: boolean
}

// Admin formuna ve API'ye dönen güvenli görünüm — şifre yok, yerine
// "kaydedilmiş bir şifre var mı" bilgisi var.
export type SmtpSettingsPublic = Omit<SmtpSettings, "password"> & {
  hasPassword: boolean
}

export const DEFAULT_SMTP: SmtpSettings = {
  enabled: false,
  host: "",
  port: 587,
  auth: true,
  username: "",
  password: "",
  encryption: "tls",
  fromEmail: "",
  fromName: "",
  forceFromAddress: false,
  disableTLSVerification: false,
}

export const ENCRYPTION_OPTIONS: { value: SmtpEncryption; label: string }[] = [
  { value: "none", label: "Şifreleme yok" },
  { value: "ssl", label: "SSL" },
  { value: "tls", label: "TLS" },
]
