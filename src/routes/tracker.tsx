import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore, getPageRole, type PageRole, type MemoryData } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import {
  Users,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  PlusCircle,
  Share2,
  ExternalLink,
  Lock,
  Globe,
  Clock,
  Check,
  X,
  UserCheck,
  Trash2,
  Shield,
  Heart,
  BarChart3,
  Calendar,
  Layers,
  Star,
  Settings,
  Eye,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Printer,
} from "lucide-react";
import { fetchUserMemoriesFromSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { PostcardModal } from "@/components/PostcardModal";
import { toast } from "sonner";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Memory Dashboard — SocioDex" },
      {
        name: "description",
        content:
          "Detailed celebration memory dashboard with slide-down statistical shutters: inspect total contributors, page followers, and page admins effortlessly.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const currentUser = useStore((s) => s.currentUser);
  const memories = useStore((s) => s.memories || {});
  const setMemory = useStore((s) => s.setMemory);
  const addMemory = useStore((s) => s.addMemory);
  const navigate = useNavigate();

  // Active Category Filter: "created" | "admin" | "contributed" | "followed"
  const [activeCategory, setActiveCategory] = useState<
    "created" | "admin" | "contributed" | "followed"
  >("created");

  // Track expanded shutters map { [slug]: boolean }
  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>({});

  // Active memory selected for Postcard Printing
  const [postcardMemory, setPostcardMemory] = useState<MemoryData | null>(null);

  // Convert memories object to array sorted by date descending
  const memoriesList = useMemo(() => {
    return Object.values(memories).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [memories]);

  // Fetch user memory pages from Supabase
  useEffect(() => {
    if (isSupabaseConfigured && currentUser?.email) {
      fetchUserMemoriesFromSupabase(currentUser.email).then((remoteMemories) => {
        remoteMemories.forEach((m) => setMemory(m));
      });
    }
  }, [currentUser?.email, setMemory]);

  // Seed sample memories if store is empty
  useEffect(() => {
    if (Object.keys(memories).length === 0) {
      const demo1: MemoryData = {
        slug: "sajans-golden-jubilee-celebration",
        occasion: "Sajan's Golden Jubilee Celebration",
        recipient: "Dad Sajan",
        from: "Neha Nair",
        creatorName: "Neha Nair",
        creatorEmail: "neha@example.com",
        followers: ["Neha Nair", "Sajan", "Rajan Mehta"],
        date: "2026-05-24",
        themeId: "rose-elegance",
        wishes: [
          "Happy 50th Birthday Dad! Thank you for always guiding us with endless love.",
          "Warmest wishes to Sajan uncle! May God bless you with health and joy.",
        ],
        photos: [],
        audios: [],
        videos: [],
        visibility: "friends",
        allowedActions: { addPhotos: true, addVideos: true, addComments: true },
        collaborators: [
          {
            id: "collab-1",
            name: "Rajan Mehta",
            email: "rajan@example.com",
            role: "admin",
            status: "accepted",
          },
          {
            id: "collab-2",
            name: "Dev Kapoor",
            email: "dev@example.com",
            role: "admin",
            status: "accepted",
          },
        ],
        comments: [
          {
            id: "c1",
            author: "Ananya Sharma",
            text: "Wishing you the happiest Golden Jubilee! What an incredible milestone! 🥂✨",
            timestamp: new Date().toISOString(),
            likes: 12,
            avatar: "🌸",
          },
          {
            id: "c2",
            author: "Meera Iyer",
            text: "Beautiful celebration for Dad Sajan! Sums it up perfectly.",
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            likes: 8,
            avatar: "🌷",
          },
        ],
        contributedMedia: [
          {
            id: "m1",
            src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600",
            type: "photo",
            contributorName: "Rajan Mehta",
            likes: 15,
            timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
          {
            id: "m2",
            src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600",
            type: "photo",
            contributorName: "Ananya Sharma",
            likes: 10,
            timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
          },
        ],
        collaborationRequests: [
          {
            id: "req-1",
            name: "Sunil Varma",
            email: "sunil@example.com",
            requestedActions: { addPhotos: true, addVideos: false, addComments: true },
            status: "pending",
            timestamp: new Date().toISOString(),
          },
        ],
        contributionMode: "open",
        autoApprove: false,
        pinnedContributionIds: [],
        expiresAt: null,
        contributions: [
          {
            id: "cb1",
            memory_page_id: "sajans-golden-jubilee-celebration",
            contributor_id: "user-ananya",
            contributor_name: "Ananya Sharma",
            contributor_avatar_color: "#F4ECE0",
            type: "wish",
            content_text: "Warmest wishes on your 50th birthday Uncle!",
            status: "approved",
            created_at: new Date().toISOString(),
          },
        ],
        reactions: [],
        replies: [],
      };

      const demo2: MemoryData = {
        slug: "aditi-amits-5th-wedding-anniversary",
        occasion: "Aditi & Amit's 5th Wedding Anniversary",
        recipient: "Aditi & Amit",
        from: "Dev Kapoor",
        creatorName: "Dev Kapoor",
        creatorEmail: "dev@example.com",
        followers: ["Dev Kapoor", "Vikram Kapoor"],
        date: "2026-06-12",
        themeId: "floral-sage",
        wishes: ["Congratulations to the perfect couple on 5 years together!"],
        photos: [],
        audios: [],
        videos: [],
        visibility: "public",
        allowedActions: { addPhotos: true, addVideos: true, addComments: true },
        collaborators: [
          {
            id: "collab-dev",
            name: "Dev Kapoor",
            email: "dev.kapoor@example.com",
            role: "admin",
            status: "accepted",
          },
        ],
        comments: [
          {
            id: "c4",
            author: "Vikram Kapoor",
            text: "Happy Anniversary to the beautiful couple! Have a sensational day! 💖🌸",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            likes: 8,
            avatar: "🌸",
          },
        ],
        contributedMedia: [],
        collaborationRequests: [],
        contributionMode: "open",
        autoApprove: false,
        pinnedContributionIds: [],
        expiresAt: null,
        contributions: [],
        reactions: [],
        replies: [],
      };

      addMemory(demo1);
      addMemory(demo2);
      // Default expand the first card for clear onboarding
      setExpandedSlugs({ [demo1.slug]: true });
    }
  }, [memories, addMemory]);

  // 1. Pages You Created
  const createdPages = useMemo(() => {
    return memoriesList.filter((m) => {
      const role = getPageRole(m, currentUser);
      return role === "creator" || (!currentUser && m.from?.includes("Neha"));
    });
  }, [memoriesList, currentUser]);

  // 2. Pages You are Assigned Admin of
  const adminPages = useMemo(() => {
    return memoriesList.filter((m) => {
      const role = getPageRole(m, currentUser);
      return role === "admin" || (m.collaborators && m.collaborators.some((c) => c.role === "admin"));
    });
  }, [memoriesList, currentUser]);

  // 3. Pages You Contributed To
  const contributedPages = useMemo(() => {
    return memoriesList.filter((m) => {
      const role = getPageRole(m, currentUser);
      return (
        role === "contributor" ||
        (m.comments && m.comments.length > 0) ||
        (m.contributions && m.contributions.length > 0)
      );
    });
  }, [memoriesList, currentUser]);

  // 4. Pages You Followed
  const followedPages = useMemo(() => {
    return memoriesList.filter((m) => {
      const role = getPageRole(m, currentUser);
      return role === "follower" || (m.followers && m.followers.length > 0);
    });
  }, [memoriesList, currentUser]);

  // Active Category List based on selected tab
  const displayedCategoryPages = useMemo(() => {
    switch (activeCategory) {
      case "created":
        return createdPages;
      case "admin":
        return adminPages;
      case "contributed":
        return contributedPages;
      case "followed":
        return followedPages;
      default:
        return createdPages;
    }
  }, [activeCategory, createdPages, adminPages, contributedPages, followedPages]);

  // Toggle shutter expansion for a particular memory page
  const toggleShutter = (slug: string) => {
    setExpandedSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Expand all in current category
  const expandAll = () => {
    const next: Record<string, boolean> = { ...expandedSlugs };
    displayedCategoryPages.forEach((m) => {
      next[m.slug] = true;
    });
    setExpandedSlugs(next);
  };

  // Collapse all in current category
  const collapseAll = () => {
    const next: Record<string, boolean> = { ...expandedSlugs };
    displayedCategoryPages.forEach((m) => {
      next[m.slug] = false;
    });
    setExpandedSlugs(next);
  };

  const copyPublicLink = (slug: string) => {
    const url = `${window.location.origin}/m/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public memory link copied to clipboard!");
  };

  const areAllExpanded =
    displayedCategoryPages.length > 0 &&
    displayedCategoryPages.every((m) => !!expandedSlugs[m.slug]);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#241621]/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E4603C]">
            SocioDex Hub
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#241621]">
            Memory Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#594855] max-w-xl">
            Tap any memory card to slide open its complete statistics, contributors, followers, and admins.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/scheduler"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#241621] hover:text-[#E4603C] hover:border-[#E4603C]/40 shadow-xs transition-all cursor-pointer select-none active:scale-95"
          >
            <Calendar className="h-4 w-4 text-[#E4603C]" />
            <span>Auto-Scheduler</span>
          </Link>
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer select-none active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Memory</span>
          </Link>
        </div>
      </div>

      {/* 4 CATEGORY FILTER TABS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
        <button
          onClick={() => setActiveCategory("created")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "created"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E4603C] flex items-center gap-1">
              👑 1. Created
            </span>
            <span className="text-[11px] font-bold bg-[#E4603C] text-white px-2 py-0.5 rounded-full">
              {createdPages.length}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="font-display text-base sm:text-lg font-bold text-[#241621]">Created by You</div>
            <div className="text-[10px] sm:text-[11px] text-[#594855]">Full owner privileges</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("admin")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "admin"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1">
              🛡️ 2. Admin Of
            </span>
            <span className="text-[11px] font-bold bg-[#241621] text-white px-2 py-0.5 rounded-full">
              {adminPages.length}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="font-display text-base sm:text-lg font-bold text-[#241621]">Assigned Admin</div>
            <div className="text-[10px] sm:text-[11px] text-[#594855]">Moderator control</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("contributed")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "contributed"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1">
              ✍️ 3. Contributed
            </span>
            <span className="text-[11px] font-bold bg-[#EBC85A] text-[#241621] px-2 py-0.5 rounded-full">
              {contributedPages.length}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="font-display text-base sm:text-lg font-bold text-[#241621]">Contributed</div>
            <div className="text-[10px] sm:text-[11px] text-[#594855]">Wishes & media</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("followed")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "followed"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1">
              ⭐ 4. Followed
            </span>
            <span className="text-[11px] font-bold bg-[#F4ECE0] text-[#241621] px-2 py-0.5 rounded-full">
              {followedPages.length}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="font-display text-base sm:text-lg font-bold text-[#241621]">Followed</div>
            <div className="text-[10px] sm:text-[11px] text-[#594855]">Subscribed pages</div>
          </div>
        </button>
      </div>

      {/* SECTION HEADER WITH EXPAND / COLLAPSE ALL CONTROLS */}
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#594855] flex items-center gap-2">
          <span>YOUR MEMORY CARDS ({displayedCategoryPages.length})</span>
        </h2>

        {displayedCategoryPages.length > 0 && (
          <button
            type="button"
            onClick={areAllExpanded ? collapseAll : expandAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-white px-3 py-1 text-[11px] font-bold text-[#594855] hover:text-[#E4603C] hover:border-[#E4603C]/40 transition cursor-pointer select-none shadow-2xs"
          >
            <ChevronsUpDown className="h-3.5 w-3.5 text-[#E4603C]" />
            <span>{areAllExpanded ? "Collapse All Shutters" : "Open All Shutters"}</span>
          </button>
        )}
      </div>

        {/* LIST OF MEMORY CARDS WITH SLIDE-DOWN INLINE SHUTTER */}
        <div className="space-y-4">
          {displayedCategoryPages.map((mem) => (
            <MemoryShutterCard
              key={mem.slug}
              mem={mem}
              isOpen={!!expandedSlugs[mem.slug]}
              onToggle={() => toggleShutter(mem.slug)}
              onCopyLink={copyPublicLink}
              onPrintPostcard={(m) => setPostcardMemory(m)}
            />
          ))}

          {displayedCategoryPages.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#241621]/20 p-10 text-center bg-white shadow-xs">
              <Sparkles className="mx-auto h-8 w-8 text-[#E4603C] mb-2 animate-bounce" />
              <h3 className="font-display text-base font-bold text-[#241621]">
                No memory pages in this category yet
              </h3>
              <p className="text-xs text-[#594855] mt-1 max-w-sm mx-auto">
                Create a new memory page to preserve celebrations, or explore pages shared by your friends.
              </p>
              <Link
                to="/creator"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Create a Memory Page</span>
              </Link>
            </div>
          )}
        </div>

        {/* ── POSTCARD PHYSICAL PRINT & PREVIEW MODAL ── */}
        <PostcardModal
          memory={postcardMemory}
          isOpen={!!postcardMemory}
          onClose={() => setPostcardMemory(null)}
        />
      </div>
    );
  }

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL MEMORY CARD WITH SLIDE-DOWN SHUTTER ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
interface MemoryShutterCardProps {
  mem: MemoryData;
  isOpen: boolean;
  onToggle: () => void;
  onCopyLink: (slug: string) => void;
  onPrintPostcard: (mem: MemoryData) => void;
}

function MemoryShutterCard({
  mem,
  isOpen,
  onToggle,
  onCopyLink,
  onPrintPostcard,
}: MemoryShutterCardProps) {
  const pendingCount =
    mem.collaborationRequests?.filter((r) => r.status === "pending").length || 0;

  // Aggregate unique contributors
  const uniqueContributors = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ name: string; avatarColor?: string; count: number }> = [];

    (mem.comments || []).forEach((c) => {
      if (c.author && !seen.has(c.author.toLowerCase().trim())) {
        seen.add(c.author.toLowerCase().trim());
        list.push({ name: c.author, count: 1 });
      }
    });

    (mem.contributedMedia || []).forEach((m) => {
      if (m.contributorName && !seen.has(m.contributorName.toLowerCase().trim())) {
        seen.add(m.contributorName.toLowerCase().trim());
        list.push({ name: m.contributorName, count: 1 });
      }
    });

    (mem.contributions || []).forEach((c) => {
      const name = c.contributor_name || "Contributor";
      if (name && !seen.has(name.toLowerCase().trim())) {
        seen.add(name.toLowerCase().trim());
        list.push({
          name: name,
          avatarColor: c.contributor_avatar_color || "#E4603C",
          count: 1,
        });
      }
    });

    return list;
  }, [mem]);

  const wishContributionsCount = (mem.contributions || []).filter((c) => c.type === "wish").length;
  const commentsCount = (mem.comments?.length || 0) + (mem.wishes?.length || 0) + wishContributionsCount;

  const mediaContributionsCount = (mem.contributions || []).filter(
    (c) => c.type === "photo" || c.type === "video" || c.type === "audio"
  ).length;
  const mediaCount =
    (mem.contributedMedia?.length || 0) +
    (mem.photos?.length || 0) +
    (mem.videos?.length || 0) +
    (mem.audios?.length || 0) +
    mediaContributionsCount;

  const collaboratorsCount = Math.max(
    mem.collaborators?.length || 0,
    uniqueContributors.length > 0 ? uniqueContributors.length : 1
  );
  const followersCount = Math.max(mem.followers?.length || 0, 1);

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "bg-[#FFFDF9] border-[#E4603C] shadow-lg ring-2 ring-[#E4603C]/20"
          : "bg-white border-[#241621]/12 hover:border-[#E4603C]/40 hover:shadow-md shadow-xs"
      }`}
    >
      {/* ── CARD HEADER (Clickable to slide down details) ── */}
      <div
        onClick={onToggle}
        className="p-4 sm:p-5 cursor-pointer select-none transition-colors hover:bg-[#FAF6F0]/60 flex flex-col gap-3"
      >
        {/* Top Badges & Shutter Button Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4603C]/10 text-[#E4603C] uppercase tracking-wide">
              {mem.visibility || "PUBLIC"}
            </span>
            <span className="text-[11px] font-semibold text-[#594855] flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#594855]/70" />
              {new Date(mem.date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Action Buttons: Quick Print Postcard + Shutter Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrintPostcard(mem);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFDF9] hover:bg-[#E4603C]/10 text-[#241621] hover:text-[#E4603C] border border-[#241621]/15 hover:border-[#E4603C]/40 transition-all cursor-pointer select-none shadow-2xs"
              title="Print Postcard Size Physical Keepsake Record"
            >
              <Printer className="h-3.5 w-3.5 text-[#E4603C]" />
              <span className="hidden sm:inline">Print Postcard</span>
            </button>

            {/* Shutter Toggle Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none shadow-2xs ${
                isOpen
                  ? "bg-[#E4603C] text-white hover:bg-[#c94b29]"
                  : "bg-[#FFFDF9] hover:bg-[#E4603C]/10 text-[#241621] border border-[#241621]/15 hover:border-[#E4603C]/40 hover:text-[#E4603C]"
              }`}
            >
              <span>{isOpen ? "Close Shutter" : "View Stats"}</span>
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-white animate-pulse" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#E4603C]" />
              )}
            </button>
          </div>
        </div>

        {/* Title and Recipient */}
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#241621] leading-snug">
            {mem.customHeading || mem.occasion}
          </h3>
          <p className="text-xs sm:text-sm text-[#594855] font-medium mt-0.5">
            For: <strong className="text-[#241621]">{mem.recipient}</strong>
          </p>
        </div>

        {/* Quick Summary Preview Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#241621]/8 text-xs text-[#594855]">
          <div className="flex items-center gap-3.5">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Approved Collaborators"
            >
              <Users className="h-3.5 w-3.5 text-[#E4603C]" /> {collaboratorsCount}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Guest Wishes & Comments"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" /> {commentsCount}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Media Uploads"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#E4603C]" /> {mediaCount}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Followers"
            >
              <Star className="h-3.5 w-3.5 text-[#EBC85A]" /> {followersCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="rounded-full bg-[#E4603C] text-white px-2 py-0.5 font-bold text-[10px] animate-pulse">
                {pendingCount} pending request{pendingCount > 1 ? "s" : ""}
              </span>
            )}
            <span className="text-[11px] font-semibold text-[#E4603C]">
              {isOpen ? "▲ Details open below" : "▼ Press to slide down details"}
            </span>
          </div>
        </div>
      </div>

      {/* ── SLIDE-DOWN EXPANDED SHUTTER DETAILS PANEL ── */}
      {isOpen && (
        <div className="border-t border-[#241621]/10 bg-[#FAF6F0]/60 p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Quick Header Bar with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#241621]/10 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#E4603C] bg-[#E4603C]/10 px-2.5 py-1 rounded-full border border-[#E4603C]/20 uppercase text-[10px]">
                Theme: {mem.themeId ? mem.themeId.split("-")[0]?.toUpperCase() : "ROSE"}
              </span>
              <span className="text-[#594855] text-xs">
                Created by <strong className="text-[#241621]">{mem.creatorName || mem.from}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPrintPostcard(mem)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-[#FFFDF9] px-3.5 py-1.5 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] hover:text-[#E4603C] hover:border-[#E4603C]/40 transition cursor-pointer select-none shadow-2xs"
                title="Print 4x6 Postcard Physical Record with QR Code"
              >
                <Printer className="h-3.5 w-3.5 text-[#E4603C]" />
                <span>Print Postcard</span>
              </button>
              <button
                type="button"
                onClick={() => onCopyLink(mem.slug)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-[#FFFDF9] px-3.5 py-1.5 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] hover:text-[#E4603C] transition cursor-pointer select-none shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </button>
              <a
                href={`/m/${mem.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer select-none"
              >
                <span>Live Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* 5 KEY STAT CARDS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Collaborators */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between shadow-2xs">
              <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#E4603C]" /> Collaborators
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#241621]">
                {collaboratorsCount}
              </div>
              <div className="text-[10px] text-[#594855] mt-0.5">Approved Roster</div>
            </div>

            {/* 2. Guest Comments */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between shadow-2xs">
              <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" /> Guest Comments
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#241621]">
                {commentsCount}
              </div>
              <div className="text-[10px] text-[#594855] mt-0.5">Wishes & Notes</div>
            </div>

            {/* 3. Media Uploads */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between shadow-2xs">
              <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5 text-[#E4603C]" /> Media Uploads
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#241621]">
                {mediaCount}
              </div>
              <div className="text-[10px] text-[#594855] mt-0.5">Photos & Videos</div>
            </div>

            {/* 4. Page Followers */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between shadow-2xs">
              <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[#EBC85A]" /> Page Followers
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#241621]">
                {followersCount}
              </div>
              <div className="text-[10px] text-[#594855] mt-0.5">Subscribed Users</div>
            </div>

            {/* 5. Pending Requests */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between col-span-2 sm:col-span-1 shadow-2xs">
              <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                <UserPlus className="h-3.5 w-3.5 text-[#E4603C]" /> Requests
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#241621]">
                {pendingCount}
              </div>
              <div className="text-[10px] text-[#594855] mt-0.5">Awaiting Review</div>
            </div>
          </div>

          {/* 3 INTERACTIVE ROSTERS BREAKDOWN */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* 1. TOTAL CONTRIBUTORS ROSTER */}
            <div className="rounded-2xl border border-[#241621]/12 bg-white p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2">
                <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5">
                  ✍️ Contributors ({uniqueContributors.length})
                </h4>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {uniqueContributors.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span
                        className="h-6 w-6 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 text-white shadow-2xs"
                        style={{ backgroundColor: c.avatarColor || "#E4603C" }}
                      >
                        {c.name[0]?.toUpperCase() || "U"}
                      </span>
                      <span className="font-bold text-[#241621] truncate">{c.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        useChatStore.getState().openChatWithContributor({
                          name: c.name,
                          avatar: c.name[0]?.toUpperCase() || "👤",
                          avatarColor: c.avatarColor || "#E4603C",
                          memorySlug: mem.slug,
                          memoryTitle: mem.occasion || mem.recipient,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#E4603C]/10 hover:bg-[#E4603C]/20 border border-[#E4603C]/20 px-2 py-0.5 text-[10px] font-bold text-[#E4603C] transition cursor-pointer select-none shrink-0"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Message</span>
                    </button>
                  </div>
                ))}
                {uniqueContributors.length === 0 && (
                  <div className="text-xs text-[#594855] text-center py-3">No contributors yet.</div>
                )}
              </div>
            </div>

            {/* 2. PAGE FOLLOWERS ROSTER */}
            <div className="rounded-2xl border border-[#241621]/12 bg-white p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2">
                <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5">
                  ⭐ Followers ({followersCount})
                </h4>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(mem.followers || [mem.from]).map((followerName, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className="h-6 w-6 rounded-full bg-[#EBC85A]/25 text-[#241621] font-bold flex items-center justify-center text-[11px] shrink-0">
                        ⭐
                      </span>
                      <span className="font-bold text-[#241621] truncate">{followerName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        useChatStore.getState().openChatWithContributor({
                          name: followerName,
                          avatar: "⭐",
                          avatarColor: "#EBC85A",
                          role: "follower",
                          memorySlug: mem.slug,
                          memoryTitle: mem.occasion || mem.recipient,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 hover:bg-[#FAF6F0] border border-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 hover:text-[#E4603C] transition cursor-pointer select-none shrink-0"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PAGE ADMINS ROSTER */}
            <div className="rounded-2xl border border-[#241621]/12 bg-white p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2">
                <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5">
                  🛡️ Admins ({collaboratorsCount})
                </h4>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {/* Owner / Creator */}
                <div className="p-2 rounded-xl bg-[#E4603C]/5 border border-[#E4603C]/20 flex items-center justify-between text-xs">
                  <div className="truncate pr-1">
                    <div className="font-bold text-[#241621] truncate">
                      👑 {mem.creatorName || mem.from}
                    </div>
                    <div className="text-[9px] text-[#594855]">Creator (Owner)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      useChatStore.getState().openChatWithContributor({
                        name: mem.creatorName || mem.from,
                        avatar: "👑",
                        avatarColor: "#E4603C",
                        role: "creator",
                        memorySlug: mem.slug,
                        memoryTitle: mem.occasion || mem.recipient,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white px-2 py-0.5 text-[10px] font-bold shadow-xs transition cursor-pointer select-none shrink-0"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Message</span>
                  </button>
                </div>

                {/* Collaborator Admins */}
                {mem.collaborators?.map((collab) => (
                  <div
                    key={collab.id}
                    className="p-2 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-1">
                      <div className="font-bold text-[#241621] truncate">{collab.name}</div>
                      <div className="text-[9px] text-[#594855] truncate">{collab.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        useChatStore.getState().openChatWithContributor({
                          name: collab.name,
                          emailOrId: collab.email,
                          avatar: collab.name[0]?.toUpperCase() || "👤",
                          avatarColor: "#3E4A75",
                          role: "admin",
                          memorySlug: mem.slug,
                          memoryTitle: mem.occasion || mem.recipient,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#3E4A75]/10 hover:bg-[#3E4A75]/20 border border-[#3E4A75]/20 px-2 py-0.5 text-[10px] font-bold text-[#3E4A75] transition cursor-pointer select-none shrink-0"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM SHUTTER UP CLOSE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FAF6F0] border border-[#241621]/15 text-xs font-bold text-[#594855] hover:text-[#E4603C] flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-[0.99]"
          >
            <ChevronUp className="h-4 w-4 text-[#E4603C]" />
            <span>Shutter Up / Close Details</span>
          </button>
        </div>
      )}
    </div>
  );
}
