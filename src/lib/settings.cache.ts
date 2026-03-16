import { eq } from "drizzle-orm";
import type { OtelSettings } from "./settings.validators";
import { OTEL_SETTINGS_KEYS } from "./settings.validators";

interface CachedSettings {
  data: ResolvedOtelConfig;
  timestamp: number;
}

export interface ResolvedOtelConfig {
  enabled: boolean;
  endpoint: string;
  headers: Record<string, string>;
  serviceName: string;
  sampleRate: number;
  exportInterval: number;
  consoleExporter: boolean;
}

export interface ResolvedOtelConfigWithSources {
  config: ResolvedOtelConfig;
  sources: Record<keyof ResolvedOtelConfig, "env" | "db">;
}

const CACHE_TTL_MS = 30_000; // 30 seconds
let cache: CachedSettings | null = null;

function getEnvDefaults(): ResolvedOtelConfig {
  return {
    enabled: process.env.OTEL_ENABLED === "true",
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "",
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    serviceName: process.env.OTEL_SERVICE_NAME ?? "archvault",
    sampleRate: parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG ?? "1.0") * 100,
    exportInterval: parseInt(
      process.env.OTEL_METRICS_EXPORT_INTERVAL ?? "60000",
      10,
    ),
    consoleExporter: process.env.OTEL_CONSOLE_EXPORTER === "true",
  };
}

function parseHeaders(raw?: string): Record<string, string> {
  if (!raw) return {};
  const headers: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [key, ...rest] = pair.split("=");
    if (key && rest.length > 0) {
      headers[key.trim()] = rest.join("=").trim();
    }
  }
  return headers;
}

async function fetchDbSettings(): Promise<Partial<OtelSettings>> {
  try {
    // Dynamic import to avoid issues when DB isn't ready
    const { db } = await import("./database");
    const { appSettings } = await import("./schema/app-settings");

    const allKeys = Object.values(OTEL_SETTINGS_KEYS);
    const rows = await Promise.all(
      allKeys.map((key) =>
        db
          .select()
          .from(appSettings)
          .where(eq(appSettings.key, key))
          .then((r) => (r.length > 0 ? { key, value: r[0].value } : null)),
      ),
    );

    const result: Partial<OtelSettings> = {};
    for (const row of rows) {
      if (!row) continue;
      const fieldName = Object.entries(OTEL_SETTINGS_KEYS).find(
        ([, v]) => v === row.key,
      )?.[0] as keyof OtelSettings | undefined;
      if (fieldName) {
        (result as Record<string, unknown>)[fieldName] = row.value;
      }
    }
    return result;
  } catch {
    // DB not ready — fall back to env-only
    return {};
  }
}

export async function resolveOtelConfig(): Promise<ResolvedOtelConfigWithSources> {
  const envDefaults = getEnvDefaults();
  const dbOverrides = await fetchDbSettings();

  const sources: Record<keyof ResolvedOtelConfig, "env" | "db"> = {
    enabled: "env",
    endpoint: "env",
    headers: "env",
    serviceName: "env",
    sampleRate: "env",
    exportInterval: "env",
    consoleExporter: "env",
  };

  const config = { ...envDefaults };

  if (dbOverrides.enabled !== undefined) {
    config.enabled = dbOverrides.enabled;
    sources.enabled = "db";
  }
  if (dbOverrides.endpoint !== undefined && dbOverrides.endpoint !== "") {
    config.endpoint = dbOverrides.endpoint;
    sources.endpoint = "db";
  }
  if (
    dbOverrides.headers !== undefined &&
    Object.keys(dbOverrides.headers).length > 0
  ) {
    config.headers = dbOverrides.headers;
    sources.headers = "db";
  }
  if (dbOverrides.serviceName !== undefined) {
    config.serviceName = dbOverrides.serviceName;
    sources.serviceName = "db";
  }
  if (dbOverrides.sampleRate !== undefined) {
    config.sampleRate = dbOverrides.sampleRate;
    sources.sampleRate = "db";
  }
  if (dbOverrides.exportInterval !== undefined) {
    config.exportInterval = dbOverrides.exportInterval;
    sources.exportInterval = "db";
  }
  if (dbOverrides.consoleExporter !== undefined) {
    config.consoleExporter = dbOverrides.consoleExporter;
    sources.consoleExporter = "db";
  }

  return { config, sources };
}

export async function getCachedOtelSettings(): Promise<ResolvedOtelConfig> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const { config } = await resolveOtelConfig();
  cache = { data: config, timestamp: Date.now() };
  return config;
}

export function invalidateOtelSettingsCache(): void {
  cache = null;
}
