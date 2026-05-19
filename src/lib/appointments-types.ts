// Randevu talepleri — Dijital Reklamlar sayfasındaki "Sizi ne zaman
// arayalım?" formundan düşer. Client-safe tipler.

export type Appointment = {
  id: string
  channelKey: string
  channelLabel: string
  pkgKey: string
  pkgName: string
  pkgPrice: string
  name: string
  phone: string
  email: string
  // ISO date (gün) ve saat (0-23)
  date: string
  hour: number
  // Mail gönderim sonucu — admin paneli için kullanışlı
  mailUserSent: boolean
  mailAdminSent: boolean
  mailError?: string
  createdAt: string
}

export type AppointmentsData = {
  appointments: Appointment[]
}
