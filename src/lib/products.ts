import type { BeautyProfile, Undertone, SkinType } from "./beauty-store";

export type ProductCategory =
  | "primer"
  | "foundation"
  | "concealer"
  | "blush"
  | "bronzer"
  | "eyeshadow"
  | "eyeliner"
  | "mascara"
  | "lipstick"
  | "lip-gloss"
  | "lip-liner"
  | "serum"
  | "moisturizer";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  color?: string;
  forUndertone?: Undertone[];
  forSkinType?: SkinType[];
  price: number; // PKR
}

// Pakistan-available beauty edit · prices in PKR (approximate retail)
export const PRODUCTS: Product[] = [
  // FACE — Primer
  { id: "pr1", name: "Baby Skin Pore Eraser Primer", brand: "Maybelline PK", category: "primer", color: "#f5e3d6", forSkinType: ["oily","combination"], price: 1850 },
  { id: "pr2", name: "Magic Touch Primer", brand: "Rivaj UK", category: "primer", color: "#f1ddc9", forSkinType: ["dry","normal"], price: 950 },

  // FACE — Foundation
  { id: "f1", name: "Fit Me Matte + Poreless", brand: "Maybelline PK", category: "foundation", color: "#e8c5a8", forUndertone: ["warm","neutral"], forSkinType: ["oily","combination"], price: 2350 },
  { id: "f2", name: "True Match Lumi Glow", brand: "L'Oréal Paris", category: "foundation", color: "#d4a987", forUndertone: ["neutral"], forSkinType: ["dry","normal"], price: 4500 },
  { id: "f3", name: "Silk Foundation", brand: "Masarrat Misbah", category: "foundation", color: "#c89576", forUndertone: ["warm"], forSkinType: ["dry","combination"], price: 3200 },
  { id: "f4", name: "HD Liquid Foundation", brand: "Rivaj UK", category: "foundation", color: "#b9805f", forUndertone: ["cool","neutral"], forSkinType: ["oily","combination"], price: 1200 },

  // FACE — Concealer
  { id: "co1", name: "Fit Me Concealer", brand: "Maybelline PK", category: "concealer", color: "#e9c5a4", forUndertone: ["warm","neutral"], price: 1850 },
  { id: "co2", name: "Infallible Full Wear Concealer", brand: "L'Oréal Paris", category: "concealer", color: "#dba887", forUndertone: ["neutral"], price: 2950 },

  // FACE — Blush
  { id: "b1", name: "Velvet Blush — Sunset", brand: "Sapphire Beauty", category: "blush", color: "#d77e6e", forUndertone: ["warm","neutral"], price: 1100 },
  { id: "b2", name: "Cheek Heat Gel Blush — Rose", brand: "Maybelline PK", category: "blush", color: "#c85c66", forUndertone: ["cool","neutral"], price: 1650 },
  { id: "b3", name: "Powder Blush — Mauve", brand: "Masarrat Misbah", category: "blush", color: "#b06576", forUndertone: ["cool"], price: 1450 },

  // FACE — Bronzer
  { id: "br1", name: "Matte Bronzer — Caramel", brand: "Sapphire Beauty", category: "bronzer", color: "#9a6a4a", forUndertone: ["warm","neutral"], price: 1450 },
  { id: "br2", name: "Sun-Kissed Bronzer", brand: "Rivaj UK", category: "bronzer", color: "#83553c", forUndertone: ["warm"], price: 900 },

  // EYES — Eyeshadow
  { id: "es1", name: "Nude Palette — Warm", brand: "Masarrat Misbah", category: "eyeshadow", color: "#a07458", forUndertone: ["warm","neutral"], price: 2950 },
  { id: "es2", name: "Smoke Palette — Bronze", brand: "Sapphire Beauty", category: "eyeshadow", color: "#7d5236", forUndertone: ["warm","neutral"], price: 2200 },
  { id: "es3", name: "Mauve Dream Shadow", brand: "Maybelline PK", category: "eyeshadow", color: "#8a5d72", forUndertone: ["cool"], price: 1650 },
  { id: "es4", name: "Champagne Glow Shadow", brand: "L'Oréal Paris", category: "eyeshadow", color: "#c69a78", forUndertone: ["neutral","warm"], price: 1850 },

  // EYES — Eyeliner
  { id: "el1", name: "Hyper Easy Liquid Liner", brand: "Maybelline PK", category: "eyeliner", color: "#1a1410", price: 1450 },
  { id: "el2", name: "Kohl Kajal", brand: "Rivaj UK", category: "eyeliner", color: "#0d0a08", price: 450 },

  // EYES — Mascara
  { id: "ma1", name: "Lash Sensational Mascara", brand: "Maybelline PK", category: "mascara", color: "#0d0a08", price: 1750 },
  { id: "ma2", name: "Voluminous Original Mascara", brand: "L'Oréal Paris", category: "mascara", color: "#0d0a08", price: 2200 },

  // LIPS — Lipstick
  { id: "l1", name: "Color Sensational Creamy Matte", brand: "Maybelline PK", category: "lipstick", color: "#c2455a", forUndertone: ["cool","neutral"], price: 1450 },
  { id: "l2", name: "Lasting Matte — Terracotta", brand: "Sapphire Beauty", category: "lipstick", color: "#b85440", forUndertone: ["warm"], price: 1350 },
  { id: "l3", name: "Lush Matte — Nude Cashmere", brand: "Masarrat Misbah", category: "lipstick", color: "#a8665a", forUndertone: ["neutral","warm"], price: 1950 },
  { id: "l4", name: "Color Riche — Berry Noir", brand: "L'Oréal Paris", category: "lipstick", color: "#7a2a3f", forUndertone: ["cool"], price: 2200 },

  // LIPS — Lip Gloss
  { id: "lg1", name: "Lifter Gloss — Petal", brand: "Maybelline PK", category: "lip-gloss", color: "#e08a8f", forUndertone: ["cool","neutral"], price: 1850 },
  { id: "lg2", name: "Shine Gloss — Honey", brand: "Sapphire Beauty", category: "lip-gloss", color: "#c98765", forUndertone: ["warm"], price: 1250 },

  // LIPS — Lip Liner
  { id: "ll1", name: "Color Sensational Lip Liner — Nude", brand: "Maybelline PK", category: "lip-liner", color: "#9c6757", forUndertone: ["warm","neutral"], price: 850 },
  { id: "ll2", name: "Velvet Lip Liner — Rosewood", brand: "Masarrat Misbah", category: "lip-liner", color: "#8e4757", forUndertone: ["cool"], price: 1100 },

  // SKINCARE
  { id: "s1", name: "Hyaluronic Acid 2% + B5", brand: "The Ordinary PK", category: "serum", forSkinType: ["dry","combination","normal"], price: 2400 },
  { id: "s2", name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary PK", category: "serum", forSkinType: ["oily","combination"], price: 2200 },
  { id: "m1", name: "Moisturising Cream", brand: "CeraVe", category: "moisturizer", forSkinType: ["dry","normal"], price: 4500 },
];

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
}

