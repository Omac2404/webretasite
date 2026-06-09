#!/bin/sh
# Webreta — container entrypoint.
#
# Amac: data/ ve public/ kalici dizinlerini ilk acilista (volume bos iken)
# bakili seed kopyasindan tohumlamak, ardindan volume sahipligini app
# kullanicisina vermek ve uygulamayi root yerine nextjs olarak calistirmak.
set -e

seed_dir() {
  target="/app/$1"
  source="/app/seed/$1"
  # Hedef bos mu? (yeni mount edilen volume bos olur)
  if [ -z "$(ls -A "$target" 2>/dev/null)" ]; then
    if [ -d "$source" ]; then
      echo "[entrypoint] '$target' bos -> '$source' icinden tohumlaniyor"
      cp -a "$source/." "$target/" 2>/dev/null || true
    fi
  else
    echo "[entrypoint] '$target' zaten dolu -> tohumlama atlandi"
  fi
}

seed_dir data
seed_dir public

# Root isek: yazilabilir dizinlerin sahipligini duzelt, sonra nextjs'e dus.
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs /app/data /app/public 2>/dev/null || true
  exec su-exec nextjs "$@"
fi

exec "$@"
