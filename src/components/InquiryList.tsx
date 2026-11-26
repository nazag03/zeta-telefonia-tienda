"use client";

import { normalizePrices } from "@/lib/format";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type ListItem = {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  promoPrice: number | null;
  priceUsd?: number | null;
  promoPriceUsd?: number | null;
  currency: string;
  image?: string | null;
  qty: number;
};

type Ctx = {
  items: ListItem[];
  count: number;
  add: (item: Omit<ListItem, "qty">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  has: (id: string) => boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  whatsapp: string;
  
  toast: Toast | null;
  dismissToast: () => void;
};

export type Toast = { id: number; name: string; image?: string | null };

const InquiryCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "zeta:consulta";



let memory = "[]";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return memory;
  }
}

function parseItems(raw: string): ListItem[] {
  try {
    const v = JSON.parse(raw);
    
    return Array.isArray(v) ? v.map((i: ListItem) => normalizePrices(i)) : [];
  } catch {
    return [];
  }
}

export function InquiryListProvider({ children, whatsapp }: { children: React.ReactNode; whatsapp: string }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const items = useMemo(() => parseItems(raw), [raw]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const persist = useCallback((next: ListItem[]) => {
    memory = JSON.stringify(next);
    try {
      localStorage.setItem(STORAGE_KEY, memory);
    } catch {}
    listeners.forEach((l) => l());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      add: (item) => {
        const exists = items.find((i) => i.id === item.id);
        persist(exists ? items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) : [...items, { ...item, qty: 1 }]);
        setToast({ id: Date.now(), name: item.name, image: item.image });
      },
      remove: (id) => persist(items.filter((i) => i.id !== id)),
      setQty: (id, qty) => persist(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i))),
      clear: () => persist([]),
      has: (id) => items.some((i) => i.id === id),
      open,
      setOpen,
      whatsapp,
      toast,
      dismissToast: () => setToast(null),
    }),
    [items, open, persist, whatsapp, toast]
  );

  return <InquiryCtx.Provider value={value}>{children}</InquiryCtx.Provider>;
}

export function useInquiryList() {
  const ctx = useContext(InquiryCtx);
  if (!ctx) throw new Error("useInquiryList debe usarse dentro de InquiryListProvider");
  return ctx;
}


export function trackInquiry(data: { type: "PRODUCT" | "LIST" | "GENERAL" | "PROMOTION"; productId?: string; detail?: string }) {
  try {
    const body = JSON.stringify(data);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/inquiries", new Blob([body], { type: "application/json" }));
    else fetch("/api/inquiries", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {}
}
