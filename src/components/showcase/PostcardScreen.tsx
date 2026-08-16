import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { Sparkles, Calendar, Printer, Download, QrCode as QrIcon, Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PostcardScreen({
  compact = false,
  showControls = true,
}: {
  compact?: boolean;
  showControls?: boolean;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const targetUrl = "https://sociodex.com/m/vipul-2ak5";

  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: "#241621",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code for showcase:", err));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast.success("Postcard digital memory link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePrint = () => {
    toast.success("Postcard ready for 4\" × 6\" high-res print!", {
      description: "Standard physical memory keepsake generated with high-contrast QR code.",
    });
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Header Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#241621]/10 text-[11px] font-bold text-[#6B5A66] mb-3 shadow-xs">
        <Sparkles className="h-3 w-3 text-[#E4603C]" />
        <span>LIVE POSTCARD PREVIEW (6" × 4")</span>
      </div>

      {/* Physical 6" x 4" Postcard Container */}
      <div
        className={`w-full max-w-[440px] sm:max-w-[480px] bg-[#FAF7F0] border border-[#241621]/12 rounded-[1.6rem] sm:rounded-[2rem] p-3.5 sm:p-5 shadow-[0_15px_40px_rgba(92,61,46,0.08)] relative transition-all hover:shadow-[0_20px_50px_rgba(92,61,46,0.12)] ${
          compact ? "scale-95" : ""
        }`}
      >
        {/* Dashed Stitched Inner Border */}
        <div className="absolute inset-2.5 sm:inset-3 border border-dashed border-[#241621]/15 rounded-[1.2rem] sm:rounded-[1.5rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full gap-3 sm:gap-4 p-1 sm:p-2">
          {/* Top Header Row */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E4603C]/10 border border-[#E4603C]/20 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#C17F5A]">
              Physical Memory Record
            </span>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600">
              <Calendar className="h-3 w-3 text-[#C17F5A]" />
              <span>31 Aug 2026</span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <h3
              className="font-display text-xl sm:text-2xl font-extrabold text-[#241621] leading-tight"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Birthday
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 font-medium">
              For: <strong className="text-[#241621] font-bold">Vipul</strong> • From:{" "}
              <strong className="text-[#241621] font-bold">Sajan</strong>
            </p>
          </div>

          {/* Middle Row: Scan Callout + Quote Bubble & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Left Col: Explanatory Copy & Note */}
            <div className="sm:col-span-7 space-y-2">
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-[#C17F5A] leading-snug">
                  Scan to open digital memory page
                </h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Explore wishes, photo gallery & voice messages
                </p>
              </div>

              {/* Quote Bubble */}
              <div className="p-2.5 bg-[#FAF2EB] border border-[#C17F5A]/25 rounded-xl">
                <p className="text-[11px] text-neutral-700 italic leading-relaxed">
                  "Wishing you a very happy birthday Vipul!"
                </p>
              </div>

              <div className="text-[9px] font-mono text-neutral-400">
                www.sociodex.com/m/vipul-2ak5
              </div>
            </div>

            {/* Right Col: High-Res QR Code Container */}
            <div className="sm:col-span-5 flex justify-center sm:justify-end">
              <div className="bg-white p-2 rounded-xl sm:rounded-2xl border border-[#241621]/10 shadow-xs flex flex-col items-center transition-transform hover:scale-105">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="SocioDex Memory QR Code"
                    className="w-22 h-22 sm:w-24 sm:h-24 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-22 h-22 sm:w-24 sm:h-24 bg-neutral-100 animate-pulse rounded-lg flex items-center justify-center">
                    <QrIcon className="h-6 w-6 text-neutral-400" />
                  </div>
                )}
                <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                  Point Camera
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Row */}
          <div className="pt-2 border-t border-[#241621]/8 flex items-center justify-between">
            <div className="flex items-center">
              <SocioDexLogo size="xs" />
            </div>
            <span className="text-[10px] font-semibold text-neutral-400">sociodex.com</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleSimulatePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#241621]/15 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] hover:text-[#E4603C] hover:border-[#E4603C]/30 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="h-3 w-3 text-[#E4603C]" />
            <span>Print 4" × 6" Card</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#241621]/15 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0] shadow-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-neutral-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
