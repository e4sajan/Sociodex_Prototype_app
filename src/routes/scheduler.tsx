import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { useStore, type ScheduledMemoryJob, type MemoryData } from "@/lib/store";
import { OCCASIONS, THEMES } from "@/lib/data";
import {
  loadAutonomousApiConfig,
  saveAutonomousApiConfig,
  sendAutonomousWhatsApp,
  sendAutonomousEmail,
  type AutonomousApiConfig,
  type DispatchResult,
} from "@/lib/autonomousDeliveryEngine";
import {
  Calendar,
  Clock,
  Upload,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Sparkles,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  ExternalLink,
  Share2,
  Check,
  X,
  Play,
  Building2,
  User,
  Phone,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  Bell,
  Copy,
  Zap,
  Globe,
  Settings,
  Key,
  Terminal,
  Server,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scheduler")({
  head: () => ({
    meta: [
      { title: "Automated Memory Page Scheduler — SocioDex" },
      {
        name: "description",
        content:
          "Automate celebration memory pages for birthdays, weddings, anniversaries, and corporate employee milestones with 1-day advance reminders and 100% autonomous WhatsApp/Email auto-dispatch.",
      },
    ],
  }),
  component: SchedulerPage,
});

// CSV Sample Data for Download & Demo
const SAMPLE_CSV_TEMPLATE = `Employee Name,Occasion Type,Event Date,WhatsApp Number,Email Address,Department,Organizer Name,Custom Greeting Note
Priya Sharma,Birthday Celebration,2026-08-28,+919876543210,priya.sharma@acme.corp,Product Design,Acme People Team,Happy Birthday Priya! Wishing you a sensational year filled with creativity and joy! 🎉
Arjun Verma,3rd Work Anniversary,2026-09-02,+919812345678,arjun.verma@acme.corp,Core Engineering,HR Culture Team,Congratulations Arjun on 3 stellar years with Acme! Thank you for your leadership! 🚀
Sarah Lin,Farewell Celebration,2026-09-10,+14155550192,sarah.lin@acme.corp,Marketing & Growth,David Kim,Wishing you the absolute best in your next chapter Sarah! You will be missed! 🌸
Vikram Mehta,Birthday Celebration,2026-09-18,+919833344455,vikram.mehta@acme.corp,Operations,Acme People Team,Wishing you a fantastic birthday Vikram! Have a wonderful celebration! 🎂
Ananya Roy,Promotion Milestone,2026-09-25,+919877788899,ananya.roy@acme.corp,Data & AI,Engineering Lead,Kudos on your well-deserved promotion Ananya! So proud of your achievements! 🌟`;

// ── DELIVERY HELPER UTILITIES ──

function cleanPhoneNumber(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
}

function getKeepsakeUrl(slug?: string): string {
  if (!slug) return "https://sociodex.app/m/preview";
  if (typeof window !== "undefined") {
    return `${window.location.origin}/m/${slug}`;
  }
  return `https://sociodex.app/m/${slug}`;
}

function generateWhatsAppMessage(job: ScheduledMemoryJob, slug?: string): string {
  const url = getKeepsakeUrl(slug || job.createdMemorySlug);
  return `🎉 *Happy ${job.occasion}, ${job.recipient}!* 🎂

Your team at *${job.organizerName || "SocioDex"}* has created a living digital keepsake just for you!

💌 *Open your Memory Page & Wishes:*
${url}

✨ Read personal wishes, view team photos, and relive memories. Scan the QR or click above to open!`;
}

function generateEmailSubject(job: ScheduledMemoryJob): string {
  return `🎉 Celebrate ${job.recipient}'s ${job.occasion} with SocioDex!`;
}

function generateEmailBody(job: ScheduledMemoryJob, slug?: string): string {
  const url = getKeepsakeUrl(slug || job.createdMemorySlug);
  return `Hi ${job.recipient},

We have created a living digital memory page to celebrate your ${job.occasion}!

💌 Open your living memory page and view all wishes & photos:
${url}

${job.customNote ? `"${job.customNote}"\n\n` : ""}✨ Feel free to add your own memories, leave replies, and share with your loved ones!

Warm wishes,
${job.organizerName || "SocioDex Celebrations"}`;
}

function getWhatsAppDirectUrl(phone?: string, text?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text || "");
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

