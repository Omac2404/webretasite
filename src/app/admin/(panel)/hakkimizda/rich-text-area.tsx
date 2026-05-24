"use client"

// Hakkımızda body alanı için hafif WYSIWYG editor.
// — contentEditable div + dar toolbar (B, renk, +/− boyut, temizle)
// — innerHTML, gizli bir <input>'a mirror'lanır; mevcut form action'ı
//   buradan FormData ile okur (TextArea ile aynı imza).
// — execCommand legacy ama widely-supported; bizim ihtiyacımız için
//   yeterli ve kod hafif.

import { useEffect, useRef, useState } from "react"
import { Bold, Type, Palette, Eraser, Plus, Minus } from "lucide-react"

// Hızlı renk paleti. Marka mavisi + temel vurgu renkleri.
const COLORS = [
  "#0a0a0a",
  "#3c639f",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
]

const SIZE_STEPS = [12, 14, 16, 18, 22, 28]

export function RichTextArea({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string
  label: string
  defaultValue: string
  hint?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  // Toolbar/popup butonlarına tıklandığında editör selection'ı kaybolabiliyor.
  // Editör içindeki son geçerli range'i burada saklıyoruz, exec sırasında geri yüklenir.
  const savedRangeRef = useRef<Range | null>(null)
  const [html, setHtml] = useState(defaultValue || "")
  const [showColors, setShowColors] = useState(false)

  // İlk mount: defaultValue'yu editor'e koy. controlled değil, sadece
  // başlangıç. Sonradan kullanıcı yazınca onInput → state'i günceller.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== defaultValue) el.innerHTML = defaultValue || ""
  }, [defaultValue])

  function syncFromEditor() {
    const el = editorRef.current
    if (!el) return
    setHtml(el.innerHTML)
  }

  function saveSelection() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const editor = editorRef.current
    if (!editor) return
    // Yalnızca editör içindeki selection'ı sakla — dışarıdaki seçimler
    // (örn. URL bar) restore sırasında yanlış yere yazardı.
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange()
    }
  }

  function restoreSelection() {
    const range = savedRangeRef.current
    if (!range) return
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus()
    restoreSelection()
    // execCommand deprecated ama browser desteği bizim use-case için
    // hala stabil. TipTap/Lexical eklemeden bu kadarını yapmak için ok.
    document.execCommand(command, false, value)
    saveSelection()
    syncFromEditor()
  }

  function wrapSelection(makeSpan: () => HTMLSpanElement) {
    editorRef.current?.focus()
    restoreSelection()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (range.collapsed) return // bir şey seç
    const span = makeSpan()
    try {
      range.surroundContents(span)
    } catch {
      // surroundContents tek bir node'u sarabilir; karmaşık seçimlerde
      // extractContents+insertNode kombinasyonuna düş.
      span.appendChild(range.extractContents())
      range.insertNode(span)
    }
    selection.removeAllRanges()
    saveSelection()
    syncFromEditor()
  }

  function applyFontSize(px: number) {
    wrapSelection(() => {
      const s = document.createElement("span")
      s.style.fontSize = `${px}px`
      return s
    })
  }

  function applyForeColor(color: string) {
    // execCommand("foreColor") çoğu tarayıcıda <font color="..."> üretiyor;
    // bizim sanitizer whitelist'i sadece <span style="color: ..."> kabul ediyor.
    // Bu yüzden execCommand yerine manuel span wrap ediyoruz — kaydedince
    // sanitizer'dan sağ kurtuluyor.
    wrapSelection(() => {
      const s = document.createElement("span")
      s.style.color = color
      return s
    })
  }

  function adjustFontSize(delta: number) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (range.collapsed) return
    // Seçimin başlangıç node'undaki current font-size'ı bul (varsa).
    let node: Node | null = range.startContainer
    let current = 16
    while (node) {
      if (node.nodeType === 1) {
        const el = node as HTMLElement
        const fs = el.style?.fontSize
        if (fs && fs.endsWith("px")) {
          current = parseInt(fs, 10) || 16
          break
        }
      }
      node = node.parentNode
    }
    // SIZE_STEPS içinde en yakın index'i bul, delta kadar kaydır.
    let idx = SIZE_STEPS.findIndex((s) => s >= current)
    if (idx < 0) idx = SIZE_STEPS.length - 1
    const next = Math.max(0, Math.min(SIZE_STEPS.length - 1, idx + delta))
    applyFontSize(SIZE_STEPS[next])
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">
        {label}
        {hint && (
          <span className="ml-2 text-[10.5px] font-normal text-black/40">
            {hint}
          </span>
        )}
      </span>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-black/[0.10] bg-[#fafbfd] px-2 py-1.5">
        <ToolbarButton title="Kalın (Ctrl+B)" onClick={() => exec("bold")}>
          <Bold size={13} strokeWidth={2.5} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Yazıyı büyüt"
          onClick={() => adjustFontSize(+1)}
        >
          <Type size={13} />
          <Plus size={9} strokeWidth={3} className="-ml-0.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Yazıyı küçült"
          onClick={() => adjustFontSize(-1)}
        >
          <Type size={11} />
          <Minus size={9} strokeWidth={3} className="-ml-0.5" />
        </ToolbarButton>

        <Divider />

        <div className="relative">
          <ToolbarButton
            title="Renk"
            onClick={() => setShowColors((v) => !v)}
            active={showColors}
          >
            <Palette size={13} />
          </ToolbarButton>
          {showColors && (
            <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-lg border border-black/[0.08] bg-white p-1.5 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)]">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyForeColor(c)
                    setShowColors(false)
                  }}
                  className="h-5 w-5 rounded-full border border-black/15 transition-transform hover:scale-110"
                  style={{ background: c }}
                  aria-label={`Renk: ${c}`}
                />
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applyForeColor("#0a0a0a")
                  setShowColors(false)
                }}
                title="Varsayılan"
                className="ml-1 inline-flex h-5 items-center px-1.5 text-[10px] font-medium text-black/60 hover:text-[#0a0a0a]"
              >
                sıfırla
              </button>
            </div>
          )}
        </div>

        <Divider />

        <ToolbarButton
          title="Biçimlendirmeyi temizle"
          onClick={() => exec("removeFormat")}
        >
          <Eraser size={13} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          syncFromEditor()
          saveSelection()
        }}
        onBlur={syncFromEditor}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        // Plain text paste — kopyala/yapıştırla dışarıdan stil
        // gelmesini engelle.
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        className="rich-editor min-h-[140px] resize-y rounded-b-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] leading-relaxed text-[#0a0a0a] outline-none focus:border-[#3c639f]"
        style={{ minHeight: "140px" }}
        role="textbox"
        aria-multiline="true"
      />

      {/* Form, name="..." ile bu hidden input'tan okur. */}
      <input type="hidden" name={name} value={html} />

      <style jsx global>{`
        .rich-editor p {
          margin: 0 0 0.6em 0;
        }
        .rich-editor p:last-child {
          margin-bottom: 0;
        }
        .rich-editor:empty::before {
          content: attr(data-placeholder);
          color: rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </label>
  )
}

function ToolbarButton({
  title,
  onClick,
  children,
  active,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={`inline-flex h-7 items-center gap-0.5 rounded-md px-2 text-[12px] font-medium transition-colors ${
        active
          ? "bg-[#3c639f] text-white"
          : "text-black/65 hover:bg-black/[0.06] hover:text-[#0a0a0a]"
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-black/10" />
}
