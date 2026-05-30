import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface CountdownTimerProps {
  remainingMs: number;
  urgent?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ remainingMs, urgent: urgentProp }: CountdownTimerProps) {
  const colors = useColors();
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = urgentProp ?? remainingMs < 5 * 60 * 1000;

  const scale = useSharedValue(1);
  const prevSeconds = useRef(seconds);

  useEffect(() => {
    if (prevSeconds.current !== seconds && seconds % 10 === 0 && isUrgent) {
      scale.value = withSequence(
        withTiming(1.08, { duration: 120 }),
        withTiming(1, { duration: 120 }),
      );
    }
    prevSeconds.current = seconds;
  }, [seconds, isUrgent, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const timerColor = isUrgent ? colors.destructive : colors.foreground;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View style={[styles.badge, { backgroundColor: isUrgent ? colors.destructive + "18" : colors.muted }]}>
        <Text style={[styles.time, { color: timerColor }]}>
          {pad(minutes)}:{pad(seconds)}
        </Text>
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {isUrgent ? "Hurry up!" : "to meet up"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
  },
  time: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
  },
});
