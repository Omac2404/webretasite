"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ArrowRight, Menu, X, Star, Check, ExternalLink, CheckCircle2, Code2, TrendingUp } from "lucide-react"
import Image from "next/image"
import { createPortal } from "react-dom"
import HomeBlogSection from "@/components/HomeBlogSection"
import SiteFooter from "@/components/SiteFooter"

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

// "Neler yapıyoruz?" section data. Two categories — `dev` (websites/apps/
// plugins) and `ops` (server, mail, DNS, security migrations). Each entry
// carries a short demand/solution line that fits on the card, plus a
// longer detail pair that fills the hover popup.
type ProjectCategory = 'dev' | 'ops'
type Project = {
  company: string
  initials: string
  category: ProjectCategory
  type: string
  date: string
  demand: string
  solution: string
  demandDetail: string
  solutionDetail: string
}

const projects: Project[] = [
  // === GELIŞTIRME (10) ===
  {
    company: "Sönmez Mimarlık",
    initials: "SM",
    category: 'dev',
    type: "Web Sitesi",
    date: "5 Mart 2025",
    demand: "Projelerimizi sergileyebileceğimiz minimalist bir portföy sitesi.",
    solution: "Görsel ağırlıklı, Lighthouse 98 puanlı kurumsal kimlik sitesi.",
    demandDetail: "Mevcut sitemiz çok eskiydi, projelerimizi düzgün sergileyemiyorduk. Hızlı, mobil uyumlu, fotoğrafları öne çıkaran kurumsal bir kimlik istiyorduk. Aynı zamanda potansiyel müşterilerden direkt teklif talebi alabileceğimiz bir form da gerekiyordu.",
    solutionDetail: "Custom Next.js ile sıfırdan kodlanmış, görsel ağırlıklı bir portföy sitesi teslim ettik. Lighthouse skoru 98 ile mobilde dahi anlık yükleniyor. SEO çalışması paketin parçasıydı; teklif talepleri ilk aydan itibaren %40 arttı.",
  },
  {
    company: "Aksel & Partners",
    initials: "AP",
    category: 'dev',
    type: "Web Sitesi",
    date: "20 Şubat 2025",
    demand: "Hukuk bürosu için güvenli ve şık kurumsal site.",
    solution: "KVKK uyumlu danışmanlık talep formu içeren modern site.",
    demandDetail: "Eski sitemiz hem yavaştı hem güvensiz görünüyordu. Kurumsal kimliğimize uygun, şık ve hızlı bir site; ayrıca potansiyel müvekkillerden başvuru toplayabileceğimiz KVKK uyumlu bir form istiyorduk.",
    solutionDetail: "Mavi-lacivert kurumsal paletle sıfırdan kodlanmış, AAA accessibility standardına uygun bir site teslim ettik. KVKK uyumlu danışmanlık talep formu, otomatik e-posta yönlendirme ve admin panel ile entegre. Yeni başvurular ilk üç ayda 3 katına çıktı.",
  },
  {
    company: "Mira Kafe",
    initials: "MK",
    category: 'dev',
    type: "E-Ticaret",
    date: "8 Şubat 2025",
    demand: "Online sipariş ve masa rezervasyonu yapılabilen kafe sitesi.",
    solution: "Stripe entegreli sipariş + Google Takvim bağlantılı rezervasyon.",
    demandDetail: "Şehir merkezindeki kafemizde paket servis ve rezervasyon talebi çok yüksekti ama telefonu açacak personel bulamıyorduk. Müşterilerin doğrudan menüden sipariş verebileceği, masa rezervasyonu yapabileceği bir sistem istiyorduk.",
    solutionDetail: "Stripe ile entegre online sipariş sistemi, kategori-bazlı menü editörü ve Google Calendar ile bağlı masa rezervasyon takvimi geliştirdik. Paket servis siparişleri ilk iki ayda iki katına çıktı; telefon trafiği yarı yarıya azaldı.",
  },
  {
    company: "Aydın Klinik",
    initials: "AK",
    category: 'dev',
    type: "Portal",
    date: "24 Ocak 2025",
    demand: "Hasta randevu ve SMS hatırlatma sistemi.",
    solution: "Doktor takvimine bağlı online randevu portalı.",
    demandDetail: "Diş hekimliği muayenehanemizde randevu kaçırma oranı çok yüksekti, sekreterimiz tüm gününü telefon hatırlatmasıyla geçiriyordu. Hastaların doktor müsait saatlerini görüp kendi randevularını alabilecekleri bir portal istedik.",
    solutionDetail: "Doktorun Google Calendar'ı ile bağlı online randevu sistemi, otomatik SMS+e-posta hatırlatmaları ve hasta dosyalama paneli geliştirdik. Randevu kaçırma oranı %35'ten %8'e düştü. Sekretaryanın günlük telefon yükü %70 azaldı.",
  },
  {
    company: "Vural Concept",
    initials: "VC",
    category: 'dev',
    type: "E-Ticaret",
    date: "10 Ocak 2025",
    demand: "Mağaza ve online satış için ortak envanterli sistem.",
    solution: "Headless e-ticaret + barkod entegreli stok senkronu.",
    demandDetail: "Fiziksel mağazamız ve online satışımız ayrı sistemlerde çalışıyordu; stok tutarsızlıkları ve aşırı satış sürekli sorun yaratıyordu. Tek panelden yönetebileceğimiz birleşik bir sisteme ihtiyacımız vardı.",
    solutionDetail: "Headless e-ticaret altyapısı kurduk; mağaza POS'u ve online site aynı stok veritabanını paylaşıyor. Barkod entegrasyonu sayesinde mağazadaki her satış anında online stoğa yansıyor. Aşırı satış sorunları tamamen ortadan kalktı.",
  },
  {
    company: "Kılıç Hotels",
    initials: "KH",
    category: 'dev',
    type: "Portal",
    date: "26 Aralık 2024",
    demand: "Direkt rezervasyon platformu ile aracı komisyonunu düşürmek.",
    solution: "Müsaitlik takvimli, ödeme entegreli rezervasyon sistemi.",
    demandDetail: "Butik otelimiz Booking ve Expedia'ya yüksek komisyonlar ödüyordu. Direkt rezervasyon kanalı oluşturup misafirleri kendi sitemizden çekmek istiyorduk; fiyatlandırmayı sezon, oda tipi ve gece sayısına göre dinamik kontrol etmemiz şarttı.",
    solutionDetail: "Müsaitlik takvimli, dinamik fiyatlandırma motorlu rezervasyon platformu kurduk. iyzico entegrasyonuyla anlık ödeme, otomatik onay e-postası ve PMS senkronu. Direkt rezervasyonlar 6 ayda %50 arttı, aracı komisyonundan ciddi tasarruf.",
  },
  {
    company: "Polat Akademi",
    initials: "PA",
    category: 'dev',
    type: "Portal",
    date: "12 Aralık 2024",
    demand: "Online ders ve ödev takip portalı.",
    solution: "Veli/öğrenci/öğretmen rollü LMS sistemi.",
    demandDetail: "Pandemi sonrası hibrit eğitime geçtik ama elimizdeki çözümler ya çok pahalı ya çok kısıtlıydı. Video ders, ödev takibi, sınav modülü ve veli paneli içeren özel bir öğrenci portalına ihtiyacımız vardı.",
    solutionDetail: "Üç rollü (öğrenci/öğretmen/veli) bir LMS geliştirdik. Zoom ve Jitsi ile video ders entegrasyonu, otomatik puanlamalı sınav modülü, veli takip paneli. Öğrenci memnuniyet anketinde sistem kullanımı %92 olumlu geri dönüş aldı.",
  },
  {
    company: "Sezer Emlak",
    initials: "SE",
    category: 'dev',
    type: "Portal",
    date: "28 Kasım 2024",
    demand: "Harita entegrasyonlu, gelişmiş filtreli emlak ilan sitesi.",
    solution: "Google Maps + 360° sanal tur destekli ilan platformu.",
    demandDetail: "Sahibinden'e bağımlı kalmak istemiyorduk; kendi marka ilan sitemizi kurmak ve müşterilere harita üzerinde filtrelenebilen, sanal turlu ilanlar sunmak istiyorduk. Admin panelinin de hızlı ilan girişine elverişli olması şarttı.",
    solutionDetail: "Google Maps ile entegre, semt/fiyat/oda sayısı kombine filtreli emlak platformu kurduk. 360° sanal tur ve drone görseli desteği, toplu ilan içe aktarma. İlan ekleme süresi 12 dakikadan 4 dakikaya düştü; rakiplerden öne çıktılar.",
  },
  {
    company: "NovaTech",
    initials: "NT",
    category: 'dev',
    type: "Web Sitesi",
    date: "14 Kasım 2024",
    demand: "Teknik içerik üreten, SEO odaklı kurumsal blog ve site.",
    solution: "MDX bazlı blog + headless CMS + otomatik sitemap.",
    demandDetail: "B2B yazılım firmamızın eski WordPress sitesi yavaştı, içerik girişi hantaldı. SEO odaklı, hızlı, ekibimizin Markdown ile rahat içerik üretebileceği modern bir altyapı istiyorduk; aynı zamanda mevcut blog yazılarının URL'lerini korumalıydık.",
    solutionDetail: "Next.js + MDX bazlı, Sanity headless CMS'e bağlı kurumsal site teslim ettik. Otomatik sitemap, RSS feed, JSON-LD schema. Eski URL'ler 301 yönlendirme ile korundu; organik trafik 4 ayda %220 arttı.",
  },
  {
    company: "Nazlı Beauty",
    initials: "NB",
    category: 'dev',
    type: "Eklenti",
    date: "30 Ekim 2024",
    demand: "Mevcut WordPress siteye personel-bazlı randevu eklentisi.",
    solution: "Bookly üzerine özel kod + WhatsApp bildirim entegrasyonu.",
    demandDetail: "Mevcut WP sitemiz vardı ama hazır randevu eklentileri kuaförümüze uymuyordu — personel bazlı saat seçimi, hizmet kombinasyonları ve WhatsApp bildirimi yoktu. Sitemizi baştan yapmadan bu özelliği eklemek istedik.",
    solutionDetail: "Bookly üzerine kuaföre özel personel/hizmet matrix'i, dinamik süre hesaplama ve WhatsApp Business API entegrasyonu yazdık. Hazır eklentinin %30'u, custom kodun %70'ini barındıran hibrit bir çözüm. Telefon trafiği %60 azaldı.",
  },

  // === OPERASYON (5) ===
  {
    company: "Demir Lojistik",
    initials: "DL",
    category: 'ops',
    type: "Sunucu",
    date: "16 Ekim 2024",
    demand: "Eski paylaşımlı hostingden VPS'e taşınma.",
    solution: "Zero-downtime DNS geçişi ile Hetzner VPS taşıma.",
    demandDetail: "20 GB veritabanı ve eski PHP altyapısı yüklü olan sitemiz paylaşımlı hostingde sık sık çöküyordu. Yoğun saatlerde sayfalar açılmıyordu, müşteri talepleri kayboluyordu. Kesinti yaşamadan modern bir VPS'e taşınmak istedik.",
    solutionDetail: "Hetzner VPS'e Ubuntu 22.04 + nginx + PHP-FPM + MariaDB kurduk. Eski hostingden full database dump'ı senkronlayıp DNS TTL'i 60 saniyeye indirerek geçişi yaptık. Toplam kesinti 8 dakika; performans 4 kat arttı, ortalama TTFB 1.8s'den 290ms'ye düştü.",
  },
  {
    company: "Erdem Hukuk",
    initials: "EH",
    category: 'ops',
    type: "E-Posta",
    date: "2 Ekim 2024",
    demand: "Eski cPanel mailden Google Workspace'e geçiş.",
    solution: "IMAP migration + MX kayıt geçişi + tüm alias taşıma.",
    demandDetail: "12 kişilik hukuk bürosu cPanel'in yetersiz mail altyapısını kullanıyordu — spam filtresi zayıftı, mobil sync çalışmıyordu, 5 GB üzerinde kotalar doluyordu. Tüm geçmiş yazışmaları kaybetmeden Google Workspace'e geçmek istediler.",
    solutionDetail: "Google Workspace hesabını kurup IMAP migration tool ile 12 kullanıcının ortalama 8 GB'lık geçmiş yazışmalarını taşıdık. MX, SPF, DKIM, DMARC kayıtlarını yapılandırdık. Hiçbir mail kaybı yok; spam oranı %70 azaldı.",
  },
  {
    company: "Anka Yapı",
    initials: "AY",
    category: 'ops',
    type: "DNS",
    date: "18 Eylül 2024",
    demand: "Yavaş yabancı hostingden yerel altyapıya geçiş ve Cloudflare.",
    solution: "Cloudflare DNS + Türkiye lokasyonlu hosting + CDN cache.",
    demandDetail: "ABD'deki hostingden dolayı sayfa açılma süreleri 6-8 saniyeyi buluyordu, Türkiye'deki ziyaretçi deneyimi çok kötüydü. Sayfaları korumak ve yerel CDN ile hızlandırmak için altyapı geçişi istediler.",
    solutionDetail: "Cloudflare DNS + ücretsiz SSL + WAF yapılandırması yaptık, hosting'i Türkiye konumlu provider'a taşıdık. CDN edge cache ile statik dosyalar kullanıcıya en yakın PoP'tan servis ediliyor. TTFB 3.2s'den 180ms'ye düştü; bounce rate %42 azaldı.",
  },
  {
    company: "Mavi Sağlık",
    initials: "MS",
    category: 'ops',
    type: "Güvenlik",
    date: "4 Eylül 2024",
    demand: "KVKK uyumlu, dayanıklı site güvenliği altyapısı.",
    solution: "Wildcard SSL + WAF + DDoS koruma + günlük yedek.",
    demandDetail: "Hasta verisi tutan portal sistemimiz vardı; düzensiz SSL, eski güvenlik header'ları ve hiç yedek planı yoktu. Hem KVKK uyumu hem de saldırılara karşı dayanıklı bir altyapıya geçmek istediler.",
    solutionDetail: "Wildcard SSL kurulumu, OWASP Top 10 WAF kuralları, Cloudflare DDoS koruma, otomatik günlük şifreli yedek (28 günlük retention), TLS 1.3, HSTS preload listesine eklenme. Aylık güvenlik raporu da paket dahil; KVKK denetiminden sorunsuz geçtiler.",
  },
  {
    company: "Bilgin Trade",
    initials: "BT",
    category: 'ops',
    type: "Bakım",
    date: "20 Ağustos 2024",
    demand: "WordPress sitede malware temizliği ve sertleştirme.",
    solution: "Full malware temizliği + 2FA + WP-CLI ile güncelleme otomasyonu.",
    demandDetail: "Sitemiz Google tarafından 'phishing içerik' olarak işaretlenmişti; arka planda kullanıcıları yönlendiren bir malware vardı. Site komple temizlenmeli ve bir daha hacklenmemesi için sertleştirilmeliydi.",
    solutionDetail: "Tüm sitenin temiz kopyasını çıkarıp 142 enfekte dosyayı temizledik. Kullanıcı şifrelerini sıfırladık, 2FA ekledik, wp-config.php sertleştirdik, debug bilgilerini gizledik. WP-CLI ile otomatik plugin/core güncellemesi kurduk. Google Search Console üzerinden re-review başvurusu yapıp site uyarısı kaldırıldı.",
  },
]

