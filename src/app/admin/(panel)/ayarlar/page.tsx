import { Image as ImageIcon, Wrench, FileJson, History, PanelTop, Users } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import { findAdminByEmail, listAdmins } from "@/lib/admin-users-store"
import { MASTER_ADMIN_EMAIL } from "@/lib/admin-users-types"
import { readAuditLog } from "@/lib/audit-log-store"
import { readSiteSettings } from "@/lib/site-settings-store"
import { AdminsSection } from "./admins-section"
import { AuditSection } from "./audit-section"
import { FaviconForm } from "./favicon-form"
import { LogoForm } from "./logo-form"
import { MaintenanceForm } from "./maintenance-form"
import { RestoreForm } from "./restore-form"

export const dynamic = "force-dynamic"

export default async function AyarlarPage() {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  const currentEmail = session?.username ?? ""

  const [settings, auditEntries, admins] = await Promise.all([
    readSiteSettings(),
    readAuditLog(),
    listAdmins(),
  ])

  const currentAdmin = currentEmail
    ? await findAdminByEmail(currentEmail)
    : null
  const canManageAdmins =
    currentEmail === MASTER_ADMIN_EMAIL || Boolean(currentAdmin?.isMaster)

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Ayarlar
        </h1>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <PanelTop size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Site logosu
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Header'da ve admin panelinde görünen yatay logo. Şeffaf zeminli
          PNG/WebP veya SVG önerilir; yükseklik otomatik 24-28 px civarına ölçülür.
        </p>
        <div className="mt-4">
          <LogoForm currentUrl={settings.logoUrl} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <ImageIcon size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Tarayıcı sekmesi ikonu (favicon)
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Sekmede gözüken küçük logo. Kare oranlı, en az 32×32 px önerilir;
          ICO/PNG/SVG kabul ediliyor.
        </p>
        <div className="mt-4">
          <FaviconForm currentUrl={settings.faviconUrl} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Bakım modu
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Yayını kısa süreliğine durdurmak istediğinde aç. Üst kısımda sarı bir
          banner gösterilir; admin paneli ve içerikler erişilebilir kalır.
        </p>
        <div className="mt-4">
          <MaintenanceForm initial={settings.maintenance} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <FileJson size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Veri yedeği
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Tüm admin verilerini (içerikler, ayarlar, kayıtlı talepler) tek
          dosyada indir. Sunucu değişikliği veya geri yükleme için saklayabilirsin.
        </p>
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/ayarlar/yedek"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288]"
            >
              <FileJson size={14} />
              JSON yedeği indir
            </Link>
            <span className="text-[11.5px] text-black/45">
              Yedek dosyası: <code className="rounded bg-black/[0.05] px-1.5 py-0.5">webreta-backup-YYYY-MM-DD.json</code>
            </span>
          </div>
          <div className="border-t border-black/[0.04] pt-5">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-black/55">
              Geri yükle
            </div>
            <p className="mt-1 text-[12px] text-black/50">
              İndirdiğin yedek JSON'unu yükle, içindeki tüm dosyalar{" "}
              <code>data/</code> klasörüne yazılır.
            </p>
            <div className="mt-3">
              <RestoreForm />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Admin kullanıcıları
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Panele giriş yapabilecek kullanıcılar. Yeni admin ekleme yalnızca master
          admin (<code className="rounded bg-black/[0.05] px-1.5 py-0.5">{MASTER_ADMIN_EMAIL}</code>) için aktif.
        </p>
        <div className="mt-4">
          <AdminsSection
            admins={admins}
            canManage={canManageAdmins}
            currentEmail={currentEmail}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <History size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            İşlem geçmişi
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Admin tarafında yapılan kritik işlemlerin son 500 kaydı. En yenisi üstte.
        </p>
        <div className="mt-4">
          <AuditSection entries={auditEntries} />
        </div>
      </section>
    </div>
  )
}
