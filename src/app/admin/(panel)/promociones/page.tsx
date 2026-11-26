import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Tag, Trash2, Percent } from "lucide-react";
import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PROMO_TYPES } from "@/lib/format";
import { ConfirmButton, PageHeader } from "@/components/admin/ui";
import { clearPromotionDiscountsAction, deletePromotionAction, togglePromotionAction } from "../../actions/promotions";

export const metadata = { title: "Promociones" };

function status(p: { active: boolean; startsAt: Date | null; endsAt: Date | null }) {
  const now = new Date();
  if (!p.active) return { label: "Inactiva", cls: "bg-ink-700 text-ink-300" };
  if (p.startsAt && p.startsAt > now) return { label: "Programada", cls: "bg-sky-500/15 text-sky-300" };
  if (p.endsAt && p.endsAt < now) return { label: "Vencida", cls: "bg-red-500/15 text-red-300" };
  return { label: "En curso", cls: "bg-emerald-500/15 text-emerald-300" };
}

const fmt = (d: Date) => d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Cordoba" });

export default async function PromotionsAdmin() {
  await requireUser();
  const [all, products] = await Promise.all([db.promotions.all(), db.products.all()]);
  const ids = new Set(products.map((p) => p.id));
  const promos = sortBy(all, ["order", "asc"], ["createdAt", "desc"]).map((p) => ({
    ...p,
    _count: { products: (p.productIds ?? []).filter((id) => ids.has(id)).length },
  }));

  return (
    <>
      <PageHeader title="Promociones" description="Ofertas, combos y campañas por tiempo limitado. También podés marcar productos en oferta desde cada producto.">
        <Link href="/admin/promociones/nuevo" className="btn-primary"><Plus className="h-4 w-4" /> Nueva promoción</Link>
      </PageHeader>

      {promos.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Tag className="h-8 w-8 text-brand-400" />
          <p className="text-ink-300">Todavía no creaste promociones.</p>
          <Link href="/admin/promociones/nuevo" className="btn-primary"><Plus className="h-4 w-4" /> Crear la primera</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {promos.map((p) => {
            const st = status(p);
            return (
              <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-600/40 to-ink-800">
                  {p.image && <Image src={p.image} alt="" fill sizes="112px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/promociones/${p.id}`} className="font-semibold text-white hover:text-brand-300">{p.title}</Link>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                    <span className="badge bg-white/5 text-ink-300">{PROMO_TYPES[p.type]}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    {p._count.products} productos
                    {p.startsAt && ` · desde ${fmt(p.startsAt)}`}
                    {p.endsAt && ` · hasta ${fmt(p.endsAt)}`}
                    {p.showOnHome && " · en portada"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={togglePromotionAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="field" value="active" />
                    <input type="hidden" name="value" value={String(!p.active)} />
                    <button className="btn-ghost btn-sm">{p.active ? "Desactivar" : "Activar"}</button>
                  </form>
                  {p._count.products > 0 && (
                    <form action={clearPromotionDiscountsAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message="¿Quitar el precio promocional de todos los productos de esta promoción?" className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white">
                        <Percent className="h-4 w-4" aria-label="Quitar descuentos" />
                      </ConfirmButton>
                    </form>
                  )}
                  <Link href={`/admin/promociones/${p.id}`} className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white" title="Editar"><Pencil className="h-4 w-4" /></Link>
                  <form action={deletePromotionAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`¿Eliminar la promoción "${p.title}"? Los productos no se eliminan.`} className="rounded-lg p-2 text-ink-300 hover:bg-red-500/15 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
