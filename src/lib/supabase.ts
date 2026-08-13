import { createClient } from "@supabase/supabase-js";
import type { MemoryData, SimulatedContribution, Comment, UserSession } from "./store";
import type { Guest } from "./data";

// Read Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseUrl.includes("your-project-ref");

export const supabase = createClient(
  supabaseUrl || "https://placeholder-supabase.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/* ─────────────────────────────────────────────────────────────
 * AUTHENTICATION HELPERS
 * ───────────────────────────────────────────────────────────── */

/**
 * Sign in with Google OAuth using Supabase Auth
 */
export async function signInWithGoogle(redirectTo?: string) {
  if (!isSupabaseConfigured) {
    console.warn("[Supabase Auth] Supabase is not fully configured.");
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }
  const targetRedirect =
    redirectTo ||
    (typeof window !== "undefined"
      ? window.location.href
      : undefined);

  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetRedirect,
    },
  });
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmailPassword(email: string, password: string, fullName: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        avatar_emoji: "✨",
      },
    },
  });
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailPassword(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Send Magic Link / OTP to user email
 */
export async function sendEmailMagicLink(email: string, redirectTo?: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  const targetRedirect =
    redirectTo ||
    (typeof window !== "undefined"
      ? window.location.href
      : undefined);

  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: targetRedirect,
    },
  });
}

/**
 * Verify OTP token sent to email
 */
export async function verifyEmailOtpToken(email: string, token: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutFromSupabase() {
  if (!isSupabaseConfigured) return;
  return await supabase.auth.signOut();
}

/**
 * Helper to convert Supabase auth user into SocioDex UserSession format
 */
export function formatSupabaseUserSession(user: any): UserSession {
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const avatar = user.user_metadata?.avatar_emoji || "✨";
  const provider = user.app_metadata?.provider === "google" ? "google" : "email";

  return {
    id: user.id,
    name: fullName,
    email: user.email,
    avatar,
    provider: provider as "google" | "phone" | "email",
  };
}

/**
 * Global listener for Supabase auth state changes
 */
export function initAuthListener(onUserChanged: (session: UserSession | null, event?: string) => void) {
  if (!isSupabaseConfigured) return () => {};

  // Check current session on init
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      onUserChanged(formatSupabaseUserSession(session.user), "INITIAL_SESSION");
    }
  });

  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      onUserChanged(formatSupabaseUserSession(session.user), event);
    } else if (event === "SIGNED_OUT") {
      onUserChanged(null, event);
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}

/* ─────────────────────────────────────────────────────────────
 * DATABASE HELPERS (MEMORY PAGES, CONTRIBUTIONS, GUESTS)
 * ───────────────────────────────────────────────────────────── */

/**
 * Fetch a memory page and its live contributions/comments from Supabase
 */
export async function fetchMemoryFromSupabase(slug: string): Promise<Partial<MemoryData> | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: memory, error } = await supabase
      .from("memory_pages")
      .select("*, contributions(*), guests(*)")
      .eq("slug", slug)
      .single();

    if (error || !memory) {
      console.warn("[Supabase] Memory not found or error:", error?.message);
      return null;
    }

    return {
      slug: memory.slug,
      occasion: memory.occasion,
      recipient: memory.recipient,
      from: memory.from_name,
      creatorEmail: memory.creator_email,
      date: memory.date,
      themeId: memory.theme_id,
      wishes: memory.wishes || [],
      photos: memory.image_urls || [],
      audios: (memory.audio_urls || []).map((url: string, i: number) => ({ id: `audio-${i}`, name: `Audio ${i + 1}`, url })),
      videos: (memory.video_urls || []).map((url: string, i: number) => ({ id: `video-${i}`, name: `Video ${i + 1}`, url })),
      contributions: (memory.contributions || []).map((c: any) => ({
        id: c.id,
        memory_page_id: c.memory_page_id,
        contributor_id: c.contributor_id || "",
        contributor_name: c.contributor_name,
        contributor_avatar_color: c.contributor_avatar_color || "#E4603C",
        type: c.type,
        content_text: c.content_text,
        media_urls: c.media_urls || [],
        status: c.status || "approved",
        created_at: c.created_at,
      })),
    };
  } catch (err) {
    console.error("[Supabase Fetch Error]", err);
    return null;
  }
}

/**
 * Fetch all memory pages created by a specific user email
 */
