import clsx from "clsx";
import { AVAILABILITY } from "@/lib/format";

const TONES = {
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  info: "bg-sky-50 text-sky-700",
  off: "bg-rose-50 text-rose-700",
};

export function Availability({ value, className }: { value: string; className?: string }) {
  const a = AVAILABILITY[value] ?? AVAILABILITY.IN_STOCK;
  return (
    <span className={clsx("tag", TONES[a.tone], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {a.label}
    </span>
  );
}
