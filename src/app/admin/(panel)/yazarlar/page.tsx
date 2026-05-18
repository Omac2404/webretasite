import Link from "next/link"
import { Pencil, Plus, Trash2, UserRound } from "lucide-react"
import { listAuthors } from "@/lib/authors-store"
import { authorInitials } from "@/lib/authors-types"
import { AddAuthorForm } from "./add-author-form"
import { deleteAuthorAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AuthorsAdminPage() {
  const authors = await listAuthors()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Yazarlar
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Blog yazılarına atayabileceğin yazarlar. Ad, uzmanlık ve profil
          fotoğrafı.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni yazar
          </div>
        </div>
        <div className="mt-4">
          <AddAuthorForm />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Tüm yazarlar
          </div>
          <div className="text-[12px] text-black/50">{authors.length} kayıt</div>
        </div>

        {authors.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yazar yok. Üstteki formla ilk yazarı ekle.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {authors.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-white">
                  {a.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photo}
                      alt={a.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #5b8de6 0%, #3c639f 100%)",
                      }}
                    >
                      {authorInitials(a.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-[#0a0a0a]">
                    {a.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-black/45">
                    <UserRound size={11} />
                    {a.expertise}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/yazarlar/${a.id}`}
                    aria-label="Düzenle"
                    title="Düzenle"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
                  >
                    <Pencil size={14} />
                  </Link>
                  <form action={deleteAuthorAction}>
                    <input type="hidden" name="id" value={a.id} />
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
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
