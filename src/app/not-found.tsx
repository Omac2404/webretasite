import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"

// Branded 404 shown for any unmatched path (rendered via the root
// catch-all's notFound() call, or any notFound() elsewhere). Keeps a
// migration straggler from showing the bare Next.js 404 while it waits to
// be mapped to a redirect.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
      <div className="text-[88px] font-semibold leading-none tracking-[-0.04em] text-[#3c639f]">
        404
      </div>
      <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-black/55">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Aşağıdan
        anasayfaya dönebilirsiniz.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288]"
        >
          <Home size={15} />
          Anasayfa
        </Link>
        <Link
          href="/iletisim"
          className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-white px-5 py-2.5 text-[13px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
        >
          <ArrowLeft size={15} />
          İletişim
        </Link>
      </div>
    </main>
  )
}
