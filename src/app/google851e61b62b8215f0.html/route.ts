// Google Search Console "HTML dosyası" doğrulaması.
//
// Google, https://alanadi/google<token>.html adresinden bu dosyayı isteyip
// içeriğinin birebir eşleşmesini bekler. Dosyayı public/ klasörüne koymak
// burada işe yaramaz: production'da /app/public bir volume ve dolu olduğu
// için entrypoint repodaki public/ içeriğini oraya hiç kopyalamıyor
// (bkz. docker-entrypoint.sh). Route handler ise build'in parçası olarak
// gittiğinden her deploy'da kesin olarak yayında olur.
//
// Doğrulama tamamlandıktan sonra bile bu dosya yerinde kalmalı — Google
// periyodik olarak yeniden kontrol ediyor, kaldırılırsa mülkiyet düşer.

const VERIFICATION_TOKEN = "google851e61b62b8215f0.html"

export function GET(): Response {
  return new Response(`google-site-verification: ${VERIFICATION_TOKEN}`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
