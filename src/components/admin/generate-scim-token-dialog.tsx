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
import { toast } from "sonner";
import { Copy, AlertTriangle } from "lucide-react";
import { m } from "#/paraglide/messages";

const generateTokenSchema = z.object({
  providerId: z.string().min(1, m.validation_provider_id_required()),
  organizationId: z.string().optional(),
});

interface GenerateScimTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GenerateScimTokenDialog({
  open,
  onOpenChange,
  onSuccess,
}: GenerateScimTokenDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      providerId: "",
      organizationId: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setGeneratedToken(null);
      const parsed = generateTokenSchema.safeParse(value);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      const body: { providerId: string; organizationId?: string } = {
        providerId: parsed.data.providerId,
      };
      if (parsed.data.organizationId) {
        body.organizationId = parsed.data.organizationId;
      }

      const { data, error: genError } = await authClient.scim.generateToken(body);

      if (genError) {
        setError((genError as { message?: string }).message ?? m.admin_scim_generate_failed());
        return;
      }

      const token = (data as { token?: string })?.token ?? String(data);
      setGeneratedToken(token);
      toast.success(m.admin_scim_generate_success());
      onSuccess();
    },
  });

  const handleCopyToken = async () => {
    if (!generatedToken) return;
    await navigator.clipboard.writeText(generatedToken);
    toast.success(m.admin_scim_token_copied());
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setGeneratedToken(null);
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.admin_scim_generate_title()}</DialogTitle>
          <DialogDescription>
            {m.admin_scim_generate_description()}
          </DialogDescription>
        </DialogHeader>

        {generatedToken ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {m.admin_scim_token_warning()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-muted p-3 text-xs break-all">
                {generatedToken}
              </code>
              <Button variant="outline" size="icon-sm" onClick={handleCopyToken}>
                <Copy className="size-4" />
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm">
                <span className="font-medium">{m.admin_scim_base_url()} </span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {typeof window !== "undefined" ? window.location.origin : ""}/api/auth/scim/v2
                </code>
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => handleClose(false)}>{m.common_done()}</Button>
            </DialogFooter>
          </div>
        ) : (
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
                  <Label htmlFor="scim-provider-id">{m.admin_scim_label_provider_id()}</Label>
                  <Input
                    id="scim-provider-id"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={m.admin_scim_placeholder_provider_id()}
                  />
                  <p className="text-xs text-muted-foreground">
                    {m.admin_scim_provider_id_hint()}
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="organizationId">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="scim-org-id">{m.admin_scim_label_org_id()}</Label>
                  <Input
                    id="scim-org-id"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={m.admin_scim_placeholder_org_id()}
                  />
                </div>
              )}
            </form.Field>

            <DialogFooter>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.admin_scim_generating() : m.admin_scim_generate_token()}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
