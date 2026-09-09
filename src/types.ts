export type Language = "ka" | "en";
export type Category =
  | "all"
  | "creatine"
  | "protein"
  | "amino"
  | "vitamins"
  | "preworkout"
  | "fatburners"
  | "gainer"
  | "hydration"
  | "snacks";
export interface Product {
  id: string;
  brand: string;
  name: string;
  category: Exclude<Category, "all">;
  categories: Exclude<Category, "all">[];
  image: string;
  slug: string;
  subtitle: string;
  price: number;
  previousPrice?: number;
  from?: boolean;
  badge?: "bestseller" | "sale";
  description: Partial<Record<Language, string>>;
  inStock: boolean;
  variants: ProductVariant[];
  subcategories: string[];
}
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  previousPrice?: number;
  inStock: boolean;
  image?: string;
}
