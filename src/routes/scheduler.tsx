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
  Users,
  Gift,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scheduler")({
  head: () => ({
    meta: [
      { title: "Automated Memory Page Scheduler — SocioDex" },
      {
        name: "description",
        content:
          "Schedule celebration memory pages with 1-day advance contributor invites (10:00 AM) and birthday surprise keepsake auto-dispatch (10:00 AM) via events@sociodex.com.",
      },
    ],
  }),
  component: SchedulerPage,
});

// CSV Sample Data for Download & Demo
const SAMPLE_CSV_TEMPLATE = `Employee Name,Occasion Type,Event Date,Employee Email,Department,Organizer Name,Organizer Email,Contributor Emails,Custom Greeting Note
Priya Sharma,Birthday Celebration,2026-08-28,priya.sharma@acme.corp,Product Design,Acme People Team,hr@acme.corp,"alex@acme.corp, rahul@acme.corp, meera@acme.corp",Happy Birthday Priya! Wishing you a sensational year filled with creativity and joy! 🎉
Arjun Verma,3rd Work Anniversary,2026-09-02,arjun.verma@acme.corp,Core Engineering,HR Culture Team,culture@acme.corp,"tech-leads@acme.corp, vikram@acme.corp",Congratulations Arjun on 3 stellar years with Acme! Thank you for your leadership! 🚀
Sarah Lin,Farewell Celebration,2026-09-10,sarah.lin@acme.corp,Marketing & Growth,David Kim,david.kim@acme.corp,"marketing-team@acme.corp",Wishing you the absolute best in your next chapter Sarah! You will be missed! 🌸
Vikram Mehta,Birthday Celebration,2026-09-18,vikram.mehta@acme.corp,Operations,Acme People Team,hr@acme.corp,"ops-lead@acme.corp, tania@acme.corp",Wishing you a fantastic birthday Vikram! Have a wonderful celebration! 🎂
Ananya Roy,Promotion Milestone,2026-09-25,ananya.roy@acme.corp,Data & AI,Engineering Lead,lead@acme.corp,"ai-team@acme.corp",Kudos on your well-deserved promotion Ananya! So proud of your achievements! 🌟`;

// ── DELIVERY HELPER UTILITIES ──

function getKeepsakeUrl(slug?: string): string {
  if (!slug) return "https://sociodex.app/m/preview";
  if (typeof window !== "undefined") {
    return `${window.location.origin}/m/${slug}`;
  }
  return `https://sociodex.app/m/${slug}`;
}

// 1. 1-DAY ADVANCE SECRET CONTRIBUTOR & ORGANIZER INVITATION EMAIL
export function generateContributorEmailSubject(job: ScheduledMemoryJob): string {
  return `🎨 Shh... Secret Celebration: Contribute to ${job.recipient}'s ${job.occasion} Keepsake! (Tomorrow at 10 AM Reveal)`;
}

export function generateContributorEmailBody(job: ScheduledMemoryJob, slug?: string): string {
  const url = getKeepsakeUrl(slug || job.createdMemorySlug);
  return `Hi there! 👋

${job.recipient}'s ${job.occasion} is TOMORROW! 🎂🎉

We are secretly creating a living digital keepsake page full of photos, heartfelt wishes, inside jokes, and videos to surprise ${job.recipient} tomorrow morning at 10:00 AM!

👉 Open Secret Collaboration Link & Add Your Wishes Now:
${url}

💡 How you can help make this unforgettable:
1. Click the link above to upload your photos, memories, or a warm birthday note.
2. Share this secret link with coworkers, mutual friends, and family so they can add their wishes before tomorrow morning's reveal!

${job.customNote ? `Special Note from ${job.organizerName || "Organizer"}:\n"${job.customNote}"\n\n` : ""}Warmly,
${job.organizerName || "SocioDex Celebrations"} & The Organizing Team`;
}

// 2. BIRTHDAY MORNING SURPRISE CELEBRATION EMAIL (TO THE CELEBRANT)
export function generateCelebrantBirthdayEmailSubject(job: ScheduledMemoryJob): string {
  return `🎉 Happy ${job.occasion}, ${job.recipient}! Your surprise celebration keepsake is ready! 🎂`;
}

