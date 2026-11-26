"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useInquiryList, trackInquiry } from "./InquiryList";
import { WhatsAppIcon } from "./icons";
import { formatPrice, mainAmount, displayPrice } from "@/lib/format";
import { listMessage, waLink } from "@/lib/whatsapp";


export function ListDrawer() {
  const { items, count, open, setOpen, remove, setQty, clear, whatsapp } = useInquiryList();
  const pathname = usePathname();

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [open, setOpen]);

  if (!open) return null;

  
  const totals = items.reduce<Record<string, number>>((acc, i) => {
    const a = mainAmount(i);
    if (a) acc[a.currency] = (acc[a.currency] || 0) + a.final * i.qty;
    return acc;
  }, {});
  const unpriced = items.some((i) => mainAmount(i) == null);

  return (
    <>
      <div className="fixed inset-0 z-[60] animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu lista"
        className="fixed bottom-0 right-0 top-0 z-[61] flex w-full max-w-md animate-slide-in-right flex-col bg-white text-ink shadow-2xl sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-3xl"
      >
        <header className="flex items-center justify-between px-6 pb-4 pt-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Tu lista</h2>
            <p className="text-sm text-mute">{count} {count === 1 ? "producto" : "productos"} · la enviás por WhatsApp</p>
          </div>
          <button type="button" className="icon-btn -mr-2" aria-label="Cerrar" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-mist">
              <ShoppingBag className="size-7 text-mute" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-semibold">Tu lista está vacía</p>
            <p className="mt-1 text-sm text-mute">Agregá los productos que te interesan y consultalos todos juntos.</p>
            <Link href="/catalogo" onClick={() => setOpen(false)} className="pill-dark mt-6">Explorar productos</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-2 overflow-y-auto px-4">
              {items.map((i) => (
                <li key={i.id} className="flex animate-rise-in gap-4 rounded-2xl p-2 transition-colors hover:bg-mist/60">
                  <Link href={`/producto/${i.slug}`} onClick={() => setOpen(false)} className="product-stage relative size-24 shrink-0 overflow-hidden rounded-2xl">
                    {i.image ? (
                      <Image src={i.image} alt={i.name} fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />
                    ) : (
                      <ImagePlus className="absolute inset-0 m-auto size-6 text-mute/60" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col py-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/producto/${i.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 font-medium leading-snug hover:text-brand-700">
                        {i.name}
                      </Link>
                      <button type="button" className="icon-btn -mr-1 -mt-1 size-8 shrink-0 text-mute hover:text-rose-600" aria-label={`Quitar ${i.name}`} onClick={() => remove(i.id)}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full bg-mist p-0.5">
                        <button type="button" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} className="grid size-7 place-items-center rounded-full text-graphite transition hover:bg-white disabled:opacity-30" aria-label="Restar">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= 20} className="grid size-7 place-items-center rounded-full text-graphite transition hover:bg-white disabled:opacity-30" aria-label="Sumar">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className={`text-right text-sm font-semibold ${mainAmount(i) ? "" : "text-brand-700"}`}>{displayPrice(i)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-mute">Total estimado</span>
                <span className="text-right text-xl font-semibold tracking-tight">
                  {Object.entries(totals).map(([cur, v]) => (
                    <span key={cur} className="block">{formatPrice(v, cur)}</span>
                  ))}
                  {!Object.keys(totals).length && "A confirmar"}
                </span>
              </div>
              {unpriced && (
                <p className="mt-1 text-xs leading-relaxed text-mute">Algunos productos no tienen precio publicado. Te confirmamos precio y disponibilidad por WhatsApp.</p>
              )}
              <a
                href={waLink(whatsapp, listMessage(items))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInquiry({ type: "LIST", detail: items.map((i) => `${i.qty}x ${i.name}`).join(", ").slice(0, 300) })}
                className="pill-wa pill-lg mt-5 w-full"
              >
                <WhatsAppIcon className="size-5" /> Enviar consulta por WhatsApp
              </a>
              <div className="mt-3 flex items-center justify-between text-sm">
                <Link href="/catalogo" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 font-medium text-graphite hover:text-ink">
                  Seguir mirando <ArrowRight className="size-3.5" />
                </Link>
                <button type="button" onClick={clear} className="text-mute hover:text-rose-600">Vaciar lista</button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
