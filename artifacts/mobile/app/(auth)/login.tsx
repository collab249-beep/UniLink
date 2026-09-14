import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithApple, signInWithGoogle, signIn } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch {
      Alert.alert("Error", "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setLoading(true);
    try {
      await signInWithApple();
      router.replace("/");
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      if (code !== "ERR_REQUEST_CANCELED") {
        const message =
          error instanceof Error ? error.message : "Sign in failed. Please try again.";
        Alert.alert("Apple Sign-In Error", message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch {
      Alert.alert("Error", "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1A6BFF", "#0041CC"]}
        style={[styles.hero, { paddingTop: topPad + 48 }]}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="link" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>UniLink</Text>
        <Text style={styles.tagline}>Meet university students{"\n"}in real life, right now.</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Get started</Text>
        <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
          Join thousands of students making real connections
        </Text>

        <TouchableOpacity
          style={[styles.authBtn, styles.googleBtn, { borderColor: colors.border }]}
          onPress={handleGoogle}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={[styles.authBtnText, { color: colors.foreground }]}>Continue with Google</Text>
        </TouchableOpacity>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            testID="sign-in-with-apple"
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={styles.appleBtn}
            onPress={handleApple}
          />
        )}

        <View style={styles.divider}>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.divText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
        </View>

        {showEmailForm ? (
          <View style={styles.formWrap}>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="University email"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.authBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.authBtn, { borderColor: colors.border, borderWidth: 1.5, backgroundColor: colors.card }]}
            onPress={() => setShowEmailForm(true)}
          >
            <Ionicons name="mail-outline" size={20} color={colors.foreground} />
            <Text style={[styles.authBtnText, { color: colors.foreground }]}>Continue with Email</Text>
          </TouchableOpacity>
        )}

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>New to UniLink?</Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.signupLink, { color: colors.primary }]}> Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 8,
  },
  logoWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appleBtn: {
    width: "100%",
    height: 56,
    marginTop: 12,
  },
  appName: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
  },
  sheetContent: {
    padding: 28,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 4,
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  googleBtn: {
    borderWidth: 1.5,
  },
  authBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  primaryBtn: {
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divLine: {
    flex: 1,
    height: 1,
  },
  divText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  formWrap: {
    gap: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  signupText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  signupLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
