export type Language = "ka" | "en";
export type Category = string;
export interface Product {
  id: string;
  brand: string;
  name: string;
  category: Category;
  categories: Category[];
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
