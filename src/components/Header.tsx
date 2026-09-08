import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import type { CopyKey } from "../data/translations";
import type { Language } from "../types";
import { IconButton } from "./IconButton";

interface Props {
  language: Language;
  onLanguage: () => void;
  t: (key: CopyKey) => string;
  savedCount: number;
  savedOnly: boolean;
  onSaved: () => void;
  cartCount: number;
  onCart: () => void;
  onContact: () => void;
  onNewsletter: () => void;
  onHome: () => void;
  query: string;
  onQuery: (value: string) => void;
}
export function Header({
  language,
  onLanguage,
  t,
  savedCount,
  savedOnly,
  onSaved,
  cartCount,
  onCart,
  onContact,
  onNewsletter,
  onHome,
  query,
  onQuery,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLSpanElement>(null);
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
    const closeSearch = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !searchPanelRef.current?.contains(target) &&
        !searchToggleRef.current?.contains(target)
      )
        setSearchOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeSearch);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeSearch);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [searchOpen]);
  const goHome = () => {
    setSearchOpen(false);
    setMenuOpen(false);
    onHome();
  };
  const close = () => setMenuOpen(false);
  return (
    <>
      <div className="announcement">
        ✦ {t("announcement")} <a href="#categories">{t("shop")} →</a>
      </div>
      <header className={stuck ? "header stuck" : "header"}>
        <div className="shell header-row">
          <a
            href="#top"
            className="logo"
            aria-label="PrimeLabs"
            onClick={goHome}
          >
            <img src="./logo-ink.svg" alt="PrimeLabs" />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#categories">{t("products")}</a>
            <button onClick={onNewsletter}>
              {language === "ka" ? "სიახლეები" : "Newsletter"}
            </button>
            <button onClick={onContact}>{t("contact")}</button>
          </nav>
          <div className="header-actions">
            <button className="language" onClick={onLanguage}>
              {t("language")}
            </button>
            <span ref={searchToggleRef} className="search-toggle-wrap">
              <IconButton
                label={t("searchLabel")}
                onClick={() => setSearchOpen((v) => !v)}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X /> : <Search />}
              </IconButton>
            </span>
            <IconButton
              label={t("saved")}
              count={savedCount}
              className={savedOnly ? "selected" : ""}
              onClick={onSaved}
              aria-pressed={savedOnly}
            >
              <Heart fill={savedOnly ? "currentColor" : "none"} />
            </IconButton>
            <button className="bag" onClick={onCart}>
              <ShoppingBag />
              <span>{t("cart")}</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
            <IconButton
              label={t("menu")}
              className="menu-button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </IconButton>
          </div>
        </div>
        {searchOpen && (
          <div ref={searchPanelRef} className="shell search-panel">
            <Search />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
            />
            {query && (
              <button onClick={() => onQuery("")}>
                <X />
              </button>
            )}
          </div>
        )}
        {menuOpen && (
          <nav className="shell mobile-nav">
            <a onClick={close} href="#categories">
              {t("products")}
            </a>
            <button
              onClick={() => {
                close();
                onNewsletter();
              }}
            >
              {language === "ka" ? "სიახლეები" : "Newsletter"}
            </button>
            <button
              onClick={() => {
                close();
                onContact();
              }}
            >
              {t("contact")}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
