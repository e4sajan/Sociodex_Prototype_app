import React from "react";
import { MessageSquare } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";

interface ContributorChatButtonProps {
  name: string;
  emailOrId?: string;
  avatar?: string;
  avatarColor?: string;
  role?: "creator" | "admin" | "contributor" | "guest";
  memorySlug?: string;
  memoryTitle?: string;
  variant?: "icon-only" | "badge" | "button" | "name-link";
  className?: string;
  children?: React.ReactNode;
}

export function ContributorChatButton({
  name,
  emailOrId,
  avatar = "👤",
  avatarColor = "#E4603C",
  role = "contributor",
  memorySlug,
  memoryTitle,
  variant = "button",
  className = "",
  children,
}: ContributorChatButtonProps) {
  const openChatWithContributor = useChatStore((s) => s.openChatWithContributor);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openChatWithContributor({
      name,
      emailOrId,
      avatar,
      avatarColor,
      role,
      memorySlug,
      memoryTitle,
    });
  };

  if (variant === "name-link") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Chat with ${name}`}
        className={`group inline-flex items-center gap-1 text-left font-bold text-neutral-900 hover:text-[#E4603C] transition-colors cursor-pointer ${className}`}
      >
        <span>{children || name}</span>
        <MessageSquare className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#E4603C]" />
      </button>
    );
  }

  if (variant === "icon-only") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Direct message ${name}`}
        aria-label={`Direct message ${name}`}
        className={`inline-flex items-center justify-center h-7 w-7 rounded-full bg-neutral-100 hover:bg-[#E4603C]/10 text-neutral-600 hover:text-[#E4603C] transition-all cursor-pointer select-none ${className}`}
      >
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
    );
  }

  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Send message to ${name}`}
        className={`inline-flex items-center gap-1.5 rounded-full bg-[#E4603C]/10 hover:bg-[#E4603C]/20 border border-[#E4603C]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#E4603C] transition-all cursor-pointer select-none active:scale-95 ${className}`}
      >
        <MessageSquare className="h-3 w-3" />
        <span>Message</span>
      </button>
    );
  }

  // Default "button" variant
  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Chat with ${name}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#FAF6F0] border border-[#241621]/15 px-3 py-1 text-xs font-semibold text-[#241621] shadow-xs hover:border-[#E4603C]/40 hover:text-[#E4603C] transition-all cursor-pointer select-none active:scale-95 ${className}`}
    >
      <MessageSquare className="h-3.5 w-3.5 text-[#E4603C]" />
      <span>{children || "Chat"}</span>
    </button>
  );
}
