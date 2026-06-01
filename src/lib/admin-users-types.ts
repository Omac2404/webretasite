// Multi-admin support. Master admin is auto-seeded on first read and
// cannot be removed; additional admins can be added/removed from the
// Ayarlar section. Pure types — safe to import from client components.

export type AdminUser = {
  id: string
  email: string // unique, used as login identifier
  name: string
  passwordHash: string // scrypt: "<salt>.<keyHex>"
  isMaster: boolean
  createdAt: string
}

export type AdminUsersData = {
  admins: AdminUser[]
}

export const MASTER_ADMIN_EMAIL = "webreta.digital@gmail.com"
