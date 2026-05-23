import { useState } from "react";
import { useStore, comboTotal } from "@/lib/store";
import { PotPlantPreview } from "./PotPlantPreview";
import { X, Trash2, ArrowRight, Gift, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { combos, cartOpen, setCartOpen, removeCombo, guests, addGuest, updateGuest, clearCart } =
    useStore();
  const [selectedGuestsMap, setSelectedGuestsMap] = useState<Record<string, string[]>>({});
  const [activeItemSelector, setActiveItemSelector] = useState<string | null>(null);

  // Quick add guest pop-up modal state
  const [quickAddComboId, setQuickAddComboId] = useState<string | null>(null); // holds c.id when modal is open
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestStreet, setNewGuestStreet] = useState("");
  const [newGuestCity, setNewGuestCity] = useState("");
  const [newGuestPin, setNewGuestPin] = useState("");

  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState<{
    totalQuantity: number;
    totalPrice: number;
    guestNames: string;
  } | null>(null);

  const totalQuantity = combos.reduce((sum, c) => {
    const selected = selectedGuestsMap[c.id] || [];
    return sum + selected.length;
  }, 0);

  const totalPrice = combos.reduce((sum, c) => {
    const selected = selectedGuestsMap[c.id] || [];
    return sum + comboTotal(c) * selected.length;
  }, 0);

  const handleQuickAddGuest = (comboId: string) => {
    if (
      !newGuestName.trim() ||
      !newGuestStreet.trim() ||
      !newGuestCity.trim() ||
      !newGuestPin.trim()
    )
      return;

    const names = newGuestName.trim().split(" ");
    const firstName = names[0] || "Guest";
    const lastName = names.slice(1).join(" ") || "";
    const newId = crypto.randomUUID();

    // Add guest to global Zustand store with full shipping details
    addGuest({
      id: newId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase() || "guest"}@example.com`,
      phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
      city: newGuestCity.trim(),
      street: newGuestStreet.trim(),
      pin: newGuestPin.trim(),
      rsvp: "pending",
      invite: "not-sent",
      delivery: "not-sent",
    });

    // Auto-select this newly created guest for the current combo item
    setSelectedGuestsMap((prev) => ({
      ...prev,
      [comboId]: [...(prev[comboId] || []), newId],
    }));

    // Reset quick add modal inputs
    setQuickAddComboId(null);
    setNewGuestName("");
    setNewGuestStreet("");
    setNewGuestCity("");
    setNewGuestPin("");
  };

  const handleConfirmCheckout = () => {
    const allSelectedGuestIds = new Set<string>();
    combos.forEach((c) => {
      const selected = selectedGuestsMap[c.id] || [];
      selected.forEach((id) => allSelectedGuestIds.add(id));
    });

    const selectedGuestNames = Array.from(allSelectedGuestIds)
      .map((id) => {
        const g = guests.find((guest) => guest.id === id);
        return g ? `${g.firstName} ${g.lastName}` : "";
      })
      .filter(Boolean)
      .join(", ");

    // Update guest delivery status to "transit" in store
    allSelectedGuestIds.forEach((id) => {
      updateGuest(id, { delivery: "transit", invite: "sent" });
    });

    setConfirmedDetails({
      totalQuantity,
      totalPrice,
      guestNames: selectedGuestNames || "Selected Guests",
    });

    setOrderConfirmed(true);
    clearCart();
  };

  if (orderConfirmed && confirmedDetails) {
    return (
      <>
        <div
          className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={() => {
            setOrderConfirmed(false);
            setCartOpen(false);
          }}
        />
        <aside
          className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border p-5 bg-primary/5">
            <h2 className="font-display text-2xl text-primary font-bold">🎉 Keepsake Confirmed!</h2>
            <button
              onClick={() => {
                setOrderConfirmed(false);
                setCartOpen(false);
              }}
              className="rounded-full p-2 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Order Successfully Placed!</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              We have linked your personalized memory page as a QR code and printed it on{" "}
              <strong>{confirmedDetails.totalQuantity} custom keepsake plant pots</strong>!
            </p>

            <div className="w-full bg-muted/40 rounded-2xl p-4 border border-border/30 text-left text-xs mb-6 space-y-2">
              <div className="font-semibold text-foreground uppercase tracking-wide">
                Recipients & Keepsakes
              </div>
              <div className="text-muted-foreground leading-relaxed">
                Sent to:{" "}
                <span className="text-foreground font-medium">{confirmedDetails.guestNames}</span>
              </div>
              <div className="flex justify-between border-t border-border/20 pt-2 text-foreground font-semibold">
                <span>Total Amount Paid</span>
                <span>₹{confirmedDetails.totalPrice}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-300/30 rounded-lg p-2 max-w-sm">
              <span>
                🌱 Recipient tracking code generated. Delivery statuses have been updated to{" "}
                <strong>In Transit</strong> in the Guest Manager!
              </span>
            </div>

            <Link
              to="/guests"
              onClick={() => {
                setOrderConfirmed(false);
                setCartOpen(false);
              }}
              className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground text-center hover:opacity-90 transition shadow-md shadow-primary/10"
            >
              Track Deliveries in Guest Manager
            </Link>
          </div>
        </aside>
      </>
    );
  }

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
          <h2 className="font-display text-2xl font-bold">Your Keepsake Cart</h2>
          <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {combos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="text-5xl">🌱</div>
              <p className="font-display font-medium text-foreground">
                Your keepsake cart is currently empty.
              </p>
              <p className="text-sm">
                Build a custom plant pot keepsake and attach a digital memory!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {combos.map((c) => {
                const selectedGuests = selectedGuestsMap[c.id] || [];
                const itemQuantity = selectedGuests.length;
                const itemSubtotal = comboTotal(c) * itemQuantity;

                return (
                  <li
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3.5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <PotPlantPreview pot={c.pot} plant={c.plant} finish={c.finish} size={80} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-sm">
                          {c.plant.name} × {c.pot.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.finish.emoji} {c.finish.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-primary">
                            ₹{comboTotal(c)} each
                          </span>
                          {itemQuantity > 0 && (
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              × {itemQuantity} ={" "}
                              <span className="text-primary font-bold">₹{itemSubtotal}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCombo(c.id)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 self-start"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Interactive Glassmorphic Recipient Status Card (High-Conversion Nudge) */}
                    <div
                      onClick={() =>
                        setActiveItemSelector(activeItemSelector === c.id ? null : c.id)
                      }
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        itemQuantity === 0
                          ? "border-amber-300 bg-amber-500/5 hover:bg-amber-500/10 shadow-sm shadow-amber-500/5 animate-pulse"
                          : "border-primary bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${itemQuantity === 0 ? "bg-amber-500/20 text-amber-600" : "bg-primary/20 text-primary"}`}
                        >
                          <Gift className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground leading-none">
                            Recipient Connection
                          </div>
                          <div className="text-xs font-bold text-foreground mt-1">
                            {itemQuantity === 0 ? (
                              <span className="text-amber-700 dark:text-amber-400">
                                ⚠️ No recipients connected yet
                              </span>
                            ) : (
                              <span className="text-primary">
                                {itemQuantity} Recipient{itemQuantity > 1 ? "s" : ""} Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Small initials avatar stack for linked recipients */}
                        {itemQuantity > 0 && (
                          <div className="flex -space-x-1.5 overflow-hidden mr-1">
                            {selectedGuests.slice(0, 3).map((id) => {
                              const g = guests.find((guest) => guest.id === id);
                              if (!g) return null;
                              return (
                                <span
                                  key={id}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground border border-background ring-1 ring-primary/10"
                                >
                                  {g.firstName[0]}
                                </span>
                              );
                            })}
                            {itemQuantity > 3 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground border border-background">
                                +{itemQuantity - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {activeItemSelector === c.id ? "Minimize ▴" : "Personalize ▾"}
                        </span>
                      </div>
                    </div>

                    {/* Recipient Configurator Panel */}
                    {activeItemSelector === c.id && (
                      <div className="mt-1 rounded-xl bg-muted/40 p-3 border border-border/30 max-h-[380px] overflow-y-auto space-y-2 fade-up">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-2 border-b border-border/20">
                          <span>Choose who receives this keepsake:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const allIds = guests.map((g) => g.id);
                                setSelectedGuestsMap((prev) => ({ ...prev, [c.id]: allIds }));
                              }}
                              className="text-[10px] text-primary font-bold hover:underline"
                            >
                              Select All
                            </button>
                            <span className="text-border">|</span>
                            <button
                              onClick={() =>
                                setSelectedGuestsMap((prev) => ({ ...prev, [c.id]: [] }))
                              }
                              className="text-[10px] text-muted-foreground font-bold hover:underline"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Guest List Checklist */}
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {guests.length === 0 ? (
                            <div className="text-[10px] text-muted-foreground text-center py-2">
                              No guests found. Add some recipients using the button below!
                            </div>
                          ) : (
                            guests.map((g) => {
                              const isChecked = selectedGuests.includes(g.id);
                              return (
                                <label
                                  key={g.id}
                                  className="flex items-center gap-2.5 cursor-pointer py-1.5 hover:bg-muted/70 rounded-lg px-2 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = isChecked
                                        ? selectedGuests.filter((id) => id !== g.id)
                                        : [...selectedGuests, g.id];
                                      setSelectedGuestsMap((prev) => ({ ...prev, [c.id]: next }));
                                    }}
                                    className="h-3.5 w-3.5 rounded text-primary focus:ring-primary/20 cursor-pointer"
                                  />
                                  <div className="min-w-0 flex-1 text-left">
                                    <span className="text-[11px] text-foreground font-medium block">
                                      {g.firstName} {g.lastName}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground block truncate">
                                      📍 {g.street}, {g.city} ({g.pin})
                                    </span>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>

                        {/* Trigger Quick Add Pop-up Modal */}
                        <div className="border-t border-border/20 pt-2">
                          <button
                            onClick={() => setQuickAddComboId(c.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-primary/30 hover:border-primary text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-all hover:scale-[1.01]"
                          >
                            ➕ Add recipient with delivery address
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Dynamic, High-Conversion Pricing & Secured Payment Footer */}
        <div className="border-t border-border bg-gradient-to-b from-background/30 to-background/90 p-5 shadow-inner">
          <div className="mb-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Keepsakes Base Price</span>
              <span>₹{combos.reduce((sum, c) => sum + comboTotal(c), 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Keepsakes Order Quantity</span>
              <span className="font-semibold text-foreground">{totalQuantity} Units</span>
            </div>
            <div className="my-1 border-t border-border/20" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-foreground block">Order Total</span>
                <span className="text-[10px] text-muted-foreground">
                  All custom QR pot prints included
                </span>
              </div>
              <span className="font-display text-3xl font-extrabold text-primary">
                ₹{totalPrice}
              </span>
            </div>
          </div>

          {/* Secured Trust Badges Strip (Conversion Booster) */}
          <div className="mb-4 flex items-center justify-center gap-3 text-[9px] uppercase tracking-wider text-muted-foreground font-bold border-t border-b border-border/10 py-2">
            <span className="flex items-center gap-1">🔒 Secured Checkout</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">🌱 Living Keepsake</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">🚚 Safe Transit</span>
          </div>

          {totalQuantity === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-500/5 p-3 text-center text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Connect recipients above to complete checkout</span>
            </div>
          ) : (
            <button
              onClick={handleConfirmCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary px-5 py-4 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] animate-pulse"
            >
              Pay & Ship Keepsakes Now · ₹{totalPrice} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Quick Add Guest Pop-up Modal Window (Overlay above the Cart Drawer) */}
      {quickAddComboId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => {
            setQuickAddComboId(null);
            setNewGuestName("");
            setNewGuestStreet("");
            setNewGuestCity("");
            setNewGuestPin("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card border border-border/40 p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold flex items-center gap-1.5 text-primary">
                  <span>👤 New Recipient Details</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Attach full delivery details to custom-ship this keepsake.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuickAddComboId(null);
                  setNewGuestName("");
                  setNewGuestStreet("");
                  setNewGuestCity("");
                  setNewGuestPin("");
                }}
                className="rounded-full p-2 hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Full Name
                </label>
                <input
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Arjun Nair"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Shipping / Street Address
                </label>
                <input
                  value={newGuestStreet}
                  onChange={(e) => setNewGuestStreet(e.target.value)}
                  placeholder="e.g. Flat 302, Green Meadows, Pali Hill"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">City</label>
                  <input
                    value={newGuestCity}
                    onChange={(e) => setNewGuestCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    PIN Code
                  </label>
                  <input
                    value={newGuestPin}
                    onChange={(e) => setNewGuestPin(e.target.value)}
                    placeholder="e.g. 400050"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-border/20">
              <button
                onClick={() => {
                  setQuickAddComboId(null);
                  setNewGuestName("");
                  setNewGuestStreet("");
                  setNewGuestCity("");
                  setNewGuestPin("");
                }}
                className="rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleQuickAddGuest(quickAddComboId)}
                disabled={
                  !newGuestName.trim() ||
                  !newGuestStreet.trim() ||
                  !newGuestCity.trim() ||
                  !newGuestPin.trim()
                }
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50 transition shadow-md shadow-primary/10 hover:opacity-95"
              >
                Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
