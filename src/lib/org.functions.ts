import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { db } from "./database";
import { organization } from "./schema/auth-schema";

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

export const getAllOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin") throw new Error("Forbidden");

    const orgs = await db
      .select({ id: organization.id, name: organization.name, slug: organization.slug })
      .from(organization);
    return orgs;
  },
);
