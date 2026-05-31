import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import QRCode from "qrcode";
import { POTS, PLANTS, FINISHES, THEMES, type Pot, type Plant, type Finish } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PotPlantPreview } from "@/components/PotPlantPreview";
import {
  Check,
  Sparkles,
  Share2,
  Download,
  Edit2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export const Route = createFileRoute("/combo")({
  head: () => ({
    meta: [
      { title: "Keepsake Builder — Nandi Invites" },
      {
        name: "description",
        content:
          "Design your gift: pick a pot, a plant, and an emotion. A living card to celebrate every moment.",
      },
    ],
  }),
  component: ComboBuilder,
});
type Step = 0 | 1 | 2;
const STEPS = ["Pot", "Plant", "Emotion"] as const;

const PLANT_MEANINGS: Record<string, string> = {
  "Money Plant": "Wealth, abundance & prosperity",
  "Snake Plant": "Resilience, patience & clean air",
  "Peace Lily": "Harmony, purity & calm spirits",
  "Jade Plant": "Good luck, growth & steady energy",
  "Aloe Vera": "Healing, renewal & positive energy",
  "Areca Palm": "Joy, warmth & welcoming vibes",
  "Rubber Plant": "Strength, presence & good luck",
  "Spider Plant": "Simplicity, warmth & fresh air",
  "ZZ Plant": "Endurance, prosperity & steady path",
  "Tulsi (Holy Basil)": "Divine blessings, health & sacred peace",
};

const POT_DESCRIPTIONS: Record<string, string> = {
  "Terra Classic": "Warm clay, raw earthen touch",
  "Sand Dune": "Elegant beige, minimalist fine sand",
  "Forest Stone": "Deep mossy slate, rustic granite",
  "Cloud White": "Satin smooth ivory ceramic",
  "Indigo Bloom": "Deep starry blue glaze",
  "Charcoal Edge": "Modern basalt dark finish",
  "Rose Clay": "Sunset terracotta, blush ceramic",
  "Mint Whisper": "Soft botanical sage green",
  "Sun Ochre": "Vibrant glazed mustard earth",
  "Geo Prism": "Architectural lavender tone",
};

const FINISH_WISHES: Record<string, string> = {
  Love: "Tied with deep care & heart",
  Celebration: "To high spirits & memories",
  Gratitude: "A gentle, lifetime thank you",
  Blessing: "Shine bright on your path",
  Memory: "Preserved forever in bloom",
  Friendship: "Companion in every season",
  Wedding: "Growing together in unity",
  Birthday: "A beautiful new year in bloom",
  Farewell: "Deep roots for your next flight",
  "New Home": "May this home grow with joy",
};

function ComboBuilder() {
  const [pot, setPot] = useState<Pot | undefined>();
  const [plant, setPlant] = useState<Plant | undefined>();
  const [finish, setFinish] = useState<Finish | undefined>();
  const [step, setStep] = useState<Step>(0);
  const addCombo = useStore((s) => s.addCombo);
  const memory = useStore((s) => s.memory);

  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (memory?.slug) {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/m/${memory.slug}`
          : `/m/${memory.slug}`;
      QRCode.toDataURL(url, {
        margin: 1,
        width: 360,
        color: { dark: "#2C5F2E", light: "#FFFDF9" },
      })
        .then((generated) => {
          setQrUrl(generated);
        })
        .catch((err) => {
          console.error("Failed to generate QR in combo banner", err);
        });
    }
  }, [memory]);

  const handleShare = () => {
    if (!memory?.slug) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/m/${memory.slug}`
        : `/m/${memory.slug}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const total = (pot?.price ?? 0) + (plant?.price ?? 0) + (finish?.price ?? 0);
  const ready = pot && plant && finish;

  const items = useMemo(() => (step === 0 ? POTS : step === 1 ? PLANTS : FINISHES), [step]);
  const selectedId = step === 0 ? pot?.id : step === 1 ? plant?.id : finish?.id;

  const handleSelect = (item: Pot | Plant | Finish) => {
    if (step === 0) {
      setPot(item as Pot);
    } else if (step === 1) {
      setPlant(item as Plant);
    } else {
      setFinish(item as Finish);
    }
  };

  const handleAdd = () => {
    if (!ready) return;
    addCombo({ id: crypto.randomUUID(), pot, plant, finish });
    setPot(undefined);
    setPlant(undefined);
    setFinish(undefined);
    setStep(0);
  };

  const themeAccent = THEMES.find((t) => t.id === memory?.themeId)?.accent || "#2C5F2E";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-20">
      {/* ── DESKTOP & TABLET VIEWPORT (LG SIZES AND UP) ── */}
      <div className="hidden lg:block">
        {/* Keepsake Connection Banner */}
        {memory ? (
          <div
            className="relative mb-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm sm:p-5 transition-all hover:shadow-md fade-up"
            style={{ borderLeftWidth: "6px", borderLeftColor: themeAccent }}
          >
            <div
              className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full opacity-10"
              style={{ backgroundColor: themeAccent }}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {memory.isInvitation ? "💌" : "🎂"}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      🌱 Linked Keepsake Memory
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      ✓ QR Connected
                    </span>
                  </div>
                  <h2 className="mt-1 font-display text-base sm:text-lg font-bold text-foreground truncate">
                    {memory.isInvitation ? (
                      <>
                        Event Invite:{" "}
                        <em className="text-primary not-italic font-semibold">
                          {memory.coupleNames || memory.recipient || "Our Wedding"}
                        </em>
                      </>
                    ) : (
                      <>
                        Wish Book:{" "}
                        <em className="text-primary not-italic font-semibold">
                          {memory.recipient}'s Celebration
                        </em>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground hidden sm:block">
                    A printed QR code linking to this page will be attached to your plant keepsake
                    pot.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap shrink-0 items-center gap-2 mt-1 sm:mt-0">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer select-none"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? "Link Copied! ✓" : "Share Link"}
                </button>
                {qrUrl && (
                  <a
                    href={qrUrl}
                    download={`${memory.slug}-qr.png`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition cursor-pointer select-none"
                  >
                    <Download className="h-3.5 w-3.5" />
                    QR Code
                  </a>
                )}
                <Link
                  to="/creator"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-amber-500/5 p-4 sm:p-5 transition-all fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-500">
                  ⚠️
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block">
                    No Memory Page Linked
                  </span>
                  <h2 className="mt-1 font-display text-base sm:text-lg font-bold text-foreground">
                    Create a memory page first to link a live QR code
                  </h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/creator"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
                >
                  Create Memory Page
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="pt-6 pb-6 text-center fade-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> A living gift, not just a present
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight">
            Build a <em className="text-primary not-italic">plant</em>, attach a memory.
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm">
            Three quiet decisions. One thoughtful gift that grows long after the celebration is
            over.
          </p>
        </section>

        <div className="grid gap-6 pb-12 lg:grid-cols-[1fr_420px]">
          {/* LEFT: Selectors */}
          <section className="card-soft p-5 sm:p-7 order-2 lg:order-1 bg-white">
            {/* Step tabs */}
            <div className="mb-6 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {STEPS.map((label, i) => {
                const active = step === i;
                const done = (i === 0 && pot) || (i === 1 && plant) || (i === 2 && finish);
                return (
                  <button
                    key={label}
                    onClick={() => setStep(i as Step)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition cursor-pointer select-none ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                        active
                          ? "bg-primary-foreground text-primary"
                          : done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done && !active ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            <h2 className="font-display text-2xl text-neutral-800 font-semibold">
              {step === 0 ? "Choose your pot" : step === 1 ? "Pick a plant" : "Add an emotion"}
            </h2>
            <p className="mb-5 text-xs text-muted-foreground">
              {step === 0
                ? "Material, shape, and finish — find one that fits their home."
                : step === 1
                  ? "Carefully nurtured, clean indoor plants for lifetime growth."
                  : "A beautiful badge tied with organic twine to the plant pot."}
            </p>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`group relative flex flex-col items-center rounded-2xl border bg-background p-3.5 text-center lift cursor-pointer select-none ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-neutral-300"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <div className="flex h-20 w-full items-center justify-center">
                      {step === 0 ? (
                        <PotPlantPreview pot={item as Pot} size={70} />
                      ) : step === 1 ? (
                        <PotPlantPreview plant={item as Plant} size={70} />
                      ) : (
                        <span className="text-4xl">{(item as Finish).emoji}</span>
                      )}
                    </div>
                    <div className="mt-3 truncate text-xs font-bold text-neutral-800 w-full">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      ₹{item.price}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between border-t border-neutral-100 pt-4.5">
              {step > 0 && (
                <button
                  onClick={() => setStep((step - 1) as Step)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Previous Step
                </button>
              )}
              {step < 2 ? (
                <button
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={step === 0 ? !pot : !plant}
                  className="ml-auto rounded-full bg-primary px-6 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button
                  disabled={!ready}
                  onClick={handleAdd}
                  className="ml-auto rounded-full bg-[#2C5F2E] px-8 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  Complete Keepsake
                </button>
              )}
            </div>
          </section>

          {/* RIGHT: Sticky Preview */}
          <aside className="lg:sticky lg:top-20 lg:self-start order-1 lg:order-2">
            <div className="card-soft overflow-hidden bg-white">
              <div className="bg-gradient-to-b from-secondary to-card p-6">
                <div className="flex flex-col items-center">
                  <PotPlantPreview pot={pot} plant={plant} finish={finish} size={220} />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        step === i
                          ? "w-6 bg-primary"
                          : (i === 0 && pot) || (i === 1 && plant) || (i === 2 && finish)
                            ? "w-3 bg-primary/60"
                            : "w-3 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Keepsake Summary
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-800 leading-snug">
                    {plant?.name ?? "Your Plant"}{" "}
                    <span className="text-muted-foreground text-sm font-sans font-normal">in</span>{" "}
                    {pot?.name ?? "Your Pot"}
                  </h3>
                  {finish && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Badge: {finish.emoji} {finish.name}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 rounded-xl bg-background/60 p-3.5 text-xs">
                  <Row
                    label={pot ? `Pot · ${pot.name}` : "Pot"}
                    val={pot ? `₹${pot.price}` : "—"}
                  />
                  <Row
                    label={plant ? `Plant · ${plant.name}` : "Plant"}
                    val={plant ? `₹${plant.price}` : "—"}
                  />
                  <Row
                    label={finish ? `Badge · ${finish.name}` : "Badge"}
                    val={finish ? `₹${finish.price}` : "—"}
                  />
                  <div className="my-1.5 border-t border-border" />
                  <div className="flex items-center justify-between font-bold text-sm text-neutral-800">
                    <span>Total Price</span>
                    <span className="font-display text-lg text-primary">₹{total}</span>
                  </div>
                </div>

                <button
                  disabled={!ready}
                  onClick={handleAdd}
                  className="w-full rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-95 cursor-pointer"
                >
                  {ready ? "Add Custom Keepsake to Cart 📦" : "Complete steps to add to cart"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── PREMIUM TACTILE SPLIT-SCREEN CUSTOMIZER VIEWPORT (MOBILE ONLY) ── */}
      <div className="lg:hidden flex flex-col gap-4 mt-2 fade-up">
        {/* Greenhouse Pedestal CSS Animations */}
        <style>{`
          @keyframes visualizer-float {
            0%, 100% { transform: translateY(0px) scale(0.92); }
            50% { transform: translateY(-8px) scale(0.95); }
          }
          @keyframes sun-drift {
            0%, 100% { opacity: 0.25; transform: translate(-10%, -10%) scale(1); }
            50% { opacity: 0.45; transform: translate(5%, 5%) scale(1.1); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-visualizer-float {
            animation: visualizer-float 6s ease-in-out infinite;
          }
          .animate-sun-drift {
            animation: sun-drift 10s ease-in-out infinite;
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Compact QR Connection Ribbon */}
        {memory ? (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-base shrink-0">
                {memory.isInvitation ? "💌" : "🎂"}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-800 truncate block text-[11px]">
                    Linked: {memory.coupleNames || memory.recipient || "Memory Book"}
                  </span>
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                </div>
                <span className="text-[9px] text-muted-foreground block">
                  A custom QR code tag will be tied to this pot
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {qrUrl && (
                <a
                  href={qrUrl}
                  download={`${memory.slug}-qr.png`}
                  className="p-1.5 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200/50 shadow-xs text-primary transition active:scale-95"
                  title="Download QR"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              )}
              <Link
                to="/creator"
                className="px-2.5 py-1.5 bg-primary text-white rounded-xl font-bold text-[9px] hover:opacity-90 active:scale-95 transition"
              >
                Edit Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-amber-500/5 border border-dashed border-amber-300 p-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">⚠️</span>
              <div className="min-w-0">
                <span className="font-bold text-amber-800 block text-[11px]">
                  No Live Memory Connected
                </span>
                <span className="text-[9px] text-amber-600 block">
                  Create a wish book to attach a printed QR tag
                </span>
              </div>
            </div>
            <Link
              to="/creator"
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[9px] active:scale-95 shrink-0 transition"
            >
              Create Now
            </Link>
          </div>
        )}

        {/* Minimal Header */}
        <div className="text-center px-1">
          <h1 className="font-display text-2xl font-bold text-neutral-800 leading-none">
            Assemble Your <span className="text-[#2C5F2E] italic">Keepsake</span>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-1">
            Choose a pot, plant, and emotional tag. Hand-delivered in our custom carrier bags.
          </p>
        </div>

        {/* Greenhouse Potting Bench Pedestal */}
        <div className="relative aspect-[16/10] max-h-[220px] w-full rounded-3xl bg-gradient-to-b from-[#F5F2EA] to-[#DFD9CE] border border-[#5c3d2e]/10 shadow-inner flex flex-col items-center justify-center overflow-hidden">
          {/* Greenhouse glass rays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/30 blur-2xl pointer-events-none animate-sun-drift" />

          {/* Ceramic Studio Pedestal base */}
          <div className="absolute bottom-3 inset-x-0 flex flex-col items-center pointer-events-none z-0">
            {/* Wooden shelf top line */}
            <div className="w-5/6 h-1 rounded-full bg-neutral-800/10 shadow-sm" />
            <ellipse
              cx="150"
              cy="8"
              rx="60"
              ry="7"
              fill="rgba(92,61,46,0.12)"
              className="transform translate-y-0.5"
            />
          </div>

          {/* Plant Model Preview */}
          <div className="relative z-10 transform animate-visualizer-float">
            <PotPlantPreview pot={pot} plant={plant} finish={finish} size={152} />
          </div>

          {/* Bottom badge */}
          {ready && (
            <div className="absolute top-3 right-3 bg-[#2C5F2E] text-white px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Complete
            </div>
          )}
        </div>

        {/* 3-Step Interactive Navigator Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-neutral-200/50 p-1 rounded-2xl border border-neutral-300/40">
          {STEPS.map((label, i) => {
            const active = step === i;
            const done = (i === 0 && pot) || (i === 1 && plant) || (i === 2 && finish);
            const emoji = i === 0 ? "🏺" : i === 1 ? "🌿" : "🏷️";
            return (
              <button
                key={label}
                onClick={() => setStep(i as Step)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold transition-all relative cursor-pointer select-none active:scale-95 ${
                  active
                    ? "bg-[#2C5F2E] text-white shadow-sm"
                    : done
                      ? "bg-white text-neutral-800 border border-neutral-200"
                      : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span className="text-xs shrink-0">{emoji}</span>
                <span className="text-[10px] tracking-tight leading-none">{label}</span>
                {done && !active && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2C5F2E] text-white text-[7px] border border-white font-extrabold shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tactile Options Panel */}
        <div className="bg-white border border-[#5c3d2e]/10 rounded-3xl p-4 shadow-[0_4px_20px_rgba(92,61,46,0.02)] flex flex-col">
          {/* Step Header */}
          <div className="mb-1">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#C17F5A] leading-none block">
              Step {step + 1} of 3
            </span>
            <h2 className="font-display text-lg font-bold text-neutral-800 leading-tight mt-0.5">
              {step === 0
                ? "Choose Pot Style"
                : step === 1
                  ? "Choose Plant Lore"
                  : "Tether Emotion Tag"}
            </h2>
          </div>

          {/* Horizontal Card Swiper Deck */}
          <div className="overflow-x-auto flex gap-3 py-3 scrollbar-none snap-x -mx-4 px-4 min-h-[145px]">
            {items.map((item) => {
              const selected = selectedId === item.id;
              const metaText =
                step === 0
                  ? POT_DESCRIPTIONS[item.name]
                  : step === 1
                    ? PLANT_MEANINGS[item.name]
                    : FINISH_WISHES[item.name];

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`snap-center flex-shrink-0 w-[145px] flex flex-col justify-between rounded-2xl border text-center transition-all cursor-pointer select-none active:scale-95 p-3 relative overflow-hidden ${
                    selected
                      ? "border-[#2C5F2E] bg-[#2C5F2E]/[0.02] ring-2 ring-[#2C5F2E]/10 shadow-sm"
                      : "border-neutral-200/60 bg-white hover:border-neutral-300 shadow-2xs"
                  }`}
                >
                  {selected && (
                    <div className="absolute right-2 top-2 bg-[#2C5F2E] text-white p-0.5 rounded-full z-20">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}

                  <div className="h-16 w-full flex items-center justify-center">
                    {step === 0 ? (
                      <PotPlantPreview pot={item as Pot} size={56} />
                    ) : step === 1 ? (
                      <PotPlantPreview plant={item as Plant} size={56} />
                    ) : (
                      <span className="text-3xl filter drop-shadow-sm">
                        {(item as Finish).emoji}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-left w-full">
                    <h4 className="text-[11px] font-bold text-neutral-800 truncate w-full leading-none">
                      {item.name}
                    </h4>
                    <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2 leading-tight h-5">
                      {metaText}
                    </p>
                    <div className="text-[10px] font-extrabold text-neutral-800 mt-1 flex items-center justify-between">
                      <span className="text-[#C17F5A]">₹{item.price}</span>
                      {selected && (
                        <span className="text-[8px] text-[#2C5F2E] font-extrabold uppercase tracking-widest leading-none">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Build Selected Choices Summary Ribbon */}
          <div className="bg-[#FAF8F5] border border-neutral-100 rounded-xl p-2.5 text-[10px] flex flex-wrap gap-x-3 gap-y-1 items-center justify-center text-muted-foreground mt-1 mb-2.5">
            <div className="flex items-center gap-0.5">
              <span className="text-neutral-500 font-medium">Pot:</span>
              <span className="font-bold text-neutral-800">{pot ? pot.name : "—"}</span>
            </div>
            <span className="text-neutral-300">•</span>
            <div className="flex items-center gap-0.5">
              <span className="text-neutral-500 font-medium">Plant:</span>
              <span className="font-bold text-neutral-800">{plant ? plant.name : "—"}</span>
            </div>
            <span className="text-neutral-300">•</span>
            <div className="flex items-center gap-0.5">
              <span className="text-neutral-500 font-medium">Tag:</span>
              <span className="font-bold text-neutral-800">
                {finish ? `${finish.emoji} ${finish.name}` : "—"}
              </span>
            </div>
          </div>

          {/* Sticky Tactile Control Action Bar */}
          <div className="flex gap-2.5 items-center pt-3.5 border-t border-neutral-100 mt-1">
            {step > 0 && (
              <button
                onClick={() => setStep((step - 1) as Step)}
                className="rounded-full border border-neutral-200 p-3 text-neutral-700 hover:bg-neutral-50 transition active:scale-95 cursor-pointer shrink-0"
                title="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => {
                if (step < 2) {
                  setStep((step + 1) as Step);
                } else {
                  handleAdd();
                }
              }}
              disabled={step === 0 ? !pot : step === 1 ? !plant : !ready}
              className={`flex-1 rounded-full text-white py-3 px-5 text-xs font-bold shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 select-none ${
                ready && step === 2
                  ? "bg-[#2C5F2E] hover:bg-[#2C5F2E]/90 ring-4 ring-[#2C5F2E]/10 animate-bounce-subtle"
                  : "bg-neutral-800 hover:bg-neutral-900"
              }`}
            >
              {step < 2 ? (
                <>
                  Continue Customizing <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : ready ? (
                <>
                  Add custom plant to cart (₹{total}) <ShoppingBag className="h-3.5 w-3.5" />
                </>
              ) : (
                <>Add tag to complete keepsake</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="font-semibold">{val}</span>
    </div>
  );
}
