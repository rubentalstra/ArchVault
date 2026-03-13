import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { toast } from "sonner";
import type { OrgMember } from "./member-table-columns";

interface MemberRoleDialogProps {
  member: OrgMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MemberRoleDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: MemberRoleDialogProps) {
  const [role, setRole] = useState(member?.role ?? "viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!member || role === member.role) return;
    setLoading(true);
    setError(null);

    const { error: roleError } =
      await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: role as "admin" | "editor" | "viewer",
      });

    setLoading(false);

    if (roleError) {
      setError(roleError.message ?? "Failed to change role");
      return;
    }

    toast.success(`Role changed to ${role}`);
    onOpenChange(false);
    onSuccess();
  };

  if (!member) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (val) setRole(member.role);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Change the role for {member.user.name} ({member.user.email}).
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <Label>New Role</Label>
          <Select
            value={role}
            onValueChange={(val: string | null) => {
              if (val) setRole(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          {role === member.role && (
            <p className="text-xs text-muted-foreground">
              This is already the current role.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || role === member.role}
          >
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
