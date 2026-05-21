// Server-only form-legal store. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_FORM_LEGAL,
  FORM_LEGAL_KEYS,
  type FormLegalRequirements,
} from "./form-legal-types"

const DATA_FILE = path.join(process.cwd(), "data", "form-legal.json")

function normalize(raw: Partial<FormLegalRequirements>): FormLegalRequirements {
  const out = {} as FormLegalRequirements
  for (const key of FORM_LEGAL_KEYS) {
    const value = raw[key]
    out[key] = Array.isArray(value)
      ? value.map((v) => String(v)).filter((v) => v.length > 0)
      : []
  }
  return out
}

export async function readFormLegal(): Promise<FormLegalRequirements> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<FormLegalRequirements>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_FORM_LEGAL }
    }
    throw err
  }
}

export async function writeFormLegal(
  next: FormLegalRequirements,
): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(next), null, 2) + "\n",
    "utf8",
  )
}
