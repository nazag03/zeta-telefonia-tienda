import { cache } from "react";
import { db } from "./db";
import { settingsSchema, type SiteSettings } from "./settings-schema";

const KEY = "site";

function parse(raw: unknown): SiteSettings {
  const result = settingsSchema.safeParse(raw ?? {});
  if (result.success) return result.data;
  
  const base = settingsSchema.parse({}) as Record<string, unknown>;
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) {
      const field = settingsSchema.shape[k as keyof SiteSettings];
      if (field && field.safeParse(v).success) base[k] = v;
    }
  }
  return base as SiteSettings;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await db.settings.get(KEY);
    return parse(row ? JSON.parse(row.value) : {});
  } catch {
    return settingsSchema.parse({});
  }
});

export async function saveSettings(data: SiteSettings) {
  const value = JSON.stringify(settingsSchema.parse(data));
  await db.settings.set(KEY, { value });
}
