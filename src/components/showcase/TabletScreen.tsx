import React from "react";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { CelebrationHeroCard } from "./MemoryContentMock";
import { Printer, MessageSquare } from "lucide-react";

export function TabletScreen({
  onAddPostTrigger,
  compact = false,
}: {
  onAddPostTrigger?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="w-full max-w-2xl lg:max-w-[540px] xl:max-w-[580px] mx-auto select-none flex flex-col items-center">
      {/* ── TABLET CHASSIS (Landscape Frame) ── */}
      <div className="w-full bg-[#1C1C22] p-2 sm:p-2.5 rounded-[1.6rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-[#34343E] relative">
        {/* Front Camera Dot */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0F0F12] ring-1 ring-white/10" />

        {/* Inner Screen */}
        <div className="w-full bg-[#EBF1E6] rounded-[1.1rem] sm:rounded-[1.4rem] overflow-hidden border border-[#241621]/15 text-[#241621] flex flex-col">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-md border-b border-[#241621]/8 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <SocioDexLogo size="xs" />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 px-2 py-0.5 font-bold text-[#E4603C] text-[9px] sm:text-[10px]">
                <span>👑</span>
                <span>Page Creator</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#241621]/15 bg-white px-2 py-0.5 font-bold text-[#241621] text-[9px] sm:text-[10px]">
                <Printer className="h-2.5 w-2.5 text-[#E4603C]" />
                <span>Print Postcard</span>
              </span>

              <div className="h-5 w-5 rounded-full bg-[#E4603C]/10 text-[9px] font-bold text-[#E4603C] flex items-center justify-center border border-[#E4603C]/20">
                S
              </div>
            </div>
          </header>

          {/* Clean Static Hero Screen */}
          <div className="p-3 sm:p-5 bg-gradient-to-b from-[#EFF4EC] via-[#EBF1E6] to-[#E5EDE0] flex items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-sm sm:max-w-md relative z-10">
              <CelebrationHeroCard onAddPostClick={onAddPostTrigger} compact={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
