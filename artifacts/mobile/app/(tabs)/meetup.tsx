import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { CountdownTimer } from "@/components/CountdownTimer";
import { SafetySheet } from "@/components/SafetySheet";
import { ACTIVITIES } from "@/constants/activities";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

export default function MeetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, blockUser, reportUser } = useAuth();
  const { session, timeRemaining, confirmAttendance, leaveSession } = useSession();
  const [safetyVisible, setSafetyVisible] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (!session) {
    router.replace("/(tabs)/");
    return null;
  }

  const activityConfig = ACTIVITIES.find((a) => a.id === session.activity);
  const otherParticipants = session.participants.filter((p) => p.id !== user?.id);
  const firstOther = otherParticipants[0];

  async function handleConfirm() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await confirmAttendance();
  }

  async function handleLeave() {
    await leaveSession();
    router.replace("/(tabs)/");
  }

  async function handleReport() {
    if (firstOther) await reportUser(firstOther.id);
  }

  async function handleBlock() {
    if (firstOther) await blockUser(firstOther.id);
    await leaveSession();
    router.replace("/(tabs)/");
  }

  const isExpired = timeRemaining === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[activityConfig?.gradientStart ?? "#1A6BFF", activityConfig?.gradientEnd ?? "#0041CC"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.activityBadge}>
            <Ionicons
              name={activityConfig?.iconName as any ?? "star"}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.activityBadgeText}>{activityConfig?.label}</Text>
          </View>
          <TouchableOpacity onPress={() => setSafetyVisible(true)} style={styles.safetyBtn}>
            <Ionicons name="shield" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        <Text style={styles.locationLabel}>Meet at</Text>
        <Text style={styles.locationName}>{session.location}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.timerTitle, { color: colors.mutedForeground }]}>
            {isExpired ? "Session expired" : "Time to meet"}
          </Text>
          {isExpired ? (
            <Text style={[styles.expiredText, { color: colors.destructive }]}>This meetup has ended</Text>
          ) : (
            <CountdownTimer remainingMs={timeRemaining} />
          )}
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Your group · {session.participants.length} people
          </Text>
          <View style={[styles.participantsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {session.participants.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.participantRow,
                  i < session.participants.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <Avatar firstName={p.firstName} uri={p.profilePicture} size={44} />
                <View style={styles.participantInfo}>
                  <Text style={[styles.participantName, { color: colors.foreground }]}>
                    {p.firstName}
                    {p.id === user?.id && (
                      <Text style={[styles.youBadge, { color: colors.primary }]}> · You</Text>
                    )}
                  </Text>
                  <Text style={[styles.participantUni, { color: colors.mutedForeground }]}>
                    {p.university}
                  </Text>
                </View>
                {p.id === user?.id && session.attendanceConfirmed && (
                  <View style={[styles.confirmedBadge, { backgroundColor: colors.success + "20" }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.confirmedText, { color: colors.success }]}>Going</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.locationCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="location" size={22} color={colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationCardTitle, { color: colors.foreground }]}>Meeting point</Text>
            <Text style={[styles.locationCardSub, { color: colors.mutedForeground }]}>{session.location}</Text>
          </View>
        </View>

        {!session.attendanceConfirmed && !isExpired && (
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.success }]}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>Confirm Attendance</Text>
          </TouchableOpacity>
        )}

        {session.attendanceConfirmed && (
          <View style={[styles.confirmedCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={[styles.confirmedCardText, { color: colors.success }]}>
              You confirmed attendance
            </Text>
          </View>
        )}

        {isExpired && (
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/")}
          >
            <Text style={styles.confirmBtnText}>Back to Home</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.messageBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.messageText, { color: colors.mutedForeground }]}>
            No messaging — meet in person and make a real connection
          </Text>
        </View>
      </ScrollView>

      <SafetySheet
        visible={safetyVisible}
        onClose={() => setSafetyVisible(false)}
        onReport={handleReport}
        onBlock={handleBlock}
        onLeave={handleLeave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activityBadgeText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  safetyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
  },
  locationName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  content: { padding: 20, gap: 16 },
  timerCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  timerTitle: { fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.4 },
  expiredText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  participantsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  participantInfo: { flex: 1 },
  participantName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  youBadge: { fontSize: 14, fontFamily: "Inter_500Medium" },
  participantUni: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  confirmedText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  locationInfo: { flex: 1 },
  locationCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  locationCardSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
    borderRadius: 14,
  },
  confirmBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  confirmedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  confirmedCardText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
