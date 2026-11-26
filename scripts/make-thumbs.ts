
import sharp from "sharp";
import { firestore } from "../src/lib/firebase";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}


const THUMB_WIDTHS = [640, 1080];
const THUMB_RE = /\.w\d+\.webp$/;

async function main() {
  const col = firestore().collection("files");
  
  const ids = new Set((await col.select().get()).docs.map((d) => d.id));
  const originals = [...ids].filter((id) => id.endsWith(".webp") && !THUMB_RE.test(id));

  let made = 0;
  let skipped = 0;
  for (const id of originals) {
    const missing = THUMB_WIDTHS.filter((w) => !ids.has(id.replace(/\.webp$/, `.w${w}.webp`)));
    if (missing.length === 0) {
      skipped++;
      continue;
    }
    const raw = (await col.doc(id).get()).get("data") as Uint8Array | undefined;
    if (!raw) continue;
    const data = Buffer.from(raw);
    const { width = 0 } = await sharp(data).metadata();
    for (const w of missing) {
      const buf =
        width <= w ? data : await sharp(data).resize({ width: w, height: w, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      await col.doc(id.replace(/\.webp$/, `.w${w}.webp`)).set({ data: buf, contentType: "image/webp", size: buf.length, createdAt: new Date() });
    }
    made++;
    console.log(`✔ ${id.replaceAll("__", "/")}`);
  }
  console.log(`Listo: ${made} fotos con miniaturas nuevas, ${skipped} ya las tenían.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
