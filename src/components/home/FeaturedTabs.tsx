"use client";

import { useState } from "react";
import clsx from "clsx";


export function FeaturedTabs({ tabs, cards }: { tabs: { id: string; label: string }[]; cards: { key: string; category: string; node: React.ReactNode }[] }) {
  const [tab, setTab] = useState("all");
  const items = (tab === "all" ? cards : cards.filter((c) => c.category === tab)).slice(0, 9);

  return (
    <>
      {tabs.length > 2 && (
        <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Filtrar destacados">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                tab === t.id ? "bg-ink text-white shadow-soft" : "bg-white text-graphite ring-1 ring-black/5 hover:ring-black/15"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {items.map((c) => (
          <div key={`${tab}-${c.key}`} className="w-[80%] shrink-0 animate-rise-in snap-start sm:w-auto">
            {c.node}
          </div>
        ))}
      </div>
    </>
  );
}
