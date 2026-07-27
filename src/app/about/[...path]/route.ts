import { uploadRouteHandler } from "@/lib/uploads-route"

// "Hakkımızda" sayfasından yüklenen görseller.
export const GET = uploadRouteHandler("about")
