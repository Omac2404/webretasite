"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowRight, Menu, X, Star, Check, ExternalLink } from "lucide-react"
import Image from "next/image"
import { createPortal } from "react-dom"

// 20 testimonials with varied lengths (6 short, 8 medium, 6 long)
const testimonials = [
  {
    text: "Şehir merkezindeki kafemiz için sıfırdan yeni bir site yaptırdık. Online sipariş ve rezervasyon sistemi hayatımızı kolaylaştırdı, paket servis siparişlerimiz neredeyse iki katına çıktı. Menüyü tek tıkla güncelleyebilmek de büyük artı, ekibimiz çok memnun.",
    name: "Ayşe Kaya",
    role: "Kafe İşletmecisi",
    initials: "AK",
    date: "12 Mart 2025",
  },
  {
    text: "Hukuk büromuzun eski sitesi hem yavaştı hem güvensiz görünüyordu. Webreta ekibi kurumsal kimliğimize uygun, son derece şık ve hızlı bir site teslim etti. Online danışmanlık talep formu sayesinde potansiyel müvekkillerimizden gelen başvurular belirgin şekilde arttı.",
    name: "Av. Zeynep Mert",
    role: "Avukat",
    initials: "ZM",
    date: "28 Şubat 2025",
  },
  {
    text: "Muayenehanemiz için randevu ve hasta takip sistemini birlikte kurguladık. Hastalarımız artık siteden randevu alıyor, SMS ve e-posta hatırlatmaları otomatik gidiyor. Randevu kaçırma oranımız çarpıcı şekilde düştü, günlük operasyon yükümüz çok hafifledi.",
    name: "Dr. Elif Aydın",
    role: "Diş Hekimi",
    initials: "EA",
    date: "15 Şubat 2025",
  },
  {
    text: "Mimari portföy sitemiz için çalıştık ve sonuç beklediğimden çok daha iyi oldu. Projelerimizi tam istediğimiz şekilde sergiliyoruz; minimalist tasarım, hızlı yükleme süresi ve mobil uyumluluk müşterilerin dikkatini çekiyor. Teklif taleplerimiz ilk aydan itibaren arttı.",
    name: "Mimar Ahmet Sönmez",
    role: "Mimari Ofis",
    initials: "AS",
    date: "3 Şubat 2025",
  },
  {
    text: "E-ticaret sitemizi sıfırdan kurdular, ödeme entegrasyonları ve kargo takibi sorunsuz işliyor. SEO çalışması da paketin parçasıydı; üç ay içinde organik trafiğimiz üç katına çıktı. Yeni müşteri kazanım maliyetimiz ciddi şekilde düştü, kesinlikle tavsiye ediyorum.",
    name: "Kerem Bilgin",
    role: "E-ticaret İşletmecisi",
    initials: "KB",
    date: "20 Ocak 2025",
  },
  {
    text: "Lojistik firmamızın eski sitesi gerçekten yavaştı, mobilde neredeyse kullanılamaz haldeydi. Yeni site Lighthouse skoru 95'in üzerinde, tüm formlar hatasız çalışıyor. Müşterilerimizden 'siteniz çok güzel olmuş' yorumlarını almak bizi de motive ediyor.",
    name: "Mehmet Demir",
    role: "Lojistik Yöneticisi",
    initials: "MD",
    date: "8 Ocak 2025",
  },
  {
    text: "Veteriner kliniğimiz için online randevu sistemi kurduk. Evcil hayvan sahipleri kendi takvimlerinden randevu seçebiliyor, aşı ve check-up hatırlatmaları otomatik gidiyor. Hem bizim hem müşterilerimizin işi kolaylaştı, klinik telefon trafiğimiz yarı yarıya azaldı.",
    name: "Dr. Canan Bozkurt",
    role: "Veteriner Hekim",
    initials: "CB",
    date: "22 Aralık 2024",
  },
  {
    text: "Butik otelimiz için sıfırdan bir rezervasyon platformu kurduk. Direkt rezervasyonlarımız altı ayda yüzde elli arttı, üçüncü taraf platformlara ödediğimiz komisyondan ciddi tasarruf sağladık. Fotoğraf galerisi ve oda detayları misafirlerimizden çok olumlu geri dönüş alıyor.",
    name: "Deniz Kılıç",
    role: "Otel İşletmecisi",
    initials: "DK",
    date: "10 Aralık 2024",
  },
  {
    text: "Sigorta acentemiz için müşteri portalı yaptırdık. Müşteriler poliçelerini online görüntüleyebiliyor, yenileme hatırlatmaları ve hasar bildirimi tamamen site üzerinden yapılabiliyor. Operasyon yükümüz büyük ölçüde azaldı, müşteri memnuniyetimiz fark edilebilir şekilde yükseldi.",
    name: "Serkan Mutlu",
    role: "Sigorta Acentesi",
    initials: "SM",
    date: "28 Kasım 2024",
  },
  {
    text: "Eğitim kurumumuzun online ders ve öğrenci portalı için Webreta ile çalıştık. Video ders entegrasyonu, ödev ve sınav takibi tek panelden yönetiliyor. Veliler de çocuklarının durumunu canlı görebiliyor. Pandemi sonrası hibrit eğitimimizin omurgası bu sistem oldu.",
    name: "Aylin Polat",
    role: "Eğitim Kurumu Müdürü",
    initials: "AP",
    date: "15 Kasım 2024",
  },
  {
    text: "Hem mağaza içi hem online satış yapabildiğimiz entegre bir sistem kurdular. Stok yönetimi ortak veritabanından geçiyor, kargo süreçleri otomatik akıyor. Müşteri segmentasyonu sayesinde hedefli kampanyalar yapabiliyoruz; satışlarımızda hissedilir bir artış var.",
    name: "Tolga Vural",
    role: "Mağaza Sahibi",
    initials: "TV",
    date: "2 Kasım 2024",
  },
  {
    text: "Oto servisimiz için araç takip ve fotoğraflı durum raporlama sistemi geliştirdiler. Müşterilerimiz aracının hangi aşamada olduğunu canlı görebiliyor; bu şeffaflık güven yarattı, tavsiye ile gelen yeni müşteri oranımız ciddi şekilde arttı. Personelimiz sistemi hızlı benimsedi.",
    name: "Okan Rençber",
    role: "Oto Servis Sahibi",
    initials: "OR",
    date: "18 Ekim 2024",
  },
  {
    text: "Güzellik salonumuza online randevu sistemi kuruldu; müşteriler personel ve hizmet seçimini kendileri yapıp uygun saati alabiliyor. SMS ve WhatsApp hatırlatmaları otomatik gidiyor. Telefon trafiğimiz çok azaldı, biz salondaki müşterimize odaklanabiliyoruz. Tasarım da çok şık oldu.",
    name: "Elif Nazlı",
    role: "Güzellik Salonu",
    initials: "EN",
    date: "5 Ekim 2024",
  },
  {
    text: "Çiçekçimiz için online sipariş ve teslimat takip sistemi yaptılar. İlçe bazlı teslimat alanı seçimi ve özel gün rezervasyonu sayesinde özel günlerde sipariş hacmimiz üç katına çıktı. Ödeme entegrasyonu kusursuz çalışıyor, müşterilerimiz mobilden rahatça sipariş veriyor.",
    name: "Gamze Yılmaz",
    role: "Çiçekçi",
    initials: "GY",
    date: "22 Eylül 2024",
  },
  {
    text: "Kuru temizleme zincirimiz için sipariş ve teslimat takip sistemi kurdular. Müşteriler siparişlerinin hangi aşamada olduğunu görebiliyor, hazır olunca otomatik SMS gidiyor. İş akışımız belirgin şekilde düzenlendi, kayıp ürün yakınmalarımız neredeyse tamamen ortadan kalktı.",
    name: "Mustafa Eren",
    role: "Kuru Temizleme",
    initials: "ME",
    date: "8 Eylül 2024",
  },
  {
    text: "Spor salonumuz için üyelik ve ders rezervasyon sistemini birlikte kurguladık. Üyeler ders programını görebiliyor, sınıf kontenjanına göre rezervasyon yapabiliyor. Ödeme takibi otomatik akıyor. Salondaki personel iş yükümüz dramatik şekilde azaldı, üye memnuniyetimiz arttı.",
    name: "Emre Tan",
    role: "Spor Salonu",
    initials: "ET",
    date: "25 Ağustos 2024",
  },
  {
    text: "Mobilya mağazamız için 3D görselli ürün kataloğu ve sipariş sistemi yaptılar. Müşteriler ürünü canlı ölçülerle inceleyip varyasyonları görebiliyor. Online katalog ziyaretleri mağaza ziyaretlerini de besledi, ortalama sepet tutarımızın yükseldiğini net olarak görüyoruz.",
    name: "Burcu Aksu",
    role: "Mobilya Mağazası",
    initials: "BA",
    date: "12 Ağustos 2024",
  },
  {
    text: "Emlak ofisimiz için harita entegrasyonlu, gelişmiş filtrelemeli ilan sistemi kuruldu. Sanal tur ve 360 derece fotoğraf desteği müşterilerimizin ilgisini çok çekiyor. Admin paneli o kadar kullanışlı ki personelimiz ilan ekleme süresini yarı yarıya düşürdü. Rakiplerden öndeyiz.",
    name: "Hakan Sezer",
    role: "Emlak Danışmanı",
    initials: "HS",
    date: "30 Temmuz 2024",
  },
  {
    text: "Danışmanlık firmamızın kurumsal sitesi için çalıştık. Profesyonel, sade ve oldukça hızlı bir site teslim ettiler. Online randevu formu, blog modülü ve SEO çalışması paket halinde geldi; Google'da hedeflediğimiz anahtar kelimelerde ilk sayfaya çıktık, organik trafiğimiz katlandı.",
    name: "Burak Yıldız",
    role: "Yönetim Danışmanı",
    initials: "BY",
    date: "15 Haziran 2024",
  },
  {
    text: "Huzurevimizin hem ailelere bilgilendirme hem yeni başvurular için bir sitesi yoktu. Webreta ekibi tüm süreci profesyonelce yönetti; sakinlerimizin yakınları artık günlük etkinlikleri siteden takip edebiliyor. Yeni başvurular da formlar üzerinden geliyor, telefon yükümüz azaldı.",
    name: "Aylin Öz",
    role: "Huzurevi Yöneticisi",
    initials: "AÖ",
    date: "3 Mayıs 2024",
  },
]

