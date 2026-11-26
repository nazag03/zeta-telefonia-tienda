import { db, sortBy } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ConfirmButton, PageHeader } from "@/components/admin/ui";
import { Collapsible, CreateUserForm, ResetPasswordForm } from "@/components/admin/SimpleForms";
import { updateUserAction } from "../../actions/misc";

export const metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const me = await requireUser("ADMIN");
  const users = sortBy(await db.users.all(), ["createdAt", "asc"]).map(({ id, name, email, role, active, lastLoginAt }) => ({ id, name, email, role, active, lastLoginAt }));
  return (
    <>
      <PageHeader title="Usuarios" description="Personas con acceso al panel." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className={`card p-5 ${u.active ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/15 font-bold text-brand-300">{u.name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{u.name} {u.id === me.id && <span className="text-xs text-ink-400">(vos)</span>}</p>
                  <p className="text-xs text-ink-400">
                    {u.email} · {u.role === "ADMIN" ? "Administrador" : "Editor"} · {u.active ? "Activo" : "Desactivado"}
                    {u.lastLoginAt && ` · último ingreso ${u.lastLoginAt.toLocaleDateString("es-AR")}`}
                  </p>
                </div>
                {u.id !== me.id && (
                  <div className="flex flex-wrap gap-2">
                    <form action={updateUserAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="op" value="role" />
                      <input type="hidden" name="role" value={u.role === "ADMIN" ? "EDITOR" : "ADMIN"} />
                      <button className="btn-ghost btn-sm">{u.role === "ADMIN" ? "Pasar a editor" : "Hacer admin"}</button>
                    </form>
                    <form action={updateUserAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="op" value="toggle" />
                      <button className="btn-ghost btn-sm">{u.active ? "Desactivar" : "Activar"}</button>
                    </form>
                    <form action={updateUserAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="op" value="delete" />
                      <ConfirmButton message={`¿Eliminar a ${u.name}?`} className="btn-ghost btn-sm hover:border-red-500/50 hover:text-red-300">Eliminar</ConfirmButton>
                    </form>
                  </div>
                )}
              </div>
              {u.id !== me.id && (
                <div className="mt-4"><Collapsible title="Restablecer contraseña"><ResetPasswordForm id={u.id} /></Collapsible></div>
              )}
            </li>
          ))}
        </ul>
        <section className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Nuevo usuario</h2>
          <CreateUserForm />
        </section>
      </div>
    </>
  );
}
