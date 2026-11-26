"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "./icons";
import { trackInquiry } from "./InquiryList";
import { GENERAL_TOPICS, waLink } from "@/lib/whatsapp";


export function WhatsAppFloat({ number, greeting, businessName }: { number: string; greeting: string; businessName: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  
  const onProduct = pathname.startsWith("/producto/");
  if (!number || (!visible && !open)) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 ${onProduct ? "max-lg:hidden" : ""}`}>
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-xs origin-bottom-right animate-drop-in overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center gap-3 bg-whatsapp px-4 py-3.5 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20"><WhatsAppIcon className="size-5" /></span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{businessName}</p>
              <p className="text-xs text-white/80">Respondemos en horario comercial</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto rounded-full p-1 text-white/90 hover:bg-white/15" aria-label="Cerrar">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-1.5 p-3">
            <p className="px-1 pb-1 text-xs text-mute">¿Sobre qué querés consultar?</p>
            {GENERAL_TOPICS.map((t) => (
              <a
                key={t.label}
                href={waLink(number, t.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInquiry({ type: "GENERAL", detail: t.label })}
                className="block rounded-2xl bg-mist px-3.5 py-2.5 text-sm font-medium text-graphite transition hover:bg-whatsapp/10 hover:text-ink"
              >
                {t.label}
              </a>
            ))}
            <a
              href={waLink(number, greeting)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInquiry({ type: "GENERAL", detail: "Otra consulta" })}
              className="pill-wa pill-sm mt-2 w-full"
            >
              <WhatsAppIcon className="size-4" /> Otra consulta
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex animate-pulse-ring items-center gap-2 rounded-full bg-whatsapp p-3.5 text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition-all duration-300 hover:bg-whatsapp-dark"
        aria-label="Escribinos por WhatsApp"
        aria-expanded={open}
      >
        {open ? <X className="size-6" /> : <WhatsAppIcon className="size-6" />}
        {!open && (
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-500 group-hover:max-w-40 group-hover:pr-1 sm:inline">
            ¿Te ayudamos?
          </span>
        )}
      </button>
    </div>
  );
}
