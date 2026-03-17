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
import { m } from "#/paraglide/messages";

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
      setError(roleError.message ?? m.org_change_role_failed());
      return;
    }

    toast.success(m.org_change_role_success({ role }));
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
          <DialogTitle>{m.org_change_role_title()}</DialogTitle>
          <DialogDescription>
            {m.org_change_role_description({ name: member.user.name, email: member.user.email })}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <Label>{m.org_label_new_role()}</Label>
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
              <SelectItem value="admin">{m.common_role_admin()}</SelectItem>
              <SelectItem value="editor">{m.common_role_editor()}</SelectItem>
              <SelectItem value="viewer">{m.common_role_viewer()}</SelectItem>
            </SelectContent>
          </Select>
          {role === member.role && (
            <p className="text-xs text-muted-foreground">
              {m.org_role_already_current()}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || role === member.role}
          >
            {loading ? m.common_updating() : m.org_update_role()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
