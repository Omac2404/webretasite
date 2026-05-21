// Hakkımızda sayfası içeriği. Client-safe tipler — admin UI ve API
// route'u buradan import eder.

export type AboutRow = {
  kicker: string
  title: string
  // Çift satır (\n\n) yeni paragraf olarak render edilir.
  body: string
  imageUrl: string
  imageAlt: string
}

export type AboutCta = {
  title: string
  body: string
  buttonLabel: string
  buttonHref: string
}

export type AboutHero = {
  kicker: string
  // 3 parça: başlangıç metin (font-normal), vurgulu kısım (font-bold,
  // mavi), kapanış metin (font-normal). Boş bırakılan parça hiç
  // render edilmez.
  titleLeader: string
  titleHighlight: string
  titleTrailer: string
  subtitle: string
}

export type AboutData = {
  hero: AboutHero
  row1: AboutRow
  row2: AboutRow
  cta: AboutCta
}

export const DEFAULT_ABOUT: AboutData = {
  hero: {
    kicker: "Hakkımızda",
    titleLeader: "İzmir'den, ",
    titleHighlight: "dijital dünyaya",
    titleTrailer: " — basit ve net.",
    subtitle:
      "Webreta, küçük ve orta ölçekli markalar için web tasarımı, geliştirmesi ve dijital reklam üreten bir stüdyodur. Süslü sözlerden uzak; tasarımı sade, performansı yüksek, kurmaya değer işler peşindeyiz.",
  },
  row1: {
    kicker: "Hikayemiz",
    title: "Bir fikrin hayata geçtiği yer.",
    body: "Webreta, küçük bir ekiple büyük markalara hizmet verme fikrinden doğdu. Uzun süredir hem ajans hem freelance tarafında çalışan ekibimiz; her projenin kendine özgü bir ses tonu, hedefi ve müşterisi olduğunu biliyor.\n\nBir kafe için tasarladığımız siteyle bir hukuk bürosuna kurduğumuz portal aynı şablondan çıkmaz; ihtiyaç ne ise yanıt da odur.",
    imageUrl: "",
    imageAlt: "Webreta ekibi",
  },
  row2: {
    kicker: "Çalışma prensibimiz",
    title: "Yalın. Hızlı. Açık.",
    body: "Tasarımda gereksiz hiçbir şey istemiyoruz; aylar süren projeler yerine net kapsam ve kısa iterasyonlarla ilerliyoruz; iletişimde teknik jargonla saklanmıyor, ne yaptığımızı sade Türkçe ile anlatıyoruz.\n\nÇıkan iş canlıya hızla alınır, ölçülür ve sonra iyileştirilir.",
    imageUrl: "",
    imageAlt: "Webreta çalışma tarzı",
  },
  cta: {
    title: "Bir proje konuşalım mı?",
    body: "Kısa bir özet bırakın, 24 saat içinde dönelim.",
    buttonLabel: "İletişime geç",
    buttonHref: "/iletisim",
  },
}
