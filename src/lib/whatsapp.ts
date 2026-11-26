import { displayPrice, hasPrice, type Priced } from "./format";

export function waLink(number: string, message?: string) {
  const digits = (number || "").replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

type P = Priced & { name: string };


function priceText(p: P) {
  return hasPrice(p) ? displayPrice(p) : "";
}

export function productMessage(p: P, url?: string) {
  const price = priceText(p);
  const link = url ? `\n${url}` : "";
  return price
    ? `Hola! Estoy interesado en el ${p.name} (${price}). ¿Me podrían brindar más información y confirmar disponibilidad?${link}`
    : `Hola! Estoy interesado en el ${p.name}. ¿Me podrían pasar el precio y confirmar disponibilidad?${link}`;
}

export function listMessage(items: (P & { qty: number })[]) {
  const lines = items.map(
    (i) => `• ${i.qty > 1 ? `${i.qty} x ` : ""}${i.name} — ${priceText(i) || "consultar precio"}`
  );
  return `Hola! Quisiera consultar por los siguientes productos:\n${lines.join("\n")}\n\n¿Me podrían confirmar disponibilidad, medios de pago y opciones de financiación?`;
}

export function promotionMessage(title: string) {
  return `Hola! Vi la promoción "${title}" en la web y quería más información.`;
}

export const GENERAL_TOPICS = [
  { label: "Disponibilidad", message: "Hola! Quería consultar la disponibilidad de un equipo." },
  { label: "Financiación", message: "Hola! Quería consultar por las opciones de financiación." },
  { label: "Plan canje", message: "Hola! Quería consultar por el plan canje para entregar mi equipo usado." },
  { label: "Envíos", message: "Hola! Quería consultar si realizan envíos y sus costos." },
  { label: "Medios de pago", message: "Hola! Quería consultar qué medios de pago aceptan." },
  { label: "Servicio técnico", message: "Hola! Quería hacer una consulta sobre servicio técnico." },
];
