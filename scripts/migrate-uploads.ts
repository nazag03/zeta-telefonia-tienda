
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { firestore } from "../src/lib/firebase";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}

const MAX = 900 * 1024;

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) out.push(full);
  }
  return out;
}

async function main() {
  const base = path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");
  const files = await walk(base);
  let copied = 0;
  let skipped = 0;
  for (const full of files) {
    const key = path.relative(base, full).split(path.sep).join("/");
    const ref = firestore().collection("files").doc(key.replaceAll("/", "__"));
    if ((await ref.get()).exists) {
      skipped++;
      continue;
    }
    const data = await readFile(full);
    if (data.length > MAX) {
      console.warn(`⚠ ${key} pesa ${(data.length / 1024).toFixed(0)} KB (máx. 900 KB): volvé a subirla desde el panel.`);
      continue;
    }
    const ext = path.extname(full).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    await ref.set({ data, contentType, size: data.length, createdAt: new Date() });
    copied++;
    console.log(`✔ ${key}`);
  }
  console.log(`Listo: ${copied} copiadas, ${skipped} ya estaban.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
