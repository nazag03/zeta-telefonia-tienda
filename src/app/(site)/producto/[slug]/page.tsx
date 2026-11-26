import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CreditCard, RefreshCcw, Store, Wrench } from "lucide-react";
import { getProductBySlug, getRelated } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { displayPrice, mainAmount, parseSpecs, siteUrl } from "@/lib/format";
import { ProductMain } from "@/components/product/ProductMain";
import { ProductCard } from "@/components/product/ProductCard";
import { Accordion } from "@/components/product/Accordion";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [p, s] = await Promise.all([getProductBySlug((await params).slug), getSettings()]);
  if (!p) return { title: "Producto no encontrado" };
  const price = displayPrice(p);
  const description = (p.shortDescription || p.description || `${p.name} en ${s.businessName}.`).slice(0, 155);
  return {
    title: p.name,
    description: `${price} · ${description}`,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: {
      type: "website",
      title: `${p.name} · ${price}`,
      description,
      url: `/producto/${p.slug}`,
      images: p.images.length ? p.images.slice(0, 1).map((i) => ({ url: i.url, alt: p.name })) : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [s, related] = await Promise.all([getSettings(), getRelated(p)]);
  const specs = parseSpecs(p.specs);
  const url = siteUrl(`/producto/${p.slug}`);
  const out = p.availability === "OUT_OF_STOCK";
  const main = mainAmount(p);
  const isPhone = /iphone|celular|samsung|motorola|xiaomi/i.test(`${p.category?.slug ?? ""} ${p.name}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    model: p.model || undefined,
    category: p.category?.name,
    description: p.shortDescription || p.description || undefined,
    image: p.images.map((i) => siteUrl(i.url)),
    sku: p.id,
    itemCondition: p.condition === "NEW" ? "https://schema.org/NewCondition" : p.condition === "USED" ? "https://schema.org/UsedCondition" : "https://schema.org/RefurbishedCondition",
    ...(main
      ? {
          offers: {
            "@type": "Offer",
            price: main.final,
            priceCurrency: main.currency,
            availability: out ? "https://schema.org/OutOfStock" : p.availability === "ON_ORDER" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
            url,
            seller: { "@type": "Organization", name: s.businessName },
          },
        }
      : {}),
  };

  const benefits = [
    { Icon: BadgeCheck, title: "Equipos originales.", text: "Importadores directos, sin intermediarios." },
    { Icon: Store, title: "Retiro en el local", text: `en ${s.address}, ${s.city}.` },
    ...(isPhone ? [{ Icon: RefreshCcw, title: "Plan canje.", text: "Entregá tu usado como parte de pago." }] : []),
    { Icon: CreditCard, title: "Financiación.", text: "Consultá las opciones, incluso con recibo de sueldo." },
    ...(isPhone ? [{ Icon: Wrench, title: "Servicio técnico propio.", text: "Te acompañamos también después de la compra." }] : []),
  ];

  const sections = [
    ...(p.description
      ? [
          {
            id: "descripcion",
            title: "Descripción",
            content: (
              <div className="space-y-4 text-[0.98rem] leading-relaxed text-graphite">
                {p.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(specs.length
      ? [
          {
            id: "caracteristicas",
            title: "Características",
            content: (
              <dl>
                {specs.map((sp, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 border-b border-line/70 py-3 text-[0.92rem] last:border-0">
                    <dt className="text-mute">{sp.label}</dt>
                    <dd className="col-span-2">{sp.value}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="pb-32 pt-28 sm:pt-36 lg:pb-24">
      <div className="container-x">
        <nav className="mb-6 text-sm text-mute" aria-label="Migas de pan">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={p.category ? `/catalogo/${p.category.slug}` : "/catalogo"} className="hover:text-ink">{p.category?.name ?? "Catálogo"}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{p.name}</span>
        </nav>

        <ProductMain
          p={{
            id: p.id, slug: p.slug, name: p.name, brand: p.brand, model: p.model, shortDescription: p.shortDescription,
            availability: p.availability, condition: p.condition, isNew: p.isNew, isOffer: p.isOffer, isFeatured: p.isFeatured,
            price: p.price, promoPrice: p.promoPrice, priceUsd: p.priceUsd, promoPriceUsd: p.promoPriceUsd, currency: p.currency,
            images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
            variants: p.variants ?? [],
          }}
          whatsapp={s.whatsapp}
          url={url}
        >
          <ul className="mt-8 divide-y divide-line rounded-3xl bg-mist/70 px-5">
            {benefits.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-center gap-4 py-4 text-sm">
                <Icon className="size-5 shrink-0 text-brand-600" strokeWidth={1.75} />
                <span><strong className="font-semibold">{title}</strong> {text}</span>
              </li>
            ))}
          </ul>

          {sections.length > 0 && (
            <div className="mt-10">
              <Accordion sections={sections} />
            </div>
          )}
        </ProductMain>
      </div>

      {related.length > 0 && (
        <section className="mt-28 border-t border-line pt-20">
          <div className="container-x">
            <h2 className="display-3 mb-10">También te puede interesar</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} whatsapp={s.whatsapp} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
