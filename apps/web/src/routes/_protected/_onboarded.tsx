import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUserOrganizations } from "#/lib/org.functions";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_protected/_onboarded")({
  beforeLoad: async ({ context }) => {
    const organizations = await getUserOrganizations();

    if (!organizations || organizations.length === 0) {
      throw redirect({ to: "/onboarding" });
    }

    if (!context.session.activeOrganizationId) {
      await authClient.organization.setActive({
        organizationId: organizations[0].id,
      });
    }

    return { organizations };
  },
  component: OnboardedLayout,
});

function OnboardedLayout() {
  return <Outlet />;
}
