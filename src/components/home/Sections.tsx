import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Clock, CreditCard, MapPin, MessageCircle, RefreshCcw, ShieldCheck, Smartphone, Star, Store, Truck,
  Wallet, Wrench,
} from "lucide-react";
import type { SiteSettings } from "@/lib/settings-schema";
import type { ProductCardData } from "@/lib/queries";
import { parseSpecs } from "@/lib/format";
import { productMessage } from "@/lib/whatsapp";
import { BRANDS, PHOTOS, TRADE_IN } from "@/lib/brand";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../SectionHeader";
import { WaButton } from "../WaButton";
import { InstagramIcon, WhatsAppIcon } from "../icons";
import { ProductCard } from "../product/ProductCard";
import { ProductImage } from "../product/ProductImage";
import { Rail, RailArrows, RailTrack } from "../product/ProductRail";
import { Price } from "../product/Price";
import { FeaturedTabs } from "./FeaturedTabs";
import { Logo } from "../Logo";



type Cat = { id: string; name: string; slug: string; description: string | null; image: string | null; count: number; cover: string | null };


function bentoLayout(n: number) {
  const cells = n >= 2 ? n + 4 : 4; 
  let widen = n > 2 ? (4 - (cells % 4)) % 4 : 0;
  const smallCount = Math.max(0, n - 2);
  const mobileOddLast = smallCount % 2 === 1;
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return { cls: "col-span-2 md:row-span-2 min-h-[22rem] md:min-h-0", big: true };
    if (i === 1) return { cls: "col-span-2 min-h-[15rem] md:min-h-[18rem]", big: false };
    const fromEnd = n - 1 - i;
    const wide = fromEnd < widen;
    const mobileWide = mobileOddLast && i === n - 1;
    return { cls: clsx("min-h-[13rem] md:min-h-[18rem]", mobileWide && "col-span-2", wide ? "md:col-span-2" : mobileWide && "md:col-span-1"), big: false };
  });
}

