import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

import { UniversityId } from "@/constants/universities";
import { api, clearToken, getToken, setToken, type ApiUser } from "@/lib/api";
import {
  signInToFirebaseWithApple,
  signOutFromFirebase,
} from "@/lib/appleAuth";

const SOCIAL_KEY = "unilink:social"; // local-only: blocked/reported user IDs

export interface UserProfile {
  id: string;
  firstName: string;
  email: string;
  universityEmail: string;
  universityId: UniversityId | null;
  university: string;
  profilePicture?: string;
  isVerified: boolean;
  reliabilityScore: number;
  referralCode: string;
  referralCount: number;
  isAmbassador: boolean;
  blockedUsers: string[];
  reportedUsers: string[];
  bio?: string;
  interests?: string[];
  year?: string;
  course?: string;
  profileComplete?: boolean;
  isPremium?: boolean;
}

interface SocialData {
  blockedUsers: string[];
  reportedUsers: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, email: string, password: string) => Promise<UserProfile>;
  verifyUniversity: (universityEmail: string) => Promise<void>;
  updateProfilePicture: (uri: string) => Promise<void>;
  updateProfile: (fields: Partial<Pick<UserProfile, "bio" | "interests" | "year" | "course" | "firstName" | "profileComplete" | "isPremium">>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadSocial(): Promise<SocialData> {
  try {
    const raw = await AsyncStorage.getItem(SOCIAL_KEY);
    return raw ? JSON.parse(raw) : { blockedUsers: [], reportedUsers: [] };
  } catch {
    return { blockedUsers: [], reportedUsers: [] };
  }
}

async function saveSocial(data: SocialData) {
  await AsyncStorage.setItem(SOCIAL_KEY, JSON.stringify(data));
}

async function clearLocalUserData() {
  await AsyncStorage.multiRemove([
    SOCIAL_KEY,
    "unilink:session",
    "unilink:free",
    "notification_prefs",
  ]);

  if (Platform.OS !== "web") {
    await Promise.allSettled([
      Notifications.cancelAllScheduledNotificationsAsync(),
      Notifications.dismissAllNotificationsAsync(),
    ]);
  }
}

function apiUserToProfile(apiUser: ApiUser, social: SocialData): UserProfile {
  return {
    id: apiUser.id,
    firstName: apiUser.firstName,
    email: apiUser.email,
    universityEmail: apiUser.universityEmail ?? "",
    universityId: (apiUser.universityId as UniversityId | null) ?? null,
    university: apiUser.university ?? "",
    profilePicture: apiUser.profilePicture ?? undefined,
    isVerified: apiUser.isVerified,
    reliabilityScore: apiUser.reliabilityScore,
    referralCode: apiUser.referralCode,
    referralCount: apiUser.referralCount,
    isAmbassador: apiUser.isAmbassador,
    bio: apiUser.bio ?? undefined,
    interests: apiUser.interests ?? undefined,
    year: apiUser.year ?? undefined,
    course: apiUser.course ?? undefined,
    profileComplete: apiUser.isProfileComplete,
    isPremium: apiUser.isPremium,
    blockedUsers: social.blockedUsers,
    reportedUsers: social.reportedUsers,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [{ user: apiUser }, social] = await Promise.all([api.auth.me(), loadSocial()]);
        setUser(apiUserToProfile(apiUser, social));
      } catch {
        // Token expired or invalid — clear it
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function handleAuthResponse(token: string, apiUser: ApiUser) {
    await setToken(token);
    const social = await loadSocial();
    const profile = apiUserToProfile(apiUser, social);
    setUser(profile);
    return profile;
  }

  async function signInWithGoogle() {
    // Demo flow: always sign in as Alex
    const { token, user: apiUser } = await api.auth.signIn("alex@nottingham.ac.uk");
    // Ensure verified UoN profile
    await handleAuthResponse(token, apiUser);
    try {
      const { user: verified } = await api.auth.verify("alex@nottingham.ac.uk");
      const social = await loadSocial();
      setUser(apiUserToProfile(verified, social));
    } catch {}
  }

  async function signInWithApple() {
    const { idToken, firstName } = await signInToFirebaseWithApple();
    const { token, user: apiUser } = await api.auth.firebaseSignIn(
      idToken,
      firstName,
    );
    await handleAuthResponse(token, apiUser);
  }

  async function signIn(email: string, _password: string) {
    const { token, user: apiUser } = await api.auth.signIn(email);
    await handleAuthResponse(token, apiUser);
  }

  async function signUp(firstName: string, email: string, _password: string): Promise<UserProfile> {
    const { token, user: apiUser } = await api.auth.signUp({ firstName, email });
    const profile = await handleAuthResponse(token, apiUser);
    return profile;
  }

  async function verifyUniversity(universityEmail: string) {
    const { user: apiUser } = await api.auth.verify(universityEmail.trim().toLowerCase());
    const social = await loadSocial();
    setUser(apiUserToProfile(apiUser, social));
  }

  async function updateProfilePicture(uri: string) {
    const { user: apiUser } = await api.auth.updateProfile({ profilePicture: uri });
    const social = await loadSocial();
    setUser(apiUserToProfile(apiUser, social));
  }

  async function updateProfile(
    fields: Partial<Pick<UserProfile, "bio" | "interests" | "year" | "course" | "firstName" | "profileComplete" | "isPremium">>,
  ) {
    const apiFields: Record<string, unknown> = {};
    if (fields.bio !== undefined) apiFields.bio = fields.bio;
    if (fields.interests !== undefined) apiFields.interests = fields.interests;
    if (fields.year !== undefined) apiFields.year = fields.year;
    if (fields.course !== undefined) apiFields.course = fields.course;
    if (fields.firstName !== undefined) apiFields.firstName = fields.firstName;
    if (fields.profileComplete !== undefined) apiFields.isProfileComplete = fields.profileComplete;
    if (fields.isPremium !== undefined) apiFields.isPremium = fields.isPremium;

    const { user: apiUser } = await api.auth.updateProfile(apiFields as Parameters<typeof api.auth.updateProfile>[0]);
    const social = await loadSocial();
    setUser(apiUserToProfile(apiUser, social));
  }

  async function signOut() {
    try {
      await api.auth.signOut();
    } catch {}
    try {
      await signOutFromFirebase();
    } catch {}
    await clearToken();
    await clearLocalUserData();
    setUser(null);
  }

  async function deleteAccount() {
    const { idToken } = await signInToFirebaseWithApple();
    try {
      await api.auth.deleteAccount(idToken);
    } catch (error) {
      // A distributed deletion may have completed only some systems. Clear the
      // local session so the next attempt always starts from a clean sign-in.
      try {
        await signOutFromFirebase();
      } catch {}
      await clearToken();
      await clearLocalUserData();
      setUser(null);
      throw error;
    }

    try {
      await signOutFromFirebase();
    } catch {}
    await clearToken();
    await clearLocalUserData();
    setUser(null);
  }

  async function blockUser(userId: string) {
    const social = await loadSocial();
    const updated: SocialData = {
      ...social,
      blockedUsers: [...new Set([...social.blockedUsers, userId])],
    };
    await saveSocial(updated);
    setUser((u) => u ? { ...u, blockedUsers: updated.blockedUsers } : u);
    api.auth.block(userId).catch(() => {});
  }

  async function reportUser(userId: string) {
    const social = await loadSocial();
    const updated: SocialData = {
      ...social,
      reportedUsers: [...new Set([...social.reportedUsers, userId])],
    };
    await saveSocial(updated);
    setUser((u) => u ? { ...u, reportedUsers: updated.reportedUsers } : u);
    api.auth.report(userId).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      signInWithApple, signInWithGoogle, signIn, signUp,
      verifyUniversity, updateProfilePicture, updateProfile,
      deleteAccount, signOut, blockUser, reportUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
