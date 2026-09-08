import { ArrowUp } from "lucide-react";
import type { CopyKey } from "../data/translations";
export function Footer({ t }: { t: (key: CopyKey) => string }) {
  return (
    <footer>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src="./logo-ink.svg" alt="PrimeLabs" />
          <p>Sports nutrition for your goals.</p>
        </div>
        <div>
          <h3>{t("explore")}</h3>
          <a href="#categories">{t("products")}</a>
          <a href="#categories">{t("categories")}</a>
          <a href="#categories">{t("protein")}</a>
          <a href="#categories">{t("vitamins")}</a>
        </div>
        <div>
          <h3>{t("company")}</h3>
          <a href="#about">{t("about")}</a>
          <a href="#about">{t("contact")}</a>
          <a href="#about">Delivery</a>
          <a href="#about">Support</a>
        </div>
      </div>
      <div className="shell copyright">
        <span>
          © {new Date().getFullYear()} PrimeLabs. {t("rights")}
        </span>
        <span>GE / GEL ₾</span>
        <a href="#top" aria-label="Back to top">
          <ArrowUp />
        </a>
      </div>
    </footer>
  );
}
