"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";


export function Accordion({ sections, defaultOpen }: { sections: { id: string; title: string; content: React.ReactNode }[]; defaultOpen?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? sections[0]?.id ?? null);
  if (!sections.length) return null;
  return (
    <div className="divide-y divide-line border-y border-line">
      {sections.map((s) => {
        const on = open === s.id;
        return (
          <section key={s.id}>
            <button type="button" className="flex w-full items-center justify-between py-5 text-left font-semibold" aria-expanded={on} onClick={() => setOpen(on ? null : s.id)}>
              {s.title}
              <ChevronDown className={clsx("size-5 transition-transform duration-300", on && "rotate-180")} />
            </button>
            <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-out-expo", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className={clsx("overflow-hidden", on && "pb-6")}>{s.content}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
