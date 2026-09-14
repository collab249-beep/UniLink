import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
    }

    let serviceAccount: {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON");
    }

    return initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
    });
  }

  return getApp();
}

function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function verifyFirebaseIdToken(
  idToken: string,
  checkRevoked = false,
) {
  return getFirebaseAdminAuth().verifyIdToken(idToken, checkRevoked);
}

export async function deleteFirebaseUserData(uid: string) {
  const firestore = getFirestore(getFirebaseAdminApp());
  await firestore.recursiveDelete(firestore.doc(`users/${uid}`));
}

export async function deleteFirebaseAuthUser(uid: string) {
  try {
    await getFirebaseAdminAuth().deleteUser(uid);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/user-not-found"
    ) {
      return;
    }
    throw error;
  }
}

export async function ensureFirebaseAuthUser(email: string) {
  const auth = getFirebaseAdminAuth();
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/user-not-found"
    ) {
      return auth.createUser({
        email,
        emailVerified: true,
        password: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
      });
    }
    throw error;
  }
}