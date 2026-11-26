import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryRow } from "@/components/admin/CategoryRow";

export const metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  await requireUser();
  const [cats, products] = await Promise.all([db.categories.all(), db.products.all()]);
  const categories = sortBy(cats, ["order", "asc"], ["name", "asc"]).map((c) => ({
    ...c,
    _count: { products: products.filter((p) => p.categoryId === c.id).length },
  }));
  return (
    <>
      <PageHeader title="Categorías" description="Organizá el catálogo. Los cambios se reflejan al instante en el menú y la portada." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-3">
          {categories.map((c) => (
            <CategoryRow key={c.id} c={c} />
          ))}
          {categories.length === 0 && <li className="card p-8 text-center text-ink-400">Todavía no hay categorías.</li>}
        </ul>
        <section className="card h-fit p-6 lg:sticky lg:top-8">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Nueva categoría</h2>
          <CategoryForm />
        </section>
      </div>
    </>
  );
}
