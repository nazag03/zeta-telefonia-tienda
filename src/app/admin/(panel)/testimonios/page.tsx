import { Star, Trash2, EyeOff } from "lucide-react";
import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ConfirmButton, PageHeader } from "@/components/admin/ui";
import { Collapsible, TestimonialForm } from "@/components/admin/SimpleForms";
import { deleteTestimonialAction } from "../../actions/misc";

export const metadata = { title: "Testimonios" };

export default async function TestimonialsAdmin() {
  await requireUser();
  const items = sortBy(await db.testimonials.all(), ["order", "asc"], ["createdAt", "desc"]);
  return (
    <>
      <PageHeader title="Testimonios" description="Cargá solo opiniones reales de clientes (por ejemplo, reseñas de Google o mensajes con permiso). La sección se oculta en la web si no hay ninguno visible." />
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-3">
          {items.map((t) => (
            <li key={t.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{t.author}</p>
                    {t.source && <span className="text-xs text-ink-400">· {t.source}</span>}
                    {!t.active && <EyeOff className="h-3.5 w-3.5 text-ink-400" aria-label="Oculto" />}
                  </div>
                  <div className="mt-1 flex gap-0.5 text-brand-400">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
                  <p className="mt-2 text-sm text-ink-200">“{t.content}”</p>
                </div>
                <form action={deleteTestimonialAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton message="¿Eliminar este testimonio?" className="rounded-lg p-2 text-ink-300 hover:bg-red-500/15 hover:text-red-400"><Trash2 className="h-4 w-4" /></ConfirmButton>
                </form>
              </div>
              <div className="mt-4"><Collapsible title="Editar"><TestimonialForm t={t} /></Collapsible></div>
            </li>
          ))}
          {items.length === 0 && <li className="card p-8 text-center text-sm text-ink-400">No hay testimonios cargados. La sección no se muestra en la web hasta que agregues alguno.</li>}
        </ul>
        <section className="card h-fit p-6 lg:sticky lg:top-8">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Nuevo testimonio</h2>
          <TestimonialForm />
        </section>
      </div>
    </>
  );
}
