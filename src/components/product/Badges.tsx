import { CONDITION, discountPercent, hasPromo, type Priced } from "@/lib/format";

type P = Priced & { isNew: boolean; isOffer: boolean; isFeatured: boolean; condition: string };


export function ProductBadges({ p, max = 2 }: { p: P; max?: number }) {
  const list: { label: string; cls: string }[] = [];
  const promo = hasPromo(p);
  if (promo || p.isOffer) list.push({ label: promo ? `-${discountPercent(p)}%` : "Oferta", cls: "bg-rose-500 text-white" });
  if (p.isNew) list.push({ label: "Novedad", cls: "bg-ink text-white" });
  if (p.isFeatured) list.push({ label: "Destacado", cls: "bg-brand-600 text-white" });
  if (p.condition !== "NEW") list.push({ label: CONDITION[p.condition] ?? "Usado", cls: "bg-white text-graphite ring-1 ring-black/[0.08]" });
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.slice(0, max).map((b) => (
        <span key={b.label} className={`tag px-2.5 py-0.5 text-[0.7rem] tracking-wide ${b.cls}`}>{b.label}</span>
      ))}
    </div>
  );
}
