"use client";

import { useEffect, useRef, useState } from "react";
import { saveCategoryAction } from "@/app/admin/actions/categories";
import { slugify } from "@/lib/format";
import { Field, FormAlert, ImagePreviewInput, SubmitButton, Toggle, useFormAction } from "./ui";

type Cat = { id: string; name: string; slug: string; description: string | null; image: string | null; order: number; active: boolean; showOnHome: boolean };

export function CategoryForm({ category }: { category?: Cat }) {
  const [state, onSubmit, pending] = useFormAction(saveCategoryAction);
  const [name, setName] = useState(category?.name ?? "");
  const [slugInput, setSlugInput] = useState(category?.slug ?? "");
  const [touched, setTouched] = useState(!!category);
  
  const slug = touched ? slugInput : slugify(name);
  const formRef = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};

  
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.ok && !category) {
      setName("");
      setSlugInput("");
      setTouched(false);
    }
  }
  useEffect(() => {
    if (state.ok && !category) formRef.current?.reset();
  }, [state, category]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre *" name={`name-${category?.id ?? "new"}`} error={fe.name}>
          <input id={`name-${category?.id ?? "new"}`} name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="input" placeholder="Ej: Auriculares" />
        </Field>
        <Field label="URL" name={`slug-${category?.id ?? "new"}`} error={fe.slug} hint={`/catalogo/${slug || "…"}`}>
          <input id={`slug-${category?.id ?? "new"}`} name="slug" value={slug} onChange={(e) => { setTouched(true); setSlugInput(slugify(e.target.value)); }} maxLength={70} className="input font-mono text-xs" />
        </Field>
      </div>
      <Field label="Descripción" name={`desc-${category?.id ?? "new"}`} hint="Opcional. Se muestra al entrar a la categoría.">
        <textarea id={`desc-${category?.id ?? "new"}`} name="description" defaultValue={category?.description ?? ""} rows={2} maxLength={400} className="input" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <ImagePreviewInput name="image" current={category?.image} removeName="removeImage" label="Imagen" aspect="aspect-[4/3]" />
        <div className="space-y-3">
          <Field label="Orden" name={`order-${category?.id ?? "new"}`} hint="Menor número = aparece antes.">
            <input id={`order-${category?.id ?? "new"}`} name="order" type="number" defaultValue={category?.order ?? 0} className="input" />
          </Field>
          <Toggle name="active" label="Visible" defaultChecked={category?.active ?? true} />
          <Toggle name="showOnHome" label="Mostrar en la portada" defaultChecked={category?.showOnHome ?? true} />
        </div>
      </div>
      <FormAlert state={state} />
      <SubmitButton pending={pending}>{category ? "Guardar" : "Crear categoría"}</SubmitButton>
    </form>
  );
}
