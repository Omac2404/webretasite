"use client"

import { useState, useEffect, useRef, useMemo, useTransition } from "react"
import { submitQuoteAction } from "@/app/web-site/actions"
import {
  DEFAULT_FORM_SUCCESS,
  type FormSuccessScreen,
} from "@/lib/form-success-types"
import {
  fillPlaceholders,
  splitParagraphs,
} from "@/lib/form-success-render"
import type { ResolvedLegalPage } from "@/lib/form-legal-types"
import { FormConsent } from "@/components/FormConsent"
import {
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Rocket,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Globe,
  Layers,
  Boxes,
} from "lucide-react"
import { createPortal } from "react-dom"
import { DotPattern } from "@/components/DotPattern"

// ─── Quote wizard data ───────────────────────────────────────────────────
// Multi-step pricing/quote tool. Steps in QUOTE_STEPS are rendered as a
// stepper at the top; the form body shows one step at a time with a
// slide-fade transition. Submit handler is a stub — wire it to email/API
// in a follow-up.

// Two-option service choice on step 1. Redesign reveals an extra URL input
// so the user can drop their existing site.
const QUOTE_SERVICES = [
  {
    id: "new-site",
    label: "Yeni web sitesi yapımı",
    desc: "Sıfırdan, markanıza özel tasarım ve geliştirme.",
    Icon: Sparkles,
  },
  {
    id: "redesign",
    label: "Mevcut site yenileme",
    desc: "Var olan sitenizi modern bir tasarım ve teknoloji ile baştan kuruyoruz.",
    Icon: RefreshCw,
  },
]

// 4 project packages with rich descriptions and a one-word descriptor
// in place of an explicit price (prices are sensitive — discussed in the
// first meeting). Selecting "landing" or "mini" surfaces a recommendation
// to also check Webreta KOBI (handled in the wizard).
// Quote wizard project types — admin-managed via /admin/web-paketleri.
// The constant below is the SEED used until /api/web-packages resolves on
// first paint. Mirror the store's defaults so the picker renders even
// when the API is slow or offline.
type QuoteProjectType = {
  id: string
  label: string
  tagline: string
  descriptor: string
  desc: string
  bullets: string[]
  iconKey: string
  kobiRedirect: boolean
}

const QUOTE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  layers: Layers,
  globe: Globe,
  boxes: Boxes,
  rocket: Rocket,
  sparkles: Sparkles,
  refresh: RefreshCw,
}

const QUOTE_PROJECT_TYPES_SEED: QuoteProjectType[] = [
  {
    id: "landing",
    label: "Landing Sayfa",
    tagline: "Tek sayfa · dönüşüm odaklı",
    descriptor: "Pratik",
    desc: "Tek sayfada hikayenizi anlatan, dönüşüm odaklı tasarım. Ürün lansmanları, kampanyalar veya tek bir hizmete odaklanan işletmeler için ideal.",
    bullets: ["1 sayfa", "Form ve CTA optimizasyonu", "Hızlı yayına alma"],
    iconKey: "layers",
    kobiRedirect: true,
  },
  {
    id: "mini",
    label: "Kompakt Kurumsal Site",
    tagline: "5 sayfaya kadar · statik",
    descriptor: "Bütçe dostu",
    desc: "5 sayfaya kadar statik kurumsal site. Hakkımızda, hizmetler, referanslar ve iletişim — hızlı yüklenen, şık bir dijital vitrin.",
    bullets: ["5 sayfaya kadar", "Mobil + masaüstü uyumlu", "Temel SEO"],
    iconKey: "globe",
    kobiRedirect: true,
  },
  {
    id: "pro",
    label: "Profesyonel Kurumsal Site",
    tagline: "50 sayfaya kadar · CMS",
    descriptor: "İdeal",
    desc: "50 sayfaya kadar genişleyebilen, blog modülü, içerik yönetim paneli ve gelişmiş form yönetimi içeren tam donanımlı kurumsal site.",
    bullets: [
      "50 sayfaya kadar",
      "İçerik yönetim paneli (CMS)",
      "Blog + gelişmiş form yönetimi",
    ],
    iconKey: "boxes",
    kobiRedirect: false,
  },
  {
    id: "webapp",
    label: "Web Uygulamalı Kurumsal Site",
    tagline: "Sınırsız ölçek · amaca özel uygulama",
    descriptor: "Profesyonel",
    desc: "Sektörünüze özel iş akışlarını dijitalleştiren güçlü uygulamalar: online randevu, sipariş takip, müşteri/hasta portalı, lojistik ve stok yönetimi gibi sınırsız özelleştirilebilir çözümler.",
    bullets: [
      "Online randevu / rezervasyon",
      "Sipariş, hasta veya müşteri takip paneli",
      "Sektörünüze özel iş akışı tasarımı",
    ],
    iconKey: "rocket",
    kobiRedirect: false,
  },
]

// External URL for the Webreta KOBI recommendation. Replace with the real
// link when ready.
const WEBRETA_KOBI_URL = "https://kobi.webreta.com"

// Contact channels — multi-select with per-channel color treatment.
// WhatsApp uses its official brand green and inline SVG glyph.
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

const QUOTE_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", color: "#25D366", Icon: WhatsAppIcon },
  { id: "phone", label: "Telefon", color: "#f59e0b", Icon: Phone },
  { id: "email", label: "E-posta", color: "#3c639f", Icon: Mail },
]

const QUOTE_STEPS = [
  { num: "01", title: "Sektör & Hizmet" },
  { num: "02", title: "Paket Seçimi" },
  { num: "03", title: "Örnek Siteler" },
  { num: "04", title: "İletişim" },
]

// 30-minute appointment slots. Adjust the window if you want different
// working hours.
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00",
]

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]
const MONTH_NAMES = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
]

type QuoteForm = {
  industry: string
  services: string
  service: string
  existingSiteUrl: string
  projectType: string
  description: string
  refs: string[]
  refNotes: string
  name: string
  company: string
  email: string
  phone: string
  channels: string[]
  date: string
  time: string
}

const QUOTE_DEFAULT: QuoteForm = {
  industry: "",
  services: "",
  service: "",
  existingSiteUrl: "",
  projectType: "",
  description: "",
  refs: ["", "", ""],
  refNotes: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  channels: [],
  date: "",
  time: "",
}

