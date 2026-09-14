import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { UniversityBadge } from "@/components/UniversityBadge";
import { INTERESTS, profileCompletionScore } from "@/constants/interests";
import { UNIVERSITIES } from "@/constants/universities";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const uniConfig = UNIVERSITIES.find((u) => u.id === user?.universityId);

  const reliabilityColor =
    (user?.reliabilityScore ?? 0) >= 80
      ? colors.success
      : (user?.reliabilityScore ?? 0) >= 50
      ? colors.warning
      : colors.destructive;

  const completionScore = profileCompletionScore(
    user?.bio,
    user?.interests,
    user?.year,
    user?.profilePicture,
    user?.course,
  );
  const completionBarColor =
    completionScore >= 75 ? colors.success : completionScore >= 50 ? "#FF6D00" : colors.primary;

  const shownInterests = (user?.interests ?? [])
    .map((id) => INTERESTS.find((i) => i.id === id))
    .filter(Boolean) as typeof INTERESTS;

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.editHeaderBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/edit-profile")}
        >
          <Ionicons name="pencil" size={14} color={colors.primary} />
          <Text style={[styles.editHeaderBtnText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={
            uniConfig?.id === "ntu"
              ? ["#6A1020", "#3D0810"]
              : uniConfig?.id === "uon"
              ? ["#005EB8", "#003875"]
              : ["#1A6BFF", "#0041CC"]
          }
          style={styles.heroBanner}
        >
          <View style={styles.heroInner}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/edit-profile")}
              style={styles.avatarWrap}
            >
              <Avatar firstName={user?.firstName ?? "U"} uri={user?.profilePicture} size={88} showBorder />
              <View style={[styles.editBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.heroName}>{user?.firstName}</Text>
            {uniConfig && (
              <View style={styles.heroBadgeRow}>
                <UniversityBadge universityId={user?.universityId ?? null} size="sm" />
                <Text style={styles.heroUni}>{uniConfig.name}</Text>
              </View>
            )}
            {user?.course && (
              <Text style={styles.heroYear}>{user.course}</Text>
            )}
            {user?.year && (
              <Text style={styles.heroYear}>{user.year}</Text>
            )}
          </View>
        </LinearGradient>

        {completionScore < 100 && (
          <TouchableOpacity
            style={[styles.completionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/edit-profile")}
          >
            <View style={styles.completionTop}>
              <Text style={[styles.completionTitle, { color: colors.foreground }]}>
                Complete your profile
              </Text>
              <Text style={[styles.completionPct, { color: completionBarColor }]}>
                {completionScore}%
              </Text>
            </View>
            <View style={[styles.completionTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.completionFill,
                  { width: `${completionScore}%` as any, backgroundColor: completionBarColor },
                ]}
              />
            </View>
            <Text style={[styles.completionHint, { color: colors.mutedForeground }]}>
              {!user?.bio && !user?.interests?.length
                ? "Add a bio and interests so others know what you're into"
                : !user?.bio
                ? "Add a bio to let people know who you are"
                : !user?.interests?.length
                ? "Select your interests to find like-minded students"
                : "Almost there — finish your profile"}
            </Text>
            <View style={[styles.completionBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.completionBtnText}>Finish profile</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {user?.bio ? (
          <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardSectionLabel, { color: colors.mutedForeground }]}>BIO</Text>
            <Text style={[styles.bioText, { color: colors.foreground }]}>{user.bio}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.bioCard, styles.bioCardEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/edit-profile")}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.bioEmptyText, { color: colors.mutedForeground }]}>
              Add a bio so people know what you're about
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {shownInterests.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardSectionLabel, { color: colors.mutedForeground }]}>INTERESTS</Text>
            <View style={styles.interestsGrid}>
              {shownInterests.map((interest) => (
                <View
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    { backgroundColor: interest.color + "14", borderColor: interest.color + "30" },
                  ]}
                >
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text style={[styles.interestLabel, { color: interest.color }]}>
                    {interest.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {user?.isAmbassador && (
          <View style={[styles.ambassadorCard, { backgroundColor: "#FFF8E1", borderColor: "#FFB300" + "40" }]}>
            <Ionicons name="star" size={18} color="#FFB300" />
            <View>
              <Text style={[styles.ambassadorTitle, { color: "#7B5800" }]}>Campus Ambassador</Text>
              <Text style={[styles.ambassadorSub, { color: "#9E7700" }]}>
                You're helping grow UniLink at your campus
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.statsRow]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{user?.referralCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Referrals</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: reliabilityColor }]}>{user?.reliabilityScore ?? 100}%</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Reliability</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{shownInterests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Interests</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="school-outline" size={20} color={colors.mutedForeground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>University</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {user?.university || "Not verified yet"}
              </Text>
            </View>
          </View>
          {user?.course && (
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Ionicons name="book-outline" size={20} color={colors.mutedForeground} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Course</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{user.course}</Text>
              </View>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {user?.isPremium && (
          <View style={[styles.premiumCard, { borderColor: "#FFD70040" }]}>
            <LinearGradient
              colors={["#1A6BFF", "#7B2FFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumEmoji}>👑</Text>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>UniLink Premium</Text>
                <Text style={styles.premiumSub}>Active — you have unlimited access</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </LinearGradient>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.infoRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <Ionicons name="settings-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.infoRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/(tabs)/history")}
          >
            <Ionicons name="time-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Meetup History</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.infoRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/(tabs)/referral")}
          >
            <Ionicons name="gift-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Invite Friends</Text>
            <View style={[styles.refBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.refBadgeText, { color: colors.primary }]}>
                {user?.referralCode ?? "—"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.infoRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/terms")}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoRow} onPress={() => router.push("/privacy")}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "25" }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  editHeaderBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { gap: 14 },
  heroBanner: { paddingVertical: 28, paddingHorizontal: 20 },
  heroInner: { alignItems: "center", gap: 6 },
  avatarWrap: { position: "relative", marginBottom: 6 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  heroUni: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  heroYear: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  completionCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  completionTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  completionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  completionPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  completionTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  completionFill: { height: 6, borderRadius: 3 },
  completionHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  completionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  completionBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  bioCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  bioCardEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  bioText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  bioEmptyText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  section: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  interestsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestEmoji: { fontSize: 13 },
  interestLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  ambassadorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  ambassadorTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ambassadorSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 3,
  },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  premiumCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  premiumEmoji: { fontSize: 22 },
  premiumText: { flex: 1 },
  premiumTitle: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  premiumSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  refBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  refBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
