export function formatPrice(value: number, currency: string = "ARS") {
  const n = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.round(value));
  return currency === "USD" ? `US$ ${n}` : `$ ${n}`;
}

export type Currency = "ARS" | "USD";
export const CURRENCIES: Currency[] = ["ARS", "USD"];


export type Priced = {
  price: number | null;
  promoPrice: number | null;
  priceUsd?: number | null;
  promoPriceUsd?: number | null;
  currency: string;
};


export function normalizePrices<T extends Priced>(p: T): T & { priceUsd: number | null; promoPriceUsd: number | null } {
  if (p.priceUsd === undefined) {
    return p.currency === "USD"
      ? { ...p, priceUsd: p.price ?? null, promoPriceUsd: p.promoPrice ?? null, price: null, promoPrice: null }
      : { ...p, priceUsd: null, promoPriceUsd: null };
  }
  return { ...p, priceUsd: p.priceUsd ?? null, promoPriceUsd: p.promoPriceUsd ?? null };
}


export const NO_PRICE_LABEL = "Consultar precio";


export type Amount = { currency: Currency; price: number; promo: number | null; final: number };

export function amountIn(p: Priced, currency: Currency): Amount | null {
  const price = currency === "USD" ? p.priceUsd : p.price;
  const rawPromo = currency === "USD" ? p.promoPriceUsd : p.promoPrice;
  if (price == null || !(price > 0)) return null;
  const promo = rawPromo != null && rawPromo > 0 && rawPromo < price ? rawPromo : null;
  return { currency, price, promo, final: promo ?? price };
}


export function priceList(p: Priced): Amount[] {
  const main: Currency = p.currency === "USD" ? "USD" : "ARS";
  const order: Currency[] = main === "USD" ? ["USD", "ARS"] : ["ARS", "USD"];
  return order.map((c) => amountIn(p, c)).filter((a): a is Amount => a != null);
}


export function mainAmount(p: Priced): Amount | null {
  return priceList(p)[0] ?? null;
}

export function hasPrice(p: Priced) {
  return mainAmount(p) != null;
}

export function hasPromo(p: Priced) {
  return priceList(p).some((a) => a.promo != null);
}

export function discountPercent(p: Priced) {
  const a = priceList(p).find((x) => x.promo != null);
  return a ? Math.round((1 - a.promo! / a.price) * 100) : 0;
}


export function effectivePrice(p: Priced): number | null {
  return mainAmount(p)?.final ?? null;
}


export function displayPrice(p: Priced) {
  const list = priceList(p);
  return list.length ? list.map((a) => formatPrice(a.final, a.currency)).join(" / ") : NO_PRICE_LABEL;
}


export type VariantLike = {
  id: string;
  name: string;
  hex: string | null;
  imageIds: string[];
  ownPrice: boolean;
  price: number | null;
  promoPrice: number | null;
  priceUsd: number | null;
  promoPriceUsd: number | null;
  availability: string | null;
};


export function variantPriced(p: Priced, v: VariantLike | null | undefined): Priced {
  if (!v || !v.ownPrice) return p;
  return { price: v.price, promoPrice: v.promoPrice, priceUsd: v.priceUsd, promoPriceUsd: v.promoPriceUsd, currency: p.currency };
}


export function variantImages<I extends { id: string }>(images: I[], variants: VariantLike[], v: VariantLike | null | undefined): I[] {
  if (!v || v.imageIds.length === 0) return images;
  const own = new Set(v.imageIds);
  const anyColor = new Set(variants.flatMap((x) => x.imageIds));
  return [...images.filter((i) => own.has(i.id)), ...images.filter((i) => !anyColor.has(i.id))];
}

export const AVAILABILITY: Record<string, { label: string; tone: "ok" | "warn" | "off" | "info" }> = {
  IN_STOCK: { label: "Disponible", tone: "ok" },
  LOW_STOCK: { label: "Últimas unidades", tone: "warn" },
  ON_ORDER: { label: "A pedido", tone: "info" },
  OUT_OF_STOCK: { label: "Sin stock", tone: "off" },
};

export const CONDITION: Record<string, string> = {
  NEW: "Nuevo / Sellado",
  USED: "Usado",
  REFURBISHED: "Reacondicionado",
};

export const PROMO_TYPES: Record<string, string> = {
  OFFER: "Oferta especial",
  COMBO: "Combo",
  LIMITED: "Tiempo limitado",
  NEW_ARRIVALS: "Últimos ingresos",
};

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type Spec = { label: string; value: string };

export function parseSpecs(raw: string | null | undefined): Spec[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v)
      ? v.filter((s) => s && typeof s.label === "string" && typeof s.value === "string")
      : [];
  } catch {
    return [];
  }
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}


export function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}
