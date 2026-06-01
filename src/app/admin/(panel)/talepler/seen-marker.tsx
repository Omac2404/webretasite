"use client"

import { useEffect } from "react"
import { markTaleplerSeenAction } from "./actions"

// Fires once on mount to mark the talepler list as seen — clears the
// sidebar badge without doing file I/O during render.
export function SeenMarker() {
  useEffect(() => {
    void markTaleplerSeenAction()
  }, [])
  return null
}
