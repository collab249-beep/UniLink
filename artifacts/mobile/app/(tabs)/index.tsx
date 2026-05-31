import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityTile } from "@/components/ActivityTile";
import { Avatar } from "@/components/Avatar";
import { EventCard } from "@/components/EventCard";
import { UniversityBadge } from "@/components/UniversityBadge";
import { ACTIVITIES, ActivityType } from "@/constants/activities";
import { TODAY_EVENTS } from "@/constants/events";
import { CAMPUSES } from "@/constants/universities";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveActivity } from "@/contexts/LiveActivityContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

function FreeButton({ isFree, freeTimeRemaining, onPress }: { isFree: boolean; freeTimeRemaining: number; onPress: () => void }) {
  const colors = useColors();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (!isFree) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        false,
      );
    } else {
      pulse.value = 1;
    }
  }, [isFree, pulse]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const mins = Math.floor(freeTimeRemaining / 60000);
  const secs = Math.floor((freeTimeRemaining % 60000) / 1000);

  return (
    <Animated.View style={[styles.freeButtonWrap, animStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <LinearGradient
          colors={isFree ? [colors.success, "#00A84A"] : ["#1A6BFF", "#0041CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.freeButton}
        >
          <View style={styles.freeButtonLeft}>
            <View style={[styles.freeDot, { backgroundColor: isFree ? "#ADFFCE" : "rgba(255,255,255,0.6)" }]} />
            <View>
              <Text style={styles.freeButtonTitle}>
                {isFree ? "You're free right now" : "I'm Free Right Now"}
              </Text>
              <Text style={styles.freeButtonSub}>
                {isFree
                  ? `Active for ${mins}m ${String(secs).padStart(2, "0")}s more`
                  : "Let nearby students know you're available"}
              </Text>
            </View>
          </View>
          <View style={[styles.freeButtonBadge, { backgroundColor: isFree ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.2)" }]}>
            <Ionicons name={isFree ? "checkmark" : "flash"} size={18} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatPill({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[styles.statNum, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function CampusPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (campusId: string) => void;
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Which campus are you on?</Text>
          <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
            We'll show you students and meetup spots nearby
          </Text>
          {CAMPUSES.map((campus) => (
            <TouchableOpacity
              key={campus.id}
              style={[styles.campusRow, { borderColor: colors.border }]}
              onPress={() => { onSelect(campus.id); onClose(); }}
            >
              <View style={[
                styles.campusDot,
                { backgroundColor: campus.universityId === "uon" ? "#005EB8" : "#6A1020" },
              ]} />
              <View style={styles.campusInfo}>
                <Text style={[styles.campusName, { color: colors.foreground }]}>{campus.name}</Text>
                <Text style={[styles.campusUni, { color: colors.mutedForeground }]}>
                  {campus.universityId === "uon" ? "University of Nottingham" : "Nottingham Trent University"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { session } = useSession();
  const { isFree, freeTimeRemaining, stats, selectedCampus, setFree, setNotFree } = useLiveActivity();
  const [campusModalVisible, setCampusModalVisible] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  async function handleFreeButton() {
    if (isFree) {
      await setNotFree();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setCampusModalVisible(true);
    }
  }

  async function handleCampusSelect(campusId: string) {
    await setFree(campusId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleActivity(activityId: ActivityType) {
    if (!selectedCampus && !isFree) {
      setCampusModalVisible(true);
      return;
    }
    router.push({ pathname: "/(tabs)/matching", params: { activity: activityId, campus: selectedCampus ?? "" } });
  }

  const selectedCampusName = CAMPUSES.find((c) => c.id === selectedCampus)?.shortName;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()},
            </Text>
            {selectedCampusName && (
              <TouchableOpacity
                style={[styles.campusBadge, { backgroundColor: user?.universityId === "ntu" ? "#F9EEF0" : colors.secondary }]}
                onPress={() => setCampusModalVisible(true)}
              >
                <Ionicons name="location" size={10} color={user?.universityId === "ntu" ? "#6A1020" : colors.primary} />
                <Text style={[styles.campusBadgeText, { color: user?.universityId === "ntu" ? "#6A1020" : colors.primary }]}>
                  {selectedCampusName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.firstName ?? "Student"}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Avatar firstName={user?.firstName ?? "U"} uri={user?.profilePicture} size={44} showBorder />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {session && (
          <TouchableOpacity
            style={[styles.activeBanner, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/meetup")}
          >
            <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
            <Text style={styles.activeBannerText}>Active meetup in progress</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <FreeButton isFree={isFree} freeTimeRemaining={freeTimeRemaining} onPress={handleFreeButton} />

        <View style={styles.statsGrid}>
          <StatPill icon="people" value={stats.totalActive} label="active now" color="#1A6BFF" />
          <StatPill icon="book" value={stats.byActivity.study ?? 0} label="studying" color="#00C853" />
          <StatPill icon="cafe" value={stats.byActivity.coffee ?? 0} label="coffee" color="#795548" />
          <StatPill icon="moon" value={stats.byActivity.night_out ?? 0} label="going out" color="#1A237E" />
        </View>

        <View style={styles.uniRow}>
          <View style={[styles.uniPill, { backgroundColor: "#EEF4FD" }]}>
            <View style={[styles.uniDot, { backgroundColor: "#005EB8" }]} />
            <Text style={[styles.uniPillText, { color: "#005EB8" }]}>{stats.uonActive} UoN</Text>
          </View>
          <View style={[styles.uniPill, { backgroundColor: "#F9EEF0" }]}>
            <View style={[styles.uniDot, { backgroundColor: "#6A1020" }]} />
            <Text style={[styles.uniPillText, { color: "#6A1020" }]}>{stats.ntuActive} NTU</Text>
          </View>
          <Text style={[styles.uniNote, { color: colors.mutedForeground }]}>students active in Nottingham</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What do you want to do?</Text>
          {!selectedCampus && (
            <TouchableOpacity onPress={() => setCampusModalVisible(true)}>
              <Text style={[styles.setCampusLink, { color: colors.primary }]}>Set campus</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.grid}>
          {ACTIVITIES.map((activity) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              onPress={() => handleActivity(activity.id)}
              disabled={!!session}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Events</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
            <Text style={[styles.setCampusLink, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsPreview}>
          {[...TODAY_EVENTS]
            .sort((a, b) => a.hour - b.hour)
            .slice(0, 4)
            .map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          <TouchableOpacity
            style={[styles.seeAllEventsBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/events")}
          >
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.seeAllEventsBtnText, { color: colors.primary }]}>
              View all {TODAY_EVENTS.length} events today
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.referralCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/referral")}
        >
          <View style={styles.referralLeft}>
            <Ionicons name="gift" size={22} color={colors.primary} />
            <View>
              <Text style={[styles.referralTitle, { color: colors.foreground }]}>Invite your friends</Text>
              <Text style={[styles.referralSub, { color: colors.mutedForeground }]}>
                Earn rewards · Become a campus ambassador
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      <CampusPickerModal
        visible={campusModalVisible}
        onClose={() => setCampusModalVisible(false)}
        onSelect={handleCampusSelect}
      />
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { gap: 2 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  campusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  campusBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  content: { paddingHorizontal: 20, paddingTop: 4, gap: 16 },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeBannerText: { flex: 1, color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  freeButtonWrap: { borderRadius: 18, overflow: "hidden" },
  freeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  freeButtonLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  freeDot: { width: 10, height: 10, borderRadius: 5 },
  freeButtonTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  freeButtonSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  freeButtonBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
  },
  statNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  uniRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  uniPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  uniDot: { width: 7, height: 7, borderRadius: 4 },
  uniPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  uniNote: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  setCampusLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  eventsPreview: { gap: 8 },
  seeAllEventsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  seeAllEventsBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  referralCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  referralLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  referralTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  referralSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 4 },
  campusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  campusDot: { width: 12, height: 12, borderRadius: 6 },
  campusInfo: { flex: 1 },
  campusName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  campusUni: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});
