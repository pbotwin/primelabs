import { Sparkles } from "lucide-react";

const searches = [
  { label: "კრეატინი", query: "creatine" },
  { label: "პროტეინი", query: "protein" },
  { label: "BCAA", query: "bcaa" },
  { label: "ვიტამინები", query: "vitamin" },
  { label: "გეინერი", query: "gainer" },
  { label: "Pre-Workout", query: "pre-workout" },
  { label: "Omega-3", query: "omega" },
  { label: "სპორტული კვება", query: "" },
];
const searchHref = (query: string) =>
  query ? `#/catalog?q=${encodeURIComponent(query)}` : "#/catalog";

/* Crawlable store description with quick catalog searches. */
export function SeoBlock() {
  return (
    <section className="seo-block shell">
      <div className="seo-block__card">
        <h2>
          <span className="seo-block__icon" aria-hidden="true">
            <Sparkles />
          </span>
          <span>
            საუკეთესო სპორტული კვება საქართველოში{" "}
            <em>— Best Sports Supplements in Georgia</em>
          </span>
        </h2>
        <p>
          PrimeLabs გთავაზობთ საუკეთესო ხარისხის{" "}
          <a href={searchHref("creatine")}>კრეატინს</a>,{" "}
          <a href={searchHref("protein")}>პროტეინს</a>,{" "}
          <a href={searchHref("bcaa")}>ამინო მჟავებს (BCAA)</a>,{" "}
          <a href={searchHref("vitamin")}>ვიტამინებს</a>, გეინერს, ომეგა-3 და
          სხვა <a href={searchHref("")}>სპორტულ დანამატებს</a>. ჩვენი
          ასორტიმენტი მოიცავს მსოფლიოს წამყვანი ბრენდების პროდუქტებს, რომლებიც
          ხელს უწყობს კუნთების ზრდას, გამძლეობის გაზრდასა და სწრაფ აღდგენას.
        </p>
        <div className="seo-block__tags">
          {searches.map((item) => (
            <a key={item.label} href={searchHref(item.query)}>
              {item.label}
            </a>
          ))}
        </div>
        <p className="seo-block__keywords">
          Creatine · Protein · Whey Protein · BCAA · Amino Acids · Pre-Workout ·
          Gainer · Omega-3 · Vitamins · სპორტული კვება · კრეატინი · პროტეინი ·
          სავარჯიშო დანამატები · ფიტნეს კვება · კუნთების ზრდა
        </p>
      </div>
    </section>
  );
}
