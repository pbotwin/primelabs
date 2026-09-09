import { BadgeCheck, Headphones, Truck } from "lucide-react";
import type { CopyKey } from "../data/translations";

export function StoreBenefits({ t }: { t: (key: CopyKey) => string }) {
  return (
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
  );
}
