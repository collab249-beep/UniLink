import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const FAQS = [
  {
    q: "How do I delete my account?",
    a: "Open Profile, tap Settings, then choose Delete Account. You will be asked to confirm your identity before deletion. This action is permanent and cannot be undone.",
  },
  {
    q: "How do I report or block a user?",
    a: "During a meetup, open the Safety menu and choose Report User or Block User. Reports require a category and details so the UniLink moderation team can review what happened. Blocking prevents further matching and chat between both users.",
  },
  {
    q: "Why can't I find nearby students?",
    a: "Nearby results depend on students being active at your selected campus. You can choose Use My Location when starting a search to improve nearby discovery, or continue with campus-only matching. Check that location access is enabled in iOS Settings if you previously denied it.",
  },
  {
    q: "How do I contact support?",
    a: "If you need further assistance, please email us at hello@unilink.network. We are here to help.",
  },
];

export default function SupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <>
      <Stack.Screen options={{ title: "UniLink Support" }} />
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
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.branding}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: colors.foreground }]}>UniLink Support</Text>
          </View>

          <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail" size={24} color={colors.primary} style={styles.contactIcon} />
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => Linking.openURL("mailto:hello@unilink.network")}
            >
              <Text style={[styles.contactEmail, { color: colors.primary }]}>
                hello@unilink.network
              </Text>
            </TouchableOpacity>
            <Text style={[styles.contactResponse, { color: colors.mutedForeground }]}>We usually reply within 24–48 hours.</Text>
          </View>

          <View style={styles.faqSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              {FAQS.map((faq, i) => (
                <View key={i} style={[styles.faqItem, i !== FAQS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.q}</Text>
                  <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.a}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => router.push("/privacy")}
              style={[styles.footerLink, { borderColor: colors.primary }]}
            >
              <Text style={[styles.footerLinkText, { color: colors.primary }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => router.push("/terms")}
              style={[styles.footerLink, { borderColor: colors.primary }]}
            >
              <Text style={[styles.footerLinkText, { color: colors.primary }]}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
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
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  branding: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  contactCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 48,
  },
  contactIcon: {
    marginBottom: 12,
  },
  contactEmail: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  contactResponse: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  faqSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  faqList: {
    gap: 0,
  },
  faqItem: {
    paddingVertical: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
    gap: 12,
  },
  footerLink: {
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  footerLinkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
