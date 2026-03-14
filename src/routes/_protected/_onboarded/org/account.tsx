import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/_onboarded/org/account")({
  component: AccountLayout,
});

const NAV_ITEMS = [
  { to: "/org/account", label: () => m.settings_nav_profile(), exact: true },
  {
    to: "/org/account/security",
    label: () => m.settings_nav_security(),
  },
] as const;

function AccountLayout() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink render={<Link to="/org" />}>
                  {m.org_nav_dashboard()}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{m.settings_page_title()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {m.settings_page_title()}
            </h2>
            <p className="text-muted-foreground">
              {m.settings_page_description()}
            </p>
          </div>
          <Separator />

          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={
                      item.exact ? { exact: true } : undefined
                    }
                    className={cn(
                      "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    activeProps={{
                      className: "bg-muted text-foreground",
                    }}
                  >
                    {item.label()}
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="flex-1 lg:max-w-2xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