const typewriterWords = [
  { text: "düşünürüz", holdDuration: 2000 },
  { text: "tasarlarız", holdDuration: 2000 },
  { text: "problemi çözeriz", holdDuration: 4000, showCheck: true },
]

// Google "G" icon component (for summary card - 24px)
function GoogleIconMedium() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// Google "G" icon component (small for cards - 16px)
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// Hook to detect mobile/touch devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none)')
    setIsMobile(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isMobile
}

// Typewriter Hook
function useTypewriter() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingIn, setIsTypingIn] = useState(true)
  const [showCheckIcon, setShowCheckIcon] = useState(false)

  useEffect(() => {
    const currentWord = typewriterWords[wordIndex]
    const fullText = currentWord.text

    let timeout: NodeJS.Timeout

    if (isTypingIn) {
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1))
        }, 35)
      } else {
        if (currentWord.showCheck) {
          timeout = setTimeout(() => {
            setShowCheckIcon(true)
          }, 150)
        }
        timeout = setTimeout(() => {
          setShowCheckIcon(false)
          setIsTypingIn(false)
        }, currentWord.holdDuration)
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, 25)
      } else {
        setWordIndex((prev) => (prev + 1) % typewriterWords.length)
        setIsTypingIn(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayedText, isTypingIn, wordIndex])

  return { displayedText, showCheckIcon, wordIndex }
}

