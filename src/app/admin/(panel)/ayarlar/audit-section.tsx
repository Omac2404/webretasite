import { History } from "lucide-react"
import type { AuditEntry } from "@/lib/audit-log-store"

const ACTION_LABEL: Record<string, string> = {
  "auth.login.ok": "Giriş yaptı",
  "auth.login.fail": "Hatalı giriş denemesi",
  "auth.logout": "Çıkış yaptı",
  "inquiry.delete": "İletişim mesajı silindi",
  "quote.delete": "Teklif kaydı silindi",
  "appointment.delete": "Randevu silindi",
  "settings.favicon.upload": "Favicon yüklendi",
  "settings.favicon.reset": "Favicon sıfırlandı",
  "settings.logo.upload": "Site logosu yüklendi",
  "settings.logo.reset": "Site logosu sıfırlandı",
  "settings.maintenance.on": "Bakım modu açıldı",
  "settings.maintenance.off": "Bakım modu kapatıldı",
  "backup.restore": "Yedek geri yüklendi",
}

const FMT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function fmt(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : FMT.format(d)
}

export function AuditSection({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-[12.5px] text-black/45">
        Henüz kayıt yok. Admin işlemleri burada listelenir (son 500 satır).
      </p>
    )
  }
  const visible = entries.slice(0, 50)
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-black/[0.04] rounded-lg border border-black/[0.06] bg-white">
        {visible.map((e) => {
          const label = ACTION_LABEL[e.action] ?? e.action
          const failed = e.action.endsWith(".fail")
          return (
            <li key={e.id} className="flex items-start gap-3 px-3 py-2.5">
              <History
                size={12}
                className={`mt-0.5 shrink-0 ${failed ? "text-red-500" : "text-[#3c639f]/60"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                  <span className="font-medium text-[#0a0a0a]">{label}</span>
                  {e.target && (
                    <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[10.5px] text-black/55">
                      {e.target}
                    </code>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-black/45">
                  <span>{fmt(e.ts)}</span>
                  <span>·</span>
                  <span className="font-mono">{e.user}</span>
                  {e.note && (
                    <>
                      <span>·</span>
                      <span className="truncate">{e.note}</span>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {entries.length > visible.length && (
        <p className="text-[11px] text-black/40">
          + {entries.length - visible.length} daha eski kayıt (gösterilmiyor)
        </p>
      )}
    </div>
  )
}
