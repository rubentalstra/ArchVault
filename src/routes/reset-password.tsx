import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
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

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: otpError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: value.email,
          type: "forget-password",
        });

      if (otpError) {
        setError(otpError.message ?? m.auth_reset_code_failed());
        return;
      }

      setEmail(value.email);
      setPhase("reset");
      toast.success(m.auth_reset_code_sent());
    },
  });

  const resetForm = useForm({
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      setError(null);

      if (value.newPassword !== value.confirmPassword) {
        setError(m.auth_passwords_dont_match());
        return;
      }

      if (value.newPassword.length < 8) {
        setError(m.auth_password_min_length());
        return;
      }

      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email,
        otp: value.otp,
        password: value.newPassword,
      });

      if (resetError) {
        setError(resetError.message ?? m.auth_reset_failed());
        return;
      }

      toast.success(m.auth_reset_success());
      navigate({ to: "/login" });
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{m.auth_reset_password_title()}</CardTitle>
          <CardDescription>
            {phase === "request"
              ? m.auth_reset_password_description_request()
              : m.auth_reset_password_description_reset({ email })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {phase === "request" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                requestForm.handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <requestForm.Field name="email">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reset-email">{m.common_label_email()}</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={m.common_placeholder_email()}
                      autoFocus
                    />
                  </div>
                )}
              </requestForm.Field>

              <requestForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.auth_sending() : m.auth_send_reset_code()}
                  </Button>
                )}
              </requestForm.Subscribe>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetForm.handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <resetForm.Field name="otp">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reset-otp">{m.auth_reset_code_label()}</Label>
                    <Input
                      id="reset-otp"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={m.auth_reset_code_placeholder()}
                      autoFocus
                    />
                  </div>
                )}
              </resetForm.Field>

              <resetForm.Field name="newPassword">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-password">{m.auth_label_new_password()}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={m.auth_placeholder_password_min()}
                    />
                  </div>
                )}
              </resetForm.Field>

              <resetForm.Field name="confirmPassword">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm-new-password">
                      {m.auth_label_confirm_new_password()}
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </resetForm.Field>

              <resetForm.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.auth_resetting() : m.auth_reset_password_title()}
                  </Button>
                )}
              </resetForm.Subscribe>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary underline">
              {m.common_back_to_sign_in()}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
