import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pot, Plant, Finish, Guest } from "./data";
import { SAMPLE_GUESTS } from "./data";

export type Combo = { id: string; pot: Pot; plant: Plant; finish: Finish };

export type MemoryData = {
  slug: string;
  occasion: string;
  recipient: string;
  from: string;
  date: string;
  themeId: string;
  wishes: string[];
  photos: string[];   // data URLs
  audios: { id: string; name: string; url: string }[];
  videos: { id: string; name: string; url: string }[];
};

type State = {
  combos: Combo[];
  cartOpen: boolean;
  memory: MemoryData | null;
  guests: Guest[];

  addCombo: (c: Combo) => void;
  removeCombo: (id: string) => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;

  setMemory: (m: MemoryData) => void;

  addGuest: (g: Guest) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: Guest["rsvp"]) => void;
  sendInvites: (ids: string[]) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      combos: [],
      cartOpen: false,
      memory: null,
      guests: SAMPLE_GUESTS,

      addCombo: (c) => set((s) => ({ combos: [...s.combos, c], cartOpen: true })),
      removeCombo: (id) => set((s) => ({ combos: s.combos.filter((x) => x.id !== id) })),
      setCartOpen: (open) => set({ cartOpen: open }),
      clearCart: () => set({ combos: [] }),

      setMemory: (m) => set({ memory: m }),

      addGuest: (g) => set((s) => ({ guests: [...s.guests, g] })),
      updateGuest: (id, patch) => set((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGuest: (id) => set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),
      setGuestRsvp: (id, rsvp) => set((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, rsvp } : g)) })),
      sendInvites: (ids) =>
        set((s) => ({
          guests: s.guests.map((g) =>
            ids.includes(g.id) ? { ...g, invite: "sent", delivery: g.delivery === "not-sent" ? "transit" : g.delivery } : g
          ),
        })),
    }),
    {
      name: "nandi-store",
      // Photos are base64 data URLs (can be several MB each) and audio/video are
      // blob URLs — all are session-only and must NOT be written to localStorage
      // or we hit a 5 MB QuotaExceededError that silently breaks setMemory().
      partialize: (s) => ({
        combos: s.combos,
        guests: s.guests,
        memory: s.memory
          ? {
              ...s.memory,
              photos: [],   // strip base64 images — session only
              audios: [],   // strip blob URLs — session only
              videos: [],   // strip blob URLs — session only
            }
          : null,
      }),
    }
  )
);

export const comboTotal = (c: Combo) => c.pot.price + c.plant.price + c.finish.price;
export const cartTotal = (combos: Combo[]) => combos.reduce((sum, c) => sum + comboTotal(c), 0);
