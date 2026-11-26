import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { GENERAL_TOPICS, waLink } from "@/lib/whatsapp";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { LocationSection } from "@/components/home/Sections";
import { Reveal } from "@/components/Reveal";
import { WaButton } from "@/components/WaButton";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Contacto y ubicación",
    description: `Visitanos en ${s.address}, ${s.city}. Consultas por WhatsApp al ${s.whatsappDisplay}.`,
    alternates: { canonical: "/contacto" },
  };
}

export default async function ContactPage() {
  const s = await getSettings();
  const channels = [
    s.whatsapp && { label: "WhatsApp", value: s.whatsappDisplay, href: waLink(s.whatsapp, s.whatsappGreeting), Icon: WhatsAppIcon, tone: "bg-whatsapp text-white" },
    s.instagramUrl && { label: "Instagram", value: `@${s.instagramHandle}`, href: s.instagramUrl, Icon: InstagramIcon, tone: "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-white" },
    s.facebookUrl && { label: "Facebook", value: s.businessName, href: s.facebookUrl, Icon: FacebookIcon, tone: "bg-[#1877f2] text-white" },
    s.tiktokUrl && { label: "TikTok", value: s.businessName, href: s.tiktokUrl, Icon: TikTokIcon, tone: "bg-ink text-white" },
    s.email && { label: "Email", value: s.email, href: `mailto:${s.email}`, Icon: ArrowUpRight, tone: "bg-brand-600 text-white" },
  ].filter(Boolean) as { label: string; value: string; href: string; Icon: typeof WhatsAppIcon; tone: string }[];

  return (
    <div>
      <section className="pb-8 pt-32 sm:pt-44">
        <div className="container-x">
          <p className="kicker">Contacto</p>
          <h1 className="display-1 mt-4 max-w-3xl">Hablemos.</h1>
          <p className="mt-6 max-w-xl text-xl text-mute">La forma más rápida de comunicarte con nosotros es por WhatsApp. También podés visitarnos en el local.</p>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={i * 80}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 rounded-card bg-mist p-6 transition-all duration-500 hover:bg-white hover:shadow-lift">
                  <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${c.tone}`}>
                    <c.Icon className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-mute">{c.label}</span>
                    <span className="block truncate text-lg font-semibold">{c.value}</span>
                  </span>
                  <ArrowUpRight className="size-5 text-mute transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10 rounded-card border border-line p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Consultas rápidas</h2>
            <p className="mt-1 text-sm text-mute">Elegí un tema y te abrimos WhatsApp con el mensaje listo.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {GENERAL_TOPICS.map((t) => (
                <WaButton key={t.label} number={s.whatsapp} message={t.message} detail={t.label} variant="plain" icon={false} className="pill pill-sm bg-mist text-graphite hover:bg-whatsapp hover:text-white">
                  {t.label}
                </WaButton>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <LocationSection s={s} />
    </div>
  );
}
