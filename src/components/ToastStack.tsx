"use client";

import Image from "next/image";
import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useInquiryList } from "./InquiryList";


export function ToastStack() {
  const { toast, dismissToast, setOpen } = useInquiryList();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[65] flex justify-center px-4 sm:justify-end sm:px-6 lg:top-24" aria-live="polite">
      <div key={toast.id} className="pointer-events-auto flex w-full max-w-sm animate-drop-in items-center gap-3 rounded-2xl bg-white p-3 pr-2 text-ink shadow-lift ring-1 ring-black/5">
        <div className="product-stage relative size-12 shrink-0 overflow-hidden rounded-xl">
          {toast.image ? (
            <Image src={toast.image} alt="" fill sizes="48px" className="object-contain p-1 mix-blend-multiply" />
          ) : (
            <CheckCircle2 className="absolute inset-0 m-auto size-5 text-emerald-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-emerald-600" /> Agregado a tu lista
          </p>
          <p className="truncate text-xs text-mute">{toast.name}</p>
        </div>
        <button
          type="button"
          className="pill pill-sm shrink-0 bg-mist px-3 text-ink hover:bg-line"
          onClick={() => {
            dismissToast();
            setOpen(true);
          }}
        >
          Ver lista
        </button>
        <button type="button" className="icon-btn size-8 shrink-0 text-mute" aria-label="Cerrar aviso" onClick={dismissToast}>
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
