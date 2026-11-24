import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useBeautyProfile, useFavorites } from "@/lib/beauty-store";
import { SKINCARE_CATALOG, INGREDIENT_GUIDE, suggestSkincare, type SkincareStep } from "@/lib/skincare";
import { Sparkles, Sunrise, Moon, Heart, Beaker, ShieldCheck, Leaf, Download } from "lucide-react";
import { exportSkinTypesGuide } from "@/lib/skin-types-pdf";

export const Route = createFileRoute("/skincare")({
  head: () => ({
    meta: [
      { title: "Skincare — Lumière" },
      { name: "description", content: "AI-curated skincare routines, clinical ingredients and dermatologist-grade product matches for your skin." },
    ],
  }),
  component: SkincarePage,
});

const STEPS: { id: SkincareStep | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cleanser", label: "Cleansers" },
  { id: "toner", label: "Toners" },
  { id: "serum", label: "Serums" },
  { id: "treatment", label: "Treatments" },
  { id: "moisturizer", label: "Moisturizers" },
  { id: "spf", label: "SPF" },
  { id: "exfoliant", label: "Exfoliants" },
  { id: "mask", label: "Masks" },
  { id: "eye", label: "Eye care" },
];

function SkincarePage() {
  const [profile] = useBeautyProfile();
  const { isFav, toggle } = useFavorites();
  const [filter, setFilter] = useState<SkincareStep | "all">("all");

  const am = useMemo(() => suggestSkincare(profile, "AM"), [profile]);
  const pm = useMemo(() => suggestSkincare(profile, "PM"), [profile]);

  const list = useMemo(() =>
    filter === "all" ? SKINCARE_CATALOG : SKINCARE_CATALOG.filter((p) => p.step === filter),
  [filter]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full space-y-12">
        {/* HERO */}
        <section className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Clinical · Personalized</p>
            <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
              Your skin, decoded into a <span className="italic">ritual</span>.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl">
              AI-curated AM and PM routines built around your skin type, concerns and the Monk skin tone scale — paired with dermatology-grade ingredients.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/scan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-rose text-primary-foreground text-sm font-medium shadow-luxe">
                <Sparkles className="size-4" /> {profile ? "Re-scan skin" : "Start with a scan"}
              </Link>
              <a href="#routine" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm">View routine</a>
              <button onClick={exportSkinTypesGuide} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm hover:bg-card">
                <Download className="size-4" /> Download skin types guide (PDF)
              </button>
            </div>
            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5"/> Dermatologist-reviewed</span>
              <span className="inline-flex items-center gap-1"><Leaf className="size-3.5"/> Clean formulas</span>
              <span className="inline-flex items-center gap-1"><Beaker className="size-3.5"/> Evidence-based</span>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Your skin signature</p>
            {profile ? (
              <>
                <p className="font-display text-3xl mt-2 capitalize">{profile.undertone} · {profile.skinType}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.conditions.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs capitalize">{c.replace("-", " ")}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                  {([["Hydration", profile.hydration], ["Evenness", profile.evenness], ["Radiance", profile.radiance]] as const).map(([l, v]) => (
                    <div key={l}>
                      <p className="font-display text-2xl">{v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-3">Scan your skin to unlock a routine built around your unique profile.</p>
            )}
          </div>
        </section>

        {/* ROUTINE */}
        <section id="routine" className="space-y-6">
          <div>
            <h2 className="font-display text-3xl">Your daily ritual</h2>
            <p className="text-sm text-muted-foreground">A complete morning and night routine, ordered the way dermatologists recommend.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <RoutineColumn icon={Sunrise} title="Morning ritual" items={am} />
            <RoutineColumn icon={Moon} title="Evening ritual" items={pm} />
          </div>
        </section>

        {/* INGREDIENT GUIDE */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl">Ingredient atlas</h2>
              <p className="text-sm text-muted-foreground">Understand what's going on your skin — and what to layer (or avoid).</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INGREDIENT_GUIDE.map((i) => (
              <div key={i.name} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg gradient-rose grid place-items-center text-primary-foreground"><Beaker className="size-4"/></div>
                  <p className="font-medium">{i.name}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{i.benefit}</p>
                <div className="mt-3 text-xs">
                  <p className="text-foreground/80"><span className="text-primary font-medium">Pairs with:</span> {i.pairsWith.join(", ") || "—"}</p>
                  {i.avoidWith.length > 0 && (
                    <p className="text-foreground/80 mt-1"><span className="text-destructive font-medium">Avoid with:</span> {i.avoidWith.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATALOG */}
        <section>
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl">The skincare edit</h2>
              <p className="text-sm text-muted-foreground">Hand-picked, clean formulas across every step.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs transition ${
                    filter === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((p) => (
              <article key={p.id} className="glass-card rounded-3xl p-5 flex flex-col hover:-translate-y-0.5 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.brand} · {p.step}</p>
                    <h3 className="font-display text-xl mt-0.5 truncate">{p.name}</h3>
                  </div>
                  <button onClick={() => toggle(p.id)} aria-label="favorite">
                    <Heart className={`size-5 transition ${isFav(p.id) ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
                  </button>
                </div>
                <div className="aspect-[5/3] rounded-2xl mt-3 ring-1 ring-border grid place-items-center" style={{ background: "linear-gradient(135deg, oklch(0.95 0.03 30), oklch(0.9 0.05 25))" }}>
                  <span className="font-display text-3xl text-foreground/40">{p.hero.split(" ")[0]}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.ingredients.slice(0, 3).map((ing) => (
                    <span key={ing} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px]">{ing}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">{p.size} · {p.time.join(" / ")}</span>
                  <span className="font-medium">Rs {p.price.toLocaleString("en-PK")}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RoutineColumn({ icon: Icon, title, items }: { icon: typeof Heart; title: string; items: ReturnType<typeof suggestSkincare> }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-10 rounded-xl gradient-rose grid place-items-center text-primary-foreground"><Icon className="size-5"/></div>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      <ol className="space-y-4">
        {items.map((s, i) => (
          <li key={s.product.id} className="flex gap-4">
            <div className="size-8 rounded-full bg-primary/10 text-primary text-sm font-semibold grid place-items-center shrink-0">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.product.step} · {s.product.brand}</p>
                  <p className="font-medium truncate">{s.product.name}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
                  <Sparkles className="size-3"/>{s.match}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Key: {s.product.hero} — {s.reason}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
