import { productSearchText } from "../data/uiCopy";
import type { Category, Product } from "../types";

export type CatalogSort = "featured" | "low" | "high";

type CatalogFilters = {
  category: Category;
  subcategoryProductIds?: ReadonlySet<string>;
  brand: string;
  minimumPrice: number;
  maximumPrice: number;
  query: string;
  sort: CatalogSort;
};

export function filterProducts(
  products: readonly Product[],
  filters: CatalogFilters,
) {
  const searchTerm = filters.query.trim().toLocaleLowerCase();
  const searching = searchTerm.length > 0;

  return products
    .filter((product) => {
      const matchesSearch =
        `${product.brand} ${product.name} ${product.subtitle} ${product.description.ka ?? ""} ${product.description.en ?? ""} ${product.variants.map((variant) => variant.name).join(" ")} ${productSearchText(product.id)}`
          .toLocaleLowerCase()
          .includes(searchTerm);

      return (
        (!searching || matchesSearch) &&
        (searching ||
          filters.category === "all" ||
          product.categories.includes(filters.category)) &&
        (searching ||
          !filters.subcategoryProductIds ||
          filters.subcategoryProductIds.has(product.id)) &&
        (searching ||
          filters.brand === "all" ||
          product.brand === filters.brand) &&
        product.price >= filters.minimumPrice &&
        product.price <= filters.maximumPrice
      );
    })
    .sort((first, second) => {
      if (filters.sort === "low") return first.price - second.price;
      if (filters.sort === "high") return second.price - first.price;
      return 0;
    });
}
