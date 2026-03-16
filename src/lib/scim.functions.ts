import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./database";
import { organization, scimProvider, user } from "./schema/auth-schema";

async function ensureAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Forbidden");
  return session;
}

export const listAllScimConnections = createServerFn({
  method: "GET",
}).handler(async () => {
  await ensureAdmin();

  const connections = await db
    .select({
      id: scimProvider.id,
      providerId: scimProvider.providerId,
      organizationId: scimProvider.organizationId,
      organizationName: organization.name,
      userId: scimProvider.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(scimProvider)
    .leftJoin(organization, eq(scimProvider.organizationId, organization.id))
    .leftJoin(user, eq(scimProvider.userId, user.id));

  return connections;
});
