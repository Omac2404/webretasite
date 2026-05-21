"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Image as ImageIcon, ImagePlus, Loader2, Film } from "lucide-react"
import type { Author } from "@/lib/authors-types"
import { CATEGORIES, type CategoryKey } from "@/lib/blog-types"
import {
  addPostAction,
  uploadInlineImageAction,
  type PostState,
} from "./actions"
import { BlogSeoPanel } from "./seo-panel"

const INITIAL: PostState = {}

export function AddPostForm({ authors }: { authors: Author[] }) {
  const [state, formAction, pending] = useActionState(addPostAction, INITIAL)
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [inlineUploading, setInlineUploading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPreview(null)
      setFilename(null)
      setTitle("")
      setExcerpt("")
      setContent("")
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

  async function handleInlineUpload(file: File) {
    setInlineError(null)
    setInlineUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("hint", file.name)
      const res = await uploadInlineImageAction(fd)
      if (res.error || !res.url) {
        setInlineError(res.error ?? "Yükleme başarısız.")
        return
      }
      insertSnippet(`\n\n![](${res.url})\n\n`)
    } catch {
      setInlineError("Beklenmeyen bir hata oluştu.")
    } finally {
      setInlineUploading(false)
    }
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
          uploading={inlineUploading}
          error={inlineError}
          onUpload={(f) => handleInlineUpload(f)}
          onInsertVideo={(snippet) => insertSnippet(snippet)}
        />
      </Field>

      <Field
        label="Kapak görseli (opsiyonel)"
        hint="PNG / JPG / WebP, max 5 MB. Yüklemezsen kartta brand renkli placeholder görünür."
      >
        <CoverUploader
          preview={preview}
          filename={filename}
          onChange={(f) => {
            if (!f) {
              setPreview(null)
              setFilename(null)
              return
            }
            setFilename(f.name)
            setPreview(URL.createObjectURL(f))
          }}
        />
      </Field>

      <BlogSeoPanel
        liveTitle={title}
        liveExcerpt={excerpt}
        liveContent={content}
        liveCoverImage={preview ? "uploaded" : ""}
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

export function CoverUploader({
  preview,
  filename,
  onChange,
  existingUrl,
  label,
}: {
  preview: string | null
  filename: string | null
  onChange: (file: File | null) => void
  existingUrl?: string
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      {existingUrl && !preview && (
        <div className="h-12 w-20 overflow-hidden rounded-md border border-black/[0.08] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingUrl}
            alt="Mevcut kapak"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-black/[0.15] bg-white px-3 py-2.5 text-[13px] text-black/60 transition-colors hover:bg-black/[0.02]">
        <ImageIcon size={14} />
        <span className="truncate">
          {filename ?? label ?? "Görsel seç"}
        </span>
        <input
          name="cover"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {preview && (
        <div className="h-12 w-20 overflow-hidden rounded-md border border-black/[0.08] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Önizleme"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  )
}

export function InlineImageUploader({
  uploading,
  error,
  onUpload,
  onInsertVideo,
}: {
  uploading: boolean
  error: string | null
  onUpload: (file: File) => void
  onInsertVideo: (snippet: string) => void
}) {
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
        <label
          className={`inline-flex items-center gap-2 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium transition-colors ${
            uploading
              ? "cursor-not-allowed text-black/35"
              : "cursor-pointer text-black/70 hover:border-[#3c639f]/30 hover:text-[#3c639f]"
          }`}
        >
          {uploading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <ImagePlus size={12} />
          )}
          {uploading ? "Yükleniyor..." : "Görsel ekle"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f)
              e.target.value = ""
            }}
          />
        </label>

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
      {error && (
        <div className="text-[11.5px] text-red-700">{error}</div>
      )}
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
