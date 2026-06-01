import { Ionicons } from "@expo/vector-icons";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
  free: boolean;
}

const FEATURES: PremiumFeature[] = [
  { icon: "flash",           title: "Unlimited Matches",     description: "Match with as many students as you like every day",                        free: false },
  { icon: "star",            title: "Profile Boost",         description: "Get 5× more visibility in the matching pool for 30 minutes",               free: false },
  { icon: "filter",          title: "Advanced Filters",      description: "Filter by year, course, campus, and interests for precise matches",         free: false },
  { icon: "calendar",        title: "Exclusive Events",      description: "Access premium-only campus socials and networking events",                  free: false },
  { icon: "shield-checkmark", title: "Verified Badge",       description: "Stand out with a gold verified badge on your profile",                     free: false },
  { icon: "eye-off",         title: "Incognito Mode",        description: "Browse and match without showing up in others' radars",                    free: false },
  { icon: "people",          title: "Basic Matching",        description: "Match with 3 students per day based on activity",                           free: true  },
  { icon: "chatbubble",      title: "In-Session Chat",       description: "Message your matched student during an active meetup",                     free: true  },
  { icon: "notifications",   title: "Push Notifications",    description: "Get notified about matches, events, and meetups",                          free: true  },
  { icon: "calendar-outline", title: "Events Feed",          description: "See society events, sports fixtures, and club nights",                     free: true  },
];

const TIERS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "£4.99",
    period: "/month",
    badge: null,
    description: "Billed monthly, cancel anytime",
  },
  {
    id: "termly",
    label: "Per Term",
    price: "£11.99",
    period: "/term",
    badge: "Most Popular",
    description: "Save 20% — billed per university term",
  },
  {
    id: "yearly",
    label: "Annual",
    price: "£34.99",
    period: "/year",
    badge: "Best Value",
    description: "Save 42% — one payment for the whole year",
  },
];

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const [selectedTier, setSelectedTier] = useState("termly");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const premiumFeatures = FEATURES.filter((f) => !f.free);
  const freeFeatures = FEATURES.filter((f) => f.free);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1A6BFF", "#7B2FFF", "#FF3CAC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.crownWrap}>
              <Text style={styles.crown}>👑</Text>
            </View>
            <Text style={styles.heroTitle}>UniLink Premium</Text>
            <Text style={styles.heroSub}>
              Meet more students. Stand out. Get exclusive access.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.tierSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose your plan</Text>
          <View style={styles.tiers}>
            {TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  onPress={() => setSelectedTier(tier.id)}
                  style={[
                    styles.tierCard,
                    {
                      backgroundColor: isSelected ? "#1A6BFF08" : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  {tier.badge && (
                    <View
                      style={[
                        styles.tierBadge,
                        { backgroundColor: tier.badge === "Best Value" ? "#FF3CAC" : colors.primary },
                      ]}
                    >
                      <Text style={styles.tierBadgeText}>{tier.badge}</Text>
                    </View>
                  )}
                  <View style={styles.tierInner}>
                    <View style={[styles.tierRadio, isSelected && { borderColor: colors.primary }]}>
                      {isSelected && <View style={[styles.tierRadioFill, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={styles.tierLabel}>
                      <Text style={[styles.tierName, { color: colors.foreground }]}>{tier.label}</Text>
                      <Text style={[styles.tierDesc, { color: colors.mutedForeground }]}>{tier.description}</Text>
                    </View>
                    <View style={styles.tierPrice}>
                      <Text style={[styles.tierPriceNum, { color: isSelected ? colors.primary : colors.foreground }]}>
                        {tier.price}
                      </Text>
                      <Text style={[styles.tierPricePeriod, { color: colors.mutedForeground }]}>{tier.period}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.ctaWrap}>
            <LinearGradient
              colors={["#1A6BFF", "#7B2FFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => updateProfile({ isPremium: true }).then(() => router.back())}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={styles.ctaBtnText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </LinearGradient>
            <Text style={[styles.ctaNote, { color: colors.mutedForeground }]}>
              Cancel anytime. No hidden fees. Student pricing.
            </Text>
          </View>
        </View>

        <View style={[styles.featuresSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Premium features</Text>
          {premiumFeatures.map((f, i) => (
            <View
              key={f.icon + i}
              style={[
                styles.featureRow,
                i < premiumFeatures.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: "#1A6BFF14" }]}>
                <Ionicons name={f.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.description}</Text>
              </View>
              <View style={[styles.premiumBadge, { backgroundColor: "#FFD70020" }]}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.featuresSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Always free</Text>
          {freeFeatures.map((f, i) => (
            <View
              key={f.icon + i}
              style={[
                styles.featureRow,
                i < freeFeatures.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: colors.success + "18" }]}>
                <Ionicons name={f.icon as any} size={18} color={colors.success} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          ))}
        </View>

        <Text style={[styles.legalNote, { color: colors.mutedForeground }]}>
          UniLink Premium is billed through your App Store or Google Play account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. University student pricing — for personal use only.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 20 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroContent: { alignItems: "center", gap: 10 },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  crown: { fontSize: 36 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  heroSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  tierSection: { paddingHorizontal: 20, gap: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  tiers: { gap: 10 },
  tierCard: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  tierBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  tierBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  tierInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  tierRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tierRadioFill: { width: 10, height: 10, borderRadius: 5 },
  tierLabel: { flex: 1 },
  tierName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  tierDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  tierPrice: { alignItems: "flex-end" },
  tierPriceNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  tierPricePeriod: { fontSize: 11, fontFamily: "Inter_400Regular" },
  ctaWrap: { gap: 10 },
  ctaGradient: { borderRadius: 16, overflow: "hidden" },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
  },
  ctaBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  ctaNote: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  featuresSection: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  premiumBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumBadgeText: { color: "#B8860B", fontSize: 9, fontFamily: "Inter_700Bold" },
  legalNote: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 15,
    marginHorizontal: 24,
    marginBottom: 8,
  },
});
