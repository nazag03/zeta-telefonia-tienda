import { NextResponse } from "next/server";
import { z } from "zod";
import { db, inquiries } from "@/lib/db";

const schema = z.object({
  type: z.enum(["PRODUCT", "LIST", "GENERAL", "PROMOTION"]),
  productId: z.string().max(40).optional(),
  detail: z.string().max(300).optional(),
});


const hits = new Map<string, { n: number; reset: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (h && h.reset > now && h.n >= 30) return NextResponse.json({ ok: false }, { status: 429 });
  if (!h || h.reset < now) hits.set(ip, { n: 1, reset: now + 60_000 });
  else h.n++;

  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const { type, productId, detail } = parsed.data;
  const exists = productId ? await db.products.get(productId) : null;
  await inquiries.create({ type, productId: exists?.id ?? null, detail: detail ?? null });
  return NextResponse.json({ ok: true });
}
