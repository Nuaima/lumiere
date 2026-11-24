import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  LIPSTICK_SHADES, FOUNDATION_SHADES, BLUSH_SHADES, BRONZER_SHADES,
  EYESHADOW_SHADES, LIPGLOSS_SHADES, LIPLINER_SHADES,
  EYELINER_SHADES, MASCARA_SHADES, HIGHLIGHTER_SHADES,
  LOOKS, PRODUCTS,
  recommend, formatPKR,
  type Product, type LookPreset,
} from "@/lib/products";
import { useBeautyProfile, useTryOnHistory } from "@/lib/beauty-store";
import { Upload, History, Loader2, Sparkles, Camera, Download, Eye, EyeOff, RefreshCw, Wand2 } from "lucide-react";
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  FACE_OVAL, LEFT_EYE, RIGHT_EYE, LIPS_OUTER, LIPS_INNER,
  LEFT_CHEEK, RIGHT_CHEEK, LEFT_UPPER_LASH, RIGHT_UPPER_LASH,
  NOSE_BRIDGE, FOREHEAD_CENTER, CHIN_CENTER,
} from "@/lib/face-landmarks";

export const Route = createFileRoute("/try-on")({
  head: () => ({ meta: [
    { title: "Virtual Try-On — BeautyIQ" },
    { name: "description", content: "Photoreal try-on with MediaPipe face mesh, live camera, curated looks and one-tap glam presets." },
  ]}),
  component: TryOnPage,
});

type Shade = Product;
type Slot = "foundation" | "blush" | "bronzer" | "highlighter" | "eyeshadow" | "eyeliner" | "mascara" | "lipstick" | "lip-gloss" | "lip-liner";

function polygon(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
}
function bbox(pts: { x: number; y: number }[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
function smoothCurve(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length - 1; i++) {
    const xc = (pts[i].x + pts[i + 1].x) / 2;
    const yc = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

let imgLandmarker: Promise<FaceLandmarker> | null = null;
let videoLandmarker: Promise<FaceLandmarker> | null = null;
async function getLandmarker(mode: "IMAGE" | "VIDEO") {
  const cache = mode === "IMAGE" ? imgLandmarker : videoLandmarker;
  if (cache) return cache;
  const promise = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: mode,
      numFaces: 1,
    });
  })();
  if (mode === "IMAGE") imgLandmarker = promise; else videoLandmarker = promise;
  return promise;
}

