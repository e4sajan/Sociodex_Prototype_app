import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { CURATED_KEEPSAKES, OCCASIONS, type CuratedKeepsake } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PotPlantPreview } from "@/components/PotPlantPreview";
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Star,
  Check,
  Heart,
  Share2,
  Download,
  Edit2,
  Info,
  Gift,
  Link2,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";

export const Route = createFileRoute("/keepsakes")({
  head: () => ({
    meta: [
      { title: "Choose Curated Keepsake — Nandi Invites" },
      {
        name: "description",
        content:
          "Pick from our signature pre-assembled living keepsake packages. Handcrafted clay pots, indoor plants, and digital memory pages.",
      },
    ],
  }),
  component: ChooseKeepsakePage,
});

function ChooseKeepsakePage() {
  const memory = useStore((s) => s.memory);
  const addCombo = useStore((s) => s.addCombo);
  const navigate = useNavigate();

  const [selectedOccasion, setSelectedOccasion] = useState<string>("All");
  const [successProductId, setSuccessProductId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

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
          console.error("Failed to generate QR in keepsakes banner", err);
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

  // Filter curated products based on occasion
  const filteredProducts = useMemo(() => {
    if (selectedOccasion === "All") return CURATED_KEEPSAKES;

    // Custom loose mapping of occasions
    return CURATED_KEEPSAKES.filter((p) => {
      if (selectedOccasion === "Wedding") return p.occasion === "Wedding";
      if (selectedOccasion === "Birthday") return p.occasion === "Birthday";
      if (selectedOccasion === "Housewarming") return p.occasion === "Housewarming";
      if (selectedOccasion === "Thank You") return p.occasion === "Thank You";
      if (selectedOccasion === "Farewell") return p.occasion === "Farewell";
      if (selectedOccasion === "Friendship" || selectedOccasion === "Just Because") {
        return p.occasion === "Friendship" || p.occasion === "Blessings";
      }
      return p.occasion.toLowerCase() === selectedOccasion.toLowerCase();
    });
  }, [selectedOccasion]);

  const handleAddToCart = (product: CuratedKeepsake) => {
    setSuccessProductId(product.id);
    addCombo({
      id: crypto.randomUUID(),
      pot: product.pot,
      plant: product.plant,
      finish: product.finish,
    });

    setTimeout(() => {
      setSuccessProductId(null);
    }, 2000);
  };

  const themeAccent = memory ? "#2C5F2E" : "#2C5F2E"; // Standard brand accent

  return (
    <div className="relative min-h-screen bg-[#F7F3EC] text-[#1A1714] font-sans pb-28">
      {/* Google fonts link load */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* ── LINKED MEMORY PAGE BANNER (IF ACTIVE) ── */}
        {memory ? (
          <div className="relative mb-8 overflow-hidden rounded-2xl border bg-white p-4.5 shadow-xs sm:p-5 transition-all hover:shadow-md fade-up border-l-6 border-l-[#2C5F2E]">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full opacity-5 bg-[#2C5F2E]" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3DE] text-xl">
                  {memory.isInvitation ? "💌" : "🎂"}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6159] flex items-center gap-1.5">
                      🌱 Linked Memory Book
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      ✓ QR Connected
                    </span>
                  </div>
                  <h2 className="mt-1 font-display text-base sm:text-lg font-bold text-neutral-800 truncate">
                    {memory.isInvitation ? (
                      <>
                        Event Invite:{" "}
                        <em className="text-[#2C5F2E] not-italic font-semibold">
                          {memory.coupleNames || memory.recipient || "Our Wedding"}
                        </em>
                      </>
                    ) : (
                      <>
                        Wish Book:{" "}
                        <em className="text-[#2C5F2E] not-italic font-semibold">
                          {memory.recipient}'s Celebration
                        </em>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 text-[11px] text-[#6B6159] hidden sm:block">
                    A laser-printed QR wood tag linking to this digital scrapbook will be
                    hand-attached to your selected plant keepsake.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:w-auto sm:items-center">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer select-none active:scale-95 w-full sm:w-auto"
                >
                  <Link2 className="h-3.5 w-3.5 text-neutral-500" />
                  {copied ? "Link Copied! ✓" : "Copy Link"}
                </button>

                {qrUrl && (
                  <a
                    href={qrUrl}
                    download={`${memory.slug}-qr.png`}
                    className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer select-none active:scale-95 w-full sm:w-auto"
                  >
                    <Download className="h-3.5 w-3.5 text-neutral-500" />
                    Download QR
                  </a>
                )}

                <a
                  href={`/m/${memory.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition active:scale-95 w-full sm:w-auto"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
                  View Page
                </a>

                <Link
                  to="/creator"
                  className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition w-full sm:w-auto"
                >
                  <Edit2 className="h-3.5 w-3.5 text-neutral-500" />
                  Edit Page
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-amber-500/5 p-4 sm:p-5 transition-all fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-500">
                  ⚠️
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                    No Memory Page Linked
                  </span>
                  <h2 className="mt-1 font-display text-sm sm:text-base font-bold text-neutral-800">
                    Create a memory page first to link a live QR code tag
                  </h2>
                  <p className="text-[11px] text-amber-700/80 mt-0.5 max-w-lg leading-relaxed">
                    You can purchase keepsakes directly, but creating a memory book allows you to
                    link video wishes, photos, and digital cards to the physical plant pot.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">
                <Link
                  to="/creator"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  Create Memory Page
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <section className="pt-4 pb-8 text-center max-w-2xl mx-auto fade-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#C17F5A]">
            <Sparkles className="h-3.5 w-3.5 text-[#C17F5A]" /> Choose a Signature Keepsake
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-neutral-900 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A thoughtful gift <br />
            that grows with <em className="text-[#2C5F2E] not-italic font-semibold">every wish</em>
          </h1>
          <p className="mt-3 text-sm text-[#6B6159] leading-relaxed max-w-lg mx-auto">
            Choose from our pre-curated signature botanical packages. Beautiful plants paired with
            premium handcrafted clay pots and custom occasion tags, ready to ship.
          </p>
        </section>

        {/* ── OCCASION FILTERS ── */}
        <div className="mb-10 flex flex-nowrap overflow-x-auto gap-2.5 pb-3 scrollbar-none snap-x justify-start sm:justify-center -mx-4 px-4">
          {["All", ...OCCASIONS].map((occ) => {
            const active = selectedOccasion === occ;
            return (
              <button
                key={occ}
                onClick={() => setSelectedOccasion(occ)}
                className={`snap-center flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer select-none active:scale-[0.96] ${
                  active
                    ? "bg-[#2C5F2E] text-white shadow-md shadow-[#2C5F2E]/10 border border-transparent"
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200"
                }`}
              >
                {occ === "All" ? "🌱 All Occasions" : occ}
              </button>
            );
          })}
        </div>

        {/* ── CURATED PRODUCTS GRID ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16">
          {filteredProducts.map((product) => {
            const itemPrice = product.pot.price + product.plant.price + product.finish.price;
            const isAdded = successProductId === product.id;

            return (
              <article
                key={product.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-[0_4px_24px_rgba(92,61,46,0.01)] transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] snap-start"
              >
                {/* Product Badge */}
                {product.badge && (
                  <span className="absolute left-4.5 top-4.5 z-10 rounded-full bg-[#FAF5EE] border border-[#C17F5A]/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#C17F5A] shadow-2xs">
                    {product.badge}
                  </span>
                )}

                {/* Star Rating */}
                <div className="absolute right-4.5 top-4.5 z-10 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-neutral-800 shadow-2xs border border-neutral-100">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {product.rating}
                </div>

                {/* Tactile Pot/Plant Pedestal Visualizer */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#F9F8F6] to-[#EFECE6] border border-neutral-100 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-[1.01] transition-transform duration-300">
                  {/* Subtle glass reflection rays */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent pointer-events-none" />

                  {/* Realtime dynamic preview or custom product photo */}
                  {product.image && !brokenImages[product.id] ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [product.id]: true }))}
                      className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="transform transition-transform duration-500 group-hover:scale-[1.05] group-hover:translate-y-[-4px]">
                      <PotPlantPreview
                        pot={product.pot}
                        plant={product.plant}
                        finish={product.finish}
                        size={140}
                      />
                    </div>
                  )}

                  {/* Occasion Label Ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 bg-neutral-900/5 text-neutral-800/80 font-semibold px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest leading-none border border-neutral-200 bg-white shadow-2xs">
                    🏷️ {product.occasion}
                  </div>
                </div>

                {/* Text Metadata Details */}
                <div className="space-y-1.5 px-1 mb-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-neutral-800 group-hover:text-[#2C5F2E] transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-[#C17F5A] mt-0.5">
                      {product.plant.name} + {product.pot.name} ({product.finish.emoji}{" "}
                      {product.finish.name})
                    </p>
                    <p className="text-xs text-[#6B6159] mt-2 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-neutral-400 font-semibold italic block">
                      ✦ {product.tagline}
                    </span>
                  </div>
                </div>

                {/* Tactile CTA Action Block */}
                <div className="border-t border-neutral-100 pt-3.5 flex items-center justify-between gap-3 mt-1 select-none">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block leading-none">
                      Complete Pack
                    </span>
                    <span className="text-lg font-extrabold text-[#1A1714] tracking-tight">
                      ₹{itemPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isAdded}
                    className={`rounded-full py-2.5 px-4.5 text-xs font-bold shadow-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isAdded
                        ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                        : "bg-[#2C5F2E] hover:bg-[#3a6e3d] text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/5 hover:shadow-md"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        Added! <Check className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Add to Cart <ShoppingBag className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── DYNAMIC ZERO SEARCH RESULTS FALLBACK ── */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/60 max-w-lg mx-auto p-8 shadow-xs fade-up">
            <span className="text-4xl block mb-2">🌿</span>
            <h3 className="font-display text-xl font-bold text-neutral-800">
              No signature packages found
            </h3>
            <p className="text-xs text-[#6B6159] mt-2 max-w-xs mx-auto leading-relaxed">
              We don't have a curated pack ready for this exact category, but you can build one
              instantly in our 3-step Keepsake builder!
            </p>
            <Link
              to="/combo"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2C5F2E] px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
            >
              Start Customizing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* ── HIGH-CONVERSION BOTTOM CALL TO ACTION (CUSTOM CUSTOMIZER) ── */}
        <section className="mt-12 bg-gradient-to-tr from-[#2C5F2E] to-[#1c1917] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-lg border border-[#5c3d2e]/10 fade-up">
          {/* Abstract blur backdrop accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C17F5A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-bold text-[#FAF6EE] uppercase tracking-wider shadow-inner">
                ✨ Fully Custom keepsakes
              </span>
              <h2
                className="font-display text-2xl sm:text-3xl font-medium tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Want to mix and match?
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Design a custom living keepsake! Select from 10+ artisan glazed pots, 10+ premium
                air-purifying indoor plants, and custom occasion badges to forge a gift that is
                completely one-of-a-kind.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link
                to="/combo"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFDF9] hover:bg-neutral-100 text-neutral-900 px-8 py-4.5 text-xs font-extrabold shadow-lg cursor-pointer transition-all duration-300 active:scale-[0.98] hover:scale-[1.02]"
              >
                Create Custom Combo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
