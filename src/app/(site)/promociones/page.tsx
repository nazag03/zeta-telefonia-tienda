import type { Metadata } from "next";
import Link from "next/link";
import { getActivePromotions, getCatalog } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { PromotionCard } from "@/components/promo/PromotionCard";
import { ProductGrid } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { WaButton } from "@/components/WaButton";
import { TradeInBanner } from "@/components/home/Sections";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Promociones",
  description: "Ofertas, combos, descuentos y últimos ingresos en celulares y accesorios.",
  alternates: { canonical: "/promociones" },
};

export default async function PromotionsPage() {
  const [s, promotions, offers] = await Promise.all([getSettings(), getActivePromotions(), getCatalog({ tag: "oferta", sort: "precio-asc" })]);
  const empty = promotions.length === 0 && offers.items.length === 0;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink pb-20 pt-36 text-white sm:pb-28 sm:pt-44">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[120px]" />
        <div className="container-x">
          <Reveal><p className="kicker text-brand-300">Promociones</p></Reveal>
          <Reveal delay={60}><h1 className="display-1 mt-4 max-w-4xl text-balance">Oportunidades {s.businessName}.</h1></Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/65">
              Descuentos, combos y precios especiales por tiempo limitado. Las promociones están sujetas a stock disponible.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-x py-24 sm:py-28">
        {promotions.length > 0 && (
          <section className="mb-24 space-y-14">
            {promotions.map((promo, i) => (
              <Reveal key={promo.id} delay={50} className="space-y-10">
                <PromotionCard promo={promo} whatsapp={s.whatsapp} large={i === 0} />
                {promo.products.length > 0 && <ProductGrid products={promo.products.map((pp) => pp.product)} whatsapp={s.whatsapp} />}
              </Reveal>
            ))}
          </section>
        )}

        {offers.items.length > 0 && (
          <section>
            <SectionHeader eyebrow="Con descuento" title="Productos en oferta." href="/catalogo?tag=oferta" />
            <ProductGrid products={offers.items} whatsapp={s.whatsapp} />
          </section>
        )}

        {empty && (
          <div className="mx-auto max-w-lg py-6 text-center">
            <p className="text-2xl font-semibold tracking-tight">Pronto, nuevas promociones</p>
            <p className="mt-2 text-mute">En este momento no hay promociones publicadas. Escribinos y te contamos las oportunidades disponibles hoy.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <WaButton number={s.whatsapp} message="Hola! Quería consultar si tienen alguna promoción vigente." detail="Promociones vacías" />
              <Link href="/catalogo" className="pill-ghost">Ver catálogo</Link>
            </div>
          </div>
        )}
      </div>

      <div className="pb-24">
        <TradeInBanner whatsapp={s.whatsapp} />
      </div>
    </div>
  );
}
