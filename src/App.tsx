import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Cookie,
  Dumbbell,
  Flame,
  Grid2X2,
  Search,
  SlidersHorizontal,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { ProductDialog } from "./components/ProductDialog";
import { CartDrawer } from "./components/CartDrawer";
import { ContactDialog } from "./components/ContactDialog";
import { CustomSelect } from "./components/CustomSelect";
import { NewsletterDialog } from "./components/NewsletterDialog";
import { SavedProductsDialog } from "./components/SavedProductsDialog";
import { RecentlyViewed } from "./components/RecentlyViewed";
import { StoreBenefits } from "./components/StoreBenefits";
import { STORE } from "./config/store";
import { products } from "./data/products";
import { copy } from "./data/translations";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Category, Language, ProductVariant } from "./types";
import { filterProducts, type CatalogSort } from "./utils/catalog";
import { isCart, isLanguage, isStringArray } from "./utils/storageValidators";

const categoryImages = new Map<string, string>();
const categoryIcons: Record<string, LucideIcon> = {
  all: Grid2X2,
  preworkout: Zap,
  fatburners: Flame,
  gainer: Dumbbell,
  hydration: Waves,
  snacks: Cookie,
};

for (const product of products) {
  for (const categoryId of product.categories) {
    if (!categoryImages.has(categoryId)) {
      categoryImages.set(categoryId, product.image);
    }
  }
}

const categories: { id: Category; image?: string; icon?: LucideIcon }[] = [
  { id: "all", icon: categoryIcons.all },
  ...Array.from(categoryImages, ([id, image]) => ({
    id,
    image: categoryIcons[id] ? undefined : image,
    icon: categoryIcons[id],
  })),
];

type Subcategory = {
  id: string;
  label: Record<Language, string>;
  products: string[];
};

const subcategories: Partial<Record<Category, Subcategory[]>> = {
  preworkout: [
    {
      id: "stimulant",
      label: { ka: "სტიმულანტი", en: "Stimulant" },
      products: products
        .filter((product) => product.subcategories.includes("stimulant"))
        .map((product) => product.id),
    },
    {
      id: "stim-free",
      label: { ka: "სტიმულანტის გარეშე", en: "Stim-free" },
      products: products
        .filter((product) => product.subcategories.includes("stim-free"))
        .map((product) => product.id),
    },
  ],
  fatburners: [
    {
      id: "thermogenic",
      label: { ka: "თერმოგენული", en: "Thermogenic" },
      products: products
        .filter((product) => product.subcategories.includes("thermogenic"))
        .map((product) => product.id),
    },
    {
      id: "lipotropic",
      label: { ka: "ლიპოტროპული", en: "Lipotropic" },
      products: products
        .filter((product) => product.subcategories.includes("lipotropic"))
        .map((product) => product.id),
    },
  ],
};

const brands = [...new Set(products.map((product) => product.brand))].sort();
const featuredBundle = products.find((product) => product.id === "100")!;
const featuredCreatine = products.find((product) => product.id === "101")!;
const featuredBcaa = products.find((product) => product.id === "38")!;
const featuredSlides = [featuredBundle, featuredCreatine, featuredBcaa];
const EMPTY_PRODUCT_IDS: string[] = [];
const EMPTY_CART: Record<string, number> = {};

