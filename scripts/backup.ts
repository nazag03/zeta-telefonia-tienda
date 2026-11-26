
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../src/lib/firebase";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}


function encode(v: unknown): unknown {
  if (v instanceof Timestamp) return { __type: "timestamp", value: v.toDate().toISOString() };
  if (v instanceof Date) return { __type: "timestamp", value: v.toISOString() };
  if (v instanceof Uint8Array) return { __type: "bytes", base64: Buffer.from(v).toString("base64") };
  if (Array.isArray(v)) return v.map(encode);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)]));
  return v;
}

async function main() {
  const fs = firestore();
  const started = Date.now();
  const collections = await fs.listCollections();
  const data: Record<string, Record<string, unknown>> = {};
  const counts: Record<string, number> = {};

  for (const col of collections) {
    const snap = await col.get();
    data[col.id] = Object.fromEntries(snap.docs.map((d) => [d.id, encode(d.data())]));
    counts[col.id] = snap.size;
    console.log(`  ${col.id.padEnd(14)} ${snap.size} documentos`);
  }

  const backup = {
    app: "zeta-telefonia",
    version: 1,
    projectId: process.env.FIREBASE_PROJECT_ID ?? null,
    createdAt: new Date().toISOString(),
    counts,
    collections: data,
  };

  const dir = path.resolve("backups");
  await mkdir(dir, { recursive: true });
  
  const now = new Date();
  const two = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}_${two(now.getHours())}-${two(now.getMinutes())}`;
  const file = path.join(dir, `zeta-backup-${stamp}.json.gz`);
  const gz = gzipSync(JSON.stringify(backup));
  await writeFile(file, gz);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`\n✔ Backup listo: ${total} documentos, ${(gz.length / 1024).toFixed(0)} KB, en ${((Date.now() - started) / 1000).toFixed(1)} s`);
  console.log(`  ${file}`);
  console.log("  Guardá una copia fuera de la PC (Google Drive, pendrive). No lo compartas: tiene datos privados.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✖ Error:", e.message ?? e);
    process.exit(1);
  });
