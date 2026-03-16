import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import type { Attributes, Context, Link, SpanKind } from "@opentelemetry/api";
import type { Sampler, SamplingResult } from "@opentelemetry/sdk-trace-node";
import { SamplingDecision } from "@opentelemetry/sdk-trace-node";

// Read env vars directly — DB may not be ready at boot time
const enabled = process.env.OTEL_ENABLED === "true";
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const serviceName = process.env.OTEL_SERVICE_NAME ?? "archvault";
const consoleExporterEnabled = process.env.OTEL_CONSOLE_EXPORTER === "true";
const exportInterval = parseInt(
  process.env.OTEL_METRICS_EXPORT_INTERVAL ?? "60000",
  10,
);
const initialSampleRate = parseFloat(
  process.env.OTEL_TRACES_SAMPLER_ARG ?? "1.0",
);

function parseEnvHeaders(): Record<string, string> {
  const raw = process.env.OTEL_EXPORTER_OTLP_HEADERS;
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

/**
 * Dynamic sampler that can be updated at runtime from the admin panel.
 * Reads the sample rate from the settings cache when available.
 */
class DynamicSampler implements Sampler {
  private _rate: number;

  constructor(rate: number) {
    this._rate = Math.max(0, Math.min(1, rate));
  }

  shouldSample(
    _context: Context,
    _traceId: string,
    _spanName: string,
    _spanKind: SpanKind,
    _attributes: Attributes,
    _links: Link[],
  ): SamplingResult {
    if (Math.random() < this._rate) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }
    return { decision: SamplingDecision.NOT_RECORD };
  }

  toString(): string {
    return `DynamicSampler{rate=${this._rate}}`;
  }

  updateRate(rate: number): void {
    this._rate = Math.max(0, Math.min(1, rate));
  }
}

export const dynamicSampler = new DynamicSampler(initialSampleRate);

let sdk: NodeSDK | undefined;

if (enabled) {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "0.1.0",
  });

  const headers = parseEnvHeaders();

  const traceExporter = new OTLPTraceExporter({
    ...(endpoint ? { url: `${endpoint}/v1/traces` } : {}),
    headers,
  });

  const metricExporter = new OTLPMetricExporter({
    ...(endpoint ? { url: `${endpoint}/v1/metrics` } : {}),
    headers,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: exportInterval,
  });

  const spanProcessors = [new BatchSpanProcessor(traceExporter)];
  if (consoleExporterEnabled) {
    spanProcessors.push(new BatchSpanProcessor(new ConsoleSpanExporter()));
  }

  sdk = new NodeSDK({
    resource,
    sampler: dynamicSampler,
    spanProcessors,
    metricReaders: [metricReader],
  });

  sdk.start();

  // Graceful shutdown
  const shutdown = () => {
    sdk
      ?.shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Periodically sync sample rate from DB settings cache
if (enabled) {
  const syncSampleRate = async () => {
    try {
      const { getCachedOtelSettings } = await import("./lib/settings.cache");
      const settings = await getCachedOtelSettings();
      dynamicSampler.updateRate(settings.sampleRate / 100);
    } catch {
      // Settings cache not available yet — keep current rate
    }
  };

  // Start syncing after a delay to let DB initialize
  setTimeout(() => {
    void syncSampleRate();
    setInterval(() => void syncSampleRate(), 30_000);
  }, 5_000);
}
