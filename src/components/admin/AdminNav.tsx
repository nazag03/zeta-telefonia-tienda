"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard, Package, FolderTree, Tag, MessageSquareQuote, Settings, Users, KeyRound, LogOut, ExternalLink,
  Menu, X, MessagesSquare,
} from "lucide-react";
import { Logo } from "../Logo";
import { logoutAction } from "@/app/admin/actions/auth";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", Icon: Package },
  { href: "/admin/categorias", label: "Categorías", Icon: FolderTree },
  { href: "/admin/promociones", label: "Promociones", Icon: Tag },
  { href: "/admin/consultas", label: "Consultas", Icon: MessagesSquare },
  { href: "/admin/testimonios", label: "Testimonios", Icon: MessageSquareQuote },
  { href: "/admin/configuracion", label: "Configuración", Icon: Settings, admin: true },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users, admin: true },
  { href: "/admin/cuenta", label: "Mi cuenta", Icon: KeyRound },
];

export function AdminNav({ user, logoUrl }: { user: { name: string; email: string; role: string }; logoUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin"><Logo logoUrl={logoUrl} compact /></Link>
        <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">Admin</span>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {ITEMS.filter((i) => !i.admin || user.role === "ADMIN").map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-500 text-white shadow-glow" : "text-ink-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-[18px] w-[18px]" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-2 border-t border-white/5 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> Ver sitio
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-white/[.03] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-300">{user.name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-ink-400">{user.role === "ADMIN" ? "Administrador" : "Editor"}</p>
          </div>
          <form action={logoutAction}>
            <button className="rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-ink-900 lg:block">{nav}</aside>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-ink-900/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo logoUrl={logoUrl} compact />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Abrir menú"><Menu className="h-6 w-6" /></button>
      </div>
      <div className={clsx("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")}>
        <div className={clsx("absolute inset-0 bg-black/70 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div className={clsx("absolute inset-y-0 left-0 w-72 bg-ink-900 transition-transform", open ? "translate-x-0" : "-translate-x-full")}>
          <button onClick={() => setOpen(false)} className="absolute right-3 top-5 z-10 rounded-lg p-1.5 hover:bg-white/10" aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
          {nav}
        </div>
      </div>
    </>
  );
}
