import { Heart, House, LayoutGrid, Search, ShoppingBag } from "lucide-react";

type MobileTabBarProps = {
  active: "home" | "catalog" | "search" | "saved" | "cart";
  cartCount: number;
  savedCount: number;
  onHome: () => void;
  onCatalog: () => void;
  onSearch: () => void;
  onSaved: () => void;
  onCart: () => void;
  t: (key: string) => string;
};

/* App-style navigation pinned to the bottom of small screens. */
export function MobileTabBar({
  active,
  cartCount,
  savedCount,
  onHome,
  onCatalog,
  onSearch,
  onSaved,
  onCart,
  t,
}: MobileTabBarProps) {
  return (
    <nav className="mobile-tab-bar" aria-label={t("menu")}>
      <button
        onClick={onHome}
        data-active={active === "home"}
        aria-current={active === "home" ? "page" : undefined}
      >
        <House />
        <span>{t("home")}</span>
      </button>
      <button
        onClick={onCatalog}
        data-active={active === "catalog"}
        aria-current={active === "catalog" ? "page" : undefined}
      >
        <LayoutGrid />
        <span>{t("catalogButton")}</span>
      </button>
      <button
        onClick={onSearch}
        data-active={active === "search"}
        aria-pressed={active === "search"}
      >
        <Search />
        <span>{t("searchLabel")}</span>
      </button>
      <button
        onClick={onSaved}
        data-active={active === "saved"}
        aria-pressed={active === "saved"}
      >
        <Heart />
        <span>{t("saved")}</span>
        {savedCount > 0 && <b>{savedCount}</b>}
      </button>
      <button
        className="mobile-tab-bar__cart"
        onClick={onCart}
        data-active={active === "cart"}
        aria-pressed={active === "cart"}
      >
        <ShoppingBag />
        <span>{t("cart")}</span>
        {cartCount > 0 && <b>{cartCount}</b>}
      </button>
    </nav>
  );
}
