import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Image from "next/image"
import { LogOut, LayoutDashboard, MessageSquare, Package, Briefcase, Settings, Image as ImageIcon, BookOpen, Users, Activity, FolderKanban, Sparkles, Scale, PanelBottom, Mail, MailPlus, Send, Globe, Info } from "lucide-react"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import { logoutAction } from "../(auth)/login/actions"
import { SideLink } from "./side-link"

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

  return (
    <div className="flex min-h-screen bg-[#f5f8ff]">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-black/[0.06] bg-white">
        <div className="flex h-16 items-center border-b border-black/[0.06] px-5">
          <Image
            src="/brand/webreta-logo.webp"
            alt="Webreta"
            width={364}
            height={64}
            priority
            className="h-6 w-auto"
          />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <SideLink href="/admin" icon={<LayoutDashboard size={16} />}>
            Anasayfa
          </SideLink>
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
          <SideLink href="/admin/analitik" icon={<Activity size={16} />}>
            Analitik
          </SideLink>
          <SideLink href="/admin/footer" icon={<PanelBottom size={16} />}>
            Footer
          </SideLink>
          <SideLink href="/admin/yasal-sayfalar" icon={<Scale size={16} />}>
            Yasal Sayfalar
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
          <SideLink href="#" icon={<Briefcase size={16} />} disabled>
            Teklifler
          </SideLink>
          <SideLink href="#" icon={<Settings size={16} />} disabled>
            Ayarlar
          </SideLink>
        </nav>

        <div className="border-t border-black/[0.06] p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-black/60 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              Çıkış yap
            </button>
          </form>
        </div>
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
          </div>
        </header>

        <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
      </div>
    </div>
  )
}

