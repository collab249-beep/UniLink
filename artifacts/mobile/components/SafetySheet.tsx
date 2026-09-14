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
  Linking,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface SafetySheetProps {
  visible: boolean;
  onClose: () => void;
  participants: Array<{ id: string; firstName: string }>;
  onReport: (userId: string, category: string, reason: string) => Promise<void>;
  onBlock: (userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
}

export function SafetySheet({ visible, onClose, participants, onReport, onBlock, onLeave }: SafetySheetProps) {
  const colors = useColors();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [category, setCategory] = useState("harassment");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<"block" | "leave" | null>(null);
  const [targetUserId, setTargetUserId] = useState(participants[0]?.id ?? "");
  const selectedParticipant =
    participants.find((participant) => participant.id === targetUserId) ??
    participants[0];

  function handleEmergency() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Emergency Help",
      "If you or someone else is in immediate danger, call emergency services now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call 999",
          style: "destructive",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL("tel:999");
              if (!supported) throw new Error("Phone calls are unavailable");
              await Linking.openURL("tel:999");
            } catch {
              Alert.alert(
                "Unable to start call",
                "Please dial 999 directly from your phone.",
              );
            }
          },
        },
      ],
    );
  }

  async function handleReport() {
    if (!selectedParticipant) {
      Alert.alert("No user selected", "Choose a group member to report.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Add details", "Please explain what happened.");
      return;
    }
    setSubmitting(true);
    try {
      await onReport(selectedParticipant.id, category, reason.trim());
      setReason("");
      setShowReportForm(false);
      setReportSubmitted(true);
    } catch {
      Alert.alert("Report failed", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBlock() {
    if (!selectedParticipant) {
      Alert.alert("No user selected", "Choose a group member to block.");
      return;
    }
    setConfirmation("block");
  }

  function handleLeave() {
    setConfirmation("leave");
  }

  async function handleConfirmedAction() {
    if (!confirmation || submitting) return;
    setSubmitting(true);
    try {
      if (confirmation === "block") {
        if (!selectedParticipant) return;
        await onBlock(selectedParticipant.id);
      } else {
        await onLeave();
      }
      setConfirmation(null);
      onClose();
    } catch {
      Alert.alert(
        confirmation === "block" ? "Block failed" : "Couldn’t leave meetup",
        confirmation === "block"
          ? "The user was not blocked. Please try again."
          : "Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.foreground }]}>Safety</Text>

          {reportSubmitted ? (
            <View style={styles.reportForm}>
              <View
                style={[styles.confirmIcon, { backgroundColor: colors.success + "18" }]}
              >
                <Ionicons name="checkmark" size={30} color={colors.success} />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
                Report submitted
              </Text>
              <Text style={[styles.confirmBody, { color: colors.mutedForeground }]}>
                UniLink moderation will review your report. Thank you for helping keep the community safe.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setReportSubmitted(false);
                  onClose();
                }}
                style={[styles.submitReport, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.submitReportText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : confirmation ? (
            <View style={styles.reportForm}>
              <View
                style={[
                  styles.confirmIcon,
                  { backgroundColor: colors.destructive + "18" },
                ]}
              >
                <Ionicons
                  name={confirmation === "block" ? "ban" : "log-out-outline"}
                  size={28}
                  color={colors.destructive}
                />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
                {confirmation === "block" ? "Block User?" : "Leave Meetup?"}
              </Text>
              <Text style={[styles.confirmBody, { color: colors.mutedForeground }]}>
                {confirmation === "block"
                  ? `${selectedParticipant?.firstName ?? "This user"} will be removed from your matches and won’t be able to message you.`
                  : "You will leave this group. The meetup will continue for the other participants."}
              </Text>
              <TouchableOpacity
                disabled={submitting}
                onPress={handleConfirmedAction}
                style={[styles.submitReport, { backgroundColor: colors.destructive }]}
              >
                <Text style={styles.submitReportText}>
                  {submitting
                    ? "Please wait…"
                    : confirmation === "block"
                      ? "Block User"
                      : "Leave Meetup"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={submitting}
                onPress={() => setConfirmation(null)}
                style={styles.formCancel}
              >
                <Text style={{ color: colors.mutedForeground }}>
                  {confirmation === "leave" ? "Stay" : "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : showReportForm ? (
            <View style={styles.reportForm}>
              {participants.length > 1 && (
                <>
                  <Text style={[styles.formLabel, { color: colors.foreground }]}>
                    Who are you reporting?
                  </Text>
                  <View style={styles.categoryRow}>
                    {participants.map((participant) => (
                      <TouchableOpacity
                        key={participant.id}
                        disabled={submitting}
                        onPress={() => setTargetUserId(participant.id)}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor:
                              selectedParticipant?.id === participant.id
                                ? colors.primary
                                : colors.muted,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              selectedParticipant?.id === participant.id
                                ? "#FFFFFF"
                                : colors.foreground,
                            fontSize: 12,
                          }}
                        >
                          {participant.firstName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
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
          {selectedParticipant && (
            <TouchableOpacity
              disabled={submitting}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => setShowReportForm(true)}
            >
              <View style={[styles.iconWrap, { backgroundColor: "#FF9F0A18" }]}>
                <Ionicons name="flag" size={22} color="#FF9F0A" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Report User</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          {selectedParticipant && (
            <TouchableOpacity
              disabled={submitting}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={handleBlock}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.destructive + "18" }]}>
                <Ionicons name="ban" size={22} color={colors.destructive} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Block User</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            disabled={submitting}
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
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  confirmBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
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
