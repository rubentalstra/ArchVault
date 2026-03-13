import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/_onboarded/org/")({
  beforeLoad: () => {
    throw redirect({ to: "/org/members" });
  },
});
