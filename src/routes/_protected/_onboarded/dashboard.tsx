import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { toast } from "sonner";
import { WorkspaceList } from "#/components/workspace/workspace-list";

export const Route = createFileRoute("/_protected/_onboarded/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out");
          navigate({ to: "/login" });
        },
      },
    });
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {user.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {activeOrg && (
            <p className="text-sm">
              Active organization: <strong>{activeOrg.name}</strong>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/org/members">Manage Organization</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/settings" })}
            >
              Settings
            </Button>
            {user.role === "admin" && (
              <Button variant="outline" asChild>
                <Link to="/admin/users">Admin</Link>
              </Button>
            )}
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
      {activeOrg && <WorkspaceList />}
    </main>
  );
}
