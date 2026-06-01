// Server-only randevu store'u.

import { promises as fs } from "node:fs"
import path from "node:path"
import type { Appointment, AppointmentsData } from "./appointments-types"

const DATA_FILE = path.join(process.cwd(), "data", "appointments.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(a: Partial<Appointment>): Appointment {
  return {
    id: String(a.id ?? makeId()),
    channelKey: String(a.channelKey ?? ""),
    channelLabel: String(a.channelLabel ?? ""),
    pkgKey: String(a.pkgKey ?? ""),
    pkgName: String(a.pkgName ?? ""),
    pkgPrice: String(a.pkgPrice ?? ""),
    name: String(a.name ?? ""),
    phone: String(a.phone ?? ""),
    email: String(a.email ?? ""),
    date: String(a.date ?? ""),
    hour: Number(a.hour ?? 0),
    mailUserSent: Boolean(a.mailUserSent),
    mailAdminSent: Boolean(a.mailAdminSent),
    mailError: a.mailError ? String(a.mailError) : undefined,
    createdAt: String(a.createdAt ?? new Date().toISOString()),
  }
}

export async function readAppointments(): Promise<AppointmentsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AppointmentsData> & {
      appointments?: Array<Partial<Appointment>>
    }
    return {
      appointments: Array.isArray(parsed.appointments)
        ? parsed.appointments.map(normalize)
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { appointments: [] }
    }
    throw err
  }
}

async function writeAppointments(data: AppointmentsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Serialize concurrent writes so two near-simultaneous submissions don't
// race the read-modify-write cycle on the JSON file.
let writeQueue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(task)
  writeQueue = p.catch(() => undefined)
  return p
}

export async function appendAppointment(
  input: Omit<Appointment, "id" | "createdAt">,
): Promise<Appointment> {
  return enqueue(async () => {
    const data = await readAppointments()
    const appointment: Appointment = normalize({
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    })
    data.appointments.unshift(appointment)
    await writeAppointments(data)
    return appointment
  })
}

export async function deleteAppointment(id: string): Promise<void> {
  await enqueue(async () => {
    const data = await readAppointments()
    data.appointments = data.appointments.filter((a) => a.id !== id)
    await writeAppointments(data)
  })
}
