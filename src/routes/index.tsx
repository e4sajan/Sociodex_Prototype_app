import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Sprout, Gift, ArrowRight, Calendar, Sparkles } from "lucide-react";

const TAGLINES = [
  "Send more than a message.",
  "A page full of love, delivered as a keepsake.",
  "Where invitations, memories, and gifts come together.",
  "Scan the gift. Open the feeling.",
  "Make the moment stay.",
];

const ROTATING_WORDS = [
  { word: "open", color: "text-[#2C5F2E]", underline: "decoration-[#C17F5A]/30" },
  { word: "scan", color: "text-[#C17F5A]", underline: "decoration-[#2C5F2E]/30" },
  { word: "interact", color: "text-[#3A76C4]", underline: "decoration-[#C17F5A]/30" },
  { word: "contribute", color: "text-[#8C5E8A]", underline: "decoration-[#2C5F2E]/30" },
  { word: "remember", color: "text-[#C15C5C]", underline: "decoration-[#3A76C4]/30" },
  { word: "keep", color: "text-[#48764B]", underline: "decoration-[#C17F5A]/30" },
  { word: "share", color: "text-[#C16C3A]", underline: "decoration-[#2C5F2E]/30" },
];

const SLIDES = [
  {
    image: "/keepsake_surprise_invite.png",
    category: "Surprise Invitations",
    title: "Opening an Invitation to Celebrate",
    desc: "Watch their eyes light up as they scan the physical QR keepsake on their plant to open a stunning digital invitation, complete with custom RSVPs and venue maps.",
    emoji: "💌",
  },
  {
    image: "/keepsake_surprise_wishes.png",
    category: "Emotional Wishbooks",
    title: "Unlocking Love from Friends & Family",
    desc: "Scanning the handcrafted wooden tag reveals a living scrapbook packed with family letters, old photo collages, and voices from all over the world.",
    emoji: "🎂",
  },
  {
    image: "/keepsake_surprise_emotions.png",
    category: "Expressions of Emotion",
    title: "Turning Emotions into an Experience",
    desc: "Connect physical gift giving with deep digital stories, where they can sit back and listen to custom audio greetings from the people who matter most.",
    emoji: "🌱",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nandi Invites — Premium Living Keepsakes & Memory Pages" },
      {
        name: "description",
        content:
          "Send more than a message. Create interactive surprise pages and smart invitations, attach them to a physical QR keepsake, and deliver memories they can hold forever.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const currentUser = useStore((s) => s.currentUser);
  const navigate = useNavigate();
  const [activeTaglineIndex, setActiveTaglineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleStartCTA = () => {
    navigate({ to: "/creator" });
  };

  const handleExploreKeepsakes = () => {
    navigate({ to: "/keepsakes" });
  };

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F7F3EC] text-[#1A1714] font-sans pb-12 overflow-x-hidden selection:bg-[#2C5F2E]/10 selection:text-[#2C5F2E]">
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;700;800&display=swap"
        rel="stylesheet"
      />

      <header className="relative pt-12 pb-20 px-4 max-w-7xl mx-auto sm:px-6 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2C5F2E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C17F5A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5c3d2e]/10 bg-white/85 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-wide text-[#C17F5A] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#C17F5A] animate-pulse" /> Send more than a
              message
            </div>

            <div className="space-y-4">
              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.08] text-neutral-900"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Send a feeling <br />
                they can{" "}
                <span className="inline-flex items-baseline relative" key={activeWordIndex}>
                  <span
                    className={`inline-block font-semibold italic underline decoration-wavy underline-offset-4 animate-slide-up-entrance ${ROTATING_WORDS[activeWordIndex].color} ${ROTATING_WORDS[activeWordIndex].underline}`}
                  >
                    {ROTATING_WORDS[activeWordIndex].word}
                  </span>
                  <span className="text-[#C17F5A] font-light ml-0.5 animate-slide-up-entrance">
                    .
                  </span>
                </span>
              </h1>

              <p className="text-[#6B6159] text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Create a beautiful digital page filled with wishes, memories, photos, videos, voice
                notes, invitations, and RSVPs. Then attach it to a QR keepsake and deliver something
                your loved one can hold forever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleStartCTA}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#2C5F2E] hover:bg-[#38763b] px-8 py-4.5 text-sm font-bold text-white shadow-lg shadow-[#2C5F2E]/10 cursor-pointer transition-all active:scale-[0.98] select-none hover:scale-[1.01]"
              >
                Create a page <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleExploreKeepsakes}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-neutral-50 border border-[#5c3d2e]/12 px-8 py-4.5 text-sm font-bold text-neutral-800 shadow-md cursor-pointer transition-all active:scale-[0.98] select-none hover:scale-[1.01]"
              >
                Explore keepsakes <Gift className="h-4 w-4 text-[#C17F5A]" />
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs text-[#8E857E] font-semibold tracking-wide">
                <span className="text-[#C17F5A]">✦ Perfect for:</span> birthdays, anniversaries,
                weddings, housewarmings, thank you, sorry, love, blessings, and every moment that
                deserves more than a message.
              </p>
            </div>
          </div>

          <div className="relative mx-auto max-w-xl w-full lg:max-w-none flex justify-center fade-up lg:pl-6">
            <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-[#5c3d2e]/10 bg-[#FFFDF9] p-3.5 shadow-[0_32px_80px_rgba(92,61,46,0.06)] group">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#C17F5A]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-40 w-40 bg-gradient-to-tr from-[#2C5F2E]/10 to-transparent rounded-tr-full pointer-events-none" />

              {/* 1. Widescreen Image Slider Container */}
              <div className="relative aspect-video sm:aspect-[1.5/1] w-full rounded-[2rem] overflow-hidden border border-[#5c3d2e]/8 shadow-sm bg-neutral-100 select-none">
                {/* Stacked Images for Smooth Cross-Fade */}
                {SLIDES.map((slide, idx) => (
                  <img
                    key={idx}
                    src={slide.image}
                    alt={slide.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                      activeSlide === idx
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105 pointer-events-none"
                    }`}
                  />
                ))}

                {/* Floating Top-Left indicator */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-[#5c3d2e]/10 py-1.5 px-3 rounded-full text-[9px] font-extrabold text-[#2C5F2E] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2C5F2E] animate-ping" />
                  Live Keepsake Preview
                </div>

                {/* Floating Top-Right slide counter */}
                <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-xs border border-white/10 py-1 px-2.5 rounded-full text-[9px] font-bold text-white shadow-xs">
                  {activeSlide + 1} / {SLIDES.length}
                </div>
              </div>

              {/* 2. Text Details & Action Controls Panel (Positioned Below Image) */}
              <div className="relative pt-5 pb-1 px-2.5 z-10 space-y-4">
                <div className="relative min-h-[90px] sm:min-h-[100px]">
                  {SLIDES.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-700 ease-in-out ${
                        activeSlide === idx
                          ? "opacity-100 translate-y-0 relative z-10"
                          : "opacity-0 translate-y-2 absolute inset-0 z-0 pointer-events-none"
                      }`}
                    >
                      <span className="text-[9px] font-extrabold text-[#C17F5A] tracking-widest uppercase block mb-1">
                        {slide.emoji} {slide.category}
                      </span>
                      <h3
                        className="font-display text-lg sm:text-xl font-semibold text-neutral-900 leading-tight mb-2"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {slide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B6159] leading-relaxed font-medium">
                        {slide.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Navigation & Progress indicators */}
                <div className="flex items-center justify-between pt-4 border-t border-[#5c3d2e]/8">
                  {/* Progress Dots */}
                  <div className="flex gap-1.5">
                    {SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlide(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                          activeSlide === idx
                            ? "w-6 bg-[#2C5F2E]"
                            : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  {/* Micro Navigation Arrows */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
                      }}
                      className="w-6 h-6 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 flex items-center justify-center text-[10px] font-bold transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide((prev) => (prev + 1) % SLIDES.length);
                      }}
                      className="w-6 h-6 rounded-full border border-[#2C5F2E]/20 bg-[#2C5F2E] hover:bg-[#38763b] text-white flex items-center justify-center text-[10px] font-bold transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── THE NANDI PROMISE (VISUAL VOID OPTIMIZATION) ── */}
        <div className="mt-16 pt-12 border-t border-[#5c3d2e]/10 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-[9px] font-extrabold text-[#C17F5A] uppercase tracking-widest bg-[#C17F5A]/10 px-3 py-1.5 rounded-full">
              The Nandi Promise
            </span>
            <h3
              className="font-display text-2xl sm:text-3xl font-medium text-neutral-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              A new way to deliver emotions.
            </h3>
            <p className="text-xs text-[#6B6159] max-w-md mx-auto">
              Nandi connects digital depth with physical keepsake gifts. See what makes our
              experience different.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                badge: "🌿 PHYSICAL & DIGITAL",
                title: "Not just a greeting card",
                desc: "More than a flat piece of paper. A premium, scannable botanical keepsake planter or wooden tag that opens into a rich, living digital scrapbook of group wishes.",
                borderColor: "border-l-4 border-l-[#2C5F2E]",
              },
              {
                badge: "💌 ACTIVE EVENT HOST",
                title: "Not just an invitation",
                desc: "A living dashboard featuring active RSVP logs, Google Maps locations, calendar events, schedule timelines, and real-time photo uploads from guests.",
                borderColor: "border-l-4 border-l-[#C17F5A]",
              },
              {
                badge: "🔒 SECURE & PERMANENT",
                title: "A living memory vault",
                desc: "A private, secure, and completely ad-free digital sanctuary. Preserved forever, allowing your loved ones to scan and relive the emotional moment years later.",
                borderColor: "border-l-4 border-l-[#3A76C4]",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`bg-[#FFFDF9] border border-[#5c3d2e]/8 ${item.borderColor} p-6 rounded-2xl shadow-[0_4px_20px_rgba(92,61,46,0.02)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[8px] font-extrabold text-[#6B6159] tracking-wider block mb-2">
                    {item.badge}
                  </span>
                  <h4
                    className="font-display text-base sm:text-lg font-bold text-neutral-800 mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6B6159] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── 4. MINIMALIST "HOW IT WORKS" DOTTED TIMELINE ── */}
      <section className="bg-[#FAF8F5] border-t border-b border-[#5c3d2e]/8 py-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Soft background decor blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2C5F2E]/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#C17F5A] uppercase tracking-widest bg-[#C17F5A]/10 px-3.5 py-1.5 rounded-full">
              Creation Path
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl font-medium text-neutral-900 pb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Simple. Heartfelt. Lasting.
            </h2>
            <p className="text-xs text-[#6B6159] max-w-xs mx-auto leading-relaxed">
              Create a custom digital memory page, attach it to a real QR keepsake, and hand it
              over.
            </p>
          </div>

          {/* Dotted Timeline Pathway */}
          <div className="relative pt-6">
            {/* Desktop Horizontal Line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-neutral-200 hidden lg:block z-0" />

            {/* Steps Layout */}
            <div className="grid gap-8 lg:grid-cols-5 relative z-10">
              {[
                {
                  step: 1,
                  title: "1. Choose format",
                  desc: "Select a surprise page template or smart event invitation.",
                  emoji: "🌿",
                  color: "hover:border-[#2C5F2E] hover:text-[#2C5F2E]",
                  activeColor: "bg-[#EAF3DE]/80 text-[#2C5F2E] border-[#2C5F2E]",
                },
                {
                  step: 2,
                  title: "2. Personalize it",
                  desc: "Add old photos, video memories, or record custom audio notes.",
                  emoji: "✍️",
                  color: "hover:border-[#C17F5A] hover:text-[#C17F5A]",
                  activeColor: "bg-[#FAEEDA]/80 text-[#C17F5A] border-[#C17F5A]",
                },
                {
                  step: 3,
                  title: "3. Group wishes",
                  desc: "Invite friends and family to contribute their letters and wishes.",
                  emoji: "👥",
                  color: "hover:border-[#3A76C4] hover:text-[#3A76C4]",
                  activeColor: "bg-[#E0ECF8]/80 text-[#3A76C4] border-[#3A76C4]",
                },
                {
                  step: 4,
                  title: "4. Attach the QR",
                  desc: "We print and attach a scannable QR badge code to your keepsake.",
                  emoji: "🏷️",
                  color: "hover:border-purple-600 hover:text-purple-600",
                  activeColor: "bg-purple-50 text-purple-600 border-purple-600",
                },
                {
                  step: 5,
                  title: "5. Deliver love",
                  desc: "Hand over the plant gift. They scan the QR code to open your feelings.",
                  emoji: "🎁",
                  color: "hover:border-pink-600 hover:text-pink-600",
                  activeColor: "bg-pink-50 text-pink-600 border-pink-600",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-row lg:flex-col items-center lg:text-center gap-4 lg:gap-6 group relative pb-8 lg:pb-0 last:pb-0"
                >
                  {/* The Connecting Dot Circle Node */}
                  <div
                    className={`w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-sm font-bold shadow-2xs transition-all duration-500 cursor-pointer shrink-0 z-10 group-hover:scale-110 group-hover:-translate-y-0.5 ${item.color} ${item.activeColor}`}
                  >
                    <span className="group-hover:hidden">{item.step}</span>
                    <span className="hidden group-hover:inline transform scale-110 animate-bounce">
                      {item.emoji}
                    </span>
                  </div>

                  {/* Text Details (Title & Minimalist Description) */}
                  <div className="space-y-1 select-none">
                    <h4
                      className="font-display text-sm font-bold text-neutral-800 transition-colors duration-300 group-hover:text-neutral-900"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#6B6159] leading-relaxed max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>

                  {/* Mobile Connecting Line */}
                  {idx < 4 && (
                    <div className="absolute left-5 top-5 w-0.5 bg-neutral-200 lg:hidden -z-10 h-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. USE CASE BLOCKS (CLEARLY BIFURCATED: WISHES vs INVITATIONS) ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto sm:px-6 relative">
        {/* Background glow effects to give depth */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#2C5F2E]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 right-10 w-96 h-96 bg-[#C17F5A]/3 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center space-y-3 mb-20">
          <span className="text-[10px] font-extrabold text-[#C17F5A] uppercase tracking-widest bg-[#C17F5A]/10 px-3.5 py-1.5 rounded-full">
            Occasions
          </span>
          <h2
            className="font-display text-4xl sm:text-5xl font-medium text-neutral-900 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Crafted For Every Moment
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6159] max-w-md mx-auto leading-relaxed font-medium">
            Explore our beautifully structured, high-emotion delivery formats, clearly divided by
            product capabilities.
          </p>
        </div>

        {/* Two Column Bifurcated Layout */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Column 1: Surprise Pages & Wishbooks */}
          <div className="space-y-8">
            {/* Organic Header Card */}
            <div className="bg-gradient-to-br from-[#EAF3DE]/60 to-[#FFFDF9] border border-[#2C5F2E]/15 rounded-[2rem] p-6 sm:p-8 space-y-3 shadow-xs relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#2C5F2E]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 text-[#2C5F2E] font-bold text-sm tracking-wide">
                <span className="w-10 h-10 rounded-2xl bg-white border border-[#2C5F2E]/10 flex items-center justify-center shadow-xs">
                  <Gift className="h-5 w-5 text-[#2C5F2E]" />
                </span>
                <span className="font-extrabold text-xs tracking-wider uppercase font-sans">
                  SURPRISE PAGES & WISHBOOKS
                </span>
              </div>
              <p className="text-xs text-[#6B6159] leading-relaxed font-medium">
                Make someone feel deeply remembered. Collect personal letters, photos, videos, and
                group voice notes from friends and family for high-emotion milestones.
              </p>
            </div>

            {/* Column 1 Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "For Birthdays",
                  desc: "Collect group wishes before midnight. Add photos, video greetings, voice notes, and attach it to a botanical QR tag.",
                  emoji: "🎂",
                  features: ["Group Wishes", "Voice Notes", "Photo Grid"],
                  borderColor:
                    "hover:bg-[#EAF3DE]/20 hover:border-[#2C5F2E]/30 hover:shadow-[#2C5F2E]/5",
                  tagColor: "group-hover:bg-[#EAF3DE] group-hover:text-[#2C5F2E]",
                  textColor: "group-hover:text-[#2C5F2E]",
                },
                {
                  title: "For Anniversaries",
                  desc: "Create a shared timeline of love. Compile letters, digital memories, videos, and playlists from the years together.",
                  emoji: "💍",
                  features: ["Love Timeline", "Memory Video", "Music Playlist"],
                  borderColor:
                    "hover:bg-[#EAF3DE]/20 hover:border-[#2C5F2E]/30 hover:shadow-[#2C5F2E]/5",
                  tagColor: "group-hover:bg-[#EAF3DE] group-hover:text-[#2C5F2E]",
                  textColor: "group-hover:text-[#2C5F2E]",
                },
                {
                  title: "For Thank You",
                  desc: "Express gratitude in a warm, lasting format. Record audio appreciations and upload photos to a secure, permanent page.",
                  emoji: "🙏",
                  features: ["Audio Thanks", "Private Vault", "Custom Letter"],
                  borderColor:
                    "hover:bg-[#EAF3DE]/20 hover:border-[#2C5F2E]/30 hover:shadow-[#2C5F2E]/5",
                  tagColor: "group-hover:bg-[#EAF3DE] group-hover:text-[#2C5F2E]",
                  textColor: "group-hover:text-[#2C5F2E]",
                },
                {
                  title: "For Sorry",
                  desc: "When standard messaging feels too small. Create a thoughtful, dedicated page that gives your emotional words the space they deserve.",
                  emoji: "❤️",
                  features: ["Private Space", "Expressive Letter", "Audio Note"],
                  borderColor:
                    "hover:bg-[#EAF3DE]/20 hover:border-[#2C5F2E]/30 hover:shadow-[#2C5F2E]/5",
                  tagColor: "group-hover:bg-[#EAF3DE] group-hover:text-[#2C5F2E]",
                  textColor: "group-hover:text-[#2C5F2E]",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={handleStartCTA}
                  className={`card-soft p-6 bg-[#FFFDF9] border border-[#5c3d2e]/10 rounded-2xl shadow-[0_4px_20px_rgba(92,61,46,0.01)] hover:shadow-xl transition-all duration-500 hover:translate-y-[-4px] flex flex-col justify-between group cursor-pointer ${item.borderColor}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-white border border-[#5c3d2e]/8 flex items-center justify-center text-sm shadow-2xs group-hover:scale-110 transition-transform duration-500">
                          {item.emoji}
                        </span>
                        <h4
                          className={`font-display text-sm sm:text-base font-bold text-neutral-800 transition-colors duration-300 ${item.textColor}`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#6B6159] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#6B6159] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#5c3d2e]/6 flex flex-wrap gap-1.5">
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        className={`text-[9px] font-bold text-[#6B6159] bg-neutral-100 px-2 py-0.5 rounded-md transition-colors duration-300 ${item.tagColor}`}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Smart Event Invitations */}
          <div className="space-y-8">
            {/* Organic Header Card */}
            <div className="bg-gradient-to-br from-[#FAEEDA]/60 to-[#FFFDF9] border border-[#C17F5A]/15 rounded-[2rem] p-6 sm:p-8 space-y-3 shadow-xs relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#C17F5A]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 text-[#C17F5A] font-bold text-sm tracking-wide">
                <span className="w-10 h-10 rounded-2xl bg-white border border-[#C17F5A]/10 flex items-center justify-center shadow-xs">
                  <Calendar className="h-5 w-5 text-[#C17F5A]" />
                </span>
                <span className="font-extrabold text-xs tracking-wider uppercase font-sans">
                  SMART EVENT INVITATIONS
                </span>
              </div>
              <p className="text-xs text-[#6B6159] leading-relaxed font-medium">
                Invite beautifully. Manage easily. Seamlessly handle custom guest RSVPs, dynamic
                Google location maps, timeline schedules, and collaborative photo walls for
                milestone events.
              </p>
            </div>

            {/* Column 2 Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "For Weddings",
                  desc: "Invite beautifully. Manage custom RSVP forms, interactive Google location maps, multi-day schedules, and elegant digital themes.",
                  emoji: "✨",
                  features: ["Smart RSVPs", "Directions Map", "Schedule Timelines"],
                  borderColor:
                    "hover:bg-[#FAEEDA]/20 hover:border-[#C17F5A]/30 hover:shadow-[#C17F5A]/5",
                  tagColor: "group-hover:bg-[#FAEEDA] group-hover:text-[#C17F5A]",
                  textColor: "group-hover:text-[#C17F5A]",
                },
                {
                  title: "For Housewarming",
                  desc: "Share your new home details with maps, schedules, blessings wall for guests, and QR keepsakes for physical invitation tags.",
                  emoji: "🏡",
                  features: ["Interactive Maps", "Timeline", "Blessings Wall"],
                  borderColor:
                    "hover:bg-[#FAEEDA]/20 hover:border-[#C17F5A]/30 hover:shadow-[#C17F5A]/5",
                  tagColor: "group-hover:bg-[#FAEEDA] group-hover:text-[#C17F5A]",
                  textColor: "group-hover:text-[#C17F5A]",
                },
                {
                  title: "For Baby Showers",
                  desc: "Celebrate new arrivals beautifully. Share your baby gift registry, event schedule timeline, and receive warm digital guestbook blessings.",
                  emoji: "👶",
                  features: ["Gift Registry", "Guestbook", "Event Schedule"],
                  borderColor:
                    "hover:bg-[#FAEEDA]/20 hover:border-[#C17F5A]/30 hover:shadow-[#C17F5A]/5",
                  tagColor: "group-hover:bg-[#FAEEDA] group-hover:text-[#C17F5A]",
                  textColor: "group-hover:text-[#C17F5A]",
                },
                {
                  title: "For Special Gatherings",
                  desc: "Perfect for reunions, milestone dinners, and meetups. Track active RSVPs, coordinate shared tasks, and upload photos together.",
                  emoji: "🥂",
                  features: ["RSVP Tracker", "Shared Album", "Coordination Map"],
                  borderColor:
                    "hover:bg-[#FAEEDA]/20 hover:border-[#C17F5A]/30 hover:shadow-[#C17F5A]/5",
                  tagColor: "group-hover:bg-[#FAEEDA] group-hover:text-[#C17F5A]",
                  textColor: "group-hover:text-[#C17F5A]",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={handleStartCTA}
                  className={`card-soft p-6 bg-[#FFFDF9] border border-[#5c3d2e]/10 rounded-2xl shadow-[0_4px_20px_rgba(92,61,46,0.01)] hover:shadow-xl transition-all duration-500 hover:translate-y-[-4px] flex flex-col justify-between group cursor-pointer ${item.borderColor}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-white border border-[#5c3d2e]/8 flex items-center justify-center text-sm shadow-2xs group-hover:scale-110 transition-transform duration-500">
                          {item.emoji}
                        </span>
                        <h4
                          className={`font-display text-sm sm:text-base font-bold text-neutral-800 transition-colors duration-300 ${item.textColor}`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#6B6159] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#6B6159] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#5c3d2e]/6 flex flex-wrap gap-1.5">
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        className={`text-[9px] font-bold text-[#6B6159] bg-neutral-100 px-2 py-0.5 rounded-md transition-colors duration-300 ${item.tagColor}`}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-tr from-[#FAF8F5] via-[#FAF8F5] to-[#EAF3DE] border-t border-b border-[#5c3d2e]/8 py-14 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <blockquote
            className="font-display text-xl sm:text-2xl italic text-neutral-800 font-medium leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            “Some moments should not be sent casually. They should be created carefully. Shared
            beautifully. Delivered thoughtfully. And remembered forever.”
          </blockquote>
        </div>
      </section>

      <footer className="mt-8 py-8 border-t border-[#5c3d2e]/10 text-center space-y-4 max-w-5xl mx-auto px-4">
        <div className="h-6 overflow-hidden flex items-center justify-center">
          <p
            className="text-[10px] font-bold text-[#C17F5A] tracking-widest uppercase transition-all duration-500 ease-in-out transform"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            ✦ {TAGLINES[activeTaglineIndex]}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-[#6B6159]">
          <div className="flex items-center gap-2 select-none">
            <Sprout className="h-3.5 w-3.5 text-[#2C5F2E]" />
            <span>
              Nandi Invites &bull; Digital Pages &bull; Physical Keepsakes &bull; Real Emotions
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/keepsakes" className="hover:text-[#2C5F2E] transition">
              Catalog
            </Link>
            <Link to="/creator" className="hover:text-[#2C5F2E] transition">
              Creator
            </Link>
            {currentUser && (
              <Link to="/tracker" className="hover:text-[#2C5F2E] transition">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
