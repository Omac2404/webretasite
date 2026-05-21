"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { BlogPost } from "@/lib/blog-types"
import type { Author } from "@/lib/authors-types"
import { updatePostAction, uploadInlineImageAction, type PostState } from "../actions"
import {
  AuthorSelect,
  CategorySelect,
  CoverUploader,
  Field,
  InlineImageUploader,
  inputCls,
} from "../add-post-form"
import { BlogSeoPanel } from "../seo-panel"

const INITIAL: PostState = {}

export function EditPostForm({
  post,
  authors,
}: {
  post: BlogPost
  authors: Author[]
}) {
  const [state, formAction, pending] = useActionState(
    updatePostAction,
    INITIAL,
  )
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [inlineUploading, setInlineUploading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [title, setTitle] = useState(post.title)
  const [excerpt, setExcerpt] = useState(post.excerpt)
  const [content, setContent] = useState(post.content)
  const contentRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true)
      const t = setTimeout(() => setSavedFlash(false), 1800)
      return () => clearTimeout(t)
    }
  }, [state.ok])

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
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={post.id} />

      <Field label="Başlık">
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Yazar">
        <AuthorSelect authors={authors} defaultValue={post.authorId} />
      </Field>

      <Field label="Kategori">
        <CategorySelect defaultValue={post.category} />
      </Field>

      <Field
        label="Özet"
        hint="Boş bırakırsan içerikten otomatik üretilir."
      >
        <textarea
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field
        label="İçerik"
        hint="## başlık, ### alt başlık, **kalın**, ![](url) görsel."
      >
        <textarea
          ref={contentRef}
          name="content"
          rows={18}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputCls} resize-y font-mono text-[12.5px] leading-relaxed`}
        />
        <InlineImageUploader
          uploading={inlineUploading}
          error={inlineError}
          onUpload={handleInlineUpload}
          onInsertVideo={(snippet) => insertSnippet(snippet)}
        />
      </Field>

      <Field
        label="Kapak görseli"
        hint={
          post.coverImage
            ? "Mevcut kapağı korumak için boş bırak; yeni dosya yüklediğin anda değişir."
            : "PNG / JPG / WebP, max 5 MB."
        }
      >
        <CoverUploader
          preview={preview}
          filename={filename}
          existingUrl={post.coverImage || undefined}
          label="Yeni görsel seç"
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
        initial={post.seo}
        liveTitle={title}
        liveExcerpt={excerpt}
        liveContent={content}
        liveCoverImage={preview ?? post.coverImage}
        existingSlug={post.slug}
      />

      <label className="flex items-center gap-2.5 text-[13px] text-black/70">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post.published}
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        <span>Yayında</span>
      </label>

      <div className="flex items-center justify-between gap-3">
        <div className="min-h-[28px] flex-1">
          {state.error && (
            <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] text-red-700">
              {state.error}
            </div>
          )}
          {!state.error && savedFlash && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] text-emerald-700">
              <Check size={13} strokeWidth={2.5} />
              Kaydedildi
            </div>
          )}
        </div>
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-black/[0.10] bg-white px-4 py-2.5 text-[13px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
        >
          Önizle
        </a>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  )
}

