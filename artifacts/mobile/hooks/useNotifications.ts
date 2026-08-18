import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationChannel =
  | "group_activity"
  | "event_reminder"
  | "free_expiry"
  | "nearby_students";

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  type P = { granted?: boolean };
  const existing = ((await Notifications.getPermissionsAsync()) as unknown as P).granted;
  if (existing) return true;
  const granted = !!((await Notifications.requestPermissionsAsync()) as unknown as P).granted;
  return granted;
}

export async function scheduleGroupActivityAlert(
  activityLabel: string,
  location: string,
  count: number,
  delaySeconds = 3,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${count} students joining ${activityLabel}`,
      body: `A group is forming at ${location}. Tap to match up!`,
      data: { type: "group_activity" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds },
  });
}

export async function scheduleEventReminder(
  eventTitle: string,
  venue: string,
  minutesBefore = 30,
  eventHour: number,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const now = new Date();
  const eventTime = new Date();
  eventTime.setHours(eventHour, 0, 0, 0);
  const reminderTime = new Date(eventTime.getTime() - minutesBefore * 60 * 1000);

  if (reminderTime <= now) {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${eventTitle} starts soon`,
        body: `Happening now at ${venue}`,
        data: { type: "event_reminder" },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    });
  }

  const secondsUntil = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${eventTitle} in ${minutesBefore} minutes`,
      body: `Head to ${venue} now to make it on time!`,
      data: { type: "event_reminder" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(secondsUntil, 5) },
  });
}

export async function scheduleFreeExpiryAlert(msUntilExpiry: number): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  const warnAt = Math.max(0, msUntilExpiry - 5 * 60 * 1000);
  if (warnAt < 10000) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "You're almost done being free",
      body: "Your 'I'm Free Right Now' status expires in 5 minutes.",
      data: { type: "free_expiry" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.floor(warnAt / 1000) },
  });
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
