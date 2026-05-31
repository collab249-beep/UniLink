import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { UNIVERSITIES } from "@/constants/universities";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut, updateProfilePicture } = useAuth();
  const [uploading, setUploading] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const uniConfig = UNIVERSITIES.find((u) => u.id === user?.universityId);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      await updateProfilePicture(result.assets[0].uri);
      setUploading(false);
    }
  }

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

  const reliabilityColor =
    (user?.reliabilityScore ?? 0) >= 80
      ? colors.success
      : (user?.reliabilityScore ?? 0) >= 50
      ? colors.warning
      : colors.destructive;

  const universityBgColor = uniConfig
    ? uniConfig.id === "uon" ? "#EEF4FD" : "#F9EEF0"
    : colors.secondary;
  const universityTextColor = uniConfig?.primaryColor ?? colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap}>
            <Avatar firstName={user?.firstName ?? "U"} uri={user?.profilePicture} size={100} />
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              {uploading
                ? <Ionicons name="refresh" size={14} color="#FFFFFF" />
                : <Ionicons name="camera" size={14} color="#FFFFFF" />
              }
            </View>
          </TouchableOpacity>

          <Text style={[styles.displayName, { color: colors.foreground }]}>{user?.firstName}</Text>

          {uniConfig ? (
            <View style={[styles.uniBadgeRow, { backgroundColor: universityBgColor }]}>
              <View style={[styles.uniDot, { backgroundColor: uniConfig.primaryColor }]} />
              <Text style={[styles.uniName, { color: universityTextColor }]}>{uniConfig.name}</Text>
              <UniversityBadge universityId={user?.universityId ?? null} size="sm" />
            </View>
          ) : (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.secondary }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified Student</Text>
            </View>
          )}
        </View>

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
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={20} color={reliabilityColor} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Reliability score</Text>
              <Text style={[styles.infoValue, { color: reliabilityColor }]}>
                {user?.reliabilityScore ?? 100}%
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.referralRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/referral")}
        >
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>Invite Friends</Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Code: <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>{user?.referralCode ?? "—"}</Text>
              {"  ·  "}{user?.referralCount ?? 0} referred
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoRow}>
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
  content: { padding: 20, gap: 14 },
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  displayName: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  uniBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uniDot: { width: 8, height: 8, borderRadius: 4 },
  uniName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ambassadorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  ambassadorTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ambassadorSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
