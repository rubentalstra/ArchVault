import { useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Badge } from "#/components/ui/badge";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/org/account/security",
)({
  component: SecurityPage,
});

function SecurityPage() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();

  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const is2FAEnabled = user.twoFactorEnabled ?? false;

  return (
    <div className="space-y-6">
      <ChangePasswordCard />

      <TwoFactorCard
        is2FAEnabled={is2FAEnabled}
        totpUri={totpUri}
        backupCodes={backupCodes}
        setTotpUri={setTotpUri}
        setBackupCodes={setBackupCodes}
        disableDialogOpen={disableDialogOpen}
        setDisableDialogOpen={setDisableDialogOpen}
        disableLoading={disableLoading}
        setDisableLoading={setDisableLoading}
        disablePassword={disablePassword}
        setDisablePassword={setDisablePassword}
        onSuccess={() => router.invalidate()}
      />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {m.settings_danger_zone()}
          </CardTitle>
          <CardDescription>
            {m.settings_delete_account_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            {m.settings_delete_account_button()}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {m.settings_delete_account_title()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {m.settings_delete_account_confirm()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={async () => {
                setDeleteLoading(true);
                const { error } = await authClient.deleteUser();
                setDeleteLoading(false);
                if (error) {
                  toast.error(
                    error.message ?? m.settings_delete_account_failed(),
                  );
                  return;
                }
                toast.success(m.settings_delete_account_success());
                setDeleteOpen(false);
                navigate({ to: "/login" });
              }}
            >
              {deleteLoading
                ? m.common_deleting()
                : m.settings_delete_account_button()}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChangePasswordCard() {
  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, m.validation_field_required()),
      newPassword: z
        .string()
        .min(8, m.validation_password_min_length()),
      confirmPassword: z.string().min(1, m.validation_field_required()),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: m.validation_passwords_dont_match(),
      path: ["confirmPassword"],
    });

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: changePasswordSchema,
      onBlur: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message ?? m.settings_change_password_failed());
        return;
      }
      toast.success(m.settings_change_password_success());
      form.reset();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.settings_change_password_title()}</CardTitle>
        <CardDescription>
          {m.settings_change_password_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="currentPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="current-password">
                    {m.settings_change_password_current()}
                  </FieldLabel>
                  <Input
                    id="current-password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="new-password">
                    {m.settings_change_password_new()}
                  </FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="confirm-password">
                    {m.settings_change_password_confirm()}
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="self-end"
              >
                {isSubmitting
                  ? m.settings_change_password_changing()
                  : m.settings_change_password_submit()}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}

