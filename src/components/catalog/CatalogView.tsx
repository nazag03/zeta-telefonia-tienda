import Link from "next/link";
import { Suspense } from "react";
import { getBrands, getCatalog, getCategories, type CatalogFilters as F } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { ProductGrid } from "../product/ProductCard";
import { WaButton } from "../WaButton";
import { CatalogBar, Pagination, TAGS } from "./Filters";

export type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined);

export function parseFilters(sp: SP, category?: string): F {
  const tag = one(sp.tag);
  const sort = one(sp.sort);
  const condition = one(sp.condicion);
  return {
    q: one(sp.q)?.slice(0, 80),
    category,
    brand: one(sp.marca),
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    tag: tag === "nuevo" || tag === "oferta" || tag === "destacado" ? tag : undefined,
    condition: condition === "nuevo" || condition === "usado" ? condition : undefined,
    stock: one(sp.stock) === "1",
    sort: (["precio-asc", "precio-desc", "nuevos", "nombre"] as const).find((s) => s === sort) ?? "relevancia",
    page: num(one(sp.page)),
  };
}

export async function CatalogView({ searchParams, category, title, description }: { searchParams: SP; category?: string; title: string; description?: string | null }) {
  const filters = parseFilters(searchParams, category);
  const [result, categories, brands, s] = await Promise.all([getCatalog(filters), getCategories(), getBrands(), getSettings()]);

  
  const heading = category
    ? title
    : filters.tag
      ? TAGS[filters.tag]
      : filters.condition === "usado"
        ? "Equipos usados"
        : filters.condition === "nuevo"
          ? "Equipos sellados"
          : filters.q
            ? `Resultados para “${filters.q}”`
            : title;
  const subtitle =
    description ??
    (filters.condition === "usado"
      ? "iPhone y celulares usados, revisados y con precio publicado. Aceptamos tu equipo en parte de pago."
      : "iPhone, celulares de todas las marcas y accesorios. Consultá precio y disponibilidad por WhatsApp.");

  return (
    <div className="pb-24 pt-28 sm:pt-36">
      <div className="container-x">
        <header className="mb-10 max-w-3xl sm:mb-14">
          <nav className="mb-5 text-sm text-mute" aria-label="Migas de pan">
            <Link href="/" className="hover:text-ink">Inicio</Link>
            <span className="mx-2">/</span>
            {category ? (
              <>
                <Link href="/catalogo" className="hover:text-ink">Catálogo</Link>
                <span className="mx-2">/</span>
                <span className="text-ink">{title}</span>
              </>
            ) : (
              <span className="text-ink">Catálogo</span>
            )}
          </nav>
          <h1 className="display-2">{heading}</h1>
          <p className="mt-4 text-lg text-mute">{subtitle}</p>
        </header>

        <Suspense>
          <CatalogBar
            categories={categories.filter((c) => c._count.products > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.products }))}
            brands={brands}
            activeCategory={category}
            total={result.total}
          />
        </Suspense>

        {result.items.length > 0 ? (
          <>
            <ProductGrid products={result.items} whatsapp={s.whatsapp} />
            <Suspense>
              <Pagination page={result.page} pages={result.pages} />
            </Suspense>
          </>
        ) : (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="text-2xl font-semibold tracking-tight">No encontramos productos</p>
            <p className="mt-2 text-mute">Probá con otros filtros o escribinos: muchas veces tenemos equipos que todavía no están publicados.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/catalogo" className="pill-dark">Ver todo el catálogo</Link>
              <WaButton number={s.whatsapp} message="Hola! Estoy buscando un producto que no encontré en la web." detail="Catálogo sin resultados">
                Consultar
              </WaButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
