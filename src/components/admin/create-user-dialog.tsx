import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
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
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { m } from "#/paraglide/messages";

const createUserSchema = z.object({
  name: z.string().min(2, m.validation_name_min_length()),
  email: z.email(m.validation_email_invalid()),
  password: z.string().min(8, m.validation_password_min_length()),
  role: z.enum(["user", "admin"]),
});

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", role: "user" as "user" | "admin" },
    onSubmit: async ({ value }) => {
      setError(null);
      const parsed = createUserSchema.safeParse(value);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      const { error: createError } = await authClient.admin.createUser({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
      });

      if (createError) {
        setError(createError.message ?? m.admin_create_user_failed());
        return;
      }

      toast.success(m.admin_create_user_success());
      onOpenChange(false);
      onSuccess();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.admin_create_user_title()}</DialogTitle>
          <DialogDescription>
            {m.admin_create_user_description()}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}

          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-name">{m.common_label_name()}</Label>
                <Input
                  id="create-name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_placeholder_name()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-email">{m.common_label_email()}</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.admin_placeholder_email()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-password">{m.common_label_password()}</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={m.admin_placeholder_password()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.common_label_role()}</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val: string | null) => {
                    if (val) field.handleChange(val as "user" | "admin");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{m.common_role_user()}</SelectItem>
                    <SelectItem value="admin">{m.common_role_admin()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.common_creating() : m.admin_create_user_title()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
