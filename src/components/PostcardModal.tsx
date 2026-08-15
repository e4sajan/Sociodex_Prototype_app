import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Printer,
  X,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  QrCode as QrIcon,
  Calendar,
  User,
  Heart,
  Palette,
  RotateCw,
  ExternalLink,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import type { MemoryData } from "@/lib/store";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { toast } from "sonner";

export interface PostcardModalProps {
  memory: MemoryData | null;
  isOpen: boolean;
  onClose: () => void;
}

type PostcardTheme = "cream" | "plum" | "sage" | "gold" | "minimal";
type PostcardOrientation = "portrait" | "landscape";

interface ThemeStyle {
  id: PostcardTheme;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  accentLight: string;
  text: string;
  subtext: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  qrBg: string;
  qrColor: string;
}

const POSTCARD_THEMES: Record<PostcardTheme, ThemeStyle> = {
  cream: {
    id: "cream",
    name: "Cream & Terracotta",
    bg: "#FBF6EC",
    cardBg: "#FFFDF9",
    accent: "#E4603C",
    accentLight: "rgba(228, 96, 60, 0.08)",
    text: "#241621",
    subtext: "#594855",
    border: "rgba(36, 22, 33, 0.12)",
    badgeBg: "rgba(228, 96, 60, 0.12)",
    badgeText: "#E4603C",
    qrBg: "#FFFFFF",
    qrColor: "#241621",
  },
  plum: {
    id: "plum",
    name: "Royal Plum",
    bg: "#F5EFF3",
    cardBg: "#FFFDF9",
    accent: "#6B3B59",
    accentLight: "rgba(107, 59, 89, 0.08)",
    text: "#2E1C27",
    subtext: "#5C4352",
    border: "rgba(107, 59, 89, 0.16)",
    badgeBg: "rgba(107, 59, 89, 0.12)",
    badgeText: "#6B3B59",
    qrBg: "#FFFFFF",
    qrColor: "#2E1C27",
  },
  sage: {
    id: "sage",
    name: "Botanical Sage",
    bg: "#EFF4EC",
    cardBg: "#FAFDF8",
    accent: "#486B43",
    accentLight: "rgba(72, 107, 67, 0.08)",
    text: "#1E2A1C",
    subtext: "#4B5A49",
    border: "rgba(72, 107, 67, 0.16)",
    badgeBg: "rgba(72, 107, 67, 0.12)",
    badgeText: "#486B43",
    qrBg: "#FFFFFF",
    qrColor: "#1E2A1C",
  },
  gold: {
    id: "gold",
    name: "Golden Milestone",
    bg: "#FDF9EF",
    cardBg: "#FFFEFA",
    accent: "#B8860B",
    accentLight: "rgba(184, 134, 11, 0.08)",
    text: "#2B210B",
    subtext: "#5E5032",
    border: "rgba(184, 134, 11, 0.18)",
    badgeBg: "rgba(184, 134, 11, 0.12)",
    badgeText: "#966B04",
    qrBg: "#FFFFFF",
    qrColor: "#2B210B",
  },
  minimal: {
    id: "minimal",
    name: "Minimal (Ink-Saver)",
    bg: "#FFFFFF",
    cardBg: "#FFFFFF",
    accent: "#111827",
    accentLight: "#F3F4F6",
    text: "#111827",
    subtext: "#4B5563",
    border: "#D1D5DB",
    badgeBg: "#F3F4F6",
    badgeText: "#111827",
    qrBg: "#FFFFFF",
    qrColor: "#000000",
  },
};

