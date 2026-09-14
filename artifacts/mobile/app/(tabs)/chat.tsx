import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { ACTIVITIES } from "@/constants/activities";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, useChat } from "@/contexts/ChatContext";
import { useSession } from "@/contexts/SessionContext";
import { useColors } from "@/hooks/useColors";

const QUICK_REPLIES = [
  "On my way! 🏃",
  "Just arrived",
  "Running 5 mins late",
  "See you there!",
  "Which entrance?",
];

function TypingIndicator() {
  const colors = useColors();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const anim = (sv: typeof dot1, delay: number) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      );
    };
    const t1 = setTimeout(() => anim(dot1, 0), 0);
    const t2 = setTimeout(() => anim(dot2, 0), 200);
    const t3 = setTimeout(() => anim(dot3, 0), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={[typingStyles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View style={[typingStyles.dot, { backgroundColor: colors.mutedForeground }, s1]} />
      <Animated.View style={[typingStyles.dot, { backgroundColor: colors.mutedForeground }, s2]} />
      <Animated.View style={[typingStyles.dot, { backgroundColor: colors.mutedForeground }, s3]} />
    </View>
  );
}

const typingStyles = StyleSheet.create({
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    marginLeft: 48,
    marginBottom: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const colors = useColors();
  const time = new Date(msg.timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msg.fromSelf) {
    return (
      <View style={styles.selfRow}>
        <View style={styles.selfMeta}>
          {msg.status === "delivered" && (
            <Ionicons name="checkmark-done" size={13} color={colors.primary + "99"} />
          )}
          {msg.status === "sending" && (
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          )}
          {msg.status === "failed" && (
            <>
              <Ionicons name="alert-circle" size={13} color={colors.destructive} />
              <Text style={[styles.timeText, { color: colors.destructive }]}>Not sent</Text>
            </>
          )}
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{time}</Text>
        </View>
        <View style={[styles.selfBubble, { backgroundColor: colors.primary }]}>
          <Text style={styles.selfText}>{msg.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherRow}>
      <View style={[styles.otherBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.otherText, { color: colors.foreground }]}>{msg.text}</Text>
      </View>
      <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{time}</Text>
    </View>
  );
}

function formatCountdown(ms: number) {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { session, timeRemaining } = useSession();
  const { messages, isTyping, sendMessage, markRead } = useChat();
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  useEffect(() => {
    markRead();
  }, [markRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length, isTyping]);

  if (!session) {
    router.replace("/(tabs)");
    return null;
  }

  const activityConfig = ACTIVITIES.find((a) => a.id === session.activity);
  const otherParticipants = session.participants.filter((p) => p.id !== user?.id);
  const firstOther = otherParticipants[0];

  async function handleSend(text?: string) {
    const msg = (text ?? draft).trim();
    if (!msg) return;
    setDraft("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendMessage(msg);
    } catch {
      Alert.alert("Message not sent", "Please check your connection and try again.");
    }
  }

  const isExpired = timeRemaining === 0;
  const countdownColor =
    timeRemaining < 5 * 60 * 1000 ? colors.destructive : colors.success;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? Math.max(insets.top, 67) + 12 : insets.top + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {firstOther ? (
            <Avatar firstName={firstOther.firstName} uri={firstOther.profilePicture} size={36} />
          ) : (
            <View style={[styles.groupIcon, { backgroundColor: activityConfig?.gradientStart ?? colors.primary }]}>
              <Ionicons name={activityConfig?.iconName as any ?? "people"} size={16} color="#FFF" />
            </View>
          )}
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>
              {firstOther?.firstName ?? "Your group"}
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {activityConfig?.label} · {session.location}
            </Text>
          </View>
        </View>

        <View style={[styles.countdownBadge, { backgroundColor: countdownColor + "18", borderColor: countdownColor + "40" }]}>
          <Ionicons name="timer-outline" size={12} color={countdownColor} />
          <Text style={[styles.countdownText, { color: countdownColor }]}>
            {isExpired ? "Ended" : formatCountdown(timeRemaining)}
          </Text>
        </View>
      </View>

      {isExpired && (
        <View style={[styles.expiredBanner, { backgroundColor: colors.destructive + "18" }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.destructive} />
          <Text style={[styles.expiredBannerText, { color: colors.destructive }]}>
            This session has ended. Messages are read-only.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.messageList, { paddingBottom: 12 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={[styles.emptyChatIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyChatTitle, { color: colors.foreground }]}>
                Say hello to {firstOther?.firstName ?? "your group"}
              </Text>
              <Text style={[styles.emptyChatSub, { color: colors.mutedForeground }]}>
                Coordinate where to meet or let them know you're on the way.
              </Text>
            </View>
          }
          renderItem={({ item }) => <MessageBubble msg={item} />}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {!isExpired && (
          <View style={[styles.inputArea, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
            <View style={styles.quickRepliesRow}>
              {QUICK_REPLIES.map((qr) => (
                <TouchableOpacity
                  key={qr}
                  style={[styles.quickReply, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => handleSend(qr)}
                >
                  <Text style={[styles.quickReplyText, { color: colors.foreground }]}>{qr}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="Message..."
                placeholderTextColor={colors.mutedForeground}
                value={draft}
                onChangeText={setDraft}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: draft.trim() ? colors.primary : colors.border },
                ]}
                onPress={() => handleSend()}
                disabled={!draft.trim()}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.1 },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  countdownText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  expiredBannerText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  messageList: { padding: 16, gap: 6, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: "center", paddingTop: 60, gap: 12 },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyChatTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2, textAlign: "center" },
  emptyChatSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19, paddingHorizontal: 24 },
  selfRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 5,
    marginVertical: 2,
  },
  selfMeta: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 4 },
  selfBubble: {
    maxWidth: "72%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  selfText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  otherRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    marginVertical: 2,
    paddingLeft: 0,
  },
  otherBubble: {
    maxWidth: "72%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  otherText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  timeText: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  quickRepliesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "nowrap",
  },
  quickReply: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickReplyText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
    lineHeight: 21,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
