"use client";

import clsx from "clsx";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useInquiryList, type ListItem } from "../InquiryList";

type Variant = "card" | "primary" | "bar";


export function AddToListButton({ item, className, variant = "primary", disabled }: { item: Omit<ListItem, "qty">; className?: string; variant?: Variant; disabled?: boolean }) {
  const { add, has } = useInquiryList();
  const added = has(item.id);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(item);
      }}
      className={clsx(
        variant === "card" && "pill pill-sm flex-1 bg-ink/90 text-white backdrop-blur-md hover:bg-ink",
        variant === "primary" && "pill-dark pill-lg flex-1",
        variant === "bar" && "pill-dark h-12 shrink-0 px-5",
        className
      )}
      aria-label={`Agregar ${item.name} a tu lista`}
    >
      {added ? <Check className="size-4" /> : variant === "card" ? <Plus className="size-4" /> : <ShoppingBag className="size-5" />}
      {variant === "card" ? (added ? "En tu lista" : "Agregar") : variant === "bar" ? (added ? "Agregado" : "Agregar") : added ? "Agregar otro" : "Agregar a mi lista"}
    </button>
  );
}
