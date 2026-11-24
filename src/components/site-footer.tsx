export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-display text-lg text-foreground">Lumière</p>
        <p>© {new Date().getFullYear()} Lumière Beauty Intelligence. Crafted with care.</p>
      </div>
    </footer>
  );
}
