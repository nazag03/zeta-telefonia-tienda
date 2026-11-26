"use client";

import { useSyncExternalStore } from "react";
import { Timer } from "lucide-react";


function subscribe(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime();
  const now = useSyncExternalStore(subscribe, nowSeconds, () => null);

  if (now === null) return null;
  if (end <= now * 1000) return <span className="text-xs font-semibold text-ink-400">Promoción finalizada</span>;
  const p = parts(end - now * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur" aria-live="off">
      <Timer className="h-3.5 w-3.5 text-brand-400" />
      Termina en {p.d > 0 && `${p.d}d `}{pad(p.h)}:{pad(p.m)}:{pad(p.s)}
    </span>
  );
}