const typewriterWords = [
  { text: "düşünürüz", holdDuration: 2000 },
  { text: "tasarlarız", holdDuration: 2000 },
  { text: "problemi çözeriz", holdDuration: 4000, showCheck: true },
]

// Partner wordmarks for the logo bar. Swap with real PNG/SVG logos by
// dropping them into /public/logos/ and replacing each string with an
// <Image> tile in LogoTile below.
const partnersRowA = [
  "Aksel & Partners",
  "Mira Kafe",
  "Sönmez Mimarlık",
  "Polat Akademi",
  "Vural Concept",
  "NovaTech",
  "Kılıç Hotels",
  "Mutlu Sigorta",
  "Yıldız Danışmanlık",
  "Sezer Emlak",
  "Bozkurt Vet",
  "Aydın Klinik",
]

const partnersRowB = [
  "Rençber Otomotiv",
  "Nazlı Beauty",
  "Yılmaz Florist",
  "Tan Sport",
  "Aksu Living",
  "Demir Lojistik",
  "Eren Tekstil",
  "Bilgin Trade",
  "Karya Eğitim",
  "Mavi Sağlık",
  "Erdem Hukuk",
  "Anka Yapı",
]

type LogoEntry = {
  id: string
  name: string
  imageUrl: string
  row: "a" | "b"
}
type LogoDisplayMode = "logos" | "names"

function LogoTile({
  entry,
  mode,
}: {
  entry: LogoEntry
  mode: LogoDisplayMode
}) {
  // In logos mode, fall back to the name when an entry has no image yet
  // so the marquee never has empty tiles.
  const showImage = mode === "logos" && entry.imageUrl
  return (
    <div
      className="flex h-[72px] w-[190px] shrink-0 items-center justify-center rounded-xl bg-white px-4"
      style={{
        border: '1px solid rgba(60, 99, 159, 0.08)',
        boxShadow:
          '0 1px 2px rgba(0, 0, 0, 0.02), 0 8px 24px -8px rgba(60, 99, 159, 0.06)',
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.imageUrl}
          alt={entry.name}
          className="max-h-[44px] max-w-full select-none object-contain"
          draggable={false}
        />
      ) : (
        <span className="select-none text-center text-[15px] font-semibold tracking-[-0.01em] text-black/55">
          {entry.name}
        </span>
      )}
    </div>
  )
}

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
      onClick={onClick}
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
                className="devamini-shimmer cursor-pointer border-0 bg-transparent p-0 font-medium"
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

        <div className="popup-scroll mt-4 flex-1 pr-2">
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

        <div className="popup-scroll mt-4 flex-1 pr-1">
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

// "Neler yapıyoruz?" — mirrors the hero testimonial carousel: vertical
// auto-advancing stack, hover/tap popup, mobile swipe. Differences from
// testimonials: wider cards (180px tall) with TALEP/ÇÖZÜM sections, a
// segmented control above the carousel to switch between Geliştirmeler
// (dev) and Operasyonlar (ops) project lists.

