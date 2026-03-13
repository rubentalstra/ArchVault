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
      setError(roleError.message ?? "Failed to change role");
      return;
    }

    toast.success(`${user.name}'s role changed to ${role}`);
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
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Change the platform role for {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <Label>New Role</Label>
          <Select value={role} onValueChange={(val: string | null) => {
            if (val) setRole(val as "user" | "admin");
          }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {role === user.role && (
            <p className="text-xs text-muted-foreground">
              This is already the current role.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || role === user.role}
          >
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
