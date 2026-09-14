import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ActivityType } from "@/constants/activities";
import { api, type ApiHistoryItem, type ApiSession } from "@/lib/api";

const SESSION_DURATION_MS = 30 * 60 * 1000;

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

function apiSessionToMeetup(s: ApiSession): MeetupSession {
  return {
    id: s.id,
    activity: s.activity as ActivityType,
    participants: s.participants.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      university: p.university ?? "University",
      profilePicture: p.profilePicture ?? undefined,
    })),
    location: s.location,
    campus: s.campus,
    startTime: s.startTime,
    meetDeadline: s.meetDeadline,
    expiresAt: s.expiresAt,
    attendanceConfirmed: s.attendanceConfirmed,
  };
}

function apiHistoryToItem(h: ApiHistoryItem): MeetupHistoryItem {
  return {
    id: h.id,
    activity: h.activity as ActivityType,
    participants: h.participants.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      university: p.university ?? "University",
      profilePicture: p.profilePicture ?? undefined,
    })),
    location: h.location,
    campus: h.campus,
    startTime: h.startTime,
    endTime: h.endTime,
    attendanceConfirmed: h.attendanceConfirmed,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MeetupSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [history, setHistory] = useState<MeetupHistoryItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore active session and history on mount
  useEffect(() => {
    api.sessions.getActive()
      .then(({ session: s }) => {
        if (s) {
          const m = apiSessionToMeetup(s);
          setSession(m);
          startTimer(m);
        }
      })
      .catch(() => {});

    api.sessions.getHistory()
      .then(({ history: h }) => setHistory(h.map(apiHistoryToItem)))
      .catch(() => {});

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!session) return;
    const sessionId = session.id;
    const refresh = async () => {
      try {
        const { session: active } = await api.sessions.getActive();
        if (!active) {
          setSession(null);
          setTimeRemaining(0);
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }
        if (active.id === sessionId) {
          setSession(apiSessionToMeetup(active));
        }
      } catch {
        // Keep the last known session during temporary connectivity loss.
      }
    };
    const refreshTimer = setInterval(refresh, 5000);
    return () => clearInterval(refreshTimer);
  }, [session?.id]);

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
    _currentUserId: string,
    _currentFirstName: string,
    _currentUniversity: string,
  ): Promise<MeetupSession> {
    const { session: s } = await api.sessions.create({ activity, campusId });
    if (!s) throw new Error("Failed to create session");
    const meetup = apiSessionToMeetup(s);
    setSession(meetup);
    startTimer(meetup);
    return meetup;
  }

  async function confirmAttendance() {
    const { session: s } = await api.sessions.confirmAttendance();
    if (!s) throw new Error("Attendance confirmation did not return a session");
    setSession(apiSessionToMeetup(s));
  }

  async function leaveSession() {
    await api.sessions.leave();
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(null);
    setTimeRemaining(0);
    try {
      const { history: latestHistory } = await api.sessions.getHistory();
      setHistory(latestHistory.map(apiHistoryToItem));
    } catch {
      // Leaving succeeded; a history refresh can safely wait until next launch.
    }
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
