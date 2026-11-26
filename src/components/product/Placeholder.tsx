import clsx from "clsx";
import { ImagePlus } from "lucide-react";


export function Placeholder({ label = "Fotografía próximamente", className, dark }: { brand?: string; hint?: string; label?: string; className?: string; dark?: boolean }) {
  return (
    <div className={clsx("absolute inset-0 flex flex-col items-center justify-center gap-3 text-center", dark ? "text-white/50" : "text-mute", className)}>
      <div className={clsx("flex size-14 items-center justify-center rounded-2xl ring-1", dark ? "bg-white/5 ring-white/10" : "bg-white/70 ring-black/5")}>
        <ImagePlus className="size-6 opacity-70" strokeWidth={1.5} />
      </div>
      {label && <p className="max-w-[14rem] px-4 text-xs leading-relaxed">{label}</p>}
    </div>
  );
}
