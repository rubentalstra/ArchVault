import { createFileRoute, redirect } from "@tanstack/react-router";
import { adminUsersDefaultSearch } from "./users";

export const Route = createFileRoute("/_protected/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/users", search: adminUsersDefaultSearch });
  },
});