export async function fetchUserMemoriesFromSupabase(email: string): Promise<MemoryData[]> {
  if (!isSupabaseConfigured || !email) return [];

  try {
    const { data: memories, error } = await supabase
      .from("memory_pages")
      .select("*")
      .eq("creator_email", email)
      .order("created_at", { ascending: false });

    if (error || !memories) {
      console.warn("[Supabase User Memories Error]", error);
      return [];
    }

    return memories.map((m: any) => ({
      slug: m.slug,
      occasion: m.occasion,
      recipient: m.recipient,
      from: m.from_name,
      creatorEmail: m.creator_email,
      date: m.date,
      themeId: m.theme_id,
      wishes: m.wishes || [],
      photos: m.image_urls || [],
      audios: [],
      videos: [],
      visibility: "public",
      allowedActions: { addPhotos: true, addVideos: true, addComments: true },
      collaborators: [],
      comments: [],
      contributedMedia: [],
      collaborationRequests: [],
      contributionMode: "open",
      autoApprove: true,
      pinnedContributionIds: [],
      expiresAt: null,
      contributions: [],
      reactions: [],
      replies: [],
    }));
  } catch (err) {
    console.error("[Supabase User Memories Exception]", err);
    return [];
  }
}

/**
 * Save or insert a newly created memory page into Supabase
 */
export async function saveMemoryToSupabase(memory: MemoryData): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const { error } = await supabase.from("memory_pages").upsert({
      slug: memory.slug,
      user_id: userId,
      occasion: memory.occasion,
      recipient: memory.recipient,
      from_name: memory.from,
      creator_email: memory.creatorEmail || userData?.user?.email || "",
      date: memory.date,
      theme_id: memory.themeId,
      wishes: memory.wishes || [],
      image_urls: memory.photos || [],
      audio_urls: (memory.audios || []).map((a) => a.url).filter(Boolean),
      video_urls: (memory.videos || []).map((v) => v.url).filter(Boolean),
    }, { onConflict: "slug" });

    if (error) {
      console.error("[Supabase Upsert Memory Error]", error);
      return false;
    }

    console.log("[Supabase] Successfully saved memory page:", memory.slug);
    return true;
  } catch (err) {
    console.error("[Supabase Save Exception]", err);
    return false;
  }
}

/**
 * Save a contribution (wish, photo, video) to Supabase
 */
export async function saveContributionToSupabase(
  slug: string,
  contribution: SimulatedContribution
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    // Get memory page ID by slug
    const { data: page } = await supabase.from("memory_pages").select("id").eq("slug", slug).single();
    if (!page?.id) return false;

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("contributions").insert({
      id: contribution.id,
      memory_page_id: page.id,
      contributor_id: userData?.user?.id || null,
      contributor_name: contribution.contributor_name,
      contributor_avatar_color: contribution.contributor_avatar_color || "#E4603C",
      type: contribution.type,
      content_text: contribution.content_text,
      media_urls: contribution.media_urls || [],
      status: contribution.status || "approved",
    });

    if (error) {
      console.error("[Supabase Contribution Error]", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase Save Contribution Exception]", err);
    return false;
  }
}

/**
 * Save Guest RSVP to Supabase
 */
export async function saveGuestRsvpToSupabase(
  slug: string,
  guest: { firstName: string; lastName?: string; email?: string; rsvpStatus: "attending" | "declined" | "pending" }
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: page } = await supabase.from("memory_pages").select("id").eq("slug", slug).single();
    if (!page?.id) return false;

    const { error } = await supabase.from("guests").insert({
      memory_page_id: page.id,
      first_name: guest.firstName,
      last_name: guest.lastName || "",
      email: guest.email || "",
      rsvp_status: guest.rsvpStatus,
    });

    if (error) {
      console.error("[Supabase Guest RSVP Error]", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase Save Guest Exception]", err);
    return false;
  }
}

/**
 * Subscribe to Supabase Realtime changes for contributions & wishes on a memory page
 */
