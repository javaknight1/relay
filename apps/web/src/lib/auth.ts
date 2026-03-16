import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "./supabase";
import type { UserRow } from "@relay/shared";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Require an authenticated user for API routes.
 * Resolves the Clerk session and fetches the matching Supabase user row.
 *
 * @throws {UnauthorizedError} if not authenticated or user not found in DB
 */
export async function requireUser(): Promise<UserRow> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new UnauthorizedError();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) throw new UnauthorizedError();

  return data as UserRow;
}
