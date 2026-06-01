"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import { addAdmin, findAdminByEmail, removeAdmin } from "@/lib/admin-users-store"
import { MASTER_ADMIN_EMAIL } from "@/lib/admin-users-types"
import { recordAudit } from "@/lib/audit-log-store"

export type AdminSaveState = { ok?: boolean; error?: string }

async function isMasterRequest(): Promise<boolean> {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  if (!session) return false
  // Treat the configured master email as the privileged actor — even if
  // it's not literally marked isMaster in storage (e.g. seeded later).
  if (session.username === MASTER_ADMIN_EMAIL) return true
  const admin = await findAdminByEmail(session.username)
  return Boolean(admin?.isMaster)
}

export async function addAdminAction(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  if (!(await isMasterRequest())) {
    return { error: "Yeni admin eklemek için master admin yetkisi gerekli." }
  }
  const email = String(formData.get("email") ?? "")
  const name = String(formData.get("name") ?? "")
  const password = String(formData.get("password") ?? "")
  const res = await addAdmin({ email, name, password })
  if (!res.ok) return { error: res.error }
  await recordAudit("admin.add", { target: res.admin.email })
  revalidatePath("/admin/ayarlar")
  return { ok: true }
}

export async function removeAdminAction(formData: FormData): Promise<void> {
  if (!(await isMasterRequest())) return
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const res = await removeAdmin(id)
  if (res.ok) {
    await recordAudit("admin.remove", { target: id })
    revalidatePath("/admin/ayarlar")
  }
}
