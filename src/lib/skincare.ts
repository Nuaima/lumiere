import type { BeautyProfile, SkinCondition, SkinType } from "./beauty-store";

export type SkincareStep = "cleanser" | "toner" | "serum" | "moisturizer" | "spf" | "treatment" | "exfoliant" | "mask" | "eye";

export interface SkincareProduct {
  id: string;
  name: string;
  brand: string;
  step: SkincareStep;
  hero: string;          // hero ingredient
  ingredients: string[]; // key actives
  goodFor: SkinType[];
  targets: SkinCondition[];
  time: ("AM" | "PM")[];
  price: number;
  size: string;
  desc: string;
}

export const INGREDIENT_GUIDE: { name: string; benefit: string; pairsWith: string[]; avoidWith: string[] }[] = [
  { name: "Hyaluronic Acid", benefit: "Plumps & deeply hydrates", pairsWith: ["Niacinamide", "Peptides", "Vitamin C"], avoidWith: [] },
  { name: "Niacinamide", benefit: "Minimizes pores, evens tone", pairsWith: ["Hyaluronic Acid", "Retinol"], avoidWith: [] },
  { name: "Vitamin C", benefit: "Brightens & fights dullness", pairsWith: ["Vitamin E", "SPF"], avoidWith: ["Retinol", "AHA/BHA"] },
  { name: "Retinol", benefit: "Smooths fine lines, renews", pairsWith: ["Peptides", "Hyaluronic Acid"], avoidWith: ["Vitamin C", "AHA/BHA", "Benzoyl Peroxide"] },
  { name: "Salicylic Acid", benefit: "Clears pores & acne", pairsWith: ["Niacinamide"], avoidWith: ["Retinol"] },
  { name: "Peptides", benefit: "Firms & supports collagen", pairsWith: ["Hyaluronic Acid", "Niacinamide", "Retinol"], avoidWith: [] },
  { name: "Ceramides", benefit: "Repairs the skin barrier", pairsWith: ["Hyaluronic Acid", "Peptides"], avoidWith: [] },
  { name: "SPF 50", benefit: "Prevents UV damage & aging", pairsWith: ["Vitamin C"], avoidWith: [] },
];

