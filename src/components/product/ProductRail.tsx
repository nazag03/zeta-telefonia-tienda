"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

type RailState = {
  track: React.RefObject<HTMLDivElement | null>;
  atStart: boolean;
  atEnd: boolean;
  update: () => void;
};
const RailCtx = createContext<RailState | null>(null);


export function Rail({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const update = () => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };
  return <RailCtx.Provider value={{ track, atStart, atEnd, update }}>{children}</RailCtx.Provider>;
}

export function RailArrows({ dark }: { dark?: boolean }) {
  const ctx = useContext(RailCtx);
  if (!ctx) return null;
  const scroll = (dir: 1 | -1) => ctx.track.current?.scrollBy({ left: dir * ctx.track.current.clientWidth * 0.8, behavior: "smooth" });
  const btn = clsx(
    "flex size-11 items-center justify-center rounded-full ring-1 transition disabled:opacity-30",
    dark ? "text-white ring-white/20 hover:bg-white/10" : "ring-line hover:bg-mist"
  );
  return (
    <div className="hidden gap-2 md:flex">
      <button type="button" className={btn} disabled={ctx.atStart} onClick={() => scroll(-1)} aria-label="Anterior">
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" className={btn} disabled={ctx.atEnd} onClick={() => scroll(1)} aria-label="Siguiente">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

export function RailTrack({ children }: { children: React.ReactNode }) {
  const ctx = useContext(RailCtx);
  const update = ctx?.update;
  useEffect(() => update?.(), [update]);
  return (
    <div
      ref={ctx?.track}
      onScroll={ctx?.update}
      className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]"
    >
      {children}
    </div>
  );
}
