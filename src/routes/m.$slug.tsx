import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/data";
import { Check, X, Sprout, Heart, Play, Pause, Volume2 } from "lucide-react";

export const Route = createFileRoute("/m/$slug")({
  component: PublicMemoryPage,
});

/* ─── tiny helpers ─── */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Floating petal / sparkle ─── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: rand(0, 100),
      size: rand(6, 18),
      delay: rand(0, 6),
      dur: rand(7, 16),
      opacity: rand(0.25, 0.7),
      shape: i % 3,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.left}%`,
            top: "-40px",
            width: p.size,
            height: p.size,
            background: p.shape === 0 ? accent : p.shape === 1 ? "#fff" : "transparent",
            border: p.shape === 2 ? `2px solid ${accent}` : "none",
            borderRadius: p.shape === 1 ? "50%" : "3px",
            opacity: p.opacity,
            animationName: "floatUp",
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Photo card with hover tilt ─── */
function PhotoCard({ src, onClick, index }: { src: string; onClick: () => void; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { ref: wrapRef, visible } = useInView(0.1);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) scale(1.04)`;
  };
  const onMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)";
  };

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{ transition: "transform 0.3s ease", cursor: "zoom-in", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        <img src={src} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}

/* ─── Wish card ─── */
function WishCard({ text, index, accent }: { text: string; index: number; accent: string }) {
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-30px)",
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.55s ease ${index * 0.12}s`,
        background: hovered ? `${accent}18` : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(12px)",
        borderRadius: "1.5rem",
        padding: "1.5rem 1.75rem",
        boxShadow: hovered ? `0 8px 32px ${accent}30` : "0 2px 16px rgba(0,0,0,0.07)",
        borderLeft: `4px solid ${accent}`,
        cursor: "default",
        transition2: "background 0.3s, box-shadow 0.3s",
        fontSize: "1.05rem",
        lineHeight: 1.65,
        position: "relative" as const,
      }}
    >
      <span style={{ position: "absolute", top: "1rem", right: "1.25rem", fontSize: "1.3rem", opacity: 0.35 }}>💬</span>
      <span style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
        <Heart size={16} style={{ color: accent, flexShrink: 0, marginTop: "0.3rem" }} />
        {text}
      </span>
    </div>
  );
}

/* ─── Hero section with animated title ─── */
function AnimatedTitle({ occasion, recipient, from, date, accent, textColor }: {
  occasion: string; recipient: string; from: string; date: string; accent: string; textColor: string;
}) {
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => setShowSub(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "3.5rem 1rem 2rem" }}>
      <span
        style={{
          display: "inline-block",
          background: accent,
          color: "#fff",
          borderRadius: "9999px",
          padding: "0.35rem 1.1rem",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          marginBottom: "1.2rem",
        }}
      >
        ✨ {occasion}
      </span>

      <h1
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
          lineHeight: 1.1,
          color: textColor,
          margin: "0.6rem 0",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s",
        }}
      >
        Happy {occasion},
        <br />
        <span style={{ color: accent }}>{recipient}</span> 🎉
      </h1>

      <p
        style={{
          fontSize: "1rem",
          color: textColor,
          opacity: showSub ? 0.65 : 0,
          transform: showSub ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          marginTop: "0.75rem",
        }}
      >
        A memory crafted with love by <strong>{from}</strong> · {date}
      </p>
    </div>
  );
}

/* ─── Main page ─── */
function PublicMemoryPage() {
  const { slug } = useParams({ from: "/m/$slug" });
  const memory = useStore((s) => s.memory);
  const [rsvp, setRsvp] = useState<"attending" | "declined" | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [heartBurst, setHeartBurst] = useState(false);

  if (!memory || memory.slug !== slug) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <div>
          <Sprout style={{ margin: "0 auto 1rem", width: 48, height: 48, color: "#2C5F2E" }} />
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "2rem" }}>This memory page hasn't been planted yet</h1>
          <p style={{ marginTop: "0.5rem", opacity: 0.6 }}>Create a memory in Nandi Invites to see it here.</p>
          <Link to="/memory" style={{ display: "inline-block", marginTop: "1.5rem", background: "#2C5F2E", color: "#fff", borderRadius: "9999px", padding: "0.65rem 1.5rem", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </div>
      </div>
    );
  }

  const theme = THEMES.find((t) => t.id === memory.themeId)!;
  const accent = theme.accent;
  const bg = theme.bg;

  const handleRsvp = (val: "attending" | "declined") => {
    setRsvp(val);
    if (val === "attending") { setHeartBurst(true); setTimeout(() => setHeartBurst(false), 1200); }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, position: "relative", overflowX: "hidden" }}>
      <FloatingParticles accent={accent} />

      {/* Gradient hero overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "60vh",
        background: `radial-gradient(ellipse at 50% 0%, ${accent}30 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 1rem 4rem" }}>

        {/* ── HERO ── */}
        <AnimatedTitle
          occasion={memory.occasion}
          recipient={memory.recipient}
          from={memory.from}
          date={memory.date}
          accent={accent}
          textColor="#2a1f1a"
        />

        {/* ── PHOTOS ── */}
        {memory.photos.length > 0 && (
          <Reveal delay={0.2} className="mt-8">
            <div style={{ marginBottom: "0.75rem", textAlign: "center" }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.6rem", color: accent }}>📸 Memories Captured</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: memory.photos.length === 1 ? "1fr" : memory.photos.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)",
              gap: "0.75rem",
            }}>
              {memory.photos.map((p, i) => (
                <PhotoCard key={i} src={p} index={i} onClick={() => setLightbox(p)} />
              ))}
            </div>
          </Reveal>
        )}

        {/* ── WISHES ── */}
        {memory.wishes.length > 0 && (
          <div style={{ marginTop: "3rem" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.8rem", color: accent }}>
                  💌 Wishes for you
                </span>
              </div>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {memory.wishes.map((w, i) => (
                <WishCard key={i} text={w} index={i} accent={accent} />
              ))}
            </div>
          </div>
        )}

        {/* ── VIDEOS ── */}
        {memory.videos.length > 0 && (
          <Reveal delay={0.1} className="mt-12">
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.8rem", color: accent }}>🎬 Video Messages</span>
            </div>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: memory.videos.length > 1 ? "1fr 1fr" : "1fr" }}>
              {memory.videos.map((v) => (
                <div key={v.id} style={{ borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", background: "#000" }}>
                  <video src={v.url} controls style={{ width: "100%", aspectRatio: "16/9", display: "block" }} />
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── VOICE NOTES ── */}
        {memory.audios.length > 0 && (
          <Reveal delay={0.1} className="mt-10">
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.8rem", color: accent }}>🎙️ Voice Notes</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {memory.audios.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.1}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)",
                    borderRadius: "1rem", padding: "0.85rem 1.25rem",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}>
                    <Volume2 size={18} style={{ color: accent, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                    {a.url && <audio controls src={a.url} style={{ height: 32 }} />}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── RSVP ── */}
        <Reveal delay={0.15} className="mt-12">
          <div style={{
            background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
            borderRadius: "2rem", padding: "2.5rem 2rem", textAlign: "center",
            boxShadow: `0 16px 48px ${accent}22`,
            border: `1px solid ${accent}30`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${accent}, #fff, ${accent})`,
            }} />
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "2rem", marginBottom: "0.4rem" }}>Will you be there? 🥳</h3>
            <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Let {memory.from} know!</p>

            {heartBurst && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", animation: "heartPop 1.1s ease forwards", zIndex: 10 }}>
                ❤️🎉💚✨🎊
              </div>
            )}

            {rsvp ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: rsvp === "attending" ? `${accent}18` : "#f3f3f3",
                borderRadius: "9999px", padding: "0.65rem 1.5rem",
                color: rsvp === "attending" ? accent : "#555", fontWeight: 600,
              }}>
                <Check size={16} />
                {rsvp === "attending" ? "You're in! See you there 🎉" : "Thanks for letting us know 💛"}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleRsvp("attending")}
                  style={{
                    background: accent, color: "#fff", border: "none",
                    borderRadius: "9999px", padding: "0.8rem 2rem",
                    fontSize: "1rem", fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 4px 18px ${accent}55`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  I'll be there 💚
                </button>
                <button
                  onClick={() => handleRsvp("declined")}
                  style={{
                    background: "transparent", color: "#555", border: "1.5px solid #ddd",
                    borderRadius: "9999px", padding: "0.8rem 1.75rem",
                    fontSize: "1rem", cursor: "pointer", fontWeight: 500,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#f5f5f5"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
                >
                  Can't make it
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* ── FOOTER ── */}
        <Reveal delay={0.2} className="mt-10">
          <div style={{ textAlign: "center", opacity: 0.5, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
            <Sprout size={14} /> Made with care on Nandi Invites
          </div>
        </Reveal>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.92)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "1rem",
            animation: "fadeIn 0.25s ease",
          }}
        >
          <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "1rem", objectFit: "contain", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: "1.25rem", right: "1.25rem",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={20} color="#fff" />
          </button>
        </div>
      )}

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heartPop {
          0%   { transform: scale(0.5); opacity: 1; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(2);   opacity: 0; }
        }
      `}</style>
    </div>
  );
}
