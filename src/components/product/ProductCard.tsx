import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import type { ProductCardData } from "@/lib/queries";
import { CONDITION } from "@/lib/format";
import { productMessage } from "@/lib/whatsapp";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./Badges";
import { Price } from "./Price";
import { AddToListButton } from "./AddToListButton";
import { WhatsAppIcon } from "../icons";
import { WaButton } from "../WaButton";

type Props = {
  p: ProductCardData;
  whatsapp?: string;
  size?: "md" | "lg";
  eager?: boolean;
  dark?: boolean;
  
  compact?: boolean;
};

export function ProductCard({ p, whatsapp, size = "md", eager, dark, compact }: Props) {
  const img = p.images[0];
  const href = `/producto/${p.slug}`;
  const out = p.availability === "OUT_OF_STOCK";
  const variants = p.variants ?? [];

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
      <Link
        href={href}
        className={clsx(
          "relative block aspect-[4/5] overflow-hidden rounded-card transition-shadow duration-500 group-hover:shadow-lift",
          dark ? "bg-white ring-1 ring-white/10" : "product-stage"
        )}
        aria-label={`Ver ${p.name}`}
      >
        <div className="absolute inset-[9%] transition-transform duration-900 ease-out-expo group-hover:scale-[1.045]">
          <ProductImage
            src={img?.url}
            alt={img?.alt || p.name}
            eager={eager}
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 70vw"
            className={clsx(out && "opacity-60 grayscale")}
          />
        </div>

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
          <ProductBadges p={p} max={compact ? 1 : 2} />
          {out && <span className="tag ml-auto bg-white/90 text-rose-700 ring-1 ring-black/5">Sin stock</span>}
        </div>

      </Link>

        
        <div
          className={clsx(
            "absolute inset-x-3 bottom-3 gap-2 transition-all duration-500 ease-out-expo lg:translate-y-4 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
            compact ? "hidden lg:flex" : "flex"
          )}
        >
          <AddToListButton
            variant="card"
            item={{ id: p.id, slug: p.slug, name: p.name, price: p.price, promoPrice: p.promoPrice, priceUsd: p.priceUsd, promoPriceUsd: p.promoPriceUsd, currency: p.currency, image: img?.url }}
          />
          {whatsapp && (
            <WaButton
              number={whatsapp}
              message={productMessage(p)}
              type="PRODUCT"
              productId={p.id}
              detail="Tarjeta"
              variant="plain"
              icon={false}
              className="pill pill-sm bg-white/90 px-3 text-ink backdrop-blur-md hover:bg-white"
              ariaLabel={`Consultar ${p.name} por WhatsApp`}
            >
              <WhatsAppIcon className="size-4 text-whatsapp-dark" />
              <span className="hidden sm:inline">Consultar</span>
            </WaButton>
          )}
        </div>
      </div>

      <div className={clsx("flex flex-1 flex-col px-1", compact ? "pt-3 sm:pt-5" : "pt-5")}>
        <div className={clsx("mb-1.5 items-center gap-2 text-xs font-medium", compact ? "hidden sm:flex" : "flex", dark ? "text-white/50" : "text-mute")}>
          <span className="truncate">{p.category?.name ?? p.brand}</span>
          <span className="size-1 shrink-0 rounded-full bg-current opacity-40" />
          <span className="shrink-0">{CONDITION[p.condition] ?? "Nuevo"}</span>
        </div>
        <Link href={href} className="group/title inline-flex items-start justify-between gap-3">
          <h3
            className={clsx(
              "font-semibold tracking-[-0.015em] transition-colors",
              size === "lg" ? "text-xl sm:text-2xl" : compact ? "text-[0.95rem] sm:text-lg" : "text-lg",
              dark ? "text-white" : "text-ink group-hover/title:text-brand-700"
            )}
          >
            {p.name}
          </h3>
          <ArrowUpRight
            className={clsx(
              "mt-1 size-4 shrink-0 opacity-0 transition-all duration-300 group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5 group-hover/title:opacity-100",
              dark ? "text-white" : "text-ink"
            )}
          />
        </Link>
        {p.shortDescription && !compact && (
          <p className={clsx("mt-1 line-clamp-1 text-sm", dark ? "text-white/55" : "text-mute")}>{p.shortDescription}</p>
        )}

        <div className={clsx("mt-auto flex items-end justify-between gap-3", compact ? "pt-1.5 sm:pt-4" : "pt-4")}>
          <Price p={p} size="sm" dark={dark} />
          {variants.length > 1 && (
            <div className={clsx("shrink-0 items-center -space-x-1", compact ? "hidden sm:flex" : "flex")} title={variants.map((v) => v.name).join(", ")}>
              {variants.slice(0, 5).map((v) => (
                <span key={v.id} className={clsx("size-4 rounded-full ring-2", dark ? "ring-ink" : "ring-white")} style={{ backgroundColor: v.hex ?? "#ddd" }} aria-hidden />
              ))}
              {variants.length > 5 && <span className="pl-2 text-xs text-mute">+{variants.length - 5}</span>}
              <span className="sr-only">{variants.length} colores</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, whatsapp, className = "" }: { products: ProductCardData[]; whatsapp?: string; className?: string }) {
  return (
    <div className={clsx("grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} p={p} whatsapp={whatsapp} compact eager={i < 4} />
      ))}
    </div>
  );
}
