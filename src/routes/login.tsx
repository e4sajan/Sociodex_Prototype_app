import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useStore, type UserSession } from "@/lib/store";
import {
  Sprout,
  Mail,
  Phone,
  ArrowLeft,
  Chrome,
  Smartphone,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ─── Tiny flower background particles ─── */
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 10 + 6,
      delay: Math.random() * 5,
      dur: Math.random() * 8 + 8,
      opacity: Math.random() * 0.3 + 0.15,
    })),
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-gradient-to-tr from-[#FDFBF7] via-[#F4EFEA] to-[#EAE3DB]">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bg-[#C17F5A]/15 rounded-full animate-pulse"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            animation: `floatUp ${p.dur}s linear ${p.delay}s infinite`,
            opacity: p.opacity,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const DEMO_ACCOUNTS = [
  { name: "Sajan Mehta", email: "sajan@example.com", avatar: "🧑‍💼" },
  { name: "Neha Kapoor", email: "neha@example.com", avatar: "👩‍🎨" },
  { name: "Ananya Sharma", email: "ananya@example.com", avatar: "🌸" },
];

const AVATARS = ["😊", "🌸", "⭐", "🎉", "🍀", "🐦", "🦁", "🎨", "🚀"];

export function LoginPage() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const login = useStore((s) => s.login);

  // Read redirect parameter
  const [redirectPath, setRedirectPath] = useState("/");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const red = params.get("redirect");
    if (red) {
      setRedirectPath(red);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate({ to: redirectPath });
    }
  }, [currentUser, navigate, redirectPath]);

  const [activeTab, setActiveTab] = useState<"google" | "phone">("google");
  const [loading, setLoading] = useState(false);

  // Google flow states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  // Phone flow states
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [phoneName, setPhoneName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [otpNotification, setOtpNotification] = useState("");
  const [otpError, setOtpError] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Google login handler
  const handleGoogleLogin = (name: string, email: string) => {
    setLoading(true);
    setShowGoogleModal(false);

    // Choose avatar based on name
    let avatar = "🌸";
    if (name.includes("Sajan")) avatar = "🧑‍💼";
    else if (name.includes("Neha")) avatar = "👩‍🎨";
    else if (name.includes("Ananya")) avatar = "😊";
    else avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

    setTimeout(() => {
      const session: UserSession = {
        name,
        email: email.toLowerCase(),
        avatar,
        provider: "google",
      };
      login(session);
      setLoading(false);
      navigate({ to: redirectPath });
    }, 1800);
  };

  // Phone input handler
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneName.trim() || !phoneNumber.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhoneStep("otp");
      setOtpNotification("🌸 OTP sent! Use verification code '1234' for quick testing.");

      // Auto-clear notification after 8s
      setTimeout(() => setOtpNotification(""), 8000);
    }, 1200);
  };

  // OTP verify handler
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");

    if (code !== "1234") {
      setOtpError("Incorrect OTP code. Enter '1234' for testing!");
      return;
    }

    setLoading(true);
    setOtpError("");
    setTimeout(() => {
      const session: UserSession = {
        name: phoneName.trim(),
        phone: phoneNumber.trim(),
        avatar: "📱",
        provider: "phone",
      };
      login(session);
      setLoading(false);
      navigate({ to: redirectPath });
    }, 1500);
  };

  // Handle individual OTP inputs
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // numbers only

    const newCode = [...otpCode];
    newCode[index] = val.substring(val.length - 1);
    setOtpCode(newCode);

    // Auto-focus next box
    if (val && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <FloatingParticles />

      {/* Floating Header Actions */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to={redirectPath}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-white hover:text-foreground hover:shadow-md backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Card
        </Link>
      </div>

      {/* Auth UI Notification Alert */}
      {otpNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-sm w-full bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-primary/20 backdrop-blur-md">
          <Sparkles className="h-5 w-5 animate-spin flex-shrink-0" />
          <div className="text-xs font-medium leading-normal">{otpNotification}</div>
        </div>
      )}

      {/* Premium Glassmorphic Credentials Card */}
      <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_24px_70px_rgba(44,95,46,0.08)] backdrop-blur-2xl transition-all sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-800">
            Welcome to Nandi Invites
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground px-3">
            Register your digital gift identity to secure memory cards, submit edit requests, and
            leave comments.
          </p>
        </div>

        {/* Tab Selection */}
        {phoneStep === "input" && (
          <div className="mt-6 flex rounded-full bg-[#EDE8E0] p-1">
            <button
              onClick={() => setActiveTab("google")}
              className={`flex-1 rounded-full py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "google"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Chrome className="h-3.5 w-3.5" />
              Google Account
            </button>
            <button
              onClick={() => setActiveTab("phone")}
              className={`flex-1 rounded-full py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "phone"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile Number
            </button>
          </div>
        )}

        {/* LOADING HANDSHAKE HANDLER */}
        {loading ? (
          <div className="my-12 flex flex-col items-center justify-center py-6 text-center">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-primary/20 items-center justify-center">
                <Sprout className="h-5 w-5 text-primary animate-spin" />
              </span>
            </span>
            <div className="mt-5 text-sm font-bold text-neutral-700">Securing your session...</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Establishing authenticated digital workspace
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* GOOGLE SIGN IN PANEL */}
            {activeTab === "google" && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowGoogleModal(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-3.5 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3 text-primary" /> End-to-End Encrypted
                </div>
              </div>
            )}

            {/* PHONE SIGN IN PANEL */}
            {activeTab === "phone" && (
              <div>
                {phoneStep === "input" ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneName}
                        onChange={(e) => setPhoneName(e.target.value)}
                        placeholder="e.g. Rajan Mehta"
                        className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +91 98200 11111"
                        className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/95 hover:shadow-lg"
                    >
                      Verify Mobile Number
                    </button>
                  </form>
                ) : (
                  /* OTP VERIFY CARD PANEL */
                  <form onSubmit={handleOtpVerify} className="space-y-5">
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-neutral-700">
                        Enter Verification Code
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        We sent a 4-digit code to <strong>{phoneNumber}</strong>
                      </p>
                    </div>

                    <div className="flex justify-center gap-3 py-1">
                      {otpCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          placeholder="0"
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="h-14 w-12 rounded-2xl border border-neutral-200 bg-white/60 text-center font-display text-xl font-bold outline-none transition-all focus:border-primary focus:bg-white"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <div className="text-center text-xs font-semibold text-red-500">
                        {otpError}
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPhoneStep("input")}
                        className="flex-1 rounded-full border border-neutral-200 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        className="flex-2 rounded-full bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 hover:shadow-lg"
                      >
                        Verify & Register
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GOOGLE SIMULATION DIALOG OVERLAY */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-[390px] rounded-3xl bg-white p-6 shadow-2xl animate-scale-up border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs font-bold text-neutral-500">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold rounded-full hover:bg-neutral-100 h-6 w-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-neutral-500 mb-2">
                Choose an account from Nandi Invites:
              </div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleLogin(acc.name, acc.email)}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 p-3.5 text-left transition-all"
                  >
                    <div className="text-2xl">{acc.avatar}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-neutral-800">{acc.name}</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">
                        {acc.email}
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-primary opacity-0 hover:opacity-100" />
                  </button>
                ))}
              </div>

              {/* Custom Google account block */}
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <div className="text-xs text-neutral-500 mb-2">
                  Or enter another custom profile:
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      if (customGoogleName.trim() && customGoogleEmail.trim()) {
                        handleGoogleLogin(customGoogleName.trim(), customGoogleEmail.trim());
                      }
                    }}
                    disabled={!customGoogleName.trim() || !customGoogleEmail.trim()}
                    className="w-full rounded-full bg-[#2a1f1a] disabled:bg-neutral-300 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                  >
                    Use Custom Google Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
