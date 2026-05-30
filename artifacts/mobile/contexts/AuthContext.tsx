import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "unilink:user";

export interface UserProfile {
  id: string;
  firstName: string;
  email: string;
  universityEmail: string;
  university: string;
  profilePicture?: string;
  isVerified: boolean;
  reliabilityScore: number;
  blockedUsers: string[];
  reportedUsers: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, email: string, password: string) => Promise<UserProfile>;
  verifyUniversity: (universityEmail: string) => Promise<void>;
  updateProfilePicture: (uri: string) => Promise<void>;
  signOut: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const UNIVERSITY_DOMAINS = [
  ".edu", ".ac.uk", ".edu.au", ".ac.nz", ".edu.sg",
  ".uni-", ".university.", ".college.", ".ac.in",
];

function detectUniversity(email: string): string {
  const domain = email.split("@")[1] ?? "";
  if (domain.includes("manchester")) return "University of Manchester";
  if (domain.includes("kcl") || domain.includes("king")) return "King's College London";
  if (domain.includes("ed.ac")) return "University of Edinburgh";
  if (domain.includes("imperial")) return "Imperial College London";
  if (domain.includes("ucl")) return "University College London";
  if (domain.includes("bristol")) return "University of Bristol";
  if (domain.includes("leeds")) return "University of Leeds";
  if (domain.includes("ox.ac")) return "University of Oxford";
  if (domain.includes("cam.ac")) return "University of Cambridge";
  if (domain.includes("mit")) return "MIT";
  if (domain.includes("harvard")) return "Harvard University";
  return "Your University";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as UserProfile);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function saveUser(profile: UserProfile) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }

  async function signInWithGoogle() {
    const profile: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      firstName: "Alex",
      email: "alex@student.example.edu",
      universityEmail: "alex@student.example.edu",
      university: "University of Manchester",
      isVerified: true,
      reliabilityScore: 95,
      blockedUsers: [],
      reportedUsers: [],
    };
    await saveUser(profile);
  }

  async function signIn(email: string, _password: string) {
    const profile: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      firstName: email.split("@")[0] ?? "Student",
      email,
      universityEmail: email,
      university: detectUniversity(email),
      isVerified: true,
      reliabilityScore: 100,
      blockedUsers: [],
      reportedUsers: [],
    };
    await saveUser(profile);
  }

  async function signUp(firstName: string, email: string, _password: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      firstName,
      email,
      universityEmail: "",
      university: "",
      isVerified: false,
      reliabilityScore: 100,
      blockedUsers: [],
      reportedUsers: [],
    };
    await saveUser(profile);
    return profile;
  }

  async function verifyUniversity(universityEmail: string) {
    const isValid = UNIVERSITY_DOMAINS.some((d) => universityEmail.includes(d));
    if (!isValid) throw new Error("Please use a valid university email address (.edu, .ac.uk, etc.)");
    if (!user) throw new Error("Not signed in");
    const updated: UserProfile = {
      ...user,
      universityEmail,
      university: detectUniversity(universityEmail),
      isVerified: true,
    };
    await saveUser(updated);
  }

  async function updateProfilePicture(uri: string) {
    if (!user) return;
    await saveUser({ ...user, profilePicture: uri });
  }

  async function signOut() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem("unilink:session");
    setUser(null);
  }

  async function blockUser(userId: string) {
    if (!user) return;
    const updated = { ...user, blockedUsers: [...new Set([...user.blockedUsers, userId])] };
    await saveUser(updated);
  }

  async function reportUser(userId: string) {
    if (!user) return;
    const updated = { ...user, reportedUsers: [...new Set([...user.reportedUsers, userId])] };
    await saveUser(updated);
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      signInWithGoogle, signIn, signUp,
      verifyUniversity, updateProfilePicture,
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
