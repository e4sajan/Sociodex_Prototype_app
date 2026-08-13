import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "./store";
import {
  isSupabaseConfigured,
  supabase,
  broadcastChatMessage,
  broadcastChatReaction,
  broadcastChatSyncRequest,
  broadcastChatSyncResponse,
} from "./supabase";
import { toast } from "sonner";

export type MessageReaction = {
  emoji: string;
  count: number;
  users: string[];
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor?: string;
  senderRole?: "creator" | "admin" | "contributor" | "guest" | "follower";
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
  role?: "creator" | "admin" | "contributor" | "guest" | "follower";
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
    role?: "creator" | "admin" | "contributor" | "guest" | "follower";
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

  receiveRemoteMessage: (
    msg: ChatMessage,
    convMeta?: Partial<ChatConversation>
  ) => void;

  toggleReaction: (params: {
    conversationId: string;
    messageId: string;
    emoji: string;
  }) => void;

  receiveRemoteReaction: (
    conversationId: string,
    messageId: string,
    reactions: Record<string, string[]>
  ) => void;

  handleSyncRequest: (conversationId: string, requesterId: string) => void;
  receiveSyncMessages: (conversationId: string, remoteMessages: ChatMessage[]) => void;
  requestConversationSync: (conversationId: string) => void;

  markAsRead: (conversationId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearAllConversations: () => void;
  getTotalUnreadCount: () => number;
};

// Deterministic conversation ID for direct messaging between two participants
export function getDirectConversationId(
  userA: string,
  userB: string,
  memorySlug?: string
): string {
  const cleanA = (userA || "user-a").toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
  const cleanB = (userB || "user-b").toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
  const sorted = [cleanA, cleanB].sort();
  return `conv-dm-${sorted[0]}__${sorted[1]}-${memorySlug || "global"}`;
}

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
      filterTab: "direct",
      soundEnabled: true,

      setDrawerOpen: (open, conversationId = null) => {
        set((state) => {
          // When opening drawer from the general chat icon, always open to the contacts list
          const nextActive = conversationId || null;
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

        if (open && conversationId) {
          get().requestConversationSync(conversationId);
        }
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

        if (id) {
          get().requestConversationSync(id);
        }
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
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";
        const myAvatar = currentUser?.avatar || "👤";
        const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";
        const targetId = emailOrId || name;

        // Symmetric deterministic ID so both sender and recipient share the exact same room
        const convId = getDirectConversationId(myId, targetId, memorySlug);

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
              participantIds: [targetId, myId],
              participants: [
                { id: targetId, name, avatar, color: avatarColor, role, isOnline: true },
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

        // Request peer sync for any messages history from other devices
        get().requestConversationSync(convId);
      },

      openMemoryGroupChat: ({ memorySlug, memoryTitle, creatorName = "Page Creator" }) => {
        get().openChatWithContributor({
          name: creatorName,
          avatar: "👑",
          avatarColor: "#E4603C",
          role: "creator",
          memorySlug,
          memoryTitle,
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
        const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";

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

        const currentConv = get().conversations[conversationId];

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

        // Broadcast immediately across all devices via active singleton Supabase Realtime channel
        const memorySlug = currentConv?.memorySlug;
        broadcastChatMessage(memorySlug, newMsg, currentConv);

        // If Supabase database table exists, also attempt persistence
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
            .catch(() => {});
        }
      },

      receiveRemoteMessage: (msg, convMeta) => {
        const currentUser = useStore.getState().currentUser;
        const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";
        const myName = (currentUser?.name || "").toLowerCase().trim();
        const myEmail = (currentUser?.email || "").toLowerCase().trim();

        const isMe =
          msg.senderId === "me" ||
          msg.senderId === "guest-me" ||
          msg.senderId === myId ||
          (currentUser?.id && msg.senderId === currentUser.id) ||
          (myEmail && msg.senderId.toLowerCase() === myEmail) ||
          (myName && msg.senderName.trim().toLowerCase() === myName);

        set((state) => {
          const convId = msg.conversationId;
          const convMessages = state.messages[convId] || [];

          // Prevent duplicates
          if (convMessages.some((m) => m.id === msg.id)) {
            return state;
          }

          const isCurrentActive =
            state.isDrawerOpen && state.activeConversationId === convId;
          const existingConv = state.conversations[convId];

          const updatedConv: ChatConversation = existingConv
            ? {
                ...existingConv,
                lastMessage: msg,
                updatedAt: msg.createdAt,
                unreadCount: isCurrentActive || isMe ? (existingConv.unreadCount || 0) : (existingConv.unreadCount || 0) + 1,
              }
            : {
                id: convId,
                type: "direct",
                memorySlug: convMeta?.memorySlug,
                memoryTitle: convMeta?.memoryTitle,
                title: isMe ? (convMeta?.title || "Contributor") : (msg.senderName || "Contributor"),
                avatar: isMe ? (convMeta?.avatar || "👤") : (msg.senderAvatar || "👤"),
                avatarColor: isMe ? (convMeta?.avatarColor || "#E4603C") : (msg.senderColor || "#E4603C"),
                participantIds: [msg.senderId, myId],
                participants: [
                  {
                    id: msg.senderId,
                    name: msg.senderName,
                    avatar: msg.senderAvatar,
                    color: msg.senderColor,
                    role: msg.senderRole,
                    isOnline: true,
                  },
                  {
                    id: myId,
                    name: currentUser?.name || "Me",
                    avatar: currentUser?.avatar || "👤",
                    role: "contributor",
                    isOnline: true,
                  },
                ],
                lastMessage: msg,
                unreadCount: isCurrentActive || isMe ? 0 : 1,
                updatedAt: msg.createdAt,
              };

          // Play audio notification chime for incoming messages from others
          if (state.soundEnabled && !isMe) {
            playNotificationSound();
          }

          // Show floating toast alert if user isn't currently looking at this conversation and message wasn't sent by me
          if (!isCurrentActive && !isMe) {
            toast.info(`💬 ${msg.senderName}: ${msg.content || (msg.mediaType ? `[${msg.mediaType}]` : "sent a message")}`, {
              description: convMeta?.memoryTitle ? `in ${convMeta.memoryTitle}` : undefined,
              action: {
                label: "Reply",
                onClick: () => {
                  get().setDrawerOpen(true, convId);
                },
              },
            });
          }

          return {
            messages: {
              ...state.messages,
              [convId]: [...convMessages, msg],
            },
            conversations: {
              ...state.conversations,
              [convId]: updatedConv,
            },
          };
        });
      },

      toggleReaction: ({ conversationId, messageId, emoji }) => {
        const currentUser = useStore.getState().currentUser;
        const myName = currentUser?.name || "Guest";
        let updatedReactions: Record<string, string[]> = {};

        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const updated = convMessages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const reactions = { ...(msg.reactions || {}) };
            const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];

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

            updatedReactions = reactions;
            return { ...msg, reactions };
          });

          return {
            messages: {
              ...state.messages,
              [conversationId]: updated,
            },
          };
        });

        // Broadcast reaction across devices immediately
        const conv = get().conversations[conversationId];
        broadcastChatReaction(conv?.memorySlug, conversationId, messageId, updatedReactions);
      },

      receiveRemoteReaction: (conversationId, messageId, reactions) => {
        set((state) => {
          const updatedMessages = { ...state.messages };
          let found = false;

          if (updatedMessages[conversationId]) {
            updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) => {
              if (msg.id === messageId) {
                found = true;
                return { ...msg, reactions: reactions || {} };
              }
              return msg;
            });
          }

          // Fallback search across all conversations
          if (!found) {
            Object.keys(updatedMessages).forEach((cId) => {
              updatedMessages[cId] = updatedMessages[cId].map((msg) => {
                if (msg.id === messageId) {
                  return { ...msg, reactions: reactions || {} };
                }
                return msg;
              });
            });
          }

          return {
            messages: updatedMessages,
          };
        });
      },

      handleSyncRequest: (conversationId, requesterId) => {
        const currentUser = useStore.getState().currentUser;
        const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";
        if (requesterId.startsWith(`${myId}-self-`)) return;

        const convMessages = get().messages[conversationId] || [];
        if (convMessages.length > 0) {
          broadcastChatSyncResponse(conversationId, convMessages);
        }
      },

      receiveSyncMessages: (conversationId, remoteMessages) => {
        if (!remoteMessages || !Array.isArray(remoteMessages) || remoteMessages.length === 0) return;
        set((state) => {
          const existing = state.messages[conversationId] || [];
          const map = new Map<string, ChatMessage>();
          existing.forEach((m) => map.set(m.id, m));
          remoteMessages.forEach((m) => {
            if (m?.id && !map.has(m.id)) {
              map.set(m.id, m);
            }
          });

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          const conv = state.conversations[conversationId];
          return {
            messages: {
              ...state.messages,
              [conversationId]: merged,
            },
            conversations: {
              ...state.conversations,
              ...(conv && merged.length > 0
                ? {
                    [conversationId]: {
                      ...conv,
                      lastMessage: merged[merged.length - 1],
                      updatedAt: merged[merged.length - 1].createdAt,
                    },
                  }
                : {}),
            },
          };
        });
      },

      requestConversationSync: (conversationId) => {
        const currentUser = useStore.getState().currentUser;
        const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";
        const randomId = Math.random().toString(36).substring(2, 6);
        broadcastChatSyncRequest(conversationId, `${myId}-self-${randomId}`);
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
