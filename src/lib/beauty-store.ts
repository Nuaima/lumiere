import { useEffect, useState } from "react";

export type SkinTone = "fair" | "light" | "medium" | "tan" | "deep";
export type Undertone = "warm" | "cool" | "neutral";
export type SkinType = "dry" | "oily" | "combination" | "normal";
export type SkinCondition = "clear" | "acne" | "redness" | "dullness" | "pores" | "dark-spots" | "wrinkles" | "dryness" | "oiliness" | "uneven-tone";

export interface ClinicalScores {
  acne: number;
  pigmentation: number;
  redness: number;
  pores: number;
  wrinkles: number;
  darkCircles: number;
}

export type FaceShape = "oval" | "round" | "square" | "heart" | "oblong" | "diamond" | "triangle";
export type EyeShape = "almond" | "round" | "hooded" | "monolid" | "upturned" | "downturned";
export type LipShape = "full" | "thin" | "wide" | "heart" | "round" | "balanced";
export type BrowShape = "arched" | "straight" | "rounded" | "s-shaped" | "angular";

export interface BeautyProfile {
  imageDataUrl: string;
  skinTone: SkinTone;
  monkTone: number; // 1-10
  undertone: Undertone;
  skinType: SkinType;
  conditions: SkinCondition[];
  hydration: number;
  evenness: number;
  radiance: number;
  confidence: number;
  summary: string;
  amRoutine: string[];
  pmRoutine: string[];
  shadeFamily: string;
  createdAt: number;
  source: "ai" | "fallback";
  // Deep analysis (optional for backward compat)
  clinical?: ClinicalScores;
  faceShape?: FaceShape;
  eyeShape?: EyeShape;
  lipShape?: LipShape;
  browShape?: BrowShape;
  symmetry?: number;
  beautyIQ?: number;
}


export interface TryOnEntry {
  id: string;
  type: "lipstick" | "foundation";
  shadeName: string;
  color: string;
  at: number;
}

const PROFILE_KEY = "lumiere.profile";
const FAVS_KEY = "lumiere.favs";
const TRYON_KEY = "lumiere.tryon";
const HISTORY_KEY = "lumiere.scanhistory";
export const CONSENT_KEY = "lumiere.consent";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new StorageEvent("storage", { key: k }));
}

