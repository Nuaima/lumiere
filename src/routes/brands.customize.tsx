import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useBrandTheme, DEFAULT_THEME } from "@/lib/brand-theme";
import { Upload, RotateCcw, Check, ArrowRight, Palette } from "lucide-react";

export const Route = createFileRoute("/brands/customize")({
  head: () => ({ meta: [{ title: "White-label Customizer — Lumière" }, { name: "description", content: "Brand-theme the Lumière console for your beauty brand." }] }),
  component: Customize,
});

function Customize() {
  const [theme, save] = useBrandTheme();
  const [draft, setDraft] = useState(theme);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogo = (f: File) => {
    const r = new FileReader();
    r.onload = () => setDraft({ ...draft, logoDataUrl: r.result as string });
    r.readAsDataURL(f);
  };

  const apply = () => { save(draft); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const reset = () => { setDraft(DEFAULT_THEME); save(DEFAULT_THEME); };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-medium"><Palette className="size-3.5 text-primary"/> Enterprise</span>
          <h1 className="font-display text-5xl mt-3">White-label your console</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Upload your logo and brand colors. Your team and embedded widgets re-skin instantly — no engineering required.</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Editor */}
          <div className="glass-card rounded-3xl p-6 space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Brand name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-border bg-card"
                placeholder="e.g. Dove, L'Oréal Paris"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Logo</label>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])} />
              <div className="mt-2 flex items-center gap-3">
                <div className="size-16 rounded-2xl bg-muted grid place-items-center overflow-hidden">
                  {draft.logoDataUrl ? <img src={draft.logoDataUrl} alt="Logo" className="w-full h-full object-contain"/> : <span className="text-xs text-muted-foreground">No logo</span>}
                </div>
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm hover:bg-card">
                  <Upload className="size-4"/> Upload
                </button>
                {draft.logoDataUrl && (
                  <button onClick={() => setDraft({ ...draft, logoDataUrl: null })} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Primary" value={draft.primary} onChange={(v) => setDraft({ ...draft, primary: v })} />
              <ColorField label="Accent" value={draft.accent} onChange={(v) => setDraft({ ...draft, accent: v })} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={apply} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
                {saved ? <><Check className="size-4"/> Saved</> : <>Apply theme <ArrowRight className="size-4"/></>}
              </button>
              <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm hover:bg-card">
                <RotateCcw className="size-4"/> Reset
              </button>
              <Link to="/brands" className="ml-auto text-sm text-muted-foreground hover:text-foreground self-center">View console →</Link>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl p-6 border border-border" style={{ background: `linear-gradient(135deg, ${draft.accent}55, transparent)` }}>
            <div className="rounded-2xl bg-card p-6 shadow-luxe">
              <div className="flex items-center gap-3">
                {draft.logoDataUrl ? (
                  <img src={draft.logoDataUrl} alt="" className="h-10 object-contain"/>
                ) : (
                  <div className="size-10 rounded-xl grid place-items-center text-white font-display text-xl" style={{ background: draft.primary }}>
                    {draft.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Powered by Lumière</p>
                  <p className="font-display text-2xl">{draft.name} · Console</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {["48,213", "126K", "9.7%"].map((v, i) => (
                  <div key={i} className="rounded-xl p-3 text-white" style={{ background: i === 1 ? draft.primary : `${draft.primary}cc` }}>
                    <p className="text-xs opacity-80">{["Users","Try-ons","ATC"][i]}</p>
                    <p className="font-display text-xl mt-1">{v}</p>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-2.5 rounded-full text-white font-medium" style={{ background: draft.primary }}>
                Find my shade
              </button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-2 px-2 py-1.5 rounded-xl border border-border bg-card">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-9 rounded-lg overflow-hidden cursor-pointer bg-transparent"/>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-sm outline-none font-mono"/>
      </div>
    </div>
  );
}
