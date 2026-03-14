import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {
  Users,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { NavUser } from "#/components/org/nav-user";
import { adminUsersDefaultSearch } from "./admin/users";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "#/components/ui/sidebar";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/admin")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/org" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={m.admin_nav_back()}
                render={<Link to="/org" />}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {m.org_nav_admin()}
                  </span>
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <ArrowLeft className="size-3" />
                    {m.admin_nav_back()}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{m.org_nav_admin()}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={m.admin_nav_users()}
                    render={
                      <Link
                        to="/admin/users"
                        search={adminUsersDefaultSearch}
                      />
                    }
                  >
                    <Users />
                    <span>{m.admin_nav_users()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={m.admin_nav_sso()}
                    render={<Link to="/admin/sso" />}
                  >
                    <KeyRound />
                    <span>{m.admin_nav_sso()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={m.admin_nav_scim()}
                    render={<Link to="/admin/scim" />}
                  >
                    <RefreshCw />
                    <span>{m.admin_nav_scim()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
