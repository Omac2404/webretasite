import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Image from "next/image"
import { LogOut, LayoutDashboard, MessageSquare, Package, Briefcase, Settings, Image as ImageIcon, BookOpen, Users, Activity, FolderKanban, Sparkles, Scale, PanelBottom, Mail, MailPlus, Send, Globe, Info, Search, Smartphone, Signpost, Images, Cookie, Code2 } from "lucide-react"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import { Toaster } from "@/components/admin/Toaster"
import { findAdminByEmail } from "@/lib/admin-users-store"
import { readAppointments } from "@/lib/appointments-store"
import { readInquiries } from "@/lib/inquiries-store"
import { readQuotes } from "@/lib/quotes-store"
import { readSiteSettings } from "@/lib/site-settings-store"
import { DEFAULT_LOGO_URL } from "@/lib/site-settings-types"
import { readSeen } from "@/lib/talepler-seen-store"
import { logoutAction } from "../(auth)/login/actions"
import { SideLink } from "./side-link"

function SideGroup({ label }: { label: string }) {
  return (
    <div className="mt-2 px-3 pb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-black/35">
      {label}
    </div>
  )
}

// Server-side guard. The middleware already redirects unauthenticated
// hits, but checking again here means a logged-out direct render (or a
// stale cookie that fails HMAC) still bounces to /admin/login instead
// of leaking an admin shell skeleton.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  if (!session) redirect("/admin/login")

  // Force re-login if the cookie's username isn't a current admin email.
  // Happens when the session predates the multi-admin migration (old
  // session had username "admin") or after an account was removed.
  // Can't delete the cookie here — only server actions/routes may write
  // cookies — but the next login will overwrite it.
  const sessionAdmin = await findAdminByEmail(session.username)
  if (!sessionAdmin) redirect("/admin/login")

  // Count form submissions newer than the admin's last visit to
  // /admin/talepler — surfaces as a red badge on the sidebar item.
  const [seen, inquiries, quotes, appointments, siteSettings] = await Promise.all([
    readSeen(),
    readInquiries(),
    readQuotes(),
    readAppointments(),
    readSiteSettings(),
  ])
  const adminLogoUrl = siteSettings.logoUrl || DEFAULT_LOGO_URL
  const cutoff = seen.lastSeenAt
  const newerThan = (iso: string) => !cutoff || iso > cutoff
  const talepUnread =
    inquiries.inquiries.filter((i) => newerThan(i.createdAt)).length +
    quotes.quotes.filter((q) => newerThan(q.createdAt)).length +
    appointments.appointments.filter((a) => newerThan(a.createdAt)).length

  return (
    <div className="flex min-h-screen bg-[#f5f8ff]">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-black/[0.06] bg-white">
        <div className="flex h-16 items-center border-b border-black/[0.06] px-5">
          {adminLogoUrl === DEFAULT_LOGO_URL ? (
            <Image
              src={adminLogoUrl}
              alt="Webreta"
              width={364}
              height={64}
              priority
              className="h-6 w-auto"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={adminLogoUrl} alt="Webreta" className="h-6 w-auto" />
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
          <SideLink href="/admin" icon={<LayoutDashboard size={16} />}>
            Anasayfa
          </SideLink>

          <SideGroup label="İçerik" />
          <SideLink href="/admin/hakkimizda" icon={<Info size={16} />}>
            Hakkımızda
          </SideLink>
          <SideLink href="/admin/referanslar" icon={<ImageIcon size={16} />}>
            Referanslar
          </SideLink>
          <SideLink href="/admin/projeler" icon={<FolderKanban size={16} />}>
            Projeler
          </SideLink>
          <SideLink href="/admin/hizmetler" icon={<Sparkles size={16} />}>
            Hizmetler
          </SideLink>
          <SideLink href="/admin/yorumlar" icon={<MessageSquare size={16} />}>
            Yorumlar
          </SideLink>
          <SideLink href="/admin/paketler" icon={<Package size={16} />}>
            Paketler
          </SideLink>
          <SideLink href="/admin/web-paketleri" icon={<Globe size={16} />}>
            Web Paketleri
          </SideLink>
          <SideLink href="/admin/blog" icon={<BookOpen size={16} />}>
            Blog
          </SideLink>
          <SideLink href="/admin/yazarlar" icon={<Users size={16} />}>
            Yazarlar
          </SideLink>
          <SideLink href="/admin/gorseller" icon={<Images size={16} />}>
            Görseller
          </SideLink>

          <SideGroup label="Form & İletişim" />
          <SideLink
            href="/admin/talepler"
            icon={<Briefcase size={16} />}
            badge={talepUnread}
          >
            Talepler
          </SideLink>
          <SideLink href="/admin/iletisim" icon={<Mail size={16} />}>
            İletişim
          </SideLink>
          <SideLink href="/admin/smtp" icon={<Send size={16} />}>
            SMTP & Formlar
          </SideLink>
          <SideLink href="/admin/e-posta-sablonlari" icon={<MailPlus size={16} />}>
            E-posta Şablonları
          </SideLink>

          <SideGroup label="Site" />
          <SideLink href="/admin/footer" icon={<PanelBottom size={16} />}>
            Footer
          </SideLink>
          <SideLink href="/admin/float-menu" icon={<Smartphone size={16} />}>
            Mobil Yüzen Menü
          </SideLink>
          <SideLink href="/admin/yasal-sayfalar" icon={<Scale size={16} />}>
            Yasal Sayfalar
          </SideLink>
          <SideLink href="/admin/seo" icon={<Search size={16} />}>
            SEO
          </SideLink>
          <SideLink href="/admin/yonlendirmeler" icon={<Signpost size={16} />}>
            Yönlendirmeler
          </SideLink>
          <SideLink href="/admin/cerezler" icon={<Cookie size={16} />}>
            Çerez Yönetimi
          </SideLink>
          <SideLink href="/admin/kod-ekleme" icon={<Code2 size={16} />}>
            Kod Ekleme
          </SideLink>

          <SideGroup label="Sistem" />
          <SideLink href="/admin/analitik" icon={<Activity size={16} />}>
            Analitik
          </SideLink>
          <SideLink href="/admin/ayarlar" icon={<Settings size={16} />}>
            Ayarlar
          </SideLink>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white/80 px-8 backdrop-blur-md">
          <div className="text-[14px] text-black/55">
            Yönetim Paneli
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[12.5px] font-medium text-[#0a0a0a]">
                {session.username}
              </div>
              <div className="text-[10.5px] text-black/45">Yönetici</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3c639f] text-[13px] font-semibold text-white">
              {session.username.charAt(0).toUpperCase()}
            </div>
            <form action={logoutAction} className="ml-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-2 text-[12.5px] font-medium text-black/60 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={14} />
                Çıkış yap
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-8 py-8">
          <Toaster>{children}</Toaster>
        </main>
      </div>
    </div>
  )
}

