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
import {
  Shield,
  MoreHorizontal,
  Eye,
  UserCog,
  Ban,
  UserX,
  LogOut,
  UserCheck,
} from "lucide-react";
import { formatRelativeDate } from "#/lib/admin.utils";
import { m } from "#/paraglide/messages";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface UserTableActions {
  onViewDetails: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onBan: (user: AdminUser) => void;
  onUnban: (user: AdminUser) => void;
  onImpersonate: (user: AdminUser) => void;
  onRevokeSessions: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
  currentUserId: string;
}

const columnHelper = createColumnHelper<AdminUser>();

export function getUserColumns(actions: UserTableActions) {
  return [
    columnHelper.accessor("name", {
      header: m.admin_column_user(),
      enableSorting: true,
      cell: (info) => {
        const user = info.row.original;
        const initials = (user.name ?? user.email)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: m.admin_column_role(),
      enableSorting: true,
      cell: (info) => {
        const role = info.getValue();
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("banned", {
      header: m.admin_column_status(),
      enableSorting: true,
      cell: (info) => {
        const banned = info.getValue();
        return (
          <Badge variant={banned ? "destructive" : "secondary"}>
            {banned ? m.common_status_banned() : m.common_status_active()}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("twoFactorEnabled", {
      header: m.admin_column_2fa(),
      enableSorting: false,
      cell: (info) => {
        const enabled = info.getValue();
        return (
          <Tooltip>
            <TooltipTrigger>
              <Shield
                className={`size-4 ${enabled ? "text-green-600" : "text-muted-foreground/40"}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              {enabled ? m.admin_2fa_enabled() : m.admin_2fa_not_enabled()}
            </TooltipContent>
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: m.admin_column_created(),
      enableSorting: true,
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
        const user = info.row.original;
        const isSelf = user.id === actions.currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onViewDetails(user)}>
                <Eye className="size-4" />
                {m.admin_view_details()}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onChangeRole(user)}
                disabled={isSelf}
              >
                <UserCog className="size-4" />
                {m.admin_change_role()}
              </DropdownMenuItem>
              {user.banned ? (
                <DropdownMenuItem
                  onClick={() => actions.onUnban(user)}
                  disabled={isSelf}
                >
                  <UserCheck className="size-4" />
                  {m.admin_unban_user()}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => actions.onBan(user)}
                  disabled={isSelf}
                >
                  <Ban className="size-4" />
                  {m.admin_ban_user_title()}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => actions.onImpersonate(user)}
                disabled={isSelf}
              >
                <UserCog className="size-4" />
                {m.admin_impersonate()}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onRevokeSessions(user)}
                disabled={isSelf}
              >
                <LogOut className="size-4" />
                {m.admin_revoke_sessions_title()}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onRemove(user)}
                disabled={isSelf}
              >
                <UserX className="size-4" />
                {m.admin_remove_user_title()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];
}
