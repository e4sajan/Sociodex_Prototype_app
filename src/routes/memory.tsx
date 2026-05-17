import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { OCCASIONS, THEMES } from "@/lib/data";
import { useStore, type MemoryData } from "@/lib/store";
import { Check, Plus, Trash2, Upload, Mic, X, Image as ImageIcon, Video, Copy, Download, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Creator — Nandi Invites" },
      { name: "description", content: "Attach a personal memory page — wishes, photos, voice notes and videos — to your gift." },
    ],
  }),
  component: MemoryCreator,
});

const STEPS = ["Basics", "Wishes", "Photos", "Audio & Video"] as const;

function MemoryCreator() {
  const setMemory = useStore((s) => s.setMemory);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [themeId, setThemeId] = useState(THEMES[0].id);

  const [wishes, setWishes] = useState<string[]>([""]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [audios, setAudios] = useState<{ id: string; name: string; url: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const [created, setCreated] = useState<MemoryData | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  const photoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const canNext = () => {
    if (step === 0) return recipient.trim() && from.trim() && date;
    if (step === 1) return wishes.some((w) => w.trim());
    return true;
  };

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const r = new FileReader();
      r.onload = () => setPhotos((p) => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
  };

  const handleAudio = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      setAudios((a) => [...a, { id: crypto.randomUUID(), name: f.name, url: URL.createObjectURL(f) }]);
    });
  };

  const handleVideo = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 3 - videos.length).forEach((f) => {
      setVideos((v) => [...v, { id: crypto.randomUUID(), name: f.name, url: URL.createObjectURL(f) }]);
    });
  };

  const simulateRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setAudios((a) => [...a, { id: crypto.randomUUID(), name: `Voice note ${a.length + 1}.webm`, url: "" }]);
    }, 2000);
  };

  const handleCreate = async () => {
    const slug = (recipient.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "memory") + "-" + Math.random().toString(36).slice(2, 6);
    const data: MemoryData = {
      slug, occasion, recipient: recipient.trim(), from: from.trim(), date, themeId,
      wishes: wishes.map((w) => w.trim()).filter(Boolean),
      photos, audios, videos,
    };
    setMemory(data);
    setCreated(data);
    const url = typeof window !== "undefined" ? `${window.location.origin}/m/${slug}` : `/m/${slug}`;
    setQrUrl(await QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#2C5F2E", light: "#FFFDF9" } }));
    setShowQR(true);
  };

  if (created) return <CreatedPreview data={created} qrUrl={qrUrl} showQR={showQR} setShowQR={setShowQR} onNext={() => navigate({ to: "/guests" })} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl">Create a memory page</h1>
        <p className="mt-2 text-muted-foreground">A digital card that lives on long after the gift is unwrapped.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              step === i ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            }`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/30 text-[11px] font-semibold">
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <div className="card-soft p-6 sm:p-8 fade-up">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Occasion">
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input">
                {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </Field>
            <Field label="Recipient name">
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Meera Iyer" className="input" />
            </Field>
            <Field label="From">
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. The Sharma family" className="input" />
            </Field>
            <div className="sm:col-span-2">
              <div className="mb-2 text-sm font-medium">Theme</div>
              <div className="flex flex-wrap gap-3">
                {THEMES.map((t) => (
                  <button key={t.id} onClick={() => setThemeId(t.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${themeId === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
                    <span className="flex">
                      <span className="h-5 w-5 rounded-full" style={{ background: t.bg }} />
                      <span className="-ml-2 h-5 w-5 rounded-full border border-card" style={{ background: t.accent }} />
                    </span>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Write each wish on its own line — they'll appear as cards on the memory page.</div>
            {wishes.map((w, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  value={w}
                  onChange={(e) => setWishes(wishes.map((x, j) => (i === j ? e.target.value : x)))}
                  rows={2}
                  placeholder={`Wish #${i + 1}`}
                  className="input resize-none"
                />
                {wishes.length > 1 && (
                  <button onClick={() => setWishes(wishes.filter((_, j) => j !== i))}
                    className="self-start rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setWishes([...wishes, ""])}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm hover:bg-muted">
              <Plus className="h-4 w-4" /> Add another wish
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div onClick={() => photoInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handlePhotos(e.dataTransfer.files); }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-10 text-center hover:border-primary/50">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div className="font-medium">Drop photos here or click to upload</div>
              <div className="text-xs text-muted-foreground">JPG, PNG · up to 8MB each</div>
              <input ref={photoInput} type="file" multiple accept="image/*" hidden onChange={(e) => handlePhotos(e.target.files)} />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                    <img src={p} alt="" className="h-full w-full cursor-zoom-in object-cover" onClick={() => setLightbox(p)} />
                    <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-xl">Voice notes</h3>
                <button onClick={() => audioInput.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" /> Upload
                </button>
                <input ref={audioInput} type="file" multiple accept="audio/*" hidden onChange={(e) => handleAudio(e.target.files)} />
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                <button onClick={simulateRecord}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground transition ${recording ? "bg-accent pulse-ring" : "bg-primary hover:opacity-90"}`}>
                  <Mic className="h-6 w-6" />
                </button>
                <div className="flex-1">
                  <div className="font-medium">{recording ? "Recording…" : "Record a voice note"}</div>
                  <div className="text-xs text-muted-foreground">{recording ? "Tap again to stop" : "Tap the mic to start"}</div>
                </div>
              </div>
              {audios.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {audios.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <span className="text-2xl">🎙️</span>
                      <div className="min-w-0 flex-1 truncate text-sm">{a.name}</div>
                      {a.url && <audio controls src={a.url} className="h-8" />}
                      <button onClick={() => setAudios(audios.filter((x) => x.id !== a.id))} className="rounded-full p-2 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-xl">Videos <span className="text-sm text-muted-foreground">(max 3)</span></h3>
                <button onClick={() => videoInput.current?.click()} disabled={videos.length >= 3}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50">
                  <Video className="h-4 w-4" /> Upload
                </button>
                <input ref={videoInput} type="file" multiple accept="video/*" hidden onChange={(e) => handleVideo(e.target.files)} />
              </div>
              {videos.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {videos.map((v) => (
                    <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      <video controls src={v.url} className="aspect-video w-full bg-black object-cover" />
                      <div className="flex items-center justify-between p-2 text-sm">
                        <span className="truncate">{v.name}</span>
                        <button onClick={() => setVideos(videos.filter((x) => x.id !== v.id))} className="rounded-full p-1.5 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No videos yet. Upload up to 3.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-muted">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90">
            Continue
          </button>
        ) : (
          <button onClick={handleCreate}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90">
            Create memory page
          </button>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-background/90 p-2"><X className="h-5 w-5" /></button>
        </div>
      )}

      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.625rem 0.875rem; font-size: 0.95rem; outline: none; transition: border-color .2s, box-shadow .2s; }
      .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-ring); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

function CreatedPreview({ data, qrUrl, showQR, setShowQR, onNext }: { data: MemoryData; qrUrl: string; showQR: boolean; setShowQR: (b: boolean) => void; onNext: () => void }) {
  const theme = THEMES.find((t) => t.id === data.themeId)!;
  const accent = theme.accent;
  const url = typeof window !== "undefined" ? `${window.location.origin}/m/${data.slug}` : `/m/${data.slug}`;

  const [entered, setEntered] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const copyUrl = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* floating sparkles */
  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 4,
    dur: 6 + Math.random() * 8,
    circle: i % 2 === 0,
  }));

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: theme.bg, overflow: "hidden", paddingBottom: "5rem" }}>

      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {sparkles.map((s) => (
          <span key={s.id} style={{
            position: "fixed", left: `${s.left}%`, top: "-30px",
            width: s.size, height: s.size, borderRadius: s.circle ? "50%" : "3px",
            background: s.circle ? `${accent}55` : "rgba(255,255,255,0.45)",
            animationName: "cpFloat", animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`, animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }} />
        ))}
      </div>

      {/* Radial glow behind hero */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55vh",
        background: `radial-gradient(ellipse at 50% -10%, ${accent}40 0%, transparent 65%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem" }}>

        {/* ── ACTION BAR ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "0.75rem", padding: "1.5rem 0 0",
          opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.25rem" }}>✅ Memory created!</p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "clamp(1.6rem, 5vw, 2.4rem)", margin: 0 }}>Your memory page is live 🎉</h1>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button onClick={() => setShowQR(true)} style={actionBtn(accent)}>📷 Show QR</button>
            <Link to="/m/$slug" params={{ slug: data.slug }}
              style={{ ...actionBtn(accent), display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none" }}>
              Open page <ExternalLink size={13} />
            </Link>
            <button onClick={onNext} style={{ ...actionBtn(accent), background: accent, color: "#fff", border: "none", boxShadow: `0 4px 14px ${accent}55` }}>
              Manage guests →
            </button>
          </div>
        </div>

        {/* ── HERO CARD ── */}
        <div style={{
          marginTop: "2rem",
          borderRadius: "2rem", overflow: "hidden",
          boxShadow: `0 24px 80px ${accent}28, 0 4px 20px rgba(0,0,0,0.12)`,
          border: `1px solid ${accent}25`,
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
          transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
        }}>

          {/* Hero header */}
          <div style={{
            background: `linear-gradient(135deg, ${accent}22 0%, ${theme.bg} 100%)`,
            padding: "3rem 2rem 2rem", textAlign: "center", position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 5,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }} />
            <span style={{
              display: "inline-block", background: accent, color: "#fff",
              borderRadius: "9999px", padding: "0.3rem 1rem",
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: "1rem",
              animation: "cpPop 0.6s cubic-bezier(.34,1.56,.64,1) 0.4s both",
            }}>
              ✨ {data.occasion}
            </span>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(2.2rem, 8vw, 4rem)", margin: "0 0 0.5rem",
              animation: "cpSlideUp 0.65s ease 0.5s both",
            }}>
              Happy {data.occasion}, <span style={{ color: accent }}>{data.recipient}</span> 🎉
            </h2>
            <p style={{ color: "#666", fontSize: "0.95rem", animation: "cpSlideUp 0.6s ease 0.7s both" }}>
              From <strong>{data.from}</strong> · {data.date}
            </p>
          </div>

          {/* Photos mosaic */}
          {data.photos.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: data.photos.length === 1 ? "1fr" : data.photos.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)",
              gap: 4, padding: "0 4px 4px",
            }}>
              {data.photos.slice(0, 6).map((p, i) => (
                <div key={i} onClick={() => setLightbox(p)} style={{
                  aspectRatio: "1", overflow: "hidden", cursor: "zoom-in",
                  animation: `cpSlideUp 0.5s ease ${0.6 + i * 0.08}s both`,
                }}>
                  <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Wishes */}
          {data.wishes.length > 0 && (
            <div style={{ padding: "1.5rem 1.5rem 0.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.75rem" }}>💌 Wishes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {data.wishes.map((w, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
                    borderRadius: "1rem", padding: "0.9rem 1.1rem",
                    borderLeft: `3px solid ${accent}`,
                    fontSize: "0.95rem", lineHeight: 1.6,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    animation: `cpSlideUp 0.5s ease ${0.75 + i * 0.1}s both`,
                  }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio */}
          {data.audios.length > 0 && (
            <div style={{ padding: "1rem 1.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>🎙️ Voice notes</div>
              {data.audios.map((a) => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  background: "rgba(255,255,255,0.75)", borderRadius: "0.75rem",
                  padding: "0.6rem 1rem", marginBottom: "0.4rem", fontSize: "0.875rem",
                }}>
                  <span>🎙️</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                  {a.url && <audio controls src={a.url} style={{ height: 28 }} />}
                </div>
              ))}
            </div>
          )}

          {/* Videos */}
          {data.videos.length > 0 && (
            <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>🎬 Videos</div>
              <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: data.videos.length > 1 ? "1fr 1fr" : "1fr" }}>
                {data.videos.map((v) => (
                  <div key={v.id} style={{ borderRadius: "1rem", overflow: "hidden", background: "#000", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                    <video controls src={v.url} style={{ width: "100%", aspectRatio: "16/9", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer strip */}
          <div style={{
            background: `linear-gradient(90deg, ${accent}18, transparent, ${accent}18)`,
            padding: "1rem", textAlign: "center", fontSize: "0.78rem", color: "#888",
          }}>
            🌿 Made with care on Nandi Invites
          </div>
        </div>

        {/* ── QR CTA STRIP ── */}
        <div style={{
          marginTop: "1.5rem", borderRadius: "1.5rem",
          background: `linear-gradient(135deg, ${accent}15, rgba(255,255,255,0.7))`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${accent}30`,
          padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
        }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>📲 Share this memory</div>
            <div style={{ fontSize: "0.8rem", color: "#666", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={copyUrl} style={{ ...actionBtn(accent), background: copied ? "#22c55e" : undefined, color: copied ? "#fff" : undefined, border: copied ? "none" : undefined }}>
              {copied ? "✓ Copied!" : "📋 Copy link"}
            </button>
            <button onClick={() => setShowQR(true)} style={{ ...actionBtn(accent), background: accent, color: "#fff", border: "none" }}>📷 QR Code</button>
          </div>
        </div>
      </div>

      {/* ── QR MODAL ── */}
      {showQR && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          animation: "cpFade 0.25s ease",
        }} onClick={() => setShowQR(false)}>
          <div style={{
            background: "#fff", borderRadius: "2rem", padding: "2rem",
            maxWidth: 360, width: "100%", textAlign: "center",
            boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            animation: "cpPop 0.35s cubic-bezier(.34,1.56,.64,1)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.75rem", marginBottom: "0.25rem" }}>Scan to open</h3>
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1.25rem" }}>Print on the gift label or share directly</p>
            {qrUrl && (
              <div style={{ background: `${accent}12`, borderRadius: "1.25rem", padding: "1rem", display: "inline-block" }}>
                <img src={qrUrl} alt="QR Code" style={{ borderRadius: "0.75rem", display: "block", width: 220 }} />
              </div>
            )}
            <div style={{ margin: "1rem 0 0.75rem", background: "#f5f5f5", borderRadius: "0.75rem", padding: "0.6rem 0.75rem", fontSize: "0.75rem", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button onClick={copyUrl} style={{ ...actionBtn(accent), justifyContent: "center", display: "flex", alignItems: "center", gap: "0.35rem", background: copied ? "#22c55e" : undefined, color: copied ? "#fff" : undefined, border: copied ? "none" : undefined }}>
                <Copy size={14} /> {copied ? "Copied!" : "Copy"}
              </button>
              <a href={qrUrl} download={`${data.slug}-qr.png`} style={{ ...actionBtn(accent), background: accent, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", textDecoration: "none" }}>
                <Download size={14} /> Download
              </a>
            </div>
            <button onClick={() => setShowQR(false)} style={{ marginTop: "0.75rem", background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "0.85rem" }}>Close</button>
          </div>
        </div>
      )}

      {/* ── PHOTO LIGHTBOX ── */}
      {lightbox && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "rgba(0,0,0,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          animation: "cpFade 0.2s ease",
        }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "1rem", objectFit: "contain", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setLightbox(null)} style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={20} color="#fff" /></button>
        </div>
      )}

      <style>{`
        @keyframes cpFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.3; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes cpSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpPop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cpFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function actionBtn(accent: string): React.CSSProperties {
  return {
    borderRadius: "9999px",
    border: `1.5px solid ${accent}45`,
    background: "rgba(255,255,255,0.75)",
    padding: "0.45rem 1.1rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    transition: "background 0.2s, transform 0.15s",
  };
}
