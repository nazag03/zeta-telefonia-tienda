import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, MessagesSquare, Package, Plus, Star, Tag, XCircle, FolderTree } from "lucide-react";
import { db, inquiries, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { daysAgo, displayPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser();
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);

  const [products, categories, promotions, recentInquiries] = await Promise.all([
    db.products.all(),
    db.categories.count(),
    db.promotions.count((p) => p.active),
    inquiries.since(since30),
  ]);

  const total = products.length;
  const active = products.filter((p) => p.active).length;
  const inactive = total - active;
  const available = products.filter((p) => p.active && ["IN_STOCK", "LOW_STOCK", "ON_ORDER"].includes(p.availability)).length;
  const outOfStock = products.filter((p) => p.availability === "OUT_OF_STOCK").length;
  const low = products.filter((p) => p.availability === "LOW_STOCK").length;
  const featured = products.filter((p) => p.isFeatured && p.active).length;
  const offers = products.filter((p) => p.active && (p.isOffer || p.promoPrice != null || p.promoPriceUsd != null)).length;
  const inq30 = recentInquiries.length;
  const inq7 = recentInquiries.filter((i) => i.createdAt >= since7).length;

  const byUpdated = sortBy([...products], ["updatedAt", "desc"]);
  const firstImage = (p: (typeof products)[number]) => sortBy([...(p.images ?? [])], ["order", "asc"]).slice(0, 1);
  const recent = byUpdated.slice(0, 6).map((p) => ({ ...p, images: firstImage(p) }));
  const attention = byUpdated
    .filter((p) => p.active && (p.availability === "OUT_OF_STOCK" || p.availability === "LOW_STOCK" || !p.images?.length))
    .slice(0, 8)
    .map((p) => ({ ...p, _count: { images: p.images?.length ?? 0 } }));

  
  const counts = new Map<string, number>();
  for (const i of recentInquiries) if (i.productId) counts.set(i.productId, (counts.get(i.productId) ?? 0) + 1);
  const byId = new Map(products.map((p) => [p.id, p]));
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .flatMap(([pid, count]) => {
      const p = byId.get(pid);
      return p ? [{ count, product: { id: p.id, name: p.name } }] : [];
    })
    .slice(0, 5);

  const stats = [
    { label: "Publicados", value: active, Icon: Eye, tone: "text-brand-300", href: "/admin/productos?estado=activos" },
    { label: "Disponibles", value: available, Icon: CheckCircle2, tone: "text-emerald-400", href: "/admin/productos?stock=disponible" },
    { label: "Sin stock", value: outOfStock, Icon: XCircle, tone: "text-red-400", href: "/admin/productos?stock=sin-stock" },
    { label: "Destacados", value: featured, Icon: Star, tone: "text-amber-300", href: "/admin/productos?tag=destacado" },
    { label: "Consultas (30 días)", value: inq30, Icon: MessagesSquare, tone: "text-[#25D366]", href: "/admin/consultas" },
  ];

  return (
    <>
      <PageHeader title={`Hola, ${user.name.split(" ")[0]}`} description="Resumen general de la tienda.">
        <Link href="/admin/productos/nuevo" className="btn-primary"><Plus className="h-4 w-4" /> Nuevo producto</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, Icon, tone, href }) => (
          <Link key={label} href={href} className="card group p-5 transition hover:border-white/20">
            <Icon className={`h-5 w-5 ${tone}`} />
            <p className="mt-4 font-display text-4xl font-black text-white">{value}</p>
            <p className="text-xs text-ink-400 group-hover:text-ink-200">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Resumen del catálogo</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {[
              ["Productos totales", total],
              ["Ocultos", inactive],
              ["Últimas unidades", low],
              ["En oferta", offers],
              ["Categorías", categories],
              ["Promos activas", promotions],
              ["Consultas (7 días)", inq7],
              ["Consultas (30 días)", inq30],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-white/[.03] p-3">
                <dt className="text-xs text-ink-400">{k}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/admin/categorias" className="btn-ghost btn-sm"><FolderTree className="h-4 w-4" /> Categorías</Link>
            <Link href="/admin/promociones/nuevo" className="btn-ghost btn-sm"><Tag className="h-4 w-4" /> Nueva promoción</Link>
            <Link href="/admin/productos#precios" className="btn-ghost btn-sm"><Package className="h-4 w-4" /> Ajustar precios</Link>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Más consultados</h2>
          {top.length ? (
            <ol className="space-y-3">
              {top.map((t, i) => (
                <li key={t.product!.id} className="flex items-center gap-3 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-xs font-bold text-brand-300">{i + 1}</span>
                  <Link href={`/admin/productos/${t.product!.id}`} className="min-w-0 flex-1 truncate hover:text-brand-300">{t.product!.name}</Link>
                  <span className="text-xs text-ink-400">{t.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-400">Todavía no hay consultas registradas por producto. Se registran cada vez que un cliente toca “Consultar por WhatsApp”.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Últimos modificados</h2>
          {recent.length ? (
            <ul className="divide-y divide-white/5">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                    {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                  </div>
                  <Link href={`/admin/productos/${p.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-brand-300">{p.name}</Link>
                  <span className="text-sm font-semibold">{displayPrice(p)}</span>
                  {!p.active && <EyeOff className="h-4 w-4 text-ink-500" aria-label="Oculto" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-ink-400">
              Aún no hay productos. <Link href="/admin/productos/nuevo" className="text-brand-300 hover:underline">Cargá el primero</Link>.
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-extrabold uppercase"><AlertTriangle className="h-5 w-5 text-amber-400" /> Requieren atención</h2>
          {attention.length ? (
            <ul className="divide-y divide-white/5">
              {attention.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/productos/${p.id}`} className="min-w-0 truncate hover:text-brand-300">{p.name}</Link>
                  <span className="shrink-0 text-xs text-ink-400">
                    {p.availability === "OUT_OF_STOCK" ? "Sin stock" : p.availability === "LOW_STOCK" ? "Últimas unidades" : ""}
                    {p._count.images === 0 && " · Sin fotos"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-400">Todo en orden: no hay productos publicados sin stock ni sin fotos.</p>
          )}
        </section>
      </div>
    </>
  );
}
