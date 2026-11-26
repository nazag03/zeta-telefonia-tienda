"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, EyeOff, FolderTree, Home, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/actions/categories";
import { CategoryForm } from "./CategoryForm";
import { ConfirmButton } from "./ui";

type Cat = { id: string; name: string; slug: string; description: string | null; image: string | null; order: number; active: boolean; showOnHome: boolean; _count: { products: number } };

export function CategoryRow({ c }: { c: Cat }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="card overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-800">
          {c.image ? <Image src={c.image} alt="" fill sizes="48px" className="object-cover" /> : <FolderTree className="h-5 w-5 text-ink-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-semibold text-white">
            {c.name}
            {!c.active && <EyeOff className="h-3.5 w-3.5 text-ink-400" aria-label="Oculta" />}
            {c.showOnHome && c.active && <Home className="h-3.5 w-3.5 text-brand-400" aria-label="En portada" />}
          </p>
          <p className="text-xs text-ink-400">
            /catalogo/{c.slug} · <Link href={`/admin/productos?categoria=${c.id}`} className="hover:text-brand-300">{c._count.products} productos</Link> · orden {c.order}
          </p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost btn-sm" aria-expanded={open}>
          Editar <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={c.id} />
          <ConfirmButton
            message={`¿Eliminar la categoría "${c.name}"?${c._count.products ? ` Sus ${c._count.products} productos quedarán sin categoría (no se eliminan).` : ""}`}
            className="rounded-lg p-2 text-ink-300 hover:bg-red-500/15 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </form>
      </div>
      {open && (
        <div className="border-t border-white/5 bg-ink-850/50 p-5">
          <CategoryForm category={c} />
        </div>
      )}
    </li>
  );
}
