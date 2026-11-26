"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, ImagePlus, Palette, Plus, Star, Trash2, X } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions/products";
import { slugify, type Spec, type VariantLike } from "@/lib/format";
import { Field, FormAlert, SubmitButton, Toggle, useFormAction } from "./ui";

type Img = { id: string; url: string; alt: string | null };

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  model: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number | null;
  promoPrice: number | null;
  priceUsd: number | null;
  promoPriceUsd: number | null;
  currency: string;
  availability: string;
  condition: string;
  categoryId: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isOffer: boolean;
  active: boolean;
  order: number;
  specs: Spec[];
  images: Img[];
  variants?: VariantLike[];
};


type VariantForm = {
  key: string;
  id?: string;
  name: string;
  hex: string;
  imageKeys: string[];
  ownPrice: boolean;
  price: string;
  promoPrice: string;
  priceUsd: string;
  promoPriceUsd: string;
  availability: string;
};

let keySeq = 0;
const tempKey = () => `n${Date.now().toString(36)}${(keySeq++).toString(36)}`;

const SPEC_PRESETS: Record<string, string[]> = {
  Celular: ["Almacenamiento", "Memoria RAM", "Pantalla", "Cámara principal", "Batería", "Condición de batería", "Color", "Procesador", "Garantía"],
  Accesorio: ["Compatibilidad", "Conectividad", "Autonomía", "Color", "Material", "Garantía"],
};

