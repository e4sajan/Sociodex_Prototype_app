import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "./store";
import { isSupabaseConfigured, supabase } from "./supabase";

export type MessageReaction = {
  emoji: string;
  count: number;
  users: string[]; // user names or IDs who reacted
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor?: string;
  senderRole?: "creator" | "admin" | "contributor" | "guest";
  content: string;
  mediaUrl?: string;
  mediaType?: "photo" | "audio" | "video";
  audioDuration?: number; // seconds
  reactions: Record<string, string[]>; // emoji -> array of user names
  replyToId?: string;
  replyToSnippet?: string;
  status: "sending" | "sent" | "delivered" | "read";
  createdAt: string;
};

export type ChatParticipant = {
  id: string;
  name: string;
  avatar: string;
  color?: string;
  role?: "creator" | "admin" | "contributor" | "guest";
  email?: string;
  isOnline?: boolean;
};

export type ChatConversation = {
  id: string;
  type: "direct" | "memory_group";
  memorySlug?: string;
  memoryTitle?: string;
  title: string;
  avatar: string;
  avatarColor?: string;
  participantIds: string[];
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
  isTyping?: boolean;
  typingUser?: string;
};

type ChatStore = {
  conversations: Record<string, ChatConversation>;
  messages: Record<string, ChatMessage[]>; // conversationId -> messages
  activeConversationId: string | null;
  isDrawerOpen: boolean;
  filterTab: "all" | "direct" | "memory_group";
  soundEnabled: boolean;

  // Actions
  setDrawerOpen: (open: boolean, conversationId?: string | null) => void;
  setActiveConversation: (id: string | null) => void;
  setFilterTab: (tab: "all" | "direct" | "memory_group") => void;
  toggleSoundEnabled: () => void;

  openChatWithContributor: (params: {
    name: string;
    emailOrId?: string;
    avatar?: string;
    avatarColor?: string;
    role?: "creator" | "admin" | "contributor" | "guest";
    memorySlug?: string;
    memoryTitle?: string;
  }) => void;

  openMemoryGroupChat: (params: {
    memorySlug: string;
    memoryTitle: string;
    creatorName?: string;
  }) => void;

  sendMessage: (params: {
    conversationId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: "photo" | "audio" | "video";
    audioDuration?: number;
    replyToId?: string;
    replyToSnippet?: string;
  }) => void;

  toggleReaction: (params: {
    conversationId: string;
    messageId: string;
    emoji: string;
  }) => void;

  markAsRead: (conversationId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearAllConversations: () => void;
  getTotalUnreadCount: () => number;
};

// Play subtle notification chime
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context errors if blocked by browser policy
  }
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: {},
      messages: {},
      activeConversationId: null,
      isDrawerOpen: false,
      filterTab: "all",
      soundEnabled: true,

      setDrawerOpen: (open, conversationId) => {
        set((state) => {
          const nextActive = conversationId !== undefined ? conversationId : state.activeConversationId;
          const updatedConvs = { ...state.conversations };
          if (nextActive && updatedConvs[nextActive]) {
            updatedConvs[nextActive] = {
              ...updatedConvs[nextActive],
              unreadCount: 0,
            };
          }
          return {
            isDrawerOpen: open,
            activeConversationId: nextActive,
            conversations: updatedConvs,
          };
        });
      },

      setActiveConversation: (id) => {
        set((state) => {
          if (!id) return { activeConversationId: null };
          const conv = state.conversations[id];
          if (!conv) return { activeConversationId: id };

          return {
            activeConversationId: id,
            conversations: {
              ...state.conversations,
              [id]: {
                ...conv,
                unreadCount: 0,
              },
            },
          };
        });
      },

      setFilterTab: (tab) => set({ filterTab: tab }),

      toggleSoundEnabled: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      openChatWithContributor: ({
        name,
        emailOrId,
        avatar = "👤",
        avatarColor = "#E4603C",
        role = "contributor",
        memorySlug,
        memoryTitle,
      }) => {
        const cleanId = (emailOrId || name).toLowerCase().replace(/[^a-z0-9]/g, "-");
        const convId = `conv-dm-${cleanId}-${memorySlug || "global"}`;
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";
        const myAvatar = currentUser?.avatar || "👤";
        const myId = currentUser?.email || currentUser?.id || "guest-me";

        set((state) => {
          const existingConv = state.conversations[convId];
          const now = new Date().toISOString();

          const updatedConvs = { ...state.conversations };
          const updatedMessages = { ...state.messages };

          if (!existingConv) {
            const newConv: ChatConversation = {
              id: convId,
              type: "direct",
              memorySlug,
              memoryTitle,
              title: name,
              avatar,
              avatarColor,
              participantIds: [cleanId, myId],
              participants: [
                { id: cleanId, name, avatar, color: avatarColor, role, isOnline: true },
                { id: myId, name: myName, avatar: myAvatar, role: "contributor", isOnline: true },
              ],
              unreadCount: 0,
              updatedAt: now,
            };
            updatedConvs[convId] = newConv;
            if (!updatedMessages[convId]) {
              updatedMessages[convId] = [];
            }
          } else {
            updatedConvs[convId] = {
              ...existingConv,
              unreadCount: 0,
            };
          }

          return {
            conversations: updatedConvs,
            messages: updatedMessages,
            activeConversationId: convId,
            isDrawerOpen: true,
          };
        });
      },

      openMemoryGroupChat: ({ memorySlug, memoryTitle, creatorName = "Page Creator" }) => {
        const convId = `conv-group-${memorySlug}`;
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";
        const myAvatar = currentUser?.avatar || "👤";
        const myId = currentUser?.email || currentUser?.id || "guest-me";

        set((state) => {
          const existing = state.conversations[convId];
          const now = new Date().toISOString();

          const updatedConvs = { ...state.conversations };
          const updatedMessages = { ...state.messages };

          if (!existing) {
            const newConv: ChatConversation = {
              id: convId,
              type: "memory_group",
              memorySlug,
              memoryTitle,
              title: `${memoryTitle} — Celebration Lounge`,
              avatar: "🎉",
              avatarColor: "#EBC85A",
              participantIds: ["creator", myId],
              participants: [
                { id: "creator", name: creatorName, avatar: "👑", color: "#E4603C", role: "creator", isOnline: true },
                { id: myId, name: myName, avatar: myAvatar, role: "contributor", isOnline: true },
              ],
              unreadCount: 0,
              updatedAt: now,
            };
            updatedConvs[convId] = newConv;
            if (!updatedMessages[convId]) {
              updatedMessages[convId] = [];
            }
          } else {
            updatedConvs[convId] = {
              ...existing,
              unreadCount: 0,
            };
          }

          return {
            conversations: updatedConvs,
            messages: updatedMessages,
            activeConversationId: convId,
            isDrawerOpen: true,
          };
        });
      },

      sendMessage: ({
        conversationId,
        content,
        mediaUrl,
        mediaType,
        audioDuration,
        replyToId,
        replyToSnippet,
      }) => {
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";
        const myAvatar = currentUser?.avatar || "👤";
        const myId = currentUser?.email || currentUser?.id || "guest-me";

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conversationId,
          senderId: myId,
          senderName: myName,
          senderAvatar: myAvatar,
          senderColor: "#E4603C",
          senderRole: "contributor",
          content,
          mediaUrl,
          mediaType,
          audioDuration,
          replyToId,
          replyToSnippet,
          reactions: {},
          status: "delivered",
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const conv = state.conversations[conversationId];

          const updatedMessages = {
            ...state.messages,
            [conversationId]: [...convMessages, newMsg],
          };

          const updatedConvs = {
            ...state.conversations,
            ...(conv
              ? {
                  [conversationId]: {
                    ...conv,
                    lastMessage: newMsg,
                    updatedAt: newMsg.createdAt,
                  },
                }
              : {}),
          };

          return {
            messages: updatedMessages,
            conversations: updatedConvs,
          };
        });

        // If Supabase is configured, also persist message to Supabase database
        if (isSupabaseConfigured && currentUser?.id) {
          supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              sender_id: currentUser.id,
              content,
              media_url: mediaUrl || null,
            })
            .then(() => {})
            .catch((err) => console.warn("[Supabase Chat] Sync error:", err));
        }
      },

      toggleReaction: ({ conversationId, messageId, emoji }) => {
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";

        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const updated = convMessages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const reactions = { ...(msg.reactions || {}) };
            const users = reactions[emoji] || [];

            if (users.includes(myName)) {
              const nextUsers = users.filter((u) => u !== myName);
              if (nextUsers.length === 0) {
                delete reactions[emoji];
              } else {
                reactions[emoji] = nextUsers;
              }
            } else {
              reactions[emoji] = [...users, myName];
            }

            return { ...msg, reactions };
          });

          return {
            messages: {
              ...state.messages,
              [conversationId]: updated,
            },
          };
        });
      },

      markAsRead: (conversationId) => {
        set((state) => {
          const conv = state.conversations[conversationId];
          if (!conv || conv.unreadCount === 0) return {};

          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conv,
                unreadCount: 0,
              },
            },
          };
        });
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const filtered = convMessages.filter((m) => m.id !== messageId);
          const conv = state.conversations[conversationId];

          return {
            messages: {
              ...state.messages,
              [conversationId]: filtered,
            },
            conversations: {
              ...state.conversations,
              ...(conv
                ? {
                    [conversationId]: {
                      ...conv,
                      lastMessage: filtered[filtered.length - 1] || undefined,
                    },
                  }
                : {}),
            },
          };
        });
      },

      clearAllConversations: () => {
        set({ conversations: {}, messages: {}, activeConversationId: null });
      },

      getTotalUnreadCount: () => {
        const convs = get().conversations || {};
        return Object.values(convs).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      },
    }),
    {
      name: "sociodex-chat-v2",
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
