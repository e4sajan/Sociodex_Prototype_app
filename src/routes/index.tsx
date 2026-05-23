import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import {
  Sprout,
  Heart,
  Gift,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  Smartphone,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nandi Invites — Premium Living Keepsakes & Memory Pages" },
      {
        name: "description",
        content:
          "Attach a live digital wish book or wedding event invitation to a custom-handcrafted plant pot keepsake.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const currentUser = useStore((s) => s.currentUser);
  const navigate = useNavigate();

  const handleStartCTA = () => {
    navigate({ to: "/creator" });
  };

  return (
    <div className="relative min-h-screen bg-[#F7F3EC] text-[#1A1714] font-sans pb-20 overflow-x-hidden">
      {/* Google fonts link load */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* ── HERO BANNER SECTION ── */}
      <section className="relative pt-12 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Hero Left Content */}
          <div className="space-y-6 text-center lg:text-left fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5c3d2e]/10 bg-white px-3.5 py-1 text-xs font-semibold tracking-wide text-[#C17F5A] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#C17F5A]" /> A Gift that Grows, a Memory that Lasts
            </div>

            <h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-none text-neutral-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              The digital invitation <br />
              that lives on a{" "}
              <em className="text-[#2C5F2E] not-italic font-semibold block sm:inline">
                living plant
              </em>
            </h1>

            <p className="text-[#6B6159] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Beautiful physical gifts meet interactive digital spaces.
              Attach a live scrapbook or elegant event invitation directly to a custom potted plant via a laser-printed QR tag.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleStartCTA}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2C5F2E] hover:bg-[#4A8A4C] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#2C5F2E]/10 cursor-pointer transition-all active:scale-[0.98] select-none hover:scale-[1.01]"
              >
                Create a Memory Page ✨ <ArrowRight className="h-4 w-4" />
              </button>

              {!currentUser ? (
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-neutral-50/80 border border-[#5c3d2e]/10 px-8 py-4 text-sm font-bold text-neutral-800 shadow-md cursor-pointer transition-all active:scale-[0.98] select-none"
                >
                  🔑 Sign In to Proceed
                </Link>
              ) : (
                <Link
                  to="/tracker"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-neutral-50/80 border border-[#5c3d2e]/10 px-8 py-4 text-sm font-bold text-neutral-800 shadow-md cursor-pointer transition-all active:scale-[0.98] select-none"
                >
                  📊 Go to Activity Dashboard
                </Link>
              )}
            </div>

            {/* Micro Highlights */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-[#8E857E] pt-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#2C5F2E]" /> 100% Biodegradable Tag
              </span>
              <span className="flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-[#2C5F2E]" /> Premium Hand-Picked Plants
              </span>
            </div>
          </div>

          {/* Hero Right Media - Premium Poster illustration */}
          <div className="relative mx-auto max-w-lg w-full lg:max-w-none flex justify-center fade-up">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-[#5c3d2e]/8 bg-[#FFFDF9] p-4 shadow-[0_32px_80px_rgba(92,61,46,0.08)]">
              {/* Top gold corner accent */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-[#C17F5A]/20 to-transparent rounded-bl-full" />
              
              <img
                src="/nandi_keepsake_hero.png"
                alt="Nandi Invites Keepsake Concept"
                className="rounded-[2rem] w-full object-cover max-h-[460px] shadow-sm hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION (INFOGRAPHIC TIMELINE) ── */}
      <section className="bg-white border-t border-b border-[#5c3d2e]/8 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-2 mb-16">
          <span className="text-xs font-bold text-[#C17F5A] uppercase tracking-widest">
            3-Step Process
          </span>
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            How it works
          </h2>
        </div>

        {/* 3 Step Infographic Cards linked by dashed line */}
        <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto relative">
          
          {/* Timeline Connector Line */}
          <div className="absolute top-12 left-[12%] right-[12%] h-[1.5px] border-t-2 border-dashed border-[#C17F5A]/25 z-0 hidden sm:block" />

          {/* Step 1 */}
          <div className="relative z-10 card-soft p-6 bg-[#FAF8F5] border-transparent shadow-xs text-center space-y-4 transition hover:translate-y-[-2px] duration-300">
            <div className="w-12 h-12 rounded-full bg-[#EAF3DE] text-[#2C5F2E] flex items-center justify-center text-xl font-bold mx-auto border-2 border-white shadow-md">
              1
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-bold text-neutral-800">
                1. Write & Upload
              </h3>
              <p className="text-xs text-[#6B6159] leading-relaxed">
                Customize an invite or wish book. Add photos, select themes, and upload voice or video blessings.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 card-soft p-6 bg-[#FAF8F5] border-transparent shadow-xs text-center space-y-4 transition hover:translate-y-[-2px] duration-300">
            <div className="w-12 h-12 rounded-full bg-[#FAEEDA] text-[#C17F5A] flex items-center justify-center text-xl font-bold mx-auto border-2 border-white shadow-md">
              2
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-bold text-neutral-800">
                2. Assemble Keepsake
              </h3>
              <p className="text-xs text-[#6B6159] leading-relaxed">
                Choose a handcrafted pot (Ceramic, Terracotta, Clay) and a matching healthy indoor plant.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 card-soft p-6 bg-[#FAF8F5] border-transparent shadow-xs text-center space-y-4 transition hover:translate-y-[-2px] duration-300">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl font-bold mx-auto border-2 border-white shadow-md">
              3
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-bold text-neutral-800">
                3. Laser-Print & Ship
              </h3>
              <p className="text-xs text-[#6B6159] leading-relaxed">
                We laser-print a unique QR tag, attach it to your living plant pot, and ship it directly to loved ones.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── THEME PACKAGES & OFFERS (INFOGRAPHIC LAYOUT) ── */}
      <section className="pt-16 pb-20 px-4 max-w-7xl mx-auto sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] items-center">
          
          {/* Left Block: Minimalist Info Cards */}
          <div className="space-y-6 fade-up">
            <div className="space-y-2.5 text-center lg:text-left">
              <span className="text-xs font-bold text-[#C17F5A] uppercase tracking-widest">
                Our Offers
              </span>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Signature keepsake packages
              </h2>
              <p className="text-[#6B6159] text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
                Handpicked plant keepsakes coupled with responsive wish books. All packs include carbon-neutral priority shipping.
              </p>
            </div>

            {/* Infographic Catalog List Cards */}
            <div className="grid gap-4 pt-2">
              
              {/* Package 1 */}
              <div className="card-soft p-4 sm:p-5 bg-white border border-[#5c3d2e]/8 shadow-xs flex items-center gap-4 transition hover:shadow-md">
                <span className="text-4xl shrink-0">🎂</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-neutral-800 truncate">Milestone Birthday Keepsake</h4>
                    <span className="text-xs font-extrabold text-[#2C5F2E]">₹799</span>
                  </div>
                  <ul className="text-xs text-[#6B6159] mt-1.5 space-y-0.5 list-disc pl-4 text-left">
                    <li>Jade Succulent in custom Ceramic Pot</li>
                    <li>Open wishbook with audio voice recordings</li>
                    <li>Laser-printed QR wood tag included</li>
                  </ul>
                </div>
              </div>

              {/* Package 2 */}
              <div className="card-soft p-4 sm:p-5 bg-white border border-[#5c3d2e]/8 shadow-xs flex items-center gap-4 transition hover:shadow-md">
                <span className="text-4xl shrink-0">💍</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-neutral-800 truncate">Wedding Invitation Bundle</h4>
                    <span className="text-xs font-extrabold text-[#2C5F2E]">₹1,199</span>
                  </div>
                  <ul className="text-xs text-[#6B6159] mt-1.5 space-y-0.5 list-disc pl-4 text-left">
                    <li>Peace Lily in handcrafted Terracotta Pot</li>
                    <li>Interactive Timeline, Location Maps, & RSVPs</li>
                    <li>Gold-foiled QR wood tag included</li>
                  </ul>
                </div>
              </div>

              {/* Package 3 */}
              <div className="card-soft p-4 sm:p-5 bg-white border border-[#5c3d2e]/8 shadow-xs flex items-center gap-4 transition hover:shadow-md">
                <span className="text-4xl shrink-0">🌿</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-neutral-800 truncate">Farewell Scrapbook Keepsake</h4>
                    <span className="text-xs font-extrabold text-[#2C5F2E]">₹899</span>
                  </div>
                  <ul className="text-xs text-[#6B6159] mt-1.5 space-y-0.5 list-disc pl-4 text-left">
                    <li>Snake Plant in natural Organic Clay Pot</li>
                    <li>Read-only digital photo collage wall</li>
                    <li>Laser-printed QR wood tag included</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: Freshly Generated Catalog Poster Graphic */}
          <div className="relative mx-auto max-w-md w-full lg:max-w-none flex justify-center fade-up">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-[#5c3d2e]/8 bg-[#FFFDF9] p-4 shadow-[0_32px_80px_rgba(92,61,46,0.06)]">
              <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-[#5c3d2e]/10 py-1.5 px-3 rounded-xl text-[10px] font-bold text-neutral-800 uppercase tracking-widest">
                🌱 Botanical Catalog
              </div>
              <img
                src="/nandi_offers_poster.png"
                alt="Keepsake Packages"
                className="rounded-[2rem] w-full object-cover max-h-[460px] shadow-sm hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── HIGH-CONVERSION BOTTOM CALL TO ACTION ── */}
      <section className="bg-gradient-to-tr from-[#2C5F2E] via-[#3a6e3d] to-[#1c1917] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Abstract blur background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C17F5A]/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-bold text-[#FAF6EE] uppercase tracking-widest block bg-[#FAF6EE]/10 rounded-full px-4 py-1.5 w-max mx-auto shadow-inner">
            🌱 Ready to Start?
          </span>
          <h2
            className="font-display text-4xl sm:text-5xl font-medium tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Create a living card today
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStartCTA}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFDF9] hover:bg-neutral-50 text-neutral-900 px-8 py-4 text-sm font-bold shadow-lg cursor-pointer transition active:scale-95 hover:scale-[1.01]"
            >
              Start Creating Now ✨
            </button>

            {!currentUser && (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 hover:bg-white/10 px-8 py-4 text-sm font-bold text-white shadow-md cursor-pointer transition active:scale-95"
              >
                🔑 Secure Session (Sign In)
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER CREATOR BADGE ── */}
      <footer className="mt-16 py-8 border-t border-[#5c3d2e]/10 text-center text-xs text-[#6B6159] flex items-center justify-center gap-1.5 select-none font-semibold">
        <Sprout className="h-3.5 w-3.5 text-[#2C5F2E]" />
        MADE WITH NANDI INVITES · LIVING KEEPSAKES GREETINGS
      </footer>
    </div>
  );
}
