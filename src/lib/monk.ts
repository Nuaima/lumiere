// Monk Skin Tone Scale — 10 inclusive tones (Ellis Monk / Google Research)
export const MONK_SCALE: { id: number; hex: string; label: string }[] = [
  { id: 1, hex: "#f6ede4", label: "Monk 01" },
  { id: 2, hex: "#f3e7db", label: "Monk 02" },
  { id: 3, hex: "#f7ead0", label: "Monk 03" },
  { id: 4, hex: "#eadaba", label: "Monk 04" },
  { id: 5, hex: "#d7bd96", label: "Monk 05" },
  { id: 6, hex: "#a07e56", label: "Monk 06" },
  { id: 7, hex: "#825c43", label: "Monk 07" },
  { id: 8, hex: "#604134", label: "Monk 08" },
  { id: 9, hex: "#3a312a", label: "Monk 09" },
  { id: 10, hex: "#292420", label: "Monk 10" },
];

export const monk = (id: number) => MONK_SCALE[Math.min(10, Math.max(1, id)) - 1];
