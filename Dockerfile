# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------- base
# pnpm 10 (lockfileVersion 9.0 + pnpm-workspace.yaml allowBuilds/
# ignoredBuiltDependencies alanlari pnpm 10 ozelligi). corepack yerine
# dogrudan kurarak "packageManager alani yok" belirsizligini ortadan kaldiriyoruz.
FROM node:22-alpine AS base
RUN npm install -g pnpm@10
WORKDIR /app

# ---------------------------------------------------------------- deps
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------- builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------------------------------------------------------------- runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# su-exec: entrypoint root olarak baslar (volume sahipligini duzeltmek icin),
# sonra uygulamayi nextjs kullanicisina dusurur.
RUN apk add --no-cache su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js standalone server + statik varliklar.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kalici dizinler (data/ + public/) runtime'da yazilir (form talepleri, yuklenen
# gorseller, panel degisiklikleri). Bunlarin BAKILI bir "seed" kopyasini sakliyoruz;
# entrypoint, mount edilen volume bos oldugunda (ilk acilis) bu seed'i icine
# kopyalar. Boylece bos volume baslangic icerigini gizlemez.
COPY --from=builder --chown=nextjs:nodejs /app/public ./seed/public
COPY --from=builder --chown=nextjs:nodejs /app/data   ./seed/data

# Volume mount edilmese bile dizinler var olsun ve uygulama yazabilsin.
RUN mkdir -p /app/public /app/data \
  && chown -R nextjs:nodejs /app/public /app/data /app/seed

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

# root olarak basla -> entrypoint seed + chown yapar -> su-exec ile nextjs'e duser.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
