// Marka mavisi nokta + radial-wash dekorasyonu. Anasayfada "Neler
// yapıyoruz?" bölümünün OK-hand'inin sağına serpilen aynı pattern;
// burada reusable hale getirildi. Yerleştirmeden sorumlu olan ebeveyn
// (absolute container) — bu component sadece dekoratif div'i çiziyor.
//
// Default boyut hero/CTA için uygun; özel ihtiyaçlarda `style` ile
// override edebilirsin. Mobilde varsayılan olarak gizli — `mobile`
// prop'u açarsan her ekranda görünür.

import type { CSSProperties } from "react"

export type DotPatternProps = {
  // Position + size override'ları
  style?: CSSProperties
  className?: string
  // Görünürlük
  mobile?: boolean
  // Pattern yoğunluğu — opacity ile, default 1
  opacity?: number
}

export function DotPattern({
  style,
  className = "",
  mobile = false,
  opacity = 1,
}: DotPatternProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute select-none ${
        mobile ? "block" : "hidden lg:block"
      } ${className}`}
      style={{
        opacity,
        background:
          "radial-gradient(rgba(60, 99, 159, 0.38) 1.4px, transparent 1.8px) 0 0 / 22px 22px, radial-gradient(circle at 55% 45%, rgba(60, 99, 159, 0.18) 0%, transparent 65%)",
        // Yumuşak radial fade — desen tamamen şeffaflaşana kadar
        // yer bırakmak için %70'te transparent oluyor; yani container
        // kenarı pattern'in ortasından geçse bile cut-off görünmüyor.
        maskImage:
          "radial-gradient(closest-side, black 0%, rgba(0,0,0,0.55) 30%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(closest-side, black 0%, rgba(0,0,0,0.55) 30%, transparent 70%)",
        ...style,
      }}
    />
  )
}
