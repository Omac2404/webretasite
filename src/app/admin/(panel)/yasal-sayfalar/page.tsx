import Link from "next/link"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { readLegalPages } from "@/lib/legal-store"
import { legalPageHref, type LegalPage } from "@/lib/legal-types"
import { deleteLegalPageAction } from "./actions"
import { AddLegalPageForm } from "./add-legal-form"

export const dynamic = "force-dynamic"

export default async function LegalPagesAdmin() {
  const { pages } = await readLegalPages()
  const sorted = [...pages].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Yasal Sayfalar
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          KVKK, Gizlilik, Çerez Politikası gibi yasal sayfaları buradan
          yönet. Footer sağ altta hangileri çıkacaksa <em>Footer</em> sekmesinden
          seçim yaparsın.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni yasal sayfa
          </div>
        </div>
        <div className="mt-4">
          <AddLegalPageForm />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Tüm sayfalar
          </div>
          <div className="text-[12px] text-black/50">{sorted.length} kayıt</div>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yasal sayfa yok. Üstteki formla ilk sayfanı ekle.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {sorted.map((page) => (
              <PageRow key={page.id} page={page} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function PageRow({ page }: { page: LegalPage }) {
  const href = legalPageHref(page.slug)
  return (
    <li className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#0a0a0a]">
          {page.title}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-black/40">
          {href}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Yayındaki halini gör"
          title="Yayındaki halini gör"
          className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
        >
          <ExternalLink size={14} />
        </a>
        <Link
          href={`/admin/yasal-sayfalar/${page.id}`}
          aria-label="Düzenle"
          title="Düzenle"
          className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
        >
          <Pencil size={14} />
        </Link>
        <form action={deleteLegalPageAction}>
          <input type="hidden" name="id" value={page.id} />
          <button
            type="submit"
            aria-label="Sil"
            title="Sil"
            className="flex h-8 w-8 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>
    </li>
  )
}
