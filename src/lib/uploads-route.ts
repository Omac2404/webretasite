// Panelden yüklenen görselleri diskten okuyup servis eden ortak yardımcı.
//
// Neden gerekli: Next'in production (standalone) sunucusu `public/` klasörünü
// AÇILIŞTA bir kez tarıyor. Sunucu ayaktayken oraya yazılan dosyalar statik
// katman tarafından bilinmiyor ve 404 dönüyor — dosya diskte olsa bile.
// Admin panelinden yapılan her yükleme runtime'da gerçekleştiği için, yeni
// yüklenen görseller bir sonraki restart'a kadar görünmüyordu.
//
// Açılışta zaten var olan dosyalar statik katmandan servis edilir ve buraya
// hiç düşmez; bu route'lar yalnızca statik katmanın bilmediği (yani runtime'da
// eklenen) dosyalar için devreye girer.

import { promises as fs } from "node:fs"
import path from "node:path"

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
}

export async function serveUpload(
  dir: string,
  segments: string[],
): Promise<Response> {
  const notFound = () => new Response("Not found", { status: 404 })

  // Yol parçalarını daralt: boş, "." / ".." ya da ayraç içeren hiçbir parçaya
  // izin verme — aksi halde ../../data/admins.json gibi istekler mümkün olur.
  if (
    segments.length === 0 ||
    segments.some(
      (s) => !s || s === "." || s === ".." || s.includes("/") || s.includes("\\"),
    )
  ) {
    return notFound()
  }

  const baseDir = path.join(process.cwd(), "public", dir)
  const target = path.join(baseDir, ...segments)

  // İkinci savunma hattı: çözülen yol gerçekten baseDir'in altında mı?
  const rel = path.relative(baseDir, target)
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    return notFound()
  }

  let bytes: Buffer
  try {
    const stat = await fs.stat(target)
    if (!stat.isFile()) return notFound()
    bytes = await fs.readFile(target)
  } catch {
    return notFound()
  }

  const ext = path.extname(target).slice(1).toLowerCase()
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(bytes.length),
      // Yüklenen dosya adları benzersiz (zaman damgası / rastgele son ek) ve
      // içerikleri hiç değişmiyor — güvenle uzun süre cache'lenebilir.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

// Route dosyalarının tamamı aynı imzayı paylaşıyor; tekrarı burada topluyoruz.
export function uploadRouteHandler(dir: string) {
  return async function GET(
    _req: Request,
    ctx: { params: Promise<{ path: string[] }> },
  ): Promise<Response> {
    const { path: segments } = await ctx.params
    return serveUpload(dir, segments)
  }
}
