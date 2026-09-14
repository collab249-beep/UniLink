import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  async function handleRegister() {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (!acceptedGuidelines) {
      Alert.alert(
        "Community Guidelines required",
        "Please read and accept the Community Guidelines to create an account.",
      );
      return;
    }
    setLoading(true);
    try {
      await signUp(firstName.trim(), email.trim(), password, acceptedGuidelines);
      router.replace("/(auth)/verify");
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join your university community</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>First name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Alex"
              placeholderTextColor={colors.mutedForeground}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={[styles.guidelinesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedGuidelines }}
            onPress={() => setAcceptedGuidelines((value) => !value)}
            style={[
              styles.checkbox,
              {
                backgroundColor: acceptedGuidelines ? colors.primary : colors.background,
                borderColor: acceptedGuidelines ? colors.primary : colors.border,
              },
            ]}
          >
            {acceptedGuidelines && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
          <Text style={[styles.guidelinesText, { color: colors.mutedForeground }]}>
            I agree to follow the{" "}
            <Text
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
              onPress={() =>
                router.push(
                  "/(auth)/community-guidelines?readOnly=true" as Href,
                )
              }
            >
              Community Guidelines
            </Text>
            .
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By continuing, you agree to UniLink's Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 4,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: "rgba(255,255,255,0.85)", fontSize: 15, fontFamily: "Inter_500Medium" },
  title: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontFamily: "Inter_400Regular" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24 },
  content: { padding: 24, gap: 20 },
  form: { gap: 16 },
  guidelinesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  guidelinesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  terms: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
