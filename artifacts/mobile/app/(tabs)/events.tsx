import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EventCard } from "@/components/EventCard";
import {
  EventFilter,
  FILTERS,
  TODAY_EVENTS,
  filterEvents,
} from "@/constants/events";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveActivity } from "@/contexts/LiveActivityContext";
import { useColors } from "@/hooks/useColors";

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.93, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    onPress();
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.filterPill,
          active
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            { color: active ? "#FFFFFF" : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { stats } = useLiveActivity();
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const sorted = useMemo(
    () => [...TODAY_EVENTS].sort((a, b) => a.hour - b.hour),
    [],
  );
  const filtered = useMemo(
    () => filterEvents(sorted, activeFilter),
    [sorted, activeFilter],
  );

  const tonightCount = sorted.filter((e) => e.hour >= 18).length;
  const totalAttending = sorted.reduce((s, e) => s + e.attendees, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A6BFF", "#0041CC"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Campus Events</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{sorted.length}</Text>
            <Text style={styles.headerStatLabel}>events today</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{tonightCount}</Text>
            <Text style={styles.headerStatLabel}>tonight</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{totalAttending.toLocaleString()}</Text>
            <Text style={styles.headerStatLabel}>going</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{stats.totalActive}</Text>
            <Text style={styles.headerStatLabel}>active now</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <FilterPill
              key={f.id}
              label={f.label}
              active={activeFilter === f.id}
              onPress={() => setActiveFilter(f.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No events found
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Try a different filter or check back later.
            </Text>
          </View>
        ) : (
          <>
            {activeFilter === "all" && (
              <View style={styles.timeSection}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  HAPPENING NOW
                </Text>
                {filtered
                  .filter((e) => {
                    const h = new Date().getHours();
                    return e.hour <= h && e.hour >= h - 2;
                  })
                  .map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
              </View>
            )}

            <View style={styles.timeSection}>
              {activeFilter === "all" && (
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  COMING UP
                </Text>
              )}
              {(activeFilter === "all"
                ? filtered.filter((e) => {
                    const h = new Date().getHours();
                    return !(e.hour <= h && e.hour >= h - 2);
                  })
                : filtered
              ).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </View>
          </>
        )}

        <View
          style={[
            styles.submitCard,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <View style={styles.submitContent}>
            <Text style={[styles.submitTitle, { color: colors.foreground }]}>
              Running an event?
            </Text>
            <Text style={[styles.submitBody, { color: colors.mutedForeground }]}>
              Submit your society or sports event and reach students across both campuses.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  headerDate: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  headerStat: { flex: 1, alignItems: "center" },
  headerStatNum: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  headerStatLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: { width: 1, marginVertical: 4 },
  filterRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  timeSection: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 2,
    marginTop: 4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  submitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  submitContent: { flex: 1 },
  submitTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  submitBody: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    lineHeight: 17,
  },
});
