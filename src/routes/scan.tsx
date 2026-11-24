import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { analyzeImage, useBeautyProfile } from "@/lib/beauty-store";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Skin Scan — Lumière" }, { name: "description", content: "AI-powered facial and skin analysis from your selfie." }] }),
  component: ScanPage,
});

function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, setProfile] = useBeautyProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const nav = useNavigate();

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setImage(null);
      setStream(s);
    } catch { alert("Camera unavailable. Please upload a photo instead."); }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  const capture = () => {
    if (!videoRef.current) return;
    const c = document.createElement("canvas");
    c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight;
    c.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    setImage(c.toDataURL("image/jpeg", 0.9));
    stream?.getTracks().forEach((t) => t.stop()); setStream(null);
  };

  const analyze = async () => {
    if (!image) return;
    setBusy(true);
    const p = await analyzeImage(image);
    setProfile(p);
    setBusy(false);
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-medium"><Sparkles className="size-3.5 text-primary"/> Step 1 of 3</span>
          <h1 className="font-display text-5xl mt-4">AI Skin & Face Scan</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Use your camera or upload a clear, front-facing selfie in natural light for the most accurate analysis.</p>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden grid place-items-center relative">
              {image ? (
                <img src={image} alt="Selfie preview" className="w-full h-full object-cover" />
              ) : stream ? (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              ) : (
                <div className="text-center p-6">
                  <div className="size-16 mx-auto rounded-full gradient-rose grid place-items-center text-primary-foreground mb-3">
                    <Camera className="size-7" />
                  </div>
                  <p className="text-sm text-muted-foreground">Your photo will appear here</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition">
                <Upload className="size-4" /> Upload a selfie
              </button>
              {stream ? (
                <button onClick={capture} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full glass-card font-medium hover:bg-card transition">
                  <Camera className="size-4" /> Capture photo
                </button>
              ) : (
                <button onClick={startCam} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full glass-card font-medium hover:bg-card transition">
                  <Camera className="size-4" /> Use camera
                </button>
              )}
              <button
                onClick={analyze}
                disabled={!image || busy}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-rose text-primary-foreground font-medium shadow-luxe disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
              >
                {busy ? <><Loader2 className="size-4 animate-spin"/> AI analyzing your skin…</> : <><Sparkles className="size-4"/> Analyze my skin</>}
              </button>
              {image && !busy && (
                <button onClick={() => setImage(null)} className="w-full text-xs text-muted-foreground hover:text-foreground py-2">Choose a different photo</button>
              )}

              <ul className="text-xs text-muted-foreground pt-4 space-y-1.5">
                <li>• Bright, natural light works best</li>
                <li>• Face the camera, no filters</li>
                <li>• Remove glasses if possible</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
