import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Guest } from "@/lib/data";
import { ACTIVITIES } from "@/lib/data";
import { TrendingUp, Search } from "lucide-react";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Tracker — Nandi Invites" },
      { name: "description", content: "Real-time delivery and RSVP analytics for your gift list." },
    ],
  }),
  component: Tracker,
});

function Tracker() {
  const guests = useStore((s) => s.guests);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<keyof Guest>("firstName");

  const counts = useMemo(() => ({
    attending: guests.filter((g) => g.rsvp === "attending").length,
    declined:  guests.filter((g) => g.rsvp === "declined").length,
    pending:   guests.filter((g) => g.rsvp === "pending").length,
    delivered: guests.filter((g) => g.delivery === "delivered").length,
    transit:   guests.filter((g) => g.delivery === "transit").length,
    notSent:   guests.filter((g) => g.delivery === "not-sent").length,
    failed:    guests.filter((g) => g.delivery === "failed").length,
    sent:      guests.filter((g) => g.invite !== "not-sent").length,
  }), [guests]);

  const total = guests.length || 1;
  const attendingPct = Math.round((counts.attending / total) * 100);

  const sorted = useMemo(() => {
    const f = guests.filter((g) => `${g.firstName} ${g.lastName} ${g.city}`.toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));
  }, [guests, q, sortKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl">Delivery & RSVP Tracker</h1>
        <p className="text-muted-foreground">Live status of every gift and every guest.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Donut */}
        <div className="card-soft p-6">
          <div className="mb-2 text-sm font-semibold text-muted-foreground">RSVP breakdown</div>
          <Donut attending={counts.attending} declined={counts.declined} pending={counts.pending} />
          <div className="mt-4 space-y-2 text-sm">
            <Legend dotClass="bg-primary"     label="Attending" value={counts.attending} />
            <Legend dotClass="bg-accent"      label="Pending"   value={counts.pending} />
            <Legend dotClass="bg-destructive" label="Declined"  value={counts.declined} />
          </div>
        </div>

        {/* Progress bars */}
        <div className="card-soft p-6">
          <div className="mb-4 text-sm font-semibold text-muted-foreground">Delivery pipeline</div>
          <ProgressRow label="Delivered" value={counts.delivered} total={total} color="var(--color-primary)" />
          <ProgressRow label="In transit" value={counts.transit} total={total} color="oklch(0.78 0.13 65)" />
          <ProgressRow label="Sent (invite)" value={counts.sent} total={total} color="oklch(0.55 0.12 250)" />
          <ProgressRow label="Failed" value={counts.failed} total={total} color="var(--color-destructive)" />
        </div>

        {/* Attendance insight */}
        <div className="card-soft flex flex-col justify-between bg-gradient-to-br from-primary/5 to-accent/5 p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <TrendingUp className="h-4 w-4" /> Attendance
            </div>
            <div className="font-display text-6xl font-semibold leading-none">{attendingPct}%</div>
            <div className="text-sm text-muted-foreground">of guests are attending</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Mini num={counts.attending} label="Yes" />
            <Mini num={counts.pending}   label="Pending" />
            <Mini num={counts.declined}  label="No" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Map */}
        <div className="card-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="text-sm font-semibold">Delivery map</div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <Legend dotClass="bg-primary"     label="Attending" />
              <Legend dotClass="bg-accent"      label="Pending" />
              <Legend dotClass="bg-destructive" label="Declined" />
            </div>
          </div>
          <MapMock guests={guests} />
        </div>

        {/* Activity */}
        <div className="card-soft p-5">
          <div className="mb-3 text-sm font-semibold">Activity feed</div>
          <ul className="space-y-3">
            {ACTIVITIES.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
                <div className="flex-1">
                  <div className="text-sm">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Guest table */}
      <div className="mt-5 card-soft overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
          <div className="text-sm font-semibold">Guest status</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm" />
            </div>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as keyof Guest)} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
              <option value="firstName">Name</option>
              <option value="city">City</option>
              <option value="rsvp">RSVP</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">City</th><th className="px-4 py-3">RSVP</th><th className="px-4 py-3">Delivery</th></tr>
            </thead>
            <tbody>
              {sorted.map((g) => (
                <tr key={g.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{g.firstName} {g.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.city}</td>
                  <td className="px-4 py-3 capitalize">{g.rsvp}</td>
                  <td className="px-4 py-3 capitalize">{g.delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Donut({ attending, declined, pending }: { attending: number; declined: number; pending: number }) {
  const total = Math.max(1, attending + declined + pending);
  const C = 2 * Math.PI * 60;
  const seg = (n: number) => (n / total) * C;
  const a = seg(attending), p = seg(pending), d = seg(declined);
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r="60" stroke="var(--color-muted)" strokeWidth="20" fill="none" />
        <circle cx="80" cy="80" r="60" stroke="var(--color-primary)" strokeWidth="20" fill="none"
          strokeDasharray={`${a} ${C - a}`} strokeDashoffset="0" strokeLinecap="round" />
        <circle cx="80" cy="80" r="60" stroke="var(--color-accent)" strokeWidth="20" fill="none"
          strokeDasharray={`${p} ${C - p}`} strokeDashoffset={-a} strokeLinecap="round" />
        <circle cx="80" cy="80" r="60" stroke="var(--color-destructive)" strokeWidth="20" fill="none"
          strokeDasharray={`${d} ${C - d}`} strokeDashoffset={-(a + p)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-semibold">{attending + declined + pending}</div>
        <div className="text-xs text-muted-foreground">Total guests</div>
      </div>
    </div>
  );
}

function Legend({ dotClass, label, value }: { dotClass: string; label: string; value?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className="text-muted-foreground">{label}</span>
      {value !== undefined && <span className="ml-auto font-semibold">{value}</span>}
    </div>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value} · {pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Mini({ num, label }: { num: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card/70 p-3">
      <div className="font-display text-2xl font-semibold">{num}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MapMock({ guests }: { guests: Guest[] }) {
  // Simple equirectangular projection on India bounding box
  const minLng = 68, maxLng = 92, minLat = 8, maxLat = 32;
  const proj = (lng: number, lat: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: ((maxLat - lat) / (maxLat - minLat)) * 100,
  });
  const colorFor = (g: Guest) => g.rsvp === "attending" ? "var(--color-primary)" : g.rsvp === "declined" ? "var(--color-destructive)" : "var(--color-accent)";
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_30%_20%,oklch(0.92_0.04_180/.5),transparent_50%),radial-gradient(circle_at_70%_70%,oklch(0.92_0.04_85/.6),transparent_55%)]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 L0 0 0 10" stroke="rgba(92,61,46,0.08)" fill="none" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {/* India silhouette */}
        <path d="M30,20 Q45,15 60,18 Q75,22 78,40 Q75,58 65,72 Q55,85 45,82 Q30,78 25,60 Q22,40 30,20 Z"
          fill="var(--color-primary)" opacity="0.10" stroke="var(--color-primary)" strokeOpacity="0.25" strokeWidth="0.4" />
      </svg>
      {guests.filter((g) => g.lat && g.lng).map((g) => {
        const { x, y } = proj(g.lng!, g.lat!);
        return (
          <div key={g.id} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="block h-3 w-3 rounded-full ring-2 ring-card shadow" style={{ background: colorFor(g) }} />
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] text-background opacity-0 shadow group-hover:opacity-100">
              {g.firstName} · {g.city} · {g.rsvp}
            </div>
          </div>
        );
      })}
    </div>
  );
}
