import {
  MessageSquare,
  Star,
  Sparkles,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Info,
} from "lucide-react"
import {
  isReviewVisible,
  readReviews,
  type Review,
} from "@/lib/reviews-store"
import {
  deleteReviewAction,
  setMinStarsAction,
  setOverrideAction,
  setSourceAction,
} from "./actions"
import { AddManualForm } from "./add-manual-form"

export const dynamic = "force-dynamic"

export default async function ReviewsAdminPage() {
  const data = await readReviews()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Yorumlar
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Anasayfadaki testimonial karuselini buradan yönet. Hazır yorumlardan
          gerçek yorumlara geçiş yapabilir, yıldız filtresi koyabilir ve her
          yorumu tek tek yayında / gizli olarak işaretleyebilirsin.
        </p>
      </div>

      {/* Source switch */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          Yorum kaynağı
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Şu anda anasayfada{" "}
          <span className="font-medium text-[#3c639f]">
            {data.source === "real" ? "gerçek yorumlar" : "hazır yorumlar"}
          </span>{" "}
          gösteriliyor.
          {data.source === "real" && data.reviews.length === 0 && (
            <span className="text-amber-700">
              {" "}
              Hiç gerçek yorum yok — site geçici olarak hazır yorumlara
              dönüyor.
            </span>
          )}
        </p>
        <div className="mt-4 flex gap-2">
          <form action={setSourceAction}>
            <input type="hidden" name="source" value="preset" />
            <SourceButton
              active={data.source === "preset"}
              icon={<Sparkles size={14} />}
            >
              Hazır yorumlar (20)
            </SourceButton>
          </form>
          <form action={setSourceAction}>
            <input type="hidden" name="source" value="real" />
            <SourceButton
              active={data.source === "real"}
              icon={<MessageSquare size={14} />}
            >
              Gerçek yorumlar
            </SourceButton>
          </form>
        </div>
      </section>

      {/* Google integration status (info-only for now) */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <div className="flex items-start gap-3">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-amber-900">
              Google Business Profile bağlantısı
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/80">
              Henüz Google hesabıyla eşleştirilmedi. Şimdilik yorumları aşağıdaki
              formla elle ekleyebilirsin. OAuth kurulumu tamamlanınca buraya bir
              <span className="mx-1 inline-flex items-center gap-1 rounded bg-amber-200/60 px-1.5 py-0.5 text-[11px] font-medium">
                <RefreshCw size={10} /> Google&apos;dan çek
              </span>
              butonu gelecek, tüm yorumlarını tek tıkla buraya getirip yönetebileceksin.
            </p>
          </div>
        </div>
      </section>

      {/* Min stars filter */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Minimum yıldız filtresi
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Bu yıldız altındaki yorumlar otomatik gizlenir. Bir yorumu manuel
          olarak &quot;Yayında&quot; yaparsan filtreden bağımsız görünür.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <form key={n} action={setMinStarsAction}>
              <input type="hidden" name="minStars" value={n} />
              <StarButton active={data.minStars === n} stars={n} />
            </form>
          ))}
        </div>
      </section>

      {/* Manual add */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          Manuel yorum ekle
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Google bağlantısı kurulana kadar — ya da Google dışı kaynaklardan
          (WhatsApp, e-posta, Trustpilot) gelen yorumları eklemek için.
        </p>
        <div className="mt-4">
          <AddManualForm />
        </div>
      </section>

      {/* Reviews list */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yorumlar
          </div>
          <div className="text-[12px] text-black/50">
            {data.reviews.length} kayıt
          </div>
        </div>

        {data.reviews.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yorum yok. Yukarıdaki formdan ekleyebilirsin.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data.reviews.map((r) => (
              <ReviewRow
                key={r.id}
                review={r}
                visible={isReviewVisible(r, data.minStars)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ReviewRow({
  review,
  visible,
}: {
  review: Review
  visible: boolean
}) {
  const override = review.publishOverride
  return (
    <li className="rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3c639f] text-[12px] font-semibold text-white">
          {review.author
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-[#0a0a0a]">
              {review.author}
            </span>
            <Stars rating={review.rating} />
            <span className="text-[11px] text-black/40">·</span>
            <span className="text-[11px] text-black/40">{review.date}</span>
            <span
              className={
                review.origin === "google"
                  ? "rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
                  : "rounded bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-black/55"
              }
            >
              {review.origin === "google" ? "Google" : "Manuel"}
            </span>
            <VisibilityBadge visible={visible} override={override} />
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-black/75">
            {review.text}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          {/* Override controls: 3-state — Auto / Force show / Force hide */}
          <OverrideControls id={review.id} value={override} />
          <form action={deleteReviewAction}>
            <input type="hidden" name="id" value={review.id} />
            <button
              type="submit"
              aria-label="Sil"
              title="Sil"
              className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={13} />
            </button>
          </form>
        </div>
      </div>
    </li>
  )
}

function OverrideControls({
  id,
  value,
}: {
  id: string
  value: boolean | null
}) {
  return (
    <div className="flex gap-0.5">
      <OverrideBtn
        id={id}
        nextValue={value === true ? "null" : "true"}
        active={value === true}
        title={value === true ? "Otomatik moda dön" : "Her zaman göster"}
      >
        <Eye size={12} />
      </OverrideBtn>
      <OverrideBtn
        id={id}
        nextValue={value === false ? "null" : "false"}
        active={value === false}
        title={value === false ? "Otomatik moda dön" : "Her zaman gizle"}
      >
        <EyeOff size={12} />
      </OverrideBtn>
    </div>
  )
}

function OverrideBtn({
  id,
  nextValue,
  active,
  title,
  children,
}: {
  id: string
  nextValue: string
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <form action={setOverrideAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="value" value={nextValue} />
      <button
        type="submit"
        title={title}
        aria-label={title}
        className={
          active
            ? "flex h-7 w-7 items-center justify-center rounded-md bg-[#3c639f] text-white"
            : "flex h-7 w-7 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
        }
      >
        {children}
      </button>
    </form>
  )
}

function VisibilityBadge({
  visible,
  override,
}: {
  visible: boolean
  override: boolean | null
}) {
  let label = visible ? "Yayında" : "Gizli"
  if (override === true) label = "Yayında (manuel)"
  if (override === false) label = "Gizli (manuel)"
  return (
    <span
      className={
        visible
          ? "rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
          : "rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700"
      }
    >
      {label}
    </span>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={n <= rating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-black/15"}
        />
      ))}
    </span>
  )
}

function SourceButton({
  active,
  icon,
  children,
}: {
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={
        active
          ? "flex items-center gap-1.5 rounded-lg bg-[#3c639f] px-3 py-2 text-[12.5px] font-medium text-white"
          : "flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[12.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
      }
    >
      {icon}
      {children}
    </button>
  )
}

function StarButton({ active, stars }: { active: boolean; stars: number }) {
  return (
    <button
      type="submit"
      className={
        active
          ? "flex items-center gap-1 rounded-lg bg-[#3c639f] px-3 py-2 text-[12.5px] font-medium text-white"
          : "flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[12.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
      }
    >
      {stars === 0 ? (
        "Filtresiz"
      ) : (
        <>
          <span>{stars}+</span>
          <Star size={11} className={active ? "fill-white text-white" : "fill-[#fbbf24] text-[#fbbf24]"} />
        </>
      )}
    </button>
  )
}
