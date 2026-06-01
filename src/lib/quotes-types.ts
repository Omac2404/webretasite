// Teklif sihirbazından düşen kayıtların tip tanımı. Client-safe.

export type Quote = {
  id: string
  // Kişi
  name: string
  company: string
  email: string
  phone: string
  // Proje
  industry: string
  service: string
  serviceLabel: string
  projectType: string
  description: string
  existingSiteUrl: string
  // Örnek siteler
  refs: string[]
  refNotes: string
  // İletişim tercihi
  channelLabels: string[]
  date: string
  time: string
  // Sistem
  mailUserSent: boolean
  mailAdminSent: boolean
  mailError?: string
  createdAt: string
}

export type QuotesData = {
  quotes: Quote[]
}