// Pakistan-available skincare edit · prices in PKR (approximate retail)
export const SKINCARE_CATALOG: SkincareProduct[] = [
  { id: "sc-c1", name: "Gentle Cleansing Milk", brand: "Conatural", step: "cleanser", hero: "Argan & Chamomile", ingredients: ["Argan Oil", "Glycerin", "Chamomile"], goodFor: ["dry","normal","combination"], targets: ["dryness","redness"], time: ["AM","PM"], price: 1850, size: "150ml", desc: "A creamy non-stripping cleanser made in Pakistan for thirsty skin." },
  { id: "sc-c2", name: "Foaming Facial Cleanser", brand: "CeraVe", step: "cleanser", hero: "Ceramides + Niacinamide", ingredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"], goodFor: ["oily","combination"], targets: ["acne","pores","oiliness"], time: ["AM","PM"], price: 3500, size: "236ml", desc: "Dermatologist-loved foaming wash, widely stocked across PK pharmacies." },
  { id: "sc-t1", name: "Pure Rose Water Toner", brand: "Saeed Ghani", step: "toner", hero: "Bulgarian Rose", ingredients: ["Rose Water"], goodFor: ["dry","normal","combination","oily"], targets: ["dryness","dullness","redness"], time: ["AM","PM"], price: 650, size: "120ml", desc: "Classic alcohol-free hydrating mist from a heritage Pakistani brand." },
  { id: "sc-s1", name: "Hyaluronic Acid 2% + B5", brand: "The Ordinary PK", step: "serum", hero: "Hyaluronic Acid", ingredients: ["Hyaluronic Acid", "B5"], goodFor: ["dry","combination","normal"], targets: ["dryness","dullness"], time: ["AM","PM"], price: 2400, size: "30ml", desc: "Multi-weight HA for instant plumping — available at Deciem PK & Just4girls." },
  { id: "sc-s2", name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary PK", step: "serum", hero: "Niacinamide", ingredients: ["Niacinamide", "Zinc PCA"], goodFor: ["oily","combination"], targets: ["pores","oiliness","uneven-tone","acne"], time: ["AM","PM"], price: 2200, size: "30ml", desc: "Refines pores and balances excess shine." },
  { id: "sc-s3", name: "Vitamin C Brightening Serum", brand: "Conatural", step: "serum", hero: "Vitamin C 15%", ingredients: ["Vitamin C", "Vitamin E", "Aloe"], goodFor: ["normal","dry","combination","oily"], targets: ["dullness","dark-spots","uneven-tone"], time: ["AM"], price: 2950, size: "30ml", desc: "Brightening antioxidant shield, made in Lahore." },
  { id: "sc-tr1", name: "Retinol 0.5% in Squalane", brand: "The Ordinary PK", step: "treatment", hero: "Retinol", ingredients: ["Retinol", "Squalane"], goodFor: ["normal","dry","combination","oily"], targets: ["wrinkles","dark-spots","uneven-tone"], time: ["PM"], price: 2900, size: "30ml", desc: "Gold-standard renewal cushioned by squalane." },
  { id: "sc-m1", name: "Moisturising Cream", brand: "CeraVe", step: "moisturizer", hero: "Ceramides", ingredients: ["Ceramides", "Hyaluronic Acid"], goodFor: ["dry","normal"], targets: ["dryness","wrinkles"], time: ["AM","PM"], price: 4500, size: "340g", desc: "Rich barrier-repair cream — stocked at Servaid & Dwatson." },
  { id: "sc-m2", name: "Light Complete Gel-Cream", brand: "Garnier PK", step: "moisturizer", hero: "Yuzu Lemon + Vitamin C", ingredients: ["Vitamin C", "Salicylic Acid"], goodFor: ["oily","combination"], targets: ["pores","oiliness","dullness"], time: ["AM","PM"], price: 950, size: "40ml", desc: "Oil-free brightening hydration at a friendly PK price." },
  { id: "sc-sp1", name: "Daily Defense SPF 50", brand: "Conatural", step: "spf", hero: "Mineral SPF 50", ingredients: ["Zinc Oxide", "Vitamin E"], goodFor: ["dry","oily","combination","normal"], targets: ["wrinkles","dark-spots","uneven-tone"], time: ["AM"], price: 1850, size: "60ml", desc: "Halal-certified mineral sunscreen, no white cast." },
  { id: "sc-ex1", name: "AHA 30% + BHA 2% Peeling Solution", brand: "The Ordinary PK", step: "exfoliant", hero: "Glycolic + Salicylic", ingredients: ["Glycolic Acid", "Salicylic Acid"], goodFor: ["oily","combination","normal"], targets: ["pores","dullness","uneven-tone"], time: ["PM"], price: 2400, size: "30ml", desc: "Cult 10-minute resurfacing mask, 1–2x per week." },
  { id: "sc-mk1", name: "Honey & Saffron Repair Mask", brand: "WB by Hemani", step: "mask", hero: "Manuka Honey", ingredients: ["Honey", "Saffron", "Aloe"], goodFor: ["dry","normal","combination"], targets: ["dryness","redness","dullness"], time: ["PM"], price: 950, size: "100g", desc: "Soothing overnight mask, locally crafted." },
  { id: "sc-e1", name: "Caffeine Solution 5% + EGCG", brand: "The Ordinary PK", step: "eye", hero: "Caffeine + EGCG", ingredients: ["Caffeine", "EGCG"], goodFor: ["dry","oily","combination","normal"], targets: ["wrinkles","dullness"], time: ["AM","PM"], price: 2100, size: "30ml", desc: "De-puffs and brightens around the eyes." },
];

export interface RoutineSuggestion {
  product: SkincareProduct;
  reason: string;
  match: number;
}

export function suggestSkincare(profile: BeautyProfile | null, time: "AM" | "PM"): RoutineSuggestion[] {
  const order: SkincareStep[] = time === "AM"
    ? ["cleanser","toner","serum","eye","moisturizer","spf"]
    : ["cleanser","toner","exfoliant","treatment","serum","eye","moisturizer","mask"];

  return order.map((step) => {
    const candidates = SKINCARE_CATALOG.filter((p) => p.step === step && p.time.includes(time));
    let best: RoutineSuggestion | null = null;
    for (const p of candidates) {
      let m = 60;
      const reasons: string[] = [];
      if (profile) {
        if (p.goodFor.includes(profile.skinType)) { m += 18; reasons.push(`great for ${profile.skinType} skin`); }
        const hits = p.targets.filter((t) => profile.conditions.includes(t));
        if (hits.length) { m += hits.length * 8; reasons.push(`targets ${hits.join(", ").replace(/-/g, " ")}`); }
        if (step === "moisturizer" && profile.hydration < 70) m += 4;
        if (step === "spf") m += 6;
      } else {
        m += 10;
      }
      const sug: RoutineSuggestion = { product: p, reason: reasons.join(" • ") || "a universally loved pick", match: Math.min(99, m) };
      if (!best || sug.match > best.match) best = sug;
    }
    return best;
  }).filter(Boolean) as RoutineSuggestion[];
}
