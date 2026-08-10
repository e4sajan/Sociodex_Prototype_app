import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  useStore,
  PERMISSION_MATRIX,
  getPageRole,
  type PageRole,
  type MemoryData,
  type SimulatedContribution,
  type SimulatedReaction,
  type SimulatedReply,
} from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { ContributorChatButton } from "@/components/chat/ContributorChatButton";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import {
  fetchMemoryFromSupabase,
  saveContributionToSupabase,
  subscribeToMemoryRealtime,
  signInWithGoogle,
  sendEmailMagicLink,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  Check,
  X,
  Sprout,
  Heart,
  Play,
  Pause,
  Volume2,
  Settings,
  Globe,
  Lock,
  MessageSquare,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
  MoreVertical,
  Mic,
  Square,
  ArrowLeft,
  ArrowRight,
  Send,
  Calendar,
  Pin,
  Clock,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Chrome,
  Mail,
  Smartphone,
  Shield,
  ShieldCheck,
  Ban,
  Flag,
  Copy,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/m/$slug")({
  loader: async ({ params: { slug } }) => {
    // 1. Instant check in local Zustand memory store
    const currentMemories = useStore.getState().memories || {};
    const fallback = useStore.getState().memory;
    const existing = currentMemories[slug] || (fallback?.slug === slug ? fallback : null);
    if (existing) {
      return { memory: existing };
    }

    // 2. Fetch from Supabase backend if configured
    if (isSupabaseConfigured) {
      try {
        const remoteData = await fetchMemoryFromSupabase(slug);
        if (remoteData && remoteData.slug) {
          useStore.getState().setMemory(remoteData as any);
          return { memory: remoteData };
        }
      } catch (err) {
        console.error("[Route Loader] Error prefetching memory:", err);
      }
    }
    return { memory: null };
  },
  pendingComponent: KeepsakeLoadingScreen,
  component: PublicMemoryPage,
});

/* ─── Dynamic color palettes mapping ─── */
const PUBLIC_THEMES: Record<
  string,
  { bg: string; gradient: string; card: string; accent: string; text: string; name: string }
> = {
  t1: {
    bg: "#E9EFE2",
    gradient: "linear-gradient(135deg, #F3F7EF 0%, #D2DBC9 100%)",
    card: "#FFFFFF",
    accent: "#E4603C",
    text: "#241621",
    name: "Sage",
  },
  t2: {
    bg: "#F5E5DA",
    gradient: "linear-gradient(135deg, #FAF2EC 0%, #E3C3AF 100%)",
    card: "#FFFFFF",
    accent: "#C17F5A",
    text: "#241621",
    name: "Terracotta",
  },
  t3: {
    bg: "#E5E7F2",
    gradient: "linear-gradient(135deg, #F2F3FB 0%, #C4CADF 100%)",
    card: "#FFFFFF",
    accent: "#3E4A75",
    text: "#241621",
    name: "Indigo",
  },
  t4: {
    bg: "#F8E6CB",
    gradient: "linear-gradient(135deg, #FDF9F2 0%, #E9C99A 100%)",
    card: "#FFFFFF",
    accent: "#D29A4D",
    text: "#241621",
    name: "Sunset",
  },
  t5: {
    bg: "#F4E1DD",
    gradient: "linear-gradient(135deg, #FAF4F3 0%, #E5C3BE 100%)",
    card: "#FFFFFF",
    accent: "#B85D6E",
    text: "#241621",
    name: "Rose",
  },
};

/* ─── Avatar Colours Rotator ─── */
const AVATAR_PALETTES = [
  { bg: "#F4ECE0", text: "#27500A" }, // green
  { bg: "#E6F1FB", text: "#0C447C" }, // blue
  { bg: "#FAEEDA", text: "#633806" }, // amber
  { bg: "#EEEDFE", text: "#3C3489" }, // purple
  { bg: "#FAECE7", text: "#712B13" }, // coral
  { bg: "#F1EFE8", text: "#444441" }, // gray
];

const getAvatarStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

/* ─── Floating Celebratory Confetti Animation ─── */
function ConfettiAnimation() {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      duration: Math.random() * 4 + 5, // 5-9s
      delay: Math.random() * 6, // 0-6s
      color: [
        "#c9915a",
        "#c96b75",
        "#3a8a94",
        "#4a8055",
        "#7a5faa",
        "#e4603c",
        "#ebc85a",
      ][i % 7],
      shape: i % 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 0 ? "50%" : "3px",
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.65,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ambient Drifting Golden Sparkles ─── */
function FloatingSparkles() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            bottom: "-20px",
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(212,175,55,0.6) 0%, rgba(212,175,55,0) 70%)`,
            boxShadow: `0 0 8px rgba(212,175,55,0.7)`,
            animation: `sparkleMove ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Premium Keepsake Loading Screen ─── */
function KeepsakeLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#FBF6EC] via-[#FFFDF9] to-[#F4ECE0] p-4 text-center relative overflow-hidden">
      {/* Background ambient sparkles */}
      <FloatingSparkles />

      <div className="relative z-10 max-w-sm w-full bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#241621]/10 shadow-xl flex flex-col items-center animate-fade-in">
        {/* Animated pulsating keepsake icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 flex items-center justify-center animate-pulse shadow-inner">
            <span className="text-4xl animate-bounce select-none">🎁</span>
          </div>
          <div className="absolute -inset-2 rounded-full border border-[#E4603C]/25 animate-ping opacity-30 pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4603C]/10 text-[#E4603C] text-[11px] font-bold tracking-wider uppercase mb-3">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>SocioDex Keepsake</span>
        </div>

        <h2 className="font-display text-2xl font-bold text-[#241621] mb-2">
          Preparing your keepsake...
        </h2>
        <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-xs mb-6">
          Gathering heartfelt wishes, photos, and voice notes for this celebration.
        </p>

        {/* Shimmer progress bar */}
        <div className="w-full bg-[#241621]/10 h-2 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-[#E4603C] via-[#EBC85A] to-[#E4603C] rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

