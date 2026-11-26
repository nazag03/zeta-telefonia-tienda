import { z } from "zod";



export const settingsSchema = z.object({
  businessName: z.string().min(1).max(80).default("Zeta Telefonía"),
  tagline: z.string().max(140).default("Tu punto de encuentro con Apple"),
  logoUrl: z.string().max(500).default(""),

  whatsapp: z.string().max(20).default("5493564523018"),
  whatsappDisplay: z.string().max(40).default("3564 523018"),
  whatsappGreeting: z.string().max(400).default("Hola Zeta Telefonía! Quería hacerles una consulta."),
  email: z.string().max(120).default(""),

  address: z.string().max(160).default("Pellegrini 14, Piso 1 (Edificio Pellegrini)"),
  city: z.string().max(80).default("San Francisco, Córdoba"),
  mapsQuery: z.string().max(240).default("Pellegrini 14, San Francisco, Córdoba, Argentina"),
  hours: z
    .array(z.object({ days: z.string().max(60), hours: z.string().max(80) }))
    .max(10)
    .default([
      { days: "Lunes a viernes", hours: "9:00 a 12:30 y 16:00 a 20:00" },
      { days: "Sábados", hours: "9:00 a 12:30" },
    ]),

  instagramUrl: z.string().max(200).default("https://www.instagram.com/zetatelefoniasf/"),
  instagramHandle: z.string().max(60).default("zetatelefoniasf"),
  facebookUrl: z.string().max(200).default(""),
  tiktokUrl: z.string().max(200).default(""),

  announcement: z.string().max(160).default("iPhone sellados y usados · Plan canje · Financiación"),

  heroEyebrow: z.string().max(80).default("San Francisco · Córdoba"),
  heroTitle: z.string().max(120).default("La tecnología que querés,"),
  heroHighlight: z.string().max(60).default("hoy en tus manos."),
  heroSubtitle: z
    .string()
    .max(320)
    .default(
      "iPhone sellados y usados, celulares de todas las marcas y los mejores accesorios. Atención personalizada, plan canje y alternativas para cada presupuesto."
    ),
  heroCtaLabel: z.string().max(40).default("Explorar productos"),
  heroImage: z.string().max(500).default(""),

  highlights: z
    .array(z.string().max(40))
    .max(6)
    .default(["+6 años de trayectoria", "Importadores directos", "Servicio técnico"]),

  benefits: z
    .array(z.object({ title: z.string().max(60), text: z.string().max(220) }))
    .max(8)
    .default([
      { title: "Importadores directos", text: "Trabajamos sin intermediarios para ofrecerte mejores precios en equipos originales." },
      { title: "Plan canje", text: "Entregá tu equipo usado como parte de pago y llevate uno nuevo." },
      { title: "Financiación", text: "Consultá las opciones de financiación disponibles, incluso con recibo de sueldo." },
      { title: "Servicio técnico", text: "Te acompañamos también después de la compra con servicio técnico propio." },
    ]),

  aboutTitle: z.string().max(120).default("Tu punto de encuentro con Apple en San Francisco"),
  aboutText: z
    .string()
    .max(4000)
    .default(
      "En Zeta Telefonía nos dedicamos a la venta de iPhone sellados y usados, celulares de otras marcas, accesorios y productos tecnológicos.\n\nTrabajamos como importadores directos y ofrecemos atención personalizada para ayudarte a encontrar el equipo indicado según lo que necesitás y tu presupuesto."
    ),
  aboutImage: z.string().max(500).default(""),

  paymentInfo: z
    .string()
    .max(600)
    .default("Consultanos por medios de pago, financiación, plan canje y envíos."),

  seoTitle: z.string().max(80).default("Zeta Telefonía | iPhone, celulares y accesorios en San Francisco"),
  seoDescription: z
    .string()
    .max(200)
    .default(
      "iPhone sellados y usados, Samsung, Motorola, Xiaomi, auriculares, parlantes y accesorios en San Francisco, Córdoba. Plan canje, financiación y servicio técnico."
    ),
});

export type SiteSettings = z.infer<typeof settingsSchema>;
