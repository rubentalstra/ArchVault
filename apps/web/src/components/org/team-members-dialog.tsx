import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Label } from "#/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { toast } from "sonner";
import { UserX } from "lucide-react";
import type { OrgMember } from "./member-table-columns";
import { m } from "#/paraglide/messages";

interface TeamMembersDialogProps {
  team: { id: string; name: string; members?: { userId: string }[] } | null;
  orgMembers: OrgMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TeamMembersDialog({
  team,
  orgMembers,
  open,
  onOpenChange,
  onSuccess,
}: TeamMembersDialogProps) {
  const [addUserId, setAddUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!team) return null;

  const teamMemberIds = new Set(
    team.members?.map((m) => m.userId) ?? [],
  );
  const currentTeamMembers = orgMembers.filter((m) =>
    teamMemberIds.has(m.userId),
  );
  const availableMembers = orgMembers.filter(
    (m) => !teamMemberIds.has(m.userId),
  );

  const handleAdd = async () => {
    if (!addUserId) return;
    setLoading(true);

    const { error } = await authClient.organization.addTeamMember({
      teamId: team.id,
      userId: addUserId,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? m.org_team_add_failed());
      return;
    }

    toast.success(m.org_team_add_success());
    setAddUserId(null);
    onSuccess();
  };

  const handleRemove = async (userId: string) => {
    setLoading(true);

    const { error } = await authClient.organization.removeTeamMember({
      teamId: team.id,
      userId,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? m.org_team_remove_failed());
      return;
    }

    toast.success(m.org_team_remove_success());
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.org_team_members_title({ name: team.name })}</DialogTitle>
          <DialogDescription>
            {m.org_team_members_description()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {currentTeamMembers.length > 0 ? (
            <div className="flex flex-col gap-2">
              {currentTeamMembers.map((member) => {
                const initials = (member.user.name ?? member.user.email)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        {member.user.image && (
                          <AvatarImage
                            src={member.user.image}
                            alt={member.user.name}
                          />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {member.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(member.userId)}
                      disabled={loading}
                    >
                      <UserX className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {m.org_team_members_empty()}
            </p>
          )}

          {availableMembers.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>{m.org_team_add_member_label()}</Label>
                <Select
                  value={addUserId ?? ""}
                  onValueChange={(val: string | null) => setAddUserId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={m.org_team_add_member_placeholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.user.name} ({member.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={!addUserId || loading}>
                {m.common_add()}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
