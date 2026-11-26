import path from "node:path";
import { readImage, storageKey } from "@/lib/upload";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  
  const key = storageKey(parts);
  if (!key) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(key).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  const data = await readImage(key);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": type,
      
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
