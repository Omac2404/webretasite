// Server-only iletişim sayfası içerik store'u. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import { DEFAULT_CONTACT, type ContactContent } from "./contact-types"

const DATA_FILE = path.join(process.cwd(), "data", "contact.json")

type Partialish<T> = { [K in keyof T]?: Partial<T[K]> }

function normalize(raw: Partialish<ContactContent>): ContactContent {
  const hero = raw.hero ?? {}
  const info = (raw.info ?? {}) as Partial<ContactContent["info"]> & {
    address?: string
  }
  const form = raw.form ?? {}
  const map = raw.map ?? {}
  // Legacy support: older docs stored a single `address` field. Promote
  // it to addressLine1 when no explicit lines are present.
  const legacyAddress = typeof info.address === "string" ? info.address : ""
  return {
    hero: {
      kicker: String(hero.kicker ?? DEFAULT_CONTACT.hero.kicker),
      titleLeading: String(hero.titleLeading ?? DEFAULT_CONTACT.hero.titleLeading),
      titleHighlight: String(hero.titleHighlight ?? DEFAULT_CONTACT.hero.titleHighlight),
      titleTrailing: String(hero.titleTrailing ?? DEFAULT_CONTACT.hero.titleTrailing),
      intro: String(hero.intro ?? DEFAULT_CONTACT.hero.intro),
    },
    info: {
      email: String(info.email ?? DEFAULT_CONTACT.info.email),
      phone: String(info.phone ?? DEFAULT_CONTACT.info.phone),
      addressLine1: String(
        info.addressLine1 ?? legacyAddress ?? DEFAULT_CONTACT.info.addressLine1,
      ),
      addressLine2: String(
        info.addressLine2 ?? DEFAULT_CONTACT.info.addressLine2,
      ),
      hours: String(info.hours ?? DEFAULT_CONTACT.info.hours),
    },
    form: {
      kicker: String(form.kicker ?? DEFAULT_CONTACT.form.kicker),
      titleLeading: String(form.titleLeading ?? DEFAULT_CONTACT.form.titleLeading),
      titleHighlight: String(form.titleHighlight ?? DEFAULT_CONTACT.form.titleHighlight),
      titleTrailing: String(form.titleTrailing ?? DEFAULT_CONTACT.form.titleTrailing),
      intro: String(form.intro ?? DEFAULT_CONTACT.form.intro),
    },
    map: {
      kicker: String(map.kicker ?? DEFAULT_CONTACT.map.kicker),
      titleLeading: String(map.titleLeading ?? DEFAULT_CONTACT.map.titleLeading),
      titleHighlight: String(map.titleHighlight ?? DEFAULT_CONTACT.map.titleHighlight),
      titleTrailing: String(map.titleTrailing ?? DEFAULT_CONTACT.map.titleTrailing),
      intro: String(map.intro ?? DEFAULT_CONTACT.map.intro),
      embedSrc: String(map.embedSrc ?? DEFAULT_CONTACT.map.embedSrc),
      shareUrl: String(map.shareUrl ?? DEFAULT_CONTACT.map.shareUrl),
    },
  }
}

export async function readContact(): Promise<ContactContent> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partialish<ContactContent>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_CONTACT }
    }
    throw err
  }
}

export async function writeContact(content: ContactContent): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(content), null, 2) + "\n",
    "utf8",
  )
}
