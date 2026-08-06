import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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

/* ==============================================================================
 * DATA TYPES
 * ============================================================================== */

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  media_type: "text" | "image" | "video" | "carousel";
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  user_has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  replies?: Comment[];
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: "like_post" | "like_comment" | "comment" | "follow" | "follow_request" | "mention" | "direct_message";
  post_id?: string;
  comment_id?: string;
  message_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  post?: Post;
};

export type Conversation = {
  id: string;
  is_group: boolean;
  title?: string;
  updated_at: string;
  created_at: string;
  participants?: Profile[];
  last_message?: Message;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  created_at: string;
  sender?: Profile;
};

/* ==============================================================================
 * 1. AUTHENTICATION SERVICES
 * ============================================================================== */

/**
 * Sign up a new user with Email, Password, Username, and Full Name
 */
export async function signUpUser(email: string, pass: string, username: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  });
  return { user: data?.user, session: data?.session, error };
}

/**
 * Sign in existing user with Email and Password
 */
export async function signInUser(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  return { user: data?.user, session: data?.session, error };
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current logged in Auth user & profile
 */
export async function getCurrentAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as Profile | null };
}

/* ==============================================================================
 * 2. PROFILES SERVICES
 * ============================================================================== */

/**
 * Fetch profile by User ID or Username
 */
export async function fetchProfile(identifier: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  const query = supabase.from("profiles").select("*");
  const { data, error } = isUuid ? await query.eq("id", identifier).single() : await query.eq("username", identifier).single();

  return { profile: data as Profile | null, error };
}

/**
 * Update user profile details
 */
export async function updateProfileDetails(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  return { profile: data as Profile | null, error };
}

/**
 * Search profiles by username or full name
 */
export async function searchProfiles(searchTerm: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    .limit(20);

  return { profiles: (data || []) as Profile[], error };
}

/* ==============================================================================
 * 3. POSTS & FEED SERVICES
 * ============================================================================== */

/**
 * Create a new post
 */
export async function createPost(postData: {
  userId: string;
  content: string;
  mediaUrls?: string[];
  mediaType?: "text" | "image" | "video" | "carousel";
}) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: postData.userId,
      content: postData.content,
      media_urls: postData.mediaUrls || [],
      media_type: postData.mediaType || "text",
    })
    .select("*, profile:profiles(*)")
    .single();

  return { post: data as Post | null, error };
}

/**
 * Fetch global home feed posts with author profiles and current user like status
 */
export async function fetchFeedPosts(currentUserId?: string, limit = 20, offset = 0) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !posts) return { posts: [], error };

  // Attach liked_by_me status if current user is logged in
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", currentUserId)
      .in("post_id", postIds);

    const likedPostIds = new Set(likes?.map((l) => l.post_id));
    posts.forEach((p) => {
      p.user_has_liked = likedPostIds.has(p.id);
    });
  }

  return { posts: posts as Post[], error: null };
}

/**
 * Fetch posts created by a specific user profile
 */
export async function fetchUserPosts(targetUserId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  return { posts: (data || []) as Post[], error };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  return { error };
}

/* ==============================================================================
 * 4. COMMENTS SERVICES
 * ============================================================================== */

/**
 * Add a comment or reply to a post
 */
export async function addComment(commentData: {
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
}) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: commentData.postId,
      user_id: commentData.userId,
      content: commentData.content,
      parent_comment_id: commentData.parentCommentId || null,
    })
    .select("*, profile:profiles(*)")
    .single();

  return { comment: data as Comment | null, error };
}

/**
 * Fetch all comments for a post
 */
export async function fetchPostComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profile:profiles(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return { comments: [], error };

  // Structure comments and nested replies
  const commentMap = new Map<string, Comment>();
  const topLevelComments: Comment[] = [];

  data.forEach((c: any) => {
    c.replies = [];
    commentMap.set(c.id, c);
  });

  data.forEach((c: any) => {
    if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
      commentMap.get(c.parent_comment_id)!.replies!.push(c);
    } else {
      topLevelComments.push(c);
    }
  });

  return { comments: topLevelComments, error: null };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  return { error };
}

/* ==============================================================================
 * 5. LIKES SERVICES
 * ============================================================================== */

/**
 * Toggle like/unlike on a Post
 */
export async function togglePostLike(userId: string, postId: string) {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    return { liked: false, error };
  } else {
    const { error } = await supabase.from("likes").insert({ user_id: userId, post_id: postId });
    return { liked: true, error };
  }
}

/**
 * Toggle like/unlike on a Comment
 */
export async function toggleCommentLike(userId: string, commentId: string) {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    return { liked: false, error };
  } else {
    const { error } = await supabase.from("likes").insert({ user_id: userId, comment_id: commentId });
    return { liked: true, error };
  }
}

/* ==============================================================================
 * 6. FOLLOWS SERVICES
 * ============================================================================== */

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId, status: "accepted" })
    .select()
    .single();

  return { follow: data, error };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  return { error };
}

/**
 * Check if follower is following target user
 */
export async function checkIsFollowing(followerId: string, targetUserId: string) {
  const { data } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return Boolean(data);
}

/* ==============================================================================
 * 7. NOTIFICATIONS SERVICES
 * ============================================================================== */

/**
 * Fetch notifications for recipient user
 */
export async function fetchNotifications(recipientId: string, limit = 30) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, actor:profiles!actor_id(*), post:posts(*)")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { notifications: (data || []) as Notification[], error };
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  return { error };
}

/**
 * Subscribe to realtime notifications
 */
export function subscribeToNotifications(recipientId: string, onNewNotification: (n: Notification) => void) {
  const channel = supabase
    .channel(`notifications-${recipientId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${recipientId}` },
      async (payload) => {
        // Fetch full notification with actor details
        const { data } = await supabase
          .from("notifications")
          .select("*, actor:profiles!actor_id(*), post:posts(*)")
          .eq("id", payload.new.id)
          .single();

        if (data) onNewNotification(data as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/* ==============================================================================
 * 8. DIRECT MESSAGES SERVICES
 * ============================================================================== */

/**
 * Fetch or start a 1-on-1 direct message conversation
 */
export async function getOrCreateDirectConversation(currentUserId: string, recipientUserId: string) {
  // Check existing shared conversation
  const { data: userConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (userConvs && userConvs.length > 0) {
    const convIds = userConvs.map((c) => c.conversation_id);
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", recipientUserId)
      .in("conversation_id", convIds)
      .maybeSingle();

    if (shared) {
      return { conversationId: shared.conversation_id, error: null };
    }
  }

  // Create new conversation
  const { data: newConv, error: convErr } = await supabase
    .from("conversations")
    .insert({ is_group: false })
    .select()
    .single();

  if (convErr || !newConv) return { conversationId: null, error: convErr };

  // Add participants
  await supabase.from("conversation_participants").insert([
    { conversation_id: newConv.id, user_id: currentUserId },
    { conversation_id: newConv.id, user_id: recipientUserId },
  ]);

  return { conversationId: newConv.id, error: null };
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(conversationId: string, limit = 50) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(*)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  return { messages: (data || []) as Message[], error };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string, mediaUrl?: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      media_url: mediaUrl || null,
    })
    .select("*, sender:profiles(*)")
    .single();

  return { message: data as Message | null, error };
}

/**
 * Subscribe to realtime messages in a conversation
 */
export function subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        const { data } = await supabase
          .from("messages")
          .select("*, sender:profiles(*)")
          .eq("id", payload.new.id)
          .single();

        if (data) onNewMessage(data as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
