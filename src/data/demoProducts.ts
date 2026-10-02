import type { Product, ProductVariant } from "../types";
import { subcategoryLabels, type Label } from "./taxonomy";

/* Generated test catalog for local development (see catalog.ts). Sized like
   a real sports-nutrition shop: it fills the store's own categories, adds a
   few typical new ones, and gives most of them subcategories. A fixed seed
   keeps ids, prices, and stock identical on every load, so saved items and
   the cart survive refreshes. */

const NO_PHOTO = "./logo.svg";

type DemoCategory = {
  id: string;
  /* Only for categories the store does not already name in translations. */
  label?: Label;
  /* [id, Georgian, English]; ids already in taxonomy.ts are reused as-is. */
  subcategories: [id: string, ka: string, en: string][];
  count: number;
  images: string[];
  price: [number, number];
  options?: string[];
};

const flavors = ["Chocolate", "Vanilla", "Strawberry", "Cookies & Cream"];
const capsules = ["60 caps", "90 caps", "120 caps"];
const powders = ["300 g", "500 g", "1 kg"];
const clothing = ["S", "M", "L", "XL"];

const demoCategories: DemoCategory[] = [
  {
    id: "protein",
    subcategories: [
      ["whey", "შრატის პროტეინი", "Whey"],
      ["isolate", "იზოლატი", "Isolate"],
      ["casein", "კაზეინი", "Casein"],
      ["plant", "მცენარეული", "Plant-based"],
    ],
    count: 18,
    images: ["./whey.webp", "./bpi.jpg"],
    price: [65, 260],
    options: flavors,
  },
  {
    id: "creatine",
    subcategories: [
      ["monohydrate", "მონოჰიდრატი", "Monohydrate"],
      ["hcl", "ჰიდროქლორიდი", "HCL"],
      ["capsules", "კაფსულები", "Capsules"],
    ],
    count: 10,
    images: ["./creatine.webp", "./creatine500.jpg"],
    price: [35, 120],
    options: powders,
  },
  {
    id: "vitamins",
    subcategories: [
      ["multivitamins", "მულტივიტამინები", "Multivitamins"],
      ["vitamin-d", "ვიტამინი D", "Vitamin D"],
      ["b-complex", "B კომპლექსი", "B-Complex"],
      ["vitamin-c", "ვიტამინი C", "Vitamin C"],
    ],
    count: 16,
    images: ["./vitamins.webp", "./bcomplex.webp", "./biotin.webp"],
    price: [15, 70],
    options: capsules,
  },
  {
    id: "amino",
    subcategories: [
      ["bcaa", "BCAA", "BCAA"],
      ["eaa", "EAA", "EAA"],
      ["glutamine", "გლუტამინი", "Glutamine"],
    ],
    count: 10,
    images: ["./vplab.webp", "./bpi.jpg"],
    price: [40, 110],
    options: ["Lemon", "Watermelon", "Blue Raspberry"],
  },
  {
    id: "preworkout",
    subcategories: [
      ["stimulant", "სტიმულანტი", "Stimulant"],
      ["stim-free", "სტიმულანტის გარეშე", "Stim-free"],
    ],
    count: 10,
    images: ["./nxt.jpg", "./bpi.jpg"],
    price: [55, 140],
    options: ["Fruit Punch", "Green Apple", "Cola"],
  },
  {
    id: "fatburners",
    subcategories: [
      ["thermogenic", "თერმოგენული", "Thermogenic"],
      ["lipotropic", "ლიპოტროპული", "Lipotropic"],
    ],
    count: 8,
    images: ["./berberine.webp", "./nxt.jpg"],
    price: [45, 120],
  },
  {
    id: "gainer",
    subcategories: [],
    count: 6,
    images: ["./whey.webp", "./bpi.jpg"],
    price: [90, 230],
    options: flavors,
  },
  {
    id: "hydration",
    subcategories: [],
    count: 6,
    images: ["./vplab.webp", "./vitamins.webp"],
    price: [20, 60],
    options: ["Orange", "Lemon-Lime", "Berry"],
  },
  {
    id: "snacks",
    subcategories: [
      ["bars", "ბატონები", "Bars"],
      ["cookies", "ნამცხვრები", "Cookies"],
      ["spreads", "პასტები", "Spreads"],
    ],
    count: 12,
    images: ["./bundle.jpg", "./whey.webp"],
    price: [5, 45],
  },
  {
    id: "minerals",
    label: { ka: "მინერალები", en: "Minerals" },
    subcategories: [
      ["magnesium", "მაგნიუმი", "Magnesium"],
      ["zinc", "თუთია", "Zinc"],
      ["iron", "რკინა", "Iron"],
      ["calcium", "კალციუმი", "Calcium"],
    ],
    count: 10,
    images: ["./magbis.webp", "./magcitrate.webp", "./zinc.webp"],
    price: [15, 55],
    options: capsules,
  },
  {
    id: "omega-fats",
    label: { ka: "ომეგა ცხიმები", en: "Omega fats" },
    subcategories: [
      ["fish-oil", "თევზის ცხიმი", "Fish oil"],
      ["krill", "კრილის ზეთი", "Krill oil"],
    ],
    count: 6,
    images: ["./omega3.webp"],
    price: [30, 95],
    options: capsules,
  },
  {
    id: "collagen",
    label: { ka: "კოლაგენი", en: "Collagen" },
    subcategories: [],
    count: 6,
    images: ["./biotin.webp", "./vplab.webp"],
    price: [45, 130],
  },
  {
    id: "healthy-food",
    label: { ka: "ჯანსაღი საკვები", en: "Healthy food" },
    subcategories: [
      ["oats", "შვრია", "Oats"],
      ["rice-cream", "ბრინჯის კრემი", "Cream of rice"],
      ["syrups", "სიროფები", "Zero syrups"],
    ],
    count: 9,
    images: ["./bundle.jpg"],
    price: [8, 45],
  },
  {
    id: "accessories",
    label: { ka: "აქსესუარები", en: "Accessories" },
    subcategories: [
      ["shakers", "შეიკერები", "Shakers"],
      ["bottles", "ბოთლები", "Bottles"],
      ["gym-bags", "სპორტული ჩანთები", "Gym bags"],
    ],
    count: 9,
    images: [NO_PHOTO],
    price: [10, 90],
  },
  {
    id: "apparel",
    label: { ka: "ტანსაცმელი", en: "Apparel" },
    subcategories: [
      ["t-shirts", "მაისურები", "T-shirts"],
      ["hoodies", "ჰუდები", "Hoodies"],
    ],
    count: 6,
    images: [NO_PHOTO],
    price: [35, 150],
    options: clothing,
  },
];

