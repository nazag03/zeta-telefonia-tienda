"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { saveTestimonialAction, createUserAction, resetUserPasswordAction } from "@/app/admin/actions/misc";
import { changePasswordAction } from "@/app/admin/actions/auth";
import { Field, FormAlert, SubmitButton, Toggle, useFormAction } from "./ui";

type T = { id: string; author: string; content: string; rating: number; source: string | null; active: boolean; order: number };

export function TestimonialForm({ t }: { t?: T }) {
  const [state, onSubmit, pending] = useFormAction(saveTestimonialAction);
  const ref = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  const key = t?.id ?? "new";
  useEffect(() => {
    if (state.ok && !t) ref.current?.reset();
  }, [state, t]);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      {t && <input type="hidden" name="id" value={t.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del cliente *" name={`author-${key}`} error={fe.author}>
          <input id={`author-${key}`} name="author" defaultValue={t?.author} required maxLength={80} className="input" />
        </Field>
        <Field label="Origen" name={`source-${key}`} hint="Ej: Reseña de Google, Instagram">
          <input id={`source-${key}`} name="source" defaultValue={t?.source ?? ""} maxLength={60} className="input" />
        </Field>
      </div>
      <Field label="Opinión *" name={`content-${key}`} error={fe.content}>
        <textarea id={`content-${key}`} name="content" defaultValue={t?.content} required rows={3} maxLength={600} className="input" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Puntuación" name={`rating-${key}`}>
          <select id={`rating-${key}`} name="rating" defaultValue={t?.rating ?? 5} className="input">
            {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{"★".repeat(n)}</option>))}
          </select>
        </Field>
        <Field label="Orden" name={`order-${key}`}>
          <input id={`order-${key}`} name="order" type="number" defaultValue={t?.order ?? 0} className="input" />
        </Field>
        <div className="self-end"><Toggle name="active" label="Visible" defaultChecked={t?.active ?? true} /></div>
      </div>
      <FormAlert state={state} />
      <SubmitButton pending={pending}>{t ? "Guardar" : "Agregar testimonio"}</SubmitButton>
    </form>
  );
}

export function Collapsible({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn-ghost btn-sm" aria-expanded={open}>
        {title} <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function CreateUserForm() {
  const [state, onSubmit, pending] = useFormAction(createUserAction);
  const ref = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <Field label="Nombre *" name="u-name" error={fe.name}><input id="u-name" name="name" required className="input" /></Field>
      <Field label="Email *" name="u-email" error={fe.email}><input id="u-email" name="email" type="email" required className="input" /></Field>
      <Field label="Contraseña *" name="u-pass" error={fe.password} hint="Mínimo 10 caracteres, con letras y números.">
        <input id="u-pass" name="password" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Field label="Rol" name="u-role" hint="Editor: gestiona productos, categorías y promociones. Administrador: además configuración y usuarios.">
        <select id="u-role" name="role" className="input">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending}>Crear usuario</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [state, onSubmit, pending] = useFormAction(resetUserPasswordAction);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <input type="hidden" name="id" value={id} />
      <input name="password" type="password" autoComplete="new-password" placeholder="Nueva contraseña" className="input sm:max-w-[220px]" required aria-label="Nueva contraseña" />
      <SubmitButton pending={pending} className="btn-sm">Restablecer</SubmitButton>
      <FormAlert state={state} />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, onSubmit, pending] = useFormAction(changePasswordAction);
  const ref = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} onSubmit={onSubmit} className="max-w-md space-y-4">
      <Field label="Contraseña actual" name="current" error={fe.current}><input id="current" name="current" type="password" autoComplete="current-password" required className="input" /></Field>
      <Field label="Nueva contraseña" name="next" error={fe.next} hint="Mínimo 10 caracteres, con letras y números."><input id="next" name="next" type="password" autoComplete="new-password" required className="input" /></Field>
      <Field label="Repetir nueva contraseña" name="confirm" error={fe.confirm}><input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" /></Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending}>Cambiar contraseña</SubmitButton>
    </form>
  );
}
