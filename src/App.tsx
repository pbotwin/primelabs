import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronRight,
  Cookie,
  Dumbbell,
  Flame,
  Grid2X2,
  Search,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CatalogFilters } from "./components/CatalogFilters";
import { CategorySidebar, CategoryTiles } from "./components/CategoryNav";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MobileTabBar } from "./components/MobileTabBar";
import { ProductCard } from "./components/ProductCard";
import { ProductDialog } from "./components/ProductDialog";
import { ProductRail } from "./components/ProductRail";
import { PromoCards } from "./components/PromoCards";
import { CartDrawer } from "./components/CartDrawer";
import { ContactDialog } from "./components/ContactDialog";
import { NewsletterDialog } from "./components/NewsletterDialog";
import { SavedProductsDialog } from "./components/SavedProductsDialog";
import { RecentlyViewed } from "./components/RecentlyViewed";
import { StoreBenefits } from "./components/StoreBenefits";
import { SubcategoryChips } from "./components/SubcategoryChips";
import { STORE } from "./config/store";
import { DEMO_CATALOG, hasPhoto, labels, products } from "./data/catalog";
import { copy } from "./data/translations";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Category, Language, ProductVariant } from "./types";
import { filterProducts, type CatalogSort } from "./utils/catalog";
import { isCart, isLanguage, isStringArray } from "./utils/storageValidators";

const categoryIcons: Record<string, LucideIcon> = {
  all: Grid2X2,
  preworkout: Zap,
  fatburners: Flame,
  gainer: Dumbbell,
  hydration: Waves,
  snacks: Cookie,
};

// Categories keep catalog order; each one shows a real photo when it has one.
const categoryImage = (id: Category) =>
  (
    products.find(
      (product) => product.categories.includes(id) && hasPhoto(product),
    ) ?? products.find((product) => product.categories.includes(id))
  )?.image;

const categories: { id: Category; image?: string; icon?: LucideIcon }[] = [
  { id: "all", icon: categoryIcons.all },
  ...[...new Set(products.flatMap((product) => product.categories))].map(
    (id) => ({
      id,
      image: categoryIcons[id] ? undefined : categoryImage(id),
      icon: categoryIcons[id],
    }),
  ),
];

type Subcategory = { id: string; products: string[] };

// Subcategories come from the products themselves, in catalog order.
const subcategories: Partial<Record<Category, Subcategory[]>> = {};
for (const product of products) {
  for (const categoryId of product.categories) {
    for (const subcategoryId of product.subcategories) {
      const list = (subcategories[categoryId] ??= []);
      let item = list.find((entry) => entry.id === subcategoryId);
      if (!item) {
        item = { id: subcategoryId, products: [] };
        list.push(item);
      }
      item.products.push(product.id);
    }
  }
}

const brands = [...new Set(products.map((product) => product.brand))].sort();
const featuredBundle = products.find((product) => product.id === "100")!;
const featuredCreatine = products.find((product) => product.id === "101")!;
const featuredBcaa = products.find((product) => product.id === "38")!;
const featuredSlides = [featuredBundle, featuredCreatine, featuredBcaa];
const categoryCounts: Record<string, number> = Object.fromEntries(
  categories.map((item) => [
    item.id,
    item.id === "all"
      ? products.length
      : products.filter((product) => product.categories.includes(item.id))
          .length,
  ]),
);
const productRails: { id: Category; products: typeof products }[] = [
  "protein",
  "creatine",
  "vitamins",
  "amino",
].map((id) => ({
  id,
  products: products
    .filter((product) => product.categories.includes(id))
    .slice(0, 12),
}));
const popularProducts = products.slice(0, 12);
const EMPTY_PRODUCT_IDS: string[] = [];

/* Hash routes keep the static GitHub Pages build working: "#/catalog" opens
   the catalog, "#/catalog/protein" a category, and
   "#/catalog/protein/whey" one of its subcategories. */
