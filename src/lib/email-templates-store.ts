// Server-only mail şablonları store'u. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_TEMPLATES,
  TEMPLATE_META,
  type EmailTemplate,
  type EmailTemplates,
  type TemplateKey,
} from "./email-templates-types"

const DATA_FILE = path.join(process.cwd(), "data", "email-templates.json")

function normalize(raw: Partial<EmailTemplates>): EmailTemplates {
  const out = {} as EmailTemplates
  for (const meta of TEMPLATE_META) {
    const fallback = DEFAULT_TEMPLATES[meta.key]
    const incoming = (raw[meta.key] ?? {}) as Partial<EmailTemplate>
    out[meta.key] = {
      subject: String(incoming.subject ?? fallback.subject),
      body: String(incoming.body ?? fallback.body),
    }
  }
  return out
}

export async function readTemplates(): Promise<EmailTemplates> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<EmailTemplates>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_TEMPLATES }
    }
    throw err
  }
}

export async function writeTemplates(next: EmailTemplates): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(next), null, 2) + "\n",
    "utf8",
  )
}

// `{name}` → input.name. Tanımsız anahtarlar boş string'e dönüşür ki maile
// "{undefined}" sızmasın.
export function renderTemplate(
  template: EmailTemplate,
  vars: Record<string, string | number | undefined>,
): { subject: string; body: string } {
  const replace = (str: string): string =>
    str.replace(/\{(\w+)\}/g, (_, key: string) => {
      const v = vars[key]
      return v == null ? "" : String(v)
    })
  return {
    subject: replace(template.subject),
    body: replace(template.body),
  }
}

export async function getRenderedTemplate(
  key: TemplateKey,
  vars: Record<string, string | number | undefined>,
): Promise<{ subject: string; body: string }> {
  const all = await readTemplates()
  return renderTemplate(all[key], vars)
}
