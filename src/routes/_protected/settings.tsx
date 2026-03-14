import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const is2FAEnabled = user.twoFactorEnabled ?? false;

  const enableForm = useForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const { data, error: enableError } =
        await authClient.twoFactor.enable({
          password: value.password,
        });

      if (enableError) {
        setError(enableError.message ?? m.settings_two_factor_enable_failed());
        return;
      }

      if (data) {
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes);
      }
    },
  });

  const verifyForm = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: value.code,
      });

      if (verifyError) {
        setError(verifyError.message ?? m.settings_two_factor_invalid_code());
        return;
      }

      toast.success(m.settings_two_factor_enable_success());
      setTotpUri(null);
      setBackupCodes(null);
      window.location.reload();
    },
  });

  const handleDisable = async () => {
    const password = prompt("Enter your password to disable 2FA");
    if (!password) return;

    const { error: disableError } = await authClient.twoFactor.disable({
      password,
    });

    if (disableError) {
      toast.error(disableError.message ?? m.settings_two_factor_disable_failed());
      return;
    }

    toast.success(m.settings_two_factor_disable_success());
    window.location.reload();
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">{m.settings_title()}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{m.settings_two_factor_title()}</CardTitle>
          <CardDescription>
            {is2FAEnabled
              ? m.settings_two_factor_enabled()
              : m.settings_two_factor_disabled()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {is2FAEnabled && !totpUri && (
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive" />}
              >
                {m.settings_two_factor_disable()}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{m.settings_two_factor_disable_title()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {m.settings_two_factor_disable_description()}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisable}>
                    {m.settings_two_factor_disable_confirm()}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!is2FAEnabled && !totpUri && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enableForm.handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <enableForm.Field name="password">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="2fa-password">
                      {m.settings_two_factor_enable_password()}
                    </Label>
                    <Input
                      id="2fa-password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </enableForm.Field>

              <enableForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.settings_two_factor_setting_up() : m.settings_two_factor_enable()}
                  </Button>
                )}
              </enableForm.Subscribe>
            </form>
          )}

          {totpUri && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {m.settings_two_factor_qr_description()}
                </p>
                <div className="rounded-lg border p-4 bg-white">
                  <QRCodeSVG value={totpUri} size={200} />
                </div>
              </div>

              {backupCodes && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {m.settings_two_factor_backup_codes()}
                  </p>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border p-3 bg-muted font-mono text-sm">
                    {backupCodes.map((code) => (
                      <span key={code}>{code}</span>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyForm.handleSubmit();
                }}
                className="flex flex-col gap-3"
              >
                <verifyForm.Field name="code">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="verify-totp">
                        {m.settings_two_factor_verify_label()}
                      </Label>
                      <Input
                        id="verify-totp"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  )}
                </verifyForm.Field>

                <verifyForm.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? m.common_verifying() : m.settings_two_factor_verify_submit()}
                    </Button>
                  )}
                </verifyForm.Subscribe>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