export function App() {
  const [language, setLanguage] = useLocalStorage<Language>(
    "primelabs-language",
    "ka",
    isLanguage,
  );
  const [saved, setSaved] = useLocalStorage<string[]>(
    "primelabs-saved",
    EMPTY_PRODUCT_IDS,
    isStringArray,
  );
  const [category, setCategory] = useState<Category>("all");
  const [subcategory, setSubcategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [headerQuery, setHeaderQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<CatalogSort>("featured");
  const [savedOpen, setSavedOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [cart, setCart] = useLocalStorage<Record<string, number>>(
    "primelabs-cart",
    EMPTY_CART,
    isCart,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [addedProductId, setAddedProductId] = useState("");
  const [page, setPage] = useState(1);
  const [recent, setRecent] = useLocalStorage<string[]>(
    "primelabs-recent",
    EMPTY_PRODUCT_IDS,
    isStringArray,
  );
  const t = (key: string) => {
    const translated = (copy[language] as Record<string, string>)[key];
    if (translated) return translated;

    return key
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
  };
  const visible = useMemo(() => {
    const activeSubcategory = subcategories[category]?.find(
      (item) => item.id === subcategory,
    );
    return filterProducts(products, {
      category,
      subcategoryProductIds: activeSubcategory
        ? new Set(activeSubcategory.products)
        : undefined,
      brand,
      minimumPrice: minPrice === "" ? 0 : Number(minPrice),
      maximumPrice: maxPrice === "" ? Infinity : Number(maxPrice),
      query: catalogQuery,
      sort,
    });
  }, [category, subcategory, brand, minPrice, maxPrice, catalogQuery, sort]);
  const headerSearchResults = useMemo(
    () =>
      headerQuery
        ? filterProducts(products, {
            category: "all",
            brand: "all",
            minimumPrice: 0,
            maximumPrice: Infinity,
            query: headerQuery,
            sort: "featured",
          }).slice(0, 6)
        : [],
    [headerQuery],
  );
  const mobileFilterCount = [
    minPrice !== "" || maxPrice !== "",
    catalogQuery !== "",
  ].filter(Boolean).length;
  const filter = (id: Category) => {
    setPage(1);
    setCategory(id);
    setSubcategory("all");
    setBrand("all");
    setSavedOpen(false);
  };
  const reset = () => {
    setPage(1);
    setCategory("all");
    setSubcategory("all");
    setBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setCatalogQuery("");
    setHeaderQuery("");
    setMobileFiltersOpen(false);
    setSavedOpen(false);
  };
  const toggleSave = (id: string) =>
    setSaved((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  const updateCart = (id: string, quantity: number) =>
    setCart((items) => {
      const next = { ...items };
      if (quantity < 1) delete next[id];
      else next[id] = quantity;
      return next;
    });
  const addToCart = (id: string, variant?: ProductVariant) => {
    const key = variant ? `${id}::${variant.id}` : id;
    setCart((items) => ({ ...items, [key]: (items[key] ?? 0) + 1 }));
    setSelectedProduct(null);
    setCartOpen(true);
  };
  const quickAdd = (id: string) => {
    setCart((items) => ({ ...items, [id]: (items[id] ?? 0) + 1 }));
    const product = products.find((item) => item.id === id);
    setAddedProductId(id);
    setToast(
      language === "ka"
        ? `${product?.name ?? "პროდუქტი"} დაემატა კალათაში`
        : `${product?.name ?? "Product"} added to bag`,
    );
  };
  const openProduct = (product: (typeof products)[number]) => {
    setSelectedProduct(product);
    setRecent((items) =>
      [product.id, ...items.filter((id) => id !== product.id)].slice(0, 6),
    );
  };
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast("");
      setAddedProductId("");
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const cartItems = products.flatMap((product) =>
    Object.entries(cart)
      .filter(
        ([key]) => key === product.id || key.startsWith(`${product.id}::`),
      )
      .map(([key, quantity]) => ({
        key,
        product,
        quantity,
        variant: product.variants.find(
          (item) => item.id === key.split("::")[1],
        ),
      })),
  );
  const validSaved = saved.filter((id) =>
    products.some((product) => product.id === id),
  );
  const pageCount = Math.max(
    1,
    Math.ceil(visible.length / STORE.productsPerPage),
  );
  const currentPage = Math.min(page, pageCount);
  const paginatedProducts = visible.slice(
    (currentPage - 1) * STORE.productsPerPage,
    currentPage * STORE.productsPerPage,
  );
  return (
    <div
      id="top"
      lang={language}
      onDragStart={(event) => {
        if (event.target instanceof HTMLImageElement) event.preventDefault();
      }}
    >
      <a className="skip" href="#product-grid-anchor">
        {t("skipProducts")}
      </a>
      <Header
        language={language}
        onLanguage={() => setLanguage(language === "ka" ? "en" : "ka")}
        t={t}
        savedCount={validSaved.length}
        savedOpen={savedOpen}
        onSaved={() => {
          setPage(1);
          setSavedOpen(true);
        }}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCart={() => setCartOpen(true)}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
        onHome={reset}
        query={headerQuery}
        onQuery={setHeaderQuery}
        searchResults={headerSearchResults}
        onSearchProduct={openProduct}
      />
      <main>
        <FeaturedProducts
          slides={featuredSlides}
          supportingProducts={[featuredCreatine, featuredBcaa]}
          onOpenProduct={openProduct}
          t={t}
        />
        <section
          className={visible.length ? "shop shell" : "shop shop--empty shell"}
        >
          <div className="catalog-tools" id="categories">
            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={[
                    "category",
                    !item.image && "category--text-only",
                    category === item.id && "active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => filter(item.id)}
                  aria-pressed={category === item.id}
                >
                  {item.image ? (
                    <span className="category__visual">
                      <img src={item.image} alt="" />
                    </span>
                  ) : (
                    <span
                      className="category__visual category__visual--icon"
                      aria-hidden="true"
                    >
                      {item.icon ? <item.icon /> : <Grid2X2 />}
                    </span>
                  )}
                  <b>{t(item.id)}</b>
                  <small>
                    {item.id === "all"
                      ? products.length
                      : products.filter((p) => p.categories.includes(item.id))
                          .length}
                  </small>
                </button>
              ))}
            </div>
            <div
              id="mobile-catalog-filters"
              className={
                mobileFiltersOpen
                  ? "catalog-tools__secondary catalog-tools__secondary--open"
                  : "catalog-tools__secondary"
              }
            >
              {subcategories[category]?.length ? (
                <div
                  className="subcategory-list"
                  aria-label={t("subcategories")}
                >
                  <button
                    className={subcategory === "all" ? "active" : ""}
                    onClick={() => {
                      setPage(1);
                      setSubcategory("all");
                    }}
                  >
                    {t("all")}
                  </button>
                  {subcategories[category]?.map((item) => (
                    <button
                      key={item.id}
                      className={subcategory === item.id ? "active" : ""}
                      onClick={() => {
                        setPage(1);
                        setSubcategory(item.id);
                      }}
                    >
                      {item.label[language]}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="catalog-filter__brand" aria-label={t("brands")}>
                <span className="catalog-filter__brand-label">
                  {t("brands")}
                </span>
                <div className="catalog-filter__brand-list">
                  <button
                    className={
                      brand === "all"
                        ? "catalog-filter__brand-option catalog-filter__brand-option--active"
                        : "catalog-filter__brand-option"
                    }
                    onClick={() => {
                      setPage(1);
                      setBrand("all");
                    }}
                    aria-pressed={brand === "all"}
                  >
                    {t("allBrands")}
                  </button>
                  {brands.map((item) => (
                    <button
                      key={item}
                      className={
                        brand === item
                          ? "catalog-filter__brand-option catalog-filter__brand-option--active"
                          : "catalog-filter__brand-option"
                      }
                      onClick={() => {
                        setPage(1);
                        setBrand(item);
                      }}
                      aria-pressed={brand === item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sort">
                <div className="price-filter">
                  <span>{t("price")}</span>
                  <div className="price-fields">
                    <label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        placeholder="0"
                        value={minPrice}
                        onChange={(event) => {
                          setPage(1);
                          setMinPrice(event.target.value);
                        }}
                        aria-label={`${t("price")} ${t("priceFrom")}`}
                      />
                      <b>₾</b>
                    </label>
                    <i>–</i>
                    <label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        placeholder="500"
                        value={maxPrice}
                        onChange={(event) => {
                          setPage(1);
                          setMaxPrice(event.target.value);
                        }}
                        aria-label={`${t("price")} ${t("priceTo")}`}
                      />
                      <b>₾</b>
                    </label>
                  </div>
                </div>
                <label className="catalog-filter__search">
                  <span>{t("search")}</span>
                  <span className="catalog-filter__search-field">
                    <Search aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="search"
                      value={catalogQuery}
                      onChange={(event) => {
                        setPage(1);
                        setCatalogQuery(event.target.value);
                      }}
                      placeholder={t("search")}
                    />
                    {catalogQuery && (
                      <button
                        type="button"
                        onClick={() => setCatalogQuery("")}
                        aria-label={t("close")}
                      >
                        <X />
                      </button>
                    )}
                  </span>
                </label>
                <div className="catalog-filter__actions">
                  <button
                    type="button"
                    className="mobile-filter-toggle"
                    onClick={() => setMobileFiltersOpen((open) => !open)}
                    aria-expanded={mobileFiltersOpen}
                    aria-controls="mobile-catalog-filters"
                  >
                    <SlidersHorizontal />
                    {mobileFiltersOpen
                      ? language === "ka"
                        ? "ფილტრების დახურვა"
                        : "Close filters"
                      : language === "ka"
                        ? "მეტი ფილტრი"
                        : "More filters"}
                    {mobileFilterCount > 0 && <b>{mobileFilterCount}</b>}
                    <ChevronDown />
                  </button>
                  <CustomSelect<CatalogSort>
                    label={t("sort")}
                    value={sort}
                    options={[
                      { value: "featured", label: t("featured") },
                      { value: "low", label: t("low") },
                      { value: "high", label: t("high") },
                    ]}
                    onChange={(value) => {
                      setPage(1);
                      setSort(value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="filter-summary catalog-summary">
            <span className="result-count">
              {visible.length} {t("count")}
            </span>
            {(category !== "all" ||
              subcategory !== "all" ||
              brand !== "all" ||
              minPrice !== "" ||
              maxPrice !== "" ||
              catalogQuery !== "" ||
              sort !== "featured") && (
              <button onClick={reset}>{t("reset")}</button>
            )}
          </div>
          {(category !== "all" ||
            subcategory !== "all" ||
            brand !== "all" ||
            minPrice !== "" ||
            maxPrice !== "" ||
            catalogQuery !== "") && (
            <div className="applied-filters" aria-label={t("activeFilters")}>
              {category !== "all" && (
                <button onClick={() => filter("all")}>
                  {t(category)} <X />
                </button>
              )}
              {subcategory !== "all" && (
                <button onClick={() => setSubcategory("all")}>
                  {
                    subcategories[category]?.find(
                      (item) => item.id === subcategory,
                    )?.label[language]
                  }{" "}
                  <X />
                </button>
              )}
              {brand !== "all" && (
                <button onClick={() => setBrand("all")}>
                  {brand} <X />
                </button>
              )}
              {catalogQuery && (
                <button onClick={() => setCatalogQuery("")}>
                  “{catalogQuery}” <X />
                </button>
              )}
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  ₾{minPrice || 0}–{maxPrice || "∞"} <X />
                </button>
              )}
            </div>
          )}
          <div id="product-grid-anchor">
            {visible.length ? (
              <div className="product-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    saved={saved.includes(product.id)}
                    onSave={() => toggleSave(product.id)}
                    onOpen={() => openProduct(product)}
                    onAdd={() =>
                      product.variants.length || !product.inStock
                        ? openProduct(product)
                        : quickAdd(product.id)
                    }
                    added={addedProductId === product.id}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                <Search />
                <h3>{t("empty")}</h3>
                <p>{t("emptyText")}</p>
                <button className="button primary" onClick={reset}>
                  {t("reset")}
                </button>
              </div>
            )}
            {visible.length > STORE.productsPerPage && (
              <nav className="pagination" aria-label={t("productPages")}>
                <button
                  className="pagination-step"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  {t("previous")}
                </button>
                <div>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((item) => (
                    <button
                      key={item}
                      className={currentPage === item ? "active" : ""}
                      onClick={() => setPage(item)}
                      aria-current={currentPage === item ? "page" : undefined}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-step"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setPage((value) => Math.min(pageCount, value + 1))
                  }
                >
                  {t("next")}
                </button>
              </nav>
            )}
          </div>
        </section>
        <RecentlyViewed
          language={language}
          products={products}
          recentIds={recent}
          savedIds={saved}
          addedProductId={addedProductId}
          onClear={() => setRecent([])}
          onSave={toggleSave}
          onOpen={openProduct}
          onQuickAdd={(product) =>
            product.variants.length || !product.inStock
              ? openProduct(product)
              : quickAdd(product.id)
          }
          t={t}
        />
        <StoreBenefits t={t} />
      </main>
      <Footer
        t={t}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
      />
      <SavedProductsDialog
        open={savedOpen}
        products={products.filter((product) => saved.includes(product.id))}
        onClose={() => setSavedOpen(false)}
        onOpenProduct={(product) => {
          setSavedOpen(false);
          openProduct(product);
        }}
        onRemove={toggleSave}
        t={t}
      />
      <ProductDialog
        language={language}
        product={selectedProduct}
        saved={selectedProduct ? saved.includes(selectedProduct.id) : false}
        onSave={() => selectedProduct && toggleSave(selectedProduct.id)}
        onAdd={(variant) =>
          selectedProduct && addToCart(selectedProduct.id, variant)
        }
        onClose={() => setSelectedProduct(null)}
        relatedProducts={
          selectedProduct
            ? products
                .filter(
                  (product) =>
                    product.categories.some((category) =>
                      selectedProduct.categories.includes(category),
                    ) && product.id !== selectedProduct.id,
                )
                .slice(0, 3)
            : []
        }
        onRelated={openProduct}
        t={t}
      />
      <CartDrawer
        language={language}
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQuantity={updateCart}
        onComplete={() => setCart({})}
      />
      <ContactDialog
        language={language}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
      <NewsletterDialog
        language={language}
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <BadgeCheck />
          <span>{toast}</span>
          <button
            onClick={() => {
              setToast("");
              setCartOpen(true);
            }}
          >
            {t("cart")}
          </button>
        </div>
      )}
    </div>
  );
}
