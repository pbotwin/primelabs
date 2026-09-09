import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Headphones,
  Search,
  Truck,
  X,
} from "lucide-react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { ProductDialog } from "./components/ProductDialog";
import { CartDrawer } from "./components/CartDrawer";
import { ContactDialog } from "./components/ContactDialog";
import { NewsletterDialog } from "./components/NewsletterDialog";
import { products } from "./data/products";
import { copy, type CopyKey } from "./data/translations";
import { productSearchText } from "./data/uiCopy";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Category, Language } from "./types";

const categories: { id: Category; image?: string }[] = [
  { id: "all" },
  { id: "creatine", image: "./creatine.webp" },
  { id: "protein", image: "./whey.webp" },
  { id: "amino", image: "./vplab.webp" },
  { id: "vitamins", image: "./vitamins.webp" },
  { id: "preworkout" },
  { id: "fatburners" },
  { id: "gainer" },
  { id: "hydration" },
  { id: "snacks" },
];

type Subcategory = {
  id: string;
  label: Record<Language, string>;
  products: string[];
};

const subcategories: Partial<Record<Category, Subcategory[]>> = {
  amino: [
    {
      id: "bcaa",
      label: { ka: "BCAA", en: "BCAA" },
      products: ["vplab", "nxt"],
    },
    { id: "eaa", label: { ka: "EAA", en: "EAA" }, products: ["bpi"] },
  ],
  protein: [
    {
      id: "whey",
      label: { ka: "შრატის პროტეინი", en: "Whey protein" },
      products: ["whey"],
    },
    {
      id: "bundle",
      label: { ka: "ნაკრებები", en: "Bundles" },
      products: ["bundle"],
    },
  ],
  vitamins: [
    {
      id: "daily",
      label: { ka: "ვიტამინები", en: "Daily vitamins" },
      products: ["d3k2", "bcomplex", "biotin"],
    },
    {
      id: "minerals",
      label: { ka: "მინერალები", en: "Minerals" },
      products: ["zinc", "magcitrate", "magbis"],
    },
    {
      id: "wellness",
      label: { ka: "ჯანმრთელობა", en: "Wellness" },
      products: ["berberine", "lionsmane", "ashwagandha"],
    },
    { id: "omega", label: { ka: "ომეგა", en: "Omega" }, products: ["omega3"] },
  ],
};

const brands = [...new Set(products.map((product) => product.brand))].sort();