function TryOnPage() {
  const [profile] = useBeautyProfile();
  const [mode, setMode] = useState<"photo" | "live">("photo");
  const [image, setImage] = useState<string | null>(profile?.imageDataUrl ?? null);
  const [shades, setShades] = useState<Partial<Record<Slot, Shade>>>({});
  const [intensity, setIntensity] = useState(0.6);
  const [finish, setFinish] = useState<"matte" | "satin" | "glossy">("satin");
  const [status, setStatus] = useState<"idle" | "detecting" | "ready" | "no-face">("idle");
  const [showBefore, setShowBefore] = useState(false);
  const [activeLook, setActiveLook] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<FaceLandmarkerResult | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { history, add } = useTryOnHistory();
  const recommended = useMemo(() => {
    if (!profile) return [];
    return recommend(profile).filter((r) => r.product.color).slice(0, 10);
  }, [profile]);

  // --- IMAGE MODE: detect on load + shade change re-draw -------------------
  useEffect(() => {
    if (mode !== "photo" || !image) return;
    let cancelled = false;
    setStatus("detecting");
    const el = imgRef.current;
    if (!el) return;
    (async () => {
      try {
        const lm = await getLandmarker("IMAGE");
        if (!el.complete) await new Promise((res) => (el.onload = () => res(null)));
        if (cancelled) return;
        const res = lm.detect(el);
        resultRef.current = res;
        setStatus(res.faceLandmarks?.length ? "ready" : "no-face");
        draw();
      } catch (e) { console.error(e); setStatus("no-face"); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, mode]);

  useEffect(() => { if (mode === "photo") draw(); /* eslint-disable-next-line */ }, [shades, intensity, finish, showBefore, status]);

  // --- LIVE MODE: webcam + per-frame detection -----------------------------
  const stopLive = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (mode !== "live") { stopLive(); return; }
    let cancelled = false;
    setStatus("detecting");
    (async () => {
      try {
        const lm = await getLandmarker("VIDEO");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280, height: 720 } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setStatus("ready");
        const loop = () => {
          if (cancelled || !videoRef.current) return;
          const now = performance.now();
          try {
            const res = lm.detectForVideo(videoRef.current, now);
            resultRef.current = res;
            drawLive();
          } catch {}
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        console.error(e);
        setStatus("no-face");
      }
    })();
    return () => { cancelled = true; stopLive(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // --- DRAW ----------------------------------------------------------------
  const paintOverlays = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const lms = resultRef.current?.faceLandmarks?.[0];
    if (!lms || showBefore) return;
    const pts = (idx: number[]) => idx.map((i) => ({ x: lms[i].x * W, y: lms[i].y * H }));
    const pt = (i: number) => ({ x: lms[i].x * W, y: lms[i].y * H });
    const finishBoost = finish === "glossy" ? 1.25 : finish === "matte" ? 0.75 : 1;

    const { foundation, blush, bronzer, highlighter, eyeshadow, eyeliner, mascara, lipstick: lip, "lip-gloss": lipGloss, "lip-liner": lipLiner } = shades;

    // FOUNDATION
    if (foundation?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      o.fillStyle = foundation.color; polygon(o, pts(FACE_OVAL)); o.fill();
      o.globalCompositeOperation = "destination-out";
      polygon(o, pts(LEFT_EYE)); o.fill();
      polygon(o, pts(RIGHT_EYE)); o.fill();
      polygon(o, pts(LIPS_OUTER)); o.fill();
      ctx.save();
      ctx.globalAlpha = intensity * 0.65;
      ctx.globalCompositeOperation = finish === "matte" ? "multiply" : "soft-light";
      ctx.filter = "blur(6px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // BRONZER
    if (bronzer?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      o.fillStyle = bronzer.color;
      polygon(o, pts(LEFT_CHEEK)); o.fill();
      polygon(o, pts(RIGHT_CHEEK)); o.fill();
      ctx.save();
      ctx.globalAlpha = intensity * 0.55;
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = "blur(14px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // BLUSH
    if (blush?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const drawCheek = (poly: number[]) => {
        const b = bbox(pts(poly));
        const g = o.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, Math.max(b.w, b.h) * 0.95);
        g.addColorStop(0, blush.color!); g.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = g; o.fillRect(b.cx - b.w, b.cy - b.h, b.w * 2, b.h * 2);
      };
      drawCheek(LEFT_CHEEK); drawCheek(RIGHT_CHEEK);
      ctx.save();
      ctx.globalAlpha = intensity * 0.7;
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = "blur(10px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // HIGHLIGHTER — cheekbone tops + nose bridge + brow bone + cupids bow
    if (highlighter?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const dot = (cx: number, cy: number, r: number) => {
        const g = o.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, highlighter.color!); g.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = g; o.fillRect(cx - r, cy - r, r * 2, r * 2);
      };
      const lCh = bbox(pts(LEFT_CHEEK)); const rCh = bbox(pts(RIGHT_CHEEK));
      const nose = bbox(pts(NOSE_BRIDGE));
      const fore = pt(FOREHEAD_CENTER); const chin = pt(CHIN_CENTER);
      dot(lCh.cx, lCh.y, lCh.w * 0.55);
      dot(rCh.cx, rCh.y, rCh.w * 0.55);
      dot(nose.cx, nose.cy, nose.w * 1.4);
      dot(fore.x, fore.y + nose.h * 0.3, nose.w * 1.3);
      dot(chin.x, chin.y - nose.h * 0.2, nose.w * 0.9);
      ctx.save();
      ctx.globalAlpha = intensity * 0.65 * finishBoost;
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(8px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // EYESHADOW
    if (eyeshadow?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const drawLid = (poly: number[]) => {
        const b = bbox(pts(poly));
        const cy = b.y - b.h * 0.35;
        const rx = b.w * 0.75, ry = b.h * 1.2;
        const g = o.createRadialGradient(b.cx, cy, 0, b.cx, cy, Math.max(rx, ry));
        g.addColorStop(0, eyeshadow.color!); g.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = g;
        o.save(); o.translate(b.cx, cy); o.scale(rx / ry, 1); o.translate(-b.cx, -cy);
        o.fillRect(b.cx - rx, cy - ry, rx * 2, ry * 2); o.restore();
      };
      drawLid(LEFT_EYE); drawLid(RIGHT_EYE);
      o.globalCompositeOperation = "destination-out";
      polygon(o, pts(LEFT_EYE)); o.fill();
      polygon(o, pts(RIGHT_EYE)); o.fill();
      ctx.save();
      ctx.globalAlpha = intensity * 0.85;
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = "blur(6px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // EYELINER — sharp wing-able line on upper lash
    if (eyeliner?.color) {
      const drawLash = (poly: number[], mirror: boolean) => {
        const p = pts(poly);
        ctx.save();
        ctx.strokeStyle = eyeliner.color!;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(2, W * 0.0045);
        ctx.globalAlpha = Math.min(1, intensity + 0.2);
        smoothCurve(ctx, p);
        ctx.stroke();
        // tiny wing extension
        const a = p[p.length - 2], b = p[p.length - 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const wingLen = W * 0.025;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + ux * wingLen, b.y + uy * wingLen - wingLen * 0.4);
        ctx.stroke();
        ctx.restore();
        void mirror;
      };
      drawLash(LEFT_UPPER_LASH, false);
      drawLash(RIGHT_UPPER_LASH, true);
    }

    // MASCARA — soft thick darken on upper lash
    if (mascara?.color) {
      const drawLashes = (poly: number[]) => {
        const p = pts(poly);
        ctx.save();
        ctx.strokeStyle = mascara.color!;
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(3, W * 0.009);
        ctx.globalAlpha = intensity * 0.85;
        ctx.filter = "blur(1.2px)";
        smoothCurve(ctx, p);
        ctx.stroke();
        ctx.restore();
      };
      drawLashes(LEFT_UPPER_LASH);
      drawLashes(RIGHT_UPPER_LASH);
    }

    // LIP LINER
    if (lipLiner?.color) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, intensity + 0.1);
      ctx.strokeStyle = lipLiner.color;
      ctx.lineWidth = Math.max(2, W * 0.004);
      ctx.filter = "blur(0.6px)";
      polygon(ctx, pts(LIPS_OUTER));
      ctx.stroke();
      ctx.restore();
    }

    // LIPSTICK
    if (lip?.color) {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      o.fillStyle = lip.color;
      polygon(o, pts(LIPS_OUTER)); o.fill("evenodd");
      o.globalCompositeOperation = "destination-out";
      polygon(o, pts(LIPS_INNER)); o.fill();
      ctx.save();
      ctx.globalAlpha = Math.min(1, intensity + 0.2);
      ctx.globalCompositeOperation = finish === "matte" ? "multiply" : "multiply";
      ctx.filter = "blur(1.5px)";
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }

    // LIP GLOSS
    if (lipGloss?.color || finish === "glossy") {
      const lipB = bbox(pts(LIPS_OUTER));
      if (lipGloss?.color) {
        const off = document.createElement("canvas"); off.width = W; off.height = H;
        const o = off.getContext("2d")!;
        o.fillStyle = lipGloss.color;
        polygon(o, pts(LIPS_OUTER)); o.fill();
        o.globalCompositeOperation = "destination-out";
        polygon(o, pts(LIPS_INNER)); o.fill();
        ctx.save();
        ctx.globalAlpha = intensity * 0.55;
        ctx.globalCompositeOperation = "overlay";
        ctx.filter = "blur(2px)";
        ctx.drawImage(off, 0, 0);
        ctx.restore();
      }
      // shine
      ctx.save();
      ctx.globalAlpha = (lipGloss ? intensity * 0.55 : 0) + (finish === "glossy" ? 0.35 : 0);
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(4px)";
      const sg = ctx.createRadialGradient(lipB.cx, lipB.cy + lipB.h * 0.18, 0, lipB.cx, lipB.cy + lipB.h * 0.18, lipB.w * 0.32);
      sg.addColorStop(0, "rgba(255,255,255,0.95)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(lipB.x, lipB.y, lipB.w, lipB.h * 1.2);
      ctx.restore();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current; const img = imgRef.current;
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    paintOverlays(ctx, canvas.width, canvas.height);
  };
  const drawLive = () => {
    const canvas = canvasRef.current; const v = videoRef.current;
    if (!canvas || !v || !v.videoWidth) return;
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    // mirror
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    // landmarks are in video coords; mirror them too
    ctx.save();
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    paintOverlays(ctx, canvas.width, canvas.height);
    ctx.restore();
  };

  // --- Actions -------------------------------------------------------------
  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => { setImage(r.result as string); setShades({}); setActiveLook(null); };
    r.readAsDataURL(f);
  };

  const apply = (slot: Slot, s: Shade) => {
    setShades((prev) => ({ ...prev, [slot]: s }));
    setActiveLook(null);
    if (slot === "foundation" || slot === "lipstick") add({ type: slot, shadeName: s.name, color: s.color! });
  };

  const applyLook = (look: LookPreset) => {
    const next: Partial<Record<Slot, Shade>> = {};
    for (const [slot, id] of Object.entries(look.shades)) {
      const product = [...PRODUCTS, ...HIGHLIGHTER_SHADES].find((p) => p.id === id);
      if (product) next[slot as Slot] = product;
    }
    setShades(next);
    setActiveLook(look.id);
  };

  const clearAll = () => { setShades({}); setActiveLook(null); };

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `beautyiq-tryon-${Date.now()}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  };

  const captureFromLive = () => {
    const c = canvasRef.current; if (!c) return;
    const data = c.toDataURL("image/jpeg", 0.92);
    setImage(data); setMode("photo");
  };

  const slotShades: { slot: Slot; title: string; list: Shade[] }[] = [
    { slot: "foundation", title: "Face · Foundation", list: FOUNDATION_SHADES },
    { slot: "blush", title: "Face · Blush", list: BLUSH_SHADES },
    { slot: "bronzer", title: "Face · Bronzer", list: BRONZER_SHADES },
    { slot: "highlighter", title: "Face · Highlighter", list: HIGHLIGHTER_SHADES },
    { slot: "eyeshadow", title: "Eyes · Eyeshadow", list: EYESHADOW_SHADES },
    { slot: "eyeliner", title: "Eyes · Eyeliner & Wing", list: EYELINER_SHADES },
    { slot: "mascara", title: "Eyes · Mascara", list: MASCARA_SHADES },
    { slot: "lipstick", title: "Lips · Lipstick", list: LIPSTICK_SHADES },
    { slot: "lip-gloss", title: "Lips · Gloss", list: LIPGLOSS_SHADES },
    { slot: "lip-liner", title: "Lips · Liner", list: LIPLINER_SHADES },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">MediaPipe Face Mesh · 468 landmarks · Live tracking</p>
            <h1 className="font-display text-5xl mt-2">Virtual Try-On</h1>
            <p className="text-muted-foreground mt-2">Lock makeup to your face — lips, eyes, cheeks & nose tracked precisely.</p>
          </div>
          <div className="inline-flex p-1 rounded-full border border-border bg-card/50">
            <button onClick={() => setMode("photo")} className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-2 ${mode === "photo" ? "gradient-rose text-primary-foreground" : "text-muted-foreground"}`}><Upload className="size-3.5"/>Photo</button>
            <button onClick={() => setMode("live")} className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-2 ${mode === "live" ? "gradient-rose text-primary-foreground" : "text-muted-foreground"}`}><Camera className="size-3.5"/>Live</button>
          </div>
        </div>

        {/* LOOK PRESETS */}
        <section className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-1"><Wand2 className="size-4 text-primary"/><h2 className="font-display text-2xl">One-tap Looks</h2></div>
          <p className="text-sm text-muted-foreground mb-4">Curated combinations applied in one tap. Then tweak shades to taste.</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {LOOKS.map((look) => (
              <button key={look.id} onClick={() => applyLook(look)}
                className={`flex-shrink-0 text-left rounded-2xl border p-4 min-w-[200px] transition ${activeLook === look.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className="flex gap-1 mb-3">
                  {Object.values(look.shades).slice(0, 5).map((id, i) => {
                    const p = [...PRODUCTS, ...HIGHLIGHTER_SHADES].find((x) => x.id === id);
                    return <span key={i} className="size-5 rounded-full ring-2 ring-white shadow" style={{ background: p?.color || "#ddd" }} />;
                  })}
                </div>
                <p className="font-medium text-sm">{look.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{look.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* RECOMMENDED */}
        {recommended.length > 0 && (
          <section className="glass-card rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-1"><Sparkles className="size-4 text-primary"/><h2 className="font-display text-2xl">Recommended for you</h2></div>
            <p className="text-sm text-muted-foreground mb-4">Top picks from your {profile?.undertone} undertone · {profile?.skinType} skin scan. Tap to try.</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommended.map(({ product, score }) => (
                <button key={product.id} onClick={() => apply(product.category as Slot, product)}
                  className="group flex-shrink-0 w-44 text-left rounded-2xl border border-border hover:border-primary/50 p-3 transition">
                  <div className="flex items-center gap-2">
                    <span className="size-10 rounded-full ring-2 ring-white shadow" style={{ background: product.color }} />
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{score}% match</span>
                  </div>
                  <p className="text-sm font-medium mt-2 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{product.brand} · {formatPKR(product.price)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{product.category.replace("-", " ")}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
          {/* CANVAS */}
          <div className="glass-card rounded-3xl p-6">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              {mode === "photo" && image && (
                <>
                  <img ref={imgRef} src={image} alt="selfie" crossOrigin="anonymous" className="hidden" />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
                </>
              )}
              {mode === "live" && (
                <>
                  <video ref={videoRef} playsInline muted className="hidden" />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
                </>
              )}
              {mode === "photo" && !image && (
                <div className="absolute inset-0 grid place-items-center text-center p-6">
                  <div>
                    <p className="text-muted-foreground text-sm mb-3">Upload a photo or switch to Live</p>
                    <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-rose text-primary-foreground font-medium">
                      <Upload className="size-4"/> Upload photo
                    </button>
                  </div>
                </div>
              )}
              {status === "detecting" && (
                <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm pointer-events-none">
                  <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin"/>{mode === "live" ? "Starting camera…" : "Mapping face mesh…"}</div>
                </div>
              )}
              {status === "no-face" && (
                <div className="absolute inset-0 grid place-items-center bg-background/60 text-center p-6">
                  <p className="text-sm text-muted-foreground">{mode === "live" ? "Camera blocked or unavailable. Allow access and refresh." : "We couldn't detect a face. Try a clearer, well-lit, front-facing photo."}</p>
                </div>
              )}
              {/* Hold-to-compare button */}
              {(image || mode === "live") && status === "ready" && (
                <button
                  onMouseDown={() => setShowBefore(true)} onMouseUp={() => setShowBefore(false)} onMouseLeave={() => setShowBefore(false)}
                  onTouchStart={() => setShowBefore(true)} onTouchEnd={() => setShowBefore(false)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-xs font-medium border border-border">
                  {showBefore ? <EyeOff className="size-3.5"/> : <Eye className="size-3.5"/>}
                  Hold to compare
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

            {/* CONTROLS */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary"/>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Intensity</label>
                <input type="range" min={0.15} max={0.95} step={0.05} value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="flex-1 accent-primary"/>
                <span className="text-xs tabular-nums w-10 text-right">{Math.round(intensity * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider mr-1">Finish</label>
                {(["matte","satin","glossy"] as const).map((f) => (
                  <button key={f} onClick={() => setFinish(f)} className={`px-3 py-1.5 rounded-full text-xs capitalize border ${finish === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{f}</button>
                ))}
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-sm pt-1">
                <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><RefreshCw className="size-3.5"/>Clear all</button>
                <div className="flex gap-3">
                  {mode === "live" && status === "ready" && (
                    <button onClick={captureFromLive} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><Camera className="size-3.5"/>Capture</button>
                  )}
                  {mode === "photo" && (
                    <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground">Change photo</button>
                  )}
                  <button onClick={download} className="inline-flex items-center gap-1.5 text-primary hover:opacity-80 font-medium"><Download className="size-3.5"/>Download</button>
                </div>
              </div>
            </div>
          </div>

          {/* SHADE LIBRARY */}
          <div className="space-y-6">
            {slotShades.map(({ slot, title, list }) => (
              <ShadeRow key={slot} title={title} shades={list} active={shades[slot]?.id ?? null} onPick={(s) => apply(slot, s)} />
            ))}

            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3"><History className="size-4 text-muted-foreground"/><h3 className="font-display text-xl">Recent try-ons</h3></div>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Try a shade to start building your history.</p>
              ) : (
                <ul className="space-y-2">
                  {history.slice(0, 5).map((h) => (
                    <li key={h.id} className="flex items-center gap-3 text-sm">
                      <span className="size-6 rounded-full ring-2 ring-white shadow" style={{ background: h.color }} />
                      <span className="flex-1">{h.shadeName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{h.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link to="/dashboard" className="block text-center text-sm text-muted-foreground hover:text-foreground">→ Go to your dashboard</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ShadeRow({ title, shades, active, onPick }: { title: string; shades: Shade[]; active: string | null; onPick: (s: Shade) => void }) {
  if (!shades.length) return null;
  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="font-display text-xl mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {shades.map((s) => (
          <button key={s.id} onClick={() => onPick(s)}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition text-left ${active === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
            <span className="size-9 rounded-full ring-2 ring-white shadow-soft shrink-0" style={{ background: s.color || "#e5e5e5" }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.brand} · {formatPKR(s.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
