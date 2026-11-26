"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { savePromotionAction } from "@/app/admin/actions/promotions";
import { displayPrice } from "@/lib/format";
import { Field, FormAlert, ImagePreviewInput, SubmitButton, Toggle, useFormAction } from "./ui";

type ProductOpt = { id: string; name: string; brand: string; price: number | null; promoPrice: number | null; priceUsd: number | null; promoPriceUsd: number | null; currency: string; active: boolean; image: string | null };

export type PromotionFormData = {
  id?: string;
  title: string;
  description: string | null;
  type: string;
  badge: string | null;
  image: string | null;
  comboPrice: number | null;
  currency: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  showOnHome: boolean;
  order: number;
  productIds: string[];
};

export function PromotionForm({ promotion, products }: { promotion?: PromotionFormData; products: ProductOpt[] }) {
  const [state, onSubmit, pending] = useFormAction(savePromotionAction);
  const fe = state.fieldErrors ?? {};
  const [selected, setSelected] = useState<string[]>(promotion?.productIds ?? []);
  const [q, setQ] = useState("");
  const [type, setType] = useState(promotion?.type ?? "OFFER");

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    return products.filter((p) => !selected.includes(p.id) && (!t || `${p.name} ${p.brand}`.toLowerCase().includes(t))).slice(0, 40);
  }, [q, products, selected]);

  const selectedProducts = selected.map((id) => products.find((p) => p.id === id)).filter(Boolean) as ProductOpt[];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {promotion?.id && <input type="hidden" name="id" value={promotion.id} />}
      <input type="hidden" name="productIds" value={JSON.stringify(selected)} />

      <div className="flex items-center justify-between">
        <Link href="/admin/promociones" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        <SubmitButton pending={pending}>{promotion?.id ? "Guardar cambios" : "Crear promoción"}</SubmitButton>
      </div>
      <FormAlert state={state} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <Field label="Título *" name="title" error={fe.title}>
              <input id="title" name="title" defaultValue={promotion?.title} required maxLength={100} placeholder="Ej: Semana Apple" className="input" />
            </Field>
            <Field label="Descripción" name="description">
              <textarea id="description" name="description" defaultValue={promotion?.description ?? ""} rows={3} maxLength={600} className="input" placeholder="Ej: Descuentos en iPhone seleccionados hasta agotar stock." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo" name="type">
                <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="input">
                  <option value="OFFER">Oferta especial</option>
                  <option value="COMBO">Combo de productos</option>
                  <option value="LIMITED">Tiempo limitado</option>
                  <option value="NEW_ARRIVALS">Últimos ingresos</option>
                </select>
              </Field>
              <Field label="Etiqueta personalizada" name="badge" hint="Opcional. Ej: HOT SALE, 3 CUOTAS">
                <input id="badge" name="badge" defaultValue={promotion?.badge ?? ""} maxLength={30} className="input" />
              </Field>
            </div>
            {type === "COMBO" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Precio del combo" name="comboPrice" error={fe.comboPrice}>
                  <input id="comboPrice" name="comboPrice" defaultValue={promotion?.comboPrice ? Math.round(promotion.comboPrice) : ""} inputMode="numeric" className="input" />
                </Field>
                <Field label="Moneda" name="currency">
                  <select id="currency" name="currency" defaultValue={promotion?.currency ?? "ARS"} className="input">
                    <option value="ARS">Pesos ($)</option>
                    <option value="USD">Dólares (US$)</option>
                  </select>
                </Field>
              </div>
            )}
          </section>

          <section className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase">Productos incluidos</h2>
              <span className="text-xs text-ink-400">{selected.length} seleccionados</span>
            </div>
            {selectedProducts.length > 0 && (
              <ul className="space-y-2">
                {selectedProducts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image ? <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="h-9 w-9 rounded-lg bg-ink-800" />}
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-ink-300">{displayPrice(p)}</span>
                    <button type="button" onClick={() => setSelected((s) => s.filter((x) => x !== p.id))} className="rounded-md p-1 text-ink-400 hover:text-red-400" aria-label={`Quitar ${p.name}`}><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos para agregar…" className="input pl-9" />
            </div>
            <ul className="max-h-72 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setSelected((s) => [...s, p.id])} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image ? <img src={p.image} alt="" className="h-8 w-8 rounded-md object-cover" /> : <span className="h-8 w-8 rounded-md bg-ink-800" />}
                    <span className="min-w-0 flex-1 truncate">{p.name} {!p.active && <span className="text-xs text-ink-500">(oculto)</span>}</span>
                    <span className="text-xs text-ink-400">{displayPrice(p)}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-ink-400">Sin resultados.</li>}
            </ul>
            <Field label="Aplicar descuento a estos productos (%)" name="applyDiscount" error={fe.applyDiscount} hint="Opcional. Calcula y guarda el precio promocional de cada producto seleccionado y los marca como OFERTA.">
              <input id="applyDiscount" name="applyDiscount" inputMode="decimal" placeholder="Ej: 15" className="input max-w-[160px]" />
            </Field>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card space-y-4 p-6">
            <ImagePreviewInput name="image" current={promotion?.image} removeName="removeImage" label="Imagen de fondo (opcional)" hint="Recomendado: horizontal, 1600×900." />
          </section>
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">Vigencia</h2>
            <Field label="Desde" name="startsAt" hint="Vacío = desde ahora.">
              <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={promotion?.startsAt ?? ""} className="input" />
            </Field>
            <Field label="Hasta" name="endsAt" error={fe.endsAt} hint="Vacío = sin vencimiento. Si tiene fecha, se muestra una cuenta regresiva.">
              <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={promotion?.endsAt ?? ""} className="input" />
            </Field>
          </section>
          <section className="card space-y-3 p-6">
            <Toggle name="active" label="Activa" defaultChecked={promotion?.active ?? true} />
            <Toggle name="showOnHome" label="Mostrar en la portada" defaultChecked={promotion?.showOnHome ?? true} />
            <Field label="Orden" name="order">
              <input id="order" name="order" type="number" defaultValue={promotion?.order ?? 0} className="input" />
            </Field>
          </section>
        </aside>
      </div>
    </form>
  );
}
