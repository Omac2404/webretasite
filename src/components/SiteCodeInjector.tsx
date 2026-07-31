"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Injects admin-managed custom code into <head> and end of <body>.
//
// Why client-side rather than dangerouslySetInnerHTML on the server:
// markup set via innerHTML never executes its <script> tags (HTML spec),
// so server injection would silently break every Google Ads / Analytics /
// Pixel snippet. Here we parse the pasted HTML and re-create real <script>
// elements so they run, while <meta>/<link> tags still land in the real
// <head> (good for Search Console verification, which renders the page).
//
// Not rendered on /admin — tracking/ads must not fire inside the panel.
// Injection happens once per full page load; client navigations don't
// re-run it (a module-level flag guards against React's double-invoke in
// dev and against re-injection on route changes).

const injected = { head: false, body: false }

export default function SiteCodeInjector({
  head,
  body,
}: {
  head: string
  body: string
}) {
  const pathname = usePathname() ?? ""

  useEffect(() => {
    if (pathname.startsWith("/admin")) return
    if (!injected.head && head.trim()) {
      injected.head = true
      // meta/link etiketleri artık root layout'ta sunucuda basılıyor
      // (bkz. lib/site-code-head.ts) — burada tekrar eklersek çift olurlar.
      injectInto(head, document.head, true)
    }
    if (!injected.body && body.trim()) {
      injected.body = true
      injectInto(body, document.body)
    }
  }, [pathname, head, body])

  return null
}

// Parse a raw HTML string and append its nodes to `target`, recreating any
// <script> elements (at any depth) so the browser actually executes them.
// `skipHeadTags` atlar <meta>/<link>: onlar sunucuda render ediliyor.
function injectInto(
  html: string,
  target: HTMLElement,
  skipHeadTags = false,
): void {
  const tpl = document.createElement("template")
  tpl.innerHTML = html
  for (const node of Array.from(tpl.content.childNodes)) {
    if (skipHeadTags && isHeadTag(node)) continue
    target.appendChild(activate(node))
  }
}

function isHeadTag(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false
  const tag = (node as Element).tagName
  return tag === "META" || tag === "LINK"
}

// Returns a copy of `node` with every <script> rebuilt as a fresh element
// (scripts cloned/parsed inertly won't run; freshly-created ones do).
function activate(node: Node): Node {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    if (el.tagName === "SCRIPT") {
      return cloneScript(el as HTMLScriptElement)
    }
    const copy = el.cloneNode(false)
    for (const child of Array.from(el.childNodes)) {
      copy.appendChild(activate(child))
    }
    return copy
  }
  return node.cloneNode(true)
}

function cloneScript(src: HTMLScriptElement): HTMLScriptElement {
  const s = document.createElement("script")
  for (const attr of Array.from(src.attributes)) {
    s.setAttribute(attr.name, attr.value)
  }
  s.text = src.text
  return s
}
