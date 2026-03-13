import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Users, Trash2 } from "lucide-react";
import { CreateTeamDialog } from "#/components/org/create-team-dialog";
import { TeamMembersDialog } from "#/components/org/team-members-dialog";
import { RemoveTeamDialog } from "#/components/org/remove-team-dialog";
import type { OrgMember } from "#/components/org/member-table-columns";

interface Team {
  id: string;
  name: string;
  createdAt: string;
  members?: { userId: string }[];
}

export const Route = createFileRoute("/_protected/_onboarded/org/teams")({
  component: TeamsPage,
});

function TeamsPage() {
  const { activeOrg } = Route.useRouteContext();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [membersTeam, setMembersTeam] = useState<Team | null>(null);
  const [removeTeam, setRemoveTeam] = useState<Team | null>(null);

  const teams = (activeOrg?.teams ?? []) as Team[];
  const orgMembers = (activeOrg?.members ?? []) as OrgMember[];
  const refresh = () => router.invalidate();

  if (!activeOrg) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Team</Button>
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription>
                  {team.members?.length ?? 0}{" "}
                  {(team.members?.length ?? 0) === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMembersTeam(team)}
                >
                  <Users className="size-4" />
                  Members
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveTeam(team)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No teams yet. Create one to organize your members.
          </CardContent>
        </Card>
      )}

      <CreateTeamDialog
        organizationId={activeOrg.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refresh}
      />
      <TeamMembersDialog
        team={membersTeam}
        orgMembers={orgMembers}
        open={membersTeam !== null}
        onOpenChange={(open) => {
          if (!open) setMembersTeam(null);
        }}
        onSuccess={refresh}
      />
      <RemoveTeamDialog
        team={removeTeam}
        organizationId={activeOrg.id}
        open={removeTeam !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTeam(null);
        }}
        onSuccess={refresh}
      />
    </div>
  );
}
