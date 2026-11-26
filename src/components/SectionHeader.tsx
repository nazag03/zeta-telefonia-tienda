import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: string;
  text?: string;
  href?: string;
  linkLabel?: string;
  dark?: boolean;
  
  actions?: React.ReactNode;
  id?: string;
};

export function SectionHeader({ eyebrow, title, text, href, linkLabel = "Ver todo", dark, actions, id }: Props) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:mb-14 md:flex-row md:items-end md:justify-between">
      <Reveal className="max-w-3xl">
        {eyebrow && <p className={clsx("kicker mb-3", dark && "text-brand-300")}>{eyebrow}</p>}
        <h2 id={id} className={clsx("display-2 text-balance", dark ? "text-white" : "text-ink")}>{title}</h2>
        {text && <p className={clsx("mt-4 text-lg leading-relaxed", dark ? "text-white/60" : "text-mute")}>{text}</p>}
      </Reveal>
      {(href || actions) && (
        <Reveal delay={120} className="flex shrink-0 items-center gap-4">
          {actions}
          {href && (
            <Link href={href} className={clsx("group inline-flex shrink-0 items-center gap-2 text-[0.95rem] font-medium", dark ? "text-white" : "text-ink")}>
              {linkLabel}
              <span
                className={clsx(
                  "flex size-8 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1",
                  dark ? "bg-white/10 group-hover:bg-white group-hover:text-ink" : "bg-mist group-hover:bg-ink group-hover:text-white"
                )}
              >
                <ArrowRight className="size-4" />
              </span>
            </Link>
          )}
        </Reveal>
      )}
    </div>
  );
}
