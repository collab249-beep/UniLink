import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const AVATAR_COLORS = [
  "#1A6BFF", "#E91E63", "#00C853", "#FF6B35",
  "#9C27B0", "#00BCD4", "#FF9800", "#607D8B",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? "#1A6BFF";
}

interface AvatarProps {
  firstName: string;
  uri?: string;
  size?: number;
  showBorder?: boolean;
  isOnline?: boolean;
}

export function Avatar({ firstName, uri, size = 48, showBorder = false, isOnline }: AvatarProps) {
  const colors = useColors();
  const bg = getColor(firstName);
  const initials = firstName.slice(0, 1).toUpperCase();
  const dotSize = Math.max(10, Math.round(size * 0.26));

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderWidth: showBorder ? 3 : 0,
            borderColor: showBorder ? colors.background : "transparent",
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            contentFit="cover"
          />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
        )}
      </View>
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: showBorder ? 0 : -1,
              right: showBorder ? 0 : -1,
              borderWidth: Math.max(1.5, dotSize * 0.18),
              borderColor: colors.background,
              backgroundColor: "#00C853",
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    lineHeight: undefined,
  },
  onlineDot: {
    position: "absolute",
  },
});
