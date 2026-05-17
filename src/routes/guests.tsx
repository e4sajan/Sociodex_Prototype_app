import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Guest } from "@/lib/data";
import { Search, Plus, Upload, Download, Send, Edit2, Trash2, X, Mail, MessageCircle, Smartphone } from "lucide-react";

export const Route = createFileRoute("/guests")({
  head: () => ({
    meta: [
      { title: "Guest Manager — Nandi Invites" },
      { name: "description", content: "Add recipients, send invites and track delivery for every gift." },
    ],
  }),
  component: GuestManager,
});

const RSVP_BADGE: Record<Guest["rsvp"], string> = {
  attending: "bg-primary/15 text-primary",
  declined:  "bg-destructive/15 text-destructive",
  pending:   "bg-accent/15 text-accent",
};
const INVITE_BADGE: Record<Guest["invite"], string> = {
  "not-sent": "bg-muted text-muted-foreground",
  "sent":     "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "viewed":   "bg-primary/15 text-primary",
};
const DELIV_BADGE: Record<Guest["delivery"], string> = {
  "not-sent":  "bg-muted text-muted-foreground",
  "transit":   "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "delivered": "bg-primary/15 text-primary",
  "failed":    "bg-destructive/15 text-destructive",
};

function GuestManager() {
  const { guests, addGuest, updateGuest, removeGuest, sendInvites } = useStore();
  const [q, setQ] = useState("");
  const [rsvpF, setRsvpF] = useState<"all" | Guest["rsvp"]>("all");
  const [invF, setInvF] = useState<"all" | Guest["invite"]>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showInvite, setShowInvite] = useState<{ ids: string[] } | null>(null);

  const filtered = useMemo(() => guests.filter((g) => {
    const t = `${g.firstName} ${g.lastName} ${g.email} ${g.city}`.toLowerCase();
    if (q && !t.includes(q.toLowerCase())) return false;
    if (rsvpF !== "all" && g.rsvp !== rsvpF) return false;
    if (invF !== "all" && g.invite !== invF) return false;
    return true;
  }), [guests, q, rsvpF, invF]);

  const stats = useMemo(() => ({
    total: guests.length,
    attending: guests.filter((g) => g.rsvp === "attending").length,
    declined: guests.filter((g) => g.rsvp === "declined").length,
    pending: guests.filter((g) => g.rsvp === "pending").length,
  }), [guests]);

  const allSelected = filtered.length > 0 && filtered.every((g) => selected.includes(g.id));
  const toggleAll = () => setSelected(allSelected ? selected.filter((id) => !filtered.some((g) => g.id === id)) : Array.from(new Set([...selected, ...filtered.map((g) => g.id)])));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 fade-up">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Guest Manager</h1>
          <p className="text-muted-foreground">Add, invite and track every recipient.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total Guests"  value={stats.total}     tone="ink" />
        <Stat label="Attending"     value={stats.attending} tone="green" />
        <Stat label="Declined"      value={stats.declined}  tone="red" />
        <Stat label="Pending"       value={stats.pending}   tone="amber" />
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or city" className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <select value={rsvpF} onChange={(e) => setRsvpF(e.target.value as any)} className="rounded-full border border-border bg-card px-4 py-2.5 text-sm">
          <option value="all">All RSVPs</option><option value="attending">Attending</option><option value="declined">Declined</option><option value="pending">Pending</option>
        </select>
        <select value={invF} onChange={(e) => setInvF(e.target.value as any)} className="rounded-full border border-border bg-card px-4 py-2.5 text-sm">
          <option value="all">All Invites</option><option value="not-sent">Not sent</option><option value="sent">Sent</option><option value="viewed">Viewed</option>
        </select>
        {selected.length > 0 && (
          <button onClick={() => setShowInvite({ ids: selected })} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90">
            <Send className="h-4 w-4" /> Send {selected.length} invites
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Invite</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(g.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, g.id] : selected.filter((id) => id !== g.id))} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {g.firstName[0]}{g.lastName[0]}
                      </span>
                      <div>
                        <div className="font-medium">{g.firstName} {g.lastName}</div>
                        <div className="text-xs text-muted-foreground">{g.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="truncate max-w-[200px]">{g.street}</div>
                    <div className="text-xs">{g.city} · {g.pin}</div>
                  </td>
                  <td className="px-4 py-3"><Badge cls={RSVP_BADGE[g.rsvp]}>{g.rsvp}</Badge></td>
                  <td className="px-4 py-3"><Badge cls={INVITE_BADGE[g.invite]}>{g.invite}</Badge></td>
                  <td className="px-4 py-3"><Badge cls={DELIV_BADGE[g.delivery]}>{g.delivery}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setShowInvite({ ids: [g.id] })} title="Send invite" className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"><Send className="h-4 w-4" /></button>
                      <button onClick={() => setEditing(g)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => removeGuest(g.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No guests match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(showAdd || editing) && (
        <GuestModal
          guest={editing}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSave={(g) => {
            if (editing) updateGuest(editing.id, g);
            else addGuest({ ...g, id: crypto.randomUUID(), rsvp: "pending", invite: "not-sent", delivery: "not-sent" } as Guest);
            setShowAdd(false); setEditing(null);
          }}
        />
      )}
      {showInvite && (
        <InviteModal
          count={showInvite.ids.length}
          onClose={() => setShowInvite(null)}
          onSend={() => { sendInvites(showInvite.ids); setSelected([]); setShowInvite(null); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ink" | "green" | "red" | "amber" }) {
  const ring = { ink: "bg-foreground/5", green: "bg-primary/10", red: "bg-destructive/10", amber: "bg-accent/10" }[tone];
  const fg   = { ink: "text-foreground", green: "text-primary", red: "text-destructive", amber: "text-accent" }[tone];
  return (
    <div className="card-soft flex items-center gap-3 p-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ring} ${fg} font-display text-xl font-semibold`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>{children}</span>;
}

function GuestModal({ guest, onClose, onSave }: { guest: Guest | null; onClose: () => void; onSave: (g: Partial<Guest>) => void }) {
  const [form, setForm] = useState<Partial<Guest>>(guest ?? { firstName: "", lastName: "", email: "", phone: "", street: "", city: "", pin: "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl">{guest ? "Edit guest" : "Add guest"}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["firstName", "First name"], ["lastName", "Last name"],
            ["email", "Email"], ["phone", "Phone"],
            ["street", "Street"], ["city", "City"], ["pin", "PIN"],
          ].map(([k, label]) => (
            <label key={k} className={k === "street" ? "sm:col-span-2" : ""}>
              <div className="mb-1 text-sm font-medium">{label}</div>
              <input value={(form as any)[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.firstName || !form.city}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            Save guest
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ count, onClose, onSend }: { count: number; onClose: () => void; onSend: () => void }) {
  const [channel, setChannel] = useState<"email" | "whatsapp" | "sms">("email");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl">Send {count} invite{count > 1 ? "s" : ""}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "email" as const, label: "Email", Icon: Mail },
            { k: "whatsapp" as const, label: "WhatsApp", Icon: MessageCircle },
            { k: "sms" as const, label: "SMS", Icon: Smartphone },
          ].map(({ k, label, Icon }) => (
            <button key={k} onClick={() => setChannel(k)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm transition ${channel === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
              <Icon className="h-5 w-5" />{label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm">
          <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Message preview</div>
          You're invited 🌱 — open your personal memory page from us. Tap to view photos, wishes, and RSVP.
        </div>
        <button onClick={onSend} className="mt-5 w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90">
          Send via {channel}
        </button>
      </div>
    </div>
  );
}
