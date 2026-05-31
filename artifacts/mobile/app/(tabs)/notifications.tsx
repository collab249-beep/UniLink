import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotifications } from "@/contexts/NotificationContext";
import { useColors } from "@/hooks/useColors";
import {
  scheduleGroupActivityAlert,
} from "@/hooks/useNotifications";

const NOTIFICATION_TYPES = [
  {
    key: "groupActivity" as const,
    icon: "people",
    title: "Group Activity Alerts",
    description: "Get notified when students are forming groups for activities you like",
    color: "#1A6BFF",
  },
  {
    key: "eventReminders" as const,
    icon: "calendar",
    title: "Event Reminders",
    description: "Reminders 30 minutes before campus events you've saved",
    color: "#00C853",
  },
  {
    key: "freeExpiry" as const,
    icon: "timer-outline",
    title: "Free Status Alerts",
    description: "5-minute warning before your 'I'm Free' status expires",
    color: "#FF6D00",
  },
  {
    key: "nearbyStudents" as const,
    icon: "location",
    title: "Nearby Students",
    description: "Alert when a large group of students is active near your campus",
    color: "#7B1FA2",
  },
] as const;

const EXAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    icon: "people",
    color: "#1A6BFF",
    title: "Study group forming",
    body: "4 students are looking for Study Together at Hallward Library",
    time: "2 mins ago",
    unread: true,
  },
  {
    id: "2",
    icon: "calendar",
    color: "#00C853",
    title: "UoN x NTU 5-a-Side Football",
    body: "Starting in 30 minutes at University Park Pitches",
    time: "28 mins ago",
    unread: true,
  },
  {
    id: "3",
    icon: "cafe",
    color: "#795548",
    title: "Coffee chat group forming",
    body: "3 students want a coffee at Café Noir on campus",
    time: "1 hr ago",
    unread: false,
  },
  {
    id: "4",
    icon: "timer-outline",
    color: "#FF6D00",
    title: "Free status expiring",
    body: "Your 'I'm Free Right Now' status expires in 5 minutes",
    time: "Yesterday",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, permissionGranted, requestPermission, updatePref, clearUnread } =
    useNotifications();
  const [notifications] = useState(EXAMPLE_NOTIFICATIONS);
  const [requesting, setRequesting] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  async function handleToggle(key: keyof typeof prefs, value: boolean) {
    if (value && !permissionGranted) {
      setRequesting(true);
      const granted = await requestPermission();
      setRequesting(false);
      if (!granted) {
        Alert.alert(
          "Notifications blocked",
          "Go to your device Settings → UniLink → Notifications and enable them to receive alerts.",
          [{ text: "OK" }],
        );
        return;
      }
    }
    updatePref(key, value);
  }

  async function handleTestNotification() {
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await scheduleGroupActivityAlert("Coffee Chat", "Jubilee Campus SU", 3, 3);
    Alert.alert("Test sent!", "You'll receive a sample notification in 3 seconds.", [{ text: "OK" }]);
  }

  React.useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A6BFF", "#0041CC"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {!permissionGranted && (
          <TouchableOpacity
            style={[styles.permissionBanner, { backgroundColor: "#FFF3E0", borderColor: "#FFB300" }]}
            onPress={requestPermission}
          >
            <Ionicons name="notifications-off-outline" size={20} color="#FF6D00" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.permissionTitle, { color: "#E65100" }]}>
                Enable notifications
              </Text>
              <Text style={[styles.permissionBody, { color: "#BF360C" }]}>
                Tap to allow UniLink to send you group alerts and event reminders.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FF6D00" />
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          PREFERENCES
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {NOTIFICATION_TYPES.map((type, i) => (
            <View key={type.key}>
              <View style={styles.prefRow}>
                <View style={[styles.prefIcon, { backgroundColor: type.color + "18" }]}>
                  <Ionicons name={type.icon as keyof typeof Ionicons.glyphMap} size={18} color={type.color} />
                </View>
                <View style={styles.prefContent}>
                  <Text style={[styles.prefTitle, { color: colors.foreground }]}>{type.title}</Text>
                  <Text style={[styles.prefDesc, { color: colors.mutedForeground }]}>{type.description}</Text>
                </View>
                <Switch
                  value={prefs[type.key]}
                  onValueChange={(v) => handleToggle(type.key, v)}
                  trackColor={{ false: colors.border, true: type.color }}
                  thumbColor="#FFFFFF"
                  disabled={requesting}
                />
              </View>
              {i < NOTIFICATION_TYPES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {permissionGranted && (
          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={handleTestNotification}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <Text style={[styles.testBtnText, { color: colors.primary }]}>
              Send test notification
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
          RECENT
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {notifications.map((n, i) => (
            <View key={n.id}>
              <View style={styles.notifRow}>
                <View style={[styles.notifIcon, { backgroundColor: n.color + "18" }]}>
                  <Ionicons name={n.icon as keyof typeof Ionicons.glyphMap} size={16} color={n.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>{n.title}</Text>
                    {n.unread && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>{n.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                </View>
              </View>
              {i < notifications.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  content: { padding: 20, gap: 12 },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  permissionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  permissionBody: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  prefContent: { flex: 1 },
  prefTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  prefDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  testBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1, gap: 2 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  notifBody: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
});
