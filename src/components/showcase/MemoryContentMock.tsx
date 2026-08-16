import React, { useState } from "react";
import {
  Heart,
  Calendar,
  Sparkles,
  Plus,
  Play,
  Pause,
  Volume2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Check,
  CheckCircle2,
} from "lucide-react";

export interface MockMemoryState {
  wishesLikes: { emma: number; marcus: number; chloe: number };
  activeTab: "all" | "wishes" | "photos" | "audios" | "rsvps";
  isPlayingAudio: boolean;
}

/* ─── Loved Ones Avatar List Data ─── */
export const MOCK_LOVED_ONES = [
  { initial: "s", name: "Sajan", bg: "#F4ECE0", text: "#27500A" },
  { initial: "X", name: "Xavier", bg: "#E6F1FB", text: "#0C447C" },
  { initial: "S", name: "Sarah", bg: "#FAEEDA", text: "#633806" },
  { initial: "V", name: "Vicky", bg: "#EEEDFE", text: "#3C3489" },
  { initial: "p", name: "Priya", bg: "#FAECE7", text: "#712B13" },
  { initial: "V", name: "Varun", bg: "#F1EFE8", text: "#444441" },
  { initial: "T", name: "Tara", bg: "#E6F1FB", text: "#0C447C" },
];

/* ─── Main Celebration Hero Card (Exact replica of Image 2, scaled comfortably) ─── */
export function CelebrationHeroCard({
  onAddPostClick,
  compact = false,
}: {
  onAddPostClick?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="relative w-full text-center">
      {/* Background Soft Confetti Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-40">
        <span className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-[#C17F5A]/40" />
        <span className="absolute top-8 right-10 w-2 h-2 rounded-sm bg-[#EBC85A]/50 rotate-12" />
        <span className="absolute bottom-4 left-12 w-1.5 h-1.5 rounded-full bg-[#E4603C]/40" />
        <span className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-sm bg-[#5C3A50]/40 rotate-45" />
      </div>

      {/* Main White Card Container */}
      <div
        className={`relative z-10 bg-white border border-[#241621]/10 rounded-[1.6rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgba(92,61,46,0.06)] mx-auto ${
          compact ? "p-3.5 sm:p-4 max-w-sm" : "p-4 sm:p-6 max-w-md"
        }`}
      >
        {/* Occasion Badge */}
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#C17F5A] px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
            <span>🎂</span>
            <span>Birthday</span>
          </span>
        </div>

        {/* Heading */}
        <h1
          className={`font-display font-bold text-[#241621] tracking-tight leading-tight ${
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
          style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
        >
          Happy Birthday,
          <span className="block text-[#E4603C] mt-0.5">Vipul</span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-500 text-[11px] sm:text-xs mt-1 font-medium">
          With love from <strong className="text-neutral-800 font-bold">Sajan</strong>
        </p>

        {/* Date */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-neutral-500 mt-2">
          <Calendar className="h-3 w-3 text-[#C17F5A]" />
          <span>Monday, 31 August 2026</span>
        </div>

        {/* Live Stats Row with Dividers */}
        <div className="mt-4 border-t border-neutral-100 pt-3 flex justify-around items-center max-w-[240px] mx-auto">
          <div className="text-center">
            <span className="block text-base sm:text-lg font-bold text-neutral-800">4</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Wishes
            </span>
          </div>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="text-center">
            <span className="block text-base sm:text-lg font-bold text-neutral-800">5</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Photos
            </span>
          </div>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="text-center">
            <span className="block text-base sm:text-lg font-bold text-neutral-800">0</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
              Attending
            </span>
          </div>
        </div>
      </div>

      {/* Loved Ones Avatar Bar */}
      <div className="mt-3 flex items-center justify-center gap-2 bg-white/80 backdrop-blur-xs border border-[#241621]/8 rounded-full py-1 px-3 max-w-sm mx-auto shadow-xs">
        <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
          Loved ones who posted:
        </span>
        <div className="flex items-center -space-x-1 overflow-hidden">
          {MOCK_LOVED_ONES.map((user, idx) => (
            <div
              key={idx}
              className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-1.5 border-white text-[9px] font-bold flex items-center justify-center shadow-xs transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: user.bg, color: user.text }}
              title={user.name}
            >
              {user.initial}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Add Post Button */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onAddPostClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E4603C] to-[#C94B29] hover:from-[#c94b29] hover:to-[#b33d1e] text-white px-4 py-1.5 text-xs font-bold shadow-md shadow-[#E4603C]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Add Post</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Mobile Keepsake Envelope / Welcome Card (Exact replica of Image 3) ─── */
export function KeepsakeCard({
  onUnwrap,
  compact = false,
}: {
  onUnwrap?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div
        className={`w-full max-w-[280px] sm:max-w-[300px] bg-[#FFFDF9] border-2 border-[#D4AF37]/35 rounded-[2rem] sm:rounded-[2.3rem] shadow-[0_15px_40px_rgba(92,61,46,0.10)] text-center relative overflow-hidden transition-all duration-300 p-4 sm:p-5`}
      >
        {/* Top Leaf Sprout Icon */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <span className="text-xl sm:text-2xl">🌿</span>
        </div>

        {/* Subtitle Badge */}
        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.14em] uppercase text-[#C17F5A] block mb-1.5">
          SocioDex Digital Memory Book
        </span>

        {/* Main Heading */}
        <h2
          className="font-display font-bold text-[#241621] text-lg sm:text-xl leading-tight mb-2"
          style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
        >
          A Memory Book for
          <span className="block text-[#E4603C] mt-0.5">Vipul</span>
        </h2>

        {/* Description Body */}
        <p className="text-neutral-600 text-[11px] leading-relaxed mb-4 px-1 font-medium">
          A living scrapbook of warm wishes, photos, and voice notes from Sajan and loved ones. Tap
          to unwrap.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onUnwrap}
          className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#C17F5A] via-[#8C4E2D] to-[#2B1D27] text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow-md shadow-[#8C4E2D]/20 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/20"
        >
          <span>✉️</span>
          <span>Unwrap Keepsake</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Mock Post Cards Feed (Comfortably scaled for tabs inside Laptop/Tablet) ─── */
export function MockFeedTabs({
  activeTab,
  onTabChange,
  likes,
  onLike,
}: {
  activeTab: "all" | "wishes" | "photos" | "audios" | "rsvps";
  onTabChange: (tab: "all" | "wishes" | "photos" | "audios" | "rsvps") => void;
  likes: { emma: number; marcus: number; chloe: number };
  onLike: (key: "emma" | "marcus" | "chloe") => void;
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <div className="space-y-3 text-left max-w-md mx-auto">
      {/* Tab Selectors */}
      <div className="flex items-center gap-1 border-b border-[#241621]/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "✨ All Memories" },
          { id: "wishes", label: "💌 Wish Wall" },
          { id: "photos", label: "📸 Photos" },
          { id: "audios", label: "🎙️ Voice Notes" },
          { id: "rsvps", label: "🥂 RSVPs" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id as any)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === t.id
                ? "bg-[#E4603C] text-white shadow-xs"
                : "text-neutral-600 hover:bg-[#FAF6F0]"
            }`}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Feed Items */}
      <div className="space-y-2.5">
        {/* Wish 1: Emma Watson */}
        {(activeTab === "all" || activeTab === "wishes") && (
          <div className="rounded-xl border border-[#241621]/10 p-3 bg-white shadow-xs space-y-2 transition-all hover:border-[#E4603C]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#E4603C] text-white text-[10px] font-bold flex items-center justify-center">
                  EW
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-neutral-800">Emma Watson</h5>
                  <span className="text-[9px] text-neutral-400">10m ago</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#E4603C] bg-[#E4603C]/10 px-2 py-0.2 rounded-full">
                💌 Wish
              </span>
            </div>
            <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
              "Happy birthday Vipul! Wishing you the absolute happiest year ahead filled with good
              health, laughter, and adventures! 🎂✨"
            </p>
            <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onLike("emma")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E4603C] hover:scale-105 transition-transform cursor-pointer"
              >
                <Heart className="h-3 w-3 fill-[#E4603C]" />
                <span>{likes.emma} Likes</span>
              </button>
              <span className="text-[9px] text-neutral-400">2 replies</span>
            </div>
          </div>
        )}

        {/* Photos Card: Sajan & Friends */}
        {(activeTab === "all" || activeTab === "photos") && (
          <div className="rounded-xl border border-[#241621]/10 p-3 bg-white shadow-xs space-y-2 transition-all hover:border-[#E4603C]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#3D2436] text-white text-[10px] font-bold flex items-center justify-center">
                  SJ
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-neutral-800">Sajan</h5>
                  <span className="text-[9px] text-neutral-400">25m ago</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#C17F5A] bg-[#C17F5A]/10 px-2 py-0.2 rounded-full">
                📸 Moments
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden h-24 sm:h-28">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300"
                alt="Celebration moment 1"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=300"
                alt="Celebration moment 2"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onLike("marcus")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E4603C] hover:scale-105 transition-transform cursor-pointer"
              >
                <Heart className="h-3 w-3 fill-[#E4603C]" />
                <span>{likes.marcus} Likes</span>
              </button>
            </div>
          </div>
        )}

        {/* Audio Note */}
        {(activeTab === "all" || activeTab === "audios") && (
          <div className="rounded-xl border border-[#241621]/10 p-3 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#EBC85A] text-[#241621] text-[10px] font-bold flex items-center justify-center">
                  GM
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-neutral-800">Grandma Mary</h5>
                  <span className="text-[9px] text-neutral-400">Voice Note</span>
                </div>
              </div>
            </div>
            <div className="p-2 bg-[#FAF6F0] rounded-lg flex items-center gap-2 border border-[#241621]/8">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="h-6 w-6 rounded-full bg-[#E4603C] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
              </button>
              <div className="flex-1 flex items-center gap-0.5">
                {[4, 8, 12, 16, 12, 8, 18, 14, 10, 6, 12, 18, 14, 10, 6, 4].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full ${
                      isPlayingAudio ? "bg-[#E4603C] animate-pulse" : "bg-[#241621]/30"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold text-neutral-500">0:42</span>
            </div>
          </div>
        )}

        {/* RSVPs Tab */}
        {activeTab === "rsvps" && (
          <div className="rounded-xl border border-[#241621]/10 p-3 bg-white shadow-xs space-y-2">
            <h4 className="text-[11px] font-bold text-neutral-800 flex items-center justify-between">
              <span>Event RSVPs</span>
              <span className="text-green-600 bg-green-50 px-2 py-0.2 rounded-full text-[9px] font-bold">
                3 Confirmed
              </span>
            </h4>
            <div className="space-y-1.5 text-[11px]">
              {["Alex Rivera", "Chloe Vance", "Marcus Bell"].map((name, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-1 border-b border-neutral-100 last:border-0"
                >
                  <span className="font-semibold text-neutral-800">{name}</span>
                  <span className="text-green-700 bg-green-50 px-2 py-0.2 rounded-full text-[9px] font-bold">
                    Attending ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