function TwoFactorCard({
  is2FAEnabled,
  totpUri,
  backupCodes,
  setTotpUri,
  setBackupCodes,
  disableDialogOpen,
  setDisableDialogOpen,
  disableLoading,
  setDisableLoading,
  disablePassword,
  setDisablePassword,
  onSuccess,
}: {
  is2FAEnabled: boolean;
  totpUri: string | null;
  backupCodes: string[] | null;
  setTotpUri: (v: string | null) => void;
  setBackupCodes: (v: string[] | null) => void;
  disableDialogOpen: boolean;
  setDisableDialogOpen: (v: boolean) => void;
  disableLoading: boolean;
  setDisableLoading: (v: boolean) => void;
  disablePassword: string;
  setDisablePassword: (v: string) => void;
  onSuccess: () => void;
}) {
  const passwordSchema = z.object({
    password: z.string().min(1, m.validation_field_required()),
  });

  const codeSchema = z.object({
    code: z.string().length(6, m.validation_totp_length()),
  });

  const enableForm = useForm({
    defaultValues: { password: "" },
    validators: {
      onSubmit: passwordSchema,
      onBlur: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error: enableError } =
        await authClient.twoFactor.enable({ password: value.password });
      if (enableError) {
        toast.error(
          enableError.message ?? m.settings_two_factor_enable_failed(),
        );
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
    validators: {
      onSubmit: codeSchema,
      onBlur: codeSchema,
    },
    onSubmit: async ({ value }) => {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: value.code,
      });
      if (verifyError) {
        toast.error(
          verifyError.message ?? m.settings_two_factor_invalid_code(),
        );
        return;
      }
      toast.success(m.settings_two_factor_enable_success());
      setTotpUri(null);
      setBackupCodes(null);
      onSuccess();
    },
  });

  const handleDisable = async () => {
    setDisableLoading(true);
    const { error: disableError } = await authClient.twoFactor.disable({
      password: disablePassword,
    });
    setDisableLoading(false);
    if (disableError) {
      toast.error(
        disableError.message ?? m.settings_two_factor_disable_failed(),
      );
      return;
    }
    toast.success(m.settings_two_factor_disable_success());
    setDisableDialogOpen(false);
    setDisablePassword("");
    onSuccess();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {is2FAEnabled ? (
                <ShieldCheck className="size-5 text-emerald-500" />
              ) : (
                <ShieldOff className="size-5 text-muted-foreground" />
              )}
              <div>
                <CardTitle>{m.settings_two_factor_title()}</CardTitle>
                <CardDescription>
                  {is2FAEnabled
                    ? m.settings_two_factor_enabled()
                    : m.settings_two_factor_disabled()}
                </CardDescription>
              </div>
            </div>
            <Badge variant={is2FAEnabled ? "default" : "outline"}>
              {is2FAEnabled
                ? m.settings_two_factor_badge_enabled()
                : m.settings_two_factor_badge_disabled()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {is2FAEnabled && !totpUri && (
            <Button
              variant="destructive"
              onClick={() => setDisableDialogOpen(true)}
            >
              {m.settings_two_factor_disable()}
            </Button>
          )}

          {!is2FAEnabled && !totpUri && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void enableForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <enableForm.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="2fa-password">
                        {m.settings_two_factor_enable_password()}
                      </FieldLabel>
                      <Input
                        id="2fa-password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="max-w-sm"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </enableForm.Field>
              <enableForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? m.settings_two_factor_setting_up()
                      : m.settings_two_factor_enable()}
                  </Button>
                )}
              </enableForm.Subscribe>
            </form>
          )}

          {totpUri && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {m.settings_two_factor_qr_description()}
                </p>
                <div className="rounded-lg border bg-white p-4">
                  <QRCodeSVG value={totpUri} size={200} />
                </div>
              </div>

              {backupCodes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {m.settings_two_factor_backup_codes()}
                  </p>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted p-3 font-mono text-sm">
                    {backupCodes.map((code) => (
                      <span key={code}>{code}</span>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void verifyForm.handleSubmit();
                }}
                className="space-y-4"
              >
                <verifyForm.Field name="code">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="verify-totp">
                          {m.settings_two_factor_verify_label()}
                        </FieldLabel>
                        <Input
                          id="verify-totp"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value)
                          }
                          onBlur={field.handleBlur}
                          placeholder="000000"
                          maxLength={6}
                          className="max-w-50"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </verifyForm.Field>
                <verifyForm.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? m.common_verifying()
                        : m.settings_two_factor_verify_submit()}
                    </Button>
                  )}
                </verifyForm.Subscribe>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {m.settings_two_factor_disable_title()}
            </DialogTitle>
            <DialogDescription>
              {m.settings_two_factor_disable_description()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <FieldLabel htmlFor="disable-2fa-password">
              {m.settings_two_factor_disable_password_label()}
            </FieldLabel>
            <Input
              id="disable-2fa-password"
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisableDialogOpen(false);
                setDisablePassword("");
              }}
            >
              {m.common_cancel()}
            </Button>
            <Button
              variant="destructive"
              disabled={disableLoading || !disablePassword}
              onClick={handleDisable}
            >
              {disableLoading
                ? m.settings_two_factor_disabling()
                : m.settings_two_factor_disable_confirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
