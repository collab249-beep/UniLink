import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ActivityType } from "@/constants/activities";
import { scheduleFreeExpiryAlert } from "@/hooks/useNotifications";

const STORAGE_KEY = "unilink:free";
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

function generateStats(seed: number): LiveStats {
  const r = (base: number, range: number) => base + Math.floor((((seed * 9301 + 49297) % 233280) / 233280) * range);
  const r2 = (base: number, range: number) => base + Math.floor((((seed * 2153 + 31489) % 193200) / 193200) * range);
  const r3 = (base: number, range: number) => base + Math.floor((((seed * 7177 + 17117) % 172320) / 172320) * range);
  return {
    totalActive: r(38, 22),
    uonActive: r2(20, 14),
    ntuActive: r3(14, 12),
    byActivity: {
      study: r(10, 8),
      coffee: r2(5, 6),
      lunch: r3(4, 5),
      football: r(3, 4),
      gym: r2(3, 4),
      gaming: r3(2, 3),
      night_out: r(4, 6),
      society: r2(3, 5),
    },
  };
}

export function LiveActivityProvider({ children }: { children: React.ReactNode }) {
  const [isFree, setIsFreeState] = useState(false);
  const [freeUntil, setFreeUntil] = useState<number | null>(null);
  const [freeTimeRemaining, setFreeTimeRemaining] = useState(0);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [statSeed, setStatSeed] = useState(() => Date.now() % 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const data = JSON.parse(raw) as { freeUntil: number; campusId: string };
        if (Date.now() < data.freeUntil) {
          setIsFreeState(true);
          setFreeUntil(data.freeUntil);
          setSelectedCampus(data.campusId);
          startFreeTimer(data.freeUntil);
        } else {
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    });

    statsRef.current = setInterval(() => {
      setStatSeed(Date.now() % 1000);
    }, 30000);

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
        setFreeUntil(null);
        AsyncStorage.removeItem(STORAGE_KEY);
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }

  async function setFree(campusId: string) {
    const until = Date.now() + FREE_DURATION_MS;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ freeUntil: until, campusId }));
    setIsFreeState(true);
    setFreeUntil(until);
    setSelectedCampus(campusId);
    startFreeTimer(until);
    scheduleFreeExpiryAlert(FREE_DURATION_MS).catch(() => {});
  }

  async function setNotFree() {
    if (timerRef.current) clearInterval(timerRef.current);
    await AsyncStorage.removeItem(STORAGE_KEY);
    setIsFreeState(false);
    setFreeUntil(null);
    setFreeTimeRemaining(0);
  }

  function setCampus(campusId: string) {
    setSelectedCampus(campusId);
  }

  const stats = generateStats(statSeed);
  if (isFree) {
    stats.totalActive += 1;
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
