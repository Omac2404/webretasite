// Server-only form success screen store'u. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_FORM_SUCCESS,
  FORM_SUCCESS_META,
  type FormSuccessScreen,
  type FormSuccessScreens,
} from "./form-success-types"

const DATA_FILE = path.join(process.cwd(), "data", "form-success.json")

function normalize(raw: Partial<FormSuccessScreens>): FormSuccessScreens {
  const out = {} as FormSuccessScreens
  for (const meta of FORM_SUCCESS_META) {
    const fallback = DEFAULT_FORM_SUCCESS[meta.key]
    const incoming = (raw[meta.key] ?? {}) as Partial<FormSuccessScreen>
    out[meta.key] = {
      title: String(incoming.title ?? fallback.title),
      body: String(incoming.body ?? fallback.body),
      ctaLabel: String(incoming.ctaLabel ?? fallback.ctaLabel),
    }
  }
  return out
}

export async function readFormSuccess(): Promise<FormSuccessScreens> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<FormSuccessScreens>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_FORM_SUCCESS }
    }
    throw err
  }
}

export async function writeFormSuccess(
  next: FormSuccessScreens,
): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(next), null, 2) + "\n",
    "utf8",
  )
}