export function ProductForm({ product, categories, brands }: { product?: ProductFormData; categories: { id: string; name: string }[]; brands: string[] }) {
  const [state, onSubmit, pending] = useFormAction(saveProductAction);
  const fe = state.fieldErrors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slugInput, setSlugInput] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product?.slug);
  const slug = slugTouched ? slugInput : slugify(name);
  const initial = (v: number | null | undefined) => (v != null && v > 0 ? String(Math.round(v)) : "");
  const [price, setPrice] = useState(initial(product?.price));
  const [promo, setPromo] = useState(initial(product?.promoPrice));
  const [priceUsd, setPriceUsd] = useState(initial(product?.priceUsd));
  const [promoUsd, setPromoUsd] = useState(initial(product?.promoPriceUsd));
  const [currency, setCurrency] = useState(product?.currency === "USD" ? "USD" : "ARS");
  const [pct, setPct] = useState("");
  const [specs, setSpecs] = useState<Spec[]>(product?.specs.length ? product.specs : [{ label: "", value: "" }]);
  const [kept, setKept] = useState<Img[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<{ file: File; url: string; key: string }[]>([]);
  const [variants, setVariants] = useState<VariantForm[]>(() =>
    (product?.variants ?? []).map((v) => ({
      key: v.id,
      id: v.id,
      name: v.name,
      hex: v.hex ?? "#d4d4d8",
      imageKeys: v.imageIds,
      ownPrice: v.ownPrice,
      price: initial(v.price),
      promoPrice: initial(v.promoPrice),
      priceUsd: initial(v.priceUsd),
      promoPriceUsd: initial(v.promoPriceUsd),
      availability: v.availability ?? "",
    }))
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  
  useEffect(() => {
    if (!fileInput.current) return;
    const dt = new DataTransfer();
    newFiles.forEach((f) => dt.items.add(f.file));
    fileInput.current.files = dt.files;
  }, [newFiles]);

  const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;
  const pctOff = (p: string, pr: string) => (num(p) && num(pr) && num(pr) < num(p) ? Math.round((1 - num(pr) / num(p)) * 100) : 0);
  const discount = pctOff(price, promo);
  const discountUsd = pctOff(priceUsd, promoUsd);
  const noPrice = !price.trim() && !priceUsd.trim();
  const clean = (v: string) => v.replace(/[^\d.,]/g, "");
  const totalImages = kept.length + newFiles.length;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const room = 12 - totalImages;
    const add = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room))
      .map((file) => ({ file, url: URL.createObjectURL(file), key: tempKey() }));
    setNewFiles((prev) => [...prev, ...add]);
  }

  function move(i: number, d: number) {
    setKept((arr) => {
      const next = [...arr];
      const j = i + d;
      if (j < 0 || j >= next.length) return arr;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  
  const allPhotos = [...kept.map((k) => ({ key: k.id, url: k.url })), ...newFiles.map((f) => ({ key: f.key, url: f.url }))];
  const photoKeys = new Set(allPhotos.map((x) => x.key));

  const setVariant = (key: string, patch: Partial<VariantForm>) => setVariants((arr) => arr.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const moveVariant = (i: number, d: number) =>
    setVariants((arr) => {
      const j = i + d;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const variantsJson = JSON.stringify(
    variants.map(({ key: _k, ...v }) => ({ ...v, imageKeys: v.imageKeys.filter((k) => photoKeys.has(k)), availability: v.availability || null }))
  );

  const specsJson = useMemo(() => JSON.stringify(specs.filter((s) => s.label.trim() && s.value.trim())), [specs]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="specs" value={specsJson} />
      <input type="hidden" name="keptImages" value={JSON.stringify(kept.map((k) => ({ id: k.id, alt: k.alt ?? "" })))} />
      <input type="hidden" name="newImageKeys" value={JSON.stringify(newFiles.map((f) => f.key))} />
      <input type="hidden" name="variants" value={variantsJson} />

      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/productos" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        <SubmitButton pending={pending}>{product?.id ? "Guardar cambios" : "Crear producto"}</SubmitButton>
      </div>
      <FormAlert state={state} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">Información principal</h2>
            <Field label="Nombre del producto *" name="name" error={fe.name}>
              <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={140} placeholder="Ej: iPhone 15 128GB Negro" className="input" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Marca *" name="brand" error={fe.brand}>
                <input id="brand" name="brand" defaultValue={product?.brand} required maxLength={60} list="brands" placeholder="Apple, Samsung…" className="input" />
                <datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
              </Field>
              <Field label="Modelo" name="model" error={fe.model}>
                <input id="model" name="model" defaultValue={product?.model ?? ""} maxLength={80} placeholder="Ej: A3090" className="input" />
              </Field>
            </div>
            <Field label="Descripción corta" name="shortDescription" hint="Se muestra debajo del título y en Google (máx. 280 caracteres).">
              <textarea id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} maxLength={280} rows={2} className="input" />
            </Field>
            <Field label="Descripción completa" name="description" hint="Podés separar párrafos con una línea en blanco.">
              <textarea id="description" name="description" defaultValue={product?.description ?? ""} maxLength={8000} rows={7} className="input" />
            </Field>
          </section>

          <section className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase">Fotos</h2>
              <span className="text-xs text-ink-400">{totalImages}/12 · La primera es la portada</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {kept.map((img, i) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-ink-850">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="badge absolute left-2 top-2 bg-brand-500 text-white"><Star className="mr-1 h-3 w-3" />Portada</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/90 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md bg-white/15 p-1.5 disabled:opacity-30" aria-label="Mover antes"><ArrowUp className="h-3.5 w-3.5 -rotate-90" /></button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === kept.length - 1} className="rounded-md bg-white/15 p-1.5 disabled:opacity-30" aria-label="Mover después"><ArrowDown className="h-3.5 w-3.5 -rotate-90" /></button>
                    </div>
                    <button type="button" onClick={() => setKept((k) => k.filter((x) => x.id !== img.id))} className="rounded-md bg-red-500/80 p-1.5" aria-label="Quitar foto"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div key={f.url} className="relative aspect-square overflow-hidden rounded-xl border border-brand-500/40 bg-ink-850">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="h-full w-full object-cover" />
                  <span className="badge absolute left-2 top-2 bg-ink-950/80 text-brand-300">{kept.length === 0 && i === 0 ? "Portada · nueva" : "Nueva"}</span>
                  <button type="button" onClick={() => setNewFiles((arr) => arr.filter((x) => x.url !== f.url))} className="absolute right-2 top-2 rounded-md bg-black/70 p-1.5" aria-label="Quitar foto nueva"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {totalImages < 12 && (
                <label
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 text-center text-xs text-ink-400 transition hover:border-brand-500 hover:text-brand-300"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <ImagePlus className="h-7 w-7" />
                  Agregar fotos<br />(o arrastrarlas)
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
              )}
            </div>
            <input ref={fileInput} type="file" name="newImages" multiple className="hidden" tabIndex={-1} aria-hidden />
            <p className="text-xs text-ink-400">JPG, PNG, WebP o AVIF, hasta 8 MB cada una. Se optimizan automáticamente.</p>
          </section>

          <section className="card space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-extrabold uppercase">Colores</h2>
              <span className="text-xs text-ink-400">Opcional</span>
            </div>
            <p className="text-xs text-ink-400">
              Si el equipo viene en varios colores, cargalos acá. En la web el cliente toca el color y ve sus fotos y su precio.
              Si un color sale distinto, activá “Precio distinto” solo en ese; los demás usan el precio del producto.
            </p>

            {variants.map((v, i) => {
              const selected = v.imageKeys.filter((k) => photoKeys.has(k));
              return (
                <div key={v.key} className="space-y-3 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v.hex}
                      onChange={(e) => setVariant(v.key, { hex: e.target.value })}
                      className="h-10 w-10 shrink-0 cursor-pointer rounded-full border border-white/20 bg-transparent p-0.5"
                      aria-label={`Muestra de color de ${v.name || "este color"}`}
                      title="Color de la muestra"
                    />
                    <input
                      value={v.name}
                      onChange={(e) => setVariant(v.key, { name: e.target.value })}
                      placeholder="Nombre del color (ej. Titanio negro)"
                      maxLength={60}
                      className="input min-w-0 flex-1"
                      aria-label="Nombre del color"
                    />
                    <button type="button" onClick={() => moveVariant(i, -1)} disabled={i === 0} className="rounded-md p-2 text-ink-400 hover:bg-white/10 disabled:opacity-30" aria-label="Subir color"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveVariant(i, 1)} disabled={i === variants.length - 1} className="rounded-md p-2 text-ink-400 hover:bg-white/10 disabled:opacity-30" aria-label="Bajar color"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setVariants((arr) => arr.filter((x) => x.key !== v.key))} className="rounded-md p-2 text-ink-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Quitar color"><Trash2 className="h-4 w-4" /></button>
                  </div>

                  <div>
                    <p className="label">Fotos de este color {selected.length > 0 && <span className="font-normal text-ink-400">· {selected.length} elegidas</span>}</p>
                    {allPhotos.length === 0 ? (
                      <p className="text-xs text-ink-400">Primero agregá fotos en la sección “Fotos”.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allPhotos.map((ph) => {
                          const on = v.imageKeys.includes(ph.key);
                          return (
                            <button
                              key={ph.key}
                              type="button"
                              onClick={() => setVariant(v.key, { imageKeys: on ? v.imageKeys.filter((k) => k !== ph.key) : [...v.imageKeys, ph.key] })}
                              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${on ? "border-brand-500" : "border-transparent opacity-50 hover:opacity-100"}`}
                              aria-pressed={on}
                              aria-label={on ? "Quitar foto de este color" : "Usar foto para este color"}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ph.url} alt="" className="h-full w-full object-cover" />
                              {on && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white"><Check className="h-3 w-3" /></span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-1.5 text-xs text-ink-400">Tocá las fotos que muestran este color. Las fotos que no elijas para ningún color (caja, accesorios…) se ven en todos.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor={`v-av-${v.key}`}>Disponibilidad</label>
                      <select id={`v-av-${v.key}`} value={v.availability} onChange={(e) => setVariant(v.key, { availability: e.target.value })} className="input">
                        <option value="">Igual que el producto</option>
                        <option value="IN_STOCK">Disponible</option>
                        <option value="LOW_STOCK">Últimas unidades</option>
                        <option value="ON_ORDER">A pedido</option>
                        <option value="OUT_OF_STOCK">Sin stock</option>
                      </select>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-lg border border-white/10 px-3 py-2.5 text-sm">
                      <input type="checkbox" checked={v.ownPrice} onChange={(e) => setVariant(v.key, { ownPrice: e.target.checked })} className="h-4 w-4 accent-brand-500" />
                      Precio distinto al del producto
                    </label>
                  </div>

                  {v.ownPrice && (
                    <div className="grid gap-3 rounded-lg bg-white/[.03] p-3 sm:grid-cols-2">
                      {([
                        ["price", "Precio en pesos ($)", "Sin precio en pesos"],
                        ["promoPrice", "Promo en pesos", "—"],
                        ["priceUsd", "Precio en dólares (US$)", "Sin precio en dólares"],
                        ["promoPriceUsd", "Promo en dólares", "—"],
                      ] as const).map(([k, label, ph]) => (
                        <div key={k}>
                          <label className="label" htmlFor={`v-${k}-${v.key}`}>{label}</label>
                          <input id={`v-${k}-${v.key}`} value={v[k]} onChange={(e) => setVariant(v.key, { [k]: clean(e.target.value) })} inputMode="numeric" placeholder={ph} className="input tabular-nums" />
                        </div>
                      ))}
                      <p className="text-xs text-ink-400 sm:col-span-2">Si dejás los dos precios vacíos, este color muestra “Consultar precio”.</p>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setVariants((arr) => [
                  ...arr,
                  { key: tempKey(), name: "", hex: "#d4d4d8", imageKeys: [], ownPrice: false, price: "", promoPrice: "", priceUsd: "", promoPriceUsd: "", availability: "" },
                ])
              }
              className="btn-ghost btn-sm"
            >
              <Palette className="h-4 w-4" /> Agregar color
            </button>
          </section>
          <section className="card space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-extrabold uppercase">Características técnicas</h2>
              <div className="flex gap-2">
                {Object.entries(SPEC_PRESETS).map(([k, labels]) => (
                  <button
                    key={k}
                    type="button"
                    className="chip"
                    onClick={() =>
                      setSpecs((s) => {
                        const existing = new Set(s.map((x) => x.label));
                        return [...s.filter((x) => x.label || x.value), ...labels.filter((l) => !existing.has(l)).map((label) => ({ label, value: "" }))];
                      })
                    }
                  >
                    + Plantilla {k.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input value={s.label} onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Ej: Almacenamiento" maxLength={60} className="input" aria-label="Característica" />
                  <input value={s.value} onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="Ej: 128 GB" maxLength={200} className="input" aria-label="Valor" />
                  <button type="button" onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))} className="rounded-lg px-2 text-ink-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])} className="btn-ghost btn-sm"><Plus className="h-4 w-4" /> Agregar característica</button>
            <p className="text-xs text-ink-400">Las filas con algún campo vacío no se guardan.</p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">Precio</h2>
            <p className="text-xs text-ink-400">
              Podés cargar el precio en pesos, en dólares o en los dos. {noPrice && "Sin ningún precio, en la web se muestra “Consultar precio”."}
            </p>

            <div className="space-y-3 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white">En pesos ($)</h3>
              <Field label="Precio" name="price" error={fe.price}>
                <input id="price" name="price" value={price} onChange={(e) => setPrice(clean(e.target.value))} inputMode="numeric" className="input text-lg font-semibold tabular-nums" placeholder="Sin precio en pesos" />
              </Field>
              <Field label="Precio promocional" name="promoPrice" error={fe.promoPrice} hint={discount ? `Descuento: ${discount}%` : "Opcional."}>
                <input id="promoPrice" name="promoPrice" value={promo} onChange={(e) => setPromo(clean(e.target.value))} inputMode="numeric" className="input tabular-nums" placeholder="—" />
              </Field>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white">En dólares (US$)</h3>
              <Field label="Precio" name="priceUsd" error={fe.priceUsd}>
                <input id="priceUsd" name="priceUsd" value={priceUsd} onChange={(e) => setPriceUsd(clean(e.target.value))} inputMode="numeric" className="input text-lg font-semibold tabular-nums" placeholder="Sin precio en dólares" />
              </Field>
              <Field label="Precio promocional" name="promoPriceUsd" error={fe.promoPriceUsd} hint={discountUsd ? `Descuento: ${discountUsd}%` : "Opcional."}>
                <input id="promoPriceUsd" name="promoPriceUsd" value={promoUsd} onChange={(e) => setPromoUsd(clean(e.target.value))} inputMode="numeric" className="input tabular-nums" placeholder="—" />
              </Field>
            </div>

            <Field label="Moneda principal" name="currency" hint="Se muestra primero (más grande) y se usa para ordenar por precio.">
              <select id="currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
                <option value="ARS">Pesos ($)</option>
                <option value="USD">Dólares (US$)</option>
              </select>
            </Field>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="label" htmlFor="pct">Aplicar descuento %</label>
                <input id="pct" value={pct} onChange={(e) => setPct(e.target.value.replace(/[^\d]/g, "").slice(0, 2))} inputMode="numeric" placeholder="Ej: 10" className="input" />
              </div>
              <button
                type="button"
                className="btn-ghost"
                title="Calcula el precio promocional en las dos monedas"
                disabled={(!num(price) && !num(priceUsd)) || !Number(pct)}
                onClick={() => {
                  const off = (v: string) => String(Math.round(num(v) * (1 - Number(pct) / 100)));
                  if (num(price)) setPromo(off(price));
                  if (num(priceUsd)) setPromoUsd(off(priceUsd));
                }}
              >
                Calcular
              </button>
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">Organización</h2>
            <Field label="Categoría" name="categoryId" error={fe.categoryId}>
              <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} className="input">
                <option value="">Sin categoría</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </Field>
            <Field label="Disponibilidad" name="availability">
              <select id="availability" name="availability" defaultValue={product?.availability ?? "IN_STOCK"} className="input">
                <option value="IN_STOCK">Disponible</option>
                <option value="LOW_STOCK">Últimas unidades</option>
                <option value="ON_ORDER">A pedido</option>
                <option value="OUT_OF_STOCK">Sin stock</option>
              </select>
            </Field>
            <Field label="Condición" name="condition">
              <select id="condition" name="condition" defaultValue={product?.condition ?? "NEW"} className="input">
                <option value="NEW">Nuevo / Sellado</option>
                <option value="USED">Usado</option>
                <option value="REFURBISHED">Reacondicionado</option>
              </select>
            </Field>
          </section>

          <section className="card space-y-3 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">Visibilidad y etiquetas</h2>
            <Toggle name="active" label="Publicado" hint="Visible en la web." defaultChecked={product?.active ?? true} />
            <Toggle name="isFeatured" label="Destacado" hint="Aparece en “Los más elegidos” de la portada." defaultChecked={product?.isFeatured} />
            <Toggle name="isNew" label="Nuevo ingreso" hint="Muestra la etiqueta NUEVO." defaultChecked={product?.isNew} />
            <Toggle name="isOffer" label="Oferta" hint="Muestra la etiqueta OFERTA aunque no tenga precio promocional." defaultChecked={product?.isOffer} />
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-extrabold uppercase">SEO y orden</h2>
            <Field label="URL amigable" name="slug" error={fe.slug} hint={`/producto/${slug || "…"}`}>
              <input id="slug" name="slug" value={slug} onChange={(e) => { setSlugTouched(true); setSlugInput(slugify(e.target.value)); }} maxLength={90} className="input font-mono text-xs" />
            </Field>
            <Field label="Prioridad de orden" name="order" hint="Menor número = aparece antes.">
              <input id="order" name="order" type="number" defaultValue={product?.order ?? 0} className="input" />
            </Field>
          </section>
        </aside>
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton pending={pending} className="shadow-2xl">{product?.id ? "Guardar cambios" : "Crear producto"}</SubmitButton>
      </div>
    </form>
  );
}
