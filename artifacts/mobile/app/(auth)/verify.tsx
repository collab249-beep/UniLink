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
    if (!trimmed) {
      Alert.alert("Enter email", "Please enter your university email address.");
      return;
    }
    setLoading(true);
    try {
      await verifyUniversity(trimmed);
      router.replace("/(auth)/setup");
    } catch (e: any) {
      Alert.alert("Invalid email", e?.message ?? "Please use a valid university email (.edu, .ac.uk, etc.)");
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
        <Text style={styles.subtitle}>We need a university email to keep{"\n"}UniLink exclusive to students</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: colors.secondary }]}>
          <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            Use your university-issued email address. We accept addresses ending in{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>.edu</Text>,{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>.ac.uk</Text>, and other official university domains.
          </Text>
        </View>

        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>University email</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="you@university.ac.uk"
            placeholderTextColor={colors.mutedForeground}
            value={uniEmail}
            onChangeText={setUniEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Examples: student@uni.edu, student@university.ac.uk
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/")}>
          <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24 },
  content: { padding: 24, gap: 20 },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8, letterSpacing: 0.3 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6, lineHeight: 16 },
  btn: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  skip: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
