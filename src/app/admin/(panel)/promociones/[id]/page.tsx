import { notFound } from "next/navigation";
import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Promoción" };


function toLocalInput(d: Date | null) {
  if (!d) return null;
  return new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 16);
}

export default async function PromotionEditor(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireUser();
  const isNew = params.id === "nuevo";
  const [promo, all] = await Promise.all([isNew ? null : db.promotions.get(params.id), db.products.all()]);
  if (!isNew && !promo) notFound();
  const products = sortBy(all, ["active", "desc"], ["name", "asc"]).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    promoPrice: p.promoPrice,
    priceUsd: p.priceUsd,
    promoPriceUsd: p.promoPriceUsd,
    currency: p.currency,
    active: p.active,
    images: sortBy([...(p.images ?? [])], ["order", "asc"]).slice(0, 1).map((i) => ({ url: i.url })),
  }));

  return (
    <>
      <PageHeader title={isNew ? "Nueva promoción" : "Editar promoción"} description="Elegí qué productos aparecen en la sección de promociones." />
      <PromotionForm
        products={products.map(({ images, ...p }) => ({ ...p, image: images[0]?.url ?? null }))}
        promotion={
          promo
            ? {
                ...promo,
                startsAt: toLocalInput(promo.startsAt),
                endsAt: toLocalInput(promo.endsAt),
                productIds: promo.productIds ?? [],
              }
            : undefined
        }
      />
    </>
  );
}
