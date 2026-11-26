import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/queries";
import { displayPrice } from "@/lib/format";


export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (!q) return NextResponse.json({ items: [], total: 0 });
  const { items, total } = await getCatalog({ q });
  return NextResponse.json(
    {
      total,
      items: items.slice(0, 7).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category?.name ?? p.brand,
        price: displayPrice(p),
        image: p.images[0]?.url ?? null,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=30" } }
  );
}
