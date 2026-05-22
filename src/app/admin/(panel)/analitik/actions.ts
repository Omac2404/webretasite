"use server"

import { revalidatePath } from "next/cache"
import { clearEvents } from "@/lib/analytics-store"
import { setAnalyticsEnabled } from "@/lib/analytics-settings"

export async function clearAnalyticsAction(): Promise<void> {
  await clearEvents()
  revalidatePath("/admin/analitik")
}

export async function setEnabledAction(formData: FormData): Promise<void> {
  const enabled = String(formData.get("enabled") ?? "") === "true"
  await setAnalyticsEnabled(enabled)
  revalidatePath("/admin/analitik")
}
