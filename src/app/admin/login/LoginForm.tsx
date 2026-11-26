"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "../actions/auth";
import { FormAlert, SubmitButton, useFormAction } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, onSubmit, pending] = useFormAction(loginAction);
  const [show, setShow] = useState(false);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="input pr-11" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-white" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full py-3" pendingText="Ingresando…">Ingresar</SubmitButton>
    </form>
  );
}
