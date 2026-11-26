"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Loader2, Check } from "lucide-react";
import { quickUpdateProductAction } from "@/app/admin/actions/products";
import { AVAILABILITY } from "@/lib/format";

function useQuick(id: string) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  function send(field: string, value: string, onError?: () => void) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("field", field);
    fd.set("value", value);
    start(async () => {
      const res = await quickUpdateProductAction(fd);
      if (res.error) {
        setError(res.error);
        onError?.();
      } else {
        setError(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      }
    });
  }
  return { pending, error, saved, send };
}

export function QuickToggle({ id, field, value, label }: { id: string; field: "active" | "isFeatured" | "isNew" | "isOffer"; value: boolean; label: string }) {
  const [on, setOn] = useState(value);
  const { pending, send } = useQuick(id);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() => {
        setOn(!on);
        send(field, String(!on), () => setOn(on));
      }}
      className={clsx("relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-60", on ? "bg-brand-500" : "bg-ink-600")}
    >
      <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

export function QuickAvailability({ id, value }: { id: string; value: string }) {
  const [v, setV] = useState(value);
  const { pending, send } = useQuick(id);
  return (
    <select
      value={v}
      disabled={pending}
      onChange={(e) => {
        const prev = v;
        setV(e.target.value);
        send("availability", e.target.value, () => setV(prev));
      }}
      className={clsx("input w-auto py-1.5 pr-8 text-xs", v === "OUT_OF_STOCK" && "text-red-300", v === "LOW_STOCK" && "text-amber-300")}
      aria-label="Disponibilidad"
    >
      {Object.entries(AVAILABILITY).map(([k, a]) => (
        <option key={k} value={k}>{a.label}</option>
      ))}
    </select>
  );
}

export function QuickPrice({ id, field, value, placeholder }: { id: string; field: "price" | "promoPrice" | "priceUsd" | "promoPriceUsd"; value: number | null; placeholder?: string }) {
  const initial = value != null ? String(Math.round(value)) : "";
  const [v, setV] = useState(initial);
  const { pending, error, saved, send } = useQuick(id);
  const commit = () => {
    if (v.trim() === initial) return;
    send(field, v.trim(), () => setV(initial));
  };
  return (
    <div className="relative">
      <input
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
        inputMode="numeric"
        placeholder={placeholder}
        className={clsx("input w-28 py-1.5 text-right text-sm tabular-nums", error && "border-red-500", (field === "promoPrice" || field === "promoPriceUsd") && v && "text-brand-300")}
        aria-label={{ price: "Precio en pesos", priceUsd: "Precio en dólares", promoPrice: "Precio promocional en pesos", promoPriceUsd: "Precio promocional en dólares" }[field]}
        title={error ?? undefined}
      />
      {pending && <Loader2 className="absolute -right-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-ink-400" />}
      {saved && <Check className="absolute -right-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-400" />}
      {error && <p className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md bg-red-500/90 px-2 py-1 text-[11px] text-white">{error}</p>}
    </div>
  );
}