function ProjectCard({
  project,
  isFocused,
  opacity,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  cardRef,
}: {
  project: Project
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
      onClick={onClick}
      className="box-border flex h-full cursor-pointer flex-col rounded-xl px-5 py-5"
      style={{
        opacity: isHovered ? 1 : opacity,
        transform: isFocused ? 'scale(1.04)' : 'scale(1)',
        transformOrigin: 'center',
        background: '#ffffff',
        border: isHovered
          ? '1px solid rgba(60, 99, 159, 0.30)'
          : isFocused
            ? '1px solid rgba(60, 99, 159, 0.20)'
            : '0.5px solid rgba(0, 0, 0, 0.04)',
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
      {/* Header — wide logo placeholder (left), company name (middle), type
          chip (right). The placeholder is intentionally rectangular so real
          horizontal wordmarks will drop in cleanly later. Larger sizing
          kicks in only at lg+ so mobile keeps the original compact look. */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md lg:h-14 lg:w-24"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(60, 99, 159, 0.10)',
            boxShadow: '0 1px 2px rgba(60, 99, 159, 0.04)',
          }}
        >
          <span className="text-[15px] font-bold tracking-tight text-[#3c639f] lg:text-[16px]">
            {project.initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-[#0a0a0a] lg:text-[15px]">
            {project.company}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em]"
          style={{
            background: 'rgba(60, 99, 159, 0.08)',
            color: '#3c639f',
          }}
        >
          {project.type}
        </span>
      </div>

      {/* Talep — pastel blue pill with the copy INLINE next to it */}
      <div className="mt-3.5 flex items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dbeafe',
            color: '#1d4ed8',
          }}
        >
          <ArrowRight size={11} strokeWidth={3} />
          Talep
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-[1.45] text-black/75 lg:text-[13px]">
          {project.demand}
        </p>
      </div>

      {/* Çözüm — pastel green pill with the copy INLINE next to it */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dcfce7',
            color: '#15803d',
          }}
        >
          <CheckCircle2 size={11} strokeWidth={3} />
          Çözüm
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-[1.45] text-black/75 lg:text-[13px]">
          {project.solution}
        </p>
      </div>

      {/* Publish date — sits in the empty bottom space, right-aligned and
          subtle so it reads as metadata, not content. mt-auto pushes it to
          the bottom of the flex column regardless of header/copy length. */}
      <div className="mt-auto pt-3 text-right text-[11px] text-black/35">
        {project.date}
      </div>
    </div>
  )
}

function ProjectPopup({
  project,
  position,
  isMobile,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  project: Project
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
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  if (!mounted) return null

  const popupWidth = 420
  const isMobileLayout = isMobile || !position

  const body = (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div
          className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(60, 99, 159, 0.10)',
            boxShadow: '0 1px 2px rgba(60, 99, 159, 0.04)',
          }}
        >
          <span className="text-[16px] font-bold tracking-tight text-[#3c639f]">
            {project.initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-[#0a0a0a]">
            {project.company}
          </div>
          <div className="text-[12px] text-black/50">
            {project.type} · {project.date}
          </div>
        </div>
        {isMobileLayout && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/80"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="my-4 h-px shrink-0 bg-black/[0.06]" />

      {/* Talep — pastel blue pill (same as card, scaled up) */}
      <div className="shrink-0">
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dbeafe',
            color: '#1d4ed8',
          }}
        >
          <ArrowRight size={12} strokeWidth={3} />
          Talep
        </span>
        <p className="mt-2 text-[14px] leading-[1.6] text-black/80">
          {project.demandDetail}
        </p>
      </div>

      <div className="my-4 h-px shrink-0 bg-black/[0.06]" />

      {/* Çözüm — pastel green pill (same as card, scaled up) */}
      <div className="shrink-0">
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dcfce7',
            color: '#15803d',
          }}
        >
          <CheckCircle2 size={12} strokeWidth={3} />
          Çözüm
        </span>
        <p className="mt-2 text-[14px] leading-[1.6] text-black/80">
          {project.solutionDetail}
        </p>
      </div>
    </>
  )

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
        className="popup-scroll relative mx-auto flex w-full flex-col rounded-xl bg-white p-5"
        style={{
          maxWidth: `${popupWidth}px`,
          maxHeight: '80vh',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow:
            '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 150ms ease-out, transform 150ms ease-out',
        }}
      >
        {body}
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
        className="popup-scroll relative flex flex-col rounded-xl bg-white p-5"
        style={{
          maxHeight: '440px',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow:
            '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Arrow pointing back to the card on the right */}
        <div
          className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rotate-45 bg-white"
          style={{
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            borderLeft: 'none',
            borderBottom: 'none',
          }}
        />
        {body}
      </div>
    </div>
  )

  return createPortal(popupContent, document.body)
}

