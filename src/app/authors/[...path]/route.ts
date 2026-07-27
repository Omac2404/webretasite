import { uploadRouteHandler } from "@/lib/uploads-route"

// Blog yazarlarının profil görselleri.
export const GET = uploadRouteHandler("authors")
