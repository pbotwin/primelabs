import { ArrowRight, ArrowUp, Mail } from "lucide-react";
import type { CopyKey } from "../data/translations";

type FooterProps = {
  t: (key: CopyKey) => string;
  onContact: () => void;
  onNewsletter: () => void;
};

export function Footer({ t, onContact, onNewsletter }: FooterProps) {
  return (
    <footer>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src="./logo-ink.svg" alt="PrimeLabs" />
          <p>{t("footerTagline")}</p>
        </div>
        <nav aria-label={t("company")}>
          <h3>{t("company")}</h3>
          <a href="#about">{t("about")}</a>
          <button type="button" onClick={onContact}>
            {t("contact")}
          </button>
          <a href="#delivery">{t("footerDelivery")}</a>
          <a href="#support">{t("footerSupport")}</a>
        </nav>
        <section
          className="footer-newsletter"
          aria-labelledby="footer-newsletter-title"
        >
          <span className="footer-newsletter-icon">
            <Mail />
          </span>
          <div>
            <h3 id="footer-newsletter-title">{t("newsletterTitle")}</h3>
            <p>{t("newsletterText")}</p>
          </div>
          <button type="button" onClick={onNewsletter}>
            {t("newsletterButton")} <ArrowRight />
          </button>
        </section>
      </div>
      <div className="shell copyright">
        <span>
          © {new Date().getFullYear()} PrimeLabs. {t("rights")}
        </span>
        <span>GE / GEL ₾</span>
        <a href="#top" aria-label={t("backToTop")}>
          <ArrowUp />
        </a>
      </div>
    </footer>
  );
}
