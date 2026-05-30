import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityTile } from "@/components/ActivityTile";
import { Avatar } from "@/components/Avatar";
import { ACTIVITIES, ActivityType } from "@/constants/activities";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { session } = useSession();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  function handleActivity(activityId: ActivityType) {
    router.push({ pathname: "/(tabs)/matching", params: { activity: activityId } });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.firstName ?? "Student"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Avatar
            firstName={user?.firstName ?? "U"}
            uri={user?.profilePicture}
            size={44}
            showBorder
          />
        </TouchableOpacity>
      </View>

      {session && (
        <TouchableOpacity
          style={[styles.activeBanner, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/meetup")}
        >
          <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
          <Text style={styles.activeBannerText}>Active meetup in progress</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promptSection}>
          <Text style={[styles.prompt, { color: colors.foreground }]}>
            What do you want to do
          </Text>
          <Text style={[styles.promptAccent, { color: colors.primary }]}>
            right now?
          </Text>
          <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
            Find students nearby in under 60 seconds
          </Text>
        </View>

        <View style={styles.grid}>
          {ACTIVITIES.map((activity) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              onPress={() => handleActivity(activity.id)}
              disabled={!!session}
            />
          ))}
        </View>

        <View style={[styles.trustRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          <Text style={[styles.trustText, { color: colors.mutedForeground }]}>
            University-verified students only
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { gap: 1 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeBannerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  content: { paddingHorizontal: 20, paddingTop: 4, gap: 20 },
  promptSection: { gap: 2 },
  prompt: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, lineHeight: 34 },
  promptAccent: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, lineHeight: 34 },
  promptSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  trustText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
