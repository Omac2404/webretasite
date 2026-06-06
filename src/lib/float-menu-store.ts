// Server-only yüzen menü ayarları store'u. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import { DEFAULT_FLOAT_MENU, type FloatMenuConfig } from "./float-menu-types"

const DATA_FILE = path.join(process.cwd(), "data", "float-menu.json")

type Partialish<T> = { [K in keyof T]?: Partial<T[K]> }

function normalize(raw: Partialish<FloatMenuConfig> & { enabled?: unknown }): FloatMenuConfig {
  const webSite = raw.webSite ?? {}
  const ads = raw.ads ?? {}
  const contact = raw.contact ?? {}
  const desktopWhatsapp = raw.desktopWhatsapp ?? {}
  return {
    enabled: raw.enabled !== false,
    webSite: {
      enabled: webSite.enabled !== false,
      label: String(webSite.label ?? DEFAULT_FLOAT_MENU.webSite.label),
      href: String(webSite.href ?? DEFAULT_FLOAT_MENU.webSite.href),
    },
    ads: {
      enabled: ads.enabled !== false,
      label: String(ads.label ?? DEFAULT_FLOAT_MENU.ads.label),
      href: String(ads.href ?? DEFAULT_FLOAT_MENU.ads.href),
    },
    contact: {
      enabled: contact.enabled !== false,
      label: String(contact.label ?? DEFAULT_FLOAT_MENU.contact.label),
      phone: String(contact.phone ?? DEFAULT_FLOAT_MENU.contact.phone),
      whatsapp: String(contact.whatsapp ?? DEFAULT_FLOAT_MENU.contact.whatsapp),
      whatsappMessage: String(
        contact.whatsappMessage ?? DEFAULT_FLOAT_MENU.contact.whatsappMessage,
      ),
    },
    desktopWhatsapp: {
      enabled: desktopWhatsapp.enabled !== false,
    },
  }
}

export async function readFloatMenu(): Promise<FloatMenuConfig> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partialish<FloatMenuConfig>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_FLOAT_MENU }
    }
    throw err
  }
}

export async function writeFloatMenu(config: FloatMenuConfig): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(config), null, 2) + "\n",
    "utf8",
  )
}
