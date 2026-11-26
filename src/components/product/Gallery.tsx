"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ProductImage } from "./ProductImage";

type Img = { id: string; url: string; alt: string | null };

export function ProductGallery({ images, name, children }: { images: Img[]; name: string; brand?: string; children?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const count = images.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [zoom, count]);

  const current = images[index];

  return (
    <div>
      
      <div className="lg:hidden">
        <div className="product-stage relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-card">
          <div
            ref={track}
            className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto"
            onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {count ? (
              images.map((img, i) => (
                <button key={img.id} type="button" className="relative h-full w-full shrink-0 snap-center" onClick={() => { setIndex(i); setZoom(true); }} aria-label={`Ampliar foto ${i + 1}`}>
                  <span className="absolute inset-[8%]">
                    <ProductImage src={img.url} alt={img.alt || `${name}, foto ${i + 1}`} eager={i === 0} sizes="100vw" />
                  </span>
                </button>
              ))
            ) : (
              <div className="relative h-full w-full shrink-0">
                <ProductImage src={null} alt={name} />
              </div>
            )}
          </div>
          {children}
          {count > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  className={clsx("h-1.5 rounded-full transition-all duration-500", i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/25")}
                  aria-label={`Ver foto ${i + 1}`}
                  onClick={() => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      
      <div className="hidden gap-4 lg:flex">
        {count > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3" role="tablist" aria-label="Fotos del producto">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={clsx("product-stage relative aspect-square overflow-hidden rounded-2xl ring-2 transition-all duration-300", i === index ? "ring-ink" : "opacity-70 ring-transparent hover:opacity-100")}
                aria-label={`Ver foto ${i + 1}`}
              >
                <span className="absolute inset-2">
                  <ProductImage src={img.url} alt="" sizes="80px" label="" />
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="product-stage group relative aspect-square flex-1 overflow-hidden rounded-card">
          {count ? (
            images.map((img, i) => (
              <div key={img.id} className={clsx("absolute inset-[9%] transition-all duration-700 ease-out-expo", i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[0.97] opacity-0")}>
                <ProductImage src={img.url} alt={img.alt || `${name}, foto ${i + 1}`} eager={i === 0} sizes="(min-width:1024px) 50vw, 100vw" />
              </div>
            ))
          ) : (
            <ProductImage src={null} alt={name} />
          )}
          {children}
          {count > 0 && (
            <button type="button" onClick={() => setZoom(true)} className="absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-soft backdrop-blur transition hover:bg-white group-hover:opacity-100 focus:opacity-100" aria-label="Ampliar foto">
              <Expand className="size-4" />
            </button>
          )}
          {count > 1 && (
            <>
              <button type="button" className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-soft backdrop-blur transition hover:bg-white group-hover:opacity-100" aria-label="Foto anterior" onClick={() => go(index - 1)}>
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-soft backdrop-blur transition hover:bg-white group-hover:opacity-100" aria-label="Foto siguiente" onClick={() => go(index + 1)}>
                <ChevronRight className="size-5" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
      </div>

      {zoom && current && (
        <div className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-white p-4" role="dialog" aria-modal="true" aria-label={`Fotos de ${name}`} onClick={() => setZoom(false)}>
          <button className="icon-btn absolute right-4 top-4" aria-label="Cerrar"><X className="size-6" /></button>
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.alt || name} fill sizes="100vw" className="object-contain" />
          </div>
          {count > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); go(index - 1); }} className="absolute left-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-mist hover:bg-line" aria-label="Anterior"><ChevronLeft className="size-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); go(index + 1); }} className="absolute right-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-mist hover:bg-line" aria-label="Siguiente"><ChevronRight className="size-6" /></button>
              <p className="absolute bottom-6 text-sm tabular-nums text-mute">{index + 1} / {count}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
