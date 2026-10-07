import { useEffect, useMemo, useRef, useState } from "react";
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
import { AboutPage } from "./components/AboutPage";
import { CartDrawer } from "./components/CartDrawer";
import { ContactDialog } from "./components/ContactDialog";
import { NewsletterDialog } from "./components/NewsletterDialog";
import { SavedProductsDialog } from "./components/SavedProductsDialog";
import { RecentlyViewed } from "./components/RecentlyViewed";
import { SeoBlock } from "./components/SeoBlock";
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
   "#/catalog/protein/whey" one of its subcategories. Filters, the page, and
   an open product live in the query, e.g.
   "#/catalog/protein?brand=Optimum&sort=low&page=2&product=12". */
type Route = {
  view: "home" | "catalog" | "about";
  category: Category;
  subcategory: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  query: string;
  sort: CatalogSort;
  variants: boolean;
  page: number;
  product: string | null;
};
const sorts: CatalogSort[] = ["featured", "low", "high", "name"];
const priceParam = (value: string | null) =>
  value && /^\d+(\.\d+)?$/.test(value) ? value : "";
const parseRoute = (hash = window.location.hash): Route => {
  const [path, search = ""] = hash.replace(/^#/, "").split("?");
  const params = new URLSearchParams(search);
  const match = /^\/catalog(?:\/([\w-]+))?(?:\/([\w-]+))?\/?$/.exec(path);
  const category =
    match && categories.some((item) => item.id === match[1]) ? match[1] : "all";
  const subcategory =
    match && subcategories[category]?.some((item) => item.id === match[2])
      ? match[2]
      : "all";
  const brand = params.get("brand") ?? "";
  const sort = params.get("sort") as CatalogSort;
  const product = params.get("product");
  return {
    view: match ? "catalog" : /^\/about\/?$/.test(path) ? "about" : "home",
    category,
    subcategory,
    brand: brands.includes(brand) ? brand : "all",
    minPrice: priceParam(params.get("min")),
    maxPrice: priceParam(params.get("max")),
    query: params.get("q") ?? "",
    sort: sorts.includes(sort) ? sort : "featured",
    variants: params.get("variants") === "1",
    page: Math.max(1, Number.parseInt(params.get("page") ?? "", 10) || 1),
    product: products.some((item) => item.id === product) ? product : null,
  };
};
const routeHash = (route: Route) => {
  const params = new URLSearchParams();
  if (route.view === "catalog") {
    if (route.brand !== "all") params.set("brand", route.brand);
    if (route.minPrice) params.set("min", route.minPrice);
    if (route.maxPrice) params.set("max", route.maxPrice);
    if (route.query) params.set("q", route.query);
    if (route.sort !== "featured") params.set("sort", route.sort);
    if (route.variants) params.set("variants", "1");
    if (route.page > 1) params.set("page", String(route.page));
  }
  if (route.product) params.set("product", route.product);
  const path =
    route.view === "home"
      ? "#/"
      : route.view === "about"
        ? "#/about"
        : catalogHash(route.category, route.subcategory);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};
/* Changes to these push a history entry; filter edits only replace one. */
const navigationKey = (route: Route) =>
  [route.view, route.category, route.subcategory, route.page, route.product]
    .map(String)
    .join("|");
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
function catalogHash(category: Category, subcategory = "all") {
  return category === "all"
    ? "#/catalog"
    : subcategory === "all"
      ? `#/catalog/${category}`
      : `#/catalog/${category}/${subcategory}`;
}
const EMPTY_CART: Record<string, number> = {};
const readCartOptions = (encoded?: string) => {
  if (!encoded) return undefined;
  try {
    const value: unknown = JSON.parse(decodeURIComponent(encoded));
    return value && typeof value === "object"
      ? (value as Record<string, string>)
      : undefined;
  } catch {
    return undefined;
  }
};

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
  const [initialRoute] = useState(parseRoute);
  const [view, setView] = useState(initialRoute.view);
  const [category, setCategory] = useState<Category>(initialRoute.category);
  const [subcategory, setSubcategory] = useState(initialRoute.subcategory);
  const [brand, setBrand] = useState(initialRoute.brand);
  const [minPrice, setMinPrice] = useState(initialRoute.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialRoute.maxPrice);
  const [catalogQuery, setCatalogQuery] = useState(initialRoute.query);
  const [headerQuery, setHeaderQuery] = useState("");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [sort, setSort] = useState<CatalogSort>(initialRoute.sort);
  const [allVariants, setAllVariants] = useState(initialRoute.variants);
  const [savedOpen, setSavedOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(
    () =>
      products.find((product) => product.id === initialRoute.product) ?? null,
  );
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
  const [page, setPage] = useState(initialRoute.page);
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
    // Each variant as its own item: same product id, the variant's details.
    const items = allVariants
      ? products.flatMap((product) =>
          product.variants.length
            ? product.variants.map((variant) => ({
                ...product,
                name: `${product.name} - ${variant.name}`,
                price: variant.price,
                previousPrice: variant.previousPrice,
                image: variant.image ?? product.image,
                inStock: variant.inStock,
                from: false,
                variants: [variant],
              }))
            : [product],
        )
      : products;
    return filterProducts(items, {
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
  }, [
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    catalogQuery,
    sort,
    allVariants,
  ]);
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
    setAllVariants(false);
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
  /* Cart keys: "id", "id::variant", or "id::variant::options" (encoded). */
  const addToCart = (
    id: string,
    variant?: ProductVariant,
    options?: Record<string, string>,
  ) => {
    const key = options
      ? `${id}::${variant?.id ?? ""}::${encodeURIComponent(JSON.stringify(options))}`
      : variant
        ? `${id}::${variant.id}`
        : id;
    setCart((items) => ({ ...items, [key]: (items[key] ?? 0) + 1 }));
    closeProduct();
    setCartOpen(true);
  };
  /* A product opened in this session goes back to the page underneath; one
     opened from a shared link is dropped from the URL instead. */
  const closeProduct = () => {
    if (
      selectedProduct &&
      (window.history.state as { product?: string } | null)?.product ===
        selectedProduct.id
    ) {
      window.history.back();
      return;
    }
    replaceNextRoute.current = true;
    setSelectedProduct(null);
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
    window.scrollTo({ top: 0 });
  };
  const goHome = () => {
    setHeaderSearchOpen(false);
    setHeaderQuery("");
    reset();
    setView("home");
    window.scrollTo({ top: 0 });
  };
  const lastRoute = useRef(initialRoute);
  const replaceNextRoute = useRef(false);
  useEffect(() => {
    const syncRoute = () => {
      // In-page anchors such as "#about" are not routes.
      if (window.location.hash && !window.location.hash.startsWith("#/"))
        return;
      const route = parseRoute();
      const previous = lastRoute.current;
      lastRoute.current = route;
      setView(route.view);
      setCategory(route.category);
      setSubcategory(route.subcategory);
      setBrand(route.brand);
      setMinPrice(route.minPrice);
      setMaxPrice(route.maxPrice);
      setCatalogQuery(route.query);
      setSort(route.sort);
      setAllVariants(route.variants);
      setPage(route.page);
      setSelectedProduct(
        products.find((product) => product.id === route.product) ?? null,
      );
      if (
        route.view !== previous.view ||
        route.category !== previous.category ||
        route.subcategory !== previous.subcategory ||
        route.page !== previous.page
      )
        window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  const addFromCard = (product: (typeof products)[number]) =>
    product.variants.length || !product.inStock
      ? openProduct(product)
      : quickAdd(product.id);
  const openProduct = (product: (typeof products)[number]) => {
    // Switching between products in the dialog keeps one history entry.
    if (selectedProduct) replaceNextRoute.current = true;
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
        options: readCartOptions(key.split("::")[2]),
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
  const selectedProductId = selectedProduct?.id ?? null;
  useEffect(() => {
    const route: Route = {
      view,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      query: catalogQuery,
      sort,
      variants: allVariants,
      page: currentPage,
      product: selectedProductId,
    };
    const hash = routeHash(route);
    const push =
      !replaceNextRoute.current &&
      navigationKey(route) !== navigationKey(lastRoute.current);
    replaceNextRoute.current = false;
    lastRoute.current = route;
    if (hash === (window.location.hash || "#/")) return;
    const url =
      hash === "#/" ? window.location.pathname + window.location.search : hash;
    const state = route.product ? { product: route.product } : null;
    if (push) window.history.pushState(state, "", url);
    else window.history.replaceState(state, "", url);
  }, [
    view,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    catalogQuery,
    sort,
    allVariants,
    currentPage,
    selectedProductId,
  ]);
  return (
    <div
      id="top"
      lang={language}
      onDragStart={(event) => {
        if (event.target instanceof HTMLImageElement) event.preventDefault();
      }}
      onClick={(event) => {
        // In-page anchors scroll without replacing the route in the hash.
        const href =
          event.target instanceof Element
            ? event.target.closest("a")?.getAttribute("href")
            : null;
        if (event.defaultPrevented || !href?.startsWith("#")) return;
        if (href.startsWith("#/")) return;
        event.preventDefault();
        if (href === "#top") window.scrollTo({ top: 0, behavior: "smooth" });
        else
          document
            .getElementById(href.slice(1))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                language={language}
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
            <SeoBlock />
          </>
        ) : view === "about" ? (
          <AboutPage
            onHome={goHome}
            onShop={() => openCatalog("all")}
            onContact={() => setContactOpen(true)}
            t={t}
          />
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
                  onPrice={(minimum, maximum) => {
                    setPage(1);
                    setMinPrice(priceParam(minimum));
                    setMaxPrice(priceParam(maximum));
                  }}
                  allVariants={allVariants}
                  onAllVariants={(value) => {
                    setPage(1);
                    setAllVariants(value);
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
                    sort !== "featured" ||
                    allVariants) && (
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
                      {paginatedProducts.map((item) => {
                        const product =
                          products.find((entry) => entry.id === item.id) ??
                          item;
                        const variant = allVariants
                          ? item.variants[0]
                          : undefined;
                        return (
                          <ProductCard
                            key={
                              variant ? `${item.id}::${variant.id}` : item.id
                            }
                            product={item}
                            saved={saved.includes(item.id)}
                            onSave={() => toggleSave(item.id)}
                            onOpen={() => openProduct(product)}
                            onAdd={() =>
                              variant && variant.inStock
                                ? addToCart(product.id, variant)
                                : addFromCard(product)
                            }
                            added={addedProductId === item.id}
                            t={t}
                          />
                        );
                      })}
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
        onAdd={(variant, options) =>
          selectedProduct && addToCart(selectedProduct.id, variant, options)
        }
        onClose={closeProduct}
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
