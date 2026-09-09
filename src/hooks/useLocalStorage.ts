import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => boolean,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;
      const parsed: unknown = JSON.parse(stored);
      return !isValid || isValid(parsed) ? (parsed as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable. */
    }
  }, [key, value]);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== localStorage) return;
      try {
        const parsed: unknown = event.newValue
          ? JSON.parse(event.newValue)
          : initialValue;
        if (!isValid || isValid(parsed)) setValue(parsed as T);
      } catch {
        // Ignore malformed values written by another tab.
      }
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [initialValue, isValid, key]);

  return [value, setValue] as const;
}