function ProjectsSection() {
  const isMobile = useIsMobile()

  const [activeTab, setActiveTab] = useState<ProjectCategory>('dev')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tappedIndex, setTappedIndex] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null)
  // Once the visitor clicks the Operasyonlar tab, the pulse stops for the
  // remainder of the session. Otherwise it fires every 3s to draw the eye.
  const [opsPulsing, setOpsPulsing] = useState(true)
  // Mobile swipe hint — shown once when the carousel scrolls into view, or
  // until the first finger touch dismisses it.
  const [hintActive, setHintActive] = useState(false)
  const hintShownRef = useRef(false)

  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wheelAccumRef = useRef(0)

  // Inline pill + single-line copy is more compact than the old stacked
  // layout, so the card can be shorter. Mobile keeps the original compact
  // type sizing so its height differs slightly from desktop.
  const CARD_HEIGHT = isMobile ? 200 : 200
  const CARD_GAP = isMobile ? 24 : 16
  const STEP = CARD_HEIGHT + CARD_GAP
  const VISIBLE_HEIGHT = STEP * 3 + CARD_HEIGHT * 0.4

  const activeProjects = useMemo(
    () => projects.filter(p => p.category === activeTab),
    [activeTab],
  )
  const totalOriginal = activeProjects.length
  // Duplicated list enables seamless infinite loop
  const allCards = useMemo(
    () => [...activeProjects, ...activeProjects],
    [activeProjects],
  )

  // Reset to first card whenever the tab changes
  useEffect(() => {
    setIsTransitioning(false)
    setCurrentIndex(0)
    setHoveredIndex(null)
    setTappedIndex(null)
    setPopupPosition(null)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsTransitioning(true))
    })
  }, [activeTab])

  // Auto-advance on desktop (paused on hover or while a popup is open).
  // 2s per card — slightly faster than the testimonial column above so the
  // section reads as "active" but still legible. Reset is done inline
  // (matches the testimonial carousel): when about to step past the end,
  // disable the transition and snap to 0 in the same render — the slot 0
  // card is mask-faded so the swap reads as a wheel turning, not a jump.
  useEffect(() => {
    if (isPaused || isMobile || totalOriginal === 0) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1
        if (next >= totalOriginal) {
          setIsTransitioning(false)
          setTimeout(() => setIsTransitioning(true), 50)
          return 0
        }
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [isPaused, isMobile, totalOriginal])

  // Mouse wheel — accumulator-based stepping. Each wheel event adds to a
  // running deltaY total; every WHEEL_PX_PER_STEP pixels accumulated advances
  // one card. Bigger gestures (or trackpad inertia) batch multiple steps in
  // a single event, so the carousel feels like a wheel that spins faster
  // when you scroll harder. Bound to the carousel CONTAINER only so the
  // page scrolls normally over the hand, copy, and empty space.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const WHEEL_PX_PER_STEP = 80
    const handleWheel = (e: WheelEvent) => {
      // Normalize line-mode deltas to pixels (Firefox occasionally uses line
      // mode); ignore truly-zero deltas.
      const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (Math.abs(deltaY) < 1) return
      e.preventDefault()
      if (totalOriginal === 0) return

      wheelAccumRef.current += deltaY
      let steps = 0
      while (wheelAccumRef.current >= WHEEL_PX_PER_STEP) {
        steps += 1
        wheelAccumRef.current -= WHEEL_PX_PER_STEP
      }
      while (wheelAccumRef.current <= -WHEEL_PX_PER_STEP) {
        steps -= 1
        wheelAccumRef.current += WHEEL_PX_PER_STEP
      }
      if (steps === 0) return

      setCurrentIndex(prev => {
        let next = prev + steps
        if (next < 0 || next >= totalOriginal) {
          // Past either end: snap-wrap without animation to preserve the
          // seamless infinite loop, then re-enable transitions next tick.
          setIsTransitioning(false)
          setTimeout(() => setIsTransitioning(true), 50)
          next = ((next % totalOriginal) + totalOriginal) % totalOriginal
        }
        return next
      })
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [totalOriginal])

  // Touch swipe (mobile). Mirrors the testimonial carousel: 30px threshold,
  // 400ms debounce, seamless loop reset done inline so the user sees no jump.
  useEffect(() => {
    if (!isMobile) return
    const el = containerRef.current
    if (!el) return

    let touchStartY = 0
    let touchEndY = 0
    let lastSwipeTime = 0
    const SWIPE_DEBOUNCE = 400
    const SWIPE_THRESHOLD = 30

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchEndY = touchStartY
      // Any touch dismisses the swipe hint immediately
      setHintActive(false)
      hintShownRef.current = true
    }
    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY
    }
    const handleTouchEnd = () => {
      const delta = touchStartY - touchEndY
      if (Math.abs(delta) < SWIPE_THRESHOLD) return
      const now = Date.now()
      if (now - lastSwipeTime < SWIPE_DEBOUNCE) return
      lastSwipeTime = now

      if (delta > 0) {
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

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, totalOriginal])

  // Mobile swipe hint — show once when the projects carousel scrolls into
  // view. Mirrors the testimonial column's hint so the gesture feels
  // discoverable on a first visit.
  useEffect(() => {
    if (!isMobile || hintShownRef.current) return
    const el = containerRef.current
    if (!el) return
    let hideTimeout: NodeJS.Timeout | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hintShownRef.current) {
          hintShownRef.current = true
          setHintActive(true)
          observer.disconnect()
          hideTimeout = setTimeout(() => setHintActive(false), 2800)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [isMobile])

  // Position the popup to the right of the focused card on desktop. On
  // mobile the popup is a centered modal so this is a no-op.
  const computePopupPosition = useCallback((index: number) => {
    if (isMobile) return null
    const card = cardRefs.current[index]
    if (!card) return null
    const r = card.getBoundingClientRect()
    return { left: r.right + 24, top: r.top + r.height / 2 }
  }, [isMobile])

  const handleCardEnter = (index: number) => {
    if (isMobile) return
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setHoveredIndex(index)
    setIsPaused(true)
    const pos = computePopupPosition(index)
    if (pos) setPopupPosition(pos)
  }

  const handleCardLeave = () => {
    if (isMobile) return
    leaveTimerRef.current = setTimeout(() => {
      setHoveredIndex(null)
      setPopupPosition(null)
      setIsPaused(false)
    }, 120)
  }

  const handlePopupEnter = () => {
    if (isMobile) return
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsPaused(true)
  }
  const handlePopupLeave = () => {
    if (isMobile) return
    setHoveredIndex(null)
    setPopupPosition(null)
    setIsPaused(false)
  }
  const handleCardTap = (index: number) => {
    if (!isMobile) return
    setTappedIndex(prev => (prev === index ? null : index))
  }
  const handlePopupClose = () => {
    setTappedIndex(null)
    setHoveredIndex(null)
    setPopupPosition(null)
  }

  const handleContainerMouseEnter = () => setIsPaused(true)
  const handleContainerMouseLeave = () => {
    if (hoveredIndex === null) setIsPaused(false)
  }

  const translateY = -(currentIndex * STEP)

  return (
    <section ref={sectionRef} data-section="projects" className="relative mx-auto max-w-[1280px] px-6 pb-16 md:px-12 md:pb-20">
      {/* Section heading — title and segmented control sit together on the
          same baseline. The control hugs the right edge of the title rather
          than being pushed to the far right of the section. */}
      <div className="mb-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
          Çalışmalarımız
        </span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h2 className="text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]">
            <span className="font-normal">Neler </span>
            <span className="font-bold text-[#3c639f]">Yaptık?</span>
          </h2>

          {/* Segmented control */}
          <div
            className="inline-flex shrink-0 items-center rounded-full p-1"
            style={{
              background: '#f1f3f7',
              border: '1px solid rgba(60, 99, 159, 0.08)',
            }}
          >
            {([
              { id: 'dev', label: 'Geliştirmeler' },
              { id: 'ops', label: 'Operasyonlar' },
            ] as const).map(tab => {
              const active = activeTab === tab.id
              // The Operasyonlar tab pulses every 3s until the visitor clicks
              // it — keyframes fire a quick double-tap then settle.
              const shouldPulse = tab.id === 'ops' && opsPulsing && !active
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-track-tab-control="projects"
                  data-track-tab-value={tab.id}
                  data-track-label={tab.label}
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (tab.id === 'ops') setOpsPulsing(false)
                  }}
                  className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors md:px-5"
                  style={{
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#3c639f' : 'rgba(0,0,0,0.5)',
                    boxShadow: active
                      ? '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px -4px rgba(60, 99, 159, 0.18)'
                      : 'none',
                    animation: shouldPulse ? 'opsPulse 3s ease-in-out infinite' : 'none',
                    transformOrigin: 'center',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two column layout — left carousel, right copy + CTA. A decorative
          halftone OK-hand is absolutely positioned behind both columns so
          it bleeds across the seam: bottom of the hand sits behind the
          last carousel card, fingers reach up into the right column. */}
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-16">
        {/* Halftone OK-hand. Same treatment as the hero peace-hand:
            mix-blend-mode multiply drops the JPEG's near-white background
            against the page, and a bottom mask softly fades the wrist out.
            Desktop-only — on mobile the layout collapses to one column and
            there's no horizontal room for the image. */}
        <div
          aria-hidden
          className="pointer-events-none absolute hidden select-none lg:block"
          style={{
            left: 'calc(50% - 110px)',
            top: '-40px',
            width: '380px',
            zIndex: 0,
            mixBlendMode: 'multiply',
            maskImage:
              'linear-gradient(to bottom, black 0%, black 42%, rgba(0,0,0,0.40) 60%, transparent 80%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 42%, rgba(0,0,0,0.40) 60%, transparent 80%)',
          }}
        >
          <Image
            src="/brand/ok-hand.jpg"
            alt=""
            width={525}
            height={945}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        {/* Soft brand-blue dot pattern blooming to the right of the OK-hand.
            Two stacked backgrounds: a faint radial wash gives the area a
            warm blue tint, and a finer dot grid rides on top for texture.
            A radial mask fades both to nothing past the edges so the
            decoration reads as a soft cloud, not a hard tile. Sits at
            z-0 behind the right-column copy; desktop-only to match the
            hand. */}
        <div
          aria-hidden
          className="pointer-events-none absolute hidden select-none lg:block"
          style={{
            right: '-60px',
            top: '-120px',
            width: '560px',
            height: '760px',
            zIndex: 0,
            background:
              'radial-gradient(rgba(60, 99, 159, 0.38) 1.4px, transparent 1.8px) 0 0 / 22px 22px, radial-gradient(circle at 55% 45%, rgba(60, 99, 159, 0.18) 0%, transparent 65%)',
            maskImage:
              'radial-gradient(closest-side, black 0%, black 15%, rgba(0,0,0,0.7) 50%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(closest-side, black 0%, black 15%, rgba(0,0,0,0.7) 50%, transparent 85%)',
          }}
        />

        {/* Brand-blue line-ring pulses emanating from the centre of the OK
            loop. Three concentric outlined circles with staggered delays
            spread far past the hand for a "radio wave" feel. Wrapper
            z-index sits between the hand (z:0) and the columns (z:10) so
            the rings bloom above the fingers but stay behind every project
            card. Hand aspect ratio 525:945 → at 380px wide that's ~684px
            tall; the ring centre is placed at roughly 60%/32% which
            matches the visual centre of the OK loop. */}

        {/* Left — projects carousel. Narrower than before so the right
            negative space breathes and the cards feel less wide. */}
        <div ref={columnRef} className="relative z-10 w-full lg:w-[50%]">
          <div
            ref={containerRef}
            className="relative overflow-hidden -mx-6 px-6 lg:-mx-12 lg:px-12"
            style={{
              height: `${VISIBLE_HEIGHT}px`,
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
              touchAction: isMobile ? 'none' : 'auto',
            }}
            onMouseEnter={handleContainerMouseEnter}
            onMouseLeave={handleContainerMouseLeave}
          >
            <div
              style={{
                transform: `translateY(${translateY}px)`,
                transition: isTransitioning ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
              }}
            >
              {allCards.map((project, index) => {
                const slot = index - currentIndex
                const opacity = getCardOpacity(slot)
                const isFocused = slot === 1
                return (
                  <div
                    key={`${activeTab}-${index}`}
                    className="relative box-border w-full"
                    style={{
                      height: `${CARD_HEIGHT}px`,
                      marginBottom: `${CARD_GAP}px`,
                      zIndex: isFocused ? 10 : 1,
                    }}
                  >
                    <ProjectCard
                      project={project}
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

            {/* Mobile swipe hint — same look/timing as the testimonial
                carousel: hand icon + "Kaydırın" caption, brand-blue with a
                soft white drop-shadow, animated top→bottom for 2 cycles. */}
            {hintActive && (
              <div
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                style={{ animation: 'hintFade 2.8s ease-in-out forwards' }}
              >
                <div
                  className="flex flex-col items-center gap-2 text-[#3c639f]"
                  style={{
                    animation: 'swipeDrop 1.4s ease-in-out 2',
                    filter:
                      'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))',
                  }}
                >
                  <Image
                    src="/swipe-down.png"
                    alt=""
                    width={60}
                    height={60}
                    priority
                  />
                  <span className="text-[15px] font-semibold tracking-wide">
                    Kaydırın
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — approach blurb + Teklif al CTA, anchored to the BOTTOM
            of the column with justify-end. Negative left margin pulls the
            copy further toward the hand/centre, and the paragraph is
            allowed to stretch wider (max-w 560) so it can occupy the
            empty band beneath the wrist all the way to the right edge. */}
        <div className="relative z-10 hidden lg:-ml-4 lg:flex lg:w-[calc(50%+16px)] lg:flex-col lg:justify-end lg:gap-6 lg:pb-16 xl:-ml-6 xl:w-[calc(50%+24px)] xl:pb-20">
          <div>
            {/* Eyebrow label hidden but its space preserved so the rest
                of the block doesn't jump upward. */}
            <span
              aria-hidden
              className="invisible text-[11px] font-medium uppercase tracking-[0.08em] text-black/40"
            >
              Yaklaşımımız
            </span>
            <h3 className="mt-3 text-[32px] leading-[1.08] tracking-[-0.03em] text-[#0a0a0a] md:text-[52px]">
              <span className="font-normal">Her projeye sıfırdan,</span>
              <br />
              <span className="font-bold text-[#3c639f]">ihtiyaca özel.</span>
            </h3>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-black/60">
              Hazır şablon kullanmıyoruz. Talebinizi dinleyip size özel çözüm
              kurguluyoruz; web sitesinden eklentiye, sunucu taşımadan
              güvenlik kurulumuna kadar her adımı sizin işinize göre tasarlıyoruz.
            </p>
          </div>

          <a
            href="#teklif"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#3c639f] px-[22px] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288]"
          >
            Teklif al
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Popup */}
      {((hoveredIndex !== null && popupPosition && !isMobile) || (tappedIndex !== null && isMobile)) && (
        <ProjectPopup
          project={allCards[isMobile ? tappedIndex! : hoveredIndex!]}
          position={isMobile ? null : popupPosition}
          isMobile={isMobile}
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handlePopupLeave}
          onClose={handlePopupClose}
        />
      )}
    </section>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tappedIndex, setTappedIndex] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [hintActive, setHintActive] = useState(false)

  // Service-card scroll-in + hover replay. Each card has its own observer,
  // and a `playKey` counter that increments to trigger a remount of the
  // decorative SVG so its CSS animations restart from scratch. On desktop
  // both cards typically enter the viewport together — the reklam card has
  // a fixed delay so the two animations play in sequence (web first, then
  // reklam). On mobile the cards stack and each fires independently when
  // its threshold is crossed.
  const webCardRef = useRef<HTMLAnchorElement>(null)
  const reklamCardRef = useRef<HTMLAnchorElement>(null)
  const [webPlayKey, setWebPlayKey] = useState(0)
  const [reklamPlayKey, setReklamPlayKey] = useState(0)
  const webEnteredRef = useRef(false)
  const reklamEnteredRef = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          if (entry.target === webCardRef.current && !webEnteredRef.current) {
            webEnteredRef.current = true
            setWebPlayKey((k) => k + 1)
          } else if (entry.target === reklamCardRef.current && !reklamEnteredRef.current) {
            reklamEnteredRef.current = true
            // Stagger after the web card so on desktop they play in sequence.
            setTimeout(() => setReklamPlayKey((k) => k + 1), 700)
          }
        })
      },
      { threshold: 0.7 },
    )
    if (webCardRef.current) observer.observe(webCardRef.current)
    if (reklamCardRef.current) observer.observe(reklamCardRef.current)
    return () => observer.disconnect()
  }, [])

  // Partner logos — fetched from the admin store. Seeded with the
  // hardcoded list so the marquee renders something on first paint,
  // then replaced once /api/logos resolves. Admin-managed via the
  // panel; we'll migrate this to Postgres later.
  const [logoMode, setLogoMode] = useState<LogoDisplayMode>("names")
  const [logoEntries, setLogoEntries] = useState<LogoEntry[]>(() => [
    ...partnersRowA.map((name, i) => ({
      id: `fallback-a-${i}`,
      name,
      imageUrl: "",
      row: "a" as const,
    })),
    ...partnersRowB.map((name, i) => ({
      id: `fallback-b-${i}`,
      name,
      imageUrl: "",
      row: "b" as const,
    })),
  ])
  useEffect(() => {
    let cancelled = false
    fetch("/api/logos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { mode?: LogoDisplayMode; logos?: LogoEntry[] } | null) => {
        if (cancelled || !data) return
        if (data.mode) setLogoMode(data.mode)
        if (Array.isArray(data.logos) && data.logos.length > 0) {
          setLogoEntries(data.logos)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  const logoRows = useMemo(
    () => ({
      rowA: logoEntries.filter((l) => l.row === "a"),
      rowB: logoEntries.filter((l) => l.row === "b"),
    }),
    [logoEntries],
  )

  // Testimonials source — admin can flip between the hardcoded preset
  // list and the curated real reviews. While we don't have any real
  // reviews yet (no Google sync), the homepage falls back to preset so
  // the section never looks empty.
  const [activeTestimonials, setActiveTestimonials] = useState<
    typeof testimonials
  >(testimonials)
  useEffect(() => {
    let cancelled = false
    type ApiReview = {
      id: string
      author: string
      authorPhotoUrl?: string
      rating: number
      text: string
      date: string
    }
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: { source?: "preset" | "real"; reviews?: ApiReview[] } | null) => {
          if (cancelled || !data) return
          if (data.source === "real" && data.reviews && data.reviews.length > 0) {
            const mapped: typeof testimonials = data.reviews.map((r) => ({
              text: r.text,
              name: r.author,
              role: "",
              initials: r.author
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              date: r.date,
            }))
            setActiveTestimonials(mapped)
          }
        },
      )
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const testimonialColumnRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hintShownRef = useRef(false)

  const { displayedText, showCheckIcon } = useTypewriter()
  const isMobile = useIsMobile()

  // Card dimensions. Mobile gets a wider gap because the narrower viewport
  // makes adjacent cards feel cramped — text wraps to more lines and fills
  // the card height, leaving little visual breathing room between cards.
  const CARD_HEIGHT = 150
  const CARD_GAP = isMobile ? 24 : 16
  const STEP = CARD_HEIGHT + CARD_GAP
  const VISIBLE_HEIGHT = STEP * 3.5

  // Duplicate testimonials for infinite loop. Use the live source so
  // flipping preset ↔ real in the admin reflects here on next load.
  const allCards = [...activeTestimonials, ...activeTestimonials]
  const totalOriginal = activeTestimonials.length

  // Auto-advance every 2 seconds — desktop only. On mobile the user drives
  // the carousel themselves via touch swipe, so we skip the timer entirely.
  useEffect(() => {
    if (isPaused || isMobile) return

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
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaused, totalOriginal, isMobile])

  // Mousewheel scrolling: capture wheel over the entire testimonial
  // column (Google reviews card + carousel + the surrounding negative
  // space) and advance the carousel one card per gesture, debounced to
  // match the slide animation. Bound to the whole column rather than
  // just the carousel so wheel events over the summary card don't fall
  // through to the page.
  useEffect(() => {
    const el = testimonialColumnRef.current
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

  // Touch swipe (mobile). One card per gesture above a threshold. The
  // container uses touch-action:none on mobile, so the page won't co-scroll
  // when the finger lands inside — user scrolls past from above/below.
  useEffect(() => {
    if (!isMobile) return
    const el = containerRef.current
    if (!el) return

    let touchStartY = 0
    let touchEndY = 0
    let lastSwipeTime = 0
    const SWIPE_DEBOUNCE = 400
    const SWIPE_THRESHOLD = 30

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchEndY = touchStartY
      // Any touch on the carousel dismisses the swipe hint immediately —
      // the user has started interacting, so the gesture demo is moot.
      setHintActive(false)
      hintShownRef.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      const delta = touchStartY - touchEndY
      if (Math.abs(delta) < SWIPE_THRESHOLD) return

      const now = Date.now()
      if (now - lastSwipeTime < SWIPE_DEBOUNCE) return
      lastSwipeTime = now

      if (delta > 0) {
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

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, totalOriginal])

  // Mobile swipe hint: show once when the carousel scrolls into view.
  useEffect(() => {
    if (!isMobile || hintShownRef.current) return
    const el = containerRef.current
    if (!el) return

    let hideTimeout: NodeJS.Timeout | undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hintShownRef.current) {
          hintShownRef.current = true
          setHintActive(true)
          observer.disconnect()
          hideTimeout = setTimeout(() => setHintActive(false), 2800)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [isMobile])

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
          <a href="/" aria-label="Webreta" className="flex items-center">
            <Image
              src="/brand/webreta-logo.webp"
              alt="Webreta"
              width={364}
              height={64}
              priority
              className="h-7 w-auto"
            />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Hakkımızda", href: "/hakkimizda" },
              { label: "Web Site", href: "/web-site" },
              { label: "Dijital Reklamlar", href: "/dijital-reklamlar" },
              { label: "İletişim", href: "/iletisim" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[14px] text-black/60 transition-colors hover:text-[#0a0a0a]"
              >
                {item.label}
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
              {[
                { label: "Hakkımızda", href: "/hakkimizda" },
                { label: "Web Site", href: "/web-site" },
                { label: "Dijital Reklamlar", href: "/dijital-reklamlar" },
                { label: "İletişim", href: "/iletisim" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="py-2 text-[15px] text-black/70 transition-colors hover:text-[#0a0a0a]"
                >
                  {item.label}
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
                  <div className="flex h-[46px] w-[140px] items-center justify-center rounded border border-black/[0.08] bg-white text-[10px] text-black/40">
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

              {/* Partner Logo Marquee — replaces the stats row in the left
                  column. Two rows scroll in opposite directions at different
                  speeds. Edge-faded so tiles drift in/out softly. Pauses on
                  hover. */}
              <div
                className="logo-marquee relative mt-14 overflow-hidden border-t border-black/[0.06] pt-8"
                style={{
                  maskImage:
                    'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
                }}
              >
                <div className="logo-track logo-track-left flex w-max gap-3 pb-2">
                  {[...logoRows.rowA, ...logoRows.rowA].map((entry, i) => (
                    <LogoTile key={`a-${entry.id}-${i}`} entry={entry} mode={logoMode} />
                  ))}
                </div>
                <div className="logo-track logo-track-right flex w-max gap-3 pt-2">
                  {[...logoRows.rowB, ...logoRows.rowB].map((entry, i) => (
                    <LogoTile key={`b-${entry.id}-${i}`} entry={entry} mode={logoMode} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Testimonials */}
            <div ref={testimonialColumnRef} data-section="testimonials" className="relative w-full lg:w-[45%]">
              {/* Decorative halftone peace-hand reaching up behind the
                  testimonial stack. Sits in DOM before the cards so they
                  paint on top — one V finger naturally tucks behind the
                  first card. `mix-blend-mode: multiply` drops the JPEG's
                  white background against the page surface, and a
                  bottom mask softly fades the wrist out. Desktop-only;
                  on narrow viewports the columns stack and there's no
                  visual room for it. */}
              <div
                aria-hidden
                className="pointer-events-none absolute hidden select-none lg:block"
                style={{
                  left: '-160px',
                  top: '-40px',
                  width: '235px',
                  zIndex: 0,
                  mixBlendMode: 'multiply',
                  maskImage:
                    'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.55) 78%, transparent 96%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.55) 78%, transparent 96%)',
                }}
              >
                <Image
                  src="/brand/peace-hand.jpg"
                  alt=""
                  width={607}
                  height={1382}
                  className="h-auto w-full"
                  draggable={false}
                />
              </div>

              {/* Google Reviews Summary Card - Floating style with soft shadow */}
              <div
                className="relative rounded-xl bg-white p-4"
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
                  // Block vertical page-scroll inside the carousel on mobile
                  // so swipes drive the cards instead of the page. Users can
                  // still scroll the page from above/below the carousel.
                  touchAction: isMobile ? 'none' : 'auto',
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

                {/* Mobile swipe hint — shown once when the carousel scrolls
                    into view. The hand + label travel together top→bottom
                    across most of the carousel for 2 cycles (2.8s) and
                    fade in/out at the extremes. No background pill: brand
                    blue with a soft white drop-shadow keeps the elements
                    legible over the static testimonial cards.
                    Any touch on the carousel dismisses it immediately. */}
                {hintActive && (
                  <div
                    className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                    style={{ animation: 'hintFade 2.8s ease-in-out forwards' }}
                  >
                    <div
                      className="flex flex-col items-center gap-2 text-[#3c639f]"
                      style={{
                        animation: 'swipeDrop 1.4s ease-in-out 2',
                        filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))',
                      }}
                    >
                      <Image
                        src="/swipe-down.png"
                        alt=""
                        width={60}
                        height={60}
                        priority
                      />
                      <span className="text-[15px] font-semibold tracking-wide">
                        Kaydırın
                      </span>
                    </div>
                  </div>
                )}
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

        {/* "Neler yapıyoruz?" — projects carousel mirroring the testimonial
            UX: vertical auto-advancing stack on the left, segmented control
            (Geliştirmeler / Operasyonlar) above it, popup on hover/tap.
            Right column is intentionally empty for now. */}
        <ProjectsSection />

        {/* "Neler yaparız?" — two service spotlights side by side. Each card
            has a distinct motif (code lines for Web Site, rising chart for
            Reklamlar) and a hover-animated pill CTA. Matches the spacing
            and structure of the projects section above (no top border, just
            bottom padding) so the two read as one continuous block. */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-16 md:px-12 md:pb-20">
          <div className="mb-8">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
              Hizmetler
            </span>
            <div className="mt-2">
              <h2 className="text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]">
                <span className="font-normal">Neler </span>
                <span className="font-bold text-[#3c639f]">yaparız?</span>
              </h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-black/60">
                Aynı ekip, iki uzmanlık. Markanızı dijital dünyada hem inşa
                ediyor, hem büyütüyoruz.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Center seam — slim vertical gradient line with a tiny `&`
                badge nestled in the middle. Desktop only. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 hidden h-full -translate-x-1/2 md:block"
            >
              <div className="h-full w-px bg-gradient-to-b from-transparent via-[#3c639f]/15 to-transparent" />
              <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#fafafa]">
                <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#3c639f]">
                  &
                </span>
              </div>
            </div>

            {/* Card 1: Web Site — page-mockup that builds itself: outer frame
                strokes in, top bar + window dots appear, then hero/content
                blocks stagger-fade in. Plays once when the card scrolls into
                view, replays on hover. */}
            <a
              ref={webCardRef}
              href="/web-site"
              data-track="home:service-card:web-site"
              data-track-label="Web Site kartı"
              onMouseEnter={() => setWebPlayKey((k) => k + 1)}
              className="service-card group relative overflow-hidden rounded-2xl border border-black/[0.10] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#3c639f]/25 hover:shadow-[0_12px_40px_-12px_rgba(60,99,159,0.18)] md:p-10"
            >
              {/* Page mockup decoration. Key remount restarts the CSS
                  animations from scratch every time it changes. */}
              <svg
                key={webPlayKey}
                aria-hidden
                className="web-mockup pointer-events-none absolute -right-6 -top-6 h-[230px] w-[230px] opacity-65 transition-opacity duration-500 group-hover:opacity-95 md:-right-10 md:-top-10 md:h-[340px] md:w-[340px]"
                viewBox="0 0 176 176"
              >
                <defs>
                  <linearGradient id="webFade" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3c639f" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3c639f" stopOpacity="0" />
                  </linearGradient>
                  <mask id="webMask">
                    <rect width="176" height="176" fill="url(#webFade)" />
                  </mask>
                </defs>
                <g mask="url(#webMask)">
                  {/* Outer browser/page frame — draws with stroke-dasharray */}
                  <rect
                    className="web-frame"
                    x="14" y="20" width="148" height="124" rx="4"
                    fill="none" stroke="#3c639f" strokeWidth="2"
                  />
                  {/* Top bar separator */}
                  <line
                    className="web-topbar"
                    x1="14" y1="38" x2="162" y2="38"
                    stroke="#3c639f" strokeWidth="1.5"
                  />
                  {/* Window dots */}
                  <circle className="web-el web-dot-1" cx="22" cy="29" r="1.8" fill="#3c639f" />
                  <circle className="web-el web-dot-2" cx="28" cy="29" r="1.8" fill="#3c639f" />
                  <circle className="web-el web-dot-3" cx="34" cy="29" r="1.8" fill="#3c639f" />
                  {/* Nav bar — logo on the left, 3 menu items + a filled
                      login pill on the right. */}
                  <rect className="web-el web-logo" x="22" y="46" width="20" height="7" rx="1.5" fill="#3c639f" fillOpacity="0.6" />
                  <rect className="web-el web-nav-1" x="98" y="48" width="10" height="3" rx="1" fill="#3c639f" fillOpacity="0.45" />
                  <rect className="web-el web-nav-2" x="112" y="48" width="10" height="3" rx="1" fill="#3c639f" fillOpacity="0.45" />
                  <rect className="web-el web-nav-3" x="126" y="48" width="10" height="3" rx="1" fill="#3c639f" fillOpacity="0.45" />
                  <rect className="web-el web-login" x="140" y="46" width="16" height="7" rx="2" fill="#3c639f" fillOpacity="0.78" />
                  {/* Hero text — title, two subtitle lines, and a filled CTA
                      button on the left half. */}
                  <rect className="web-el web-title" x="22" y="63" width="60" height="11" rx="2" fill="#3c639f" fillOpacity="0.55" />
                  <rect className="web-el web-sub-1" x="22" y="80" width="60" height="3" rx="1" fill="#3c639f" fillOpacity="0.42" />
                  <rect className="web-el web-sub-2" x="22" y="88" width="44" height="3" rx="1" fill="#3c639f" fillOpacity="0.42" />
                  {/* Primary CTA — solid brand-blue button that pops in. */}
                  <rect className="web-btn" x="22" y="96" width="28" height="11" rx="2.5" fill="#3c639f" fillOpacity="0.92" />
                  {/* Hero image area — a mini device mockup on the right
                      side showing a tiny site preview. The "browser within
                      a browser" reinforces the web-design identity. */}
                  <g className="web-img">
                    <rect x="88" y="62" width="68" height="44" rx="3" fill="#3c639f" fillOpacity="0.13" />
                    <line x1="88" y1="70" x2="156" y2="70" stroke="#3c639f" strokeOpacity="0.28" strokeWidth="0.8" />
                    <circle cx="92" cy="66" r="1" fill="#3c639f" fillOpacity="0.5" />
                    <circle cx="96" cy="66" r="1" fill="#3c639f" fillOpacity="0.5" />
                    <rect x="92" y="74" width="26" height="3" rx="1" fill="#3c639f" fillOpacity="0.58" />
                    <rect x="92" y="80" width="52" height="1.6" rx="0.8" fill="#3c639f" fillOpacity="0.4" />
                    <rect x="92" y="84" width="40" height="1.6" rx="0.8" fill="#3c639f" fillOpacity="0.4" />
                    <rect x="92" y="90" width="24" height="12" rx="1.5" fill="#3c639f" fillOpacity="0.22" />
                    <rect x="120" y="90" width="24" height="12" rx="1.5" fill="#3c639f" fillOpacity="0.22" />
                    <rect x="148" y="90" width="6" height="6" rx="1.2" fill="#3c639f" fillOpacity="0.72" />
                  </g>
                  {/* Three feature cards — each has a mini icon dot + 2 text
                      lines, mimicking a typical features section. */}
                  <g className="web-feat web-feat-1">
                    <rect x="22" y="116" width="40" height="24" rx="2" fill="#3c639f" fillOpacity="0.18" />
                    <circle cx="32" cy="124" r="3" fill="#3c639f" fillOpacity="0.6" />
                    <rect x="38" y="123" width="20" height="2" rx="1" fill="#3c639f" fillOpacity="0.5" />
                    <rect x="26" y="132" width="32" height="2" rx="1" fill="#3c639f" fillOpacity="0.38" />
                  </g>
                  <g className="web-feat web-feat-2">
                    <rect x="68" y="116" width="40" height="24" rx="2" fill="#3c639f" fillOpacity="0.18" />
                    <circle cx="78" cy="124" r="3" fill="#3c639f" fillOpacity="0.6" />
                    <rect x="84" y="123" width="20" height="2" rx="1" fill="#3c639f" fillOpacity="0.5" />
                    <rect x="72" y="132" width="32" height="2" rx="1" fill="#3c639f" fillOpacity="0.38" />
                  </g>
                  <g className="web-feat web-feat-3">
                    <rect x="114" y="116" width="40" height="24" rx="2" fill="#3c639f" fillOpacity="0.18" />
                    <circle cx="124" cy="124" r="3" fill="#3c639f" fillOpacity="0.6" />
                    <rect x="130" y="123" width="20" height="2" rx="1" fill="#3c639f" fillOpacity="0.5" />
                    <rect x="118" y="132" width="32" height="2" rx="1" fill="#3c639f" fillOpacity="0.38" />
                  </g>
                </g>
              </svg>

              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#3c639f]/[0.08] transition-all duration-500 group-hover:scale-105 group-hover:bg-[#3c639f]/[0.14]">
                <Code2 size={26} className="text-[#3c639f]" strokeWidth={1.75} />
              </div>

              <h3 className="relative mt-8 text-[28px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                Web Site
              </h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-black/55">
                Sıfırdan, markanıza özel. Hızlı, modern ve dönüşüm odaklı.
              </p>

              <ul className="relative mt-6 flex flex-col gap-3">
                {[
                  "Next.js + TypeScript ile modern altyapı",
                  "Tasarımdan SEO'ya uçtan uca süreç",
                  "Lighthouse 95+ performans hedefi",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-[14px] leading-relaxed text-black/70"
                  >
                    <Check size={16} className="mt-[3px] shrink-0 text-[#3c639f]" strokeWidth={2.5} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-8">
                <span className="service-cta relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-[#3c639f]/25 bg-white px-5 py-2.5 text-[13px] font-medium text-[#3c639f] transition-colors duration-500 group-hover:border-transparent group-hover:text-white">
                  <span aria-hidden className="service-cta-bg absolute inset-0" />
                  <span className="relative">Detayları gör</span>
                  <ArrowRight
                    size={15}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </a>

            {/* Card 2: Dijital Reklamlar — rising line chart motif. Same
                viewport-entry + hover replay pattern as the web card. */}
            <a
              ref={reklamCardRef}
              href="/dijital-reklamlar"
              data-track="home:service-card:dijital-reklamlar"
              data-track-label="Dijital Reklamlar kartı"
              onMouseEnter={() => setReklamPlayKey((k) => k + 1)}
              className="service-card group relative overflow-hidden rounded-2xl border border-black/[0.10] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#3c639f]/25 hover:shadow-[0_12px_40px_-12px_rgba(60,99,159,0.18)] md:p-10"
            >
              {/* Rising chart decoration — ascending line with peaks and a
                  soft area fill underneath. Spreads into the card as a
                  background pattern. */}
              <svg
                key={reklamPlayKey}
                aria-hidden
                className="chart-mockup pointer-events-none absolute -right-6 -top-6 h-[230px] w-[230px] opacity-65 transition-opacity duration-500 group-hover:opacity-95 md:-right-10 md:-top-10 md:h-[340px] md:w-[340px]"
                viewBox="0 0 176 176"
              >
                <defs>
                  <linearGradient id="chartFade" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3c639f" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3c639f" stopOpacity="0" />
                  </linearGradient>
                  <mask id="chartMask">
                    <rect width="176" height="176" fill="url(#chartFade)" />
                  </mask>
                </defs>
                <g mask="url(#chartMask)">
                  {/* Browser/page frame — matches the web card for visual
                      parity. Strokes in first, then the topbar separator
                      and window dots, then the chart contents appear
                      inside. */}
                  <rect
                    className="chart-frame"
                    x="14" y="20" width="148" height="124" rx="4"
                    fill="none" stroke="#3c639f" strokeWidth="2"
                  />
                  <line
                    className="chart-topbar"
                    x1="14" y1="38" x2="162" y2="38"
                    stroke="#3c639f" strokeWidth="1.5"
                  />
                  <circle className="chart-windot chart-windot-1" cx="22" cy="29" r="1.8" fill="#3c639f" />
                  <circle className="chart-windot chart-windot-2" cx="28" cy="29" r="1.8" fill="#3c639f" />
                  <circle className="chart-windot chart-windot-3" cx="34" cy="29" r="1.8" fill="#3c639f" />
                  {/* Baseline guide — subtle horizontal line below the bars */}
                  <line
                    className="chart-baseline"
                    x1="20" y1="136" x2="156" y2="136"
                    stroke="#3c639f" strokeOpacity="0.18" strokeWidth="1"
                  />
                  {/* 6 zigzag bars inside the frame — alternating low/high
                      with overall upward tendency. Reads like a real
                      performance dashboard: dips and recoveries, ending
                      on the highest peak. */}
                  <rect className="chart-bar chart-bar-1" x="31"  y="112" width="14" height="24" rx="2" fill="#3c639f" fillOpacity="0.30" />
                  <rect className="chart-bar chart-bar-2" x="51"  y="74"  width="14" height="62" rx="2" fill="#3c639f" fillOpacity="0.36" />
                  <rect className="chart-bar chart-bar-3" x="71"  y="102" width="14" height="34" rx="2" fill="#3c639f" fillOpacity="0.34" />
                  <rect className="chart-bar chart-bar-4" x="91"  y="60"  width="14" height="76" rx="2" fill="#3c639f" fillOpacity="0.42" />
                  <rect className="chart-bar chart-bar-5" x="111" y="88"  width="14" height="48" rx="2" fill="#3c639f" fillOpacity="0.4" />
                  <rect className="chart-bar chart-bar-6" x="131" y="48"  width="14" height="88" rx="2" fill="#3c639f" fillOpacity="0.5" />
                  {/* Trend line zigzagging across the bar tops */}
                  <path
                    className="trend-line"
                    d="M 38 108 L 58 70 L 78 98 L 98 56 L 118 84 L 138 44"
                    fill="none"
                    stroke="#3c639f"
                    strokeOpacity="0.85"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Peak dot — bounces in at the final highest point */}
                  <circle className="trend-peak" cx="138" cy="44" r="5" fill="#3c639f" />
                  {/* Pulse ring expanding outward from the peak */}
                  <circle
                    className="trend-peak-ring"
                    cx="138" cy="44" r="5"
                    fill="none"
                    stroke="#3c639f"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                {/* Floating ₺ growth annotation — no pill/border so it
                    reads as part of the chart's decorative layer rather
                    than a separate UI element. Pops in after the peak as
                    a "+38%" revenue growth callout. */}
                <g className="chart-stat">
                  <text
                    x="24" y="56"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="11"
                    fontWeight="700"
                    fill="#3c639f"
                    fillOpacity="0.6"
                  >₺</text>
                  <g className="chart-stat-arrow">
                    <path
                      d="M 36 54 L 39 50 L 42 54"
                      fill="none"
                      stroke="#3c639f"
                      strokeOpacity="0.62"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="39" y1="50.5" x2="39" y2="55"
                      stroke="#3c639f"
                      strokeOpacity="0.62"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                  <text
                    x="44" y="56"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="7.5"
                    fontWeight="600"
                    fill="#3c639f"
                    fillOpacity="0.58"
                  >38%</text>
                </g>
              </svg>

              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#3c639f]/[0.08] transition-all duration-500 group-hover:scale-105 group-hover:bg-[#3c639f]/[0.14]">
                <TrendingUp size={26} className="text-[#3c639f]" strokeWidth={1.75} />
              </div>

              <h3 className="relative mt-8 text-[28px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                Dijital Reklamlar
              </h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-black/55">
                Bütçenizden en yüksek dönüşümü çıkaran kampanyalar.
              </p>

              <ul className="relative mt-6 flex flex-col gap-3">
                {[
                  "Google Ads & Meta Ads yönetimi",
                  "Performans odaklı kampanya stratejisi",
                  "Şeffaf ve sade raporlama paneli",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-[14px] leading-relaxed text-black/70"
                  >
                    <Check size={16} className="mt-[3px] shrink-0 text-[#3c639f]" strokeWidth={2.5} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-8">
                <span className="service-cta relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-[#3c639f]/25 bg-white px-5 py-2.5 text-[13px] font-medium text-[#3c639f] transition-colors duration-500 group-hover:border-transparent group-hover:text-white">
                  <span aria-hidden className="service-cta-bg absolute inset-0" />
                  <span className="relative">Detayları gör</span>
                  <ArrowRight
                    size={15}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </a>
          </div>
        </section>

        <HomeBlogSection />

      </main>

      <SiteFooter />

      {/* Cursor blink + mobile swipe hint animations. Global because the
          @keyframes are referenced from inline style={{ animation: ... }};
          scoped styled-jsx mangles keyframe names and inline styles can't
          find them. */}
      <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        /* Service card CTA — pill button. Idle: white with brand-blue text
           and a 1px brand tint border. Hover (driven by .group on the parent
           card): the absolute bg layer fades in with an animated gradient
           sweep, the text turns white. Combined with the card lift + arrow
           translate it reads as a single coordinated reveal. */
        .service-cta-bg {
          background: linear-gradient(110deg, #2f5288 0%, #3c639f 35%, #6a93ce 55%, #3c639f 75%, #2f5288 100%);
          background-size: 220% 100%;
          background-position: 100% 0;
          opacity: 0;
          transition: opacity 400ms ease;
          border-radius: 6px;
        }
        .group:hover .service-cta-bg {
          opacity: 1;
          animation: serviceCtaSweep 2.4s linear infinite;
        }
        @keyframes serviceCtaSweep {
          0% { background-position: 100% 0; }
          100% { background-position: -120% 0; }
        }
        /* Service card 1 — page mockup that builds itself: outer frame
           strokes in, top bar + window dots appear, then content blocks
           stagger-fade in. Driven entirely by autoplay on mount (the SVG
           is keyed so a key change remounts it and the animations restart
           from scratch). No hover-only state — entry and hover-replay use
           the same animation by remounting the SVG. */
        .web-mockup .web-frame {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: webFrameDraw 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .web-mockup .web-topbar {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
          animation: webBarDraw 500ms cubic-bezier(0.22, 1, 0.36, 1) 850ms forwards;
        }
        .web-mockup .web-el {
          opacity: 0;
          transform-origin: left center;
          transform: scaleX(0.78);
        }
        .web-mockup .web-dot-1 { animation: webElIn 400ms ease 1100ms forwards; }
        .web-mockup .web-dot-2 { animation: webElIn 400ms ease 1180ms forwards; }
        .web-mockup .web-dot-3 { animation: webElIn 400ms ease 1260ms forwards; }
        /* Landing page content — nav, hero, CTA button, image, features */
        .web-mockup .web-logo  { animation: webElIn 500ms cubic-bezier(0.22, 1, 0.36, 1) 1320ms forwards; }
        .web-mockup .web-nav-1 { animation: webElIn 400ms ease 1380ms forwards; }
        .web-mockup .web-nav-2 { animation: webElIn 400ms ease 1440ms forwards; }
        .web-mockup .web-nav-3 { animation: webElIn 400ms ease 1500ms forwards; }
        .web-mockup .web-login { animation: webElIn 420ms ease 1560ms forwards; }
        .web-mockup .web-title { animation: webElIn 550ms cubic-bezier(0.22, 1, 0.36, 1) 1620ms forwards; }
        .web-mockup .web-sub-1 { animation: webElIn 450ms ease 1760ms forwards; }
        .web-mockup .web-sub-2 { animation: webElIn 450ms ease 1840ms forwards; }
        /* CTA button — solid filled rectangle that pops in with a bouncy
           overshoot. The key visual cue that this is a real site landing. */
        .web-mockup .web-btn {
          opacity: 0;
          transform: scale(0);
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: webBtnPop 480ms cubic-bezier(0.34, 1.5, 0.4, 1) 1960ms forwards;
        }
        @keyframes webBtnPop {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        /* Hero image — mini device mockup. Scales up gently as one unit
           alongside the hero text so the right column reads as a single
           block (a tiny website preview) rather than scattered shapes. */
        .web-mockup .web-img {
          opacity: 0;
          transform: scale(0.95);
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: webImgIn 700ms cubic-bezier(0.22, 1, 0.36, 1) 1720ms forwards;
        }
        @keyframes webImgIn {
          to { opacity: 1; transform: scale(1); }
        }
        /* Feature cards — fade in as groups. Translate from below for a
           gentle "rising up" feel rather than scaleX since g-element
           transform-origin can be unreliable across browsers. */
        .web-mockup .web-feat {
          opacity: 0;
          transform: translateY(8px);
        }
        .web-mockup .web-feat-1 { animation: webFeatIn 550ms cubic-bezier(0.22, 1, 0.36, 1) 2280ms forwards; }
        .web-mockup .web-feat-2 { animation: webFeatIn 550ms cubic-bezier(0.22, 1, 0.36, 1) 2400ms forwards; }
        .web-mockup .web-feat-3 { animation: webFeatIn 550ms cubic-bezier(0.22, 1, 0.36, 1) 2520ms forwards; }
        @keyframes webFeatIn {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes webFrameDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes webBarDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes webElIn {
          to { opacity: 1; transform: scaleX(1); }
        }
        /* Service card 2 — browser frame mirrors the web card, then a
           zigzag bar chart with a trend line and peak pulse fills in
           inside the frame. Sequence: frame strokes in → topbar + window
           dots → baseline → bars grow (stagger) → trend line draws →
           peak dot bounces → pulse ring expands outward. */
        .chart-mockup .chart-frame {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: chartFrameDraw 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .chart-mockup .chart-topbar {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
          animation: chartTopbarDraw 500ms cubic-bezier(0.22, 1, 0.36, 1) 850ms forwards;
        }
        .chart-mockup .chart-windot {
          opacity: 0;
          animation: chartWindotIn 350ms ease forwards;
        }
        .chart-mockup .chart-windot-1 { animation-delay: 1100ms; }
        .chart-mockup .chart-windot-2 { animation-delay: 1180ms; }
        .chart-mockup .chart-windot-3 { animation-delay: 1260ms; }
        .chart-mockup .chart-baseline {
          opacity: 0;
          animation: chartBaselineIn 400ms ease 1300ms forwards;
        }
        .chart-mockup .chart-bar {
          transform: scaleY(0);
          transform-origin: 50% 100%;
          transform-box: fill-box;
          animation: chartBarGrow 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .chart-mockup .chart-bar-1 { animation-delay: 1400ms; }
        .chart-mockup .chart-bar-2 { animation-delay: 1490ms; }
        .chart-mockup .chart-bar-3 { animation-delay: 1580ms; }
        .chart-mockup .chart-bar-4 { animation-delay: 1670ms; }
        .chart-mockup .chart-bar-5 { animation-delay: 1760ms; }
        .chart-mockup .chart-bar-6 { animation-delay: 1850ms; }
        .chart-mockup .trend-line {
          stroke-dasharray: 280;
          stroke-dashoffset: 280;
          /* Near-linear easing so the visual end of the draw matches its
             actual finish time — no slow tail that makes the peak feel
             "late" when it actually arrives. */
          animation: chartTrendDraw 1300ms cubic-bezier(0.4, 0, 0.6, 1) 2400ms forwards;
        }
        .chart-mockup .trend-peak {
          opacity: 0;
          transform: scale(0);
          transform-origin: 50% 50%;
          transform-box: fill-box;
          /* Pops exactly when the line completes (3700ms). Short duration
             and snappy bezier so the appearance is instantaneous, not a
             slow bounce. */
          animation: chartPeakPop 220ms cubic-bezier(0.34, 1.5, 0.4, 1) 3680ms forwards;
        }
        .chart-mockup .trend-peak-ring {
          opacity: 0;
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: chartRingPulse 1100ms ease-out 3850ms forwards;
        }
        /* ₺ growth annotation — gentle fade-in after the peak, no bouncy
           overshoot so it blends into the chart's decorative layer rather
           than announcing itself as a UI badge. The arrow does a single
           subtle upward nudge after the annotation settles. */
        .chart-mockup .chart-stat {
          opacity: 0;
          transform: translateY(4px);
          animation: chartStatIn 600ms cubic-bezier(0.22, 1, 0.36, 1) 3800ms forwards;
        }
        @keyframes chartStatIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .chart-mockup .chart-stat-arrow {
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: chartArrowJump 700ms ease-out 4500ms;
        }
        @keyframes chartArrowJump {
          0%   { transform: translateY(0); }
          35%  { transform: translateY(-2px); }
          70%  { transform: translateY(0); }
          100% { transform: translateY(0); }
        }
        @keyframes chartFrameDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes chartTopbarDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes chartWindotIn {
          to { opacity: 1; }
        }
        @keyframes chartBaselineIn {
          to { opacity: 1; }
        }
        @keyframes chartBarGrow {
          to { transform: scaleY(1); }
        }
        @keyframes chartTrendDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes chartPeakPop {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.35); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes chartRingPulse {
          0% { opacity: 0.85; transform: scale(1); }
          100% { opacity: 0; transform: scale(4.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          .service-cta-bg { animation: none; }
          .web-mockup .web-frame,
          .web-mockup .web-topbar,
          .web-mockup .web-el,
          .web-mockup .web-btn,
          .web-mockup .web-img,
          .web-mockup .web-feat,
          .chart-mockup .chart-frame,
          .chart-mockup .chart-topbar,
          .chart-mockup .chart-windot,
          .chart-mockup .chart-baseline,
          .chart-mockup .chart-bar,
          .chart-mockup .trend-line,
          .chart-mockup .trend-peak,
          .chart-mockup .trend-peak-ring,
          .chart-mockup .chart-stat,
          .chart-mockup .chart-stat-arrow {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
            transform: none;
          }
        }
        /* Hand+label travel from near the top of the carousel down toward
           the bottom, fading in at the start and out at the end of each
           cycle — demonstrates a vertical swipe gesture. The ±180px range
           stays within the carousel's visible (non-masked) area. */
        @keyframes swipeDrop {
          0% { transform: translateY(-180px); opacity: 0; }
          14% { transform: translateY(-140px); opacity: 1; }
          86% { transform: translateY(140px); opacity: 1; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        @keyframes hintFade {
          0% { opacity: 0; transform: scale(0.94); }
          10% { opacity: 1; transform: scale(1); }
          90% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.96); }
        }
        /* Operasyonlar tab pulse — ONE slow neon tap every 3s, then idle.
           The tap takes its time expanding (long ring travel, bright cyan
           core + brand-blue outer glow). Stops on first click via the
           opsPulsing state. */
        @keyframes opsPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 0 0 rgba(99, 165, 245, 0),
              0 0 0 0 rgba(60, 99, 159, 0);
          }
          /* Peak */
          8% {
            transform: scale(1.06);
            box-shadow:
              0 0 10px 2px rgba(99, 165, 245, 0.65),
              0 0 0 0 rgba(60, 99, 159, 0.55);
          }
          /* Ring fully travelled, fading */
          45% {
            transform: scale(1.02);
            box-shadow:
              0 0 6px 1px rgba(99, 165, 245, 0),
              0 0 0 22px rgba(60, 99, 159, 0);
          }
          55%, 100% {
            transform: scale(1);
            box-shadow:
              0 0 0 0 rgba(99, 165, 245, 0),
              0 0 0 0 rgba(60, 99, 159, 0);
          }
        }
        /* Brand-blue text shimmer for the "devamını gör" button. A lighter
           blue highlight sweeps left→right through the text via a moving
           background-position on a clipped gradient. */
        .devamini-shimmer {
          background-image: linear-gradient(
            90deg,
            #3c639f 0%,
            #3c639f 38%,
            #7aaef0 50%,
            #3c639f 62%,
            #3c639f 100%
          );
          background-size: 250% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: devaminiShimmer 2.6s ease-in-out infinite;
        }
        @keyframes devaminiShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
        /* Partner logo marquee — two rows scrolling in opposite directions
           at different speeds. Content is duplicated in JSX so translating
           the track by -50% / +50% loops seamlessly. Pauses on hover so a
           logo can be read. */
        .logo-track {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .logo-track-left {
          animation-name: marqueeLeft;
          animation-duration: 38s;
        }
        .logo-track-right {
          animation-name: marqueeRight;
          animation-duration: 58s;
        }
        .logo-marquee:hover .logo-track {
          animation-play-state: paused;
        }
        @keyframes marqueeLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marqueeRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-track { animation: none; }
        }
        /* Popup scroll regions — vertical only, minimal thumb. Horizontal
           scrollbar is suppressed entirely. Matches across Firefox and
           Chrome/WebKit. */
        .popup-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(60, 99, 159, 0.28) transparent;
        }
        .popup-scroll::-webkit-scrollbar {
          width: 5px;
          height: 0;
        }
        .popup-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .popup-scroll::-webkit-scrollbar-thumb {
          background: rgba(60, 99, 159, 0.28);
          border-radius: 4px;
        }
        .popup-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(60, 99, 159, 0.5);
        }
        .popup-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  )
}
