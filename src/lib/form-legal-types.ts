// Hangi formun gönderim sonunda hangi yasal sayfaların onayını
// istediğini tutar. Bireysel sayfa içerikleri `legal-store.ts`'de.
//
// Admin /admin/smtp ekranından her form için 0+ yasal sayfa seçer.
// Frontend o forma gelince bunların başlık+slug'larını okuyup tek bir
// "okudum, kabul ediyorum" checkbox'unda render eder.

export type FormLegalKey = "inquiry" | "quote" | "appointment"

export type FormLegalRequirements = Record<FormLegalKey, string[]>

export const FORM_LEGAL_KEYS: FormLegalKey[] = [
  "inquiry",
  "quote",
  "appointment",
]

export const DEFAULT_FORM_LEGAL: FormLegalRequirements = {
  inquiry: [],
  quote: [],
  appointment: [],
}

// Public endpoint'in döndüreceği resolved tip — admin'in seçtiği
// id'ler okunup gerçek sayfaya dönüştürülmüş hali.
export type ResolvedLegalPage = {
  id: string
  slug: string
  title: string
}

export type ResolvedFormLegal = Record<FormLegalKey, ResolvedLegalPage[]>