export function subscribeToMemoryRealtime(
  slug: string,
  onContributionAdded: (contribution: SimulatedContribution) => void
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`memory-${slug}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "contributions" },
      (payload) => {
        console.log("[Supabase Realtime] New contribution received:", payload.new);
        onContributionAdded({
          id: payload.new.id,
          memory_page_id: payload.new.memory_page_id,
          contributor_id: payload.new.contributor_id || "",
          contributor_name: payload.new.contributor_name,
          contributor_avatar_color: payload.new.contributor_avatar_color || "#E4603C",
          type: payload.new.type,
          content_text: payload.new.content_text,
          media_urls: payload.new.media_urls || [],
          status: payload.new.status || "approved",
          created_at: payload.new.created_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/* ─────────────────────────────────────────────────────────────
 * REALTIME CHAT SYNCHRONIZATION (CROSS-DEVICE SINGLETON)
 * ───────────────────────────────────────────────────────────── */

let globalChatChannel: any = null;
const globalChatSubscribers = new Set<{
  onMessage: (message: any, conversation: any) => void;
  onReaction?: (conversationId: string, messageId: string, reactions: Record<string, string[]>) => void;
  onSyncRequest?: (conversationId: string, requesterId: string) => void;
  onSyncResponse?: (conversationId: string, messages: any[]) => void;
}>();

export function getOrCreateGlobalChatChannel() {
  if (!isSupabaseConfigured) return null;
  if (!globalChatChannel) {
    globalChatChannel = supabase.channel("sociodex-realtime-chat-sync", {
      config: {
        broadcast: { self: true },
      },
    });

    globalChatChannel
      .on("broadcast", { event: "chat_message" }, ({ payload }: any) => {
        if (payload?.message) {
          globalChatSubscribers.forEach((sub) => sub.onMessage(payload.message, payload.conversation));
        }
      })
      .on("broadcast", { event: "chat_reaction" }, ({ payload }: any) => {
        if (payload?.messageId) {
          globalChatSubscribers.forEach((sub) =>
            sub.onReaction?.(payload.conversationId, payload.messageId, payload.reactions)
          );
        }
      })
      .on("broadcast", { event: "chat_sync_request" }, ({ payload }: any) => {
        if (payload?.conversationId) {
          globalChatSubscribers.forEach((sub) =>
            sub.onSyncRequest?.(payload.conversationId, payload.requesterId)
          );
        }
      })
      .on("broadcast", { event: "chat_sync_response" }, ({ payload }: any) => {
        if (payload?.conversationId && payload?.messages) {
          globalChatSubscribers.forEach((sub) =>
            sub.onSyncResponse?.(payload.conversationId, payload.messages)
          );
        }
      })
      .subscribe((status: string) => {
        console.log("[Supabase Global Chat Realtime Status]:", status);
      });
  }
  return globalChatChannel;
}

/**
 * Global subscriber for real-time chat messages across all pages & devices
 */
export function subscribeToGlobalChat(subscriber: {
  onMessage: (message: any, conversation: any) => void;
  onReaction?: (conversationId: string, messageId: string, reactions: Record<string, string[]>) => void;
  onSyncRequest?: (conversationId: string, requesterId: string) => void;
  onSyncResponse?: (conversationId: string, messages: any[]) => void;
}) {
  getOrCreateGlobalChatChannel();
  globalChatSubscribers.add(subscriber);
  return () => {
    globalChatSubscribers.delete(subscriber);
  };
}

/**
 * Legacy wrapper for compatibility
 */
export function subscribeToChatRealtime(
  _memorySlug: string | undefined,
  onMessageReceived: (message: any, conversation: any) => void,
  onReactionReceived?: (conversationId: string, messageId: string, reactions: Record<string, string[]>) => void
) {
  return subscribeToGlobalChat({
    onMessage: onMessageReceived,
    onReaction: onReactionReceived,
  });
}

/**
 * Broadcast a real-time chat message across devices via active WebSocket channel
 */
export async function broadcastChatMessage(
  _memorySlug: string | undefined,
  message: any,
  conversation: any
) {
  const channel = getOrCreateGlobalChatChannel();
  if (!channel) return;
  try {
    await channel.send({
      type: "broadcast",
      event: "chat_message",
      payload: { message, conversation },
    });
  } catch (err) {
    console.warn("[Supabase Broadcast Message Error]", err);
  }
}

/**
 * Broadcast a message reaction update across devices
 */
export async function broadcastChatReaction(
  _memorySlug: string | undefined,
  conversationId: string,
  messageId: string,
  reactions: Record<string, string[]>
) {
  const channel = getOrCreateGlobalChatChannel();
  if (!channel) return;
  try {
    await channel.send({
      type: "broadcast",
      event: "chat_reaction",
      payload: { conversationId, messageId, reactions },
    });
  } catch (err) {
    console.warn("[Supabase Broadcast Reaction Error]", err);
  }
}

/**
 * Request peer conversation history sync from other active devices
 */
export async function broadcastChatSyncRequest(conversationId: string, requesterId: string) {
  const channel = getOrCreateGlobalChatChannel();
  if (!channel) return;
  try {
    await channel.send({
      type: "broadcast",
      event: "chat_sync_request",
      payload: { conversationId, requesterId },
    });
  } catch (err) {
    console.warn("[Supabase Broadcast Sync Request Error]", err);
  }
}

/**
 * Reply with conversation messages history for peer sync
 */
export async function broadcastChatSyncResponse(conversationId: string, messages: any[]) {
  const channel = getOrCreateGlobalChatChannel();
  if (!channel) return;
  try {
    await channel.send({
      type: "broadcast",
      event: "chat_sync_response",
      payload: { conversationId, messages },
    });
  } catch (err) {
    console.warn("[Supabase Broadcast Sync Response Error]", err);
  }
}

