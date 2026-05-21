"use client"

import { useActionState, useEffect, useState } from "react"
import {
  Check,
  AlertCircle,
  Loader2,
  Layers,
  Globe,
  Boxes,
  Rocket,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react"
import {
  MAX_WEB_PACKAGE_BULLETS,
  WEB_PACKAGE_ICON_KEYS,
  type WebPackage,
  type WebPackageIconKey,
} from "@/lib/web-packages-types"
import { saveWebPackagesAction, type SaveState } from "./actions"

const ICON_MAP: Record<WebPackageIconKey, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  layers: Layers,
  globe: Globe,
  boxes: Boxes,
  rocket: Rocket,
  sparkles: Sparkles,
  refresh: RefreshCw,
}

const ICON_LABEL: Record<WebPackageIconKey, string> = {
  layers: "Katmanlar",
  globe: "Küre",
  boxes: "Kutular",
  rocket: "Roket",
  sparkles: "Parıltı",
  refresh: "Yenileme",
}

export function WebPackagesForm({ initial }: { initial: WebPackage[] }) {
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveWebPackagesAction,
    {},
  )
  const [packages, setPackages] = useState<WebPackage[]>(initial)

  function updatePackage(i: number, patch: Partial<WebPackage>) {
    setPackages((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }
  function updateBullet(i: number, j: number, value: string) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === i
          ? { ...p, bullets: p.bullets.map((b, bi) => (bi === j ? value : b)) }
          : p,
      ),
    )
  }
  function addBullet(i: number) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === i && p.bullets.length < MAX_WEB_PACKAGE_BULLETS
          ? { ...p, bullets: [...p.bullets, ""] }
          : p,
      ),
    )
  }
  function removeBullet(i: number, j: number) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, bullets: p.bullets.filter((_, bi) => bi !== j) } : p,
      ),
    )
  }

  function addPackage() {
    setPackages((prev) => [
      ...prev,
      {
        id: `paket-${Date.now()}`,
        label: "Yeni paket",
        tagline: "",
        descriptor: "",
        desc: "",
        bullets: [""],
        iconKey: "layers",
        kobiRedirect: false,
        priceMin: null,
        priceMax: null,
      },
    ])
  }
  function removePackage(i: number) {
    setPackages((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        {packages.map((pkg, i) => {
          const Icon = ICON_MAP[pkg.iconKey] ?? Layers
          return (
            <div
              key={i}
              className="rounded-2xl border border-black/[0.06] bg-white p-5"
            >
              <input type="hidden" name="pkg_id" value={pkg.id} />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3c639f]/[0.08] text-[#3c639f]">
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="text-[13px] font-semibold text-[#0a0a0a]">
                    {pkg.label || "(isimsiz paket)"}
                  </div>
                  <span className="text-[11px] text-black/40">· {pkg.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removePackage(i)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  title="Paketi sil"
                >
                  <Trash2 size={12} /> Sil
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Başlık">
                  <input
                    name={`label_${i}`}
                    type="text"
                    value={pkg.label}
                    onChange={(e) => updatePackage(i, { label: e.target.value })}
                    required
                    className={fieldInput}
                  />
                </Field>
                <Field label="Alt başlık (tagline)">
                  <input
                    name={`tagline_${i}`}
                    type="text"
                    value={pkg.tagline}
                    onChange={(e) => updatePackage(i, { tagline: e.target.value })}
                    className={fieldInput}
                  />
                </Field>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
                <Field label="Karakter (ör. Pratik, Bütçe dostu)">
                  <input
                    name={`descriptor_${i}`}
                    type="text"
                    value={pkg.descriptor}
                    onChange={(e) =>
                      updatePackage(i, { descriptor: e.target.value })
                    }
                    className={fieldInput}
                  />
                </Field>
                <Field label="İkon">
                  <select
                    name={`iconKey_${i}`}
                    value={pkg.iconKey}
                    onChange={(e) =>
                      updatePackage(i, {
                        iconKey: e.target.value as WebPackageIconKey,
                      })
                    }
                    className={fieldInput}
                  >
                    {WEB_PACKAGE_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {ICON_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Webreta KOBİ yönlendirmesi">
                  <label className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-black/[0.12] bg-white px-3 text-[13px] font-medium text-[#0a0a0a]">
                    <input
                      type="checkbox"
                      name={`kobi_${i}`}
                      checked={pkg.kobiRedirect}
                      onChange={(e) =>
                        updatePackage(i, { kobiRedirect: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]"
                    />
                    Açık
                  </label>
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Açıklama paragrafı">
                  <textarea
                    name={`desc_${i}`}
                    value={pkg.desc}
                    onChange={(e) => updatePackage(i, { desc: e.target.value })}
                    rows={3}
                    className={`${fieldInput} resize-none`}
                  />
                </Field>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Tahmini teklif — alt sınır (₺)">
                  <input
                    name={`priceMin_${i}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={pkg.priceMin ?? ""}
                    onChange={(e) =>
                      updatePackage(i, {
                        priceMin:
                          e.target.value === ""
                            ? null
                            : Math.max(0, Math.round(Number(e.target.value))),
                      })
                    }
                    placeholder="örn. 25000"
                    className={fieldInput}
                  />
                </Field>
                <Field label="Tahmini teklif — üst sınır (₺)">
                  <input
                    name={`priceMax_${i}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={pkg.priceMax ?? ""}
                    onChange={(e) =>
                      updatePackage(i, {
                        priceMax:
                          e.target.value === ""
                            ? null
                            : Math.max(0, Math.round(Number(e.target.value))),
                      })
                    }
                    placeholder="örn. 45000"
                    className={fieldInput}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#3c639f]">
                    Maddeler ({pkg.bullets.length}/{MAX_WEB_PACKAGE_BULLETS})
                  </span>
                  <button
                    type="button"
                    onClick={() => addBullet(i)}
                    disabled={pkg.bullets.length >= MAX_WEB_PACKAGE_BULLETS}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={12} /> Madde ekle
                  </button>
                </div>
                <div className="mt-2.5 flex flex-col gap-2">
                  {pkg.bullets.map((b, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/[0.04] text-[11px] font-medium text-black/50">
                        {j + 1}
                      </span>
                      <input
                        type="text"
                        name={`bullets_${i}`}
                        value={b}
                        onChange={(e) => updateBullet(i, j, e.target.value)}
                        placeholder={`Madde ${j + 1}`}
                        className={fieldInput}
                      />
                      <button
                        type="button"
                        onClick={() => removeBullet(i, j)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Maddeyi sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addPackage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#3c639f]/40 bg-white px-4 py-2 text-[12.5px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.04]"
        >
          <Plus size={14} /> Yeni paket ekle
        </button>
        <div className="flex items-center gap-3">
          {state.ok && !isPending && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
              <Check size={14} /> Kaydedildi
            </span>
          )}
          {state.error && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
              <AlertCircle size={14} /> {state.error}
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Tümünü Kaydet
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {children}
    </label>
  )
}

const fieldInput =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
