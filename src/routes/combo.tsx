import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { POTS, PLANTS, FINISHES, type Pot, type Plant, type Finish } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PotPlantPreview } from "@/components/PotPlantPreview";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/combo")({
  head: () => ({
    meta: [
      { title: "Combo Builder — Nandi Invites" },
      { name: "description", content: "Design your gift: pick a pot, a plant, and an emotion. A living card to celebrate every moment." },
    ],
  }),
  component: ComboBuilder,
});

type Step = 0 | 1 | 2;
const STEPS = ["Pot", "Plant", "Emotion"] as const;

function ComboBuilder() {
  const [pot, setPot] = useState<Pot | undefined>();
  const [plant, setPlant] = useState<Plant | undefined>();
  const [finish, setFinish] = useState<Finish | undefined>();
  const [step, setStep] = useState<Step>(0);
  const addCombo = useStore((s) => s.addCombo);

  const total = (pot?.price ?? 0) + (plant?.price ?? 0) + (finish?.price ?? 0);
  const ready = pot && plant && finish;

  const items = useMemo(() => (step === 0 ? POTS : step === 1 ? PLANTS : FINISHES), [step]);
  const selectedId = step === 0 ? pot?.id : step === 1 ? plant?.id : finish?.id;

  const handleSelect = (item: Pot | Plant | Finish) => {
    if (step === 0) { setPot(item as Pot); setStep(1); }
    else if (step === 1) { setPlant(item as Plant); setStep(2); }
    else setFinish(item as Finish);
  };

  const handleAdd = () => {
    if (!ready) return;
    addCombo({ id: crypto.randomUUID(), pot, plant, finish });
    setPot(undefined); setPlant(undefined); setFinish(undefined); setStep(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-10 pb-6 text-center fade-up">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> A living gift, not just a present
        </div>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
          Build a <em className="text-primary not-italic">plant</em>, attach a memory.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Three quiet decisions. One thoughtful gift that grows long after the moment is over.
        </p>
      </section>

      <div className="grid gap-6 pb-12 lg:grid-cols-[1fr_420px]">
        {/* LEFT: Selectors */}
        <section className="card-soft p-5 sm:p-7">
          {/* Step tabs */}
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((label, i) => {
              const active = step === i;
              const done = (i === 0 && pot) || (i === 1 && plant) || (i === 2 && finish);
              return (
                <button
                  key={label}
                  onClick={() => setStep(i as Step)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    active ? "bg-primary-foreground text-primary" : done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {done && !active ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          <h2 className="font-display text-2xl">
            {step === 0 ? "Choose your pot" : step === 1 ? "Pick a plant" : "Add an emotion"}
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            {step === 0 ? "Material, mood, palette — find one that feels like them." : step === 1 ? "Each plant brings its own personality and care." : "A small emoji that frames the feeling."}
          </p>

          <div className={`grid gap-3 ${step === 2 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"}`}>
            {items.map((item) => {
              const selected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`group relative flex flex-col items-center rounded-2xl border bg-background p-3 text-center lift ${
                    selected ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="flex h-20 w-full items-center justify-center">
                    {step === 0 ? (
                      <PotPlantPreview pot={item as Pot} size={70} />
                    ) : step === 1 ? (
                      <PotPlantPreview plant={item as Plant} size={70} />
                    ) : (
                      <span className="text-4xl">{(item as Finish).emoji}</span>
                    )}
                  </div>
                  <div className="mt-2 truncate text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">₹{item.price}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* RIGHT: Sticky Preview */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card-soft overflow-hidden">
            <div className="bg-gradient-to-b from-secondary to-card p-6">
              <div className="flex flex-col items-center">
                <PotPlantPreview pot={pot} plant={plant} finish={finish} size={260} />
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      step === i ? "w-6 bg-primary" : (i === 0 && pot) || (i === 1 && plant) || (i === 2 && finish) ? "w-3 bg-primary/60" : "w-3 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Your combo</div>
                <h3 className="font-display text-2xl">
                  {plant?.name ?? "Your plant"} <span className="text-muted-foreground">×</span> {pot?.name ?? "your pot"}
                </h3>
                {finish && <div className="text-sm text-muted-foreground">{finish.emoji} {finish.name}</div>}
              </div>

              <div className="space-y-1 rounded-xl bg-background/60 p-3 text-sm">
                <Row label={pot ? `Pot · ${pot.name}` : "Pot"} val={pot ? `₹${pot.price}` : "—"} />
                <Row label={plant ? `Plant · ${plant.name}` : "Plant"} val={plant ? `₹${plant.price}` : "—"} />
                <Row label={finish ? `Emotion · ${finish.name}` : "Emotion"} val={finish ? `₹${finish.price}` : "—"} />
                <div className="my-1 border-t border-border" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-display text-xl">₹{total}</span>
                </div>
              </div>

              <button
                disabled={!ready}
                onClick={handleAdd}
                className="w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-90"
              >
                {ready ? "Add to cart" : "Complete all 3 steps"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="font-medium">{val}</span>
    </div>
  );
}