export function useBeautyProfile() {
  const [p, setP] = useState<BeautyProfile | null>(() => read<BeautyProfile | null>(PROFILE_KEY, null));
  useEffect(() => {
    const h = (e: StorageEvent) => { if (e.key === PROFILE_KEY) setP(read<BeautyProfile | null>(PROFILE_KEY, null)); };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);
  return [p, (np: BeautyProfile | null) => {
    if (np) {
      write(PROFILE_KEY, np);
      // also append to scan history
      const hist = read<BeautyProfile[]>(HISTORY_KEY, []);
      write(HISTORY_KEY, [np, ...hist].slice(0, 20));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
    setP(np);
  }] as const;
}

export function useScanHistory() {
  const [h, setH] = useState<BeautyProfile[]>(() => read<BeautyProfile[]>(HISTORY_KEY, []));
  useEffect(() => {
    const handler = (e: StorageEvent) => { if (e.key === HISTORY_KEY || e.key === PROFILE_KEY) setH(read<BeautyProfile[]>(HISTORY_KEY, [])); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return h;
}

export function useFavorites() {
  const [f, setF] = useState<string[]>(() => read<string[]>(FAVS_KEY, []));
  useEffect(() => {
    const h = (e: StorageEvent) => { if (e.key === FAVS_KEY) setF(read<string[]>(FAVS_KEY, [])); };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);
  const toggle = (id: string) => {
    const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    write(FAVS_KEY, next); setF(next);
  };
  return { favorites: f, toggle, isFav: (id: string) => f.includes(id) };
}

export function useTryOnHistory() {
  const [h, setH] = useState<TryOnEntry[]>(() => read<TryOnEntry[]>(TRYON_KEY, []));
  useEffect(() => {
    const handler = (e: StorageEvent) => { if (e.key === TRYON_KEY) setH(read<TryOnEntry[]>(TRYON_KEY, [])); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const add = (entry: Omit<TryOnEntry, "id" | "at">) => {
    const next = [{ ...entry, id: crypto.randomUUID(), at: Date.now() }, ...h].slice(0, 20);
    write(TRYON_KEY, next); setH(next);
  };
  return { history: h, add };
}

function monkToLegacy(monk: number): SkinTone {
  if (monk <= 2) return "fair";
  if (monk <= 4) return "light";
  if (monk <= 6) return "medium";
  if (monk <= 8) return "tan";
  return "deep";
}

/** Real AI analysis via Lovable AI Gateway, with mock fallback. */
export async function analyzeImage(dataUrl: string): Promise<BeautyProfile> {
  try {
    const res = await fetch("/api/analyze-skin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: dataUrl }),
    });
    if (res.ok) {
      const d = await res.json();
      return {
        imageDataUrl: dataUrl,
        monkTone: d.monkTone,
        skinTone: monkToLegacy(d.monkTone),
        undertone: d.undertone,
        skinType: d.skinType,
        conditions: d.concerns ?? [],
        hydration: d.hydration,
        evenness: d.evenness,
        radiance: d.radiance,
        confidence: d.confidence ?? 80,
        summary: d.summary,
        amRoutine: d.amRoutine ?? [],
        pmRoutine: d.pmRoutine ?? [],
        shadeFamily: d.shadeFamily ?? "",
        createdAt: Date.now(),
        source: "ai",
        clinical: d.clinical,
        faceShape: d.faceShape,
        eyeShape: d.eyeShape,
        lipShape: d.lipShape,
        browShape: d.browShape,
        symmetry: d.symmetry,
        beautyIQ: d.beautyIQ,
      };
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `AI error ${res.status}`);
  } catch (e) {
    console.warn("AI analysis failed, using fallback:", e);
    return mockAnalyze(dataUrl);
  }
}

async function mockAnalyze(dataUrl: string): Promise<BeautyProfile> {
  await new Promise((r) => setTimeout(r, 1200));
  const { avgL, avgA, avgB } = await sampleImage(dataUrl);
  const monkTone = Math.min(10, Math.max(1, Math.round(10 - avgL * 9)));
  const undertone: Undertone = avgB > 0.55 ? "warm" : avgA > 0.52 ? "cool" : "neutral";
  const types: SkinType[] = ["dry", "combination", "oily", "normal"];
  const skinType = types[Math.floor((avgA * 7) % 4)];
  const conds: SkinCondition[] = [];
  if (avgA > 0.55) conds.push("redness");
  if ((avgB * 10) % 1 > 0.6) conds.push("pores");
  if (avgL < 0.4) conds.push("dullness");
  if (conds.length === 0) conds.push("clear");
  return {
    imageDataUrl: dataUrl,
    monkTone,
    skinTone: monkToLegacy(monkTone),
    undertone,
    skinType,
    conditions: conds,
    hydration: Math.round(55 + avgL * 35),
    evenness: Math.round(60 + (1 - avgA) * 30),
    radiance: Math.round(50 + avgB * 40),
    confidence: 55,
    summary: `Estimated profile (offline mode). Your skin appears ${skinType} with ${undertone} undertones. Connect AI for clinical-grade detection.`,
    amRoutine: ["Gentle cleanser", "Vitamin C serum", "Lightweight moisturizer", "Broad-spectrum SPF 50"],
    pmRoutine: ["Oil cleanser", "Hydrating toner", "Targeted treatment", "Rich night cream"],
    shadeFamily: `${undertone} ${skinType}`,
    createdAt: Date.now(),
    source: "fallback",
  };
}

async function sampleImage(dataUrl: string) {
  return new Promise<{ avgL: number; avgA: number; avgB: number }>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 64; c.height = 64;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 64, 64);
      const { data } = ctx.getImageData(0, 0, 64, 64);
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
      r /= n; g /= n; b /= n;
      resolve({ avgL: (r + g + b) / (3 * 255), avgA: r / (r + g + b + 1), avgB: g / (r + g + b + 1) });
    };
    img.onerror = () => resolve({ avgL: 0.6, avgA: 0.5, avgB: 0.5 });
    img.src = dataUrl;
  });
}
