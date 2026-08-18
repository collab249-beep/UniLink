import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export interface NotificationPrefs {
  groupActivity: boolean;
  eventReminders: boolean;
  freeExpiry: boolean;
  nearbyStudents: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  groupActivity: true,
  eventReminders: true,
  freeExpiry: true,
  nearbyStudents: false,
};

interface NotificationContextType {
  prefs: NotificationPrefs;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  updatePref: (key: keyof NotificationPrefs, value: boolean) => void;
  unreadCount: number;
  clearUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  prefs: DEFAULT_PREFS,
  permissionGranted: false,
  requestPermission: async () => false,
  updatePref: () => {},
  unreadCount: 0,
  clearUnread: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const receivedListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("notification_prefs").then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
        } catch {}
      }
    });

    if (Platform.OS !== "web") {
      Notifications.getPermissionsAsync().then(({ granted }) => {
        setPermissionGranted(granted);
      });

      receivedListener.current = Notifications.addNotificationReceivedListener(
        () => {
          setUnreadCount((c) => c + 1);
        },
      );

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as Record<string, string>;
          if (data?.type === "group_activity" || data?.type === "nearby_students") {
            router.push("/(tabs)/matching");
          } else if (data?.type === "event_reminder") {
            router.push("/(tabs)/events");
          }
        });
    }

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  async function requestPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const { granted: existing } = await Notifications.getPermissionsAsync();
    if (existing) {
      setPermissionGranted(true);
      return true;
    }
    const { granted } = await Notifications.requestPermissionsAsync();
    setPermissionGranted(granted);
    return granted;
  }

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem("notification_prefs", JSON.stringify(next));
      return next;
    });
  }

  function clearUnread() {
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider
      value={{ prefs, permissionGranted, requestPermission, updatePref, unreadCount, clearUnread }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
