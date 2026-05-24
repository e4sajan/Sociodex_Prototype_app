import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ShoppingBag, Sprout, Heart, Users, BarChart3, LogOut, LogIn, Home } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/creator", label: "Memory Creator", icon: Heart },
  { to: "/keepsakes", label: "Choose Keepsake", icon: Sprout },
  { to: "/guests", label: "Guest Manager", icon: Users },
  { to: "/tracker", label: "Activity Tracker", icon: BarChart3 },
] as const;

export function TopNav() {
  const combos = useStore((s) => s.combos);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  // Hide on public memory pages
  if (location.pathname.startsWith("/m/")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">
              Nandi Invites
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-full px-4 py-2 text-sm font-medium bg-primary/10 text-primary",
                }}
                activeOptions={{ exact: t.to === "/" }}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* AUTH SECTION */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted transition-all select-none"
                >
                  <span className="text-base">{currentUser.avatar || "👤"}</span>
                  <span className="hidden md:inline max-w-[90px] truncate font-bold text-neutral-700">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-border/80 bg-card p-3 shadow-xl z-50 animate-fade-in">
                    <div className="px-2 pb-2 border-b border-border/60">
                      <div className="text-xs font-bold truncate text-neutral-800">
                        {currentUser.name}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                        {currentUser.provider} session
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left rounded-xl px-2 py-2 text-xs text-red-500 font-bold hover:bg-red-500/10 mt-2 transition-all flex items-center gap-2"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted transition-all"
              >
                <LogIn className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium lift"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {combos.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
                activeProps={{
                  className:
                    "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-primary",
                }}
                activeOptions={{ exact: t.to === "/" }}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
