import Image from "next/image";
import clsx from "clsx";


const DEFAULT_LOGO = "/logo.png";

type Props = {
  logoUrl?: string;
  name?: string;
  
  className?: string;
  
  size?: string;
  compact?: boolean;
};

export function Logo({ logoUrl, name = "Zeta Telefonía", className, size = "h-12 w-24" }: Props) {
  return (
    <span className={clsx("relative block", size, className)}>
      <Image src={logoUrl || DEFAULT_LOGO} alt={name} fill sizes="120px" className="object-contain object-left" preload />
    </span>
  );
}
