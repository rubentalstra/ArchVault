import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { getWorkspaces } from "#/lib/workspace.functions";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function WorkspaceList() {
  const [createOpen, setCreateOpen] = useState(false);
  const getWorkspacesFn = useServerFn(getWorkspaces);

  const { data: workspaces, refetch } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspacesFn(),
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>
              Workspaces contain your architecture models and diagrams.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 size-4" />
            New Workspace
          </Button>
        </CardHeader>
        <CardContent>
          {!workspaces || workspaces.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FolderOpen className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No workspaces yet. Create one to get started.
              </p>
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 size-4" />
                Create Workspace
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {workspaces.map((ws) => (
                <li key={ws.id}>
                  <Link
                    to="/workspace/$workspaceSlug"
                    params={{ workspaceSlug: ws.slug }}
                    className="flex items-center gap-3 rounded-md border px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <span className="text-lg">
                      {ws.iconEmoji || (
                        <FolderOpen className="size-5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{ws.name}</span>
                      {ws.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {ws.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch()}
      />
    </>
  );
}
