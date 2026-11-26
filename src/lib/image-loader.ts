"use client";


export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("/uploads/") && src.endsWith(".webp") && !/\.w\d+\.webp$/.test(src)) {
    if (width <= 640) return src.replace(/\.webp$/, ".w640.webp");
    if (width <= 1080) return src.replace(/\.webp$/, ".w1080.webp");
    return src;
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
