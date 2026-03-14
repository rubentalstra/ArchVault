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
import { z } from "zod/v4";

const searchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => searchSchema.parse(search),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);

  const form = useForm({
    defaultValues: { otp: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      if (!email) {
        setError(m.auth_verify_email_required());
        return;
      }

      const { error: verifyError } =
        await authClient.emailOtp.verifyEmail({
          email,
          otp: value.otp,
        });

      if (verifyError) {
        setError(verifyError.message ?? m.auth_verify_email_failed());
        return;
      }

      toast.success(m.auth_verify_email_success());
      navigate({ to: "/login" });
    },
  });

  const handleResend = async () => {
    if (!email || resendCooldown) return;
    setResendCooldown(true);

    const { error: resendError } =
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

    if (resendError) {
      toast.error(resendError.message ?? m.auth_verify_email_resend_failed());
    } else {
      toast.success(m.auth_verify_email_resend_success());
    }

    setTimeout(() => setResendCooldown(false), 30000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {m.auth_verify_email_title()}
          </CardTitle>
          <CardDescription>
            {email
              ? m.auth_verify_email_description({ email })
              : m.auth_verify_email_description_generic()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <form.Field name="otp">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="otp">{m.auth_verify_email_label()}</Label>
                  <Input
                    id="otp"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={m.auth_reset_code_placeholder()}
                    autoFocus
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.common_verifying() : m.auth_verify_email_submit()}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <Button
            variant="ghost"
            disabled={resendCooldown || !email}
            onClick={handleResend}
          >
            {resendCooldown ? m.auth_verify_email_resend_cooldown() : m.auth_verify_email_resend()}
          </Button>

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