// Slot-based opacity: the focused slot is slot 1 (second from top), not slot 0.
// Slot is computed as (index - currentIndex), so slot 0 is the topmost visible
// card (currently sliding off), slot 1 is the spotlight, slot 2+ fade away.
function getCardOpacity(slot: number): number {
  if (slot === 1) return 1     // focused — second from top
  if (slot === 0) return 0.55  // top — sliding off, dimmed for contrast
  if (slot === 2) return 0.7   // third
  if (slot === 3) return 0.4   // fourth, sitting in bottom mask fade
  return 0.15                  // off-screen
}

// Testimonial Card Component
function TestimonialCard({
  testimonial,
  isFocused,
  opacity,
  isHovered,
  isMobile,
  onMouseEnter,
  onMouseLeave,
  onClick,
  cardRef,
}: {
  testimonial: typeof testimonials[0]
  isFocused: boolean
  opacity: number
  isHovered: boolean
  isMobile: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  cardRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={cardRef}
      className="box-border cursor-pointer rounded-xl px-4 py-4"
      style={{
        opacity: isHovered ? 1 : opacity,
        transform: isFocused ? 'scale(1.06)' : 'scale(1)',
        transformOrigin: 'center',
        background: '#ffffff',
        // Borders — focused card carries a clearly visible brand-tinted edge.
        border: isHovered
          ? '1px solid rgba(60, 99, 159, 0.30)'
          : isFocused
            ? '1px solid rgba(60, 99, 159, 0.20)'
            : '0.5px solid rgba(0, 0, 0, 0.04)',
        // Diffuse multi-layer shadows tuned to fade to near-zero alpha within
        // the container's horizontal breathing room (~48px on desktop), so
        // edges never appear hard-cut. Focused state gets a noticeably
        // stronger halo to make the spotlight unmistakable.
        boxShadow: isHovered
          ? '0 2px 4px 0 rgba(60, 99, 159, 0.08), 0 8px 20px -1px rgba(60, 99, 159, 0.16), 0 20px 44px -8px rgba(60, 99, 159, 0.18), 0 36px 76px -20px rgba(15, 23, 42, 0.12)'
          : isFocused
            ? '0 1px 3px 0 rgba(60, 99, 159, 0.06), 0 6px 16px -1px rgba(60, 99, 159, 0.14), 0 16px 36px -6px rgba(60, 99, 159, 0.16), 0 28px 60px -16px rgba(15, 23, 42, 0.12)'
            : '0 1px 2px 0 rgba(15, 23, 42, 0.02), 0 3px 10px -1px rgba(15, 23, 42, 0.04), 0 10px 24px -6px rgba(15, 23, 42, 0.05)',
        transition:
          'opacity 300ms ease-out, transform 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease-out, border-color 200ms ease-out',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Top row - Stars and Google icon */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className="fill-[#FBBC04] text-[#FBBC04]"
            />
          ))}
        </div>
        <GoogleIcon />
      </div>

      {/* Testimonial text. Truncation is rendered differently per device:
          desktop ends with "..." (popup opens on hover); mobile replaces the
          ellipsis with an inline "devamını gör" link (the only popup trigger
          on touch devices — tapping the card body is intentionally a no-op). */}
      <p className="mt-3 text-[13px] leading-[1.5] text-black/75">
        {testimonial.text.length > 120
          ? testimonial.text.slice(0, 120)
          : testimonial.text}
        {testimonial.text.length > 120 &&
          (isMobile ? (
            <>
              {' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
                className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[#3c639f] hover:text-[#2f5288] active:text-[#2f5288]"
              >
                devamını gör
              </button>
            </>
          ) : (
            '...'
          ))}
      </p>

      {/* Bottom row - Avatar and name */}
      <div className="mt-3 flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3c639f]/10 text-[12px] font-medium text-[#3c639f]">
          {testimonial.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-[#0a0a0a]">
            {testimonial.name}
          </div>
          <div className="truncate text-[11px] text-black/50">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  )
}

// Testimonial Popup Component
function TestimonialPopup({
  testimonial,
  position,
  isMobile,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  testimonial: typeof testimonials[0]
  position: { left: number; top: number } | null
  isMobile: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  if (!mounted) return null

  const popupWidth = 360
  const isMobileLayout = isMobile || !position

  const popupContent = isMobileLayout ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        style={{ opacity: isVisible ? 1 : 0 }}
      />

      <div
        className="relative mx-auto flex w-full flex-col rounded-xl bg-white p-5"
        style={{
          maxWidth: `${popupWidth}px`,
          maxHeight: '70vh',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 150ms ease-out, transform 150ms ease-out',
        }}
      >
        {/* Top: stars (left) + X close (right). On mobile the close button
            replaces the Google icon that previously sat here — the icon is
            moved to the bottom-right corner. */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#FBBC04] text-[#FBBC04]" />
            ))}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/80 active:bg-black/10"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="mt-4 flex-1 overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(60, 99, 159, 0.3) transparent' }}
        >
          <p className="text-[15px] leading-[1.6] text-black/80">{testimonial.text}</p>
        </div>

        <div className="mt-4 flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3c639f]/10 text-[13px] font-medium text-[#3c639f]">
            {testimonial.initials}
          </div>
          <div>
            <div className="text-[14px] font-medium text-[#0a0a0a]">{testimonial.name}</div>
            <div className="text-[12px] text-black/50">{testimonial.role}</div>
          </div>
        </div>

        <div className="mt-3 shrink-0 text-[12px] text-black/40">{testimonial.date}</div>
        <div className="my-4 h-px shrink-0 bg-black/[0.08]" />

        {/* Bottom: Google review link, right-aligned with the G icon at the
            rightmost position — visually anchors the bottom-right corner. */}
        <a
          href="#"
          className="ml-auto inline-flex shrink-0 items-center gap-2 text-[14px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
        >
          {"Google'da görüntüle"}
          <GoogleIcon />
        </a>
      </div>
    </div>
  ) : (
    <div
      className="fixed z-[100]"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateY(-50%)',
        width: `${popupWidth}px`,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 150ms ease-out, top 200ms ease-out, left 200ms ease-out',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="relative flex flex-col rounded-xl bg-white p-5"
        style={{
          maxHeight: '400px',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div
          className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rotate-45 bg-white"
          style={{ border: '0.5px solid rgba(0, 0, 0, 0.08)', borderLeft: 'none', borderBottom: 'none' }}
        />

        <div className="flex shrink-0 items-center justify-between">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#FBBC04] text-[#FBBC04]" />
            ))}
          </div>
          <GoogleIcon />
        </div>

        <div
          className="mt-4 flex-1 overflow-y-auto pr-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(60, 99, 159, 0.3) transparent' }}
        >
          <p className="text-[15px] leading-[1.6] text-black/80">{testimonial.text}</p>
        </div>

        <div className="mt-4 flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3c639f]/10 text-[13px] font-medium text-[#3c639f]">
            {testimonial.initials}
          </div>
          <div>
            <div className="text-[14px] font-medium text-[#0a0a0a]">{testimonial.name}</div>
            <div className="text-[12px] text-black/50">{testimonial.role}</div>
          </div>
        </div>

        <div className="mt-3 shrink-0 text-[12px] text-black/40">{testimonial.date}</div>
        <div className="my-4 h-px shrink-0 bg-black/[0.08]" />

        <a href="#" className="inline-flex shrink-0 items-center gap-2 text-[14px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]">
          <GoogleIcon />
          {"Google'da görüntüle"}
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )

  return createPortal(popupContent, document.body)
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tappedIndex, setTappedIndex] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { displayedText, showCheckIcon } = useTypewriter()
  const isMobile = useIsMobile()

  // Card dimensions - 16px consistent gap
  const CARD_HEIGHT = 150
  const CARD_GAP = 16
  const STEP = CARD_HEIGHT + CARD_GAP
  const VISIBLE_HEIGHT = STEP * 3.5

  // Duplicate testimonials for infinite loop
  const allCards = [...testimonials, ...testimonials]
  const totalOriginal = testimonials.length

  // Simple auto-advance every 3 seconds
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1
        // When we reach end of original array, reset with brief transition disable
        if (next >= totalOriginal) {
          setIsTransitioning(false)
          setTimeout(() => setIsTransitioning(true), 50)
          return 0
        }
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused, totalOriginal])

  // Mousewheel scrolling: capture wheel over the testimonial area and advance
  // the carousel one card per gesture (debounced to match the slide animation).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let lastWheelTime = 0
    const WHEEL_DEBOUNCE = 350

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 1) return
      e.preventDefault()

      const now = Date.now()
      if (now - lastWheelTime < WHEEL_DEBOUNCE) return
      lastWheelTime = now

      if (e.deltaY > 0) {
        setCurrentIndex(prev => {
          const next = prev + 1
          if (next >= totalOriginal) {
            setIsTransitioning(false)
            setTimeout(() => setIsTransitioning(true), 50)
            return 0
          }
          return next
        })
      } else {
        setCurrentIndex(prev => {
          if (prev <= 0) {
            setIsTransitioning(false)
            setTimeout(() => setIsTransitioning(true), 50)
            return totalOriginal - 1
          }
          return prev - 1
        })
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [totalOriginal])

  // Update popup position
  const updatePopupPosition = useCallback((index: number) => {
    const cardEl = cardRefs.current[index]
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect()
      const popupWidth = 360
      const gap = 16
      const hasRoomOnLeft = rect.left > popupWidth + gap

      if (hasRoomOnLeft) {
        setPopupPosition({
          left: rect.left - popupWidth - gap,
          top: rect.top + (rect.height / 2),
        })
      } else {
        setPopupPosition({
          left: rect.left,
          top: rect.bottom + gap,
        })
      }
    }
  }, [])

  const handleContainerMouseEnter = () => {
    setIsPaused(true)
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
  }

  const handleContainerMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null)
      setPopupPosition(null)
    }, 150)

    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 1000)
  }

  const handleCardEnter = (index: number) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    if (hoveredIndex !== null && hoveredIndex !== index) {
      setHoveredIndex(index)
      updatePopupPosition(index)
      return
    }

    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    openTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(index)
      updatePopupPosition(index)
    }, 200)
  }

  const handleCardLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null)
      setPopupPosition(null)
    }, 150)
  }

  const handlePopupEnter = () => {
    if (isMobile) return
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePopupLeave = () => {
    if (isMobile) return
    setHoveredIndex(null)
    setPopupPosition(null)

    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 1000)
  }

  const handleCardTap = (index: number) => {
    if (!isMobile) return

    setIsPaused(true)
    if (tappedIndex === index) {
      setTappedIndex(null)
    } else {
      setTappedIndex(index)
    }
  }

  const handlePopupClose = () => {
    setTappedIndex(null)
    setHoveredIndex(null)
    setPopupPosition(null)

    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 1000)
  }

  // Calculate translateY based on currentIndex
  const translateY = -(currentIndex * STEP)

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-[#fafafa]/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <a href="/" className="flex items-baseline gap-0">
            <span className="text-[22px] font-normal tracking-[-0.02em] text-[#3c639f]">
              web
            </span>
            <span className="text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
              reta
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            {["Hizmet", "Çalışmalar", "Süreç", "İletişim"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[14px] text-black/60 transition-colors hover:text-[#0a0a0a]"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <button className="hidden rounded-md bg-[#3c639f] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] md:block">
            Teklif al
          </button>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-black/60 transition-colors hover:bg-black/[0.04] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-black/[0.06] bg-[#fafafa] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {["Hizmet", "Çalışmalar", "Süreç", "İletişim"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="py-2 text-[15px] text-black/70 transition-colors hover:text-[#0a0a0a]"
                >
                  {item}
                </a>
              ))}
              <button className="mt-2 w-full rounded-md bg-[#3c639f] px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288]">
                Teklif al
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-20">
          {/* Two Column Layout */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            {/* Left Column - Main Content */}
            <div className="w-full lg:w-[55%]">
              {/* Google Partner Badge */}
              <div className="mb-6">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                  Onaylı iş ortağı
                </span>
                <div className="mt-2">
                  <Image
                    src="/badges/google-partner.png"
                    alt="Google Partner"
                    width={140}
                    height={46}
                    className="h-[46px] w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div className="hidden h-[46px] w-[140px] items-center justify-center rounded border border-black/[0.08] bg-white text-[10px] text-black/40">
                    Google Partner
                  </div>
                </div>
              </div>

              {/* Main Headline with Typewriter */}
              <h1 className="text-[32px] leading-[1.08] tracking-[-0.03em] text-[#0a0a0a] md:text-[52px]">
                <span className="font-normal">Sizin için</span>
                <br />
                <span className="inline-flex items-baseline">
                  <span className="font-bold text-[#3c639f]">{displayedText}</span>
                  <span
                    className="ml-[2px] inline-block h-[0.85em] w-[3px] translate-y-[0.05em] bg-[#3c639f]"
                    style={{
                      animation: 'blink 0.8s ease-in-out infinite',
                    }}
                  />
                  {showCheckIcon && (
                    <span className="ml-2 inline-flex animate-in fade-in slide-in-from-left-2 duration-200">
                      <Check size={32} className="text-green-500" strokeWidth={3} />
                    </span>
                  )}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-black/60">
                Hazır temalar değil. Hızlı, modern ve markanıza sıfırdan kodlanmış
                web çözümleri.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-[22px] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288]">
                  Projemi konuşalım
                  <ArrowRight size={16} />
                </button>
                <button className="inline-flex items-center justify-center rounded-lg border border-black/[0.15] bg-white px-[22px] py-3 text-[14px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
                  Çalışmalarımız
                </button>
              </div>

              {/* Stats Row */}
              <div className="mt-14 border-t border-black/[0.06] pt-8">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                  <div>
                    <div className="text-[28px] font-medium tracking-[-0.02em] text-[#0a0a0a]">
                      120<span className="text-[#3c639f]">+</span>
                    </div>
                    <div className="mt-1 text-xs text-black/60">Tamamlanan proje</div>
                  </div>
                  <div>
                    <div className="text-[28px] font-medium tracking-[-0.02em] text-[#0a0a0a]">
                      98<span className="text-[20px] font-normal text-black/40">/100</span>
                    </div>
                    <div className="mt-1 text-xs text-black/60">Ort. Lighthouse skoru</div>
                  </div>
                  <div>
                    <div className="text-[28px] font-medium tracking-[-0.02em] text-[#0a0a0a]">
                      7 <span className="text-[20px] font-normal text-black/40">yıl</span>
                    </div>
                    <div className="mt-1 text-xs text-black/60">Sektör deneyimi</div>
                  </div>
                  <div>
                    <div className="text-[28px] font-medium tracking-[-0.02em] text-[#0a0a0a]">7/24</div>
                    <div className="mt-1 text-xs text-black/60">Teknik destek</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Testimonials */}
            <div className="relative w-full lg:w-[45%]">
              {/* Google Reviews Summary Card - Floating style with soft shadow */}
              <div
                className="rounded-xl bg-white p-4"
                style={{
                  border: '1px solid rgba(60, 99, 159, 0.08)',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px -2px rgba(60, 99, 159, 0.06), 0 16px 40px -12px rgba(60, 99, 159, 0.08), 0 32px 80px -20px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Left - Rating with stars */}
                  <div className="flex items-center gap-2">
                    <div className="text-[24px] font-bold text-[#0a0a0a]">5.0</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[#FBBC04] text-[#FBBC04]" />
                      ))}
                    </div>
                  </div>

                  {/* Right - Google icon + two-line text */}
                  <div className="flex items-center gap-2">
                    <GoogleIconMedium />
                    <div>
                      <div className="text-[14px] font-medium text-[#0a0a0a]">85 Google Yorumu</div>
                      <div className="text-[12px] text-black/50">Webreta Web Teknolojileri</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Carousel Container - Transparent, floating cards */}
              <div
                ref={containerRef}
                className="relative overflow-hidden -mx-6 px-6 lg:-mx-12 lg:px-12"
                style={{
                  height: `${VISIBLE_HEIGHT}px`,
                  // Vertical-only fade — keeps all card edges fully visible.
                  // Horizontal shadow breathing room is provided by the
                  // negative-margin + padding extension on the container, so
                  // shadows can dissipate naturally before being clipped.
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                }}
                onMouseEnter={handleContainerMouseEnter}
                onMouseLeave={handleContainerMouseLeave}
              >
                <div
                  style={{
                    transform: `translateY(${translateY}px)`,
                    transition: isTransitioning ? 'transform 600ms ease-in-out' : 'none',
                  }}
                >
                  {allCards.map((testimonial, index) => {
                    const slot = index - currentIndex
                    const opacity = getCardOpacity(slot)
                    const isFocused = slot === 1

                    return (
                      <div
                        key={index}
                        className="relative box-border w-full"
                        style={{
                          height: `${CARD_HEIGHT}px`,
                          marginBottom: `${CARD_GAP}px`,
                          zIndex: isFocused ? 10 : 1,
                        }}
                      >
                        <TestimonialCard
                          testimonial={testimonial}
                          isFocused={isFocused}
                          opacity={opacity}
                          isHovered={hoveredIndex === index || tappedIndex === index}
                          isMobile={isMobile}
                          onMouseEnter={() => handleCardEnter(index)}
                          onMouseLeave={handleCardLeave}
                          onClick={() => handleCardTap(index)}
                          cardRef={(el: HTMLDivElement | null) => { cardRefs.current[index] = el }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Popup */}
              {((hoveredIndex !== null && popupPosition && !isMobile) || (tappedIndex !== null && isMobile)) && (
                <TestimonialPopup
                  testimonial={allCards[isMobile ? tappedIndex! : hoveredIndex!]}
                  position={isMobile ? null : popupPosition}
                  isMobile={isMobile}
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handlePopupLeave}
                  onClose={handlePopupClose}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Cursor blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
