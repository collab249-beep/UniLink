import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { verifyUniversity } = useAuth();
  const [uniEmail, setUniEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  async function handleVerify() {
    const trimmed = uniEmail.trim().toLowerCase();
    if (!trimmed) { Alert.alert("Enter email", "Please enter your university email."); return; }
    setLoading(true);
    try {
      await verifyUniversity(trimmed);
      router.replace("/(auth)/setup");
    } catch (e: any) {
      Alert.alert("Invalid email", e?.message ?? "Please use a valid university email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient
        colors={["#1A6BFF", "#0041CC"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Verify your university</Text>
        <Text style={styles.subtitle}>UniLink is exclusively for Nottingham students</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.uniCards}>
          <View style={[styles.uniCard, { backgroundColor: "#EEF4FD", borderColor: "#005EB8" + "40" }]}>
            <View style={[styles.uniBadge, { backgroundColor: "#005EB8" }]}>
              <Text style={styles.uniBadgeText}>UoN</Text>
            </View>
            <View>
              <Text style={[styles.uniCardName, { color: "#005EB8" }]}>University of Nottingham</Text>
              <Text style={[styles.uniCardDomain, { color: colors.mutedForeground }]}>@nottingham.ac.uk</Text>
            </View>
          </View>
          <View style={[styles.uniCard, { backgroundColor: "#F9EEF0", borderColor: "#6A1020" + "40" }]}>
            <View style={[styles.uniBadge, { backgroundColor: "#6A1020" }]}>
              <Text style={styles.uniBadgeText}>NTU</Text>
            </View>
            <View>
              <Text style={[styles.uniCardName, { color: "#6A1020" }]}>Nottingham Trent University</Text>
              <Text style={[styles.uniCardDomain, { color: colors.mutedForeground }]}>@ntu.ac.uk</Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.secondary }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            Enter your UoN or NTU email. Only verified Nottingham students can use UniLink.
          </Text>
        </View>

        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>University email</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="you@nottingham.ac.uk  or  you@ntu.ac.uk"
            placeholderTextColor={colors.mutedForeground}
            value={uniEmail}
            onChangeText={setUniEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Verify & Join</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/")}>
          <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 32, gap: 6 },
  title: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontFamily: "Inter_400Regular" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24 },
  content: { padding: 24, gap: 16 },
  uniCards: { gap: 10 },
  uniCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  uniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  uniBadgeText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  uniCardName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  uniCardDomain: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  btn: { paddingVertical: 17, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  skip: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
