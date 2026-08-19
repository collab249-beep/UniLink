import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ActivityType } from "@/constants/activities";
import { scheduleFreeExpiryAlert } from "@/hooks/useNotifications";
import { api, getToken } from "@/lib/api";

// AsyncStorage key used only as a fast client-side restore cache
const CACHE_KEY = "unilink:free";
const FREE_DURATION_MS = 60 * 60 * 1000;

export interface LiveStats {
  totalActive: number;
  uonActive: number;
  ntuActive: number;
  byActivity: Partial<Record<ActivityType, number>>;
}

interface LiveActivityContextType {
  isFree: boolean;
  freeUntil: number | null;
  freeTimeRemaining: number;
  selectedCampus: string | null;
  stats: LiveStats;
  setFree: (campusId: string) => Promise<void>;
  setNotFree: () => Promise<void>;
  setCampus: (campusId: string) => void;
}

const LiveActivityContext = createContext<LiveActivityContextType | null>(null);

const DEFAULT_STATS: LiveStats = {
  totalActive: 0,
  uonActive: 0,
  ntuActive: 0,
  byActivity: {},
};

export function LiveActivityProvider({ children }: { children: React.ReactNode }) {
  const [isFree, setIsFreeState] = useState(false);
  const [freeUntil, setFreeUntil] = useState<number | null>(null);
  const [freeTimeRemaining, setFreeTimeRemaining] = useState(0);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [stats, setStats] = useState<LiveStats>(DEFAULT_STATS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freeRef = useRef<boolean>(false);

  async function fetchStats(campusId?: string) {
    try {
      const { stats: s } = await api.live.getStats(campusId);
      setStats({
        ...s,
        byActivity: s.byActivity as Partial<Record<ActivityType, number>>,
        // Add 1 for the current user if they are free (server counts all users)
        totalActive: freeRef.current ? s.totalActive : s.totalActive,
      });
    } catch {}
  }

  useEffect(() => {
    // Restore from cache first for instant UI
    AsyncStorage.getItem(CACHE_KEY).then(async (raw) => {
      if (raw) {
        try {
          const data = JSON.parse(raw) as { freeUntil: number; campusId: string };
          if (Date.now() < data.freeUntil) {
            setIsFreeState(true);
            freeRef.current = true;
            setFreeUntil(data.freeUntil);
            setSelectedCampus(data.campusId);
            startFreeTimer(data.freeUntil);
          } else {
            AsyncStorage.removeItem(CACHE_KEY);
          }
        } catch {}
      }
    });

    // Fetch live stats immediately (only if logged in)
    getToken().then((token) => {
      if (token) fetchStats();
    });

    // Poll stats every 30s
    statsRef.current = setInterval(() => fetchStats(), 30_000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statsRef.current) clearInterval(statsRef.current);
    };
  }, []);

  function startFreeTimer(until: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    const update = () => {
      const remaining = Math.max(0, until - Date.now());
      setFreeTimeRemaining(remaining);
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFreeState(false);
        freeRef.current = false;
        setFreeUntil(null);
        AsyncStorage.removeItem(CACHE_KEY);
        api.live.setNotFree().catch(() => {});
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }

  async function setFree(campusId: string) {
    const until = Date.now() + FREE_DURATION_MS;
    // Update cache immediately for responsive UI
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ freeUntil: until, campusId }));
    setIsFreeState(true);
    freeRef.current = true;
    setFreeUntil(until);
    setSelectedCampus(campusId);
    startFreeTimer(until);
    scheduleFreeExpiryAlert(FREE_DURATION_MS).catch(() => {});
    // Sync to server
    api.live.setFree(campusId).catch(() => {});
    // Refresh stats
    await fetchStats(campusId);
  }

  async function setNotFree() {
    if (timerRef.current) clearInterval(timerRef.current);
    await AsyncStorage.removeItem(CACHE_KEY);
    setIsFreeState(false);
    freeRef.current = false;
    setFreeUntil(null);
    setFreeTimeRemaining(0);
    api.live.setNotFree().catch(() => {});
    await fetchStats();
  }

  function setCampus(campusId: string) {
    setSelectedCampus(campusId);
    fetchStats(campusId);
  }

  return (
    <LiveActivityContext.Provider value={{
      isFree, freeUntil, freeTimeRemaining,
      selectedCampus, stats,
      setFree, setNotFree, setCampus,
    }}>
      {children}
    </LiveActivityContext.Provider>
  );
}

export function useLiveActivity() {
  const ctx = useContext(LiveActivityContext);
  if (!ctx) throw new Error("useLiveActivity must be used inside LiveActivityProvider");
  return ctx;
}
