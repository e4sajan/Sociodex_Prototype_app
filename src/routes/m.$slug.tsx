import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  useStore,
  type Collaborator,
  type MemoryData,
  type SimulatedContribution,
  type SimulatedReaction,
  type SimulatedReply,
} from "@/lib/store";
import { THEMES } from "@/lib/data";
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
  Users,
  Plus,
  Trash2,
  Shield,
  AlertCircle,
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
  Eye,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/m/$slug")({
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
    accent: "#2C5F2E",
    text: "#1A1714",
    name: "Sage",
  },
  t2: {
    bg: "#F5E5DA",
    gradient: "linear-gradient(135deg, #FAF2EC 0%, #E3C3AF 100%)",
    card: "#FFFFFF",
    accent: "#C17F5A",
    text: "#1A1714",
    name: "Terracotta",
  },
  t3: {
    bg: "#E5E7F2",
    gradient: "linear-gradient(135deg, #F2F3FB 0%, #C4CADF 100%)",
    card: "#FFFFFF",
    accent: "#3E4A75",
    text: "#1A1714",
    name: "Indigo",
  },
  t4: {
    bg: "#F8E6CB",
    gradient: "linear-gradient(135deg, #FDF9F2 0%, #E9C99A 100%)",
    card: "#FFFFFF",
    accent: "#D29A4D",
    text: "#1A1714",
    name: "Sunset",
  },
  t5: {
    bg: "#F4E1DD",
    gradient: "linear-gradient(135deg, #FAF4F3 0%, #E5C3BE 100%)",
    card: "#FFFFFF",
    accent: "#B85D6E",
    text: "#1A1714",
    name: "Rose",
  },
};

