import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Sparkles, Scan, Palette, BarChart3, ArrowRight, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumière — AI Beauty Intelligence Platform" },
      { name: "description", content: "Analyze your skin from a selfie, try makeup virtually, and discover products made for you." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> Powered by AI Beauty Intelligence
              </span>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
                Your skin, <span className="text-gradient-rose italic">decoded</span>.
                <br /> Your beauty, personalized.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Take a selfie. Discover your tone, undertone and skin profile in seconds. Try shades
                virtually and meet products chosen just for you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/scan" className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-rose text-primary-foreground font-medium shadow-luxe hover:opacity-90 transition">
                  Analyze my skin <ArrowRight className="size-4" />
                </Link>
                <Link to="/try-on" className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card font-medium hover:bg-card transition">
                  Try makeup virtually
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div><span className="font-display text-2xl text-foreground">120K+</span><br/>Beauty profiles</div>
                <div className="h-10 w-px bg-border" />
                <div><span className="font-display text-2xl text-foreground">98%</span><br/>Match accuracy</div>
                <div className="h-10 w-px bg-border" />
                <div><span className="font-display text-2xl text-foreground">40+</span><br/>Brand partners</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 gradient-rose opacity-20 blur-3xl rounded-full" />
              <div className="relative glass-card rounded-3xl p-6 space-y-4">
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-blush via-nude to-accent relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent_55%)]" />
                  <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Beauty Profile</p>
                    <p className="font-display text-2xl mt-1">Warm · Medium · Combination</p>
                    <div className="flex gap-2 mt-3">
                      {["#c2455a","#b85440","#a8665a","#d77e6e"].map((c) => (
                        <span key={c} className="size-7 rounded-full ring-2 ring-white shadow" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12">A complete beauty studio in your browser</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Scan, title: "AI Skin Scan", body: "Tone, undertone, skin type and condition — analyzed from a single selfie." },
              { icon: Palette, title: "Virtual Try-On", body: "Swatch lipsticks and foundations in real time on your own photo." },
              { icon: Heart, title: "Personal Picks", body: "Rule-based recommendations matched to your unique beauty profile." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-3xl p-7 hover:-translate-y-1 transition-transform">
                <div className="size-11 rounded-2xl gradient-rose grid place-items-center text-primary-foreground mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-2xl mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="glass-card rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 text-xs font-medium"><BarChart3 className="size-3.5"/> For beauty brands</span>
              <h2 className="font-display text-4xl mt-4">Understand the faces of your audience.</h2>
              <p className="text-muted-foreground mt-3">Live analytics on skin tones, undertones, top-tried shades, and category performance — embeddable in your storefront.</p>
            </div>
            <Link to="/brands" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition">
              Explore brand dashboard <ArrowRight className="size-4"/>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
