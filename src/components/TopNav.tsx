import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { Heart, BarChart3, LogOut, LogIn, Home, Sparkles, ArrowRight, MessageSquare, Calendar } from "lucide-react";
import { SocioDexLogo } from "@/components/SocioDexLogo";

export function TopNav() {
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const setDrawerOpen = useChatStore((s) => s.setDrawerOpen);
  const getTotalUnreadCount = useChatStore((s) => s.getTotalUnreadCount);
  const totalUnread = getTotalUnreadCount();

  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  // Hide on public live keepsake memory pages (/m/$slug) and standalone login page (/login)
  if (location.pathname.startsWith("/m/") || location.pathname === "/login") return null;

  const isLandingPage = location.pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#241621]/10 bg-[#FFFDF9]/85 backdrop-blur-xl transition-all shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo - Links to Dashboard (/tracker) when logged in, else Home (/) */}
          <Link
            to={currentUser ? "/tracker" : "/"}
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
          >
            <SocioDexLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {currentUser ? (
              /* LOGGED-IN NAVBAR LINKS: NO HOME BUTTON */
              <>
                <Link
                  to="/tracker"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                  activeProps={{
                    className: "rounded-full px-4 py-2 text-sm font-bold bg-[#E4603C]/10 text-[#E4603C]",
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  to="/creator"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                  activeProps={{
                    className: "rounded-full px-4 py-2 text-sm font-bold bg-[#E4603C]/10 text-[#E4603C]",
                  }}
                >
                  Memory Creator
                </Link>

                <Link
                  to="/scheduler"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621] flex items-center gap-1.5"
                  activeProps={{
                    className: "rounded-full px-4 py-2 text-sm font-bold bg-[#E4603C]/10 text-[#E4603C]",
                  }}
                >
                  <span>Auto-Scheduler</span>
                  <span className="bg-[#E4603C] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    Auto-Send
                  </span>
                </Link>
              </>
            ) : (
              /* LOGGED-OUT LANDING NAVBAR LINKS */
              <>
                <Link
                  to="/"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                  activeProps={{
                    className: "rounded-full px-4 py-2 text-sm font-bold bg-[#E4603C]/10 text-[#E4603C]",
                  }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                >
                  How it Works
                </a>
                <a
                  href="#pricing"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#241621]/70 transition-colors hover:bg-[#F4ECE0] hover:text-[#241621]"
                >
                  FAQ
                </a>
              </>
            )}
          </nav>

          {/* Right Action Buttons & Auth */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Global Chat Launcher Button - only visible when logged in */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                title="Open Chat & Messages"
                aria-label="Open Chat"
                className="relative p-2.5 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] text-[#241621] transition-all cursor-pointer shadow-xs select-none hover:border-[#E4603C]/40 hover:text-[#E4603C]"
              >
                <MessageSquare className="h-4 w-4" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#E4603C] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {totalUnread}
                  </span>
                )}
              </button>
            )}

            {/* AUTH / PROFILE */}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#241621]/15 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#FAF6F0] transition-all select-none cursor-pointer shadow-xs"
                >
                  <span className="text-base">{currentUser.avatar || "👤"}</span>
                  <span className="hidden md:inline max-w-[90px] truncate font-bold text-[#241621]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#241621]/15 bg-white p-3 shadow-xl z-50 animate-fade-in text-left">
                    <div className="px-2 pb-2 border-b border-[#241621]/10">
                      <div className="text-xs font-bold truncate text-[#241621]">
                        {currentUser.name}
                      </div>
                      <div className="text-[9px] text-[#594855] font-semibold uppercase tracking-wider mt-0.5">
                        {currentUser.provider} session
                      </div>
                    </div>
                    <Link
                      to="/tracker"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left rounded-xl px-2 py-2 text-xs text-[#241621] font-bold hover:bg-[#FAF6F0] mt-1 transition-all flex items-center gap-2"
                    >
                      <BarChart3 className="h-3.5 w-3.5 text-[#E4603C]" />
                      Dashboard
                    </Link>
                    <Link
                      to="/creator"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left rounded-xl px-2 py-2 text-xs text-[#241621] font-bold hover:bg-[#FAF6F0] mt-1 transition-all flex items-center gap-2"
                    >
                      <Heart className="h-3.5 w-3.5 text-[#E4603C]" />
                      Memory Creator
                    </Link>
                    <Link
                      to="/scheduler"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left rounded-xl px-2 py-2 text-xs text-[#241621] font-bold hover:bg-[#FAF6F0] mt-1 transition-all flex items-center gap-2"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#E4603C]" />
                      Auto-Scheduler
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        navigate({ to: "/" });
                      }}
                      className="w-full text-left rounded-xl px-2 py-2 text-xs text-[#E4603C] font-bold hover:bg-[#E4603C]/10 mt-1 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-[#E4603C] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-[#c94b29] transition-all cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t shadow-lg border-[#241621]/10 bg-[#FFFDF9]/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {currentUser ? (
            <>
              <Link
                to="/tracker"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#594855] font-semibold"
                activeProps={{
                  className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#E4603C] font-bold",
                }}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/creator"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#594855] font-semibold"
                activeProps={{
                  className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#E4603C] font-bold",
                }}
              >
                <Heart className="h-5 w-5" />
                <span>Creator</span>
              </Link>
              <Link
                to="/scheduler"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#594855] font-semibold"
                activeProps={{
                  className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#E4603C] font-bold",
                }}
              >
                <Calendar className="h-5 w-5" />
                <span>Scheduler</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#594855] font-semibold"
                activeProps={{
                  className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#E4603C] font-bold",
                }}
                activeOptions={{ exact: true }}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/login"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#594855] font-semibold"
                activeProps={{
                  className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-[#E4603C] font-bold",
                }}
              >
                <LogIn className="h-5 w-5 text-[#E4603C]" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
