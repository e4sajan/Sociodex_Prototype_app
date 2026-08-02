import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore, getPageRole, type PageRole, type MemoryData } from "@/lib/store";
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
} from "lucide-react";

const toast = {
  success: (msg: string) => console.log("[Toast Success]", msg),
  error: (msg: string) => console.log("[Toast Error]", msg),
};

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Memory Dashboard — SocioDex" },
      {
        name: "description",
        content:
          "Detailed celebration memory dashboard with selected card info: total contributors, page followers, and page admins.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const currentUser = useStore((s) => s.currentUser);
  const memories = useStore((s) => s.memories || {});
  const addMemory = useStore((s) => s.addMemory);
  const removeCollaboratorFromMemory = useStore((s) => s.removeCollaboratorFromMemory);
  const updateSimulatedContributionStatus = useStore(
    (s) => s.updateSimulatedContributionStatus
  );
  const navigate = useNavigate();

  // Active Category Filter: "created" | "admin" | "contributed" | "followed"
  const [activeCategory, setActiveCategory] = useState<
    "created" | "admin" | "contributed" | "followed"
  >("created");

  // Selected Memory Card Slug
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  // Convert memories object to array sorted by date descending
  const memoriesList = useMemo(() => {
    return Object.values(memories).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [memories]);

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
      setSelectedSlug(demo1.slug);
    }
  }, [memories, addMemory]);

  // 1. Pages You Created
  const createdPages = useMemo(() => {
    return memoriesList.filter((m) => {
      const role = getPageRole(m, currentUser);
      return role === "creator" || (!currentUser && m.from.includes("Neha"));
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

  // Ensure valid selected memory slug
  useEffect(() => {
    if (!selectedSlug && displayedCategoryPages.length > 0) {
      setSelectedSlug(displayedCategoryPages[0].slug);
    } else if (
      selectedSlug &&
      !displayedCategoryPages.some((m) => m.slug === selectedSlug) &&
      displayedCategoryPages.length > 0
    ) {
      setSelectedSlug(displayedCategoryPages[0].slug);
    }
  }, [displayedCategoryPages, selectedSlug]);

  const activeMemory = useMemo(() => {
    return memories[selectedSlug] || displayedCategoryPages[0] || memoriesList[0];
  }, [memories, selectedSlug, displayedCategoryPages, memoriesList]);

  // Compute unique contributors for the selected memory
  const uniqueContributors = useMemo(() => {
    if (!activeMemory) return [];
    const seen = new Set<string>();
    const list: Array<{ name: string; count: number }> = [];

    // From comments
    (activeMemory.comments || []).forEach((c) => {
      if (!seen.has(c.author.toLowerCase())) {
        seen.add(c.author.toLowerCase());
        list.push({ name: c.author, count: 1 });
      }
    });

    // From contributed media
    (activeMemory.contributedMedia || []).forEach((m) => {
      if (!seen.has(m.contributorName.toLowerCase())) {
        seen.add(m.contributorName.toLowerCase());
        list.push({ name: m.contributorName, count: 1 });
      }
    });

    // From contributions
    (activeMemory.contributions || []).forEach((c) => {
      if (!seen.has(c.contributor_name.toLowerCase())) {
        seen.add(c.contributor_name.toLowerCase());
        list.push({ name: c.contributor_name, count: 1 });
      }
    });

    return list;
  }, [activeMemory]);

  const copyPublicLink = (slug: string) => {
    const url = `${window.location.origin}/m/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public memory link copied to clipboard!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#241621]/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E4603C]">
            SocioDex Hub
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#241621]">
            Memory Dashboard
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#594855] max-w-2xl">
            Select any celebration memory card to view complete statistics including total contributors, page followers, and page admins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Memory</span>
          </Link>
        </div>
      </div>

      {/* 4 CATEGORY FILTER TABS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <button
          onClick={() => setActiveCategory("created")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "created"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E4603C] flex items-center gap-1.5">
              👑 1. Created
            </span>
            <span className="text-xs font-bold bg-[#E4603C] text-white px-2.5 py-0.5 rounded-full">
              {createdPages.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-lg font-bold text-[#241621]">Pages You Created</div>
            <div className="text-[11px] text-[#594855] mt-0.5">Full owner & admin control</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("admin")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "admin"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1.5">
              🛡️ 2. Admin Of
            </span>
            <span className="text-xs font-bold bg-[#241621] text-white px-2.5 py-0.5 rounded-full">
              {adminPages.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-lg font-bold text-[#241621]">Assigned Admin</div>
            <div className="text-[11px] text-[#594855] mt-0.5">Co-moderation privileges</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("contributed")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "contributed"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1.5">
              ✍️ 3. Contributed
            </span>
            <span className="text-xs font-bold bg-[#EBC85A] text-[#241621] px-2.5 py-0.5 rounded-full">
              {contributedPages.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-lg font-bold text-[#241621]">Contributed Pages</div>
            <div className="text-[11px] text-[#594855] mt-0.5">Wishes & media posted</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory("followed")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === "followed"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#241621] flex items-center gap-1.5">
              ⭐ 4. Followed
            </span>
            <span className="text-xs font-bold bg-[#F4ECE0] text-[#241621] px-2.5 py-0.5 rounded-full">
              {followedPages.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-lg font-bold text-[#241621]">Pages You Followed</div>
            <div className="text-[11px] text-[#594855] mt-0.5">Subscribed updates</div>
          </div>
        </button>
      </div>

      {/* SPLIT VIEW: LEFT SIDEBAR MEMORY CARDS LIST + RIGHT MAIN DETAIL PANEL */}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* LEFT SIDEBAR: YOUR MEMORY CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#594855]">
              YOUR MEMORY CARDS ({displayedCategoryPages.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {displayedCategoryPages.map((mem) => {
              const isSelected = activeMemory?.slug === mem.slug;
              const pendingCount =
                mem.collaborationRequests?.filter((r) => r.status === "pending").length || 0;

              return (
                <button
                  key={mem.slug}
                  onClick={() => setSelectedSlug(mem.slug)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer block ${
                    isSelected
                      ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
                      : "bg-white border-[#241621]/10 hover:border-[#241621]/25 hover:bg-[#FAF6F0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4603C]/10 text-[#E4603C] uppercase">
                      {mem.visibility}
                    </span>
                    <span className="text-[10px] font-semibold text-[#594855]">
                      {new Date(mem.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#241621] leading-snug truncate">
                    {mem.occasion}
                  </h3>
                  <p className="text-xs text-[#594855] truncate mt-0.5">
                    For: {mem.recipient}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#241621]/5 text-[11px] text-[#594855]">
                    <div className="flex items-center gap-3">
                      <span title="Collaborators / Contributors">
                        👥 {mem.collaborators?.length || 1}
                      </span>
                      <span title="Wishes">
                        💬 {(mem.comments?.length || 0) + (mem.wishes?.length || 0)}
                      </span>
                    </div>

                    {pendingCount > 0 && (
                      <span className="rounded-full bg-[#E4603C] text-white px-2 py-0.5 font-bold text-[9px]">
                        {pendingCount} request
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {displayedCategoryPages.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-[#241621]/20 text-center text-xs text-[#594855]">
                No memory cards found in this category.
              </div>
            )}
          </div>
        </div>

        {/* MOBILE CARD SELECTOR DROPDOWN (visible on mobile < 1024px) */}
        <div className="lg:hidden bg-white border border-[#241621]/12 rounded-2xl p-3.5 shadow-xs mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#594855] mb-1.5">
            Select Memory Card to Inspect:
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-sm font-bold text-[#241621] outline-none focus:border-[#E4603C]"
          >
            {displayedCategoryPages.map((mem) => (
              <option key={mem.slug} value={mem.slug}>
                {mem.occasion} (For: {mem.recipient})
              </option>
            ))}
          </select>
        </div>

        {/* RIGHT MAIN PANEL: SELECTED MEMORY CARD DETAILS & STATS */}
        {activeMemory ? (
          <div className="space-y-6">
            {/* Header Card for Selected Memory */}
            <div className="rounded-3xl border border-[#241621]/12 bg-[#FFFDF9] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241621]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-[#E4603C]/10 text-[#E4603C] border border-[#E4603C]/30 uppercase">
                      🔒 {activeMemory.visibility}
                    </span>
                    <span className="text-[11px] font-bold text-[#594855] bg-[#F4ECE0] px-3 py-1 rounded-full">
                      Theme: {activeMemory.themeId.split("-")[0]?.toUpperCase() || "ROSE"}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#241621]">
                    {activeMemory.occasion}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#594855] mt-1">
                    Recipient: <strong className="text-[#241621]">{activeMemory.recipient}</strong> · Created by{" "}
                    {activeMemory.creatorName || activeMemory.from} on{" "}
                    {new Date(activeMemory.date).toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => copyPublicLink(activeMemory.slug)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-white px-4 py-2 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] transition-all cursor-pointer shadow-xs"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share Page
                  </button>
                  <a
                    href={`/m/${activeMemory.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <span>View Live Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* 6 STAT CARDS ROW (Exact match to user screenshot layout!) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {/* 1. Collaborators / Admins */}
                <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-[#E4603C]" /> Collaborators
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#241621]">
                    {activeMemory.collaborators?.length || 1}
                  </div>
                  <div className="text-[10px] text-[#594855] mt-0.5">Approved Roster</div>
                </div>

                {/* 2. Guest Comments / Wishes */}
                <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" /> Guest Comments
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#241621]">
                    {(activeMemory.comments?.length || 0) + (activeMemory.wishes?.length || 0)}
                  </div>
                  <div className="text-[10px] text-[#594855] mt-0.5">Wishes Posted</div>
                </div>

                {/* 3. Media Uploads */}
                <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-[#E4603C]" /> Media Uploads
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#241621]">
                    {(activeMemory.contributedMedia?.length || 0) + (activeMemory.photos?.length || 0)}
                  </div>
                  <div className="text-[10px] text-[#594855] mt-0.5">Photos & Videos</div>
                </div>

                {/* 4. Page Followers */}
                <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-[#EBC85A]" /> Page Followers
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#241621]">
                    {activeMemory.followers?.length || 1}
                  </div>
                  <div className="text-[10px] text-[#594855] mt-0.5">Subscribed Users</div>
                </div>

                {/* 5. Pending Requests */}
                <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 flex flex-col justify-between col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-[#594855] flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5 text-[#E4603C]" /> Pending Requests
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#241621]">
                    {activeMemory.collaborationRequests?.filter((r) => r.status === "pending").length || 0}
                  </div>
                  <div className="text-[10px] text-[#594855] mt-0.5">Awaiting Review</div>
                </div>
              </div>
            </div>

            {/* DETAILED ROSTER BREAKDOWN CARDS */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* 1. TOTAL CONTRIBUTORS ROSTER */}
              <div className="rounded-3xl border border-[#241621]/12 bg-white p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2.5">
                  <h3 className="font-display text-lg font-bold text-[#241621] flex items-center gap-1.5">
                    ✍️ Total Contributors ({uniqueContributors.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {uniqueContributors.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-full bg-[#E4603C]/15 text-[#E4603C] font-bold flex items-center justify-center text-xs">
                          {c.name[0]}
                        </span>
                        <span className="font-bold text-[#241621]">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#594855] bg-[#F4ECE0] px-2 py-0.5 rounded-full">
                        Contributor
                      </span>
                    </div>
                  ))}
                  {uniqueContributors.length === 0 && (
                    <div className="text-xs text-[#594855] text-center py-4">No contributors yet.</div>
                  )}
                </div>
              </div>

              {/* 2. PAGE FOLLOWERS ROSTER */}
              <div className="rounded-3xl border border-[#241621]/12 bg-white p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2.5">
                  <h3 className="font-display text-lg font-bold text-[#241621] flex items-center gap-1.5">
                    ⭐ Page Followers ({activeMemory.followers?.length || 1})
                  </h3>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(activeMemory.followers || [activeMemory.from]).map((followerName, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-full bg-[#EBC85A]/25 text-[#241621] font-bold flex items-center justify-center text-xs">
                          ⭐
                        </span>
                        <span className="font-bold text-[#241621]">{followerName}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#594855] bg-[#F4ECE0] px-2 py-0.5 rounded-full">
                        Following
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. PAGE ADMINS ROSTER */}
              <div className="rounded-3xl border border-[#241621]/12 bg-white p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#241621]/10 pb-2.5">
                  <h3 className="font-display text-lg font-bold text-[#241621] flex items-center gap-1.5">
                    🛡️ Page Admins ({activeMemory.collaborators?.length || 1})
                  </h3>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-[#E4603C]/5 border border-[#E4603C]/20 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#241621]">
                        👑 {activeMemory.creatorName || activeMemory.from}
                      </div>
                      <div className="text-[9px] text-[#594855]">Creator (Owner)</div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#E4603C] text-white px-2 py-0.5 rounded-full">
                      Owner
                    </span>
                  </div>

                  {activeMemory.collaborators?.map((collab) => (
                    <div
                      key={collab.id}
                      className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#241621]/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#241621]">{collab.name}</div>
                        <div className="text-[9px] text-[#594855]">{collab.email}</div>
                      </div>
                      <span className="text-[9px] font-bold bg-[#241621] text-white px-2 py-0.5 rounded-full">
                        Co-Admin
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#241621]/20 p-12 text-center bg-[#FFFDF9] flex items-center justify-center">
            <div>
              <Sparkles className="mx-auto h-10 w-10 text-[#E4603C] mb-3 animate-bounce" />
              <h3 className="font-display text-xl font-bold text-[#241621]">
                Select a memory card from the left
              </h3>
              <p className="text-xs text-[#594855] mt-1">
                Click on any memory card to view detailed contributors, followers, and admins.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
