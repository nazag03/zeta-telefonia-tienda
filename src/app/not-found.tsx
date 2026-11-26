import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <SiteShell>
      <section className="flex min-h-[80vh] items-center pt-24">
        <div className="container-x text-center">
          <Logo size="h-16 w-32" className="mx-auto opacity-90 [&_img]:object-center" />
          <p className="mt-8 text-sm font-semibold tracking-[0.2em] text-brand-600">ERROR 404</p>
          <h1 className="display-2 mt-3">Sin señal por acá.</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-mute">La página que buscás no existe o el producto ya no está publicado.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="pill-dark pill-lg">Ir al inicio</Link>
            <Link href="/catalogo" className="pill-ghost pill-lg">Ver productos</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
