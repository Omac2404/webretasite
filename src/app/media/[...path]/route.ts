import { uploadRouteHandler } from "@/lib/uploads-route"

// Medya kütüphanesi (blog kapakları, referans logoları, içerik görselleri).
export const GET = uploadRouteHandler("media")
