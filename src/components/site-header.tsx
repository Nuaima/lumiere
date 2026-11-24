import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const nav = [
  { to: "/scan", label: "Skin Scan" },
  { to: "/skincare", label: "Skincare" },
  { to: "/try-on", label: "Try On" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/brands", label: "For Brands" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="size-8 rounded-full gradient-rose grid place-items-center text-primary-foreground shadow-luxe">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-2xl tracking-tight">Lumière</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/scan"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-rose text-primary-foreground text-sm font-medium shadow-luxe hover:opacity-90 transition"
        >
          Start scan
        </Link>
      </div>
    </header>
  );
}
