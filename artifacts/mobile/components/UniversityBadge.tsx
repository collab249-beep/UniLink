import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { UniversityId, UNIVERSITIES } from "@/constants/universities";

interface UniversityBadgeProps {
  universityId: UniversityId | null;
  size?: "sm" | "md";
}

export function UniversityBadge({ universityId, size = "md" }: UniversityBadgeProps) {
  if (!universityId || universityId === "other") return null;
  const uni = UNIVERSITIES.find((u) => u.id === universityId);
  if (!uni) return null;

  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: uni.primaryColor,
          paddingHorizontal: isSmall ? 6 : 9,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: isSmall ? 4 : 6,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {uni.badgeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  label: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
  },
});
