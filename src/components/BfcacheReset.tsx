"use client"

import { useEffect } from "react"

// Tarayıcı bfcache'inden (back/forward cache) sayfayı geri yüklediğinde
// useEffect/setInterval/animasyon state'i donmuş kalabiliyor — özellikle
// timer-driven carousel'lar, IntersectionObserver tabanlı reveal'lar ve
// karmaşık yazı animasyonları. Burada bfcache restoration'ını yakalayıp
// sert reload atıyoruz; normal navigasyon (yeni sayfa yükleme) etkilenmez.
//
// `pageshow` eventi sadece bfcache restorasyonunda persisted=true ile fırlar;
// ilk yüklemede persisted=false olur ve gate'i geçemez.
export default function BfcacheReset() {
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])
  return null
}
