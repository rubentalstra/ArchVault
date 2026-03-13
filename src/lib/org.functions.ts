import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";

export const getUserOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const orgs = await auth.api.listOrganizations({ headers });
    return orgs;
  },
);

export const getActiveOrganization = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const org = await auth.api.getFullOrganization({ headers });
    return org;
  },
);
