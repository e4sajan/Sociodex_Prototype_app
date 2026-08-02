import { createClient } from "@supabase/supabase-js";
import type { MemoryData, SimulatedContribution, Comment } from "./store";

// Read Supabase credentials from environment or fallback to demo defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-supabase.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Fetch a memory page and its live contributions/comments from Supabase
 */
export async function fetchMemoryFromSupabase(slug: string): Promise<Partial<MemoryData> | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: memory, error } = await supabase
      .from("memory_pages")
      .select("*, page_settings(*), contributions(*), comments(*)")
      .eq("slug", slug)
      .single();

    if (error || !memory) {
      console.warn("[Supabase] Could not fetch memory:", error);
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
      contributions: memory.contributions || [],
      comments: memory.comments || [],
    };
  } catch (err) {
    console.error("[Supabase Fetch Error]", err);
    return null;
  }
}

/**
 * Save or insert a newly created memory page into Supabase
 */
export async function saveMemoryToSupabase(memory: MemoryData): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase.from("memory_pages").upsert({
      slug: memory.slug,
      occasion: memory.occasion,
      recipient: memory.recipient,
      from_name: memory.from,
      creator_email: memory.creatorEmail || "",
      date: memory.date,
      theme_id: memory.themeId,
      wishes: memory.wishes,
      image_urls: memory.photos,
    });

    if (error) {
      console.error("[Supabase Upsert Error]", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase Save Error]", err);
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
        onContributionAdded(payload.new as SimulatedContribution);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
