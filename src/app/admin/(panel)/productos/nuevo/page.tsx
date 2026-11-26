import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireUser();
  const [cats, all] = await Promise.all([db.categories.all(), db.products.all()]);
  const categories = sortBy(cats, ["order", "asc"], ["name", "asc"]).map((c) => ({ id: c.id, name: c.name }));
  const brands = sortBy([...new Set(all.map((p) => p.brand))], [(b) => b, "asc"]).map((brand) => ({ brand }));
  return (
    <>
      <PageHeader title="Nuevo producto" description="Completá los datos y publicalo en la web." />
      <ProductForm categories={categories} brands={brands.map((b) => b.brand)} />
    </>
  );
}
