import { z } from "zod/v4";

export const otelSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  endpoint: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  headers: z.record(z.string(), z.string()).optional(),
  serviceName: z.string().min(1).max(100).optional(),
  sampleRate: z.number().min(0).max(100).optional(),
  exportInterval: z.number().min(5).optional(),
  consoleExporter: z.boolean().optional(),
});

export type OtelSettings = z.infer<typeof otelSettingsSchema>;

/** Maps form field names to app_settings keys */
export const OTEL_SETTINGS_KEYS = {
  enabled: "otel.enabled",
  endpoint: "otel.endpoint",
  headers: "otel.headers",
  serviceName: "otel.serviceName",
  sampleRate: "otel.sampleRate",
  exportInterval: "otel.exportInterval",
  consoleExporter: "otel.consoleExporter",
} as const;