export function recommend(profile: BeautyProfile): Recommendation[] {
  return PRODUCTS.map((p) => {
    let score = 70;
    const reasons: string[] = [];
    if (p.forUndertone?.includes(profile.undertone)) { score += 12; reasons.push(`matches your ${profile.undertone} undertone`); }
    if (p.forSkinType?.includes(profile.skinType)) { score += 10; reasons.push(`formulated for ${profile.skinType} skin`); }
    if (p.category === "serum" && profile.conditions.includes("acne") && p.id === "s2") { score += 8; reasons.push("targets breakouts"); }
    if (p.category === "moisturizer" && profile.hydration < 70) { score += 6; reasons.push("boosts hydration"); }
    score += Math.floor(Math.random() * 5);
    return { product: p, score: Math.min(98, score), reason: reasons.join(" • ") || "a universal favorite" };
  }).sort((a, b) => b.score - a.score);
}

const byCat = (c: ProductCategory) => PRODUCTS.filter((p) => p.category === c);

export const LIPSTICK_SHADES = byCat("lipstick");
export const FOUNDATION_SHADES = byCat("foundation");
export const BLUSH_SHADES = byCat("blush");
export const BRONZER_SHADES = byCat("bronzer");
export const EYESHADOW_SHADES = byCat("eyeshadow");
export const LIPGLOSS_SHADES = byCat("lip-gloss");
export const LIPLINER_SHADES = byCat("lip-liner");
export const CONCEALER_SHADES = byCat("concealer");
export const PRIMER_SHADES = byCat("primer");
export const EYELINER_SHADES = byCat("eyeliner");
export const MASCARA_SHADES = byCat("mascara");

// Highlighter — luminous shimmer shades
export const HIGHLIGHTER_SHADES: Product[] = [
  { id: "hl1", name: "Liquid Glow — Champagne", brand: "Sapphire Beauty", category: "bronzer", color: "#f4e2c4", price: 1350 },
  { id: "hl2", name: "Strobe Highlight — Pearl", brand: "Maybelline PK", category: "bronzer", color: "#f8ead6", price: 1750 },
  { id: "hl3", name: "Gold Dust Highlight", brand: "Masarrat Misbah", category: "bronzer", color: "#e8c98a", price: 1650 },
];

// One-tap curated looks
export interface LookPreset {
  id: string;
  name: string;
  description: string;
  shades: Record<string, string>;
}
export const LOOKS: LookPreset[] = [
  { id: "natural", name: "Natural Everyday", description: "Soft, dewy, barely-there", shades: { foundation: "f2", blush: "b1", lipstick: "l3", "lip-gloss": "lg1" } },
  { id: "bridal", name: "Bridal Glow", description: "Romantic Pakistani bridal warmth", shades: { foundation: "f3", blush: "b1", bronzer: "br1", eyeshadow: "es1", "lip-liner": "ll1", lipstick: "l2", highlighter: "hl3" } },
  { id: "smokey", name: "Smokey Night", description: "Sultry eye, nude lip", shades: { foundation: "f1", bronzer: "br2", eyeshadow: "es2", eyeliner: "el1", mascara: "ma1", lipstick: "l3" } },
  { id: "glam", name: "Red Carpet Glam", description: "Bold lip, sculpted cheek", shades: { foundation: "f1", blush: "b2", bronzer: "br1", highlighter: "hl1", eyeshadow: "es4", eyeliner: "el1", mascara: "ma2", "lip-liner": "ll2", lipstick: "l4" } },
  { id: "berry", name: "Berry Mauve", description: "Cool-toned chic", shades: { foundation: "f4", blush: "b3", eyeshadow: "es3", lipstick: "l4", "lip-liner": "ll2" } },
];

export const formatPKR = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;
