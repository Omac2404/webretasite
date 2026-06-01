"use client"

import { useActionState, useState } from "react"
import { AlertCircle, Check, Loader2, Trash2, UserPlus } from "lucide-react"
import type { AdminUser } from "@/lib/admin-users-types"
import {
  addAdminAction,
  removeAdminAction,
  type AdminSaveState,
} from "./admins-actions"

const FMT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function AdminsSection({
  admins,
  canManage,
  currentEmail,
}: {
  admins: AdminUser[]
  canManage: boolean
  currentEmail: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-black/[0.04] rounded-lg border border-black/[0.06] bg-white">
        {admins.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 px-3 py-2.5 text-[12.5px]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3c639f]/[0.10] text-[12px] font-semibold text-[#3c639f]">
              {a.name.charAt(0).toUpperCase() || a.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="truncate font-medium text-[#0a0a0a]">
                  {a.name}
                </span>
                {a.isMaster && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-700">
                    Master
                  </span>
                )}
                {a.email === currentEmail && (
                  <span className="rounded-full bg-[#3c639f]/[0.10] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#3c639f]">
                    Sen
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-black/45">
                <span className="font-mono">{a.email}</span>
                <span>·</span>
                <span>{FMT.format(new Date(a.createdAt))} eklendi</span>
              </div>
            </div>
            {canManage && !a.isMaster && (
              <form action={removeAdminAction}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  aria-label="Sil"
                  title="Sil"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-black/35 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {canManage ? (
        <AddAdminForm />
      ) : (
        <p className="text-[11.5px] text-black/45">
          Yeni admin kullanıcı ekleyebilmek için master admin
          (webreta.digital@gmail.com) ile giriş yapın.
        </p>
      )}
    </div>
  )
}

function AddAdminForm() {
  const [state, formAction, pending] = useActionState<AdminSaveState, FormData>(
    addAdminAction,
    {},
  )
  const [showPwd, setShowPwd] = useState(false)

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-black/[0.12] bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <input
        name="email"
        type="email"
        placeholder="E-posta"
        required
        className={inputCls}
      />
      <input
        name="name"
        type="text"
        placeholder="Ad Soyad"
        className={inputCls}
      />
      <div className="relative">
        <input
          name="password"
          type={showPwd ? "text" : "password"}
          placeholder="Şifre (en az 8 karakter)"
          required
          minLength={8}
          className={`${inputCls} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] font-medium text-black/45 hover:text-[#3c639f]"
        >
          {showPwd ? "Gizle" : "Göster"}
        </button>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#3c639f] px-3 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
        Ekle
      </button>

      {state.ok && !pending && (
        <span className="col-span-full inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
          <Check size={14} /> Eklendi
        </span>
      )}
      {state.error && (
        <span className="col-span-full inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
          <AlertCircle size={14} /> {state.error}
        </span>
      )}
    </form>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2 text-[12.5px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-2 focus:ring-[#3c639f]/[0.10]"
