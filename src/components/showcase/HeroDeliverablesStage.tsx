import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import {
  Heart,
  Calendar,
  Send,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export function HeroDeliverablesStage() {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [reminderSubmitted, setReminderSubmitted] = useState(false);
  const [heroLikes, setHeroLikes] = useState(4);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    QRCode.toDataURL("https://sociodex.com/m/vipul-2ak5", {
      width: 180,
      margin: 1,
      color: { dark: "#241621", light: "#FFFFFF" },
    }).then(setQrUrl);
  }, []);

  const handleLike = () => {
    if (!hasLiked) {
      setHeroLikes((prev) => prev + 1);
      setHasLiked(true);
      toast.success("❤️ Added love to Vipul's birthday page!");
    } else {
      setHeroLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleReminderContribution = () => {
    setReminderSubmitted(true);
    toast.success("🎉 Added a celebratory wish for Vipul!", {
      description: "Live synced across Laptop Screen and Physical Postcard QR Code.",
    });
    setTimeout(() => setReminderSubmitted(false), 4000);
  };

  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[520px] mx-auto lg:mx-0 select-none py-1 sm:py-2">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[540px] h-[360px] bg-gradient-to-tr from-[#EBC85A]/15 via-[#E4603C]/12 to-[#5C3A50]/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── UNIFIED STAGE: POSTCARD (LEFT) + TILTED LAPTOP (CENTER) + RECEIVED MESSAGE (RIGHT) ── */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center lg:justify-start">
        {/* ══════════════════════════════════════════════════════════════════════
            1. CENTER / BACKGROUND: COMPACT TILTED LAPTOP SCREEN
            ══════════════════════════════════════════════════════════════════════ */}
        <div
          className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] transition-transform duration-500 hover:scale-[1.01]"
          style={{ perspective: "1200px" }}
        >
          <div
            className="rounded-[1.2rem] bg-[#1E1E24] p-2 shadow-[0_20px_50px_rgba(36,22,33,0.2)] border border-[#3A3A42] transform lg:[transform:rotateY(-4deg)_rotateX(2.5deg)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Webcam */}
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111] ring-1 ring-white/10" />
              <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Laptop Browser Omnibox */}
            <div className="bg-[#E2EAE0] border-b border-[#241621]/10 px-2.5 py-0.8 rounded-t-md flex items-center justify-between text-[9px] text-neutral-600">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F56]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
              </div>
              <div className="font-semibold text-[8.5px] sm:text-[9px] text-neutral-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-neutral-200 flex items-center gap-1">
                <Lock className="h-2 w-2 text-emerald-600" />
                <span>sociodex.com/m/vipul-birthday</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100/80 px-1 py-0.2 rounded-full">
                ● LIVE
              </span>
            </div>

            {/* Inner Memory Page Navbar */}
            <div className="bg-white/95 border-b border-[#241621]/8 px-2.5 py-1 flex items-center justify-between">
              <SocioDexLogo size="xs" />
              <div className="flex items-center gap-1 text-[8px] font-bold">
                <span className="bg-[#E4603C]/10 text-[#E4603C] px-1.5 py-0.5 rounded-full border border-[#E4603C]/20">
                  👑 Creator
                </span>
                <span className="border border-neutral-200 px-1.5 py-0.5 rounded-full bg-white text-neutral-700">
                  ⭐ Follow
                </span>
                <div className="h-4 w-4 rounded-full bg-[#E4603C]/15 text-[#E4603C] flex items-center justify-center text-[7px]">
                  S
                </div>
              </div>
            </div>

            {/* Inner Memory Screen Body */}
            <div className="bg-[#EBF1E6] p-2.5 sm:p-3 rounded-b-md border border-[#241621]/10 flex flex-col items-center">
              <div className="w-full bg-white rounded-lg p-2.5 sm:p-3 border border-[#241621]/10 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[#C17F5A] bg-[#C17F5A]/10 px-2 py-0.5 rounded-full">
                    🎂 Birthday
                  </span>
                  <div className="flex items-center gap-1 text-[8.5px] text-neutral-500 font-semibold">
                    <Calendar className="h-2.5 w-2.5 text-[#C17F5A]" />
                    <span>31 Aug 2026</span>
                  </div>
                </div>

                <div>
                  <h3
                    className="font-display text-sm sm:text-base font-bold text-[#241621] leading-tight"
                    style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
                  >
                    Happy Birthday, <span className="text-[#E4603C]">Vipul</span>
                  </h3>
                  <p className="text-[9px] text-neutral-500 font-medium mt-0.5">
                    With love from Sajan
                  </p>
                </div>

                {/* 3 Stats Columns */}
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={handleLike}
                    className="p-1 rounded-md bg-[#FAF6EE] hover:bg-[#FAF0E6] transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-[#241621] flex items-center justify-center gap-0.5">
                      <Heart
                        className={`h-2.5 w-2.5 ${
                          hasLiked ? "fill-[#E4603C] text-[#E4603C]" : "text-neutral-400"
                        }`}
                      />
                      <span>{heroLikes}</span>
                    </div>
                    <div className="text-[7px] font-bold text-neutral-500 uppercase">Wishes</div>
                  </button>

                  <div className="p-1 rounded-md bg-[#FAF6EE]">
                    <div className="text-[10px] font-extrabold text-[#241621]">5</div>
                    <div className="text-[7px] font-bold text-neutral-500 uppercase">Photos</div>
                  </div>

                  <div className="p-1 rounded-md bg-[#FAF6EE]">
                    <div className="text-[10px] font-extrabold text-[#241621]">0</div>
                    <div className="text-[7px] font-bold text-neutral-500 uppercase">Attending</div>
                  </div>
                </div>

                {/* Loved Ones Avatar Row */}
                <div className="pt-0.5 flex items-center justify-between text-[8.5px] text-neutral-600 font-semibold">
                  <span className="text-[7.5px] uppercase tracking-wider text-neutral-400">
                    Loved Ones:
                  </span>
                  <div className="flex -space-x-1">
                    {["s", "X", "S", "V", "p", "V", "T"].map((char, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full bg-[#E4603C]/15 border border-white text-[6.5px] font-bold text-[#E4603C] flex items-center justify-center shadow-2xs"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base */}
            <div className="w-[102%] -ml-[1%] h-2 bg-gradient-to-b from-[#C4C4CD] to-[#8C8C96] rounded-b-sm shadow-xs flex justify-center items-start">
              <div className="w-10 h-0.5 bg-[#666] rounded-b-xs" />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            2. FOREGROUND LEFT: 💌 PROPORTIONED 6" × 4" PHYSICAL POSTCARD
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute -top-4 -left-2 sm:-left-5 z-20 w-48 sm:w-52 aspect-[3/2] bg-[#FAF7F0] border border-[#241621]/15 rounded-xl p-2 shadow-[0_15px_35px_rgba(92,61,46,0.16)] transition-transform duration-300 hover:scale-105 hover:-translate-y-1">
          {/* Stitched Inner Border */}
          <div className="border border-dashed border-[#241621]/15 rounded-lg p-1.5 h-full flex flex-col justify-between">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <span className="text-[6.5px] font-extrabold uppercase tracking-wider text-[#C17F5A] bg-[#C17F5A]/10 px-1.5 py-0.2 rounded-full">
                Physical Record
              </span>
              <span className="text-[7.5px] font-semibold text-neutral-500">31 Aug 2026</span>
            </div>

            {/* Middle Content */}
            <div className="flex items-center justify-between gap-1 my-auto">
              <div className="text-left space-y-0.5">
                <h4
                  className="font-display text-[11px] font-extrabold text-[#241621] leading-tight"
                  style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
                >
                  Birthday
                </h4>
                <div className="text-[7.5px] text-neutral-600 font-medium">
                  For: <strong className="text-[#241621]">Vipul</strong> • From:{" "}
                  <strong className="text-[#241621]">Sajan</strong>
                </div>
                {/* Quote Bubble */}
                <div className="p-1 bg-[#FAF2EB] border border-[#C17F5A]/20 rounded-md max-w-[100px]">
                  <p className="text-[6.5px] text-neutral-700 italic leading-tight line-clamp-2">
                    "Wishing you a very happy birthday Vipul!"
                  </p>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="bg-white p-0.8 rounded-lg border border-neutral-200 shadow-xs shrink-0 flex flex-col items-center">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR Bridge"
                    className="w-9 h-9 object-contain rounded-xs"
                  />
                ) : (
                  <div className="w-9 h-9 bg-neutral-100 animate-pulse rounded-xs" />
                )}
                <span className="text-[5px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                  Point Camera
                </span>
              </div>
            </div>

            {/* Bottom URL */}
            <div className="flex items-center justify-between text-[6px] text-neutral-400 border-t border-[#241621]/8 pt-0.5">
              <span className="font-mono">sociodex.com/m/vipul-2ak5</span>
              <span className="font-bold text-[#C17F5A]">4" × 6" Keepsake</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            3. FOREGROUND RIGHT: 🔔 AUTHENTIC RECEIVED MESSAGE FROM SOCIODEX
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute -bottom-5 -right-2 sm:-right-5 z-30 w-52 sm:w-56 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#241621]/15 shadow-[0_18px_40px_rgba(36,22,33,0.18)] space-y-1.5 transition-transform duration-300 hover:scale-105 hover:-translate-y-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-md bg-[#E4603C] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                ✨
              </div>
              <span className="text-[8.5px] font-extrabold tracking-wider text-[#241621] uppercase">
                SocioDex Alert
              </span>
            </div>
            <span className="text-[7.5px] font-semibold text-neutral-400">NOW</span>
          </div>

          {/* Message Notification Content */}
          <div className="space-y-0.5 text-left">
            <h5 className="text-[10px] font-bold text-[#241621] leading-snug">
              🎂 Sajan invited you to Vipul's Birthday!
            </h5>
            <p className="text-[8.5px] text-neutral-600 leading-tight">
              "Share your wishes, photos & voice memories before August 31st."
            </p>
          </div>

          {/* Interactive CTA Button */}
          <button
            type="button"
            onClick={handleReminderContribution}
            className="w-full py-1.5 px-2 rounded-lg bg-[#E4603C] hover:bg-[#c94b29] text-white font-bold text-[9px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
          >
            {reminderSubmitted ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-white" />
                <span>Memory Submitted! 🎉</span>
              </>
            ) : (
              <>
                <Send className="h-2.5 w-2.5" />
                <span>Add Your Wish or Photo →</span>
              </>
            )}
          </button>

          {/* Micro Footer */}
          <div className="text-[7px] text-neutral-400 text-center font-medium">
            🔒 Private celebration link • No app required
          </div>
        </div>
      </div>
    </div>
  );
}
