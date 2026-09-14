import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface SafetySheetProps {
  visible: boolean;
  onClose: () => void;
  onReport: (category: string, reason: string) => Promise<void>;
  onBlock: () => void;
  onLeave: () => void;
}

export function SafetySheet({ visible, onClose, onReport, onBlock, onLeave }: SafetySheetProps) {
  const colors = useColors();
  const [showReportForm, setShowReportForm] = useState(false);
  const [category, setCategory] = useState("harassment");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleEmergency() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Emergency Help",
      "In a real emergency, call 999 (UK) or 911 (US) immediately. Your campus security number: 0800 123 456",
      [{ text: "Call Campus Security", style: "destructive" }, { text: "OK" }],
    );
  }

  async function handleReport() {
    if (!reason.trim()) {
      Alert.alert("Add details", "Please explain what happened.");
      return;
    }
    setSubmitting(true);
    try {
      await onReport(category, reason.trim());
      setReason("");
      setShowReportForm(false);
      onClose();
      Alert.alert("Report submitted", "UniLink moderation will review your report.");
    } catch {
      Alert.alert("Report failed", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBlock() {
    Alert.alert("Block User", "This user will be removed from your matches.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => { onBlock(); onClose(); },
      },
    ]);
  }

  function handleLeave() {
    Alert.alert("Leave Meetup", "Are you sure you want to leave this meetup?", [
      { text: "Stay", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => { onLeave(); onClose(); },
      },
    ]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.foreground }]}>Safety</Text>

          {showReportForm ? (
            <View style={styles.reportForm}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>What happened?</Text>
              <View style={styles.categoryRow}>
                {[
                  ["harassment", "Harassment"],
                  ["hate", "Hate"],
                  ["sexual", "Sexual"],
                  ["spam", "Spam"],
                  ["safety", "Safety"],
                  ["other", "Other"],
                ].map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setCategory(value)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: category === value ? colors.primary : colors.muted,
                      },
                    ]}
                  >
                    <Text style={{ color: category === value ? "#FFFFFF" : colors.foreground, fontSize: 12 }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={reason}
                onChangeText={setReason}
                multiline
                maxLength={1000}
                placeholder="Describe the behaviour and any safety concerns"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.reportInput,
                  { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
                ]}
              />
              <TouchableOpacity
                disabled={submitting}
                onPress={handleReport}
                style={[styles.submitReport, { backgroundColor: colors.destructive }]}
              >
                <Text style={styles.submitReportText}>
                  {submitting ? "Submitting…" : "Submit Report"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReportForm(false)} style={styles.formCancel}>
                <Text style={{ color: colors.mutedForeground }}>Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => setShowReportForm(true)}
          >
            <View style={[styles.iconWrap, { backgroundColor: "#FF9F0A18" }]}>
              <Ionicons name="flag" size={22} color="#FF9F0A" />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Report User</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={handleBlock}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.destructive + "18" }]}>
              <Ionicons name="ban" size={22} color={colors.destructive} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Block User</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={handleLeave}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
              <Ionicons name="log-out-outline" size={22} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Leave Meetup</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: colors.destructive }]}
            onPress={handleEmergency}
          >
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyText}>Emergency Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
    gap: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  reportForm: { gap: 12 },
  formLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  reportInput: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  submitReport: { minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitReportText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 },
  formCancel: { alignItems: "center", paddingVertical: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  emergencyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