export function App() {
  const [language, setLanguage] = useLocalStorage<Language>(
    "primelabs-language",
    "ka",
  );
  const [saved, setSaved] = useLocalStorage<string[]>("primelabs-saved", []);
  const [category, setCategory] = useState<Category>("all");
  const [subcategory, setSubcategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [cart, setCart] = useLocalStorage<Record<string, number>>(
    "primelabs-cart",
    {},
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);
  const [searchHeight, setSearchHeight] = useState(0);
  const t = (key: CopyKey) => copy[language][key];
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    const minimum = minPrice === "" ? 0 : Number(minPrice);
    const maximum = maxPrice === "" ? Infinity : Number(maxPrice);
    return products
      .filter(
        (p) =>
          (term !== "" || category === "all" || p.category === category) &&
          (term !== "" ||
            subcategory === "all" ||
            subcategories[category]
              ?.find((item) => item.id === subcategory)
              ?.products.includes(p.id)) &&
          (term !== "" || brand === "all" || p.brand === brand) &&
          p.price >= minimum &&
          p.price <= maximum &&
          (!savedOnly || saved.includes(p.id)) &&
          `${p.brand} ${p.name} ${p.subtitle} ${productSearchText(p.id)}`
            .toLocaleLowerCase()
            .includes(term),
      )
      .sort((a, b) =>
        sort === "low"
          ? a.price - b.price
          : sort === "high"
            ? b.price - a.price
            : 0,
      );
  }, [
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    query,
    sort,
    savedOnly,
    saved,
  ]);
  const filter = (id: Category) => {
    setCategory(id);
    setSubcategory("all");
    setBrand("all");
    setSavedOnly(false);
  };
  const changeQuery = (value: string) => {
    if (value && query === "")
      setSearchHeight(catalogRef.current?.offsetHeight ?? 0);
    if (value === "") setSearchHeight(0);
    setQuery(value);
  };
  const reset = () => {
    setCategory("all");
    setSubcategory("all");
    setBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
    setSearchHeight(0);
    setSavedOnly(false);
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
  const addToCart = (id: string) => {
    updateCart(id, (cart[id] ?? 0) + 1);
    setSelectedProduct(null);
    setCartOpen(true);
  };
  const cartItems = products
    .filter((product) => cart[product.id])
    .map((product) => ({ product, quantity: cart[product.id] }));
  return (
    <div id="top" lang={language}>
      <a className="skip" href="#product-grid-anchor">
        Skip to products
      </a>
      <Header
        language={language}
        onLanguage={() => setLanguage(language === "ka" ? "en" : "ka")}
        t={t}
        savedCount={saved.length}
        savedOnly={savedOnly}
        onSaved={() => {
          setSavedOnly(true);
        }}
        cartCount={Object.values(cart).reduce((sum, value) => sum + value, 0)}
        onCart={() => setCartOpen(true)}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
        onHome={reset}
        query={query}
        onQuery={changeQuery}
        searchResults={query ? visible.slice(0, 6) : []}
        onSearchProduct={setSelectedProduct}
      />
      <main>
        <section className="featured shell" aria-label="Featured products">
          <button
            className="featured-main"
            onClick={() => setSelectedProduct(products[3])}
          >
            <div>
              <span className="deal-label">−13% {t("sale")}</span>
              <h1>
                Beef Protein
                <br />+ Creatine
              </h1>
              <p>
                <strong>₾130.00</strong>
                <del>₾149.43</del>
              </p>
              <span className="featured-action">
                {t("buy")} <ArrowRight />
              </span>
            </div>
            <img src="./bundle.jpg" alt="Beef Protein and Creatine bundle" />
          </button>
          <div className="featured-side">
            <button onClick={() => setSelectedProduct(products[0])}>
              <img src="./creatine.webp" alt="Creatine Monohydrate" />
              <div>
                <span>{t("bestseller")}</span>
                <h2>Creatine 300g</h2>
                <strong>₾50.00</strong>
              </div>
              <ArrowRight />
            </button>
            <button onClick={() => setSelectedProduct(products[4])}>
              <img src="./vplab.webp" alt="VPLAB BCAA" />
              <div>
                <span>VPLAB</span>
                <h2>BCAA 8:1:1</h2>
                <strong>₾80.00</strong>
              </div>
              <ArrowRight />
            </button>
          </div>
        </section>
        <section className="shop shell">
          <div className="catalog-tools" id="categories">
            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={
                    category === item.id && !savedOnly
                      ? "category active"
                      : "category"
                  }
                  onClick={() => filter(item.id)}
                  aria-pressed={category === item.id && !savedOnly}
                >
                  {item.image ? (
                    <span>
                      <img src={item.image} alt="" />
                    </span>
                  ) : (
                    <span className="all-mark">✦</span>
                  )}
                  <b>{t(item.id)}</b>
                  <small>
                    {item.id === "all"
                      ? products.length
                      : products.filter((p) => p.category === item.id).length}
                  </small>
                </button>
              ))}
            </div>
            {subcategories[category]?.length ? (
              <div className="subcategory-list" aria-label={t("subcategories")}>
                <button
                  className={subcategory === "all" ? "active" : ""}
                  onClick={() => setSubcategory("all")}
                >
                  {t("all")}
                </button>
                {subcategories[category]?.map((item) => (
                  <button
                    key={item.id}
                    className={subcategory === item.id ? "active" : ""}
                    onClick={() => setSubcategory(item.id)}
                  >
                    {item.label[language]}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="brand-filter" aria-label={t("brands")}>
              <span>{t("brands")}</span>
              <div className="brand-list">
                <button
                  className={brand === "all" ? "active" : ""}
                  onClick={() => setBrand("all")}
                  aria-pressed={brand === "all"}
                >
                  {t("allBrands")}
                </button>
                {brands.map((item) => (
                  <button
                    key={item}
                    className={brand === item ? "active" : ""}
                    onClick={() => setBrand(item)}
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
                      onChange={(event) => setMinPrice(event.target.value)}
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
                      placeholder="350"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      aria-label={`${t("price")} ${t("priceTo")}`}
                    />
                    <b>₾</b>
                  </label>
                </div>
              </div>
              <div className="filter-summary">
                <span className="result-count">
                  {visible.length} {t("count")}
                </span>
                {(category !== "all" ||
                  subcategory !== "all" ||
                  brand !== "all" ||
                  minPrice !== "" ||
                  maxPrice !== "" ||
                  sort !== "featured") && (
                  <button onClick={reset}>{t("reset")}</button>
                )}
              </div>
              <label>
                <span>{t("sort")}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">{t("featured")}</option>
                  <option value="low">{t("low")}</option>
                  <option value="high">{t("high")}</option>
                </select>
              </label>
            </div>
          </div>
          <div
            id="product-grid-anchor"
            ref={catalogRef}
            style={searchHeight ? { minHeight: searchHeight } : undefined}
          >
            {visible.length ? (
              <div className="product-grid">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    saved={saved.includes(product.id)}
                    onSave={() => toggleSave(product.id)}
                    onOpen={() => setSelectedProduct(product)}
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
          </div>
        </section>
        <section className="values shell" id="about">
          <article>
            <BadgeCheck />
            <div>
              <h3>{t("original")}</h3>
              <p>{t("originalText")}</p>
            </div>
          </article>
          <article id="delivery">
            <Truck />
            <div>
              <h3>{t("delivery")}</h3>
              <p>{t("deliveryText")}</p>
            </div>
          </article>
          <article id="support">
            <Headphones />
            <div>
              <h3>{t("help")}</h3>
              <p>{t("helpText")}</p>
            </div>
          </article>
        </section>
      </main>
      <Footer
        t={t}
        onContact={() => setContactOpen(true)}
        onNewsletter={() => setNewsletterOpen(true)}
      />
      {savedOnly && (
        <div
          className="saved-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSavedOnly(false);
          }}
        >
          <aside className="saved-panel" role="dialog" aria-modal="true">
            <header>
              <div>
                <span>{saved.length}</span>
                <h2>{t("saved")}</h2>
              </div>
              <button onClick={() => setSavedOnly(false)} aria-label="Close">
                <X />
              </button>
            </header>
            {saved.length ? (
              <div className="saved-list">
                {products
                  .filter((product) => saved.includes(product.id))
                  .map((product) => (
                    <article key={product.id}>
                      <button
                        className="saved-product"
                        onClick={() => {
                          setSavedOnly(false);
                          setSelectedProduct(product);
                        }}
                      >
                        <img src={product.image} alt="" />
                        <span>
                          <small>{product.brand}</small>
                          <strong>{product.name}</strong>
                          <b>₾{product.price.toFixed(2)}</b>
                        </span>
                      </button>
                      <button
                        className="saved-remove"
                        onClick={() => toggleSave(product.id)}
                        aria-label={`${t("saved")}: ${product.name}`}
                      >
                        <Heart fill="currentColor" />
                      </button>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="saved-empty">
                <Heart />
                <h3>{t("empty")}</h3>
                <button
                  className="button primary"
                  onClick={() => setSavedOnly(false)}
                >
                  {t("shop")}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
      <ProductDialog
        language={language}
        product={selectedProduct}
        saved={selectedProduct ? saved.includes(selectedProduct.id) : false}
        onSave={() => selectedProduct && toggleSave(selectedProduct.id)}
        onAdd={() => selectedProduct && addToCart(selectedProduct.id)}
        onClose={() => setSelectedProduct(null)}
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
    </div>
  );
}
