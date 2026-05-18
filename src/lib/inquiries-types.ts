export type Inquiry = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
  // Free-form note for whoever processes the inquiry (admin panel later).
  // Empty string when fresh.
  notes: string
}

export type InquiriesData = {
  inquiries: Inquiry[]
}
