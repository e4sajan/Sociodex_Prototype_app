import { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Send,
  MessageSquare,
  Search,
  User,
  Sparkles,
  Smile,
  Image as ImageIcon,
  Mic,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Lock,
  Check,
  CheckCheck,
  Trash2,
  Reply,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useChatStore, type ChatMessage, type ChatConversation } from "@/lib/chatStore";
import { useStore } from "@/lib/store";
import { subscribeToChatRealtime } from "@/lib/supabase";
import { toast } from "sonner";

const QUICK_SUGGESTIONS = [
  "Loved your memory photo! 📸",
  "So excited for the celebration! 🎉",
  "Let's coordinate on the keepsake! 🎁",
  "Thank you for the warm wish! 💖",
  "Can't wait to see you! ✨",
];

const EMOJI_LIST = ["❤️", "👍", "👏", "🎉", "😂", "✨", "🙏", "💖", "🌸", "🥂", "🎂", "💐"];

export function ChatDrawer() {
  const isDrawerOpen = useChatStore((s) => s.isDrawerOpen);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const soundEnabled = useChatStore((s) => s.soundEnabled);

  const setDrawerOpen = useChatStore((s) => s.setDrawerOpen);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const toggleSoundEnabled = useChatStore((s) => s.toggleSoundEnabled);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const markAsRead = useChatStore((s) => s.markAsRead);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const currentUser = useStore((s) => s.currentUser);

  // Local component states
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Voice note recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv: ChatConversation | undefined = activeConversationId
    ? conversations[activeConversationId]
    : undefined;
  const activeMessages: ChatMessage[] = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  // Filtered direct conversations list (excluding rooms/groups)
  const filteredConversations = useMemo(() => {
    const list = Object.values(conversations).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return list.filter((conv) => {
      // Keep direct 1-on-1 conversations only
      if (conv.type === "memory_group") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = conv.title.toLowerCase().includes(q);
        const matchMemory = conv.memoryTitle?.toLowerCase().includes(q);
        const matchLast = conv.lastMessage?.content.toLowerCase().includes(q);
        return matchTitle || matchMemory || matchLast;
      }
      return true;
    });
  }, [conversations, searchQuery]);

  // Auto-scroll on new message
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversationId, activeMessages.length, markAsRead]);

  // Voice note timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Cross-device live chat synchronization
  useEffect(() => {
    const memorySlug = activeConv?.memorySlug;
    const unsubscribe = subscribeToChatRealtime(
      memorySlug,
      (msg, conv) => {
        useChatStore.getState().receiveRemoteMessage(msg, conv);
      },
      (convId, msgId, reactions) => {
        useChatStore.getState().receiveRemoteReaction(convId, msgId, reactions);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [activeConv?.memorySlug]);

  if (!isDrawerOpen) return null;

  const handleSendText = () => {
    if (!currentUser) {
      toast.error("Please sign in to send messages.");
      return;
    }
    if (!inputText.trim() || !activeConversationId) return;

    sendMessage({
      conversationId: activeConversationId,
      content: inputText.trim(),
      replyToId: replyTo?.id,
      replyToSnippet: replyTo?.content.slice(0, 50),
    });

    setInputText("");
    setReplyTo(null);
    setShowEmojiPicker(false);
  };

  const startVoiceRecording = async () => {
    if (!currentUser) {
      toast.error("Please sign in to record voice notes.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(200);
      setIsRecordingVoice(true);
    } catch (err) {
      console.warn("Microphone access error:", err);
      toast.error("Microphone permission denied or not supported.");
    }
  };

  const stopAndSendVoiceRecording = () => {
    if (!mediaRecorderRef.current || !activeConversationId) {
      setIsRecordingVoice(false);
      return;
    }

    const duration = Math.max(1, voiceSeconds);
    const recorder = mediaRecorderRef.current;

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        sendMessage({
          conversationId: activeConversationId,
          content: `🎙️ Voice Note (${duration}s)`,
          mediaUrl: base64Audio,
          mediaType: "audio",
          audioDuration: duration,
        });
        toast.success("Voice note sent!");
      };
      reader.readAsDataURL(audioBlob);

      recorder.stream.getTracks().forEach((track) => track.stop());
    };

    recorder.stop();
    setIsRecordingVoice(false);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecordingVoice(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      toast.error("Please sign in to send photo attachments.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sendMessage({
        conversationId: activeConversationId,
        content: "📸 Sent a photo attachment",
        mediaUrl: base64,
        mediaType: "photo",
      });
      toast.success("Photo attachment shared!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const myId = currentUser?.email || currentUser?.name || currentUser?.id || "guest-me";
  const myName = (currentUser?.name || "").trim().toLowerCase();
  const myEmail = (currentUser?.email || "").trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-[#241621]/40 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`relative flex flex-col bg-[#FFFDF9] text-[#241621] shadow-2xl border-l border-[#241621]/15 transition-all duration-300 ease-in-out pointer-events-auto h-full ${
          isMaximized
            ? "w-full max-w-4xl"
            : "w-full max-w-md sm:max-w-lg"
        }`}
      >
        {/* ==================================================================== */}
        {/* AUTH REQUIREMENT VIEW (When user is NOT logged in)                   */}
        {/* ==================================================================== */}
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-3xl bg-[#E4603C]/10 flex items-center justify-center text-3xl text-[#E4603C] border border-[#E4603C]/20 shadow-xs">
                💬
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#EBC85A] text-[#241621] text-xs flex items-center justify-center font-bold border-2 border-white shadow-xs">
                <Lock className="h-3 w-3" />
              </span>
            </div>

            <div className="space-y-2 max-w-xs">
              <h3 className="font-display text-xl font-bold text-[#241621]">
                Sign in to Message
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You need to be signed in to SocioDex to chat directly with memory contributors, page creators, and guests.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  window.location.href = "/login";
                }}
                className="w-full rounded-full bg-[#E4603C] text-white py-3 text-xs font-bold shadow-md hover:bg-[#C94B29] transition cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-full border border-[#241621]/15 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-[#FAF6F0] transition cursor-pointer select-none"
              >
                Close
              </button>
            </div>
          </div>
        ) : !activeConv ? (
          /* ==================================================================== */
          /* DIRECT MESSAGES INBOX VIEW                                           */
          /* ==================================================================== */
          <div className="flex flex-col h-full">
            {/* Inbox Header */}
            <div className="p-4 sm:p-5 border-b border-[#241621]/10 bg-white/85 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-[#E4603C]/10 flex items-center justify-center border border-[#E4603C]/25 text-[#E4603C]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold leading-tight text-[#241621]">
                      Direct Messages
                    </h2>
                    <p className="text-[11px] text-[#594855] font-medium">
                      Private 1-on-1 chats with contributors
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSoundEnabled}
                    title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
                    className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-[#E4603C]" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close Chat"
                    className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-3.5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search direct messages..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#241621]/10 outline-none focus:border-[#E4603C] transition"
                />
              </div>
            </div>

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#FAF6F0] mx-auto flex items-center justify-center text-xl text-neutral-400">
                    💬
                  </div>
                  <h3 className="text-sm font-bold text-neutral-700">No direct messages yet</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Click the <strong>Message</strong> button next to any contributor or follower on a memory page or tracker dashboard to start chatting!
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const hasUnread = (conv.unreadCount || 0) > 0;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv.id)}
                      className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        hasUnread
                          ? "bg-white border-[#E4603C]/30 shadow-xs hover:border-[#E4603C]"
                          : "bg-white/60 hover:bg-white border-[#241621]/10 hover:border-[#241621]/20 hover:shadow-xs"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className="h-11 w-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-xs border border-white text-white"
                          style={{
                            backgroundColor: conv.avatarColor || "#E4603C",
                          }}
                        >
                          {conv.avatar || conv.title[0]}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#241621] truncate">
                            {conv.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400 font-semibold shrink-0">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {conv.memoryTitle && (
                          <div className="text-[10px] font-semibold text-[#E4603C] truncate mb-1">
                            ✨ {conv.memoryTitle}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-neutral-500 truncate leading-snug">
                            {conv.isTyping ? (
                              <span className="text-[#E4603C] font-semibold animate-pulse">
                                {conv.typingUser || "Contributor"} is typing...
                              </span>
                            ) : (
                              conv.lastMessage?.content || "Tap to open chat"
                            )}
                          </p>

                          {hasUnread && (
                            <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#E4603C] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* ACTIVE 1-ON-1 CONVERSATION VIEW                                      */
          /* ==================================================================== */
          <div className="flex flex-col h-full">
            {/* Top Bar */}
            <div className="p-3.5 sm:p-4 border-b border-[#241621]/10 bg-white/90 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveConversation(null)}
                  title="Back to inbox"
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative shrink-0">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center text-base font-bold shadow-xs text-white"
                    style={{
                      backgroundColor: activeConv.avatarColor || "#E4603C",
                    }}
                  >
                    {activeConv.avatar || activeConv.title[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#241621] truncate">
                      {activeConv.title}
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4603C]/10 text-[#E4603C] border border-[#E4603C]/20 shrink-0">
                      Direct Message
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {activeConv.isTyping ? (
                      <span className="text-[#E4603C] font-semibold animate-pulse">typing a message...</span>
                    ) : activeConv.memoryTitle ? (
                      `Memory: ${activeConv.memoryTitle}`
                    ) : (
                      "Active on SocioDex"
                    )}
                  </p>
                </div>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Restore view" : "Maximize view"}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  title="Close Chat"
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6F0]/40">
              {/* Memory context callout card */}
              {activeConv.memoryTitle && (
                <div className="bg-white/80 border border-[#241621]/10 rounded-2xl p-3 text-center space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#E4603C] uppercase tracking-wider">
                    ✨ Direct Memory Thread
                  </span>
                  <p className="text-xs font-bold text-neutral-800">
                    {activeConv.memoryTitle}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Private direct messages linked with this keepsake celebration.
                  </p>
                </div>
              )}

              {/* Empty state when no messages yet */}
              {activeMessages.length === 0 && (
                <div className="text-center py-10 px-4 space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-[#241621]/10 mx-auto flex items-center justify-center text-xl shadow-xs">
                    👋
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-800">
                    Start a conversation with {activeConv.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                    Send a private message to coordinate or share wishes for {activeConv.memoryTitle || "this page"}.
                  </p>
                </div>
              )}

              {/* Message bubbles stream */}
              {activeMessages.map((msg) => {
                // Correct sender identification
                const isMe =
                  msg.senderId === "me" ||
                  msg.senderId === "guest-me" ||
                  msg.senderId === myId ||
                  (currentUser?.id && msg.senderId === currentUser.id) ||
                  (myEmail && msg.senderId.toLowerCase() === myEmail) ||
                  (myName && msg.senderName.trim().toLowerCase() === myName);

                const reactions = Object.entries(msg.reactions || {});

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[85%] sm:max-w-[78%] ${
                        isMe ? "justify-end ml-auto" : "justify-start mr-auto"
                      }`}
                    >
                      {/* Left Avatar for Received Messages Only */}
                      {!isMe && (
                        <div
                          className="h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0 mb-1"
                          style={{
                            backgroundColor: msg.senderColor || activeConv.avatarColor || "#E4603C",
                          }}
                        >
                          {msg.senderAvatar || (msg.senderName ? msg.senderName[0] : "👤")}
                        </div>
                      )}

                      {/* Bubble Content Box */}
                      <div
                        className={`relative rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-gradient-to-br from-[#E4603C] to-[#C94B29] text-white rounded-br-xs"
                            : "bg-white border border-[#241621]/10 text-[#241621] rounded-bl-xs"
                        }`}
                      >
                        {/* Reply quote snippet */}
                        {msg.replyToSnippet && (
                          <div
                            className={`mb-2 p-2 rounded-xl text-[11px] border-l-2 ${
                              isMe
                                ? "bg-black/15 border-white/60 text-white/90"
                                : "bg-[#FAF6F0] border-[#E4603C] text-neutral-700"
                            }`}
                          >
                            <span className="block font-bold text-[9px] uppercase tracking-wider opacity-75">
                              Replying to message
                            </span>
                            <span className="truncate block">{msg.replyToSnippet}</span>
                          </div>
                        )}

                        {/* Text Content */}
                        <p className="whitespace-pre-wrap font-medium">{msg.content}</p>

                        {/* Media Attachment (Photo) */}
                        {msg.mediaType === "photo" && msg.mediaUrl && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-white/20">
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="max-h-48 w-full object-cover rounded-xl"
                            />
                          </div>
                        )}

                        {/* Media Attachment (Voice Note) */}
                        {msg.mediaType === "audio" && (
                          <div
                            className={`mt-2 flex items-center gap-2 p-2 rounded-xl ${
                              isMe ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            <Mic className="h-4 w-4 text-[#EBC85A] animate-pulse" />
                            <div className="flex-1">
                              <div className="h-1.5 bg-current opacity-30 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-current w-3/4 rounded-full" />
                              </div>
                            </div>
                            <span className="text-[10px] font-bold">
                              {msg.audioDuration || 3}s
                            </span>
                          </div>
                        )}

                        {/* Timestamp & Status */}
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-semibold ${
                            isMe ? "text-white/80" : "text-neutral-400"
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && (
                            <span>
                              {msg.status === "sending" ? (
                                <span className="opacity-60">⏳</span>
                              ) : msg.status === "sent" ? (
                                <Check className="h-2.5 w-2.5" />
                              ) : (
                                <CheckCheck className="h-2.5 w-2.5 text-[#EBC85A]" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* Hover Action Pill for Quick Reaction & Reply */}
                        <div
                          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10 ${
                            isMe ? "right-full mr-1.5" : "left-full ml-1.5"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleReaction({
                                conversationId: activeConv.id,
                                messageId: msg.id,
                                emoji: "❤️",
                              })
                            }
                            title="React with Heart"
                            className="h-6 w-6 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-xs hover:scale-110 transition cursor-pointer"
                          >
                            ❤️
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleReaction({
                                conversationId: activeConv.id,
                                messageId: msg.id,
                                emoji: "👍",
                              })
                            }
                            title="React with Thumbs Up"
                            className="h-6 w-6 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-xs hover:scale-110 transition cursor-pointer"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyTo(msg)}
                            title="Reply to message"
                            className="h-6 w-6 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-600 hover:text-[#E4603C] hover:scale-110 transition cursor-pointer"
                          >
                            <Reply className="h-3 w-3" />
                          </button>
                          {isMe && (
                            <button
                              type="button"
                              onClick={() => deleteMessage(activeConv.id, msg.id)}
                              title="Delete message"
                              className="h-6 w-6 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-red-500 hover:scale-110 transition cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reaction Badges List under message */}
                    {reactions.length > 0 && (
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMe ? "mr-1 justify-end" : "ml-9 justify-start"
                        }`}
                      >
                        {reactions.map(([emoji, userList]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() =>
                              toggleReaction({
                                conversationId: activeConv.id,
                                messageId: msg.id,
                                emoji,
                              })
                            }
                            title={`Reacted by: ${userList.join(", ")}`}
                            className="inline-flex items-center gap-1 rounded-full bg-white border border-[#241621]/15 px-2 py-0.5 text-[10px] font-bold shadow-2xs hover:scale-105 transition cursor-pointer"
                          >
                            <span>{emoji}</span>
                            <span>{userList.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {activeConv.isTyping && (
                <div className="flex items-center gap-2 text-neutral-500 text-xs py-1">
                  <div className="h-6 w-6 rounded-xl bg-white border border-[#241621]/15 flex items-center justify-center text-xs shadow-2xs">
                    💬
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-[#241621]/10 px-3 py-1.5 rounded-full shadow-2xs">
                    <span className="text-[11px] font-medium">
                      {activeConv.typingUser || "Contributor"} is typing
                    </span>
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E4603C] animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E4603C] animate-bounce [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E4603C] animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 pt-2 pb-1 bg-white border-t border-[#241621]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(suggestion);
                    chatInputRef.current?.focus();
                  }}
                  className="rounded-full bg-[#FAF6F0] hover:bg-[#F4ECE0] border border-[#241621]/10 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 whitespace-nowrap transition cursor-pointer select-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Replying banner */}
            {replyTo && (
              <div className="px-3 py-1.5 bg-[#FAF6F0] border-t border-[#241621]/10 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="h-3.5 w-3.5 text-[#E4603C]" />
                  <span className="font-bold text-neutral-700">
                    Replying to {replyTo.senderName}:
                  </span>
                  <span className="text-neutral-500 truncate">
                    {replyTo.content}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Emoji picker tray */}
            {showEmojiPicker && (
              <div className="p-2 bg-white border-t border-[#241621]/10 flex items-center gap-2 flex-wrap shrink-0">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                      chatInputRef.current?.focus();
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-lg transition cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer */}
            <div className="p-3 bg-white border-t border-[#241621]/10 shrink-0">
              {isRecordingVoice ? (
                <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl p-2.5">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
                    Recording voice message... ({voiceSeconds}s)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={cancelVoiceRecording}
                      className="px-3 py-1 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendVoiceRecording}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Send className="h-3 w-3" />
                      Send Note
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-0.5 pb-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Insert emoji"
                      className="p-1.5 rounded-xl hover:bg-neutral-100 hover:text-[#E4603C] transition cursor-pointer"
                    >
                      <Smile className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach photo"
                      className="p-1.5 rounded-xl hover:bg-neutral-100 hover:text-[#E4603C] transition cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      title="Record voice note"
                      className="p-1.5 rounded-xl hover:bg-neutral-100 hover:text-[#E4603C] transition cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={chatInputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendText();
                        }
                      }}
                      placeholder={`Message ${activeConv.title}...`}
                      rows={1}
                      className="w-full max-h-24 py-2.5 px-3.5 text-xs sm:text-sm rounded-2xl bg-[#FAF6F0] border border-[#241621]/15 outline-none focus:border-[#E4603C] resize-none transition"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSendText}
                    disabled={!inputText.trim()}
                    title="Send message"
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                      inputText.trim()
                        ? "bg-[#E4603C] hover:bg-[#C94B29] shadow-md"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
