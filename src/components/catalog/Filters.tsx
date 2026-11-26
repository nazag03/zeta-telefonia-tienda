"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { ChevronDown, Loader2, Search, X } from "lucide-react";

type Cat = { name: string; slug: string; count: number };

export const TAGS: Record<string, string> = { oferta: "Ofertas", nuevo: "Novedades", destacado: "Destacados" };

const SORTS = [
  { value: "relevancia", label: "Destacados" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

const CONDITIONS = [
  { value: "", label: "Nuevos y usados" },
  { value: "nuevo", label: "Sellados" },
  { value: "usado", label: "Usados" },
];

function useCatalogNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  function update(changes: Record<string, string | null>, basePath = pathname) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in changes)) next.delete("page");
    const qs = next.toString();
    start(() => router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }
  return { params, update, pending, pathname };
}

const pillCls = (on: boolean) => clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition", on ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line");
const pillBrandCls = (on: boolean) =>
  clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition", on ? "bg-brand-600 text-white" : "text-graphite ring-1 ring-inset ring-line hover:bg-mist");


export function CatalogBar({ categories, brands, activeCategory, total }: { categories: Cat[]; brands: string[]; activeCategory?: string; total: number }) {
  const { params, update, pending, pathname } = useCatalogNav();
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  const condition = params.get("condicion") ?? "";
  const tag = params.get("tag");
  const brand = params.get("marca");
  const stock = params.get("stock") === "1";
  const sort = params.get("sort") ?? "relevancia";
  const keep = (() => {
    const p = new URLSearchParams(params.toString());
    p.delete("page");
    const s = p.toString();
    return s ? `?${s}` : "";
  })();
  const hasFilters = Boolean(urlQ || tag || brand || stock || condition || params.get("min") || params.get("max"));

  return (
    <div className="below-header sticky z-30 -mx-4 mb-10 border-b border-line bg-white/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 xl:mx-0 xl:px-0">
          <Link href={`/catalogo${keep}`} scroll={false} className={pillCls(!activeCategory)}>Todo</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/catalogo/${c.slug}${keep}`} scroll={false} className={pillCls(activeCategory === c.slug)}>
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <form
            className="relative flex-1 xl:w-56 xl:flex-none"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: q.trim() || null });
            }}
          >
            <span className="sr-only">Buscar en el catálogo</span>
            {pending ? (
              <Loader2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-mute" />
            ) : (
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
            )}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => q.trim() !== urlQ && update({ q: q.trim() || null })}
              type="search"
              placeholder="Buscar…"
              aria-label="Buscar en el catálogo"
              className="w-full rounded-full bg-mist py-2 pl-10 pr-4 text-sm text-ink outline-none focus:ring-2 focus:ring-brand-200"
            />
          </form>
          <label className="relative">
            <span className="sr-only">Ordenar</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "relevancia" ? null : e.target.value })}
              className="appearance-none rounded-full bg-mist py-2 pl-4 pr-9 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-brand-200"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
          </label>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 xl:mx-0 xl:px-0">
        {CONDITIONS.map((c) => (
          <button key={c.label} type="button" className={pillBrandCls(condition === c.value)} onClick={() => update({ condicion: c.value || null })} aria-pressed={condition === c.value}>
            {c.label}
          </button>
        ))}
        <span className="mx-1 w-px shrink-0 self-stretch bg-line" />
        {Object.entries(TAGS).map(([value, label]) => (
          <button key={value} type="button" className={pillBrandCls(tag === value)} onClick={() => update({ tag: tag === value ? null : value })} aria-pressed={tag === value}>
            {label}
          </button>
        ))}
        <button type="button" className={pillBrandCls(stock)} onClick={() => update({ stock: stock ? null : "1" })} aria-pressed={stock}>
          Con stock
        </button>
        {brands.length > 1 && (
          <label className="relative shrink-0">
            <span className="sr-only">Marca</span>
            <select
              value={brand ?? ""}
              onChange={(e) => update({ marca: e.target.value || null })}
              className={clsx(
                "appearance-none rounded-full py-2 pl-4 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-200",
                brand ? "bg-brand-600 text-white" : "text-graphite ring-1 ring-inset ring-line"
              )}
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className={clsx("pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2", brand ? "text-white" : "text-mute")} />
          </label>
        )}
      </div>

      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-mute">{total} {total === 1 ? "resultado" : "resultados"}</span>
          {urlQ && (
            <button type="button" className="tag bg-mist text-graphite hover:bg-line" onClick={() => update({ q: null })}>
              “{urlQ}” <X className="size-3" />
            </button>
          )}
          {brand && (
            <button type="button" className="tag bg-mist text-graphite hover:bg-line" onClick={() => update({ marca: null })}>
              {brand} <X className="size-3" />
            </button>
          )}
          <Link href={pathname} scroll={false} className="ml-1 font-medium text-brand-700 hover:underline">Limpiar filtros</Link>
        </div>
      )}
    </div>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { update } = useCatalogNav();
  if (pages <= 1) return null;
  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Paginación">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => {
            update({ page: n === 1 ? null : String(n) });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-current={n === page ? "page" : undefined}
          className={clsx("grid size-11 place-items-center rounded-full text-sm font-semibold transition", n === page ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line")}
        >
          {n}
        </button>
      ))}
    </nav>
  );
}
