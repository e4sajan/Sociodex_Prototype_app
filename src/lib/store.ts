import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pot, Plant, Finish, Guest } from "./data";
import { SAMPLE_GUESTS } from "./data";

export type Combo = { id: string; pot: Pot; plant: Plant; finish: Finish };

export type UserSession = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string; // Emoji avatar
  provider: "google" | "phone" | "email";
};

export type Collaborator = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "contributor";
  status: "pending" | "accepted";
  inviteSentVia?: "whatsapp" | "email" | "link";
};

export type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByMe?: boolean;
  avatar: string; // emoji or designator
};

export type ContributedMedia = {
  id: string;
  src: string; // base64 URL or blob URL
  type: "photo" | "video";
  contributorName: string;
  likes: number;
  likedByMe?: boolean;
  timestamp: string;
};

export type CollaborationRequest = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  requestedActions: {
    addPhotos: boolean;
    addVideos: boolean;
    addComments: boolean;
  };
  status: "pending" | "approved" | "declined";
  timestamp: string;
};

export type SimulatedContribution = {
  id: string;
  memory_page_id: string;
  contributor_id: string; // auth.users.id
  contributor_name: string;
  contributor_avatar_color: string; // Hex color code
  type: "wish" | "photo" | "audio" | "video";
  content_text?: string;
  media_urls?: string[]; // Array of strings (data URL/blob/external)
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type SimulatedReaction = {
  id: string;
  contribution_id: string;
  user_id: string; // contributor_id or simulator user name
  type: "heart" | "clap" | "hug";
  created_at: string;
};

export type SimulatedReply = {
  id: string;
  contribution_id: string;
  author_id: string;
  author_name: string;
  content_text: string;
  created_at: string;
};

export type MemoryData = {
  slug: string;
  occasion: string;
  recipient: string;
  from: string;
  date: string;
  themeId: string;
  wishes: string[];
  photos: string[]; // data URLs
  audios: { id: string; name: string; url: string }[];
  videos: { id: string; name: string; url: string }[];

  // Dynamic social platform features
  visibility: "public" | "friends";
  allowedActions: {
    addPhotos: boolean;
    addVideos: boolean;
    addComments: boolean;
  };
  collaborators: Collaborator[];
  comments: Comment[];
  contributedMedia: ContributedMedia[];
  collaborationRequests: CollaborationRequest[];

  // Community-Driven Page Upgrade fields
  contributionMode: "open" | "guests" | "closed";
  autoApprove: boolean;
  pinnedContributionIds: string[];
  expiresAt: string | null;
  contributions: SimulatedContribution[];
  reactions: SimulatedReaction[];
  replies: SimulatedReply[];

  // 4 Page Roles & Access Rules: Creator, Admin, Contributor, Follower
  creatorEmail?: string;
  creatorName?: string;
  followers?: string[];

  // Invitation fields
  pageType?: "wish" | "invite";
  isInvitation?: boolean;
  coupleNames?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
  dressCode?: string;
  registryInfo?: string;
  timeline?: { time: string; event: string }[];
  isCorporate?: boolean;
  corporateLogo?: string;
};

type State = {
  combos: Combo[];
  cartOpen: boolean;
  memory: MemoryData | null;
  memories: Record<string, MemoryData>; // Dynamic multi-memory map
  guests: Guest[];
  currentUser: UserSession | null;

  login: (user: UserSession) => void;
  logout: () => void;

  addCombo: (c: Combo) => void;
  removeCombo: (id: string) => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;

  setMemory: (
    m: Partial<MemoryData> &
      Pick<
        MemoryData,
        | "slug"
        | "occasion"
        | "recipient"
        | "from"
        | "date"
        | "themeId"
        | "wishes"
        | "photos"
        | "audios"
        | "videos"
      >,
  ) => void;
  addMemory: (m: MemoryData) => void;
  updateMemory: (slug: string, patch: Partial<MemoryData>) => void;
  addCommentToMemory: (slug: string, comment: Comment) => void;
  addContributedMediaToMemory: (slug: string, media: ContributedMedia) => void;
  likeComment: (slug: string, commentId: string) => void;
  likeMedia: (slug: string, mediaId: string) => void;
  addCollaboratorToMemory: (slug: string, collaborator: Collaborator) => void;
  removeCollaboratorFromMemory: (slug: string, id: string) => void;
  updateCollaboratorInMemory: (slug: string, id: string, patch: Partial<Collaborator>) => void;
  addCollaborationRequest: (slug: string, request: CollaborationRequest) => void;
  handleCollaborationRequest: (
    slug: string,
    requestId: string,
    action: "approve" | "decline",
  ) => void;

  // New simulated contribution methods
  addSimulatedContribution: (slug: string, contribution: SimulatedContribution) => void;
  updateSimulatedContributionStatus: (
    slug: string,
    id: string,
    status: "pending" | "approved" | "rejected",
  ) => void;
  deleteSimulatedContribution: (slug: string, id: string) => void;
  editSimulatedContributionText: (slug: string, id: string, newText: string) => void;
  toggleSimulatedReaction: (
    slug: string,
    contributionId: string,
    userId: string,
    type: "heart" | "clap" | "hug",
  ) => void;
  addSimulatedReply: (slug: string, reply: SimulatedReply) => void;
  deleteSimulatedReply: (slug: string, replyId: string) => void;
  updatePageSettings: (
    slug: string,
    settings: Partial<{
      contributionMode: "open" | "guests" | "closed";
      autoApprove: boolean;
      pinnedContributionIds: string[];
      expiresAt: string | null;
    }>,
  ) => void;

  addGuest: (g: Guest) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: Guest["rsvp"]) => void;
  sendInvites: (ids: string[]) => void;
  toggleFollowPage: (slug: string, userNameOrEmail: string) => void;
};

