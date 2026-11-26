import "server-only";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";


sharp.cache(false);
sharp.concurrency(1);
import { getStorage } from "firebase-admin/storage";
import { firebaseApp, firestore } from "./firebase";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; 

const MAX_STORED_BYTES = 900 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "heif"]);

export class UploadError extends Error {}
















type Driver = "firestore" | "bucket" | "disk";

function driver(): Driver {
  const v = process.env.IMAGE_STORAGE;
  if (v === "firestore" || v === "bucket" || v === "disk") return v;
  return "firestore";
}

function bucket() {
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  if (!name) throw new Error("IMAGE_STORAGE=bucket requiere FIREBASE_STORAGE_BUCKET.");
  return getStorage(firebaseApp()).bucket(name);
}

export function uploadDir() {
  
  return path.resolve( process.cwd(), process.env.UPLOAD_DIR || "./storage/uploads");
}


export function storageKey(parts: string[]): string | null {
  if (parts.length === 0 || parts.length > 3) return null;
  if (!parts.every((p) => /^[a-z0-9][a-z0-9._-]*$/i.test(p) && !p.includes(".."))) return null;
  return parts.join("/");
}


const fileDoc = (key: string) => firestore().collection("files").doc(key.replaceAll("/", "__"));


const CACHE_LIMIT = 24 * 1024 * 1024;
const g = globalThis as unknown as { __zetaImgCache?: { map: Map<string, Buffer>; bytes: number } };
const imgCache = (g.__zetaImgCache ??= { map: new Map(), bytes: 0 });

function cachePut(key: string, data: Buffer) {
  if (data.length > CACHE_LIMIT / 4) return;
  cacheDrop(key);
  imgCache.map.set(key, data);
  imgCache.bytes += data.length;
  
  for (const [k, v] of imgCache.map) {
    if (imgCache.bytes <= CACHE_LIMIT) break;
    imgCache.map.delete(k);
    imgCache.bytes -= v.length;
  }
}

function cacheDrop(key: string) {
  const old = imgCache.map.get(key);
  if (old) {
    imgCache.map.delete(key);
    imgCache.bytes -= old.length;
  }
}


export async function putObject(key: string, data: Buffer, contentType: string) {
  const d = driver();
  if (d === "firestore") {
    if (data.length > MAX_STORED_BYTES) throw new UploadError("La imagen es demasiado pesada para guardarla.");
    await fileDoc(key).set({ data, contentType, size: data.length, createdAt: new Date() });
  } else if (d === "bucket") {
    await bucket().file(`uploads/${key}`).save(data, {
      contentType,
      resumable: false,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });
  } else {
    const full = path.join(uploadDir(), key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }
  cachePut(key, data);
}


export async function readObject(key: string): Promise<Buffer | null> {
  const hit = imgCache.map.get(key);
  if (hit) {
    
    imgCache.map.delete(key);
    imgCache.map.set(key, hit);
    return hit;
  }
  try {
    const d = driver();
    let data: Buffer | null = null;
    if (d === "firestore") {
      const snap = await fileDoc(key).get();
      const raw = snap.exists ? snap.get("data") : null;
      data = raw ? Buffer.from(raw as Uint8Array) : null;
    } else if (d === "bucket") {
      [data] = await bucket().file(`uploads/${key}`).download();
    } else {
      data = await readFile(path.join(uploadDir(), key));
    }
    if (data) cachePut(key, data);
    return data;
  } catch {
    return null;
  }
}

async function removeObject(key: string) {
  cacheDrop(key);
  const d = driver();
  if (d === "firestore") await fileDoc(key).delete().catch(() => {});
  else if (d === "bucket") await bucket().file(`uploads/${key}`).delete({ ignoreNotFound: true }).catch(() => {});
  else await unlink(path.join(uploadDir(), key)).catch(() => {});
}










export const THUMB_WIDTHS = [640, 1080] as const;
const THUMB_RE = /^(.+)\.w(\d+)\.webp$/;

export const thumbKey = (key: string, w: number) => key.replace(/\.webp$/, `.w${w}.webp`);
export const isThumbKey = (key: string) => THUMB_RE.test(key);

async function makeThumbs(data: Buffer): Promise<Map<number, Buffer>> {
  const { width = 0 } = await sharp(data).metadata();
  const out = new Map<number, Buffer>();
  for (const w of THUMB_WIDTHS) {
    
    out.set(
      w,
      width <= w ? data : await sharp(data).resize({ width: w, height: w, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    );
  }
  return out;
}


export async function saveThumbs(key: string, data: Buffer) {
  for (const [w, buf] of await makeThumbs(data)) await putObject(thumbKey(key, w), buf, "image/webp");
}


let thumbQueue: Promise<unknown> = Promise.resolve();


export async function readImage(key: string): Promise<Buffer | null> {
  const data = await readObject(key);
  if (data) return data;
  const m = THUMB_RE.exec(key);
  const w = m ? Number(m[2]) : 0;
  if (!m || !(THUMB_WIDTHS as readonly number[]).includes(w)) return null;

  const job = thumbQueue.then(async () => {
    const again = await readObject(key);
    if (again) return again;
    const base = `${m[1]}.webp`;
    const original = await readObject(base);
    if (!original) return null;
    await saveThumbs(base, original);
    return readObject(key);
  });
  thumbQueue = job.catch(() => null);
  return job.catch(() => null);
}




export async function saveImage(file: File, opts: { maxWidth?: number; folder?: string } = {}) {
  if (!file || file.size === 0) throw new UploadError("Archivo vacío.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" supera los 8 MB.`);

  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!meta) throw new UploadError(`"${file.name}" no es una imagen válida.`);
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new UploadError(`Formato no permitido en "${file.name}". Usá JPG, PNG, WebP o AVIF.`);
  }

  
  let width = opts.maxWidth ?? 1600;
  let quality = 84;
  let output: Buffer;
  for (let attempt = 0; ; attempt++) {
    output = await sharp(input)
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (output.length <= MAX_STORED_BYTES || attempt >= 6) break;
    quality = Math.max(55, quality - 8);
    width = Math.round(width * 0.85);
  }
  if (output.length > MAX_STORED_BYTES) throw new UploadError(`"${file.name}" es demasiado detallada. Probá con otra foto.`);

  const folder = (opts.folder || "misc").replace(/[^a-z0-9-]/gi, "") || "misc";
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
  const key = `${folder}/${name}`;
  await putObject(key, output, "image/webp");
  await saveThumbs(key, output);
  return `/uploads/${key}`;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const key = storageKey(url.replace(/^\/uploads\//, "").split("/"));
  if (!key) return;
  await removeObject(key);
  if (key.endsWith(".webp") && !isThumbKey(key)) {
    for (const w of THUMB_WIDTHS) await removeObject(thumbKey(key, w));
  }
}

export function filesFrom(formData: FormData, name: string) {
  return formData.getAll(name).filter((f): f is File => f instanceof File && f.size > 0);
}
