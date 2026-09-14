import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

function isAppleCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String(error.code) === "ERR_REQUEST_CANCELED"
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  async function confirmDeletion() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      router.replace("/(auth)/login");
    } catch (error) {
      if (!isAppleCancellation(error)) {
        Alert.alert(
          "Account not deleted",
          error instanceof Error
            ? error.message
            : "We couldn’t delete your account. Please try again.",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Permanently delete account?",
      "This deletes your Firebase account, UniLink profile, messages, meetups, preferences, and associated data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDeletion,
        },
      ],
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          ACCOUNT
        </Text>
        <View
          style={[
            styles.dangerCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.dangerIcon,
              { backgroundColor: colors.destructive + "14" },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={colors.destructive}
            />
          </View>
          <View style={styles.dangerCopy}>
            <Text style={[styles.dangerTitle, { color: colors.foreground }]}>
              Delete Account
            </Text>
            <Text
              style={[
                styles.dangerDescription,
                { color: colors.mutedForeground },
              ]}
            >
              Permanently remove your account and all associated data.
            </Text>
          </View>
          <TouchableOpacity
            testID="delete-account-button"
            accessibilityRole="button"
            accessibilityLabel="Delete account permanently"
            disabled={isDeleting}
            onPress={handleDeleteAccount}
            style={[
              styles.deleteButton,
              {
                backgroundColor: colors.destructive + "12",
                borderColor: colors.destructive + "30",
              },
            ]}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.destructive} />
            ) : (
              <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>
                Delete
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.notice,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
            You’ll be asked to sign in with Apple again before deletion. This
            protects your account from unauthorized removal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  dangerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  dangerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerCopy: { gap: 4 },
  dangerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  dangerDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
});