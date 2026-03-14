import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Separator } from "#/components/ui/separator";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/org/account/",
)({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: updateError } = await authClient.updateUser({
        name: value.name,
        image: value.image || undefined,
      });
      if (updateError) {
        setError(
          updateError.message ?? m.settings_profile_update_failed(),
        );
        return;
      }
      toast.success(m.settings_profile_update_success());
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {m.settings_profile_title()}
        </h3>
        <p className="text-sm text-muted-foreground">
          {m.settings_profile_description()}
        </p>
      </div>
      <Separator />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <Label>{m.common_label_email()}</Label>
          <Input value={user.email} disabled />
        </div>

        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="profile-name">
                {m.common_label_name()}
              </Label>
              <Input
                id="profile-name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="image">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="profile-image">
                {m.settings_label_avatar()}
              </Label>
              <Input
                id="profile-image"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={m.settings_placeholder_avatar()}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? m.common_saving() : m.common_save_changes()}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
