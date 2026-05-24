import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type {
  MemoryData,
  Collaborator,
  Comment,
  ContributedMedia,
  CollaborationRequest,
} from "@/lib/store";
import {
  Users,
  MessageSquare,
  Heart,
  Image as ImageIcon,
  Settings,
  Check,
  X,
  Globe,
  Lock,
  Share2,
  ChevronRight,
  Sparkles,
  UserPlus,
  Trash2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Memory Activity Tracker & Control Center — Nandi Invites" },
      {
        name: "description",
        content:
          "Track and manage comments, uploads, and collaborator requests for your created memories.",
      },
    ],
  }),
  component: TrackerControlCenter,
});

function TrackerControlCenter() {
  const {
    memories,
    addMemory,
    updateMemory,
    handleCollaborationRequest,
    removeCollaboratorFromMemory,
    currentUser,
  } = useStore();

  const memoriesList = useMemo(() => Object.values(memories || {}), [memories]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"overview" | "access" | "feed">("overview");

  // Seed demo memories on mount if no memories exist
  useEffect(() => {
    if (Object.keys(memories || {}).length === 0) {
      const demo1: MemoryData = {
        slug: "sajan-golden-jubilee",
        occasion: "Sajan's Golden Jubilee Celebration",
        recipient: "Dad Sajan",
        from: "Neha Nair",
        date: "2026-05-24",
        themeId: "floral-rose",
        wishes: [
          "Wishing you a wonderful golden jubilee! We love you so much!",
          "Happy birthday Sajan! May you have many more wonderful years of joy!",
          "Congratulations on reaching this milestone! You inspire us every day.",
        ],
        photos: [],
        audios: [],
        videos: [],
        visibility: "friends",
        allowedActions: { addPhotos: true, addVideos: true, addComments: true },
        collaborators: [
          {
            id: "collab-neha",
            name: "Neha Nair",
            email: "neha.nair@example.com",
            phone: "+91 98765 43210",
            role: "admin",
            status: "accepted",
            inviteSentVia: "link",
          },
          {
            id: "collab-rajan",
            name: "Rajan Mehta",
            email: "rajan.mehta@example.com",
            phone: "+91 99999 88888",
            role: "contributor",
            status: "accepted",
            inviteSentVia: "whatsapp",
          },
          {
            id: "collab-amit",
            name: "Amit Kumar",
            email: "amit.kumar@example.com",
            phone: "+91 88888 77777",
            role: "contributor",
            status: "pending",
            inviteSentVia: "email",
          },
        ],
        comments: [
          {
            id: "c1",
            author: "Rajan Mehta",
            text: "Wishing you the happiest birthday Dad Sajan! Excited to celebrate together! 🎂🥂",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
            likes: 5,
            likedByMe: false,
            avatar: "😊",
          },
          {
            id: "c2",
            author: "Priya Sharma",
            text: "Happy birthday Sajan! May you have many more years of health and happiness!",
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
            likes: 2,
            likedByMe: true,
            avatar: "🎉",
          },
          {
            id: "c3",
            author: "Vikram Sen",
            text: "Sending you warmest regards on your 50th birthday celebration! Outstanding milestone!",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
            likes: 7,
            likedByMe: false,
            avatar: "✨",
          },
        ],
        contributedMedia: [
          {
            id: "m1",
            src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop",
            type: "photo",
            contributorName: "Rajan Mehta",
            likes: 3,
            likedByMe: false,
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
          },
          {
            id: "m2",
            src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop",
            type: "photo",
            contributorName: "Neha Nair",
            likes: 8,
            likedByMe: true,
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
          },
        ],
        collaborationRequests: [
          {
            id: "req-rahul",
            name: "Rahul Sen",
            email: "rahul.sen@example.com",
            phone: "+91 77777 66666",
            requestedActions: { addPhotos: true, addVideos: false, addComments: true },
            status: "pending",
            timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
          },
          {
            id: "req-swati",
            name: "Swati Roy",
            email: "swati.roy@example.com",
            phone: "+91 91111 22222",
            requestedActions: { addPhotos: true, addVideos: true, addComments: true },
            status: "approved",
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
          },
        ],
        contributionMode: "open",
        autoApprove: false,
        pinnedContributionIds: [],
        expiresAt: null,
        contributions: [],
        reactions: [],
        replies: [],
      };

      const demo2: MemoryData = {
        slug: "aditi-amit-anniversary",
        occasion: "Aditi & Amit's 5th Wedding Anniversary",
        recipient: "Aditi & Amit",
        from: "Dev Kapoor",
        date: "2026-06-12",
        themeId: "floral-sage",
        wishes: [
          "Congratulations to the perfect couple on 5 years together!",
          "May your love continue to grow with each passing year.",
        ],
        photos: [],
        audios: [],
        videos: [],
        visibility: "public",
        allowedActions: { addPhotos: true, addVideos: false, addComments: true },
        collaborators: [
          {
            id: "collab-dev",
            name: "Dev Kapoor",
            email: "dev.kapoor@example.com",
            phone: "+91 95555 44444",
            role: "admin",
            status: "accepted",
            inviteSentVia: "link",
          },
        ],
        comments: [
          {
            id: "c4",
            author: "Vikram Kapoor",
            text: "Happy Anniversary to the beautiful couple! Have a sensational day! 💖🌸",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            likes: 8,
            likedByMe: false,
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

  // Set default selection if none active
  useEffect(() => {
    if (!selectedSlug && memoriesList.length > 0) {
      setSelectedSlug(memoriesList[0].slug);
    }
  }, [memoriesList, selectedSlug]);

  const activeMemory = useMemo(() => {
    return memories[selectedSlug] || memoriesList[0];
  }, [memories, selectedSlug, memoriesList]);

  // Unified Chronological Activity Feed
  const activityFeed = useMemo(() => {
    if (!activeMemory) return [];

    const events: Array<{
      id: string;
      type: "comment" | "media" | "request" | "creation";
      text: string;
      time: string;
      meta?: string;
      mediaSrc?: string;
      mediaType?: "photo" | "video";
      status?: "pending" | "approved" | "declined";
    }> = [];

    // 1. Comments
    if (activeMemory.comments) {
      activeMemory.comments.forEach((c) => {
        events.push({
          id: c.id,
          type: "comment",
          text: `"${c.author}" left a comment: "${c.text.length > 60 ? c.text.substring(0, 60) + "..." : c.text}"`,
          time: c.timestamp,
          meta: `Likes: ${c.likes}`,
        });
      });
    }

    // 2. Media Uploads
    if (activeMemory.contributedMedia) {
      activeMemory.contributedMedia.forEach((m) => {
        events.push({
          id: m.id,
          type: "media",
          text: `"${m.contributorName}" uploaded a new ${m.type} to the contribution wall`,
          time: m.timestamp,
          mediaSrc: m.src,
          mediaType: m.type,
          meta: `Likes: ${m.likes}`,
        });
      });
    }

    // 3. Collaboration Requests
    if (activeMemory.collaborationRequests) {
      activeMemory.collaborationRequests.forEach((r) => {
        events.push({
          id: r.id,
          type: "request",
          text: `"${r.name}" requested access as a Contributor`,
          time: r.timestamp,
          status: r.status,
        });
      });
    }

    // 4. Creation milestone
    events.push({
      id: "creation-event",
      type: "creation",
      text: `Memory book created for "${activeMemory.recipient}" by ${activeMemory.from}`,
      time: activeMemory.date + "T09:00:00.000Z",
    });

    // Sort newest first
    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [activeMemory]);

  // Aggregate Key Metrics
  const metrics = useMemo(() => {
    if (!activeMemory)
      return { collaborators: 0, comments: 0, uploads: 0, likes: 0, pendingRequests: 0 };

    const collaborators =
      activeMemory.collaborators?.filter((c) => c.status === "accepted").length || 0;
    const comments = activeMemory.comments?.length || 0;
    const uploads = activeMemory.contributedMedia?.length || 0;
    const commentLikes = activeMemory.comments?.reduce((sum, c) => sum + (c.likes || 0), 0) || 0;
    const mediaLikes =
      activeMemory.contributedMedia?.reduce((sum, m) => sum + (m.likes || 0), 0) || 0;
    const pendingRequests =
      activeMemory.collaborationRequests?.filter((r) => r.status === "pending").length || 0;

    return {
      collaborators,
      comments,
      uploads,
      likes: commentLikes + mediaLikes,
      pendingRequests,
    };
  }, [activeMemory]);

  const toggleVisibility = () => {
    if (!activeMemory) return;
    const nextVis = activeMemory.visibility === "public" ? "friends" : "public";
    updateMemory(activeMemory.slug, { visibility: nextVis });
    toast.success(`Memory visibility updated to ${nextVis.toUpperCase()}`);
  };

  const toggleAllowedAction = (action: "addPhotos" | "addVideos" | "addComments") => {
    if (!activeMemory) return;
    const currentActions = activeMemory.allowedActions || {
      addPhotos: true,
      addVideos: true,
      addComments: true,
    };
    const updated = {
      ...currentActions,
      [action]: !currentActions[action],
    };
    updateMemory(activeMemory.slug, { allowedActions: updated });
    toast.success(`Guest settings updated`);
  };

  const handleRequestApproval = (requestId: string, approve: boolean) => {
    if (!activeMemory) return;
    handleCollaborationRequest(activeMemory.slug, requestId, approve ? "approve" : "decline");
    toast.success(approve ? "Collaboration request approved!" : "Collaboration request declined.");
  };

  const handleRevokeCollaborator = (collabId: string, name: string) => {
    if (!activeMemory) return;
    removeCollaboratorFromMemory(activeMemory.slug, collabId);
    toast.success(`Revoked access for ${name}`);
  };

  const copyInviteText = (collab: Collaborator) => {
    if (!activeMemory) return;
    const url = `${window.location.origin}/m/${activeMemory.slug}?collabId=${collab.id}`;
    const text = `Hey ${collab.name}! You have been invited as a ${collab.role} to contribute wishes, photos, and videos to ${activeMemory.occasion}! Click this exclusive link to join the memory wall: ${url}`;

    navigator.clipboard.writeText(text);
    toast.success(`Invite template copied for ${collab.name}!`);
  };

  const copyPublicLink = () => {
    if (!activeMemory) return;
    const url = `${window.location.origin}/m/${activeMemory.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public memory link copied to clipboard!");
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const pendingRequestsList = useMemo(() => {
    return activeMemory?.collaborationRequests?.filter((r) => r.status === "pending") || [];
  }, [activeMemory]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center">
        <div className="fade-up">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-primary">
            Memory Activity Tracker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
            Complete real-time monitoring and administrative oversight over all collaborative
            wishes, photos, and media for pages you have created.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted hover:scale-105"
          >
            <PlusCircle className="h-4 w-4" /> Create New Memory
          </Link>
        </div>
      </div>

      {/* User Login/Help Tip Banner */}
      {!currentUser ? (
        <div className="mb-6 card-soft border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent p-5 relative overflow-hidden fade-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <HelpCircle className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Viewing in Demo Mode</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Sign in with your Google Account or Phone number to automatically attach your
                  profile, claim creation ownership, and manage guest responses seamlessly.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              search={{ redirect: "/tracker" }}
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-105 shadow-md shadow-primary/10 animate-fade-in"
            >
              Sign In to Personalize
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 card-soft border-primary/10 bg-primary/5 p-4 flex items-center justify-between fade-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentUser.avatar || "🌸"}</span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Welcome back, {currentUser.name}!
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Logged in via {currentUser.provider === "google" ? "Google" : "Mobile Phone"}.
                Controlling your memory dashboards.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold text-primary tracking-wider uppercase">
            Creator-Admin
          </span>
        </div>
      )}

      {/* MOBILE ONLY: Dropdown Memory Selector */}
      {activeMemory && (
        <div className="relative lg:hidden mb-6 fade-up">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="w-full flex items-center justify-between p-4 bg-card/85 backdrop-blur-md rounded-2xl border border-primary/20 shadow-md text-left"
          >
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-primary">
                Active Memory Card
              </span>
              <h3 className="font-display text-lg font-bold text-foreground mt-0.5 leading-tight line-clamp-1">
                {activeMemory.occasion}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs shrink-0 pl-2">
              <span>Switch</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${selectorOpen ? "rotate-90" : ""}`}
              />
            </div>
          </button>

          {selectorOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card/95 backdrop-blur-lg rounded-2xl border border-border shadow-xl max-h-[300px] overflow-y-auto p-2 fade-in">
              {memoriesList.map((mem) => {
                const isActive = activeMemory.slug === mem.slug;
                const pendingCount =
                  mem.collaborationRequests?.filter((r) => r.status === "pending").length || 0;
                return (
                  <button
                    key={mem.slug}
                    onClick={() => {
                      setSelectedSlug(mem.slug);
                      setSelectorOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between text-sm mb-1 last:mb-0 ${
                      isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-display font-bold leading-tight truncate">
                        {mem.occasion}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        For: {mem.recipient}
                      </div>
                    </div>
                    {pendingCount > 0 && (
                      <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 font-bold text-[9px] shrink-0">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOBILE ONLY: Slider Tabs Bar Navigation */}
      {activeMemory && (
        <div className="flex lg:hidden bg-card/30 backdrop-blur-md rounded-2xl border border-border/40 p-1.5 mb-6 fade-up">
          <button
            onClick={() => setMobileTab("overview")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold gap-1 transition-all ${
              mobileTab === "overview"
                ? "bg-card text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setMobileTab("access")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold gap-1 transition-all relative ${
              mobileTab === "access"
                ? "bg-card text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Access</span>
            {metrics.pendingRequests > 0 && (
              <span className="absolute top-2.5 right-6 h-2 w-2 rounded-full bg-accent animate-pulse ring-2 ring-card" />
            )}
          </button>

          <button
            onClick={() => setMobileTab("feed")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold gap-1 transition-all ${
              mobileTab === "feed"
                ? "bg-card text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Activity</span>
          </button>
        </div>
      )}

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* DESKTOP SELECTOR SIDEBAR (hidden on mobile) */}
        <div className="hidden lg:block space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
            Your Memory Cards ({memoriesList.length})
          </div>

          <div className="flex flex-col gap-3">
            {memoriesList.map((mem) => {
              const isActive = activeMemory?.slug === mem.slug;
              const pendingReqCount =
                mem.collaborationRequests?.filter((r) => r.status === "pending").length || 0;

              return (
                <button
                  key={mem.slug}
                  onClick={() => setSelectedSlug(mem.slug)}
                  className={`w-full text-left transition-all p-4 rounded-2xl border text-sm hover:scale-[1.01] ${
                    isActive
                      ? "bg-card border-primary/60 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                      : "bg-card/40 border-border/40 hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        mem.visibility === "public"
                          ? "bg-primary/15 text-primary"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {mem.visibility}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(mem.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="font-display text-[15px] font-bold text-foreground leading-tight line-clamp-1 mt-1">
                    {mem.occasion}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-0.5">For: {mem.recipient}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" /> {mem.collaborators?.length || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" /> {mem.comments?.length || 0}
                      </span>
                    </div>

                    {pendingReqCount > 0 && (
                      <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 font-bold text-[9px] animate-pulse">
                        {pendingReqCount} request{pendingReqCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE DASHBOARD CONTAINER */}
        {activeMemory ? (
          <div>
            {/* DESKTOP LAYOUT (hidden on mobile) */}
            <div className="hidden lg:block space-y-6">
              {/* Active Memory Identity Card */}
              <div className="card-soft relative overflow-hidden p-6 border-primary/20 bg-card/70">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          activeMemory.visibility === "public"
                            ? "bg-primary/15 text-primary"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {activeMemory.visibility === "public" ? (
                          <Globe className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        {activeMemory.visibility.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        Theme: {activeMemory.themeId.split("-")[1]?.toUpperCase() || "FLORAL"}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {activeMemory.occasion}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recipient:{" "}
                      <strong className="text-foreground">{activeMemory.recipient}</strong> ·
                      Created by {activeMemory.from} on{" "}
                      {new Date(activeMemory.date).toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={copyPublicLink}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted transition-all"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share Page
                    </button>
                    <a
                      href={`/m/${activeMemory.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/10"
                    >
                      View Live Page <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Performance Stats Grid */}
              <div className="grid grid-cols-5 gap-4">
                <div className="card-soft p-4 flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> Collaborators
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground">
                    {metrics.collaborators}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Approved Roster</div>
                </div>

                <div className="card-soft p-4 flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> Guest Comments
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground">
                    {metrics.comments}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Wishes Posted</div>
                </div>

                <div className="card-soft p-4 flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> Media Uploads
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground">
                    {metrics.uploads}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Photos & Videos</div>
                </div>

                <div className="card-soft p-4 flex flex-col justify-between transition-all hover:scale-[1.02]">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500" /> Total Likes
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground">
                    {metrics.likes}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Engagement Pings</div>
                </div>

                <div
                  className={`card-soft p-4 flex flex-col justify-between transition-all hover:scale-[1.02] ${
                    metrics.pendingRequests > 0
                      ? "border-accent bg-accent/5 ring-1 ring-accent/15"
                      : ""
                  }`}
                >
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5 text-accent animate-pulse" /> Pending Requests
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground flex items-center gap-1.5">
                    {metrics.pendingRequests}
                    {metrics.pendingRequests > 0 && (
                      <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Awaiting Review</div>
                </div>
              </div>

              {/* Grid split panels */}
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Left block: Requests console and Live Activity */}
                <div className="space-y-6">
                  {/* Collaboration Requests */}
                  <div className="card-soft p-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <UserPlus className="h-4.5 w-4.5 text-accent" /> Pending Collaborator
                        Requests ({pendingRequestsList.length})
                      </h3>
                    </div>

                    {pendingRequestsList.length === 0 ? (
                      <div className="py-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          All clear! No pending request backlogs.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequestsList.map((req) => (
                          <div
                            key={req.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">{req.name}</h4>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {req.email} {req.phone ? `· ${req.phone}` : ""}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {req.requestedActions.addComments && (
                                  <span className="rounded-md bg-pink-500/10 text-pink-700 dark:text-pink-300 text-[10px] px-1.5 py-0.5 font-medium">
                                    Wishes
                                  </span>
                                )}
                                {req.requestedActions.addPhotos && (
                                  <span className="rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 font-medium">
                                    Photos
                                  </span>
                                )}
                                {req.requestedActions.addVideos && (
                                  <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] px-1.5 py-0.5 font-medium">
                                    Videos
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => handleRequestApproval(req.id, false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/20 text-destructive bg-destructive/5 transition-all hover:bg-destructive hover:text-white cursor-pointer"
                                title="Decline Request"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRequestApproval(req.id, true)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 text-primary bg-primary/5 transition-all hover:bg-primary hover:text-white cursor-pointer"
                                title="Approve Request"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity Feed */}
                  <div className="card-soft p-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <Sparkles className="h-4.5 w-4.5 text-primary" /> Live Activity Feed
                      </h3>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Real-Time updates
                      </span>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto pr-1 space-y-4">
                      {activityFeed.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                          No activity recorded yet on this memory.
                        </div>
                      ) : (
                        activityFeed.map((evt) => {
                          let iconBg = "bg-primary/15 text-primary";
                          let Icon = Sparkles;

                          if (evt.type === "comment") {
                            iconBg = "bg-pink-500/15 text-pink-500";
                            Icon = MessageSquare;
                          } else if (evt.type === "media") {
                            iconBg = "bg-blue-500/15 text-blue-500";
                            Icon = ImageIcon;
                          } else if (evt.type === "request") {
                            iconBg = "bg-accent/15 text-accent";
                            Icon = UserPlus;
                          }

                          return (
                            <div
                              key={evt.id}
                              className="flex gap-3 relative last:after:hidden after:absolute after:top-7 after:left-3.5 after:bottom-[-20px] after:w-[1px] after:bg-border/60"
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${iconBg}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs text-foreground leading-normal font-medium">
                                    {evt.text}
                                  </p>
                                  <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">
                                    {formatTimeAgo(evt.time)}
                                  </span>
                                </div>

                                {evt.mediaSrc && (
                                  <div className="mt-2 relative inline-block rounded-lg overflow-hidden border border-border/40 bg-muted/30">
                                    {evt.mediaType === "photo" ? (
                                      <img
                                        src={evt.mediaSrc}
                                        alt="Contributed Photo"
                                        className="h-14 w-24 object-cover hover:scale-105 transition-all"
                                      />
                                    ) : (
                                      <div className="h-14 w-24 flex items-center justify-center bg-black/80 text-white text-[10px]">
                                        Video Clip
                                      </div>
                                    )}
                                  </div>
                                )}

                                {evt.meta && (
                                  <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                    <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />{" "}
                                    {evt.meta}
                                  </div>
                                )}

                                {evt.type === "request" && (
                                  <div className="mt-1 text-[9px] font-semibold">
                                    Status:{" "}
                                    <span
                                      className={
                                        evt.status === "approved"
                                          ? "text-primary uppercase"
                                          : evt.status === "declined"
                                            ? "text-destructive uppercase"
                                            : "text-accent uppercase"
                                      }
                                    >
                                      {evt.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block: Settings and Collaborators roster */}
                <div className="space-y-6">
                  {/* Settings card */}
                  <div className="card-soft p-5 bg-card/40">
                    <div className="flex items-center gap-1.5 border-b border-border/40 pb-3 mb-4">
                      <Settings className="h-4.5 w-4.5 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">Dashboard Controls</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Visibility Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <label className="text-xs font-semibold text-foreground">
                            Access Visibility
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            {activeMemory.visibility === "public"
                              ? "Anyone with the link can view comments and media upload pages."
                              : "Private. Access blocked until email or phone credentials verify."}
                          </p>
                        </div>
                        <button
                          onClick={toggleVisibility}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            activeMemory.visibility === "public" ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              activeMemory.visibility === "public"
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="border-t border-border/40 pt-4">
                        <label className="text-xs font-semibold text-foreground block mb-2">
                          Guest Capabilities
                        </label>

                        <div className="space-y-2.5">
                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addComments ?? true}
                              onChange={() => toggleAllowedAction("addComments")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-medium text-[11px]">
                                Allow comments & wishes
                              </span>
                              <p className="text-[9px] mt-0.5">
                                Let visitors leave text memories with emoji avatars.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addPhotos ?? true}
                              onChange={() => toggleAllowedAction("addPhotos")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-medium text-[11px]">
                                Allow guest photo uploads
                              </span>
                              <p className="text-[9px] mt-0.5">
                                Allow contributors to upload images to the collage wall.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addVideos ?? true}
                              onChange={() => toggleAllowedAction("addVideos")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-medium text-[11px]">
                                Allow guest video clips
                              </span>
                              <p className="text-[9px] mt-0.5">
                                Allow short video uploads to the celebration memory line.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collaborators roster */}
                  <div className="card-soft p-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <Users className="h-4.5 w-4.5 text-primary" /> Collaborators (
                        {activeMemory.collaborators?.length || 0})
                      </h3>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {!activeMemory.collaborators || activeMemory.collaborators.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No collaborators added. Use the creator screen or WhatsApp template to
                          invite.
                        </div>
                      ) : (
                        activeMemory.collaborators.map((collab) => (
                          <div
                            key={collab.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/20 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground truncate">
                                  {collab.name}
                                </span>
                                <span
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                    collab.role === "admin"
                                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {collab.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {collab.email}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    collab.status === "accepted"
                                      ? "bg-primary animate-pulse"
                                      : "bg-amber-400"
                                  }`}
                                />
                                <span className="text-[9px] text-muted-foreground capitalize">
                                  {collab.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => copyInviteText(collab)}
                                className="p-1.5 rounded bg-card hover:bg-muted border border-border/30 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Copy WhatsApp Invite Text"
                              >
                                <Share2 className="h-3 w-3" />
                              </button>
                              {collab.role !== "admin" && (
                                <button
                                  onClick={() => handleRevokeCollaborator(collab.id, collab.name)}
                                  className="p-1.5 rounded bg-card hover:bg-destructive/10 border border-border/30 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                                  title="Revoke Permissions"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE-ONLY LAYOUT (hidden on desktop) */}
            <div className="lg:hidden fade-up">
              {/* 1. Mobile Active Tab: Overview */}
              {mobileTab === "overview" && (
                <div className="space-y-6">
                  {/* Identity Card */}
                  <div className="card-soft relative overflow-hidden p-5 border-primary/20 bg-card/70">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            activeMemory.visibility === "public"
                              ? "bg-primary/15 text-primary"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {activeMemory.visibility === "public" ? (
                            <Globe className="h-2.5 w-2.5" />
                          ) : (
                            <Lock className="h-2.5 w-2.5" />
                          )}
                          {activeMemory.visibility.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                          Theme: {activeMemory.themeId.split("-")[1]?.toUpperCase() || "FLORAL"}
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-bold text-foreground">
                        {activeMemory.occasion}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        For: <strong className="text-foreground">{activeMemory.recipient}</strong> ·
                        Created by {activeMemory.from} on{" "}
                        {new Date(activeMemory.date).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>

                      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-border/40">
                        <button
                          onClick={copyPublicLink}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border bg-card py-2 text-xs font-semibold hover:bg-muted transition-all"
                        >
                          <Share2 className="h-3 w-3" /> Share
                        </button>
                        <a
                          href={`/m/${activeMemory.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/10"
                        >
                          View Live <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Symmetrical 2x2 + Centered Grid for Mobile Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-soft p-4 flex flex-col justify-between text-center transition-all">
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-primary" /> Collaborators
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-foreground">
                        {metrics.collaborators}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Approved</div>
                    </div>

                    <div className="card-soft p-4 flex flex-col justify-between text-center transition-all">
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-pink-500" /> Comments
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-foreground">
                        {metrics.comments}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Wishes Posted</div>
                    </div>

                    <div className="card-soft p-4 flex flex-col justify-between text-center transition-all">
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <ImageIcon className="h-3 w-3 text-blue-500" /> Uploads
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-foreground">
                        {metrics.uploads}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Photos & Videos</div>
                    </div>

                    <div className="card-soft p-4 flex flex-col justify-between text-center transition-all">
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-rose-500" /> Engagement
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-foreground">
                        {metrics.likes}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Total Likes</div>
                    </div>

                    <div
                      className={`card-soft p-4 flex flex-col justify-between text-center transition-all col-span-2 ${
                        metrics.pendingRequests > 0
                          ? "border-accent bg-accent/5 ring-1 ring-accent/15"
                          : ""
                      }`}
                    >
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <UserPlus className="h-3 w-3 text-accent animate-pulse" /> Pending Access
                        Requests
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-foreground flex items-center justify-center gap-1.5">
                        {metrics.pendingRequests}
                        {metrics.pendingRequests > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                        )}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        Awaiting Administrator Review
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Controls Console */}
                  <div className="card-soft p-5 bg-card/40">
                    <div className="flex items-center gap-1.5 border-b border-border/40 pb-3 mb-4">
                      <Settings className="h-4.5 w-4.5 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">Dashboard Controls</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Visibility Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-foreground">
                            Access Visibility
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            {activeMemory.visibility === "public"
                              ? "Anyone with the link can view comments and uploads."
                              : "Private. Blocked until credentials verify."}
                          </p>
                        </div>
                        <button
                          onClick={toggleVisibility}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            activeMemory.visibility === "public" ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              activeMemory.visibility === "public"
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="border-t border-border/40 pt-4">
                        <label className="text-xs font-semibold text-foreground block mb-3">
                          Guest Capabilities
                        </label>

                        <div className="space-y-3">
                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addComments ?? true}
                              onChange={() => toggleAllowedAction("addComments")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-semibold text-[11px] block">
                                Allow comments
                              </span>
                              <p className="text-[9px] mt-0.5">Let visitors leave text wishes.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addPhotos ?? true}
                              onChange={() => toggleAllowedAction("addPhotos")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-semibold text-[11px] block">
                                Allow photo uploads
                              </span>
                              <p className="text-[9px] mt-0.5">Allow image uploads to wall.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeMemory.allowedActions?.addVideos ?? true}
                              onChange={() => toggleAllowedAction("addVideos")}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="text-foreground font-semibold text-[11px] block">
                                Allow video clips
                              </span>
                              <p className="text-[9px] mt-0.5">Allow guest videos.</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Mobile Active Tab: Access */}
              {mobileTab === "access" && (
                <div className="space-y-6">
                  {/* Requests console */}
                  <div className="card-soft p-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <UserPlus className="h-4 w-4 text-accent" /> Pending Requests (
                        {pendingRequestsList.length})
                      </h3>
                    </div>

                    {pendingRequestsList.length === 0 ? (
                      <div className="py-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          All clear! No pending request backlogs.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequestsList.map((req) => (
                          <div
                            key={req.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card/45 p-4"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {req.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {req.email} {req.phone ? `· ${req.phone}` : ""}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {req.requestedActions.addComments && (
                                  <span className="rounded-md bg-pink-500/10 text-pink-700 dark:text-pink-300 text-[9px] px-1.5 py-0.5 font-medium">
                                    Wishes
                                  </span>
                                )}
                                {req.requestedActions.addPhotos && (
                                  <span className="rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[9px] px-1.5 py-0.5 font-medium">
                                    Photos
                                  </span>
                                )}
                                {req.requestedActions.addVideos && (
                                  <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] px-1.5 py-0.5 font-medium">
                                    Videos
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2.5 border-t border-border/30 justify-end">
                              <button
                                onClick={() => handleRequestApproval(req.id, false)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-destructive/20 text-destructive bg-destructive/5 px-4 text-xs font-semibold transition-all hover:bg-destructive hover:text-white cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" /> Decline
                              </button>
                              <button
                                onClick={() => handleRequestApproval(req.id, true)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Collaborators list */}
                  <div className="card-soft p-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-primary" /> Collaborators (
                        {activeMemory.collaborators?.length || 0})
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {!activeMemory.collaborators || activeMemory.collaborators.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No collaborators added. Use the creator screen or WhatsApp template to
                          invite.
                        </div>
                      ) : (
                        activeMemory.collaborators.map((collab) => (
                          <div
                            key={collab.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/20 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground truncate">
                                  {collab.name}
                                </span>
                                <span
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                    collab.role === "admin"
                                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {collab.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {collab.email}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    collab.status === "accepted"
                                      ? "bg-primary animate-pulse"
                                      : "bg-amber-400"
                                  }`}
                                />
                                <span className="text-[9px] text-muted-foreground capitalize">
                                  {collab.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pl-1">
                              <button
                                onClick={() => copyInviteText(collab)}
                                className="p-2 rounded bg-card hover:bg-muted border border-border/30 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Copy WhatsApp Invite Text"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                              {collab.role !== "admin" && (
                                <button
                                  onClick={() => handleRevokeCollaborator(collab.id, collab.name)}
                                  className="p-2 rounded bg-card hover:bg-destructive/10 border border-border/30 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                                  title="Revoke Permissions"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Mobile Active Tab: Activity Feed */}
              {mobileTab === "feed" && (
                <div className="card-soft p-5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" /> Live Activity Feed
                    </h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Real-time
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activityFeed.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No activity recorded yet on this memory.
                      </div>
                    ) : (
                      activityFeed.map((evt) => {
                        let iconBg = "bg-primary/15 text-primary";
                        let Icon = Sparkles;

                        if (evt.type === "comment") {
                          iconBg = "bg-pink-500/15 text-pink-500";
                          Icon = MessageSquare;
                        } else if (evt.type === "media") {
                          iconBg = "bg-blue-500/15 text-blue-500";
                          Icon = ImageIcon;
                        } else if (evt.type === "request") {
                          iconBg = "bg-accent/15 text-accent";
                          Icon = UserPlus;
                        }

                        return (
                          <div
                            key={evt.id}
                            className="flex gap-3 relative last:after:hidden after:absolute after:top-7 after:left-3.5 after:bottom-[-20px] after:w-[1px] after:bg-border/60"
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${iconBg}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-foreground leading-normal font-medium">
                                  {evt.text}
                                </p>
                                <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">
                                  {formatTimeAgo(evt.time)}
                                </span>
                              </div>

                              {evt.mediaSrc && (
                                <div className="mt-2 relative inline-block rounded-lg overflow-hidden border border-border/40 bg-muted/30">
                                  {evt.mediaType === "photo" ? (
                                    <img
                                      src={evt.mediaSrc}
                                      alt="Contributed Photo"
                                      className="h-14 w-24 object-cover"
                                    />
                                  ) : (
                                    <div className="h-14 w-24 flex items-center justify-center bg-black/80 text-white text-[10px]">
                                      Video Clip
                                    </div>
                                  )}
                                </div>
                              )}

                              {evt.meta && (
                                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                  <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />{" "}
                                  {evt.meta}
                                </div>
                              )}

                              {evt.type === "request" && (
                                <div className="mt-1 text-[9px] font-semibold">
                                  Status:{" "}
                                  <span
                                    className={
                                      evt.status === "approved"
                                        ? "text-primary uppercase"
                                        : evt.status === "declined"
                                          ? "text-destructive uppercase"
                                          : "text-accent uppercase"
                                    }
                                  >
                                    {evt.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center card-soft">
            <h3 className="font-display text-2xl text-muted-foreground">Loading dashboards...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
