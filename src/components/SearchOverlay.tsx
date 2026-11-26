"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, CornerDownLeft, ImagePlus, Loader2, Search, X } from "lucide-react";
import { SEARCH_SUGGESTIONS } from "@/lib/brand";

type Result = { id: string; slug: string; name: string; category: string; price: string; image: string | null };


export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const term = query.trim();

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setActive(0);
  }

  
  useEffect(() => {
    if (!term) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { items: Result[] };
        setResults(data.items);
        setActive(0);
      } catch {
        
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [term]);

  const shown = term ? results : [];

  function go(href: string) {
    onClose();
    setQuery("");
    router.push(href);
  }
  const seeAll = () => go(`/catalogo?q=${encodeURIComponent(term)}`);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(shown.length - 1, a + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, shown.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] animate-fade-in bg-ink/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Buscar productos" className="mx-auto w-full max-w-2xl animate-drop-in overflow-hidden bg-white shadow-2xl sm:mt-[10vh] sm:rounded-3xl">
        <form
          className="flex items-center gap-3 border-b border-line px-5 py-4"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const r = shown[active];
            if (r) go(`/producto/${r.slug}`);
            else if (term) seeAll();
          }}
        >
          {loading ? <Loader2 className="size-5 shrink-0 animate-spin text-mute" /> : <Search className="size-5 shrink-0 text-mute" />}
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Buscá iPhone, Samsung, AirPods, cargador…"
            className="w-full bg-transparent text-lg text-ink outline-none placeholder:text-mute/70 [&::-webkit-search-cancel-button]:hidden"
            aria-label="Término de búsqueda"
            autoComplete="off"
          />
          <button type="button" className="icon-btn -mr-2 shrink-0" aria-label="Cerrar búsqueda" onClick={onClose}>
            <X className="size-5" />
          </button>
        </form>

        <div className="max-h-[70vh] overflow-y-auto p-3">
          {!term ? (
            <div className="p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Búsquedas populares</p>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="tag bg-mist px-3.5 py-1.5 text-sm text-graphite transition hover:bg-ink hover:text-white"
                    onClick={() => (s === "Usados" ? go("/catalogo?condicion=usado") : setQuery(s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : shown.length ? (
            <ul role="listbox" aria-label="Resultados">
              {shown.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    className={clsx("flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors", i === active ? "bg-mist" : "hover:bg-mist/70")}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/producto/${p.slug}`)}
                  >
                    <div className="product-stage relative size-16 shrink-0 overflow-hidden rounded-xl">
                      {p.image ? (
                        <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1.5 mix-blend-multiply" />
                      ) : (
                        <ImagePlus className="absolute inset-0 m-auto size-5 text-mute/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{p.name}</p>
                      <p className="truncate text-sm text-mute">{p.category} · {p.price}</p>
                    </div>
                    {i === active && <CornerDownLeft className="mr-2 size-4 text-mute" />}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button type="button" className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={seeAll}>
                  Ver todos los resultados para “{term}” <ArrowRight className="size-4" />
                </button>
              </li>
            </ul>
          ) : loading ? (
            <p className="px-4 py-10 text-center text-sm text-mute">Buscando…</p>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="font-medium text-ink">No encontramos “{term}”</p>
              <p className="mt-1 text-sm text-mute">Probá con otro modelo o consultanos por WhatsApp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
