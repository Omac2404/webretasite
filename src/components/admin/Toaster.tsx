"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AlertCircle, Check, Info, X } from "lucide-react"

// Lightweight global toaster for the admin panel. Provider lives in the
// panel layout; any client component can call `useToast()` to push a
// notification. No external dependency — just a stacked portal-less
// fixed container.

type Tone = "success" | "error" | "info"

type Toast = {
  id: string
  tone: Tone
  message: string
}

type ToastCtx = {
  push: (tone: Tone, message: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Outside provider → no-op so client code can call freely without crashing.
    return { push: () => undefined }
  }
  return ctx
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((tone: Tone, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, tone, message }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4200)
    return () => clearTimeout(id)
  }, [onClose])

  const palette = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      icon: <Check size={14} className="text-emerald-700" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <AlertCircle size={14} className="text-red-700" />,
    },
    info: {
      bg: "bg-[#3c639f]/[0.08]",
      border: "border-[#3c639f]/30",
      text: "text-[#3c639f]",
      icon: <Info size={14} className="text-[#3c639f]" />,
    },
  }[toast.tone]

  return (
    <div
      className={`pointer-events-auto flex max-w-[360px] items-start gap-2 rounded-xl border ${palette.border} ${palette.bg} ${palette.text} px-3 py-2.5 text-[12.5px] font-medium shadow-md`}
    >
      <span className="mt-0.5 shrink-0">{palette.icon}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Kapat"
        className="ml-1 shrink-0 rounded-md p-0.5 text-current/50 hover:bg-black/[0.05]"
      >
        <X size={12} />
      </button>
    </div>
  )
}
