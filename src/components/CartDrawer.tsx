import { useStore, comboTotal, cartTotal } from "@/lib/store";
import { PotPlantPreview } from "./PotPlantPreview";
import { X, Trash2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { combos, cartOpen, setCartOpen, removeCombo } = useStore();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-2xl">Your Cart</h2>
          <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {combos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="text-5xl">🌱</div>
              <p>Your cart is feeling a little leafless.</p>
              <p className="text-sm">Build your first combo to get started.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {combos.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <PotPlantPreview pot={c.pot} plant={c.plant} finish={c.finish} size={80} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.plant.name} × {c.pot.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.finish.emoji} {c.finish.name}</div>
                    <div className="mt-1 text-sm font-semibold text-primary">₹{comboTotal(c)}</div>
                  </div>
                  <button onClick={() => removeCombo(c.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-background/50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-semibold">₹{cartTotal(combos)}</span>
          </div>
          <Link
            to="/memory"
            onClick={() => setCartOpen(false)}
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity ${
              combos.length === 0 ? "pointer-events-none opacity-50" : "hover:opacity-90"
            }`}
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}
