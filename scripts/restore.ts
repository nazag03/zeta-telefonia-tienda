
import path from "node:path";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import type { DocumentData } from "firebase-admin/firestore";
import { firestore } from "../src/lib/firebase";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}

function decode(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.__type === "timestamp" && typeof o.value === "string") return new Date(o.value);
    if (o.__type === "bytes" && typeof o.base64 === "string") return Buffer.from(o.base64, "base64");
    return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, decode(x)]));
  }
  return v;
}

type Backup = { app: string; projectId: string | null; createdAt: string; counts: Record<string, number>; collections: Record<string, Record<string, unknown>> };

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const fileArg = args.find((a) => !a.startsWith("--"));
  if (!fileArg) {
    console.error('Uso: npm run backup:restore -- backups/zeta-backup-AAAA-MM-DD_HH-mm.json.gz [--confirm]');
    process.exit(1);
  }

  const raw = await readFile(path.resolve(fileArg));
  const backup = JSON.parse((fileArg.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8")) as Backup;
  if (backup.app !== "zeta-telefonia") throw new Error("El archivo no es un backup de Zeta Telefonía.");

  const target = process.env.FIREBASE_PROJECT_ID ?? "(sin FIREBASE_PROJECT_ID)";
  console.log(`Backup del ${new Date(backup.createdAt).toLocaleString("es-AR", { hour12: false })} (proyecto ${backup.projectId}) → destino: ${target}`);
  if (backup.projectId && process.env.FIREBASE_PROJECT_ID && backup.projectId !== process.env.FIREBASE_PROJECT_ID) {
    console.warn("⚠ El backup es de otro proyecto de Firebase.");
  }
  for (const [col, n] of Object.entries(backup.counts)) if (col !== "_meta") console.log(`  ${col.padEnd(14)} ${n} documentos`);

  if (!confirm) {
    console.log("\nNo se escribió nada. Para restaurar, repetí el comando agregando --confirm al final.");
    return;
  }

  const fs = firestore();
  
  let batch = fs.batch();
  let ops = 0;
  let bytes = 0;
  let written = 0;
  const flush = async () => {
    if (ops === 0) return;
    await batch.commit();
    written += ops;
    process.stdout.write(`\r  ${written} documentos restaurados...`);
    batch = fs.batch();
    ops = 0;
    bytes = 0;
  };

  for (const [col, docs] of Object.entries(backup.collections)) {
    if (col === "_meta") continue; 
    for (const [id, data] of Object.entries(docs)) {
      const size = JSON.stringify(data).length;
      if (ops >= 400 || bytes + size > 8_000_000) await flush();
      batch.set(fs.collection(col).doc(id), decode(data) as DocumentData);
      ops++;
      bytes += size;
    }
  }
  await flush();

  
  const metaRef = fs.doc("_meta/versions");
  const current = ((await metaRef.get()).data() ?? {}) as Record<string, number>;
  const bumped = Object.fromEntries(
    Object.keys(backup.collections)
      .filter((c) => c !== "_meta" && c !== "inquiries" && c !== "files")
      .map((c) => [c, (current[c] ?? 0) + 1])
  );
  await metaRef.set(bumped, { merge: true });

  console.log(`\n✔ Restauración completa. El sitio publicado toma los cambios en menos de 15 segundos.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✖ Error:", e.message ?? e);
    process.exit(1);
  });
