
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile();
} catch {}

async function main() {
  const [email, password, name = "Administrador"] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Uso: npm run admin:create -- email@dominio.com "Contraseña123" "Nombre"');
    process.exit(1);
  }
  if (password.length < 10 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    console.error("La contraseña debe tener al menos 10 caracteres, letras y números.");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const mail = email.toLowerCase();
  const existing = await db.users.find((u) => u.email === mail);
  if (existing) await db.users.update(existing.id, { passwordHash, active: true, role: "ADMIN" });
  else await db.users.create({ email: mail, name, passwordHash, role: "ADMIN" });
  console.log(`✔ Administrador listo: ${mail}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
