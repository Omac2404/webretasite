"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Images, Film, Loader2 } from "lucide-react"
import type { Author } from "@/lib/authors-types"
import type { MediaItem } from "@/lib/media-store"
import { CATEGORIES, type CategoryKey } from "@/lib/blog-types"
import { MediaPicker } from "@/components/admin/MediaPicker"
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal"
import { addPostAction, type PostState } from "./actions"
import { BlogSeoPanel } from "./seo-panel"

const INITIAL: PostState = {}

export function AddPostForm({
  authors,
  media,
  siteUrl,
  siteName,
  titleTemplate,
}: {
  authors: Author[]
  media: MediaItem[]
  siteUrl?: string
  siteName?: string
  titleTemplate?: string
}) {
  const [state, formAction, pending] = useActionState(addPostAction, INITIAL)
  const [coverUrl, setCoverUrl] = useState("")
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [pickerKey, setPickerKey] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setCoverUrl("")
      setTitle("")
      setExcerpt("")
      setContent("")
      setPickerKey((k) => k + 1)
    }
  }, [state.ok])

  function insertSnippet(snippet: string) {
    const el = contentRef.current
    if (!el) {
      setContent((c) => c + snippet)
      return
    }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const next = content.slice(0, start) + snippet + content.slice(end)
    setContent(next)
    requestAnimationFrame(() => {
      const cursor = start + snippet.length
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Başlık">
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yazının başlığı"
          className={inputCls}
        />
      </Field>

      <Field label="Yazar">
        <AuthorSelect authors={authors} />
      </Field>

      <Field label="Kategori">
        <CategorySelect />
      </Field>

      <Field
        label="Özet"
        hint="Listeleme kartında görünür. Boş bırakırsan içerikten otomatik üretilir."
      >
        <textarea
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Bir-iki cümle özet"
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field
        label="İçerik"
        hint="Boş satır = paragraf. ## başlık, ### alt başlık, **kalın**, ![](url) görsel."
      >
        <textarea
          ref={contentRef}
          name="content"
          rows={14}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yazının gövdesi"
          className={`${inputCls} resize-y font-mono text-[12.5px] leading-relaxed`}
        />
        <InlineImageUploader
          media={media}
          onInsert={(url) => insertSnippet(`\n\n![](${url})\n\n`)}
          onInsertVideo={(snippet) => insertSnippet(snippet)}
        />
      </Field>

      <Field
        label="Kapak görseli (opsiyonel)"
        hint="Kütüphaneden seç ya da bilgisayardan yükle. Boş bırakırsan kartta brand renkli placeholder görünür."
      >
        <MediaPicker
          key={pickerKey}
          name="coverUrl"
          media={media}
          variant="cover"
          onChange={setCoverUrl}
        />
      </Field>

      <BlogSeoPanel
        liveTitle={title}
        liveExcerpt={excerpt}
        liveContent={content}
        liveCoverImage={coverUrl}
        siteUrl={siteUrl}
        siteName={siteName}
        titleTemplate={titleTemplate}
      />

      <label className="flex items-center gap-2.5 text-[13px] text-black/70">
        <input
          type="checkbox"
          name="published"
          defaultChecked
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        <span>
          Hemen yayına al{" "}
          <span className="text-black/40">
            (kapatırsan taslak olarak kalır)
          </span>
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] text-black/70">
        <span>
          Zamanlanmış yayın{" "}
          <span className="text-black/40">
            (opsiyonel — tarihi geçince otomatik yayına geçer)
          </span>
        </span>
        <input
          type="datetime-local"
          name="publishAt"
          className="w-fit rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
        />
      </label>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Yazıyı ekle"}
        </button>
      </div>
    </form>
  )
}

// ── Shared bits ─────────────────────────────────────────────────────────

export function AuthorSelect({
  authors,
  defaultValue,
}: {
  authors: Author[]
  defaultValue?: string
}) {
  if (authors.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-900">
        <span>Önce</span>
        <a
          href="/admin/yazarlar"
          className="font-medium underline underline-offset-2 hover:text-amber-700"
        >
          yazar ekle
        </a>
        <span>, sonra yazıya yazar atayabilirsin.</span>
        <input type="hidden" name="authorId" value="" />
      </div>
    )
  }
  return (
    <select
      name="authorId"
      required
      defaultValue={defaultValue ?? authors[0].id}
      className={`${inputCls} appearance-none`}
    >
      {authors.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} — {a.expertise}
        </option>
      ))}
    </select>
  )
}

export function InlineImageUploader({
  media,
  onInsert,
  onInsertVideo,
}: {
  media: MediaItem[]
  onInsert: (url: string) => void
  onInsertVideo: (snippet: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>(media)

  function promptVideo() {
    const url = window.prompt(
      "YouTube video URL'i veya ID'sini yapıştır:\n(örn. https://www.youtube.com/watch?v=...)",
    )
    if (!url || !url.trim()) return
    onInsertVideo(`\n\n[youtube](${url.trim()})\n\n`)
  }

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium text-black/70 transition-colors hover:border-[#3c639f]/30 hover:text-[#3c639f]"
        >
          <Images size={12} />
          Görsel ekle
        </button>

        <button
          type="button"
          onClick={promptVideo}
          className="inline-flex items-center gap-2 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium text-black/70 transition-colors hover:border-[#FF0000]/40 hover:text-[#cc0000]"
        >
          <Film size={12} />
          YouTube videosu ekle
        </button>

        <span className="text-[11px] text-black/40">
          İmlecin olduğu yere{" "}
          <code className="rounded bg-black/[0.04] px-1 text-[10.5px]">
            ![](url)
          </code>{" "}
          veya{" "}
          <code className="rounded bg-black/[0.04] px-1 text-[10.5px]">
            [youtube](url)
          </code>{" "}
          eklenir.
        </span>
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onUploaded={(item) => setItems((prev) => [item, ...prev])}
        onSelect={(item) => onInsert(item.url)}
      />
    </div>
  )
}

export function CategorySelect({
  defaultValue,
}: {
  defaultValue?: CategoryKey
}) {
  return (
    <select
      name="category"
      required
      defaultValue={defaultValue ?? CATEGORIES[0].key}
      className={`${inputCls} appearance-none`}
    >
      {CATEGORIES.map((c) => (
        <option key={c.key} value={c.key}>
          {c.label}
        </option>
      ))}
    </select>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

export { inputCls }

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-black/55">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-black/40">{hint}</span>
        )}
      </div>
      {children}
    </label>
  )
}

export { Field }
