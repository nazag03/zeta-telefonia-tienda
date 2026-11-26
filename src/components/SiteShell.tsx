import { getSettings } from "@/lib/settings";
import { getCategories } from "@/lib/queries";
import { siteUrl } from "@/lib/format";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { InquiryListProvider } from "./InquiryList";
import { ListDrawer } from "./ListDrawer";
import { ToastStack } from "./ToastStack";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [s, categories] = await Promise.all([getSettings(), getCategories()]);
  
  const cats = categories.filter((c) => c._count.products > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.products }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: s.businessName,
    description: s.seoDescription,
    url: siteUrl(),
    logo: siteUrl(s.logoUrl || "/logo.png"),
    telephone: s.whatsapp ? `+${s.whatsapp.replace(/\D/g, "")}` : undefined,
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressRegion: "Córdoba", addressCountry: "AR" },
    sameAs: [s.instagramUrl, s.facebookUrl, s.tiktokUrl].filter(Boolean),
  };

  return (
    <InquiryListProvider whatsapp={s.whatsapp}>
      <div className="site">
        <a href="#contenido" className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Saltar al contenido
        </a>
        <Header
          logoUrl={s.logoUrl}
          businessName={s.businessName}
          whatsapp={s.whatsapp}
          greeting={s.whatsappGreeting}
          announcement={s.announcement}
          instagramUrl={s.instagramUrl}
          instagramHandle={s.instagramHandle}
          address={`${s.address}, ${s.city}`}
          categories={cats}
        />
        <main id="contenido" className="min-h-[70vh]">{children}</main>
        <Footer s={s} categories={cats} />
        <WhatsAppFloat number={s.whatsapp} greeting={s.whatsappGreeting} businessName={s.businessName} />
        <ListDrawer />
        <ToastStack />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </InquiryListProvider>
  );
}
