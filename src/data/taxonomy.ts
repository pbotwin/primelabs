import type { Language } from "../types";

export type Label = Record<Language, string>;

/* Names for subcategory ids used by the store catalog. Category names live
   in translations.ts; generated demo names are merged in by catalog.ts. */
export const subcategoryLabels: Record<string, Label> = {
  stimulant: { ka: "სტიმულანტი", en: "Stimulant" },
  "stim-free": { ka: "სტიმულანტის გარეშე", en: "Stim-free" },
  thermogenic: { ka: "თერმოგენული", en: "Thermogenic" },
  lipotropic: { ka: "ლიპოტროპული", en: "Lipotropic" },
};
