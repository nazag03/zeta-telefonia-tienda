import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { getHomeData } from "@/lib/queries";
import { HERO_IMAGE, PHOTOS, STATS } from "@/lib/brand";
import { Benefits, BrandStory, FinalCta, LocationSection, storyProducts } from "@/components/home/Sections";
import { Reveal } from "@/components/Reveal";
import { InstagramIcon } from "@/components/icons";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Sobre nosotros",
    description: s.aboutText.slice(0, 155),
    alternates: { canonical: "/nosotros" },
    openGraph: { images: [PHOTOS.city.src] },
  };
}

export default async function AboutPage() {
  const [s, home] = await Promise.all([getSettings(), getHomeData()]);
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink pb-20 pt-36 text-white sm:pb-28 sm:pt-44">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="container-x">
          <Reveal><p className="kicker text-brand-300">Nosotros</p></Reveal>
          <Reveal delay={60}><h1 className="display-1 mt-4 max-w-4xl text-balance">{s.aboutTitle}</h1></Reveal>
          <Reveal delay={120}><p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/65">{s.tagline}. {s.highlights.join(" · ")}.</p></Reveal>
          <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 md:grid-cols-4">
            {STATS.map((st, i) => (
              <Reveal key={st.label} delay={i * 80} className="flex flex-col">
                <dt className="order-2 mt-1 text-sm text-white/50">{st.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{st.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <BrandStory s={s} products={storyProducts([...home.featured, ...home.newest, ...home.used])} showCta={false} />

      <section className="bg-white py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative isolate aspect-[4/5] overflow-hidden rounded-card bg-[#06070a]">
            {s.aboutImage ? (
              <Image src={s.aboutImage} alt={s.businessName} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <>
                <div className="absolute left-1/2 top-1/3 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-brand-500/35 blur-[110px]" />
                <div className="absolute inset-[10%] animate-float-slow">
                  <Image src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} fill sizes="(min-width:1024px) 40vw, 80vw" className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.55)]" />
                </div>
              </>
            )}
          </Reveal>
          <div>
            <Reveal><p className="kicker">Comunidad</p></Reveal>
            <Reveal delay={60}><h2 className="display-2 mt-3">Novedades todas las semanas.</h2></Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-lg leading-relaxed text-graphite/80">
                En nuestro Instagram compartimos los ingresos de la semana, promociones y consejos para cuidar tu iPhone. Seguinos para enterarte antes que nadie.
              </p>
            </Reveal>
            {s.instagramUrl && (
              <Reveal delay={180}>
                <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="pill-dark pill-lg mt-10">
                  <InstagramIcon className="size-5" /> Ver @{s.instagramHandle}
                </a>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <Benefits items={s.benefits} businessName={s.businessName} />
      <LocationSection s={s} />
      <FinalCta s={s} />
    </div>
  );
}
