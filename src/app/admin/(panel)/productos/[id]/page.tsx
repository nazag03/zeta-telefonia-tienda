import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db, inquiries as inquiriesDb, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseSpecs } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Editar producto" };

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireUser();
  const [found, cats, all, inquiries] = await Promise.all([
    db.products.get(params.id),
    db.categories.all(),
    db.products.all(),
    inquiriesDb.count({ productId: params.id }),
  ]);
  if (!found) notFound();
  const product = { ...found, images: sortBy([...(found.images ?? [])], ["order", "asc"]) };
  const categories = sortBy(cats, ["order", "asc"], ["name", "asc"]).map((c) => ({ id: c.id, name: c.name }));
  const brands = sortBy([...new Set(all.map((p) => p.brand))], [(b) => b, "asc"]).map((brand) => ({ brand }));

  return (
    <>
      <PageHeader title="Editar producto" description={`${product.name} · ${inquiries} ${inquiries === 1 ? "consulta registrada" : "consultas registradas"}`}>
        {product.active && (
          <Link href={`/producto/${product.slug}`} target="_blank" className="btn-ghost"><ExternalLink className="h-4 w-4" /> Ver en la web</Link>
        )}
      </PageHeader>
      <ProductForm
        product={{ ...product, specs: parseSpecs(product.specs), images: product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })) }}
        categories={categories}
        brands={brands.map((b) => b.brand)}
      />
    </>
  );
}
