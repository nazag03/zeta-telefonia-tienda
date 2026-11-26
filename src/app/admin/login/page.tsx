import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/admin");
  const s = await getSettings();
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)]" />
      <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex justify-center"><Logo logoUrl={s.logoUrl} name={s.businessName} className="scale-125" /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-black uppercase text-white">Panel de administración</h1>
          <p className="mb-6 mt-1 text-sm text-ink-300">Ingresá con tu usuario para gestionar la tienda.</p>
          <LoginForm next={next ?? ""} />
        </div>
      </div>
    </main>
  );
}
