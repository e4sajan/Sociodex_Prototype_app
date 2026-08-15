import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  X,
  ChevronDown,
  Heart,
  MessageSquare,
  Users,
  Lock,
  QrCode,
  FileText,
  Infinity as InfinityIcon,
  HelpCircle,
  Building2,
  GraduationCap,
  Baby,
  ChevronUp,
  ShieldCheck,
  Zap,
  Crown,
  Star,
  CheckCircle2,
  Building,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SocioDex — Every celebration deserves a home" },
      {
        name: "description",
        content:
          "SocioDex gives every celebration its own living digital memory page. Preserving birthdays, weddings, farewells, anniversaries, and life's moments forever.",
      },
    ],
  }),
  component: SocioDexLandingPage,
});

function SocioDexLandingPage() {
  const currentUser = useStore((s) => s.currentUser);
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  // Scroll Reading Progress State
  const [scrollProgress, setScrollProgress] = useState(0);

  // Modals & Interactivity States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Pricing State & Corporate Modal
  const [pricingCategory, setPricingCategory] = useState<"individuals" | "corporates">("individuals");
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [selectedCorporatePlan, setSelectedCorporatePlan] = useState<string>("Culture Plus");
  const [corpName, setCorpName] = useState("");
  const [corpEmail, setCorpEmail] = useState("");
  const [corpCompany, setCorpCompany] = useState("");
  const [corpSubmitted, setCorpSubmitted] = useState(false);

  // Auth Modal form state
  const [authEmail, setAuthEmail] = useState("");
  const [celebrationType, setCelebrationType] = useState("birthday");
  const [authSubmitted, setAuthSubmitted] = useState(false);

  // Hero Card heart counts & state
  const [heroLikes, setHeroLikes] = useState(142);
  const [isHeroLiked, setIsHeroLiked] = useState(false);

  // Solution Mockup Active Tab
  const [mockupTab, setMockupTab] = useState<"all" | "photos" | "wishes" | "rsvps">("all");
  const [mockupLikes, setMockupLikes] = useState({ emma: 34, jason: 56 });

  // Interactive Why SocioDex Feature Discovery Row
  const [activeFeatureRow, setActiveFeatureRow] = useState<number>(1);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Confetti Pieces
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; color: string; delay: number; duration: number }>
  >([]);

  // Trigger Confetti effect
  const triggerConfetti = () => {
    const colors = ["#E4603C", "#EBC85A", "#E4603C", "#C17F5A", "#5C3A50", "#3A76C4"];
    const pieces = Array.from({ length: 35 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.4,
      duration: 2.5 + Math.random() * 2,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4500);
  };

  // Track window scroll for progress bar & back to top
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHeroLikeClick = () => {
    if (!isHeroLiked) {
      setHeroLikes((prev) => prev + 1);
      setIsHeroLiked(true);
      triggerConfetti();
    } else {
      setHeroLikes((prev) => prev - 1);
      setIsHeroLiked(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    // Simulate authentication
    const nameFromEmail = authEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    login({
      name: formattedName || "Guest User",
      email: authEmail.trim(),
      avatar: "✨",
      provider: "google",
    });

    setAuthSubmitted(true);
    triggerConfetti();

    setTimeout(() => {
      setShowAuthModal(false);
      setAuthSubmitted(false);
      setAuthEmail("");
      navigate({ to: "/creator" });
    }, 1500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#FFFDF9] text-[#241621] font-sans overflow-x-hidden selection:bg-[#E4603C]/20 selection:text-[#E4603C]">
      {/* ── 1. Scroll Progress Bar at Top ── */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-[#E4603C] z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── 2. Floating Confetti Canvas overlay ── */}
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}



      {/* ── 4. SECTION 1: HERO SECTION ── */}
      <header className="relative pt-12 pb-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-[#EBC85A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-35 right-10 w-80 h-80 bg-[#E4603C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4603C]/20 bg-[#FFFDF9] px-4 py-1.5 text-xs font-bold text-[#E4603C] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E4603C]" />
              <span>Permanent Homes for Life's Moments</span>
            </div>

            <div className="space-y-4">
              <h1
                className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#241621] leading-[1.08]"
                style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
              >
                Celebrations,{" "}
                <span className="italic text-[#E4603C] underline decoration-[#EBC85A] decoration-wavy underline-offset-8">
                  Reimagined.
                </span>
              </h1>

              <p className="text-[#6B5A66] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Create beautiful interactive memory pages for birthdays, weddings, farewells,
                anniversaries and every moment worth remembering.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => {
                  if (currentUser) navigate({ to: "/creator" });
                  else setShowAuthModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#E4603C]/25 cursor-pointer transition-all active:scale-95 hover:scale-[1.02]"
              >
                <span>{currentUser ? "Launch Creator" : "Sign In"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-7 py-4 text-sm font-bold text-[#241621] shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Play className="h-4 w-4 text-[#E4603C] fill-[#E4603C]" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E4603C] text-white text-xs font-bold ring-2 ring-white">
                  AM
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBC85A] text-[#241621] text-xs font-bold ring-2 ring-white">
                  SK
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#5C3A50] text-white text-xs font-bold ring-2 ring-white">
                  RL
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C94B29] text-white text-xs font-bold ring-2 ring-white">
                  JD
                </div>
              </div>
              <div className="text-xs text-[#6B5A66] font-medium">
                <strong className="text-[#241621] font-bold">Over 2,400+</strong> celebrations
                preserved forever
              </div>
            </div>
          </div>

          {/* Right Visual Stage */}
          <div className="relative mx-auto max-w-lg w-full lg:max-w-none flex justify-center fade-up lg:pl-6">
            <div className="relative w-full max-w-[480px]">
              {/* Main Photo Card */}
              <div className="rounded-[2.2rem] bg-white border border-[#241621]/10 p-4 shadow-[0_24px_60px_rgba(36,22,33,0.12)] relative z-10 transition-transform duration-500 hover:scale-[1.01]">
                <div className="relative aspect-[4/3] w-full rounded-[1.6rem] overflow-hidden bg-[#FAF6F0] mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800"
                    alt="Sarah's 30th Birthday"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#E4603C] shadow-xs">
                    🎂 Birthday Memory
                  </span>
                </div>

                <div className="px-2">
                  <h4
                    className="font-display text-xl font-bold text-[#241621]"
                    style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
                  >
                    Sarah's 30th Birthday ✨
                  </h4>
                  <p className="text-xs text-[#6B5A66] mt-0.5 font-medium">
                    Golden Hour Backyard Party — July 2026
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#241621]/8 flex items-center justify-between px-2 text-xs">
                  <button
                    onClick={handleHeroLikeClick}
                    className={`inline-flex items-center gap-1.5 font-bold transition-transform active:scale-125 cursor-pointer ${
                      isHeroLiked ? "text-[#E4603C]" : "text-[#241621]/70 hover:text-[#E4603C]"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isHeroLiked ? "fill-[#E4603C]" : ""}`} />
                    <span>{heroLikes} Wishes</span>
                  </button>
                  <span className="text-[#6B5A66] font-semibold">48 Photos Added</span>
                </div>
              </div>

              {/* Floating Invite Badge Card */}
              <div className="absolute -top-6 -left-6 z-20 rounded-2xl bg-white border border-[#241621]/10 p-3.5 shadow-xl max-w-[200px] hidden sm:block animate-bounce-slow">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#E4603C] block mb-1">
                  Digital Invitation
                </span>
                <h5 className="text-xs font-bold text-[#241621]">Maya & Alex's Wedding 💍</h5>
                <span className="text-[10px] text-[#6B5A66] mt-1 block font-medium">
                  💌 128 RSVPs Confirmed
                </span>
              </div>

              {/* Floating Wish Bubble Card */}
              <div className="absolute -bottom-8 -right-6 z-20 rounded-2xl bg-[#FFFDF9] border border-[#241621]/10 p-4 shadow-xl max-w-[260px] hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-[#E4603C] text-white text-[10px] font-bold flex items-center justify-center">
                    DV
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#241621]">David Vance</h5>
                    <span className="text-[9px] text-[#6B5A66]">2m ago</span>
                  </div>
                </div>
                <p className="text-xs text-[#6B5A66] leading-relaxed italic">
                  "So glad we could celebrate this milestone together! Check out the polaroid photos
                  I uploaded 📸"
                </p>
              </div>

              {/* Floating Reaction Badges */}
              <div className="absolute top-1/2 -right-10 z-20 bg-white border border-[#241621]/10 p-2.5 rounded-2xl shadow-lg text-2xl animate-pulse">
                🥳
              </div>
              <div className="absolute top-1/3 -left-10 z-20 bg-white border border-[#241621]/10 p-2.5 rounded-2xl shadow-lg text-2xl animate-pulse">
                💖
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 5. SECTION 2: THE PROBLEM (DARK PLUM) ── */}
      <section className="bg-[#241621] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E4603C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EBC85A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#EBC85A] bg-[#EBC85A]/10 px-4 py-1.5 rounded-full">
              The Ephemeral Trap
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Our memories disappear too quickly.
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              Today, the most meaningful moments of our lives are buried under hundreds of daily
              group chats.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {/* Card 1 */}
            <div className="bg-[#382033]/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-[#E4603C]/40 transition-all">
              <div>
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-lg font-bold text-white">Birthday wishes disappear</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2">
                  Heartfelt messages get drowned under 300 notification pings and lost forever in
                  chat history.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#E4603C] uppercase tracking-wider block pt-2 border-t border-white/10">
                Lost in 24 hours
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-[#382033]/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-[#E4603C]/40 transition-all">
              <div>
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-lg font-bold text-white">Wedding invitations stay PDFs</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2">
                  Beautiful invitations end up as static, forgotten file attachments in email
                  threads.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#EBC85A] uppercase tracking-wider block pt-2 border-t border-white/10">
                Uninteractive & Static
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-[#382033]/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-[#E4603C]/40 transition-all">
              <div>
                <div className="text-3xl mb-3">📕</div>
                <h3 className="text-lg font-bold text-white">Farewell cards get forgotten</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2">
                  Physical paper cards get damaged, misplaced, or packed away into dusty boxes never
                  to be opened.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#E4603C] uppercase tracking-wider block pt-2 border-t border-white/10">
                Physically Scattered
              </span>
            </div>

            {/* Card 4 */}
            <div className="bg-[#382033]/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-[#E4603C]/40 transition-all">
              <div>
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-lg font-bold text-white">Photos stay scattered</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2">
                  Every guest takes amazing photos on their phones, but 90% of them are never shared
                  with anyone.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#EBC85A] uppercase tracking-wider block pt-2 border-t border-white/10">
                Buried on Devices
              </span>
            </div>
          </div>

          <div className="pt-4">
            <span className="inline-block rounded-full bg-[#E4603C] text-white px-6 py-2 text-xs font-extrabold uppercase tracking-widest shadow-md">
              Moments deserve better.
            </span>
          </div>
        </div>
      </section>

      {/* ── 6. SECTION 3: THE SOLUTION (INTERACTIVE MOCKUP) ── */}
      <section id="solution" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] relative">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Introducing SocioDex
            </span>

            <div className="flex justify-center pt-2">
              <div className="h-14 w-14 rounded-3xl bg-[#E4603C] flex items-center justify-center text-white text-2xl shadow-md">
                ✨
              </div>
            </div>

            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Meet SocioDex.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              A place where every celebration gets its own living digital home.
            </p>
          </div>

          {/* Interactive Mac-style Mockup Stage */}
          <div className="rounded-3xl border border-[#241621]/15 bg-white shadow-[0_32px_80px_rgba(36,22,33,0.1)] overflow-hidden text-left max-w-4xl mx-auto">
            {/* Header bar */}
            <div className="bg-[#FAF6F0] border-b border-[#241621]/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                <span className="h-3 w-3 rounded-full bg-green-400 inline-block" />
              </div>
              <div className="bg-white border border-[#241621]/10 rounded-full px-4 py-1 text-xs font-sans text-[#6B5A66] flex items-center gap-2">
                <Lock className="h-3 w-3 text-green-600" />
                <span>sociodex.app/sarah-turns-30</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Banner */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/1] bg-[#241621] text-white">
                <img
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1000"
                  alt="Sarah's 30th"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <h3
                    className="font-display text-2xl sm:text-3xl font-bold text-white"
                    style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
                  >
                    Sarah's 30th Milestone Celebration ✨
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Preserved by 42 friends • 186 Memories Captured
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-[#241621]/10 pb-3 overflow-x-auto">
                {[
                  { id: "all", label: "✨ All Memories" },
                  { id: "photos", label: "📸 Photos & Videos" },
                  { id: "wishes", label: "💌 Wish Wall" },
                  { id: "rsvps", label: "🥂 Guests & RSVPs" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMockupTab(t.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      mockupTab === t.id
                        ? "bg-[#E4603C] text-white shadow-xs"
                        : "text-[#6B5A66] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  {(mockupTab === "all" || mockupTab === "wishes") && (
                    <div className="rounded-2xl border border-[#241621]/10 p-4 bg-[#FFFDF9] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#E4603C] text-white text-xs font-bold flex items-center justify-center">
                          EM
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#241621]">Emma Watson</h5>
                          <span className="text-[10px] text-[#6B5A66]">Wrote a wish • 10m ago</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#241621] leading-relaxed">
                        "Happy 30th Sarah! From college dorms to this amazing milestone, so proud of
                        everything you've achieved. Here's to 30 more years of adventures! 🎉🥂"
                      </p>
                      <button
                        onClick={() =>
                          setMockupLikes((prev) => ({ ...prev, emma: prev.emma + 1 }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E4603C] hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Heart className="h-3.5 w-3.5 fill-[#E4603C]" />
                        <span>{mockupLikes.emma} Likes</span>
                      </button>
                    </div>
                  )}

                  {(mockupTab === "all" || mockupTab === "photos") && (
                    <div className="rounded-2xl border border-[#241621]/10 p-4 bg-[#FFFDF9] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#5C3A50] text-white text-xs font-bold flex items-center justify-center">
                          JL
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#241621]">Jason Lee</h5>
                          <span className="text-[10px] text-[#6B5A66]">
                            Uploaded 2 photos • 25m ago
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden h-36">
                        <img
                          src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=400"
                          alt="Photo 1"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400"
                          alt="Photo 2"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setMockupLikes((prev) => ({ ...prev, jason: prev.jason + 1 }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E4603C] hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Heart className="h-3.5 w-3.5 fill-[#E4603C]" />
                        <span>{mockupLikes.jason} Likes</span>
                      </button>
                    </div>
                  )}

                  {mockupTab === "rsvps" && (
                    <div className="rounded-2xl border border-[#241621]/10 p-4 bg-[#FFFDF9] space-y-3">
                      <h4 className="text-xs font-bold text-[#241621]">Event RSVPs Confirmed</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-[#241621]/5">
                          <span className="font-medium">Alex Rivera</span>
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Attending
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-[#241621]/5">
                          <span className="font-medium">Chloe Vance</span>
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Attending
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="font-medium">Marcus Bell</span>
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Attending
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#241621]/10 p-4 bg-[#FAF6F0] space-y-3">
                    <h4 className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                      Memory Wall Stats
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6B5A66]">Total Wishes</span>
                        <strong className="text-[#241621]">84 Messages</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B5A66]">Media Uploaded</span>
                        <strong className="text-[#241621]">142 Photos & Videos</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B5A66]">Forever Link</span>
                        <strong className="text-[#E4603C]">Active Forever</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#241621]/10 p-4 bg-[#FAF6F0] space-y-3">
                    <h4 className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                      Confirmed Guests
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Alex Rivera</span>
                        <span className="text-green-600 text-[10px] font-bold">Attending</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chloe Vance</span>
                        <span className="text-green-600 text-[10px] font-bold">Attending</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Marcus Bell</span>
                        <span className="text-green-600 text-[10px] font-bold">Attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SECTION 4: CELEBRATE ANYTHING ── */}
      <section id="celebrate" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Versatile Memory Pages
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Celebrate anything.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Custom themes, smart layouts, and tailored guestbooks designed for life's biggest
              milestones.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              {
                pill: "Popular",
                emoji: "🎂",
                title: "Birthdays",
                desc: "Turn birthday messages into a vibrant digital guestbook with photos and voice notes.",
              },
              {
                pill: "Luxury",
                emoji: "💍",
                title: "Weddings",
                desc: "Collect wedding wishes, guest RSVPs, and live photo streams from every table in one place.",
              },
              {
                pill: "Teams",
                emoji: "🏢",
                title: "Corporate Events",
                desc: "Celebrate product launches, team milestones, and annual retreats with your company.",
              },
              {
                pill: "Milestone",
                emoji: "🎓",
                title: "Graduations",
                desc: "Preserve memories, group photos, and advice for graduates from family and friends.",
              },
              {
                pill: "Joyful",
                emoji: "👶",
                title: "Baby Showers",
                desc: "Welcome the new arrival with heartfelt wishes, registry links, and ultrasound memories.",
              },
              {
                pill: "Love",
                emoji: "❤️",
                title: "Anniversaries",
                desc: "Look back at decades of love with a timeline of photos and messages from loved ones.",
              },
              {
                pill: "Heartfelt",
                emoji: "🎉",
                title: "Farewells",
                desc: "Replace paper cards with a permanent digital farewell book for departing colleagues.",
              },
              {
                pill: "Family",
                emoji: "👨‍👩‍👧",
                title: "Reunions",
                desc: "Bring generations together to document family history, recipes, and gathering photos.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-[#241621]/10 bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#E4603C]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{item.emoji}</div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#E4603C]/10 text-[#E4603C] px-3 py-1 rounded-full">
                      {item.pill}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#241621] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B5A66] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. SECTION 5: HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] border-t border-b border-[#241621]/10"
      >
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Simplicity by Design
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              How SocioDex works.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Four effortless steps to convert ephemeral moments into permanent digital keepsakes.
            </p>
          </div>

          {/* 4 Steps Horizontal Pathway */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              {
                step: "01",
                title: "Create a Page",
                desc: "Choose a theme, customize your occasion title, and generate your custom memory link in 60 seconds.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Invite Everyone",
                desc: "Share via WhatsApp, email, or display a single QR code at your venue for guests to scan instantly.",
                icon: QrCode,
              },
              {
                step: "03",
                title: "Celebrate Together",
                desc: "Guests post messages, upload high-res photos, drop videos, and leave audio wishes without needing an app.",
                icon: MessageSquare,
              },
              {
                step: "04",
                title: "Relive Forever",
                desc: "Your celebration stays archived forever. Revisit memories on every anniversary with family and friends.",
                icon: InfinityIcon,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-[#241621]/10 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-[#E4603C]/10 text-[#E4603C] flex items-center justify-center font-bold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-display font-bold text-[#241621]/30">
                        {s.step}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#241621]">{s.title}</h3>
                    <p className="text-xs text-[#6B5A66] leading-relaxed font-medium font-sans">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. SECTION 6: FEATURES MATRIX ── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Crafted for Excellence
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Everything you need for perfect memories.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Thoughtfully built tools that make gathering, organizing, and reliving moments
              effortless.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-left">
            {/* Column 1: CREATE */}
            <div className="rounded-3xl border border-[#241621]/10 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-[#241621]/10 pb-4">
                <span className="h-8 w-8 rounded-full bg-[#E4603C] text-white font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h3 className="font-bold tracking-widest uppercase text-sm text-[#241621]">
                  CREATE
                </h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="text-xl">🎨</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Curated Templates</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Hand-crafted design themes for every type of celebration and mood.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">🔗</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Custom URLs</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Create clean, memorable vanity links like{" "}
                      <code className="bg-[#FAF6F0] px-1.5 py-0.5 rounded text-[11px] font-sans">
                        sociodex.app/maya-alex
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">📲</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Instant QR Codes</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Printable QR codes ready to place on event tables, invitations, or banners.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: CONNECT */}
            <div className="rounded-3xl border border-[#241621]/10 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-[#241621]/10 pb-4">
                <span className="h-8 w-8 rounded-full bg-[#EBC85A] text-[#241621] font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h3 className="font-bold tracking-widest uppercase text-sm text-[#241621]">
                  CONNECT
                </h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="text-xl">📸</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Photos & 4K Videos</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Collect high-resolution original media directly from guest camera rolls.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">💌</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Live Wish Wall</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Interactive stream of heartfelt messages, advice, and stories.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">❤️</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Reactions & Comments</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Guests can react, comment, and engage with memories in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: REMEMBER */}
            <div className="rounded-3xl border border-[#241621]/10 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-[#241621]/10 pb-4">
                <span className="h-8 w-8 rounded-full bg-[#5C3A50] text-white font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h3 className="font-bold tracking-widest uppercase text-sm text-[#241621]">
                  REMEMBER
                </h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="text-xl">♾️</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Forever Links</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Your celebration link never expires or gets deleted from the cloud.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">🔍</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">Smart Memory Search</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Instantly search wishes by guest name, keyword, or date.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">📦</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241621]">One-Click Album Export</h4>
                    <p className="text-xs text-[#6B5A66] mt-0.5 font-medium leading-relaxed">
                      Download your complete memory collection in full high-resolution anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. SECTION 7: WHY SOCIODEX (COMPARISON & DISCOVERY) ── */}
      <section id="why" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0]">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              The Upgrade You Need
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Why choose SocioDex?
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Hover or tap any SocioDex feature below to discover how it works.
            </p>
          </div>

          {/* Grid Layout for Discovery */}
          <div className="grid gap-8 lg:grid-cols-12 text-left items-start">
            {/* Table Column */}
            <div className="lg:col-span-7 rounded-3xl border border-[#241621]/10 bg-white p-4 sm:p-6 shadow-xs space-y-3">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#241621]/10 text-xs font-bold uppercase tracking-wider text-[#6B5A66]">
                <div>Traditional Way</div>
                <div className="text-[#E4603C]">SocioDex Experience</div>
              </div>

              {[
                {
                  id: 1,
                  trad: "Wishes disappear in chats",
                  dex: "Collaborative Memory Pages",
                  headline: "One celebration. Everyone contributes.",
                  sub: "Friends and family can add:",
                  chips: ["💌 Wishes", "📸 Photos", "🎥 Videos", "🎙️ Voice Notes"],
                },
                {
                  id: 2,
                  trad: "Forgotten farewells",
                  dex: "Community Farewell Walls",
                  headline: "Celebrate the impact someone leaves behind.",
                  sub: "Colleagues, seniors, juniors, and friends can contribute:",
                  chips: ["💬 Personal Stories", "💌 Farewell Wishes", "📸 Photos", "❤️ Team Memories"],
                },
                {
                  id: 3,
                  trad: "Static invitations",
                  dex: "Interactive Event Pages",
                  headline: "The invitation becomes the celebration.",
                  sub: "Guests can:",
                  chips: ["✅ RSVP", "💌 Leave Wishes", "📸 Upload Photos", "🎥 Share Videos"],
                  note: "✨ Even after the event ends.",
                },
                {
                  id: 4,
                  trad: "Scattered photos",
                  dex: "Shared Memory Galleries",
                  headline: "Every memory belongs together.",
                  sub: "Automatically collect:",
                  chips: ["📸 Photos", "🎥 Videos", "🗂️ Shared Albums", "🕒 Event Timeline"],
                  note: "📱 Instead of keeping memories scattered across multiple devices.",
                },
                {
                  id: 5,
                  trad: "Moments fade away",
                  dex: "Forever Celebration Pages",
                  headline: "Revisit meaningful moments anytime.",
                  sub: "Every celebration is preserved with:",
                  chips: [
                    "💌 Wishes",
                    "📸 Photos",
                    "🎥 Videos",
                    "🕒 Timeline",
                    "🔗 Shareable Forever Link",
                  ],
                },
              ].map((row) => {
                const isActive = activeFeatureRow === row.id;
                return (
                  <div
                    key={row.id}
                    onClick={() => setActiveFeatureRow(row.id)}
                    className={`grid grid-cols-2 gap-4 p-3.5 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#E4603C]/10 border border-[#E4603C]/30 shadow-xs"
                        : "hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-[#6B5A66] font-medium">
                      <X className="h-4 w-4 text-red-400 shrink-0" />
                      <span>{row.trad}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#241621]">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{row.dex}</span>
                      </div>
                      <span className="text-[10px] text-[#E4603C] font-semibold hidden sm:inline">
                        Explore ↗
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discovery Stage Right Column */}
            <div className="lg:col-span-5 rounded-3xl border border-[#241621]/15 bg-[#241621] text-white p-6 sm:p-8 shadow-xl relative min-h-[360px] flex flex-col justify-between">
              {(() => {
                const activeData = [
                  {
                    id: 1,
                    headline: "One celebration. Everyone contributes.",
                    sub: "Friends and family can add:",
                    chips: ["💌 Wishes", "📸 Photos", "🎥 Videos", "🎙️ Voice Notes"],
                  },
                  {
                    id: 2,
                    headline: "Celebrate the impact someone leaves behind.",
                    sub: "Colleagues, seniors, juniors, and friends can contribute:",
                    chips: [
                      "💬 Personal Stories",
                      "💌 Farewell Wishes",
                      "📸 Photos",
                      "❤️ Team Memories",
                    ],
                  },
                  {
                    id: 3,
                    headline: "The invitation becomes the celebration.",
                    sub: "Guests can:",
                    chips: ["✅ RSVP", "💌 Leave Wishes", "📸 Upload Photos", "🎥 Share Videos"],
                    note: "✨ Even after the event ends.",
                  },
                  {
                    id: 4,
                    headline: "Every memory belongs together.",
                    sub: "Automatically collect:",
                    chips: ["📸 Photos", "🎥 Videos", "🗂️ Shared Albums", "🕒 Event Timeline"],
                    note: "📱 Instead of keeping memories scattered across multiple devices.",
                  },
                  {
                    id: 5,
                    headline: "Revisit meaningful moments anytime.",
                    sub: "Every celebration is preserved with:",
                    chips: [
                      "💌 Wishes",
                      "📸 Photos",
                      "🎥 Videos",
                      "🕒 Timeline",
                      "🔗 Shareable Forever Link",
                    ],
                  },
                ].find((r) => r.id === activeFeatureRow)!;

                return (
                  <div className="space-y-6 fade-up" key={activeData.id}>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EBC85A] bg-[#EBC85A]/10 px-3 py-1 rounded-full">
                      HOW SOCIODEX DOES IT
                    </span>

                    <h3
                      className="font-display text-2xl font-bold leading-tight"
                      style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
                    >
                      {activeData.headline}
                    </h3>

                    <p className="text-xs text-white/70 font-medium">{activeData.sub}</p>

                    <div className="grid grid-cols-2 gap-2">
                      {activeData.chips.map((chip, idx) => (
                        <div
                          key={idx}
                          className="bg-[#382033] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white flex items-center gap-2"
                        >
                          {chip}
                        </div>
                      ))}
                    </div>

                    {activeData.note && (
                      <p className="text-xs text-[#EBC85A] font-semibold pt-2">
                        {activeData.note}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. SECTION 8: WHO IT'S FOR ── */}
      <section id="who-its-for" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Built for Everyone
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Who SocioDex is for.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Whether you're planning an intimate gathering or a major corporate milestone.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {[
              {
                emoji: "🏡",
                title: "Families",
                desc: "Archive birthdays, anniversaries, baby milestones, and family reunions in one shared space.",
              },
              {
                emoji: "🥂",
                title: "Friend Groups",
                desc: "Collect hilarious photos, inside jokes, and heartfelt wishes for friend birthdays & trips.",
              },
              {
                emoji: "💼",
                title: "Companies",
                desc: "Give departing teammates memorable farewell walls and celebrate company work anniversaries.",
              },
              {
                emoji: "🎓",
                title: "Schools & Alumni",
                desc: "Gather graduation wishes, yearbook memories, and reunion photos effortlessly.",
              },
              {
                emoji: "🌐",
                title: "Communities",
                desc: "Document local festivals, volunteer milestones, and club anniversaries together.",
              },
              {
                emoji: "✨",
                title: "Event Organizers",
                desc: "Offer clients a premium digital memory souvenir for weddings, galas, and parties.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-[#241621]/10 bg-white p-6 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3"
              >
                <div className="text-3xl">{item.emoji}</div>
                <h3 className="font-display text-xl font-bold text-[#241621]">{item.title}</h3>
                <p className="text-xs text-[#6B5A66] leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. SECTION 9: OUR VISION (OUR PHILOSOPHY) ── */}
      <section
        id="vision"
        className="bg-[#241621] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center"
      >
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#EBC85A] bg-[#EBC85A]/10 px-4 py-1.5 rounded-full inline-block">
            Our Philosophy
          </span>

          <h2
            className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
          >
            We're Redefining What Social Media Should Be.
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto">
            <p>
              For years, social media has become a race for attention—endless feeds, infinite
              scrolling, and algorithms designed to keep us engaged instead of helping us connect.
            </p>

            <p className="font-bold text-[#EBC85A] text-lg">We believe there's a better way.</p>

            <p>
              SocioDex is a purpose-driven social platform where every interaction begins with a
              reason: celebrating a milestone, bringing people together, preserving memories, or
              building meaningful communities. Instead of disappearing into forgotten chats and
              fleeting stories, every celebration becomes a lasting place where people can connect,
              contribute, and relive the moments that matter.
            </p>
          </div>

          <div className="p-6 bg-[#382033]/70 border border-white/10 rounded-2xl shadow-xl max-w-2xl mx-auto">
            <p
              className="font-display text-lg sm:text-xl font-bold text-[#FFFDF9]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              "We're not building another feed. We're building a platform where people gather with
              purpose."
            </p>
          </div>

          <div className="text-xs font-bold text-[#EBC85A] uppercase tracking-widest">
            — The SocioDex Vision
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20">
        <div className="text-center space-y-10">
          {/* Header Tag & Titles */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#E4603C]" />
              <span>Simple, Transparent Pricing</span>
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621] tracking-tight"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Choose the perfect plan for your celebrations.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-xl mx-auto font-medium leading-relaxed">
              Whether you are creating memory books for family milestones or organizing culture campaigns for thousands of employees, we have a plan built for you.
            </p>
          </div>

          {/* Category Segmented Toggle */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center p-1.5 bg-[#FAF6F0] border border-[#241621]/10 rounded-full shadow-inner">
              <button
                onClick={() => setPricingCategory("individuals")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  pricingCategory === "individuals"
                    ? "bg-[#E4603C] text-white shadow-md scale-[1.02]"
                    : "text-[#6B5A66] hover:text-[#241621]"
                }`}
              >
                <Heart className={`h-4 w-4 ${pricingCategory === "individuals" ? "fill-white" : ""}`} />
                <span>Individuals</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  pricingCategory === "individuals" ? "bg-white/20 text-white" : "bg-[#241621]/5 text-[#6B5A66]"
                }`}>
                  Yearly
                </span>
              </button>

              <button
                onClick={() => setPricingCategory("corporates")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  pricingCategory === "corporates"
                    ? "bg-[#241621] text-white shadow-md scale-[1.02]"
                    : "text-[#6B5A66] hover:text-[#241621]"
                }`}
              >
                <Building2 className={`h-4 w-4 ${pricingCategory === "corporates" ? "text-[#EBC85A]" : ""}`} />
                <span>Corporates</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  pricingCategory === "corporates" ? "bg-[#EBC85A]/20 text-[#EBC85A]" : "bg-[#241621]/5 text-[#6B5A66]"
                }`}>
                  Annual Billing
                </span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-3 pt-6 text-left items-stretch max-w-6xl mx-auto">
            {pricingCategory === "individuals" ? (
              <>
                {/* 1. Bloom Basic */}
                <div className="rounded-3xl border border-[#241621]/10 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-widest text-[#6B5A66]">
                        Personal Starter
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Bloom Basic</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Essential toolkit for creating elegant digital celebration spaces.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2 pb-2 border-y border-[#241621]/5">
                      <span className="font-display text-4xl font-bold text-[#241621]">₹499</span>
                      <span className="text-xs font-bold text-[#6B5A66]">/year</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>12 page creations per year</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Manual photo and text upload</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Basic layouts and themes</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Digital sharing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        if (currentUser) {
                          navigate({ to: "/creator" });
                        } else {
                          setShowAuthModal(true);
                        }
                      }}
                      className="w-full rounded-full border border-[#241621]/20 bg-white hover:bg-[#FAF6F0] text-[#241621] py-3.5 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-[#E4603C]/40"
                    >
                      Start Creating
                    </button>
                  </div>
                </div>

                {/* 2. Bloom Plus (Most Popular) */}
                <div className="rounded-3xl border-2 border-[#E4603C] bg-[#FFFDF9] p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative group scale-[1.02] md:scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E4603C] text-white px-4 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-md flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-white" />
                    <span>Most Popular</span>
                  </div>

                  <div className="space-y-6 pt-1">
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C]">
                        AI Enhanced
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Bloom Plus</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Smart AI tools for effortless memory writing and photo organization.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2 pb-2 border-y border-[#E4603C]/20 bg-[#E4603C]/5 -mx-7 px-7">
                      <span className="font-display text-4xl font-bold text-[#241621]">₹899</span>
                      <span className="text-xs font-bold text-[#6B5A66]">/year</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>24 page creations per year</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span className="font-bold text-[#241621]">AI autofill for captions, memories, and page text</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Smart photo organization</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Premium templates</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Digital sharing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        if (currentUser) {
                          navigate({ to: "/creator" });
                        } else {
                          setShowAuthModal(true);
                        }
                      }}
                      className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-xs font-bold shadow-lg shadow-[#E4603C]/25 transition-all cursor-pointer active:scale-95"
                    >
                      Start Creating
                    </button>
                  </div>
                </div>

                {/* 3. Bloom Pro */}
                <div className="rounded-3xl border border-[#241621]/10 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-widest text-[#6B5A66]">
                        Ultimate Power
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Bloom Pro</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Complete automation, scheduled pages, and priority customization.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2 pb-2 border-y border-[#241621]/5">
                      <span className="font-display text-4xl font-bold text-[#241621]">₹1,999</span>
                      <span className="text-xs font-bold text-[#6B5A66]">/year</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>48 page creations per year</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>AI autofill</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Zap className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Scheduled automatic page creation</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Crown className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Priority templates and customization</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Early access to new AI features</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        if (currentUser) {
                          navigate({ to: "/creator" });
                        } else {
                          setShowAuthModal(true);
                        }
                      }}
                      className="w-full rounded-full border border-[#241621]/20 bg-white hover:bg-[#FAF6F0] text-[#241621] py-3.5 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-[#E4603C]/40"
                    >
                      Start Creating
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* CORPORATE PLAN 1: Team Moments */}
                <div className="rounded-3xl border border-[#241621]/10 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="inline-block bg-[#241621]/5 text-[#6B5A66] px-3 py-1 rounded-full text-[10px] font-bold">
                        For: Teams up to 100 employees
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Team Moments</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Effortless farewell books, team milestones, and event albums.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 pb-2 border-y border-[#241621]/5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold text-[#241621]">₹2,999</span>
                        <span className="text-xs font-bold text-[#6B5A66]">/month</span>
                      </div>
                      <div className="text-[11px] text-[#6B5A66] font-semibold">Billed yearly</div>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>100 page creations per year</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Company memory books and event albums</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Admin dashboard</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Team photo and message collection</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Basic company branding</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        setSelectedCorporatePlan("Team Moments");
                        setShowCorporateModal(true);
                      }}
                      className="w-full rounded-full border border-[#241621]/20 bg-[#241621] hover:bg-[#382033] text-white py-3.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Request Demo
                    </button>
                  </div>
                </div>

                {/* CORPORATE PLAN 2: Culture Plus (Best for Growing Teams) */}
                <div className="rounded-3xl border-2 border-[#241621] bg-[#FFFDF9] p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative group scale-[1.02] md:scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#241621] text-[#EBC85A] px-4 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-md flex items-center gap-1 border border-[#EBC85A]/30">
                    <Crown className="h-3.5 w-3.5 text-[#EBC85A]" />
                    <span>Best for Growing Teams</span>
                  </div>

                  <div className="space-y-6 pt-1">
                    <div className="space-y-2">
                      <div className="inline-block bg-[#EBC85A]/20 text-[#241621] px-3 py-1 rounded-full text-[10px] font-extrabold">
                        For: 100-500 employees
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Culture Plus</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Scale employee recognition, farewells, and department celebrations.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 pb-2 border-y border-[#241621]/10 bg-[#241621]/5 -mx-7 px-7">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold text-[#241621]">₹5,999</span>
                        <span className="text-xs font-bold text-[#6B5A66]">/month</span>
                      </div>
                      <div className="text-[11px] text-[#E4603C] font-extrabold">Billed yearly</div>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>200 page creations per year</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span className="font-bold text-[#241621]">AI-assisted content generation</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Department-wise memory collections</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Multiple admins</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Branded themes</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#E4603C] shrink-0 mt-0.5" />
                        <span>Event, farewell, onboarding, and celebration albums</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        setSelectedCorporatePlan("Culture Plus");
                        setShowCorporateModal(true);
                      }}
                      className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-xs font-bold shadow-lg shadow-[#E4603C]/25 transition-all cursor-pointer active:scale-95"
                    >
                      Request Demo
                    </button>
                  </div>
                </div>

                {/* CORPORATE PLAN 3: Enterprise Legacy */}
                <div className="rounded-3xl border border-[#241621]/10 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="inline-block bg-[#241621]/5 text-[#6B5A66] px-3 py-1 rounded-full text-[10px] font-bold">
                        For: Large organizations with up to 1,000 employees
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#241621]">Enterprise Legacy</h3>
                      <p className="text-xs text-[#6B5A66] font-medium leading-relaxed">
                        Tailored campaigns, approval workflows, and dedicated support for large orgs.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 pb-2 border-y border-[#241621]/5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-bold text-[#241621]">Custom pricing</span>
                      </div>
                      <div className="text-[11px] text-[#6B5A66] font-semibold">Tailored enterprise contract</div>
                    </div>

                    <ul className="space-y-3.5 text-xs text-[#241621] font-semibold">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>High-volume page creation</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Custom employee memory campaigns</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Advanced branding</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Dedicated account support & bulk uploads</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Approval workflows</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#241621] shrink-0 mt-0.5" />
                        <span>Custom templates for HR, events, milestones, and leadership messages</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => {
                        setSelectedCorporatePlan("Enterprise Legacy");
                        setShowCorporateModal(true);
                      }}
                      className="w-full rounded-full border border-[#241621]/20 bg-[#241621] hover:bg-[#382033] text-white py-3.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Request Demo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 13. SECTION 10: FAQ ── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E4603C] bg-[#E4603C]/10 px-4 py-1.5 rounded-full">
              Got Questions?
            </span>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold text-[#241621]"
              style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
            >
              Frequently asked questions.
            </h2>
            <p className="text-sm sm:text-base text-[#6B5A66] max-w-md mx-auto font-medium">
              Everything you need to know about SocioDex memory pages.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {[
              {
                q: "Is SocioDex free to use?",
                a: "Yes! You can create your first memory page completely free with full guest participation, photo uploads, and wish collection.",
              },
              {
                q: "Do guests need to download an app or create an account?",
                a: "Not at all! Guests can simply tap your link or scan your event QR code in any mobile browser to leave wishes and photos instantly.",
              },
              {
                q: "Can I upload videos and audio wishes?",
                a: "Yes! SocioDex supports high-definition video clips, voice note wishes, photos, and formatted text messages.",
              },
              {
                q: "Can companies use SocioDex for team farewells?",
                a: "Absolutely. Companies love using SocioDex as a modern, permanent digital farewell book and team celebration hub.",
              },
              {
                q: "Can I create multiple memory pages?",
                a: "Yes! You can manage multiple celebration pages from your dashboard for birthdays, weddings, anniversaries, and more.",
              },
              {
                q: "Will my celebration memory page stay forever?",
                a: "Yes. The core philosophy of SocioDex is permanence. Your celebration page link will remain accessible so you can relive it year after year.",
              },
            ].map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[#241621]/10 bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#241621] flex items-center justify-between cursor-pointer hover:bg-[#FAF6F0] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#E4603C] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-[#6B5A66] leading-relaxed border-t border-[#241621]/5 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 14. SECTION 11: FINAL CTA BANNER ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-[2.5rem] bg-[#241621] text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E4603C]/20 rounded-full blur-3xl pointer-events-none" />

          <h2
            className="font-display text-3xl sm:text-5xl font-bold leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "'Baloo 2', Georgia, serif" }}
          >
            Your next celebration deserves more than another group chat.
          </h2>

          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto font-medium">
            Give your special moment its permanent digital home in less than 60 seconds.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white px-8 py-4 text-sm font-bold shadow-lg shadow-[#E4603C]/30 transition-all active:scale-95 hover:scale-105 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 15. FOOTER ── */}
      <footer className="border-t border-[#241621]/10 bg-[#241621] text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SocioDexLogo size="md" variant="dark" />
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                Where celebrations become permanent memories. Give every moment its own beautiful
                home.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#EBC85A]">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-white/70 font-medium">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#celebrate" className="hover:text-white transition-colors">
                    Celebration Types
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#why" className="hover:text-white transition-colors">
                    Why SocioDex
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#EBC85A]">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-white/70 font-medium">
                <li>
                  <a href="#vision" className="hover:text-white transition-colors">
                    Our Vision
                  </a>
                </li>
                <li>
                  <a href="#who-its-for" className="hover:text-white transition-colors">
                    Who It's For
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#EBC85A]">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-white/70 font-medium">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 font-medium gap-4">
            <div>© 2026 SocioDex, Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">
                Twitter/X
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 16. AUTH MODAL ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#241621]/15 p-6 sm:p-8 shadow-2xl space-y-6 fade-up">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#241621] hover:bg-[#241621] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {!authSubmitted ? (
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#E4603C] text-white flex items-center justify-center font-bold text-xs">
                    ✨
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#241621]">
                    Sign In to SocioDex
                  </h3>
                </div>
                <p className="text-xs text-[#6B5A66] font-medium">
                  Enter your email address to sign in or create your celebration page.
                </p>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-[#241621]">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#E4603C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#241621]">
                    What are you celebrating next?
                  </label>
                  <select
                    value={celebrationType}
                    onChange={(e) => setCelebrationType(e.target.value)}
                    className="w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#E4603C]"
                  >
                    <option value="birthday">🎂 Birthday</option>
                    <option value="wedding">💍 Wedding</option>
                    <option value="farewell">🎉 Farewell</option>
                    <option value="anniversary">❤️ Anniversary</option>
                    <option value="corporate">🏢 Corporate Event</option>
                    <option value="other">✨ Other Moment</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-sm font-bold shadow-md cursor-pointer transition-all mt-4"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="text-5xl">🥳</div>
                <h4 className="font-display text-2xl font-bold text-[#E4603C]">
                  Welcome to SocioDex!
                </h4>
                <p className="text-xs text-[#6B5A66] font-medium">
                  Redirecting to your creator dashboard...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 17. DEMO MODAL ── */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#FFFDF9] border border-[#241621]/15 p-6 sm:p-8 shadow-2xl space-y-6 fade-up text-left">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#241621] hover:bg-[#241621] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#E4603C] text-white flex items-center justify-center font-bold text-xs">
                🎥
              </div>
              <h3 className="font-display text-2xl font-bold text-[#241621]">
                SocioDex Product Tour
              </h3>
            </div>
            <p className="text-xs text-[#6B5A66] font-medium">
              Experience how celebrations come alive on SocioDex.
            </p>

            <div className="rounded-2xl bg-[#241621] text-white h-72 flex flex-col items-center justify-center text-center p-6 space-y-4 shadow-inner relative overflow-hidden">
              <div className="h-16 w-16 rounded-full bg-[#E4603C] flex items-center justify-center text-white text-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-white ml-1" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Interactive SocioDex Walkthrough</h4>
                <p className="text-xs text-white/70 mt-1">
                  1-minute tour of living memory pages, guest wishes, and photo galleries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 17.5 CORPORATE DEMO MODAL ── */}
      {showCorporateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#241621]/15 p-6 sm:p-8 shadow-2xl space-y-6 fade-up">
            <button
              onClick={() => {
                setShowCorporateModal(false);
                setCorpSubmitted(false);
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#241621] hover:bg-[#241621] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {!corpSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!corpEmail.trim() || !corpCompany.trim()) return;
                  setCorpSubmitted(true);
                  triggerConfetti();
                  setTimeout(() => {
                    setShowCorporateModal(false);
                    setCorpSubmitted(false);
                    setCorpName("");
                    setCorpEmail("");
                    setCorpCompany("");
                  }, 2500);
                }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#241621] text-[#EBC85A] flex items-center justify-center font-bold text-xs">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#241621]">
                      Request Demo
                    </h3>
                    <p className="text-xs text-[#E4603C] font-bold">
                      Plan: {selectedCorporatePlan}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#6B5A66] font-medium">
                  Fill in your details and our team will get in touch with a customized walkthrough for your organization.
                </p>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-[#241621]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={corpName}
                    onChange={(e) => setCorpName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#241621]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#241621]">Work Email</label>
                  <input
                    type="email"
                    required
                    value={corpEmail}
                    onChange={(e) => setCorpEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#241621]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#241621]">Company Name</label>
                  <input
                    type="text"
                    required
                    value={corpCompany}
                    onChange={(e) => setCorpCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#241621]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#241621] hover:bg-[#382033] text-white py-3.5 text-sm font-bold shadow-md cursor-pointer transition-all mt-4"
                >
                  Submit Demo Request
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="text-5xl">🏢✨</div>
                <h4 className="font-display text-2xl font-bold text-[#241621]">
                  Demo Request Received!
                </h4>
                <p className="text-xs text-[#6B5A66] font-medium leading-relaxed max-w-xs mx-auto">
                  Thank you, {corpName || "there"}! Our team will contact you at <span className="font-bold text-[#241621]">{corpEmail}</span> within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 18. BACK TO TOP BUTTON ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#E4603C] text-white shadow-xl flex items-center justify-center hover:bg-[#c94b29] transition-all cursor-pointer hover:scale-110 active:scale-95"
          aria-label="Back to Top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
