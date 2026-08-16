import React from "react";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { CelebrationHeroCard } from "./MemoryContentMock";
import {
  Lock,
  MessageSquare,
  Printer,
  Sparkles,
  RotateCw,
  Share2,
} from "lucide-react";

export function LaptopScreen({
  onAddPostTrigger,
  compact = false,
}: {
  onAddPostTrigger?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="w-full max-w-2xl lg:max-w-[560px] xl:max-w-[620px] mx-auto select-none flex flex-col items-center">
      {/* ── LAPTOP LID / SCREEN CHASSIS ── */}
      <div className="w-full rounded-[1.3rem] sm:rounded-[1.6rem] bg-[#1E1E24] p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-[#3A3A42] relative">
        {/* Webcam dot */}
        <div className="absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111] ring-1 ring-white/10" />
          <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Display Glass / Inner Screen (Completely Static, Clean & Minimal) */}
        <div className="w-full bg-[#EBF1E6] rounded-[0.9rem] sm:rounded-[1.1rem] overflow-hidden border border-[#241621]/15 text-[#241621] relative flex flex-col">
          {/* Browser Top Navigation Bar */}
          <div className="bg-[#E2EAE0] border-b border-[#241621]/10 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block shadow-inner" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block shadow-inner" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block shadow-inner" />
            </div>

            {/* URL Omnibox */}
            <div className="flex-1 max-w-[260px] sm:max-w-xs mx-auto bg-white/90 border border-[#241621]/10 rounded-full px-3 py-0.5 text-[10px] sm:text-[11px] font-sans text-neutral-600 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1 truncate">
                <Lock className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-neutral-800">sociodex.app</span>
                <span className="text-neutral-400">/m/vipul-birthday</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-full hidden sm:inline">
                LIVE
              </span>
            </div>

            {/* Action Icon */}
            <div className="flex items-center text-neutral-400">
              <Share2 className="h-3 w-3" />
            </div>
          </div>

          {/* SocioDex Inner Navbar (Exact replica of Image 2) */}
          <header className="bg-white/95 backdrop-blur-md border-b border-[#241621]/8 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <SocioDexLogo size="xs" />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
              {/* Page Creator Badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 px-2 py-0.5 font-bold text-[#E4603C] text-[9px] sm:text-[10px]">
                <span>👑</span>
                <span>Page Creator</span>
              </span>

              {/* Follow Page Button */}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#241621]/15 bg-white px-2 py-0.5 font-bold text-[#241621] text-[9px] sm:text-[10px]">
                <span>⭐</span>
                <span>Follow Page</span>
              </span>

              {/* Print Postcard Button */}
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-[#241621]/15 bg-white px-2 py-0.5 font-bold text-[#241621] text-[9px] sm:text-[10px]">
                <Printer className="h-2.5 w-2.5 text-[#E4603C]" />
                <span>Print Postcard</span>
              </span>

              {/* Chat Bubble */}
              <div className="h-5 w-5 rounded-full bg-white border border-[#241621]/15 flex items-center justify-center text-[#E4603C] shadow-xs">
                <MessageSquare className="h-2.5 w-2.5" />
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-1 p-0.5 pr-1.5 rounded-full border border-[#241621]/15 bg-white shadow-xs">
                <span className="h-4 w-4 rounded-full bg-[#E4603C]/10 text-[8px] font-bold text-[#E4603C] flex items-center justify-center border border-[#E4603C]/20">
                  S
                </span>
                <span className="text-[9px] font-bold text-neutral-800">Sajan</span>
              </div>
            </div>
          </header>

          {/* ── STATIC CELEBRATION SCREEN BODY (Pure, Minimal, No internal scroll) ── */}
          <div className="p-3 sm:p-5 bg-gradient-to-b from-[#EFF4EC] via-[#EBF1E6] to-[#E5EDE0] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Subtle decorative confetti sprinkles */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <span className="absolute top-4 left-8 w-2 h-2 rounded-full bg-[#C17F5A]/40" />
              <span className="absolute top-12 right-12 w-2 h-2 rounded-sm bg-[#EBC85A]/50 rotate-12" />
              <span className="absolute bottom-8 left-14 w-2 h-2 rounded-full bg-[#E4603C]/40" />
              <span className="absolute bottom-12 right-16 w-2 h-2 rounded-sm bg-[#5C3A50]/40 rotate-45" />
            </div>

            <div className="w-full max-w-sm sm:max-w-md relative z-10">
              <CelebrationHeroCard onAddPostClick={onAddPostTrigger} compact={true} />
            </div>
          </div>
        </div>
      </div>

      {/* ── LAPTOP BASE / LOWER CHASSIS ── */}
      <div className="w-[102%] h-2.5 sm:h-3 bg-gradient-to-b from-[#C4C4CD] via-[#A6A6B0] to-[#8C8C96] rounded-b-md sm:rounded-b-lg shadow-md flex items-start justify-center relative">
        <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-[#666670] rounded-b-xs" />
      </div>
    </div>
  );
}
