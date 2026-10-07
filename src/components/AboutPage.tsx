import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AboutPageProps = {
  onHome: () => void;
  onShop: () => void;
  onContact: () => void;
  t: (key: string) => string;
};

const ABOUT_PHOTO =
  "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=1470&auto=format&fit=crop";

/* About PrimeLabs: banner, mission, three points, closing call to action. */
export function AboutPage({ onHome, onShop, onContact, t }: AboutPageProps) {
  const points = [
    { icon: FlaskConical, text: t("clinicallyDosed") },
    { icon: BadgeCheck, text: t("labTested") },
    { icon: ShieldCheck, text: t("noBlends") },
  ];
  return (
    <div className="about-page">
      <div className="catalog-page shop shell about-page__crumbs">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <button onClick={onHome}>{t("home")}</button>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{t("about")}</span>
        </nav>
      </div>

      <section className="shell">
        <div className="about-hero">
          <div className="about-hero__copy">
            <span className="about-hero__eyebrow">
              <Sparkles aria-hidden="true" /> PrimeLabs
            </span>
            <h1>{t("about")}</h1>
            <p>{t("aboutIntro")}</p>
          </div>
          <div className="about-hero__photo">
            <img src={ABOUT_PHOTO} alt="" />
          </div>
        </div>
      </section>

      <section className="shell about-mission">
        <h2>{t("ourMission")}</h2>
        <p>{t("missionText")}</p>
      </section>

      <section className="shell about-points" aria-label={t("ourMission")}>
        {points.map(({ icon: Icon, text }, index) => (
          <article key={text}>
            <span className="about-points__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="about-points__icon" aria-hidden="true">
              <Icon />
            </span>
            <h3>{text}</h3>
          </article>
        ))}
      </section>

      <section className="shell">
        <div className="about-cta">
          <div>
            <h2>{t("newArrivals")}</h2>
            <p>{t("checkLatest")}</p>
          </div>
          <div className="about-cta__actions">
            <button className="about-cta__primary" onClick={onShop}>
              {t("shopNow")} <ArrowRight aria-hidden="true" />
            </button>
            <button className="about-cta__secondary" onClick={onContact}>
              <MessageCircle aria-hidden="true" /> {t("contact")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