function getGmailComposeUrl(email?: string, subject?: string, body?: string): string {
  const to = encodeURIComponent(email || "");
  const su = encodeURIComponent(subject || "");
  const b = encodeURIComponent(body || "");
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`;
}

function getMailtoUrl(email?: string, subject?: string, body?: string): string {
  const to = email || "";
  const su = encodeURIComponent(subject || "");
  const b = encodeURIComponent(body || "");
  return `mailto:${to}?subject=${su}&body=${b}`;
}

function SchedulerPage() {
  const currentUser = useStore((s) => s.currentUser);
  const scheduledJobs = useStore((s) => s.scheduledJobs || {});
  const addScheduledJob = useStore((s) => s.addScheduledJob);
  const addScheduledJobsBatch = useStore((s) => s.addScheduledJobsBatch);
  const deleteScheduledJob = useStore((s) => s.deleteScheduledJob);
  const triggerScheduledJobNow = useStore((s) => s.triggerScheduledJobNow);
  const navigate = useNavigate();

  // Active Tab: "individual" (1st Priority) | "corporate" | "queue" | "engine"
  const [activeTab, setActiveTab] = useState<"individual" | "corporate" | "queue" | "engine">("individual");

  // Queue Filter: "all" | "scheduled" | "created"
  const [queueFilter, setQueueFilter] = useState<"all" | "scheduled" | "created">("all");

  // ── INDIVIDUAL FORM STATE (1st Priority) ──
  const [indOccasion, setIndOccasion] = useState(OCCASIONS[0]);
  const [indRecipient, setIndRecipient] = useState("");
  const [indWhatsapp, setIndWhatsapp] = useState("");
  const [indEmail, setIndEmail] = useState("");
  const [indDate, setIndDate] = useState("");
  const [indTime, setIndTime] = useState("09:00");
  const [indOrganizer, setIndOrganizer] = useState(currentUser?.name || "");
  const [indThemeId, setIndThemeId] = useState(THEMES[0].id);
  const [indCustomNote, setIndCustomNote] = useState("");
  const [indNotifyBefore, setIndNotifyBefore] = useState(true);
  const [indAutoDispatch, setIndAutoDispatch] = useState(true);

  // ── CORPORATE SPREADSHEET IMPORT STATE (2nd Priority) ──
  const [importedRows, setImportedRows] = useState<
    Array<{
      id: string;
      name: string;
      occasion: string;
      date: string;
      whatsapp: string;
      email: string;
      department: string;
      organizer: string;
      customNote: string;
      isValid: boolean;
    }>
  >([]);
  const [corpCompanyName, setCorpCompanyName] = useState("Acme Corporation");
  const [corpThemeId, setCorpThemeId] = useState("rose-elegance");
  const [corpNotifyBefore, setCorpNotifyBefore] = useState(true);
  const [corpAutoDispatch, setCorpAutoDispatch] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── AUTONOMOUS API CONFIGURATION STATE (Tab 4) ──
  const [apiConfig, setApiConfig] = useState<AutonomousApiConfig>(loadAutonomousApiConfig);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchResult[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);

  // Direct Self-Test fields
  const [myTestPhone, setMyTestPhone] = useState("");
  const [myTestEmail, setMyTestEmail] = useState(currentUser?.email || "");

  // Modal simulation state
  const [simulationModalJob, setSimulationModalJob] = useState<ScheduledMemoryJob | null>(null);
  const [simulationSlug, setSimulationSlug] = useState<string | null>(null);

  // Browser notifications
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  const handleSaveApiConfig = (newConfig: AutonomousApiConfig) => {
    setApiConfig(newConfig);
    saveAutonomousApiConfig(newConfig);
    toast.success("Autonomous API delivery configuration saved!");
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationsAllowed(perm === "granted");
      if (perm === "granted") {
        toast.success("Browser notifications enabled! You will receive alerts when memory pages are created.");
        new Notification("🎉 SocioDex Notifications Active", {
          body: "You will receive automated celebration reminders and memory links directly on your device!",
          icon: "/sociodex-logo.png",
        });
      }
    }
  };

  // Sorted Jobs Array
  const jobsList = useMemo(() => {
    return Object.values(scheduledJobs).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }, [scheduledJobs]);

  const filteredJobs = useMemo(() => {
    if (queueFilter === "scheduled") return jobsList.filter((j) => j.status === "scheduled");
    if (queueFilter === "created") return jobsList.filter((j) => j.status === "created");
    return jobsList;
  }, [jobsList, queueFilter]);

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sociodex_employee_roster_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample employee CSV template downloaded!");
  };

  // Parse CSV text into row items
  const parseCSVContent = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      toast.error("File is empty or missing data rows.");
      return;
    }

    const rows: typeof importedRows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
      if (cols.length >= 3 && cols[0]) {
        const name = cols[0];
        const occasion = cols[1] || "Birthday Celebration";
        const date = cols[2] || new Date().toISOString().split("T")[0];
        const whatsapp = cols[3] || "";
        const email = cols[4] || "";
        const department = cols[5] || "General";
        const organizer = cols[6] || corpCompanyName || "HR Team";
        const customNote = cols[7] || "";

        rows.push({
          id: `row-${Date.now()}-${i}`,
          name,
          occasion,
          date,
          whatsapp,
          email,
          department,
          organizer,
          customNote,
          isValid: Boolean(name && date),
        });
      }
    }

    setImportedRows(rows);
    toast.success(`Successfully parsed ${rows.length} employee records!`);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSVContent(content);
    };
    reader.readAsText(file);
  };

  const loadDemoRoster = () => {
    parseCSVContent(SAMPLE_CSV_TEMPLATE);
  };

  // Batch Submit Corporate Roster
  const handleScheduleBatch = () => {
    if (importedRows.length === 0) return;

    const newJobs: ScheduledMemoryJob[] = importedRows.map((r) => ({
      id: `job-corp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      occasion: r.occasion,
      recipient: r.name,
      whatsapp: r.whatsapp,
      email: r.email,
      department: r.department,
      organizerName: r.organizer || corpCompanyName,
      eventDate: r.date,
      scheduledTime: "09:00",
      themeId: corpThemeId,
      customNote:
        r.customNote ||
        `Warmest congratulations from all of us at ${corpCompanyName} on your ${r.occasion}! Thank you for being a wonderful part of our team! ✨🎉`,
      notifyOneDayBefore: corpNotifyBefore,
      autoDispatchOnDate: corpAutoDispatch,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      isCorporate: true,
    }));

    addScheduledJobsBatch(newJobs);
    setImportedRows([]);
    toast.success(`Scheduled ${newJobs.length} employee memory pages!`);
    setActiveTab("queue");
  };

  // Submit Individual Event Schedule
  const handleScheduleIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indRecipient.trim() || !indDate) {
      toast.error("Please fill in recipient name and event date.");
      return;
    }

    const newJob: ScheduledMemoryJob = {
      id: `job-ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      occasion: indOccasion,
      recipient: indRecipient.trim(),
      whatsapp: indWhatsapp.trim(),
      email: indEmail.trim(),
      organizerName: indOrganizer.trim() || currentUser?.name || "Organizer",
      eventDate: indDate,
      scheduledTime: indTime,
      themeId: indThemeId,
      customNote: indCustomNote.trim(),
      notifyOneDayBefore: indNotifyBefore,
      autoDispatchOnDate: indAutoDispatch,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      isCorporate: false,
    };

    addScheduledJob(newJob);
    toast.success(`Scheduled automatic page for ${newJob.recipient}!`);

    // Reset form
    setIndRecipient("");
    setIndWhatsapp("");
    setIndEmail("");
    setIndDate("");
    setIndCustomNote("");
    setActiveTab("queue");
  };

  // Instant Trigger & Simulate
  const handleTriggerNow = (job: ScheduledMemoryJob) => {
    const slug = triggerScheduledJobNow(job.id);
    setSimulationModalJob(job);
    setSimulationSlug(slug || job.createdMemorySlug || null);
    toast.success(`Generated live memory page for ${job.recipient}!`);

    // Fire a browser notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(`🎂 Live Memory Page: ${job.recipient}'s ${job.occasion}`, {
        body: `Your memory page is ready! Live link: ${getKeepsakeUrl(slug || job.createdMemorySlug)}`,
        icon: "/sociodex-logo.png",
      });
    }
  };

  // 100% Autonomous Silent Dispatch Action (Trigger Real REST APIs without human opening chat apps)
  const handleExecuteAutonomousSilentDispatch = async (job?: ScheduledMemoryJob) => {
    const targetJob = job || simulationModalJob || jobsList[0];
    if (!targetJob) {
      toast.error("No scheduled event to dispatch.");
      return;
    }

    setIsDispatching(true);
    const targetSlug = targetJob.createdMemorySlug || triggerScheduledJobNow(targetJob.id) || "celebration-preview";
    const waText = generateWhatsAppMessage(targetJob, targetSlug);
    const emailSub = generateEmailSubject(targetJob);
    const emailBody = generateEmailBody(targetJob, targetSlug);

    const newLogs: DispatchResult[] = [];

    // 1. WhatsApp Autonomous Dispatch
    const targetPhone = myTestPhone.trim() || targetJob.whatsapp;
    if (targetPhone) {
      const waResult = await sendAutonomousWhatsApp(targetPhone, waText, apiConfig);
      newLogs.push(waResult);
      if (waResult.success) {
        toast.success(`[WhatsApp API] ${waResult.details}`);
      } else {
        toast.error(`[WhatsApp API] ${waResult.details}`);
      }
    }

    // 2. Email Autonomous Dispatch
    const targetEmail = myTestEmail.trim() || targetJob.email;
    if (targetEmail) {
      const emailResult = await sendAutonomousEmail(targetEmail, emailSub, emailBody, apiConfig);
      newLogs.push(emailResult);
      if (emailResult.success) {
        toast.success(`[Email API] ${emailResult.details}`);
      } else {
        toast.error(`[Email API] ${emailResult.details}`);
      }
    }

    setDispatchLogs((prev) => [...newLogs, ...prev]);
    setIsDispatching(false);
  };

  const handleOpenSimulation = (job: ScheduledMemoryJob) => {
    setSimulationModalJob(job);
    setSimulationSlug(job.createdMemorySlug || null);
  };

  const generateWishTemplate = () => {
    const recipient = indRecipient.trim() || "our friend";
    setIndCustomNote(
      `Happy ${indOccasion}, ${recipient}! 🥳 Wishing you endless happiness, good health, and immense success. So excited to celebrate this milestone with you! 🥂✨`
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:py-8 sm:px-6">
      {/* ── HEADER ── */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#241621]/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E4603C] flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Automated Memory Page Scheduler
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#241621]">
            Auto-Schedule Celebrations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#594855] max-w-2xl">
            Schedule celebration page creation ahead of time with <strong>100% Autonomous Zero-Touch Dispatch</strong> via
            Twilio/Meta WhatsApp APIs, Resend Email APIs, and instant client deep-links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!notificationsAllowed && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4603C]/30 bg-[#E4603C]/10 text-[#E4603C] px-3.5 py-2 text-xs font-bold hover:bg-[#E4603C] hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("queue")}
            className="inline-flex items-center gap-2 rounded-full border border-[#241621]/15 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#241621] hover:bg-[#FAF6F0] hover:text-[#E4603C] transition-all cursor-pointer shadow-xs select-none"
          >
            <Calendar className="h-4 w-4 text-[#E4603C]" />
            <span>Scheduled Queue ({jobsList.length})</span>
          </button>
        </div>
      </div>

      {/* ── 4 TABS BAR (Individual 1st, Corporate 2nd, Queue 3rd, 100% API Setup 4th) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {/* 1ST TAB: INDIVIDUAL EVENT SCHEDULER (DEFAULT / PRIMARY) */}
        <button
          onClick={() => setActiveTab("individual")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex items-start gap-3.5 ${
            activeTab === "individual"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-[#E4603C]/10 text-[#E4603C] flex items-center justify-center shrink-0 text-xl">
            ✨
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
                1. Individual
              </span>
              <span className="text-[10px] font-bold bg-[#E4603C] text-white px-2 py-0.5 rounded-full">
                Primary
              </span>
            </div>
            <div className="font-display text-base font-bold text-[#241621] mt-0.5 truncate">
              Schedule Event Page
            </div>
            <div className="text-[11px] text-[#594855] mt-0.5 leading-tight">
              Schedule birthday, wedding, or anniversary keepsake
            </div>
          </div>
        </button>

        {/* 2ND TAB: CORPORATE EXCEL / CSV BULK IMPORT */}
        <button
          onClick={() => setActiveTab("corporate")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex items-start gap-3.5 ${
            activeTab === "corporate"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-[#EBC85A]/25 text-[#241621] flex items-center justify-center shrink-0 text-xl">
            🏢
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#241621]">
                2. Corporate / HR
              </span>
              <span className="text-[10px] font-bold bg-[#EBC85A] text-[#241621] px-2 py-0.5 rounded-full">
                Excel / CSV
              </span>
            </div>
            <div className="font-display text-base font-bold text-[#241621] mt-0.5 truncate">
              Employee Bulk Import
            </div>
            <div className="text-[11px] text-[#594855] mt-0.5 leading-tight">
              Import employee spreadsheet to auto-schedule team
            </div>
          </div>
        </button>

        {/* 3RD TAB: SCHEDULED AUTOMATION QUEUE */}
        <button
          onClick={() => setActiveTab("queue")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex items-start gap-3.5 ${
            activeTab === "queue"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-[#5C3A50]/15 text-[#5C3A50] flex items-center justify-center shrink-0 text-xl">
            📋
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#594855]">
                3. Automation Queue
              </span>
              <span className="text-[10px] font-bold bg-[#5C3A50] text-white px-2 py-0.5 rounded-full">
                {jobsList.length} Jobs
              </span>
            </div>
            <div className="font-display text-base font-bold text-[#241621] mt-0.5 truncate">
              Scheduled Queue ({jobsList.length})
            </div>
            <div className="text-[11px] text-[#594855] mt-0.5 leading-tight">
              Trigger, send WhatsApp & Email links instantly
            </div>
          </div>
        </button>

        {/* 4TH TAB: 100% AUTONOMOUS ZERO-TOUCH API GATEWAY */}
        <button
          onClick={() => setActiveTab("engine")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex items-start gap-3.5 ${
            activeTab === "engine"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0 text-xl">
            ⚡
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                4. Zero-Touch APIs
              </span>
              <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                100% Auto
              </span>
            </div>
            <div className="font-display text-base font-bold text-[#241621] mt-0.5 truncate">
              WhatsApp & Email APIs
            </div>
            <div className="text-[11px] text-[#594855] mt-0.5 leading-tight">
              Connect Twilio/Resend for silent background dispatch
            </div>
          </div>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: INDIVIDUAL EVENT SCHEDULER (1ST PRIORITY)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "individual" && (
        <form
          onSubmit={handleScheduleIndividual}
          className="rounded-3xl border border-[#241621]/12 bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200"
        >
          <div className="border-b border-[#241621]/10 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
              Individual Event Automation
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#241621]">
              Schedule a Memory Page
            </h2>
            <p className="text-xs text-[#594855] mt-0.5">
              Set up a celebration page in advance. On the event date, live keepsake links are automatically
              prepared and dispatched to the recipient's WhatsApp and Email.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">Occasion Type *</label>
              <select
                value={indOccasion}
                onChange={(e) => setIndOccasion(e.target.value)}
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">Recipient Name *</label>
              <input
                value={indRecipient}
                onChange={(e) => setIndRecipient(e.target.value)}
                placeholder="e.g. Maya Iyer"
                required
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">
                Recipient WhatsApp Number (with Country Code)
              </label>
              <div className="relative">
                <input
                  value={indWhatsapp}
                  onChange={(e) => setIndWhatsapp(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or 9876543210"
                  className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 pl-9 text-xs font-semibold outline-none focus:border-[#E4603C]"
                />
                <Phone className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#594855]" />
              </div>
              <span className="text-[10px] text-[#594855] mt-1 block">
                💡 Enables 1-click WhatsApp chat launch & background Twilio/Meta API dispatch.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">
                Recipient Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={indEmail}
                  onChange={(e) => setIndEmail(e.target.value)}
                  placeholder="e.g. maya@example.com"
                  className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 pl-9 text-xs font-semibold outline-none focus:border-[#E4603C]"
                />
                <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#594855]" />
              </div>
              <span className="text-[10px] text-[#594855] mt-1 block">
                💡 Enables Gmail Web, Mail App & background Resend/Brevo API delivery.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">Event Date *</label>
              <input
                type="date"
                value={indDate}
                onChange={(e) => setIndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1">
                Organizer / Sender Name
              </label>
              <input
                value={indOrganizer}
                onChange={(e) => setIndOrganizer(e.target.value)}
                placeholder="e.g. Neha & Friends"
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#241621] mb-1">Theme</label>
              <div className="flex flex-wrap gap-2.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIndThemeId(t.id)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      indThemeId === t.id
                        ? "border-[#E4603C] ring-2 ring-[#E4603C]/20 bg-white"
                        : "border-[#241621]/15 bg-white hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ background: t.accent }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#241621]">
                  Preset Wish / Welcome Greeting
                </label>
                <button
                  type="button"
                  onClick={generateWishTemplate}
                  className="text-[11px] font-bold text-[#E4603C] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Auto-Generate Greeting
                </button>
              </div>
              <textarea
                value={indCustomNote}
                onChange={(e) => setIndCustomNote(e.target.value)}
                rows={3}
                placeholder="e.g. Wishing you a wonderful birthday filled with joy, health, and laughter! 🥳✨"
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C] resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF6F0] p-4 space-y-2 border border-[#241621]/10 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#241621]">
              <input
                type="checkbox"
                checked={indNotifyBefore}
                onChange={(e) => setIndNotifyBefore(e.target.checked)}
                className="h-4 w-4 rounded accent-[#E4603C]"
              />
              <span>🔔 Send 1-day advance notification to organizer to collect wishes & photos early</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#241621]">
              <input
                type="checkbox"
                checked={indAutoDispatch}
                onChange={(e) => setIndAutoDispatch(e.target.checked)}
                className="h-4 w-4 rounded accent-[#E4603C]"
              />
              <span>
                📱 Automatically generate live memory page and dispatch WhatsApp message + Email on the
                event date
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-8 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Memory Page Creation</span>
            </button>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: CORPORATE EXCEL / CSV BULK IMPORT (2ND PRIORITY)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "corporate" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Upload Zone & Template Actions */}
          <div className="rounded-3xl border border-[#241621]/12 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241621]/10 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
                  Corporate Bulk Engine
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#241621]">
                  Import Employee Roster (Excel / CSV)
                </h2>
                <p className="text-xs text-[#594855] mt-0.5">
                  Upload an Excel (`.xlsx`, `.xls`) or `.csv` spreadsheet containing employee names,
                  occasions, dates, and WhatsApp/Email details.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#241621]/15 bg-[#FFFDF9] hover:bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#241621] transition cursor-pointer shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-[#E4603C]" />
                  <span>Download Sample Template (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={loadDemoRoster}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#EBC85A]/20 hover:bg-[#EBC85A]/35 text-[#241621] border border-[#EBC85A]/40 px-3.5 py-2 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#241621]" />
                  <span>Load Demo Company (5 Employees)</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Target */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, text/csv"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-[#E4603C] bg-[#E4603C]/5"
                  : "border-[#241621]/20 bg-[#FAF6F0]/40 hover:border-[#E4603C]/60 hover:bg-[#FAF6F0]"
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-white border border-[#241621]/10 flex items-center justify-center text-3xl shadow-xs">
                📊
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#241621]">
                  Click to browse or drag & drop employee spreadsheet
                </h3>
                <p className="text-xs text-[#594855] mt-1">
                  Supported formats: CSV, Excel (.xlsx, .xls). Columns are auto-detected.
                </p>
              </div>
            </div>
          </div>

          {/* Parsed Preview Table & Configuration */}
          {importedRows.length > 0 && (
            <div className="rounded-3xl border border-[#241621]/12 bg-white p-6 shadow-xs space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241621]/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
                    Review & Batch Schedule
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#241621]">
                    Parsed Employee Roster ({importedRows.length} Events)
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setImportedRows([])}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Roster
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#241621]/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] text-[#594855] font-bold border-b border-[#241621]/10">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Occasion</th>
                      <th className="p-3">Event Date</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#241621]/5 bg-white">
                    {importedRows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-[#FFFDF9]">
                        <td className="p-3 font-bold text-[#594855]">{i + 1}</td>
                        <td className="p-3 font-bold text-[#241621]">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-[#E4603C]/10 text-[#E4603C] font-bold flex items-center justify-center text-[10px]">
                              {r.name[0]}
                            </span>
                            <span>{r.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#241621]">{r.occasion}</td>
                        <td className="p-3 text-[#594855] font-medium">
                          {new Date(r.date).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#241621]">
                          {r.whatsapp || "—"}
                        </td>
                        <td className="p-3 text-[#594855] truncate max-w-[150px]">
                          {r.email || "—"}
                        </td>
                        <td className="p-3 text-[#594855]">
                          <span className="bg-[#FAF6F0] px-2 py-0.5 rounded-md text-[10px] font-semibold text-[#241621]">
                            {r.department}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setImportedRows((prev) => prev.filter((item) => item.id !== r.id))
                            }
                            className="p-1 rounded-full text-[#594855] hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Automation Rules Configuration */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#241621]/10 p-5 space-y-4">
                <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5">
                  ⚙️ Corporate Automation Settings
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#241621] mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      value={corpCompanyName}
                      onChange={(e) => setCorpCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-[#E4603C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#241621] mb-1">
                      Default Keepsake Theme
                    </label>
                    <select
                      value={corpThemeId}
                      onChange={(e) => setCorpThemeId(e.target.value)}
                      className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-[#E4603C]"
                    >
                      {THEMES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#241621]/10">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#241621]">
                    <input
                      type="checkbox"
                      checked={corpNotifyBefore}
                      onChange={(e) => setCorpNotifyBefore(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#E4603C]"
                    />
                    <span>
                      🔔 Notify HR & Team 1 day in advance via WhatsApp / Email so coworkers can upload
                      wishes early
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#241621]">
                    <input
                      type="checkbox"
                      checked={corpAutoDispatch}
                      onChange={(e) => setCorpAutoDispatch(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#E4603C]"
                    />
                    <span>
                      📱 Automatically generate live memory page and dispatch WhatsApp/Email delivery links
                      for employee on event day
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleScheduleBatch}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-8 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Entire Employee Roster ({importedRows.length} Events)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: SCHEDULED AUTOMATION QUEUE (3RD PRIORITY)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "queue" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Queue Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#241621]/10 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#594855] uppercase tracking-wider px-2">
                Filter:
              </span>
              <button
                onClick={() => setQueueFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  queueFilter === "all"
                    ? "bg-[#241621] text-white"
                    : "bg-[#FAF6F0] text-[#594855] hover:bg-neutral-200"
                }`}
              >
                All ({jobsList.length})
              </button>
              <button
                onClick={() => setQueueFilter("scheduled")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  queueFilter === "scheduled"
                    ? "bg-[#E4603C] text-white"
                    : "bg-[#FAF6F0] text-[#594855] hover:bg-neutral-200"
                }`}
              >
                Scheduled ({jobsList.filter((j) => j.status === "scheduled").length})
              </button>
              <button
                onClick={() => setQueueFilter("created")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  queueFilter === "created"
                    ? "bg-green-700 text-white"
                    : "bg-[#FAF6F0] text-[#594855] hover:bg-neutral-200"
                }`}
              >
                Created / Live ({jobsList.filter((j) => j.status === "created").length})
              </button>
            </div>

            <div className="text-[11px] text-[#594855] font-medium px-2">
              💡 Click <strong>"Trigger & Create Now"</strong> to instantly generate the live page &
              dispatch via WhatsApp / Email.
            </div>
          </div>

          {/* Scheduled Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => {
              const eventDateObj = new Date(job.eventDate);
              const isCreated = job.status === "created";
              const slug = job.createdMemorySlug;
              const waText = generateWhatsAppMessage(job, slug);
              const waUrl = getWhatsAppDirectUrl(job.whatsapp, waText);
              const emailSubject = generateEmailSubject(job);
              const emailBody = generateEmailBody(job, slug);
              const gmailUrl = getGmailComposeUrl(job.email, emailSubject, emailBody);

              return (
                <div
                  key={job.id}
                  className={`rounded-3xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                    isCreated
                      ? "bg-[#FFFDF9] border-green-600/40 ring-1 ring-green-600/20"
                      : "bg-white border-[#241621]/12 hover:border-[#E4603C]/40"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            isCreated
                              ? "bg-green-100 text-green-800"
                              : "bg-[#E4603C]/10 text-[#E4603C]"
                          }`}
                        >
                          {isCreated ? "✓ Live & Created" : "⏱ Scheduled"}
                        </span>
                        {job.isCorporate && (
                          <span className="text-[10px] font-bold bg-[#EBC85A]/25 text-[#241621] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> Corporate
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-[#594855] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#E4603C]" />
                        {eventDateObj.toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Occasion & Recipient */}
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#241621] leading-tight">
                        {job.recipient}
                      </h3>
                      <div className="text-xs text-[#594855] font-semibold mt-0.5">
                        {job.occasion}{" "}
                        {job.department && (
                          <span className="text-[#8C7A87]">· {job.department}</span>
                        )}
                      </div>
                    </div>

                    {/* Contact & Notification Rules */}
                    <div className="rounded-xl bg-[#FAF6F0]/70 p-3 text-xs space-y-1.5 text-[#594855]">
                      {job.whatsapp && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <Phone className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            <span className="font-bold text-[#241621]">WhatsApp:</span> {job.whatsapp}
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 hover:underline bg-green-50 px-2 py-0.5 rounded-md border border-green-200"
                          >
                            <Send className="h-2.5 w-2.5" /> Send Chat
                          </a>
                        </div>
                      )}
                      {job.email && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <Mail className="h-3.5 w-3.5 text-[#E4603C] shrink-0" />
                            <span className="font-bold text-[#241621]">Email:</span> {job.email}
                          </div>
                          <a
                            href={gmailUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E4603C] hover:underline bg-[#E4603C]/10 px-2 py-0.5 rounded-md border border-[#E4603C]/20"
                          >
                            <Mail className="h-2.5 w-2.5" /> Gmail Send
                          </a>
                        </div>
                      )}
                      {job.notifyOneDayBefore && (
                        <div className="text-[11px] text-[#E4603C] font-bold flex items-center gap-1 pt-1 border-t border-[#241621]/5">
                          🔔 1-Day Advance Reminder Scheduled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-[#241621]/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {!isCreated ? (
                        <button
                          type="button"
                          onClick={() => handleTriggerNow(job)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-95"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>Trigger & Create Now</span>
                        </button>
                      ) : (
                        <a
                          href={`/m/${job.createdMemorySlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-green-700 hover:bg-green-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        >
                          <span>View Live Page</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenSimulation(job)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-3 py-1.5 text-xs font-bold text-[#241621] transition cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3 w-3 text-green-600" />
                        <span>Direct Delivery Options</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteScheduledJob(job.id)}
                      title="Delete scheduled job"
                      className="p-2 rounded-full text-[#594855] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="col-span-2 rounded-3xl border border-dashed border-[#241621]/20 p-10 text-center bg-white shadow-xs">
                <Calendar className="mx-auto h-8 w-8 text-[#E4603C] mb-2 animate-bounce" />
                <h3 className="font-display text-base font-bold text-[#241621]">
                  No scheduled memory pages in this filter
                </h3>
                <p className="text-xs text-[#594855] mt-1 max-w-sm mx-auto">
                  Use the tabs above to schedule an individual event or upload a corporate employee roster.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: 100% AUTONOMOUS ZERO-TOUCH API GATEWAY & SETUP     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "engine" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Explainer Hero */}
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-[#FAF5FF] to-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> 100% Autonomous Zero-Touch Architecture
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#241621] mt-0.5">
                  How 100% Zero-Touch Automation Works
                </h2>
                <p className="text-xs text-[#594855] mt-1 max-w-2xl">
                  To send messages completely silently in the background <strong>without human intervention</strong> (no clicking links, no opening WhatsApp apps), the system calls server-side REST APIs on the scheduled date & time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  <Server className="h-3.5 w-3.5" /> REST API Gateway
                </span>
              </div>
            </div>

            {/* 3 Core Pillars of Full Automation */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  📱
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">1. WhatsApp REST API</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  Requires <strong>Twilio WhatsApp API</strong>, <strong>Meta WhatsApp Cloud API</strong>, or <strong>Green API</strong>.
                  The server sends an HTTP POST request to deliver the message directly to the recipient's phone silently.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-[#E4603C]/15 text-[#E4603C] flex items-center justify-center font-bold text-sm">
                  ✉️
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">2. Transactional Email API</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  Requires <strong>Resend</strong> (3,000 free emails/month), <strong>Brevo</strong>, or <strong>SendGrid</strong>.
                  Dispatches HTML keepsake invitation emails directly to the inbox without needing mail apps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  🕒
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">3. Background Cron Job</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  A scheduled background runner (e.g. <strong>Supabase Edge Function</strong>, <strong>Vercel Cron</strong>, or <strong>GitHub Actions</strong>) wakes up daily at 9:00 AM, checks scheduled dates, and calls the APIs.
                </p>
              </div>
            </div>
          </div>

          {/* API Credentials Configuration Panel */}
          <div className="rounded-3xl border border-[#241621]/12 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#241621]/10 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-700" />
                <div>
                  <h3 className="font-display text-lg font-bold text-[#241621]">
                    API Credentials & Provider Configuration
                  </h3>
                  <p className="text-xs text-[#594855]">
                    Configure your keys below to switch from sandbox simulation to real silent delivery.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveApiConfig(apiConfig)}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 hover:bg-purple-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Save API Settings</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* WhatsApp Provider Config */}
              <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#241621]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-2">
                    <span className="text-base">📱</span> WhatsApp Background Provider
                  </h4>
                  <span className="text-[10px] font-bold uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {apiConfig.whatsappProvider}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241621] mb-1">Select Provider</label>
                  <select
                    value={apiConfig.whatsappProvider}
                    onChange={(e) =>
                      setApiConfig({ ...apiConfig, whatsappProvider: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-purple-600"
                  >
                    <option value="demo">Demo Sandbox Simulator (Built-in)</option>
                    <option value="twilio">Twilio WhatsApp API (Recommended)</option>
                    <option value="greenapi">Green API (Direct WhatsApp QR Gateway)</option>
                    <option value="webhook">Custom Webhook (Zapier / Make / n8n / Supabase)</option>
                  </select>
                </div>

                {apiConfig.whatsappProvider === "twilio" && (
                  <div className="space-y-3 pt-2 border-t border-[#241621]/10">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Twilio Account SID</label>
                      <input
                        value={apiConfig.twilioAccountSid || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, twilioAccountSid: e.target.value })}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Twilio Auth Token</label>
                      <input
                        type="password"
                        value={apiConfig.twilioAuthToken || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, twilioAuthToken: e.target.value })}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Twilio From Number</label>
                      <input
                        value={apiConfig.twilioFromNumber || "+14155238886"}
                        onChange={(e) => setApiConfig({ ...apiConfig, twilioFromNumber: e.target.value })}
                        placeholder="+14155238886 (Sandbox)"
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                {apiConfig.whatsappProvider === "greenapi" && (
                  <div className="space-y-3 pt-2 border-t border-[#241621]/10">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Instance ID</label>
                      <input
                        value={apiConfig.greenApiInstanceId || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, greenApiInstanceId: e.target.value })}
                        placeholder="1101823..."
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">API Token</label>
                      <input
                        type="password"
                        value={apiConfig.greenApiToken || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, greenApiToken: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                {apiConfig.whatsappProvider === "webhook" && (
                  <div className="pt-2 border-t border-[#241621]/10">
                    <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Webhook URL</label>
                    <input
                      value={apiConfig.customWebhookUrl || ""}
                      onChange={(e) => setApiConfig({ ...apiConfig, customWebhookUrl: e.target.value })}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                    />
                  </div>
                )}
              </div>

              {/* Email Provider Config */}
              <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#241621]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-2">
                    <span className="text-base">✉️</span> Email Background Provider
                  </h4>
                  <span className="text-[10px] font-bold uppercase bg-orange-100 text-[#E4603C] px-2 py-0.5 rounded-full">
                    {apiConfig.emailProvider}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241621] mb-1">Select Provider</label>
                  <select
                    value={apiConfig.emailProvider}
                    onChange={(e) => setApiConfig({ ...apiConfig, emailProvider: e.target.value as any })}
                    className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-purple-600"
                  >
                    <option value="demo">Demo Sandbox Simulator (Built-in)</option>
                    <option value="resend">Resend API (Recommended — Free 3,000/mo)</option>
                    <option value="brevo">Brevo (Sendinblue) API</option>
                  </select>
                </div>

                {apiConfig.emailProvider === "resend" && (
                  <div className="space-y-3 pt-2 border-t border-[#241621]/10">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Resend API Key</label>
                      <input
                        type="password"
                        value={apiConfig.resendApiKey || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, resendApiKey: e.target.value })}
                        placeholder="re_123456789..."
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">From Sender Email</label>
                      <input
                        value={apiConfig.resendFromEmail || "onboarding@resend.dev"}
                        onChange={(e) => setApiConfig({ ...apiConfig, resendFromEmail: e.target.value })}
                        placeholder="onboarding@resend.dev or celebrations@yourdomain.com"
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                {apiConfig.emailProvider === "brevo" && (
                  <div className="space-y-3 pt-2 border-t border-[#241621]/10">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Brevo API Key</label>
                      <input
                        type="password"
                        value={apiConfig.brevoApiKey || ""}
                        onChange={(e) => setApiConfig({ ...apiConfig, brevoApiKey: e.target.value })}
                        placeholder="xkeysib-..."
                        className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Zero-Touch Silent Dispatch Tester */}
          <div className="rounded-3xl border border-[#241621]/12 bg-[#FFFDF9] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#241621]/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  Live Dispatch Simulation & Real API Trigger
                </span>
                <h3 className="font-display text-xl font-bold text-[#241621]">
                  Test 100% Silent Background Dispatch Right Now
                </h3>
                <p className="text-xs text-[#594855]">
                  Test sending to your own WhatsApp number & Email address with zero human intervention.
                </p>
              </div>

              <button
                type="button"
                disabled={isDispatching}
                onClick={() => handleExecuteAutonomousSilentDispatch()}
                className="inline-flex items-center gap-2 rounded-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>{isDispatching ? "Dispatching APIs..." : "⚡ Trigger 100% Silent Dispatch"}</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#241621] mb-1">
                  Target WhatsApp Number (with Country Code)
                </label>
                <input
                  value={myTestPhone}
                  onChange={(e) => setMyTestPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241621] mb-1">
                  Target Email Address
                </label>
                <input
                  type="email"
                  value={myTestEmail}
                  onChange={(e) => setMyTestEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Live API Response Console Logs */}
            {dispatchLogs.length > 0 && (
              <div className="rounded-2xl bg-[#1E141D] text-white p-4 space-y-2 border border-black/20 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-700 pb-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-green-400">
                    <Terminal className="h-3.5 w-3.5" /> API Dispatch Log Stream
                  </span>
                  <button
                    onClick={() => setDispatchLogs([])}
                    className="text-neutral-400 hover:text-white text-[10px] cursor-pointer"
                  >
                    Clear Console
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                  {dispatchLogs.map((log, index) => (
                    <div key={index} className="text-[11px] leading-relaxed">
                      <span className="text-neutral-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                      <span
                        className={`font-bold ${
                          log.success ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        [{log.channel.toUpperCase()} · {log.provider}]
                      </span>{" "}
                      <span className="text-neutral-300">To: {log.recipient}</span> —{" "}
                      <span className={log.success ? "text-neutral-100" : "text-red-300"}>
                        {log.details}
                      </span>
                      {log.messageId && (
                        <span className="text-yellow-300 text-[10px] block">
                          └ Message SID/ID: {log.messageId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* WHATSAPP & EMAIL MESSAGE DISPATCH MODAL                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {simulationModalJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSimulationModalJob(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white border border-[#241621]/15 shadow-2xl p-6 sm:p-7 space-y-5 text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#241621]/10 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  💬
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#241621]">
                    Direct Memory Link Dispatch
                  </h3>
                  <p className="text-[11px] text-[#594855]">
                    Recipient: {simulationModalJob.recipient} · {simulationModalJob.whatsapp || simulationModalJob.email || "Contact ready"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimulationModalJob(null)}
                className="p-1 rounded-full text-[#594855] hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="rounded-2xl bg-[#E5DDD5] p-4 space-y-2 border border-black/10 shadow-inner">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm space-y-2 text-xs text-[#241621] max-w-sm">
                <p className="font-bold text-[#E4603C]">
                  🎉 Happy {simulationModalJob.occasion}, {simulationModalJob.recipient}! 🎂
                </p>
                <p className="text-[#594855] leading-relaxed">
                  Your team at{" "}
                  <strong>{simulationModalJob.organizerName || "SocioDex"}</strong> has created a
                  special digital memory page to celebrate this special day!
                </p>
                {simulationModalJob.customNote && (
                  <p className="italic bg-[#FFFDF9] p-2 rounded-lg border border-[#241621]/10 text-[11px]">
                    "{simulationModalJob.customNote}"
                  </p>
                )}
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E4603C]/20 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#E4603C]">
                    💌 Open Living Keepsake
                  </div>
                  <div className="font-mono text-[11px] text-blue-700 font-semibold underline truncate">
                    {getKeepsakeUrl(simulationSlug || simulationModalJob.createdMemorySlug)}
                  </div>
                </div>
                <div className="text-[9px] text-[#8C7A87] text-right">09:00 AM · ✓✓ Delivered</div>
              </div>
            </div>

            {/* Direct 1-Click Action Buttons */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                🚀 Delivery Channels:
              </div>

              {/* 100% Autonomous Silent Trigger Button */}
              <button
                type="button"
                onClick={() => handleExecuteAutonomousSilentDispatch(simulationModalJob)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 hover:bg-purple-800 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-98"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>⚡ Fire 100% Autonomous Silent Dispatch (APIs)</span>
              </button>

              {/* WhatsApp Action */}
              <a
                href={getWhatsAppDirectUrl(
                  simulationModalJob.whatsapp,
                  generateWhatsAppMessage(
                    simulationModalJob,
                    simulationSlug || simulationModalJob.createdMemorySlug
                  )
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-98"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open & Send via WhatsApp Chat (wa.me)</span>
              </a>

              {/* Email Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={getGmailComposeUrl(
                    simulationModalJob.email,
                    generateEmailSubject(simulationModalJob),
                    generateEmailBody(
                      simulationModalJob,
                      simulationSlug || simulationModalJob.createdMemorySlug
                    )
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send via Gmail Web</span>
                </a>

                <a
                  href={getMailtoUrl(
                    simulationModalJob.email,
                    generateEmailSubject(simulationModalJob),
                    generateEmailBody(
                      simulationModalJob,
                      simulationSlug || simulationModalJob.createdMemorySlug
                    )
                  )}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] py-2.5 text-xs font-bold text-[#241621] transition cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-[#594855]" />
                  <span>Open in Mail App</span>
                </a>
              </div>

              <div className="flex gap-2 pt-1 border-t border-[#241621]/10">
                <button
                  type="button"
                  onClick={() => {
                    const text = generateWhatsAppMessage(
                      simulationModalJob,
                      simulationSlug || simulationModalJob.createdMemorySlug
                    );
                    navigator.clipboard.writeText(text);
                    toast.success("WhatsApp message copied to clipboard!");
                  }}
                  className="flex-1 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] py-2.5 text-xs font-bold text-[#241621] transition cursor-pointer"
                >
                  Copy Message Text
                </button>

                {(simulationSlug || simulationModalJob.createdMemorySlug) && (
                  <a
                    href={`/m/${simulationSlug || simulationModalJob.createdMemorySlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#241621] hover:bg-black py-2.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <span>Open Live Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
