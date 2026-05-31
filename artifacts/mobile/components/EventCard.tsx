import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CampusEvent, EVENT_CATEGORY_CONFIG } from "@/constants/events";
import { UNIVERSITIES } from "@/constants/universities";
import { useColors } from "@/hooks/useColors";

interface EventCardProps {
  event: CampusEvent;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const colors = useColors();
  const [attending, setAttending] = useState(false);
  const [count, setCount] = useState(event.attendees);
  const cfg = EVENT_CATEGORY_CONFIG[event.category];
  const uniConfig = event.universityId !== "both"
    ? UNIVERSITIES.find((u) => u.id === event.universityId)
    : null;

  async function toggleAttend() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttending((a) => {
      setCount((c) => a ? c - 1 : c + 1);
      return !a;
    });
  }

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.85}
      >
        <View style={[styles.compactIcon, { backgroundColor: cfg.gradientStart }]}>
          <Ionicons name={cfg.iconName as any} size={16} color="#FFFFFF" />
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={[styles.compactMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {event.timeLabel} · {event.venue}
          </Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactCount, { color: colors.mutedForeground }]}>
            {count}
          </Text>
          <Ionicons name="people" size={12} color={colors.mutedForeground} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: cfg.gradientStart }]}>
          <Ionicons name={cfg.iconName as any} size={13} color="#FFFFFF" />
          <Text style={styles.categoryText}>{cfg.label}</Text>
        </View>
        <View style={styles.metaRight}>
          {event.free ? (
            <View style={[styles.freeBadge, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.freeText, { color: colors.success }]}>Free</Text>
            </View>
          ) : (
            <Text style={[styles.priceText, { color: colors.mutedForeground }]}>{event.price}</Text>
          )}
          {uniConfig && (
            <View style={[styles.uniBadge, { backgroundColor: uniConfig.primaryColor }]}>
              <Text style={styles.uniBadgeText}>{uniConfig.badgeLabel}</Text>
            </View>
          )}
          {event.universityId === "both" && (
            <View style={[styles.uniBadge, { backgroundColor: "#555" }]}>
              <Text style={styles.uniBadgeText}>Both</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>
      <Text style={[styles.organizer, { color: colors.mutedForeground }]}>{event.organizer}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.footerMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.timeLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{count} going</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.attendBtn,
            { backgroundColor: attending ? colors.success : colors.primary },
          ]}
          onPress={toggleAttend}
        >
          <Ionicons
            name={attending ? "checkmark" : "add"}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.attendBtnText}>{attending ? "Going" : "Attend"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  freeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  priceText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  uniBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  uniBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  title: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2, lineHeight: 22 },
  organizer: { fontSize: 12, fontFamily: "Inter_500Medium" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 4,
    gap: 12,
  },
  footerMeta: { flex: 1, gap: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  attendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  attendBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  compactContent: { flex: 1 },
  compactTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  compactMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  compactRight: { flexDirection: "row", alignItems: "center", gap: 3 },
  compactCount: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
