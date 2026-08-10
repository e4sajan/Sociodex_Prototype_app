import { MessageSquare, Sparkles } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { useChatStore } from "@/lib/chatStore";
import { useStore } from "@/lib/store";

export function FloatingChatButton() {
  const isDrawerOpen = useChatStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useChatStore((s) => s.setDrawerOpen);
  const getTotalUnreadCount = useChatStore((s) => s.getTotalUnreadCount);
  const currentUser = useStore((s) => s.currentUser);
  const location = useLocation();

  const totalUnread = getTotalUnreadCount();

  if (isDrawerOpen) return null;

  // Do not show floating button on landing page (/) or login page (/login) if user is not signed in
  if (!currentUser && (location.pathname === "/" || location.pathname === "/login")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open SocioDex Messenger"
        title="Open SocioDex Chat & Messages"
        className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E4603C] to-[#C94B29] text-white p-3.5 sm:px-5 sm:py-3.5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/40 backdrop-blur-md"
      >
        <div className="relative">
          <MessageSquare className="h-5 w-5 fill-white/20" />
          {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2.5 h-5 min-w-5 px-1 rounded-full bg-[#EBC85A] text-[#241621] text-[10px] font-extrabold flex items-center justify-center border-2 border-[#E4603C] shadow-md animate-bounce">
              {totalUnread}
            </span>
          )}
        </div>

        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Chat & Messages
        </span>

        <Sparkles className="hidden sm:inline h-3.5 w-3.5 text-[#EBC85A] animate-pulse" />
      </button>
    </div>
  );
}
