import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

function RewardTier({
  count,
  target,
  label,
  reward,
  achieved,
  colors,
}: {
  count: number;
  target: number;
  label: string;
  reward: string;
  achieved: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const progress = Math.min(count / target, 1);
  return (
    <View style={[styles.tierCard, { backgroundColor: achieved ? colors.success + "10" : colors.card, borderColor: achieved ? colors.success + "40" : colors.border }]}>
      <View style={styles.tierLeft}>
        <View style={[styles.tierIcon, { backgroundColor: achieved ? colors.success + "20" : colors.muted }]}>
          <Ionicons
            name={achieved ? "checkmark-circle" : "gift-outline"}
            size={20}
            color={achieved ? colors.success : colors.mutedForeground}
          />
        </View>
        <View>
          <Text style={[styles.tierLabel, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.tierReward, { color: achieved ? colors.success : colors.mutedForeground }]}>
            {reward}
          </Text>
        </View>
      </View>
      <View style={styles.tierRight}>
        <Text style={[styles.tierCount, { color: achieved ? colors.success : colors.mutedForeground }]}>
          {Math.min(count, target)}/{target}
        </Text>
        <View style={[styles.tierBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.tierFill,
              { width: `${progress * 100}%` as any, backgroundColor: achieved ? colors.success : colors.primary },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const referralCode = user?.referralCode ?? "LINK0000";
  const referralCount = user?.referralCount ?? 0;

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join UniLink — the student meetup app for Nottingham! Use my code ${referralCode} when you sign up. Download: unilink.app`,
        title: "Join UniLink",
      });
    } catch {
    }
  }

  async function handleCopyCode() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Code copied!", `Your referral code ${referralCode} is ready to share.`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Invite Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1A6BFF", "#0041CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroIconWrap}>
            <Ionicons name="gift" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Help grow UniLink{"\n"}in Nottingham</Text>
          <Text style={styles.heroSub}>
            Invite friends and earn rewards.{"\n"}The more students, the better the meetups.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{referralCount}</Text>
              <Text style={styles.heroStatLabel}>referred</Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{referralCount >= 5 ? "Campus Hero" : referralCount >= 3 ? "Ambassador" : "Starter"}</Text>
              <Text style={styles.heroStatLabel}>your rank</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>Your referral code</Text>
          <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{referralCode}</Text>
            <View style={[styles.copyBadge, { backgroundColor: copied ? colors.success + "20" : colors.secondary }]}>
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={16}
                color={copied ? colors.success : colors.primary}
              />
              <Text style={[styles.copyText, { color: copied ? colors.success : colors.primary }]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Share with friends</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rewards</Text>
        <View style={styles.tiers}>
          <RewardTier
            count={referralCount}
            target={1}
            label="First Invite"
            reward="Unlock priority matching"
            achieved={referralCount >= 1}
            colors={colors}
          />
          <RewardTier
            count={referralCount}
            target={3}
            label="Squad Builder"
            reward="Campus Ambassador badge"
            achieved={referralCount >= 3}
            colors={colors}
          />
          <RewardTier
            count={referralCount}
            target={5}
            label="Campus Hero"
            reward="Featured on campus leaderboard"
            achieved={referralCount >= 5}
            colors={colors}
          />
          <RewardTier
            count={referralCount}
            target={10}
            label="Ambassador"
            reward="UniLink campus rep program"
            achieved={referralCount >= 10}
            colors={colors}
          />
        </View>

        <View style={[styles.ambassadorCard, { backgroundColor: "#FFF8E1", borderColor: "#FFB30040" }]}>
          <View style={styles.ambassadorHeader}>
            <Ionicons name="star" size={20} color="#FFB300" />
            <Text style={[styles.ambassadorTitle, { color: "#7B5800" }]}>Campus Ambassador Program</Text>
          </View>
          <Text style={[styles.ambassadorBody, { color: "#9E7700" }]}>
            Refer 10+ students to become an official UniLink Campus Ambassador. Get exclusive perks,
            early access to new features, and help build the #1 student meetup app in Nottingham.
          </Text>
          <TouchableOpacity style={[styles.ambassadorBtn, { backgroundColor: "#FFB300" }]}>
            <Text style={styles.ambassadorBtnText}>Learn more</Text>
          </TouchableOpacity>
        </View>
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
  content: { padding: 20, gap: 16 },
  heroBanner: {
    borderRadius: 20,
    padding: 22,
    gap: 8,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3, lineHeight: 30 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    gap: 16,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatNum: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  heroStatLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular" },
  heroDivider: { width: 1, height: 32 },
  codeCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  codeLabel: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.4 },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  codeText: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 4 },
  copyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  copyText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
    borderRadius: 14,
  },
  shareBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2, marginTop: 4 },
  tiers: { gap: 10 },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  tierLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  tierIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tierLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tierReward: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  tierRight: { alignItems: "flex-end", gap: 4 },
  tierCount: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tierBar: { width: 60, height: 4, borderRadius: 2, overflow: "hidden" },
  tierFill: { height: 4, borderRadius: 2 },
  ambassadorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  ambassadorHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  ambassadorTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ambassadorBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  ambassadorBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ambassadorBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold" },
});
