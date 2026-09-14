import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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

import { UniversityBadge } from "@/components/UniversityBadge";
import { ACTIVITIES, ActivityType } from "@/constants/activities";
import { CAMPUSES } from "@/constants/universities";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

function RadarRing({ delay, size, color }: { delay: number; size: number; color: string }) {
  const opacity = useSharedValue(0.7);
  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false));
    opacity.value = withDelay(delay, withRepeat(withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false));
  }, [delay, opacity, scale]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }, animStyle]}
    />
  );
}

export default function MatchingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activity, campus } = useLocalSearchParams<{ activity: ActivityType; campus: string }>();
  const { user } = useAuth();
  const { createSession } = useSession();
  const [phase, setPhase] = useState<"searching" | "found" | "creating">("searching");
  const [peopleCount, setPeopleCount] = useState(0);
  const [locationDecisionMade, setLocationDecisionMade] = useState(
    Platform.OS === "web",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const activityConfig = ACTIVITIES.find((a) => a.id === activity);
  const campusConfig = CAMPUSES.find((c) => c.id === campus);
  const iconScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
    if (!locationDecisionMade) return;
    const countInterval = setInterval(() => {
      setPeopleCount((p) => Math.min(p + 1, 4));
    }, 900);
    timerRef.current = setTimeout(() => {
      clearInterval(countInterval);
      setPhase("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      timerRef.current = setTimeout(async () => {
        setPhase("creating");
        await createSession(
          activity ?? "study",
          campus ?? "uon-university-park",
          user?.id ?? "me",
          user?.firstName ?? "You",
          user?.university ?? "University of Nottingham",
        );
        router.replace("/(tabs)/meetup");
      }, 1600);
    }, 4200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(countInterval);
    };
  }, [
    activity,
    campus,
    checkScale,
    createSession,
    iconScale,
    locationDecisionMade,
    user,
  ]);

  const iconAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const checkAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }], opacity: checkScale.value }));

  function handleCancel() {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  }

  async function handleEnableLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      try {
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch {
        Alert.alert(
          "Location unavailable",
          "We couldn’t determine your location. You can still search using your selected campus.",
        );
      }
    }
    setLocationDecisionMade(true);
  }

  if (!activityConfig) { router.back(); return null; }

  const radarColor = activityConfig.gradientStart;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.content}>
        {!locationDecisionMade ? (
          <View style={styles.permissionSection}>
            <View style={[styles.permissionIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="location" size={34} color={colors.primary} />
            </View>
            <Text style={[styles.headline, { color: colors.foreground }]}>
              Find students near you
            </Text>
            <Text style={[styles.permissionCopy, { color: colors.mutedForeground }]}>
              Allow location access to help UniLink discover nearby students and meetups. Your selected campus is used if you continue without it.
            </Text>
          </View>
        ) : phase === "searching" ? (
          <>
            {campusConfig && (
              <View style={[styles.campusTag, { backgroundColor: colors.secondary }]}>
                <Ionicons name="location" size={12} color={colors.primary} />
                <Text style={[styles.campusTagText, { color: colors.primary }]}>{campusConfig.name}</Text>
                {user?.universityId && (
                  <UniversityBadge universityId={user.universityId} size="sm" />
                )}
              </View>
            )}
            <View style={styles.radarContainer}>
              <RadarRing delay={0} size={280} color={radarColor} />
              <RadarRing delay={800} size={280} color={radarColor} />
              <RadarRing delay={1600} size={280} color={radarColor} />
              <Animated.View
                style={[
                  styles.iconCenter,
                  { backgroundColor: activityConfig.gradientStart },
                  iconAnimStyle,
                ]}
              >
                <Ionicons name={activityConfig.iconName as any} size={36} color="#FFFFFF" />
              </Animated.View>
            </View>
            <View style={styles.textSection}>
              <Text style={[styles.headline, { color: colors.foreground }]}>Finding students nearby</Text>
              <Text style={[styles.activityLabel, { color: colors.primary }]}>{activityConfig.label}</Text>
              <View style={styles.countRow}>
                {peopleCount > 0 && (
                  <>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.countText, { color: colors.mutedForeground }]}>
                      {peopleCount} {peopleCount === 1 ? "student" : "students"} nearby
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
              {phase === "creating" ? "Setting up meetup..." : "Group found!"}
            </Text>
            <Text style={[styles.subtext, { color: colors.mutedForeground }]}>
              {phase === "creating" ? "Choosing a meetup spot..." : "Students matched at your campus"}
            </Text>
          </>
        )}
      </View>

      {!locationDecisionMade ? (
        <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
          <TouchableOpacity
            style={[styles.locationBtn, { backgroundColor: colors.primary }]}
            onPress={handleEnableLocation}
          >
            <Text style={styles.locationBtnText}>Use My Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.campusOnlyBtn}
            onPress={() => setLocationDecisionMade(true)}
          >
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              Continue with campus only
            </Text>
          </TouchableOpacity>
        </View>
      ) : phase === "searching" && (
        <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={handleCancel}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, paddingHorizontal: 24 },
  campusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 8,
  },
  campusTagText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  radarContainer: { width: 280, height: 280, alignItems: "center", justifyContent: "center" },
  iconCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  textSection: { alignItems: "center", gap: 6 },
  permissionSection: { alignItems: "center", gap: 14, maxWidth: 340 },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  permissionCopy: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
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
  footer: { paddingHorizontal: 24, gap: 8 },
  locationBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  locationBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  campusOnlyBtn: { paddingVertical: 12, alignItems: "center" },
  cancelBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  cancelText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
