import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfilePicture } = useAuth();
  const [uploading, setUploading] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      await updateProfilePicture(result.assets[0].uri);
      setUploading(false);
    }
  }

  function handleContinue() {
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1A6BFF", "#0041CC"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Add a photo</Text>
        <Text style={styles.subtitle}>Help people recognise you when you meet</Text>
      </LinearGradient>

      <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPad + 24 }]}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap}>
            <Avatar
              firstName={user?.firstName ?? "U"}
              uri={user?.profilePicture}
              size={110}
            />
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.firstName}</Text>
          <Text style={[styles.uni, { color: colors.mutedForeground }]}>
            {user?.university || "University verified"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.photoBtn, { borderColor: colors.primary, borderWidth: 1.5 }]}
          onPress={pickPhoto}
        >
          <Ionicons name="images-outline" size={20} color={colors.primary} />
          <Text style={[styles.photoBtnText, { color: colors.primary }]}>Choose from gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>
            {user?.profilePicture ? "All set! Let's go" : "Skip for now"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 6,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontFamily: "Inter_400Regular" },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 28,
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  uni: { fontSize: 14, fontFamily: "Inter_400Regular" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  photoBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
    borderRadius: 14,
  },
  continueBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
