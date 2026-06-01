import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { INTERESTS, STUDY_YEARS, profileCompletionScore } from "@/constants/interests";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const BIO_LIMIT = 150;

function InterestChip({
  interest,
  selected,
  onPress,
}: {
  interest: (typeof INTERESTS)[0];
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  async function handlePress() {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.chip,
          selected
            ? { backgroundColor: interest.color + "18", borderColor: interest.color }
            : { backgroundColor: colors.secondary, borderColor: colors.border },
        ]}
      >
        <Text style={styles.chipEmoji}>{interest.emoji}</Text>
        <Text
          style={[
            styles.chipLabel,
            { color: selected ? interest.color : colors.mutedForeground },
          ]}
        >
          {interest.label}
        </Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={13} color={interest.color} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function CompletionBar({ score }: { score: number }) {
  const colors = useColors();
  const barColor =
    score >= 75 ? colors.success : score >= 50 ? "#FF6D00" : colors.primary;
  return (
    <View style={[styles.completionWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <View style={styles.completionHeader}>
        <Text style={[styles.completionTitle, { color: colors.foreground }]}>
          Profile completion
        </Text>
        <Text style={[styles.completionPct, { color: barColor }]}>{score}%</Text>
      </View>
      <View style={[styles.completionTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.completionFill, { width: `${score}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.completionHint, { color: colors.mutedForeground }]}>
        {score < 100
          ? `Complete your profile to stand out to other students`
          : `Great job — your profile is fully complete!`}
      </Text>
    </View>
  );
}

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile, updateProfilePicture } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [course, setCourse] = useState(user?.course ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests ?? [],
  );
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    user?.year,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const completion = profileCompletionScore(
    bio,
    selectedInterests,
    selectedYear,
    user?.profilePicture,
    course,
  );

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow photo access to update your profile picture.");
      return;
    }
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

  async function handleSave() {
    if (!firstName.trim()) {
      Alert.alert("Name required", "Please enter your first name.");
      return;
    }
    setSaving(true);
    await updateProfile({
      firstName: firstName.trim(),
      bio: bio.trim(),
      course: course.trim(),
      interests: selectedInterests,
      year: selectedYear,
      profileComplete: completion >= 75,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CompletionBar score={completion} />

        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap}>
            <Avatar
              firstName={user?.firstName ?? "U"}
              uri={user?.profilePicture}
              size={96}
              showBorder
            />
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              {uploading
                ? <Ionicons name="refresh" size={13} color="#FFFFFF" />
                : <Ionicons name="camera" size={13} color="#FFFFFF" />
              }
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoLabel, { color: colors.primary }]}>
            Tap to change photo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={colors.mutedForeground}
            maxLength={30}
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Course / Degree</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={course}
            onChangeText={setCourse}
            placeholder="e.g. Computer Science BSc, Law LLB"
            placeholderTextColor={colors.mutedForeground}
            maxLength={60}
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bio</Text>
            <Text style={[styles.charCount, { color: bio.length > BIO_LIMIT - 20 ? colors.warning : colors.mutedForeground }]}>
              {bio.length}/{BIO_LIMIT}
            </Text>
          </View>
          <TextInput
            style={[
              styles.bioInput,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, BIO_LIMIT))}
            placeholder={`e.g. "CS student at UoN. Into coding, football and coffee ☕"`}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Year of Study</Text>
          <View style={styles.yearRow}>
            {STUDY_YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                onPress={() => setSelectedYear(year === selectedYear ? undefined : year)}
                style={[
                  styles.yearChip,
                  selectedYear === year
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.yearChipText,
                    { color: selectedYear === year ? "#FFFFFF" : colors.mutedForeground },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Interests</Text>
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {selectedInterests.length} selected
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            Pick at least 3 so people know what you're into
          </Text>
          <View style={styles.chipsGrid}>
            {INTERESTS.map((interest) => (
              <InterestChip
                key={interest.id}
                interest={interest}
                selected={selectedInterests.includes(interest.id)}
                onPress={() => toggleInterest(interest.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 24 },
  completionWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  completionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  completionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  completionPct: { fontSize: 16, fontFamily: "Inter_700Bold" },
  completionTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  completionFill: { height: 6, borderRadius: 3 },
  completionHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  avatarSection: { alignItems: "center", gap: 8 },
  avatarWrap: { position: "relative" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  changePhotoLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { gap: 10 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.1 },
  sectionHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -4 },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  bioInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 90,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  yearRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  yearChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
