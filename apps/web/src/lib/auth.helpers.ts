import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";

/** Get the active member (role + organizationId). Throws if not authenticated or not a member. */
export async function getActiveMember() {
  const headers = getRequestHeaders();
  const member = await auth.api.getActiveMember({ headers });
  if (!member) throw new Error("Not a member of this organization");
  return member;
}

/** Get session + active member. Use when you need session.user.id (e.g. createdBy). */
export async function getSessionAndMember() {
  const headers = getRequestHeaders();
  const [session, member] = await Promise.all([
    auth.api.getSession({ headers }),
    auth.api.getActiveMember({ headers }),
  ]);
  if (!session) throw new Error("Unauthorized");
  if (!member) throw new Error("Not a member of this organization");
  return { session, member };
}

/** Assert the member has one of the allowed roles. */
export function assertRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) throw new Error("Forbidden");
}