/* ─── Avatar Colours Rotator ─── */
const AVATAR_PALETTES = [
  { bg: "#EAF3DE", text: "#27500A" }, // green
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

/* ─── Confetti Animation ─── */
function ConfettiAnimation() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      duration: Math.random() * 4 + 5, // 5-9s
      delay: Math.random() * 6, // 0-6s
      color: ["#c9915a", "#c96b75", "#3a8a94", "#4a8055", "#7a5faa"][i % 5],
      shape: i % 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
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
            borderRadius: p.shape === 0 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.75,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Custom CSS Audio Player with Waveform-style Progress Bar ─── */
function SimulatedAudioPlayer({ src, name }: { src?: string; name: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = (clickX / width) * 100;
    setProgress(newProgress);
  };

  // Generate mock heights for waveform lines
  const waveformBars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const height = 15 + Math.sin(i * 0.4) * 10 + Math.random() * 8;
      return Math.max(8, Math.min(32, height));
    });
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white border border-neutral-100 rounded-2xl p-3.5 shadow-sm max-w-md w-full">
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2C5F2E] hover:bg-[#4A8A4C] text-white transition-all cursor-pointer shadow-sm"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-white" />
        ) : (
          <Play className="h-5 w-5 fill-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-neutral-800 truncate mb-1.5 flex items-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5 text-[#2C5F2E]" />
          {name}
        </div>

        {/* Waveform container */}
        <div
          onClick={handleWaveformClick}
          className="h-8 flex items-center gap-[3px] cursor-pointer relative"
        >
          {waveformBars.map((barHeight, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isActive = progress >= barProgress;
            return (
              <span
                key={idx}
                className="w-[3px] rounded-full transition-all duration-150"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: isActive ? "#2C5F2E" : "#E5E5E5",
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

  // Luxury background drifting sparkles list
  const sparklesList = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 3, // 3px to 7px
      delay: Math.random() * 5, // 0 to 5 seconds
      duration: Math.random() * 6 + 6, // 6 to 12 seconds
    }));
  }, []);

  // Zustand State
  const memories = useStore((s) => s.memories || {});
  const fallbackMemory = useStore((s) => s.memory);
  const activeMemory = memories[slug] || (fallbackMemory?.slug === slug ? fallbackMemory : null);

  const currentUser = useStore((s) => s.currentUser);
  const guests = useStore((s) => s.guests || []);

  // Store actions
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

  // Local UI States
  const [tab, setTab] = useState<"all" | "photos" | "videos">("all");
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [showContributeSheet, setShowContributeSheet] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Form states for adding contribution
  const [contribType, setContribType] = useState<"wish" | "photo" | "audio" | "video">("wish");
  const [contribText, setContribText] = useState("");
  const [contribFiles, setContribFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Media Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Auth Modal states for the simulated Magic Link
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Toast container refs / local toast state
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

  // SEED INITIAL MOCK DATA IF NONE EXISTS
  useEffect(() => {
    if (!activeMemory) return;

    // Seed mock contributions if they are not defined or are empty
    if (!activeMemory.contributions || activeMemory.contributions.length === 0) {
      const mockContributions: SimulatedContribution[] = [
        {
          id: "mock-c1",
          memory_page_id: activeMemory.slug,
          contributor_id: "user-mock1",
          contributor_name: "Ananya Sharma",
          contributor_avatar_color: "#EAF3DE",
          type: "wish",
          content_text:
            "Wishing you the absolute happiest of birthdays! You bring so much light and joy into our lives. May this year be filled with beautiful plants, abundance, and endless peace. 🎂🌸",
          status: "approved",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        },
        {
          id: "mock-c2",
          memory_page_id: activeMemory.slug,
          contributor_id: "user-mock2",
          contributor_name: "Rajan Mehta",
          contributor_avatar_color: "#E6F1FB",
          type: "photo",
          content_text:
            "Sharing this beautiful memory from our botanical garden tour last summer. Perfect occasion to share this! 🌿🍃",
          media_urls: [
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600",
          ],
          status: "approved",
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        },
        {
          id: "mock-c3",
          memory_page_id: activeMemory.slug,
          contributor_id: "user-mock3",
          contributor_name: "Meera Iyer",
          contributor_avatar_color: "#FAEEDA",
          type: "audio",
          content_text: "Sent you a small birthday song and blessing voice note!",
          media_urls: ["simulated-audio-note.mp3"],
          status: "approved",
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        },
        {
          id: "mock-c4",
          memory_page_id: activeMemory.slug,
          contributor_id: "user-mock4",
          contributor_name: "Priya Nair",
          contributor_avatar_color: "#EEEDFE",
          type: "wish",
          content_text:
            "Cheers to another gorgeous orbit around the sun! Hope you get pampered today. Hugs! 🥰🥂",
          status: "pending", // Sits in Host Moderation queue!
          created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
        },
      ];

      const mockReactions: SimulatedReaction[] = [
        {
          id: "mr1",
          contribution_id: "mock-c1",
          user_id: "user-mock2",
          type: "heart",
          created_at: new Date().toISOString(),
        },
        {
          id: "mr2",
          contribution_id: "mock-c1",
          user_id: "user-mock3",
          type: "clap",
          created_at: new Date().toISOString(),
        },
        {
          id: "mr3",
          contribution_id: "mock-c2",
          user_id: "user-mock1",
          type: "hug",
          created_at: new Date().toISOString(),
        },
      ];

      const mockReplies: SimulatedReply[] = [
        {
          id: "rep1",
          contribution_id: "mock-c1",
          author_id: "user-mock3",
          author_name: "Meera Iyer",
          content_text: "Beautifully said Ananya! Sums it up perfectly.",
          created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        },
      ];

      updateMemory(activeMemory.slug, {
        contributions: mockContributions,
        reactions: mockReactions,
        replies: mockReplies,
        contributionMode: "open",
        autoApprove: false,
        pinnedContributionIds: [],
        expiresAt: null,
      });
    }
  }, [activeMemory, updateMemory]);

  // Load appropriate theme properties
  const pageTheme = PUBLIC_THEMES[activeMemory?.themeId || "t1"] || PUBLIC_THEMES.t1;

  // Real-time counter helpers
  const approvedContributions = useMemo(() => {
    if (!activeMemory) return [];
    return (activeMemory.contributions || []).filter((c) => c.status === "approved");
  }, [activeMemory]);

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
    // If user is logged in as creator or Admin, they can moderate
    if (!currentUser) return false;
    const creatorEmail = activeMemory.from.toLowerCase().replace(/\s+/g, "") + "@example.com";
    return (
      currentUser.email?.toLowerCase() === creatorEmail ||
      currentUser.email?.toLowerCase() === "admin@example.com" ||
      currentUser.email?.toLowerCase() === "creator@example.com"
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
    const list = [...approvedContributions];

    // Separate pinned items so they go to the top
    const pinnedIds = activeMemory.pinnedContributionIds || [];
    list.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Reverse chronological order for rest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (tab === "all") return list;
    if (tab === "photos") return list.filter((c) => c.type === "photo");
    if (tab === "videos") return list.filter((c) => c.type === "video");
    return list;
  }, [approvedContributions, tab, activeMemory?.pinnedContributionIds]);

  // Masonry layout photo feed: approved contributions (photos) + host memory photos
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

  if (!activeMemory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] p-4 text-center">
        <div>
          <Sprout className="mx-auto h-12 w-12 text-[#2C5F2E] mb-4 animate-bounce" />
          <h1 className="font-display text-2xl font-bold">Memory card not found</h1>
          <p className="text-neutral-500 mt-2">
            The memory page you are trying to view does not exist.
          </p>
          <Link
            to="/"
            className="inline-block mt-4 rounded-full bg-[#2C5F2E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4A8A4C] transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Handle RSVP status click
  const handleRsvpClick = (status: "attending" | "declined") => {
    if (!guestId) {
      toast.error("Access RSVP link through your digital card invitation.");
      return;
    }
    setGuestRsvp(guestId, status);
    toast.success(`RSVP updated successfully! Thank you.`, {
      description:
        status === "attending" ? "You are marked as attending! 🥳" : "You are marked as declined.",
    });
  };

  // Auth flow simulation handler
  const handleSimulatedSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authName.trim()) return;

    setIsAuthLoading(true);
    setTimeout(() => {
      // Create user session
      const mockSession = {
        name: authName.trim(),
        email: authEmail.toLowerCase().trim(),
        avatar: "😊",
        provider: "google" as const,
      };
      useStore.getState().login(mockSession);
      setIsAuthLoading(false);
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthName("");
      toast.success(`Signed in as ${mockSession.name}! Welcome.`);
    }, 1200);
  };

  // Add simulated contribution submission
  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (contribType === "wish" && !contribText.trim()) return;

    setIsUploading(true);
    setUploadProgress(10);

    const timer = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            // Determine status based on autoApprove toggle & expiry & contributionMode
            let targetStatus: "pending" | "approved" = "pending";
            if (activeMemory.autoApprove) {
              targetStatus = "approved";
            }

            const avatarStyle = getAvatarStyle(currentUser.name);

            const newContrib: SimulatedContribution = {
              id: crypto.randomUUID(),
              memory_page_id: activeMemory.slug,
              contributor_id: currentUser.email || "user-session-id",
              contributor_name: currentUser.name,
              contributor_avatar_color: avatarStyle.bg,
              type: contribType,
              content_text: contribText.trim(),
              media_urls: contribFiles.length > 0 ? contribFiles : undefined,
              status: targetStatus,
              created_at: new Date().toISOString(),
            };

            addSimulatedContribution(activeMemory.slug, newContrib);
            setIsUploading(false);
            setUploadProgress(0);
            setContribText("");
            setContribFiles([]);
            setShowContributeSheet(false);

            if (targetStatus === "approved") {
              toast.success("Memory posted live onto the feed! ✨");
            } else {
              toast.success("Submitted!", {
                description: "The host will approve your contribution shortly.",
              });
            }
          }, 400);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  // Simulated Media upload simulation (photo/video attachments)
  const triggerMockFileUpload = (type: "photo" | "video") => {
    if (type === "photo") {
      if (contribFiles.length >= 5) {
        toast.error("Maximum 5 photos allowed per post.");
        return;
      }
      // Attach gorgeous placeholder images
      const images = [
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400",
      ];
      const nextImg = images[contribFiles.length % images.length];
      setContribFiles((p) => [...p, nextImg]);
      toast.success("Photo attached! (5MB size audit passed)");
    } else {
      // Attach video placeholder
      setContribFiles(["simulated-video.mp4"]);
      toast.success("Video attached! (Upload limit 100MB passed)");
    }
  };

  // Simulated media recorder API for voice note
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordInterval.current = setInterval(() => {
      setRecordingSeconds((s) => {
        if (s >= 120) {
          stopRecording(true);
          return 120;
        }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = (save = true) => {
    setIsRecording(false);
    if (recordInterval.current) clearInterval(recordInterval.current);

    if (save && recordingSeconds > 0) {
      setContribFiles(["voice-note.webm"]);
      toast.success(
        `Voice note attached! Duration: ${Math.floor(recordingSeconds / 60)}m ${recordingSeconds % 60}s`,
      );
    }
  };

  // Reactions count mapping
  const getContributionReactions = (contribId: string) => {
    const list = activeMemory.reactions || [];
    const filtered = list.filter((r) => r.contribution_id === contribId);

    const counts = { heart: 0, clap: 0, hug: 0 };
    const myReactions: Record<string, boolean> = {};

    filtered.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (currentUser && r.user_id === currentUser.email) {
        myReactions[r.type] = true;
      }
    });

    return { counts, myReactions };
  };

  // Reactions toggle helper
  const handleReactionToggle = (contribId: string, type: "heart" | "clap" | "hug") => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    toggleSimulatedReaction(activeMemory.slug, contribId, currentUser.email || "anonymous", type);

    // Dynamic scale click audio/visual confirmation
    const btn = document.getElementById(`reaction-${contribId}-${type}`);
    if (btn) {
      btn.style.transform = "scale(1.35)";
      setTimeout(() => {
        btn.style.transform = "scale(1)";
      }, 150);
    }
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
      author_id: currentUser.email || "user-id",
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
    toast.success("Contribution removed from guestbook feed.");
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
      toast.success("Contribution pinned to the top of feed!");
    }

    updatePageSettings(activeMemory.slug, { pinnedContributionIds: updated });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageTheme.gradient,
        fontFamily: "'DM Sans', sans-serif",
        color: pageTheme.text,
      }}
      className="relative pb-24 overflow-x-hidden"
    >
      <Toaster position="top-center" />

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
          className={isUnwrapping ? "animate-unwrap" : ""}
        >
          {/* Drifting sparkles inside envelope unwrap view */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {sparklesList.slice(0, 12).map((s) => (
              <span
                key={s.id}
                style={{
                  position: "absolute",
                  left: `${s.left}%`,
                  bottom: "-20px",
                  width: s.size,
                  height: s.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(212,175,55,0.7) 0%, rgba(212,175,55,0) 70%)`,
                  boxShadow: `0 0 8px rgba(212,175,55,0.8)`,
                  animation: `sparkleMove ${s.duration}s linear ${s.delay}s infinite`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              background: "#FFFDF9",
              border: "3px double #d4af37",
              borderRadius: "2.5rem",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 24px 60px rgba(92,61,46,0.18)",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
            className="p-5 sm:p-10"
          >
            {/* Elegant Botanical Logo inside unwrap */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: `${pageTheme.accent}12`,
                border: `1.5px solid ${pageTheme.accent}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <span style={{ fontSize: "2rem" }}>🌿</span>
            </div>

            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#C17F5A",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Nandi Invites Keepsake
            </span>

            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(1.5rem, 8vw, 2.2rem)",
                margin: "0 0 1rem",
                lineHeight: 1.1,
                color: "#1A1714",
                fontWeight: 500,
              }}
            >
              {activeMemory.isInvitation ? (
                <>
                  The Wedding of <br />
                  <span style={{ fontStyle: "italic", color: pageTheme.accent, fontWeight: 600 }}>
                    {activeMemory.coupleNames || activeMemory.recipient}
                  </span>
                </>
              ) : (
                <>
                  A Memory Book for <br />
                  <span style={{ fontStyle: "italic", color: pageTheme.accent, fontWeight: 600 }}>
                    {activeMemory.recipient}
                  </span>
                </>
              )}
            </h2>

            <p
              style={{
                fontSize: "0.82rem",
                color: "#6B6159",
                lineHeight: 1.6,
                marginBottom: "2rem",
                padding: "0 0.5rem",
              }}
            >
              {activeMemory.isInvitation
                ? "You are warmly invited to celebrate this beautiful union. Tap below to unwrap and view all event details & schedules."
                : `A living scrapbook of warm wishes, photos, and voice notes from ${activeMemory.from} and loved ones. Tap to unwrap.`}
            </p>

            <button
              onClick={() => {
                setIsUnwrapping(true);
                // Trigger simulated audio click or subtle pop sound
                try {
                  const AudioContextClass =
                    window.AudioContext ||
                    (window as Window & { webkitAudioContext?: typeof AudioContext })
                      .webkitAudioContext;
                  if (AudioContextClass) {
                    const ctx = new AudioContextClass();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(520, ctx.currentTime);
                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.35);
                  }
                } catch (e) {
                  // AudioContext might be blocked or unsupported; ignore
                }

                // Trigger a burst of confetti!
                setTimeout(() => {
                  setIsRevealed(true);
                  sessionStorage.setItem(`memento-revealed-${slug}`, "true");
                  // Spawn real confetti-pieces dynamically
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
                    ][i % 5];
                    piece.style.width = Math.random() * 8 + 6 + "px";
                    piece.style.height = Math.random() * 12 + 8 + "px";
                    piece.style.animationDuration = Math.random() * 2 + 1.5 + "s";
                    piece.style.animationDelay = Math.random() * 0.2 + "s";
                    document.body.appendChild(piece);
                    setTimeout(() => piece.remove(), 3500);
                  }
                }, 850);
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
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              className="pulse-ring select-none"
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              ✉️ Unwrap Keepsake
            </button>
          </div>
        </div>
      )}

      {/* ── BACKGROUND DRIFTING SPARKLES ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {sparklesList.map((s) => (
          <span
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.left}%`,
              bottom: "-20px",
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0) 70%)`,
              boxShadow: `0 0 6px rgba(212,175,55,0.5)`,
              animation: `sparkleMove ${s.duration}s linear ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <Toaster position="top-center" />

      {/* Confetti Particle Strip */}
      <ConfettiAnimation />

      {/* Google fonts link load */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* ── TOP HEADER AUTH BAR ── */}
      {!isPreview && (
        <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-[#5c3d2e]/10 py-3.5 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-neutral-800 hover:opacity-85">
              <Sprout className="h-5 w-5 text-[#2C5F2E]" />
              <span className="font-display font-semibold text-lg tracking-tight">
                Nandi Invites
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-[#2C5F2E]/10 text-sm font-bold flex items-center justify-center border border-[#2C5F2E]/25">
                    {currentUser.name[0]}
                  </span>
                  <span className="hidden sm:inline text-xs font-bold text-neutral-700 truncate max-w-[100px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={() => {
                      useStore.getState().logout();
                      toast.success("Signed out successfully.");
                    }}
                    className="rounded-full border border-[#5c3d2e]/10 px-3.5 py-1.5 text-[11px] font-semibold hover:bg-neutral-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-[#2C5F2E] px-4.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4A8A4C] cursor-pointer shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTAINER ── */}
      <div className="max-w-3xl mx-auto px-4 mt-6 sm:px-6">
        {/* HERO SECTION */}
        <section className="text-center py-10 px-4 rounded-[2rem] border border-[#5c3d2e]/10 bg-white shadow-[0_4px_24px_rgba(92,61,46,0.03)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c9915a] to-transparent opacity-60" />

          {/* Occasion Badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4.5 py-1.5 text-xs font-bold text-white shadow-sm mb-4"
            style={{ backgroundColor: pageTheme.accent }}
          >
            {getOccasionIcon(activeMemory.occasion)} {activeMemory.occasion}
          </span>

          {activeMemory.isInvitation ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6159] block mb-2 mt-1">
                YOU ARE CORDIALLY INVITED TO CELEBRATE
              </span>
              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-900 leading-none mt-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                The {activeMemory.occasion} of
                <br />
                <span
                  style={{ color: pageTheme.accent }}
                  className="italic block mt-2.5 font-semibold"
                >
                  {activeMemory.coupleNames || activeMemory.recipient}
                </span>
              </h1>
              <p className="text-neutral-500 text-sm mt-5 max-w-md mx-auto leading-relaxed">
                Hosted with love by{" "}
                <strong className="text-neutral-800">{activeMemory.from}</strong>
              </p>
            </>
          ) : (
            <>
              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-900 leading-none mt-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Happy {activeMemory.occasion},
                <br />
                <span
                  style={{ color: pageTheme.accent }}
                  className="italic block mt-1 font-semibold"
                >
                  {activeMemory.recipient}
                </span>
              </h1>
              <p className="text-neutral-500 text-sm mt-5 max-w-md mx-auto leading-relaxed">
                With love from <strong className="text-neutral-800">{activeMemory.from}</strong>
              </p>
            </>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6B6159] mt-3">
            <Calendar className="h-3.5 w-3.5 text-[#C17F5A]" />
            {new Date(activeMemory.date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* Live Counter Strip */}
          <div className="mt-8 border-t border-neutral-100 pt-6 flex justify-around items-center max-w-sm mx-auto animate-fade-in">
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.wishes}</span>
              <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-wider">
                Wishes
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-200" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.photos}</span>
              <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-wider">
                Photos
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-200" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-800">{stats.attending}</span>
              <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-wider">
                Attending
              </span>
            </div>
          </div>
        </section>

        {/* EVENT INVITATION CARD SYSTEM */}
        {activeMemory.isInvitation && (
          <section
            className="mt-6 p-6 sm:p-8 rounded-[2rem] bg-[#FFFDF9] shadow-[0_16px_48px_rgba(92,61,46,0.06)] relative overflow-hidden animate-fade-in"
            style={{ border: "3px double #d4af37" }}
          >
            {/* Top gold line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-80" />

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                Celebration Details
              </span>
              <h3 className="font-display font-medium text-2xl text-neutral-800 mt-1">
                🌿 Ceremony & Feasts 🌿
              </h3>
              <div className="h-px w-24 bg-[#d4af37]/30 mx-auto my-3" />
            </div>

            {/* Venue and Directions */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="bg-[#FAF6EE] border border-[#d4af37]/15 rounded-2xl p-5 shadow-xs">
                <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-1">
                  📍 Venue Location
                </span>
                <strong className="text-neutral-800 text-sm block font-display leading-tight">
                  {activeMemory.venueName || "To Be Announced"}
                </strong>
                <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">
                  {activeMemory.venueAddress || "Details pending."}
                </p>

                {activeMemory.venueMapsUrl && (
                  <a
                    href={activeMemory.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#2C5F2E] to-[#1c1917] hover:opacity-95 rounded-full px-5 py-2 mt-4.5 cursor-pointer shadow-sm select-none transition-all duration-300"
                  >
                    📍 Get Map Directions
                  </a>
                )}
              </div>

              {/* Dress Code & Notes */}
              <div className="space-y-4">
                {activeMemory.dressCode && (
                  <div className="bg-[#FAF6EE] border border-[#d4af37]/15 rounded-2xl p-5 shadow-xs">
                    <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-0.5">
                      👗 Dress Code Theme
                    </span>
                    <p className="text-neutral-800 text-xs leading-normal font-semibold font-display">
                      {activeMemory.dressCode}
                    </p>
                  </div>
                )}

                {activeMemory.registryInfo && (
                  <div className="bg-[#FAF6EE] border border-[#d4af37]/15 rounded-2xl p-5 shadow-xs">
                    <span className="text-[9px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-0.5">
                      🎁 Registry & Special Notes
                    </span>
                    <p className="text-neutral-600 text-xs leading-relaxed">
                      {activeMemory.registryInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Event Timeline / Schedule */}
            {activeMemory.timeline && activeMemory.timeline.length > 0 && (
              <div className="mt-8 border-t border-[#d4af37]/20 pt-6">
                <span className="text-[10px] font-bold text-[#C17F5A] uppercase tracking-wider block mb-5 text-center">
                  🗓️ Celebration Schedule
                </span>

                <div className="relative pl-6 border-l border-[#d4af37]/30 space-y-6 max-w-sm mx-auto">
                  {activeMemory.timeline.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col gap-0.5">
                      {/* Timeline dot */}
                      <span
                        className="absolute -left-[28.5px] top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-[#d4af37]"
                        style={{ boxShadow: "0 0 4px rgba(212,175,55,0.7)" }}
                      />
                      <span className="text-[10px] font-bold text-[#C17F5A] leading-none">
                        {item.time}
                      </span>
                      <span className="text-neutral-800 text-xs font-semibold leading-normal font-display mt-0.5">
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
          <section className="mt-6 p-6 rounded-2xl border border-[#5c3d2e]/10 bg-white text-center shadow-sm">
            <h2 className="font-display text-xl font-bold text-neutral-800">
              Welcome, {currentGuest.firstName}! Will you be joining the celebration? 🥂
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Let the host know by clicking one of the options below.
            </p>

            <div className="flex items-center justify-center gap-3.5 mt-5">
              <button
                onClick={() => handleRsvpClick("attending")}
                className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentGuest.rsvp === "attending"
                    ? "bg-[#2C5F2E] text-white border-transparent"
                    : "bg-[#EAF3DE]/30 text-[#27500A] border-[#27500A]/20 hover:bg-[#EAF3DE]/60"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                I'll be there ✓
              </button>
              <button
                onClick={() => handleRsvpClick("declined")}
                className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentGuest.rsvp === "declined"
                    ? "bg-red-600 text-white border-transparent"
                    : "bg-red-50/50 text-red-700 border-red-200/50 hover:bg-red-50"
                }`}
              >
                <X className="h-3.5 w-3.5" />
                Can't make it ✗
              </button>
            </div>
          </section>
        )}

        {/* CONTRIBUTOR AVATAR STRIP */}
        {uniqueContributors.length > 0 && (
          <section className="mt-6 flex flex-wrap items-center gap-3 justify-center bg-white/40 border border-[#5c3d2e]/5 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-wider">
              Loved ones posting:
            </span>
            <div className="flex items-center -space-x-2.5">
              {uniqueContributors.slice(0, 6).map((c) => {
                const style = getAvatarStyle(c.name);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      const el = document.getElementById(`contrib-${c.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.style.boxShadow = `0 0 0 3px ${pageTheme.accent}30`;
                        setTimeout(() => {
                          el.style.boxShadow = "none";
                        }, 2000);
                      }
                    }}
                    title={`Click to scroll to ${c.name}'s wish`}
                    className="h-8 w-8 rounded-full border border-white text-xs font-bold flex items-center justify-center hover:-translate-y-1 transition-all cursor-pointer select-none"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {c.name[0]}
                  </button>
                );
              })}
              {uniqueContributors.length > 6 && (
                <span className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-bold flex items-center justify-center border border-white">
                  +{uniqueContributors.length - 6}
                </span>
              )}
            </div>
          </section>
        )}

        {/* SOFT SIGN-IN NUDGE */}
        {!currentUser && !isNudgeDismissed && (
          <section className="mt-6 p-5 rounded-2xl border border-[#5c3d2e]/10 bg-white shadow-sm flex items-start gap-4 relative animate-fade-in">
            <div className="h-10 w-10 shrink-0 rounded-full bg-amber-50 text-[#C17F5A] flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-bold text-sm text-neutral-800">Add a heartful touch</h3>
              <p className="text-xs text-neutral-500 leading-normal mt-0.5">
                Sign in to add your own wish, photo or voice note for {activeMemory.recipient}.
              </p>
              <div className="flex gap-2.5 mt-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-[#2C5F2E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#4A8A4C] transition-all cursor-pointer shadow-sm"
                >
                  Sign In Now
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNudgeDismissed(true)}
              aria-label="Dismiss banner"
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 cursor-pointer h-6 w-6 flex items-center justify-center rounded-full hover:bg-neutral-100"
            >
              ✕
            </button>
          </section>
        )}

        {/* ── HOST ORIGINAL MEDIA (Always Fully Public) ── */}
        <section className="mt-10">
          <h2
            className="font-display text-2xl font-semibold text-center text-neutral-800 mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            From the Creator 🌸
          </h2>

          {/* Original quotes */}
          {activeMemory.wishes && activeMemory.wishes.length > 0 && (
            <div className="grid gap-4.5 sm:grid-cols-2">
              {activeMemory.wishes.map((w, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[#5c3d2e]/10 relative shadow-sm"
                  style={{ borderLeft: `4px solid ${pageTheme.accent}` }}
                >
                  <span className="absolute top-4 right-4 text-2xl opacity-15 select-none font-serif">
                    "
                  </span>
                  <p className="text-neutral-700 text-sm italic font-medium leading-relaxed">
                    "{w}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Original gallery grid */}
          {activeMemory.photos && activeMemory.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6">
              {activeMemory.photos.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="aspect-square overflow-hidden rounded-2xl border border-white/50 cursor-zoom-in group shadow-sm hover:scale-[1.02] transition-all duration-300"
                >
                  <img
                    src={url}
                    alt="Memory gallery"
                    className="h-full w-full object-cover group-hover:opacity-90"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Original Audio / Voice notes */}
          {activeMemory.audios && activeMemory.audios.length > 0 && (
            <div className="grid gap-3.5 sm:grid-cols-2 mt-6">
              {activeMemory.audios.map((a) => (
                <SimulatedAudioPlayer key={a.id} name={a.name} />
              ))}
            </div>
          )}

          {/* Original videos */}
          {activeMemory.videos && activeMemory.videos.length > 0 && (
            <div className="grid gap-4.5 sm:grid-cols-2 mt-6">
              {activeMemory.videos.map((v) => (
                <div
                  key={v.id}
                  className="rounded-2xl overflow-hidden border border-white/60 bg-black shadow-md aspect-video"
                >
                  <video src={v.url} controls className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── GUEST CONTRIBUTIONS & WISHLIST FEED ── */}
        <section className="mt-14">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#5c3d2e]/10 pb-4 mb-6 gap-3">
            <h2
              className="font-display text-3xl font-bold text-neutral-800 text-center sm:text-left flex items-center gap-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Messages from the Heart ✨
            </h2>

            {/* Pill toggles */}
            <div className="flex rounded-full bg-white border border-[#5c3d2e]/10 p-0.5 shadow-sm">
              {(["all", "photos", "videos"] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  onClick={() => setTab(filterOpt)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all capitalize cursor-pointer ${
                    tab === filterOpt
                      ? "bg-[#2C5F2E] text-white"
                      : "text-[#6B6159] hover:text-neutral-800"
                  }`}
                >
                  {filterOpt === "all" ? "All Feed" : filterOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry Layout Photo Wall (if tab is photos) */}
          {tab === "photos" && masonryPhotos.length > 0 ? (
            <div className="columns-2 sm:columns-3 gap-5 space-y-6">
              {masonryPhotos.map((photo, idx) => {
                const rotation = ((idx % 3) - 1) * 2; // Tilted scrap book effect
                return (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      border: "1px solid rgba(92,61,46,0.06)",
                    }}
                    className="break-inside-avoid bg-[#FFFDF9] p-3 pb-5.5 rounded-sm shadow-md cursor-zoom-in hover:rotate-0 hover:scale-[1.04] hover:z-20 hover:shadow-xl transition-all duration-300 select-none"
                  >
                    <div className="aspect-square overflow-hidden rounded-xs border border-neutral-100 bg-neutral-50 shadow-inner">
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-3.5 text-center px-1">
                      <span className="font-handwriting text-base text-neutral-800 block truncate leading-none">
                        — {photo.contributorName}
                      </span>
                      {photo.caption &&
                        photo.caption !== "Original memory card photo" &&
                        photo.caption !== "A beautiful memory card" && (
                          <span className="text-[10px] text-[#6B6159] block mt-1.5 truncate max-w-full">
                            {photo.caption}
                          </span>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Wish/Contribution lists */
            <div className="space-y-6">
              {/* If read-only because expired */}
              {isExpired && (
                <div className="bg-[#FAEEDA]/50 text-[#633806] border border-[#FAEEDA] p-4.5 rounded-2xl text-center text-xs font-semibold leading-relaxed">
                  ⏳ This memory page is now read-only.
                </div>
              )}

              {filteredFeedContributions.map((c, index) => {
                const isPinned = (activeMemory.pinnedContributionIds || []).includes(c.id);
                const isMyOwn = currentUser && c.contributor_id === currentUser.email;

                // Locked Content Tease: Hide everything past the first 2 approved contributions if not signed in
                const isTeaseLocked = !currentUser && index >= 2;

                if (isTeaseLocked) {
                  return null; // Rendered later collectively
                }

                const style = getAvatarStyle(c.contributor_name);
                const { counts, myReactions } = getContributionReactions(c.id);
                const replies = getContributionReplies(c.id);
                const isRepliesExpanded = expandedReplies[c.id] || false;

                const angle = index % 2 === 0 ? -0.8 : 0.8;
                return (
                  <div
                    key={c.id}
                    id={`contrib-${c.id}`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transform: `rotate(${angle}deg)`,
                      borderLeft: `4px solid ${pageTheme.accent}`,
                    }}
                    className="bg-[#FFFDF9] rounded-2xl border border-[#5c3d2e]/8 p-5.5 shadow-[0_4px_20px_rgba(92,61,46,0.02)] hover:shadow-md hover:rotate-0 transition-all duration-300 relative animate-fade-in group"
                  >
                    {/* Awaiting Approval Badge */}
                    {c.status === "pending" && (
                      <span className="absolute top-4 right-12 inline-block rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 shadow-sm select-none">
                        Awaiting Approval
                      </span>
                    )}

                    {/* Pin Icon indicator */}
                    {isPinned && (
                      <div className="flex items-center gap-1 text-[#C17F5A] text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Pin className="h-3 w-3 fill-current rotate-45" /> Pinned
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-9 w-9 rounded-full text-sm font-bold flex items-center justify-center border border-white select-none"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {c.contributor_name[0]}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800 leading-none">
                            {c.contributor_name}
                          </h4>
                          <span className="text-[9px] text-[#6B6159] inline-flex items-center gap-1 mt-1 font-semibold">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(c.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* 3-dot Actions Menu (Own posts OR Host options) */}
                      {(isMyOwn || isOwner) && (
                        <div className="relative group/menu">
                          <button
                            aria-label="Actions menu"
                            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-neutral-100 bg-white p-1.5 shadow-xl opacity-0 scale-95 group-hover/menu:opacity-100 group-hover/menu:scale-100 transition-all z-10 select-none">
                            {isOwner && (
                              <>
                                <button
                                  onClick={() => handlePinToggle(c.id)}
                                  className="w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Pin className="h-3.5 w-3.5 text-[#C17F5A]" />
                                  {isPinned ? "Unpin Post" : "Pin Post"}
                                </button>
                                <button
                                  onClick={() => {
                                    updateSimulatedContributionStatus(
                                      activeMemory.slug,
                                      c.id,
                                      "rejected",
                                    );
                                    toast.success(
                                      "Contribution rejected and removed from public feed.",
                                    );
                                  }}
                                  className="w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Remove
                                </button>
                              </>
                            )}

                            {isMyOwn && !isOwner && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingContribId(c.id);
                                    setEditingContribText(c.content_text || "");
                                  }}
                                  className="w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Edit Text
                                </button>
                                <button
                                  onClick={() => handleDeleteContribution(c.id)}
                                  className="w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="mt-3">
                      {editingContribId === c.id ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={editingContribText}
                            onChange={(e) => setEditingContribText(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs outline-none focus:border-[#2C5F2E] resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingContribId(null)}
                              className="rounded-full border border-neutral-200 px-3.5 py-1 text-[10px] font-semibold hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                editSimulatedContributionText(
                                  activeMemory.slug,
                                  c.id,
                                  editingContribText,
                                );
                                setEditingContribId(null);
                                toast.success("Wish edited!");
                              }}
                              className="rounded-full bg-[#2C5F2E] px-4 py-1 text-[10px] font-semibold text-white hover:bg-[#4A8A4C]"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {c.content_text}
                        </p>
                      )}

                      {/* Attachments rendering */}
                      {c.media_urls && c.media_urls.length > 0 && (
                        <div className="mt-3.5">
                          {c.type === "photo" && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {c.media_urls.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  onClick={() =>
                                    setLightboxIndex(activeMemory.photos.length + imgIdx)
                                  }
                                  className="aspect-square rounded-xl overflow-hidden border border-neutral-100 cursor-zoom-in shadow-xs"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Attached"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {c.type === "audio" && (
                            <SimulatedAudioPlayer name="Recorded Voice Memory" />
                          )}

                          {c.type === "video" && (
                            <div className="rounded-xl overflow-hidden border border-neutral-100 bg-black aspect-video max-w-sm w-full">
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
                    <div className="mt-5 border-t border-neutral-100 pt-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {/* Heart */}
                        <button
                          id={`reaction-${c.id}-heart`}
                          onClick={() => handleReactionToggle(c.id, "heart")}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                            myReactions.heart
                              ? "bg-[#2C5F2E]/15 text-[#2C5F2E] border-transparent"
                              : "bg-white border-neutral-100 text-[#9ca3af] hover:bg-neutral-50"
                          }`}
                        >
                          <Heart
                            size={14}
                            className={myReactions.heart ? "fill-[#2C5F2E] text-transparent" : ""}
                          />
                          <span>{counts.heart}</span>
                        </button>
                        {/* Clap */}
                        <button
                          id={`reaction-${c.id}-clap`}
                          onClick={() => handleReactionToggle(c.id, "clap")}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                            myReactions.clap
                              ? "bg-[#2C5F2E]/15 text-[#2C5F2E] border-transparent"
                              : "bg-white border-neutral-100 text-[#9ca3af] hover:bg-neutral-50"
                          }`}
                        >
                          <span>👏</span>
                          <span>{counts.clap}</span>
                        </button>
                        {/* Hug */}
                        <button
                          id={`reaction-${c.id}-hug`}
                          onClick={() => handleReactionToggle(c.id, "hug")}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                            myReactions.hug
                              ? "bg-[#2C5F2E]/15 text-[#2C5F2E] border-transparent"
                              : "bg-white border-neutral-100 text-[#9ca3af] hover:bg-neutral-50"
                          }`}
                        >
                          <span>🫂</span>
                          <span>{counts.hug}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setActiveReplyId(activeReplyId === c.id ? null : c.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B6159] hover:text-neutral-800 transition cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#2C5F2E]" />
                        Reply ({replies.length})
                      </button>
                    </div>

                    {/* Inline Reply Input */}
                    {activeReplyId === c.id && (
                      <div className="mt-3.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3 flex gap-2.5">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#2C5F2E]"
                        />
                        <button
                          onClick={() => handlePostReply(c.id)}
                          className="rounded-lg bg-[#2C5F2E] hover:bg-[#4A8A4C] text-white px-3.5 text-xs font-bold cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="mt-4.5 space-y-3 pl-4.5 border-l-2 border-neutral-100">
                        {replies.slice(0, isRepliesExpanded ? undefined : 3).map((rep) => {
                          const isOwnReply = currentUser && rep.author_id === currentUser.email;
                          return (
                            <div key={rep.id} className="flex gap-2.5 items-start">
                              <span className="h-6 w-6 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 flex items-center justify-center select-none border border-neutral-200">
                                {rep.author_name[0]}
                              </span>
                              <div className="flex-1 bg-neutral-50 rounded-xl p-2.5 max-w-lg relative">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-neutral-800">
                                    {rep.author_name}
                                  </span>
                                  {isOwnReply && (
                                    <button
                                      onClick={() =>
                                        deleteSimulatedReply(activeMemory.slug, rep.id)
                                      }
                                      className="text-red-500 hover:text-red-700 h-4 w-4 flex items-center justify-center hover:bg-red-50 rounded"
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
                  </div>
                );
              })}

              {/* Locked Content Tease cards */}
              {!currentUser && approvedContributions.length > 2 && (
                <div className="relative mt-8 select-none">
                  {/* Blurred Cards */}
                  <div className="space-y-4 filter blur-[3px] opacity-45 pointer-events-none">
                    {approvedContributions.slice(2, 5).map((c, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#5c3d2e]/10 p-5 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 rounded-full bg-neutral-200" />
                          <div className="h-6 w-24 bg-neutral-200 rounded" />
                        </div>
                        <div className="h-10 bg-neutral-200 rounded mt-3" />
                      </div>
                    ))}
                  </div>

                  {/* Lock Overlay Card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#F7F3EC]/60 to-transparent flex items-center justify-center p-6">
                    <div className="bg-white border border-[#5c3d2e]/10 rounded-2xl p-6.5 text-center shadow-lg max-w-sm">
                      <Lock className="h-7 w-7 text-[#C17F5A] mx-auto mb-3" />
                      <h3 className="font-bold text-sm text-neutral-800">Explore more blessings</h3>
                      <p className="text-xs text-neutral-500 leading-normal mt-1 mb-4">
                        Sign in to see {approvedContributions.length - 2} more beautiful memories
                        from friends.
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="rounded-full bg-[#2C5F2E] hover:bg-[#4A8A4C] text-white px-6 py-2 text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        Sign in to Unlock
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty feed state */}
          {approvedContributions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 p-6">
              <span className="text-3xl block">💌</span>
              <p className="text-xs text-neutral-400 font-semibold mt-2.5">
                Feed is calm. Add the first heartfelt contribution!
              </p>
            </div>
          )}
        </section>

        {/* ── FOOTER CREATOR BADGE ── */}
        <footer className="mt-14 py-8 border-t border-[#5c3d2e]/10 text-center text-xs text-[#6B6159] flex items-center justify-center gap-1.5 select-none font-semibold">
          <Sprout className="h-3.5 w-3.5 text-[#2C5F2E]" />
          MADE WITH NANDI INVITES
        </footer>
      </div>

      {/* ── FIXED STICKY ADD PANEL (Bottom Screen CTA) ── */}
      {!isExpired && (
        <div className="fixed bottom-5 inset-x-4 z-20 max-w-xs mx-auto select-none">
          <div className="bg-white/80 backdrop-blur-md border border-[#5c3d2e]/10 shadow-xl px-4 py-2.5 rounded-full flex justify-center">
            <button
              onClick={() => {
                if (!currentUser) setShowAuthModal(true);
                else setShowContributeSheet(true);
              }}
              className="w-full rounded-full bg-[#2C5F2E] hover:bg-[#4A8A4C] text-white py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> Add yours +
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING HOST SETTINGS PANEL BUTTON ── */}
      {isOwner && (
        <button
          onClick={() => setShowSettingsDrawer(true)}
          className="fixed bottom-6 right-6 z-20 h-12 w-12 rounded-full bg-white border border-[#5c3d2e]/20 text-[#2C5F2E] shadow-lg flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95 select-none"
          title="Host Control Panel"
        >
          <Settings className="h-5.5 w-5.5" />
          {pendingContributions.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
              {pendingContributions.length}
            </span>
          )}
        </button>
      )}

      {/* ── SLIDE UP CONTRIBUTE BOTTOM SHEET / MODAL ── */}
      {showContributeSheet && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDF9]/95 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-[#5c3d2e]/8 max-w-lg w-full p-7 shadow-2xl flex flex-col gap-4.5 animate-slide-up max-h-[85vh] overflow-y-auto relative"
          >
            {/* iOS style grab handle bar */}
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-1.5 sm:hidden shrink-0" />

            <div className="flex items-center justify-between border-b border-[#5c3d2e]/8 pb-3">
              <h3 className="font-display text-xl font-bold text-neutral-800 flex items-center gap-1.5">
                <span>🌸</span> Add Your Blessing
              </h3>
              <button
                onClick={() => setShowContributeSheet(false)}
                className="h-7 w-7 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 bg-neutral-50 p-1 rounded-xl">
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
                  className={`py-2 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 cursor-pointer transition ${
                    contribType === key
                      ? "bg-white text-[#2C5F2E] shadow-xs"
                      : "text-[#6B6159] hover:text-neutral-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4">
              {/* Text Area */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Your message
                </label>
                <textarea
                  value={contribText}
                  onChange={(e) => setContribText(e.target.value.slice(0, 500))}
                  placeholder="Write a wish, a memory, an inside joke..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 p-3.5 text-xs sm:text-sm outline-none focus:border-[#2C5F2E] resize-none"
                />
                <span className="text-[10px] text-neutral-400 font-bold block text-right mt-1">
                  {contribText.length} / 500 characters
                </span>
              </div>

              {/* Upload Media Previews */}
              {contribFiles.length > 0 && (
                <div className="border border-neutral-100 bg-neutral-50/50 rounded-xl p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-wider">
                    Attachments:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {contribFiles.map((file, i) => (
                      <div
                        key={i}
                        className="relative h-14 w-14 rounded-lg overflow-hidden border border-neutral-200"
                      >
                        {contribType === "photo" ? (
                          <img src={file} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-[10px] font-bold">
                            {contribType === "audio" ? "🎙️ Audio" : "📹 Video"}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setContribFiles([])}
                          className="absolute -top-1.5 -right-1.5 bg-black/60 hover:bg-black text-white h-5 w-5 rounded-full text-[9px] flex items-center justify-center font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload actions block */}
              {contribType !== "wish" && (
                <div className="border border-dashed border-neutral-200 rounded-2xl p-4.5 text-center">
                  {contribType === "photo" && (
                    <button
                      type="button"
                      onClick={() => triggerMockFileUpload("photo")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3DE]/60 text-[#27500A] px-4.5 py-2 text-xs font-bold hover:bg-[#EAF3DE] cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Attach Photo (Max 5MB)
                    </button>
                  )}

                  {contribType === "video" && (
                    <button
                      type="button"
                      onClick={() => triggerMockFileUpload("video")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3DE]/60 text-[#27500A] px-4.5 py-2 text-xs font-bold hover:bg-[#EAF3DE] cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Attach Video (Max 100MB)
                    </button>
                  )}

                  {contribType === "audio" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md cursor-pointer animate-pulse"
                          >
                            <Mic className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => stopRecording(true)}
                            className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center shadow-md cursor-pointer"
                          >
                            <Square className="h-4 w-4 fill-white" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500">
                        {isRecording
                          ? `RECORDING: ${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, "0")} (Max 2 mins)`
                          : "Tap mic to record voice note memory"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress bars */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-neutral-500">
                    <span>Compressing & uploading media...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2C5F2E] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-full bg-[#2C5F2E] hover:bg-[#4A8A4C] text-white py-3.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-40"
              >
                Post to {activeMemory.recipient}'s Page
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SIMULATED GOOGLE magic link auth modal ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-neutral-100 max-w-[390px] w-full p-6 shadow-2xl animate-scale-up"
          >
            <div className="text-center">
              <div className="h-11 w-11 rounded-full bg-[#2C5F2E]/10 text-[#2C5F2E] flex items-center justify-center mx-auto mb-3">
                <Lock className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-800">
                Identify your warm blessings
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                Enter your details to register your memory card session and post comments.
              </p>
            </div>

            <form onSubmit={handleSimulatedSignIn} className="space-y-3.5 mt-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Rajan Mehta"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#2C5F2E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. rajan@example.com"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#2C5F2E]"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full rounded-full bg-[#2A1F1A] text-white py-3 text-xs font-bold shadow-sm hover:opacity-95 transition cursor-pointer disabled:opacity-40 mt-1"
              >
                {isAuthLoading ? "Sending magic login link..." : "Simulate magic link login"}
              </button>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-3 w-full text-center text-[10px] font-semibold text-neutral-400 hover:text-neutral-600 uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── HOST PANEL DRAWER / SETTINGS ── */}
      {showSettingsDrawer && (
        <div
          onClick={() => setShowSettingsDrawer(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full h-full p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto animate-slide-in"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-neutral-800">
                  Manage Memory Page ⚙️
                </h3>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Host controls
                </span>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="h-8 w-8 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* A: Contribution mode selector */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C17F5A] flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> Contribution Mode
              </h4>
              <div className="grid gap-2">
                {(["open", "guests", "closed"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                      activeMemory.contributionMode === mode
                        ? "border-[#2C5F2E] bg-[#EAF3DE]/10 font-bold"
                        : "border-neutral-100 hover:bg-neutral-50 text-neutral-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="col-mode"
                        checked={activeMemory.contributionMode === mode}
                        onChange={() =>
                          updatePageSettings(activeMemory.slug, { contributionMode: mode })
                        }
                        className="text-[#2C5F2E] focus:ring-[#2C5F2E] h-4 w-4"
                      />
                      <span className="capitalize text-xs leading-none">
                        {mode === "open"
                          ? "Open (anyone signed-in)"
                          : mode === "guests"
                            ? "Guests only (e-mail matching)"
                            : "Closed (host only)"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* B: Auto approve toggle */}
            <div className="flex items-center justify-between border-t border-b border-neutral-100 py-4">
              <div>
                <h4 className="text-xs font-bold text-neutral-800 leading-none">
                  Auto-approve contributions
                </h4>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Skip moderation queue and post live instantly.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeMemory.autoApprove}
                  onChange={(e) =>
                    updatePageSettings(activeMemory.slug, { autoApprove: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2C5F2E]"></div>
              </label>
            </div>

            {/* C: Expiry Picker */}
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
                className="w-full rounded-xl border border-neutral-200 p-2 text-xs outline-none focus:border-[#2C5F2E]"
              />
            </div>

            {/* D: Approval Queue Tab */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-neutral-100 pt-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C17F5A] mb-3 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" /> Moderation Queue ({pendingContributions.length})
              </h4>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {pendingContributions.map((pending) => (
                  <div
                    key={pending.id}
                    className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100 space-y-3.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700 flex items-center justify-center select-none">
                          {pending.contributor_name[0]}
                        </span>
                        <div className="text-[11px] font-bold text-neutral-800 leading-tight">
                          {pending.contributor_name}
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-400">{pending.type}</span>
                    </div>

                    <p className="text-[11px] text-neutral-600 leading-normal">
                      {pending.content_text}
                    </p>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => {
                          updateSimulatedContributionStatus(
                            activeMemory.slug,
                            pending.id,
                            "rejected",
                          );
                          toast.error("Contribution rejected.");
                        }}
                        className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold px-3 py-1 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          updateSimulatedContributionStatus(
                            activeMemory.slug,
                            pending.id,
                            "approved",
                          );
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
                    Queue is clear. Excellent moderation work! ✨
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL SCREEN SWIPEABLE MASONRY LIGHTBOX ── */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in"
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer border border-white/10"
          >
            ✕
          </button>

          {/* Navigation Arrows */}
          {lightboxIndex > 0 && (
            <button
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
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center cursor-pointer border border-white/10"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          )}

          {/* Lightbox Content Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col gap-3.5 max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl p-4"
          >
            <div className="relative aspect-square sm:aspect-video overflow-hidden rounded-2xl flex items-center justify-center bg-black">
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
              <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                {masonryPhotos[lightboxIndex]?.caption}
              </p>
              <span className="text-[9px] text-neutral-500 block mt-2">
                Date: {masonryPhotos[lightboxIndex]?.date}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── KEYFRAME ANIMATIONS INLINE CSS ── */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
