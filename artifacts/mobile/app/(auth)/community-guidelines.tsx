import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const SECTIONS = [
  ["Respect everyone", "Harassment, hate speech, threats, bullying, and discrimination are not allowed."],
  ["Keep meetups safe", "Be honest about who you are, respect boundaries, and never pressure another student."],
  ["Protect privacy", "Do not share another person’s messages, location, or personal information without permission."],
  ["Use UniLink genuinely", "No spam, scams, impersonation, sexual exploitation, or misleading profiles."],
  ["Report concerns", "Use Report User for harmful behaviour and Block User when you do not want further contact."],
];

export default function CommunityGuidelinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { readOnly } = useLocalSearchParams<{ readOnly?: string }>();
  const { user, acceptCommunityGuidelines } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly === "true";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  async function accept() {
    setLoading(true);
    try {
      await acceptCommunityGuidelines();
      router.replace(user?.isVerified ? "/(tabs)" : "/(auth)/verify");
    } catch {
      Alert.alert("Couldn’t save", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Community Guidelines</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          UniLink is built for safe, respectful connections between students. These rules apply to profiles, chats, events, and in-person meetups.
        </Text>
        {SECTIONS.map(([title, body], index) => (
          <View key={title} style={[styles.rule, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.number, { backgroundColor: colors.primary }]}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.ruleCopy}>
              <Text style={[styles.ruleTitle, { color: colors.foreground }]}>{title}</Text>
              <Text style={[styles.ruleBody, { color: colors.mutedForeground }]}>{body}</Text>
            </View>
          </View>
        ))}
        {!isReadOnly && user && !user.communityGuidelinesAcceptedAt && (
          <TouchableOpacity disabled={loading} onPress={accept} style={[styles.accept, { backgroundColor: colors.primary }]}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.acceptText}>Accept and Continue</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 12, paddingBottom: 48 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 4 },
  rule: { flexDirection: "row", gap: 12, padding: 15, borderWidth: 1, borderRadius: 16 },
  number: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numberText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 13 },
  ruleCopy: { flex: 1, gap: 4 },
  ruleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  ruleBody: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  accept: { minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  acceptText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});