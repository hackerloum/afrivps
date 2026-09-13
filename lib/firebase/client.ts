"use client";

import {
  getAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { publicEnv, useEmulators } from "@/lib/env";

const firebaseConfig = {
  apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: publicEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Emulator host/ports. Kept in sync with `firebase.json` so the Web SDK, the
// Admin SDK and the emulator processes all agree on where each service lives.
const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199 } as const;

// Guard against duplicate initialization during Next.js hot reload / RSC.
function getClientApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/**
 * The emulator-connection guard is persisted on `globalThis` rather than a
 * plain module-level variable. During Next.js HMR the module can be
 * re-evaluated (resetting module state) while the underlying `FirebaseApp`
 * persists — connecting the emulators a second time throws "already
 * started/connected" errors. A global flag keyed to the app makes the
 * connection strictly idempotent across reloads.
 */
const EMULATOR_GUARD_KEY = "__afrivps_firebase_emulators_connected__";

type EmulatorGuardHolder = typeof globalThis & {
  [EMULATOR_GUARD_KEY]?: boolean;
};

function connectEmulatorsOnce(
  auth: Auth,
  db: Firestore,
  storage: FirebaseStorage,
): void {
  if (!useEmulators) return;

  const holder = globalThis as EmulatorGuardHolder;
  if (holder[EMULATOR_GUARD_KEY]) return;
  holder[EMULATOR_GUARD_KEY] = true;

  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
  connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
}

export function getFirebaseClient(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  const app = getClientApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  connectEmulatorsOnce(auth, db, storage);
  return { app, auth, db, storage };
}

export const firebaseApp = getClientApp();

/**
 * Optional Firebase Analytics.
 *
 * Analytics is browser-only and pointless against the emulators, so it is
 * initialized lazily and defensively:
 *   - never on the server (SSR / Node have no `window`);
 *   - never in emulator mode;
 *   - only when a `measurementId` is configured;
 *   - only when `isSupported()` resolves true for the current environment.
 *
 * The single in-flight promise is memoized on `globalThis` so repeated calls
 * (and Next.js HMR) never double-initialize. `getFirebaseAnalytics()` returns
 * `Analytics | null` and never throws, so callers can treat analytics as a
 * best-effort enhancement.
 */
const ANALYTICS_PROMISE_KEY = "__afrivps_firebase_analytics_promise__";

type AnalyticsPromiseHolder = typeof globalThis & {
  [ANALYTICS_PROMISE_KEY]?: Promise<Analytics | null>;
};

function analyticsEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    !useEmulators &&
    Boolean(firebaseConfig.measurementId)
  );
}

/**
 * Resolve the Firebase Analytics instance, or `null` when analytics is not
 * available (server, emulator mode, unsupported browser, or no measurementId).
 * Safe to call anywhere — it degrades to `null` instead of throwing.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!analyticsEnabled()) return null;

  const holder = globalThis as AnalyticsPromiseHolder;
  if (holder[ANALYTICS_PROMISE_KEY]) return holder[ANALYTICS_PROMISE_KEY];

  const promise = isSupported()
    .then((supported) => (supported ? getAnalytics(getClientApp()) : null))
    .catch(() => null);

  holder[ANALYTICS_PROMISE_KEY] = promise;
  return promise;
}
