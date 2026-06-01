import { ExternalLink } from "lucide-react"

// Small "Sayfada gör" link that opens the public counterpart of an
// admin section in a new tab. Dropped into page headers so the admin
// can flip back and forth between editor and live view.

export function PreviewLink({
  href,
  label = "Sayfada gör",
}: {
  href: string
  label?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11.5px] font-medium text-black/55 transition-colors hover:border-[#3c639f]/30 hover:text-[#3c639f]"
    >
      <ExternalLink size={11} />
      {label}
    </a>
  )
}