const brands = [
  "Optimum Nutrition",
  "MYPROTEIN",
  "BPI SPORTS",
  "VPLAB",
  "NXT NUTRITION",
  "Vital Harmony",
  "VH.NUTRA",
  "ULTRAVIT",
  "Scitec Nutrition",
  "BioTech USA",
  "Dymatize",
  "Applied Nutrition",
];

function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const roundPrice = (value: number) => Math.max(1, Math.round(value)) - 0.01;

/* Shared subcategory ids (taxonomy.ts) are kept; others get a category
   prefix so names like "capsules" never collide between categories. */
const subcategoryId = (category: string, subcategory: string) =>
  subcategoryLabels[subcategory] ? subcategory : `${category}--${subcategory}`;

/* Builds the demo products and the names of their new categories and
   subcategories. Only called in development, so production builds drop it. */
export function createDemoCatalog() {
  const random = seededRandom(20261002);
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(random() * items.length)];
  const chance = (probability: number) => random() < probability;

  const variantsFor = (
    id: string,
    basePrice: number,
    options: string[],
    image: string,
  ): ProductVariant[] => {
    const count = 2 + Math.floor(random() * Math.min(3, options.length - 1));
    return options.slice(0, count).map((name, index) => {
      const price = roundPrice(basePrice * (1 + index * 0.18));
      return {
        id: `${id}-v${index + 1}`,
        name,
        price,
        previousPrice: chance(0.2) ? roundPrice(price * 1.25) : undefined,
        inStock: index === 0 || chance(0.8),
        image,
      };
    });
  };

  const labels: Record<string, Label> = Object.fromEntries(
    demoCategories.flatMap((category) => [
      ...(category.label ? [[category.id, category.label] as const] : []),
      ...category.subcategories.map(
        ([id, ka, en]) => [subcategoryId(category.id, id), { ka, en }] as const,
      ),
    ]),
  );

  const products: Product[] = demoCategories.flatMap((category) =>
    Array.from({ length: category.count }, (_, index) => {
      const id = `demo-${category.id}-${index + 1}`;
      const subcategory = category.subcategories.length
        ? category.subcategories[index % category.subcategories.length]
        : undefined;
      const typeName = subcategory?.[2] ?? category.label?.en ?? category.id;
      const brand = pick(brands);
      const name =
        index === 5
          ? `${brand} ${typeName} Advanced Formula with Extra Absorption, Third-Party Tested`
          : `${brand} ${typeName} ${index + 1}`;
      const image = pick(category.images);
      const [minimum, maximum] = category.price;
      const price = roundPrice(minimum + random() * (maximum - minimum));
      const onSale = chance(0.25);
      const variants =
        category.options && chance(0.35)
          ? variantsFor(id, price, category.options, image)
          : [];
      const categoryName = category.label?.en ?? typeName;

      return {
        id,
        brand,
        name,
        category: category.id,
        categories: [category.id],
        image,
        slug: id,
        subtitle: categoryName,
        price: variants[0]?.price ?? price,
        previousPrice: onSale
          ? roundPrice(price * (1.12 + random() * 0.3))
          : undefined,
        from: variants.length > 1,
        badge: onSale ? "sale" : chance(0.1) ? "bestseller" : undefined,
        description: {
          ka: `სატესტო პროდუქტი${subcategory ? `: ${subcategory[1]}` : ""}. ეს აღწერა მხოლოდ დემო კატალოგშია.`,
          en: `Demo product${subcategory ? `: ${subcategory[2]}` : ""}. This description exists only in the demo catalog.`,
        },
        inStock: chance(0.9),
        variants,
        subcategories: subcategory
          ? [subcategoryId(category.id, subcategory[0])]
          : [],
      };
    }),
  );

  return { products, labels };
}
