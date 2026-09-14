import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").unique(),
  universityEmail: text("university_email"),
  universityId: text("university_id"),
  university: text("university"),
  profilePicture: text("profile_picture"),
  isVerified: boolean("is_verified").default(false).notNull(),
  reliabilityScore: integer("reliability_score").default(100).notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referralCount: integer("referral_count").default(0).notNull(),
  isAmbassador: boolean("is_ambassador").default(false).notNull(),
  bio: text("bio"),
  interests: jsonb("interests").$type<string[]>().default([]),
  year: text("year"),
  course: text("course"),
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  moderationStatus: text("moderation_status").default("active").notNull(),
  moderationReason: text("moderation_reason"),
  moderatedAt: timestamp("moderated_at"),
  moderatedBy: text("moderated_by"),
  communityGuidelinesVersion: text("community_guidelines_version"),
  communityGuidelinesAcceptedAt: timestamp("community_guidelines_accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Auth tokens ───────────────────────────────────────────────────────────────

export const authTokens = pgTable("auth_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

// ── Live activity ─────────────────────────────────────────────────────────────

export const liveActivity = pgTable("live_activity", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  campusId: text("campus_id").notNull(),
  freeUntil: timestamp("free_until").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Meetup sessions ───────────────────────────────────────────────────────────

export const meetupSessions = pgTable("meetup_sessions", {
  id: text("id").primaryKey(),
  activity: text("activity").notNull(),
  campus: text("campus").notNull(),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  meetDeadline: timestamp("meet_deadline").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionParticipants = pgTable(
  "session_participants",
  {
    sessionId: text("session_id")
      .notNull()
      .references(() => meetupSessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attendanceConfirmed: boolean("attendance_confirmed")
      .default(false)
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.userId] })],
);

// ── Chat ──────────────────────────────────────────────────────────────────────

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => meetupSessions.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull().default("sent"),
});

// ── Notification preferences ──────────────────────────────────────────────────

export const notificationPrefs = pgTable("notification_prefs", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  groupActivity: boolean("group_activity").default(true).notNull(),
  eventReminders: boolean("event_reminders").default(true).notNull(),
  freeExpiry: boolean("free_expiry").default(true).notNull(),
  nearbyStudents: boolean("nearby_students").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Social ────────────────────────────────────────────────────────────────────

export const userBlocks = pgTable(
  "user_blocks",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

export const userReports = pgTable("user_reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedId: text("reported_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category").default("other").notNull(),
  reason: text("reason").default("").notNull(),
  status: text("status").default("pending").notNull(),
  adminNote: text("admin_note"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
