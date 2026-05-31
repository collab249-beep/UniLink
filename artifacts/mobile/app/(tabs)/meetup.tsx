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
import { ProfileCard } from "@/components/ProfileCard";
import { SafetySheet } from "@/components/SafetySheet";
import { ACTIVITIES } from "@/constants/activities";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

export default function MeetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, blockUser, reportUser } = useAuth();
  const { session, timeRemaining, confirmAttendance, leaveSession } = useSession();
  const { unreadCount } = useChat();
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

  const SIMULATED_PROFILES: Record<string, { bio: string; interests: string[]; year: string; reliabilityScore: number }> = {
    default: {
      bio: "Just a Nottingham student trying to meet people and make the most of uni life 🎓",
      interests: ["coffee", "study", "gaming", "music", "society"],
      year: "2nd Year",
      reliabilityScore: 92,
    },
  };
  function getSimProfile(participant: typeof session.participants[0]) {
    const seed = participant.firstName.charCodeAt(0) % 4;
    const bios = [
      "CS student who loves football and grabbing coffee between lectures ☕⚽",
      "Business student at NTU — always up for a study session or a night out 🎉",
      "Engineering nerd. Gym in the morning, gaming at night 💪🎮",
      "Final year English Lit student. Big fan of good food and live music 🍜🎵",
    ];
    const allInterests = ["study", "coffee", "football", "gym", "gaming", "night_out", "society", "music", "cooking", "food", "travel", "tech"];
    const pickedInterests = [
      allInterests[seed],
      allInterests[(seed + 2) % allInterests.length],
      allInterests[(seed + 4) % allInterests.length],
      allInterests[(seed + 6) % allInterests.length],
    ];
    const years = ["1st Year", "2nd Year", "3rd Year", "Masters"];
    return {
      bio: bios[seed],
      interests: pickedInterests,
      year: years[seed],
      reliabilityScore: 88 + seed * 3,
    };
  }

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

        <View style={styles.participantsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Your group · {session.participants.length} people
          </Text>
          {session.participants.map((p) => {
            const isSelf = p.id === user?.id;
            const sim = isSelf ? {} : getSimProfile(p);
            return (
              <ProfileCard
                key={p.id}
                isSelf={isSelf}
                participant={{
                  id: p.id,
                  firstName: p.firstName,
                  university: p.university,
                  universityId: (p as any).universityId ?? null,
                  profilePicture: p.profilePicture,
                  bio: isSelf ? user?.bio : (sim as any).bio,
                  interests: isSelf ? user?.interests : (sim as any).interests,
                  year: isSelf ? user?.year : (sim as any).year,
                  reliabilityScore: isSelf ? user?.reliabilityScore : (sim as any).reliabilityScore,
                }}
              />
            );
          })}
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

        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/chat")}
        >
          <View style={[styles.chatIconWrap, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
          </View>
          <View style={styles.chatBtnContent}>
            <Text style={[styles.chatBtnTitle, { color: colors.foreground }]}>
              Message {firstOther?.firstName ?? "your group"}
            </Text>
            <Text style={[styles.chatBtnSub, { color: colors.mutedForeground }]}>
              Coordinate where to meet
            </Text>
          </View>
          <View style={styles.chatBtnRight}>
            {unreadCount > 0 && (
              <View style={[styles.chatUnreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.chatUnreadText}>{unreadCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
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
  participantsSection: { gap: 10 },
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
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  chatIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnContent: { flex: 1 },
  chatBtnTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  chatBtnSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  chatBtnRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  chatUnreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  chatUnreadText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Inter_700Bold" },
});
