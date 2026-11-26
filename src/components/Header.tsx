"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, MapPin, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { useInquiryList, trackInquiry } from "./InquiryList";
import { SearchOverlay } from "./SearchOverlay";
import { waLink } from "@/lib/whatsapp";

export type NavCategory = { name: string; slug: string; count: number };

type Props = {
  logoUrl: string;
  businessName: string;
  whatsapp: string;
  greeting: string;
  announcement: string;
  instagramUrl: string;
  instagramHandle: string;
  address: string;
  categories: NavCategory[];
};

export function Header(props: Props) {
  return (
    <Suspense fallback={<HeaderBar {...props} />}>
      <HeaderWithRoute {...props} />
    </Suspense>
  );
}

function HeaderWithRoute(props: Props) {
  const params = useSearchParams();
  return <HeaderBar {...props} condition={params.get("condicion")} />;
}

function HeaderBar({ logoUrl, businessName, whatsapp, greeting, announcement, instagramUrl, instagramHandle, address, categories, condition }: Props & { condition?: string | null }) {
  const pathname = usePathname();
  const { count, setOpen } = useInquiryList();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const lastY = useRef(0);
  const menuRef = useRef(menu);
  useEffect(() => {
    menuRef.current = menu;
  }, [menu]);

  
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 420 && y > lastY.current + 4 && !menuRef.current) setHidden(true);
      else if (y < lastY.current - 4 || y <= 420) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenu(false);
    setSearch(false);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", menu);
  }, [menu]);

  
  useEffect(() => {
    document.documentElement.toggleAttribute("data-header-hidden", hidden);
  }, [hidden]);

  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  
  const [bump, setBump] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  if (count !== prevCount) {
    setPrevCount(count);
    if (count > prevCount) setBump(true);
  }
  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [bump]);

  
  const overDark = pathname === "/" && !scrolled && !menu;

  const nav = [
    ...categories.slice(0, 3).map((c) => ({ label: c.name, href: `/catalogo/${c.slug}`, active: pathname === `/catalogo/${c.slug}` })),
    { label: "Usados", href: "/catalogo?condicion=usado", active: pathname === "/catalogo" && condition === "usado" },
    { label: "Catálogo", href: "/catalogo", active: pathname === "/catalogo" && condition !== "usado" },
    { label: "Promociones", href: "/promociones", active: pathname.startsWith("/promociones") },
    { label: "Nosotros", href: "/nosotros", active: pathname.startsWith("/nosotros") },
  ];

  const iconCls = overDark ? "text-white hover:bg-white/10" : "text-ink";

  return (
    <>
      <header className={clsx("fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-expo", hidden ? "-translate-y-full" : "translate-y-0")}>
        {announcement && (
          <div className={clsx("overflow-hidden transition-[max-height,opacity] duration-500", scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100")}>
            <Link
              href="/promociones"
              className="block truncate bg-brand-600 px-4 py-2 text-center text-[0.72rem] font-medium tracking-wide text-white transition-colors hover:bg-brand-700 sm:text-[0.78rem]"
            >
              {announcement}
            </Link>
          </div>
        )}

        <div
          className={clsx(
            "transition-[background-color,box-shadow,backdrop-filter] duration-500",
            overDark ? "bg-transparent" : "bg-white/80 shadow-[0_1px_0_rgb(10_11_14/0.06)] backdrop-blur-xl backdrop-saturate-150"
          )}
        >
          <div className="container-x flex h-16 items-center gap-4 lg:h-[4.5rem]">
            <button
              type="button"
              className={clsx("icon-btn -ml-2 lg:hidden", iconCls)}
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link href="/" className="shrink-0" aria-label={`${businessName}: inicio`}>
              <Logo logoUrl={logoUrl} name={businessName} size="h-9 w-[72px] lg:h-11 lg:w-[86px]" />
            </Link>

            <nav className="mx-auto hidden items-center gap-0.5 lg:flex" aria-label="Principal">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={clsx(
                    "relative whitespace-nowrap rounded-full px-3.5 py-2 text-[0.9rem] font-medium transition-colors duration-200 xl:px-4",
                    overDark ? "text-white/75 hover:text-white" : "text-graphite hover:text-ink",
                    n.active && (overDark ? "text-white" : "bg-mist text-ink")
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <button type="button" className={clsx("icon-btn", iconCls)} aria-label="Buscar productos" onClick={() => setSearch(true)}>
                <Search className="size-[1.15rem]" />
              </button>
              <a
                href={waLink(whatsapp, greeting)}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx("icon-btn hidden sm:inline-flex", iconCls)}
                aria-label="Escribinos por WhatsApp"
                onClick={() => trackInquiry({ type: "GENERAL", detail: "Header" })}
              >
                <WhatsAppIcon className="size-[1.15rem]" />
              </a>
              <button
                type="button"
                className={clsx("icon-btn relative transition-transform", iconCls, bump && "scale-110")}
                aria-label={`Abrir tu lista (${count} productos)`}
                onClick={() => setOpen(true)}
              >
                <ShoppingBag className="size-[1.15rem]" />
                {count > 0 && (
                  <span
                    key={count}
                    className="absolute right-0.5 top-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-semibold tabular-nums text-white"
                  >
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menu && (
        <MobileMenu
          categories={categories}
          whatsapp={whatsapp}
          greeting={greeting}
          instagramUrl={instagramUrl}
          instagramHandle={instagramHandle}
          address={address}
          onListOpen={() => {
            setMenu(false);
            setOpen(true);
          }}
        />
      )}

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}

function MobileMenu({
  categories,
  whatsapp,
  greeting,
  instagramUrl,
  instagramHandle,
  address,
  onListOpen,
}: {
  categories: NavCategory[];
  whatsapp: string;
  greeting: string;
  instagramUrl: string;
  instagramHandle: string;
  address: string;
  onListOpen: () => void;
}) {
  const links = [
    ...categories.map((c) => ({ label: c.name, hint: `${c.count} ${c.count === 1 ? "producto" : "productos"}`, href: `/catalogo/${c.slug}` })),
    { label: "Usados", hint: "Equipos usados y reacondicionados", href: "/catalogo?condicion=usado" },
    { label: "Todo el catálogo", hint: null, href: "/catalogo" },
  ];
  const secondary = [
    { label: "Promociones", href: "/promociones" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto y ubicación", href: "/contacto" },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-in overflow-y-auto bg-white lg:hidden">
      <nav className="container-x pb-12 pt-4" aria-label="Menú móvil">
        <ul>
          {links.map((l, i) => (
            <li key={l.label} className="animate-rise-in border-b border-line" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
              <Link href={l.href} className="group flex items-center justify-between py-3.5">
                <span>
                  <span className="block text-[1.5rem] font-semibold tracking-[-0.02em]">{l.label}</span>
                  {l.hint && <span className="text-sm text-mute">{l.hint}</span>}
                </span>
                <ArrowRight className="size-5 text-mute transition-transform group-active:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid animate-rise-in grid-cols-2 gap-x-4 gap-y-3 [animation-delay:300ms]">
          {secondary.map((s) => (
            <Link key={s.label} href={s.href} className="text-[0.95rem] text-graphite">{s.label}</Link>
          ))}
          <button type="button" onClick={onListOpen} className="text-left text-[0.95rem] text-graphite">Mi lista</button>
        </div>

        <div className="mt-10 animate-rise-in space-y-3 [animation-delay:360ms]">
          <a href={waLink(whatsapp, greeting)} target="_blank" rel="noopener noreferrer" className="pill-wa w-full" onClick={() => trackInquiry({ type: "GENERAL", detail: "Menú" })}>
            <WhatsAppIcon className="size-5" /> Escribinos por WhatsApp
          </a>
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="pill-ghost w-full">
              <InstagramIcon className="size-5" /> @{instagramHandle}
            </a>
          )}
          <p className="inline-flex items-center gap-1.5 pt-3 text-sm text-mute">
            <MapPin className="size-3.5" /> {address}
          </p>
        </div>
      </nav>
    </div>
  );
}
