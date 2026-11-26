import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug as getCategory } from "@/lib/queries";
import { CatalogView, type SP } from "@/components/catalog/CatalogView";

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const c = await getCategory((await params).categoria);
  if (!c) return { title: "Categoría no encontrada" };
  return {
    title: c.name,
    description: c.description || `${c.name} en Zeta Telefonía, San Francisco. Consultá precios y disponibilidad.`,
    alternates: { canonical: `/catalogo/${c.slug}` },
    openGraph: c.image ? { images: [c.image] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ categoria: string }>; searchParams: Promise<SP> }) {
  const c = await getCategory((await params).categoria);
  if (!c) notFound();
  return <CatalogView searchParams={await searchParams} category={c.slug} title={c.name} description={c.description} />;
}
