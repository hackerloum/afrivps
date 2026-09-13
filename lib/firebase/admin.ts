import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

import { publicEnv, serverEnv, useEmulators } from "@/lib/env";

/**
 * Firebase Admin SDK — server only.
 *
 * Credentials are NEVER exposed to the browser. When emulators are enabled the
 * SDK auto-connects via FIREBASE_AUTH_EMULATOR_HOST / FIRESTORE_EMULATOR_HOST /
 * FIREBASE_STORAGE_EMULATOR_HOST, so no real service account is required.
 */

function createAdminApp(): App {
  const env = serverEnv();
  const projectId =
    env.FIREBASE_PROJECT_ID || publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (useEmulators) {
    // Emulator mode: connect without real credentials.
    ensureEmulatorHosts();
    return initializeApp({
      projectId,
      storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Support both literal and escaped-newline private keys.
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

function ensureEmulatorHosts(): void {
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST =
    process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
}

// Reuse the app across hot reloads / serverless invocations.
function adminApp(): App {
  return getApps().length ? getApps()[0]! : createAdminApp();
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export function adminDb(): Firestore {
  return getFirestore(adminApp());
}

export function adminStorage(): Storage {
  return getStorage(adminApp());
}