// Initial setup helper for newly created/mocked memories
const createDefaultMemoryData = (
  slug: string,
): Omit<
  MemoryData,
  | "slug"
  | "occasion"
  | "recipient"
  | "from"
  | "date"
  | "themeId"
  | "wishes"
  | "photos"
  | "audios"
  | "videos"
> => ({
  visibility: "public",
  allowedActions: { addPhotos: true, addVideos: true, addComments: true },
  collaborators: [],
  comments: [],
  contributedMedia: [],
  collaborationRequests: [],
  contributionMode: "open",
  autoApprove: false,
  pinnedContributionIds: [],
  expiresAt: null,
  contributions: [],
  reactions: [],
  replies: [],
  followers: [],
});

export const useStore = create<State>()(
  persist(
    (set) => ({
      combos: [],
      cartOpen: false,
      memory: null,
      memories: {},
      guests: [],
      currentUser: null,

      login: (u) => set({ currentUser: u }),
      logout: () => set({ currentUser: null }),

      addCombo: (c) => set((s) => ({ combos: [...s.combos, c], cartOpen: true })),
      removeCombo: (id) => set((s) => ({ combos: s.combos.filter((x) => x.id !== id) })),
      setCartOpen: (open) => set({ cartOpen: open }),
      clearCart: () => set({ combos: [] }),

      setMemory: (m) =>
        set((s) => {
          const defaults = createDefaultMemoryData(m.slug);
          const fullMemory: MemoryData = {
            ...defaults,
            ...m,
            // Ensure fields are initialized as arrays if undefined
            contributions: m.contributions || defaults.contributions,
            reactions: m.reactions || defaults.reactions,
            replies: m.replies || defaults.replies,
            pinnedContributionIds: m.pinnedContributionIds || defaults.pinnedContributionIds,
          };
          return {
            memory: fullMemory,
            memories: { ...s.memories, [fullMemory.slug]: fullMemory },
          };
        }),

      addMemory: (m) =>
        set((s) => {
          const defaults = createDefaultMemoryData(m.slug);
          const fullMemory: MemoryData = {
            ...defaults,
            ...m,
          };
          return {
            memories: { ...s.memories, [m.slug]: fullMemory },
            memory: fullMemory,
          };
        }),

      updateMemory: (slug, patch) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = { ...existing, ...patch };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addCommentToMemory: (slug, comment) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = { ...existing, comments: [...(existing.comments || []), comment] };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addContributedMediaToMemory: (slug, media) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = {
            ...existing,
            contributedMedia: [...(existing.contributedMedia || []), media],
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      likeComment: (slug, commentId) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updatedComments = (existing.comments || []).map((c) => {
            if (c.id !== commentId) return c;
            const likedByMe = !c.likedByMe;
            return { ...c, likes: c.likes + (likedByMe ? 1 : -1), likedByMe };
          });
          const updated = { ...existing, comments: updatedComments };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      likeMedia: (slug, mediaId) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updatedMedia = (existing.contributedMedia || []).map((m) => {
            if (m.id !== mediaId) return m;
            const likedByMe = !m.likedByMe;
            return { ...m, likes: m.likes + (likedByMe ? 1 : -1), likedByMe };
          });
          const updated = { ...existing, contributedMedia: updatedMedia };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addCollaboratorToMemory: (slug, collaborator) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = {
            ...existing,
            collaborators: [...(existing.collaborators || []), collaborator],
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      removeCollaboratorFromMemory: (slug, id) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = {
            ...existing,
            collaborators: (existing.collaborators || []).filter((c) => c.id !== id),
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      updateCollaboratorInMemory: (slug, id, patch) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updatedCollaborators = (existing.collaborators || []).map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          );
          const updated = { ...existing, collaborators: updatedCollaborators };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addCollaborationRequest: (slug, request) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = {
            ...existing,
            collaborationRequests: [...(existing.collaborationRequests || []), request],
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      handleCollaborationRequest: (slug, requestId, action) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const req = (existing.collaborationRequests || []).find((r) => r.id === requestId);
          if (!req) return {};

          let collaborators = existing.collaborators || [];
          if (action === "approve") {
            const newCollab: Collaborator = {
              id: req.id,
              name: req.name,
              email: req.email,
              phone: req.phone,
              role: "contributor",
              status: "accepted",
              inviteSentVia: "link",
            };
            collaborators = [...collaborators, newCollab];
          }

          const updatedRequests = (existing.collaborationRequests || []).map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: (action === "approve" ? "approved" : "declined") as
                    | "approved"
                    | "declined",
                }
              : r,
          );

          const updated = {
            ...existing,
            collaborators,
            collaborationRequests: updatedRequests,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      // --- Simulated Contribution Store Methods ---
      addSimulatedContribution: (slug, contribution) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = existing.contributions || [];
          const updated = {
            ...existing,
            contributions: [...list, contribution],
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      updateSimulatedContributionStatus: (slug, id, status) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = (existing.contributions || []).map((c) =>
            c.id === id ? { ...c, status } : c,
          );
          const updated = {
            ...existing,
            contributions: list,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      deleteSimulatedContribution: (slug, id) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = (existing.contributions || []).filter((c) => c.id !== id);
          const updated = {
            ...existing,
            contributions: list,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      editSimulatedContributionText: (slug, id, newText) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = (existing.contributions || []).map((c) =>
            c.id === id ? { ...c, content_text: newText } : c,
          );
          const updated = {
            ...existing,
            contributions: list,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      toggleSimulatedReaction: (slug, contributionId, userId, type) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};

          const reactions = existing.reactions || [];
          const existingReactionIdx = reactions.findIndex(
            (r) => r.contribution_id === contributionId && r.user_id === userId && r.type === type,
          );

          let updatedReactions = [...reactions];
          if (existingReactionIdx >= 0) {
            // Remove the reaction
            updatedReactions.splice(existingReactionIdx, 1);
          } else {
            // Enforce "one reaction type per user per contribution" by removing any other reaction of different types by same user on same contribution
            updatedReactions = updatedReactions.filter(
              (r) => !(r.contribution_id === contributionId && r.user_id === userId),
            );
            // Add new reaction
            updatedReactions.push({
              id: crypto.randomUUID(),
              contribution_id: contributionId,
              user_id: userId,
              type,
              created_at: new Date().toISOString(),
            });
          }

          const updated = {
            ...existing,
            reactions: updatedReactions,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addSimulatedReply: (slug, reply) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = existing.replies || [];
          const updated = {
            ...existing,
            replies: [...list, reply],
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      deleteSimulatedReply: (slug, replyId) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const list = (existing.replies || []).filter((r) => r.id !== replyId);
          const updated = {
            ...existing,
            replies: list,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      updatePageSettings: (slug, settings) =>
        set((s) => {
          const existing = s.memories[slug] || (s.memory?.slug === slug ? s.memory : null);
          if (!existing) return {};
          const updated = {
            ...existing,
            ...settings,
          };
          return {
            memories: { ...s.memories, [slug]: updated },
            memory: s.memory?.slug === slug ? updated : s.memory,
          };
        }),

      addGuest: (g) => set((s) => ({ guests: [...s.guests, g] })),
      updateGuest: (id, patch) =>
        set((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGuest: (id) => set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),
      setGuestRsvp: (id, rsvp) =>
        set((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, rsvp } : g)) })),
      toggleFollowPage: (slug, userNameOrEmail) =>
        set((s) => {
          const target = s.memories[slug];
          if (!target) return s;
          const currentFollowers = target.followers || [];
          const isFollowing = currentFollowers.some(
            (f) => f.toLowerCase() === userNameOrEmail.toLowerCase(),
          );
          const updatedFollowers = isFollowing
            ? currentFollowers.filter((f) => f.toLowerCase() !== userNameOrEmail.toLowerCase())
            : [...currentFollowers, userNameOrEmail];

          const updatedTarget = { ...target, followers: updatedFollowers };
          return {
            memories: { ...s.memories, [slug]: updatedTarget },
            memory: s.memory?.slug === slug ? updatedTarget : s.memory,
          };
        }),
      sendInvites: (ids) =>
        set((s) => ({
          guests: s.guests.map((g) =>
            ids.includes(g.id)
              ? {
                  ...g,
                  invite: "sent",
                  delivery: g.delivery === "not-sent" ? "transit" : g.delivery,
                }
              : g,
          ),
        })),
    }),
    {
      name: "nandi-store-v2-social",
      partialize: (s) => {
        const cleanMemories: Record<string, MemoryData> = {};
        if (s.memories) {
          Object.keys(s.memories).forEach((k) => {
            const m = s.memories[k];

            // Clean up contributions to prevent quota issues
            const cleanContributions = (m.contributions || []).map((c) => {
              if (c.media_urls) {
                return {
                  ...c,
                  media_urls: c.media_urls.map((url) => (url.startsWith("data:") ? "" : url)),
                };
              }
              return c;
            });

            cleanMemories[k] = {
              ...m,
              photos: [], // Clear original large local photos
              audios: [], // Clear original large local audios
              videos: [], // Clear original large local videos
              contributions: cleanContributions,
              contributedMedia: (m.contributedMedia || []).map((media) => ({
                ...media,
                src: media.src.startsWith("data:") ? "" : media.src,
              })),
            };
          });
        }
        return {
          combos: s.combos,
          guests: s.guests,
          memory: s.memory
            ? {
                ...s.memory,
                photos: [],
                audios: [],
                videos: [],
                contributions: (s.memory.contributions || []).map((c) => {
                  if (c.media_urls) {
                    return {
                      ...c,
                      media_urls: c.media_urls.map((url) => (url.startsWith("data:") ? "" : url)),
                    };
                  }
                  return c;
                }),
                contributedMedia: (s.memory.contributedMedia || []).map((media) => ({
                  ...media,
                  src: media.src.startsWith("data:") ? "" : media.src,
                })),
              }
            : null,
          memories: cleanMemories,
          currentUser: s.currentUser,
        };
      },
    },
  ),
);

export const comboTotal = (c: Combo) => c.pot.price + c.plant.price + c.finish.price;
export const cartTotal = (combos: Combo[]) => combos.reduce((sum, c) => sum + comboTotal(c), 0);


export type PageRole = "creator" | "admin" | "contributor" | "follower" | "visitor";

export function getPageRole(memory?: MemoryData | null, user?: UserSession | null): PageRole {
  if (!memory || !user) return "visitor";
  const userName = user.name.trim().toLowerCase();
  const userEmail = (user.email || "").trim().toLowerCase();

  // 1. Page Creator: matched via creatorEmail, creatorName, or from field
  if (
    (memory.creatorEmail && memory.creatorEmail.toLowerCase() === userEmail) ||
    (memory.creatorName && memory.creatorName.toLowerCase() === userName) ||
    (memory.from && memory.from.toLowerCase() === userName)
  ) {
    return "creator";
  }

  // 2. Page Admin: collaborator with admin role
  const isAdmin = memory.collaborators?.some(
    (c) =>
      c.role === "admin" &&
      (c.name.toLowerCase() === userName || (c.email && c.email.toLowerCase() === userEmail)),
  );
  if (isAdmin) return "admin";

  // 3. Page Contributor: user who has submitted a wish, comment, photo, video, or audio
  const hasContributed =
    memory.contributions?.some((c) => c.contributor_name.toLowerCase() === userName) ||
    memory.comments?.some((c) => c.author.toLowerCase() === userName) ||
    memory.contributedMedia?.some((m) => m.contributorName.toLowerCase() === userName);
  if (hasContributed) return "contributor";

  // 4. Page Follower: user in followers list
  const isFollowing = memory.followers?.some(
    (f) => f.toLowerCase() === userName || (userEmail && f.toLowerCase() === userEmail),
  );
  if (isFollowing) return "follower";

  return "visitor";
}


export type PermissionAction =
  | "delete_page_permanently"
  | "transfer_creator_ownership"
  | "edit_page_title_theme_cover"
  | "change_reveal_date_time"
  | "assign_remove_admins"
  | "view_page_analytics"
  | "remove_any_contribution"
  | "block_contributor"
  | "change_page_pin"
  | "share_copy_page_link"
  | "add_contribution"
  | "edit_own_contribution_24h"
  | "delete_own_contribution"
  | "react_heart_contribution"
  | "view_page_all_contributions"
  | "mute_unfollow_page";

export const PERMISSION_MATRIX: Record<
  PermissionAction,
  { label: string; creator: boolean; admin: boolean; contributor: boolean; follower: boolean }
> = {
  delete_page_permanently: { label: "Delete the page permanently", creator: true, admin: false, contributor: false, follower: false },
  transfer_creator_ownership: { label: "Transfer creator ownership", creator: true, admin: false, contributor: false, follower: false },
  edit_page_title_theme_cover: { label: "Edit page title, theme, cover photo", creator: true, admin: false, contributor: false, follower: false },
  change_reveal_date_time: { label: "Change reveal date / time", creator: true, admin: false, contributor: false, follower: false },
  assign_remove_admins: { label: "Assign or remove admins", creator: true, admin: false, contributor: false, follower: false },
  view_page_analytics: { label: "View page analytics", creator: true, admin: true, contributor: false, follower: false },
  remove_any_contribution: { label: "Remove any contribution", creator: true, admin: true, contributor: false, follower: false },
  block_contributor: { label: "Block a contributor", creator: true, admin: true, contributor: false, follower: false },
  change_page_pin: { label: "Change page PIN (password)", creator: true, admin: true, contributor: false, follower: false },
  share_copy_page_link: { label: "Share / copy page link", creator: true, admin: true, contributor: true, follower: true },
  add_contribution: { label: "Add a contribution (post/photo)", creator: true, admin: true, contributor: true, follower: false },
  edit_own_contribution_24h: { label: "Edit own contribution (within 24h)", creator: true, admin: true, contributor: true, follower: false },
  delete_own_contribution: { label: "Delete own contribution", creator: true, admin: true, contributor: true, follower: false },
  react_heart_contribution: { label: "React (heart) on contributions", creator: true, admin: true, contributor: true, follower: true },
  view_page_all_contributions: { label: "View the page and all contributions", creator: true, admin: true, contributor: true, follower: true },
  mute_unfollow_page: { label: "Mute / unfollow page", creator: true, admin: true, contributor: true, follower: true },
};

export function hasPermission(role: PageRole, action: PermissionAction): boolean {
  if (role === "visitor") {
    return action === "view_page_all_contributions" || action === "share_copy_page_link";
  }
  return PERMISSION_MATRIX[action]?.[role] ?? false;
}
