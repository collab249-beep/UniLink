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

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy Policy</Text>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FadeIn delay={0}>
            <Text style={[styles.title, { color: colors.foreground }]}>How we protect your data.</Text>
            <Text style={[styles.lastUpdated, { color: colors.mutedForeground }]}>Last updated: 14 September 2026</Text>
            
            <Text style={[styles.intro, { color: colors.foreground }]}>
              UniLink is built on trust and safety. We only collect the information necessary to provide a secure environment for university students to connect. We do not sell your personal data to third parties.
            </Text>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>1. Information We Collect</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                We collect your university email address to verify your student status. When you set up your profile, we store your name, profile photo, and any biographical information you provide. If you choose Use My Location, iOS gives UniLink access to your location while you use the app to support nearby discovery.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>2. How We Use Your Information</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                Your data is used strictly to operate UniLink. This includes displaying your profile to other verified students nearby, delivering your messages, and ensuring compliance with our Community Guidelines through moderation.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>3. Location Services</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                Location access is optional and is requested only after you choose Use My Location when starting a nearby search. You can continue with campus-only matching without granting access. You can change UniLink’s location permission at any time in iOS Settings.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>4. Data Retention and Deletion</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                We retain your information while your account is active. If you delete your account, your account profile and associated service data are removed. Reports, moderation decisions, and limited safety evidence may be retained when necessary to protect users, prevent abuse, meet legal obligations, or resolve disputes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.foreground }]}>5. Contact Us</Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                If you have questions regarding this Privacy Policy or how your data is handled, please contact us at hello@unilink.network.
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