export function PostcardModal({ memory, isOpen, onClose }: PostcardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<PostcardTheme>("cream");
  const [orientation, setOrientation] = useState<PostcardOrientation>("portrait");
  const [customNote, setCustomNote] = useState<string>("");
  const [showNote, setShowNote] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Initialize custom note from memory wishes if available
  useEffect(() => {
    if (memory) {
      const firstWish = memory.wishes && memory.wishes.length > 0 ? memory.wishes[0] : "";
      setCustomNote(firstWish);
    }
  }, [memory]);

  // Determine current theme style
  const theme = POSTCARD_THEMES[selectedTheme];

  // Resolve memory full URL
  const memoryUrl = memory
    ? typeof window !== "undefined"
      ? `${window.location.origin}/m/${memory.slug}`
      : `https://sociodex.com/m/${memory.slug}`
    : "";

  const displayShortUrl = memory
    ? typeof window !== "undefined"
      ? `${window.location.host}/m/${memory.slug}`
      : `sociodex.com/m/${memory.slug}`
    : "";

  // Generate high-resolution QR Code
  useEffect(() => {
    if (!memoryUrl) return;

    setIsGeneratingQr(true);
    QRCode.toDataURL(memoryUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: theme.qrColor,
        light: theme.qrBg,
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGeneratingQr(false);
      })
      .catch((err) => {
        console.error("[PostcardModal] QR generation failed:", err);
        setIsGeneratingQr(false);
      });
  }, [memoryUrl, selectedTheme, theme.qrColor, theme.qrBg]);

  if (!isOpen || !memory) return null;

  // Handle Print Action (Uses dedicated isolated iframe for guaranteed non-blank printout)
  const handlePrint = async () => {
    try {
      let activeQr = qrDataUrl;
      if (!activeQr && memoryUrl) {
        activeQr = await QRCode.toDataURL(memoryUrl, {
          width: 600,
          margin: 1,
          color: { dark: theme.qrColor, light: theme.qrBg },
          errorCorrectionLevel: "M",
        });
      }

      const isPortrait = orientation === "portrait";
      const printIframeId = "sociodex-postcard-print-iframe";
      let iframe = document.getElementById(printIframeId) as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement("iframe");
      iframe.id = printIframeId;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const logoSrc = `${origin}/sociodex-logo-dark.png`;

      const safeOccasion = memory.occasion || "Celebration Memory";
      const safeRecipient = memory.recipient || "";
      const safeCreator = creatorName || "";
      const safeNote =
        showNote && customNote
          ? `<div class="note-box">"${customNote.replace(/"/g, "&quot;")}"</div>`
          : "";

      const bodyContent = isPortrait
        ? `
          <div class="header">
            <div class="top-row">
              <span class="badge">${memory.visibility === "friends" ? "Friends Keepsake" : "Physical Memory Record"}</span>
              ${formattedDate ? `<span class="date">${formattedDate}</span>` : ""}
            </div>
            <h1 class="title">${safeOccasion}</h1>
            <div class="meta">
              <span>For: <strong>${safeRecipient}</strong></span>
              ${safeCreator ? `<span>• From: <strong>${safeCreator}</strong></span>` : ""}
            </div>
          </div>

          <div class="center-section">
            <div class="qr-container">
              <img src="${activeQr}" alt="QR Code" class="qr-img" />
            </div>
            <div class="scan-prompt">
              <p class="scan-title">Scan to open digital memory page</p>
              <p class="scan-subtitle">Wishes • Photo Gallery • Audio Keepsakes</p>
            </div>
            ${safeNote}
          </div>

          <div class="footer">
            <div class="logo-wrap">
              <img src="${logoSrc}" alt="SocioDex" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
              <span class="logo-fallback" style="display:none; font-weight:800; font-size:11pt; color:${theme.accent};">SocioDex</span>
            </div>
            <span class="domain">sociodex.com</span>
          </div>
        `
        : `
          <div class="header">
            <div class="top-row">
              <span class="badge">${memory.visibility === "friends" ? "Friends Keepsake" : "Physical Memory Record"}</span>
              ${formattedDate ? `<span class="date">${formattedDate}</span>` : ""}
            </div>
            <h1 class="title">${safeOccasion}</h1>
            <div class="meta">
              <span>For: <strong>${safeRecipient}</strong></span>
              ${safeCreator ? `<span>• From: <strong>${safeCreator}</strong></span>` : ""}
            </div>
          </div>

          <div class="center-landscape">
            <div class="left-col">
              <p class="scan-title">Scan to open digital memory page</p>
              <p class="scan-subtitle">Explore wishes, photo gallery & voice messages</p>
              ${safeNote}
              <div class="url-text">${displayShortUrl}</div>
            </div>
            <div class="qr-container">
              <img src="${activeQr}" alt="QR Code" class="qr-img" />
            </div>
          </div>

          <div class="footer">
            <div class="logo-wrap">
              <img src="${logoSrc}" alt="SocioDex" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
              <span class="logo-fallback" style="display:none; font-weight:800; font-size:11pt; color:${theme.accent};">SocioDex</span>
            </div>
            <span class="domain">sociodex.com</span>
          </div>
        `;

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${safeOccasion} - SocioDex Postcard</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${isPortrait ? "4in 6in" : "6in 4in"};
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              width: ${isPortrait ? "4in" : "6in"};
              height: ${isPortrait ? "6in" : "4in"};
              margin: 0;
              padding: 0;
              background-color: ${theme.bg} !important;
              color: ${theme.text};
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              overflow: hidden;
            }
            .postcard {
              width: ${isPortrait ? "4in" : "6in"};
              height: ${isPortrait ? "6in" : "4in"};
              padding: 0.32in;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background-color: ${theme.bg} !important;
              color: ${theme.text};
              box-sizing: border-box;
              overflow: hidden;
            }
            .inner-border {
              position: absolute;
              top: 0.14in;
              left: 0.14in;
              right: 0.14in;
              bottom: 0.14in;
              border: 1.2px dashed ${theme.border};
              border-radius: 12px;
              pointer-events: none;
            }
            .header {
              position: relative;
              z-index: 2;
            }
            .top-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.08in;
            }
            .badge {
              font-size: 8pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 2px 7px;
              border-radius: 9999px;
              background-color: ${theme.badgeBg} !important;
              color: ${theme.badgeText} !important;
              border: 1px solid ${theme.accent}35;
            }
            .date {
              font-size: 8.5pt;
              font-weight: 600;
              color: ${theme.subtext};
            }
            .title {
              font-family: 'Baloo 2', cursive, sans-serif;
              font-size: ${isPortrait ? "17pt" : "18pt"};
              font-weight: 800;
              line-height: 1.15;
              color: ${theme.text};
              margin-bottom: 2px;
            }
            .meta {
              font-size: 9pt;
              color: ${theme.subtext};
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
            .meta strong {
              color: ${theme.text};
            }
            .center-section {
              position: relative;
              z-index: 2;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: 6px;
              margin: auto 0;
            }
            .center-landscape {
              position: relative;
              z-index: 2;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              margin: auto 0;
              padding: 0 4px;
            }
            .left-col {
              flex: 1;
              text-align: left;
            }
            .qr-container {
              background: #ffffff !important;
              padding: 8px;
              border-radius: 14px;
              border: 1px solid ${theme.border};
              display: inline-flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            }
            .qr-img {
              width: ${isPortrait ? "1.45in" : "1.35in"};
              height: ${isPortrait ? "1.45in" : "1.35in"};
              display: block;
            }
            .scan-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: ${theme.accent};
              line-height: 1.2;
            }
            .scan-subtitle {
              font-size: 8pt;
              font-weight: 500;
              color: ${theme.subtext};
              margin-top: 1px;
            }
            .note-box {
              background-color: ${theme.accentLight} !important;
              border: 1px solid ${theme.accent}30;
              border-radius: 8px;
              padding: 4px 10px;
              font-size: 8.5pt;
              font-style: italic;
              color: ${theme.text};
              max-width: 2.8in;
              margin-top: 3px;
              line-height: 1.3;
            }
            .url-text {
              font-size: 7.5pt;
              font-family: monospace;
              color: ${theme.subtext};
              margin-top: 6px;
              opacity: 0.8;
            }
            .footer {
              position: relative;
              z-index: 2;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid ${theme.border};
              padding-top: 0.08in;
            }
            .logo-wrap {
              display: flex;
              align-items: center;
            }
            .logo-img {
              height: 24px;
              width: auto;
              object-fit: contain;
            }
            .domain {
              font-size: 8.5pt;
              font-weight: 600;
              color: ${theme.subtext};
            }
          </style>
        </head>
        <body>
          <div class="postcard">
            <div class="inner-border"></div>
            ${bodyContent}
          </div>
        </body>
        </html>
      `;

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        window.print();
        return;
      }

      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        } catch (e) {
          console.error("Iframe print fallback to window.print:", e);
          window.print();
        }
      }, 350);
    } catch (err) {
      console.error("[handlePrint] Error initiating postcard print:", err);
      window.print();
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    if (!memoryUrl) return;
    navigator.clipboard.writeText(memoryUrl);
    setCopied(true);
    toast.success("Memory page link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR Code image
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `sociodex-qr-${memory.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR code downloaded!");
  };

  const formattedDate = memory.date
    ? new Date(memory.date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const creatorName = memory.creatorName || memory.from || "Memory Creator";

  return (
    <>
      {/* ── SCREEN MODAL OVERLAY ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto no-print animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-[#FFFDF9] border border-[#241621]/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#241621]/10 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-[#E4603C]/10 flex items-center justify-center text-[#E4603C]">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#241621] leading-none">
                  Print Memory Postcard
                </h3>
                <p className="text-xs text-[#594855] mt-0.5 font-medium">
                  Standard 4" × 6" physical keepsake record with scannable QR code
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-[#241621]/15 hover:bg-[#FAF6F0] flex items-center justify-center text-[#594855] hover:text-[#241621] transition cursor-pointer"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Main Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAF6F0]/50">
            {/* Left Controls Column (4 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* 1. Theme Palette Selector */}
              <div className="bg-white p-4 rounded-2xl border border-[#241621]/10 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#241621] uppercase tracking-wide flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-[#E4603C]" /> Card Theme
                  </label>
                  <span className="text-[11px] font-semibold text-[#594855]">
                    {theme.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(POSTCARD_THEMES) as PostcardTheme[]).map((thmKey) => {
                    const thm = POSTCARD_THEMES[thmKey];
                    const isSelected = selectedTheme === thmKey;
                    return (
                      <button
                        key={thmKey}
                        type="button"
                        onClick={() => setSelectedTheme(thmKey)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer select-none text-xs font-semibold ${
                          isSelected
                            ? "border-[#E4603C] bg-[#E4603C]/5 text-[#241621] shadow-2xs ring-1 ring-[#E4603C]/40"
                            : "border-[#241621]/10 bg-[#FFFDF9] hover:bg-[#FAF6F0] text-[#594855]"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: thm.accent }}
                        />
                        <span className="truncate">{thm.name.split(" ")[0]}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#E4603C] ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Orientation Selector */}
              <div className="bg-white p-4 rounded-2xl border border-[#241621]/10 shadow-2xs space-y-3">
                <label className="text-xs font-bold text-[#241621] uppercase tracking-wide flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-[#E4603C]" /> Card Orientation
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                      orientation === "portrait"
                        ? "bg-[#E4603C] text-white border-[#E4603C] shadow-xs"
                        : "bg-[#FFFDF9] text-[#241621] border-[#241621]/15 hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span>Portrait (4" × 6")</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                      orientation === "landscape"
                        ? "bg-[#E4603C] text-white border-[#E4603C] shadow-xs"
                        : "bg-[#FFFDF9] text-[#241621] border-[#241621]/15 hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span>Landscape (6" × 4")</span>
                  </button>
                </div>
              </div>

              {/* 3. Postcard Keepsake Note (Optional) */}
              <div className="bg-white p-4 rounded-2xl border border-[#241621]/10 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#241621] uppercase tracking-wide flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-[#E4603C]" /> Featured Note / Quote
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#594855] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNote}
                      onChange={(e) => setShowNote(e.target.checked)}
                      className="rounded accent-[#E4603C]"
                    />
                    <span>Include</span>
                  </label>
                </div>

                {showNote && (
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Add a heartfelt memory note or wish excerpt..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#241621]/15 bg-[#FFFDF9] text-[#241621] focus:outline-none focus:border-[#E4603C] focus:ring-1 focus:ring-[#E4603C]/30 resize-none"
                    maxLength={140}
                  />
                )}
                <p className="text-[10px] text-[#594855]">
                  Prints a short personal quote alongside the scannable QR code.
                </p>
              </div>

              {/* 4. Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] text-xs font-bold text-[#241621] flex items-center justify-center gap-1.5 transition cursor-pointer select-none shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#594855]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="py-2 px-3 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] text-xs font-bold text-[#241621] flex items-center justify-center gap-1.5 transition cursor-pointer select-none shadow-2xs"
                  title="Download High-Res QR Code PNG"
                >
                  <Download className="h-3.5 w-3.5 text-[#594855]" />
                  <span>Save QR</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Postcard Preview (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#594855] mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#E4603C]" />
                <span>Live Postcard Preview ({orientation === "portrait" ? '4" × 6"' : '6" × 4"'})</span>
              </div>

              {/* Scaled Visual Postcard Frame */}
              <div className="w-full flex items-center justify-center p-2">
                <div
                  className={`relative rounded-2xl shadow-xl transition-all duration-300 overflow-hidden border ${
                    orientation === "portrait"
                      ? "w-full max-w-[340px] aspect-[4/6]"
                      : "w-full max-w-[460px] aspect-[6/4]"
                  }`}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                  {/* Visual Postcard Inner Content (Mirrors Printable Postcard) */}
                  <PostcardContent
                    memory={memory}
                    theme={theme}
                    orientation={orientation}
                    qrDataUrl={qrDataUrl}
                    showNote={showNote}
                    customNote={customNote}
                    formattedDate={formattedDate}
                    creatorName={creatorName}
                    displayShortUrl={displayShortUrl}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer with Primary Print Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#241621]/10 bg-white">
            <div className="text-xs text-[#594855] text-center sm:text-left">
              💡 <strong>Print Tip:</strong> Select <em>Paper Size: 4" × 6" Postcard</em> (or standard paper) and check <em>"Background graphics"</em> in the print dialog.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#241621]/15 text-xs font-bold text-[#594855] hover:bg-[#FAF6F0] hover:text-[#241621] transition cursor-pointer select-none"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white text-xs font-bold shadow-md transition cursor-pointer select-none flex items-center justify-center gap-2 active:scale-98"
              >
                <Printer className="h-4 w-4" />
                <span>Print Postcard Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ISOLATED PRINTABLE POSTCARD CONTAINER (Active only during window.print()) ── */}
      <div
        id="postcard-printable-area"
        ref={printAreaRef}
        className={`print-only ${orientation === "portrait" ? "postcard-portrait" : "postcard-landscape"}`}
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
        }}
      >
        <PostcardContent
          memory={memory}
          theme={theme}
          orientation={orientation}
          qrDataUrl={qrDataUrl}
          showNote={showNote}
          customNote={customNote}
          formattedDate={formattedDate}
          creatorName={creatorName}
          displayShortUrl={displayShortUrl}
          isPrintMode={true}
        />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE POSTCARD CONTENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface PostcardContentProps {
  memory: MemoryData;
  theme: ThemeStyle;
  orientation: PostcardOrientation;
  qrDataUrl: string;
  showNote: boolean;
  customNote: string;
  formattedDate: string;
  creatorName: string;
  displayShortUrl: string;
  isPrintMode?: boolean;
}

function PostcardContent({
  memory,
  theme,
  orientation,
  qrDataUrl,
  showNote,
  customNote,
  formattedDate,
  creatorName,
  displayShortUrl,
  isPrintMode = false,
}: PostcardContentProps) {
  const isPortrait = orientation === "portrait";

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4 sm:p-5 relative select-none box-border"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {/* Decorative Postcard Border Frame */}
      <div
        className="absolute inset-2.5 sm:inset-3 rounded-xl border border-dashed pointer-events-none"
        style={{ borderColor: theme.border }}
      />

      {/* ── 1. TOP HEADER SECTION (Heading & Relevant Details) ── */}
      <div className="relative z-10 space-y-1.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              borderColor: `${theme.accent}30`,
            }}
          >
            {memory.visibility === "friends" ? "Friends Keepsake" : "Physical Memory Record"}
          </span>

          {formattedDate && (
            <span
              className="text-[10px] sm:text-[11px] font-semibold flex items-center gap-1"
              style={{ color: theme.subtext }}
            >
              <Calendar className="h-3 w-3 opacity-70" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Heading / Memory Occasion */}
        <div>
          <h2
            className="font-display font-bold leading-tight line-clamp-2"
            style={{
              color: theme.text,
              fontSize: isPortrait ? "1.25rem" : "1.35rem",
            }}
          >
            {memory.occasion}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] sm:text-xs">
            <span style={{ color: theme.subtext }}>
              For: <strong style={{ color: theme.text }}>{memory.recipient}</strong>
            </span>
            {creatorName && (
              <span style={{ color: theme.subtext }}>
                • From: <strong style={{ color: theme.text }}>{creatorName}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. CENTER SECTION (QR CODE + SCAN INSTRUCTIONS + NOTE) ── */}
      <div className="relative z-10 my-auto py-2 flex items-center justify-center">
        {isPortrait ? (
          /* PORTRAIT ORIENTATION CENTER LAYOUT */
          <div className="flex flex-col items-center text-center gap-2">
            {/* QR Code Container */}
            <div
              className="p-2.5 rounded-2xl bg-white shadow-sm border flex items-center justify-center relative"
              style={{ borderColor: theme.border }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Memory QR Code"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-50 text-gray-400">
                  <QrIcon className="h-8 w-8 animate-pulse" />
                </div>
              )}
            </div>

            {/* Scan Prompt */}
            <div className="space-y-0.5 max-w-[240px]">
              <p
                className="text-[11px] sm:text-xs font-bold leading-tight"
                style={{ color: theme.accent }}
              >
                Scan to open digital memory page
              </p>
              <p
                className="text-[9px] sm:text-[10px] font-medium leading-tight"
                style={{ color: theme.subtext }}
              >
                Wishes • Photo Gallery • Audio Keepsakes
              </p>
            </div>

            {/* Optional Custom Note */}
            {showNote && customNote && (
              <div
                className="mt-1 px-3 py-1.5 rounded-xl border text-[10px] sm:text-[11px] italic line-clamp-2 max-w-[260px]"
                style={{
                  backgroundColor: theme.accentLight,
                  borderColor: `${theme.accent}25`,
                  color: theme.text,
                }}
              >
                "{customNote}"
              </div>
            )}
          </div>
        ) : (
          /* LANDSCAPE ORIENTATION CENTER LAYOUT */
          <div className="w-full flex items-center justify-between gap-4 px-2">
            {/* Left Column: Note & Details */}
            <div className="flex-1 space-y-2 text-left">
              <div className="space-y-0.5">
                <p
                  className="text-xs sm:text-sm font-bold leading-tight"
                  style={{ color: theme.accent }}
                >
                  Scan to open digital memory page
                </p>
                <p
                  className="text-[10px] sm:text-[11px] font-medium"
                  style={{ color: theme.subtext }}
                >
                  Explore wishes, photo gallery & voice messages
                </p>
              </div>

              {showNote && customNote && (
                <div
                  className="p-2 rounded-xl border text-[10px] sm:text-[11px] italic line-clamp-3"
                  style={{
                    backgroundColor: theme.accentLight,
                    borderColor: `${theme.accent}25`,
                    color: theme.text,
                  }}
                >
                  "{customNote}"
                </div>
              )}

              <div
                className="text-[9px] sm:text-[10px] font-mono break-all opacity-80"
                style={{ color: theme.subtext }}
              >
                {displayShortUrl}
              </div>
            </div>

            {/* Right Column: QR Code */}
            <div
              className="p-2 rounded-2xl bg-white shadow-sm border shrink-0 flex items-center justify-center"
              style={{ borderColor: theme.border }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Memory QR Code"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-gray-50 text-gray-400">
                  <QrIcon className="h-8 w-8 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. BOTTOM SECTION (SOCIODEX BRANDING - NO TAGLINE) ── */}
      <div className="relative z-10 pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: theme.border }}>
        {/* SocioDex Brand Mark */}
        <div className="flex items-center gap-1.5">
          <SocioDexLogo size="xs" />
        </div>

        {/* Direct Link / Domain Mark */}
        <div
          className="text-[9px] sm:text-[10px] font-semibold text-right"
          style={{ color: theme.subtext }}
        >
          <span>sociodex.com</span>
        </div>
      </div>
    </div>
  );
}
