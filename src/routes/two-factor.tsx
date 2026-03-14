import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { m } from "#/paraglide/messages";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/two-factor")({
  validateSearch: (search) => searchSchema.parse(search),
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    toast.success(m.auth_two_factor_verified());
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  const totpForm = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: value.code,
      });

      if (verifyError) {
        setError(verifyError.message ?? m.auth_two_factor_invalid_code());
        return;
      }

      onSuccess();
    },
  });

  const backupForm = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: verifyError } =
        await authClient.twoFactor.verifyBackupCode({
          code: value.code,
        });

      if (verifyError) {
        setError(verifyError.message ?? m.auth_two_factor_invalid_backup());
        return;
      }

      onSuccess();
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {m.auth_two_factor_title()}
          </CardTitle>
          <CardDescription>
            {useBackup
              ? m.auth_two_factor_description_backup()
              : m.auth_two_factor_description_totp()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {!useBackup ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                totpForm.handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <totpForm.Field name="code">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="totp-code">{m.auth_two_factor_code_label()}</Label>
                    <Input
                      id="totp-code"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={m.auth_two_factor_code_placeholder()}
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                )}
              </totpForm.Field>

              <totpForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.common_verifying() : m.auth_two_factor_verify()}
                  </Button>
                )}
              </totpForm.Subscribe>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                backupForm.handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <backupForm.Field name="code">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="backup-code">{m.auth_two_factor_backup_label()}</Label>
                    <Input
                      id="backup-code"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={m.auth_two_factor_backup_placeholder()}
                      autoFocus
                    />
                  </div>
                )}
              </backupForm.Field>

              <backupForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.common_verifying() : m.auth_two_factor_verify_backup()}
                  </Button>
                )}
              </backupForm.Subscribe>
            </form>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setUseBackup(!useBackup);
              setError(null);
            }}
          >
            {useBackup
              ? m.auth_two_factor_use_authenticator()
              : m.auth_two_factor_use_backup()}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary underline">
              {m.common_cancel()}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
