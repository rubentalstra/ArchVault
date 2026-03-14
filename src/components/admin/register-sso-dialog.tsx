import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { m } from "#/paraglide/messages";

const registerSSOSchema = z.object({
  providerId: z
    .string()
    .min(2, m.validation_provider_id_min())
    .regex(/^[a-z0-9-]+$/, m.validation_provider_id_format()),
  issuer: z.url(m.validation_url_invalid()),
  domain: z.string().min(3, m.validation_domain_required()),
  type: z.enum(["oidc", "saml"]),
  // OIDC fields
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  // SAML fields
  entryPoint: z.string().optional(),
  certificate: z.string().optional(),
  callbackUrl: z.string().optional(),
  // Optional
  organizationId: z.string().optional(),
});

interface RegisterSSODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RegisterSSODialog({
  open,
  onOpenChange,
  onSuccess,
}: RegisterSSODialogProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      providerId: "",
      issuer: "",
      domain: "",
      type: "oidc" as "oidc" | "saml",
      clientId: "",
      clientSecret: "",
      entryPoint: "",
      certificate: "",
      callbackUrl: "",
      organizationId: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const parsed = registerSSOSchema.safeParse(value);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      const { providerId, issuer, domain, type, organizationId } = parsed.data;

      const body: Record<string, unknown> = {
        providerId,
        issuer,
        domain,
      };

      if (organizationId) {
        body.organizationId = organizationId;
      }

      if (type === "oidc") {
        if (!parsed.data.clientId || !parsed.data.clientSecret) {
          setError(m.validation_oidc_credentials_required());
          return;
        }
        body.oidcConfig = {
          clientId: parsed.data.clientId,
          clientSecret: parsed.data.clientSecret,
        };
      } else {
        if (!parsed.data.entryPoint || !parsed.data.certificate) {
          setError(m.validation_saml_credentials_required());
          return;
        }
        body.samlConfig = {
          entryPoint: parsed.data.entryPoint,
          cert: parsed.data.certificate,
          callbackUrl: parsed.data.callbackUrl || undefined,
        };
      }

      const { error: registerError } = await authClient.sso.register(
        body as Parameters<typeof authClient.sso.register>[0],
      );

      if (registerError) {
        setError((registerError as { message?: string }).message ?? m.admin_sso_register_failed());
        return;
      }

      toast.success(m.admin_sso_register_success());
      onOpenChange(false);
      onSuccess();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{m.admin_sso_register_title()}</DialogTitle>
          <DialogDescription>
            {m.admin_sso_register_description()}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}

          <form.Field name="providerId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sso-provider-id">{m.admin_sso_label_provider_id()}</Label>
                <Input
                  id="sso-provider-id"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_sso_placeholder_provider_id()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="issuer">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sso-issuer">{m.admin_sso_label_issuer_url()}</Label>
                <Input
                  id="sso-issuer"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_sso_placeholder_issuer_url()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="domain">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sso-domain">{m.admin_sso_label_domain()}</Label>
                <Input
                  id="sso-domain"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_sso_placeholder_domain()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="type">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.admin_sso_label_type()}</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val: string | null) => {
                    if (val) field.handleChange(val as "oidc" | "saml");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oidc">OIDC</SelectItem>
                    <SelectItem value="saml">SAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(s) => s.values.type}>
            {(type) =>
              type === "oidc" ? (
                <>
                  <form.Field name="clientId">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sso-client-id">{m.admin_sso_label_client_id()}</Label>
                        <Input
                          id="sso-client-id"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={m.admin_sso_placeholder_client_id()}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="clientSecret">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sso-client-secret">{m.admin_sso_label_client_secret()}</Label>
                        <div className="relative">
                          <Input
                            id="sso-client-secret"
                            type={showSecret ? "text" : "password"}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder={m.admin_sso_placeholder_client_secret()}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowSecret(!showSecret)}
                          >
                            {showSecret ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {m.admin_sso_oidc_auto_discover()}
                        </p>
                      </div>
                    )}
                  </form.Field>
                </>
              ) : (
                <>
                  <form.Field name="entryPoint">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sso-entry-point">{m.admin_sso_label_entry_point()}</Label>
                        <Input
                          id="sso-entry-point"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={m.admin_sso_placeholder_entry_point()}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="certificate">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sso-certificate">{m.admin_sso_label_certificate()}</Label>
                        <Textarea
                          id="sso-certificate"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                          rows={4}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="callbackUrl">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sso-callback-url">{m.admin_sso_label_callback_url()}</Label>
                        <Input
                          id="sso-callback-url"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={m.admin_sso_placeholder_callback_url()}
                        />
                      </div>
                    )}
                  </form.Field>
                </>
              )
            }
          </form.Subscribe>

          <form.Field name="organizationId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sso-org-id">{m.admin_sso_label_org_id()}</Label>
                <Input
                  id="sso-org-id"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_sso_placeholder_org_link()}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.admin_sso_registering() : m.admin_sso_register()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
