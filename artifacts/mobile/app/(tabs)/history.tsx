import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { ACTIVITIES } from "@/constants/activities";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return `Today, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  if (isYesterday) return `Yesterday, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(startTime: number, endTime: number): string {
  const mins = Math.round((endTime - startTime) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { history } = useSession();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Meetup History</Text>
        <View style={{ width: 40 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.secondary }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No meetups yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Your completed meetups will appear here. Go tap "I'm Free Right Now" to get started!
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="flash" size={16} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Find a Meetup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.summaryRow]}>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: colors.primary }]}>{history.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Meetups</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: colors.success }]}>
                {history.filter((h) => h.attendanceConfirmed).length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Confirmed</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: colors.foreground }]}>
                {[...new Set(history.flatMap((h) => h.participants.map((p) => p.id)))].length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>People Met</Text>
            </View>
          </View>

          {history.map((item) => {
            const activity = ACTIVITIES.find((a) => a.id === item.activity);
            const others = item.participants.slice(0, 3);
            const extraCount = Math.max(0, item.participants.length - 3);
            return (
              <View
                key={item.id}
                style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: (activity?.gradientStart ?? "#1A6BFF") + "18" },
                    ]}
                  >
                    <Text style={styles.activityEmoji}>{activity?.emoji ?? "🎯"}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={[styles.activityLabel, { color: colors.foreground }]}>
                      {activity?.label ?? item.activity}
                    </Text>
                    <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>
                      {formatDate(item.startTime)}
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    {item.attendanceConfirmed ? (
                      <View style={[styles.statusBadge, { backgroundColor: colors.success + "18" }]}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                        <Text style={[styles.statusText, { color: colors.success }]}>Went</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
                        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Left early</Text>
                      </View>
                    )}
                    <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>
                      {formatDuration(item.startTime, item.endTime)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.cardBottomRow}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                  <View style={styles.avatarStack}>
                    {others.map((p, i) => (
                      <View key={p.id} style={[styles.avatarStackItem, { marginLeft: i === 0 ? 0 : -10 }]}>
                        <Avatar firstName={p.firstName} uri={p.profilePicture} size={28} showBorder />
                      </View>
                    ))}
                    {extraCount > 0 && (
                      <View
                        style={[
                          styles.extraBadge,
                          { backgroundColor: colors.secondary, borderColor: colors.background },
                        ]}
                      >
                        <Text style={[styles.extraText, { color: colors.mutedForeground }]}>+{extraCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 12 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 3,
  },
  summaryNum: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityEmoji: { fontSize: 22 },
  cardMeta: { flex: 1 },
  activityLabel: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.1 },
  dateLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  durationLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { height: StyleSheet.hairlineWidth },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  locationText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  avatarStackItem: {},
  extraBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
    borderWidth: 2,
  },
  extraText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
