import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useBeautyProfile, useFavorites, useTryOnHistory, useScanHistory } from "@/lib/beauty-store";
import { recommend } from "@/lib/products";
import { monk } from "@/lib/monk";
import { exportSkinReport } from "@/lib/pdf-report";
import { exportBeautyPassport } from "@/lib/beauty-passport-pdf";
import { useState } from "react";
import { Heart, Sparkles, Droplet, Sun, CircleDot, FileDown, Sunrise, Moon, ShieldCheck, TrendingUp, BookHeart, Scan, Eye, Smile, Activity, Wand2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Your Dashboard — Lumière" }, { name: "description", content: "Your personalized AI beauty profile, routine, and product matches." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [profile] = useBeautyProfile();
  const { isFav, toggle } = useFavorites();
  const { history } = useTryOnHistory();
  const scans = useScanHistory();
  const [name, setName] = useState("");

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 grid place-items-center px-6">
          <div className="text-center max-w-md">
            <h1 className="font-display text-4xl">No beauty profile yet</h1>
            <p className="text-muted-foreground mt-3">Scan your skin to unlock your personalized dashboard.</p>
            <Link to="/scan" className="inline-flex mt-6 px-6 py-3 rounded-full gradient-rose text-primary-foreground font-medium shadow-luxe">Start skin scan</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const recs = recommend(profile).slice(0, 6);
  const monkSw = monk(profile.monkTone);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full space-y-10">
        {/* HERO */}
        <section className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
          <div className="aspect-square rounded-3xl overflow-hidden glass-card p-2">
            <img src={profile.imageDataUrl} alt="You" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your beauty profile</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${profile.source === "ai" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {profile.source === "ai" ? `AI · ${profile.confidence}% confidence` : "Offline estimate"}
              </span>
            </div>
            <h1 className="font-display text-5xl mt-2 capitalize">
              {profile.undertone} · <span className="italic">{profile.skinType}</span>
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <span className="size-10 rounded-full ring-2 ring-white shadow" style={{ background: monkSw.hex }} />
              <div>
                <p className="text-sm font-medium">{monkSw.label} · Monk Skin Tone Scale</p>
                <p className="text-xs text-muted-foreground">Best foundation family: {profile.shadeFamily || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {profile.conditions.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium capitalize">{c.replace("-", " ")}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <Stat icon={Droplet} label="Hydration" value={profile.hydration} />
              <Stat icon={CircleDot} label="Evenness" value={profile.evenness} />
              <Stat icon={Sun} label="Radiance" value={profile.radiance} />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                to="/try-on"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-rose text-primary-foreground text-sm font-semibold shadow-luxe hover:opacity-95"
              >
                <Wand2 className="size-4" /> Try On Recommended Looks
              </Link>
              <Link to="/scan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm hover:bg-card">
                Re-scan
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="px-4 py-2.5 rounded-full glass-card text-sm w-44 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => exportBeautyPassport(profile, { name, tryOn: history })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
              >
                <BookHeart className="size-4" /> Beauty Passport (Skin + Makeup)
              </button>
              <button
                onClick={() => exportSkinReport(profile)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm hover:bg-card"
              >
                <FileDown className="size-4" /> Skin only
              </button>
            </div>
          </div>
        </section>

        {/* BEAUTY IQ + FACIAL GEOMETRY */}
        {(profile.beautyIQ !== undefined || profile.faceShape) && (
          <section className="grid md:grid-cols-[260px_1fr] gap-6">
            {profile.beautyIQ !== undefined && (
              <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 gradient-rose opacity-10" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">BeautyIQ Score</p>
                  <p className="font-display text-7xl mt-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                    {profile.beautyIQ}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Composite skin + facial harmony</p>
                  {profile.symmetry !== undefined && (
                    <div className="mt-4 pt-4 border-t border-border/50 text-sm">
                      <span className="text-muted-foreground">Symmetry </span>
                      <span className="font-semibold">{profile.symmetry}/100</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(profile.faceShape || profile.eyeShape || profile.lipShape || profile.browShape) && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scan className="size-5 text-primary"/>
                  <h2 className="font-display text-2xl">Facial geometry</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <GeoCard icon={Scan} label="Face" value={profile.faceShape} />
                  <GeoCard icon={Eye} label="Eyes" value={profile.eyeShape} />
                  <GeoCard icon={Smile} label="Lips" value={profile.lipShape} />
                  <GeoCard icon={Activity} label="Brows" value={profile.browShape} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* CLINICAL SUB-SCORES */}
        {profile.clinical && (
          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="size-5 text-primary"/>
              <h2 className="font-display text-2xl">Clinical sub-scores</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Lower is better · 0 = none · 100 = severe</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {([
                ["Acne", profile.clinical.acne],
                ["Pigmentation", profile.clinical.pigmentation],
                ["Redness", profile.clinical.redness],
                ["Pores", profile.clinical.pores],
                ["Wrinkles", profile.clinical.wrinkles],
                ["Dark circles", profile.clinical.darkCircles],
              ] as const).map(([label, val]) => (
                <ClinicalBar key={label} label={label} value={val} />
              ))}
            </div>
          </section>
        )}

        {/* AI SUMMARY */}
        {profile.summary && (
          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl gradient-rose grid place-items-center text-primary-foreground shrink-0"><Sparkles className="size-4"/></div>
              <div>
                <h2 className="font-display text-2xl">AI dermatology summary</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profile.summary}</p>
              </div>
            </div>
          </section>
        )}


        {/* ROUTINES */}
        {(profile.amRoutine.length > 0 || profile.pmRoutine.length > 0) && (
          <section className="grid md:grid-cols-2 gap-6">
            <RoutineCard icon={Sunrise} title="AM routine" steps={profile.amRoutine} />
            <RoutineCard icon={Moon} title="PM routine" steps={profile.pmRoutine} />
          </section>
        )}

        {/* PROGRESS */}
        {scans.length > 1 && (
          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5 text-primary"/>
              <h2 className="font-display text-2xl">Skin journal · last {scans.length} scans</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {(["hydration", "evenness", "radiance"] as const).map((k) => {
                const data = scans.slice(0, 8).reverse();
                const max = 100;
                return (
                  <div key={k}>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p>
                    <svg viewBox="0 0 100 40" className="w-full h-16 mt-1">
                      <polyline
                        fill="none" stroke="oklch(0.55 0.11 25)" strokeWidth="2"
                        points={data.map((s, i) => `${(i / Math.max(1, data.length - 1)) * 100},${40 - (s[k] / max) * 40}`).join(" ")}
                      />
                    </svg>
                    <p className="text-sm">Now: <span className="font-semibold">{profile[k]}</span></p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECOMMENDATIONS */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl">Matched for you</h2>
              <p className="text-sm text-muted-foreground">Curated using your AI skin profile and undertone.</p>
            </div>
            <Link to="/try-on" className="text-sm text-muted-foreground hover:text-foreground">Try shades →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs.map(({ product, score, reason }) => (
              <div key={product.id} className="glass-card rounded-3xl p-5 flex gap-4 hover:-translate-y-0.5 transition">
                <div className="size-16 rounded-2xl shrink-0 ring-1 ring-border" style={{ background: product.color ?? "linear-gradient(135deg,#f3e0d3,#e3c4ad)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
                      <p className="font-medium truncate">{product.name}</p>
                    </div>
                    <button onClick={() => toggle(product.id)} aria-label="favorite">
                      <Heart className={`size-5 transition ${isFav(product.id) ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Sparkles className="size-3"/> {score}% match
                    </span>
                    <span className="text-xs text-muted-foreground">Rs {product.price.toLocaleString("en-PK")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRY-ON HISTORY */}
        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-2xl mb-4">Try-on history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing tried on yet. <Link to="/try-on" className="text-primary underline">Open try-on</Link></p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                  <span className="size-4 rounded-full ring-2 ring-white" style={{ background: h.color }} />
                  {h.shadeName}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRIVACY */}
        <section className="text-xs text-muted-foreground flex items-center gap-2 justify-center pt-4">
          <ShieldCheck className="size-3.5"/> Your selfie never leaves Lumière. Delete profile any time from your account settings.
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="size-3.5"/>{label}</div>
      <p className="font-display text-3xl mt-1">{value}<span className="text-base text-muted-foreground">/100</span></p>
      <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
        <div className="h-full gradient-rose" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RoutineCard({ icon: Icon, title, steps }: { icon: typeof Heart; title: string; steps: string[] }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-9 rounded-xl bg-accent text-accent-foreground grid place-items-center"><Icon className="size-4"/></div>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center shrink-0">{i + 1}</span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function GeoCard({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5"/>{label}
      </div>
      <p className="font-display text-xl mt-1 capitalize">{value || "—"}</p>
    </div>
  );
}

function ClinicalBar({ label, value }: { label: string; value: number }) {
  // hue: 0 (severe/red) → 140 (clear/green) inverted because lower=better
  const hue = Math.round(140 - (value / 100) * 140);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${value}%`, background: `hsl(${hue} 70% 55%)` }}
        />
      </div>
    </div>
  );
}

