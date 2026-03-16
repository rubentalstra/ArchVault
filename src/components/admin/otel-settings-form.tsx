import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { m } from "#/paraglide/messages";
import type {
  ResolvedOtelConfig,
  ResolvedOtelConfigWithSources,
} from "#/lib/settings.cache";
import { updateOtelSettings } from "#/lib/settings.functions";

interface OtelSettingsFormProps {
  initialData: ResolvedOtelConfigWithSources;
}

function SourceBadge({ source }: { source: "env" | "db" }) {
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {source === "env" ? m.admin_otel_source_env() : m.admin_otel_source_db()}
    </Badge>
  );
}

function RestartBadge() {
  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {m.admin_otel_requires_restart()}
    </Badge>
  );
}

export function OtelSettingsForm({ initialData }: OtelSettingsFormProps) {
  const queryClient = useQueryClient();
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    () => {
      const h = initialData.config.headers;
      const entries = Object.entries(h);
      return entries.length > 0
        ? entries.map(([key, value]) => ({ key, value }))
        : [];
    },
  );

  const form = useForm({
    defaultValues: {
      enabled: initialData.config.enabled,
      endpoint: initialData.config.endpoint,
      serviceName: initialData.config.serviceName,
      sampleRate: initialData.config.sampleRate,
      exportInterval: initialData.config.exportInterval,
      consoleExporter: initialData.config.consoleExporter,
    },
    onSubmit: async ({ value }) => {
      try {
        const headersRecord: Record<string, string> = {};
        for (const h of headers) {
          if (h.key.trim()) {
            headersRecord[h.key.trim()] = h.value;
          }
        }

        await updateOtelSettings({
          data: {
            ...value,
            headers: headersRecord,
          },
        });

        void queryClient.invalidateQueries({
          queryKey: ["admin", "otel-settings"],
        });
        toast.success(m.admin_otel_save_success());
      } catch {
        toast.error(m.admin_otel_save_failed());
      }
    },
  });

  const sources = initialData.sources;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Enable toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {m.admin_otel_enable()}
              </CardTitle>
              <CardDescription>
                {m.admin_otel_enable_description()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SourceBadge source={sources.enabled} />
              <form.Field name="enabled">
                {(field) => (
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SDK-level config (requires restart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {m.admin_otel_title()}
          </CardTitle>
          <CardDescription>{m.admin_otel_description()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Endpoint */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{m.admin_otel_endpoint()}</Label>
              <SourceBadge source={sources.endpoint} />
              <RestartBadge />
            </div>
            <form.Field name="endpoint">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={m.admin_otel_endpoint_placeholder()}
                />
              )}
            </form.Field>
            <p className="text-sm text-muted-foreground">
              {m.admin_otel_endpoint_description()}
            </p>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{m.admin_otel_headers()}</Label>
              <SourceBadge source={sources.headers} />
              <RestartBadge />
            </div>
            <p className="text-sm text-muted-foreground">
              {m.admin_otel_headers_description()}
            </p>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={header.key}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[index] = { ...updated[index], key: e.target.value };
                      setHeaders(updated);
                    }}
                    placeholder={m.admin_otel_headers_key_placeholder()}
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[index] = { ...updated[index], value: e.target.value };
                      setHeaders(updated);
                    }}
                    placeholder={m.admin_otel_headers_value_placeholder()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setHeaders(headers.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHeaders([...headers, { key: "", value: "" }])}
              >
                <Plus className="size-4" />
                {m.common_add()}
              </Button>
            </div>
          </div>

          {/* Service Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{m.admin_otel_service_name()}</Label>
              <SourceBadge source={sources.serviceName} />
              <RestartBadge />
            </div>
            <form.Field name="serviceName">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={m.admin_otel_service_name_placeholder()}
                />
              )}
            </form.Field>
            <p className="text-sm text-muted-foreground">
              {m.admin_otel_service_name_description()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Runtime config (no restart needed) */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Sample Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{m.admin_otel_sample_rate()}</Label>
              <SourceBadge source={sources.sampleRate} />
            </div>
            <form.Field name="sampleRate">
              {(field) => (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value) || 0)
                  }
                />
              )}
            </form.Field>
            <p className="text-sm text-muted-foreground">
              {m.admin_otel_sample_rate_description()}
            </p>
          </div>

          {/* Export Interval */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{m.admin_otel_export_interval()}</Label>
              <SourceBadge source={sources.exportInterval} />
            </div>
            <form.Field name="exportInterval">
              {(field) => (
                <Input
                  type="number"
                  min={5000}
                  step={1000}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseInt(e.target.value, 10) || 60000)
                  }
                />
              )}
            </form.Field>
            <p className="text-sm text-muted-foreground">
              {m.admin_otel_export_interval_description()}
            </p>
          </div>

          {/* Console Exporter */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label>{m.admin_otel_console_exporter()}</Label>
                <SourceBadge source={sources.consoleExporter} />
                <RestartBadge />
              </div>
              <p className="text-sm text-muted-foreground">
                {m.admin_otel_console_exporter_description()}
              </p>
            </div>
            <form.Field name="consoleExporter">
              {(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? m.common_saving() : m.common_save()}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
