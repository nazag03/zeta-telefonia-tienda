import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-schema";
import type { ProductCardData } from "@/lib/queries";
import { displayPrice } from "@/lib/format";
import { HERO_IMAGE, STATS } from "@/lib/brand";
import { Logo } from "../Logo";
import { Reveal } from "../Reveal";
import { HeroTilt } from "./HeroTilt";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero({ s, product }: { s: SiteSettings; product?: ProductCardData | null }) {
  const image = s.heroImage ? { src: s.heroImage, alt: `${s.businessName}: productos destacados` } : HERO_IMAGE;

  return (
    <section className="relative isolate overflow-hidden bg-[#06070a] text-white" aria-labelledby="hero-title">
      
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[18%] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand-500 opacity-30 blur-[120px] lg:left-[68%]" />
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-700/30 blur-[120px]" />
        <div className="grid-lines absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_30%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070a] to-transparent" />
      </div>

      <div className="container-x grid items-center gap-6 pb-12 pt-32 sm:gap-10 sm:pt-36 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-28">
        
        <div className="relative z-10 lg:col-span-7">
          {s.heroEyebrow && (
            <div className="mb-5 inline-flex animate-rise-in items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-1.5 pr-4 text-sm text-white/80 ring-1 ring-white/10 backdrop-blur sm:mb-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                <MapPin className="size-3" /> Local
              </span>
              {s.heroEyebrow}
            </div>
          )}

          <h1 id="hero-title" className="display-1 text-balance max-sm:text-[2.35rem]">
            <span className="block animate-rise-in" style={delay(80)}>{s.heroTitle}</span>
            <span className="block animate-rise-in bg-gradient-to-r from-brand-300 via-brand-200 to-white bg-clip-text text-transparent" style={delay(180)}>
              {s.heroHighlight}
            </span>
          </h1>

          <p className="mt-4 max-w-xl animate-rise-in text-base leading-relaxed text-white/65 sm:mt-6 sm:text-xl" style={delay(300)}>
            {s.heroSubtitle}
          </p>

          <div className="mt-7 flex animate-rise-in gap-3 sm:mt-9" style={delay(420)}>
            <Link href="/catalogo" className="pill-light group max-sm:flex-1 sm:pill-lg">
              {s.heroCtaLabel}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/nosotros" className="pill-ghost-dark max-sm:flex-1 sm:pill-lg">
              <span className="sm:hidden">Conocenos</span>
              <span className="hidden sm:inline">Conocé {s.businessName}</span>
            </Link>
          </div>

          <div className="mt-10 hidden animate-fade-in items-center gap-3 text-sm text-white/55 sm:flex" style={{ animationDelay: "700ms", animationDuration: "1s" }}>
            <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/15">
              <Logo logoUrl={s.logoUrl} name="" size="h-5 w-8" className="[&_img]:object-center" />
            </span>
            <p>
              <span className="inline-flex items-center gap-1 font-medium text-white">
                <BadgeCheck className="size-4 text-brand-400" /> @{s.instagramHandle}
              </span>{" "}
              · +28 mil seguidores en Instagram
            </p>
          </div>
        </div>

        
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] animate-scale-in sm:max-w-[30rem] lg:max-w-none lg:scale-[1.12]" style={delay(100)}>
            <HeroTilt>
              <div className="h-full w-full animate-float-slow">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  preload
                  fetchPriority="high"
                  sizes="(min-width:1024px) 40vw, 90vw"
                  className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.55)]"
                />
              </div>
            </HeroTilt>

            {s.highlights[0] && (
              <div className="absolute -left-1 top-[12%] hidden animate-rise-in rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/15 backdrop-blur-xl sm:block lg:-left-6" style={delay(900)}>
                <p className="text-[0.7rem] uppercase tracking-wider text-white/50">{s.businessName}</p>
                <p className="font-semibold">{s.highlights[1] ?? s.highlights[0]}</p>
              </div>
            )}
          </div>

          {product && (
            <Link
              href={`/producto/${product.slug}`}
              className="group relative z-10 mx-auto -mt-2 flex w-fit animate-rise-in items-center gap-4 rounded-full bg-white/[0.06] py-2 pl-5 pr-2 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10"
              style={delay(800)}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-white/55">{displayPrice(product)}</p>
              </div>
              {(product.variants?.length ?? 0) > 1 && (
                <div className="flex items-center gap-1.5" aria-hidden>
                  {product.variants.slice(0, 5).map((v) => (
                    <span key={v.id} className="size-5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: v.hex ?? "#888" }} />
                  ))}
                </div>
              )}
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-ink transition group-hover:scale-105">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          )}
        </div>
      </div>

      
      <div className="relative border-t border-white/10">
        <dl className="container-x grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4">
          {STATS.map((st, i) => (
            <Reveal key={st.label} delay={i * 80} className="flex flex-col px-1 md:border-l md:border-white/10 md:px-8 md:first:border-l-0 md:first:pl-0">
              <dt className="order-2 text-sm text-white/50">{st.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight sm:text-3xl">{st.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
