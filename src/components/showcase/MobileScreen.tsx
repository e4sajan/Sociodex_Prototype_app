import React, { useState } from "react";
import { KeepsakeCard, CelebrationHeroCard, MockFeedTabs } from "./MemoryContentMock";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { Sparkles, RotateCcw, Heart, Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function MobileScreen({
  onAddPostTrigger,
  compact = false,
}: {
  onAddPostTrigger?: () => void;
  compact?: boolean;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "wishes" | "photos" | "audios" | "rsvps">("all");
  const [likes, setLikes] = useState({ emma: 34, marcus: 48, chloe: 19 });

  const handleUnwrap = () => {
    setIsUnwrapping(true);
    toast.success("Keepsake unwrapped! ✨", {
      description: "Welcome to Vipul's living celebration page!",
    });
    setTimeout(() => {
      setIsRevealed(true);
      setIsUnwrapping(false);
    }, 350);
  };

  const handleWrapBack = () => {
    setIsRevealed(false);
    toast.info("Returned to Keepsake welcome envelope.");
  };

  return (
    <div className="w-full max-w-[280px] sm:max-w-[300px] mx-auto select-none flex flex-col items-center">
      {/* ── SMARTPHONE HARDWARE FRAME (Titanium chassis) ── */}
      <div className="w-full bg-[#18181D] p-2.5 rounded-[2.4rem] sm:rounded-[2.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.30)] border-3 border-[#32323B] relative overflow-hidden">
        {/* Side button accents */}
        <div className="absolute -left-3.5 top-20 w-1 h-8 bg-[#3A3A45] rounded-l-sm" />
        <div className="absolute -left-3.5 top-32 w-1 h-8 bg-[#3A3A45] rounded-l-sm" />
        <div className="absolute -right-3.5 top-24 w-1 h-12 bg-[#3A3A45] rounded-r-sm" />

        {/* Screen Header */}
        <div className="relative w-full bg-[#FAF6EE] rounded-[1.8rem] sm:rounded-[2.2rem] overflow-hidden min-h-[460px] max-h-[490px] flex flex-col border border-[#241621]/15">
          {/* Dynamic Island Notch */}
          <div className="bg-[#FAF6EE] pt-2 pb-1 px-4 flex items-center justify-between z-30 shrink-0">
            <span className="text-[10px] font-bold text-neutral-800">9:41</span>
            <div className="w-18 h-4 bg-black rounded-full flex items-center justify-end px-1.5 gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
              <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
            <div className="flex items-center gap-0.5 text-[9px] font-bold text-neutral-800">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screen Content State 1: Keepsake Card (Image 3) */}
          {!isRevealed ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#EFF3EA] via-[#F8F5EE] to-[#FAF6EE] relative transition-all duration-300 ${
                isUnwrapping ? "scale-95 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              {/* Soft floating background sparkles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                <span className="absolute top-6 left-4 text-xs">✨</span>
                <span className="absolute top-16 right-6 text-xs">💛</span>
                <span className="absolute bottom-12 left-6 text-xs">🌿</span>
              </div>

              <KeepsakeCard onUnwrap={handleUnwrap} compact={true} />
            </div>
          ) : (
            /* Screen Content State 2: Unwrapped Mobile Page */
            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#EFF3EA] via-[#F8F5EE] to-[#FAF6EE]">
              {/* Mobile App Header */}
              <div className="bg-white/90 backdrop-blur-md border-b border-[#241621]/8 px-3 py-1.5 flex items-center justify-between shrink-0">
                <SocioDexLogo size="xs" />

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleWrapBack}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-[#E4603C] bg-[#E4603C]/10 hover:bg-[#E4603C]/20 px-2 py-0.5 rounded-full transition-all cursor-pointer"
                    title="Wrap back to keepsake"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Keepsake</span>
                  </button>
                  <div className="h-5 w-5 rounded-full bg-[#E4603C]/10 text-[9px] font-bold text-[#E4603C] flex items-center justify-center border border-[#E4603C]/20">
                    S
                  </div>
                </div>
              </div>

              {/* Mobile Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-4 no-scrollbar">
                <CelebrationHeroCard onAddPostClick={onAddPostTrigger} compact={true} />

                <MockFeedTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  likes={likes}
                  onLike={(key) => {
                    setLikes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
                    toast.success("Loved this memory! ❤️");
                  }}
                />
              </div>

              {/* Bottom Floating Bar */}
              <div className="p-2 bg-white/90 backdrop-blur-md border-t border-[#241621]/8 flex items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={onAddPostTrigger}
                  className="w-full py-1.5 px-3 rounded-full bg-[#E4603C] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#E4603C]/25 hover:bg-[#c94b29] active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-3 w-3 stroke-[3]" />
                  <span>Post Memory</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Home Indicator Bar */}
          <div className="bg-[#FAF6EE] py-1 flex justify-center shrink-0">
            <div className="w-20 h-1 bg-neutral-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
