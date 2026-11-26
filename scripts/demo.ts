
try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}

import { db, write, type Op } from "../src/lib/db";

type Demo = {
  name: string; brand: string; cat: string; price: number; promo?: number; currency?: "ARS" | "USD";
  condition?: string; availability?: string; featured?: boolean; isNew?: boolean; short: string; specs: [string, string][];
};

const DEMO: Demo[] = [
  { name: "iPhone 15 128GB", brand: "Apple", cat: "iphone", price: 899, promo: 849, currency: "USD", featured: true, isNew: true, short: "Sellado, con Dynamic Island y cámara de 48 MP.", specs: [["Almacenamiento", "128 GB"], ["Pantalla", "6,1\" Super Retina XDR"], ["Cámara principal", "48 MP"], ["Conector", "USB-C"]] },
  { name: "iPhone 13 128GB", brand: "Apple", cat: "iphone", price: 520, currency: "USD", condition: "USED", featured: true, short: "Usado en excelente estado, batería revisada.", specs: [["Almacenamiento", "128 GB"], ["Condición de batería", "88%"], ["Pantalla", "6,1\""]] },
  { name: "iPhone 16 Pro 256GB", brand: "Apple", cat: "iphone", price: 1399, currency: "USD", isNew: true, availability: "ON_ORDER", short: "Titanio, chip A18 Pro.", specs: [["Almacenamiento", "256 GB"], ["Pantalla", "6,3\" ProMotion"], ["Chip", "A18 Pro"]] },
  { name: "Samsung Galaxy S24 256GB", brand: "Samsung", cat: "samsung", price: 1150000, promo: 1049000, featured: true, short: "Galaxy AI, pantalla Dynamic AMOLED 2X.", specs: [["Almacenamiento", "256 GB"], ["Memoria RAM", "8 GB"], ["Pantalla", "6,2\""]] },
  { name: "Samsung Galaxy A55 128GB", brand: "Samsung", cat: "samsung", price: 620000, short: "Gama media premium con cuerpo de metal y vidrio.", specs: [["Almacenamiento", "128 GB"], ["Memoria RAM", "8 GB"]] },
  { name: "Motorola Edge 50 Fusion", brand: "Motorola", cat: "motorola", price: 540000, availability: "LOW_STOCK", isNew: true, short: "Pantalla pOLED curva de 144 Hz.", specs: [["Almacenamiento", "256 GB"], ["Memoria RAM", "8 GB"]] },
  { name: "Motorola Moto G54", brand: "Motorola", cat: "motorola", price: 320000, promo: 289000, short: "Gran batería y 5G a precio accesible.", specs: [["Batería", "5000 mAh"], ["Conectividad", "5G"]] },
  { name: "Xiaomi Redmi Note 13 Pro", brand: "Xiaomi", cat: "xiaomi", price: 480000, short: "Cámara de 200 MP y carga rápida de 67 W.", specs: [["Cámara principal", "200 MP"], ["Carga", "67 W"]] },
  { name: "AirPods Pro (2.ª generación)", brand: "Apple", cat: "auriculares", price: 249, currency: "USD", featured: true, short: "Cancelación activa de ruido y estuche USB-C.", specs: [["Cancelación de ruido", "Sí"], ["Autonomía", "Hasta 6 h"]] },
  { name: "JBL Tune 520BT", brand: "JBL", cat: "auriculares", price: 85000, availability: "OUT_OF_STOCK", short: "Auriculares on-ear inalámbricos.", specs: [["Autonomía", "57 h"]] },
  { name: "JBL Flip 6", brand: "JBL", cat: "parlantes", price: 175000, promo: 159000, featured: true, short: "Parlante Bluetooth resistente al agua IP67.", specs: [["Resistencia", "IP67"], ["Autonomía", "12 h"]] },
  { name: "Cargador Apple USB-C 20W", brand: "Apple", cat: "cargadores", price: 35000, short: "Original, carga rápida para iPhone.", specs: [["Potencia", "20 W"], ["Conector", "USB-C"]] },
  { name: "Power Bank 10000 mAh MagSafe", brand: "Genérico", cat: "cargadores-portatiles", price: 42000, isNew: true, short: "Batería magnética compatible con MagSafe.", specs: [["Capacidad", "10000 mAh"]] },
  { name: "Funda silicona iPhone 15", brand: "Apple", cat: "fundas-y-accesorios", price: 18000, short: "Interior de microfibra, varios colores.", specs: [["Compatibilidad", "iPhone 15"]] },
  { name: "Apple Watch SE 40mm", brand: "Apple", cat: "smartwatches", price: 299, currency: "USD", short: "Seguimiento de actividad y detección de choques.", specs: [["Tamaño", "40 mm"]] },
  { name: "PlayStation 5 Slim", brand: "Sony", cat: "tecnologia-varios", price: 899, currency: "USD", availability: "ON_ORDER", short: "Consola con lectora, 1 TB.", specs: [["Almacenamiento", "1 TB"]] },
];

const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  if (process.argv.includes("--remove")) {
    const demo = await db.products.where((p) => (p.model ?? "").includes("[DEMO]"));
    await write(demo.map((p): Op => ({ op: "delete", col: "products", id: p.id })));
    console.log(`✔ ${demo.length} productos demo eliminados`);
    return;
  }
  const cats = await db.categories.all();
  let n = 0;
  for (const [i, d] of DEMO.entries()) {
    const slug = slugify(d.name);
    if (await db.products.find((p) => p.slug === slug)) continue;
    await db.products.create({
        name: d.name,
        slug,
        brand: d.brand,
        model: "[DEMO]",
        shortDescription: d.short,
        description: `${d.short}\n\nProducto de demostración: reemplazalo por tus productos reales desde el panel.`,
        price: d.currency === "USD" ? null : d.price,
        promoPrice: d.currency === "USD" ? null : (d.promo ?? null),
        priceUsd: d.currency === "USD" ? d.price : null,
        promoPriceUsd: d.currency === "USD" ? (d.promo ?? null) : null,
        currency: d.currency ?? "ARS",
        condition: d.condition ?? "NEW",
        availability: d.availability ?? "IN_STOCK",
        isFeatured: !!d.featured,
        isNew: !!d.isNew,
        isOffer: !!d.promo,
        order: i,
        categoryId: cats.find((c) => c.slug === d.cat)?.id ?? null,
        specs: JSON.stringify(d.specs.map(([label, value]) => ({ label, value }))),
    });
    n++;
  }
  console.log(`✔ ${n} productos demo creados`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
