import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { TopNav } from "@/components/TopNav";
import { SocioDexLogo } from "@/components/SocioDexLogo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF6EC] px-4">
      <div className="max-w-md text-center space-y-4">
        <SocioDexLogo size="lg" />
        <h1 className="font-display text-6xl text-[#241621]">404</h1>
        <h2 className="font-display text-2xl text-[#241621]">Page not found</h2>
        <p className="text-sm text-[#594855]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#E4603C] px-6 py-3 text-sm font-bold text-white hover:bg-[#c94b29] shadow-md transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SocioDex — Every celebration deserves a home" },
      {
        name: "description",
        content:
          "SocioDex gives every celebration its own living digital memory page. Preserving birthdays, weddings, farewells, anniversaries, and life's moments forever.",
      },
      { property: "og:title", content: "SocioDex — Every celebration deserves a home" },
      {
        property: "og:description",
        content:
          "Create interactive surprise pages, milestone wishbooks, voice notes, photos, and smart event invitations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { initAuthListener } from "@/lib/supabase";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { Toaster } from "sonner";

function RootComponent() {
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    const unsubscribe = initAuthListener((userSession, event) => {
      if (userSession) {
        login(userSession);
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => unsubscribe();
  }, [login, logout]);

  return (
    <>
      <TopNav />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <ChatDrawer />
      <FloatingChatButton />
      <Toaster position="top-right" richColors />
    </>
  );
}

