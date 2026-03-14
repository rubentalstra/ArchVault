import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/",
)({
  component: WorkspaceDashboardPage,
});

function WorkspaceDashboardPage() {
  const { workspace } = Route.useRouteContext();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {m.workspace_nav_dashboard()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-3xl">
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
              variant={
                workspace.status === "active" ? "default" : "secondary"
              }
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
      </div>
    </>
  );
}