const triggerConfettiBurst = () => {
  if (typeof document === "undefined") return;
  for (let i = 0; i < 45; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor = [
      "#c9915a",
      "#c96b75",
      "#3a8a94",
      "#4a8055",
      "#7a5faa",
      "#e4603c",
      "#ebc85a",
    ][i % 7];
    piece.style.width = Math.random() * 8 + 6 + "px";
    piece.style.height = Math.random() * 12 + 8 + "px";
    piece.style.animationDuration = Math.random() * 2 + 1.5 + "s";
    piece.style.animationDelay = Math.random() * 0.2 + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
};

/* ─── Real Audio Player with Waveform and Native Audio Playback ─── */
function FunctionalAudioPlayer({ src, name }: { src?: string; name: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("[Audio Playback Notice]", err);
      });
      setIsPlaying(true);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.max(0, Math.min(100, (clickX / width) * 100));
    setProgress(newProgress);

    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const waveformBars = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const h = 12 + Math.sin(i * 0.5) * 8 + Math.cos(i * 0.3) * 6;
      return Math.max(6, Math.min(26, h));
    });
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white border border-[#241621]/10 rounded-2xl p-3.5 shadow-xs max-w-md w-full">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause audio note" : "Play audio note"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white transition-all cursor-pointer shadow-xs active:scale-95"
      >
        {isPlaying ? (
          <Pause className="h-4.5 w-4.5 fill-white" />
        ) : (
          <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-bold text-neutral-800 truncate flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-[#E4603C] shrink-0" />
            {name}
          </span>
          <span className="text-[10px] text-neutral-500 font-semibold shrink-0">
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : "Voice Note"}
          </span>
        </div>

        <div
          onClick={handleWaveformClick}
          className="h-6 flex items-center gap-[3px] cursor-pointer relative"
        >
          {waveformBars.map((barHeight, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isActive = progress >= barProgress;
            return (
              <span
                key={idx}
                className="w-[3.5px] rounded-full transition-all duration-100"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: isActive ? "#E4603C" : "#E5E5E5",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const getOccasionIcon = (occasion: string) => {
  switch (occasion.toLowerCase()) {
    case "wedding":
      return "💍";
    case "baby shower":
      return "🍼";
    case "birthday":
      return "🎂";
    case "anniversary":
      return "🥂";
    case "housewarming":
      return "🏡";
    case "farewell":
      return "🌿";
    case "thank you":
      return "🙏";
    default:
      return "✨";
  }
};

/* ─── Main Public Memory Page Component ─── */
function PublicMemoryPage() {
  const { slug } = useParams({ from: "/m/$slug" });

  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  // Sync with sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`memento-revealed-${slug}`);
      if (stored === "true") {
        setIsRevealed(true);
      }
    }
  }, [slug]);

  // Zustand State
  const memories = useStore((s) => s.memories || {});
  const fallbackMemory = useStore((s) => s.memory);
  const activeMemory = memories[slug] || (fallbackMemory?.slug === slug ? fallbackMemory : null);

  const currentUser = useStore((s) => s.currentUser);
  const guests = useStore((s) => s.guests || []);

  // Store actions
  const setMemory = useStore((s) => s.setMemory);
  const updateMemory = useStore((s) => s.updateMemory);
  const addSimulatedContribution = useStore((s) => s.addSimulatedContribution);
  const updateSimulatedContributionStatus = useStore((s) => s.updateSimulatedContributionStatus);
  const deleteSimulatedContribution = useStore((s) => s.deleteSimulatedContribution);
  const editSimulatedContributionText = useStore((s) => s.editSimulatedContributionText);
  const toggleSimulatedReaction = useStore((s) => s.toggleSimulatedReaction);
  const addSimulatedReply = useStore((s) => s.addSimulatedReply);
  const deleteSimulatedReply = useStore((s) => s.deleteSimulatedReply);
  const updatePageSettings = useStore((s) => s.updatePageSettings);
  const setGuestRsvp = useStore((s) => s.setGuestRsvp);
  const toggleFollowPage = useStore((s) => s.toggleFollowPage);
  const togglePageAdmin = useStore((s) => s.togglePageAdmin);
  const blockContributor = useStore((s) => s.blockContributor);
  const unblockContributor = useStore((s) => s.unblockContributor);

  // Loading & Network Error States
  const [isLoading, setIsLoading] = useState<boolean>(() => !activeMemory);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch memory from Supabase and subscribe to Realtime
  useEffect(() => {
    let isMounted = true;

    // If activeMemory is already present in Zustand store, no blocking load
    if (activeMemory) {
      setIsLoading(false);
      setFetchError(null);
    } else {
      setIsLoading(true);
    }

    if (isSupabaseConfigured && slug) {
      fetchMemoryFromSupabase(slug)
        .then((remoteData) => {
          if (!isMounted) return;
          if (remoteData && remoteData.slug) {
            setMemory(remoteData as any);
            setFetchError(null);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("[PublicMemoryPage] Supabase fetch error:", err);
          if (!activeMemory) {
            setFetchError("Unable to connect to server. Please check your internet connection.");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      const unsubscribe = subscribeToMemoryRealtime(slug, (newContrib) => {
        addSimulatedContribution(slug, newContrib);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [slug, retryTrigger, setMemory, addSimulatedContribution]);

  // Local UI States
  const [tab, setTab] = useState<"all" | "wishes" | "photos" | "audios" | "videos">("all");
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [showContributeSheet, setShowContributeSheet] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isRibbonDismissed, setIsRibbonDismissed] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  const userRole: PageRole = getPageRole(activeMemory, currentUser);
  const isFollowing = activeMemory?.followers?.some(
    (f) => f.toLowerCase() === (currentUser?.name || currentUser?.email || "").toLowerCase()
  );

  // Form states for adding contribution
  const [contribType, setContribType] = useState<"wish" | "photo" | "audio" | "video">("wish");
  const [contribText, setContribText] = useState("");
  const [contribFiles, setContribFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Real Microphone Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Edit State
  const [editingContribId, setEditingContribId] = useState<string | null>(null);
  const [editingContribText, setEditingContribText] = useState("");

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Collapsed replies state (key: contributionId)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Auth Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"google" | "email" | "phone">("google");
  const [authLoading, setAuthLoading] = useState(false);
  const [authGoogleError, setAuthGoogleError] = useState("");
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authEmailNotice, setAuthEmailNotice] = useState("");
  const [authEmailError, setAuthEmailError] = useState("");
  const [authPhoneStep, setAuthPhoneStep] = useState<"input" | "otp">("input");
  const [authPhoneName, setAuthPhoneName] = useState("");
  const [authPhoneNumber, setAuthPhoneNumber] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState(["", "", "", ""]);
  const [authOtpNotice, setAuthOtpNotice] = useState("");
  const [authOtpError, setAuthOtpError] = useState("");

  const authOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Guest details & Preview mode
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // Parse URL parameters (Guest ID & Preview Mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("gid");
    if (gid) {
      setGuestId(gid);
    }
    setIsPreview(params.get("preview") === "true");
  }, []);

  // Load appropriate theme properties
  const pageTheme = PUBLIC_THEMES[activeMemory?.themeId || "t1"] || PUBLIC_THEMES.t1;

  // Real-time counter helpers
  const approvedContributions = useMemo(() => {
    if (!activeMemory) return [];
    const all = activeMemory.contributions || [];
    
    // Deduplicate by ID and filter out blocked users
    const seenIds = new Set<string>();
    const uniqueList: SimulatedContribution[] = [];
    const blockedList = (activeMemory.blockedUsers || []).map((b) => b.toLowerCase().trim());

    all.forEach((c) => {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        const isBlocked =
          blockedList.includes(c.contributor_name.toLowerCase().trim()) ||
          blockedList.includes(c.contributor_id.toLowerCase().trim());
        if (isBlocked) return;

        const isApproved = c.status === "approved";
        const isMyPost = currentUser && c.contributor_id === (currentUser.email || currentUser.id);
        if (isApproved || isMyPost) {
          uniqueList.push(c);
        }
      }
    });

    return uniqueList;
  }, [activeMemory, currentUser]);

  const pendingContributions = useMemo(() => {
    if (!activeMemory) return [];
    return (activeMemory.contributions || []).filter((c) => c.status === "pending");
  }, [activeMemory]);

  const stats = useMemo(() => {
    if (!activeMemory) return { wishes: 0, photos: 0, attending: 0 };
    const wishesCount =
      approvedContributions.filter((c) => c.type === "wish").length +
      (activeMemory.wishes?.length || 0);
    const photosCount =
      approvedContributions.filter((c) => c.type === "photo").length +
      (activeMemory.photos?.length || 0);
    const attendingCount = guests.filter((g) => g.rsvp === "attending").length;

    return {
      wishes: wishesCount,
      photos: photosCount,
      attending: attendingCount,
    };
  }, [approvedContributions, activeMemory, guests]);

  // Contributor circle avatars list (only unique approved contributors)
  const uniqueContributors = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; avatarColor: string; id: string }[] = [];
    approvedContributions.forEach((c) => {
      const key = c.contributor_name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          name: c.contributor_name,
          avatarColor: c.contributor_avatar_color,
          id: c.id,
        });
      }
    });
    return list;
  }, [approvedContributions]);

  // Check if current user is the owner/admin
  const isOwner = useMemo(() => {
    if (!activeMemory) return false;
    if (!currentUser) return false;
    const creatorEmail = (activeMemory.creatorEmail || activeMemory.from.toLowerCase().replace(/\s+/g, "") + "@example.com").toLowerCase();
    const userEmail = (currentUser.email || "").toLowerCase();
    return (
      userEmail === creatorEmail ||
      userEmail === "admin@example.com" ||
      userEmail === "creator@example.com" ||
      currentUser.name.toLowerCase() === activeMemory.from.toLowerCase()
    );
  }, [currentUser, activeMemory]);

  // Check if page expired
  const isExpired = useMemo(() => {
    if (!activeMemory?.expiresAt) return false;
    return new Date(activeMemory.expiresAt).getTime() < Date.now();
  }, [activeMemory]);

  // Guest details if identified by gid
  const currentGuest = useMemo(() => {
    if (!guestId) return null;
    return guests.find((g) => g.id === guestId);
  }, [guestId, guests]);

  // Filter contributions by tab selector
  const filteredFeedContributions = useMemo(() => {
    if (!activeMemory) return [];
    let list = [...approvedContributions];

    // Filter by type
    if (tab === "wishes") list = list.filter((c) => c.type === "wish");
    else if (tab === "photos") list = list.filter((c) => c.type === "photo");
    else if (tab === "audios") list = list.filter((c) => c.type === "audio");
    else if (tab === "videos") list = list.filter((c) => c.type === "video");

    // Separate pinned items so they go to the top
    const pinnedIds = activeMemory.pinnedContributionIds || [];
    list.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [approvedContributions, tab, activeMemory?.pinnedContributionIds]);

  // Masonry layout photo feed
  const masonryPhotos = useMemo(() => {
    if (!activeMemory) return [];
    const list: { src: string; contributorName: string; caption: string; date: string }[] = [];

    // Host original photos
    (activeMemory.photos || []).forEach((url) => {
      list.push({
        src: url,
        contributorName: activeMemory.from,
        caption: "Original memory card photo",
        date: activeMemory.date,
      });
    });

    // Approved community contributions
    approvedContributions
      .filter((c) => c.type === "photo" && c.media_urls)
      .forEach((c) => {
        (c.media_urls || []).forEach((url) => {
          list.push({
            src: url,
            contributorName: c.contributor_name,
            caption: c.content_text || "A beautiful memory card",
            date: new Date(c.created_at).toLocaleDateString(),
          });
        });
      });

    return list;
  }, [activeMemory, approvedContributions]);

  // 1. Show elegant keepsake loading screen while memory is being loaded from network
  if (isLoading && !activeMemory) {
    return <KeepsakeLoadingScreen />;
  }

  // 2. Show retry error screen if network connection failed and memory is not loaded
  if (fetchError && !activeMemory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#241621]/10 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-xl">
            ⚠️
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-800">Connection Error</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            {fetchError}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setFetchError(null);
              setRetryTrigger((c) => c + 1);
            }}
            className="inline-block mt-5 rounded-full bg-[#E4603C] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c94b29] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Only show "Memory page not found" when loading has fully resolved AND memory does not exist
  if (!activeMemory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#241621]/10 shadow-sm">
          <Sprout className="mx-auto h-12 w-12 text-[#E4603C] mb-4 animate-bounce" />
          <h1 className="font-display text-2xl font-bold text-neutral-800">Memory page not found</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            The memory page you are trying to view does not exist or has not been created yet.
          </p>
          <Link
            to="/creator"
            className="inline-block mt-5 rounded-full bg-[#E4603C] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c94b29] transition-all cursor-pointer"
          >
            Create a New Memory Page
          </Link>
        </div>
      </div>
    );
  }

  // Handle RSVP status click
  const handleRsvpClick = (status: "attending" | "declined") => {
    if (!guestId) {
      toast.error("RSVP link requires a guest invitation token.");
      return;
    }
    setGuestRsvp(guestId, status);
    toast.success(`RSVP updated successfully!`, {
      description: status === "attending" ? "You are marked as attending! 🥳" : "You are marked as declined.",
    });
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthGoogleError("");
    try {
      const redirectUrl = `${window.location.origin}/m/${slug}`;
      const { error } = await signInWithGoogle(redirectUrl);
      if (error) {
        setAuthGoogleError(error.message || "Failed to initiate Google sign in.");
        setAuthLoading(false);
      }
    } catch (err: any) {
      setAuthGoogleError(err?.message || "An unexpected error occurred during sign in.");
      setAuthLoading(false);
    }
  };

  // Email Magic Link Handler
  const handleEmailMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmailInput.trim()) return;

    setAuthLoading(true);
    setAuthEmailError("");
    setAuthEmailNotice("");

    try {
      const redirectUrl = `${window.location.origin}/m/${slug}`;
      const { error } = await sendEmailMagicLink(authEmailInput.trim(), redirectUrl);
      setAuthLoading(false);
      if (error) {
        setAuthEmailError(error.message);
      } else {
        setAuthEmailNotice(`✨ Magic login link sent to ${authEmailInput}! Check your inbox to complete sign in.`);
      }
    } catch (err: any) {
      setAuthLoading(false);
      setAuthEmailError(err.message || "Failed to send magic login link.");
    }
  };

  // Phone input handler
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhoneName.trim() || !authPhoneNumber.trim()) return;

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthPhoneStep("otp");
      setAuthOtpNotice("✨ OTP sent! Enter your verification code.");
      setTimeout(() => setAuthOtpNotice(""), 6000);
    }, 800);
  };

  // OTP verify handler
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = authOtpCode.join("");

    if (code.length < 4) {
      setAuthOtpError("Please enter a valid 4-digit OTP code.");
      return;
    }

    setAuthLoading(true);
    setAuthOtpError("");
    setTimeout(() => {
      const session = {
        id: crypto.randomUUID(),
        name: authPhoneName.trim(),
        phone: authPhoneNumber.trim(),
        avatar: "📱",
        provider: "phone" as const,
      };
      useStore.getState().login(session);
      setAuthLoading(false);
      setShowAuthModal(false);
      toast.success(`Signed in as ${session.name}!`);
      setShowContributeSheet(true);
    }, 1000);
  };

  const handleAuthOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...authOtpCode];
    newCode[index] = val.substring(val.length - 1);
    setAuthOtpCode(newCode);

    if (val && index < 3) {
      authOtpRefs[index + 1].current?.focus();
    }
  };

  const handleAuthOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !authOtpCode[index] && index > 0) {
      authOtpRefs[index - 1].current?.focus();
    }
  };

  // Real Photo Upload via FileReader
  const handleRealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (contribFiles.length + files.length > 6) {
      toast.error("Maximum 6 photos allowed per post.");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setContribFiles((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} photo(s) attached!`);
    e.target.value = "";
  };

  // Real Video Upload via FileReader
  const handleRealVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be smaller than 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setContribFiles([reader.result]);
        toast.success("Video attached successfully!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Real Audio File Upload fallback
  const handleRealAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setContribFiles([reader.result]);
        toast.success("Audio file attached!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Real Microphone Recording with MediaRecorder
  const startRealMicrophoneRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setContribFiles([reader.result]);
            toast.success("Voice note recorded and attached! 🎙️");
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            stopRealMicrophoneRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("[Microphone Access Error]", err);
      toast.error("Microphone access denied. You can still upload an audio file directly.");
    }
  };

  const stopRealMicrophoneRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Add Contribution Submission (Guaranteed Live Updates)
  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const blockedList = (activeMemory.blockedUsers || []).map((b) => b.toLowerCase().trim());
    const isBlocked =
      blockedList.includes((currentUser.name || "").toLowerCase().trim()) ||
      (currentUser.email && blockedList.includes(currentUser.email.toLowerCase().trim()));
    if (isBlocked) {
      toast.error("You have been blocked from posting on this memory page by the administrator.");
      return;
    }

    if (contribType === "wish" && !contribText.trim()) {
      toast.error("Please enter your wish or message.");
      return;
    }
    if (contribType === "photo" && contribFiles.length === 0 && !contribText.trim()) {
      toast.error("Please attach at least one photo or write a caption.");
      return;
    }
    if (contribType === "audio" && contribFiles.length === 0 && !contribText.trim()) {
      toast.error("Please record a voice note or write a message.");
      return;
    }
    if (contribType === "video" && contribFiles.length === 0 && !contribText.trim()) {
      toast.error("Please attach a video or write a caption.");
      return;
    }

    setIsUploading(true);

    const avatarStyle = getAvatarStyle(currentUser.name);

    // Approved by default so it shows up live immediately!
    let targetStatus: "pending" | "approved" = "approved";
    if (activeMemory.autoApprove === false && activeMemory.contributionMode === "guests") {
      targetStatus = "pending";
    }

    const newContrib: SimulatedContribution = {
      id: crypto.randomUUID(),
      memory_page_id: activeMemory.slug,
      contributor_id: currentUser.email || currentUser.id || "user-session",
      contributor_name: currentUser.name,
      contributor_avatar_color: avatarStyle.bg,
      type: contribType,
      content_text: contribText.trim(),
      media_urls: contribFiles.length > 0 ? [...contribFiles] : undefined,
      status: targetStatus,
      created_at: new Date().toISOString(),
    };

    // Save to local Zustand store
    addSimulatedContribution(activeMemory.slug, newContrib);

    // Save to Supabase backend in background
    if (isSupabaseConfigured) {
      saveContributionToSupabase(activeMemory.slug, newContrib).catch((err) =>
        console.warn("[Supabase Contribution Notice]", err)
      );
    }

    setIsUploading(false);
    setContribText("");
    setContribFiles([]);
    setShowContributeSheet(false);

    // Automatically switch to all feed so user sees their new post immediately
    setTab("all");

    triggerConfettiBurst();

    toast.success("✨ Your memory is live on the page!", {
      description: "Thank you for sharing your warm blessing.",
    });

    // Smooth scroll to the newly posted contribution
    setTimeout(() => {
      const el = document.getElementById(`contrib-${newContrib.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 250);
  };

  // Reactions count mapping
  const getContributionReactions = (contribId: string) => {
    const list = activeMemory.reactions || [];
    const filtered = list.filter((r) => r.contribution_id === contribId);

    const counts = { heart: 0, clap: 0, hug: 0 };
    const myReactions: Record<string, boolean> = {};

    filtered.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (currentUser && r.user_id === (currentUser.email || currentUser.name)) {
        myReactions[r.type] = true;
      }
    });

    return { counts, myReactions };
  };

  // Reactions toggle handler
  const handleReactionToggle = (contribId: string, type: "heart" | "clap" | "hug") => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    toggleSimulatedReaction(activeMemory.slug, contribId, currentUser.email || currentUser.name, type);
  };

  // Replies counting
  const getContributionReplies = (contribId: string) => {
    return (activeMemory.replies || []).filter((r) => r.contribution_id === contribId);
  };

  // Posting reply
  const handlePostReply = (contribId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!replyText.trim()) return;

    const newReply: SimulatedReply = {
      id: crypto.randomUUID(),
      contribution_id: contribId,
      author_id: currentUser.email || currentUser.id || "user-id",
      author_name: currentUser.name,
      content_text: replyText.trim(),
      created_at: new Date().toISOString(),
    };

    addSimulatedReply(activeMemory.slug, newReply);
    setReplyText("");
    setActiveReplyId(null);
    toast.success("Reply added!");
  };

  // Delete own contribution
  const handleDeleteContribution = (contribId: string) => {
    deleteSimulatedContribution(activeMemory.slug, contribId);
    toast.success("Contribution removed.");
  };

  // Pinned Contributions toggling (Limit 3)
  const handlePinToggle = (contribId: string) => {
    const list = activeMemory.pinnedContributionIds || [];
    let updated = [...list];

    if (list.includes(contribId)) {
      updated = updated.filter((id) => id !== contribId);
      toast.success("Unpinned contribution.");
    } else {
      if (list.length >= 3) {
        toast.error("Maximum 3 pinned contributions allowed!");
        return;
      }
      updated.push(contribId);
      toast.success("Contribution pinned to top of feed!");
    }

    updatePageSettings(activeMemory.slug, { pinnedContributionIds: updated });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageTheme.gradient,
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        color: pageTheme.text,
      }}
      className="relative pb-28 overflow-x-hidden"
    >
      <Toaster position="top-center" richColors />

      {/* Floating Celebratory Animations & Background Sparkles */}
      <ConfettiAnimation />
      <FloatingSparkles />

      {/* ── INTERACTIVE ENVELOPE / REVEAL SCREEN ── */}
      {!isRevealed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: pageTheme.gradient,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            transition: "all 0.5s ease",
          }}
          className={isUnwrapping ? "opacity-0 scale-95 pointer-events-none" : ""}
        >
          <div
            style={{
              background: "#FFFDF9",
              border: "2px solid rgba(212,175,55,0.4)",
              borderRadius: "2.5rem",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 24px 60px rgba(92,61,46,0.14)",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
            className="p-6 sm:p-10"
          >
            {activeMemory.isCorporate && activeMemory.corporateLogo ? (
              <div className="max-h-16 max-w-[180px] flex items-center justify-center mx-auto mb-6">
                <img
                  src={activeMemory.corporateLogo}
                  alt="Company Logo"
                  className="max-h-16 max-w-[180px] object-contain"
                />
              </div>
            ) : (
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: `${pageTheme.accent}14`,
                  border: `1.5px solid ${pageTheme.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                }}
              >
                <span className="text-3xl">🌿</span>
              </div>
            )}

            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: pageTheme.accent,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              {activeMemory.isCorporate ? "Branded Corporate Keepsake" : "SocioDex Digital Memory Book"}
            </span>

            <h2
              style={{
                fontFamily: "'Baloo 2', 'Inter', system-ui, sans-serif",
                fontSize: "clamp(1.6rem, 7vw, 2.2rem)",
                margin: "0 0 1rem",
                lineHeight: 1.15,
                color: "#241621",
                fontWeight: 600,
              }}
            >
              {activeMemory.isInvitation ? (
                <>
                  The Celebration of <br />
                  <span style={{ color: pageTheme.accent }}>
                    {activeMemory.coupleNames || activeMemory.recipient}
                  </span>
                </>
              ) : (
                <>
                  A Memory Book for <br />
                  <span style={{ color: pageTheme.accent }}>
                    {activeMemory.recipient}
                  </span>
                </>
              )}
            </h2>

            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 px-1">
              {activeMemory.isInvitation
                ? "You are warmly invited to celebrate this special milestone. Tap below to unwrap and view all event details & guestbook."
                : `A living scrapbook of warm wishes, photos, and voice notes from ${activeMemory.from} and loved ones. Tap to unwrap.`}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsUnwrapping(true);
                triggerConfettiBurst();
                setTimeout(() => {
                  setIsRevealed(true);
                  sessionStorage.setItem(`memento-revealed-${slug}`, "true");
                }, 450);
              }}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "9999px",
                background: `linear-gradient(135deg, ${pageTheme.accent} 0%, #1c1917 100%)`,
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: `0 8px 24px ${pageTheme.accent}45`,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
              className="select-none active:scale-98 transition-transform"
            >
              ✉️ Unwrap Keepsake
            </button>
          </div>
        </div>
      )}

      {/* ── TOP HEADER AUTH BAR ── */}
      {!isPreview && (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#241621]/10 py-3 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-85">
              <SocioDexLogo size="sm" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Badge Indicator */}
              {activeMemory && (
                <button
                  type="button"
                  onClick={() => setShowRolesModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/30 px-3 py-1 text-xs font-bold text-[#E4603C] hover:bg-[#E4603C]/20 transition-all cursor-pointer select-none"
                  title="Click to view Page Roles & Permissions"
                >
                  {userRole === "creator" && "👑 Page Creator"}
                  {userRole === "admin" && "🛡️ Admin"}
                  {userRole === "contributor" && "✍️ Contributor"}
                  {userRole === "follower" && "⭐ Follower"}
                  {userRole === "visitor" && "👁️ Visitor"}
                </button>
              )}

              {/* Follow Page Button */}
              {activeMemory && currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    toggleFollowPage(activeMemory.slug, currentUser.name || currentUser.email || "");
                  }}
                  className={`hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer select-none ${
                    isFollowing
                      ? "bg-[#EBC85A] text-[#241621] shadow-xs"
                      : "border border-[#241621]/15 bg-white text-[#241621] hover:bg-[#FAF6F0]"
                  }`}
                >
                  {isFollowing ? "⭐ Following" : "⭐ Follow Page"}
                </button>
              )}

              {/* Memory Room Group Chat Button */}
              {activeMemory && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setShowAuthModal(true);
                      toast.info("Please sign in to join the memory chat room.");
                      return;
                    }
                    useChatStore.getState().openMemoryGroupChat({
                      memorySlug: activeMemory.slug,
                      memoryTitle: activeMemory.occasion || activeMemory.recipient,
                      creatorName: activeMemory.creatorName || activeMemory.from,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#241621]/15 px-3 py-1 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] hover:text-[#E4603C] hover:border-[#E4603C]/30 transition-all cursor-pointer shadow-xs select-none"
                  title="Open Group Celebration Chat Room"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" />
                  <span className="hidden sm:inline">Memory Chat</span>
                </button>
              )}

              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-full bg-[#E4603C]/10 text-xs font-bold flex items-center justify-center border border-[#E4603C]/25 text-[#E4603C]">
                    {currentUser.name[0]}
                  </span>
                  <span className="hidden md:inline text-xs font-bold text-neutral-800 truncate max-w-[120px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      useStore.getState().logout();
                      toast.success("Signed out successfully.");
                    }}
                    className="rounded-full border border-[#241621]/15 px-3 py-1 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-full bg-[#E4603C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#c94b29] transition-all cursor-pointer shadow-xs"
                  >
                    Sign In
                  </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ── MAIN CONTAINER ── */}
      <div className="max-w-3xl mx-auto px-4 mt-6 sm:px-6">
        {/* HERO SECTION */}
        <section
          className={`text-center py-8 sm:py-10 px-4 sm:px-8 rounded-3xl border bg-white relative overflow-hidden ${
            activeMemory.isCorporate
              ? "border-neutral-200 shadow-sm"
              : "border-[#241621]/10 shadow-[0_4px_24px_rgba(92,61,46,0.04)]"
          }`}
        >
          {/* Corporate Branding Logo */}
          {activeMemory.isCorporate && activeMemory.corporateLogo && (
            <div className="flex justify-center mb-5">
              <img
                src={activeMemory.corporateLogo}
                alt="Company Logo"
                className="max-h-12 max-w-[200px] object-contain"
              />
            </div>
          )}

          {/* Occasion Badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold text-white shadow-xs mb-3.5"
            style={{ backgroundColor: pageTheme.accent }}
          >
            {activeMemory.isCorporate ? "💼" : getOccasionIcon(activeMemory.occasion)} {activeMemory.occasion}
          </span>

          {activeMemory.isInvitation ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#594855] block mb-1.5">
                CORDIALLY INVITING YOU TO CELEBRATE
              </span>
              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight"
                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
              >
                The {activeMemory.occasion} of
                <br />
                <span style={{ color: pageTheme.accent }} className="block mt-1">
                  {activeMemory.coupleNames || activeMemory.recipient}
                </span>
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-3.5 max-w-md mx-auto leading-relaxed">
                Hosted with love by <strong className="text-neutral-800 font-semibold">{activeMemory.from}</strong>
              </p>
            </>
          ) : (
            <>
              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight"
                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
              >
                Happy {activeMemory.occasion},
                <br />
                <span style={{ color: pageTheme.accent }} className="block mt-1">
                  {activeMemory.recipient}
                </span>
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-3.5 max-w-md mx-auto leading-relaxed">
                With love from <strong className="text-neutral-800 font-semibold">{activeMemory.from}</strong>
              </p>
            </>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#594855] mt-3">
            <Calendar className="h-3.5 w-3.5 text-[#C17F5A]" />
            {new Date(activeMemory.date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* Live Counter Strip */}
          <div className="mt-7 border-t border-neutral-100 pt-5 flex justify-around items-center max-w-sm mx-auto">
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.wishes}</span>
              <span className="text-[10px] font-bold text-[#594855] uppercase tracking-wider">
                Wishes
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-200" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.photos}</span>
              <span className="text-[10px] font-bold text-[#594855] uppercase tracking-wider">
                Photos
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-200" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.attending}</span>
              <span className="text-[10px] font-bold text-[#594855] uppercase tracking-wider">
                Attending
              </span>
            </div>
          </div>
        </section>

        {/* EVENT INVITATION DETAILS */}
        {activeMemory.isInvitation && (
          <section className="mt-6 p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#d4af37]/30 shadow-sm relative overflow-hidden">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                Event Information
              </span>
              <h3 className="font-display font-bold text-2xl text-neutral-800 mt-1">
                🌿 Celebration & Feasts 🌿
              </h3>
              <div className="h-px w-20 bg-[#d4af37]/30 mx-auto my-3" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="bg-[#FAF6EE] border border-[#d4af37]/20 rounded-2xl p-4.5">
                <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-1">
                  📍 Venue Location
                </span>
                <strong className="text-neutral-800 text-sm block font-semibold">
                  {activeMemory.venueName || "To Be Announced"}
                </strong>
                <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                  {activeMemory.venueAddress || "Details pending."}
                </p>
                {activeMemory.venueMapsUrl && (
                  <a
                    href={activeMemory.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E4603C] hover:underline mt-3"
                  >
                    <span>View on Google Maps</span>
                    <span>→</span>
                  </a>
                )}
              </div>

              <div className="space-y-3">
                {activeMemory.dressCode && (
                  <div className="bg-[#FAF6EE] border border-[#d4af37]/20 rounded-2xl p-4">
                    <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-0.5">
                      👗 Dress Code
                    </span>
                    <p className="text-neutral-800 text-xs font-medium">
                      {activeMemory.dressCode}
                    </p>
                  </div>
                )}

                {activeMemory.registryInfo && (
                  <div className="bg-[#FAF6EE] border border-[#d4af37]/20 rounded-2xl p-4">
                    <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-0.5">
                      🎁 Registry / Gift Notes
                    </span>
                    <p className="text-neutral-600 text-xs leading-relaxed">
                      {activeMemory.registryInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Event Timeline */}
            {activeMemory.timeline && activeMemory.timeline.length > 0 && (
              <div className="mt-6 border-t border-[#d4af37]/20 pt-5">
                <span className="text-[10px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-4 text-center">
                  🗓️ Event Schedule
                </span>
                <div className="relative pl-6 border-l border-[#d4af37]/30 space-y-4 max-w-sm mx-auto">
                  {activeMemory.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d4af37] border border-white" />
                      <span className="text-[10px] font-bold text-[#C17F5A] block leading-none">
                        {item.time}
                      </span>
                      <span className="text-neutral-800 text-xs font-semibold block mt-0.5">
                        {item.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* RSVP CARD SYSTEM (If guest gid is present in URL) */}
        {currentGuest && (
          <section className="mt-6 p-6 rounded-3xl border border-[#241621]/10 bg-white text-center shadow-xs">
            <h2 className="font-display text-lg sm:text-xl font-bold text-neutral-800">
              Welcome, {currentGuest.firstName}! Will you be attending the celebration? 🥂
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Please let {activeMemory.from} know your RSVP status.
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleRsvpClick("attending")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentGuest.rsvp === "attending"
                    ? "bg-[#E4603C] text-white border-transparent shadow-xs"
                    : "bg-[#F4ECE0]/40 text-[#27500A] border-[#27500A]/20 hover:bg-[#F4ECE0]"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                Attending ✓
              </button>
              <button
                type="button"
                onClick={() => handleRsvpClick("declined")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentGuest.rsvp === "declined"
                    ? "bg-red-600 text-white border-transparent shadow-xs"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                }`}
              >
                <X className="h-3.5 w-3.5" />
                Declined ✗
              </button>
            </div>
          </section>
        )}

        {/* CONTRIBUTOR AVATAR STRIP */}
        {uniqueContributors.length > 0 && (
          <section className="mt-6 flex flex-wrap items-center gap-3 justify-center bg-white/60 border border-[#241621]/8 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-[#594855] uppercase tracking-wider">
              Loved ones who posted:
            </span>
            <div className="flex items-center -space-x-2">
              {uniqueContributors.slice(0, 8).map((c) => {
                const style = getAvatarStyle(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`contrib-${c.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    title={`Scroll to ${c.name}'s memory`}
                    className="h-8 w-8 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center hover:-translate-y-0.5 transition-transform cursor-pointer shadow-xs"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {c.name[0]}
                  </button>
                );
              })}
              {uniqueContributors.length > 8 && (
                <span className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  +{uniqueContributors.length - 8}
                </span>
              )}
            </div>
          </section>
        )}

        {/* SOFT SIGN-IN BANNER */}
        {!currentUser && !isNudgeDismissed && (
          <section className="mt-6 p-4 sm:p-5 rounded-2xl border border-[#241621]/10 bg-white shadow-xs flex items-start gap-3.5 relative">
            <div className="h-9 w-9 shrink-0 rounded-full bg-[#E4603C]/10 text-[#E4603C] flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-bold text-xs sm:text-sm text-neutral-800">
                Leave your warm wish or memory
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 leading-normal">
                Sign in to post your own wishes, photos, or voice notes for {activeMemory.recipient}.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-[#E4603C] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#c94b29] transition-all cursor-pointer shadow-xs"
                >
                  Sign In to Post
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNudgeDismissed(true)}
              aria-label="Dismiss banner"
              className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-neutral-600 cursor-pointer h-6 w-6 flex items-center justify-center rounded-full hover:bg-neutral-100 text-xs"
            >
              ✕
            </button>
          </section>
        )}

        {/* ── HOST ORIGINAL MEDIA (If creator provided any) ── */}
        {( (activeMemory.wishes && activeMemory.wishes.length > 0) ||
           (activeMemory.photos && activeMemory.photos.length > 0) ||
           (activeMemory.audios && activeMemory.audios.length > 0) ||
           (activeMemory.videos && activeMemory.videos.length > 0) ) && (
          <section className="mt-8 border-b border-[#241621]/10 pb-8">
            <h2
              className="font-display text-xl sm:text-2xl font-bold text-center text-neutral-800 mb-5"
              style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
            >
              From the Host 🌸
            </h2>

            {/* Original quotes */}
            {activeMemory.wishes && activeMemory.wishes.length > 0 && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {activeMemory.wishes.map((w, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4.5 border border-[#241621]/10 shadow-xs relative"
                    style={{ borderLeft: `4px solid ${pageTheme.accent}` }}
                  >
                    <p className="text-neutral-700 text-xs sm:text-sm italic leading-relaxed">
                      "{w}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Original photos */}
            {activeMemory.photos && activeMemory.photos.length > 0 && (
              <div className="mt-4">
                {activeMemory.photos.length === 1 ? (
                  <div
                    onClick={() => setLightboxIndex(0)}
                    className="rounded-2xl overflow-hidden border border-[#241621]/10 cursor-zoom-in group shadow-xs hover:opacity-95 transition inline-block max-w-full bg-neutral-50/50"
                  >
                    <img
                      src={activeMemory.photos[0]}
                      alt="Memory gallery"
                      className="max-h-[300px] sm:max-h-[340px] max-w-full w-auto h-auto object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
                    {activeMemory.photos.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="rounded-2xl overflow-hidden border border-[#241621]/10 cursor-zoom-in group shadow-xs hover:opacity-95 transition bg-neutral-50 flex items-center justify-center max-h-56"
                      >
                        <img
                          src={url}
                          alt="Memory gallery"
                          className="w-full h-auto max-h-56 object-contain group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Original Audios */}
            {activeMemory.audios && activeMemory.audios.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {activeMemory.audios.map((a) => (
                  <FunctionalAudioPlayer key={a.id} src={a.url} name={a.name} />
                ))}
              </div>
            )}

            {/* Original Videos */}
            {activeMemory.videos && activeMemory.videos.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {activeMemory.videos.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-2xl overflow-hidden border border-[#241621]/10 bg-black aspect-video shadow-xs"
                  >
                    <video src={v.url} controls className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── GUESTBOOK & COMMUNITY FEED ── */}
        <section className="mt-10">
          <div className="space-y-4 border-b border-[#241621]/10 pb-6 mb-8 text-center flex flex-col items-center">
            {/* Centered Heading */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E4603C] bg-[#E4603C]/10 px-2.5 py-0.5 rounded-full">
                  Community Guestbook
                </span>
                <span className="text-xs text-neutral-400 font-semibold">
                  • {approvedContributions.length} {approvedContributions.length === 1 ? "memory" : "memories"}
                </span>
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight"
                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
              >
                Messages & Memories ✨
              </h2>
            </div>

            {/* Category Filter Pills (Centered & Symmetric) */}
            <div className="w-full flex justify-center overflow-x-auto no-scrollbar py-0.5">
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#241621]/10 p-1.5 rounded-full shadow-xs mx-auto">
                {[
                  { id: "all", label: "All", icon: "✨" },
                  { id: "wishes", label: "Wishes", icon: "💌" },
                  { id: "photos", label: "Photos", icon: "📸" },
                  { id: "audios", label: "Voice Notes", icon: "🎙️" },
                  { id: "videos", label: "Videos", icon: "🎥" },
                ].map((opt) => {
                  const count =
                    opt.id === "all"
                      ? approvedContributions.length
                      : approvedContributions.filter((c) =>
                          c.type === (opt.id === "audios" ? "audio" : opt.id === "videos" ? "video" : opt.id === "photos" ? "photo" : "wish")
                        ).length;
                  const isActive = tab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTab(opt.id as any)}
                      className={`whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                        isActive
                          ? "bg-[#E4603C] text-white shadow-xs"
                          : "text-[#594855] hover:bg-[#F4ECE0]/60 hover:text-[#241621]"
                      }`}
                    >
                      <span className="text-sm leading-none">{opt.icon}</span>
                      <span>{opt.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-[#F4ECE0] text-[#594855]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Photos Wall Grid */}
          {tab === "photos" && masonryPhotos.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {masonryPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="break-inside-avoid bg-white p-3 rounded-2xl border border-[#241621]/10 shadow-xs cursor-zoom-in hover:shadow-md transition group mb-4"
                >
                  <div className="overflow-hidden rounded-xl bg-neutral-100 flex items-center justify-center">
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-auto max-h-[500px] object-contain group-hover:scale-[1.01] transition-transform duration-300 rounded-xl"
                    />
                  </div>
                  <div className="mt-2.5 px-1">
                    <span className="text-xs font-bold text-neutral-800 block truncate">
                      {photo.contributorName}
                    </span>
                    {photo.caption && photo.caption !== "Original memory card photo" && (
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Aligned Card Feed */
            <div className="space-y-4 sm:space-y-5">
              {isExpired && (
                <div className="bg-[#FAEEDA] text-[#633806] border border-[#d4af37]/30 p-3.5 rounded-2xl text-center text-xs font-semibold">
                  ⏳ This memory page is now in read-only archive mode.
                </div>
              )}

              {filteredFeedContributions.map((c) => {
                const isPinned = (activeMemory.pinnedContributionIds || []).includes(c.id);
                const isMyOwn = currentUser && c.contributor_id === (currentUser.email || currentUser.id);
                const isCreator = userRole === "creator";
                const isAdmin = userRole === "admin";
                const canModerate = isCreator || isAdmin;
                const canDelete = isCreator || isAdmin || isMyOwn;

                const isContributorAdmin = (activeMemory.collaborators || []).some(
                  (collab) =>
                    collab.role === "admin" &&
                    (collab.name.toLowerCase() === c.contributor_name.toLowerCase() ||
                      (c.contributor_id && collab.id === c.contributor_id))
                );

                const isContributorBlocked = (activeMemory.blockedUsers || []).some(
                  (b) =>
                    b.toLowerCase() === c.contributor_name.toLowerCase() ||
                    (c.contributor_id && b.toLowerCase() === c.contributor_id.toLowerCase())
                );

                const style = getAvatarStyle(c.contributor_name);
                const { counts, myReactions } = getContributionReactions(c.id);
                const replies = getContributionReplies(c.id);
                const isRepliesExpanded = expandedReplies[c.id] || false;

                return (
                  <article
                    key={c.id}
                    id={`contrib-${c.id}`}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-[#241621]/10 p-5 sm:p-6 shadow-xs relative transition hover:border-[#241621]/20"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => {
                          if (!currentUser) {
                            setShowAuthModal(true);
                            toast.info("Please sign in to message contributors.");
                            return;
                          }
                          useChatStore.getState().openChatWithContributor({
                            name: c.contributor_name,
                            emailOrId: c.contributor_id,
                            avatar: c.contributor_name[0],
                            avatarColor: style.bg,
                            memorySlug: activeMemory.slug,
                            memoryTitle: activeMemory.occasion || activeMemory.recipient,
                          });
                        }}
                        className="flex items-center gap-3 cursor-pointer group/contributor select-none"
                        title={`Click to message ${c.contributor_name}`}
                      >
                        <span
                          className="h-9 w-9 rounded-full text-xs font-bold flex items-center justify-center border border-white shrink-0 shadow-xs group-hover/contributor:scale-105 group-hover/contributor:shadow-md transition-all"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {c.contributor_name[0]}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-none group-hover/contributor:text-[#E4603C] transition-colors flex items-center gap-1">
                              <span>{c.contributor_name}</span>
                              <MessageSquare className="h-3 w-3 opacity-0 group-hover/contributor:opacity-100 transition-opacity text-[#E4603C]" />
                            </h4>

                            {isContributorAdmin && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                                <ShieldCheck className="h-2.5 w-2.5 text-purple-600" /> Admin
                              </span>
                            )}

                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4603C]/10 text-[#E4603C] border border-[#E4603C]/20">
                              {c.type === "wish" && "💌 Wish"}
                              {c.type === "photo" && "📸 Photo"}
                              {c.type === "audio" && "🎙️ Voice Note"}
                              {c.type === "video" && "🎥 Video"}
                            </span>

                            {isPinned && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#C17F5A] bg-[#C17F5A]/10 px-2 py-0.5 rounded-full">
                                <Pin className="h-2.5 w-2.5 fill-current" /> Pinned
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-semibold mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(c.created_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(c.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Right Three Dots Options Menu (Mobile & Desktop Touch Ready) */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardMenuId(activeCardMenuId === c.id ? null : c.id);
                          }}
                          aria-label="More options"
                          title="Post options"
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center bg-neutral-100 sm:bg-transparent hover:bg-[#FAF6F0] text-neutral-600 hover:text-neutral-900 transition cursor-pointer border border-[#241621]/10 sm:border-transparent select-none active:scale-90"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Invisible backdrop to dismiss menu on click/tap outside */}
                        {activeCardMenuId === c.id && (
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardMenuId(null);
                            }}
                          />
                        )}

                        {/* Dropdown Menu Container */}
                        {activeCardMenuId === c.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 w-52 sm:w-56 rounded-2xl border border-[#241621]/15 bg-white p-1.5 shadow-2xl z-40 text-left animate-fade-in"
                          >
                            {/* 1. Message Privately */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCardMenuId(null);
                                if (!currentUser) {
                                  setShowAuthModal(true);
                                  toast.info("Please sign in to message contributors.");
                                  return;
                                }
                                useChatStore.getState().openChatWithContributor({
                                  name: c.contributor_name,
                                  emailOrId: c.contributor_id,
                                  avatar: c.contributor_name[0],
                                  avatarColor: style.bg,
                                  memorySlug: activeMemory.slug,
                                  memoryTitle: activeMemory.occasion || activeMemory.recipient,
                                });
                              }}
                              className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-[#FAF6F0] hover:text-[#E4603C] flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <MessageSquare className="h-4 w-4 text-[#E4603C] shrink-0" />
                              <span>Message Privately</span>
                            </button>

                            {/* 2. Create Page Admin / Remove Admin Role (Creator & Admin only, not self) */}
                            {canModerate && !isMyOwn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  togglePageAdmin(activeMemory.slug, {
                                    name: c.contributor_name,
                                    id: c.contributor_id,
                                  });
                                  if (isContributorAdmin) {
                                    toast.success(`Removed admin privileges from ${c.contributor_name}.`);
                                  } else {
                                    toast.success(`Promoted ${c.contributor_name} to Page Admin! 🛡️`);
                                  }
                                }}
                                className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                                <span>{isContributorAdmin ? "Remove Admin Role" : "Make Page Admin"}</span>
                              </button>
                            )}

                            {/* 3. Block / Unblock Person from Posting (Creator & Admin only, not self) */}
                            {canModerate && !isMyOwn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  if (isContributorBlocked) {
                                    unblockContributor(activeMemory.slug, c.contributor_name);
                                    toast.success(`Unblocked ${c.contributor_name}.`);
                                  } else {
                                    blockContributor(activeMemory.slug, c.contributor_name);
                                    toast.error(`Blocked ${c.contributor_name} from posting on this page.`);
                                  }
                                }}
                                className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <Ban className="h-4 w-4 text-amber-600 shrink-0" />
                                <span>{isContributorBlocked ? "Unblock Person" : "Block from Posting"}</span>
                              </button>
                            )}

                            {/* 4. Pin / Unpin Post (Creator & Admin only) */}
                            {canModerate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  handlePinToggle(c.id);
                                }}
                                className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <Pin className="h-4 w-4 text-[#C17F5A] shrink-0" />
                                <span>{isPinned ? "Unpin Post" : "Pin to Top"}</span>
                              </button>
                            )}

                            {/* 5. Edit Message (Author only) */}
                            {isMyOwn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  setEditingContribId(c.id);
                                  setEditingContribText(c.content_text || "");
                                }}
                                className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <FileText className="h-4 w-4 text-neutral-500 shrink-0" />
                                <span>Edit Message</span>
                              </button>
                            )}

                            {/* 6. Copy Link to Post */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCardMenuId(null);
                                const url = `${window.location.origin}${window.location.pathname}#contrib-${c.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Link to memory post copied! 📋");
                              }}
                              className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <Copy className="h-4 w-4 text-neutral-500 shrink-0" />
                              <span>Copy Post Link</span>
                            </button>

                            {/* 7. Report Post (Guests / Visitors) */}
                            {!isMyOwn && !canModerate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  toast.success("Thank you. Post flagged for moderator review.");
                                }}
                                className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <Flag className="h-4 w-4 text-neutral-400 shrink-0" />
                                <span>Report Content</span>
                              </button>
                            )}

                            {/* 8. Delete Post (Creator, Admin, or Author) */}
                            {canDelete && (
                              <>
                                <div className="my-1 border-t border-[#241621]/10" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCardMenuId(null);
                                    deleteSimulatedContribution(activeMemory.slug, c.id);
                                    updateSimulatedContributionStatus(activeMemory.slug, c.id, "rejected");
                                    toast.success("Post deleted successfully.");
                                  }}
                                  className="w-full text-left rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 shrink-0" />
                                  <span>Delete Post</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="mt-3.5">
                      {editingContribId === c.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingContribText}
                            onChange={(e) => setEditingContribText(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="w-full rounded-xl border border-neutral-200 p-3 text-xs outline-none focus:border-[#E4603C] resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingContribId(null)}
                              className="rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-semibold hover:bg-neutral-50 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                editSimulatedContributionText(
                                  activeMemory.slug,
                                  c.id,
                                  editingContribText
                                );
                                setEditingContribId(null);
                                toast.success("Message updated!");
                              }}
                              className="rounded-full bg-[#E4603C] px-3.5 py-1 text-[11px] font-bold text-white hover:bg-[#c94b29] cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        c.content_text && (
                          <p className="text-neutral-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {c.content_text}
                          </p>
                        )
                      )}

                      {/* Attachments rendering */}
                      {c.media_urls && c.media_urls.length > 0 && (
                        <div className="mt-3.5">
                          {c.type === "photo" && (
                            <div>
                              {c.media_urls.length === 1 ? (
                                <div
                                  onClick={() =>
                                    setLightboxIndex(
                                      (activeMemory.photos?.length || 0) + 0
                                    )
                                  }
                                  className="rounded-2xl overflow-hidden border border-[#241621]/10 cursor-zoom-in shadow-xs inline-block max-w-full group bg-neutral-50/50"
                                >
                                  <img
                                    src={c.media_urls[0]}
                                    alt="Attached memory"
                                    className="max-h-[300px] sm:max-h-[340px] max-w-full w-auto h-auto object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
                                  {c.media_urls.map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      onClick={() =>
                                        setLightboxIndex(
                                          (activeMemory.photos?.length || 0) + imgIdx
                                        )
                                      }
                                      className="rounded-2xl overflow-hidden border border-[#241621]/10 cursor-zoom-in shadow-xs group bg-neutral-50 flex items-center justify-center max-h-56"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt="Attached memory"
                                        className="w-full h-auto max-h-56 object-contain group-hover:scale-[1.02] transition-transform duration-200"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {c.type === "audio" && (
                            <FunctionalAudioPlayer
                              src={c.media_urls[0]}
                              name={`Voice Memory from ${c.contributor_name}`}
                            />
                          )}

                          {c.type === "video" && (
                            <div className="rounded-2xl overflow-hidden border border-[#241621]/10 bg-black aspect-video max-w-md w-full shadow-xs">
                              <video
                                src={c.media_urls[0]}
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions & Reply Row */}
                    <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Heart */}
                        <button
                          type="button"
                          onClick={() => handleReactionToggle(c.id, "heart")}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer select-none ${
                            myReactions.heart
                              ? "bg-[#E4603C]/15 text-[#E4603C] border-transparent"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          <Heart
                            size={13}
                            className={myReactions.heart ? "fill-[#E4603C] text-transparent" : ""}
                          />
                          <span>{counts.heart}</span>
                        </button>
                        {/* Clap */}
                        <button
                          type="button"
                          onClick={() => handleReactionToggle(c.id, "clap")}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer select-none ${
                            myReactions.clap
                              ? "bg-[#E4603C]/15 text-[#E4603C] border-transparent"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          <span>👏</span>
                          <span>{counts.clap}</span>
                        </button>
                        {/* Hug */}
                        <button
                          type="button"
                          onClick={() => handleReactionToggle(c.id, "hug")}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer select-none ${
                            myReactions.hug
                              ? "bg-[#E4603C]/15 text-[#E4603C] border-transparent"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          <span>🫂</span>
                          <span>{counts.hug}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(activeReplyId === c.id ? null : c.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#594855] hover:text-neutral-900 transition cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" />
                        <span>Reply ({replies.length})</span>
                      </button>
                    </div>

                    {/* Inline Reply Input */}
                    {activeReplyId === c.id && (
                      <div className="mt-3 bg-neutral-50 border border-neutral-100 rounded-xl p-2.5 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a warm reply..."
                          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#E4603C]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handlePostReply(c.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handlePostReply(c.id)}
                          className="rounded-lg bg-[#E4603C] hover:bg-[#c94b29] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="mt-3.5 space-y-2.5 pl-3.5 border-l-2 border-neutral-100">
                        {replies.slice(0, isRepliesExpanded ? undefined : 3).map((rep) => {
                          const isOwnReply = currentUser && rep.author_id === (currentUser.email || currentUser.id);
                          return (
                            <div key={rep.id} className="flex gap-2 items-start">
                              <span className="h-5.5 w-5.5 rounded-full bg-neutral-100 text-[9px] font-bold text-neutral-700 flex items-center justify-center select-none border border-neutral-200 shrink-0">
                                {rep.author_name[0]}
                              </span>
                              <div className="flex-1 bg-neutral-50 rounded-xl p-2 max-w-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-neutral-800">
                                    {rep.author_name}
                                  </span>
                                  {isOwnReply && (
                                    <button
                                      type="button"
                                      onClick={() => deleteSimulatedReply(activeMemory.slug, rep.id)}
                                      className="text-red-400 hover:text-red-600 text-[10px] cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-700 leading-normal mt-0.5">
                                  {rep.content_text}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {replies.length > 3 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReplies((p) => ({ ...p, [c.id]: !isRepliesExpanded }))
                            }
                            className="text-[10px] font-bold text-[#C17F5A] hover:underline block cursor-pointer mt-1"
                          >
                            {isRepliesExpanded
                              ? "Show fewer replies"
                              : `Show ${replies.length - 3} more replies`}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Clean Empty Feed State */}
              {approvedContributions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-[#241621]/10 p-6 shadow-xs">
                  <span className="text-4xl block mb-2">💌</span>
                  <h3 className="font-display text-base font-bold text-neutral-800">
                    No memories shared yet
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Be the first to share a warm wish, photo, or voice note for {activeMemory.recipient}!
                  </p>
                  {!isExpired && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) setShowAuthModal(true);
                        else setShowContributeSheet(true);
                      }}
                      className="mt-4 rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white px-5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Post a Message</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── FOOTER CREATOR BRANDING ── */}
        <footer className="mt-14 py-8 border-t border-[#241621]/10 text-center space-y-2 select-none flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#594855]">
            POWERED BY
          </span>
          <div className="flex items-center justify-center">
            <SocioDexLogo size="xs" />
          </div>
          <p className="text-xs text-[#594855] max-w-sm mx-auto">
            Give every birthday, wedding & milestone its living digital memory home.
          </p>
          <div className="pt-1">
            <Link
              to="/creator"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E4603C] hover:underline"
            >
              <span>Create your own celebration page</span>
              <span>→</span>
            </Link>
          </div>
        </footer>
      </div>

      {/* ── FLOATING PROMOTIONAL BOTTOM RIBBON ── */}
      {!isRibbonDismissed && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-30 max-w-xl w-full select-none">
          <div className="bg-[#FFFDF9]/95 backdrop-blur-xl border border-[#241621]/15 shadow-2xl p-2 sm:p-2.5 px-4 sm:px-5 rounded-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link to="/" className="shrink-0 hover:opacity-90">
                <SocioDexLogo size="xs" />
              </Link>
              <span className="hidden sm:block text-[11px] text-[#594855] font-semibold truncate border-l border-[#241621]/10 pl-2.5">
                Every celebration deserves a home ✨
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isExpired && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) setShowAuthModal(true);
                    else setShowContributeSheet(true);
                  }}
                  className="rounded-full bg-[#E4603C]/10 border border-[#E4603C]/30 text-[#E4603C] hover:bg-[#E4603C]/20 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Post</span>
                </button>
              )}

              <Link
                to="/creator"
                className="rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white px-4 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create Page</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsRibbonDismissed(true)}
                className="h-6 w-6 rounded-full hover:bg-[#241621]/10 flex items-center justify-center text-[#594855] font-bold text-xs cursor-pointer"
                title="Dismiss ribbon"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING HOST SETTINGS BUTTON ── */}
      {isOwner && (
        <button
          type="button"
          onClick={() => setShowSettingsDrawer(true)}
          className="fixed bottom-20 right-5 z-20 h-12 w-12 rounded-full bg-white border border-[#241621]/20 text-[#E4603C] shadow-lg flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95 select-none"
          title="Host Control Panel"
        >
          <Settings className="h-5.5 w-5.5" />
          {pendingContributions.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 text-[9px] font-bold flex items-center justify-center shadow-xs">
              {pendingContributions.length}
            </span>
          )}
        </button>
      )}

      {/* ── REAL CONTRIBUTION MODAL ── */}
      {showContributeSheet && (
        <div
          onClick={() => setShowContributeSheet(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDF9] rounded-t-[2rem] sm:rounded-3xl border border-[#241621]/10 max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto relative"
          >
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto sm:hidden shrink-0" />

            <div className="flex items-center justify-between border-b border-[#241621]/8 pb-3">
              <h3 className="font-display text-xl font-bold text-neutral-800 flex items-center gap-2">
                <span>🌸</span> Add Your Memory
              </h3>
              <button
                type="button"
                onClick={() => setShowContributeSheet(false)}
                className="h-7 w-7 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 bg-neutral-100/70 p-1 rounded-xl">
              {(
                [
                  { key: "wish", label: "Wish", icon: FileText },
                  { key: "photo", label: "Photo", icon: ImageIcon },
                  { key: "audio", label: "Audio", icon: Mic },
                  { key: "video", label: "Video", icon: VideoIcon },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setContribType(key);
                    setContribFiles([]);
                  }}
                  className={`py-2 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                    contribType === key
                      ? "bg-white text-[#E4603C] shadow-xs"
                      : "text-[#594855] hover:text-neutral-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4">
              {/* Message text area */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Your message or caption
                </label>
                <textarea
                  value={contribText}
                  onChange={(e) => setContribText(e.target.value.slice(0, 500))}
                  placeholder="Write your heartfelt wish, favorite memory, or inside joke..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 p-3.5 text-xs sm:text-sm outline-none focus:border-[#E4603C] resize-none bg-white"
                />
                <span className="text-[10px] text-neutral-400 font-bold block text-right mt-1">
                  {contribText.length} / 500 characters
                </span>
              </div>

              {/* Uploaded File Preview Grid */}
              {contribFiles.length > 0 && (
                <div className="border border-neutral-100 bg-neutral-50 rounded-2xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-[#594855] uppercase tracking-wider">
                    Attached Media ({contribFiles.length}):
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {contribFiles.map((file, i) => (
                      <div
                        key={i}
                        className="relative h-16 w-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
                      >
                        {contribType === "photo" ? (
                          <img src={file} alt="Preview" className="h-full w-full object-cover" />
                        ) : contribType === "audio" ? (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-[#E4603C]">
                            🎙️ Audio
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-[#E4603C]">
                            🎥 Video
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setContribFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white h-4.5 w-4.5 rounded-full text-[9px] flex items-center justify-center font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Media Upload Actions */}
              {contribType === "photo" && (
                <div>
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleRealPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-200 hover:border-[#E4603C] rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white transition"
                  >
                    <Upload className="h-5 w-5 text-[#E4603C]" />
                    <span className="text-xs font-bold text-neutral-800">
                      Choose Photos from Device
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      JPG, PNG, WEBP (Up to 6 photos, max 10MB each)
                    </span>
                  </button>
                </div>
              )}

              {contribType === "video" && (
                <div>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleRealVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-200 hover:border-[#E4603C] rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white transition"
                  >
                    <VideoIcon className="h-5 w-5 text-[#E4603C]" />
                    <span className="text-xs font-bold text-neutral-800">
                      Choose Video from Device
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      MP4, MOV, WEBM (Max 50MB)
                    </span>
                  </button>
                </div>
              )}

              {contribType === "audio" && (
                <div className="border border-neutral-200 rounded-2xl p-5 text-center bg-white space-y-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRealMicrophoneRecording}
                        className="h-14 w-14 rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white flex items-center justify-center shadow-md cursor-pointer transition active:scale-95"
                      >
                        <Mic className="h-6 w-6" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRealMicrophoneRecording}
                        className="h-14 w-14 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center shadow-md cursor-pointer animate-pulse"
                      >
                        <Square className="h-5 w-5 fill-white" />
                      </button>
                    )}

                    <span className="text-xs font-bold text-neutral-800">
                      {isRecording
                        ? `Recording: ${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, "0")} (Tap to Stop)`
                        : "Tap microphone to record voice note"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleRealAudioUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => audioFileInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#C17F5A] hover:underline cursor-pointer"
                    >
                      Or upload an audio file from your device
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-40 transition"
              >
                Post to {activeMemory.recipient}'s Page ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SOCIODEX AUTHENTICATION MODAL ── */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          {authOtpNotice && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 animate-bounce max-w-sm w-full bg-[#E4603C] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
              <Sparkles className="h-5 w-5 animate-spin shrink-0" />
              <div className="text-xs font-medium leading-normal">{authOtpNotice}</div>
            </div>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[2.5rem] border border-[#241621]/15 bg-white/95 p-6 shadow-[0_24px_70px_rgba(36,22,33,0.15)] backdrop-blur-2xl transition-all sm:p-8 text-center"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2 mt-2">
              <div className="flex justify-center">
                <SocioDexLogo size="lg" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#241621] pt-1">
                Sign In to SocioDex
              </h2>
              <p className="text-xs text-[#6B5A66] px-3 font-medium">
                Access your celebration memory pages, activity dashboard, and guest RSVPs.
              </p>
            </div>

            {/* Tab Selection */}
            {authPhoneStep === "input" && (
              <div className="mt-6 flex rounded-full bg-[#F4ECE0] p-1">
                <button
                  type="button"
                  onClick={() => setAuthTab("google")}
                  className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authTab === "google"
                      ? "bg-white text-[#241621] shadow-xs"
                      : "text-[#6B5A66] hover:text-[#241621]"
                  }`}
                >
                  <Chrome className="h-3.5 w-3.5 text-[#E4603C]" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab("email")}
                  className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authTab === "email"
                      ? "bg-white text-[#241621] shadow-xs"
                      : "text-[#6B5A66] hover:text-[#241621]"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 text-[#E4603C]" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab("phone")}
                  className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authTab === "phone"
                      ? "bg-white text-[#241621] shadow-xs"
                      : "text-[#6B5A66] hover:text-[#241621]"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5 text-[#E4603C]" />
                  Mobile
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {authLoading ? (
              <div className="my-10 flex flex-col items-center justify-center py-6 text-center">
                <span className="relative flex h-10 w-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E4603C]/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-[#E4603C]/20 items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#E4603C] animate-spin" />
                  </span>
                </span>
                <div className="mt-5 text-sm font-bold text-[#241621]">Connecting to Secure Auth...</div>
                <div className="text-[10px] text-[#6B5A66] mt-1 font-medium">
                  Redirecting to secure authentication
                </div>
              </div>
            ) : (
              <div className="mt-6">
                {/* GOOGLE SIGN IN PANEL */}
                {authTab === "google" && (
                  <div className="space-y-4">
                    {authGoogleError && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed text-left">
                        {authGoogleError}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-4 py-3.5 text-sm font-bold text-[#241621] shadow-xs transition-all cursor-pointer"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-[#6B5A66] uppercase tracking-widest font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#E4603C]" /> END-TO-END ENCRYPTED
                    </div>
                  </div>
                )}

                {/* EMAIL SIGN IN PANEL */}
                {authTab === "email" && (
                  <form onSubmit={handleEmailMagicLinkSubmit} className="space-y-4 text-left">
                    {authEmailNotice && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium leading-relaxed">
                        {authEmailNotice}
                      </div>
                    )}
                    {authEmailError && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                        {authEmailError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmailInput}
                        onChange={(e) => setAuthEmailInput(e.target.value)}
                        placeholder="sarah@example.com"
                        className="mt-1 w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-xs outline-none focus:border-[#E4603C]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Send Magic Login Link ✉️
                    </button>
                    <div className="flex items-center justify-center gap-2 py-1 text-[10px] text-[#6B5A66] uppercase tracking-widest font-semibold text-center">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#E4603C]" /> END-TO-END ENCRYPTED
                    </div>
                  </form>
                )}

                {/* PHONE SIGN IN PANEL */}
                {authTab === "phone" && (
                  <div>
                    {authPhoneStep === "input" ? (
                      <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={authPhoneName}
                            onChange={(e) => setAuthPhoneName(e.target.value)}
                            placeholder="e.g. Sarah Miller"
                            className="mt-1 w-full rounded-2xl border border-[#241621]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#E4603C]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={authPhoneNumber}
                            onChange={(e) => setAuthPhoneNumber(e.target.value)}
                            placeholder="e.g. +1 555 019 2831"
                            className="mt-1 w-full rounded-2xl border border-[#241621]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#E4603C]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="mt-2 w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-3.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
                        >
                          Verify Mobile Number
                        </button>
                        <div className="flex items-center justify-center gap-2 py-1 text-[10px] text-[#6B5A66] uppercase tracking-widest font-semibold text-center">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#E4603C]" /> END-TO-END ENCRYPTED
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleOtpVerify} className="space-y-5">
                        <div className="text-center">
                          <h3 className="text-sm font-bold text-[#241621]">
                            Enter Verification Code
                          </h3>
                          <p className="mt-1 text-xs text-[#6B5A66] font-medium">
                            We sent a code to <strong>{authPhoneNumber}</strong>
                          </p>
                        </div>

                        <div className="flex justify-center gap-3 py-1">
                          {authOtpCode.map((digit, i) => (
                            <input
                              key={i}
                              ref={authOtpRefs[i]}
                              type="text"
                              maxLength={1}
                              value={digit}
                              placeholder="0"
                              onChange={(e) => handleAuthOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleAuthOtpKeyDown(i, e)}
                              className="h-14 w-12 rounded-2xl border border-[#241621]/15 bg-white text-center font-display text-xl font-bold outline-none focus:border-[#E4603C]"
                            />
                          ))}
                        </div>

                        {authOtpError && (
                          <div className="text-center text-xs font-bold text-[#E4603C]">
                            {authOtpError}
                          </div>
                        )}

                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAuthPhoneStep("input")}
                            className="flex-1 rounded-full border border-[#241621]/15 py-3 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] cursor-pointer"
                          >
                            Change Number
                          </button>
                          <button
                            type="submit"
                            className="flex-1 rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-3 text-xs font-bold text-white shadow-md cursor-pointer"
                          >
                            Confirm & Sign In
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4 PAGE ROLES & PERMISSION MATRIX MODAL ── */}
      {showRolesModal && (
        <div
          onClick={() => setShowRolesModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-[#241621]/15 space-y-4 text-left max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#241621]/10 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E4603C]">
                  Access & Security
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#241621]">
                  Page Roles & Permission Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRolesModal(false)}
                className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#594855] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 border border-[#241621]/10 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#126462] text-white font-bold">
                    <th className="p-3 border-b border-[#126462]/30 min-w-[180px]">Action</th>
                    <th className="p-3 border-b border-[#126462]/30 text-center">Creator</th>
                    <th className="p-3 border-b border-[#126462]/30 text-center">Admin</th>
                    <th className="p-3 border-b border-[#126462]/30 text-center">Contributor</th>
                    <th className="p-3 border-b border-[#126462]/30 text-center">Follower</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241621]/10">
                  {Object.entries(PERMISSION_MATRIX).map(([key, item], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? "bg-[#FFFDF9]" : "bg-white"}>
                      <td className="p-3 font-semibold text-[#241621]">{item.label}</td>
                      <td className="p-3 text-center bg-[#EAF5EC] text-emerald-700 font-bold text-base">
                        {item.creator ? "✓" : <span className="text-neutral-300 text-xs font-normal">✕</span>}
                      </td>
                      <td className="p-3 text-center bg-[#F3F0FA]">
                        {item.admin ? (
                          <span className="text-emerald-700 font-bold text-base">✓</span>
                        ) : (
                          <span className="text-neutral-300 text-xs font-normal">✕</span>
                        )}
                      </td>
                      <td className="p-3 text-center bg-[#FDF7E7]">
                        {item.contributor ? (
                          <span className="text-emerald-700 font-bold text-base">✓</span>
                        ) : (
                          <span className="text-neutral-300 text-xs font-normal">✕</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.follower ? (
                          <span className="text-emerald-700 font-bold text-base">✓</span>
                        ) : (
                          <span className="text-neutral-300 text-xs font-normal">✕</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 shrink-0">
              <span className="text-[11px] text-[#594855]">
                Your Role: <strong className="text-[#E4603C] uppercase">{userRole}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowRolesModal(false)}
                className="rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HOST SETTINGS DRAWER ── */}
      {showSettingsDrawer && (
        <div
          onClick={() => setShowSettingsDrawer(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full h-full p-6 shadow-2xl flex flex-col gap-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-neutral-800">
                  Page Settings ⚙️
                </h3>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Host Controls
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="h-8 w-8 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contribution mode selector */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C17F5A] flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> Contribution Mode
              </h4>
              <div className="grid gap-2">
                {(["open", "guests", "closed"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                      activeMemory.contributionMode === mode
                        ? "border-[#E4603C] bg-[#F4ECE0]/15 font-bold"
                        : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="col-mode"
                        checked={activeMemory.contributionMode === mode}
                        onChange={() =>
                          updatePageSettings(activeMemory.slug, { contributionMode: mode })
                        }
                        className="text-[#E4603C]"
                      />
                      <span>
                        {mode === "open"
                          ? "Open to Everyone (Instant)"
                          : mode === "guests"
                            ? "Invited Guests Only"
                            : "Closed (Host only)"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Auto approve toggle */}
            <div className="flex items-center justify-between border-t border-b border-neutral-100 py-4">
              <div>
                <h4 className="text-xs font-bold text-neutral-800">
                  Auto-approve contributions
                </h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Publish posts immediately without moderation queue.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeMemory.autoApprove}
                  onChange={(e) =>
                    updatePageSettings(activeMemory.slug, { autoApprove: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E4603C]" />
              </label>
            </div>

            {/* Expiry Picker */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C17F5A] flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Stop accepting posts after:
              </h4>
              <input
                type="datetime-local"
                value={activeMemory.expiresAt || ""}
                onChange={(e) =>
                  updatePageSettings(activeMemory.slug, { expiresAt: e.target.value || null })
                }
                className="w-full rounded-xl border border-neutral-200 p-2 text-xs outline-none focus:border-[#E4603C]"
              />
            </div>

            {/* Moderation Queue */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-neutral-100 pt-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C17F5A] mb-3 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" /> Moderation Queue ({pendingContributions.length})
              </h4>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {pendingContributions.map((pending) => (
                  <div
                    key={pending.id}
                    className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-bold text-neutral-800">
                        {pending.contributor_name}
                      </div>
                      <span className="text-[9px] text-neutral-400 uppercase">{pending.type}</span>
                    </div>

                    <p className="text-xs text-neutral-600">
                      {pending.content_text}
                    </p>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateSimulatedContributionStatus(activeMemory.slug, pending.id, "rejected");
                          toast.error("Contribution rejected.");
                        }}
                        className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold px-3 py-1 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateSimulatedContributionStatus(activeMemory.slug, pending.id, "approved");
                          toast.success("Contribution approved live!");
                        }}
                        className="rounded-full bg-green-100 hover:bg-green-200 text-green-800 text-[10px] font-bold px-3 py-1 cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}

                {pendingContributions.length === 0 && (
                  <div className="text-center py-6 text-neutral-400 text-xs font-semibold">
                    Queue is clear. No pending posts to review.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL SCREEN LIGHTBOX ── */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer border border-white/10"
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center cursor-pointer border border-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}

          {lightboxIndex < masonryPhotos.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center cursor-pointer border border-white/10"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
          >
            <div className="aspect-square sm:aspect-video overflow-hidden rounded-2xl flex items-center justify-center bg-black">
              <img
                src={masonryPhotos[lightboxIndex]?.src}
                alt="Enlarged"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="text-white px-2">
              <span className="text-xs font-bold text-white block">
                Posted by {masonryPhotos[lightboxIndex]?.contributorName}
              </span>
              <p className="text-[11px] text-neutral-400 mt-1">
                {masonryPhotos[lightboxIndex]?.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CELEBRATORY ANIMATION KEYFRAMES ── */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes sparkleMove {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-105vh) scale(1.2);
            opacity: 0;
          }
        }
        .confetti-piece {
          position: fixed;
          top: -20px;
          border-radius: 3px;
          pointer-events: none;
          z-index: 9999;
          animation: confettiBurst 2.5s ease-out forwards;
        }
        @keyframes confettiBurst {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
