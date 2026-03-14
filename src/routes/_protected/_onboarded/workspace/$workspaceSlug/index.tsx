import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

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
          <CardTitle>Architecture Models</CardTitle>
          <CardDescription>
            Elements and diagrams will appear here in future phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This workspace is ready. C4 elements and diagrams will be available
            once those features are implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
