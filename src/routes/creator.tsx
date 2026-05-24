import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { OCCASIONS, THEMES } from "@/lib/data";
import { useStore, type MemoryData } from "@/lib/store";
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
} from "lucide-react";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "Memory Creator — Nandi Invites" },
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
  const setMemory = useStore((s) => s.setMemory);
  const navigate = useNavigate();

  // Creator Mode State
  const [pageType, setPageType] = useState<"wish" | "invite">("wish");

  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [themeId, setThemeId] = useState(THEMES[0].id);

  // Invitation fields state
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

  // Optional pre-filled personal wish for Wish Book mode
  const [hostWish, setHostWish] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [audios, setAudios] = useState<{ id: string; name: string; url: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const [created, setCreated] = useState<MemoryData | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const photoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const handlePageTypeSelect = (type: "wish" | "invite") => {
    setPageType(type);
    if (type === "invite") {
      setOccasion("Wedding");
    } else {
      setOccasion("Birthday");
    }
  };

  const isValid = () => {
    if (isInvitation) {
      return coupleNames.trim() && from.trim() && date;
    } else {
      return recipient.trim() && from.trim() && date;
    }
  };

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const r = new FileReader();
      r.onload = () => setPhotos((p) => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
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
      const displayName = isInvitation ? coupleNames.trim() : recipient.trim();
      const slug =
        (displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "memory") +
        "-" +
        Math.random().toString(36).slice(2, 6);
      const data: MemoryData = {
        slug,
        occasion,
        recipient: displayName,
        from: from.trim(),
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
        // Community defaults
        contributionMode: "open",
        autoApprove: false,
        pinnedContributionIds: [],
        expiresAt: null,
        contributions: [],
        reactions: [],
        replies: [],
      };
      const url =
        typeof window !== "undefined" ? `${window.location.origin}/m/${slug}` : `/m/${slug}`;
      console.log("[handleCreate] generating QR for", url);
      const generatedQr = await QRCode.toDataURL(url, {
        margin: 1,
        width: 360,
        color: { dark: "#2C5F2E", light: "#FFFDF9" },
      });
      console.log("[handleCreate] QR generated, setting state");
      setMemory(data);
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
      <CreatedPreview data={created} qrUrl={qrUrl} onNext={() => navigate({ to: "/keepsakes" })} />
    );

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-6">
      <div className="mb-6 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl">Create a memory page</h1>
        <p className="mt-2 text-muted-foreground font-medium text-neutral-500">
          A gorgeous interactive space to share details, collect RSVPs, and preserve warm thoughts.
        </p>
      </div>

      <div className="space-y-6 fade-up">
        {/* Card 1: Page Type Selector */}
        <div className="card-soft p-5 sm:p-6 bg-white border border-[#5c3d2e]/10 shadow-[0_4px_24px_rgba(92,61,46,0.02)]">
          <div className="text-center mb-4">
            <span className="text-[10px] font-bold text-[#6B6159] uppercase tracking-widest block mb-1">
              Creation Mode
            </span>
            <h2 className="font-display text-xl font-semibold text-neutral-800">
              What kind of page are you creating?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => handlePageTypeSelect("wish")}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer select-none ${
                pageType === "wish"
                  ? "border-[#2C5F2E] bg-[#EAF3DE]/10 ring-2 ring-[#2C5F2E]/25"
                  : "border-border bg-white hover:bg-neutral-50/50"
              }`}
            >
              <span className="text-3xl shrink-0">🎂</span>
              <div className="min-w-0">
                <strong className="text-sm font-bold text-neutral-800 block">
                  Wish & Memory Book
                </strong>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug max-w-[240px]">
                  Digital scrapbook for birthdays, farewells, or milestone wishes.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handlePageTypeSelect("invite")}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer select-none ${
                pageType === "invite"
                  ? "border-[#2C5F2E] bg-[#EAF3DE]/10 ring-2 ring-[#2C5F2E]/25"
                  : "border-border bg-white hover:bg-neutral-50/50"
              }`}
            >
              <span className="text-3xl shrink-0">💌</span>
              <div className="min-w-0">
                <strong className="text-sm font-bold text-neutral-800 block">
                  Event Invitation Card
                </strong>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug max-w-[240px]">
                  Event page for weddings or anniversaries with schedule, maps, & RSVPs.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Card 2: Basics Info & Theme */}
        <div className="card-soft p-6 sm:p-8 bg-white border border-[#5c3d2e]/10 shadow-[0_4px_24px_rgba(92,61,46,0.02)]">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
            ✨ Basics & Theme
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
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

            {!isInvitation ? (
              <Field label="Recipient Name *">
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Meera Iyer"
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

            <div className="sm:col-span-2 mt-2">
              <div className="mb-2 text-sm font-semibold text-neutral-700">
                Select Accent Color Theme
              </div>
              <div className="flex flex-wrap gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition cursor-pointer ${themeId === t.id ? "border-[#2C5F2E] ring-2 ring-[#2C5F2E]/20 bg-white" : "border-border bg-white hover:bg-neutral-50"}`}
                  >
                    <span className="flex">
                      <span className="h-5 w-5 rounded-full" style={{ background: t.bg }} />
                      <span
                        className="-ml-2 h-5 w-5 rounded-full border border-white"
                        style={{ background: t.accent }}
                      />
                    </span>
                    <span className="font-medium text-neutral-700">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mode-Specific Details */}
        <div className="card-soft p-6 sm:p-8 bg-white border border-[#5c3d2e]/10 shadow-[0_4px_24px_rgba(92,61,46,0.02)]">
          {!isInvitation ? (
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                ✍️ Write First Wish
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Write a warm greeting or personal message to pre-populate this memory book.
                (Optional)
              </p>
              <textarea
                value={hostWish}
                onChange={(e) => setHostWish(e.target.value)}
                rows={4}
                placeholder="e.g. Happy Birthday Meera! Wishing you a gorgeous orbit around the sun. You bring so much light and joy into our lives! 🥰🥂"
                className="input resize-none"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                📍 Event Venue & Celebration Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Venue Name">
                  <input
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Royal Orchid Grand Ballroom"
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
                    placeholder="e.g. Ethnic Elegance / Pastel Shades"
                    className="input"
                  />
                </Field>

                <Field label="Registry / Special Notes">
                  <input
                    value={registryInfo}
                    onChange={(e) => setRegistryInfo(e.target.value)}
                    placeholder="e.g. Amazon Gift Registry / No Box Gifts Please"
                    className="input"
                  />
                </Field>

                <div className="sm:col-span-2 border-t border-neutral-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#1A1714] uppercase tracking-wider">
                      🗓️ Event Schedule / Timeline
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimeline([...timeline, { time: "", event: "" }])}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Event Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          value={item.time}
                          onChange={(e) => {
                            const updated = [...timeline];
                            updated[idx].time = e.target.value;
                            setTimeline(updated);
                          }}
                          placeholder="e.g. 5:30 PM"
                          className="w-1/3 rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                        <input
                          value={item.event}
                          onChange={(e) => {
                            const updated = [...timeline];
                            updated[idx].event = e.target.value;
                            setTimeline(updated);
                          }}
                          placeholder="e.g. Welcoming Guests / Ring Ceremony"
                          className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                        {timeline.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTimeline(timeline.filter((_, tIdx) => tIdx !== idx))}
                            className="p-2 text-[#6B6159] hover:text-red-500 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Media Attachments (Photos, Voice Notes, Videos) */}
        <div className="card-soft p-6 sm:p-8 bg-white border border-[#5c3d2e]/10 shadow-[0_4px_24px_rgba(92,61,46,0.02)]">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
            🖼️ Upload Media Attachments{" "}
            <span className="text-xs text-neutral-400 font-medium">(Optional)</span>
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Photos Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-600" /> Photos
              </h4>
              <div
                onClick={() => photoInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePhotos(e.dataTransfer.files);
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-neutral-50/50 p-4 text-center hover:border-primary/50 transition"
              >
                <Upload className="h-5 w-5 text-neutral-400" />
                <div className="text-[11px] font-semibold text-neutral-600">Click to upload</div>
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
                        onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-[#C17F5A]" /> Voice Notes
              </h4>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-neutral-50/50 p-3">
                <button
                  onClick={simulateRecord}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition cursor-pointer ${recording ? "bg-accent pulse-ring" : "bg-primary hover:opacity-90"}`}
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-neutral-700 truncate">
                    {recording ? "Recording…" : "Record voice note"}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {recording ? "Auto-saving in 2s" : "Tap mic to start"}
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
                        onClick={() => setAudios(audios.filter((x) => x.id !== a.id))}
                        className="rounded-full p-1 text-muted-foreground hover:text-destructive"
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
              <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                <Video className="h-4 w-4 text-indigo-600" /> Videos
              </h4>
              <div
                onClick={() => videoInput.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-neutral-50/50 p-4 text-center hover:border-primary/50 transition"
              >
                <Video className="h-5 w-5 text-neutral-400" />
                <div className="text-[11px] font-semibold text-neutral-600">
                  Upload video (max 3)
                </div>
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
                        onClick={() => setVideos(videos.filter((x) => x.id !== v.id))}
                        className="rounded-full p-1 text-muted-foreground hover:text-destructive"
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

        {/* Card 5: Submission & Info Validation */}
        <div className="card-soft p-5 bg-white border border-[#5c3d2e]/10 shadow-[0_4px_24px_rgba(92,61,46,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Selected Settings
            </h4>
            <p className="text-sm font-semibold text-neutral-800 mt-1">
              🎨 {THEMES.find((t) => t.id === themeId)?.name} Theme · 📅 {occasion}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
            {createError && (
              <div className="text-xs text-red-500 font-semibold mb-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {createError}
              </div>
            )}
            {!isValid() && (
              <span className="text-xs font-semibold text-neutral-400 text-center sm:text-right">
                {isInvitation
                  ? "Please fill Couple Names, From, and Date of Event."
                  : "Please fill Recipient Name, From, and Date of Celebration."}
              </span>
            )}
            <button
              onClick={handleCreate}
              disabled={creating || !isValid()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2C5F2E] px-8 py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-[#4A8A4C] cursor-pointer transition-all shadow-md select-none animate-pulse-ring"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Page…
                </>
              ) : (
                "Create Live Page & QR Code ✨"
              )}
            </button>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-background/90 p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.625rem 0.875rem; font-size: 0.95rem; outline: none; transition: border-color .2s, box-shadow .2s; }
      .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-ring); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

function CreatedPreview({
  data,
  qrUrl,
  onNext,
}: {
  data: MemoryData;
  qrUrl: string;
  onNext: () => void;
}) {
  const theme = THEMES.find((t) => t.id === data.themeId)!;
  const accent = theme.accent;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/m/${data.slug}` : `/m/${data.slug}`;

  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Contribution popup states
  const [showSettingsModal, setShowSettingsModal] = useState(true);
  const [contributionMode, setContributionMode] = useState<"open" | "guests" | "closed">("open");
  const updateMemory = useStore((s) => s.updateMemory);

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
      {/* Contribution Privacy Settings Popup */}
      {showSettingsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(26,23,20,0.5)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "cpFade 0.25s ease-out",
          }}
        >
          <div
            style={{
              background: "#FFFDF9",
              border: `1px solid ${accent}25`,
              borderRadius: "2rem",
              padding: "2rem 1.5rem",
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 50px rgba(92,61,46,0.15)",
              animation: "cpPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>
                🔒
              </span>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.8rem",
                  margin: 0,
                  color: "#1A1714",
                }}
              >
                Contribution Privacy
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#6B6159",
                  marginTop: "0.5rem",
                  lineHeight: 1.5,
                }}
              >
                Choose who can add wishes, photos, and voice notes to this memory page. You can
                always change this later in the Activity Tracker page.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              <button
                type="button"
                onClick={() => setContributionMode("open")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.1rem",
                  borderRadius: "1.25rem",
                  border:
                    contributionMode === "open" ? `2px solid ${accent}` : "1.5px solid #E6E1DA",
                  background: contributionMode === "open" ? `${accent}0a` : "#FFF",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.5rem", marginTop: "-2px" }}>🌐</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.875rem", color: "#1A1714" }}>
                    Public (Open)
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "#6B6159",
                      marginTop: "0.2rem",
                      lineHeight: 1.4,
                    }}
                  >
                    Anyone with the link or QR code can post wishes, photos, and record audio.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setContributionMode("guests")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.1rem",
                  borderRadius: "1.25rem",
                  border:
                    contributionMode === "guests" ? `2px solid ${accent}` : "1.5px solid #E6E1DA",
                  background: contributionMode === "guests" ? `${accent}0a` : "#FFF",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.5rem", marginTop: "-2px" }}>👥</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.875rem", color: "#1A1714" }}>
                    Guests Only
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "#6B6159",
                      marginTop: "0.2rem",
                      lineHeight: 1.4,
                    }}
                  >
                    Only registered guests in your Guest Manager can contribute.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setContributionMode("closed")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.1rem",
                  borderRadius: "1.25rem",
                  border:
                    contributionMode === "closed" ? `2px solid ${accent}` : "1.5px solid #E6E1DA",
                  background: contributionMode === "closed" ? `${accent}0a` : "#FFF",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.5rem", marginTop: "-2px" }}>🔒</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.875rem", color: "#1A1714" }}>
                    Host Only (Read-Only)
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "#6B6159",
                      marginTop: "0.2rem",
                      lineHeight: 1.4,
                    }}
                  >
                    Only you (the creator) can add media and wishes. Visitors can only view.
                  </span>
                </div>
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => {
                  updateMemory(data.slug, { contributionMode });
                  setShowSettingsModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "9999px",
                  background: accent,
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: `0 4px 12px ${accent}40`,
                }}
              >
                Save Settings & Show Live QR Code
              </button>
            </div>
          </div>
        </div>
      )}

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
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                margin: 0,
              }}
            >
              Your memory page is live 🎉
            </h1>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
              Choose your keepsake →
            </button>
          </div>
        </div>

        {/* Interactive Mockup Phone Frame Wrapper - Optimized Responsively for Mobile */}
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

        {/* keepsakes CTA strip - Responsive Stacked Mobile View */}
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
                color: "#1A1714",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
              className="md:justify-start"
            >
              🌱 Plant a Living Keepsake
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#6B6159",
                marginTop: "0.25rem",
                lineHeight: 1.45,
              }}
            >
              Attach your live memory page as a custom printed QR code on a premium plant pot!
            </p>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "0.6rem" }}
              className="md:justify-start"
            >
              <span style={{ fontSize: "0.75rem", color: "#8E857E", fontWeight: 500 }}>
                Memory Page:
              </span>
              <span
                onClick={copyUrl}
                style={{
                  fontSize: "0.75rem",
                  color: accent,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: `${accent}0c`,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  border: `1px solid ${accent}25`,
                }}
                title="Click to copy link"
              >
                {data.slug} 📋 {copied ? "Copied!" : "Copy Link"}
              </span>
            </div>
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
              Choose Your Keepsake →
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
