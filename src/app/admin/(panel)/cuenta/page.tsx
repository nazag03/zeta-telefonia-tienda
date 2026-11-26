import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ChangePasswordForm } from "@/components/admin/SimpleForms";

export const metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Mi cuenta" description={`${user.name} · ${user.email}`} />
      <section className="card p-6">
        <h2 className="mb-4 font-display text-lg font-extrabold uppercase">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}
