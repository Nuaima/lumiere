import { useEffect, useState } from "react";

export interface BrandTheme {
  name: string;
  logoDataUrl: string | null;
  primary: string; // hex
  accent: string; // hex
}

const KEY = "lumiere.brandTheme";

export const DEFAULT_THEME: BrandTheme = {
  name: "Maison Lune",
  logoDataUrl: null,
  primary: "#b85440",
  accent: "#f3d9c9",
};

export function useBrandTheme() {
  const [t, setT] = useState<BrandTheme>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    try {
      const v = localStorage.getItem(KEY);
      return v ? { ...DEFAULT_THEME, ...JSON.parse(v) } : DEFAULT_THEME;
    } catch { return DEFAULT_THEME; }
  });
  useEffect(() => {
    const h = (e: StorageEvent) => {
      if (e.key === KEY) {
        try { setT(JSON.parse(localStorage.getItem(KEY)!) || DEFAULT_THEME); } catch { /* */ }
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);
  const save = (next: BrandTheme) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setT(next);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  };
  return [t, save] as const;
}
