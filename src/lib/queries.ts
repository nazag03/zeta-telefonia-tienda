import "server-only";
import { cache } from "react";
import { db, sortBy, type Category, type Product, type ProductImage } from "./db";
import { effectivePrice, hasPromo } from "./format";



export type ProductCardData = Product & { category: { name: string; slug: string } | null };

const sortedImages = (p: Product): ProductImage[] => sortBy([...(p.images ?? [])], ["order", "asc"]);


async function visibleProducts() {
  const [products, categories] = await Promise.all([db.products.all(), db.categories.all()]);
  const cats = new Map(categories.map((c) => [c.id, c]));
  const visible = products.filter((p) => {
    if (!p.active) return false;
    const c = p.categoryId ? cats.get(p.categoryId) : null;
    return !c || c.active;
  });
  return { visible, cats };
}

function toCard(p: Product, cats: Map<string, Category>): ProductCardData {
  const c = p.categoryId ? cats.get(p.categoryId) : null;
  return { ...p, images: sortedImages(p).slice(0, 2), category: c ? { name: c.name, slug: c.slug } : null };
}


const norm = (s: string | null | undefined) => (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();



export const getCategories = cache(async () => {
  const [categories, products] = await Promise.all([db.categories.all(), db.products.all()]);
  const counts = new Map<string, number>();
  for (const p of products) if (p.active && p.categoryId) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  const active = sortBy(categories.filter((c) => c.active), ["order", "asc"], ["name", "asc"]);
  return active.map((c) => ({ ...c, _count: { products: counts.get(c.id) ?? 0 } }));
});

export const getBrands = cache(async () => {
  const { visible } = await visibleProducts();
  return sortBy([...new Set(visible.map((p) => p.brand).filter(Boolean))], [(b) => b, "asc"]);
});

export type CatalogFilters = {
  q?: string;
  category?: string;
  brand?: string;
  min?: number;
  max?: number;
  tag?: "nuevo" | "oferta" | "destacado";
  
  condition?: "nuevo" | "usado";
  stock?: boolean;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "nuevos" | "nombre";
  page?: number;
};

export const PAGE_SIZE = 24;

export async function getCatalog(f: CatalogFilters) {
  const { visible, cats } = await visibleProducts();
  let items = visible.map((p) => toCard(p, cats));

  if (f.q) {
    const terms = f.q.trim().split(/\s+/).slice(0, 6).map(norm).filter(Boolean);
    items = items.filter((p) => {
      const haystack = [p.name, p.brand, p.model, p.shortDescription, p.category?.name].map(norm);
      return terms.every((t) => haystack.some((h) => h.includes(t)));
    });
  }
  if (f.category) items = items.filter((p) => p.category?.slug === f.category);
  if (f.brand) items = items.filter((p) => p.brand === f.brand);
  if (f.tag === "nuevo") items = items.filter((p) => p.isNew);
  if (f.tag === "destacado") items = items.filter((p) => p.isFeatured);
  if (f.condition === "nuevo") items = items.filter((p) => p.condition === "NEW");
  if (f.condition === "usado") items = items.filter((p) => p.condition !== "NEW");
  if (f.stock) items = items.filter((p) => p.availability !== "OUT_OF_STOCK");
  if (f.tag === "oferta") items = items.filter((p) => p.isOffer || hasPromo(p));
  if (f.min != null) items = items.filter((p) => (effectivePrice(p) ?? -Infinity) >= f.min!);
  if (f.max != null) items = items.filter((p) => (effectivePrice(p) ?? Infinity) <= f.max!);

  sortBy(items, ["order", "asc"], ["createdAt", "desc"]);

  const outLast = (a: ProductCardData, b: ProductCardData) =>
    Number(a.availability === "OUT_OF_STOCK") - Number(b.availability === "OUT_OF_STOCK");

  switch (f.sort) {
    case "precio-asc":
      
      items.sort((a, b) => (effectivePrice(a) ?? Infinity) - (effectivePrice(b) ?? Infinity));
      break;
    case "precio-desc":
      items.sort((a, b) => (effectivePrice(b) ?? -Infinity) - (effectivePrice(a) ?? -Infinity));
      break;
    case "nuevos":
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "nombre":
      items.sort((a, b) => a.name.localeCompare(b.name, "es"));
      break;
    default:
      items.sort((a, b) => outLast(a, b) || Number(b.isFeatured) - Number(a.isFeatured));
  }

  const total = items.length;
  const page = Math.max(1, f.page || 1);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, pages };
}

