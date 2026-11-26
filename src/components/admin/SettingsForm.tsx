"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions/misc";
import type { SiteSettings } from "@/lib/settings-schema";
import { waLink } from "@/lib/whatsapp";
import { Field, FormAlert, ImagePreviewInput, SubmitButton, useFormAction } from "./ui";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card grid gap-6 p-6 lg:grid-cols-[240px_1fr]">
      <div>
        <h2 className="font-display text-lg font-extrabold uppercase">{title}</h2>
        {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ s }: { s: SiteSettings }) {
  const [state, onSubmit, pending] = useFormAction(saveSettingsAction);
  const fe = state.fieldErrors ?? {};
  const [hours, setHours] = useState(s.hours);
  const [benefits, setBenefits] = useState(s.benefits);
  const [highlights, setHighlights] = useState(s.highlights);
  const [wa, setWa] = useState(s.whatsapp);

  const text = (name: keyof SiteSettings, label: string, opts: { hint?: string; max?: number; area?: number; placeholder?: string } = {}) => (
    <Field label={label} name={name} error={fe[name]} hint={opts.hint}>
      {opts.area ? (
        <textarea id={name} name={name} defaultValue={String(s[name] ?? "")} rows={opts.area} maxLength={opts.max} placeholder={opts.placeholder} className="input" />
      ) : (
        <input id={name} name={name} defaultValue={String(s[name] ?? "")} maxLength={opts.max} placeholder={opts.placeholder} className="input" />
      )}
    </Field>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="hours" value={JSON.stringify(hours)} />
      <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />
      <input type="hidden" name="highlights" value={JSON.stringify(highlights)} />

      <div className="flex justify-end"><SubmitButton pending={pending}>Guardar configuración</SubmitButton></div>
      <FormAlert state={state} />

      <Section title="Negocio" description="Nombre, frase y logotipo.">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("businessName", "Nombre del negocio *", { max: 80 })}
          {text("tagline", "Frase / slogan", { max: 140 })}
        </div>
        <div className="max-w-xs">
          <ImagePreviewInput name="logoUrlFile" current={s.logoUrl} removeName="logoUrlRemove" label="Logotipo" aspect="aspect-[3/1]" hint="PNG con fondo transparente recomendado. Si no se sube, se usa el logo naranja de Zeta." />
        </div>
      </Section>

      <Section title="WhatsApp y contacto" description="Este número se usa en TODOS los botones de la web.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Número de WhatsApp *" name="whatsapp" error={fe.whatsapp} hint="Formato internacional sin + ni espacios: 549 + característica + número.">
            <input id="whatsapp" name="whatsapp" value={wa} onChange={(e) => setWa(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="5493564523018" className="input font-mono" required />
          </Field>
          {text("whatsappDisplay", "Número visible", { hint: "Cómo se muestra en la web. Ej: 3564 523018", max: 40 })}
        </div>
        {wa && (
          <a href={waLink(wa, "Prueba desde el panel de Zeta Telefonía")} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-[#25D366] hover:underline">
            Probar el número en WhatsApp →
          </a>
        )}
        {text("whatsappGreeting", "Mensaje predeterminado", { area: 2, max: 400, hint: "Se usa en el botón general de WhatsApp." })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("email", "Email (opcional)", { max: 120 })}
          {text("city", "Ciudad", { max: 80 })}
        </div>
        {text("address", "Dirección", { max: 160 })}
        {text("mapsQuery", "Búsqueda para Google Maps", { max: 240, hint: "Dirección completa que se usa para el mapa y el botón “Cómo llegar”." })}
        <div>
          <span className="label">Horarios de atención</span>
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <input value={h.days} onChange={(e) => setHours((a) => a.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))} placeholder="Lunes a viernes" maxLength={60} className="input" aria-label="Días" />
                <input value={h.hours} onChange={(e) => setHours((a) => a.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} placeholder="9:00 a 12:30 y 16:00 a 20:00" maxLength={80} className="input" aria-label="Horario" />
                <button type="button" onClick={() => setHours((a) => a.filter((_, j) => j !== i))} className="rounded-lg px-2 text-ink-400 hover:text-red-400" aria-label="Quitar horario"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {hours.length < 10 && <button type="button" onClick={() => setHours((a) => [...a, { days: "", hours: "" }])} className="btn-ghost btn-sm mt-2"><Plus className="h-4 w-4" /> Agregar horario</button>}
        </div>
      </Section>

      <Section title="Redes sociales" description="Dejá vacío lo que no uses: no se mostrará.">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("instagramUrl", "Instagram (URL)", { max: 200 })}
          {text("instagramHandle", "Usuario de Instagram", { max: 60, hint: "Sin @" })}
          {text("facebookUrl", "Facebook (URL)", { max: 200 })}
          {text("tiktokUrl", "TikTok (URL)", { max: 200 })}
        </div>
      </Section>

      <Section title="Portada" description="Textos e imagen principal de la página de inicio.">
        {text("announcement", "Barra de anuncio superior", { max: 160, hint: "Vacío para ocultarla." })}
        {text("heroEyebrow", "Texto superior", { max: 80 })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("heroTitle", "Título", { max: 120 })}
          {text("heroHighlight", "Título destacado (naranja)", { max: 60 })}
        </div>
        {text("heroSubtitle", "Subtítulo", { area: 3, max: 320 })}
        {text("heroCtaLabel", "Texto del botón principal", { max: 40 })}
        <div className="max-w-sm">
          <ImagePreviewInput name="heroImageFile" current={s.heroImage} removeName="heroImageRemove" label="Imagen destacada" aspect="aspect-[4/5]" hint="Vertical, mínimo 1000 px de ancho. Sin imagen se muestra la composición gráfica de equipos." />
        </div>
        <div>
          <span className="label">Datos destacados</span>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input value={h} onChange={(e) => setHighlights((a) => a.map((x, j) => (j === i ? e.target.value : x)))} maxLength={40} className="input" aria-label="Dato destacado" />
                <button type="button" onClick={() => setHighlights((a) => a.filter((_, j) => j !== i))} className="rounded-lg px-2 text-ink-400 hover:text-red-400" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {highlights.length < 6 && <button type="button" onClick={() => setHighlights((a) => [...a, ""])} className="btn-ghost btn-sm mt-2"><Plus className="h-4 w-4" /> Agregar</button>}
        </div>
      </Section>

      <Section title="Beneficios" description="Sección “Comprá con tranquilidad”.">
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-white/5 p-3 sm:grid-cols-[1fr_2fr_auto]">
              <input value={b.title} onChange={(e) => setBenefits((a) => a.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Título" maxLength={60} className="input" aria-label="Título del beneficio" />
              <input value={b.text} onChange={(e) => setBenefits((a) => a.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} placeholder="Descripción" maxLength={220} className="input" aria-label="Descripción del beneficio" />
              <button type="button" onClick={() => setBenefits((a) => a.filter((_, j) => j !== i))} className="rounded-lg px-2 text-ink-400 hover:text-red-400" aria-label="Quitar beneficio"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        {benefits.length < 8 && <button type="button" onClick={() => setBenefits((a) => [...a, { title: "", text: "" }])} className="btn-ghost btn-sm"><Plus className="h-4 w-4" /> Agregar beneficio</button>}
      </Section>

      <Section title="Sobre nosotros" description="Contá la historia real del negocio.">
        {text("aboutTitle", "Título", { max: 120 })}
        {text("aboutText", "Texto", { area: 8, max: 4000, hint: "Separá párrafos con una línea en blanco." })}
        <div className="max-w-sm">
          <ImagePreviewInput name="aboutImageFile" current={s.aboutImage} removeName="aboutImageRemove" label="Foto del local o del equipo" aspect="aspect-square" />
        </div>
      </Section>

      <Section title="Pagos y envíos" description="Texto informativo que aparece en Contacto y en la portada.">
        {text("paymentInfo", "Información comercial", { area: 3, max: 600 })}
      </Section>

      <Section title="SEO" description="Cómo aparece la web en Google y al compartirla.">
        {text("seoTitle", "Título para Google", { max: 80 })}
        {text("seoDescription", "Descripción para Google", { area: 2, max: 200 })}
      </Section>

      <div className="sticky bottom-4 z-10 flex justify-end"><SubmitButton pending={pending} className="shadow-2xl">Guardar configuración</SubmitButton></div>
    </form>
  );
}
