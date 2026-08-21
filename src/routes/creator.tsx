import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { OCCASIONS, THEMES } from "@/lib/data";
import { useStore, type MemoryData } from "@/lib/store";
import { saveMemoryToSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { compressImageFile } from "@/lib/imageCompressor";
import { formatMemoryHeading, getOccasionIcon } from "@/lib/occasionUtils";
import {
  Check,
  Plus,
  Trash2,
  Upload,
  Mic,
  X,
  Image as ImageIcon,
  Video,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  QrCode,
  Share2,
  AlertCircle,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Heart,
  Palette,
  Eye,
  Smartphone,
  CreditCard,
  Shield,
  Users,
  Lock,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { PostcardModal } from "@/components/PostcardModal";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "Memory Creator — SocioDex" },
      {
        name: "description",
        content:
          "Attach a personal memory page — wishes, photos, voice notes and videos — to your gift.",
      },
    ],
  }),
  component: MemoryCreator,
});

function MemoryCreator() {
  const currentUser = useStore((s) => s.currentUser);
  const setMemory = useStore((s) => s.setMemory);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/login", search: { redirect: "/creator" } });
    }
  }, [currentUser, navigate]);

  // ── Step Navigation State (1: Details, 2: Wishes & Media, 3: Template & Launch) ──
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ── Step 1: Basic Details ──
  const [pageType, setPageType] = useState<"wish" | "invite">("wish");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [customHeading, setCustomHeading] = useState("");
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState(currentUser?.name || "");
  const [date, setDate] = useState("");

  const isCustomOccasion =
    occasion === "Other" ||
    occasion === "Other (Custom Heading)" ||
    occasion.toLowerCase().startsWith("other");

  // Invitation specific fields
  const isInvitation = pageType === "invite";
  const [coupleNames, setCoupleNames] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueMapsUrl, setVenueMapsUrl] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [registryInfo, setRegistryInfo] = useState("");
  const [timeline, setTimeline] = useState<{ time: string; event: string }[]>([
    { time: "", event: "" },
  ]);

  // Corporate Mode
  const [isCorporate, setIsCorporate] = useState(false);
  const [corporateLogo, setCorporateLogo] = useState("");

  // ── Step 2: Wishes & Media ──
  const [hostWish, setHostWish] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [audios, setAudios] = useState<{ id: string; name: string; url: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [recording, setRecording] = useState(false);

  // ── Step 3: Design Template & Privacy ──
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [contributionMode, setContributionMode] = useState<"open" | "guests" | "closed">("open");

  // ── Final Created State & UI ──
  const [created, setCreated] = useState<MemoryData | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  const photoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const activeTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const compressed = await compressImageFile(file, 600, 600, 0.85);
      setCorporateLogo(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setCorporateLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePageTypeSelect = (type: "wish" | "invite") => {
    setPageType(type);
    if (type === "invite") {
      setOccasion("Wedding");
    } else {
      setOccasion("Birthday");
    }
  };

  // Validation for Step 1
  const isStep1Valid = () => {
    if (isCustomOccasion && !customHeading.trim() && !recipient.trim()) {
      return false;
    }
    const baseValid = isInvitation
      ? coupleNames.trim() && from.trim() && date
      : (isCustomOccasion ? (customHeading.trim() || recipient.trim()) : recipient.trim()) &&
        from.trim() &&
        date;

    if (isCorporate && !corporateLogo) {
      return false;
    }
    return Boolean(baseValid);
  };

  const isValid = () => isStep1Valid();

  const handlePhotos = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      try {
        const compressed = await compressImageFile(f, 1200, 1200, 0.78);
        setPhotos((p) => [...p, compressed]);
      } catch {
        const r = new FileReader();
        r.onload = () => setPhotos((p) => [...p, r.result as string]);
        r.readAsDataURL(f);
      }
    }
  };

  const handleAudio = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      setAudios((a) => [
        ...a,
        { id: crypto.randomUUID(), name: f.name, url: URL.createObjectURL(f) },
      ]);
    });
  };

  const handleVideo = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 3 - videos.length)
      .forEach((f) => {
        setVideos((v) => [
          ...v,
          { id: crypto.randomUUID(), name: f.name, url: URL.createObjectURL(f) },
        ]);
      });
  };

  const simulateRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setAudios((a) => [
        ...a,
        { id: crypto.randomUUID(), name: `Voice note ${a.length + 1}.webm`, url: "" },
      ]);
    }, 2000);
  };

  const handleCreate = async () => {
    if (creating || !isValid()) return;
    setCreateError(null);
    setCreating(true);
    console.log("[handleCreate] starting", { recipient, coupleNames, from, date, hostWish });
    try {
      const finalOccasion = isCustomOccasion
        ? customHeading.trim() || "Special Memory"
        : occasion;
      const displayName = isInvitation
        ? coupleNames.trim()
        : recipient.trim() || (isCustomOccasion ? customHeading.trim() : "");
      const cleanSlugSource =
        (customHeading.trim() || displayName || "memory")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "memory";
      const slug = `${cleanSlugSource.slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;

      const data: MemoryData = {
        slug,
        occasion: finalOccasion,
        customHeading: customHeading.trim() || undefined,
        recipient: displayName,
        from: from.trim(),
        creatorName: currentUser?.name || from.trim(),
        creatorEmail: currentUser?.email || "",
        followers: [currentUser?.name || from.trim()],
        date,
        themeId,
        wishes: isInvitation ? [] : [hostWish.trim()].filter(Boolean),
        photos,
        audios,
        videos,
        // Invitation details
        isInvitation,
        pageType,
        coupleNames: isInvitation ? coupleNames.trim() : "",
        venueName: isInvitation ? venueName.trim() : "",
        venueAddress: isInvitation ? venueAddress.trim() : "",
        venueMapsUrl: isInvitation ? venueMapsUrl.trim() : "",
        dressCode: isInvitation ? dressCode.trim() : "",
        registryInfo: isInvitation ? registryInfo.trim() : "",
        timeline: isInvitation ? timeline.filter((t) => t.time && t.event) : [],
        visibility: "public",
        allowedActions: { addPhotos: true, addVideos: true, addComments: true },
        collaborators: [],
        comments: [],
        contributedMedia: [],
        collaborationRequests: [],
        contributionMode,
        autoApprove: true,
        pinnedContributionIds: [],
        expiresAt: null,
        contributions: [],
        reactions: [],
        replies: [],
        isCorporate,
        corporateLogo,
      };

      const url =
        typeof window !== "undefined" ? `${window.location.origin}/m/${slug}` : `/m/${slug}`;
      console.log("[handleCreate] generating QR for", url);
      const generatedQr = await QRCode.toDataURL(url, {
        margin: 1,
        width: 360,
        color: { dark: activeTheme.accent || "#E4603C", light: "#FFFDF9" },
      });
      console.log("[handleCreate] QR generated, setting state");
      setMemory(data);
      if (isSupabaseConfigured) {
        try {
          await saveMemoryToSupabase(data);
        } catch (err) {
          console.error("[Creator] Supabase sync error:", err);
        }
      }
      setQrUrl(generatedQr);
      setCreated(data);
      console.log("[handleCreate] done");
    } catch (err) {
      console.error("[handleCreate] Failed to create memory page:", err);
      setCreateError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  if (created)
    return (
      <CreatedPreview data={created} qrUrl={qrUrl} onNext={() => navigate({ to: "/tracker" })} />
    );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-4 sm:pt-6 pb-28 lg:pb-24">
      {/* Header & Tagline */}
      <div className="mb-4 sm:mb-6">
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#E4603C] block mb-0.5 sm:mb-1">
          Interactive Memory Creator
        </span>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            Create Memory Page
          </h1>
          {/* Desktop Live Sync Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 font-medium bg-white px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Live Sync</span>
          </div>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-medium max-w-xl">
          3 quick steps to craft a living memory page with wishes, photos, and music.
        </p>
      </div>

      {/* ─── 3-STEP WIZARD PROGRESS BAR (Optimized for Mobile) ─── */}
      <div className="mb-6 sm:mb-8 p-2 sm:p-3.5 rounded-2xl bg-white border border-[#241621]/10 shadow-[0_4px_24px_rgba(92,61,46,0.03)]">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          <StepTab
            stepNumber={1}
            shortTitle="Details"
            fullTitle="1. Basic Details"
            subtitle="Occasion & dates"
            isActive={currentStep === 1}
            isCompleted={currentStep > 1}
            onClick={() => setCurrentStep(1)}
          />
          <StepTab
            stepNumber={2}
            shortTitle="Wishes"
            fullTitle="2. Wishes & Media"
            subtitle="Wish, photos, audio"
            isActive={currentStep === 2}
            isCompleted={currentStep > 2}
            onClick={() => {
              if (isStep1Valid()) setCurrentStep(2);
            }}
          />
          <StepTab
            stepNumber={3}
            shortTitle="Design"
            fullTitle="3. Design & Launch"
            subtitle="Theme & privacy"
            isActive={currentStep === 3}
            isCompleted={false}
            onClick={() => {
              if (isStep1Valid()) setCurrentStep(3);
            }}
          />
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN LAYOUT (Left: Wizard Step, Right: Real-time Live Preview) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE STEP FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 1: BASIC DETAILS                                     */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card 1.1: Creation Mode Selector */}
              <div className="card-soft p-4 sm:p-6 bg-white border border-[#241621]/10 shadow-sm">
                <div className="text-left mb-3.5">
                  <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                    Step 1 · Page Type
                  </span>
                  <h2 className="font-display text-base sm:text-lg font-bold text-neutral-800">
                    What type of page are you creating?
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handlePageTypeSelect("wish")}
                    className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      pageType === "wish"
                        ? "border-[#E4603C] bg-[#F4ECE0]/20 ring-2 ring-[#E4603C]/25"
                        : "border-border bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-2xl shrink-0">🎂</span>
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-neutral-800 block">
                        Wish & Memory Book
                      </strong>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        Digital guestbook for birthdays, trips, farewells, or milestones.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageTypeSelect("invite")}
                    className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      pageType === "invite"
                        ? "border-[#E4603C] bg-[#F4ECE0]/20 ring-2 ring-[#E4603C]/25"
                        : "border-border bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-2xl shrink-0">💌</span>
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-neutral-800 block">
                        Event Invitation Card
                      </strong>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        Event page with timeline, venue map, and RSVP collection.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card 1.2: Occasion, Names & Dates */}
              <div className="card-soft p-4 sm:p-6 bg-white border border-[#241621]/10 shadow-sm space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                    Step 1 · Basic Details
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-800 flex items-center gap-2">
                    ✨ Occasion, Date & Names
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Occasion">
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="input"
                    >
                      {OCCASIONS.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label={isInvitation ? "Date of Event *" : "Date of Celebration *"}>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input"
                    />
                  </Field>

                  {/* Dedicated Custom Heading Input */}
                  {isCustomOccasion && (
                    <div className="sm:col-span-2 p-4 rounded-2xl border-2 border-[#E4603C]/35 bg-[#F4ECE0]/30 transition-all space-y-2">
                      <label className="block text-xs font-bold text-[#241621] uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>✍️ Custom Heading / Occasion Title *</span>
                        </span>
                        <span className="text-[10px] lowercase font-semibold text-[#E4603C] bg-white px-2 py-0.5 rounded-full border border-[#E4603C]/20 shadow-2xs">
                          Custom Title
                        </span>
                      </label>
                      <input
                        value={customHeading}
                        onChange={(e) => setCustomHeading(e.target.value)}
                        placeholder="e.g. A Trip to Lonavala with Team EMERGY"
                        className="input bg-white font-medium text-neutral-800 text-sm shadow-xs"
                      />
                      <p className="text-[11px] text-neutral-600 leading-normal">
                        Give your memory page a custom title (e.g.{" "}
                        <em>A Trip to Lonavala with Team EMERGY</em>, <em>Summer Reunion 2026</em>, or{" "}
                        <em>Project Alpha Milestone</em>).
                      </p>
                    </div>
                  )}

                  {!isInvitation ? (
                    <Field
                      label={
                        isCustomOccasion
                          ? "Recipient / Group Name (Optional if in heading)"
                          : "Recipient Name *"
                      }
                    >
                      <input
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder={
                          isCustomOccasion
                            ? "e.g. Team EMERGY / Everyone / Meera"
                            : "e.g. Meera Iyer"
                        }
                        className="input"
                      />
                    </Field>
                  ) : (
                    <Field label="Couple / Celebrants Name *">
                      <input
                        value={coupleNames}
                        onChange={(e) => setCoupleNames(e.target.value)}
                        placeholder="e.g. Arjun & Neha"
                        className="input"
                      />
                    </Field>
                  )}

                  <Field label={isInvitation ? "Hosts (From) *" : "Organizer Name (From) *"}>
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="e.g. The Sharma family"
                      className="input"
                    />
                  </Field>
                </div>
              </div>

              {/* Card 1.3: Corporate Branding (Optional) */}
              <div className="card-soft p-5 bg-white border border-[#241621]/10 shadow-sm">
                <input
                  ref={logoInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleLogoUpload(e.target.files)}
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💼</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800">
                        Corporate Branding Mode
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Include company logo and business styling
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCorporate(!isCorporate)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isCorporate ? "bg-[#E4603C]" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isCorporate ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isCorporate && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-neutral-500 font-medium">Upload Company Logo:</div>
                    <div className="w-full sm:w-auto flex-1 max-w-[240px]">
                      {corporateLogo ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#E4603C]/30 bg-white">
                          <div className="h-7 flex items-center justify-center p-1 bg-white rounded border border-neutral-100 flex-1 max-w-[140px]">
                            <img
                              src={corporateLogo}
                              alt="Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setCorporateLogo("")}
                            className="p-1 text-neutral-400 hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => logoInput.current?.click()}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-700 hover:border-[#E4603C]/50 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5 text-neutral-400" />
                          Upload Logo *
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 1.4: Event Venue & Timeline (If Invitation Card) */}
              {isInvitation && (
                <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-sm space-y-4">
                  <div className="border-b border-neutral-100 pb-3">
                    <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                      Event Details
                    </span>
                    <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                      📍 Venue, Schedule & Notes
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Venue Name">
                      <input
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g. Grand Royal Orchid Ballroom"
                        className="input"
                      />
                    </Field>

                    <Field label="Google Maps Link">
                      <input
                        value={venueMapsUrl}
                        onChange={(e) => setVenueMapsUrl(e.target.value)}
                        placeholder="e.g. https://maps.google.com/..."
                        className="input"
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Venue Address">
                        <input
                          value={venueAddress}
                          onChange={(e) => setVenueAddress(e.target.value)}
                          placeholder="e.g. 45 Royale Boulevard, Indiranagar, Bangalore"
                          className="input"
                        />
                      </Field>
                    </div>

                    <Field label="Dress Code">
                      <input
                        value={dressCode}
                        onChange={(e) => setDressCode(e.target.value)}
                        placeholder="e.g. Traditional Festive / Pastel Shades"
                        className="input"
                      />
                    </Field>

                    <Field label="Registry / Special Notes">
                      <input
                        value={registryInfo}
                        onChange={(e) => setRegistryInfo(e.target.value)}
                        placeholder="e.g. No Box Gifts Please / Gift Registry Link"
                        className="input"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* Bottom Step 1 Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-neutral-400 font-medium">
                  Step 1 of 3 · Basic Information
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] px-6 py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-[#c94b29] transition-all cursor-pointer shadow-md select-none"
                >
                  <span>Next: Wishes & Media</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 2: CONTRIBUTING FIRST WISH, PHOTOS, VIDEOS, AUDIO   */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card 2.1: Write First Wish */}
              <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-sm space-y-3">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                      Step 2 · Personal Greeting
                    </span>
                    <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                      ✍️ Write First Wish
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>

                <p className="text-xs text-neutral-500">
                  Pre-populate this living memory page with your personal message as the organizer.
                </p>

                <textarea
                  value={hostWish}
                  onChange={(e) => setHostWish(e.target.value)}
                  rows={4}
                  placeholder={
                    isCustomOccasion
                      ? `e.g. Unforgettable memories with ${recipient.trim() || customHeading.trim() || "the team"}! So happy to cherish these special moments together! 🌟🏕️`
                      : occasion === "Thank You"
                      ? `e.g. Thank you so much ${recipient || "Meera"}! Truly appreciate your kindness, support, and guidance. 🙏✨`
                      : occasion === "Farewell"
                      ? `e.g. Wishing you all the very best ${recipient || "Rahul"} on your next exciting chapter! You will be deeply missed. 🌿💫`
                      : occasion === "Just Because"
                      ? `e.g. Just a little reminder of how wonderful you are! Thinking of you always. 🌸💖`
                      : occasion === "Baby Shower"
                      ? `e.g. So thrilled to welcome the little angel! Wishing your family endless health and joy. 🍼💛`
                      : `e.g. Happy Birthday ${recipient || "Meera"}! Wishing you a gorgeous orbit around the sun. You bring so much light and joy into our lives! 🥰🥂`
                  }
                  className="input resize-none text-sm"
                />
              </div>

              {/* Card 2.2: Media Attachments */}
              <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-sm space-y-4">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                      Step 2 · Media Gallery
                    </span>
                    <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                      🖼️ Upload Photos, Voice Notes & Videos
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {/* Photos Column */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-600" /> Photos
                    </h4>
                    <div
                      onClick={() => photoInput.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handlePhotos(e.dataTransfer.files);
                      }}
                      className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-neutral-50/50 p-4 text-center hover:border-[#E4603C]/50 hover:bg-neutral-50 transition"
                    >
                      <Upload className="h-5 w-5 text-neutral-400" />
                      <div className="text-[11px] font-bold text-neutral-700">Add photos</div>
                      <div className="text-[10px] text-neutral-400">Drag or click</div>
                      <input
                        ref={photoInput}
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        onChange={(e) => handlePhotos(e.target.files)}
                      />
                    </div>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5 mt-2">
                        {photos.map((p, i) => (
                          <div
                            key={i}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={p}
                              alt=""
                              className="h-full w-full cursor-zoom-in object-cover"
                              onClick={() => setLightbox(p)}
                            />
                            <button
                              type="button"
                              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                              className="absolute right-1 top-1 rounded-full bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio Column */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="h-3.5 w-3.5 text-[#C17F5A]" /> Voice Notes
                    </h4>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-neutral-50/50 p-3">
                      <button
                        type="button"
                        onClick={simulateRecord}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition cursor-pointer ${
                          recording ? "bg-red-500 animate-pulse" : "bg-[#E4603C] hover:opacity-90"
                        }`}
                      >
                        <Mic className="h-4.5 w-4.5" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-neutral-700 truncate">
                          {recording ? "Recording…" : "Record voice note"}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {recording ? "Auto-saving in 2s" : "Tap mic to record"}
                        </div>
                      </div>
                    </div>
                    {audios.length > 0 && (
                      <ul className="space-y-1.5 mt-2">
                        {audios.map((a) => (
                          <li
                            key={a.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-white p-2 text-xs"
                          >
                            <span className="shrink-0">🎙️</span>
                            <div className="min-w-0 flex-1 truncate font-medium text-neutral-600">
                              {a.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => setAudios(audios.filter((x) => x.id !== a.id))}
                              className="rounded-full p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Videos Column */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-indigo-600" /> Videos
                    </h4>
                    <div
                      onClick={() => videoInput.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-neutral-50/50 p-4 text-center hover:border-[#E4603C]/50 hover:bg-neutral-50 transition"
                    >
                      <Video className="h-5 w-5 text-neutral-400" />
                      <div className="text-[11px] font-bold text-neutral-700">Upload video</div>
                      <div className="text-[10px] text-neutral-400">Max 3 clips</div>
                      <input
                        ref={videoInput}
                        type="file"
                        multiple
                        accept="video/*"
                        hidden
                        onChange={(e) => handleVideo(e.target.files)}
                      />
                    </div>
                    {videos.length > 0 && (
                      <ul className="space-y-1.5 mt-2">
                        {videos.map((v) => (
                          <li
                            key={v.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-white p-2 text-xs"
                          >
                            <span className="shrink-0">🎬</span>
                            <div className="min-w-0 flex-1 truncate font-medium text-neutral-600">
                              {v.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => setVideos(videos.filter((x) => x.id !== v.id))}
                              className="rounded-full p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Step 2 Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] px-6 py-3 text-sm font-bold text-white hover:bg-[#c94b29] transition-all cursor-pointer shadow-md select-none"
                >
                  <span>Next: Design Template</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 3: CHOOSING THE DESIGN TEMPLATE & LAUNCH            */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card 3.1: Design Theme Template Selection */}
              <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-sm space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                    Step 3 · Styling & Mood
                  </span>
                  <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                    🎨 Select Page Design Template
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select a color palette and visual theme. See the live preview update instantly!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {THEMES.map((t) => {
                    const isSelected = themeId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none relative flex flex-col justify-between ${
                          isSelected
                            ? "border-[#E4603C] ring-2 ring-[#E4603C]/30 bg-[#FFFDF9] shadow-sm"
                            : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex">
                              <span
                                className="h-6 w-6 rounded-full border border-black/10 shadow-2xs"
                                style={{ background: t.bg }}
                              />
                              <span
                                className="-ml-2 h-6 w-6 rounded-full border-2 border-white shadow-2xs"
                                style={{ background: t.accent }}
                              />
                            </span>
                            <span className="text-xs font-bold text-neutral-800">{t.name}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0" />
                          )}
                        </div>
                        <div
                          className="h-1.5 w-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${t.bg} 0%, ${t.accent} 100%)`,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3.2: Contribution Privacy Mode */}
              <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-sm space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-bold text-[#594855] uppercase tracking-widest block mb-0.5">
                    Step 3 · Privacy & Access
                  </span>
                  <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                    🔒 Contribution Privacy Setting
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Choose who can submit photos, audio notes, and wishes to this page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setContributionMode("open")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      contributionMode === "open"
                        ? "border-[#E4603C] bg-[#F4ECE0]/20 ring-2 ring-[#E4603C]/20"
                        : "border-border bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                      <span>🌐</span>
                      <span>Public (Open)</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                      Anyone with the QR code or link can post wishes and photos.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContributionMode("guests")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      contributionMode === "guests"
                        ? "border-[#E4603C] bg-[#F4ECE0]/20 ring-2 ring-[#E4603C]/20"
                        : "border-border bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                      <span>👥</span>
                      <span>Guests Only</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                      Only invited guests in your list can contribute.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContributionMode("closed")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      contributionMode === "closed"
                        ? "border-[#E4603C] bg-[#F4ECE0]/20 ring-2 ring-[#E4603C]/20"
                        : "border-border bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                      <span>🔒</span>
                      <span>Host Only</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                      Only you can add content. Visitors can view only.
                    </p>
                  </button>
                </div>
              </div>

              {/* Card 3.3: Ready to Launch Summary & Action */}
              <div className="card-soft p-6 sm:p-7 bg-white border border-[#241621]/10 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      Ready to Publish
                    </h4>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      🎨 {activeTheme.name} · 📅{" "}
                      {isCustomOccasion ? customHeading.trim() || "Custom Heading" : occasion}
                    </p>
                  </div>
                  <div className="text-xs text-neutral-500">
                    For:{" "}
                    <strong className="text-neutral-800">
                      {isInvitation ? coupleNames || "Couple" : recipient || "Everyone"}
                    </strong>
                  </div>
                </div>

                {createError && (
                  <div className="text-xs text-red-500 font-semibold flex items-center gap-1.5 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Media</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating || !isValid()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E4603C] px-8 py-3.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-[#c94b29] transition-all cursor-pointer shadow-lg select-none"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating Page…
                      </>
                    ) : (
                      <>
                        <span>Create Live Page & QR Code</span>
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: REALTIME LIVE PREVIEW PANEL (5 cols)       */}
        {/* ═════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block lg:col-span-5 sticky top-20">
          <LiveMemoryPreview
            theme={activeTheme}
            occasion={occasion}
            customHeading={customHeading}
            recipient={recipient}
            coupleNames={coupleNames}
            from={from}
            date={date}
            hostWish={hostWish}
            photos={photos}
            audios={audios}
            videos={videos}
            pageType={pageType}
            isInvitation={isInvitation}
            venueName={venueName}
            venueAddress={venueAddress}
            dressCode={dressCode}
            isCorporate={isCorporate}
            corporateLogo={corporateLogo}
          />
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-background/90 p-2 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ─── MOBILE STICKY FLOATING ACTION BAR (lg:hidden) ─── */}
      <div className="lg:hidden fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-2.5 px-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5">
        {/* Left: Quick Live Preview Pill */}
        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E4603C]/35 bg-[#F4ECE0]/35 px-3.5 py-2.5 text-xs font-bold text-[#E4603C] hover:bg-[#E4603C]/15 active:scale-95 transition cursor-pointer shrink-0 shadow-2xs"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </button>

        {/* Right: Step Navigation Action Buttons */}
        <div className="flex items-center gap-2 min-w-0">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 transition cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {currentStep === 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!isStep1Valid()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E4603C] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#c94b29] active:scale-95 transition cursor-pointer shadow-md select-none truncate"
            >
              <span>Next: Media</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E4603C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#c94b29] active:scale-95 transition cursor-pointer shadow-md select-none truncate"
            >
              <span>Next: Theme</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !isValid()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E4603C] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#c94b29] active:scale-95 transition cursor-pointer shadow-md select-none truncate"
            >
              {creating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <span>Publish Page</span>
                  <Sparkles className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ─── MOBILE LIVE PREVIEW BOTTOM SHEET DRAWER ─── */}
      {showMobilePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobilePreviewModal(false);
          }}
        >
          <div
            className="bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-5 relative shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag bar handle */}
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-2.5 sm:hidden" />

            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                  Live Memory Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-2">
              <LiveMemoryPreview
                theme={activeTheme}
                occasion={occasion}
                customHeading={customHeading}
                recipient={recipient}
                coupleNames={coupleNames}
                from={from}
                date={date}
                hostWish={hostWish}
                photos={photos}
                audios={audios}
                videos={videos}
                pageType={pageType}
                isInvitation={isInvitation}
                venueName={venueName}
                venueAddress={venueAddress}
                dressCode={dressCode}
                isCorporate={isCorporate}
                corporateLogo={corporateLogo}
              />
            </div>

            <div className="pt-2.5 border-t border-neutral-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="w-full py-2.5 rounded-full bg-[#E4603C] text-white font-bold text-xs shadow-md cursor-pointer hover:bg-[#c94b29] transition"
              >
                Back to Editing →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.625rem 0.875rem; font-size: 0.95rem; outline: none; transition: border-color .2s, box-shadow .2s; }
        .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-ring); }
      `}</style>
    </div>
  );
}

function StepTab({
  stepNumber,
  shortTitle,
  fullTitle,
  subtitle,
  isActive,
  isCompleted,
  onClick,
}: {
  stepNumber: number;
  shortTitle: string;
  fullTitle: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer select-none flex items-center sm:items-start gap-1.5 sm:gap-2.5 ${
        isActive
          ? "border-[#E4603C] bg-[#F4ECE0]/35 shadow-xs ring-1 ring-[#E4603C]/30"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
          : "border-neutral-200/60 bg-neutral-50/40 hover:bg-neutral-100/60 opacity-80"
      }`}
    >
      <div
        className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 ${
          isActive
            ? "bg-[#E4603C] text-white shadow-2xs"
            : isCompleted
            ? "bg-emerald-600 text-white"
            : "bg-neutral-200 text-neutral-600"
        }`}
      >
        {isCompleted ? "✓" : stepNumber}
      </div>
      <div className="min-w-0 flex-1">
        <strong
          className={`text-xs block font-bold truncate ${
            isActive ? "text-[#E4603C]" : isCompleted ? "text-emerald-900" : "text-neutral-700"
          }`}
        >
          <span className="sm:hidden">{shortTitle}</span>
          <span className="hidden sm:inline">{fullTitle}</span>
        </strong>
        <span className="text-[10px] text-neutral-400 block truncate hidden md:block">
          {subtitle}
        </span>
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold text-neutral-700">{label}</div>
      {children}
    </label>
  );
}

/* ─── REALTIME LIVE MEMORY PREVIEW COMPONENT ─── */
function LiveMemoryPreview({
  theme,
  occasion,
  customHeading,
  recipient,
  coupleNames,
  from,
  date,
  hostWish,
  photos,
  audios,
  videos,
  pageType,
  isInvitation,
  venueName,
  venueAddress,
  dressCode,
  isCorporate,
  corporateLogo,
}: {
  theme: { id: string; name: string; bg: string; accent: string };
  occasion: string;
  customHeading: string;
  recipient: string;
  coupleNames: string;
  from: string;
  date: string;
  hostWish: string;
  photos: string[];
  audios: { id: string; name: string; url: string }[];
  videos: { id: string; name: string; url: string }[];
  pageType: "wish" | "invite";
  isInvitation: boolean;
  venueName: string;
  venueAddress: string;
  dressCode: string;
  isCorporate: boolean;
  corporateLogo: string;
}) {
  const formatted = formatMemoryHeading({
    occasion,
    recipient,
    customHeading,
    isInvitation,
    coupleNames,
  });

  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Celebration Date";

  return (
    <div className="space-y-3">
      {/* Top Preview Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Memory Preview</span>
        </div>
        <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
          Real-time
        </span>
      </div>

      {/* 📱 Mobile Phone Mockup */}
      <div
        className="mx-auto w-full max-w-[340px] rounded-[2.2rem] p-2.5 bg-[#1C1917] shadow-2xl border-4 border-[#2E2824] transition-all duration-300"
        style={{
          boxShadow: `0 20px 50px ${theme.accent}25, 0 4px 16px rgba(0,0,0,0.18)`,
        }}
      >
        {/* Top Speaker / Notch */}
        <div className="mx-auto h-3.5 w-20 rounded-full bg-black/80 mb-2 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
        </div>

        {/* Screen Content Viewport */}
        <div
          className="rounded-[1.6rem] overflow-hidden p-4 sm:p-5 flex flex-col justify-between min-h-[480px] max-h-[520px] overflow-y-auto text-center relative transition-colors duration-300"
          style={{ backgroundColor: theme.bg }}
        >
          {/* Background Glow */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none opacity-40 blur-2xl"
            style={{ backgroundColor: theme.accent }}
          />

          <div className="relative z-10 space-y-3">
            {/* Corporate Logo */}
            {isCorporate && corporateLogo && (
              <div className="flex justify-center mb-1">
                <div className="h-8 max-w-[120px] p-1 bg-white rounded-lg border border-neutral-100 shadow-2xs flex items-center justify-center">
                  <img
                    src={corporateLogo}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Occasion Badge */}
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-bold text-white shadow-2xs"
                style={{ backgroundColor: theme.accent }}
              >
                <span>{isCorporate ? "💼" : formatted.badgeIcon}</span>
                <span>{formatted.badgeLabel}</span>
              </span>
            </div>

            {/* Main Heading */}
            <div className="px-1">
              {isInvitation ? (
                <>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#594855] block mb-1">
                    {formatted.prefix || "CORDIALLY INVITING YOU TO CELEBRATE"}
                  </span>
                  <h2
                    className="font-display text-lg sm:text-xl font-bold tracking-tight text-neutral-900 leading-tight"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                  >
                    {formatted.mainText ? (
                      <>
                        {formatted.mainText}
                        {formatted.highlightText && (
                          <span style={{ color: theme.accent }} className="block text-sm mt-0.5">
                            {formatted.highlightText}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        The {occasion} of
                        <span style={{ color: theme.accent }} className="block mt-0.5">
                          {coupleNames || recipient || "The Couple"}
                        </span>
                      </>
                    )}
                  </h2>
                </>
              ) : (
                <h2
                  className="font-display text-lg sm:text-xl font-bold tracking-tight text-neutral-900 leading-tight"
                  style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                  {formatted.prefix && (
                    <>
                      <span>{formatted.prefix}</span>
                      <br />
                    </>
                  )}
                  {formatted.mainText && <span>{formatted.mainText}</span>}
                  {formatted.highlightText && (
                    <span style={{ color: theme.accent }} className="block mt-0.5">
                      {formatted.highlightText}
                    </span>
                  )}
                </h2>
              )}

              <p className="text-[10px] text-neutral-500 mt-1 font-medium">
                {isInvitation ? "Hosted with love by " : "With love from "}
                <strong className="text-neutral-800">{from || "You"}</strong>
              </p>

              {/* Date Tag */}
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#594855] mt-1.5">
                <Calendar className="h-3 w-3 text-[#C17F5A]" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Invitation Venue Details Pill */}
            {isInvitation && (venueName || venueAddress) && (
              <div className="p-2.5 rounded-xl bg-white/80 border border-black/5 text-left text-[10px] shadow-2xs space-y-0.5">
                <div className="font-bold text-neutral-800 flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">{venueName || "Celebration Venue"}</span>
                </div>
                {venueAddress && (
                  <div className="text-[9px] text-neutral-500 truncate">{venueAddress}</div>
                )}
              </div>
            )}

            {/* Host Wish Preview Box */}
            {hostWish ? (
              <div className="p-2.5 rounded-xl bg-white/90 border border-black/5 shadow-2xs text-left space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-700">
                  <span className="h-4 w-4 rounded-full bg-[#E4603C]/20 text-[#E4603C] flex items-center justify-center text-[9px]">
                    ✍️
                  </span>
                  <span>Organizer's First Wish</span>
                </div>
                <p className="text-[10px] text-neutral-600 line-clamp-3 italic leading-relaxed">
                  "{hostWish}"
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/60 border border-dashed border-neutral-300 text-[10px] text-neutral-400 italic">
                No first wish written yet (Step 2)
              </div>
            )}

            {/* Uploaded Photos Gallery Preview */}
            {photos.length > 0 && (
              <div className="space-y-1 text-left">
                <div className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider flex items-center justify-between">
                  <span>📸 Photos ({photos.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {photos.slice(0, 3).map((p, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden border border-black/5 bg-white shadow-2xs"
                    >
                      <img src={p} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Badges */}
            {(audios.length > 0 || videos.length > 0) && (
              <div className="flex flex-wrap gap-1 justify-center pt-1">
                {audios.length > 0 && (
                  <span className="text-[9px] font-semibold bg-white/80 border border-neutral-200 px-2 py-0.5 rounded-full text-neutral-700">
                    🎙️ {audios.length} Voice Note{audios.length > 1 ? "s" : ""}
                  </span>
                )}
                {videos.length > 0 && (
                  <span className="text-[9px] font-semibold bg-white/80 border border-neutral-200 px-2 py-0.5 rounded-full text-neutral-700">
                    🎬 {videos.length} Video{videos.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Live Stats Strip */}
          <div className="mt-3 pt-2.5 border-t border-black/8 flex justify-around items-center text-center">
            <div>
              <span className="block text-xs font-bold text-neutral-800">
                {hostWish ? 1 : 0}
              </span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase">Wishes</span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div>
              <span className="block text-xs font-bold text-neutral-800">{photos.length}</span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase">Photos</span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div>
              <span className="block text-xs font-bold text-neutral-800">
                {audios.length + videos.length}
              </span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase">Media</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Helper Tooltip */}
      <p className="text-center text-[11px] text-neutral-400 font-medium">
        ✨ Real-time preview · Updates dynamically across all 3 steps
      </p>
    </div>
  );
}

/* ─── CREATED PREVIEW / CONTROL CENTER COMPONENT ─── */
function CreatedPreview({
  data,
  qrUrl,
  onNext,
}: {
  data: MemoryData;
  qrUrl: string;
  onNext: () => void;
}) {
  const theme = THEMES.find((t) => t.id === data.themeId) || THEMES[0];
  const accent = theme.accent;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/m/${data.slug}` : `/m/${data.slug}`;

  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPostcardModal, setShowPostcardModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const copyUrl = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 4,
    dur: 6 + Math.random() * 8,
    circle: i % 2 === 0,
  }));

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: theme.bg,
        overflow: "hidden",
        paddingBottom: "5rem",
      }}
    >
      {/* Floating particles */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {sparkles.map((s) => (
          <span
            key={s.id}
            style={{
              position: "fixed",
              left: `${s.left}%`,
              top: "-30px",
              width: s.size,
              height: s.size,
              borderRadius: s.circle ? "50%" : "3px",
              background: s.circle ? `${accent}55` : "rgba(255,255,255,0.45)",
              animationName: "cpFloat",
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55vh",
          background: `radial-gradient(ellipse at 50% -10%, ${accent}40 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        {/* Action bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "1.5rem 0 0",
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: "0.25rem",
              }}
            >
              ✅ Memory created!
            </p>
            <h1
              style={{
                fontFamily: "'Baloo 2', 'Inter', system-ui, sans-serif",
                fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                margin: 0,
              }}
            >
              Your memory page is live 🎉
            </h1>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              onClick={() => setShowPostcardModal(true)}
              style={{
                ...actionBtn(accent),
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Printer size={13} /> Print Postcard (4" × 6")
            </button>
            <button
              onClick={copyUrl}
              style={{
                ...actionBtn(accent),
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {copied ? "Link Copied! ✓" : "Copy Page Link"} <Copy size={13} />
            </button>
            <Link
              to="/m/$slug"
              params={{ slug: data.slug }}
              style={{
                ...actionBtn(accent),
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                textDecoration: "none",
              }}
            >
              Open page <ExternalLink size={13} />
            </Link>
            <button
              onClick={onNext}
              style={{
                ...actionBtn(accent),
                background: accent,
                color: "#fff",
                border: "none",
                boxShadow: `0 4px 14px ${accent}55`,
              }}
            >
              Go to Control Center →
            </button>
          </div>
        </div>

        {/* Interactive Mockup Phone Frame Wrapper */}
        <div
          style={{
            marginTop: "2.5rem",
            marginRight: "auto",
            marginLeft: "auto",
            width: "100%",
            borderRadius: "2.8rem",
            overflow: "hidden",
            backgroundColor: "#1c1917",
            boxShadow: `0 24px 80px ${accent}30, 0 8px 32px rgba(0,0,0,0.24)`,
            position: "relative",
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
          }}
          className="max-w-[310px] sm:max-w-[380px] border-[4px] sm:border-[10px] border-[#1c1917]"
        >
          {/* Top Notch / Camera Island */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: "90px",
              height: "18px",
              borderRadius: "10px",
              background: "#000",
              zIndex: 40,
            }}
            className="hidden sm:block"
          />

          {/* Phone Scroll Viewport (Embedded Iframe) */}
          <div
            style={{
              backgroundColor: theme.bg,
              borderRadius: "1.8rem",
              position: "relative",
              overflow: "hidden",
            }}
            className="h-[520px] sm:h-[640px]"
          >
            <iframe
              src={`${window.location.origin}/m/${data.slug}?preview=true`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "1.8rem",
                backgroundColor: theme.bg,
              }}
              title="Live Preview"
            />
          </div>
        </div>

        {/* Control Center CTA strip */}
        <div
          style={{
            marginTop: "1.5rem",
            borderRadius: "1.8rem",
            background: `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.85))`,
            backdropFilter: "blur(16px)",
            border: `2px solid ${accent}35`,
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
            boxShadow: "0 12px 32px rgba(44, 95, 46, 0.05)",
          }}
          className="p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
        >
          <div style={{ flex: "1 1 auto" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#241621",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
              className="md:justify-start"
            >
              ✨ Manage Wishes, Photos & RSVPs
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#594855",
                marginTop: "0.25rem",
                lineHeight: 1.45,
              }}
            >
              Track comments, moderate photo & video contributions, and manage responses in your Control Center.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={onNext}
              style={{
                borderRadius: "9999px",
                background: accent,
                color: "#fff",
                border: "none",
                padding: "0.8rem 1.6rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 8px 20px ${accent}45`,
                transition: "transform 0.2s, boxShadow 0.2s",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
              }}
              className="w-full md:w-auto"
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Open Control Center →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cpFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.3; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes cpSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpPop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cpFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── POSTCARD PHYSICAL PRINT MODAL ── */}
      <PostcardModal
        memory={data}
        isOpen={showPostcardModal}
        onClose={() => setShowPostcardModal(false)}
      />
    </div>
  );
}

function actionBtn(accent: string): React.CSSProperties {
  return {
    borderRadius: "9999px",
    border: `1.5px solid ${accent}45`,
    background: "rgba(255,255,255,0.75)",
    padding: "0.45rem 1.1rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    transition: "background 0.2s, transform 0.15s",
  };
}
