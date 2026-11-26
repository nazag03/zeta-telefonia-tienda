import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([requireUser(), getSettings()]);
  return (
    <>
      <AdminNav user={user} logoUrl={s.logoUrl} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
      <Suspense>
        <Toast />
      </Suspense>
    </>
  );
}
