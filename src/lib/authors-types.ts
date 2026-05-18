// Author types — client-safe (no node:fs).

export type Author = {
  id: string
  name: string
  expertise: string
  photo: string
}

export type AuthorsData = {
  authors: Author[]
}

// Initial-letter avatar fallback for authors without a photo.
export function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}
