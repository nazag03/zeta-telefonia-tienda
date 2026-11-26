"use client";

import clsx from "clsx";
import { WhatsAppIcon } from "./icons";
import { trackInquiry } from "./InquiryList";
import { waLink } from "@/lib/whatsapp";

type Props = {
  number: string;
  message: string;
  type?: "PRODUCT" | "LIST" | "GENERAL" | "PROMOTION";
  productId?: string;
  detail?: string;
  className?: string;
  children?: React.ReactNode;
  icon?: boolean;
  
  variant?: "wa" | "ghost" | "ghost-dark" | "plain";
  ariaLabel?: string;
};


export function WaButton({ number, message, type = "GENERAL", productId, detail, className, children, icon = true, variant = "wa", ariaLabel }: Props) {
  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        trackInquiry({ type, productId, detail });
      }}
      className={clsx(
        variant === "wa" && "pill-wa",
        variant === "ghost" && "pill-ghost",
        variant === "ghost-dark" && "pill-ghost-dark",
        className
      )}
    >
      {icon && <WhatsAppIcon className={clsx("size-[1.15em]", variant === "ghost-dark" && "text-whatsapp")} />}
      {children ?? "Consultar por WhatsApp"}
    </a>
  );
}
