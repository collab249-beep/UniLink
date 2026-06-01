import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ACTIVITIES, ActivityType, FAKE_PARTICIPANTS } from "@/constants/activities";
import { CAMPUSES, getSpotForActivity } from "@/constants/universities";

const STORAGE_KEY = "unilink:session";
const HISTORY_KEY = "unilink:history";
const SESSION_DURATION_MS = 30 * 60 * 1000;
const SESSION_EXPIRY_MS = 60 * 60 * 1000;

export interface Participant {
  id: string;
  firstName: string;
  university: string;
  profilePicture?: string;
}

export interface MeetupSession {
  id: string;
  activity: ActivityType;
  participants: Participant[];
  location: string;
  campus: string;
  startTime: number;
  meetDeadline: number;
  expiresAt: number;
  attendanceConfirmed: boolean;
}

export interface MeetupHistoryItem {
  id: string;
  activity: ActivityType;
  participants: Participant[];
  location: string;
  campus: string;
  startTime: number;
  endTime: number;
  attendanceConfirmed: boolean;
}

interface SessionContextType {
  session: MeetupSession | null;
  timeRemaining: number;
  history: MeetupHistoryItem[];
  createSession: (
    activity: ActivityType,
    campusId: string,
    currentUserId: string,
    currentFirstName: string,
    currentUniversity: string,
  ) => Promise<MeetupSession>;
  confirmAttendance: () => Promise<void>;
  leaveSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MeetupSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [history, setHistory] = useState<MeetupHistoryItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const s = JSON.parse(raw) as MeetupSession;
        if (Date.now() < s.expiresAt) { setSession(s); startTimer(s); }
        else AsyncStorage.removeItem(STORAGE_KEY);
      }
    });
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw) as MeetupHistoryItem[]);
    });
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startTimer(s: MeetupSession) {
    if (timerRef.current) clearInterval(timerRef.current);
    const update = () => {
      const remaining = Math.max(0, s.meetDeadline - Date.now());
      setTimeRemaining(remaining);
      if (remaining === 0 && timerRef.current) clearInterval(timerRef.current);
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }

  async function createSession(
    activity: ActivityType,
    campusId: string,
    currentUserId: string,
    currentFirstName: string,
    currentUniversity: string,
  ): Promise<MeetupSession> {
    const campus = CAMPUSES.find((c) => c.id === campusId);
    const location = campus
      ? getSpotForActivity(campusId, activity)
      : ACTIVITIES.find((a) => a.id === activity)?.label ?? "Campus";

    const otherCount = Math.floor(Math.random() * 3) + 1;
    const others = pickRandom(FAKE_PARTICIPANTS, otherCount);
    const participants: Participant[] = [
      { id: currentUserId, firstName: currentFirstName, university: currentUniversity },
      ...others,
    ];
    const now = Date.now();
    const s: MeetupSession = {
      id: now.toString() + Math.random().toString(36).slice(2, 9),
      activity,
      participants,
      location,
      campus: campus?.name ?? "Campus",
      startTime: now,
      meetDeadline: now + SESSION_DURATION_MS,
      expiresAt: now + SESSION_EXPIRY_MS,
      attendanceConfirmed: false,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSession(s);
    startTimer(s);
    return s;
  }

  async function confirmAttendance() {
    if (!session) return;
    const updated = { ...session, attendanceConfirmed: true };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSession(updated);
  }

  async function leaveSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (session) {
      const item: MeetupHistoryItem = {
        id: session.id,
        activity: session.activity,
        participants: session.participants,
        location: session.location,
        campus: session.campus,
        startTime: session.startTime,
        endTime: Date.now(),
        attendanceConfirmed: session.attendanceConfirmed,
      };
      const updated = [item, ...history].slice(0, 50);
      setHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setTimeRemaining(0);
  }

  return (
    <SessionContext.Provider value={{ session, timeRemaining, history, createSession, confirmAttendance, leaveSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
