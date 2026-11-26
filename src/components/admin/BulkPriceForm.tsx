"use client";

import { useActionState } from "react";
import { bulkPriceAction } from "@/app/admin/actions/products";
import { ConfirmButton, FormAlert } from "./ui";

export function BulkPriceForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action] = useActionState(bulkPriceAction, {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="bp-cat">Categoría</label>
          <select id="bp-cat" name="categoryId" className="input">
            <option value="">Todo el catálogo</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="bp-cur">Precios a ajustar</label>
          <select id="bp-cur" name="currency" className="input">
            <option value="">Pesos y dólares</option>
            <option value="ARS">Pesos (ARS)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="bp-pct">Variación %</label>
          <input id="bp-pct" name="percent" placeholder="Ej: 10 o -5" className="input" inputMode="decimal" required />
        </div>
        <ConfirmButton message="¿Aplicar el ajuste de precios? Se modificarán los precios normales y promocionales de los productos seleccionados." className="btn-primary">
          Aplicar ajuste
        </ConfirmButton>
      </div>
      <FormAlert state={state} />
    </form>
  );
}
