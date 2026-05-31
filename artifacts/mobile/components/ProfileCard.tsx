import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { UniversityBadge } from "@/components/UniversityBadge";
import { INTERESTS } from "@/constants/interests";
import { UNIVERSITIES } from "@/constants/universities";
import { useColors } from "@/hooks/useColors";

export interface ParticipantProfile {
  id: string;
  firstName: string;
  university: string;
  universityId?: string | null;
  profilePicture?: string;
  bio?: string;
  interests?: string[];
  year?: string;
  reliabilityScore?: number;
}

interface ProfileCardProps {
  participant: ParticipantProfile;
  isSelf?: boolean;
}

export function ProfileCard({ participant, isSelf = false }: ProfileCardProps) {
  const colors = useColors();
  const uniConfig = UNIVERSITIES.find((u) => u.id === participant.universityId);
  const reliabilityScore = participant.reliabilityScore ?? 100;
  const reliabilityColor =
    reliabilityScore >= 80
      ? colors.success
      : reliabilityScore >= 50
      ? colors.warning
      : colors.destructive;

  const shownInterests = (participant.interests ?? [])
    .slice(0, 5)
    .map((id) => INTERESTS.find((i) => i.id === id))
    .filter(Boolean) as typeof INTERESTS;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        isSelf && { opacity: 0.72 },
      ]}
    >
      <View style={styles.topRow}>
        <Avatar
          firstName={participant.firstName}
          uri={participant.profilePicture}
          size={52}
          showBorder
        />
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {participant.firstName}
              {isSelf && (
                <Text style={[styles.youLabel, { color: colors.primary }]}> · You</Text>
              )}
            </Text>
          </View>
          <View style={styles.metaRow}>
            {uniConfig && (
              <View
                style={[
                  styles.uniBadge,
                  { backgroundColor: uniConfig.id === "uon" ? "#EEF4FD" : "#F9EEF0" },
                ]}
              >
                <View
                  style={[styles.uniDot, { backgroundColor: uniConfig.primaryColor }]}
                />
                <Text style={[styles.uniLabel, { color: uniConfig.primaryColor }]}>
                  {uniConfig.badgeLabel}
                </Text>
              </View>
            )}
            {participant.year && (
              <Text style={[styles.yearLabel, { color: colors.mutedForeground }]}>
                {participant.year}
              </Text>
            )}
          </View>
          <View style={styles.reliabilityRow}>
            <Ionicons name="star" size={11} color={reliabilityColor} />
            <Text style={[styles.reliabilityText, { color: reliabilityColor }]}>
              {reliabilityScore}% reliability
            </Text>
          </View>
        </View>
        <UniversityBadge universityId={participant.universityId ?? null} size="sm" />
      </View>

      {participant.bio ? (
        <Text style={[styles.bio, { color: colors.mutedForeground }]} numberOfLines={2}>
          {participant.bio}
        </Text>
      ) : (
        !isSelf && (
          <Text style={[styles.bio, { color: colors.mutedForeground, fontStyle: "italic" }]}>
            No bio yet
          </Text>
        )
      )}

      {shownInterests.length > 0 && (
        <View style={styles.interestsRow}>
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
          {(participant.interests?.length ?? 0) > 5 && (
            <View
              style={[
                styles.interestChip,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.interestLabel, { color: colors.mutedForeground }]}>
                +{(participant.interests?.length ?? 0) - 5}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  nameCol: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  youLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  uniBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  uniDot: { width: 6, height: 6, borderRadius: 3 },
  uniLabel: { fontSize: 11, fontFamily: "Inter_700Bold" },
  yearLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reliabilityRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  reliabilityText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bio: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  interestsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestEmoji: { fontSize: 12 },
  interestLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
