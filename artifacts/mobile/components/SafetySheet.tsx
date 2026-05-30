import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface SafetySheetProps {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
  onLeave: () => void;
}

export function SafetySheet({ visible, onClose, onReport, onBlock, onLeave }: SafetySheetProps) {
  const colors = useColors();

  function handleEmergency() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Emergency Help",
      "In a real emergency, call 999 (UK) or 911 (US) immediately. Your campus security number: 0800 123 456",
      [{ text: "Call Campus Security", style: "destructive" }, { text: "OK" }],
    );
  }

  function handleReport() {
    Alert.alert("Report User", "Are you sure you want to report this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () => { onReport(); onClose(); },
      },
    ]);
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

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={handleReport}
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
