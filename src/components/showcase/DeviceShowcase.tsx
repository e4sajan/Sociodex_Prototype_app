import React, { useState, useEffect, useRef } from "react";
import { LaptopScreen } from "./LaptopScreen";
import { MobileScreen } from "./MobileScreen";
import { TabletScreen } from "./TabletScreen";
import { PostcardScreen } from "./PostcardScreen";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Smartphone,
  Tablet,
  Printer,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface DeviceSlide {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  glowColor: string;
  component: React.ReactNode;
}

export function DeviceShowcase() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [animatingKey, setAnimatingKey] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  const triggerShowcaseConfetti = () => {
    toast.success("🎉 Added a celebratory wish for Vipul!", {
      description: "Live real-time update synced across screens & physical keepsakes.",
    });
  };

  const slides: DeviceSlide[] = [
    {
      id: "laptop",
      title: "Laptop Experience",
      badge: "Living Memory Page",
      icon: Laptop,
      description: "Desktop living guestbook with live stats, photos, and host celebration tools.",
      glowColor: "rgba(235, 200, 90, 0.15)",
      component: <LaptopScreen onAddPostTrigger={triggerShowcaseConfetti} />,
    },
    {
      id: "mobile",
      title: "Mobile Keepsake",
      badge: "Tap-to-Unwrap Envelope",
      icon: Smartphone,
      description: "Interactive digital envelope. Tap 'Unwrap Keepsake' to reveal the living scrapbook.",
      glowColor: "rgba(228, 96, 60, 0.15)",
      component: <MobileScreen onAddPostTrigger={triggerShowcaseConfetti} />,
    },
    {
      id: "tablet",
      title: "Tablet Guestbook",
      badge: "Venue Reception Display",
      icon: Tablet,
      description: "Touch-friendly split guestbook for party entrances and reception welcome tables.",
      glowColor: "rgba(92, 58, 80, 0.14)",
      component: <TabletScreen onAddPostTrigger={triggerShowcaseConfetti} />,
    },
    {
      id: "postcard",
      title: "Physical Postcard",
      badge: "6\" × 4\" Scannable QR Bridge",
      icon: Printer,
      description: "Tangible 4\" × 6\" keepsake record with high-contrast QR code bridging to the digital page.",
      glowColor: "rgba(212, 175, 55, 0.18)",
      component: <PostcardScreen showControls={true} />,
    },
  ];

  const handleNext = () => {
    setAnimatingKey((prev) => prev + 1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setAnimatingKey((prev) => prev + 1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSelect = (index: number) => {
    if (index === currentIndex) return;
    setAnimatingKey((prev) => prev + 1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  const currentSlide = slides[currentIndex];

  return (
    <section
      id="solution"
      className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Soothing Ambient Aura Glow (Centered & Symmetric behind the screen) */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] sm:w-[680px] h-[480px] rounded-full blur-3xl pointer-events-none transition-colors duration-700 ease-out"
        style={{ backgroundColor: currentSlide.glowColor }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── SYMMETRIC SIDE-BY-SIDE 2-COLUMN GRID ── */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ── LEFT COLUMN: INTRODUCTION & 4 COMPACT BUTTONS ── */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            {/* Section Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#E4603C]">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Introducing SocioDex</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1.5">
              <h2
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241621] tracking-tight leading-[1.12]"
                style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
              >
                Meet SocioDex.
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5A66] leading-relaxed font-medium">
                A place where every celebration gets its own living digital home — delivered
                seamlessly across every screen, with tangible physical keepsakes.
              </p>
            </div>

            {/* ── 4 COMPACT INTERACTIVE BUTTONS ── */}
            <div className="space-y-1.5 pt-0.5 max-w-md mx-auto lg:mx-0">
              {slides.map((slide, idx) => {
                const isActive = idx === currentIndex;
                const Icon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`w-full py-2 px-3 sm:px-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 group ${
                      isActive
                        ? "bg-white border-[#E4603C] shadow-sm shadow-[#E4603C]/10 ring-1 ring-[#E4603C]/20 translate-x-1"
                        : "bg-white/70 border-[#241621]/8 hover:bg-white hover:border-[#241621]/20 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon Container */}
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-[#E4603C] text-white shadow-xs"
                            : "bg-[#241621]/5 text-neutral-600 group-hover:bg-[#E4603C]/10 group-hover:text-[#E4603C]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      {/* Titles */}
                      <div className="min-w-0">
                        <h4
                          className={`text-xs font-bold truncate leading-tight ${
                            isActive ? "text-[#241621]" : "text-neutral-700"
                          }`}
                        >
                          {slide.title}
                        </h4>
                        <p className="text-[10px] text-[#6B5A66] truncate font-medium mt-0.5 leading-none">
                          {slide.badge}
                        </p>
                      </div>
                    </div>

                    {/* Active State Indicator Arrow */}
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? "bg-[#E4603C]/10 text-[#E4603C]"
                          : "text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-neutral-400"
                      }`}
                    >
                      <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: PERFECTLY SYMMETRIC FLOATING HARDWARE SHOWCASE ── */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            <div className="relative w-full max-w-lg lg:max-w-xl py-3 px-6 sm:px-8">
              {/* ── LEFT SWITCH BUTTON ── */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Device"
                title="Previous Device (Arrow Left)"
                className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/95 backdrop-blur-md border border-[#241621]/15 text-[#241621] hover:text-[#E4603C] hover:border-[#E4603C]/40 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
              >
                <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
              </button>

              {/* ── SYMMETRIC LEVITATING STAGE (Upright, Balanced, Floating) ── */}
              <div className="w-full flex justify-center items-center animate-float-symmetric">
                <div
                  key={animatingKey}
                  className="w-full flex justify-center items-center animate-scale-fade"
                >
                  {currentSlide.component}
                </div>
              </div>

              {/* ── RIGHT SWITCH BUTTON ── */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Device"
                title="Next Device (Arrow Right)"
                className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/95 backdrop-blur-md border border-[#241621]/15 text-[#241621] hover:text-[#E4603C] hover:border-[#E4603C]/40 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
              >
                <ChevronRight className="h-4.5 w-4.5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
