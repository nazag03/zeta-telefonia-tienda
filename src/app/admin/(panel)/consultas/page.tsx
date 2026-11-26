import Link from "next/link";
import { db, inquiries } from "@/lib/db";
import { daysAgo } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { ConfirmButton, PageHeader } from "@/components/admin/ui";
import { clearInquiriesAction } from "../../actions/misc";

export const metadata = { title: "Consultas" };

const TYPES: Record<string, string> = { PRODUCT: "Producto", LIST: "Lista de productos", GENERAL: "General", PROMOTION: "Promoción" };

export default async function InquiriesPage() {
  const user = await requireUser();
  const since = daysAgo(30);
  const [latest, month, total, products] = await Promise.all([
    inquiries.latest(200),
    inquiries.since(since),
    inquiries.count(),
    db.products.all(),
  ]);
  const names = new Map(products.map((p) => [p.id, p.name]));
  const items = latest.map((i) => ({
    ...i,
    product: i.productId && names.has(i.productId) ? { id: i.productId, name: names.get(i.productId)! } : null,
  }));
  const last30 = month.length;
  const byType = Object.keys(TYPES).map((type) => ({ type, _count: { _all: month.filter((i) => i.type === type).length } }));

  
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const recent = month.filter((i) => i.createdAt >= days[0]);
  const perDay = days.map((d) => {
    const next = new Date(d.getTime() + 86400000);
    return { d, n: recent.filter((r) => r.createdAt >= d && r.createdAt < next).length };
  });
  const max = Math.max(1, ...perDay.map((x) => x.n));

  return (
    <>
      <PageHeader title="Consultas" description="Registro de clics en los botones de WhatsApp de la web. La conversación sigue en WhatsApp; acá ves qué productos generan más interés." />

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <section className="card p-6">
          <p className="text-xs text-ink-400">Últimos 30 días</p>
          <p className="font-display text-5xl font-black text-white">{last30}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(TYPES).map(([k, label]) => (
              <li key={k} className="flex justify-between"><span className="text-ink-300">{label}</span><span className="font-semibold">{byType.find((b) => b.type === k)?._count._all ?? 0}</span></li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-500">Total histórico: {total}</p>
        </section>
        <section className="card p-6">
          <p className="mb-4 text-xs text-ink-400">Últimos 14 días</p>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Consultas por día">
            {perDay.map(({ d, n }) => (
              <div key={d.toISOString()} className="group flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-ink-400 opacity-0 group-hover:opacity-100">{n}</span>
                <div className="w-full rounded-t-md bg-brand-500/80 transition group-hover:bg-brand-400" style={{ height: `${(n / max) * 100}%`, minHeight: n ? 4 : 2 }} />
                <span className="text-[9px] text-ink-500">{d.getDate()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-ink-400">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Detalle</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((i) => (
              <tr key={i.id}>
                <td className="whitespace-nowrap px-4 py-2.5 text-ink-300">{i.createdAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Cordoba" })}</td>
                <td className="px-4 py-2.5">{TYPES[i.type] ?? i.type}</td>
                <td className="px-4 py-2.5 text-ink-200">
                  {i.product ? <Link href={`/admin/productos/${i.product.id}`} className="hover:text-brand-300">{i.product.name}</Link> : i.detail || "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-ink-400">Todavía no se registraron consultas.</td></tr>}
          </tbody>
        </table>
      </section>

      {user.role === "ADMIN" && total > 0 && (
        <form action={clearInquiriesAction} className="mt-4 flex justify-end">
          <input type="hidden" name="days" value="90" />
          <ConfirmButton message="¿Eliminar el registro de consultas de más de 90 días?" className="btn-ghost btn-sm">Limpiar registros de más de 90 días</ConfirmButton>
        </form>
      )}
    </>
  );
}
