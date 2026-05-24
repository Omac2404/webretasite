// Hakkımızda CTA kartının arka planında kullanılan takımyıldız dekorasyonu.
// "Bir proje konuşalım mı?" metaforuna uygun olarak noktalar ince bağlantı
// çizgileriyle birbirine bağlı — "connect" hissi.
//
// Renk DNA'sı: dijital-reklamlar global CTA'daki globe ile aynı — koyu navy
// üstünde amber/altın twinkle. SMIL animasyonları native SVG; JS gerektirmiyor,
// bu yüzden server component olarak render edilebilir.

// Takımyıldız noktaları — viewBox 480x320 üzerine dağıtıldı. Her birinin
// kendine has dur/begin değeri, yanış sırası rastlantısal hissedilsin.
const STARS: { x: number; y: number; dur: string; begin: string }[] = [
  { x: 50,  y: 60,  dur: "8s",  begin: "0s" },
  { x: 130, y: 100, dur: "7s",  begin: "2.5s" },
  { x: 215, y: 50,  dur: "9s",  begin: "1.2s" },
  { x: 305, y: 110, dur: "6.5s", begin: "4s" },
  { x: 90,  y: 185, dur: "8.5s", begin: "5.2s" },
  { x: 195, y: 210, dur: "7.2s", begin: "0.8s" },
  { x: 285, y: 195, dur: "9.5s", begin: "3.6s" },
  { x: 380, y: 85,  dur: "6.8s", begin: "2.0s" },
  { x: 385, y: 215, dur: "8.2s", begin: "5.8s" },
  { x: 160, y: 280, dur: "7.6s", begin: "4.4s" },
  { x: 405, y: 155, dur: "9.2s", begin: "1.7s" },
  { x: 245, y: 280, dur: "8.8s", begin: "6.4s" },
]

// Bağlantı çizgileri — sparse network, "iletişim ağı" hissi verir. İndeksler
// STARS array'ine refers.
const LINES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6],
  [6, 3], [3, 7], [6, 8], [4, 9], [5, 9], [7, 10],
  [8, 10], [9, 11], [5, 11],
]

export function ConstellationBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-12 top-4 hidden h-[280px] w-[420px] opacity-90 sm:block md:right-2 md:top-6 md:h-[320px] md:w-[480px]"
    >
      <svg
        viewBox="0 0 480 320"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="starLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8c7ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5b8de6" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Bağlantı çizgileri — ince, mavi gradient, hafif opacity nefesi */}
        <g stroke="url(#starLine)" strokeWidth="0.75" fill="none">
          {LINES.map(([a, b], i) => {
            const s1 = STARS[a]
            const s2 = STARS[b]
            return (
              <line
                key={i}
                x1={s1.x}
                y1={s1.y}
                x2={s2.x}
                y2={s2.y}
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.25;0.55;0.25"
                  dur="6s"
                  begin={`${(i * 0.4) % 4}s`}
                  repeatCount="indefinite"
                />
              </line>
            )
          })}
        </g>

        {/* Yıldız noktaları — SMIL ile kısa "alive window", uzun "dark
            window". Hangi yıldızın yandığı sürekli değişir. */}
        <g>
          {STARS.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r="11" fill="url(#starGlow)" opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;0.95;0.95;0;0"
                  keyTimes="0;0.15;0.40;0.55;1"
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={s.x} cy={s.y} r="2" fill="#fef3c7" opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;1;1;0;0"
                  keyTimes="0;0.15;0.40;0.55;1"
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
