import { useState } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { getUserOrganizations } from "#/lib/org.functions";
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
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/onboarding")({
  beforeLoad: async () => {
    const organizations = await getUserOrganizations();
    if (organizations && organizations.length > 0) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: OnboardingPage,
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const slug = value.slug || slugify(value.name);

      const { data, error: createError } =
        await authClient.organization.create({
          name: value.name,
          slug,
        });

      if (createError) {
        setError(createError.message ?? m.onboarding_create_failed());
        return;
      }

      if (data) {
        await authClient.organization.setActive({
          organizationId: data.id,
        });
      }

      toast.success(m.onboarding_create_success());
      navigate({ to: "/dashboard" });
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {m.onboarding_title()}
          </CardTitle>
          <CardDescription>
            {m.onboarding_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive text-center">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="org-name">{m.onboarding_label_name()}</Label>
                  <Input
                    id="org-name"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      const slugField = form.getFieldValue("slug");
                      if (!slugField || slugField === slugify(field.state.value)) {
                        form.setFieldValue("slug", slugify(e.target.value));
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder={m.onboarding_placeholder_name()}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="org-slug">{m.common_label_slug()}</Label>
                  <Input
                    id="org-slug"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder={m.onboarding_placeholder_slug()}
                  />
                  <p className="text-xs text-muted-foreground">
                    {m.onboarding_slug_hint()}
                  </p>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className="mt-2">
                  {isSubmitting ? m.common_creating() : m.onboarding_submit()}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