export default function QuoteWizardSection() {
  // Quote wizard state
  const [quoteStep, setQuoteStep] = useState(0)
  const [quoteDir, setQuoteDir] = useState<1 | -1>(1)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)
  const [quote, setQuote] = useState<QuoteForm>(QUOTE_DEFAULT)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [submitPending, startSubmitTransition] = useTransition()
  const [successCopy, setSuccessCopy] = useState<FormSuccessScreen>(
    DEFAULT_FORM_SUCCESS.quote,
  )
  const [legalPages, setLegalPages] = useState<ResolvedLegalPage[]>([])
  const [consent, setConsent] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetch("/api/form-success", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { quote?: FormSuccessScreen } | null) => {
        if (cancelled || !data?.quote) return
        setSuccessCopy(data.quote)
      })
      .catch(() => {})
    fetch("/api/form-legal", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { quote?: ResolvedLegalPage[] } | null) => {
        if (cancelled || !Array.isArray(data?.quote)) return
        setLegalPages(data.quote)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  const [redesignModalOpen, setRedesignModalOpen] = useState(false)
  const [redesignDraftUrl, setRedesignDraftUrl] = useState("")
  const [redesignAnchor, setRedesignAnchor] = useState<{ top: number; left: number } | null>(null)
  const [kobiModalOpen, setKobiModalOpen] = useState(false)
  const [kobiAnchor, setKobiAnchor] = useState<{ top: number; left: number } | null>(null)
  const redesignModalRef = useRef<HTMLDivElement | null>(null)
  const kobiModalRef = useRef<HTMLDivElement | null>(null)
  const pkgScrollerRef = useRef<HTMLDivElement | null>(null)
  const [pkgCanScrollLeft, setPkgCanScrollLeft] = useState(false)
  const [pkgCanScrollRight, setPkgCanScrollRight] = useState(false)

  // Project types + wizard heading — admin-managed via /admin/web-paketleri.
  // SEED renders on first paint; replaced once /api/web-packages resolves.
  const [projectTypes, setProjectTypes] = useState<QuoteProjectType[]>(
    QUOTE_PROJECT_TYPES_SEED,
  )
  const [wizardHeading, setWizardHeading] = useState<{
    titleLeader: string
    titleHighlight: string
    subtitle: string
  }>({
    titleLeader: "",
    titleHighlight: "",
    subtitle: "",
  })
  useEffect(() => {
    let cancelled = false
    fetch("/api/web-packages")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          packages?: QuoteProjectType[]
          wizardHeading?: {
            titleLeader?: string
            titleHighlight?: string
            subtitle?: string
          }
        } | null) => {
          if (cancelled || !data) return
          if (Array.isArray(data.packages) && data.packages.length > 0) {
            setProjectTypes(data.packages)
          }
          if (data.wizardHeading) {
            setWizardHeading((prev) => ({
              titleLeader:
                typeof data.wizardHeading?.titleLeader === "string"
                  ? data.wizardHeading.titleLeader
                  : prev.titleLeader,
              titleHighlight:
                typeof data.wizardHeading?.titleHighlight === "string"
                  ? data.wizardHeading.titleHighlight
                  : prev.titleHighlight,
              subtitle:
                typeof data.wizardHeading?.subtitle === "string"
                  ? data.wizardHeading.subtitle
                  : prev.subtitle,
            }))
          }
        },
      )
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Earliest selectable time on today. We require a 4-hour heads-up:
  // if it's 10:00 now, the earliest slot today is 14:00. Past 14:00 (so
  // earliest + 4h crosses 18:00 last slot), today drops off entirely.
  const earliestTodaySlot = useMemo(() => {
    const now = new Date()
    const earliest = new Date(now.getTime() + 4 * 60 * 60 * 1000)
    // Round up to the next 30-min slot.
    const mins = earliest.getMinutes()
    if (mins === 0) {
      earliest.setSeconds(0, 0)
    } else if (mins <= 30) {
      earliest.setMinutes(30, 0, 0)
    } else {
      earliest.setHours(earliest.getHours() + 1, 0, 0, 0)
    }
    const today = new Date()
    // If rounding pushed earliest past today (e.g. now=23:00 → earliest=03:00 next day), skip today.
    const sameDay =
      earliest.getFullYear() === today.getFullYear() &&
      earliest.getMonth() === today.getMonth() &&
      earliest.getDate() === today.getDate()
    if (!sameDay) return null
    const lastSlot = new Date(today)
    lastSlot.setHours(18, 0, 0, 0)
    if (earliest > lastSlot) return null
    const hh = String(earliest.getHours()).padStart(2, "0")
    const mm = String(earliest.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  }, [])

  const todayIso = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`
  }, [])

  // Next 14 selectable days for the date picker. Skips today entirely when
  // the 4-hour minimum heads-up can't be met before 18:00.
  const next14Days = useMemo(() => {
    const days: {
      iso: string
      dayName: string
      dayNum: number
      monthShort: string
      isToday: boolean
      isTomorrow: boolean
    }[] = []
    const now = new Date()
    const offset = earliestTodaySlot === null ? 1 : 0
    for (let i = 0; i < 14; i++) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset + i,
      )
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(d.getDate()).padStart(2, "0")}`
      // Today is shown only when today's slots are still bookable
      // (offset 0). Tomorrow is the day immediately after today — when
      // today is skipped (offset 1) the first chip IS tomorrow.
      const isToday = offset === 0 && i === 0
      const isTomorrow = offset === 0 ? i === 1 : i === 0
      days.push({
        iso,
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        monthShort: MONTH_NAMES[d.getMonth()],
        isToday,
        isTomorrow,
      })
    }
    return days
  }, [earliestTodaySlot])

  // Time slots filtered for the selected date: today is trimmed to slots ≥
  // earliestTodaySlot; future days show the full window.
  const visibleTimeSlots = useMemo(() => {
    if (quote.date === todayIso && earliestTodaySlot !== null) {
      return TIME_SLOTS.filter(t => t >= earliestTodaySlot)
    }
    return TIME_SLOTS
  }, [quote.date, earliestTodaySlot, todayIso])

  const isWaPhoneSelected =
    quote.channels.includes("whatsapp") && quote.channels.includes("phone")

  const toggleWaPhone = () => {
    setQuote(prev => {
      const filtered = prev.channels.filter(
        c => c !== "whatsapp" && c !== "phone",
      )
      return isWaPhoneSelected
        ? { ...prev, channels: filtered }
        : { ...prev, channels: [...filtered, "whatsapp", "phone"] }
    })
  }

  // Anchor a popup just below a clicked card. Coordinates are
  // document-relative (include scroll offsets) so the popup scrolls with
  // the page along with its source element instead of sticking to the
  // viewport.
  const anchorFor = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    return {
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX + rect.width / 2,
    }
  }

  const handleServiceSelect = (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (id === "redesign") {
      // Open the URL-capture popup anchored to the clicked card. Service
      // is only marked as selected once the user confirms inside.
      setRedesignDraftUrl(quote.existingSiteUrl)
      setRedesignAnchor(anchorFor(e.currentTarget))
      setRedesignModalOpen(true)
      return
    }
    setQuote(prev => ({ ...prev, service: id }))
  }

  const handleRedesignConfirm = () => {
    if (redesignDraftUrl.trim() === "") return
    setQuote(prev => ({
      ...prev,
      service: "redesign",
      existingSiteUrl: redesignDraftUrl.trim(),
    }))
    setRedesignModalOpen(false)
  }

  const handleProjectTypeSelect = (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setQuote(prev => ({ ...prev, projectType: id }))
    const picked = projectTypes.find(p => p.id === id)
    if (picked?.kobiRedirect) {
      setKobiAnchor(anchorFor(e.currentTarget))
      setKobiModalOpen(true)
    }
  }

  const toggleChannel = (id: string) => {
    setQuote(prev => ({
      ...prev,
      channels: prev.channels.includes(id)
        ? prev.channels.filter(c => c !== id)
        : [...prev.channels, id],
    }))
  }

  const updateRef = (idx: number, v: string) => {
    setQuote(prev => ({
      ...prev,
      refs: prev.refs.map((r, i) => (i === idx ? v : r)),
    }))
  }

  const isQuoteStepValid = (i: number) => {
    if (i === 0) {
      const hasIndustry = quote.industry.trim() !== ""
      const hasService = quote.service !== ""
      const redesignNeedsUrl =
        quote.service === "redesign" && quote.existingSiteUrl.trim() === ""
      return hasIndustry && hasService && !redesignNeedsUrl
    }
    if (i === 1) return quote.projectType !== ""
    if (i === 2) return true
    if (i === 3) {
      const consentOk = legalPages.length === 0 || consent
      return (
        quote.name.trim() !== "" &&
        quote.email.trim() !== "" &&
        quote.phone.trim() !== "" &&
        quote.channels.length > 0 &&
        quote.date !== "" &&
        quote.time !== "" &&
        consentOk
      )
    }
    return false
  }

  const quoteNext = () => {
    if (!isQuoteStepValid(quoteStep)) return
    if (quoteStep === QUOTE_STEPS.length - 1) {
      if (submitPending) return
      const projectTypeLabel =
        projectTypes.find(p => p.id === quote.projectType)?.label ?? ""
      const serviceLabel =
        QUOTE_SERVICES.find(s => s.id === quote.service)?.label ?? ""
      const channelLabels = quote.channels
        .map(id => QUOTE_CHANNELS.find(c => c.id === id)?.label)
        .filter((l): l is string => Boolean(l))

      setQuoteError(null)
      startSubmitTransition(async () => {
        const res = await submitQuoteAction({
          industry: quote.industry,
          services: quote.services,
          serviceLabel,
          existingSiteUrl: quote.existingSiteUrl,
          projectTypeLabel,
          description: quote.description,
          refs: quote.refs,
          refNotes: quote.refNotes,
          name: quote.name,
          company: quote.company,
          email: quote.email,
          phone: quote.phone,
          channelLabels,
          date: quote.date,
          time: quote.time,
        })
        if (res.ok) {
          setQuoteSubmitted(true)
        } else {
          setQuoteError(res.error)
        }
      })
      return
    }
    setQuoteDir(1)
    setQuoteStep(s => s + 1)
  }

  const quoteBack = () => {
    if (quoteStep === 0) return
    setQuoteDir(-1)
    setQuoteStep(s => s - 1)
  }

  const quoteReset = () => {
    setQuote(QUOTE_DEFAULT)
    setQuoteStep(0)
    setQuoteDir(1)
    setQuoteSubmitted(false)
    setQuoteError(null)
    setConsent(false)
  }

  // If the selected time isn't valid for the selected date (e.g. user
  // selected 09:00 on a future date, then switched to today where 09:00
  // is too soon), clear it so validation requires a new pick.
  useEffect(() => {
    if (quote.time !== "" && !visibleTimeSlots.includes(quote.time)) {
      setQuote(p => ({ ...p, time: "" }))
    }
  }, [visibleTimeSlots, quote.time])

  // When a wizard popup opens, nudge the page so the entire popup is in
  // view. Without this, popups anchored to cards near the bottom of the
  // viewport get clipped and the user has to scroll manually. Skipped on
  // mobile — popups there render as fixed bottom sheets, so the viewport
  // already shows them in full.
  useEffect(() => {
    if (!redesignModalOpen) return
    if (window.matchMedia("(max-width: 767px)").matches) return
    const id = requestAnimationFrame(() => {
      const el = redesignModalRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const margin = 24
      if (rect.bottom > window.innerHeight - margin) {
        window.scrollBy({
          top: rect.bottom - window.innerHeight + margin,
          behavior: "smooth",
        })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [redesignModalOpen])

  useEffect(() => {
    if (!kobiModalOpen) return
    if (window.matchMedia("(max-width: 767px)").matches) return
    const id = requestAnimationFrame(() => {
      const el = kobiModalRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const margin = 24
      if (rect.bottom > window.innerHeight - margin) {
        window.scrollBy({
          top: rect.bottom - window.innerHeight + margin,
          behavior: "smooth",
        })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [kobiModalOpen])

  // Package strip wheel-to-horizontal-scroll + arrow availability. The
  // native scrollbar is hidden; navigation is via the top-right arrow
  // buttons or the mouse wheel. A single rAF-driven easing loop drives
  // both: each input nudges a `target` scrollLeft, the loop eases the
  // real scrollLeft toward it. This blends consecutive wheel ticks into
  // one continuous glide instead of the discrete jumps a native
  // scrollBy("smooth") chain produces.
  const pkgAnimateToRef = useRef<((delta: number) => void) | null>(null)
  useEffect(() => {
    if (quoteStep !== 1) return
    const el = pkgScrollerRef.current
    if (!el) return

    let target = el.scrollLeft
    let raf = 0

    const tick = () => {
      const current = el.scrollLeft
      const diff = target - current
      if (Math.abs(diff) < 0.4) {
        el.scrollLeft = target
        raf = 0
        return
      }
      el.scrollLeft = current + diff * 0.18
      raf = requestAnimationFrame(tick)
    }

    const animateBy = (delta: number) => {
      const max = el.scrollWidth - el.clientWidth
      const base = raf ? target : el.scrollLeft
      target = Math.max(0, Math.min(max, base + delta))
      if (!raf) raf = requestAnimationFrame(tick)
    }

    pkgAnimateToRef.current = animateBy

    const updateArrows = () => {
      setPkgCanScrollLeft(el.scrollLeft > 1)
      setPkgCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    updateArrows()

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        animateBy(e.deltaY)
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("scroll", updateArrows, { passive: true })
    window.addEventListener("resize", updateArrows)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      pkgAnimateToRef.current = null
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("scroll", updateArrows)
      window.removeEventListener("resize", updateArrows)
    }
  }, [quoteStep])

  const scrollPkgs = (dir: -1 | 1) => {
    const el = pkgScrollerRef.current
    if (!el) return
    const delta = dir * el.clientWidth * 0.6
    if (pkgAnimateToRef.current) {
      pkgAnimateToRef.current(delta)
    } else {
      el.scrollBy({ left: delta, behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Quote Wizard — 4-step pricing tool. Stepper at top, animated
          step content in the middle, Back/Next buttons at the bottom.
          On submit, swaps to a success state. Submission is currently a
          console.log stub; backend wiring (email + admin panel) is a
          follow-up. */}
      <section
        id="teklif"
        className="relative border-t border-black/[0.06] py-12 md:py-16"
      >
        {/* Dekoratif nokta deseni — hakkımızda hero ile aynı dil. Sağ üst
            köşeye yerleşir, container dışına taşar. Mobilde gizli. */}
        <DotPattern
          style={{
            right: "-180px",
            top: "-120px",
            width: "620px",
            height: "620px",
            zIndex: 0,
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
          {(wizardHeading.titleLeader.trim() ||
            wizardHeading.titleHighlight.trim() ||
            wizardHeading.subtitle.trim()) && (
            <div className="mb-8 md:mb-10">
              {(wizardHeading.titleLeader.trim() ||
                wizardHeading.titleHighlight.trim()) && (
                <h2 className="text-[32px] leading-[1.08] tracking-[-0.03em] text-[#0a0a0a] md:text-[48px]">
                  {wizardHeading.titleLeader && (
                    <span className="font-normal">
                      {wizardHeading.titleLeader}{" "}
                    </span>
                  )}
                  {wizardHeading.titleHighlight && (
                    <span className="font-bold text-[#3c639f]">
                      {wizardHeading.titleHighlight}
                    </span>
                  )}
                </h2>
              )}
              {wizardHeading.subtitle && (
                <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-black/60">
                  {wizardHeading.subtitle}
                </p>
              )}
            </div>
          )}

          <div className="quote-card-pulse overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            {quoteSubmitted ? (
              /* ─── Success state — copy admin-managed via /admin/e-posta-sablonlari */
              (() => {
                const channelsStr = quote.channels
                  .map(id => QUOTE_CHANNELS.find(c => c.id === id)?.label)
                  .filter(Boolean)
                  .join(' / ')
                const vars = {
                  name: quote.name,
                  firstName: quote.name.split(' ')[0] ?? quote.name,
                  channels: channelsStr,
                  date: quote.date,
                  time: quote.time,
                }
                const title = fillPlaceholders(successCopy.title, vars)
                const bodyParas = splitParagraphs(
                  fillPlaceholders(successCopy.body, vars),
                )
                return (
                  <div className="flex flex-col items-center px-6 py-16 text-center md:px-12 md:py-20">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3c639f]/[0.08]"
                      style={{ animation: 'quoteSuccessPop 0.6s ease-out' }}
                    >
                      <CheckCircle2
                        size={44}
                        className="text-[#3c639f]"
                        strokeWidth={1.8}
                      />
                    </div>
                    <h3 className="mt-6 text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[32px]">
                      {title}
                    </h3>
                    {bodyParas.map((p, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? 'mt-3 max-w-[480px] whitespace-pre-line text-[15px] leading-relaxed text-black/60'
                            : 'mt-2 max-w-[480px] whitespace-pre-line text-[14px] leading-relaxed text-black/50'
                        }
                      >
                        {p}
                      </p>
                    ))}
                    <button
                      onClick={quoteReset}
                      className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
                    >
                      {successCopy.ctaLabel}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )
              })()
            ) : (
              <>
                {/* ─── Stepper ──────────────────────────────────── */}
                <div className="border-b border-black/[0.06] bg-[#fafafa] px-6 py-5 md:px-10 md:py-7">
                  {/* Mobile-only active-step title. On phones the per-step
                      titles under each circle are hidden to keep the strip
                      compact; this single label keeps the user oriented. */}
                  <div className="mb-4 flex items-baseline justify-between sm:hidden">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3c639f]">
                      Adım {String(quoteStep + 1).padStart(2, "0")}
                      <span className="text-black/30">
                        {" "}
                        / {String(QUOTE_STEPS.length).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                      {QUOTE_STEPS[quoteStep].title}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {QUOTE_STEPS.map((s, i) => {
                      const isActive = i === quoteStep
                      const isDone = i < quoteStep
                      const isLast = i === QUOTE_STEPS.length - 1
                      return (
                        <div
                          key={s.num}
                          className={`flex items-center ${
                            isLast ? 'shrink-0' : 'flex-1'
                          }`}
                        >
                          <div className="flex shrink-0 flex-col items-center">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-all ${
                                isActive
                                  ? 'step-circle-active bg-[#3c639f] text-white'
                                  : isDone
                                  ? 'bg-[#3c639f]/[0.12] text-[#3c639f]'
                                  : 'border border-black/[0.1] bg-white text-black/35'
                              }`}
                            >
                              {isDone ? <Check size={16} strokeWidth={2.5} /> : s.num}
                            </div>
                            <div
                              className={`mt-2 hidden whitespace-nowrap text-[11px] font-medium tracking-[-0.01em] transition-colors sm:block ${
                                isActive
                                  ? 'text-[#0a0a0a]'
                                  : isDone
                                  ? 'text-[#3c639f]'
                                  : 'text-black/40'
                              }`}
                            >
                              {s.title}
                            </div>
                          </div>
                          {!isLast && (
                            <div className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-black/[0.06] sm:mx-3">
                              <div
                                className="h-full bg-[#3c639f] transition-all duration-500 ease-out"
                                style={{ width: i < quoteStep ? '100%' : '0%' }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ─── Step body ────────────────────────────────── */}
                <div className="relative px-6 py-8 md:px-12 md:py-10">
                  <div
                    key={quoteStep}
                    className={
                      quoteDir === 1 ? 'quote-step-fwd' : 'quote-step-bwd'
                    }
                  >
                    {quoteStep === 0 && (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
                        <div className="flex flex-col gap-5">
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Sektörünüz / iş kolunuz{' '}
                              <span className="text-[#3c639f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={quote.industry}
                              onChange={e =>
                                setQuote(p => ({ ...p, industry: e.target.value }))
                              }
                              placeholder="Örn. butik kafe, mimari ofis, online butik..."
                              className="mt-2.5 w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                          <div className="flex flex-col md:flex-1">
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Verdiğiniz hizmetler{' '}
                              <span className="text-[12px] font-normal text-black/45">
                                (kısaca)
                              </span>
                            </label>
                            <textarea
                              value={quote.services}
                              onChange={e =>
                                setQuote(p => ({ ...p, services: e.target.value }))
                              }
                              placeholder="Örn. kahvaltı servisi, tatlı/pasta üretimi, paket servis..."
                              rows={3}
                              className="mt-2.5 w-full resize-none rounded-xl border border-black/[0.1] bg-white px-4 py-3.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08] md:flex-1"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                            Hangi hizmete ihtiyacınız var?{' '}
                            <span className="text-[#3c639f]">*</span>
                          </label>
                          <div className="mt-2.5 flex flex-1 flex-col gap-3">
                            {QUOTE_SERVICES.map(s => {
                              const isSel = quote.service === s.id
                              const Icon = s.Icon
                              const showUrl =
                                s.id === 'redesign' &&
                                isSel &&
                                quote.existingSiteUrl !== ''
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={e => handleServiceSelect(s.id, e)}
                                  className={`relative flex flex-1 items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                                    isSel
                                      ? 'border-[#3c639f]/40 bg-[#3c639f]/[0.04]'
                                      : 'border-black/[0.08] bg-white hover:border-black/[0.18]'
                                  }`}
                                >
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                      isSel
                                        ? 'bg-[#3c639f] text-white'
                                        : 'bg-[#3c639f]/[0.08] text-[#3c639f]'
                                    }`}
                                  >
                                    <Icon size={20} strokeWidth={1.75} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span
                                        className={`text-[15px] font-semibold tracking-[-0.01em] ${
                                          isSel ? 'text-[#0a0a0a]' : 'text-black/80'
                                        }`}
                                      >
                                        {s.label}
                                      </span>
                                      <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${
                                          isSel
                                            ? 'bg-[#3c639f]'
                                            : 'border border-black/[0.2] bg-white'
                                        }`}
                                      >
                                        {isSel && (
                                          <Check
                                            size={13}
                                            strokeWidth={3}
                                            className="text-white"
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <p className="mt-1 text-[13px] leading-relaxed text-black/55">
                                      {s.desc}
                                    </p>
                                    {showUrl && (
                                      <div
                                        className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2"
                                        style={{
                                          border: '1px solid rgba(60,99,159,0.15)',
                                        }}
                                      >
                                        <Globe
                                          size={13}
                                          className="shrink-0 text-[#3c639f]"
                                        />
                                        <span className="truncate text-[12px] font-medium text-[#0a0a0a]">
                                          {quote.existingSiteUrl}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {quoteStep === 1 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-3">
                          <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                            Hangi paket size uygun?{' '}
                            <span className="text-[#3c639f]">*</span>
                            <span className="mt-1 block text-[12px] font-normal text-black/45 md:ml-2 md:mt-0 md:inline">
                              emin değilseniz size yardımcı oluruz
                            </span>
                          </label>
                          {/* Arrows: desktop-only. On touch the user swipes
                              the strip directly — arrows would just take
                              up label width with no real win. */}
                          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                            <button
                              type="button"
                              onClick={() => scrollPkgs(-1)}
                              disabled={!pkgCanScrollLeft}
                              aria-label="Önceki paketler"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#3c639f] transition-all hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:border-black/[0.06] disabled:bg-white disabled:text-black/20"
                            >
                              <ChevronLeft size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollPkgs(1)}
                              disabled={!pkgCanScrollRight}
                              aria-label="Sonraki paketler"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#3c639f] transition-all hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:border-black/[0.06] disabled:bg-white disabled:text-black/20"
                            >
                              <ChevronRight size={16} strokeWidth={2.25} />
                            </button>
                          </div>
                        </div>
                        <div className="quote-pkg-scroll-wrap -mx-6 md:-mx-12">
                          <div
                            ref={pkgScrollerRef}
                            className="quote-pkg-scroll flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-6 md:snap-none md:px-12"
                          >
                            {projectTypes.map(t => {
                              const isSel = quote.projectType === t.id
                              const Icon = QUOTE_ICONS[t.iconKey] ?? Layers
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={e => handleProjectTypeSelect(t.id, e)}
                                  className={`group relative flex shrink-0 grow-0 basis-[86%] snap-center flex-col gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all md:basis-[calc((100%_-_24px)_/_2.5)] ${
                                    isSel
                                      ? 'border-[#3c639f]/40 bg-[#3c639f]/[0.04]'
                                      : 'border-black/[0.08] bg-white hover:border-black/[0.18]'
                                  }`}
                                >
                                  {isSel && (
                                    <div
                                      aria-hidden
                                      className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#3c639f] text-white"
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                  )}
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                        isSel
                                          ? 'bg-[#3c639f] text-white'
                                          : 'bg-[#3c639f]/[0.08] text-[#3c639f]'
                                      }`}
                                    >
                                      <Icon size={20} strokeWidth={1.75} />
                                    </div>
                                    <div className="flex-1 pt-0.5 pr-8">
                                      <div className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                                        {t.label}
                                      </div>
                                      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#3c639f]">
                                        {t.tagline}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[13px] leading-relaxed text-black/60">
                                    {t.desc}
                                  </p>
                                  <ul className="flex flex-col gap-1.5">
                                    {t.bullets.map(b => (
                                      <li
                                        key={b}
                                        className="flex items-start gap-2 text-[12.5px] text-black/65"
                                      >
                                        <Check
                                          size={13}
                                          className="mt-[3px] shrink-0 text-[#3c639f]"
                                          strokeWidth={2.5}
                                        />
                                        <span>{b}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-1 flex items-center gap-2 border-t border-black/[0.06] pt-4">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                                      Karakter
                                    </span>
                                    <span className="text-[15px] font-bold tracking-[-0.01em] text-[#3c639f]">
                                      {t.descriptor}
                                    </span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {quoteStep === 2 && (
                      <div className="flex flex-col gap-7">
                        <div>
                          <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                            Tarzını beğendiğiniz örnek siteler
                            <span className="ml-2 text-[12px] font-normal text-black/45">
                              opsiyonel · en fazla 3
                            </span>
                          </label>
                          <div className="mt-3 flex flex-col gap-2">
                            {[0, 1, 2].map(idx => (
                              <div key={idx} className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-black/35">
                                  {idx + 1}
                                </span>
                                <input
                                  type="url"
                                  value={quote.refs[idx]}
                                  onChange={e => updateRef(idx, e.target.value)}
                                  placeholder="https://ornek-site.com"
                                  className="w-full rounded-xl border border-black/[0.1] bg-white py-3 pl-10 pr-4 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Two textareas side-by-side. Order swapped so the
                            site-comparison question (which follows the
                            URL list above) sits on the left, and the
                            free-form project description is on the right. */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Bu sitelerde ne hoşunuza gidiyor?
                              <span className="ml-2 text-[12px] font-normal text-black/45">
                                opsiyonel
                              </span>
                            </label>
                            <textarea
                              value={quote.refNotes}
                              onChange={e =>
                                setQuote(p => ({
                                  ...p,
                                  refNotes: e.target.value,
                                }))
                              }
                              rows={5}
                              placeholder="Renkler, tipografi, animasyon, akış, içerik düzeni..."
                              className="mt-3 w-full resize-none rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Projenizi kısaca anlatın
                              <span className="ml-2 text-[12px] font-normal text-black/45">
                                opsiyonel
                              </span>
                            </label>
                            <textarea
                              value={quote.description}
                              onChange={e =>
                                setQuote(p => ({
                                  ...p,
                                  description: e.target.value,
                                }))
                              }
                              rows={5}
                              placeholder="Aklınızdaki konsepti, hedefleri, özel istekleri..."
                              className="mt-3 w-full resize-none rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-3 rounded-xl px-4 py-3"
                          style={{
                            background: 'rgba(60, 99, 159, 0.04)',
                            border: '1px solid rgba(60, 99, 159, 0.1)',
                          }}
                        >
                          <Sparkles
                            size={16}
                            className="shrink-0 text-[#3c639f]"
                          />
                          <p className="text-[12.5px] leading-relaxed text-black/65">
                            Bu adım opsiyonel — atlayabilirsiniz, ama doldurursanız
                            tasarım yönümüzü ilk görüşmede çok daha hızlı
                            netleştiririz.
                          </p>
                        </div>
                      </div>
                    )}

                    {quoteStep === 3 && (
                      <div className="flex flex-col gap-7">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Ad Soyad{' '}
                              <span className="text-[#3c639f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={quote.name}
                              onChange={e =>
                                setQuote(p => ({ ...p, name: e.target.value }))
                              }
                              placeholder="Adınız Soyadınız"
                              className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Firma
                              <span className="ml-2 text-[12px] font-normal text-black/45">
                                opsiyonel
                              </span>
                            </label>
                            <input
                              type="text"
                              value={quote.company}
                              onChange={e =>
                                setQuote(p => ({ ...p, company: e.target.value }))
                              }
                              placeholder="Şirket adı"
                              className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              E-posta{' '}
                              <span className="text-[#3c639f]">*</span>
                            </label>
                            <input
                              type="email"
                              value={quote.email}
                              onChange={e =>
                                setQuote(p => ({ ...p, email: e.target.value }))
                              }
                              placeholder="siz@firma.com"
                              className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                          <div>
                            <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                              Telefon{' '}
                              <span className="text-[#3c639f]">*</span>
                            </label>
                            <input
                              type="tel"
                              value={quote.phone}
                              onChange={e =>
                                setQuote(p => ({ ...p, phone: e.target.value }))
                              }
                              placeholder="+90 5XX XXX XX XX"
                              className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                            Sizinle nasıl iletişime geçelim?{' '}
                            <span className="text-[#3c639f]">*</span>
                            <span className="ml-2 text-[12px] font-normal text-black/45">
                              birden fazla seçebilirsiniz
                            </span>
                          </label>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {/* Combined WhatsApp + Telefon — single button
                                that selects both channels together. White
                                by default; on hover and when selected,
                                background fades from WhatsApp green to
                                brand blue. */}
                            <button
                              type="button"
                              onClick={toggleWaPhone}
                              className={`wa-phone-combo flex h-[52px] items-center justify-center gap-3 rounded-xl border text-[14px] font-semibold transition-all sm:col-span-2 ${
                                isWaPhoneSelected ? 'wa-phone-combo-active' : ''
                              }`}
                            >
                              <WhatsAppIcon size={18} />
                              <span>WhatsApp ya da Telefon</span>
                              <Phone size={16} strokeWidth={2.2} />
                            </button>

                            {/* Email — solo button on the right */}
                            <button
                              type="button"
                              onClick={() => toggleChannel('email')}
                              style={
                                quote.channels.includes('email')
                                  ? {
                                      backgroundColor: '#3c639f',
                                      borderColor: '#3c639f',
                                      boxShadow:
                                        '0 2px 12px -2px rgba(60,99,159,0.4)',
                                      color: '#ffffff',
                                    }
                                  : undefined
                              }
                              className={`flex h-[52px] items-center justify-center gap-2 rounded-xl border text-[14px] font-semibold transition-all ${
                                quote.channels.includes('email')
                                  ? ''
                                  : 'border-black/[0.1] bg-white text-[#3c639f] hover:border-[#3c639f]/40'
                              }`}
                            >
                              <Mail size={16} strokeWidth={2.2} />
                              E-posta
                            </button>
                          </div>
                        </div>

                        {/* Date + Time — only appear when WhatsApp/Phone
                            is one of the selected channels. E-posta-only
                            requests don't need a callback slot so we
                            collapse the section. grid-rows trick smoothly
                            expands. */}
                        <div
                          className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                            quote.channels.includes('whatsapp') ||
                            quote.channels.includes('phone')
                              ? 'grid-rows-[1fr]'
                              : 'grid-rows-[0fr]'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="flex flex-col gap-7 pt-1">
                              {/* Date picker — 14-day horizontal chip strip */}
                              <div>
                                <label className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                                  <Calendar size={15} className="text-[#3c639f]" />
                                  Hangi gün müsaitsiniz?{' '}
                                  <span className="text-[#3c639f]">*</span>
                                </label>
                                <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-hide">
                                  {next14Days.map(d => {
                                    const isSel = quote.date === d.iso
                                    return (
                                      <button
                                        key={d.iso}
                                        type="button"
                                        onClick={() =>
                                          setQuote(p => ({ ...p, date: d.iso }))
                                        }
                                        className={`flex min-w-[72px] shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all ${
                                          isSel
                                            ? 'border-[#3c639f] bg-[#3c639f] text-white shadow-[0_4px_12px_-2px_rgba(60,99,159,0.35)]'
                                            : 'border-black/[0.08] bg-white hover:border-[#3c639f]/40'
                                        }`}
                                      >
                                        <span
                                          className={`text-[10px] font-medium uppercase tracking-[0.06em] ${
                                            isSel ? 'text-white/75' : 'text-black/45'
                                          }`}
                                        >
                                          {d.isToday
                                            ? 'Bugün'
                                            : d.isTomorrow
                                              ? 'Yarın'
                                              : d.dayName}
                                        </span>
                                        <span
                                          className={`text-[22px] font-bold leading-none tracking-[-0.02em] ${
                                            isSel ? 'text-white' : 'text-[#0a0a0a]'
                                          }`}
                                        >
                                          {d.dayNum}
                                        </span>
                                        <span
                                          className={`text-[10px] ${
                                            isSel ? 'text-white/75' : 'text-black/45'
                                          }`}
                                        >
                                          {d.monthShort}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Time picker — 30-min slot chips */}
                              <div>
                                <label className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                                  <Clock size={15} className="text-[#3c639f]" />
                                  Saat aralığı{' '}
                                  <span className="text-[#3c639f]">*</span>
                                </label>
                                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-7">
                                  {visibleTimeSlots.map(t => {
                                    const isSel = quote.time === t
                                    return (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={() =>
                                          setQuote(p => ({ ...p, time: t }))
                                        }
                                        className={`rounded-lg border py-2.5 text-[13px] font-medium transition-all ${
                                          isSel
                                            ? 'border-[#3c639f] bg-[#3c639f] text-white shadow-[0_2px_8px_-2px_rgba(60,99,159,0.35)]'
                                            : 'border-black/[0.08] bg-white text-black/70 hover:border-[#3c639f]/40 hover:text-[#0a0a0a]'
                                        }`}
                                      >
                                        {t}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <FormConsent
                          pages={legalPages}
                          checked={consent}
                          onChange={setConsent}
                        />

                        {quoteError && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
                            {quoteError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Navigation ───────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#fafafa] px-4 py-4 md:px-10 md:py-5">
                  <button
                    type="button"
                    onClick={quoteBack}
                    disabled={quoteStep === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-black/65 transition-all hover:bg-white hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent md:gap-2 md:px-4"
                  >
                    <ArrowLeft size={16} />
                    Geri
                  </button>
                  {/* Step counter — hidden on phones (the stepper already
                      shows Adım NN / NN at the top), kept on tablet+. */}
                  <div className="hidden text-[12px] font-medium tracking-[0.04em] text-black/40 sm:block">
                    Adım {quoteStep + 1} / {QUOTE_STEPS.length}
                  </div>
                  <button
                    type="button"
                    onClick={quoteNext}
                    disabled={!isQuoteStepValid(quoteStep) || submitPending}
                    className="cta-primary relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-3 text-[14px] font-semibold tracking-[-0.005em] sm:flex-none sm:py-2.5"
                  >
                    <span className="relative z-[1] inline-flex items-center gap-2">
                      {quoteStep === QUOTE_STEPS.length - 1
                        ? submitPending
                          ? 'Gönderiliyor...'
                          : 'Gönder'
                        : 'Devam'}
                      {!submitPending && <ArrowRight size={16} />}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quote wizard popups — portaled to body, anchored just below the
          clicked card (like the testimonial popups). Lightweight backdrop
          dismisses on click-out. */}
      {redesignModalOpen &&
        redesignAnchor &&
        typeof window !== 'undefined' &&
        createPortal(
          <>
            <div
              onClick={() => setRedesignModalOpen(false)}
              className="fixed inset-0 z-[99]"
              style={{ animation: 'modalBackdropIn 0.2s ease-out' }}
            >
              <div aria-hidden className="absolute inset-0 bg-black/15" />
            </div>
            <div
              ref={redesignModalRef}
              role="dialog"
              aria-modal="true"
              className="wizard-sheet absolute z-[100] w-[360px] max-w-[calc(100vw-24px)] overflow-visible rounded-2xl bg-white"
              style={{
                top: redesignAnchor.top,
                left: redesignAnchor.left,
                transform: 'translateX(-50%)',
                boxShadow:
                  '0 8px 32px -4px rgba(60,99,159,0.12), 0 24px 64px -12px rgba(60,99,159,0.18)',
                border: '0.5px solid rgba(0,0,0,0.08)',
                animation: 'modalCardIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Mobile-only grab handle for the bottom sheet */}
              <div aria-hidden className="wizard-sheet-grab" />
              {/* Arrow pointing up to the source card (desktop only) */}
              <div
                aria-hidden
                className="wizard-sheet-arrow absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
                style={{
                  borderTop: '0.5px solid rgba(0,0,0,0.08)',
                  borderLeft: '0.5px solid rgba(0,0,0,0.08)',
                }}
              />
              <button
                type="button"
                onClick={() => setRedesignModalOpen(false)}
                aria-label="Kapat"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black/70"
              >
                <X size={16} />
              </button>
              <div className="px-6 pb-5 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3c639f]/[0.08]">
                  <Globe
                    size={18}
                    className="text-[#3c639f]"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                  Mevcut sitenizin linkini girin
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-black/55">
                  Mevcut sitenizi inceleyip neyi koruyup neyi modernize
                  edeceğimize karar verebilmemiz için linkinizi paylaşın.
                </p>
                <input
                  type="url"
                  autoFocus
                  value={redesignDraftUrl}
                  onChange={e => setRedesignDraftUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRedesignConfirm()
                  }}
                  placeholder="https://www.firmaadresi.com"
                  className="mt-4 w-full rounded-lg border border-black/[0.1] bg-white px-3.5 py-2.5 text-[13.5px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
                />
                <div className="mt-4 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRedesignModalOpen(false)}
                    className="rounded-lg px-3 py-2 text-[13px] font-medium text-black/60 transition-colors hover:bg-black/[0.04]"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleRedesignConfirm}
                    disabled={redesignDraftUrl.trim() === ''}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#3c639f] px-4 py-2 text-[13px] font-medium text-white shadow-[0_4px_12px_-2px_rgba(60,99,159,0.35)] transition-all hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:bg-black/15 disabled:shadow-none"
                  >
                    Onayla
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}

      {kobiModalOpen &&
        kobiAnchor &&
        typeof window !== 'undefined' &&
        createPortal(
          <>
            <div
              onClick={() => setKobiModalOpen(false)}
              className="fixed inset-0 z-[99]"
              style={{ animation: 'modalBackdropIn 0.2s ease-out' }}
            >
              <div aria-hidden className="absolute inset-0 bg-black/15" />
            </div>
            <div
              ref={kobiModalRef}
              role="dialog"
              aria-modal="true"
              className="wizard-sheet absolute z-[100] w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl bg-white"
              style={{
                top: kobiAnchor.top,
                left: kobiAnchor.left,
                transform: 'translateX(-50%)',
                boxShadow:
                  '0 8px 32px -4px rgba(60,99,159,0.12), 0 24px 64px -12px rgba(60,99,159,0.18)',
                animation: 'modalCardIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Mobile-only grab handle (sits on the blue header) */}
              <div aria-hidden className="wizard-sheet-grab wizard-sheet-grab--on-dark" />
              {/* Arrow pointing up to the source card (desktop only) */}
              <div
                aria-hidden
                className="wizard-sheet-arrow absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 z-10"
                style={{ background: '#3c639f' }}
              />
              <button
                type="button"
                onClick={() => setKobiModalOpen(false)}
                aria-label="Kapat"
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X size={16} />
              </button>
              {/* Branded header band */}
              <div
                className="relative overflow-hidden px-6 py-5 text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #3c639f 0%, #2f5288 100%)',
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-0 h-24 w-24"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                  }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Sparkles size={18} strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">
                  Webreta KOBİ&apos;yi de tavsiye ederiz!
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">
                  Küçük ve orta ölçekli işletmeler için tasarlanmış, daha hızlı
                  ve daha uygun fiyatlı kurumsal site çözümlerimiz var.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setKobiModalOpen(false)}
                  className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-black/60 transition-colors hover:bg-black/[0.04] hover:text-[#0a0a0a]"
                >
                  Bu pakette devam et
                </button>
                <a
                  href={WEBRETA_KOBI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3c639f] px-4 py-2 text-[13px] font-medium text-white shadow-[0_4px_12px_-2px_rgba(60,99,159,0.35)] transition-all hover:bg-[#2f5288]"
                >
                  Webreta KOBİ
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* Quote wizard styles — kept local so the component works on any
          page. Includes step transitions, success pop, stepper pulse,
          package strip scrollbar hide, modal entrance, and WhatsApp/
          Phone combo button. */}
      <style jsx global>{`
        /* Quote wizard — step body slide+fade. Direction class determines
           which side the new step enters from. Keyed remount on step
           change retriggers the animation. */
        .quote-step-fwd {
          animation: quoteStepFwd 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .quote-step-bwd {
          animation: quoteStepBwd 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes quoteStepFwd {
          0% { opacity: 0; transform: translateX(28px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes quoteStepBwd {
          0% { opacity: 0; transform: translateX(-28px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes quoteSuccessPop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .quote-step-fwd, .quote-step-bwd { animation: none; }
        }
        /* Hide scrollbar on the date chip strip — keeps the picker clean
           on desktop where the scrollbar would otherwise show below. */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Quote wizard — soft breathing shadow on the white card. Adds
           gentle "alive" energy without movement; slow enough not to
           distract. Drops to a static shadow under reduced motion. */
        .quote-card-pulse {
          box-shadow:
            0 1px 2px rgba(60,99,159,0.04),
            0 24px 60px -20px rgba(60,99,159,0.18),
            0 4px 16px -4px rgba(60,99,159,0.06);
          animation: quoteCardPulse 6s ease-in-out infinite;
        }
        @keyframes quoteCardPulse {
          0%, 100% {
            box-shadow:
              0 1px 2px rgba(60,99,159,0.04),
              0 24px 60px -20px rgba(60,99,159,0.18),
              0 4px 16px -4px rgba(60,99,159,0.06);
          }
          50% {
            box-shadow:
              0 1px 2px rgba(60,99,159,0.06),
              0 30px 84px -16px rgba(60,99,159,0.32),
              0 6px 22px -4px rgba(60,99,159,0.14);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .quote-card-pulse { animation: none; }
        }

        /* Stepper active circle — soft pulsing ring radiating outward.
           Cycles every 2.4s, fades to fully transparent so the static
           drop shadow stays as the resting state. */
        .step-circle-active {
          box-shadow:
            0 4px 12px -2px rgba(60,99,159,0.35),
            0 0 0 0 rgba(60,99,159,0.45);
          animation: stepCirclePulse 2.4s ease-out infinite;
        }
        @keyframes stepCirclePulse {
          0% {
            box-shadow:
              0 4px 12px -2px rgba(60,99,159,0.35),
              0 0 0 0 rgba(60,99,159,0.45);
          }
          70% {
            box-shadow:
              0 4px 12px -2px rgba(60,99,159,0.35),
              0 0 0 10px rgba(60,99,159,0);
          }
          100% {
            box-shadow:
              0 4px 12px -2px rgba(60,99,159,0.35),
              0 0 0 10px rgba(60,99,159,0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .step-circle-active { animation: none; }
        }

        /* Quote wizard — package picker horizontal strip. Scrollbar is
           hidden; user navigates with the top-right arrow buttons or by
           rotating the mouse wheel (a wheel listener converts deltaY to
           horizontal scroll). Touch and drag still work natively. */
        .quote-pkg-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .quote-pkg-scroll::-webkit-scrollbar {
          display: none;
        }
        /* Quote wizard modals — backdrop fade and card scale-in entrance. */
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalCardIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-6px) scale(0.96); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        /* Mobile bottom-sheet mode for wizard popups. On phones the
           card-anchored popups become a fixed sheet docked to the bottom
           of the viewport: full width, rounded top corners, slide-up
           entrance. Hides the desktop arrow indicator and shows a small
           grab handle instead, matching the iOS/Android sheet pattern. */
        .wizard-sheet-grab {
          display: none;
        }
        @media (max-width: 767px) {
          .wizard-sheet {
            position: fixed !important;
            top: auto !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
            border-radius: 22px 22px 0 0 !important;
            animation: sheetSlideUp 0.34s cubic-bezier(0.22, 1, 0.36, 1) !important;
            box-shadow: 0 -8px 32px -4px rgba(0, 0, 0, 0.12),
              0 -24px 64px -12px rgba(60, 99, 159, 0.18) !important;
            max-height: 92vh;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .wizard-sheet-arrow {
            display: none !important;
          }
          .wizard-sheet-grab {
            display: block;
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 38px;
            height: 4px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.18);
            z-index: 20;
          }
          .wizard-sheet-grab--on-dark {
            background: rgba(255, 255, 255, 0.45);
          }
        }
        @keyframes sheetSlideUp {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @media (max-width: 767px) {
            .wizard-sheet {
              animation: none !important;
            }
          }
        }
        /* Combined WhatsApp + Telefon channel button. White by default,
           soft green→blue gradient on hover; full vibrant gradient when
           selected. The active state keeps the gradient on hover too. */
        .wa-phone-combo {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.7);
          background-image: linear-gradient(
            90deg,
            #25D366 0%,
            #3c639f 100%
          );
          background-size: 100% 100%;
          background-position: center;
          background-clip: padding-box;
          background-origin: border-box;
          background: #ffffff;
        }
        .wa-phone-combo:hover {
          background: linear-gradient(
            90deg,
            rgba(37, 211, 102, 0.92) 0%,
            rgba(60, 99, 159, 0.92) 100%
          );
          border-color: transparent;
          color: #ffffff;
        }
        .wa-phone-combo-active {
          background: linear-gradient(90deg, #25D366 0%, #3c639f 100%);
          border-color: transparent;
          color: #ffffff;
          box-shadow: 0 2px 12px -2px rgba(60, 99, 159, 0.4);
        }
        .wa-phone-combo-active:hover {
          background: linear-gradient(90deg, #25D366 0%, #3c639f 100%);
        }
      `}</style>
    </>
  )
}
