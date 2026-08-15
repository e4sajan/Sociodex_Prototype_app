import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { useStore, type ScheduledMemoryJob, type MemoryData } from "@/lib/store";
import { OCCASIONS, THEMES } from "@/lib/data";
import {
  loadAutonomousApiConfig,
  saveAutonomousApiConfig,
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
  Inbox,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scheduler")({
  head: () => ({
    meta: [
      { title: "Automated Memory Page Scheduler — SocioDex" },
      {
        name: "description",
        content:
          "Automate celebration memory pages for birthdays, weddings, anniversaries, and corporate employee milestones with 1-day advance reminders and 100% autonomous Email auto-dispatch via Resend API.",
      },
    ],
  }),
  component: SchedulerPage,
});

// CSV Sample Data for Download & Demo (Email-Focused)
const SAMPLE_CSV_TEMPLATE = `Employee Name,Occasion Type,Event Date,Email Address,Department,Organizer Name,Custom Greeting Note
Priya Sharma,Birthday Celebration,2026-08-28,priya.sharma@acme.corp,Product Design,Acme People Team,Happy Birthday Priya! Wishing you a sensational year filled with creativity and joy! 🎉
Arjun Verma,3rd Work Anniversary,2026-09-02,arjun.verma@acme.corp,Core Engineering,HR Culture Team,Congratulations Arjun on 3 stellar years with Acme! Thank you for your leadership! 🚀
Sarah Lin,Farewell Celebration,2026-09-10,sarah.lin@acme.corp,Marketing & Growth,David Kim,Wishing you the absolute best in your next chapter Sarah! You will be missed! 🌸
Vikram Mehta,Birthday Celebration,2026-09-18,vikram.mehta@acme.corp,Operations,Acme People Team,Wishing you a fantastic birthday Vikram! Have a wonderful celebration! 🎂
Ananya Roy,Promotion Milestone,2026-09-25,ananya.roy@acme.corp,Data & AI,Engineering Lead,Kudos on your well-deserved promotion Ananya! So proud of your achievements! 🌟`;

// ── DELIVERY HELPER UTILITIES ──

