import clsx from "clsx";
import { NO_PRICE_LABEL, formatPrice, priceList, type Priced } from "@/lib/format";


export function Price({ p, size = "md", className, dark }: { p: Priced; size?: "sm" | "md" | "lg"; className?: string; dark?: boolean }) {
  const [main, alt] = priceList(p);
  const big = size === "lg" ? "text-3xl tracking-tight sm:text-[2rem]" : size === "md" ? "text-xl tracking-tight" : "text-[0.95rem]";

  if (!main) {
    return <p className={clsx("font-semibold", big, dark ? "text-brand-300" : "text-brand-700", className)}>{NO_PRICE_LABEL}</p>;
  }
  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={clsx("font-semibold tabular-nums", big, dark ? "text-white" : "text-ink")}>{formatPrice(main.final, main.currency)}</span>
        {main.promo != null && (
          <span className={clsx("tabular-nums text-mute line-through", size === "lg" ? "text-lg" : "text-sm")}>{formatPrice(main.price, main.currency)}</span>
        )}
      </div>
      {alt && (
        <p className={clsx("tabular-nums", size === "lg" ? "mt-1 text-base" : "text-xs", dark ? "text-white/55" : "text-mute")}>
          o {formatPrice(alt.final, alt.currency)}
          {alt.promo != null && <span className="ml-1.5 line-through opacity-70">{formatPrice(alt.price, alt.currency)}</span>}
        </p>
      )}
    </div>
  );
}
