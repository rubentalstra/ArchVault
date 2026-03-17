import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { CreateOrgDialog } from "./create-org-dialog";
import { Button } from "#/components/ui/button";
import { Plus } from "lucide-react";
import { m } from "#/paraglide/messages";

export function OrgSwitcher() {
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: orgs } = authClient.useListOrganizations();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSwitch = async (orgId: string | null) => {
    if (!orgId || orgId === "__create__") {
      if (orgId === "__create__") setCreateOpen(true);
      return;
    }
    await authClient.organization.setActive({ organizationId: orgId });
    router.invalidate();
  };

  return (
    <>
      <Select value={activeOrg?.id ?? ""} onValueChange={handleSwitch}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={m.org_switcher_placeholder()} />
        </SelectTrigger>
        <SelectContent>
          {orgs?.map((org) => {
            const initial = org.name.charAt(0).toUpperCase();
            return (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Avatar size="xs">
                    {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 w-full justify-start gap-2 text-muted-foreground"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="size-4" />
        {m.org_create_title()}
      </Button>
      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => router.invalidate()}
      />
    </>
  );
}
