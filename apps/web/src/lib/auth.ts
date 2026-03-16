import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "./supabase";
import type { UserRow, Database } from "@relay/shared";

type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Require an authenticated user for API routes.
 * Resolves the Clerk session and fetches the matching Supabase user row.
 * If the user exists in Clerk but not in Supabase (e.g. webhook was lost),
 * auto-creates the row.
 *
 * @throws {UnauthorizedError} if not authenticated
 */
export async function requireUser(): Promise<UserRow> {
  const { userId: clerkId } = await auth();
  console.log("[requireUser] clerk_id:", clerkId ?? "NO_SESSION");
  if (!clerkId) throw new UnauthorizedError();

  const supabase = createServiceClient();
  const { data, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  console.log("[requireUser] select result:", { found: !!data, error: selectError?.code ?? null });

  if (data) return data as UserRow;

  // User exists in Clerk but not in Supabase — auto-create
  console.log("[requireUser] user not found, attempting auto-create for", clerkId);
  const clerkUser = await currentUser();
  console.log("[requireUser] currentUser:", clerkUser ? { id: clerkUser.id, emails: clerkUser.emailAddresses.length } : "NULL");
  if (!clerkUser) throw new UnauthorizedError();

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  console.log("[requireUser] resolved email:", email ?? "NONE");
  if (!email) throw new UnauthorizedError();

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const row: UserInsert = { clerk_id: clerkId, email, name };
  console.log("[requireUser] inserting row:", { clerk_id: clerkId, email, name });
  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert(row as never)
    .select("*")
    .single();

  console.log("[requireUser] insert result:", { inserted: !!inserted, error: insertError?.code ?? null, message: insertError?.message ?? null });

  if (insertError || !inserted) {
    console.error("requireUser: failed to auto-create user", clerkId, insertError);
    throw new UnauthorizedError();
  }

  return inserted as UserRow;
}
