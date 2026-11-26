import type { Metadata } from "next";
import { CatalogView, type SP } from "@/components/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "iPhone, Samsung, Motorola, Xiaomi, auriculares, parlantes, cargadores y accesorios. Consultá precios y disponibilidad.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  return <CatalogView searchParams={await searchParams} title="Catálogo" description="Explorá todos nuestros productos y consultá por WhatsApp en un clic." />;
}
