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
import type { AdminUser } from "./user-table-columns";
import { m } from "#/paraglide/messages";

interface RoleChangeDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RoleChangeDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RoleChangeDialogProps) {
  const [role, setRole] = useState<"user" | "admin">((user?.role as "user" | "admin") ?? "user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || role === user.role) return;
    setLoading(true);
    setError(null);

    const { error: roleError } = await authClient.admin.setRole({
      userId: user.id,
      role,
    });

    setLoading(false);

    if (roleError) {
      setError(roleError.message ?? m.admin_change_role_failed());
      return;
    }

    toast.success(m.admin_change_role_success({ name: user.name, role }));
    onOpenChange(false);
    onSuccess();
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (val) setRole((user.role as "user" | "admin") ?? "user");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.admin_change_role()}</DialogTitle>
          <DialogDescription>
            {m.admin_change_role_description({ name: user.name, email: user.email })}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <Label>{m.org_label_new_role()}</Label>
          <Select value={role} onValueChange={(val: string | null) => {
            if (val) setRole(val as "user" | "admin");
          }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{m.common_role_user()}</SelectItem>
              <SelectItem value="admin">{m.common_role_admin()}</SelectItem>
            </SelectContent>
          </Select>
          {role === user.role && (
            <p className="text-xs text-muted-foreground">
              {m.admin_role_already_current()}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || role === user.role}
          >
            {loading ? m.common_updating() : m.org_update_role()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
