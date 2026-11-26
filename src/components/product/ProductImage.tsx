import Image from "next/image";
import clsx from "clsx";
import { Placeholder } from "./Placeholder";

type Props = {
  src?: string | null;
  alt: string;
  sizes?: string;
  eager?: boolean;
  fit?: "contain" | "cover";
  
  label?: string;
  className?: string;
  
  blend?: boolean;
};


export function ProductImage({ src, alt, sizes = "(min-width:1024px) 33vw, 50vw", eager, fit = "contain", label, className, blend = true }: Props) {
  if (!src) return <Placeholder label={label} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={clsx(fit === "contain" ? "object-contain" : "object-cover", blend && "mix-blend-multiply", className)}
    />
  );
}
