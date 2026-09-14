import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Config ────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "unilink:auth_token";

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "http://localhost:3000/api";
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── Types (matching the API responses) ───────────────────────────────────────

export interface ApiUser {
  id: string;
  firstName: string;
  email: string;
  universityEmail: string | null;
  universityId: string | null;
  university: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  reliabilityScore: number;
  referralCode: string;
  referralCount: number;
  isAmbassador: boolean;
  bio: string | null;
  interests: string[] | null;
  year: string | null;
  course: string | null;
  isProfileComplete: boolean;
  isPremium: boolean;
  communityGuidelinesAcceptedAt?: string | null;
  createdAt: string;
}

export interface ApiParticipant {
  id: string;
  firstName: string;
  university: string | null;
  profilePicture: string | null;
  attendanceConfirmed?: boolean;
}

export interface ApiSession {
  id: string;
  activity: string;
  campus: string;
  location: string;
  startTime: number;
  meetDeadline: number;
  expiresAt: number;
  attendanceConfirmed: boolean;
  participants: ApiParticipant[];
}

export interface ApiHistoryItem {
  id: string;
  activity: string;
  campus: string;
  location: string;
  startTime: number;
  endTime: number;
  attendanceConfirmed: boolean;
  participants: ApiParticipant[];
}

export interface ApiChatMessage {
  id: string;
  text: string;
  fromSelf: boolean;
  senderId: string;
  timestamp: number;
  status: string;
}

export interface ApiLiveStats {
  totalActive: number;
  uonActive: number;
  ntuActive: number;
  byActivity: Record<string, number>;
}

export interface ApiNotificationPrefs {
  groupActivity: boolean;
  eventReminders: boolean;
  freeExpiry: boolean;
  nearbyStudents: boolean;
}

// ── API client ────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    firebaseSignIn: (idToken: string, firstName?: string) =>
      request<{ token: string; user: ApiUser }>("/auth/firebase", {
        method: "POST",
        body: JSON.stringify({ idToken, firstName }),
      }),
    signIn: (email: string) =>
      request<{ token: string; user: ApiUser }>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    signUp: (data: {
      firstName: string;
      email: string;
      acceptedCommunityGuidelines: boolean;
    }) =>
      request<{ token: string; user: ApiUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    signOut: () =>
      request<{ success: boolean }>("/auth/signout", { method: "POST" }),
    deleteAccount: (idToken: string) =>
      request<{ success: boolean }>("/auth/account", {
        method: "DELETE",
        body: JSON.stringify({ idToken }),
      }),
    me: () => request<{ user: ApiUser }>("/auth/me"),
    updateProfile: (data: Partial<ApiUser>) =>
      request<{ user: ApiUser }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    verify: (universityEmail: string) =>
      request<{ user: ApiUser }>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ universityEmail }),
      }),
    acceptCommunityGuidelines: () =>
      request<{ user: ApiUser }>("/auth/community-guidelines", {
        method: "POST",
        body: JSON.stringify({ accepted: true }),
      }),
    block: (targetUserId: string) =>
      request<{ success: boolean }>("/auth/block", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      }),
    report: (targetUserId: string, category: string, reason: string) =>
      request<{ success: boolean }>("/auth/report", {
        method: "POST",
        body: JSON.stringify({ targetUserId, category, reason }),
      }),
  },

  live: {
    getStats: (campusId?: string) =>
      request<{ stats: ApiLiveStats }>(
        `/live/stats${campusId ? `?campusId=${encodeURIComponent(campusId)}` : ""}`,
      ),
    setFree: (campusId: string) =>
      request<{ freeUntil: number }>("/live", {
        method: "POST",
        body: JSON.stringify({ campusId }),
      }),
    setNotFree: () =>
      request<{ success: boolean }>("/live", { method: "DELETE" }),
  },

  sessions: {
    getActive: () =>
      request<{ session: ApiSession | null }>("/sessions/active"),
    create: (data: { activity: string; campusId: string }) =>
      request<{ session: ApiSession }>("/sessions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    leave: () =>
      request<{ success: boolean }>("/sessions/active", { method: "DELETE" }),
    confirmAttendance: () =>
      request<{ session: ApiSession }>("/sessions/active/confirm", {
        method: "POST",
      }),
    getHistory: () =>
      request<{ history: ApiHistoryItem[] }>("/sessions/history"),
  },

  chat: {
    getMessages: (sessionId: string) =>
      request<{ messages: ApiChatMessage[] }>(`/chat/${sessionId}`),
    sendMessage: (sessionId: string, text: string) =>
      request<{ message: ApiChatMessage }>(`/chat/${sessionId}`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
  },

  notifications: {
    getPrefs: () =>
      request<{ prefs: ApiNotificationPrefs }>("/notifications/prefs"),
    updatePrefs: (prefs: Partial<ApiNotificationPrefs>) =>
      request<{ prefs: ApiNotificationPrefs }>("/notifications/prefs", {
        method: "PUT",
        body: JSON.stringify(prefs),
      }),
  },
};
