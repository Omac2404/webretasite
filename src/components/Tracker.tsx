"use client"

import { useEffect, useRef } from "react"
import {
  TRACKED_SECTIONS,
  type ClientEvent,
  type EventType,
} from "@/lib/analytics-types"

const ALLOWED_SECTIONS = new Set<string>(TRACKED_SECTIONS)

// All tracking lives in this single client component. Rendered once in
// the root layout, attaches global listeners (route changes, clicks,
// intersection of [data-section] elements) and batches events to
// /api/track. The intent is zero invasive code in features —
// instrumentation happens via `data-track="..."` attributes and
// `data-section="..."` wrappers.

const SESSION_KEY = "webreta-session-id"
const FLUSH_INTERVAL_MS = 1500
const SKIP_PATH_PREFIXES = ["/admin", "/api/"]

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = makeId()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return makeId()
  }
}

function shouldSkip(): boolean {
  const p = window.location.pathname
  return SKIP_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))
}

type Queue = ClientEvent[]

export default function Tracker() {
  const queueRef = useRef<Queue>([])
  const sessionIdRef = useRef<string>("")
  const dwellStartRef = useRef<Map<string, number>>(new Map())
  const lastPathRef = useRef<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    sessionIdRef.current = getSessionId()

    function push(type: EventType, data?: Record<string, string | number>) {
      if (shouldSkip()) return
      queueRef.current.push({
        id: makeId(),
        ts: new Date().toISOString(),
        sessionId: sessionIdRef.current,
        path: window.location.pathname + window.location.search,
        type,
        data,
      })
    }

    function flush(viaBeacon = false) {
      const q = queueRef.current
      if (q.length === 0) return
      const payload = JSON.stringify({ events: q })
      queueRef.current = []
      try {
        if (viaBeacon && "sendBeacon" in navigator) {
          const blob = new Blob([payload], { type: "application/json" })
          navigator.sendBeacon("/api/track", blob)
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {
            // Best effort — drop on error.
          })
        }
      } catch {
        // Same — silent failure is fine for analytics.
      }
    }

    function handlePathChange() {
      const current = window.location.pathname + window.location.search
      if (current === lastPathRef.current) return
      // Flush any pending dwell timers for the page we're leaving.
      const now = performance.now()
      for (const [id, startedAt] of dwellStartRef.current.entries()) {
        const duration = Math.round(now - startedAt)
        if (duration > 500) {
          push("section_dwell", { section: id, durationMs: duration })
        }
      }
      dwellStartRef.current.clear()
      lastPathRef.current = current
      push("page_view", {
        referrer: document.referrer || "",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      })
    }

    // ── Route changes ─────────────────────────────────────────────────
    // Detect both hash/popstate and pushState (Next.js client navigations).
    handlePathChange()
    const origPush = history.pushState
    const origReplace = history.replaceState
    history.pushState = function (this: History, ...args) {
      origPush.apply(this, args)
      // Defer so the URL has actually updated before we read it.
      setTimeout(handlePathChange, 0)
    } as typeof history.pushState
    history.replaceState = function (this: History, ...args) {
      origReplace.apply(this, args)
      setTimeout(handlePathChange, 0)
    } as typeof history.replaceState
    window.addEventListener("popstate", handlePathChange)

    // ── Click delegation ─────────────────────────────────────────────
    // Any element with data-track or data-track-tab(-control/-value)
    // gets logged. data-track="name" → click event; the tab variant
    // emits a tab_change.
    function onDocClick(e: MouseEvent) {
      const target = e.target instanceof Element ? e.target : null
      if (!target) return
      const tabEl = target.closest<HTMLElement>("[data-track-tab-value]")
      if (tabEl) {
        const control = tabEl.dataset.trackTabControl ?? "tab"
        const value = tabEl.dataset.trackTabValue ?? ""
        const label = tabEl.dataset.trackLabel ?? tabEl.textContent?.trim() ?? ""
        push("tab_change", { control, value, label: label.slice(0, 80) })
        return
      }
      const clickEl = target.closest<HTMLElement>("[data-track]")
      if (clickEl) {
        const name = clickEl.dataset.track ?? "?"
        const label =
          clickEl.dataset.trackLabel ?? clickEl.textContent?.trim() ?? ""
        push("click", { target: name, label: label.slice(0, 80) })
      }
    }
    document.addEventListener("click", onDocClick, true)

    // ── Section visibility ──────────────────────────────────────────
    // IntersectionObserver tracks [data-section] elements. We emit a
    // section_view on first entry (>=40% visible) and a section_dwell
    // when the section leaves view (duration since entry).
    const observed = new Set<Element>()
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const el = entry.target as HTMLElement
                const id = el.dataset.section ?? ""
                if (!id) continue
                if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
                  if (!dwellStartRef.current.has(id)) {
                    dwellStartRef.current.set(id, performance.now())
                    push("section_view", { section: id })
                  }
                } else {
                  const startedAt = dwellStartRef.current.get(id)
                  if (startedAt !== undefined) {
                    const duration = Math.round(performance.now() - startedAt)
                    dwellStartRef.current.delete(id)
                    if (duration > 500) {
                      push("section_dwell", {
                        section: id,
                        durationMs: duration,
                      })
                    }
                  }
                }
              }
            },
            { threshold: [0, 0.4, 1] },
          )
        : null

    function refreshSectionObservers() {
      if (!observer) return
      document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
        if (observed.has(el)) return
        // Skip anything not on the explicit allowlist — keeps the
        // observer pool small and avoids logging sections we don't
        // care about (hero, logos, services, etc.).
        const id = el.dataset.section ?? ""
        if (!ALLOWED_SECTIONS.has(id)) return
        observer.observe(el)
        observed.add(el)
      })
    }
    refreshSectionObservers()
    // New sections can appear after client navigations / async data.
    const sectionMutation = new MutationObserver(() => {
      refreshSectionObservers()
    })
    sectionMutation.observe(document.body, { childList: true, subtree: true })

    // ── Periodic flush + page unload ────────────────────────────────
    const flushTimer = window.setInterval(flush, FLUSH_INTERVAL_MS)
    function onHide() {
      // Close out pending dwells so we don't lose them on tab close.
      const now = performance.now()
      for (const [id, startedAt] of dwellStartRef.current.entries()) {
        const duration = Math.round(now - startedAt)
        if (duration > 500) {
          push("section_dwell", { section: id, durationMs: duration })
        }
      }
      dwellStartRef.current.clear()
      flush(true)
    }
    window.addEventListener("pagehide", onHide)
    window.addEventListener("beforeunload", onHide)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide()
    })

    return () => {
      window.clearInterval(flushTimer)
      window.removeEventListener("popstate", handlePathChange)
      document.removeEventListener("click", onDocClick, true)
      window.removeEventListener("pagehide", onHide)
      window.removeEventListener("beforeunload", onHide)
      observer?.disconnect()
      sectionMutation.disconnect()
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  return null
}
