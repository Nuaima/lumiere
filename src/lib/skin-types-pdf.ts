import { jsPDF } from "jspdf";

export interface SkinTypeInfo {
  name: string;
  emoji: string;
  traits: string[];
  amRoutine: string[];
  pmRoutine: string[];
  ingredients: string[];
  avoid: string[];
  tip: string;
}

export const SKIN_TYPES: SkinTypeInfo[] = [
  {
    name: "Dry",
    emoji: "💧",
    traits: ["Tight or rough texture", "Visible flaking", "Dullness", "Fine lines more pronounced"],
    amRoutine: ["Cream or oil cleanser", "Hydrating toner", "Hyaluronic acid serum", "Rich moisturizer", "SPF 50"],
    pmRoutine: ["Oil cleanser", "Gentle exfoliant (1-2x/week)", "Peptide or retinol serum", "Barrier-repair night cream"],
    ingredients: ["Hyaluronic Acid", "Ceramides", "Squalane", "Peptides", "Shea Butter"],
    avoid: ["Sulfates", "Alcohol denat.", "Over-exfoliation"],
    tip: "Layer hydration: toner → serum → moisturizer while skin is still damp.",
  },
  {
    name: "Oily",
    emoji: "✨",
    traits: ["Shiny T-zone within hours", "Enlarged pores", "Prone to blackheads", "Makeup slides off"],
    amRoutine: ["Gel or foaming cleanser", "Niacinamide toner", "Lightweight vitamin C", "Oil-free gel moisturizer", "Matte SPF 50"],
    pmRoutine: ["Double cleanse", "BHA/Salicylic acid exfoliant", "Niacinamide or retinol serum", "Non-comedogenic moisturizer"],
    ingredients: ["Niacinamide", "Salicylic Acid", "Zinc PCA", "Clay", "Tea Tree"],
    avoid: ["Heavy oils", "Rich butters", "Comedogenic silicones"],
    tip: "Don't skip moisturizer — dehydrated oily skin produces even more sebum.",
  },
  {
    name: "Combination",
    emoji: "🌿",
    traits: ["Oily T-zone, dry cheeks", "Seasonal shifts", "Mixed pore sizes", "Needs zone-specific care"],
    amRoutine: ["Balancing gel-to-cream cleanser", "Hydrating essence", "Vitamin C or niacinamide serum", "Light moisturizer + SPF"],
    pmRoutine: ["Oil + gel double cleanse", "Gentle AHA on T-zone", "Hydrating serum on cheeks", "Layered moisturizers by zone"],
    ingredients: ["Niacinamide", "Hyaluronic Acid", "Green Tea", "Centella", "Squalane"],
    avoid: ["Harsh stripping cleansers", "All-over heavy creams", "All-over strong acids"],
    tip: "Use different products on different zones, or switch formulas seasonally.",
  },
  {
    name: "Normal",
    emoji: "🌸",
    traits: ["Balanced moisture", "Small pores", "Few blemishes", "Even texture and tone"],
    amRoutine: ["Gentle cleanser", "Essence or toner", "Antioxidant serum", "Light moisturizer", "SPF 50"],
    pmRoutine: ["Cleanser", "Exfoliant (2-3x/week)", "Treatment serum (retinol/peptides)", "Night cream"],
    ingredients: ["Vitamin C", "Peptides", "Niacinamide", "Hyaluronic Acid", "SPF"],
    avoid: ["Over-treating", "Harsh actives without reason"],
    tip: "Focus on prevention and protection — your goal is maintenance, not correction.",
  },
];

export function exportSkinTypesGuide() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = M;

  doc.setFillColor(184, 84, 64);
  doc.rect(0, 0, W, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(33, 25, 22);
  doc.text("Lumière", M, (y += 28));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 110, 105);
  doc.text("Skin Types Reference Guide", M, (y += 14));
  doc.text(new Date().toLocaleDateString(), W - M, y, { align: "right" });

  y += 24;
  doc.setDrawColor(230, 220, 215);
  doc.line(M, y, W - M, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 75, 72);
  const intro = doc.splitTextToSize(
    "This guide covers the four primary skin types recognized by dermatologists and aestheticians. Use it to understand your skin's baseline behavior, choose compatible ingredients, and build a routine that respects your biology.",
    W - 2 * M
  );
  doc.text(intro, M, y);
  y += intro.length * 12 + 24;

  for (const st of SKIN_TYPES) {
    if (y > doc.internal.pageSize.getHeight() - 180) {
      doc.addPage();
      y = M;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 25, 22);
    doc.text(`${st.emoji} ${st.name} Skin`, M, y);
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(150, 140, 135);
    doc.text("Key traits", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 75, 72);
    st.traits.forEach((t) => {
      doc.text(`• ${t}`, M + 10, y);
      y += 12;
    });
    y += 6;

    const colW = (W - 2 * M - 16) / 2;
    const x2 = M + colW + 16;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 140, 135);
    doc.text("AM Routine", M, y);
    doc.text("PM Routine", x2, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 75, 72);
    const maxR = Math.max(st.amRoutine.length, st.pmRoutine.length);
    for (let i = 0; i < maxR; i++) {
      if (st.amRoutine[i]) doc.text(`${i + 1}. ${st.amRoutine[i]}`, M, y);
      if (st.pmRoutine[i]) doc.text(`${i + 1}. ${st.pmRoutine[i]}`, x2, y);
      y += 12;
    }
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 140, 135);
    doc.text("Star ingredients", M, y);
    doc.text("Avoid", x2, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 75, 72);
    doc.text(st.ingredients.join(", "), M, y, { maxWidth: colW });
    doc.text(st.avoid.join(", "), x2, y, { maxWidth: colW });
    y += 22;

    doc.setFillColor(250, 246, 243);
    doc.roundedRect(M, y, W - 2 * M, 36, 6, 6, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 110, 105);
    const tipLines = doc.splitTextToSize(`Tip: ${st.tip}`, W - 2 * M - 20);
    doc.text(tipLines, M + 10, y + 14);
    y += Math.max(46, tipLines.length * 11 + 16);

    y += 10;
  }

  doc.setFontSize(8);
  doc.setTextColor(160, 150, 145);
  doc.text(
    "For educational use. Not a substitute for professional dermatological advice.",
    M,
    doc.internal.pageSize.getHeight() - 24
  );

  doc.save(`lumiere-skin-types-guide-${new Date().toISOString().slice(0, 10)}.pdf`);
}
