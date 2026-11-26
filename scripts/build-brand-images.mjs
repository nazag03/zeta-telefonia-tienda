
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";

const SRC = "assets-src/instagram/";
const OUT = "public/images/brand/";
mkdirSync(OUT, { recursive: true });


const crops = [
  { src: "reel-2026-11-15.jpg", out: "san-francisco", top: 0, bottom: 0.47 },
];

for (const c of crops) {
  const img = sharp(SRC + c.src);
  const { width, height } = await img.metadata();
  const top = Math.round(height * c.top);
  const h = Math.round(height * c.bottom) - top;
  
  
  
  const scale = width < 900 ? 2 : 1;
  await sharp(SRC + c.src)
    .extract({ left: 0, top, width, height: h })
    .resize({ width: width * scale, kernel: "lanczos3" })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 2.2 })
    .modulate({ saturation: 1.04 })
    .webp({ quality: 88, smartSubsample: true })
    .toFile(`${OUT}${c.out}.webp`);
  console.log(`${c.out}.webp  ${width * scale}x${h * scale}`);
}


const HERO = "assets-src/hero/iphone-18-pro.png";
if (existsSync(HERO)) {
  await sharp(HERO).resize(1000, 1000, { fit: "inside" }).webp({ quality: 85, alphaQuality: 90 }).toFile(`${OUT}hero-iphone-18-pro.webp`);
  console.log("hero-iphone-18-pro.webp");
}
