import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import {
  OAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { Platform } from "react-native";

import { getFirebaseAuth } from "@/lib/firebase";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function signInToFirebaseWithApple(): Promise<{
  idToken: string;
  firstName?: string;
}> {
  if (Platform.OS !== "ios") {
    throw new Error("Sign in with Apple is only available on iOS.");
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Sign in with Apple is not available on this device.");
  }

  const rawNonce = bytesToHex(await Crypto.getRandomBytesAsync(32));
  const nonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error("Apple did not return an identity token.");
  }

  const provider = new OAuthProvider("apple.com");
  const firebaseCredential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });
  const result = await signInWithCredential(
    getFirebaseAuth(),
    firebaseCredential,
  );

  const firstName =
    appleCredential.fullName?.givenName ??
    result.user.displayName?.split(/\s+/)[0] ??
    undefined;

  return {
    idToken: await result.user.getIdToken(),
    firstName,
  };
}

export async function signOutFromFirebase(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}