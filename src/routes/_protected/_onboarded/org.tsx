import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Users, Settings, Layers, ArrowLeft, FolderOpen } from "lucide-react";
import { cn } from "#/lib/utils";
import { OrgSwitcher } from "#/components/org/org-switcher";
import { getActiveOrganization } from "#/lib/org.functions";

export const Route = createFileRoute("/_protected/_onboarded/org")({
  beforeLoad: async () => {
    const activeOrg = await getActiveOrganization();
    return { activeOrg };
  },
  component: OrgLayout,
});

function OrgLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30 p-4">
        <Link
          to="/dashboard"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="mb-4">
          <OrgSwitcher />
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            <FolderOpen className="size-4" />
            Workspaces
          </Link>
          <Link
            to="/org/members"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            <Users className="size-4" />
            Members
          </Link>
          <Link
            to="/org/teams"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            <Layers className="size-4" />
            Teams
          </Link>
          <Link
            to="/org/settings"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            )}
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
