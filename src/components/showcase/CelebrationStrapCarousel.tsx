import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

interface MilestoneItem {
  id: string;
  pill: string;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}

const MILESTONES: MilestoneItem[] = [
  {
    id: "birthdays",
    pill: "Popular",
    emoji: "🎂",
    title: "Birthdays",
    desc: "Turn birthday messages into a vibrant digital guestbook with photos and voice notes.",
    color: "bg-[#E4603C]/10 text-[#E4603C] border-[#E4603C]/20",
  },
  {
    id: "weddings",
    pill: "Luxury",
    emoji: "💍",
    title: "Weddings",
    desc: "Collect wedding wishes, guest RSVPs, and live photo streams from every table in one place.",
    color: "bg-[#EBC85A]/15 text-[#9E7B15] border-[#EBC85A]/30",
  },
  {
    id: "corporate",
    pill: "Teams",
    emoji: "🏢",
    title: "Corporate Events",
    desc: "Celebrate product launches, team milestones, and annual company retreats.",
    color: "bg-[#5C3A50]/10 text-[#5C3A50] border-[#5C3A50]/20",
  },
  {
    id: "graduations",
    pill: "Milestone",
    emoji: "🎓",
    title: "Graduations",
    desc: "Preserve memories, group photos, and advice for graduates from family and friends.",
    color: "bg-[#C17F5A]/15 text-[#C17F5A] border-[#C17F5A]/25",
  },
  {
    id: "baby-showers",
    pill: "Joyful",
    emoji: "👶",
    title: "Baby Showers",
    desc: "Welcome the new arrival with heartfelt wishes, registry links, and ultrasound photos.",
    color: "bg-[#E4603C]/10 text-[#E4603C] border-[#E4603C]/20",
  },
  {
    id: "anniversaries",
    pill: "Love",
    emoji: "💖",
    title: "Anniversaries",
    desc: "Look back at decades of love with a timeline of photos and messages from loved ones.",
    color: "bg-[#E4603C]/10 text-[#E4603C] border-[#E4603C]/20",
  },
  {
    id: "farewells",
    pill: "Heartfelt",
    emoji: "🥳",
    title: "Farewells",
    desc: "Replace paper cards with a permanent digital farewell book for departing colleagues.",
    color: "bg-[#5C3A50]/10 text-[#5C3A50] border-[#5C3A50]/20",
  },
  {
    id: "reunions",
    pill: "Family",
    emoji: "👨‍👩‍👧‍👦",
    title: "Reunions",
    desc: "Bring generations together to document family history, recipes, and gathering photos.",
    color: "bg-[#EBC85A]/15 text-[#9E7B15] border-[#EBC85A]/30",
  },
];

// Duplicate for seamless 360° infinite revolving ribbon
const ALL_MILESTONES = [...MILESTONES, ...MILESTONES];

export function CelebrationStrapCarousel() {
  const currentUser = useStore((s) => s.currentUser);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (currentUser) {
      navigate({ to: "/creator" });
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto select-none py-2 overflow-hidden">
      {/* ── AMBIENT EDGE GRADIENTS FOR SEAMLESS 360° DEPTH ── */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAF6F0] via-[#FAF6F0]/80 to-transparent z-20 pointer-events-none" />

      {/* ── CONTINUOUS SEAMLESS REVOLVING STRAP TRACK ── */}
      <div className="animate-continuous-marquee flex items-center gap-4 py-2">
        {ALL_MILESTONES.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            onClick={handleCardClick}
            className="w-[240px] sm:w-[270px] shrink-0 rounded-2xl bg-white border border-[#241621]/10 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#E4603C]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl sm:text-3xl transition-transform group-hover:scale-110">
                  {item.emoji}
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${item.color}`}
                >
                  {item.pill}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-display text-base sm:text-lg font-bold text-[#241621] mb-1 group-hover:text-[#E4603C] transition-colors"
                style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#6B5A66] leading-relaxed line-clamp-2 font-medium">
                {item.desc}
              </p>
            </div>

            {/* Action Hint */}
            <div className="pt-2.5 mt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10.5px] font-bold text-neutral-400 group-hover:text-[#E4603C] transition-colors">
              <span>Create Memory Book</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
