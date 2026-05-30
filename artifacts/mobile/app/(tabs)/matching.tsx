import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ACTIVITIES, ActivityType } from "@/constants/activities";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

function RadarRing({ delay, size }: { delay: number; size: number }) {
  const opacity = useSharedValue(0.7);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [delay, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: "#1A6BFF",
        },
        animStyle,
      ]}
    />
  );
}

export default function MatchingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activity } = useLocalSearchParams<{ activity: ActivityType }>();
  const { user } = useAuth();
  const { createSession } = useSession();
  const [phase, setPhase] = useState<"searching" | "found" | "creating">("searching");
  const [peopleCount, setPeopleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const activityConfig = ACTIVITIES.find((a) => a.id === activity);
  const iconScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );

    if (Platform.OS !== "web") {
      Location.requestForegroundPermissionsAsync().catch(() => {});
    }

    const countInterval = setInterval(() => {
      setPeopleCount((p) => Math.min(p + 1, 3));
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countInterval);
      setPhase("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });

      timerRef.current = setTimeout(async () => {
        setPhase("creating");
        await createSession(
          activity ?? "food",
          user?.id ?? "me",
          user?.firstName ?? "You",
          user?.university ?? "Your University",
        );
        router.replace("/(tabs)/meetup");
      }, 1600);
    }, 4200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(countInterval);
    };
  }, [activity, checkScale, createSession, iconScale, user]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  function handleCancel() {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  }

  if (!activityConfig) {
    router.back();
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.content}>
        {phase === "searching" ? (
          <>
            <View style={styles.radarContainer}>
              <RadarRing delay={0} size={280} />
              <RadarRing delay={800} size={280} />
              <RadarRing delay={1600} size={280} />
              <Animated.View style={[styles.iconCenter, { backgroundColor: activityConfig.gradientStart }, iconAnimStyle]}>
                <Ionicons
                  name={activityConfig.iconName as any}
                  size={36}
                  color="#FFFFFF"
                />
              </Animated.View>
            </View>

            <View style={styles.textSection}>
              <Text style={[styles.headline, { color: colors.foreground }]}>
                Finding people nearby
              </Text>
              <Text style={[styles.activityLabel, { color: colors.primary }]}>
                {activityConfig.label}
              </Text>
              <View style={styles.countRow}>
                {peopleCount > 0 && (
                  <>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.countText, { color: colors.mutedForeground }]}>
                      {peopleCount} {peopleCount === 1 ? "person" : "people"} nearby
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            <Animated.View style={[styles.successCircle, { backgroundColor: colors.success }, checkAnimStyle]}>
              <Ionicons name="checkmark" size={52} color="#FFFFFF" />
            </Animated.View>
            <Text style={[styles.headline, { color: colors.foreground }]}>
              {phase === "creating" ? "Setting up meetup..." : "Match found!"}
            </Text>
            <Text style={[styles.subtext, { color: colors.mutedForeground }]}>
              {phase === "creating" ? "Just a moment..." : "A group is ready for you"}
            </Text>
          </>
        )}
      </View>

      {phase === "searching" && (
        <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 32, paddingHorizontal: 24 },
  radarContainer: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A6BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textSection: { alignItems: "center", gap: 6 },
  headline: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.3, textAlign: "center" },
  activityLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  countRow: { flexDirection: "row", alignItems: "center", gap: 6, height: 22 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  countText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  successCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  subtext: { fontSize: 15, fontFamily: "Inter_400Regular" },
  footer: { paddingHorizontal: 24 },
  cancelBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
