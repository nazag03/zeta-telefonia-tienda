
import bcrypt from "bcryptjs";
import { settingsSchema } from "../src/lib/settings-schema";
import { db } from "../src/lib/db";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}

const CATEGORIES = [
  ["iPhone", "iphone", "iPhone sellados y usados, con garantía y plan canje."],
  ["Samsung", "samsung", "Celulares Samsung Galaxy de todas las gamas."],
  ["Motorola", "motorola", "Celulares Motorola para cada presupuesto."],
  ["Xiaomi", "xiaomi", "Celulares Xiaomi, Redmi y POCO."],
  ["Otros celulares", "otros-celulares", null],
  ["Auriculares", "auriculares", "Auriculares inalámbricos, in-ear y over-ear."],
  ["Parlantes", "parlantes", "Parlantes Bluetooth portátiles."],
  ["Cargadores", "cargadores", "Cargadores originales, cables y fuentes."],
  ["Cargadores portátiles", "cargadores-portatiles", "Power banks para llevar a todos lados."],
  ["Fundas y accesorios", "fundas-y-accesorios", "Fundas, vidrios templados y más."],
  ["Smartwatches", "smartwatches", "Relojes inteligentes y pulseras de actividad."],
  ["Tecnología varios", "tecnologia-varios", "Consolas, gadgets y otros productos tecnológicos."],
] as const;

async function main() {
  for (const [i, [name, slug, description]] of CATEGORIES.entries()) {
    if (await db.categories.find((c) => c.slug === slug)) continue;
    await db.categories.create({ name, slug, description, order: i, showOnHome: i < 8 });
  }
  console.log(`✔ ${CATEGORIES.length} categorías`);

  const existing = await db.settings.get("site");
  if (!existing) {
    await db.settings.set("site", { value: JSON.stringify(settingsSchema.parse({})) });
    console.log("✔ Configuración del negocio (datos de Instagram)");
  }

  if ((await db.users.count()) === 0) {
    const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!email || password.length < 10) {
      console.warn("⚠ No se creó el administrador: definí ADMIN_EMAIL y ADMIN_PASSWORD (mín. 10 caracteres) en .env");
    } else {
      await db.users.create({ email, name: process.env.ADMIN_NAME || "Administrador", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) });
      console.log(`✔ Administrador creado: ${email}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
