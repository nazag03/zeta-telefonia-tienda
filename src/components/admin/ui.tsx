"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import type { ActionState } from "@/lib/form";


export function useFormAction(action: (prev: ActionState, fd: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}

export function SubmitButton({ children, className, pendingText = "Guardando…", pending: pendingProp }: { children: React.ReactNode; className?: string; pendingText?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" disabled={pending} className={clsx("btn-primary", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

export function FormAlert({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
      </div>
    );
  if (state.ok && state.message)
    return (
      <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {state.message}
      </div>
    );
  return null;
}

export function Field({ label, name, error, hint, children, className }: { label: string; name?: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-ink-850 p-3 transition hover:border-white/20">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-ink-600 transition peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint && <span className="block text-xs text-ink-400">{hint}</span>}
      </span>
    </label>
  );
}


export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

const OK_MESSAGES: Record<string, string> = {
  creado: "Producto creado correctamente.",
  actualizado: "Cambios guardados.",
  eliminado: "Producto eliminado.",
  duplicado: "Producto duplicado. Está desactivado hasta que lo revises.",
  creada: "Promoción creada.",
  actualizada: "Promoción actualizada.",
};

export function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const error = params.get("error");
  
  const key = ok ?? error;
  const [dismissed, setDismissed] = useState<string | null>(null);
  const visible = !!key && dismissed !== key;

  useEffect(() => {
    if (!ok && !error) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.delete("ok");
      next.delete("error");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    }, 3500);
    return () => clearTimeout(t);
  }, [ok, error, params, pathname, router]);

  if (!visible) return null;
  const text = error === "permisos" ? "No tenés permisos para acceder a esa sección." : OK_MESSAGES[ok ?? ""] ?? "Listo.";
  return (
    <div className="fixed bottom-6 right-6 z-[80] flex max-w-sm animate-fade-up items-center gap-3 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm shadow-2xl" role="status">
      {error ? <AlertCircle className="h-5 w-5 text-red-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
      {text}
      <button onClick={() => setDismissed(key)} className="ml-2 text-ink-400 hover:text-white" aria-label="Cerrar"><X className="h-4 w-4" /></button>
    </div>
  );
}

export function ImagePreviewInput({ name, current, removeName, label, hint, aspect = "aspect-video" }: { name: string; current?: string | null; removeName?: string; label: string; hint?: string; aspect?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const shown = preview ?? (remove ? null : current);
  return (
    <div>
      <span className="label">{label}</span>
      <div className={clsx("relative overflow-hidden rounded-xl border border-dashed border-white/15 bg-ink-850", aspect)}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-xs text-ink-400">Sin imagen</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="btn-ghost btn-sm cursor-pointer">
          {current || preview ? "Cambiar" : "Subir imagen"}
          <input
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
              setRemove(false);
            }}
          />
        </label>
        {removeName && current && !preview && (
          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input type="checkbox" name={removeName} checked={remove} onChange={(e) => setRemove(e.target.checked)} className="accent-brand-500" /> Quitar
          </label>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-black uppercase text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-300">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
