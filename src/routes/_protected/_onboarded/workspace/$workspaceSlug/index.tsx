import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/",
)({
  component: WorkspaceDashboardPage,
});

function WorkspaceDashboardPage() {
  const { workspace } = Route.useRouteContext();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3">
        {workspace.iconEmoji && (
          <span className="text-2xl">{workspace.iconEmoji}</span>
        )}
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
        </div>
        <Badge
          variant={workspace.status === "active" ? "default" : "secondary"}
          className="ml-auto"
        >
          {workspace.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.workspace_architecture_models()}</CardTitle>
          <CardDescription>
            {m.workspace_architecture_models_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {m.workspace_architecture_models_placeholder()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
