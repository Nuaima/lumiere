import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useBrandTheme } from "@/lib/brand-theme";
import { MONK_SCALE } from "@/lib/monk";
import { Users, TrendingUp, Sparkles, Code2, Copy, Palette, Globe2 } from "lucide-react";

export const Route = createFileRoute("/brands")({
  head: () => ({ meta: [{ title: "For Beauty Brands — Lumière" }, { name: "description", content: "Analytics, insights and integrations for beauty brands." }] }),
  component: Brands,
});

// Monk-scale distribution (inclusive 10-tone)
const monkDist = [6, 9, 11, 13, 15, 14, 12, 9, 7, 4];

const topShades = [
  { name: "Rose Petal", color: "#c2455a", tries: 4820 },
  { name: "Terracotta Kiss", color: "#b85440", tries: 3914 },
  { name: "Nude Cashmere", color: "#a8665a", tries: 3102 },
  { name: "Berry Noir", color: "#7a2a3f", tries: 2287 },
];

function Brands() {
  const [theme] = useBrandTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full space-y-10">
        {/* Branded header */}
        <header className="rounded-3xl p-6 md:p-8 flex flex-wrap items-end justify-between gap-4"
                style={{ background: `linear-gradient(135deg, ${theme.accent}66, transparent 70%)` }}>
          <div className="flex items-center gap-4">
            {theme.logoDataUrl ? (
              <img src={theme.logoDataUrl} alt={theme.name} className="h-14 object-contain"/>
            ) : (
              <div className="size-14 rounded-2xl grid place-items-center text-white font-display text-2xl shadow-luxe" style={{ background: theme.primary }}>
                {theme.name.charAt(0)}
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-medium"><Sparkles className="size-3.5" style={{ color: theme.primary }}/> Brand console</span>
              <h1 className="font-display text-5xl mt-2">{theme.name} · Overview</h1>
              <p className="text-muted-foreground mt-1">Live audience and engagement signals from your embedded try-on.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/brands/customize" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm hover:bg-card">
              <Palette className="size-4"/> White-label
            </Link>
            <select className="px-4 py-2 rounded-full glass-card text-sm">
              <option>Last 30 days</option><option>Last 7 days</option><option>This quarter</option>
            </select>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Users} label="Users analyzed" value="48,213" delta="+12.4%" color={theme.primary}/>
          <Kpi icon={Sparkles} label="Try-ons" value="126,884" delta="+22.1%" color={theme.primary}/>
          <Kpi icon={TrendingUp} label="Add-to-cart rate" value="9.7%" delta="+1.8 pts" color={theme.primary}/>
          <Kpi icon={Globe2} label="Inclusivity index" value="92/100" delta="10-tone coverage" color={theme.primary}/>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-display text-2xl mb-1">Monk Skin Tone distribution</h2>
            <p className="text-sm text-muted-foreground mb-5">Across all analyzed users · inclusive 10-tone scale</p>
            <div className="space-y-2.5">
              {MONK_SCALE.map((m, i) => {
                const pct = monkDist[i];
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="size-5 rounded-full ring-1 ring-border" style={{ background: m.hex }}/>
                    <span className="text-xs w-14 text-muted-foreground">{m.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct * 5}%`, background: m.hex }} />
                    </div>
                    <span className="text-xs w-10 text-right text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-display text-2xl mb-1">Top lipstick shades tried</h2>
            <p className="text-sm text-muted-foreground mb-5">Last 30 days</p>
            <ul className="space-y-3">
              {topShades.map((s, i) => (
                <li key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i+1}</span>
                  <span className="size-8 rounded-full ring-2 ring-white shadow" style={{ background: s.color }} />
                  <span className="flex-1 text-sm">{s.name}</span>
                  <span className="text-sm font-medium">{s.tries.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <Insight title="Dominant undertone" body="Warm undertones lead at 47% — lean into terracotta, peach, and gold-leaning shades for Q4." color={theme.primary}/>
          <Insight title="Inclusivity gap" body="Monk 8–10 traffic up 31% MoM, but only 12% of catalog serves these tones. Opportunity score: 87/100." color={theme.primary}/>
          <Insight title="Engagement spike" body="Evening sessions (7–10pm) drive 64% of try-ons. Schedule promos accordingly." color={theme.primary}/>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Integration title="Embed Try-On Widget" lang="html" code={`<script src="https://lumiere.ai/widget.js" data-brand="${theme.name.toLowerCase().replace(/\s+/g, "-")}"></script>`} />
          <Integration title="API Access — Skin Analysis" lang="bash" code={`curl -X POST https://api.lumiere.ai/v1/analyze \\\n  -H "Authorization: Bearer YOUR_KEY" \\\n  -F "image=@selfie.jpg"`} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, color }: { icon: typeof Users; label: string; value: string; delta: string; color: string }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex justify-between items-start">
        <div className="size-9 rounded-xl grid place-items-center text-white" style={{ background: color }}><Icon className="size-4"/></div>
        <span className="text-xs text-emerald-700 font-medium">{delta}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-4">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

function Insight({ title, body, color }: { title: string; body: string; color: string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="size-9 rounded-xl grid place-items-center mb-3 text-white" style={{ background: color }}><Sparkles className="size-4"/></div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{body}</p>
    </div>
  );
}

function Integration({ title, lang, code }: { title: string; lang: string; code: string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl flex items-center gap-2"><Code2 className="size-4"/>{title}</h3>
        <button onClick={() => navigator.clipboard.writeText(code)} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Copy className="size-3"/> Copy</button>
      </div>
      <pre className="bg-foreground text-background rounded-2xl p-4 text-xs overflow-x-auto"><code>{code}</code></pre>
      <p className="text-xs text-muted-foreground mt-3">{lang === "html" ? "Drop into your storefront — works with Shopify, WooCommerce, custom." : "Authenticate with your brand API key. Returns JSON beauty profile."}</p>
    </div>
  );
}
