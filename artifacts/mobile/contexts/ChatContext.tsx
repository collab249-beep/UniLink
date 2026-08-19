import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { api, getToken } from "@/lib/api";
import { useSession } from "./SessionContext";

export interface ChatMessage {
  id: string;
  text: string;
  fromSelf: boolean;
  timestamp: number;
  status: "sending" | "sent" | "delivered";
}

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  unreadCount: number;
  markRead: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isTyping: false,
  sendMessage: () => {},
  clearChat: () => {},
  unreadCount: 0,
  markRead: () => {},
});

const SIMULATED_REPLIES = [
  "Sounds good! See you there 👋",
  "I'm heading over now",
  "On my way, 2 mins!",
  "Just left the library",
  "Cool, I'll be the one in a blue hoodie 😄",
  "Great, looking forward to it!",
  "Yeah, I know the spot",
  "Running a tiny bit late, sorry!",
  "Perfect, see you soon!",
  "I'm already near there actually",
  "Which entrance are you at?",
  "I can see the spot from here",
];

function randomReply(): string {
  return SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const sessionId = session?.id ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgCount = useRef(0);
  const isMountedRef = useRef(true);

  // Load messages and start polling when session changes
  useEffect(() => {
    isMountedRef.current = true;
    setMessages([]);
    setUnreadCount(0);
    lastMsgCount.current = 0;

    if (!sessionId) return;

    async function loadMessages() {
      try {
        const token = await getToken();
        if (!token || !sessionId) return;
        const { messages: apiMsgs } = await api.chat.getMessages(sessionId);
        if (!isMountedRef.current) return;
        const mapped: ChatMessage[] = apiMsgs.map((m) => ({
          id: m.id,
          text: m.text,
          fromSelf: m.fromSelf,
          timestamp: m.timestamp,
          status: m.status as ChatMessage["status"],
        }));
        setMessages(mapped);
        lastMsgCount.current = mapped.length;
      } catch {}
    }

    loadMessages();

    // Poll for new messages every 5s
    pollTimer.current = setInterval(async () => {
      if (!sessionId || !isMountedRef.current) return;
      try {
        const token = await getToken();
        if (!token) return;
        const { messages: apiMsgs } = await api.chat.getMessages(sessionId);
        if (!isMountedRef.current) return;
        if (apiMsgs.length > lastMsgCount.current) {
          const newRealMsgs = apiMsgs.slice(lastMsgCount.current);
          const newFromOthers = newRealMsgs.filter((m) => !m.fromSelf);
          const mapped: ChatMessage[] = apiMsgs.map((m) => ({
            id: m.id,
            text: m.text,
            fromSelf: m.fromSelf,
            timestamp: m.timestamp,
            status: m.status as ChatMessage["status"],
          }));
          setMessages(mapped);
          if (newFromOthers.length) setUnreadCount((c) => c + newFromOthers.length);
          lastMsgCount.current = mapped.length;
        }
      } catch {}
    }, 5000);

    return () => {
      isMountedRef.current = false;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [sessionId]);

  const sendMessage = useCallback((text: string) => {
    const tempId = `${Date.now()}-self-temp`;
    const newMsg: ChatMessage = {
      id: tempId,
      text,
      fromSelf: true,
      timestamp: Date.now(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMsg]);

    // Persist to server if in a session
    if (sessionId) {
      api.chat.sendMessage(sessionId, text)
        .then(({ message }) => {
          if (!isMountedRef.current) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { id: message.id, text: message.text, fromSelf: true, timestamp: message.timestamp, status: "delivered" as const }
                : m,
            ),
          );
          lastMsgCount.current += 1;
        })
        .catch(() => {
          // Mark as delivered anyway for offline feel
          if (isMountedRef.current) {
            setMessages((prev) =>
              prev.map((m) => m.id === tempId ? { ...m, status: "delivered" as const } : m),
            );
          }
        });
    } else {
      // No session: mark delivered locally
      setTimeout(() => {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) => m.id === tempId ? { ...m, status: "delivered" as const } : m),
          );
        }
      }, 400);
    }

    // Simulated reply for demo feel (local only, not persisted)
    const typingDelay = 1200 + Math.random() * 1800;
    const replyDelay = typingDelay + 1000 + Math.random() * 1200;

    typingTimer.current = setTimeout(() => {
      if (isMountedRef.current) setIsTyping(true);
    }, typingDelay);

    replyTimer.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsTyping(false);
      const reply: ChatMessage = {
        id: `${Date.now()}-sim`,
        text: randomReply(),
        fromSelf: false,
        timestamp: Date.now(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, reply]);
      setUnreadCount((c) => c + 1);
    }, replyDelay);
  }, [sessionId]);

  function clearChat() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setMessages([]);
    setIsTyping(false);
    setUnreadCount(0);
    lastMsgCount.current = 0;
  }

  function markRead() {
    setUnreadCount(0);
  }

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearChat, unreadCount, markRead }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
