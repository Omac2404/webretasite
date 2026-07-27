import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Next'in varsayılanı 1 MB. Admin panelindeki görsel yüklemeleri
      // (medya kütüphanesi 12 MB'a kadar) bu duvara çarpıp action hiç
      // çalışmadan 413 ile reddediliyordu — form da bu yüzden sessizce
      // hiçbir hata göstermiyordu. Limit, multipart boundary/başlık ek
      // yükünü de kapsadığı için en büyük dosya limitinin biraz üstünde.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
