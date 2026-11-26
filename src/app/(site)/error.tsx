"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[80vh] items-center pt-24">
      <div className="container-x text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-brand-600">ALGO SALIÓ MAL</p>
        <h1 className="display-2 mt-3">No pudimos cargar esta sección.</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-mute">Probá de nuevo en unos segundos.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="pill-dark pill-lg"><RotateCcw className="size-4" /> Reintentar</button>
          <Link href="/" className="pill-ghost pill-lg">Ir al inicio</Link>
        </div>
      </div>
    </section>
  );
}
