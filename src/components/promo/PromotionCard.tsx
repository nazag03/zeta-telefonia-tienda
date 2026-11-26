import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { getActivePromotions } from "@/lib/queries";
import { PROMO_TYPES, formatPrice } from "@/lib/format";
import { promotionMessage } from "@/lib/whatsapp";
import { WaButton } from "../WaButton";
import { Countdown } from "./Countdown";

type Promo = Awaited<ReturnType<typeof getActivePromotions>>[number];

export function PromotionCard({ promo, whatsapp, large, showProductsLink }: { promo: Promo; whatsapp: string; large?: boolean; showProductsLink?: boolean }) {
  const products = promo.products.map((pp) => pp.product);
  const thumbs = products.filter((p) => p.images[0]).slice(0, 4);

  return (
    <article
      id={promo.slug}
      className={`group relative isolate flex scroll-mt-32 flex-col overflow-hidden rounded-[2rem] bg-ink text-white ${large ? "min-h-[360px]" : "min-h-[320px]"}`}
    >
      {promo.image ? (
        <>
          <Image src={promo.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="-z-10 object-cover transition duration-1500 group-hover:scale-105" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
      )}

      <div className="flex flex-1 flex-col p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag bg-white text-ink">{promo.badge || PROMO_TYPES[promo.type] || "Promo"}</span>
          {promo.endsAt && <Countdown endsAt={promo.endsAt.toISOString()} />}
        </div>
        <h3 className="mt-5 max-w-md text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{promo.title}</h3>
        {promo.description && <p className="mt-3 max-w-md leading-relaxed text-white/75">{promo.description}</p>}

        {promo.comboPrice != null && promo.comboPrice > 0 && (
          <p className="mt-5">
            <span className="block text-xs uppercase tracking-widest text-white/60">Precio combo</span>
            <span className="text-3xl font-semibold tracking-tight">{formatPrice(promo.comboPrice, promo.currency)}</span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
          {thumbs.length > 0 && (
            <div className="flex -space-x-3">
              {thumbs.map((p) => (
                <Link key={p.id} href={`/producto/${p.slug}`} title={p.name} className="relative size-12 overflow-hidden rounded-full bg-white ring-2 ring-ink transition hover:z-10 hover:scale-110">
                  <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-contain p-1 mix-blend-multiply" />
                </Link>
              ))}
              {products.length > thumbs.length && (
                <span className="grid size-12 place-items-center rounded-full bg-graphite text-xs font-bold ring-2 ring-ink">+{products.length - thumbs.length}</span>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {showProductsLink && products.length > 0 && (
              <Link href={`/promociones#${promo.slug}`} className="pill-ghost-dark pill-sm">
                Ver productos <ArrowRight className="size-4" />
              </Link>
            )}
            <WaButton number={whatsapp} message={promotionMessage(promo.title)} type="PROMOTION" detail={promo.title} className="pill-sm">
              Consultar
            </WaButton>
          </div>
        </div>
      </div>
    </article>
  );
}
