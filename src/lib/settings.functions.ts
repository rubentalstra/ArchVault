import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./database";
import { appSettings } from "./schema/app-settings";
import {
  invalidateOtelSettingsCache,
  resolveOtelConfig,
} from "./settings.cache";
import {
  OTEL_SETTINGS_KEYS,
  otelSettingsSchema,
  type OtelSettings,
} from "./settings.validators";

async function ensureAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Forbidden");
  return session;
}

export const getOtelSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    await ensureAdmin();
    return resolveOtelConfig();
  },
);

export const updateOtelSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => otelSettingsSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await ensureAdmin();

    const entries: { key: string; value: unknown }[] = [];
    for (const [field, value] of Object.entries(data) as [
      keyof OtelSettings,
      unknown,
    ][]) {
      if (value === undefined) continue;
      const key = OTEL_SETTINGS_KEYS[field];
      if (key) {
        entries.push({ key, value });
      }
    }

    for (const { key, value } of entries) {
      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      if (existing.length > 0) {
        await db
          .update(appSettings)
          .set({ value, updatedBy: session.user.id })
          .where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({
          key,
          value,
          updatedBy: session.user.id,
        });
      }
    }

    invalidateOtelSettingsCache();

    return resolveOtelConfig();
  });
