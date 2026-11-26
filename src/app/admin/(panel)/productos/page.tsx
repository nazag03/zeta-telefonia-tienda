import Image from "next/image";
import Link from "next/link";
import { Copy, ExternalLink, Pencil, Plus, Search, Trash2, ImageOff } from "lucide-react";
import { db, sortBy, type Product } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CONDITION } from "@/lib/format";
import { ConfirmButton, PageHeader } from "@/components/admin/ui";
import { QuickAvailability, QuickPrice, QuickToggle } from "@/components/admin/QuickEdit";
import { BulkPriceForm } from "@/components/admin/BulkPriceForm";
import { deleteProductAction, duplicateProductAction } from "../../actions/products";

export const metadata = { title: "Productos" };

type SP = { q?: string; categoria?: string; estado?: string; stock?: string; tag?: string };

export default async function AdminProducts(props: { searchParams: Promise<SP> }) {
  const searchParams = await props.searchParams;
  await requireUser();
  const filters: ((p: Product) => boolean)[] = [];
  const q = searchParams.q?.trim();
  const norm = (s: string | null) => (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (q) filters.push((p) => [p.name, p.brand, p.model].some((f) => norm(f).includes(norm(q))));
  if (searchParams.categoria === "sin") filters.push((p) => !p.categoryId);
  else if (searchParams.categoria) filters.push((p) => p.categoryId === searchParams.categoria);
  if (searchParams.estado === "activos") filters.push((p) => p.active);
  if (searchParams.estado === "ocultos") filters.push((p) => !p.active);
  if (searchParams.stock === "sin-stock") filters.push((p) => p.availability === "OUT_OF_STOCK");
  if (searchParams.stock === "disponible") filters.push((p) => p.availability !== "OUT_OF_STOCK");
  if (searchParams.tag === "destacado") filters.push((p) => p.isFeatured);
  if (searchParams.tag === "oferta") filters.push((p) => p.isOffer || p.promoPrice != null || p.promoPriceUsd != null);
  if (searchParams.tag === "nuevo") filters.push((p) => p.isNew);

  const [all, cats] = await Promise.all([db.products.all(), db.categories.all()]);
  const catById = new Map(cats.map((c) => [c.id, c]));
  const categories = sortBy([...cats], ["order", "asc"], ["name", "asc"]).map((c) => ({ id: c.id, name: c.name }));
  const products = sortBy(all.filter((p) => filters.every((f) => f(p))), ["updatedAt", "desc"])
    .slice(0, 500)
    .map((p) => {
      const c = p.categoryId ? catById.get(p.categoryId) : null;
      return {
        ...p,
        images: sortBy([...(p.images ?? [])], ["order", "asc"]).slice(0, 1),
        category: c ? { name: c.name } : null,
      };
    });

  return (
    <>
      <PageHeader title="Productos" description={`${products.length} ${products.length === 1 ? "producto" : "productos"}. Los precios y la disponibilidad se pueden editar directo en la tabla.`}>
        <Link href="/admin/productos/nuevo" className="btn-primary"><Plus className="h-4 w-4" /> Nuevo producto</Link>
      </PageHeader>

      <form className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input name="q" defaultValue={q} placeholder="Buscar por nombre, marca o modelo" className="input pl-9" aria-label="Buscar" />
        </div>
        <select name="categoria" defaultValue={searchParams.categoria ?? ""} className="input" aria-label="Categoría">
          <option value="">Todas las categorías</option>
          <option value="sin">Sin categoría</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <select name="estado" defaultValue={searchParams.estado ?? ""} className="input" aria-label="Estado">
          <option value="">Publicados y ocultos</option>
          <option value="activos">Solo publicados</option>
          <option value="ocultos">Solo ocultos</option>
        </select>
        <select name="stock" defaultValue={searchParams.stock ?? ""} className="input" aria-label="Stock">
          <option value="">Cualquier stock</option>
          <option value="disponible">Con stock</option>
          <option value="sin-stock">Sin stock</option>
        </select>
        <select name="tag" defaultValue={searchParams.tag ?? ""} className="input" aria-label="Etiqueta">
          <option value="">Todas las etiquetas</option>
          <option value="destacado">Destacados</option>
          <option value="oferta">En oferta</option>
          <option value="nuevo">Nuevos</option>
        </select>
        <button className="btn-ghost">Filtrar</button>
      </form>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-300">No hay productos con esos filtros.</p>
          <Link href="/admin/productos/nuevo" className="btn-primary mt-4"><Plus className="h-4 w-4" /> Cargar producto</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-3 py-3 font-semibold">Precio</th>
                <th className="px-3 py-3 font-semibold">Promo</th>
                <th className="px-3 py-3 font-semibold">Disponibilidad</th>
                <th className="px-3 py-3 text-center font-semibold">Publicado</th>
                <th className="px-3 py-3 text-center font-semibold">Destacado</th>
                <th className="px-3 py-3 text-center font-semibold">Nuevo</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-800">
                        {p.images[0] ? <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" /> : <ImageOff className="h-4 w-4 text-ink-500" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/productos/${p.id}`} className="block max-w-[260px] truncate font-semibold text-white hover:text-brand-300">{p.name}</Link>
                        <p className="text-xs text-ink-400">
                          {p.brand} · {p.category?.name ?? "Sin categoría"} {p.condition !== "NEW" && `· ${CONDITION[p.condition]}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-6 text-[10px] ${p.currency !== "USD" ? "font-bold text-white" : "text-ink-400"}`} title={p.currency !== "USD" ? "Moneda principal" : undefined}>$</span>
                        <QuickPrice key={`p-${p.price}`} id={p.id} field="price" value={p.price} placeholder="—" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-6 text-[10px] ${p.currency === "USD" ? "font-bold text-white" : "text-ink-400"}`} title={p.currency === "USD" ? "Moneda principal" : undefined}>US$</span>
                        <QuickPrice key={`pu-${p.priceUsd}`} id={p.id} field="priceUsd" value={p.priceUsd} placeholder="—" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1.5">
                      <QuickPrice key={`pp-${p.promoPrice}`} id={p.id} field="promoPrice" value={p.promoPrice} placeholder="—" />
                      <QuickPrice key={`ppu-${p.promoPriceUsd}`} id={p.id} field="promoPriceUsd" value={p.promoPriceUsd} placeholder="—" />
                    </div>
                  </td>
                  <td className="px-3 py-3"><QuickAvailability id={p.id} value={p.availability} /></td>
                  <td className="px-3 py-3 text-center"><QuickToggle id={p.id} field="active" value={p.active} label="Publicado" /></td>
                  <td className="px-3 py-3 text-center"><QuickToggle id={p.id} field="isFeatured" value={p.isFeatured} label="Destacado" /></td>
                  <td className="px-3 py-3 text-center"><QuickToggle id={p.id} field="isNew" value={p.isNew} label="Nuevo" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/productos/${p.id}`} className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white" title="Editar"><Pencil className="h-4 w-4" /></Link>
                      {p.active && <Link href={`/producto/${p.slug}`} target="_blank" className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white" title="Ver en la web"><ExternalLink className="h-4 w-4" /></Link>}
                      <form action={duplicateProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white" title="Duplicar"><Copy className="h-4 w-4" /></button>
                      </form>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`} className="rounded-lg p-2 text-ink-300 hover:bg-red-500/15 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section id="precios" className="card mt-8 scroll-mt-8 p-6">
        <h2 className="font-display text-lg font-extrabold uppercase">Ajuste masivo de precios</h2>
        <p className="mb-4 mt-1 text-sm text-ink-400">Aumentá o reducí por porcentaje los precios de una categoría o de todo el catálogo. Útil para actualizaciones por inflación o tipo de cambio.</p>
        <BulkPriceForm categories={categories} />
      </section>
    </>
  );
}