export function generateCelebrantBirthdayEmailBody(job: ScheduledMemoryJob, slug?: string): string {
  const url = getKeepsakeUrl(slug || job.createdMemorySlug);
  return `Dear ${job.recipient}, 🥳

Today is all about YOU! Wishing you a sensational ${job.occasion} filled with joy, health, and memorable celebrations!

🎁 SURPRISE! Your friends, family, and colleagues at ${job.organizerName || "SocioDex"} have secretly created a living digital memory page just for you!

💌 Open your living memory page to view personal wishes, photos, and messages:
${url}

${job.customNote ? `"${job.customNote}"\n\n` : ""}✨ Feel free to leave replies, add your own photos from today's celebration, and cherish this keepsake forever!

With warmest celebration wishes,
${job.organizerName || "SocioDex Celebrations"}`;
}

function getGmailComposeUrl(email?: string, subject?: string, body?: string): string {
  const to = encodeURIComponent(email || "");
  const su = encodeURIComponent(subject || "");
  const b = encodeURIComponent(body || "");
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`;
}

function SchedulerPage() {
  const currentUser = useStore((s) => s.currentUser);
  const scheduledJobs = useStore((s) => s.scheduledJobs || {});
  const addScheduledJob = useStore((s) => s.addScheduledJob);
  const addScheduledJobsBatch = useStore((s) => s.addScheduledJobsBatch);
  const deleteScheduledJob = useStore((s) => s.deleteScheduledJob);
  const triggerScheduledJobNow = useStore((s) => s.triggerScheduledJobNow);
  const navigate = useNavigate();

  // Active Tab: 3 Clean Tabs ("individual" | "corporate" | "queue")
  const [activeTab, setActiveTab] = useState<"individual" | "corporate" | "queue">("individual");

  // Queue Filter: "all" | "scheduled" | "created"
  const [queueFilter, setQueueFilter] = useState<"all" | "scheduled" | "created">("all");

  // ── INDIVIDUAL FORM STATE (1st Priority) ──
  const [indOccasion, setIndOccasion] = useState(OCCASIONS[0]);
  const [indRecipient, setIndRecipient] = useState("");
  const [indEmail, setIndEmail] = useState(""); // Non-mandatory (optional)
  const [indDate, setIndDate] = useState("");
  const [indTime, setIndTime] = useState("10:00"); // 10:00 AM Morning Birthday Reveal Default
  const [indOrganizer, setIndOrganizer] = useState(currentUser?.name || "Organizer");
  const [indOrganizerEmail, setIndOrganizerEmail] = useState(currentUser?.email || "e4sajan@gmail.com"); // Mandatory
  const [indContributors, setIndContributors] = useState("");
  const [indContributorTime, setIndContributorTime] = useState("10:00"); // 10:00 AM Day Before Default
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
      organizerEmail: string;
      contributors: string;
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

  // ── AUTONOMOUS API CONFIGURATION STATE (Background Resend Engine) ──
  const [apiConfig, setApiConfig] = useState<AutonomousApiConfig>(loadAutonomousApiConfig);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchResult[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);

  // Direct Self-Test field for Email
  const [myTestEmail, setMyTestEmail] = useState(currentUser?.email || "e4sajan@gmail.com");

  // Modal simulation state
  const [simulationModalJob, setSimulationModalJob] = useState<ScheduledMemoryJob | null>(null);
  const [simulationSlug, setSimulationSlug] = useState<string | null>(null);
  const [modalEmailType, setModalEmailType] = useState<"celebrant" | "contributor">("celebrant");

  // Browser notifications
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  // Update default organizer email when logged-in user changes
  useEffect(() => {
    if (currentUser?.email) {
      setIndOrganizerEmail(currentUser.email);
    }
    if (currentUser?.name) {
      setIndOrganizer(currentUser.name);
    }
  }, [currentUser]);

  // ── AUTONOMOUS 2-PHASE SCHEDULER ENGINE (1 Day Before @ 10 AM & Birthday @ 10 AM) ──
  useEffect(() => {
    const runAutonomousSchedulerEngine = async () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Calculate tomorrow date string (for 1-day advance check)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      for (const job of Object.values(scheduledJobs)) {
        // PHASE 1: 1 Day Before Birthday at 10:00 AM -> Send Secret Contributor Invite
        if (
          job.notifyOneDayBefore &&
          !job.contributorEmailsDispatched &&
          job.eventDate === tomorrowStr &&
          (job.contributorDispatchTime || "10:00") <= currentTimeStr
        ) {
          const slug = job.createdMemorySlug || triggerScheduledJobNow(job.id);
          const contribSub = generateContributorEmailSubject(job);
          const contribBody = generateContributorEmailBody(job, slug || "celebration-preview");

          const recipientList = [
            ...(job.organizerEmail ? [job.organizerEmail] : []),
            ...(job.contributorEmails || []),
          ].filter(Boolean);

          for (const email of recipientList) {
            await sendAutonomousEmail(email, contribSub, contribBody, apiConfig);
          }

          job.contributorEmailsDispatched = true;
          toast.success(
            `🎨 Dispatched 1-day secret contributor invite to ${recipientList.length} collaborators for ${job.recipient}!`
          );
        }

        // PHASE 2: Birthday Date at 10:00 AM -> Send Surprise Keepsake Reveal to Celebrant (if email provided)
        if (
          job.status === "scheduled" &&
          job.autoDispatchOnDate &&
          job.eventDate <= todayStr &&
          (job.scheduledTime || "10:00") <= currentTimeStr &&
          !job.celebrantEmailDispatched
        ) {
          const slug = triggerScheduledJobNow(job.id);
          if (job.email) {
            const emailSub = generateCelebrantBirthdayEmailSubject(job);
            const emailBody = generateCelebrantBirthdayEmailBody(job, slug || "celebration-preview");
            const res = await sendAutonomousEmail(job.email, emailSub, emailBody, apiConfig);
            if (res.success) {
              job.celebrantEmailDispatched = true;
              toast.success(`🎂 Auto-dispatched 10:00 AM surprise birthday email to ${job.recipient} (${job.email})!`);
            }
          } else {
            job.celebrantEmailDispatched = true;
          }
        }
      }
    };

    runAutonomousSchedulerEngine();
    const interval = setInterval(runAutonomousSchedulerEngine, 30000);
    return () => clearInterval(interval);
  }, [scheduledJobs, apiConfig]);

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
    const emailIdx = headers.findIndex((h) => h.includes("employee email") || h.includes("recipient email") || h.includes("email"));
    const deptIdx = headers.findIndex((h) => h.includes("department") || h.includes("dept") || h.includes("team"));
    const orgIdx = headers.findIndex((h) => h.includes("organizer name") || h.includes("sender"));
    const orgEmailIdx = headers.findIndex((h) => h.includes("organizer email") || h.includes("hr email"));
    const contribIdx = headers.findIndex((h) => h.includes("contributor") || h.includes("teammates") || h.includes("collaborator"));
    const noteIdx = headers.findIndex((h) => h.includes("note") || h.includes("greeting") || h.includes("wish") || h.includes("custom"));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const rowText = lines[i];
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
      const orgEmail = values[orgEmailIdx >= 0 ? orgEmailIdx : 6] || "hr@acme.corp";
      const contributors = values[contribIdx >= 0 ? contribIdx : 7] || "";
      const customNote = values[noteIdx >= 0 ? noteIdx : 8] || "";

      parsed.push({
        id: `row-${i}-${Date.now()}`,
        name,
        occasion,
        date,
        email,
        department: dept,
        organizer: org,
        organizerEmail: orgEmail,
        contributors,
        customNote,
        isValid: Boolean(name && date && orgEmail),
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

    const batchJobs: ScheduledMemoryJob[] = validRows.map((r) => {
      const contribList = r.contributors
        ? r.contributors.split(/[,;\s]+/).map((s) => s.trim()).filter((s) => s.includes("@"))
        : [];

      return {
        id: `job-corp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        occasion: r.occasion,
        recipient: r.name,
        email: r.email || undefined,
        department: r.department,
        organizerName: r.organizer || corpCompanyName,
        organizerEmail: r.organizerEmail || currentUser?.email || "hr@acme.corp",
        contributorEmails: contribList,
        contributorDispatchTime: "10:00",
        eventDate: r.date,
        scheduledTime: "10:00",
        themeId: corpThemeId,
        customNote: r.customNote,
        notifyOneDayBefore: corpNotifyBefore,
        autoDispatchOnDate: corpAutoDispatch,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        isCorporate: true,
      };
    });

    addScheduledJobsBatch(batchJobs);
    toast.success(`Successfully scheduled ${batchJobs.length} automated celebration pages!`);
    setImportedRows([]);
    setActiveTab("queue");
  };

  const handleScheduleIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indRecipient.trim() || !indDate || !indOrganizerEmail.trim()) {
      toast.error("Please fill in recipient name, event date, and organizer email address.");
      return;
    }

    const contributorList = indContributors
      ? indContributors
          .split(/[,;\n\s]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.includes("@"))
      : [];

    const newJob: ScheduledMemoryJob = {
      id: `job-ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      occasion: indOccasion,
      recipient: indRecipient.trim(),
      email: indEmail.trim() || undefined,
      organizerName: indOrganizer.trim() || currentUser?.name || "Organizer",
      organizerEmail: indOrganizerEmail.trim() || currentUser?.email || "e4sajan@gmail.com",
      contributorEmails: contributorList,
      contributorDispatchTime: indContributorTime || "10:00",
      eventDate: indDate,
      scheduledTime: indTime || "10:00",
      themeId: indThemeId,
      customNote: indCustomNote.trim(),
      notifyOneDayBefore: indNotifyBefore,
      autoDispatchOnDate: indAutoDispatch,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      isCorporate: false,
    };

    addScheduledJob(newJob);
    toast.success(`Scheduled celebration keepsake for ${newJob.recipient}!`);

    // Reset form
    setIndRecipient("");
    setIndEmail("");
    setIndDate("");
    setIndContributors("");
    setIndCustomNote("");
    setActiveTab("queue");
  };

  // Instant Trigger & Simulate
  const handleTriggerNow = (job: ScheduledMemoryJob) => {
    const slug = triggerScheduledJobNow(job.id);
    setSimulationModalJob(job);
    setSimulationSlug(slug || job.createdMemorySlug || null);
    toast.success(`Generated live memory page for ${job.recipient}!`);

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(`🎂 Live Memory Page: ${job.recipient}'s ${job.occasion}`, {
        body: `Your memory page is ready! Live link: ${getKeepsakeUrl(slug || job.createdMemorySlug)}`,
        icon: "/sociodex-logo.png",
      });
    }
  };

  // 100% Autonomous Silent Email Dispatch Action (Resend API)
  const handleExecuteAutonomousSilentDispatch = async (job?: ScheduledMemoryJob, targetType: "celebrant" | "contributor" = "celebrant") => {
    const targetJob = job || simulationModalJob || jobsList[0];
    if (!targetJob) {
      toast.error("No scheduled event to dispatch.");
      return;
    }

    setIsDispatching(true);
    const targetSlug = targetJob.createdMemorySlug || triggerScheduledJobNow(targetJob.id) || "celebration-preview";
    const newLogs: DispatchResult[] = [];

    if (targetType === "celebrant") {
      const targetEmail = myTestEmail.trim() || targetJob.email;
      if (targetEmail) {
        const emailSub = generateCelebrantBirthdayEmailSubject(targetJob);
        const emailBody = generateCelebrantBirthdayEmailBody(targetJob, targetSlug);
        const result = await sendAutonomousEmail(targetEmail, emailSub, emailBody, apiConfig);
        newLogs.push(result);
        if (result.success) {
          toast.success(`[Celebrant Reveal Email] ${result.details}`);
        } else {
          toast.error(`[Celebrant Reveal Email] ${result.details}`);
        }
      } else {
        toast.error("No email address configured for celebrant.");
      }
    } else {
      const emailSub = generateContributorEmailSubject(targetJob);
      const emailBody = generateContributorEmailBody(targetJob, targetSlug);
      const recipientList = [
        myTestEmail.trim() || targetJob.organizerEmail || "e4sajan@gmail.com",
        ...(targetJob.contributorEmails || []),
      ].filter(Boolean);

      for (const email of recipientList) {
        const result = await sendAutonomousEmail(email, emailSub, emailBody, apiConfig);
        newLogs.push(result);
        if (result.success) {
          toast.success(`[Contributor Invite to ${email}] ${result.details}`);
        } else {
          toast.error(`[Contributor Invite to ${email}] ${result.details}`);
        }
      }
    }

    setDispatchLogs((prev) => [...newLogs, ...prev]);
    setIsDispatching(false);
  };

  const handleOpenSimulation = (job: ScheduledMemoryJob, defaultType: "celebrant" | "contributor" = "celebrant") => {
    setSimulationModalJob(job);
    setSimulationSlug(job.createdMemorySlug || null);
    setModalEmailType(defaultType);
  };

  const generateWishTemplate = () => {
    const recipient = indRecipient.trim() || "our friend";
    setIndCustomNote(
      `Happy ${indOccasion}, ${recipient}! 🥳 Wishing you endless happiness, good health, and immense success. So excited to celebrate this milestone with you! 🥂✨`
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:py-8 sm:px-6">
      {/* ── CLEAN HEADER ── */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#241621]/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E4603C] flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Automated Memory Page Scheduler
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#241621]">
            Celebration Scheduler
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#594855] max-w-2xl">
            Auto-send <strong>1-Day Secret Contributor Invites (10:00 AM)</strong> to collect wishes & photos, and reveal the <strong>Official Keepsake on Birthday (10:00 AM)</strong>.
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

      {/* ── 3 CLEAN TABS BAR (Individual 1st, Corporate 2nd, Queue 3rd) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
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
              2-phase auto emails for birthday & milestone
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
              Track 1-day invites & birthday morning emails
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
              2-Phase Celebration Automation
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#241621]">
              Schedule a Memory Page
            </h2>
            <p className="text-xs text-[#594855] mt-0.5">
              1) Sends <strong>secret contributor invitation (10:00 AM day before)</strong> to collect wishes & photos. 2) Sends <strong>surprise celebration keepsake email (10:00 AM on birthday)</strong> to the birthday person.
            </p>
          </div>

          {/* 2-PHASE WORKFLOW VISUAL TIMELINE */}
          <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-2xl bg-[#FAF6F0] border border-[#241621]/10">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#241621]/8 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <HeartHandshake className="h-3 w-3" /> 1 Day Before · 10:00 AM
                </div>
                <div className="font-bold text-xs text-[#241621] mt-0.5">
                  Secret Contributor & Organizer Invite
                </div>
                <div className="text-[11px] text-[#594855] mt-0.5 leading-snug">
                  Invites teammates & friends to secretly add wishes, photos, and invite others.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#241621]/8 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-orange-100 text-[#E4603C] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-[#E4603C] uppercase tracking-wider flex items-center gap-1">
                  <Gift className="h-3 w-3" /> Birthday Morning · 10:00 AM
                </div>
                <div className="font-bold text-xs text-[#241621] mt-0.5">
                  Surprise Keepsake Reveal
                </div>
                <div className="text-[11px] text-[#594855] mt-0.5 leading-snug">
                  Celebrant receives their finished living memory page full of love & memories!
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* OCCASION & CELEBRANT DETAILS */}
            <div className="sm:col-span-2 pt-2 border-t border-[#241621]/10">
              <h3 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5 mb-1">
                <Gift className="h-4 w-4 text-[#E4603C]" /> 1. Celebrant & Event Details
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1.5">Occasion Type *</label>
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
              <label className="block text-xs font-bold text-[#241621] mb-1.5">Birthday Person's Name *</label>
              <input
                value={indRecipient}
                onChange={(e) => setIndRecipient(e.target.value)}
                placeholder="e.g. Maya Iyer"
                required
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1.5">Birthday / Event Date *</label>
              <input
                type="date"
                value={indDate}
                onChange={(e) => setIndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1.5">
                Birthday Person's Email <span className="text-[11px] font-normal text-[#594855]">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={indEmail}
                  onChange={(e) => setIndEmail(e.target.value)}
                  placeholder="e.g. maya.iyer@example.com (Optional)"
                  className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 pl-9 text-xs font-semibold outline-none focus:border-[#E4603C]"
                />
                <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#594855]" />
              </div>
              <span className="text-[10px] text-[#594855] mt-1 block">
                💡 Optional: If provided, celebrant receives the surprise keepsake email directly at 10:00 AM on their birthday.
              </span>
            </div>

            {/* ORGANIZER & SECRET CONTRIBUTORS SECTION */}
            <div className="sm:col-span-2 pt-4 border-t border-[#241621]/10">
              <h3 className="font-display text-sm font-bold text-[#241621] flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-blue-600" /> 2. Organizer & Secret Contributors (1-Day Advance Planning)
              </h3>
              <p className="text-[11px] text-[#594855] mb-2">
                These collaborators will automatically receive an invite 1 day before at 10:00 AM to secretly add wishes and photos.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1.5">
                Organizer / Sender Name *
              </label>
              <input
                value={indOrganizer}
                onChange={(e) => setIndOrganizer(e.target.value)}
                placeholder="e.g. Sajan Dansena / Acme People Team"
                required
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241621] mb-1.5">
                Organizer Email Address * <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Mandatory</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={indOrganizerEmail}
                  onChange={(e) => setIndOrganizerEmail(e.target.value)}
                  placeholder="e.g. e4sajan@gmail.com"
                  required
                  className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 pl-9 text-xs font-semibold outline-none focus:border-[#E4603C]"
                />
                <User className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#594855]" />
              </div>
              <span className="text-[10px] text-[#594855] mt-1 block">
                🔔 Receives 1-day advance reminder (10:00 AM) & memory page admin links.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#241621] mb-1.5">
                Teammates & Contributors Email IDs <span className="text-[11px] font-normal text-[#594855]">(Optional, separate with commas)</span>
              </label>
              <textarea
                value={indContributors}
                onChange={(e) => setIndContributors(e.target.value)}
                rows={2}
                placeholder="e.g. alex@acme.corp, sarah@acme.corp, david@acme.corp, priya@acme.corp"
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C] resize-none font-mono"
              />
              <span className="text-[10px] text-[#594855] mt-1 block">
                💌 Each contributor receives a secret email 1 day prior (10:00 AM) requesting them to contribute photos & memories and invite others.
              </span>
            </div>

            {/* THEME & GREETING NOTE */}
            <div className="sm:col-span-2 pt-2 border-t border-[#241621]/10">
              <label className="block text-xs font-bold text-[#241621] mb-2">3. Keepsake Visual Theme</label>
              <div className="flex flex-wrap gap-2.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIndThemeId(t.id)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      indThemeId === t.id
                        ? "border-[#E4603C] ring-2 ring-[#E4603C]/20 bg-white shadow-2xs"
                        : "border-[#241621]/15 bg-white hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full shadow-2xs" style={{ background: t.accent }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#241621]">
                  Preset Welcome Greeting / Organizer Note
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
                rows={2}
                placeholder="e.g. Wishing you a wonderful birthday filled with joy, health, and laughter! 🥳✨"
                className="w-full rounded-xl border border-[#241621]/15 bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E4603C] resize-none"
              />
            </div>
          </div>

          {/* AUTOMATION CHECKBOXES */}
          <div className="rounded-2xl bg-[#FAF6F0] p-4 space-y-2.5 border border-[#241621]/10 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#241621]">
              <input
                type="checkbox"
                checked={indNotifyBefore}
                onChange={(e) => setIndNotifyBefore(e.target.checked)}
                className="h-4 w-4 rounded accent-[#E4603C]"
              />
              <span>
                🎨 <strong>Phase 1 (1 Day Before at 10:00 AM):</strong> Automatically send secret contribution invites to organizer and contributors to plan & add memories
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#241621]">
              <input
                type="checkbox"
                checked={indAutoDispatch}
                onChange={(e) => setIndAutoDispatch(e.target.checked)}
                className="h-4 w-4 rounded accent-[#E4603C]"
              />
              <span>
                🎂 <strong>Phase 2 (Birthday at 10:00 AM):</strong> Automatically generate celebration memory page and email surprise keepsake link
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#E4603C] hover:bg-[#c94b29] px-8 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Celebration Keepsake</span>
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
                  Upload an Excel or `.csv` spreadsheet containing employee names, occasions, dates, work emails, and team contributors.
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
                Supports `.csv` files formatted with columns for Name, Occasion, Date, Employee Email, Organizer Email, and Contributor Emails.
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
                      <th className="p-3">Employee Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Organizer Email</th>
                      <th className="p-3">Contributors</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#241621]/5">
                    {importedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FFFDF9]">
                        <td className="p-3 font-bold text-[#241621]">{row.name}</td>
                        <td className="p-3 font-semibold text-[#E4603C]">{row.occasion}</td>
                        <td className="p-3 font-mono">{row.date}</td>
                        <td className="p-3 font-mono text-[#594855]">{row.email || "—"}</td>
                        <td className="p-3">{row.department}</td>
                        <td className="p-3 font-mono text-[#594855]">{row.organizerEmail}</td>
                        <td className="p-3 font-mono text-[10px] text-[#594855] max-w-[150px] truncate">{row.contributors || "None"}</td>
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
                      🎨 <strong>Phase 1:</strong> Automatically invite team contributors 1 day before at 10:00 AM to secretly contribute wishes & photos
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
                      🎂 <strong>Phase 2:</strong> Automatically dispatch surprise keepsake email to employee on event morning at 10:00 AM
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
              💡 Background engine sends <strong>Contributor Invites 1-day before @ 10:00 AM</strong> and <strong>Surprise Keepsakes on Birthday @ 10:00 AM</strong>.
            </div>
          </div>

          {/* Scheduled Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => {
              const eventDateObj = new Date(job.eventDate);
              const isCreated = job.status === "created";
              const slug = job.createdMemorySlug;
              const celebrantSubject = generateCelebrantBirthdayEmailSubject(job);
              const celebrantBody = generateCelebrantBirthdayEmailBody(job, slug);
              const gmailUrl = getGmailComposeUrl(job.email, celebrantSubject, celebrantBody);

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
                          {isCreated ? "✓ Live & Dispatched" : "⏱ Scheduled"}
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

                    {/* Contact & 2-Phase Timeline Rules */}
                    <div className="rounded-xl bg-[#FAF6F0]/70 p-3 text-xs space-y-2 text-[#594855]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <Gift className="h-3.5 w-3.5 text-[#E4603C] shrink-0" />
                          <span className="font-bold text-[#241621]">Celebrant:</span> {job.email || "(No email - manual share)"}
                        </div>
                        <span className="text-[10px] font-bold bg-orange-100 text-[#E4603C] px-2 py-0.5 rounded-full">
                          10:00 AM Birthday
                        </span>
                      </div>

                      {(job.organizerEmail || (job.contributorEmails && job.contributorEmails.length > 0)) && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#241621]/5">
                          <div className="flex items-center gap-1.5 font-medium truncate text-[11px]">
                            <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="font-bold text-[#241621]">Contributors:</span> {1 + (job.contributorEmails?.length || 0)} people ({job.organizerEmail || "Organizer"})
                          </div>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            10:00 AM Day Before
                          </span>
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
                          <span>Trigger Live Now</span>
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
                        onClick={() => handleOpenSimulation(job, "celebrant")}
                        className="inline-flex items-center gap-1 rounded-full border border-[#241621]/15 bg-white hover:bg-[#FAF6F0] px-3 py-1.5 text-xs font-bold text-[#241621] transition cursor-pointer shadow-2xs"
                      >
                        <Mail className="h-3 w-3 text-[#E4603C]" />
                        <span>Email Actions</span>
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
      {/* 2-PHASE EMAIL PREVIEW & DIRECT DISPATCH MODAL                 */}
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
                    2-Phase Automated Email Dispatch
                  </h3>
                  <p className="text-[11px] text-[#594855]">
                    Recipient: {simulationModalJob.recipient} {simulationModalJob.email ? `(${simulationModalJob.email})` : ""}
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

            {/* Email Type Tabs Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#241621]/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalEmailType("celebrant")}
                className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalEmailType === "celebrant"
                    ? "bg-[#E4603C] text-white shadow-xs"
                    : "text-[#594855] hover:text-[#241621]"
                }`}
              >
                <Gift className="h-3.5 w-3.5" />
                <span>🎂 Birthday Keepsake (10 AM)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalEmailType("contributor")}
                className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalEmailType === "contributor"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[#594855] hover:text-[#241621]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>🎨 1-Day Contributor Invite</span>
              </button>
            </div>

            {/* EMAIL PREVIEW CARD 1: CELEBRANT BIRTHDAY SURPRISE */}
            {modalEmailType === "celebrant" && (
              <div className="rounded-2xl bg-[#FAF6F0] p-4 space-y-3 border border-[#241621]/10 shadow-inner animate-in fade-in duration-150">
                <div className="text-[11px] text-[#594855] space-y-1 pb-2 border-b border-[#241621]/10 font-mono">
                  <div><strong>From:</strong> SocioDex Celebrations &lt;events@sociodex.com&gt;</div>
                  <div><strong>To:</strong> {simulationModalJob.email || "(No email provided)"}</div>
                  <div><strong>Subject:</strong> {generateCelebrantBirthdayEmailSubject(simulationModalJob)}</div>
                  <div><strong>Time:</strong> 10:00 AM on Birthday Date</div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs space-y-3 text-xs text-[#241621]">
                  <div className="font-display text-sm font-bold text-[#E4603C]">
                    🎉 Happy {simulationModalJob.occasion}, {simulationModalJob.recipient}! 🎂
                  </div>
                  <p className="text-[#594855] leading-relaxed">
                    Today is all about YOU! Wishing you a sensational {simulationModalJob.occasion} filled with joy, health, and memorable celebrations!
                  </p>
                  <p className="text-[#594855] leading-relaxed">
                    🎁 <strong>SURPRISE!</strong> Your team and loved ones at{" "}
                    <strong>{simulationModalJob.organizerName || "SocioDex"}</strong> have secretly created a living digital memory page just for you!
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
            )}

            {/* EMAIL PREVIEW CARD 2: 1-DAY SECRET CONTRIBUTOR INVITATION */}
            {modalEmailType === "contributor" && (
              <div className="rounded-2xl bg-[#EFF6FF] p-4 space-y-3 border border-blue-200 shadow-inner animate-in fade-in duration-150">
                <div className="text-[11px] text-blue-900 space-y-1 pb-2 border-b border-blue-200 font-mono">
                  <div><strong>From:</strong> SocioDex Celebrations &lt;events@sociodex.com&gt;</div>
                  <div><strong>To:</strong> Organizer ({simulationModalJob.organizerEmail || "you"}) + {simulationModalJob.contributorEmails?.length || 0} Contributors</div>
                  <div><strong>Subject:</strong> {generateContributorEmailSubject(simulationModalJob)}</div>
                  <div><strong>Time:</strong> 10:00 AM (1 Day Before Birthday)</div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs space-y-3 text-xs text-[#241621]">
                  <div className="font-display text-sm font-bold text-blue-800">
                    🎨 Shh... Secret Celebration! Add your wishes & photos before tomorrow's reveal!
                  </div>
                  <p className="text-[#594855] leading-relaxed">
                    <strong>{simulationModalJob.recipient}'s {simulationModalJob.occasion} is TOMORROW!</strong> 🎂 We are secretly putting together a living memory page to surprise them tomorrow at 10:00 AM.
                  </p>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-800">
                      👉 Secret Collaboration Link (Add Wishes & Photos)
                    </div>
                    <div className="font-mono text-xs text-blue-700 font-semibold underline truncate">
                      {getKeepsakeUrl(simulationSlug || simulationModalJob.createdMemorySlug)}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#594855] leading-relaxed">
                    💡 <em>Please add your wishes early and invite other coworkers/friends so everyone's love is ready!</em>
                  </p>
                </div>
              </div>
            )}

            {/* Direct 1-Click Action Buttons */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#241621] uppercase tracking-wider">
                🚀 Dispatch Actions:
              </div>

              {/* 100% Autonomous Silent Trigger Button */}
              <button
                type="button"
                onClick={() => handleExecuteAutonomousSilentDispatch(simulationModalJob, modalEmailType)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-98 ${
                  modalEmailType === "celebrant"
                    ? "bg-[#E4603C] hover:bg-[#c94b29]"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>
                  {modalEmailType === "celebrant"
                    ? "⚡ Test Birthday Reveal Email (Resend API)"
                    : "🎨 Test 1-Day Contributor Invite Email (Resend API)"}
                </span>
              </button>

              <div className="flex gap-2 pt-1 border-t border-[#241621]/10">
                <button
                  type="button"
                  onClick={() => {
                    const text =
                      modalEmailType === "celebrant"
                        ? generateCelebrantBirthdayEmailBody(simulationModalJob, simulationSlug || simulationModalJob.createdMemorySlug)
                        : generateContributorEmailBody(simulationModalJob, simulationSlug || simulationModalJob.createdMemorySlug);
                    navigator.clipboard.writeText(text);
                    toast.success("Email text copied to clipboard!");
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
