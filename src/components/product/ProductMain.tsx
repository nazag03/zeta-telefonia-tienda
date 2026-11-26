"use client";

import { useState } from "react";
import clsx from "clsx";
import { formatPrice, mainAmount, displayPrice, variantImages, variantPriced, CONDITION, type Priced, type VariantLike } from "@/lib/format";
import { productMessage } from "@/lib/whatsapp";
import { ProductGallery } from "./Gallery";
import { Price } from "./Price";
import { Availability } from "./Availability";
import { ProductBadges } from "./Badges";
import { AddToListButton } from "./AddToListButton";
import { ShareButton } from "./ShareButton";
import { WaButton } from "../WaButton";
import { WhatsAppIcon } from "../icons";

type Props = {
  p: Priced & {
    id: string;
    slug: string;
    name: string;
    brand: string;
    model: string | null;
    shortDescription: string | null;
    availability: string;
    condition: string;
    isNew: boolean;
    isOffer: boolean;
    isFeatured: boolean;
    images: { id: string; url: string; alt: string | null }[];
    variants: VariantLike[];
  };
  whatsapp: string;
  url: string;
  
  children?: React.ReactNode;
};


export function ProductMain({ p, whatsapp, url, children }: Props) {
  const variants = p.variants;
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (variants.find((v) => (v.availability ?? p.availability) !== "OUT_OF_STOCK") ?? variants[0])?.id ?? null
  );
  const v = variants.find((x) => x.id === selectedId) ?? null;

  const priced = variantPriced(p, v);
  const main = mainAmount(priced);
  const availability = v?.availability ?? p.availability;
  const out = availability === "OUT_OF_STOCK";
  const images = variantImages(p.images, variants, v);
  const fullName = v ? `${p.name} - ${v.name}` : p.name;
  const message = productMessage({ ...priced, name: fullName }, url);
  const listItem = {
    id: v ? `${p.id}:${v.id}` : p.id,
    slug: p.slug,
    name: fullName,
    price: priced.price,
    promoPrice: priced.promoPrice,
    priceUsd: priced.priceUsd,
    promoPriceUsd: priced.promoPriceUsd,
    currency: priced.currency,
    image: images[0]?.url,
  };

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            
            <ProductGallery key={v?.id ?? "all"} images={images} name={fullName} />
          </div>
        </div>

        <div className="lg:col-span-5">
          <ProductBadges p={{ ...priced, isNew: p.isNew, isOffer: p.isOffer, isFeatured: p.isFeatured, condition: p.condition }} max={3} />
          <p className="mt-4 text-sm font-medium text-mute">
            {p.brand}
            {p.model && ` · ${p.model}`}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{p.name}</h1>
          {p.shortDescription && <p className="mt-3 text-lg text-mute">{p.shortDescription}</p>}

          <Price p={priced} size="lg" className="mt-6" />
          {main?.promo != null ? (
            <p className="mt-1.5 text-sm font-medium text-emerald-700">Ahorrás {formatPrice(main.price - main.promo, main.currency)}</p>
          ) : (
            !main && <p className="mt-1.5 text-sm text-mute">Te confirmamos el precio actualizado por WhatsApp.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="tag bg-mist text-graphite">{CONDITION[p.condition] ?? "Nuevo"}</span>
            <Availability value={availability} />
          </div>

          {variants.length > 0 && (
            <div className="mt-9 border-t border-line pt-8">
              <p className="mb-3 text-sm font-medium text-graphite">
                Color: <span className="text-ink">{v?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Elegí el color">
                {variants.map((x) => {
                  const on = x.id === v?.id;
                  const xOut = (x.availability ?? p.availability) === "OUT_OF_STOCK";
                  return (
                    <button
                      key={x.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSelectedId(x.id)}
                      className={clsx(
                        "inline-flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-sm font-medium ring-1 ring-inset transition-all duration-300",
                        on ? "bg-ink text-white ring-ink" : "bg-white text-graphite ring-line hover:ring-graphite/40",
                        xOut && !on && "opacity-50"
                      )}
                    >
                      <span className={clsx("size-6 shrink-0 rounded-full ring-1", on ? "ring-white/40" : "ring-black/10")} style={{ backgroundColor: x.hex ?? "#ddd" }} aria-hidden />
                      <span className={clsx(xOut && "line-through")}>{x.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-9 flex items-center gap-3">
            <AddToListButton item={listItem} />
            <ShareButton title={p.name} url={url} />
          </div>
          <WaButton number={whatsapp} message={message} type="PRODUCT" productId={p.id} detail={v?.name} className="pill-lg mt-3 w-full">
            {out ? "Consultar ingreso por WhatsApp" : "Consultar por WhatsApp"}
          </WaButton>

          {children}
        </div>
      </div>

      
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className={clsx("truncate text-xs", main ? "text-mute" : "text-brand-700")}>{displayPrice(priced)}</p>
          </div>
          <WaButton number={whatsapp} message={message} type="PRODUCT" productId={p.id} detail={v?.name} variant="plain" icon={false} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white" ariaLabel="Consultar por WhatsApp">
            <WhatsAppIcon className="size-5" />
          </WaButton>
          <AddToListButton item={listItem} variant="bar" />
        </div>
      </div>
    </>
  );
}
