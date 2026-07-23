import { MedusaContainer } from "@medusajs/framework";
import { seedCatalog, SeedProduct } from "./_helpers";

// Mot: Vietnamese bookstore (editorial design). Titles are well-known works of
// Vietnamese literature. Digital editions arrive in a later phase. English
// lives in the core fields; Vietnamese lives in metadata.
export const PRODUCTS: SeedProduct[] = [
  {
    title: "The Tale of Kieu",
    handle: "the-tale-of-kieu",
    description:
      "Nguyen Du's epic poem, the masterpiece of classical Vietnamese literature.",
    weight: 400,
    metadata: {
      title_vi: "Truyện Kiều",
      description_vi:
        "Truyện thơ của Nguyễn Du, kiệt tác của văn học cổ điển Việt Nam.",
      author: "Nguyễn Du",
      excerpt_vi:
        "Trăm năm trong cõi người ta,\nChữ tài chữ mệnh khéo là ghét nhau.\nTrải qua một cuộc bể dâu,\nNhững điều trông thấy mà đau đớn lòng.",
      excerpt_en:
        "A hundred years within this human span,\ntalent and fate are set to feud.\nThrough one turning of the sea to mulberry fields,\nwhat the eyes have seen leaves the heart in pain.",
    },
    options: [{ title: "Cover", values: ["Softcover", "Hardcover"] }],
    variants: [
      {
        title: "Softcover",
        sku: "MOT-KIEU-SC",
        options: { Cover: "Softcover" },
        prices: [
          { currency_code: "vnd", amount: 120000 },
          { currency_code: "usd", amount: 9 },
        ],
      },
      {
        title: "Hardcover",
        sku: "MOT-KIEU-HC",
        options: { Cover: "Hardcover" },
        prices: [
          { currency_code: "vnd", amount: 220000 },
          { currency_code: "usd", amount: 15 },
        ],
      },
    ],
  },
  {
    title: "Dumb Luck",
    handle: "dumb-luck",
    description:
      "Vu Trong Phung's satirical novel of colonial-era Hanoi society.",
    weight: 350,
    metadata: {
      title_vi: "Số Đỏ",
      description_vi:
        "Tiểu thuyết trào phúng của Vũ Trọng Phụng về xã hội Hà Nội thời thuộc địa.",
      author: "Vũ Trọng Phụng",
      excerpt_vi:
        "Lúc ấy vào độ 3 giờ chiều, một ngày thứ năm. Trong khu sân quần mà bên ngoài là những hàng ruối kín mít, chỉ có một sân hữu là được hai người Pháp dùng đến.",
      excerpt_en:
        "It was about three in the afternoon, on a Thursday. On the tennis courts, screened all around by dense hedges, only one court was in use, by two Frenchmen.",
    },
    options: [{ title: "Cover", values: ["Softcover"] }],
    variants: [
      {
        title: "Softcover",
        sku: "MOT-SODO-SC",
        options: { Cover: "Softcover" },
        prices: [
          { currency_code: "vnd", amount: 95000 },
          { currency_code: "usd", amount: 8 },
        ],
      },
    ],
  },
  {
    title: "Diary of a Cricket",
    handle: "diary-of-a-cricket",
    description: "To Hoai's beloved children's tale of a cricket's adventures.",
    weight: 300,
    metadata: {
      title_vi: "Dế Mèn Phiêu Lưu Ký",
      description_vi:
        "Truyện thiếu nhi nổi tiếng của Tô Hoài về cuộc phiêu lưu của chú Dế Mèn.",
      author: "Tô Hoài",
      excerpt_vi:
        "Tôi sống độc lập từ thuở bé. Ấy là tục lệ lâu đời trong họ nhà dế chúng tôi. Vả lại, mẹ thường bảo chúng tôi rằng: 'Phải như thế, để các con biết kiếm ăn một mình cho quen đi.'",
      excerpt_en:
        "I have lived on my own since I was small. That is a long-standing custom in our cricket family. And my mother often told us it must be this way, so we would learn to fend for ourselves.",
    },
    options: [{ title: "Cover", values: ["Hardcover"] }],
    variants: [
      {
        title: "Hardcover",
        sku: "MOT-DEMEN-HC",
        options: { Cover: "Hardcover" },
        prices: [
          { currency_code: "vnd", amount: 150000 },
          { currency_code: "usd", amount: 11 },
        ],
      },
    ],
  },
];

export default async function seedMot({
  container,
}: {
  container: MedusaContainer;
}) {
  await seedCatalog(container, "mot", PRODUCTS);
}
