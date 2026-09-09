import type { Language } from "../types";

export const isLanguage = (value: unknown): value is Language =>
  value === "ka" || value === "en";

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const isCart = (value: unknown): value is Record<string, number> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.entries(value).every(
    ([key, quantity]) =>
      key.length > 0 &&
      typeof quantity === "number" &&
      Number.isInteger(quantity) &&
      quantity > 0,
  );
