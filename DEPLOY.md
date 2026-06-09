# Webreta — EasyPanel Deploy Rehberi

Bu site **kendi içinde tam** bir Next.js uygulamasıdır: harici backend veya veritabanı
yoktur. Veriler `data/*.json` dosyalarında tutulur, e-posta `nodemailer` (SMTP) ile gider.
Bu yüzden **kalıcı veri (volume)** kurulumu kritiktir.

---

## 1. Mimari özet

| Konu            | Durum                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, `output: standalone`)                         |
| Veritabanı      | Yok — JSON dosyaları (`data/`)                                         |
| E-posta         | `nodemailer` / SMTP (ayarlar `data/smtp.json`)                        |
| Build           | Dockerfile (multi-stage, pnpm 10)                                     |
| Çalışma portu   | `3000`                                                                 |
| Admin paneli    | `/admin` · giriş: `webreta.digital@gmail.com`                        |

### Runtime'da yazılan (kalıcı olması gereken) dizinler

- **`/app/data`** — form talepleri (`inquiries.json`, `appointments.json`),
  analytics, audit log, admin içerik düzenlemeleri, ayarlar
- **`/app/public`** — admin panelinden yüklenen görseller
  (`media/`, `brand/`, `about/`, `authors/`, `og/`, `blog/`)

> Bu iki dizin için EasyPanel'de **volume** bağlanmazsa, her yeniden deploy/restart'ta
> gelen müşteri talepleri ve yüklenen görseller **sıfırlanır**.
> `Dockerfile` + `docker-entrypoint.sh`, volume ilk bağlandığında boşsa içine başlangıç
> içeriğini (seed) otomatik kopyalar; böylece boş volume mevcut içeriği gizlemez.

---

## 2. EasyPanel'de adım adım

### 2.1 Proje ve servis oluştur

1. EasyPanel → **Create Project** → ad: `webreta`
2. Proje içinde → **+ Service** → **App**

### 2.2 Kaynak (Source)

- **Source:** GitHub
- **Repo:** `Omac2404/webretasite`
- **Branch:** `main`
- (Private repo ise EasyPanel'in GitHub erişimini/Deploy Key'ini yetkilendir.)

### 2.3 Build

- **Build Method:** `Dockerfile`
- **Dockerfile Path:** `Dockerfile` (kök dizin)

### 2.4 Environment Variables

| Key                    | Değer                                                              | Zorunlu |
| ---------------------- | ----------------------------------------------------------------- | ------- |
| `ADMIN_SESSION_SECRET` | (aşağıdaki güçlü değeri kullan)                                    | **Evet** |
| `NODE_ENV`             | `production`                                                       | Hayır (Dockerfile zaten ayarlar) |
| `ADMIN_PASSWORD`       | sadece admins.json YOKSA ilk admin şifresini belirler — gerek yok | Hayır   |

Önerilen `ADMIN_SESSION_SECRET` (senin için üretildi — istersen değiştir):

```
oXyAgbpsOcmN1YtY9z86FKHxjvjkZ0eI_lan7YilKYTwuGO-J59yeuGWWEAvs4u6
```

> `ADMIN_SESSION_SECRET` set edilmezse uygulama güvensiz bir sabit default kullanır.
> Production'da mutlaka set et.

### 2.5 Mounts (Volumes) — KRİTİK

İki volume ekle (EasyPanel → servis → **Mounts** → **Add Mount** → *Volume*):

| Volume adı       | Mount Path     |
| ---------------- | -------------- |
| `webreta-data`   | `/app/data`    |
| `webreta-public` | `/app/public`  |

> İlk deploy'da bu volume'ler boş gelir; entrypoint seed içeriğini otomatik kopyalar.
> Sonraki deploy'larda volume dolu olduğu için tohumlama atlanır ve verilerin korunur.

### 2.6 Domain

- EasyPanel → servis → **Domains** → **Add Domain**
- Domain: `webreta.com.tr` (ve istersen `www.webreta.com.tr`)
- **Port:** `3000`
- HTTPS / Let's Encrypt sertifikasını etkinleştir.
- DNS: domain'in **A kaydını** EasyPanel sunucunun IP'sine yönlendir.

### 2.7 Deploy

- **Deploy** butonuna bas. İlk build birkaç dakika sürer (pnpm install + next build).
- Log'larda `[entrypoint] ... tohumlanıyor` satırlarını ve ardından Next.js'in
  `Ready` çıktısını görmelisin.

---

## 3. Deploy sonrası kontrol listesi

- [ ] Anasayfa `https://webreta.com.tr` açılıyor
- [ ] `/admin` → `webreta.digital@gmail.com` ile giriş çalışıyor
- [ ] İletişim/teklif formu gönderiliyor ve e-posta geliyor (SMTP)
- [ ] Admin panelinden bir görsel yükle → sayfada görünüyor
- [ ] Servisi **Restart** et → yüklediğin görsel ve form talebi **hâlâ duruyor** (volume testi)

---

## 4. Güvenlik notları

- ⚠️ `data/smtp.json` içinde **gerçek e-posta şifresi**, `data/admins.json` içinde admin
  parola hash'i repoda commit'li. Repo'nun **private** olduğundan emin ol.
- SMTP şifresini değiştirmek istersen: admin panel → Ayarlar → SMTP (volume'deki dosyayı
  günceller), ya da yeni `data/smtp.json` commit'leyip yeniden deploy + volume sıfırla.

---

## 5. Sık sorunlar

| Belirti                                   | Sebep / Çözüm                                                        |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Deploy sonrası site **boş/içeriksiz**     | Volume ilk seed'i alamadı → entrypoint log'una bak; volume'ü silip yeniden deploy et |
| Yüklenen görseller redeploy'da kayboluyor | `/app/public` volume'ü bağlı değil                                   |
| Form talepleri kayboluyor                 | `/app/data` volume'ü bağlı değil                                     |
| `bad interpreter` / entrypoint hatası     | `docker-entrypoint.sh` CRLF ile commit edilmiş (`.gitattributes` bunu önler) |
| Admin'e girilemiyor                        | `ADMIN_SESSION_SECRET` deploy'lar arası değişti → cookie geçersiz, tekrar giriş yap |