export const getCategoryBySlug = cache(async (slug: string) => {
  return db.categories.find((c) => c.slug === slug && c.active);
});

export const getProductBySlug = cache(async (slug: string) => {
  const { visible, cats } = await visibleProducts();
  const p = visible.find((x) => x.slug === slug);
  if (!p) return null;
  return { ...p, images: sortedImages(p), category: (p.categoryId && cats.get(p.categoryId)) || null };
});

export async function getRelated(p: { id: string; categoryId: string | null; brand: string }, take = 4) {
  const { visible, cats } = await visibleProducts();
  const items = sortBy(
    visible.filter((x) => x.id !== p.id && (!p.categoryId || x.categoryId === p.categoryId || x.brand === p.brand)),
    ["isFeatured", "desc"],
    ["createdAt", "desc"]
  )
    .slice(0, take * 2)
    .map((x) => toCard(x, cats));
  
  items.sort((a, b) => Number(b.categoryId === p.categoryId) - Number(a.categoryId === p.categoryId));
  return items.slice(0, take);
}


export const getCategoryCovers = cache(async () => {
  const { visible } = await visibleProducts();
  const covers = new Map<string, string>();
  for (const p of sortBy([...visible], ["isFeatured", "desc"], ["order", "asc"], ["updatedAt", "desc"])) {
    const img = sortedImages(p)[0];
    if (p.categoryId && img && !covers.has(p.categoryId)) covers.set(p.categoryId, img.url);
  }
  return covers;
});

export const getActivePromotions = cache(async (onlyHome = false) => {
  const now = new Date();
  const [promotions, { visible, cats }] = await Promise.all([db.promotions.all(), visibleProducts()]);
  const byId = new Map(visible.map((p) => [p.id, p]));
  const live = promotions.filter(
    (pr) =>
      pr.active &&
      (!onlyHome || pr.showOnHome) &&
      (!pr.startsAt || pr.startsAt <= now) &&
      (!pr.endsAt || pr.endsAt >= now)
  );
  return sortBy(live, ["order", "asc"], ["createdAt", "desc"]).map((pr) => ({
    ...pr,
    products: (pr.productIds ?? []).flatMap((productId, order) => {
      const prod = byId.get(productId);
      return prod ? [{ productId, order, product: toCard(prod, cats) }] : [];
    }),
  }));
});

export const getHomeData = cache(async () => {
  const [{ visible, cats }, testimonials, promotions] = await Promise.all([
    visibleProducts(),
    db.testimonials.where((t) => t.active),
    getActivePromotions(true),
  ]);
  const card = (p: Product) => toCard(p, cats);

  const featured = sortBy(visible.filter((p) => p.isFeatured), ["order", "asc"], ["updatedAt", "desc"]).slice(0, 8).map(card);
  const newest = sortBy([...visible], ["isNew", "desc"], ["createdAt", "desc"]).slice(0, 8).map(card);
  const offers = sortBy(visible.filter((p) => p.isOffer || hasPromo(p)), ["updatedAt", "desc"]).slice(0, 8).map(card);
  const gallery = sortBy(visible.filter((p) => p.images?.length), ["updatedAt", "desc"])
    .slice(0, 10)
    .map((p) => ({ ...sortedImages(p)[0], product: { name: p.name, slug: p.slug } }));
  const used = sortBy(
    visible.filter((p) => p.condition !== "NEW" && p.availability !== "OUT_OF_STOCK"),
    ["isFeatured", "desc"],
    ["order", "asc"],
    ["updatedAt", "desc"]
  )
    .slice(0, 10)
    .map(card);

  return {
    featured,
    newest,
    offers,
    used,
    gallery,
    testimonials: sortBy(testimonials, ["order", "asc"], ["createdAt", "desc"]).slice(0, 9),
    promotions,
  };
});
