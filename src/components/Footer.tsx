import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-schema";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./icons";
import { waLink } from "@/lib/whatsapp";

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function Footer({ s, categories }: { s: SiteSettings; categories: { name: string; slug: string }[] }) {
  const socials = [
    s.instagramUrl && { href: s.instagramUrl, label: "Instagram", Icon: InstagramIcon, hover: "hover:bg-white hover:text-ink" },
    s.whatsapp && { href: waLink(s.whatsapp, s.whatsappGreeting), label: "WhatsApp", Icon: WhatsAppIcon, hover: "hover:bg-whatsapp" },
    s.facebookUrl && { href: s.facebookUrl, label: "Facebook", Icon: FacebookIcon, hover: "hover:bg-white hover:text-ink" },
    s.tiktokUrl && { href: s.tiktokUrl, label: "TikTok", Icon: TikTokIcon, hover: "hover:bg-white hover:text-ink" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon; hover: string }[];

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="container-x relative pb-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo logoUrl={s.logoUrl} name={s.businessName} size="h-20 w-40" />
            <p className="mt-6 max-w-xs leading-relaxed text-white/60">
              {s.tagline}. {s.highlights.join(" · ")}.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon, hover }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`icon-btn bg-white/5 text-white ${hover}`} aria-label={label}>
                  <Icon className="size-[1.1rem]" />
                </a>
              ))}
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-10 lg:col-span-5" aria-label="Pie de página">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Tienda</h3>
              <ul className="space-y-2.5 text-[0.92rem] text-white/60">
                {categories.slice(0, 8).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/catalogo/${c.slug}`} className="transition hover:text-white">{c.name}</Link>
                  </li>
                ))}
                <li><Link href="/catalogo?condicion=usado" className="transition hover:text-white">Usados</Link></li>
                <li><Link href="/catalogo" className="transition hover:text-white">Todo el catálogo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">{s.businessName}</h3>
              <ul className="space-y-2.5 text-[0.92rem] text-white/60">
                <li><Link href="/nosotros" className="transition hover:text-white">Nosotros</Link></li>
                <li><Link href="/contacto" className="transition hover:text-white">Contacto y ubicación</Link></li>
                <li><Link href="/promociones" className="transition hover:text-white">Promociones</Link></li>
                <li><Link href="/catalogo?tag=nuevo" className="transition hover:text-white">Últimos ingresos</Link></li>
                {s.instagramUrl && (
                  <li>
                    <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:text-white">
                      Instagram <ArrowUpRight className="size-3.5" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold text-white">Visitanos</h3>
            <div className="space-y-3 text-[0.92rem]">
              <a href={mapsUrl(s.mapsQuery || `${s.address}, ${s.city}`)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/60 transition hover:text-white">
                <MapPin className="mt-1 size-3.5 shrink-0" />
                <span>{s.address}<br />{s.city}</span>
              </a>
              {s.whatsappDisplay && (
                <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 transition hover:text-whatsapp">
                  <WhatsAppIcon className="size-3.5" /> {s.whatsappDisplay}
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-white/60 transition hover:text-white">
                  <Mail className="size-3.5" /> {s.email}
                </a>
              )}
              {s.hours.length > 0 && (
                <div className="flex gap-2 text-white/45">
                  <Clock className="mt-1 size-3.5 shrink-0" />
                  <div>
                    {s.hours.map((h) => (
                      <p key={h.days}><span className="text-white/70">{h.days}:</span> {h.hours}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {s.businessName}. Todos los derechos reservados. Precios sujetos a modificación sin previo aviso.</p>
          <p className="max-w-xl md:text-right">
            Apple, iPhone, iPad, AirPods y Apple Watch son marcas registradas de Apple Inc. {s.businessName} es un comercio independiente, no afiliado a Apple Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
