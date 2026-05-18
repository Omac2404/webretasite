"use server"

import { revalidatePath } from "next/cache"
import {
  clearEvents,
  clearEventsForDay,
  clearEventsForMonth,
} from "@/lib/analytics-store"
import { setAnalyticsEnabled } from "@/lib/analytics-settings"

export async function clearAnalyticsAction(
  _formData?: FormData,
): Promise<void> {
  await clearEvents()
  revalidatePath("/admin/analitik")
}

export async function clearDayAction(formData: FormData): Promise<void> {
  const day = String(formData.get("day") ?? "").trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return
  await clearEventsForDay(day)
  revalidatePath("/admin/analitik")
}

export async function clearMonthAction(formData: FormData): Promise<void> {
  const month = String(formData.get("month") ?? "").trim()
  if (!/^\d{4}-\d{2}$/.test(month)) return
  await clearEventsForMonth(month)
  revalidatePath("/admin/analitik")
}

export async function setEnabledAction(formData: FormData): Promise<void> {
  const enabled = String(formData.get("enabled") ?? "") === "true"
  await setAnalyticsEnabled(enabled)
  revalidatePath("/admin/analitik")
}
