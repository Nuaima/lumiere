import { jsPDF } from "jspdf";
import type { BeautyProfile, TryOnEntry } from "./beauty-store";
import { monk } from "./monk";
import { recommend } from "./products";

const ROSE: [number, number, number] = [184, 84, 64];
const INK: [number, number, number] = [33, 25, 22];
const MUTED: [number, number, number] = [120, 110, 105];
const SOFT: [number, number, number] = [80, 75, 72];
const LINE: [number, number, number] = [230, 220, 215];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function exportBeautyPassport(
  profile: BeautyProfile,
  opts: { name?: string; tryOn?: TryOnEntry[] } = {}
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const name = (opts.name || "").trim();
  const tryOn = opts.tryOn ?? [];
  const recs = recommend(profile);
  const monkSw = monk(profile.monkTone);

  const addFooter = (page: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Lumière · AI Beauty Passport · cosmetic guidance only, not medical advice.", M, H - 24);
    doc.text(`Page ${page}`, W - M, H - 24, { align: "right" });
  };

  const newPage = () => {
    doc.addPage();
    doc.setFillColor(...ROSE);
    doc.rect(0, 0, W, 6, "F");
  };

  // ============== PAGE 1 — COVER + SKIN ==============
  doc.setFillColor(...ROSE);
  doc.rect(0, 0, W, 8, "F");

  let y = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text("Lumière", M, (y += 28));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("AI Beauty Passport — Skin & Makeup", M, (y += 14));
  doc.text(new Date(profile.createdAt).toLocaleString(), W - M, y, { align: "right" });

  if (name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...ROSE);
    doc.text(`Prepared for ${name}`, M, (y += 28));
  } else {
    y += 14;
  }

  y += 16;
  doc.setDrawColor(...LINE);
  doc.line(M, y, W - M, y);
  y += 20;

  // Selfie + profile summary
  try { doc.addImage(profile.imageDataUrl, "JPEG", M, y, 140, 140); } catch { /* */ }
  const xR = M + 160;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("Skin Profile", xR, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Monk Skin Tone", `${monkSw.label} (${monkSw.hex})`],
    ["Undertone", profile.undertone],
    ["Skin Type", profile.skinType],
    ["Shade Family", profile.shadeFamily || "—"],
    ["Concerns", profile.conditions.join(", ") || "—"],
    ["Confidence", `${profile.confidence}%`],
    ["Source", profile.source === "ai" ? "Lumière AI Vision" : "Offline estimate"],
  ];
  let ry = y + 32;
  rows.forEach(([k, v]) => {
    doc.setTextColor(150, 140, 135);
    doc.text(k, xR, ry);
    doc.setTextColor(...INK);
    doc.text(String(v), xR + 110, ry);
    ry += 14;
  });

  // Monk swatch
  const sw = hexToRgb(monkSw.hex);
  doc.setFillColor(sw[0], sw[1], sw[2]);
  doc.rect(W - M - 32, y + 14, 32, 32, "F");

  y += 160;

  // Scores
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Skin Health Scores", M, y);
  y += 6;
  const scores: [string, number][] = [
    ["Hydration", profile.hydration],
    ["Evenness", profile.evenness],
    ["Radiance", profile.radiance],
  ];
  scores.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...SOFT);
    doc.text(k, M, (y += 18));
    doc.text(`${v}/100`, W - M, y, { align: "right" });
    doc.setFillColor(240, 232, 226);
    doc.rect(M, y + 4, W - 2 * M, 6, "F");
    doc.setFillColor(...ROSE);
    doc.rect(M, y + 4, ((W - 2 * M) * v) / 100, 6, "F");
    y += 12;
  });

  // Summary
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Personalized Analysis", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SOFT);
  const lines = doc.splitTextToSize(profile.summary || "—", W - 2 * M);
  doc.text(lines, M, (y += 14));
  y += lines.length * 12 + 14;

  // Routines (two columns)
  if (profile.amRoutine.length || profile.pmRoutine.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("AM Routine", M, y);
    doc.text("PM Routine", W / 2 + 8, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...SOFT);
    const maxLen = Math.max(profile.amRoutine.length, profile.pmRoutine.length);
    for (let i = 0; i < maxLen; i++) {
      const am = profile.amRoutine[i] ?? "";
      const pm = profile.pmRoutine[i] ?? "";
      if (am) doc.text(`${i + 1}. ${am}`, M, (y += 14));
      else y += 14;
      if (pm) doc.text(`${i + 1}. ${pm}`, W / 2 + 8, y);
    }
  }

  addFooter(1);

  // ============== PAGE 2 — MAKEUP EDIT ==============
  newPage();
  y = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text("Your Makeup Edit", M, (y += 18));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Curated for ${profile.undertone} undertone · ${profile.skinType} skin · ${monkSw.label}.`,
    M,
    (y += 14)
  );
  y += 10;
  doc.setDrawColor(...LINE);
  doc.line(M, y, W - M, y);
  y += 18;

  // Foundation / Lipstick / Blush sections
  const groups = [
    { title: "Foundation matches", cat: "foundation" as const },
    { title: "Lipstick shades", cat: "lipstick" as const },
    { title: "Blush", cat: "blush" as const },
  ];

  groups.forEach((g) => {
    const items = recs.filter((r) => r.product.category === g.cat).slice(0, 4);
    if (!items.length) return;
    if (y > H - 160) { addFooter(2); newPage(); y = M + 8; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(g.title, M, y);
    y += 10;

    items.forEach((r) => {
      if (y > H - 80) { addFooter(2); newPage(); y = M + 8; }
      const c = r.product.color ? hexToRgb(r.product.color) : [220, 200, 190] as [number, number, number];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.circle(M + 12, y + 14, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(`${r.product.name}`, M + 32, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(`${r.product.brand} · Rs ${r.product.price.toLocaleString("en-PK")}`, M + 32, y + 24);
      doc.setTextColor(...ROSE);
      doc.text(`${r.score}% match`, W - M, y + 12, { align: "right" });
      doc.setTextColor(...SOFT);
      const rl = doc.splitTextToSize(r.reason, W - M - 200);
      doc.text(rl, M + 32, y + 34);
      y += 30 + rl.length * 10;
    });
    y += 8;
  });

  // Skincare picks
  const skincare = recs.filter((r) => r.product.category === "serum" || r.product.category === "moisturizer").slice(0, 3);
  if (skincare.length) {
    if (y > H - 140) { addFooter(2); newPage(); y = M + 8; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("Skincare picks", M, y);
    y += 8;
    skincare.forEach((r) => {
      if (y > H - 70) { addFooter(2); newPage(); y = M + 8; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(`• ${r.product.name}`, M, (y += 16));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(`${r.product.brand} · Rs ${r.product.price.toLocaleString("en-PK")} · ${r.score}% match`, M + 14, (y += 12));
      doc.setTextColor(...SOFT);
      const rl = doc.splitTextToSize(r.reason, W - 2 * M - 14);
      doc.text(rl, M + 14, (y += 12));
      y += rl.length * 10;
    });
  }

  // Try-on history
  if (tryOn.length) {
    if (y > H - 100) { addFooter(2); newPage(); y = M + 8; }
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("Recently tried on", M, y);
    y += 14;
    tryOn.slice(0, 10).forEach((t) => {
      const c = hexToRgb(t.color);
      doc.setFillColor(c[0], c[1], c[2]);
      doc.circle(M + 6, y - 3, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...SOFT);
      doc.text(`${t.shadeName}  ·  ${t.type}`, M + 18, y);
      y += 14;
    });
  }

  addFooter(doc.getNumberOfPages());

  const slug = (name || "you").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`lumiere-beauty-passport-${slug}-${new Date(profile.createdAt).toISOString().slice(0, 10)}.pdf`);
}
