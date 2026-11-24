import { useEffect, useState } from "react";
import { CONSENT_KEY } from "@/lib/beauty-store";
import { ShieldCheck, X } from "lucide-react";

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(CONSENT_KEY)) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ at: Date.now(), v: 1 }));
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:left-auto md:max-w-md z-50 glass-card rounded-2xl p-4 shadow-luxe">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl gradient-rose grid place-items-center text-primary-foreground shrink-0">
          <ShieldCheck className="size-4" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-medium">Your privacy comes first</p>
          <p className="text-muted-foreground text-xs mt-1">
            Selfies are analyzed for cosmetic guidance only. Images are processed transiently — we do not sell or share your biometric data. GDPR & CCPA compliant.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={accept} className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90">
              Accept & continue
            </button>
            <a href="#" className="px-4 py-1.5 rounded-full glass-card text-xs hover:bg-card">Learn more</a>
          </div>
        </div>
        <button onClick={accept} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
