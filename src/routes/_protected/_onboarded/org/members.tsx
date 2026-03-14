import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Badge } from "#/components/ui/badge";
import { toast } from "sonner";
import { formatRelativeDate } from "#/lib/admin.utils";
import {
  getMemberColumns,
  type OrgMember,
} from "#/components/org/member-table-columns";
import { InviteMemberDialog } from "#/components/org/invite-member-dialog";
import { MemberRoleDialog } from "#/components/org/member-role-dialog";
import { RemoveMemberDialog } from "#/components/org/remove-member-dialog";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/_onboarded/org/members")({
  component: MembersPage,
});

function MembersPage() {
  const { activeOrg, user } = Route.useRouteContext();
  const router = useRouter();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDialogMember, setRoleDialogMember] = useState<OrgMember | null>(
    null,
  );
  const [removeMember, setRemoveMember] = useState<OrgMember | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

  const members = (activeOrg?.members ?? []) as OrgMember[];
  const invitations = activeOrg?.invitations ?? [];

  const refresh = () => router.invalidate();

  const columns = getMemberColumns({
    currentUserId: user.id,
    onChangeRole: (member) => setRoleDialogMember(member),
    onRemove: (member) => setRemoveMember(member),
  });

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingInvite(invitationId);
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    setCancellingInvite(null);

    if (error) {
      toast.error(error.message ?? m.org_invitation_cancel_failed());
      return;
    }

    toast.success(m.org_invitation_cancelled());
    refresh();
  };

  if (!activeOrg) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{m.org_members_title()}</h1>
        <Button onClick={() => setInviteOpen(true)}>{m.org_invite_title()}</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{m.org_members_org_title()}</CardTitle>
          <CardDescription>
            {m.org_members_count({ count: members.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground"
                  >
                    {m.org_members_empty()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{m.org_invitations_title()}</CardTitle>
            <CardDescription>
              {m.org_invitations_count({ count: invitations.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{m.common_label_email()}</TableHead>
                  <TableHead>{m.common_label_role()}</TableHead>
                  <TableHead>{m.org_label_sent()}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeDate(inv.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(inv.id)}
                        disabled={cancellingInvite === inv.id}
                      >
                        {cancellingInvite === inv.id
                          ? m.org_invitation_cancelling()
                          : m.common_cancel()}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InviteMemberDialog
        organizationId={activeOrg.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={refresh}
      />
      <MemberRoleDialog
        member={roleDialogMember}
        open={roleDialogMember !== null}
        onOpenChange={(open) => {
          if (!open) setRoleDialogMember(null);
        }}
        onSuccess={refresh}
      />
      <RemoveMemberDialog
        member={removeMember}
        open={removeMember !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveMember(null);
        }}
        onSuccess={refresh}
      />
    </div>
  );
}
