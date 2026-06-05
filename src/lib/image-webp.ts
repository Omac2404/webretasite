// Shared image processing for the media library (and the one-time bulk
// conversion). Raster images are re-encoded to WebP and capped to a sane
// max dimension; SVG is passed through untouched since it's vector and
// converting would lose scalability. Server-only — imports the native
// `sharp` binding.

import sharp from "sharp"

export type ProcessedImage = {
  data: Buffer
  ext: "webp" | "svg"
  width: number | null
  height: number | null
  size: number
}

// Long-edge cap. Nothing on a marketing site needs to be wider/taller than
// this; `withoutEnlargement` means smaller images are never upscaled.
const MAX_DIMENSION = 2000

export async function toWebpOrPassthrough(
  input: Buffer,
  mime: string,
): Promise<ProcessedImage> {
  if (mime === "image/svg+xml") {
    return {
      data: input,
      ext: "svg",
      width: null,
      height: null,
      size: input.length,
    }
  }
  // `.rotate()` with no args bakes in EXIF orientation so phone photos
  // don't come out sideways once the metadata is stripped.
  const data = await sharp(input)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer()
  const meta = await sharp(data).metadata()
  return {
    data,
    ext: "webp",
    width: meta.width ?? null,
    height: meta.height ?? null,
    size: data.length,
  }
}

// Turkish-aware, SEO-friendly filename slug from a human name or original
// filename. Strips any extension first.
export function slugifyFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "gorsel"
  )
}
