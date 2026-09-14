import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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

import { useColors } from "@/hooks/useColors";

function FadeIn({ children, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  return <View style={style}>{children}</View>;
}

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <>
      <Stack.Screen options={{ title: "Terms of Service" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Terms of Service</Text>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FadeIn delay={0}>
            <Text style={[styles.title, { color: colors.foreground }]}>Our mutual agreement.</Text>
            <Text style={[styles.lastUpdated, { color: colors.mutedForeground }]}>Last updated: 14 September 2026</Text>
            
            <Text style={[styles.intro, { color: colors.foreground }]}>
              Welcome to UniLink. By using our application, you agree to these Terms of Service. Our goal is to provide a safe, authentic network for university students, and these rules help us maintain that standard.
            </Text>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>1. Eligibility</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                You must be a currently enrolled university student to use UniLink. We require a valid university email address for registration. If your enrollment status changes, you may no longer be eligible to use the service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>2. Acceptable Use</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                You agree to use UniLink solely for personal, non-commercial purposes. You must not use the platform to harass, bully, impersonate, or intimidate others. Any violation of our Community Guidelines may result in immediate suspension or termination of your account.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>3. User Content</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                You are responsible for any text, photos, or other content you upload to UniLink. You grant us a license to display this content within the app as part of providing the service, but you retain ownership of your data. We reserve the right to remove content that violates our standards.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>4. Limitation of Liability</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                UniLink provides a platform for students to connect, but we are not responsible for the conduct of any user, online or offline. You agree to take reasonable precautions in all interactions with other users, particularly when meeting in person.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>5. Account Termination</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                We reserve the right to suspend or terminate your account at our discretion, without notice, if we determine that you have violated these Terms or pose a risk to the safety of our community.
              </Text>
            </View>
          </FadeIn>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 24,
    paddingBottom: 64,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 32,
  },
  intro: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    marginBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
});
