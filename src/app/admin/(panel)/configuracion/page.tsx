import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requireUser("ADMIN");
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Configuración" description="Información comercial y textos de la web. Los cambios se publican al guardar." />
      <SettingsForm s={s} />
    </>
  );
}
