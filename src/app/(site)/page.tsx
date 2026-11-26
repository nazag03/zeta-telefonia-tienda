import { getSettings } from "@/lib/settings";
import { getCategories, getCategoryCovers, getHomeData } from "@/lib/queries";
import { Hero } from "@/components/home/Hero";
import {
  Benefits, BrandStory, CategoryShowcase, FeaturedProducts, FinalCta, LocationSection, ProductRailSection, Spotlight, Testimonials, TradeInBanner,
  storyProducts,
} from "@/components/home/Sections";
import { SectionHeader } from "@/components/SectionHeader";
import { PromotionCard } from "@/components/promo/PromotionCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export default async function HomePage() {
  const [s, categories, covers, home] = await Promise.all([getSettings(), getCategories(), getCategoryCovers(), getHomeData()]);

  const homeCats = categories
    .filter((c) => c.showOnHome && c._count.products > 0)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, image: c.image, count: c._count.products, cover: covers.get(c.id) ?? null }));

  const featuredAll = home.featured.length ? home.featured : home.newest;
  
  const featured = featuredAll.length > 3 ? featuredAll.slice(0, Math.floor(featuredAll.length / 3) * 3) : featuredAll;
  
  const heroProduct = featuredAll.find((p) => /iphone\s*18\s*pro/i.test(p.name)) ?? featuredAll.find((p) => /iphone/i.test(p.name)) ?? featuredAll[0] ?? null;
  const spotlight = [...featuredAll].sort((a, b) => (b.variants?.length ?? 0) - (a.variants?.length ?? 0) || b.images.length - a.images.length)[0] ?? null;
  const spotlightOthers = featuredAll.filter((p) => p.id !== spotlight?.id && p.id !== heroProduct?.id).slice(0, 3);
  const newest = home.newest.filter((p) => !featured.some((f) => f.id === p.id));

  return (
    <>
      <Hero s={s} product={heroProduct} />
      <CategoryShowcase categories={homeCats} />
      <FeaturedProducts products={featured} whatsapp={s.whatsapp} />

      {home.promotions.length > 0 && (
        <section className="bg-white pt-24 sm:pt-32">
          <div className="container-x">
            <SectionHeader eyebrow="Promociones" title="Oportunidades del momento." href="/promociones" linkLabel="Ver todas" />
            <div className="grid gap-5 lg:grid-cols-2">
              {home.promotions.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <PromotionCard promo={p} whatsapp={s.whatsapp} showProductsLink />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductRailSection
        eyebrow="Ofertas"
        title="Precios especiales por tiempo limitado."
        products={home.offers}
        href="/catalogo?tag=oferta"
        linkLabel="Ver ofertas"
        whatsapp={s.whatsapp}
      />
      <ProductRailSection
        eyebrow="Usados seleccionados"
        title="Equipos usados, revisados y listos."
        text="iPhone y celulares usados con precio publicado. Aceptamos tu equipo en parte de pago."
        products={home.used}
        href="/catalogo?condicion=usado"
        linkLabel="Ver usados"
        whatsapp={s.whatsapp}
      />
      <Spotlight product={spotlight} others={spotlightOthers} whatsapp={s.whatsapp} />
      <TradeInBanner whatsapp={s.whatsapp} />
      {newest.length >= 4 && (
        <ProductRailSection
          eyebrow="Novedades"
          title="Últimos ingresos al local."
          products={newest}
          href="/catalogo?sort=nuevos"
          linkLabel="Ver novedades"
          whatsapp={s.whatsapp}
        />
      )}
      <Benefits items={s.benefits} businessName={s.businessName} />
      <BrandStory s={s} products={storyProducts([...featuredAll, ...home.newest, ...home.used])} />
      <Testimonials items={home.testimonials} />
      <LocationSection s={s} />
      <FinalCta s={s} />
    </>
  );
}
