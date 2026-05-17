import { Link, useLocation } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { ShoppingBag, Sprout, Heart, Users, BarChart3 } from "lucide-react";

const TABS = [
  { to: "/", label: "Memory Creator", icon: Heart },
  { to: "/combo", label: "Combo Builder", icon: Sprout },
  { to: "/guests", label: "Guest Manager", icon: Users },
  { to: "/tracker", label: "Tracker", icon: BarChart3 },
] as const;

export function TopNav() {
  const combos = useStore((s) => s.combos);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const location = useLocation();

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
            <span className="font-display text-2xl font-semibold tracking-tight">Nandi Invites</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "rounded-full px-4 py-2 text-sm font-medium bg-primary/10 text-primary" }}
                activeOptions={{ exact: t.to === "/" }}
              >
                {t.label}
              </Link>
            ))}
          </nav>

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
                activeProps={{ className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-primary" }}
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
