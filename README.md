# Zeta Telefonía — tienda online

Tienda online y panel de administración para Zeta Telefonía, comercio de celulares y accesorios de San Francisco, Córdoba.

**Sitio:** https://zetatelefoniasf.onrender.com

## Funcionalidades

- Catálogo por categoría y marca, con buscador, filtros, orden y paginación.
- Ficha de producto con galería, variantes de color, condición (nuevo / usado) y productos relacionados.
- Precios en dólares y en pesos, promociones con vigencia y descuentos.
- Lista de consulta: el cliente arma una lista de productos y la envía por WhatsApp.
- SEO: metadatos, Open Graph, datos estructurados, sitemap y robots.
- Panel `/admin`: productos (hasta 12 fotos), categorías, promociones, ajuste masivo de precios, usuarios con roles y configuración del sitio.
- Las fotos se validan y se convierten a WebP con miniaturas al subirlas.

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS · Cloud Firestore · Zod · sharp · sesiones JWT (jose) + bcrypt

## Correr en local

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Scripts útiles: `npm run admin:create`, `npm run backup`, `npm run typecheck`.
