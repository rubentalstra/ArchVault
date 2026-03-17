import { createColumnHelper } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { MoreHorizontal, UserCog, UserX } from "lucide-react";
import { formatRelativeDate } from "#/lib/admin.utils";
import { m } from "#/paraglide/messages";

export interface OrgMember {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export interface MemberTableActions {
  onChangeRole: (member: OrgMember) => void;
  onRemove: (member: OrgMember) => void;
  currentUserId: string;
}

const columnHelper = createColumnHelper<OrgMember>();

export function getMemberColumns(actions: MemberTableActions) {
  return [
    columnHelper.display({
      id: "user",
      header: m.org_column_user(),
      cell: (info) => {
        const member = info.row.original;
        const initials = (member.user.name ?? member.user.email)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {member.user.image && (
                <AvatarImage src={member.user.image} alt={member.user.name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{member.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {member.user.email}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: m.org_column_role(),
      cell: (info) => {
        const role = info.getValue();
        return (
          <Badge
            variant={
              role === "owner"
                ? "default"
                : role === "admin"
                  ? "secondary"
                  : "outline"
            }
          >
            {role}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: m.org_column_joined(),
      cell: (info) => {
        const date = info.getValue();
        return (
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-muted-foreground">
                {formatRelativeDate(date)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{new Date(date).toLocaleString()}</TooltipContent>
          </Tooltip>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const member = info.row.original;
        const isSelf = member.userId === actions.currentUserId;
        const isOwner = member.role === "owner";

        if (isOwner || isSelf) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onChangeRole(member)}>
                <UserCog className="size-4" />
                {m.org_change_role_title()}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onRemove(member)}
              >
                <UserX className="size-4" />
                {m.org_remove_member_submit()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];
}