type CatalogRoute = { category: Category; subcategory: string };
const catalogRoute = (): CatalogRoute | null => {
  const match = /^#\/catalog(?:\/([\w-]+))?(?:\/([\w-]+))?/.exec(
    window.location.hash,
  );
  if (!match) return null;
  const category = categories.some((item) => item.id === match[1])
    ? match[1]
    : "all";
  const subcategory = subcategories[category]?.some(
    (item) => item.id === match[2],
  )
    ? match[2]
    : "all";
  return { category, subcategory };
};
/* First, last, and the pages around the current one; gaps become "…". */
const visiblePages = (current: number, count: number) => {
  const pages = [...new Set([1, current - 1, current, current + 1, count])]
    .filter((page) => page >= 1 && page <= count)
    .sort((first, second) => first - second);
  return pages.flatMap((page, index) =>
    index > 0 && page - pages[index - 1] > 1
      ? (["gap", page] as const)
      : ([page] as const),
  );
};
const catalogHash = (category: Category, subcategory = "all") =>
  category === "all"
    ? "#/catalog"
    : subcategory === "all"
      ? `#/catalog/${category}`
      : `#/catalog/${category}/${subcategory}`;
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
  const [view, setView] = useState<"home" | "catalog">(() =>
    catalogRoute() ? "catalog" : "home",
  );
  const [category, setCategory] = useState<Category>(
    () => catalogRoute()?.category ?? "all",
  );
  const [subcategory, setSubcategory] = useState(
    () => catalogRoute()?.subcategory ?? "all",
  );
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [headerQuery, setHeaderQuery] = useState("");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
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
    const label = labels[key]?.[language];
    if (label) return label;

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
  const filter = (id: Category) => {
    setPage(1);
    setCategory(id);
    setSubcategory("all");
    setBrand("all");
    setSavedOpen(false);
  };
  const clearFilters = () => {
    setPage(1);
    setBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setCatalogQuery("");
    setSort("featured");
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
  const openCatalog = (id: Category, subcategoryId = "all") => {
    setHeaderSearchOpen(false);
    setHeaderQuery("");
    filter(id);
    setSubcategory(subcategoryId);
    setView("catalog");
    const hash = catalogHash(id, subcategoryId);
    if (window.location.hash !== hash) window.location.hash = hash;
    window.scrollTo({ top: 0 });
  };
  const goHome = () => {
    setHeaderSearchOpen(false);
    setHeaderQuery("");
    reset();
    setView("home");
    if (catalogRoute()) window.location.hash = "#/";
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const syncRoute = () => {
      const route = catalogRoute();
      setView(route ? "catalog" : "home");
      if (!route) return;
      setPage(1);
      setCategory(route.category);
      setSubcategory(route.subcategory);
      setBrand("all");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);
  const addFromCard = (product: (typeof products)[number]) =>
    product.variants.length || !product.inStock
      ? openProduct(product)
      : quickAdd(product.id);
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
  const goToPage = (next: number) => {
    setPage(Math.min(pageCount, Math.max(1, next)));
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
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
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
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
        onCatalog={() => openCatalog("all")}
        categories={categories}
        categoryCounts={categoryCounts}
        onCategory={openCatalog}
        subcategoryLinks={subcategories}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
        onHome={goHome}
        searchOpen={headerSearchOpen}
        onSearchOpen={setHeaderSearchOpen}
        query={headerQuery}
        onQuery={setHeaderQuery}
        searchResults={headerSearchResults}
        onSearchProduct={openProduct}
      />
      <main id="main" tabIndex={-1}>
        {view === "home" ? (
          <>
            <section className="home-hero shell">
              <CategorySidebar
                categories={categories}
                counts={categoryCounts}
                onCategory={openCatalog}
                limit={8}
                onAll={() => openCatalog("all")}
                t={t}
              />
              <FeaturedProducts
                slides={featuredSlides}
                onOpenProduct={openProduct}
                t={t}
              />
            </section>
            <CategoryTiles
              categories={categories}
              counts={categoryCounts}
              onCategory={openCatalog}
              t={t}
            />
            <PromoCards
              bundle={featuredBundle}
              onBundle={() => openProduct(featuredBundle)}
              onContact={() => setContactOpen(true)}
              t={t}
            />
            <ProductRail
              id="popular"
              title={t("popular")}
              products={popularProducts}
              savedIds={saved}
              addedProductId={addedProductId}
              onViewAll={() => openCatalog("all")}
              onSave={toggleSave}
              onOpen={openProduct}
              onAdd={addFromCard}
              t={t}
            />
            {productRails.map((rail) => (
              <ProductRail
                key={rail.id}
                id={`rail-${rail.id}`}
                title={t(rail.id)}
                products={rail.products}
                savedIds={saved}
                addedProductId={addedProductId}
                onViewAll={() => openCatalog(rail.id)}
                onSave={toggleSave}
                onOpen={openProduct}
                onAdd={addFromCard}
                t={t}
              />
            ))}
            <RecentlyViewed
              language={language}
              products={products}
              recentIds={recent}
              savedIds={saved}
              addedProductId={addedProductId}
              onClear={() => setRecent([])}
              onSave={toggleSave}
              onOpen={openProduct}
              onQuickAdd={addFromCard}
              t={t}
            />
          </>
        ) : (
          <section
            id="catalog"
            className={
              visible.length
                ? "catalog-page shop shell"
                : "catalog-page shop shop--empty shell"
            }
          >
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <button onClick={goHome}>{t("home")}</button>
              <ChevronRight aria-hidden="true" />
              {category === "all" ? (
                <span aria-current="page">{t("catalogButton")}</span>
              ) : (
                <>
                  <button onClick={() => openCatalog("all")}>
                    {t("catalogButton")}
                  </button>
                  <ChevronRight aria-hidden="true" />
                  {subcategory === "all" ? (
                    <span aria-current="page">{t(category)}</span>
                  ) : (
                    <>
                      <button onClick={() => openCatalog(category)}>
                        {t(category)}
                      </button>
                      <ChevronRight aria-hidden="true" />
                      <span aria-current="page">{t(subcategory)}</span>
                    </>
                  )}
                </>
              )}
            </nav>
            <h1 className="catalog-page__title">
              <span className="catalog-page__name-mobile">
                {category === "all" ? t("allProducts") : t(category)}
              </span>
              <span className="catalog-page__name-desktop">
                {category === "all"
                  ? t("allProducts")
                  : t(subcategory === "all" ? category : subcategory)}
              </span>
              <small>
                {visible.length} {t("count")}
              </small>
            </h1>
            <div className="catalog-subcategories-desktop">
              <SubcategoryChips
                items={(subcategories[category] ?? []).map((item) => ({
                  id: item.id,
                  label: t(item.id),
                  count: item.products.length,
                }))}
                active={subcategory}
                total={categoryCounts[category] ?? 0}
                onSelect={(id) => openCatalog(category, id)}
                t={t}
              />
            </div>
            <div className="catalog-page__layout">
              <aside className="catalog-page__aside">
                <CategorySidebar
                  categories={categories}
                  counts={categoryCounts}
                  onCategory={openCatalog}
                  active={category}
                  activeSubcategories={(subcategories[category] ?? []).map(
                    (item) => ({
                      id: item.id,
                      label: t(item.id),
                      count: item.products.length,
                    }),
                  )}
                  activeSubcategory={subcategory}
                  onSubcategory={(id) => openCatalog(category, id)}
                  t={t}
                />
                <CatalogFilters
                  subcategoryNavigation={
                    <SubcategoryChips
                      items={(subcategories[category] ?? []).map((item) => ({
                        id: item.id,
                        label: t(item.id),
                        count: item.products.length,
                      }))}
                      active={subcategory}
                      total={categoryCounts[category] ?? 0}
                      onSelect={(id) => openCatalog(category, id)}
                      t={t}
                    />
                  }
                  categories={categories}
                  counts={categoryCounts}
                  category={category}
                  onCategory={openCatalog}
                  brands={brands}
                  brand={brand}
                  onBrand={(item) => {
                    setPage(1);
                    setBrand(item);
                  }}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPrice={(value) => {
                    setPage(1);
                    setMinPrice(value);
                  }}
                  onMaxPrice={(value) => {
                    setPage(1);
                    setMaxPrice(value);
                  }}
                  query={catalogQuery}
                  onQuery={(value) => {
                    setPage(1);
                    setCatalogQuery(value);
                  }}
                  sort={sort}
                  onSort={(value) => {
                    setPage(1);
                    setSort(value);
                  }}
                  t={t}
                />
              </aside>
              <div className="catalog-page__results">
                <div className="filter-summary catalog-summary">
                  {(brand !== "all" ||
                    minPrice !== "" ||
                    maxPrice !== "" ||
                    catalogQuery !== "" ||
                    sort !== "featured") && (
                    <button onClick={clearFilters}>{t("reset")}</button>
                  )}
                </div>
                {(brand !== "all" ||
                  minPrice !== "" ||
                  maxPrice !== "" ||
                  catalogQuery !== "") && (
                  <div
                    className="applied-filters"
                    aria-label={t("activeFilters")}
                  >
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
                          onAdd={() => addFromCard(product)}
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
                      <button className="button primary" onClick={clearFilters}>
                        {t("reset")}
                      </button>
                    </div>
                  )}
                  {visible.length > STORE.productsPerPage && (
                    <nav className="pagination" aria-label={t("productPages")}>
                      <button
                        className="pagination-step"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                      >
                        {t("previous")}
                      </button>
                      <div>
                        {visiblePages(currentPage, pageCount).map(
                          (item, index) =>
                            item === "gap" ? (
                              <span
                                key={`gap-${index}`}
                                className="pagination__gap"
                                aria-hidden="true"
                              >
                                …
                              </span>
                            ) : (
                              <button
                                key={item}
                                className={currentPage === item ? "active" : ""}
                                onClick={() => goToPage(item)}
                                aria-current={
                                  currentPage === item ? "page" : undefined
                                }
                              >
                                {item}
                              </button>
                            ),
                        )}
                      </div>
                      <button
                        className="pagination-step"
                        disabled={currentPage === pageCount}
                        onClick={() => goToPage(currentPage + 1)}
                      >
                        {t("next")}
                      </button>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        <StoreBenefits t={t} />
      </main>
      <Footer
        t={t}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
      />
      <MobileTabBar
        active={
          cartOpen
            ? "cart"
            : savedOpen
              ? "saved"
              : headerSearchOpen
                ? "search"
                : view
        }
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        savedCount={validSaved.length}
        onHome={goHome}
        onCatalog={() => openCatalog("all")}
        onSearch={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setHeaderSearchOpen(true);
        }}
        onSaved={() => {
          setPage(1);
          setSavedOpen(true);
        }}
        onCart={() => setCartOpen(true)}
        t={t}
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
      {DEMO_CATALOG && (
        <div className="demo-badge" role="note">
          DEMO · {products.length}
        </div>
      )}
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
