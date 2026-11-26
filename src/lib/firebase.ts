
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";


function credentialFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return undefined;
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return cert(JSON.parse(json));
}

export function firebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const credential = credentialFromEnv();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  return initializeApp({ ...(credential ? { credential } : {}), ...(projectId ? { projectId } : {}) });
}

const g = globalThis as unknown as { __zetaFirestore?: Firestore };

export function firestore(): Firestore {
  if (!g.__zetaFirestore) {
    const db = getFirestore(firebaseApp());
    db.settings({ ignoreUndefinedProperties: true });
    g.__zetaFirestore = db;
  }
  return g.__zetaFirestore;
}
