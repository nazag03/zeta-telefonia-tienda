"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <button onClick={share} type="button" className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-line transition hover:bg-mist" aria-label={copied ? "Link copiado" : "Compartir"} title={copied ? "Link copiado" : "Compartir"}>
      {copied ? <Check className="size-5 text-emerald-600" /> : <Share2 className="size-5" />}
    </button>
  );
}
