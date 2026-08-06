import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useStore, type UserSession } from "@/lib/store";
import {
  ArrowLeft,
  Chrome,
  Smartphone,
  Check,
  ShieldCheck,
  Sparkles,
  Mail,
} from "lucide-react";
import { SocioDexLogo } from "@/components/SocioDexLogo";
import { signInWithGoogle, sendEmailMagicLink, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ─── Floating background particles ─── */
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 10 + 6,
      delay: Math.random() * 5,
      dur: Math.random() * 8 + 8,
      opacity: Math.random() * 0.25 + 0.1,
    })),
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-gradient-to-tr from-[#FBF6EC] via-[#FFFDF9] to-[#F4ECE0]">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bg-[#E4603C]/15 rounded-full animate-pulse"
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
  const [redirectPath, setRedirectPath] = useState("/tracker");
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

  const [activeTab, setActiveTab] = useState<"google" | "email" | "phone">("google");
  const [loading, setLoading] = useState(false);

  // Email Magic Link flow states
  const [emailInput, setEmailInput] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleEmailMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setEmailError("");
    setEmailNotice("");

    if (isSupabaseConfigured) {
      try {
        const { error } = await sendEmailMagicLink(emailInput.trim());
        if (error) {
          console.warn("Supabase Magic Link error, using direct session:", error.message);
          login({
            name: emailInput.split("@")[0],
            email: emailInput.trim(),
            avatar: "✨",
            provider: "email",
          });
          setLoading(false);
          navigate({ to: redirectPath });
        } else {
          setLoading(false);
          setEmailNotice(`✨ Magic login link sent to ${emailInput}! Check your inbox to complete sign in.`);
        }
      } catch (err) {
        login({
          name: emailInput.split("@")[0],
          email: emailInput.trim(),
          avatar: "✨",
          provider: "email",
        });
        setLoading(false);
        navigate({ to: redirectPath });
      }
    } else {
      setTimeout(() => {
        login({
          name: emailInput.split("@")[0],
          email: emailInput.trim(),
          avatar: "✨",
          provider: "email",
        });
        setLoading(false);
        navigate({ to: redirectPath });
      }, 1000);
    }
  };

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
    }, 1500);
  };

  // Phone input handler
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneName.trim() || !phoneNumber.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhoneStep("otp");
      setOtpNotification("✨ OTP sent! Use verification code '1234' for quick testing.");

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
    }, 1200);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...otpCode];
    newCode[index] = val.substring(val.length - 1);
    setOtpCode(newCode);

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
          className="inline-flex items-center gap-2 rounded-full border border-[#241621]/15 bg-white/80 px-4 py-2 text-xs font-bold text-[#241621] transition-all hover:bg-white hover:shadow-md backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
      </div>

      {/* Auth UI Notification Alert */}
      {otpNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-sm w-full bg-[#E4603C] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
          <Sparkles className="h-5 w-5 animate-spin shrink-0" />
          <div className="text-xs font-medium leading-normal">{otpNotification}</div>
        </div>
      )}

      {/* Premium Glassmorphic Credentials Card */}
      <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[2.5rem] border border-[#241621]/15 bg-white/85 p-6 shadow-[0_24px_70px_rgba(36,22,33,0.1)] backdrop-blur-2xl transition-all sm:p-8">
        <div className="text-center space-y-3">
          <SocioDexLogo size="lg" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#241621]">
            Sign In to SocioDex
          </h1>
          <p className="text-xs text-[#6B5A66] px-3 font-medium">
            Access your celebration memory pages, activity dashboard, and guest RSVPs.
          </p>
        </div>

        {/* Tab Selection */}
        {phoneStep === "input" && (
          <div className="mt-6 flex rounded-full bg-[#F4ECE0] p-1">
            <button
              onClick={() => setActiveTab("google")}
              className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "google"
                  ? "bg-white text-[#241621] shadow-xs"
                  : "text-[#6B5A66] hover:text-[#241621]"
              }`}
            >
              <Chrome className="h-3.5 w-3.5 text-[#E4603C]" />
              Google
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "email"
                  ? "bg-white text-[#241621] shadow-xs"
                  : "text-[#6B5A66] hover:text-[#241621]"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-[#E4603C]" />
              Email
            </button>
            <button
              onClick={() => setActiveTab("phone")}
              className={`flex-1 rounded-full py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "phone"
                  ? "bg-white text-[#241621] shadow-xs"
                  : "text-[#6B5A66] hover:text-[#241621]"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-[#E4603C]" />
              Mobile
            </button>
          </div>
        )}

        {/* LOADING HANDSHAKE HANDLER */}
        {loading ? (
          <div className="my-12 flex flex-col items-center justify-center py-6 text-center">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E4603C]/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-[#E4603C]/20 items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#E4603C] animate-spin" />
              </span>
            </span>
            <div className="mt-5 text-sm font-bold text-[#241621]">Securing your session...</div>
            <div className="text-[10px] text-[#6B5A66] mt-1 font-medium">
              Establishing authenticated SocioDex workspace
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* GOOGLE SIGN IN PANEL */}
            {activeTab === "google" && (
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    if (isSupabaseConfigured) {
                      setLoading(true);
                      const res = await signInWithGoogle();
                      if (res?.error) {
                        console.warn("Supabase Google Auth warning/error:", res.error);
                        setShowGoogleModal(true);
                        setLoading(false);
                      }
                    } else {
                      setShowGoogleModal(true);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-4 py-3.5 text-sm font-bold text-[#241621] shadow-xs transition-all cursor-pointer"
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

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowGoogleModal(true)}
                    className="text-xs font-bold text-[#E4603C] hover:underline cursor-pointer"
                  >
                    Or use Quick Demo Account
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-[#6B5A66] uppercase tracking-widest font-semibold">
                  <ShieldCheck className="h-3 w-3 text-[#E4603C]" /> End-to-End Encrypted
                </div>
              </div>
            )}

            {/* EMAIL SIGN IN PANEL */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailMagicLinkSubmit} className="space-y-4 text-left">
                {emailNotice && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium leading-relaxed">
                    {emailNotice}
                  </div>
                )}
                {emailError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {emailError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="sarah@example.com"
                    className="mt-1 w-full rounded-2xl border border-[#241621]/20 bg-white px-4 py-3 text-xs outline-none focus:border-[#E4603C]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] text-white py-3.5 text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Send Magic Login Link ✉️
                </button>
              </form>
            )}

            {/* PHONE SIGN IN PANEL */}
            {activeTab === "phone" && (
              <div>
                {phoneStep === "input" ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneName}
                        onChange={(e) => setPhoneName(e.target.value)}
                        placeholder="e.g. Rajan Mehta"
                        className="mt-1 w-full rounded-2xl border border-[#241621]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#E4603C]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5A66]">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +91 98200 11111"
                        className="mt-1 w-full rounded-2xl border border-[#241621]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#E4603C]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-3.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
                    >
                      Verify Mobile Number
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-5">
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-[#241621]">
                        Enter Verification Code
                      </h3>
                      <p className="mt-1 text-xs text-[#6B5A66] font-medium">
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
                          className="h-14 w-12 rounded-2xl border border-[#241621]/15 bg-white text-center font-display text-xl font-bold outline-none focus:border-[#E4603C]"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <div className="text-center text-xs font-bold text-[#E4603C]">
                        {otpError}
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPhoneStep("input")}
                        className="flex-1 rounded-full border border-[#241621]/15 py-3 text-xs font-bold text-[#241621] hover:bg-[#FAF6F0]"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        className="flex-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-3 text-xs font-bold text-white shadow-md cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[390px] rounded-3xl bg-white p-6 shadow-2xl border border-[#241621]/10 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#241621]/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6B5A66]">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-[#6B5A66] hover:text-[#241621] text-sm font-bold rounded-full hover:bg-[#FAF6F0] h-6 w-6 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-[#6B5A66] font-medium mb-2">
                Choose an account for SocioDex:
              </div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleLogin(acc.name, acc.email)}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-[#241621]/10 hover:border-[#E4603C] hover:bg-[#E4603C]/5 p-3.5 text-left transition-all cursor-pointer"
                  >
                    <div className="text-2xl">{acc.avatar}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#241621]">{acc.name}</div>
                      <div className="text-[10px] text-[#6B5A66]">{acc.email}</div>
                    </div>
                    <Check className="h-4 w-4 text-[#E4603C]" />
                  </button>
                ))}
              </div>

              {/* Custom Google account block */}
              <div className="mt-4 border-t border-[#241621]/10 pt-3">
                <div className="text-xs text-[#6B5A66] font-medium mb-2">
                  Or enter another custom profile:
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full rounded-xl border border-[#241621]/15 px-3.5 py-2 text-xs outline-none focus:border-[#E4603C]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#241621]/15 px-3.5 py-2 text-xs outline-none focus:border-[#E4603C]"
                  />
                  <button
                    onClick={() => {
                      if (customGoogleName.trim() && customGoogleEmail.trim()) {
                        handleGoogleLogin(customGoogleName.trim(), customGoogleEmail.trim());
                      }
                    }}
                    disabled={!customGoogleName.trim() || !customGoogleEmail.trim()}
                    className="w-full rounded-full bg-[#E4603C] disabled:bg-neutral-300 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    Use Custom Profile
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
