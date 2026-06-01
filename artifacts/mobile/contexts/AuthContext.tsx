import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { UniversityId, detectNottinghamUniversity } from "@/constants/universities";

const STORAGE_KEY = "unilink:user";

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

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, email: string, password: string) => Promise<UserProfile>;
  verifyUniversity: (universityEmail: string) => Promise<void>;
  updateProfilePicture: (uri: string) => Promise<void>;
  updateProfile: (fields: Partial<Pick<UserProfile, "bio" | "interests" | "year" | "course" | "firstName" | "profileComplete" | "isPremium">>) => Promise<void>;
  signOut: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateReferralCode(firstName: string): string {
  const base = firstName.toUpperCase().slice(0, 4).padEnd(4, "X");
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${base}${num}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => { if (raw) setUser(JSON.parse(raw) as UserProfile); })
      .finally(() => setIsLoading(false));
  }, []);

  async function saveUser(profile: UserProfile) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }

  function makeProfile(firstName: string, email: string, overrides?: Partial<UserProfile>): UserProfile {
    return {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      firstName,
      email,
      universityEmail: "",
      universityId: null,
      university: "",
      isVerified: false,
      reliabilityScore: 100,
      referralCode: generateReferralCode(firstName),
      referralCount: 0,
      isAmbassador: false,
      blockedUsers: [],
      reportedUsers: [],
      ...overrides,
    };
  }

  async function signInWithGoogle() {
    const profile = makeProfile("Alex", "alex@nottingham.ac.uk", {
      universityEmail: "alex@nottingham.ac.uk",
      universityId: "uon",
      university: "University of Nottingham",
      isVerified: true,
    });
    await saveUser(profile);
  }

  async function signIn(email: string, _password: string) {
    const profile = makeProfile(email.split("@")[0] ?? "Student", email, {
      universityEmail: email,
      universityId: null,
      university: "",
      isVerified: false,
    });
    await saveUser(profile);
  }

  async function signUp(firstName: string, email: string, _password: string): Promise<UserProfile> {
    const profile = makeProfile(firstName, email);
    await saveUser(profile);
    return profile;
  }

  async function verifyUniversity(universityEmail: string) {
    const trimmed = universityEmail.trim().toLowerCase();
    const uniConfig = detectNottinghamUniversity(trimmed);

    if (!uniConfig) {
      const domain = trimmed.split("@")[1] ?? "";
      const isOtherUni = [".edu", ".ac.uk", ".edu.au", ".ac.nz"].some((d) => domain.endsWith(d));
      if (!isOtherUni) {
        throw new Error(
          "Please use your University of Nottingham (@nottingham.ac.uk) or NTU (@ntu.ac.uk) email address.",
        );
      }
      if (!user) throw new Error("Not signed in");
      const updated: UserProfile = {
        ...user,
        universityEmail: trimmed,
        universityId: "other",
        university: "Other University",
        isVerified: true,
      };
      await saveUser(updated);
      return;
    }

    if (!user) throw new Error("Not signed in");
    const updated: UserProfile = {
      ...user,
      universityEmail: trimmed,
      universityId: uniConfig.id,
      university: uniConfig.name,
      isVerified: true,
    };
    await saveUser(updated);
  }

  async function updateProfilePicture(uri: string) {
    if (!user) return;
    await saveUser({ ...user, profilePicture: uri });
  }

  async function updateProfile(
    fields: Partial<Pick<UserProfile, "bio" | "interests" | "year" | "course" | "firstName" | "profileComplete" | "isPremium">>,
  ) {
    if (!user) return;
    await saveUser({ ...user, ...fields });
  }

  async function signOut() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem("unilink:session");
    await AsyncStorage.removeItem("unilink:free");
    setUser(null);
  }

  async function blockUser(userId: string) {
    if (!user) return;
    await saveUser({ ...user, blockedUsers: [...new Set([...user.blockedUsers, userId])] });
  }

  async function reportUser(userId: string) {
    if (!user) return;
    await saveUser({ ...user, reportedUsers: [...new Set([...user.reportedUsers, userId])] });
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      signInWithGoogle, signIn, signUp,
      verifyUniversity, updateProfilePicture, updateProfile,
      signOut, blockUser, reportUser,
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