export function CategoryShowcase({ categories }: { categories: Cat[] }) {
  if (!categories.length) return null;
  const layout = bentoLayout(categories.length);
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="cat-title">
      <div className="container-x">
        <SectionHeader
          id="cat-title"
          eyebrow="Categorías"
          title="Todo lo que buscás, en un solo lugar."
          text="Elegí por dónde empezar: del iPhone más nuevo a los accesorios que lo completan."
          href="/catalogo"
          linkLabel="Ver catálogo"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:auto-rows-[minmax(18rem,auto)] md:grid-cols-4 lg:gap-5">
          {categories.map((c, i) => {
            const { cls, big } = layout[i];
            return (
              <Reveal key={c.id} delay={(i % 4) * 90} className={cls}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className="product-stage group relative isolate flex h-full overflow-hidden rounded-card p-5 transition-shadow duration-500 hover:shadow-lift sm:p-9"
                >
                  <div className="relative z-10 flex min-w-0 flex-col pr-10 sm:pr-14">
                    {c.description && <p className="truncate text-sm font-medium text-mute">{c.description}</p>}
                    <h3 className={clsx("mt-1 font-semibold tracking-[-0.03em] text-ink", big ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl")}>{c.name}</h3>
                    <p className="mt-2 text-sm text-mute">{c.count} {c.count === 1 ? "producto" : "productos"}</p>
                  </div>
                  <div
                    className={clsx(
                      "absolute transition-transform duration-1100 ease-out-expo group-hover:scale-[1.06]",
                      big
                        ? "inset-x-[10%] bottom-[-2%] top-[30%] group-hover:-translate-y-2"
                        : "bottom-[-6%] left-[34%] right-[-4%] top-[34%] group-hover:-translate-x-2 group-hover:-translate-y-2"
                    )}
                  >
                    <ProductImage src={c.image || c.cover} alt={c.name} label="" sizes={big ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"} />
                  </div>
                  <span className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white text-ink shadow-soft transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-white sm:right-6 sm:top-6 sm:size-11">
                    <ArrowUpRight className="size-5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}



export function FeaturedProducts({ products, whatsapp }: { products: ProductCardData[]; whatsapp: string }) {
  if (!products.length) return null;
  const tabs = [{ id: "all", label: "Todos" }];
  for (const p of products) if (p.category && !tabs.some((t) => t.id === p.category!.slug)) tabs.push({ id: p.category.slug, label: p.category.name });
  return (
    <section className="bg-mist/60 py-24 sm:py-32" aria-labelledby="featured-title">
      <div className="container-x">
        <SectionHeader
          id="featured-title"
          eyebrow="Destacados"
          title="Elegidos por nuestro equipo."
          text="Los equipos que más recomendamos hoy. Consultá precio y disponibilidad en el momento."
          href="/catalogo?tag=destacado"
          linkLabel="Ver todos"
        />
        <FeaturedTabs
          tabs={tabs}
          cards={products.map((p, i) => ({ key: p.id, category: p.category?.slug ?? "", node: <ProductCard p={p} whatsapp={whatsapp} size="lg" eager={i < 3} /> }))}
        />
      </div>
    </section>
  );
}



export function ProductRailSection({
  eyebrow,
  title,
  text,
  products,
  href,
  linkLabel,
  whatsapp,
  dark,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  products: ProductCardData[];
  href?: string;
  linkLabel?: string;
  whatsapp: string;
  dark?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className={clsx("overflow-hidden py-24 sm:py-28", dark ? "bg-ink" : "bg-white")}>
      <Rail>
        <div className="container-x">
          <SectionHeader eyebrow={eyebrow} title={title} text={text} href={href} linkLabel={linkLabel} dark={dark} actions={<RailArrows dark={dark} />} />
        </div>
        <RailTrack>
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 70} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((1320px-5rem-3*1.25rem)/4)]">
              <ProductCard p={p} whatsapp={whatsapp} dark={dark} />
            </Reveal>
          ))}
        </RailTrack>
      </Rail>
    </section>
  );
}



export function Spotlight({ product, others, whatsapp }: { product: ProductCardData | null; others: ProductCardData[]; whatsapp: string }) {
  if (!product) return null;
  const specs = parseSpecs(product.specs).slice(0, 4);
  const [main, side] = [product.images[0], product.images[1] ?? null];
  const intro = product.shortDescription || product.description?.split(/\n{2,}/)[0];

  return (
    <section className="relative isolate overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="spot-title">
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-[40rem] w-[40rem] rounded-full bg-brand-600/25 blur-[140px]" />
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal><p className="kicker text-brand-300">{product.isNew ? "Novedad" : "Recomendado"}</p></Reveal>
          <Reveal delay={60}><h2 id="spot-title" className="display-2 mt-3">{product.name}</h2></Reveal>
          {intro && <Reveal delay={120}><p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">{intro}</p></Reveal>}

          <Reveal delay={160} className="mt-8">
            <Price p={product} size="lg" dark />
          </Reveal>

          {specs.length > 0 && (
            <Reveal delay={180} className="mt-10 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10">
              {specs.map((sp) => (
                <div key={sp.label} className="bg-ink p-5">
                  <p className="text-xs uppercase tracking-wider text-white/45">{sp.label}</p>
                  <p className="mt-1.5 text-[0.95rem] font-medium leading-snug">{sp.value}</p>
                </div>
              ))}
            </Reveal>
          )}

          <Reveal delay={240} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={`/producto/${product.slug}`} className="pill-light pill-lg group">
              Ver detalles <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <WaButton number={whatsapp} message={productMessage(product)} type="PRODUCT" productId={product.id} detail="Spotlight" variant="ghost-dark" className="pill-lg">
              Consultar disponibilidad
            </WaButton>
          </Reveal>

          {others.length > 0 && (
            <Reveal delay={300} className="mt-12 border-t border-white/10 pt-8">
              <p className="mb-4 text-sm text-white/50">También destacados</p>
              <div className="flex flex-wrap gap-3">
                {others.map((n) => (
                  <Link key={n.id} href={`/producto/${n.slug}`} className="group flex items-center gap-3 rounded-2xl bg-white/[0.05] py-2 pl-2 pr-5 ring-1 ring-white/10 transition hover:bg-white/10">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
                      <ProductImage src={n.images[0]?.url} alt={n.name} sizes="56px" label="" className="p-1.5" />
                    </span>
                    <span>
                      <span className="block font-medium">{n.name}</span>
                      <span className="text-sm text-white/50 transition group-hover:text-white/80">Ver detalles →</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        <Reveal delay={100} className="relative grid grid-cols-5 gap-4">
          <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-card bg-white ring-1 ring-white/10">
            <div className="absolute inset-[8%]">
              <ProductImage src={main?.url} alt={main?.alt || product.name} sizes="(min-width:1024px) 30vw, 60vw" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-card bg-white/[0.04] ring-1 ring-white/10">
              {side ? (
                <ProductImage src={side.url} alt={side.alt || product.name} fit="cover" blend={false} sizes="20vw" />
              ) : (
                <Image src={PHOTOS.city.src} alt={PHOTOS.city.alt} fill sizes="20vw" className="object-cover" style={{ objectPosition: PHOTOS.city.position }} />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-end rounded-card bg-gradient-to-br from-brand-500 to-brand-700 p-6">
              <p className="text-2xl font-semibold tracking-tight">{product.condition === "NEW" ? "Sellado" : "Usado"}</p>
              <p className="mt-1 text-sm leading-snug text-white/85">Consultá disponibilidad, plan canje y financiación por WhatsApp.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}



const TRADE_ICONS = [RefreshCcw, Wallet, Wrench, Smartphone];

export function TradeInBanner({ whatsapp }: { whatsapp: string }) {
  return (
    <section className="bg-white px-4 py-6 sm:px-6 lg:px-10">
      <Reveal className="relative isolate mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-14 text-white sm:px-12 sm:py-20 lg:px-16">
        
        <div className="pointer-events-none absolute -bottom-24 -right-10 hidden h-[26rem] w-[30rem] lg:block" aria-hidden>
          <div className="absolute right-40 top-6 h-full w-48 rotate-[-12deg] rounded-[2.4rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" />
          <div className="absolute right-12 top-0 h-full w-52 rotate-[8deg] rounded-[2.6rem] bg-gradient-to-b from-ink to-graphite p-2 shadow-2xl ring-1 ring-white/10">
            <div className="h-full w-full rounded-[2.1rem] bg-[radial-gradient(120%_80%_at_80%_0%,#ff8336_0%,#dc5508_30%,#2a1003_65%,#070707_100%)]">
              <div className="mx-auto mt-3 h-5 w-20 rounded-full bg-black" />
              <RefreshCcw className="mx-auto mt-20 size-16 text-white/80" strokeWidth={1.4} />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand-300/30 blur-3xl" />

        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{TRADE_IN.kicker}</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">{TRADE_IN.title}</h2>
          <p className="mt-4 text-xl text-white/85">{TRADE_IN.subtitle}</p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {TRADE_IN.conditions.map((c, i) => {
              const Icon = TRADE_ICONS[i % TRADE_ICONS.length];
              return (
                <li key={c} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 ring-1 ring-white/15 backdrop-blur">
                  <Icon className="size-5 shrink-0 text-white/80" strokeWidth={1.75} />
                  <span className="text-[0.95rem] font-medium">{c}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogo?condicion=usado" className="pill-light pill-lg group">
              Ver equipos usados <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <WaButton
              number={whatsapp}
              message="Hola! Quería consultar por el plan canje para entregar mi equipo usado."
              detail="Plan canje"
              variant="plain"
              className="pill pill-lg text-white ring-1 ring-inset ring-white/30 hover:bg-white/10"
            >
              Cotizá tu usado
            </WaButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}



const BENEFIT_ICONS = [BadgeCheck, RefreshCcw, CreditCard, Wrench, ShieldCheck, Truck, MessageCircle, Store];

export function Benefits({ items, businessName }: { items: SiteSettings["benefits"]; businessName: string }) {
  if (!items.length) return null;
  const cols = items.length % 3 === 0 ? "lg:grid-cols-3" : items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-2";
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="benefits-title">
      <div className="container-x">
        <SectionHeader id="benefits-title" eyebrow={`Por qué ${businessName}`} title="Comprar bien es comprar con confianza." />
        <div className={clsx("grid gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-2", cols)}>
          {items.map((b, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <Reveal key={b.title} delay={i * 60} className="group bg-white p-8 transition-colors duration-500 hover:bg-mist/70 sm:p-10">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-[1.35rem]" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-2 leading-relaxed text-mute">{b.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}



const caption = "absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur sm:bottom-4 sm:left-4";

type StoryProduct = { name: string; slug: string; image: string };


export function storyProducts(list: ProductCardData[]): StoryProduct[] {
  const withImg = list.filter((p) => p.images[0]);
  const seen = new Set<string>();
  const pick: ProductCardData[] = [];
  for (const p of withImg) {
    const key = p.category?.slug ?? p.brand;
    if (!seen.has(key)) {
      seen.add(key);
      pick.push(p);
    }
  }
  for (const p of withImg) if (pick.length < 4 && !pick.includes(p)) pick.push(p);
  return pick.slice(0, 4).map((p) => ({ name: p.name, slug: p.slug, image: p.images[0].url }));
}

export function BrandStory({ s, products, showCta = true }: { s: SiteSettings; products: StoryProduct[]; showCta?: boolean }) {
  const paragraphs = s.aboutText.split(/\n{2,}/).filter(Boolean);
  const [p1, ...rest] = products;
  const row = rest.slice(0, 3);
  return (
    <section className="overflow-hidden bg-[#f6f3ef] py-24 sm:py-32" aria-labelledby="story-title">
      <div className="container-x grid items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-3 sm:gap-4">
            <Reveal className="col-span-4 row-span-4">
              <figure className="relative h-full overflow-hidden rounded-card bg-mist">
                <Image src={PHOTOS.city.src} alt={PHOTOS.city.alt} fill sizes="(min-width:1024px) 38vw, 66vw" className="object-cover transition-transform duration-1500 hover:scale-105" style={{ objectPosition: PHOTOS.city.position }} />
                <figcaption className={caption}>{s.city}</figcaption>
              </figure>
            </Reveal>

            <Reveal delay={120} className="col-span-2 row-span-3">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-card bg-ink p-4 text-white sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand-500/30 blur-2xl" />
                <Logo logoUrl={s.logoUrl} name={s.businessName} size="h-12 w-24 sm:h-16 sm:w-32" className="relative" />
                <div className="relative">
                  <p className="text-2xl font-semibold tracking-tight sm:text-4xl">+6 años</p>
                  <p className="mt-1 text-xs leading-snug text-white/60 sm:text-sm">de trayectoria en San Francisco</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} className="col-span-2 row-span-3">
              {p1 ? (
                <Link href={`/producto/${p1.slug}`} className="product-stage group relative block h-full overflow-hidden rounded-card">
                  <div className="absolute inset-[10%] bottom-[18%] transition-transform duration-1100 ease-out-expo group-hover:scale-105">
                    <ProductImage src={p1.image} alt={p1.name} sizes="(min-width:1024px) 19vw, 33vw" label="" />
                  </div>
                  <span className={clsx(caption, "max-w-[85%] truncate")}>{p1.name}</span>
                </Link>
              ) : (
                <div className="h-full rounded-card bg-gradient-to-br from-brand-500 to-brand-700" />
              )}
            </Reveal>

            <Reveal delay={260} className="col-span-4 row-span-2">
              <div className="relative flex h-full items-center overflow-hidden rounded-card bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
                <div className="relative z-10 shrink-0 p-4 sm:p-7">
                  <p className="text-lg font-semibold leading-tight tracking-tight sm:text-2xl">Sellados<br />y usados</p>
                  <p className="mt-1 hidden text-sm text-white/75 sm:block">Plan canje y financiación</p>
                </div>
                <div className="flex h-full flex-1 items-end justify-end gap-1 pr-3 sm:gap-2 sm:pr-5">
                  {row.map((p) => (
                    <Link key={p.slug} href={`/producto/${p.slug}`} title={p.name} className="relative h-[78%] w-1/3 max-w-[8.5rem] overflow-hidden rounded-t-2xl bg-white transition-transform duration-500 hover:-translate-y-1">
                      <span className="absolute inset-[8%]">
                        <ProductImage src={p.image} alt={p.name} sizes="(min-width:1024px) 10vw, 20vw" label="" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Reveal><p className="kicker">Nosotros</p></Reveal>
          <Reveal delay={60}><h2 id="story-title" className="display-2 mt-3 text-balance">Más de seis años eligiendo con vos.</h2></Reveal>
          <Reveal delay={120} className="mt-6 space-y-4 text-lg leading-relaxed text-graphite/80">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </Reveal>
          <Reveal delay={150} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold uppercase tracking-[0.14em] text-graphite/45">
            {BRANDS.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </Reveal>
          {showCta && (
            <Reveal delay={180} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/nosotros" className="pill-dark pill-lg group">
                Conocenos <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {s.instagramUrl && (
                <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="pill-ghost pill-lg bg-white/60">
                  <InstagramIcon className="size-5" /> Seguinos en Instagram
                </a>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}



export function LocationSection({ s, title = "Vení a conocernos.", headingLevel = "h2" }: { s: SiteSettings; title?: string; headingLevel?: "h1" | "h2" }) {
  const q = s.mapsQuery || `${s.address}, ${s.city}`;
  const Heading = headingLevel;
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="loc-title">
      <div className="container-x">
        {headingLevel === "h2" && (
          <SectionHeader id="loc-title" eyebrow="El local" title={title} text={`Te esperamos en ${s.city}. Atención personalizada y retiro en el local.`} />
        )}
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="group relative flex flex-col overflow-hidden rounded-card bg-mist p-8 transition-shadow duration-500 hover:shadow-lift sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-mute">{s.city}</p>
                <Heading id={headingLevel === "h1" ? "loc-title" : undefined} className="mt-1 text-3xl font-semibold tracking-[-0.025em]">{s.businessName}</Heading>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft">
                <MapPin className="size-5" />
              </span>
            </div>
            <dl className="mt-8 space-y-4 text-[0.95rem]">
              <div className="flex items-start gap-3">
                <dt className="sr-only">Dirección</dt>
                <MapPin className="mt-0.5 size-4 shrink-0 text-mute" />
                <dd>{s.address}</dd>
              </div>
              {s.whatsappDisplay && (
                <div className="flex items-center gap-3">
                  <dt className="sr-only">WhatsApp</dt>
                  <WhatsAppIcon className="size-4 shrink-0 text-mute" />
                  <dd>{s.whatsappDisplay}</dd>
                </div>
              )}
              {s.hours.length > 0 && (
                <div className="flex items-start gap-3">
                  <dt className="sr-only">Horarios</dt>
                  <Clock className="mt-0.5 size-4 shrink-0 text-mute" />
                  <dd className="space-y-0.5">
                    {s.hours.map((h) => (
                      <p key={h.days}><span className="text-mute">{h.days}:</span> {h.hours}</p>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              <WaButton number={s.whatsapp} message={s.whatsappGreeting} detail="Ubicación" className="pill-sm">Escribir</WaButton>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="pill-light pill-sm ring-1 ring-black/5">
                Cómo llegar <ArrowUpRight className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={100} className="relative min-h-[22rem] overflow-hidden rounded-card bg-mist">
            <iframe
              title={`Mapa: ${s.businessName}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}
              className="absolute inset-0 h-full w-full grayscale-[.2]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}



export function Testimonials({ items }: { items: { id: string; author: string; content: string; rating: number; source: string | null }[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-mist/60 py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader eyebrow="Clientes" title="Lo que dicen de nosotros." />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 80} className="flex flex-col rounded-card bg-white p-8 shadow-soft">
              <div className="flex gap-0.5 text-brand-500" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={clsx("size-4", k < t.rating ? "fill-current" : "opacity-25")} />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-graphite">“{t.content}”</blockquote>
              <footer className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">{t.author.charAt(0)}</span>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  {t.source && <p className="text-xs text-mute">{t.source}</p>}
                </div>
              </footer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}



export function FinalCta({ s }: { s: SiteSettings }) {
  return (
    <section className="bg-white px-4 pb-24 sm:px-6 sm:pb-32 lg:px-10">
      <Reveal className="relative isolate mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <span className="pointer-events-none absolute -bottom-16 -right-10 -z-10 select-none text-[16rem] font-black leading-none tracking-tighter text-white/[0.04]" aria-hidden>Z</span>
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />
        <h2 className="display-2 mx-auto max-w-3xl text-balance">¿Buscás un modelo en particular?</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">{s.paymentInfo}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <WaButton number={s.whatsapp} message={`Hola ${s.businessName}! Estoy buscando un equipo en particular.`} detail="CTA final" className="pill-lg">
            Hablar por WhatsApp
          </WaButton>
          {s.instagramUrl && (
            <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="pill-ghost-dark pill-lg">
              <InstagramIcon className="size-5" /> Seguinos en Instagram
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}
