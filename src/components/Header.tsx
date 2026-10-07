import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Info,
  LayoutGrid,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { STORE } from "../config/store";
import type { Category, Language, Product } from "../types";
import { CategoryVisual, type CategoryItem } from "./CategoryNav";
import { IconButton } from "./IconButton";

interface Props {
  language: Language;
  onLanguage: () => void;
  t: (key: string) => string;
  savedCount: number;
  savedOpen: boolean;
  onSaved: () => void;
  cartCount: number;
  onCart: () => void;
  onCatalog: () => void;
  categories: CategoryItem[];
  categoryCounts: Record<string, number>;
  onCategory: (id: Category, subcategory?: string) => void;
  subcategoryLinks: Partial<Record<Category, { id: string }[]>>;
  onContact: () => void;
  onNewsletter: () => void;
  onHome: () => void;
  searchOpen: boolean;
  onSearchOpen: (open: boolean) => void;
  query: string;
  onQuery: (value: string) => void;
  searchResults: Product[];
  onSearchProduct: (product: Product) => void;
}
export function Header({
  language,
  onLanguage,
  t,
  savedCount,
  savedOpen,
  onSaved,
  cartCount,
  onCart,
  onCatalog,
  categories,
  categoryCounts,
  onCategory,
  subcategoryLinks,
  onContact,
  onNewsletter,
  onHome,
  searchOpen,
  onSearchOpen,
  query,
  onQuery,
  searchResults,
  onSearchProduct,
}: Props) {
  const [stuck, setStuck] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      )
        setMenuOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuOpen]);
  const chooseCategory = (id: Category, subcategory?: string) => {
    setMenuOpen(false);
    onCategory(id, subcategory);
  };

  // Phone/tablet page menu: full screen below the header
  const [navOpen, setNavOpen] = useState(false);
  const [openNavCategory, setOpenNavCategory] = useState<Category | null>(null);
  const [navTop, setNavTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!navOpen) return;
    const closeNav = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !navRef.current?.contains(target) &&
        !navButtonRef.current?.contains(target)
      )
        setNavOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNavOpen(false);
      navButtonRef.current?.focus();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("pointerdown", closeNav);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", closeNav);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [navOpen]);
  const chooseNavCategory = (id: Category, subcategory?: string) => {
    setNavOpen(false);
    onCategory(id, subcategory);
  };
  useEffect(() => {
    const update = () => setStuck(scrollY > 8);
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    const closeSearch = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !searchRef.current?.contains(target) &&
        !searchButtonRef.current?.contains(target)
      ) {
        onSearchOpen(false);
        onQuery("");
      }
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onSearchOpen(false);
        onQuery("");
        searchButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeSearch);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeSearch);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [onQuery, onSearchOpen, searchOpen]);
  return (
    <>
      <div className="top-bar">
        <div className="shell top-bar__row">
          <p>✦ {t("announcement")}</p>
          <nav aria-label={t("company")}>
            <a href={STORE.phoneHref}>
              <Phone /> {STORE.phoneDisplay}
            </a>
            <button onClick={onNewsletter}>
              {language === "ka" ? "სიახლეები" : "Newsletter"}
            </button>
            <a href="#/about">{t("about")}</a>
            <button onClick={onContact}>{t("contact")}</button>
          </nav>
        </div>
      </div>
      <header
        ref={headerRef}
        className={stuck ? "shop-header shop-header--stuck" : "shop-header"}
      >
        <div className="shell shop-header__row">
          <button
            ref={navButtonRef}
            className="shop-header__menu-toggle"
            aria-label={t("menu")}
            aria-expanded={navOpen}
            aria-controls="mobile-page-menu"
            onClick={() => {
              setMenuOpen(false);
              onSearchOpen(false);
              setNavTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
              setNavOpen((open) => !open);
            }}
          >
            {navOpen ? <X /> : <Menu />}
          </button>
          <a
            href="#top"
            className="shop-header__logo"
            aria-label="PrimeLabs"
            onClick={onHome}
          >
            <img src="./logo-ink.svg" alt="PrimeLabs" />
          </a>
          <button
            ref={menuButtonRef}
            className="shop-header__catalog"
            onClick={() => {
              onSearchOpen(false);
              onQuery("");
              setNavOpen(false);
              setMenuOpen((open) => !open);
            }}
            aria-expanded={menuOpen}
            aria-controls="catalog-menu"
          >
            {menuOpen ? <X /> : <LayoutGrid />}
            <span>{t("catalogButton")}</span>
            <ChevronDown className="shop-header__catalog-chevron" />
          </button>
          <div className="shop-header__actions">
            <button className="shop-header__language" onClick={onLanguage}>
              {t("language")}
            </button>
            <button
              ref={searchButtonRef}
              id="header-search-toggle"
              className="shop-header__search-toggle"
              aria-label={t("searchLabel")}
              aria-expanded={searchOpen}
              aria-controls="header-search-panel"
              onClick={() => {
                setMenuOpen(false);
                setNavOpen(false);
                onSearchOpen(!searchOpen);
                if (searchOpen) onQuery("");
              }}
            >
              {searchOpen ? <X /> : <Search />}
              <span>{t("searchLabel")}</span>
            </button>
            <IconButton
              label={t("saved")}
              count={savedCount}
              className={
                savedOpen
                  ? "shop-header__saved icon-button--selected"
                  : "shop-header__saved"
              }
              onClick={onSaved}
              aria-pressed={savedOpen}
            >
              <Heart fill={savedOpen ? "currentColor" : "none"} />
            </IconButton>
            <button
              className="shop-header__cart"
              onClick={onCart}
              aria-label={t("cart")}
            >
              <ShoppingBag />
              <span>{t("cart")}</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
          </div>
        </div>
        {navOpen && (
          <nav
            ref={navRef}
            id="mobile-page-menu"
            className="shop-menu"
            style={{ top: navTop }}
            aria-label={t("menu")}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setNavOpen(false);
            }}
          >
            <div className="shell shop-menu__body">
              <h2 className="shop-menu__label">{t("categories")}</h2>
              <ul className="shop-menu__cats">
                {categories
                  .filter((item) => item.id !== "all")
                  .map((item, index) => {
                    const subs = subcategoryLinks[item.id] ?? [];
                    const expanded = openNavCategory === item.id;
                    return (
                      <li
                        key={item.id}
                        className={expanded ? "is-open" : undefined}
                        style={{ "--i": index } as CSSProperties}
                      >
                        <div className="shop-menu__cat">
                          <button
                            type="button"
                            onClick={() => chooseNavCategory(item.id)}
                          >
                            <span className="shop-menu__cat-visual">
                              <CategoryVisual item={item} />
                            </span>
                            {t(item.id)}
                          </button>
                          {subs.length > 0 && (
                            <button
                              type="button"
                              className="shop-menu__cat-toggle"
                              aria-expanded={expanded}
                              aria-controls={`menu-subs-${item.id}`}
                              aria-label={t(item.id)}
                              onClick={() =>
                                setOpenNavCategory(expanded ? null : item.id)
                              }
                            >
                              <ChevronDown />
                            </button>
                          )}
                        </div>
                        {subs.length > 0 && (
                          /* Stays mounted so opening and closing can animate. */
                          <div
                            id={`menu-subs-${item.id}`}
                            className="shop-menu__subs-wrap"
                            inert={!expanded}
                          >
                            <ul className="shop-menu__subs">
                              {[{ id: "" }, ...subs].map((sub, subIndex) => (
                                <li
                                  key={sub.id || "all"}
                                  style={{ "--j": subIndex } as CSSProperties}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      chooseNavCategory(
                                        item.id,
                                        sub.id || undefined,
                                      )
                                    }
                                  >
                                    {sub.id ? t(sub.id) : t("viewAll")}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>

              <h2 className="shop-menu__label">{t("menu")}</h2>
              <div className="shop-menu__links">
                <a href="#/about">
                  <Info /> {t("about")}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setNavOpen(false);
                    onContact();
                  }}
                >
                  <MessageCircle /> {t("contact")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNavOpen(false);
                    onNewsletter();
                  }}
                >
                  <Mail /> {language === "ka" ? "სიახლეები" : "Newsletter"}
                </button>
              </div>

              <a className="shop-menu__phone" href={STORE.phoneHref}>
                <span>
                  <Phone />
                </span>
                <span>
                  <small>{t("contact")}</small>
                  <b>{STORE.phoneDisplay}</b>
                </span>
              </a>
            </div>
          </nav>
        )}
        {searchOpen && (
          <div
            ref={searchRef}
            id="header-search-panel"
            className="shell shop-header__search-panel"
          >
            <Search aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="site-search"
              type="text"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
            />
            {query && (
              <button onClick={() => onQuery("")} aria-label={t("close")}>
                <X />
              </button>
            )}
            {query && (
              <div className="site-header__search-results" role="listbox">
                {searchResults.length ? (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        onSearchOpen(false);
                        onQuery("");
                        onSearchProduct(product);
                      }}
                    >
                      <img src={product.image} alt="" />
                      <span>
                        <small>{product.brand}</small>
                        <strong>{product.name}</strong>
                      </span>
                      <b>₾{product.price.toFixed(2)}</b>
                    </button>
                  ))
                ) : (
                  <p>{t("empty")}</p>
                )}
              </div>
            )}
          </div>
        )}
        {menuOpen && (
          <div ref={menuRef} id="catalog-menu" className="catalog-menu">
            <div className="shell catalog-menu__inner">
              <div className="catalog-menu__heading">
                <h2>{t("categories")}</h2>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onCatalog();
                  }}
                >
                  {t("allProducts")} <ArrowRight />
                </button>
              </div>
              <div className="catalog-menu__grid">
                {categories
                  .filter((item) => item.id !== "all")
                  .map((item) => {
                    const subs = subcategoryLinks[item.id] ?? [];
                    return (
                      <div key={item.id} className="catalog-menu__group">
                        <button onClick={() => chooseCategory(item.id)}>
                          <span className="catalog-menu__visual">
                            <CategoryVisual item={item} />
                          </span>
                          <span>
                            <b>{t(item.id)}</b>
                            <small>
                              {categoryCounts[item.id]} {t("count")}
                            </small>
                          </span>
                        </button>
                        {subs.length > 0 && (
                          <ul>
                            {subs.slice(0, 4).map((sub) => (
                              <li key={sub.id}>
                                <button
                                  onClick={() =>
                                    chooseCategory(item.id, sub.id)
                                  }
                                >
                                  {t(sub.id)}
                                </button>
                              </li>
                            ))}
                            {subs.length > 4 && (
                              <li>
                                <button
                                  className="catalog-menu__more"
                                  onClick={() => chooseCategory(item.id)}
                                >
                                  +{subs.length - 4} {t("viewAll")}
                                </button>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