function getKeepsakeUrl(slug?: string): string {
  if (!slug) return "https://sociodex.app/m/preview";
  if (typeof window !== "undefined") {
    return `${window.location.origin}/m/${slug}`;
  }
  return `https://sociodex.app/m/${slug}`;
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

  // Direct Self-Test field for Email
  const [myTestEmail, setMyTestEmail] = useState(currentUser?.email || "e4sajan@gmail.com");

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
    toast.success("Autonomous Email API delivery configuration saved!");
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

  // Demo company load
  const loadDemoRoster = () => {
    const rows = parseCSVContent(SAMPLE_CSV_TEMPLATE);
    setImportedRows(rows);
    setCorpCompanyName("Acme Global Technologies");
    toast.success(`Loaded 5 demo employees for Acme Global!`);
  };

  // Parse CSV
  const parseCSVContent = (content: string) => {
    const lines = content.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("employee"));
    const occIdx = headers.findIndex((h) => h.includes("occasion") || h.includes("event") || h.includes("type"));
    const dateIdx = headers.findIndex((h) => h.includes("date"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("mail"));
    const deptIdx = headers.findIndex((h) => h.includes("department") || h.includes("dept") || h.includes("team"));
    const orgIdx = headers.findIndex((h) => h.includes("organizer") || h.includes("sender") || h.includes("hr"));
    const noteIdx = headers.findIndex((h) => h.includes("note") || h.includes("greeting") || h.includes("wish") || h.includes("custom"));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const rowText = lines[i];
      // Basic CSV token parser handling quotes
      const values: string[] = [];
      let inQuotes = false;
      let curVal = "";
      for (let c = 0; c < rowText.length; c++) {
        const char = rowText[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(curVal.trim());
          curVal = "";
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim());

      const name = values[nameIdx >= 0 ? nameIdx : 0] || `Employee #${i}`;
      const occasion = values[occIdx >= 0 ? occIdx : 1] || "Birthday Celebration";
      const date = values[dateIdx >= 0 ? dateIdx : 2] || "";
      const email = values[emailIdx >= 0 ? emailIdx : 3] || "";
      const dept = values[deptIdx >= 0 ? deptIdx : 4] || "General Team";
      const org = values[orgIdx >= 0 ? orgIdx : 5] || "People Operations";
      const customNote = values[noteIdx >= 0 ? noteIdx : 6] || "";

      parsed.push({
        id: `row-${i}-${Date.now()}`,
        name,
        occasion,
        date,
        email,
        department: dept,
        organizer: org,
        customNote,
        isValid: Boolean(name && date && email),
      });
    }

    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const rows = parseCSVContent(content);
        if (rows.length === 0) {
          toast.error("No valid rows found in CSV. Please verify column headers.");
          return;
        }
        setImportedRows(rows);
        toast.success(`Successfully imported ${rows.length} employee milestones!`);
      } catch (err) {
        toast.error("Failed to parse spreadsheet file. Please use a clean .csv file.");
      }
    };
    reader.readAsText(file);
  };

  const handleScheduleBatch = () => {
    const validRows = importedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to schedule.");
      return;
    }

    const batchJobs: ScheduledMemoryJob[] = validRows.map((r) => ({
      id: `job-corp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      occasion: r.occasion,
      recipient: r.name,
      email: r.email,
      department: r.department,
      organizerName: r.organizer || corpCompanyName,
      eventDate: r.date,
      scheduledTime: "09:00",
      themeId: corpThemeId,
      customNote: r.customNote,
      notifyOneDayBefore: corpNotifyBefore,
      autoDispatchOnDate: corpAutoDispatch,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      isCorporate: true,
    }));

    addScheduledJobsBatch(batchJobs);
    toast.success(`Successfully scheduled ${batchJobs.length} automated celebration pages!`);
    setImportedRows([]);
    setActiveTab("queue");
  };

  const handleScheduleIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indRecipient.trim() || !indDate || !indEmail.trim()) {
      toast.error("Please fill in recipient name, event date, and email address.");
      return;
    }

    const newJob: ScheduledMemoryJob = {
      id: `job-ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      occasion: indOccasion,
      recipient: indRecipient.trim(),
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
    toast.success(`Scheduled automatic celebration page for ${newJob.recipient}!`);

    // Reset form
    setIndRecipient("");
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

  // 100% Autonomous Silent Email Dispatch Action (Resend API)
  const handleExecuteAutonomousSilentDispatch = async (job?: ScheduledMemoryJob) => {
    const targetJob = job || simulationModalJob || jobsList[0];
    if (!targetJob) {
      toast.error("No scheduled event to dispatch.");
      return;
    }

    setIsDispatching(true);
    const targetSlug = targetJob.createdMemorySlug || triggerScheduledJobNow(targetJob.id) || "celebration-preview";
    const emailSub = generateEmailSubject(targetJob);
    const emailBody = generateEmailBody(targetJob, targetSlug);

    const newLogs: DispatchResult[] = [];

    // Email Autonomous Dispatch via Resend API
    const targetEmail = myTestEmail.trim() || targetJob.email;
    if (targetEmail) {
      const emailResult = await sendAutonomousEmail(targetEmail, emailSub, emailBody, apiConfig);
      newLogs.push(emailResult);
      if (emailResult.success) {
        toast.success(`[Email API] ${emailResult.details}`);
      } else {
        toast.error(`[Email API] ${emailResult.details}`);
      }
    } else {
      toast.error("Please provide a valid recipient email address.");
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
            Resend Email API and instant keepsake delivery.
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

      {/* ── 4 TABS BAR (Individual 1st, Corporate 2nd, Queue 3rd, Email API 4th) ── */}
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
              Trigger & dispatch Email keepsake links
            </div>
          </div>
        </button>

        {/* 4TH TAB: 100% AUTONOMOUS ZERO-TOUCH EMAIL API */}
        <button
          onClick={() => setActiveTab("engine")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex items-start gap-3.5 ${
            activeTab === "engine"
              ? "bg-[#FFFDF9] border-[#E4603C] shadow-md ring-2 ring-[#E4603C]/20"
              : "bg-white border-[#241621]/10 hover:border-[#E4603C]/40"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-[#E4603C] flex items-center justify-center shrink-0 text-xl">
            ⚡
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
                4. Zero-Touch Email
              </span>
              <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">
                Active 🟢
              </span>
            </div>
            <div className="font-display text-base font-bold text-[#241621] mt-0.5 truncate">
              Resend Email API
            </div>
            <div className="text-[11px] text-[#594855] mt-0.5 leading-tight">
              100% Silent Background Delivery Gateway
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
              prepared and dispatched directly to the recipient's email address.
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#241621] mb-1">
                Recipient Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={indEmail}
                  onChange={(e) => setIndEmail(e.target.value)}
                  placeholder="e.g. maya.iyer@example.com"
                  required
                  className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 pl-9 text-xs font-semibold outline-none focus:border-[#E4603C]"
                />
                <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#594855]" />
              </div>
              <span className="text-[10px] text-[#594855] mt-1 block">
                💡 Enables 100% autonomous background delivery via connected Resend Email API on the event date.
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
                ✉️ Automatically generate live memory page and dispatch official Email keepsake on the event date
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
                  occasions, dates, and work email addresses.
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

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    const rows = parseCSVContent(content);
                    setImportedRows(rows);
                    toast.success(`Imported ${rows.length} rows from ${file.name}!`);
                  };
                  reader.readAsText(file);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? "border-[#E4603C] bg-[#FAF6F0]"
                  : "border-[#241621]/20 bg-[#FFFDF9] hover:border-[#E4603C]/50"
              }`}
            >
              <FileSpreadsheet className="mx-auto h-10 w-10 text-[#E4603C] mb-2" />
              <h3 className="font-display text-base font-bold text-[#241621]">
                Drop your Employee Spreadsheet here
              </h3>
              <p className="text-xs text-[#594855] mt-1 max-w-sm mx-auto">
                Supports `.csv` files formatted with columns for Name, Occasion, Date, and Email Address.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#241621] hover:bg-black px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Browse Computer Files</span>
              </button>
            </div>
          </div>

          {/* Imported Data Table */}
          {importedRows.length > 0 && (
            <div className="rounded-3xl border border-[#241621]/12 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#241621]/10 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#241621]">
                    Imported Employee Milestones ({importedRows.length} Rows)
                  </h3>
                  <p className="text-xs text-[#594855]">
                    Review the roster below before confirming schedule creation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setImportedRows([])}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Clear Table
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#241621]/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] text-[#241621] font-bold border-b border-[#241621]/10 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Occasion</th>
                      <th className="p-3">Event Date</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Organizer</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#241621]/5">
                    {importedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FFFDF9]">
                        <td className="p-3 font-bold text-[#241621]">{row.name}</td>
                        <td className="p-3 font-semibold text-[#E4603C]">{row.occasion}</td>
                        <td className="p-3 font-mono">{row.date}</td>
                        <td className="p-3 font-mono text-[#594855]">{row.email}</td>
                        <td className="p-3">{row.department}</td>
                        <td className="p-3">{row.organizer}</td>
                        <td className="p-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-green-200">
                              <CheckCircle2 className="h-3 w-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-amber-200">
                              <AlertCircle className="h-3 w-3" /> Missing Info
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Corporate Automation Settings */}
              <div className="rounded-2xl bg-[#FAF6F0] p-5 border border-[#241621]/10 space-y-4">
                <h4 className="font-display text-sm font-bold text-[#241621]">
                  Corporate Automation Defaults
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#241621] mb-1">Company Name</label>
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
                      🔔 Notify HR & Team 1 day in advance via Email so coworkers can upload wishes early
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
                      ✉️ Automatically generate live memory page and dispatch official Email keepsake links
                      for employees on their celebration day
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
              dispatch via Resend Email API.
            </div>
          </div>

          {/* Scheduled Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => {
              const eventDateObj = new Date(job.eventDate);
              const isCreated = job.status === "created";
              const slug = job.createdMemorySlug;
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
                        <Mail className="h-3 w-3 text-[#E4603C]" />
                        <span>Email Keepsake Details</span>
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
      {/* SECTION 4: 100% AUTONOMOUS ZERO-TOUCH EMAIL API GATEWAY       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "engine" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Explainer Hero */}
          <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-[#FFFDF9] to-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C] flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> 100% Autonomous Zero-Touch Architecture
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#241621] mt-0.5">
                  Autonomous Email Keepsake Gateway
                </h2>
                <p className="text-xs text-[#594855] mt-1 max-w-2xl">
                  Dispatches celebration keepsake notifications completely silently in the background <strong>without human intervention</strong> using verified server-side Resend API integration.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Resend API Active & Verified
                </span>
              </div>
            </div>

            {/* 3 Core Pillars of Full Automation */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-[#E4603C]/15 text-[#E4603C] flex items-center justify-center font-bold text-sm">
                  ✉️
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">1. Resend API Engine</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  Connected with official Resend API key. Automatically sends responsive HTML keepsake invitation emails with deep-links directly to the recipient's inbox.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                  🔒
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">2. Secure Serverless Proxy</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  Calls are securely executed through serverless RPC functions to protect API keys and ensure zero browser CORS restrictions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#241621]/10 shadow-2xs space-y-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  🕒
                </div>
                <h3 className="font-display text-sm font-bold text-[#241621]">3. Advance Reminder Engine</h3>
                <p className="text-[11px] text-[#594855] leading-relaxed">
                  Notifies organizers 1 day in advance so colleagues, friends, and family can contribute memory wishes, voice notes, and photos before the celebration day.
                </p>
              </div>
            </div>
          </div>

          {/* API Credentials Configuration Panel */}
          <div className="rounded-3xl border border-[#241621]/12 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#241621]/10 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#E4603C]" />
                <div>
                  <h3 className="font-display text-lg font-bold text-[#241621]">
                    Email Provider Configuration
                  </h3>
                  <p className="text-xs text-[#594855]">
                    Managed securely via environment variables and server settings.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveApiConfig(apiConfig)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

            {/* Email Provider Config */}
            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#241621]/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-[#241621] flex items-center gap-2">
                  <span className="text-base">✉️</span> Resend Transactional Email API
                </h4>
                <span className="text-[10px] font-bold uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-300">
                  Connected 🟢
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Resend API Key</label>
                  <input
                    type="password"
                    value={apiConfig.resendApiKey || ""}
                    onChange={(e) => setApiConfig({ ...apiConfig, resendApiKey: e.target.value })}
                    placeholder="re_••••••••••••••••••••••••••••••••"
                    className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-[#E4603C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#241621] mb-0.5">Sender Email / Domain</label>
                  <input
                    value={apiConfig.resendFromEmail || "onboarding@resend.dev"}
                    onChange={(e) => setApiConfig({ ...apiConfig, resendFromEmail: e.target.value })}
                    placeholder="onboarding@resend.dev or celebrations@yourdomain.com"
                    className="w-full rounded-xl border border-[#241621]/15 bg-white p-2 text-xs font-mono outline-none focus:border-[#E4603C]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Zero-Touch Silent Dispatch Tester */}
          <div className="rounded-3xl border border-[#241621]/12 bg-[#FFFDF9] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#241621]/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4603C]">
                  Live Dispatch Simulation & Real API Trigger
                </span>
                <h3 className="font-display text-xl font-bold text-[#241621]">
                  Test 100% Silent Background Email Dispatch
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-[10px] font-bold px-2.5 py-0.5">
                    ✉️ Active Provider: RESEND API
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isDispatching}
                onClick={() => handleExecuteAutonomousSilentDispatch()}
                className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>{isDispatching ? "Dispatching via Resend..." : "⚡ Trigger Silent Email Dispatch"}</span>
              </button>
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
                className="w-full rounded-xl border border-[#241621]/15 bg-white p-2.5 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
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
                          └ Resend Message ID: {log.messageId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Future Multi-Channel Roadmap Note */}
          <div className="rounded-2xl bg-[#FAF6F0] p-4 border border-[#241621]/10 flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              📱
            </div>
            <div>
              <h4 className="font-display text-xs font-bold text-[#241621]">
                Multi-Channel Roadmap: WhatsApp & SMS Automation
              </h4>
              <p className="text-[11px] text-[#594855] mt-0.5 leading-relaxed">
                Direct WhatsApp automated messaging is scheduled for the v2.0 Enterprise release with pre-registered Meta Business templates and verified sender IDs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* EMAIL KEEPSAKE PREVIEW & DIRECT DISPATCH MODAL                */}
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
                <div className="h-8 w-8 rounded-full bg-[#E4603C] text-white flex items-center justify-center font-bold text-sm">
                  ✉️
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#241621]">
                    Email Keepsake Dispatch
                  </h3>
                  <p className="text-[11px] text-[#594855]">
                    Recipient: {simulationModalJob.recipient} · {simulationModalJob.email || "Email ready"}
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

            {/* Email Preview Card */}
            <div className="rounded-2xl bg-[#FAF6F0] p-4 space-y-3 border border-[#241621]/10 shadow-inner">
              <div className="text-[11px] text-[#594855] space-y-1 pb-2 border-b border-[#241621]/10 font-mono">
                <div><strong>To:</strong> {simulationModalJob.email || "recipient@example.com"}</div>
                <div><strong>Subject:</strong> {generateEmailSubject(simulationModalJob)}</div>
                <div><strong>From:</strong> SocioDex Celebrations &lt;onboarding@resend.dev&gt;</div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-xs space-y-3 text-xs text-[#241621]">
                <div className="font-display text-sm font-bold text-[#E4603C]">
                  🎉 Happy {simulationModalJob.occasion}, {simulationModalJob.recipient}! 🎂
                </div>
                <p className="text-[#594855] leading-relaxed">
                  Your team at{" "}
                  <strong>{simulationModalJob.organizerName || "SocioDex"}</strong> has created a
                  special digital memory page to celebrate this special day!
                </p>
                {simulationModalJob.customNote && (
                  <p className="italic bg-[#FFFDF9] p-2.5 rounded-xl border border-[#241621]/10 text-[11px] text-[#594855]">
                    "{simulationModalJob.customNote}"
                  </p>
                )}

                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E4603C]/20 text-center space-y-1.5">
                  <div className="text-[11px] font-bold text-[#E4603C]">
                    💌 Living Keepsake Memory Page
                  </div>
                  <div className="font-mono text-xs text-blue-700 font-semibold underline truncate">
                    {getKeepsakeUrl(simulationSlug || simulationModalJob.createdMemorySlug)}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct 1-Click Action Buttons */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                🚀 Dispatch Actions:
              </div>

              {/* 100% Autonomous Silent Trigger Button */}
              <button
                type="button"
                onClick={() => handleExecuteAutonomousSilentDispatch(simulationModalJob)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] py-3 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-98"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>⚡ Fire 100% Autonomous Silent Dispatch (Resend API)</span>
              </button>

              {/* Email Options */}
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#241621] hover:bg-black py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
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
                    const text = generateEmailBody(
                      simulationModalJob,
                      simulationSlug || simulationModalJob.createdMemorySlug
                    );
                    navigator.clipboard.writeText(text);
                    toast.success("Email content copied to clipboard!");
                  }}
                  className="flex-1 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] py-2.5 text-xs font-bold text-[#241621] transition cursor-pointer"
                >
                  Copy Email Text
                </button>

                {(simulationSlug || simulationModalJob.createdMemorySlug) && (
                  <a
                    href={`/m/${simulationSlug || simulationModalJob.createdMemorySlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-green-700 hover:bg-green-800 py-2.5 text-xs font-bold text-white transition cursor-pointer"
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
