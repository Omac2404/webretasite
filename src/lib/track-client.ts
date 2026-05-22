// Client-side helpers to emit one-off analytics events that don't fit the
// declarative data-track flow — most notably form submissions, which are
// only confirmed *after* a successful server response.
//
// We dispatch a CustomEvent on `window`; Tracker.tsx listens and pushes
// the event onto its queue. Decoupling via events lets feature code
// import this tiny module without pulling Tracker internals.

export type TrackEventDetail = {
  type: "click"
  target: string
  label?: string
}

const EVENT_NAME = "webreta:track-event"

export function trackEvent(detail: TrackEventDetail): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }))
}

// Convenience for the common case — a form just submitted successfully.
// `formId` is a short slug ("contact", "quote", "randevu") that ends up
// in the stored target as `form-submit:<formId>`, which the admin uses
// to badge the visitor.
export function trackFormSubmit(formId: string, label?: string): void {
  trackEvent({
    type: "click",
    target: `form-submit:${formId}`,
    label: label ?? formId,
  })
}

export const TRACK_EVENT_NAME = EVENT_NAME
