import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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

const STORAGE_KEY = "unilink:chat";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && isMountedRef.current) {
        try {
          setMessages(JSON.parse(raw));
        } catch {}
      }
    });
    return () => {
      isMountedRef.current = false;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  function persistMessages(msgs: ChatMessage[]) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  }

  const sendMessage = useCallback((text: string) => {
    const newMsg: ChatMessage = {
      id: `${Date.now()}-self`,
      text,
      fromSelf: true,
      timestamp: Date.now(),
      status: "sending",
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      persistMessages(updated);
      return updated;
    });

    setTimeout(() => {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: "delivered" as const } : m,
        );
        persistMessages(updated);
        return updated;
      });
    }, 400);

    const typingDelay = 1200 + Math.random() * 1800;
    const replyDelay = typingDelay + 1000 + Math.random() * 1200;

    typingTimer.current = setTimeout(() => {
      if (isMountedRef.current) setIsTyping(true);
    }, typingDelay);

    replyTimer.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsTyping(false);
      const reply: ChatMessage = {
        id: `${Date.now()}-other`,
        text: randomReply(),
        fromSelf: false,
        timestamp: Date.now(),
        status: "delivered",
      };
      setMessages((prev) => {
        const updated = [...prev, reply];
        persistMessages(updated);
        return updated;
      });
      setUnreadCount((c) => c + 1);
    }, replyDelay);
  }, []);

  function clearChat() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setMessages([]);
    setIsTyping(false);
    setUnreadCount(0);
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  function markRead() {
    setUnreadCount(0);
  }

  return (
    <ChatContext.Provider
      value={{ messages, isTyping, sendMessage, clearChat, unreadCount, markRead }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
