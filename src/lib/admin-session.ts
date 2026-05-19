// Admin session helpers. Used by the login server action (Node runtime)
// and the route middleware (Edge runtime), so the implementation sticks
// to the Web Crypto API and globals that work in both environments.
//
// Cookie value is `<base64-payload>.<base64-hmac>`. Payload is a JSON
// blob holding the username and an issued-at timestamp; the HMAC is
// verified with `crypto.subtle.verify` (timing-safe by spec). When the
// 12h lifetime expires, the cookie no longer validates and the user is
// pushed back to the login page by the middleware.

export const SESSION_COOKIE = "admin_session"
export const SESSION_MAX_AGE = 12 * 60 * 60 // seconds
const SESSION_TTL_MS = SESSION_MAX_AGE * 1000

const SECRET =
  process.env.ADMIN_SESSION_SECRET ??
  "dev-only-webreta-admin-secret-change-in-prod"

type SessionPayload = { u: string; iat: number }

const encoder = new TextEncoder()

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

function bytesToB64(bytes: Uint8Array): string {
  let s = ""
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function createSession(username: string): Promise<string> {
  const payload: SessionPayload = { u: username, iat: Date.now() }
  const b64 = btoa(JSON.stringify(payload))
  const key = await getKey()
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(b64))
  return `${b64}.${bytesToB64(new Uint8Array(sigBuf))}`
}

export async function verifySession(
  value: string | undefined,
): Promise<{ username: string } | null> {
  if (!value) return null
  const dot = value.indexOf(".")
  if (dot <= 0) return null
  const b64 = value.slice(0, dot)
  const sigB64 = value.slice(dot + 1)
  let sigBytes: Uint8Array
  try {
    sigBytes = b64ToBytes(sigB64)
  } catch {
    return null
  }
  const key = await getKey()
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    encoder.encode(b64),
  )
  if (!valid) return null
  let payload: SessionPayload
  try {
    payload = JSON.parse(atob(b64))
  } catch {
    return null
  }
  if (typeof payload.iat !== "number" || Date.now() - payload.iat > SESSION_TTL_MS) {
    return null
  }
  return { username: payload.u }
}
